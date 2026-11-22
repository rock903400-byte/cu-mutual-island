# 專案記憶與開發規範：《儲互社互助島》（cu-mutual-island）

> 最後更新：2026-11-22（Asia/Taipei，v15 線上版已部署）  
> 線上網址（Cloudflare Workers Static Assets）：`https://cu-mutual-island.rock903400.workers.dev`  
> 最新 Cloudflare 部署版本：`6ea2ae8a-182a-4f00-b572-5591feba7cfa`  
> GitHub 公開儲存庫：`https://github.com/rock903400-byte/cu-mutual-island`（主分支：`main`）  
> 本檔目的：保存本專案的架構設計、8 大互助基金資料原則、多媒體資產規格、雙難度與手機長輩體驗規格、歷史踩坑修復紀錄與部署檢核流程，供後續 AI 助手（Antigravity / Gemini / Claude / Codex）直接接續維護，不需重複摸索或破壞既有體驗。

---

## 0. 給後續 Agent 的核心鐵律

1. **原始 7 份協會 PDF 絕對不可異動，且嚴禁推上公開網站／Repo**：
   - 本機根目錄保留 7 份中華民國儲蓄互助協會原始 PDF 簡章作為唯一法規與數據核對依據（見 §2），**禁止修改、重命名或刪除**。
   - `.gitignore` 與 `.assetsignore` 皆已設定排除 `*.pdf`；每次提交 Git 與執行 `wrangler deploy` 前，必須確認零 `.pdf` 與零 `.wrangler/` 外流。
2. **基金規則與數據零幻覺、用語對齊儲互社實務**：
   - 所有承保年齡、最高額度、職業類別（第 1～4 類與拒保職業）、等待期、給付倍數與 25 日送件規定，均以 7 份官方 PDF 與已校對的 `js/data/funds_data.js`、`js/data/game_content.js` 為準，不得自行憑印象編造。
   - 統一使用繁體中文與台灣儲蓄互助社用語（互助基金、互助費、社員、加保、續約、股金、備轉金），避免誤導為商業保險保單。
3. **行動優先、LINE 友善與長輩無壓力介面鐵律**：
   - 主要使用情境為**手機（特別是 LINE 內建瀏覽器）社員宣導／園遊會推廣**，其次為桌機與幹部訓練。
   - **手機首屏必須維持極簡單排**：頂部僅留 1 排（`🏝️ 儲互社互助島` ＋ `☀️ 島景` ＋ `🔊`，高度 ≤ 44px），「輕鬆／魔王」切換放進 5 大攤位頁與遊戲內標題；生命時期濾鏡在手機端收進 `☀️ 島景` 折疊彈窗（桌機維持底部展開），把最大畫面還給 3D 微縮島。
   - 採「全螢幕 3D 微縮島舞台 ＋ 可捲動抽屜（桌機右側 460px／手機底部上滑）」結構，**不可將 3D 畫布與長表單垂直堆疊導致滑不動**。
   - **雙難度體驗分工不可破壞**：
     - **🌱 輕鬆安心版（長輩友善）**：全面**不限時（無倒數計時）**、單局精簡為 4–5 題（第 4 攤濃縮為 5 個核心人生站＋2 格大字儀表板）、每題必備免費「💡 不確定？問小管家」白話提示鈕。
     - **🔥 幹部魔王版（實務挑戰）**：保留倒數計時、完整 6–11 題／7 階段人生、隱藏提示、動態精算與跨齡保單資格鎖定，每攤達 2★ 解鎖「🔥 魔王赤章」（共 5 枚）。
   - 維持 **18–20px 高對比大字**、固定底部拇指操作列（`#game-bottom-bar`）、答題解析後一律**手動點「下一題 →」**、點擊 📖 翻查圖鑑時**自動暫停計時**、答題中切換難度**必須二次確認防誤觸**。
   - **LINE 內建瀏覽器雙守則**：① 離開頁面／切回聊天室／鎖螢幕時必須立即停止所有音軌與影片；② 戰績卡必須同時輸出為實體 `<img id="share-card-img">` 支援長按存圖與轉傳。
4. **快取版本號同步規則**：
   - 修改 `css/styles.css`、`js/**/*.js` 或替換 `assets/audio/*.mp3` 後，必須同步調升 `index.html` 與 `js/core/assets_manifest.js` 對應的 `?v=` 查詢參數，避免手機與 LINE WebView 吃到舊快取。
