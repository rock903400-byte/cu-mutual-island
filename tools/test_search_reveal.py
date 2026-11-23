"""查基金點進站卡：找到的句子收在「看更多」裡時，要自動展開、捲到那句並標黃（AGENTS.md §5 第 6 點）。

用法（在專案根目錄）：python tools/test_search_reveal.py　　手機 390×844，全部通過 exit 0。
"""
import sys

from playwright.sync_api import sync_playwright

from testkit import GL_ARGS, Checks, enter_island, serve, shot, watch_errors

BASE = serve()
check = Checks()
CASES = [("保障期間", "group"), ("跨社", "senior"), ("等待期", "ci"), ("骨折", "accident"), ("812", "group")]

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=GL_ARGS)
    page = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale="zh-TW").new_page()
    errs, _ = watch_errors(page)
    page.goto(BASE, wait_until="load")
    enter_island(page)
    for q, stop in CASES:
        page.evaluate(f"TOUR.openSearch('{q}')")
        page.wait_for_timeout(400)
        page.click(f'.tour-result-row[data-tour-go="{stop}"]')
        # 標黃 2.6 秒後會自己消失（tour.js revealMatch）：一出現就等平滑捲動做完（約 1 秒）再檢查，不要等太久
        page.wait_for_selector(".tour-hit", timeout=3000)
        page.wait_for_timeout(1000)
        r = page.evaluate("""() => {
          const hit = document.querySelector('.tour-hit');
          const rect = hit ? hit.getBoundingClientRect() : null;
          return { hit: hit ? hit.textContent.replace(/\\s+/g, ' ').trim() : null,
                   inMore: hit ? !!hit.closest('.tour-more') : null, moreOpen: !!document.querySelector('.tour-more')?.open,
                   visible: rect ? (rect.top >= 0 && rect.bottom <= innerHeight) : false };
        }""")
        ok = r["hit"] and q in r["hit"].replace(",", "") and r["visible"] and (not r["inMore"] or r["moreOpen"])
        check(f"查「{q}」點進 {stop}：標黃、看得到{'、看更多已展開' if r['inMore'] else ''}", ok, r)
        if q == "保障期間":
            page.screenshot(path=shot("search_reveal_more.png"))
    check("Console 0 錯誤", not errs, errs)
    b.close()

sys.exit(check.report())
