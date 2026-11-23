# 專案記憶與開發規範：《儲互社互助島》（cu-mutual-island）

> 最後更新：2026-11-23（Asia/Taipei；線上是 v16 導覽版，含 2026-11-23 內容更新）  
> 線上網址（Cloudflare Workers Static Assets）：`https://cu-mutual-island.rock903400.workers.dev`  
> 最新 Cloudflare 部署版本：`0c59a9ca-dbd1-4074-98c7-39af72bfbcd5`（2026-11-23，幹部路線 3 站；同日稍早的 `9743828e-a03e-4153-8f0e-e5798292808c` 是 4 項確認的內容更新；`115c79c2-77e9-4afe-ba1c-06233d1113bf` 是 2026-11-22 的 v16 首版；v15 為 `6ea2ae8a-182a-4f00-b572-5591feba7cfa`）  
> GitHub 公開儲存庫：`https://github.com/rock903400-byte/cu-mutual-island`（主分支：`main`）  
> 本檔目的：保存本專案的架構設計、8 大互助基金資料原則、多媒體資產規格、雙難度與手機長輩體驗規格、歷史踩坑修復紀錄與部署檢核流程，供後續 AI 助手（Antigravity / Gemini / Claude / Codex）直接接續維護，不需重複摸索或破壞既有體驗。

---

## ⭐ v16 主軸：導覽（2026-11-22 使用者決定）

- **導覽是主線**：島上 8 個基金地標＝8 站（名牌顯示站號 1～8、已逛 ✅、你在這裡 📍）。點地標、按「下一站」或走「我是誰」身分路線（👵 長輩 65+／🧑 上班族青壯／👶 爸媽幫小孩／🎖️ 理監事幹部／✨ 全部逛）逐站看（幹部路線 2026-11-23 起是 3 站：各級幹部 → 社員團體 → 團體意外）；**不計分、不計時、不會答錯**，只記「已逛 N／8 站」。
- **5 個遊戲原封不動放在「🎮 挑戰區」**（幹部訓練、園遊會用）；難度切換只在挑戰區清單與遊戲標題，桌機頂部難度鈕已移除；集章護照移進挑戰區。
- 每站固定結構：一句話＋3 個大數字 →（計畫一次看）→ 👍 適合誰 → 🚫 不適合誰（LP／LS 改標「這些情況不給付／這些股金不算」）→ ⚠️ 要注意 → 🎭 狀況劇 → 🔗 可以搭配（協作線）→ 📄 簡章原文＋完整條款。**不寫「缺點」**；產品內不提任何政治人物或其網站。
- 目前狀態：8 站內容已完成並通過 `tools/check_tour_facts.py`；2026-11-22 第一輪校稿、部署上線。2026-11-23 督導確認 4 項業務事實（見 §0 第 2 點）並寫進畫面，`pendingConfirm` 剩 6 項（都是簡章寫「詳見條款」的細節）；這次修改（`tour_content.js`、`game_content.js` 註解，版號 `?v=17`）已在 2026-11-23 部署；同日幹部路線改成 3 站（`tour_content.js` `?v=18`），也已部署。

## 0. 給後續 Agent 的核心鐵律

1. **原始 7 份協會 PDF 絕對不可異動，且嚴禁推上公開網站／Repo**：
   - 本機根目錄保留 7 份中華民國儲蓄互助協會原始 PDF 簡章作為唯一法規與數據核對依據（見 §2），**禁止修改、重命名或刪除**。
   - `.gitignore` 與 `.assetsignore` 皆已設定排除 `*.pdf`；每次提交 Git 與執行 `wrangler deploy` 前，必須確認零 `.pdf` 與零 `.wrangler/` 外流。