5. **變更後必做驗證**：
   - 本地與正式環境皆須驗證 **Console 0 Errors**、全部載入中資源為 `200`/`206`、手機 `390×844`（頂部單排無折行、零水平溢出）與桌機雙視窗無破版；若有更新音檔，須實際核對並以 `ffmpeg` 統一響度至約 `-18.5`～`-19 dBFS`。

---

## 1. 專案目標與設計定位

- **專案名稱**：《儲互社互助島｜8 大互助基金 3D 微縮遊樂場》
- **核心定位**：雙軌並進，以**「社員宣導／園遊會線下活動＋LINE 群組自主推廣」**為主軸（好玩、長輩零迷路、好分享），並以「🔥 幹部魔王版」兼顧理監事與員工實務訓練深度。
- **技術形態**：100% 純前端零後端靜態網站（HTML + CSS + Vanilla JS + Three.js ESM via jsDelivr CDN），不需建置工具與後端維護，直接由 Cloudflare Workers Static Assets 託管。
- **視覺與互動特色**：19 格《卡坦島》建築微縮模型 3D 島（莫蘭迪色系、29° 移軸鏡頭、高鐵高架橋、航行帆船、30+ 島民、4 段日夜光影＋窗燈＋螢火蟲），並與遊戲進度即時連動——過關點亮攤位星等名牌與金星水晶、綻放 3D 慶祝煙火，5 攤全通關解鎖天空雙座熱氣球彩蛋。

---

## 2. 8 大互助基金與本機 7 份官方參考 PDF（不進 Git／不部署）

| 編號 | 互助基金項目 | 對應本機原始參考 PDF（僅本機離線留存） |
| --- | --- | --- |
| 1–2 | 貸款安全（LP）、人壽儲蓄（LS） | `LPLS互助基金(112年版)範本.pdf` |
| 3 | 社員團體互助基金（A~F） | `社員團體互助金內容簡介.pdf` |
| 4 | 團體意外互助基金（1~4 類） | `114年度意外互助基金內容簡介.pdf` |
| 5 | 松年意外互助基金（最高至 85 歲） | `松年意外互助基金內容簡介114.pdf` |
| 6 | 防癌互助基金（1~3） | `防癌互助基金內容簡介114.pdf` |
| 7 | 重大疾病互助基金（7 大項） | `重大疾病互助基金內容簡介.pdf` |
| 8 | 各級幹部互助基金（A1~A3） | `幹部互助基金內容簡介112.pdf` |

---

## 3. 檔案結構與關鍵模組版本

### 公開部署檔案（48 個靜態檔，總計約 13.63 MB；目前資源快取版號 `?v=15`）

- `index.html`：主頁面、保留進站自動播放 Veo 電影開場短片；登島後為極簡頂部單排 HUD（手機僅品牌＋`☀️ 島景` 折疊彈窗＋音量；桌機另顯示難度切換）、0 星新手引導氣泡、460px 側／底抽屜、速查圖鑑、雙軌護照與實體 `<img>` 戰績卡、4 鈕結算慶祝彈窗（下一攤／再玩／戰績卡／看煙火）。
- `css/styles.css`（`?v=15`）：行動極簡單排響應式排版、折疊場景彈窗、小管家提示卡、5 大攤位專屬互動動畫（印章重壓、飛卡、紙花、診斷核對燈、偵探紅旗高亮、SVG 轉盤、信封滑入投遞）與大字高對比樣式。
- `js/data/`：
  - `funds_data.js`（`?v=15`）：8 大互助基金完整權威欄位資料。
  - `game_content.js`（`?v=15`）：擴充題庫（第 1 攤 24 題、第 2 攤 14 題附 3 項診斷矩陣、第 3 攤 10 經典題附紅旗線索＋`buildDynamicDetectiveCases()` 動態隨機試算、第 4 攤 7 階段雙風險事件與跨齡保單延續條件、第 5 攤 11 題＋`buildDynamicCounterQuestions()` 25 號櫃檯實戰）＋ `easyHints` / `getEasyHint()` 長輩白話提示庫。
