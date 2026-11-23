"""
每站語音導覽：把 js/data/tour_content.js 每站的 voice 稿，用 Google Gemini 語音（Vertex AI 的
gemini-3.8-flash-tts，台灣華語 cmn-TW，女聲 Sulafat，交代「台灣人平常的口音、慢慢講給長輩聽」）
產生 assets/audio/vo_stop_<站代號>.mp3。

每站錄好後，再請另一個 Gemini 模型聽寫：稿子裡的數字少一個、或聽寫跟稿子差太多，就重錄
（最多 3 次，留最好的一份）。最後用 ffmpeg 去掉頭尾靜音、把平均音量調到約 -18.5 dB。

用法（在專案根目錄）：
    python tools/generate_stop_voice.py --list                              # 只列出各站字數，不呼叫 API、不花錢
    python tools/generate_stop_voice.py --project <專案代號> --env <.env 路徑>   # 8 站全部重做
    python tools/generate_stop_voice.py --project <專案代號> --env <.env 路徑> --stop lp   # 只重做一站

- 金鑰：環境變數 GOOGLE_TTS_API_KEY，或 --env 指定的 .env 檔裡的 GOOGLE_TTS_API_KEY（不會印出來）。
  專案代號：--project 或環境變數 GOOGLE_TTS_PROJECT。金鑰和專案代號都不要寫進這個 repo（公開）。
- 要花錢：8 站全部做一次約 US$0.13～0.20（2026-11 價格）；--cap 是這次最多花多少美元，超過就停。
- 送出去的只有導覽稿文字（公開的簡章內容）和錄好的語音（聽寫檢查用）。
- 只讀 tour_content.js、只寫 assets/audio/vo_stop_*.mp3；暫存檔放系統暫存資料夾，做完自己刪掉。
- 重做後要把 js/core/assets_manifest.js 裡 stop_* 音檔的 ?v= 加 1，手機和 LINE 才不會吃到舊檔。
- Gemini 每次念法會有一點不同；聽起來怪的站，用 --stop 單獨重做就好。
"""
import argparse
import base64
import difflib
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import wave

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "audio")

TTS_MODEL = "gemini-3.8-flash-tts"
CHECK_MODEL = "gemini-3.1-flash-lite"
TTS_PRICE = (0.50, 9.0)            # 美元／每 100 萬 token：文字輸入、音訊輸出（2026-11 官方定價）
CHECK_PRICE = (0.25, 0.50, 1.50)   # 文字輸入、音訊輸入、文字輸出（保守高估）
VOICE = "Sulafat"                  # 溫暖的女聲（使用者 2026-11-23 從試聽選的）
STYLE = ("warm, kind Taiwanese woman in her 40s, a friendly credit union volunteer gently explaining "
         "to elderly members, speaking slowly and clearly, natural everyday Taiwanese Mandarin accent "
         "as spoken by ordinary people in Taiwan, relaxed and conversational, not a news anchor, "
         "not a Mainland Chinese accent")
MAX_TRIES = 3
GOOD_SIM = 0.90                    # 聽寫相似度到這裡、而且數字都在，就算過關
TARGET_DB = -18.5                  # 平均音量，跟其他語音一致（AGENTS.md §0 第 5 點）
PEAK_LIMIT_DB = -2.0               # 最大音量不超過這個，避免破音（轉 MP3 後峰值會再高約 1 dB，所以留 2 dB）


def load_stops():
    src = open(os.path.join(ROOT, "js", "data", "tour_content.js"), encoding="utf-8").read()
    m = re.search(r"window\.TOUR_CONTENT\s*=\s*(\{.*\})\s*;?\s*$", src, re.S)
    if not m:
        sys.exit("❌ 讀不到 window.TOUR_CONTENT（下方必須是嚴格 JSON）")
    data = json.loads(m.group(1))
    return data["order"], data["stops"]


def load_key(env_path):
    key = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()
    if key:
        return key
    if env_path and os.path.isfile(env_path):
        for line in open(env_path, encoding="utf-8"):
            if line.strip().startswith("GOOGLE_TTS_API_KEY="):
                key = line.split("=", 1)[1].strip()
                if key:
                    return key
    sys.exit("❌ 找不到金鑰：設定環境變數 GOOGLE_TTS_API_KEY，或用 --env 指定含 GOOGLE_TTS_API_KEY 的 .env")


class Budget:
    def __init__(self, cap):
        self.cap, self.spent = cap, 0.0

    def add(self, usd):
        self.spent += usd
        if self.spent > self.cap:
            raise RuntimeError(f"這次花費 ${self.spent:.4f} 超過上限 ${self.cap}，停止")