2. **基金規則與數據零幻覺、用語對齊儲互社實務**：
   - 所有承保年齡、最高額度、拒保職業、等待期、給付倍數與 25 日送件規定，**一律以 7 份官方 PDF 為準**。`js/data/funds_data.js`、`js/data/game_content.js` 曾有錯漏（見 §4 第 18 點，v16 已修），新增或修改內容時一律回頭對 PDF，不要互相照抄。
   - 導覽內容在 `js/data/tour_content.js`（下方為**嚴格 JSON**）。改完必跑 `python tools/check_tour_facts.py`，**有錯誤不可部署**；簡章查不到、需要推論的句子放 `pendingConfirm`（畫面不顯示），由督導確認後才可寫進畫面。
   - LP／LS 每位社員最高給付金額在簡章範本是空白（各社自訂）→ 寫「各社不同，以社的證書為準」，不要編數字（依據：協會《貸款安全及人壽儲蓄互助基金管理要點》第三條，保額調整、給付標準依證書辦理）；LS 另寫簡章的 107 年規則（107/1/1 前股金結餘未達 10 萬元者最多累積到 10 萬元）。
   - LP、LS 的互助費由各社繳給協會（同要點第二條「各社繳納之LP及LS互助費」）→ 可以寫「互助費由儲互社繳，社員不用另外繳」，但**不寫「免費」**（核對程式會擋）；其他 5 個團體互助基金是社員自付（《各項團體互助基金成長推廣獎勵措施》第二條）。
   - 不用「投保、保費、投保額度」這類保險用語；不跟商業保險比較。
   - 簡章與協會法規彙編都沒寫的事 → 畫面寫「請先向社裡或協會確認」或「以條款和協會認定為準」，不可自行推論；問過督導、確認後才可寫成明確說法。
   - **督導確認過的業務事實**（2026-11-23；簡章沒寫，可以寫進畫面）：
     - 幹部參加幹部互助基金後，可以同時參加社員團體、團體意外（仍要符合各該互助基金的參加條件，例如年齡）。
     - 松年意外同一次意外住院，「住院日額」和「意外醫療實支實付」可以一起領。
     - 社員團體 C、D 計畫的意外住院就是每天 1,000 元、2,000 元，不會再另外加生病住院日額。
     - 大眾運輸工具指大眾搭乘、有固定路線的交通工具，例如高鐵、火車、客運、渡輪、飛機（陸上、水上與空中的特定事故金額不同）。
   - 統一使用繁體中文與台灣儲蓄互助社用語（互助基金、互助費、社員、加保、續約、股金、備轉金），避免誤導為商業保險保單。
