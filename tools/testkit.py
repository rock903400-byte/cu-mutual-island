"""tools/test_*.py 共用的小工具：本機網站、無頭瀏覽器、假的 LINE、結果列印。

- 需要 Python 的 playwright（含 Chromium）；QR 實掃另外要 opencv-python、numpy。
- 每次都開全新的瀏覽設定檔，不會動到使用者自己瀏覽器的 localStorage。
- 截圖放系統暫存資料夾的 cu_island_tests\\，不放進專案。
"""
import http.server
import os
import sys
import tempfile
import threading

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROD = "https://cu-mutual-island.rock903400.workers.dev/"
LIFF_URL = "https://liff.line.me/2009715141-C0OePFPc"
ADD_URL = "https://line.me/R/ti/p/@721byaqh"
GL_ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]

UA_LINE = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
           "(KHTML, like Gecko) Mobile/15E148 Safari Line/14.0.0")
UA_ANDROID = ("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36")

# 正式站有來福好友守門：測守門以外的功能時，用假的「已經是好友」通過
FAKE_FRIEND_JS = """window.__LAIFU_TEST = { liff: { init: () => Promise.resolve(), isLoggedIn: () => true,
  getFriendship: () => Promise.resolve({ friendFlag: true }), login() {} } };"""


def serve(root=ROOT):
    """在 127.0.0.1 隨機埠開一個靜態網站，回傳網址。"""
    class H(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **k):
            super().__init__(*a, directory=root, **k)

        def log_message(self, *a):
            pass

    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{srv.server_address[1]}/"


def shot(name):
    d = os.path.join(tempfile.gettempdir(), "cu_island_tests")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, name)


def watch_errors(page):
    """收集 Console 錯誤和 4xx／5xx 回應。"""
    errs, bad = [], []
    page.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
    page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    page.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    return errs, bad


def enter_island(page, ready="window.TOUR && window.APP"):
    """等網站載好、關掉開場短片。"""
    page.wait_for_function(ready, timeout=60000)
    page.wait_for_timeout(2500)
    # 用程式按「立即登島」：短片可能剛好自己播完，先看再按會撲空、卡 30 秒
    page.evaluate("""(() => { const m = document.getElementById('modal-intro-video');
      if (m && !m.classList.contains('hidden')) document.getElementById('btn-skip-intro')?.click(); })()""")
    page.wait_for_timeout(800)


def decode_qr_png(png, pad=40):
    """用 OpenCV 實際掃一張 PNG 裡的 QR code，回傳內容（掃不到是空字串）。"""
    import cv2
    import numpy as np
    img = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR)
    img = cv2.copyMakeBorder(img, pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=(255, 255, 255))
    return cv2.QRCodeDetector().detectAndDecode(img)[0]


class Checks:
    def __init__(self):
        self.items = []

    def __call__(self, name, cond, detail=""):
        self.items.append((name, bool(cond), detail))

    def report(self):
        for name, ok, detail in self.items:
            print(("✅" if ok else "❌"), name, "" if ok else detail)
        passed = sum(ok for _, ok, _ in self.items)
        print(f"{passed}/{len(self.items)} 項通過")
        return 0 if passed == len(self.items) else 1
