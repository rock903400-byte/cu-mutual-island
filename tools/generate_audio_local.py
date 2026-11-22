"""
本機快速產出台灣國語＋台語金句彩蛋語音檔 (Edge-TTS zh-TW)
執行後直接寫入 assets/audio/*.mp3，網頁遊戲會自動偵測並啟用語音！
"""
import asyncio
import os
import edge_tts

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

CLIPS = [
    ("vo_welcome.mp3", "zh-TW-HsiaoChenNeural", "+5%", "歡迎來到儲互社互助遊樂場！忘記條款隨時點右上角速查圖鑑偷看喔！"),
    ("vo_taigi_good.mp3", "zh-TW-HsiaoChenNeural", "+10%", "水啦！答對了，你真內行喔！"),
    ("vo_taigi_reject.mp3", "zh-TW-YunJheNeural", "+8%", "母湯喔！再仔細看一下互助基金條款啦！"),
    ("vo_taigi_tamer.mp3", "zh-TW-YunJheNeural", "+8%", "母湯喔！馬戲團馴獸師在不承保職業黑名單啦！"),
    ("vo_victory.mp3", "zh-TW-HsiaoChenNeural", "+8%", "太厲害了！恭喜集章過關，快去集章護照下載你的戰績卡吧！"),
    ("vo_booth_1.mp3", "zh-TW-HsiaoChenNeural", "+6%", "歡迎來到核保快刷亭！左右滑動蓋下核准或退件大印章！"),
    ("vo_booth_2.mp3", "zh-TW-HsiaoChenNeural", "+6%", "歡迎光臨互助配對診所！幫每一位社員挑出最暖心的保障方案吧！"),
    ("vo_booth_3.mp3", "zh-TW-YunJheNeural", "+4%", "理賠神算偵探社開張！快翻開卷宗，算準每一筆互助給付金！"),
    ("vo_booth_4.mp3", "zh-TW-HsiaoChenNeural", "+6%", "搭上八十五歲人生摩天輪！從零歲到八十五歲，用互助基金守護全家！"),
    ("vo_booth_5.mp3", "zh-TW-YunJheNeural", "+8%", "二十五號送件大亂鬥！趕在截止日前把信封投進正確月份的郵筒！"),
]


async def main():
    for filename, voice, rate, text in CLIPS:
        out_path = os.path.join(OUT_DIR, filename)
        comm = edge_tts.Communicate(text=text, voice=voice, rate=rate)
        await comm.save(out_path)
        print(f"Generated: {out_path}")


if __name__ == "__main__":
    asyncio.run(main())