3. **行動優先、LINE 友善與長輩無壓力介面鐵律**：
   - 主要使用情境為**手機（特別是 LINE 內建瀏覽器）社員宣導／園遊會推廣**，其次為桌機與幹部訓練。
   - **手機首屏必須維持極簡單排**：頂部僅留 1 排（`🏝️ 儲互社互助島` ＋ `☀️ 島景` ＋ `🔊`，高度 ≤ 44px）；「我是誰」身分路線按鈕（`.stage-chip[data-stage]`，key：`all/senior/adult/kids/officer`）在手機收進 `☀️ 島景` 彈窗、桌機在底部；彈窗打開時頂部列加 `.popover-open` 疊到抽屜上面。
   - 底部按鈕列固定為「🧭 導覽（n／8）｜🔍 查基金｜🎮 挑戰區｜小管家」。
   - 採「全螢幕 3D 微縮島舞台 ＋ 可捲動抽屜（桌機右側 460px／手機底部上滑）」結構，**不可將 3D 畫布與長表單垂直堆疊導致滑不動**。手機導覽用 `#side-drawer.tour-sheet` **半高抽屜**（`top: 38dvh`、不透明底色），上方露出島並用 `ISLAND_3D.setViewInset()` 把目前這站移到可見區；往下捲自動展開成全螢幕、換站回到半高；遊戲維持全高抽屜。桌機抽屜打開時 `body.drawer-open` 讓底部列與頂部列往左讓開。
   - **返回鍵**：抽屜或彈窗打開時 `history.pushState` 一筆，返回鍵依序關彈窗 → 抽屜，不可直接離站；遊戲進行中按返回先確認。
   - **開場短片預設有聲**：先試有聲自動播放；被瀏覽器擋（手機、LINE 幾乎都會擋）就靜音播放並顯示大顆「🔊 點一下開聲音」，點了從頭有聲重播。
   - **挑戰區的雙難度體驗分工不可破壞**：
     - **🌱 輕鬆安心版（長輩友善）**：全面**不限時（無倒數計時）**、單局精簡為 4–5 題（第 4 攤濃縮為 5 個核心人生站＋2 格大字儀表板）、每題必備免費「💡 不確定？問小管家」白話提示鈕。
     - **🔥 幹部魔王版（實務挑戰）**：保留倒數計時、完整 6–11 題／7 階段人生、隱藏提示、動態精算與跨齡保單資格鎖定，每攤達 2★ 解鎖「🔥 魔王赤章」（共 5 枚）。
   - 維持 **18–20px 高對比大字**、固定底部拇指操作列（`#game-bottom-bar`）、答題解析後一律**手動點「下一題 →」**、點擊 📖 翻查圖鑑時**自動暫停計時**、答題中切換難度**必須二次確認防誤觸**。
   - **LINE 內建瀏覽器雙守則**：① 離開頁面／切回聊天室／鎖螢幕時必須立即停止所有音軌與影片；② 戰績卡與路線卡都必須同時輸出為實體 `<img>`（`#share-card-img`、`#route-card-img`）支援長按存圖與轉傳。
4. **快取版本號同步規則**：
   - 修改 `css/styles.css`、`js/**/*.js` 或替換 `assets/audio/*.mp3` 後，必須同步調升 `index.html` 與 `js/core/assets_manifest.js` 對應的 `?v=` 查詢參數，避免手機與 LINE WebView 吃到舊快取。
5. **變更後必做驗證**：
   - 本地與正式環境皆須驗證 **Console 0 Errors**、全部載入中資源為 `200`/`206`、手機 `390×844`（頂部單排無折行、零水平溢出）與桌機雙視窗無破版；若有更新音檔，須實際核對並以 `ffmpeg` 統一響度至約 `-18.5`～`-19 dBFS`。
   - 導覽內容有改動時，`python tools/check_tour_facts.py` 必須「沒有錯誤」。
   - 用 Chrome 擴充功能測 3D 時，背景視窗的動畫會被降到約 1～2 fps，鏡頭飛行要等十幾秒才到位；不要誤判成鏡頭位置寫錯（見 §4 第 15 點）。

---

## 1. 專案目標與設計定位

- **專案名稱**：《儲互社互助島｜8 大互助基金 3D 導覽》（v15 以前叫「3D 微縮遊樂場」）
- **核心定位**：以**「社員宣導／園遊會＋LINE 群組推廣」**為主軸——用 3D 微縮島一站一站帶社員看懂每個互助基金「適合誰、不適合誰、要注意什麼」，配合狀況劇；遊戲退到「🎮 挑戰區」，以「🔥 幹部魔王版」兼顧理監事與員工實務訓練。
- **為什麼改**：原本 5 攤裡有 3 攤是社務人員視角（核保、25 號送件、理賠精算），長輩要靠輕鬆版補救；社員真正想知道的是能不能保、繳多少、能領多少、什麼情況不給付。
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

### 公開部署檔案（v16 新增 `js/data/tour_content.js`、`js/tour/tour.js`；資源快取版號 `?v=16`，2026-11-23 起 `tour_content.js` 為 `?v=18`、`game_content.js` 為 `?v=17`）

