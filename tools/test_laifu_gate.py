"""來福好友守門：本機用假的 LINE（window.__LAIFU_TEST）測 23 項（AGENTS.md §4 第 22 點）。

用法（在專案根目錄）：python tools/test_laifu_gate.py
需要 playwright、opencv-python、numpy（QR 實掃）。全部通過 exit 0。
"""
import json
import sys

from playwright.sync_api import sync_playwright

from testkit import ADD_URL, GL_ARGS, LIFF_URL, UA_ANDROID, UA_LINE, Checks, decode_qr_png, enter_island, serve, shot, watch_errors

BASE = serve()
FAKE = """(cfg) => {
  window.__LAIFU_TEST = { liff: {
    loginCalls: [], initArg: null,
    init(o) { this.initArg = o; return cfg.initFail ? Promise.reject(new Error('fake init fail')) : Promise.resolve(); },
    isLoggedIn() { return cfg.loggedIn; },
    getFriendship() { return Promise.resolve({ friendFlag: window.__fakeFriend }); },
    login(o) { this.loginCalls.push(o); }
  } };
  window.__fakeFriend = cfg.friend;
  if (cfg.backFromLogin) sessionStorage.setItem('cu_island_laifu_intent', String(Date.now()));
}"""
STATE = """() => ({
  state: window.LAIFU_GATE.state(),
  open: !document.getElementById('laifu-gate').classList.contains('hidden'),
  step: document.getElementById('laifu-gate-step').innerText,
  qr: !!document.querySelector('#laifu-gate-step svg.laifu-qr'),
  openInLine: document.querySelector('#laifu-gate-step a.laifu-btn')?.getAttribute('href') ?? null,
  logins: window.__LAIFU_TEST ? window.__LAIFU_TEST.liff.loginCalls.length : 0,
  intro: !document.getElementById('modal-intro-video').classList.contains('hidden'),
  drawer: !document.getElementById('side-drawer').classList.contains('hidden')
})"""
check = Checks()


def qr_text(page):
    return decode_qr_png(page.locator("#laifu-gate-step svg.laifu-qr").screenshot())


def run(p, cfg, fn, ua=None, mobile=False):
    b = p.chromium.launch(headless=True, args=GL_ARGS)
    vp = {"width": 390, "height": 844} if mobile else {"width": 1280, "height": 800}
    page = b.new_context(viewport=vp, is_mobile=mobile, has_touch=mobile, user_agent=ua, locale="zh-TW").new_page()
    errs, _ = watch_errors(page)
    line_req = []
    page.on("request", lambda r: line_req.append(r.url) if "line-scdn" in r.url or "line.me" in r.url else None)
    if cfg is not None:
        page.add_init_script(f"({FAKE})({json.dumps(cfg)})")
    page.goto(BASE, wait_until="load")
    enter_island(page, "window.LAIFU_GATE && window.APP && window.TOUR")
    fn(page, errs, line_req)
    b.close()


def t_desktop_login(page, errs, req):
    s = page.evaluate(STATE)
    check("A1 電腦、沒登入 LINE：短片關掉後擋下，顯示 QR 和「在這台電腦登入 LINE」",
          s["open"] and s["qr"] and "在這台電腦登入 LINE" in s["step"] and s["logins"] == 0, s)
    check("A1b 畫面上的 QR code 實際掃得出來，連到互助島的 LINE 入口", qr_text(page) == LIFF_URL, qr_text(page))
    page.screenshot(path=shot("laifu_desktop_login.png"))
    page.click("[data-laifu=login]")
    page.wait_for_timeout(300)
    arg = page.evaluate("window.__LAIFU_TEST.liff.loginCalls[0]")
    intent = page.evaluate("sessionStorage.getItem('cu_island_laifu_intent')")
    check("A2 按「在這台電腦登入 LINE」：叫 LINE 登入、回到同一頁", arg and arg.get("redirectUri") == BASE and intent, (arg, intent))
    check("A3 Console 0 錯誤", not errs, errs)