- `js/core/`：
  - `assets_manifest.js`（`?v=15`）：讀取 `assets/manifest.json?v=14`（共 20 個音檔槽位，含 10 句媠聲台語彩蛋；日夜配樂為 `?v=3`）。
  - `sound.js`（`?v=15`）：Web Audio 音效（含 `whoosh`、`clueFound`、`spinTick`、`confetti`）＋ 日夜配樂平滑交叉淡入淡出（`fadingOutAudios`）＋ 智慧語音閃避 ＋ `playReaction()` 多口氣輪播避免重複聽膩 ＋ **LINE WebView／行動裝置背景切離生命週期防護**（監聽 `visibilitychange`、`pagehide`、`beforeunload`、`blur`、`focus`、`pageshow`，離頁即停音並釋放、回前景平滑淡入恢復）。
  - `storage.js`（`?v=15`）：本機 `localStorage` 雙軌進度（**15 金星 ★ ＋ 5 枚🔥幹部魔王赤章**）、無雙大督導等 6 級稱號、**10 枚成就勳章**（已補齊第 2 攤 `clinic_doctor` 與 `hard_all_5`）與 `getIslandProgress()` 供 3D 島即時連動。
  - `handbook.js`（`?v=15`）：📖 8 大基金速查圖鑑（關鍵字即時搜尋＋分類頁籤）。
  - `share_card.js`（`?v=15`）：Canvas `900×1200` 高畫質「🏝️ 儲互社互助島」戰績卡（呈現 15★＋5🔥魔王赤章＋每攤魔王緞帶），內建經 OpenCV 實掃驗證的 **33×33 原生 QR Code**（`https://cu-mutual-island.rock903400.workers.dev`），同步鏡像輸出至 `<img id="share-card-img">` 支援 LINE 長按存圖，並實作 `shareToLine()`（手機 Web Share API 原生分享／桌機自動下載 PNG 並複製文案）。
- `js/games/`（皆 `?v=15`）：
  - `game1_swipe.js`（核保快刷亭：飛卡蓋章震動＋3 連擊彩帶；輕鬆版不限時 5 題附免費提示／魔王版 80s 10 題）
  - `game2_clinic.js`（互助配對診所：問診 3 條件 ✅/❌ 處方核對回饋；輕鬆版 5 題附免費提示／魔王版 7 題隱藏細項）
  - `game3_detective.js`（理賠神算偵探社：時間軸點紅旗線索賺 `+30` 眼力分解鎖公式＋動態隨機數字；輕鬆版 4 題附白話幫算提示／魔王版 6 題）
  - `game4_life85.js`（85 歲人生摩天輪：真・SVG 旋轉命運輪盤＋撥片音效＋風險雷達＋跨齡保單資格鎖定如 63 歲未續防癌一鎖定 72 歲計畫三、72 歲未保松年鎖定 82 歲續約、63 歲退股拉低 LS 100% 水位；輕鬆版 5 核心站＋2 格大字儀表板＋免費建議／魔王版完整 7 站＋4 格儀表板）
  - `game5_calendar.js`（25 號送件大亂鬥：信封滑入＆投遞動畫＋可折疊開保月口訣小抄＋25 號櫃檯實戰題；輕鬆版不限時 5 封附提示／魔王版 85s 11 封含年度最後截止日）
- `js/app.js`（`?v=15`）：全站狀態控制、折疊 `島景` 彈窗與雙處生命週期濾鏡同步、攤位頁難度切換條、遊戲中切換難度二次確認防呆、過關同步 `ISLAND_3D.syncProgress()` 並於回島觸發 3D 慶祝煙火、`file://` 2D 降級介面。
- `js/scene/island3d.js`（`?v=15`）：Three.js 19 格微縮島 3D 引擎、**GPU 頂點著色器波浪**（取代每幀 CPU 頂點迴圈）、行動裝置 `1024×1024` 陰影降載、紅框遊戲攤位名牌 `01~05`（即時重繪 `★★★`/`🔥魔王`＋未玩呼吸引導光圈＋過關金星水晶）vs 低調白牌基金地標 `06~13`、`pulseBooth()` 答題即時彈跳、`triggerFireworks()` 3D 粒子煙火、全制霸雙座天空熱氣球解鎖。
- `_headers`：Cloudflare Workers Static Assets 快取與安全標頭（`/`、`/index.html`、`/assets/manifest.json` 為 `max-age=0, must-revalidate`；CSS/JS `max-age=3600`；圖片／音檔／影片 `max-age=86400, stale-while-revalidate=604800`；全域 `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`）。