- `index.html`：主頁面；開場 Veo 短片預設有聲（被擋改靜音＋`#btn-intro-unmute`）；極簡頂部單排 HUD（品牌＋`☀️ 島景`＋音量，桌機難度鈕已移除）；底部「🧭 導覽｜🔍 查基金｜🎮 挑戰區｜小管家」；新手引導泡泡（沒逛過才出現）；身分路線按鈕；460px 側／底抽屜（`#drawer-explore` 底部有 `#tour-bottom-bar`、標題列有 ⤢ 展開鈕）；圖鑑、護照戰績卡、路線卡 `#modal-route-card`、結算彈窗。
- `css/styles.css`（`?v=16`）：v15 全部樣式＋檔尾「v16 互助島導覽」區塊（半高抽屜、站卡大字、身分按鈕、計畫表、關鍵字按鈕、搜尋結果、上一站／下一站列、開聲音按鈕）。
- `js/data/`：
  - `tour_content.js`（`?v=18`，**嚴格 JSON**）：站序 `order`、身分路線 `personas`、關鍵字 `searchChips`、8 站 `stops`（oneLiner、keyNumbers、plans、suits、notFor／notForTitle、cautions、personaNotes、stories、pairs、quotes、pendingConfirm）。
  - `funds_data.js`（`?v=16`）：8 大互助基金條款整理（圖鑑與站卡「完整條款」用；v16 補上幹部 A1 手術津貼 2,500）。
  - `game_content.js`（`?v=17`；v16 校正第 4 攤理賠算式等錯誤，見 §4 第 18 點）：擴充題庫（第 1 攤 24 題、第 2 攤 14 題附 3 項診斷矩陣、第 3 攤 10 經典題附紅旗線索＋`buildDynamicDetectiveCases()` 動態隨機試算、第 4 攤 7 階段雙風險事件與跨齡保單延續條件、第 5 攤 11 題＋`buildDynamicCounterQuestions()` 25 號櫃檯實戰）＋ `easyHints` / `getEasyHint()` 長輩白話提示庫。
- `js/core/`：
  - `assets_manifest.js`（`?v=15`）：讀取 `assets/manifest.json?v=14`（共 20 個音檔槽位，含 10 句媠聲台語彩蛋；日夜配樂為 `?v=3`）。
  - `sound.js`（`?v=15`）：Web Audio 音效（含 `whoosh`、`clueFound`、`spinTick`、`confetti`）＋ 日夜配樂平滑交叉淡入淡出（`fadingOutAudios`）＋ 智慧語音閃避 ＋ `playReaction()` 多口氣輪播避免重複聽膩 ＋ **LINE WebView／行動裝置背景切離生命週期防護**（監聽 `visibilitychange`、`pagehide`、`beforeunload`、`blur`、`focus`、`pageshow`，離頁即停音並釋放、回前景平滑淡入恢復）。
  - `storage.js`（`?v=16`）：本機 `localStorage`（key `cu_mutual_carnival_v1`）雙軌進度（**15 金星 ★ ＋ 5 枚🔥幹部魔王赤章**）、6 級稱號、10 枚成就勳章，v16 加 `tour:{visited, persona, guideDismissed}`（`markVisited／getTour／setPersona／dismissGuide`；舊存檔自動補預設）；`resetAll()` 只清挑戰區、保留導覽紀錄。
  - `handbook.js`（`?v=16`）：📖 8 大基金速查圖鑑；共用模板 `renderFundDoc(f)`、`escapeHtml()`；搜尋也會搜導覽內容。
  - `sound.js` v16 加 `releaseVideoHold()`（短片靜音播完時解除「影片播放中」狀態）。
  - `share_card.js`（`?v=15`）：Canvas `900×1200` 高畫質「🏝️ 儲互社互助島」戰績卡（呈現 15★＋5🔥魔王赤章＋每攤魔王緞帶），內建經 OpenCV 實掃驗證的 **33×33 原生 QR Code**（`https://cu-mutual-island.rock903400.workers.dev`），同步鏡像輸出至 `<img id="share-card-img">` 支援 LINE 長按存圖，並實作 `shareToLine()`（手機 Web Share API 原生分享／桌機自動下載 PNG 並複製文案）。v16 另加「我的互助島路線卡」`renderRoute／downloadRoute／shareRoute`（`#route-card-canvas`→`#route-card-img`，不計分）；護照戰績卡的 `render()` 維持原樣。
