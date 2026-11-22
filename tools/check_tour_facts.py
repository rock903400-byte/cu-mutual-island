"""
導覽內容核對：js/data/tour_content.js 的每一個數字、每一句簡章引述，
都要在本機 7 份協會簡章 PDF 裡找得到。

用法（在專案根目錄）：
    python tools/check_tour_facts.py            # 全部檢查
    python tools/check_tour_facts.py --stop lp  # 只看一站

規則：
- 只讀 PDF，不改、不搬、不複製任何 PDF 內容到檔案（只在記憶體裡比對）。
- 錯誤（exit code 1）：站卡主要內容的數字在 7 份 PDF 都找不到、引述不是逐字原文、
  結構錯誤、出現禁用字（缺點、免費、保費、政治人物或其網站名稱）。
- 提醒：數字只在別站的 PDF 找到（跨站比較時正常，請人工確認）。
- 狀況劇裡的人物年齡、住院天數、簡單乘法結果不在 PDF 很正常，列出來給人工確認。
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STOP_PDF = {
    "lp": "LPLS互助基金(112年版)範本.pdf",
    "ls": "LPLS互助基金(112年版)範本.pdf",
    "group": "社員團體互助金內容簡介.pdf",
    "accident": "114年度意外互助基金內容簡介.pdf",
    "senior": "松年意外互助基金內容簡介114.pdf",
    "cancer": "防癌互助基金內容簡介114.pdf",
    "ci": "重大疾病互助基金內容簡介.pdf",
    "officer": "幹部互助基金內容簡介112.pdf",
}

BANNED_IN_CONTENT = ["缺點", "免費", "保費", "保險費", "買保險"]

# 產品與公開文件不可出現的名稱：清單只放本機 tools/brand_words.local.txt（一行一個、# 開頭是註解），
# 檔名已列入 .gitignore，名稱本身不寫進公開 repo。
BRAND_FILE = os.path.join(ROOT, "tools", "brand_words.local.txt")


def load_brand_re():
    if not os.path.exists(BRAND_FILE):
        return None
    with open(BRAND_FILE, encoding="utf-8") as f:
        words = [w.strip() for w in f if w.strip() and not w.lstrip().startswith("#")]
    return re.compile("|".join(re.escape(w) for w in words)) if words else None

CN_DIGITS = {"零": 0, "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}


def cn_to_int(s):
    total, num = 0, 0
    for ch in s:
        if ch in CN_DIGITS:
            num = CN_DIGITS[ch]
        elif ch == "十":
            total += (num or 1) * 10
            num = 0
        elif ch == "百":
            total += (num or 1) * 100
            num = 0
    return total + num


def _cn_units(t):
    # 中文數字＋單位（十月一日、六十日、次年七月三十一日）→ 阿拉伯數字
    return re.sub(r"([零一二兩三四五六七八九十百]+)(?=\s*[月日歲天年個次週])", lambda m: str(cn_to_int(m.group(1))), t)


def normalize(text):
    """比對句子用：去掉所有空白。"""
    return _cn_units(re.sub(r"\s+", "", unicodedata.normalize("NFKC", text or "")))


def normalize_spaced(text):
    """比對數字用：空白縮成一格，保留數字之間的邊界。"""
    return _cn_units(re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text or "")))


def pdf_text(path):
    if shutil.which("pdftotext"):
        out = subprocess.run(["pdftotext", "-enc", "UTF-8", path, "-"], capture_output=True)
        if out.returncode == 0:
            return out.stdout.decode("utf-8", "ignore")
    try:
        import fitz  # PyMuPDF
        with fitz.open(path) as doc:
            return "\n".join(page.get_text() for page in doc)
    except Exception:
        pass
    from pypdf import PdfReader
    return "\n".join(page.extract_text() or "" for page in PdfReader(path).pages)


def number_variants(num_str, wan):
    """'3', 萬 → ['3萬', '30,000', '30000']；'30,000' → ['30,000', '30000', '3萬']"""
    raw = num_str.replace(",", "")
    try:
        value = float(raw) * (10000 if wan else 1)
    except ValueError:
        return [num_str]
    out = set()
    if wan:
        out.add(f"{num_str}萬")
    out.add(num_str)
    if value.is_integer():
        iv = int(value)
        out.add(f"{iv:,}")
        out.add(str(iv))
        if iv % 10000 == 0 and iv >= 10000:
            out.add(f"{iv // 10000}萬")
        elif iv % 1000 == 0 and iv > 10000:
            w = iv / 10000
            out.add(f"{w:g}萬")
            out.add(f"{iv // 10000}萬{iv % 10000:,}")
    return sorted(out, key=len, reverse=True)


NUM_RE = re.compile(r"(\d[\d,]*(?:\.\d+)?)\s*(萬)?")


def tokens(text):
    for m in NUM_RE.finditer(unicodedata.normalize("NFKC", text or "")):
        num = m.group(1).rstrip(",")
        if not num:
            continue
        yield num, bool(m.group(2))


def walk(obj, path=""):
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk(v, f"{path}[{i}]")
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk(v, f"{path}.{k}" if path else k)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stop", help="只檢查這一站，例如 lp、senior")
    args = ap.parse_args()

    src = open(os.path.join(ROOT, "js", "data", "tour_content.js"), encoding="utf-8").read()
    m = re.search(r"window\.TOUR_CONTENT\s*=\s*(\{.*\})\s*;?\s*$", src, re.S)
    if not m:
        print("❌ 讀不到 window.TOUR_CONTENT（下方必須是嚴格 JSON）")
        return 1
    data = json.loads(m.group(1))

    texts, spaced = {}, {}
    for stop_id, fname in STOP_PDF.items():
        path = os.path.join(ROOT, fname)
        if not os.path.exists(path):
            print(f"❌ 找不到 PDF：{fname}")
            return 1
        if fname not in texts:
            raw = pdf_text(path)
            texts[fname] = normalize(raw)
            spaced[fname] = normalize_spaced(raw)

    def has_number(text, variant):
        # 整個數字比對：前後不能再接數字（避免 8,000 被當成 18,000 的一部分）；「萬」前後可以有空白
        body = r"\s*萬\s*".join(re.escape(p) for p in variant.split("萬"))
        tail = "" if variant.endswith("萬") else r"(?![\d.]|,\d)"
        return re.search(r"(?<![\d.,])" + body + tail, text) is not None

    def found_in(variants, fnames):
        return [f for f in fnames if any(has_number(spaced[f], v) for v in variants)]

    errors, warns, infos = [], [], []
    manifest = json.load(open(os.path.join(ROOT, "assets", "manifest.json"), encoding="utf-8"))
    images = {k for k, v in manifest.get("images", {}).items() if v}

    # 結構：路線、站序
    order = data.get("order", [])
    for pk, p in data.get("personas", {}).items():
        for sid in p.get("route", []):
            if sid not in STOP_PDF:
                errors.append(f"身分路線 {pk} 有不存在的站：{sid}")
    for sid in order:
        if sid not in STOP_PDF:
            errors.append(f"order 有不存在的站：{sid}")

    stops = data.get("stops", {})
    for sid, stop in stops.items():
        if args.stop and sid != args.stop:
            continue
        own = STOP_PDF.get(sid)
        if not own:
            errors.append(f"[{sid}] 不是 8 個基金之一")
            continue
        others = [f for f in dict.fromkeys(STOP_PDF.values()) if f != own]

        kn = stop.get("keyNumbers", [])
        if not 2 <= len(kn) <= 3:
            errors.append(f"[{sid}] keyNumbers 要 2～3 個，現在 {len(kn)} 個")
        for p in stop.get("pairs", []):
            if p.get("to") not in STOP_PDF or p.get("to") == sid:
                errors.append(f"[{sid}] 協作線指向不正確：{p.get('to')}")
        for st in stop.get("stories", []):
            if st.get("imgKey") and st["imgKey"] not in images:
                errors.append(f"[{sid}] 狀況劇角色圖不存在：{st['imgKey']}")

        # 引述：每一句都要是 PDF 逐字原文
        for q in stop.get("quotes", []) or ([stop["quote"]] if stop.get("quote") else []):
            for sentence in [s for s in re.split(r"[。]", q.get("text", "")) if s.strip()]:
                ns = normalize(sentence)
                if ns not in texts[own] and not any(ns in texts[f] for f in others):
                    errors.append(f"[{sid}] 簡章原文引述找不到逐字原文：「{sentence}」")

        # 數字與禁用字
        for path, text in walk(stop):
            if path.startswith("pendingConfirm") or path.endswith("imgKey") or path.endswith(".source"):
                continue
            for word in BANNED_IN_CONTENT:
                if word in text:
                    errors.append(f"[{sid}] {path} 出現禁用字「{word}」：{text}")
            is_story = path.startswith("stories")
            is_story_who = is_story and path.endswith(".who")
            for num, wan in tokens(text):
                if len(num.replace(",", "")) == 1 and not wan:
                    continue  # 個位數（1 站、3 個月）太常見，不檢查
                variants = [normalize(v) for v in number_variants(num, wan)]
                label = f"{num}{'萬' if wan else ''}"
                primary = [own]
                pm = re.match(r"pairs\[(\d+)\]", path)
                if pm:
                    target = stop.get("pairs", [])[int(pm.group(1))].get("to")
                    if target in STOP_PDF:
                        primary.append(STOP_PDF[target])
                if found_in(variants, primary):
                    continue
                elsewhere = found_in(variants, others)
                if is_story_who:
                    continue
                if is_story:
                    if not elsewhere:
                        infos.append(f"[{sid}] {path}：{label}（狀況劇設定或簡單計算，請人工確認）")
                    continue
                if elsewhere:
                    warns.append(f"[{sid}] {path}：{label} 只在別站簡章找到（{elsewhere[0]}），跨站比較請確認")
                else:
                    errors.append(f"[{sid}] {path}：{label} 在 7 份簡章都找不到 → {text}")

    # 身分路線說明裡的數字
    for pk, p in data.get("personas", {}).items():
        for field in ("banner", "intro", "short"):
            for num, wan in tokens(p.get(field, "")):
                if len(num.replace(",", "")) == 1 and not wan:
                    continue
                variants = [normalize(v) for v in number_variants(num, wan)]
                if not found_in(variants, list(dict.fromkeys(STOP_PDF.values()))):
                    errors.append(f"[身分 {pk}] {field}：{num}{'萬' if wan else ''} 在 7 份簡章都找不到")

    # 產品檔案與公開文件不可出現政治人物或其網站名稱（清單在本機 tools/brand_words.local.txt）
    brand_re = load_brand_re()
    if brand_re is None:
        warns.append("找不到 tools/brand_words.local.txt（本機名稱清單），這次略過名稱檢查")
    else:
        for folder, exts in (("", (".html", ".md")), ("css", (".css",)), ("js", (".js",)), ("tools", (".py", ".md"))):
            base = os.path.join(ROOT, folder)
            for dirpath, dirnames, files in os.walk(base):
                if folder == "":
                    dirnames[:] = []  # 根目錄只看第一層
                for fn in files:
                    if fn.endswith(exts):
                        p = os.path.join(dirpath, fn)
                        with open(p, encoding="utf-8", errors="ignore") as fh:
                            if brand_re.search(fh.read()):
                                errors.append(f"產品或公開文件出現不該有的名稱：{os.path.relpath(p, ROOT)}")

    for title, items, mark in (("錯誤", errors, "❌"), ("提醒", warns, "⚠️"), ("請人工確認", infos, "ℹ️")):
        print(f"\n{mark} {title}：{len(items)} 項")
        for it in items:
            print(f"  - {it}")

    pending = sum(len(s.get("pendingConfirm", [])) for k, s in stops.items() if not args.stop or k == args.stop)
    print(f"\n📝 待督導確認（pendingConfirm）：{pending} 項")
    print("\n結果：" + ("❌ 有錯誤，請修正後再部署" if errors else "✅ 沒有錯誤"))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