class Gemini:
    def __init__(self, key, project, budget):
        self.key, self.budget = key, budget
        self.api = f"https://aiplatform.googleapis.com/v1/projects/{project}/locations/global/publishers/google/models"

    def _post(self, model, body):
        data = json.dumps(body).encode("utf-8")
        last = ""
        for i in range(4):
            req = urllib.request.Request(f"{self.api}/{model}:generateContent", data=data,
                                         headers={"X-Goog-Api-Key": self.key, "Content-Type": "application/json; charset=utf-8"})
            try:
                return json.load(urllib.request.urlopen(req, timeout=300))
            except urllib.error.HTTPError as e:
                last = f"HTTP {e.code}: " + e.read().decode("utf-8", "replace")[:300].replace("\n", " ")
                if e.code in (429, 500, 502, 503, 504):
                    time.sleep(5 * (i + 1))
                    continue
                raise RuntimeError(last)
            except (urllib.error.URLError, TimeoutError) as e:
                last = str(e)
                time.sleep(5 * (i + 1))
        raise RuntimeError(last)

    def tts(self, text):
        body = {"contents": [{"role": "user", "parts": [{"text": f"[{STYLE}] {text}"}]}],
                "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {
                    "voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}, "languageCode": "cmn-TW"}}}
        res = self._post(TTS_MODEL, body)
        inline = res["candidates"][0]["content"]["parts"][0].get("inlineData") or {}
        u = res.get("usageMetadata", {})
        self.budget.add(u.get("promptTokenCount", 0) / 1e6 * TTS_PRICE[0] + u.get("candidatesTokenCount", 0) / 1e6 * TTS_PRICE[1])
        return to_wav(inline.get("mimeType", ""), base64.b64decode(inline.get("data", "")))

    def transcribe(self, wav_bytes):
        prompt = ("請仔細聽這段台灣華語語音，逐字聽寫成繁體中文。數字一律寫成阿拉伯數字"
                  "（例如 70 歲、3,000 元、100%），英文字母照念的寫。只寫真的聽到的，不要補字、不要修正。"
                  '只輸出 JSON：{"text": "聽到的文字"}')
        body = {"contents": [{"role": "user", "parts": [
                    {"inlineData": {"mimeType": "audio/wav", "data": base64.b64encode(wav_bytes).decode("ascii")}},
                    {"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
        res = self._post(CHECK_MODEL, body)
        u = res.get("usageMetadata", {})
        audio_tok = sum(d.get("tokenCount", 0) for d in u.get("promptTokensDetails", []) if d.get("modality") == "AUDIO")
        out_tok = u.get("candidatesTokenCount", 0) + u.get("thoughtsTokenCount", 0)
        self.budget.add((u.get("promptTokenCount", 0) - audio_tok) / 1e6 * CHECK_PRICE[0]
                        + audio_tok / 1e6 * CHECK_PRICE[1] + out_tok / 1e6 * CHECK_PRICE[2])
        txt = res["candidates"][0]["content"]["parts"][0].get("text", "{}")
        try:
            return str(json.loads(txt).get("text", ""))
        except (json.JSONDecodeError, AttributeError):
            return txt


def to_wav(mime, raw):
    if raw[:4] == b"RIFF":
        return raw
    m = re.search(r"rate=(\d+)", (mime or "").lower())
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(int(m.group(1)) if m else 24000)
        w.writeframes(raw)
    return buf.getvalue()


CN_DIGIT = {"零": 0, "〇": 0, "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
CN_UNIT = {"十": 10, "百": 100, "千": 1000}


def cn_to_int(s):
    total, num = 0, 0
    for ch in s:
        if ch in CN_DIGIT:
            num = CN_DIGIT[ch]
        else:
            total += (num or 1) * CN_UNIT[ch]
            num = 0
    return total + num


def numbers(text):
    """稿子或聽寫裡的阿拉伯數字（去掉千分位逗號）；百分之百也算 100%。"""
    text = text.replace("百分之百", "100%")
    return [n.replace(",", "") for n in re.findall(r"\d[\d,]*%?", text)]


def missing_numbers(script, heard):
    # 聽寫有時會寫成國字（三號站、八十五歲），先換成阿拉伯數字再比
    heard = re.sub(r"[零〇一二兩三四五六七八九十百千]+(?=\s*[號歲站個天元萬倍項])", lambda m: str(cn_to_int(m.group())), heard)
    pool = numbers(heard)
    miss = []
    for n in numbers(script):
        if n in pool:
            pool.remove(n)
        else:
            miss.append(n)
    return miss


def similarity(script, heard):
    def norm(s):
        s = s.replace("臺", "台").replace("哦", "喔").replace(",", "")
        return re.sub(r"[\s，。！？、：；「」『』（）()…,.!?:;~・]", "", s)
    return difflib.SequenceMatcher(None, norm(script), norm(heard)).ratio()


def make_clip(gem, text):
    best = None
    for attempt in range(1, MAX_TRIES + 1):
        wav = gem.tts(text)
        heard = gem.transcribe(wav)
        cand = {"wav": wav, "heard": heard, "miss": missing_numbers(text, heard),
                "sim": round(similarity(text, heard), 3), "tries": attempt}
        if not best or (len(cand["miss"]), -cand["sim"]) < (len(best["miss"]), -best["sim"]):
            best = cand
        if not cand["miss"] and cand["sim"] >= GOOD_SIM:
            break
    best["tries"] = attempt
    return best


def loudness(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    mean = float(re.search(r"mean_volume:\s*(-?[\d.]+) dB", out).group(1))
    peak = float(re.search(r"max_volume:\s*(-?[\d.]+) dB", out).group(1))
    return mean, peak


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout
    return float(out.strip())


def finish(wav_bytes, dst, tmp):
    """去掉頭尾靜音 → 平均音量拉到 TARGET_DB（會破音時才加限制器）→ 24kHz 單聲道 48kbps MP3。"""
    trimmed = os.path.join(tmp, "trimmed.wav")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "wav", "-i", "pipe:0", "-af",
                    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse", trimmed],
                   input=wav_bytes, check=True)
    mean, peak = loudness(trimmed)
    gain = TARGET_DB - mean
    filters = f"volume={gain:.2f}dB"
    if peak + gain > PEAK_LIMIT_DB:
        # level=0 是關掉 alimiter 預設的「自動拉到 0 dB」
        filters += f",alimiter=limit={10 ** (PEAK_LIMIT_DB / 20):.3f}:level=0"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", trimmed, "-af", filters,
                    "-ar", "24000", "-ac", "1", "-b:a", "48k", dst], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stop", help="只重做這一站，例如 lp、senior")
    ap.add_argument("--list", action="store_true", help="只列出各站字數，不呼叫 API")
    ap.add_argument("--project", default=os.environ.get("GOOGLE_TTS_PROJECT", ""), help="Google Cloud 專案代號")
    ap.add_argument("--env", help="含 GOOGLE_TTS_API_KEY 的 .env 檔路徑")
    ap.add_argument("--cap", type=float, default=0.20, help="這次最多花多少美元（預設 0.20）")
    args = ap.parse_args()

    order, stops = load_stops()
    todo = [sid for sid in order if (not args.stop or sid == args.stop) and stops.get(sid, {}).get("voice")]
    if not todo:
        sys.exit("❌ 沒有要做的站（檢查 --stop 或 voice 欄位）")
    if args.list:
        for sid in todo:
            print(f"{sid:9s} {len(stops[sid]['voice']):4d} 字  數字 {len(numbers(stops[sid]['voice']))} 個")
        return
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool):
            sys.exit(f"❌ 找不到 {tool}")
    if not args.project:
        sys.exit("❌ 請用 --project 或環境變數 GOOGLE_TTS_PROJECT 指定 Google Cloud 專案代號")

    gem = Gemini(load_key(args.env), args.project, Budget(args.cap))
    warn = []
    tmp = tempfile.mkdtemp(prefix="stop_voice_")
    try:
        for sid in todo:
            text = stops[sid]["voice"]
            clip = make_clip(gem, text)
            dst = os.path.join(OUT_DIR, f"vo_stop_{sid}.mp3")
            finish(clip["wav"], dst, tmp)
            mean, peak = loudness(dst)
            ok = not clip["miss"] and clip["sim"] >= GOOD_SIM
            print(f"{'✅' if ok else '⚠️'} {os.path.relpath(dst, ROOT)}  {duration(dst):5.1f} 秒  平均 {mean} dB  最大 {peak} dB"
                  f"  聽寫相似 {clip['sim']:.2f}  錄了 {clip['tries']} 次  累計 ${gem.budget.spent:.4f}")
            if not ok:
                warn.append(f"[{sid}] 少了數字 {clip['miss'] or '無'}，相似 {clip['sim']}\n  稿：{text}\n  聽：{clip['heard']}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"\n這次花費約 ${gem.budget.spent:.4f}")
    if warn:
        print("⚠️ 下面幾站請人工聽過確認（或用 --stop 重做）：\n" + "\n".join(warn))
    print("提醒：把 js/core/assets_manifest.js 裡 stop_* 音檔的 ?v= 加 1。")
    if warn:
        sys.exit(1)


if __name__ == "__main__":
    main()