- `js/tour/tour.js`（`?v=16`）：`window.TOUR`——導覽首頁（身分大按鈕、路線、關鍵字、8 站清單）、站卡、上一站／下一站／逛完畫面、查基金搜尋、路線卡、半高抽屜與 `setViewInset` 鏡頭偏移、3D 名牌同步；呼叫 `ISLAND_3D` 一律先判斷是否存在。
- `js/games/`（`?v=16`，玩法不變；v16 起從「🎮 挑戰區」進入；第 3 攤動態題改成先洗牌、第 5 攤小抄不寫「25 日(含)」）：
  - `game1_swipe.js`（核保快刷亭：飛卡蓋章震動＋3 連擊彩帶；輕鬆版不限時 5 題附免費提示／魔王版 80s 10 題）
  - `game2_clinic.js`（互助配對診所：問診 3 條件 ✅/❌ 處方核對回饋；輕鬆版 5 題附免費提示／魔王版 7 題隱藏細項）
  - `game3_detective.js`（理賠神算偵探社：時間軸點紅旗線索賺 `+30` 眼力分解鎖公式＋動態隨機數字；輕鬆版 4 題附白話幫算提示／魔王版 6 題）
  - `game4_life85.js`（85 歲人生摩天輪：真・SVG 旋轉命運輪盤＋撥片音效＋風險雷達＋跨齡保單資格鎖定如 63 歲未續防癌一鎖定 72 歲計畫三、72 歲未保松年鎖定 82 歲續約、63 歲退股拉低 LS 100% 水位；輕鬆版 5 核心站＋2 格大字儀表板＋免費建議／魔王版完整 7 站＋4 格儀表板）
  - `game5_calendar.js`（25 號送件大亂鬥：信封滑入＆投遞動畫＋可折疊開保月口訣小抄＋25 號櫃檯實戰題；輕鬆版不限時 5 封附提示／魔王版 85s 11 封含年度最後截止日）