### 多媒體資產清冊（位於 `assets/`，皆已於 `assets/manifest.json` 啟用）

| 類別 | 數量 | 規格與來源 |
| --- | --- | --- |
| 角色立繪 (`assets/images/`) | 10 檔（12 槽位映射） | 黏土微縮風格 JPG（26–40 KB／張），含 `mascot_host.jpg` 與 9 位情境角色 |
| 開場／勝利短片 (`assets/videos/`) | 2 檔 | Google Flow Veo 3.1 Lite 720p 16:9 MP4：`intro_carnival.mp4`（2.82 MB，7.9s）、`victory_fireworks.mp4`（4.26 MB，7.9s） |
| 台灣國語語音 (`assets/audio/vo_*.mp3`) | 7 檔 | Edge-TTS 生成（`tools/generate_audio_local.py`）：開場、勝利、5 大攤位導覽 |
| 道地台灣台語 (`assets/audio/vo_taigi_*.mp3`) | **10 檔** | 意傳科技「媠聲」生成（`tools/generate_taigi_ithuan.py`）：原始 5 句（welcome/good/reject/tamer/victory）＋ v14 新增 5 句（`combo`、`encourage`、`insider`、`spin`、`mail`），全數標準化至 `-17.9`～`-19.4 dBFS`（新 5 句經 `ffmpeg` 調至 `-18.5 dBFS`） |
| 日夜原創純演奏配樂 (`assets/audio/bgm_*.mp3`) | 2 檔 | **Google Flow Music（Lyria 3.5）** 客製純演奏曲，48kHz 128kbps 立體聲 MP3：<br>• `bgm_day.mp3`（*Mutual Island Sunny Day*，2.41 MB，158.13s，`-19.3 dBFS`）<br>• `bgm_night.mp3`（*Mutual Island Starry Night*，2.69 MB，176.02s，`-19.1 dBFS`） |

### 僅保留於 GitHub、排除於 Cloudflare 之工具與設定

- `wrangler.jsonc` / `.assetsignore` / `.gitignore` / `README.md` / `AGENTS.md` / `start_game.bat`
- `tools/`：
  - `generate_audio_local.py`（Edge-TTS 國語語音）
  - `generate_taigi_ithuan.py`（意傳媠聲台語語音，支援跳過已存在檔補錄 10 句）
  - `generate_audio_colab.ipynb`（歷史備存；**已實測捨棄 `musicgen-small`，日後配樂升級請改用 Google Flow Music**）
  - `build_blender_island.py`（選配：日後若匯入 `assets/models/carnival_island.glb` 可自動接管）
  - `google_flow_prompts.md`（視覺與影片提示詞紀錄）

---

## 4. 歷史踩坑與已修復紀錄（切勿重犯）

1. **禁止盲目 `HEAD` 探測不存在素材**：統一讀取單一 `assets/manifest.json` 搭配內嵌 SVG favicon，保持 Console 零 404。
2. **禁止在 Three.js / DOM 唯讀屬性上使用 `Object.assign`**：`Mesh.position` 用 `.position.set(x, y, z)`；`HTMLAudioElement` 自訂追蹤改存於 `audio._trackUrl`。
3. **日夜配樂快速切換殭屍重疊音軌**：`js/core/sound.js` 採 `fadingOutAudios` ＋ `flushFadingAudios()` 徹底清除。
4. **影片與 BGM 打架**：`js/app.js` 統一走 `closeIntroVideo()` 整合 `SOUND.pauseBgmForVideo()` / `SOUND.resumeBgmAfterVideo()`。
5. **LINE 內建瀏覽器跳出頁面後背景音樂續播（v15 已修）**：先前只在備援合成器檢查 `document.hidden`，導致從 LINE 點返回或切聊天室後 `HTMLAudioElement` 仍在背景播音樂 → 已於 `sound.js` v15 補齊 `visibilitychange`、`pagehide`、`beforeunload`、`blur`、`focus`、`pageshow` 六重監聽，離頁立即暫停／釋放 BGM、語音、影片與 `AudioContext`，切回前景時自動平滑淡入恢復。
6. **LINE 內建瀏覽器無法下載或長按 `<canvas>` 戰績卡（v15 已修）**：`share_card.js` 已將 Canvas 即時鏡像輸出至實體 `<img id="share-card-img">`，並保留 Web Share API 一鍵分享，讓長輩在 LINE 裡直接長按圖片即可儲存相簿或轉傳群組。
7. **長輩容易受倒數計時、首屏按鈕過載與難度誤觸勸退（v14–v15 已修）**：
   - 手機首屏頂部濃縮為 1 排（37px），底部移除易截斷的生命週期橫條（收進 `☀️ 島景` 2 欄面板），難度切換移入 5 大攤位頁。
   - 輕鬆版全面改為「不限時、4–5 題、每題附免費『💡 問小管家』白話提示、第 4 攤精簡 5 核心站＋2 格儀表板」，答題中切換難度必彈確認保護。