def t_desktop_not_friend(page, errs, req):
    s = page.evaluate(STATE)
    check("B1 電腦、登入了但不是好友：擋下，顯示加好友 QR 和「我加好了」",
          s["open"] and s["qr"] and "我加好了" in s["step"] and s["state"] == "notFriend", s)
    check("B1b 加好友 QR code 實際掃得出來，連到來福", qr_text(page) == ADD_URL, qr_text(page))
    page.click("[data-laifu=recheck]")
    page.wait_for_timeout(500)
    s = page.evaluate(STATE)
    check("B2 還沒加就按「我加好了」：還是擋著，提示還沒看到", s["open"] and "還沒看到你加入來福" in s["step"], s)
    page.evaluate("window.__fakeFriend = true")
    page.click("[data-laifu=recheck]")
    page.wait_for_timeout(500)
    s = page.evaluate(STATE)
    check("B3 加好之後按「我加好了」：放行", not s["open"] and s["state"] == "friend", s)
    page.click("#btn-tour")
    page.wait_for_timeout(800)
    check("B4 放行後島上的按鈕能用（打開導覽）", page.evaluate(STATE)["drawer"], page.evaluate(STATE))
    check("B5 Console 0 錯誤", not errs, errs)


def t_line_login(page, errs, req):
    s = page.evaluate(STATE)
    check("C1 手機 LINE 裡、沒登入：短片關掉後自動請 LINE 登入（不用按）", s["open"] and s["logins"] == 1, s)
    check("C2 Console 0 錯誤", not errs, errs)


def t_line_not_friend(page, errs, req):
    s = page.evaluate(STATE)
    check("D1 手機 LINE 裡、不是好友：顯示「➕ 加入來福」", s["open"] and "加入來福" in s["step"] and not s["qr"], s)
    lay = page.evaluate("""() => ({ ov: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        btn: Math.round(document.querySelector('[data-laifu=add]').getBoundingClientRect().height),
        card: Math.round(document.querySelector('.laifu-card').getBoundingClientRect().height) })""")
    check("D2 手機版面：沒有左右溢出、按鈕夠大、整張卡放得進一個畫面", lay["ov"] == 0 and lay["btn"] >= 52 and lay["card"] <= 812, lay)
    page.screenshot(path=shot("laifu_line_not_friend.png"))
    page.evaluate("window.__fakeFriend = true")
    page.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(1500)
    s = page.evaluate(STATE)
    check("D3 去加好友再回來：自動確認、放行", not s["open"] and s["state"] == "friend", s)
    check("D4 Console 0 錯誤", not errs, errs)


def t_android_login(page, errs, req):
    s = page.evaluate(STATE)
    check("E1 手機其他瀏覽器、沒登入：顯示「用 LINE 打開互助島」連到互助島的 LINE 入口",
          s["open"] and "用 LINE 打開互助島" in s["step"] and s["openInLine"] == LIFF_URL, s)


def t_init_fail(page, errs, req):
    s = page.evaluate(STATE)
    check("F1 LINE 查不了：不擋，直接進島", not s["open"] and s["state"] == "error", s)


def t_friend(page, errs, req):
    s = page.evaluate(STATE)
    check("G1 已經是好友：不擋", not s["open"] and s["state"] == "friend", s)
    check("G2 Console 0 錯誤", not errs, errs)


def t_back(page, errs, req):
    s = page.evaluate(STATE)
    check("H1 從 LINE 登入回來但沒按許可：不再播短片，直接擋下並提示再試一次",
          s["open"] and not s["intro"] and "LINE 沒有完成確認" in s["step"], s)


def t_off(page, errs, req):
    s = page.evaluate(STATE)
    check("I1 本機網站（沒有假 LINE）：完全不檢查、不載 LINE 程式", s["state"] == "off" and not s["open"] and not req, (s, req))
    check("I2 Console 0 錯誤", not errs, errs)


with sync_playwright() as p:
    run(p, {"loggedIn": False, "friend": False}, t_desktop_login)
    run(p, {"loggedIn": True, "friend": False}, t_desktop_not_friend)
    run(p, {"loggedIn": False, "friend": False}, t_line_login, ua=UA_LINE, mobile=True)
    run(p, {"loggedIn": True, "friend": False}, t_line_not_friend, ua=UA_LINE, mobile=True)
    run(p, {"loggedIn": False, "friend": False}, t_android_login, ua=UA_ANDROID, mobile=True)
    run(p, {"loggedIn": True, "friend": False, "initFail": True}, t_init_fail)
    run(p, {"loggedIn": True, "friend": True}, t_friend)
    run(p, {"loggedIn": False, "friend": False, "backFromLogin": True}, t_back)
    run(p, None, t_off)

sys.exit(check.report())
