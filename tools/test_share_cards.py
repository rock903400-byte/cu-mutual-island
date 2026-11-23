"""戰績卡、路線卡：QR 要掃得出互助島 LINE 入口、說明文字不超出框、分享連結是 LINE 入口（5 項）。

用法（在專案根目錄）：
    python tools/test_share_cards.py          # 本機網站
    python tools/test_share_cards.py --prod   # 正式站（用假的「已經是來福好友」通過守門）
需要 playwright、opencv-python、numpy。全部通過 exit 0。卡片圖存在暫存資料夾 cu_island_tests\\。
"""
import base64
import sys

from playwright.sync_api import sync_playwright

from testkit import FAKE_FRIEND_JS, GL_ARGS, LIFF_URL, PROD, Checks, decode_qr_png, enter_island, serve, shot, watch_errors

PRODMODE = "--prod" in sys.argv
BASE = PROD if PRODMODE else serve()
check = Checks()


def card_qr(page, canvas_id, name):
    png = base64.b64decode(page.evaluate(f"document.getElementById('{canvas_id}').toDataURL('image/png')").split(",", 1)[1])
    open(shot(name), "wb").write(png)
    text = decode_qr_png(png)
    if not text:   # 整張卡掃不到時，只切 QR 那一塊（卡片 900×1200，QR 在左下）
        import cv2
        import numpy as np
        img = cv2.imdecode(np.frombuffer(png, np.uint8), cv2.IMREAD_COLOR)[960:1150, 80:240]
        text = decode_qr_png(cv2.imencode(".png", img)[1].tobytes())
    return text


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, args=GL_ARGS)
    page = b.new_page(viewport={"width": 1280, "height": 900})
    errs, _ = watch_errors(page)
    if PRODMODE:
        page.add_init_script(FAKE_FRIEND_JS)
    page.goto(BASE, wait_until="load")
    enter_island(page, "window.SHARE_CARD && window.TOUR && window.APP")
    check("1 分享連結是互助島的 LINE 入口", page.evaluate("SHARE_CARD.GAME_URL") == LIFF_URL, page.evaluate("SHARE_CARD.GAME_URL"))
    page.evaluate("SHARE_CARD.render()")
    page.wait_for_timeout(600)
    text = card_qr(page, "share-card-canvas", "share_card.png")
    check("2 戰績卡的 QR 實際掃得出 LINE 入口", text == LIFF_URL, text)
    page.evaluate("TOUR.openRouteCard()")
    page.wait_for_timeout(600)
    text = card_qr(page, "route-card-canvas", "route_card.png")
    check("3 路線卡的 QR 實際掃得出 LINE 入口", text == LIFF_URL, text)
    widths = page.evaluate("""() => {
      const c = document.createElement('canvas').getContext('2d');
      c.font = '900 28px "Zen Maru Gothic", "Microsoft JhengHei", sans-serif';
      const share = Math.round(c.measureText('📱 用 LINE 掃碼登島，挑戰我的紀錄！').width);
      c.font = '900 28px "Zen Maru Gothic", "Noto Sans TC", "Microsoft JhengHei", sans-serif';
      return { share, route: Math.round(c.measureText('📱 用 LINE 掃碼一起逛互助島！').width) };
    }""")
    # 文字從 x=248 開始，框的右邊界在 826，留 12px
    check("4 卡片上的說明文字沒有超出框", 248 + widths["share"] <= 814 and 248 + widths["route"] <= 814, widths)
    check("5 Console 0 錯誤", not errs, errs)
    b.close()

print("網站：", BASE)
sys.exit(check.report())
