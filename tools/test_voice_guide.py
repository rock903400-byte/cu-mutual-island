"""每站語音導覽的 13 項播放測試（AGENTS.md §5 第 7 點）。

用法（在專案根目錄）：
    python tools/test_voice_guide.py          # 本機網站
    python tools/test_voice_guide.py --prod   # 正式站（用假的「已經是來福好友」通過守門）

用 --autoplay-policy=user-gesture-required 模擬手機「要點過才准出聲」。全部通過 exit 0。
"""
import sys

from playwright.sync_api import sync_playwright

from testkit import FAKE_FRIEND_JS, GL_ARGS, PROD, Checks, enter_island, serve, shot, watch_errors

PRODMODE = "--prod" in sys.argv
BASE = PROD if PRODMODE else serve()
STATE = """() => {
  const b = document.querySelector('#explore-body .tour-voice-btn');
  return { stop: document.getElementById('explore-title')?.textContent.trim(), playing: SOUND.isVoicePlaying(),
           btn: b ? b.querySelector('strong').textContent + '｜' + b.querySelector('small').textContent : null,
           cls: b ? b.className : null };
}"""
LAST = "window.__audios.filter(x => x.src.includes('vo_stop_'))"
check = Checks()

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=["--autoplay-policy=user-gesture-required"] + GL_ARGS)
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale="zh-TW")
    page = ctx.new_page()
    errs, bad = watch_errors(page)
    audio_req = []
    page.on("response", lambda r: audio_req.append(f"{r.status} {r.url.split('/')[-1]}") if "vo_stop_" in r.url else None)
    if PRODMODE:
        page.add_init_script(FAKE_FRIEND_JS)
    page.add_init_script("""(() => { const A = window.Audio; window.__audios = [];
      window.Audio = function (...a) { const x = new A(...a); window.__audios.push(x); return x; };
      window.Audio.prototype = A.prototype; })();""")
    page.goto(BASE, wait_until="load")
    enter_island(page, "window.TOUR && window.APP && window.SOUND && window.ASSETS_MANIFEST")
    page.evaluate("APP.setStageFilterUI('senior')")
    page.wait_for_timeout(300)
    page.evaluate("TOUR.openStop('senior')")
    page.wait_for_timeout(700)
    s = page.evaluate(STATE)
    check("1 按鈕出現、未播放", s["btn"] and not s["playing"] and "playing" not in s["cls"], s)

    page.click(".tour-voice-btn")
    page.wait_for_timeout(2500)
    s = page.evaluate(STATE)
    t = page.evaluate(f"(() => {{ const a = {LAST}.pop(); return a ? {{ t: +a.currentTime.toFixed(1), paused: a.paused }} : null; }})()")
    check("2 點了開始唸（真的在播）", s["playing"] and "playing" in s["cls"] and t and not t["paused"] and t["t"] > 0.5, (s, t))
    page.screenshot(path=shot("voice_playing.png"), clip={"x": 0, "y": 400, "width": 390, "height": 200})

    page.evaluate("TOUR.refresh()")
    page.wait_for_timeout(500)
    s = page.evaluate(STATE)
    check("3 重畫同一站不打斷", s["playing"] and "playing" in s["cls"], s)

    page.click("[data-tour-next]")
    page.wait_for_timeout(2000)
    s = page.evaluate(STATE)
    t = page.evaluate(f"{LAST}.map(x => x.src.split('/').pop() + (x.paused ? '(停)' : '(播)'))")
    check("4 按下一站自動接著唸，上一站停掉", s["playing"] and "防癌" in (s["stop"] or "") and t[-1].startswith("vo_stop_cancer")
          and t[-1].endswith("(播)") and all(x.endswith("(停)") for x in t[:-1]), (s, t))

    page.click(".tour-voice-btn")
    page.wait_for_timeout(400)
    s = page.evaluate(STATE)
    check("5 再按一下停止", not s["playing"] and s["btn"].startswith("唸給我聽"), s)
    page.click("[data-tour-next]")
    page.wait_for_timeout(1200)
    s = page.evaluate(STATE)
    check("6 自己按停之後，下一站不自動唸", not s["playing"] and "重大疾病" in (s["stop"] or ""), s)

    page.click(".tour-voice-btn")
    page.wait_for_timeout(1200)
    page.evaluate("Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange'));")
    page.wait_for_timeout(400)
    s = page.evaluate(STATE)
    page.evaluate("Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange'));")
    check("7 切到背景（LINE 切聊天室、鎖螢幕）立刻停", not s["playing"] and s["btn"].startswith("唸給我聽"), s)

    page.click("#btn-audio")
    page.wait_for_timeout(300)
    page.click(".tour-voice-btn")
    page.wait_for_timeout(500)
    s = page.evaluate(STATE)
    toast = page.evaluate("[...document.querySelectorAll('.toast, #toast, [class*=toast]')].map(e => e.textContent.trim()).filter(Boolean).join(' / ')")
    check("8 靜音時按唸給我聽：不播、跳提示", not s["playing"] and "靜音" in toast, (s, toast))
    page.click("#btn-audio")
    page.wait_for_timeout(300)

    page.click(".tour-voice-btn")
    page.wait_for_timeout(1500)
    # 正式站要從網路下載，等長度讀到了再跳到結尾（不然會報 non-finite）
    page.wait_for_function(f"(() => {{ const a = {LAST}.pop(); return a && isFinite(a.duration) && a.duration > 0; }})()", timeout=30000)
    page.evaluate(f"(() => {{ const a = {LAST}.pop(); a.currentTime = Math.max(0, a.duration - 0.6); }})()")
    page.wait_for_timeout(2200)
    s = page.evaluate(STATE)
    check("9 自然播完：顯示再聽一次", not s["playing"] and s["btn"].startswith("再聽一次"), s)
    page.click("[data-tour-next]")
    page.wait_for_timeout(1500)
    check("10 播完後按下一站：自動接著唸", page.evaluate(STATE)["playing"], page.evaluate(STATE))

    if page.is_visible("#btn-close-drawer"):
        page.click("#btn-close-drawer")
    else:
        page.evaluate("document.querySelector('[data-close-drawer], .drawer-close')?.click()")
    page.wait_for_timeout(500)
    check("11 關掉抽屜就停", not page.evaluate("SOUND.isVoicePlaying()"), page.evaluate("document.getElementById('side-drawer').className"))

    layout = page.evaluate("""() => ({ overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        topBarH: Math.round(document.querySelector('.float-top-bar').getBoundingClientRect().height) })""")
    check("12 版面：沒有左右溢出、頂部列 ≤ 44px", layout["overflowX"] == 0 and layout["topBarH"] <= 44, layout)
    check("13 Console 0 錯誤、沒有異常回應", not errs and not bad, (errs, bad))
    b.close()

print("網站：", BASE)
code = check.report()
print("音檔請求（只有按過的站才會下載）：", sorted(set(audio_req)))
sys.exit(code)