- `js/app.js`（`?v=16`）：全站狀態控制；`openFundCard／openHubInfo` 轉給 TOUR；`setStageFilterUI()` 同步兩組身分按鈕與說明列；挑戰區清單（難度條、護照入口）；遊戲中切換難度二次確認；返回鍵層級管理（`LAYER_IDS`＋`MutationObserver`＋`popstate`）；開場短片有聲／開聲音按鈕；`file://` 與 3D 失敗時的 2D 導覽（8 站＋挑戰區）。
- `js/scene/island3d.js`（`?v=16`，module）：Three.js 19 格微縮島、GPU 波浪、手機陰影降載；**導覽站名牌**（站號 1～8、已逛 ✅、你在這裡 📍，`roundRectPath` 畫圓角）＋未逛站呼吸光圈；遊戲名牌降為白牌「🎮 名稱 ★」；`focusById(id, onArrive, {distance})`、`setActiveStop`、`setTourLinks`、`syncTour`、`setViewInset`（`camera.setViewOffset` 平滑偏移）、`setStageFilter(key, ids)`；`pulseBooth`、`triggerFireworks`、熱氣球彩蛋照舊。module 載入失敗由 `onerror` 切 2D。
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
  - `check_tour_facts.py`（v16：核對導覽內容的數字與簡章引述，只讀本機 PDF，不寫任何檔案；有錯誤時 exit 1。產品與公開文件的禁用名稱清單放在本機 `tools/brand_words.local.txt`（`*.local.txt` 已列入 `.gitignore`），名稱本身不寫進公開 repo；清單不見時只會提醒、略過該項檢查）

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
12. **`file://` 雙擊相容**：保留 `start_game.bat`（起 `127.0.0.1:8765`）與 2D 離線降級介面（v16 起列 8 站＋導覽首頁＋挑戰區）。
13. **舊 iPhone 沒有 `ctx.roundRect`（v16 已修）**：iOS 16 以前的 Safari 沒有這個 Canvas 指令，名牌一畫就丟錯，整座 3D 島載不出來 → 一律用 `roundRectPath()`（`share_card.js` 也是自己畫的 `drawRoundRect`）。
14. **手機返回鍵直接離站（v16 已修）**：原本沒有任何 history 處理 → 抽屜／彈窗打開時 `pushState`，返回鍵依序關彈窗 → 抽屜；畫面按鈕關掉最後一層時 `history.back()` 並忽略下一次 popstate。開場短片不納入（自動開啟、沒有使用者手勢）。
15. **用 Chrome 擴充功能測 3D 會誤判鏡頭**：背景視窗的 `requestAnimationFrame` 被降到約 1.5 fps，鏡頭飛行與畫面偏移要十幾秒才到位；截圖前多等、或用 `performance` 量 fps，不要以為鏡頭算錯。另外 Chrome 視窗縮不到 390px 寬時，用同源頁面內嵌 `390×844` iframe（`transform: scale()`）模擬手機。
16. **半高抽屜蓋住島景彈窗（v16 已修）**：`.float-top-bar` 自成堆疊層（z-index 20），彈窗再高也會在抽屜（40）下面 → 彈窗打開時頂部列加 `.popover-open`（z-index 50）。
17. **有聲自動播放會被擋**：手機、LINE、首次造訪的 Chrome 都不准未互動就出聲 → 先試有聲、失敗改靜音＋大顆開聲音鈕；靜音播完要 `SOUND.releaseVideoHold()`，不然背景音樂永遠不會開始。Chrome 一旦在該網站被點過，之後就會放行有聲播放，測「被擋」情境要換一個沒點過的網址（例如 `localhost` 對 `127.0.0.1`）。
18. **既有資料的錯漏（v16 盤點，2026-11-22 已修正）**：
    - 第 4 攤 lifeStages 理賠金額亂寫：「疾病住院 1,000×8 天守住 20,000 元」（實為 8,000）、「手術 6 萬＋2,000×5 天守住 26,000 元」（實為 7 萬）、重大疾病寫「一次給付 15 萬」卻只守住 25,000／45,000、幹部 A2 算成 24,000（實為 20,000）、松年實支實付超過每一事故 1 萬上限等 → 全部改成照簡章算，**算式寫進 hitText，`shieldGain` 等於算出來的給付**（重大疾病 15 萬就是 150000）。
    - 第 4 攤原本寫「住院日額＋實支實付一起領」：當時簡章查不到能不能併領 → 改成不把兩項寫在同一次事故的情境。2026-11-23 督導確認可以一起領（見 §0 第 2 點），現有題目不用改回；之後新出的題目可以寫兩項一起領。
    - 第 4 攤一次存 4,000～9,000 元股金沒套用「每月最多算 3,000 元」→ 選項改成「分月存」。
    - 第 2 攤 cl7、cl9 年齡前後矛盾（71 歲／剛滿 70 歲、46 歲／剛滿 45 足歲）→ 統一。
    - 第 3 攤：`game3_detective.js` 動態題沒洗牌就取前幾題，LS 退股題永遠不會出現 → 先洗牌；LS 動態題補存金額不可等於退股金額（否則兩個錯誤選項金額重複）。
    - 第 5 攤：簡章只寫「每月 25 日前」，沒寫 25 日當天算不算 → 不寫「(含)」，動態題不出 25 日。
    - `funds_data.js` 幹部 A1 漏「意外傷害住院手術津貼 2,500 元」→ 已補。
    - 驗算方式：用 Node 載入 `game_content.js`，自動驗算第 4 攤每個「a×b＝c」「共 N 元」與 `shieldGain`，並把動態題各跑 2,000 次檢查有沒有重複選項。
