# 🎬 Google Flow Veo 3.1 微縮短片生成清單（已對齊 v7 日系建築微縮模型《儲互社互助島》）

本專案的 10 張角色立繪已經全部完成並放入 `assets/images/*.jpg`！
Google Flow 最值回票價的是這 **2 支 Veo 3.1 電影級微縮短片**——存檔後把 `assets/manifest.json` 對應的 `"intro": true` / `"victory": true` 打開，重整網頁即自動播放！

---

## 1️⃣ 開場微縮飛行短片（2026-11-24 第二版提示詞）
- **為什麼改**：第一版提示詞生成的影片，第 5.1 秒起高鐵中段長出第二個車頭、一台變兩台（見 `AGENTS.md` §4 第 23 點）。第二版把列車寫死：只有一台、3 節車廂、兩頭都有車頭、整段慢慢開而且一直留在畫面裡；鏡頭只慢慢往前推。
- **2026-11-24 實際結果**：用這段提示詞生成 4 支，網站採用 `Omni 1.2 Flash`｜720p｜8 秒｜16:9 的第 1 支（列車就是 3 節、從頭到尾同一台）。同一段丟給 `Veo 3.1 - Lite`，列車還是很長一串，其中一支開著開著從 4 節變 6 節。下次重做建議直接用 `Omni 1.2 Flash`（`Veo 3.1` 的 Fast／Quality 會在 2026-12-05 停用）。
- **下載**：每組結果右邊的「批次下載」會存成 zip 到「下載」資料夾；交給 AI 逐格檢查沒問題後才換進 `assets\videos\intro_carnival.mp4`（不要直接蓋掉；換完把 `js/core/assets_manifest.js` 影片網址的 `?v=` 加 1）。做法見 `AGENTS.md` §4 第 23 點。
- **Prompt（直接複製貼上）**：
> Slow, steady cinematic tilt-shift drone shot with a very gentle push-in over a handcrafted architectural miniature diorama island on a calm, muted teal sea. Sage-green low-poly hills dotted with pine trees, tiny satellite islets with slowly spinning white wind turbines and a red-and-white striped lighthouse. Cream-and-sage hexagonal city blocks with tiny pitched-roof houses, a delicate rainbow ferris wheel and a red-and-white carnival tent. A curved white elevated viaduct crosses the island. On the viaduct runs exactly one short miniature Taiwan high-speed rail bullet train: three white cars with an orange stripe and a streamlined nose at each end. It is one solid model train that keeps the same length and stays in one piece from the first frame to the last. It glides slowly in one direction along the middle of the viaduct and stays fully visible in the frame for the whole shot. It is the only train in the scene. Warm golden afternoon sunlight, ultra-clean miniature model photography, shallow tilt-shift depth of field, no text or logos. Audio: gentle, cheerful instrumental music-box melody with soft sea waves, no voices.

- **第一版提示詞**（2026-11-21，留作紀錄，不要再用）：
> Slow cinematic telephoto tilt-shift drone flyover of a handcrafted Japanese architectural miniature diorama island floating on a calm muted Nordic teal sea, surrounded by gentle sage-green low-poly Taiwanese hills dotted with pine trees and tiny circular satellite islets with spinning white wind turbines and a red-and-white striped lighthouse; 19 cream-and-sage hexagonal city blocks featuring tiny pitched-roof houses, a delicate rainbow ferris wheel, a red-and-white carnival tent, a curved white elevated viaduct where a miniature white-and-orange Taiwan high-speed rail bullet train glides smoothly across, warm golden afternoon sunlight, ultra-clean stop-motion miniature model photography aesthetic, shallow tilt-shift depth of field, zero text or logos

---

## 2️⃣ 滿星 3★ 星空煙火慶祝短片
- **存檔路徑**：`C:\Users\user\Desktop\github 2\互助基金\assets\videos\victory_fireworks.mp4`
- **模型／比例／長度**：`Veo 3.1 Lite`｜`16:9`｜`4s`
- **Prompt（直接複製貼上）**：
> Joyful twilight-to-starry-night tilt-shift miniature diorama shot looking across a tiny floating hexagonal Taiwanese island city on calm deep-blue water; dozens of tiny architectural buildings glow with warm amber windows, a miniature ferris wheel lights up softly, and sparkling golden, coral-red, and mint-green celebratory fireworks bloom gently in the starry night sky reflecting shimmering light across the sea, cozy warm uplifting finale, handcrafted architectural model aesthetic, zero text or logos
