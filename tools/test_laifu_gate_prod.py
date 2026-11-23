"""來福好友守門：正式站用真的 LINE 程式測 6 項（AGENTS.md §5 第 8 點）。

無頭瀏覽器沒登入 LINE，所以真的 LINE 程式初始化成功時狀態會是 login（被擋下、顯示 QR）。
狀態若是 error，代表 LIFF ID 或 Endpoint 設錯（一般人看不出來，因為查不了會放行），要回 LINE Developers 查。

用法：python tools/test_laifu_gate_prod.py　　需要 playwright、opencv-python、numpy。全部通過 exit 0。
"""
import sys

from playwright.sync_api import sync_playwright

from testkit import GL_ARGS, LIFF_URL, PROD, UA_ANDROID, Checks, decode_qr_png, shot, watch_errors

check = Checks()


def open_site(p, mobile):
    b = p.chromium.launch(headless=True, args=GL_ARGS)
    page = b.new_context(viewport={"width": 390, "height": 844} if mobile else {"width": 1280, "height": 800},
                         is_mobile=mobile, has_touch=mobile, user_agent=UA_ANDROID if mobile else None, locale="zh-TW").new_page()
    errs, bad = watch_errors(page)
    page.goto(PROD, wait_until="load")
    page.wait_for_function("window.LAIFU_GATE && window.LAIFU_GATE.state() !== 'loading'", timeout=45000)
    page.wait_for_timeout(1500)
    if page.is_visible("#btn-skip-intro"):
        page.click("#btn-skip-intro")
    page.wait_for_timeout(1000)
    return b, page, errs, bad


with sync_playwright() as p:
    b, page, errs, bad = open_site(p, mobile=False)
    st = page.evaluate("({ state: LAIFU_GATE.state(), open: LAIFU_GATE.isOpen() })")
    check("P1 電腦、沒登入 LINE：真的 LINE 程式初始化成功（狀態 login，不是 error），擋下", st["state"] == "login" and st["open"], st)
    text = decode_qr_png(page.locator("#laifu-gate-step svg.laifu-qr").screenshot()) if st["open"] else ""
    check("P2 正式站畫面上的 QR 掃得出互助島的 LINE 入口", text == LIFF_URL, text)
    page.screenshot(path=shot("laifu_prod_desktop.png"))
    check("P3 Console 0 錯誤、沒有 4xx／5xx 回應", not errs and not bad, (errs, bad))
    b.close()

    b, page, errs, bad = open_site(p, mobile=True)
    st = page.evaluate("({ state: LAIFU_GATE.state(), open: LAIFU_GATE.isOpen(), href: document.querySelector('#laifu-gate-step a.laifu-btn')?.href })")
    check("P4 手機其他瀏覽器：擋下，「用 LINE 打開互助島」連到互助島的 LINE 入口", st["state"] == "login" and st["open"] and st["href"] == LIFF_URL, st)
    lay = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    check("P5 手機版面沒有左右溢出", lay == 0, lay)
    page.screenshot(path=shot("laifu_prod_android.png"))
    check("P6 Console 0 錯誤、沒有 4xx／5xx 回應", not errs and not bad, (errs, bad))
    b.close()

sys.exit(check.report())