19. **部署與正式站測試的三個誤報**：
    - `wrangler whoami`／`deploy` 出現 `Not logged in`，但前面有 `UND_ERR_CONNECT_TIMEOUT`：是換新登入憑證時連 Cloudflare 太慢（這台電腦連線常要 4～9 秒，wrangler 10 秒就放棄），**重試一次通常就好**，不一定要重新 `wrangler login`。
    - `wrangler deploy --dry-run` 顯示「Read 328 files」：這個數字把 `.git` 內部檔案和資料夾都算進去，不是上傳數；要確認排除清單，用 `WRANGLER_LOG=debug wrangler deploy --dry-run` 看「Ignoring asset」行（實際上傳約 50 個檔）。
    - 正式站的 404 是空白頁，Chrome 把它當錯誤頁、不能讀 `localStorage`；要在正式站測試又不弄亂使用者的瀏覽紀錄，就在首頁一載入先記下 `cu_mutual_carnival_v1`，測完寫回（`storage.js` 只在操作時存檔，不會在關頁時覆蓋）。

---

## 5. GitHub 與 Cloudflare 標準更新／部署流程

### 本機開發預覽
```powershell
python -m http.server 8765 --bind 127.0.0.1
# 開啟 http://127.0.0.1:8765/
```

### 部署前：核對導覽內容（必須「沒有錯誤」）
```powershell
python tools/check_tour_facts.py
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
- [x] v16 主軸改導覽：8 站白話內容、身分路線、協作線、查基金搜尋、路線卡、返回鍵、開場短片預設有聲。
- [x] 第一輪校稿（2026-11-22）：LP／LS 最高給付寫法、LS 互助費由社繳、社員團體 E 計畫給付項目、重大疾病 65～70 歲照簡章原文、幹部併保改「請先確認」；`pendingConfirm` 15 項 → 10 項。
- [x] v16 部署上線（2026-11-22，版本 `115c79c2-77e9-4afe-ba1c-06233d1113bf`）。
- [x] 督導確認 4 項並寫進畫面（2026-11-23）：幹部可以同時參加社員團體、團體意外；松年住院日額和實支實付可以一起領；C、D 意外住院不再加生病住院日額；大眾運輸工具的範圍。`pendingConfirm` 10 項 → 6 項。已部署（版本 `9743828e-a03e-4153-8f0e-e5798292808c`）。
- [x] 幹部路線加入社員團體、團體意外，從 1 站變 3 站（2026-11-23，已部署，版本 `0c59a9ca-dbd1-4074-98c7-39af72bfbcd5`）。
- [ ] 剩下 6 項 `pendingConfirm`（都是簡章寫「詳見條款」的細節）由督導決定是否再問協會；回覆後改成明確寫法再部署。
- [ ] 每站語音導覽（國語 Edge-TTS／台語媠聲，`ffmpeg` 調到約 `-18.5 dBFS`），manifest 新增 `vo_stop_<id>`。
- [ ] 小管家角色在島上走到目前這站（沿用島民走路動畫）。
- [x] 修正 §4 第 18 點的遊戲題庫與 `funds_data.js` 錯漏（2026-11-22）。
- [ ] 於 `index.html` 加入 Open Graph（`og:url`、`og:title`、`og:description`、`og:image`）與 `theme-color`，強化 LINE 群組轉貼連結時的縮圖預覽卡片。
- [ ] 透過 `cu-portal-manager` 技能將《儲互社互助島》掛載至「儲互社督導管理入口網（`cu-board-info-site`）」。
- [ ] 若未來需要各儲互社積分榮譽榜或使用統計，因已採用 Cloudflare Workers Static Assets，可直接於同專案綁定 Cloudflare D1 或 Web Analytics 擴充。
- [ ] 若未來有線下園遊會大量發放需求，可另輸出獨立高解析 QR Code 海報圖或加上「現場兌獎通關券」時間戳記畫面。