8. **3D 海面每幀 CPU 2,401 頂點迴圈造成低階手機發熱掉幀（v14 已修）**：已改用 `MeshStandardMaterial.onBeforeCompile` GPU 頂點著色器波浪，且手機版陰影貼圖自動降至 `1024×1024`。
9. **媠聲新錄台語原始音量偏小且連答易聽膩（v14 已修）**：媠聲原始輸出約 `-28`～`-30 dBFS`，每次新錄後**必須**用 `ffmpeg` 標準化至約 `-18.5 dBFS`；並透過 `SOUND.playReaction()` 依連擊與冷卻時間輪播多口氣語音。
10. **配樂來源決策**：淘汰 Colab `musicgen-small`，正式配樂採用 Google Flow Music（Lyria 3.5）純演奏曲。
11. **靜態路由 `not_found_handling`**：`wrangler.jsonc` 維持 `"not_found_handling": "none"`，確保 `.assetsignore` 隔離路徑正確回傳 `404`。
12. **`file://` 雙擊相容**：保留 `start_game.bat`（起 `127.0.0.1:8765`）與 2D 離線降級介面。

---

## 5. GitHub 與 Cloudflare 標準更新／部署流程

### 本機開發預覽
```powershell
python -m http.server 8765 --bind 127.0.0.1
# 開啟 http://127.0.0.1:8765/
```

### 推送 GitHub（確認零 PDF 與零 `.wrangler`）
```powershell
git add -A
git ls-files | Select-String "\.pdf$|\.wrangler"   # 必須無任何輸出
git commit -m "你的更新說明"
git push
```

### 部署 Cloudflare Workers Static Assets
```powershell
wrangler deploy --dry-run   # 驗證設定與 .assetsignore
wrangler deploy             # 正式發佈至 https://cu-mutual-island.rock903400.workers.dev
```

### 上線後必跑檢核（CLI + 瀏覽器）
```powershell
$base = "https://cu-mutual-island.rock903400.workers.dev"
curl.exe -sI "$base/" | Select-String "^HTTP/|^cache-control:|^x-content-type-options:"
curl.exe -sI "$base/assets/manifest.json" | Select-String "^HTTP/|^cache-control:"
curl.exe -sI "$base/wrangler.jsonc" | Select-String "^HTTP/"      # 必須 404
curl.exe -sI "$base/tools/generate_audio_local.py" | Select-String "^HTTP/"  # 必須 404
```
並以 Chrome（含手機 `390×844` 視窗）開啟正式網址確認 **Console 0 Errors**、頂部單排無折行與無破版。

---

## 6. 未來可選擴充清單（目前尚未執行，待使用者需求再啟動）

- [x] 戰績卡內建實掃驗證通過的專屬 QR Code、正名「儲互社互助島」、支援手機 Web Share API 分享與 LINE 長按 `<img>` 存圖。
- [ ] 於 `index.html` 加入 Open Graph（`og:url`、`og:title`、`og:description`、`og:image`）與 `theme-color`，強化 LINE 群組轉貼連結時的縮圖預覽卡片。
- [ ] 透過 `cu-portal-manager` 技能將《儲互社互助島》掛載至「儲互社督導管理入口網（`cu-board-info-site`）」。
- [ ] 若未來需要各儲互社積分榮譽榜或使用統計，因已採用 Cloudflare Workers Static Assets，可直接於同專案綁定 Cloudflare D1 或 Web Analytics 擴充。
- [ ] 若未來有線下園遊會大量發放需求，可另輸出獨立高解析 QR Code 海報圖或加上「現場兌獎通關券」時間戳記畫面。
