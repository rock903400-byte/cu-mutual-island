"""
透過台灣意傳科技「媠聲」公開台語語音合成服務 (hapsing.ithuan.tw)
產出 5 句教育部標準臺羅拼音「道地台語金句彩蛋」MP3 存入 assets/audio/！
（遵守每分鐘限 3 句規範，每句間隔 22 秒）
"""
import os
import time
import urllib.parse
import urllib.request

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

# 精校標準臺羅拼音 (Tâi-lô)
TAIGI_CLIPS = [
    ("vo_taigi_good.mp3", "Suí--lah! Tap-tio̍h--ah, lí tsin gâu--ooh!"),
    ("vo_taigi_reject.mp3", "M̄-thang--ooh! Koh khuànn tsi̍t-ē hōo-tsō tiâu-khuán--lah!"),
    ("vo_taigi_tamer.mp3", "M̄-thang--ooh! Bé-hì-thuân sûn-siù-su buē-tàng pó-hiám--lah!"),
    ("vo_taigi_welcome.mp3", "Ta̍k-ke hó! Huan-gîng lâi-kàu Thú-hōo-siā Hōo-tsō-tó!"),
    ("vo_taigi_victory.mp3", "Kiong-hí buán-tshinn kuè-kuan, ū-kàu tsán--lah!"),
]

def fetch_clip(filename, tailo):
    url = "https://hapsing.ithuan.tw/bangtsam?taibun=" + urllib.parse.quote(tailo)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (CU-Mutual-Island/1.0)"})
    with urllib.request.urlopen(req, timeout=25) as r:
        data = r.read()
        if r.status != 200 or len(data) < 1000:
            raise RuntimeError(f"Unexpected response {r.status}, len={len(data)}")
        out_path = os.path.join(OUT_DIR, filename)
        with open(out_path, "wb") as f:
            f.write(data)
        print(f"OK: {filename} ({len(data)} bytes) <- {tailo}", flush=True)

def main():
    for i, (fn, tailo) in enumerate(TAIGI_CLIPS):
        fetch_clip(fn, tailo)
        if i < len(TAIGI_CLIPS) - 1:
            time.sleep(22)

if __name__ == "__main__":
    main()
