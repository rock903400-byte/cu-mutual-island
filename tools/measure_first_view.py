"""量手機上站卡要滑幾個畫面（AGENTS.md §4 第 20 點）：390×844，全部身分／senior 身分各量導覽首頁和 8 站。

「全螢幕」那欄就是站卡第一眼要滑幾個畫面（2026-11-23 改版後 3.2～4.2）。只量、不判斷對錯。
用法（在專案根目錄）：python tools/measure_first_view.py　　結果另存 JSON 在暫存資料夾 cu_island_tests\\。
"""
import json

from playwright.sync_api import sync_playwright

from testkit import GL_ARGS, enter_island, serve, shot, watch_errors

BASE = serve()
MEASURE = """() => {
  const body = document.getElementById('explore-body');
  return { scrollH: body.scrollHeight, clientH: body.clientHeight };
}"""
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=GL_ARGS)
    page = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale="zh-TW").new_page()
    errs, _ = watch_errors(page)
    page.goto(BASE, wait_until="load")
    enter_island(page, "window.TOUR && window.TOUR_CONTENT && window.APP")
    order = page.evaluate("TOUR_CONTENT.order")

    def both(key):
        page.wait_for_timeout(700)
        half = page.evaluate(MEASURE)
        page.evaluate("document.getElementById('side-drawer').classList.add('tour-sheet-full')")
        page.wait_for_timeout(700)
        res[key] = {"half": half, "full": page.evaluate(MEASURE)}

    for persona in ["all", "senior"]:
        page.evaluate(f"APP.setStageFilterUI('{persona}')")
        page.wait_for_timeout(300)
        page.evaluate("TOUR.openHome()")
        both(f"{persona}:home")
        for sid in order:
            page.evaluate(f"TOUR.openStop('{sid}')")
            both(f"{persona}:{sid}")
    b.close()

json.dump(res, open(shot("first_view.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k, v in res.items():
    h, f = v["half"], v["full"]
    print(f"{k:16} 內容高 {h['scrollH']:>5}px｜半高抽屜 {h['scrollH'] / h['clientH']:.1f} 個畫面｜全螢幕 {f['scrollH'] / f['clientH']:.1f} 個畫面")
print("Console 錯誤：", errs or "無")
