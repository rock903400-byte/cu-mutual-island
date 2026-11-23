"""開場短片：讀到素材清單裡的網址（含 ?v=）、長度合理、播完自己關掉進島、Console 0 錯誤。

用法：python tools/test_intro_video.py [--prod]
- 兩種情境：桌機（允許有聲自動播放）、手機 390×844（有聲被擋 → 靜音播放＋「點一下開聲音」）。
- --prod 測正式站，用假的「已經是來福好友」通過守門。
- 桌機尺寸不要在播放中截 3D 畫面的圖：無頭瀏覽器用軟體算圖，截一張要十幾秒，
  計時會變成「影片播了 17 秒」的假警報（AGENTS.md §4 第 23 點）。手機尺寸截圖很快，可以截。
"""
import os
import re
import sys
import time

import testkit
from playwright.sync_api import sync_playwright

PROD = "--prod" in sys.argv
with open(os.path.join(testkit.ROOT, "js", "core", "assets_manifest.js"), encoding="utf-8") as f:
    INTRO = re.search(r"intro:\s*'([^']+)'", f.read()).group(1)   # 例：assets/videos/intro_carnival.mp4?v=2

base = testkit.PROD if PROD else testkit.serve()
ck = testkit.Checks()

with sync_playwright() as p:
    for label, args, mobile in (("桌機有聲自動播放", ["--autoplay-policy=no-user-gesture-required"], False),
                                ("手機有聲被擋改靜音", ["--autoplay-policy=user-gesture-required"], True)):
        browser = p.chromium.launch(args=testkit.GL_ARGS + args)
        ctx = browser.new_context(viewport={"width": 390, "height": 844} if mobile else {"width": 1280, "height": 800},
                                  is_mobile=mobile, has_touch=mobile)
        if PROD:
            ctx.add_init_script(testkit.FAKE_FRIEND_JS)
        page = ctx.new_page()
        errs, bad = testkit.watch_errors(page)
        video_resp = []
        page.on("response", lambda r: video_resp.append((r.status, r.url)) if "assets/videos/" in r.url else None)
        page.goto(base)
        page.wait_for_function("window.TOUR && window.APP", timeout=60000)
        page.wait_for_function("""(() => { const v = document.getElementById('intro-video-el');
            return v && !v.paused && v.currentTime > 0.2 && isFinite(v.duration); })()""", timeout=30000)
        t0 = time.time()
        info = page.evaluate("""(() => { const v = document.getElementById('intro-video-el');
            return { src: v.currentSrc, duration: v.duration, muted: v.muted }; })()""")
        ck(f"{label}：讀到素材清單裡的短片網址（{INTRO.split('/')[-1]}）", info["src"].endswith(INTRO), info)
        ck(f"{label}：短片長度合理（{info['duration']:.2f} 秒）", 3 <= info["duration"] <= 12, info)
        if mobile:
            ck(f"{label}：靜音播放並出現開聲音按鈕", info["muted"] and page.is_visible("#btn-intro-unmute"), info)
            page.wait_for_timeout(2500)
            page.screenshot(path=testkit.shot("intro_video_playing_mobile.png"))
        page.wait_for_function("document.getElementById('modal-intro-video').classList.contains('hidden')",
                               timeout=30000)
        took = time.time() - t0
        ck(f"{label}：播完自己關掉短片、進島（{took:.1f} 秒）", took < info["duration"] + 3, took)
        ok_status = video_resp and all(s in (200, 206, 304) for s, _ in video_resp)
        ck(f"{label}：短片請求都是 200／206／304", ok_status, video_resp)
        ck(f"{label}：Console 0 錯誤、沒有 4xx／5xx", not errs and not bad, errs + bad)
        browser.close()

sys.exit(ck.report())
