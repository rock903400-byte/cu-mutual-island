"""語音導覽念對了沒（AI 聽不到聲音，用語音轉文字反查；AGENTS.md §4 第 21 點）。

用法（在專案根目錄，用裝了 faster-whisper 的 Python）：
    python tools/check_voice_asr.py                      # 8 站整段轉文字，跟 tour_content.js 的 voice 稿對照
    python tools/check_voice_asr.py --clip group 31 36   # 只切 3 號站第 31～36 秒單獨再聽（整段常漏字或聽錯，可疑處用這個確認）

準備（一次就好，放暫存資料夾、不進專案）：
    python -m venv %TEMP%\\asr_venv
    %TEMP%\\asr_venv\\Scripts\\pip install faster-whisper opencc-python-reimplemented numpy
    set HF_HUB_OFFLINE=1   （本機 %USERPROFILE%\\.cache\\huggingface\\hub 已有 large-v3-turbo 模型，就不用再下載）
- faster-whisper 1.2.1 配新版 PyAV 會出 metadata_errors 錯誤，所以先用 ffmpeg 解成 16kHz 單聲道再丟給模型。
- 同音字（身故→申僱、給付→幾副）、語尾「喔／哦」是轉文字的問題；數字、專有名詞不一樣才要人工聽。
- 結尾多一串外文亂碼通常是轉文字的幻覺，不是語音多出雜音。
"""
import difflib
import json
import os
import re
import subprocess
import sys

import numpy as np
import opencc
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = "mobiuslabsgmbh/faster-whisper-large-v3-turbo"
PROMPT = "以下是台灣華語的儲蓄互助社互助基金導覽，使用繁體中文。"
s2t = opencc.OpenCC("s2twp")
CN = {"零": 0, "〇": 0, "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9}
UNIT = {"十": 10, "百": 100, "千": 1000}


def cn2num(s):
    total, section, num = 0, 0, 0
    for ch in s:
        if ch in CN:
            num = CN[ch]
        elif ch in UNIT:
            section += (num or 1) * UNIT[ch]
            num = 0
        elif ch == "萬":
            total += (section + num) * 10000
            section, num = 0, 0
    return total + section + num


def norm(t):
    t = s2t.convert(t).replace(",", "").replace("，", "").replace("百分之百", "100%").replace("哦", "喔")
    t = re.sub(r"百分之([零一二兩三四五六七八九十百]+)", lambda m: f"{cn2num(m.group(1))}%", t)
    t = re.sub(r"[零〇一二兩三四五六七八九十百千萬]{2,}|(?<=[第到滿])[一二兩三四五六七八九十]|[一二兩三四五六七八九十](?=[歲號站項個天元萬倍])",
               lambda m: str(cn2num(m.group(0))), t)
    return re.sub(r"[\s，。；：、！？「」,.;:!?]", "", t)


def pcm(path, start=None, end=None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", str(start), "-to", str(end)]
    raw = subprocess.run(cmd + ["-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def audio(sid):
    return os.path.join(ROOT, "assets", "audio", f"vo_stop_{sid}.mp3")


model = WhisperModel(MODEL, device="cpu", compute_type="int8")
if "--clip" in sys.argv:
    i = sys.argv.index("--clip")
    sid, a, b = sys.argv[i + 1], float(sys.argv[i + 2]), float(sys.argv[i + 3])
    x = pcm(audio(sid), a, b)
    for label, prompt in [("不給提示", None), ("給提示", PROMPT)]:
        segs, _ = model.transcribe(x, language="zh", beam_size=5, vad_filter=False, condition_on_previous_text=False, initial_prompt=prompt)
        print(f"{sid} {a}～{b} 秒（{label}）：", s2t.convert("".join(s.text for s in segs)))
    sys.exit(0)

src = open(os.path.join(ROOT, "js", "data", "tour_content.js"), encoding="utf-8").read()
data = json.loads(src[src.index("{", src.index("window.TOUR_CONTENT")):src.rindex("}") + 1])
for sid in data["order"]:
    script = data["stops"][sid]["voice"]
    segs, _ = model.transcribe(pcm(audio(sid)), language="zh", beam_size=5, vad_filter=False, initial_prompt=PROMPT)
    heard = s2t.convert("".join(s.text for s in segs))
    sm = difflib.SequenceMatcher(None, norm(script), norm(heard))
    diffs = [(sm.a[i1:i2], sm.b[j1:j2]) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    print(f"\n===== {sid}  相似度 {sm.ratio():.3f}")
    print("稿：", script)
    print("聽：", heard)
    print("差異：", diffs or "無")
