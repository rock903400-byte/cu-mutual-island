# 專案記憶與開發規範：《儲互社互助島》（cu-mutual-island）

> 最後更新：2026-11-24（Asia/Taipei；線上是 v16 導覽版，含 2026-11-23 內容更新、站卡長輩友善改版、每站語音導覽（Gemini 台灣腔女聲）、進島前先加來福好友；2026-11-24 開場短片換成 Google Flow 重新生成的新片（原片後段高鐵一台變兩台），已部署）  
> 線上網址（Cloudflare Workers Static Assets）：`https://cu-mutual-island.rock903400.workers.dev`  
> 最新 Cloudflare 部署版本：`65578741-322e-4081-826f-ab38afca622b`（2026-11-24，開場短片換成 Google Flow 重新生成的版本）；前一版 `23cb3983-ba76-4f97-a91b-2c196bfc8951`（2026-11-23，分享連結與戰績卡／路線卡 QR 改成互助島 LINE 入口）；同日稍早的 `d778f10a-f8d2-4177-b53a-5e1ce6d5594a` 是進島前先加來福好友，再早的 `51c4db91-7c8a-42d0-9f9e-45dbd233fdf3` 是每站語音導覽（Gemini 女聲 `Sulafat`＋聊天說法），再早的 `492f81e1-17dd-4546-b788-7d587ab7efe5` 是站卡分「第一眼＋看更多」、19 個長句拆短，再早的 `0c59a9ca-dbd1-4074-98c7-39af72bfbcd5` 是幹部路線 3 站，更早的 `9743828e-a03e-4153-8f0e-e5798292808c` 是 4 項確認的內容更新；`115c79c2-77e9-4afe-ba1c-06233d1113bf` 是 2026-11-22 的 v16 首版；v15 為 `6ea2ae8a-182a-4f00-b572-5591feba7cfa`）  
> GitHub 公開儲存庫：`https://github.com/rock903400-byte/cu-mutual-island`（主分支：`main`）  
> 本檔目的：保存本專案的架構設計、8 大互助基金資料原則、多媒體資產規格、雙難度與手機長輩體驗規格、歷史踩坑修復紀錄與部署檢核流程，供後續 AI 助手（Antigravity / Gemini / Claude / Codex）直接接續維護，不需重複摸索或破壞既有體驗。

---

## ⭐ v16 主軸：導覽（2026-11-22 使用者決定）

- **導覽是主線**：島上 8 個基金地標＝8 站（名牌顯示站號 1～8、已逛 ✅、你在這裡 📍）。點地標、按「下一站」或走「我是誰」身分路線（👵 長輩 65+／🧑 上班族青壯／👶 爸媽幫小孩／🎖️ 理監事幹部／✨ 全部逛）逐站看（幹部路線 2026-11-23 起是 3 站：各級幹部 → 社員團體 → 團體意外）；**不計分、不計時、不會答錯**，只記「已逛 N／8 站」。
- **5 個遊戲原封不動放在「🎮 挑戰區」**（幹部訓練、園遊會用）；難度切換只在挑戰區清單與遊戲標題，桌機頂部難度鈕已移除；集章護照移進挑戰區。
- 每站固定結構：一句話＋3 個大數字 →（計畫一次看）→ 👍 適合誰 → 🚫 不適合誰（LP／LS 改標「這些情況不給付／這些股金不算」）→ ⚠️ 要注意 → 🎭 狀況劇 → 🔗 可以搭配（協作線）→ 📄 簡章原文＋完整條款。**不寫「缺點」**；產品內不提任何政治人物或其網站。
- **站卡分兩層（2026-11-23 使用者決定，長輩友善）**：原本每站要在手機滑 5～7 個畫面，改成「先收起來、字不刪」。
  - **第一眼**（不用點）：一句話、3 個大數字、📋 計畫表（收成一顆按鈕）、👍 適合誰、🚫 不適合誰、⚠️ 最要注意（`keyCautions`，跟社員權益最相關的 1～2 條）、🎭 1 個狀況劇（走身分路線時挑 `personas` 標了該身分的那個，沒有就第一個）。
  - **👇 看更多**（一顆大按鈕，底部也有「👆 收起來」）：其他要注意（`cautions`，含每月 25 日前送名冊、受理期限、保障期間、跨社只能選一社等社務手續）、其他狀況劇、🔗 可以搭配。每一站打開都先收起來，不記上一站的展開狀態；桌機也一樣。
  - 從「🔍 查基金」點進某站時，找到的句子如果收在看更多、計畫表或完整條款裡，會自動展開、捲到那句並標黃（`revealMatch`）。
  - 實測（390×844 全螢幕抽屜）：第一眼 3.2～4.2 個畫面（改版前 5.1～7.5）；比原先估的 2.5～3 個多，主要是長句拆成條列後變高。
- **每站語音導覽（2026-11-23 使用者要求「台灣腔」）**：站名下方一顆「🔊 唸給我聽」大按鈕，唸約 1 分鐘的導覽稿（`tour_content.js` 每站的 `voice`，聊天說法、只放少量「喔、啊、啦」）。聲音是 **Google Gemini 語音**（Vertex AI `gemini-3.8-flash-tts`、台灣華語 `cmn-TW`、女聲 `Sulafat`，提示詞交代「台灣人平常的口音、慢慢講給長輩聽、不要播報腔」）。一開始用 Edge-TTS 曉臻 `zh-TW-HsiaoChenNeural`，使用者聽了問「這是台灣腔嗎??」；做了 8 種試聽（微軟 4 種、台語 1 種、Gemini 3 種）比較後，使用者照建議選 Gemini 女聲＋聊天說法。網站開場、挑戰區的 7 句語音還是 Edge 的聲音，要統一先問使用者（要花錢）。按過一次就進入「語音導覽模式」：按下一站／上一站／可以搭配，會自動接著唸；自己按停、靜音、切到背景（LINE 切聊天室、鎖螢幕）、回清單、關抽屜就結束模式。**沒按過不會自己出聲**。音檔只在按下時才下載。
- **進島前先加來福好友（2026-11-23 使用者決定：一打開網站就要先加，跟選罷法、專職研習一樣）**：來福＝LINE 官方帳號 `@721byaqh`「儲蓄互助社｜生活圈」。開場短片照播，短片關掉（或沒有短片）時，LINE 確認不是好友就整頁擋住（沒有關閉鈕，導覽和挑戰區都看不到）；是好友、或 LINE 查不了（出錯、逾時）就直接進島，不會把大家卡在門口。只在正式網址檢查，本機不檢查。網站不存、不傳任何 LINE 個人資料（只看 `getFriendship()` 的 `friendFlag`）。
  - 互助島專用 LINE 入口：LIFF `2009715141-C0OePFPc`（`https://liff.line.me/2009715141-C0OePFPc`），在 LINE Developers →「儲互社」LINE 登入頻道 `2009715141` → LIFF「儲互社互助島」：Size Full、Endpoint `https://cu-mutual-island.rock903400.workers.dev/`、Scope 只有 profile、Add friend option On (aggressive)、Scan QR 關。頻道的 Linked LINE Official Account 是 `@721byaqh`，查好友要靠這個連結（同頻道還有選罷法 `LrJWnlix`、專職研習 `BTlvMKPu`，不要動到）。
  - 手機 LINE 裡：沒登入就自動請 LINE 登入（第一次跳授權畫面，按「許可」後會跳加好友畫面）；不是好友顯示「➕ 加入來福」，去加完回到網站會自動再確認。電腦：顯示 QR code 請他用手機 LINE 掃（掃了是互助島的 LINE 入口，或來福的加好友頁），另有「在這台電腦登入 LINE」。手機其他瀏覽器：「用 LINE 打開互助島」。從 LINE 登入回來（10 分鐘內）不再播開場短片。
- 目前狀態：8 站內容已完成並通過 `tools/check_tour_facts.py`；2026-11-22 第一輪校稿、部署上線。2026-11-23 督導確認 4 項業務事實（見 §0 第 2 點）並寫進畫面，`pendingConfirm` 剩 6 項（都是簡章寫「詳見條款」的細節）；這次修改（`tour_content.js`、`game_content.js` 註解，版號 `?v=17`）已在 2026-11-23 部署；同日幹部路線改成 3 站（`tour_content.js` `?v=18`），也已部署；同日再做站卡長輩友善改版（`tour_content.js` `?v=19`，`tour.js`／`styles.css`／`handbook.js`／`share_card.js` `?v=17`），已部署；同日最後加上每站語音導覽（`tour_content.js` `?v=20`、`tour.js`／`styles.css` `?v=18`、`sound.js`／`assets_manifest.js` `?v=17`、`manifest.json?v=15`、`stop_*` 音檔 `?v=1`），已部署（版本 `51c4db91-7c8a-42d0-9f9e-45dbd233fdf3`）；同日再加進島前先加來福好友（`laifu_gate.js` `?v=1`、`app.js` `?v=17`、`styles.css` `?v=19`），已部署（版本 `d778f10a-f8d2-4177-b53a-5e1ce6d5594a`）。

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
   - 使用者貼來別的 AI 或網路上的說法時（使用者自己也說「未必正確」），逐條對照 7 份 PDF 和協會法規彙編再改；沒實際打開過的外部網站引用一律標「未查證」，不可直接寫進畫面。
   - 統一使用繁體中文與台灣儲蓄互助社用語（互助基金、互助費、社員、加保、續約、股金、備轉金），避免誤導為商業保險保單。
3. **行動優先、LINE 友善與長輩無壓力介面鐵律**：
   - 主要使用情境為**手機（特別是 LINE 內建瀏覽器）社員宣導／園遊會推廣**，其次為桌機與幹部訓練。
   - **來福好友守門是使用者決定的**（2026-11-23，見「v16 主軸」）：雖然多一道關卡，不可自行拿掉、改成可略過、或只擋挑戰區；要改先問使用者。改 `laifu_gate.js` 一律維持「確定不是好友才擋，查不了就放行」。
   - **手機首屏必須維持極簡單排**：頂部僅留 1 排（`🏝️ 儲互社互助島` ＋ `☀️ 島景` ＋ `🔊`，高度 ≤ 44px）；「我是誰」身分路線按鈕（`.stage-chip[data-stage]`，key：`all/senior/adult/kids/officer`）在手機收進 `☀️ 島景` 彈窗、桌機在底部；彈窗打開時頂部列加 `.popover-open` 疊到抽屜上面。
   - 底部按鈕列固定為「🧭 導覽（n／8）｜🔍 查基金｜🎮 挑戰區｜小管家」。
   - 採「全螢幕 3D 微縮島舞台 ＋ 可捲動抽屜（桌機右側 460px／手機底部上滑）」結構，**不可將 3D 畫布與長表單垂直堆疊導致滑不動**。手機導覽用 `#side-drawer.tour-sheet` **半高抽屜**（`top: 38dvh`、不透明底色），上方露出島並用 `ISLAND_3D.setViewInset()` 把目前這站移到可見區；往下捲自動展開成全螢幕、換站回到半高；遊戲維持全高抽屜。桌機抽屜打開時 `body.drawer-open` 讓底部列與頂部列往左讓開。
   - **返回鍵**：抽屜或彈窗打開時 `history.pushState` 一筆，返回鍵依序關彈窗 → 抽屜，不可直接離站；遊戲進行中按返回先確認。
   - **站卡第一眼要短**（見「v16 主軸」的站卡分兩層）：新增或修改內容時，第一眼的句子盡量不超過 50 字；一串數字或名單用 `\n` 換行、`・` 開頭的行排成小條列（`tour.js` 的 `fmt()`），資訊不可為了變短而刪掉。要把「看更多」裡的內容搬回第一眼，先問使用者。
   - **語音導覽**：`playStopVoice()` 一定要在使用者點擊的同一輪呼叫（iPhone、LINE 才會放行有聲播放，不可放進 `setTimeout`）；離開站卡一律 `stopNarration()`。`voice` 稿只寫卡片上已有、核對過的事實，數字用阿拉伯數字（核對程式才會檢查），不寫 ～ ／ （ ） 等符號；改了稿要重跑 `python tools/generate_stop_voice.py --project <專案代號> --env <.env 路徑>`（可加 `--stop <站>`；**每次都要花錢**，8 站約 US$0.13～0.20，先跟使用者講金額、拿到同意再跑），並把 `assets_manifest.js` 裡該站音檔的 `?v=` 加 1。金鑰和專案代號不可寫進這個 repo（見 §4 第 21 點）。
   - **開場短片預設有聲**：先試有聲自動播放；被瀏覽器擋（手機、LINE 幾乎都會擋）就靜音播放並顯示大顆「🔊 點一下開聲音」，點了從頭有聲重播。
   - **挑戰區的雙難度體驗分工不可破壞**：
     - **🌱 輕鬆安心版（長輩友善）**：全面**不限時（無倒數計時）**、單局精簡為 4–5 題（第 4 攤濃縮為 5 個核心人生站＋2 格大字儀表板）、每題必備免費「💡 不確定？問小管家」白話提示鈕。
     - **🔥 幹部魔王版（實務挑戰）**：保留倒數計時、完整 6–11 題／7 階段人生、隱藏提示、動態精算與跨齡保單資格鎖定，每攤達 2★ 解鎖「🔥 魔王赤章」（共 5 枚）。
   - 維持 **18–20px 高對比大字**、固定底部拇指操作列（`#game-bottom-bar`）、答題解析後一律**手動點「下一題 →」**、點擊 📖 翻查圖鑑時**自動暫停計時**、答題中切換難度**必須二次確認防誤觸**。
   - **LINE 內建瀏覽器雙守則**：① 離開頁面／切回聊天室／鎖螢幕時必須立即停止所有音軌與影片；② 戰績卡與路線卡都必須同時輸出為實體 `<img>`（`#share-card-img`、`#route-card-img`）支援長按存圖與轉傳。
4. **快取版本號同步規則**：
   - 修改 `css/styles.css`、`js/**/*.js` 或替換 `assets/audio/*.mp3`、`assets/videos/*.mp4` 後，必須同步調升 `index.html` 與 `js/core/assets_manifest.js` 對應的 `?v=` 查詢參數，避免手機與 LINE WebView 吃到舊快取（影片、音檔快取一天，過期後還會先拿舊檔頂一週）。
5. **變更後必做驗證**：
   - 本地與正式環境皆須驗證 **Console 0 Errors**、全部載入中資源為 `200`/`206`、手機 `390×844`（頂部單排無折行、零水平溢出）與桌機雙視窗無破版；若有更新音檔，須實際核對並以 `ffmpeg` 統一響度至約 `-18.5`～`-19 dBFS`。
   - 導覽內容有改動時，`python tools/check_tour_facts.py` 必須「沒有錯誤」。
   - 用 Chrome 擴充功能測 3D 時，背景視窗的動畫會被降到約 1～2 fps，鏡頭飛行要等十幾秒才到位；不要誤判成鏡頭位置寫錯（見 §4 第 15 點）。
   - 自動測試腳本都在 `tools/`（`test_*.py`、`measure_first_view.py`、`check_voice_asr.py`，用法見 §3 與 §5）；不要再寫在 AI 暫存區，重開機就不見。
6. **跟使用者溝通（2026-11-23 整理）**：
   - 一律用繁體中文（台灣用語）、白話，**中間的進度回報、最後的總結也一樣**，不要寫英文；使用者看不懂英文，這天反映了兩次。技術名詞可以保留原文。
   - 使用者說「上線」＝照 §5 部署到 Cloudflare **並**推上 GitHub；部署、推送、花錢（Gemini 語音每次呼叫都要錢）、動 LINE Developers 設定之前，要先講清楚並拿到同意。
   - 給使用者選的東西（例如聲音），做成可以點來比較的本機網頁（放暫存資料夾、附完整路徑），建議的選項排第一。
   - 手機 LINE 實機的流程（登入授權、加好友、播放聲音）AI 測不到，要明講「未驗證」，請使用者用手機試。

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

### 公開部署檔案（v16 新增 `js/data/tour_content.js`、`js/tour/tour.js`；資源快取版號 `?v=16`，2026-11-24 時：`tour_content.js` 為 `?v=20`、`styles.css` 為 `?v=19`、`tour.js`／`share_card.js`／`assets_manifest.js` 為 `?v=18`、`game_content.js`／`handbook.js`／`sound.js`／`app.js` 為 `?v=17`、`laifu_gate.js` 為 `?v=1`，其餘 `?v=16`；以 `index.html` 為準）

- `index.html`：主頁面；開場 Veo 短片預設有聲（被擋改靜音＋`#btn-intro-unmute`）；極簡頂部單排 HUD（品牌＋`☀️ 島景`＋音量，桌機難度鈕已移除）；底部「🧭 導覽｜🔍 查基金｜🎮 挑戰區｜小管家」；新手引導泡泡（沒逛過才出現）；身分路線按鈕；460px 側／底抽屜（`#drawer-explore` 底部有 `#tour-bottom-bar`、標題列有 ⤢ 展開鈕）；圖鑑、護照戰績卡、路線卡 `#modal-route-card`、結算彈窗。
- `css/styles.css`（`?v=19`；檔尾加「來福好友守門」區塊 `.laifu-gate`、`.laifu-card`、LINE 綠 `.laifu-btn`）：v15 全部樣式＋檔尾「v16 互助島導覽」區塊（半高抽屜、站卡大字、身分按鈕、計畫表、關鍵字按鈕、搜尋結果、上一站／下一站列、開聲音按鈕）＋「長輩友善」區塊（`.tour-fold` 可點開區塊、`.tour-more` 看更多、`.tour-sub` 小條列、`.tour-hit` 查基金標黃）＋最後的「每站語音導覽」區塊（`.tour-voice-btn`、播放中的 `.tour-voice-bars` 跳動條，`prefers-reduced-motion` 時不動）。
- `js/data/`：
  - `tour_content.js`（`?v=20`，**嚴格 JSON**）：站序 `order`、身分路線 `personas`、關鍵字 `searchChips`、8 站 `stops`（oneLiner、voice（語音導覽稿）、keyNumbers、plans、suits、notFor／notForTitle、keyCautions（第一眼的最要注意）、cautions（收在看更多）、personaNotes、stories（可標 `personas: ["senior"]` 指定給哪個身分路線當第一眼的例子）、pairs、quotes、pendingConfirm）。句子裡 `\n` 換行、`・` 開頭的行排成小條列。
  - `funds_data.js`（`?v=16`）：8 大互助基金條款整理（圖鑑與站卡「完整條款」用；v16 補上幹部 A1 手術津貼 2,500）。
  - `game_content.js`（`?v=17`；v16 校正第 4 攤理賠算式等錯誤，見 §4 第 18 點）：擴充題庫（第 1 攤 24 題、第 2 攤 14 題附 3 項診斷矩陣、第 3 攤 10 經典題附紅旗線索＋`buildDynamicDetectiveCases()` 動態隨機試算、第 4 攤 7 階段雙風險事件與跨齡保單延續條件、第 5 攤 11 題＋`buildDynamicCounterQuestions()` 25 號櫃檯實戰）＋ `easyHints` / `getEasyHint()` 長輩白話提示庫。
- `js/core/`：
  - `assets_manifest.js`（`?v=18`）：讀取 `assets/manifest.json?v=15`（共 28 個音檔槽位，含 10 句媠聲台語彩蛋、8 站語音導覽 `stop_<站>`；日夜配樂為 `?v=3`，語音導覽為 `?v=1`，開場短片為 `?v=2`）。
  - `sound.js`（`?v=17`）：Web Audio 音效（含 `whoosh`、`clueFound`、`spinTick`、`confetti`）＋ 日夜配樂平滑交叉淡入淡出（`fadingOutAudios`）＋ 智慧語音閃避 ＋ `playReaction()` 多口氣輪播避免重複聽膩 ＋ **LINE WebView／行動裝置背景切離生命週期防護**（監聽 `visibilitychange`、`pagehide`、`beforeunload`、`blur`、`focus`、`pageshow`，離頁即停音並釋放、回前景平滑淡入恢復）。
  - `storage.js`（`?v=16`）：本機 `localStorage`（key `cu_mutual_carnival_v1`）雙軌進度（**15 金星 ★ ＋ 5 枚🔥幹部魔王赤章**）、6 級稱號、10 枚成就勳章，v16 加 `tour:{visited, persona, guideDismissed}`（`markVisited／getTour／setPersona／dismissGuide`；舊存檔自動補預設）；`resetAll()` 只清挑戰區、保留導覽紀錄。
  - `handbook.js`（`?v=17`）：📖 8 大基金速查圖鑑；共用模板 `renderFundDoc(f)`、`escapeHtml()`；搜尋也會搜導覽內容（含 `keyCautions`）。
  - `sound.js` v16 加 `releaseVideoHold()`（短片靜音播完時解除「影片播放中」狀態）；`?v=17` 起 `playVoice(key, { onDone })` 會在播完、被停（離頁、靜音、換別句）、載入失敗、被瀏覽器擋下時回報一次（`ended／stopped／error／blocked`），並對外提供 `stopVoice()`、`isVoicePlaying()`。
  - `laifu_gate.js`（`?v=1`，2026-11-23）：`window.LAIFU_GATE`，進島前確認是來福好友（`init()` 在 `app.js` 一開始呼叫、看短片時在背景問 LINE；`require()` 在短片關掉或沒有短片時呼叫，不是好友就打開 `#laifu-gate`）。狀態 `off／loading／login／notFriend／friend／error`，只有 `login`、`notFriend` 會擋。LINE 程式（`static.line-scdn.net/liff/edge/2/sdk.js`）只在正式網址才載。`QR_ISLAND`（互助島 LINE 入口）、`QR_ADD`（加來福好友，跟選罷法同一個）是內嵌 SVG。測試用 `window.__LAIFU_TEST = { liff: 假的 LINE }`。圖 `assets/images/laifu_dog.jpg`（從選罷法複製，256×256、10 KB）。
  - `share_card.js`（`?v=18`；路線卡的一句話會把 `\n` 接回一行；2026-11-23 起分享連結 `GAME_URL` 和兩張卡的 QR 都是互助島的 LINE 入口，卡上說明改「📱 用 LINE 掃碼…」，卡上印的文字網址 `SHORT_URL` 仍是網站網址比較好認）：Canvas `900×1200` 高畫質「🏝️ 儲互社互助島」戰績卡（呈現 15★＋5🔥魔王赤章＋每攤魔王緞帶），內建經 OpenCV 實掃驗證的 **33×33 原生 QR Code**（`https://liff.line.me/2009715141-C0OePFPc`，version 4、容錯 Q，`segno.make(網址, version=4, error='Q', boost_error=False).matrix` 產生；以前是網站網址、容錯 M），同步鏡像輸出至 `<img id="share-card-img">` 支援 LINE 長按存圖，並實作 `shareToLine()`（手機 Web Share API 原生分享／桌機自動下載 PNG 並複製文案）。v16 另加「我的互助島路線卡」`renderRoute／downloadRoute／shareRoute`（`#route-card-canvas`→`#route-card-img`，不計分）；護照戰績卡的 `render()` 維持原樣。
- `js/tour/tour.js`（`?v=18`；語音導覽：`renderVoiceBtn／playStopVoice／stopNarration／toggleVoice`，`openStop(id, { rerender: true })` 重畫同一站時不打斷語音）：`window.TOUR`——導覽首頁（身分大按鈕、路線、關鍵字、8 站清單）、站卡、上一站／下一站／逛完畫面、查基金搜尋、路線卡、半高抽屜與 `setViewInset` 鏡頭偏移、3D 名牌同步；呼叫 `ISLAND_3D` 一律先判斷是否存在。2026-11-23 起站卡分兩層：`fmt()`（`\n`／`・` 排版）、`fold()`（計畫表、看更多的 `<details>`）、`pickStory()`（依身分挑第一眼的狀況劇）、`revealMatch()`（查基金點進來時展開並捲到找到的句子；`openStop(id, { q })`）。
  - 身分路線由 `tour_content.js` 的 `personas.<key>.route` 決定：導覽首頁的站數與清單、上一站／下一站順序、島上標亮（`setStageFilter`）、路線卡、逛完畫面都讀它；點不在路線裡的站，會改用全部 8 站的順序。站內 `personaNotes.<key>` 只在走該路線時顯示。改路線只要改資料，不用動程式（存檔只記身分代號，不記路線）。
- `js/games/`（`?v=16`，玩法不變；v16 起從「🎮 挑戰區」進入；第 3 攤動態題改成先洗牌、第 5 攤小抄不寫「25 日(含)」）：
  - `game1_swipe.js`（核保快刷亭：飛卡蓋章震動＋3 連擊彩帶；輕鬆版不限時 5 題附免費提示／魔王版 80s 10 題）
  - `game2_clinic.js`（互助配對診所：問診 3 條件 ✅/❌ 處方核對回饋；輕鬆版 5 題附免費提示／魔王版 7 題隱藏細項）
  - `game3_detective.js`（理賠神算偵探社：時間軸點紅旗線索賺 `+30` 眼力分解鎖公式＋動態隨機數字；輕鬆版 4 題附白話幫算提示／魔王版 6 題）
  - `game4_life85.js`（85 歲人生摩天輪：真・SVG 旋轉命運輪盤＋撥片音效＋風險雷達＋跨齡保單資格鎖定如 63 歲未續防癌一鎖定 72 歲計畫三、72 歲未保松年鎖定 82 歲續約、63 歲退股拉低 LS 100% 水位；輕鬆版 5 核心站＋2 格大字儀表板＋免費建議／魔王版完整 7 站＋4 格儀表板）
  - `game5_calendar.js`（25 號送件大亂鬥：信封滑入＆投遞動畫＋可折疊開保月口訣小抄＋25 號櫃檯實戰題；輕鬆版不限時 5 封附提示／魔王版 85s 11 封含年度最後截止日）
- `js/app.js`（`?v=17`；2026-11-23 起一開始呼叫 `LAIFU_GATE.init()`，開場短片關掉或沒有短片時呼叫 `LAIFU_GATE.require()`，從 LINE 登入回來不播短片）：全站狀態控制；`openFundCard／openHubInfo` 轉給 TOUR；`setStageFilterUI()` 同步兩組身分按鈕與說明列；挑戰區清單（難度條、護照入口）；遊戲中切換難度二次確認；返回鍵層級管理（`LAYER_IDS`＋`MutationObserver`＋`popstate`）；開場短片有聲／開聲音按鈕；`file://` 與 3D 失敗時的 2D 導覽（8 站＋挑戰區）。
- `js/scene/island3d.js`（`?v=16`，module）：Three.js 19 格微縮島、GPU 波浪、手機陰影降載；**導覽站名牌**（站號 1～8、已逛 ✅、你在這裡 📍，`roundRectPath` 畫圓角）＋未逛站呼吸光圈；遊戲名牌降為白牌「🎮 名稱 ★」；`focusById(id, onArrive, {distance})`、`setActiveStop`、`setTourLinks`、`syncTour`、`setViewInset`（`camera.setViewOffset` 平滑偏移）、`setStageFilter(key, ids)`；`pulseBooth`、`triggerFireworks`、熱氣球彩蛋照舊。module 載入失敗由 `onerror` 切 2D。
- `_headers`：Cloudflare Workers Static Assets 快取與安全標頭（`/`、`/index.html`、`/assets/manifest.json` 為 `max-age=0, must-revalidate`；CSS/JS `max-age=3600`；圖片／音檔／影片 `max-age=86400, stale-while-revalidate=604800`；全域 `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`）。

### 多媒體資產清冊（位於 `assets/`，皆已於 `assets/manifest.json` 啟用）

| 類別 | 數量 | 規格與來源 |
| --- | --- | --- |
| 角色立繪 (`assets/images/`) | 10 檔（12 槽位映射） | 黏土微縮風格 JPG（26–40 KB／張），含 `mascot_host.jpg` 與 9 位情境角色 |
| 開場／勝利短片 (`assets/videos/`) | 2 檔 | Google Flow 720p 16:9 MP4：`intro_carnival.mp4`（1.97 MB，8.0s；2026-11-24 用 `Omni 1.2 Flash` 重新生成，換掉 Veo 3.1 Lite 的舊片，見 §4 第 23 點）、`victory_fireworks.mp4`（Veo 3.1 Lite，4.26 MB，7.9s，同日逐 0.5 秒看過，沒有怪畫面） |
| 台灣國語語音 (`assets/audio/vo_*.mp3`) | 7 檔 | Edge-TTS 生成（`tools/generate_audio_local.py`）：開場、勝利、5 大攤位導覽 |
| 每站語音導覽 (`assets/audio/vo_stop_<站>.mp3`) | 8 檔 | Google Gemini 語音（Vertex AI `gemini-3.8-flash-tts`、女聲 `Sulafat`、`cmn-TW`；`tools/generate_stop_voice.py` 讀 `tour_content.js` 的 `voice`）；24kHz 單聲道 48kbps，每檔 50～69 秒、約 290～410 KB，平均 `-18.9 dB`、最大 `-0.5～-2.7 dB`（防癌那檔解碼後有 2 個取樣碰到 0 dB，聽不出來，沒重錄；工具之後改留 2 dB）。2026-11-23 第一次錄 8 站花 US$0.196（約台幣 6.3 元，3 站自動重錄） |
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
  - `generate_stop_voice.py`（2026-11-23：每站語音導覽。讀 `tour_content.js` 的 `voice`，用 Gemini 語音（Vertex AI `gemini-3.8-flash-tts`、`Sulafat`、`cmn-TW`）錄音，再用 `gemini-3.1-flash-lite` 聽寫：稿子的數字少一個或相似度低於 0.90 就重錄，最多 3 次、留最好的；最後 ffmpeg 去頭尾靜音、平均音量調到約 `-18.5 dB`，寫到 `assets/audio/vo_stop_<站>.mp3`。`--list` 只列字數不花錢；`--stop <站>` 只重做一站；`--cap` 設這次花費上限（預設 US$0.20）。金鑰讀環境變數 `GOOGLE_TTS_API_KEY` 或 `--env` 指定的 `.env`，專案代號用 `--project` 或 `GOOGLE_TTS_PROJECT`。送出去的只有導覽稿文字和錄好的語音）
  - 自動測試（2026-11-23 從 AI 暫存區搬進來；都開全新瀏覽設定檔，不動使用者的 `localStorage`；截圖放系統暫存資料夾 `cu_island_tests\`；全部通過 exit 0）：
    - `testkit.py`：共用（本機網站、假的 LINE、QR 實掃、結果列印）。需要 Python 的 `playwright`（含 Chromium）、`opencv-python`、`numpy`。
    - `test_voice_guide.py [--prod]`：語音導覽 13 項（§5 第 7 點）；`--prod` 測正式站，用假的「已經是來福好友」通過守門。
    - `test_laifu_gate.py`：來福好友守門 23 項（假的 LINE，含 QR 實掃）；`test_laifu_gate_prod.py`：正式站用真的 LINE 程式 6 項（§5 第 8 點）。
    - `test_share_cards.py [--prod]`：戰績卡、路線卡 5 項（QR 實掃要是 LINE 入口、說明文字不超出框）。
    - `test_intro_video.py [--prod]`：開場短片 11 項（2026-11-24）：讀到 `assets_manifest.js` 裡的短片網址（含 `?v=`）、長度合理、桌機有聲／手機被擋改靜音兩種情境播完都會自己關掉進島、短片請求 200／206、Console 0 錯誤。
    - `test_search_reveal.py`：查基金點進站卡，收在看更多裡的句子要展開、捲到、標黃（§5 第 6 點）。
    - `measure_first_view.py`：量手機站卡要滑幾個畫面（只量不判斷，§4 第 20 點）。
    - `check_voice_asr.py [--clip <站> <起秒> <迄秒>]`：語音轉文字反查語音導覽念對沒（要另外開 venv 裝 faster-whisper，檔頭有步驟；§4 第 21 點）。
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
    - `wrangler deploy --dry-run` 顯示「Read 328 files」：這個數字把 `.git` 內部檔案和資料夾都算進去，不是上傳數，而且會隨 `.git` 變大（2026-11-23 已是 385）；要確認排除清單，用 `WRANGLER_LOG=debug wrangler deploy --dry-run` 看「Ignoring asset」行。網站實際約 50 個檔，每次部署只上傳有改過的檔。
    - 正式站的 404 是空白頁，Chrome 把它當錯誤頁、不能讀 `localStorage`；要在正式站測試又不弄亂使用者的瀏覽紀錄，就在首頁一載入先記下 `cu_mutual_carnival_v1`，測完寫回（`storage.js` 只在操作時存檔，不會在關頁時覆蓋）。
    - 用 `curl -H "Range: bytes=0-99"` 抓正式站的音檔、影片，回的是 200 整檔而不是 206（以前上線的配樂、開場短片也一樣），但 Chrome 在正式站播放、跳到結尾時有拿到 206，13 項語音測試都過；不要只憑 curl 判斷手機不能播。正式站測「播完」那一項要等音檔長度讀到（`isFinite(duration)`）再跳到結尾，不然會報 `non-finite`。
20. **站卡排版的兩個坑（2026-11-23）**：
    - `<p>` 裡不能放 `<ul>`：瀏覽器會自動把 `<p>` 斷開，排版亂掉 → 一句話、狀況劇的句子改用 `<div>`（`.tour-oneliner`、`.tour-story-line`、`.tour-story-tip`），`fmt()` 產生的小條列才放得進去。
    - 查基金點進站卡的標黃（`.tour-hit`）2.6 秒後會自己消失：測試要「一出現就等捲動做完（約 1 秒）再檢查」，等 2 秒以上會誤判成沒標黃（2026-11-23 踩過，`tools/test_search_reveal.py` 已改）。開場短片也可能在測試按「立即登島」前剛好播完，要用程式判斷短片還開著才按（`tools/testkit.py` 的 `enter_island`）。
    - 文字多不多要用手機尺寸實測，不要只算字數（`tools/measure_first_view.py`）：本機 Python 已裝 Playwright（含 Chromium），開 `390×844`、`is_mobile`，`TOUR.openStop(id)` 後替 `#side-drawer` 加 `tour-sheet-full`，量 `#explore-body` 的 `scrollHeight ÷ clientHeight` 就是要滑幾個畫面。用全新瀏覽設定檔，不會動到使用者的 `localStorage`。
21. **語音導覽怎麼確認唸對（AI 聽不到聲音）（2026-11-23）**：
    - 用語音轉文字反查（`tools/check_voice_asr.py`）：本機 `%USERPROFILE%\.cache\huggingface\hub` 已有 faster-whisper 模型（`mobiuslabsgmbh/faster-whisper-large-v3-turbo`），在暫存資料夾開一個 venv 裝 `faster-whisper`，設 `HF_HUB_OFFLINE=1` 就不用再下載。faster-whisper 1.2.1 配新版 PyAV 會出現 `metadata_errors` 錯誤 → 先用 ffmpeg 解成 16kHz 單聲道 PCM（`-f f32le`）再丟給模型。
    - 整段轉文字常會漏掉一兩句，看起來像語音少唸；把可疑的那幾秒切出來（`ffmpeg -ss … -to …`）單獨再轉一次才準。同音字（身故→申僱、核保→和保、給付→幾副）是轉文字的問題，不是唸錯。
    - 已知要避開的寫法：「簡稱 LP」的「簡」兩次都聽不到 → 改「也就是 LP」；「0%」改說「就沒有加值了」。
    - Edge-TTS 的台灣男聲 `zh-TW-YunJheNeural` 還列在清單上，但 2026-11-23 實測已經叫不出聲音（`NoAudioReceived`）；能用的台灣聲音只剩曉臻 `zh-TW-HsiaoChenNeural`、曉雨 `zh-TW-HsiaoYuNeural`（都是女聲、標準台灣華語）。`generate_audio_local.py` 裡用雲哲的 3 句如果要重做會失敗。
    - 播放中的「停止」圖示不要用 ⏹ 這類符號（有些手機不當彩色 emoji，白底上看不見）→ 用 SVG 線條圖示。
    - **「台灣腔」要用 Gemini，不要用 Edge**：微軟的台灣華語聲音（曉臻、曉雨）是標準播報腔，Google Cloud TTS 傳統聲音的台灣華語也只有舊款 Standard、WaveNet（Chirp 3 HD 沒有台灣）。Gemini 語音可以用提示詞交代口音和口氣。
    - Gemini 是生成式的：同一段稿每次念法略不同，偶爾漏字或把語尾「了喔」念成「囉」。工具內建 Gemini 聽寫核對數字；換聲音或整批重錄後，再用上面的 faster-whisper 獨立核對一次（兩個模型都說數字在，才算念對）。
    - 金鑰：使用者的 Gemini 語音金鑰在本機另一個專案 `..\專職研習\.env` 的 `GOOGLE_TTS_API_KEY`，專案代號在同一個資料夾 `build_voice_clips.py` 的 `PROJECT`。不要複製進這個 repo（公開）；`.gitignore`、`.assetsignore` 已排除 `.env`。跨專案拿金鑰來用會被 Claude Code 權限系統擋下，要使用者明確同意。
    - 2026-11-23 核對 Gemini 版時的誤報：faster-whisper 在 3 號站結尾多寫了一串外文亂碼、4 號站結尾寫成「好嗎」，用 `word_timestamps=True` 查，最後一個字後面都只剩 0.3～0.5 秒，是轉文字的幻覺，不是語音多出雜音。兩個聽寫程式意見不一樣的地方（D 計畫聽成「第一計畫」、聲明書聽成「宣告書」、通過聽成「透過」、8 號站多了「我也」），切成幾秒的小段請使用者用耳朵確認。
    - 做比較試聽：同一段稿、各家聲音都錄一次，平均音量拉成一樣（`volumedetect` 調到 -19 dB），做成一頁 HTML 放暫存資料夾給使用者聽；不要只用文字描述讓使用者選。
22. **來福好友守門（LINE LIFF）怎麼改、怎麼測（2026-11-23）**：
    - 新開或修改 LIFF 入口要登入 LINE Developers（使用者的 LINE 帳號），密碼只能使用者自己打；2026-11-23 是使用者在自己的 Chrome 登入後，由 Claude 用 Chrome 擴充功能照選罷法的設定新增。
    - QR code 用 Python `segno` 產生內嵌 SVG：`segno.make(網址, micro=False, error='Q', boost_error=True).svg_inline(border=2, scale=1, omitsize=True, svgclass='laifu-qr', lineclass='qrline', light='#fff', dark='#000')`（用這組參數重產選罷法的加好友 QR 會一字不差）。換了 LIFF 入口要重產 `QR_ISLAND`，並在瀏覽器裡把畫面上的 QR 截圖、用 OpenCV `QRCodeDetector` 實際掃一次，確認掃出來是對的網址。
    - 本機測試（`tools/test_laifu_gate.py`）：Playwright 用 `add_init_script` 先放 `window.__LAIFU_TEST`（假的 `init／isLoggedIn／getFriendship／login`），換 User-Agent 測「手機 LINE（UA 有 ` Line/`）」「手機其他瀏覽器」「電腦」三種；2026-11-23 共 23 項（含 QR 實掃、手機版面、去加好友回來自動放行、LINE 查不了要放行、從登入回來不播短片、本機不載 LINE 程式、Console 0 錯誤）。
    - 正式站測試：無頭 Chrome 沒登入 LINE，真的 LINE 程式初始化成功時狀態會是 `login`（擋下、顯示 QR）；如果是 `error`，代表 LIFF ID 或 Endpoint 設錯（使用者看不出來，因為查不了會放行），要回 LINE Developers 查。
23. **AI 生成短片的怪畫面（2026-11-24）**：
    - 使用者發現開場短片最後「高鐵一台拆成兩台」：Veo 原片在 5.1 秒左右，迎面開來的列車中段長出第二個車頭，前半段繼續開出畫面、後半段變成另一台車。5.0 秒以前只有一台車、正常。
    - 處理經過：先剪到 5.0 秒當備案；使用者決定用 Google Flow 重新生成，由 Claude 用 Chrome 擴充功能在使用者的 Flow 帳號操作。第二版提示詞（`tools/google_flow_prompts.md`）生成 4 支：`Veo 3.1 - Lite` 2 支（每支 10 點）、`Omni 1.2 Flash` 720p 8 秒 2 支（每支 24 點），共 68 點。逐格檢查：Omni 兩支的列車都是 3 節、從頭到尾同一台；Lite 一支列車很長但沒分裂（畫面裡有兩座摩天輪），另一支列車開著開著從 4 節變 6 節（淘汰）。做比較頁給使用者看，使用者選 Omni 第 1 支（圓形小島遠景、鏡頭慢慢推近，莫蘭迪色低面數山丘，跟網站 3D 島最搭）。
    - 換進網站前的處理：`ffmpeg -i Flow原檔 -map 0:v:0 -map 0:a:0 -c:v copy -af "volume=4.1dB" -c:a aac -b:a 160k -ar 48000 -ac 2 -movflags +faststart 新檔`。畫面不重新壓縮（跟原檔逐格比 PSNR 無限大＝完全相同）；聲音調大 4.1 dB，平均 -21.7 dB、最大 -4.0 dB，跟舊開場一樣（背景音樂平均 -19.3 dB）；Flow 下載的檔案夾了約 1 MB 的 `free` 空白填充，重新包裝後 3.03 MB → 1.97 MB。聲音是音樂盒旋律＋海浪，頻譜上看不到人聲（沒用耳朵聽過）。
    - 沒採用的剪短做法（備案）：`ffmpeg -i 原片 -t 5.0 -c:v libx264 -preset slow -crf 20 -profile:v high -pix_fmt yuv420p -af "afade=t=out:st=4.4:d=0.6" -c:a aac -b:a 160k -ar 48000 -ac 2 -movflags +faststart 新檔`（跟原片前 5 秒比 SSIM 0.994，結尾聲音淡出避免爆音）。舊片留在 Git 歷史裡（`git log -- assets/videos/intro_carnival.mp4` 找得到）。
    - Google Flow 操作（2026-11-24）：網址已改成 `https://flow.google.com/`，要用使用者的個人 Google 帳號（網址 `/u/1/`；Chrome 的預設帳號進不去 Flow）。舊片在專案「11月 22 - 00:12」。生成設定在輸入框右邊的小方塊：圖片／影片、影格／素材、16:9、模型、解析度、長度、x1～x4，下方會顯示要用幾點；剩餘點數在右上角頭像。每組結果右邊的「批次下載」會存成 `下載 (N).zip` 到使用者的「下載」資料夾。`Veo 3.1 - Fast`、`Veo 3.1 - Quality`、`Omni 1.1 Flash` 會在 2026-12-05 停用。Chrome 沒開時擴充功能連不上，要先開 Chrome。
    - AI 看不到影片：用 ffmpeg 每 0.5 秒擷取一格拼成一張圖（`fps=2,scale=480:-1,drawtext=…%{pts\:hms}…,tile=4x4`），列車那一帶再用 `crop` 放大、每 0.25 秒一格看，可疑的地方用 `select='between(t\,起\,迄)'` 逐格看。換新影片時整支都要這樣看過一次；列車要比對車頭、車尾位置，才看得出「越開越長」這種慢慢變的怪畫面。
    - Flow 下載的原檔內嵌 Google 的 C2PA 內容憑證（`uuid` 區塊，標示是 AI 生成）；剪輯或重新包裝後憑證本來就會失效，ffmpeg 也不會帶過去，這是正常的。
    - 測試：`python tools/test_intro_video.py`（上線後加 `--prod`）檢查網址是新的 `?v=`、長度合理、有聲（桌機）和被擋改靜音（手機）兩種情境播完都會自己關掉進島、Console 0 錯誤；`tools/test_laifu_gate.py` 23 項照樣要過（短片關掉才檢查好友）。上線後再用 `curl` 抓正式站短片算 SHA-256，要跟本機檔案一樣。桌機尺寸不要在播放中截 3D 畫面的圖：無頭瀏覽器用軟體算圖，截一張要十幾秒，測試計時會變成「影片播了 17 秒」的假警報（影片本身 7.8 秒就播完）。

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

### 導覽內容的瀏覽器快速驗證（本機、正式站都適用）
1. 首頁一載入，先把 `localStorage` 的 `cu_mutual_carnival_v1` 存進 `sessionStorage`，測完寫回，不弄亂使用者的瀏覽紀錄（見 §4 第 19 點）。
2. 在 Console 操作：`APP.setStageFilterUI('officer')` 選身分 → `TOUR.openHome()` 看首頁 → `TOUR.openStop('group')` 開站。
3. 讀 `#explore-title`（站名）、`#explore-sub`（路線第幾站）、`#explore-body`（站卡內容）、`#tour-bottom-bar [data-tour-next]`（「下一站」或「逛完了」），確認文字和順序。
4. 手機：在同源頁面插一個 `390×844` 的 iframe（`transform: scale()` 縮小），確認 `scrollWidth - clientWidth` 是 0、`.float-top-bar` 高度 ≤ 44px。
5. 用 `performance.getEntriesByType('resource')` 確認沒有 200／206／304 以外的狀態碼；改過 `?v=` 的檔要看到新版號。
6. 站卡有改動時：確認「計畫表」「👇 看更多」預設收著；從查基金點一個收在看更多裡的關鍵字（例如「跨社」「保障期間」），要自動展開並捲到那句（`python tools/test_search_reveal.py`）；手機第一眼量起來不要比 4 個多太多畫面（`python tools/measure_first_view.py`，見 §4 第 20 點）。
7. 語音導覽有改動時（`python tools/test_voice_guide.py`，上線後加 `--prod`）：用 `--autoplay-policy=user-gesture-required` 開 Chromium，點「唸給我聽」要真的在播、按「下一站」要自動接著唸且上一站停掉、再按一下要停、自己按停後換站不自動唸、`visibilitychange`（模擬切到背景）要立刻停、靜音時按要跳提示、關抽屜要停；`vo_stop_*.mp3` 只在按下時才出現 200／206 請求。
8. 來福好友守門有改動時：`python tools/test_laifu_gate.py`（假 LINE 23 項）；上線後 `python tools/test_laifu_gate_prod.py`：無頭 Chrome 開正式站，關掉開場短片後狀態要是 `login`（不是 `error`）、畫面上的 QR 掃得出 `https://liff.line.me/2009715141-C0OePFPc`。注意：正式站測試前要先在首頁記下 `localStorage`（見 §4 第 19 點）。
9. 開場短片有換時：`python tools/test_intro_video.py`（11 項），上線後加 `--prod`；換影片前先照 §4 第 23 點逐格看過有沒有怪畫面。

---

## 6. 未來可選擴充清單（目前尚未執行，待使用者需求再啟動）

- [x] 戰績卡內建實掃驗證通過的專屬 QR Code、正名「儲互社互助島」、支援手機 Web Share API 分享與 LINE 長按 `<img>` 存圖。
- [x] v16 主軸改導覽：8 站白話內容、身分路線、協作線、查基金搜尋、路線卡、返回鍵、開場短片預設有聲。
- [x] 第一輪校稿（2026-11-22）：LP／LS 最高給付寫法、LS 互助費由社繳、社員團體 E 計畫給付項目、重大疾病 65～70 歲照簡章原文、幹部併保改「請先確認」；`pendingConfirm` 15 項 → 10 項。
- [x] v16 部署上線（2026-11-22，版本 `115c79c2-77e9-4afe-ba1c-06233d1113bf`）。
- [x] 督導確認 4 項並寫進畫面（2026-11-23）：幹部可以同時參加社員團體、團體意外；松年住院日額和實支實付可以一起領；C、D 意外住院不再加生病住院日額；大眾運輸工具的範圍。`pendingConfirm` 10 項 → 6 項。已部署（版本 `9743828e-a03e-4153-8f0e-e5798292808c`）。
- [x] 幹部路線加入社員團體、團體意外，從 1 站變 3 站（2026-11-23，已部署，版本 `0c59a9ca-dbd1-4074-98c7-39af72bfbcd5`）。
- [x] 站卡長輩友善改版（2026-11-23，已部署，版本 `492f81e1-17dd-4546-b788-7d587ab7efe5`）：先收起來、字不刪；第一眼只留重點＋最要注意 1～2 條＋1 個狀況劇；第一眼超過 50 字的 19 句（加上身分路線會露出的 2 句）拆短，數字一個都沒少。手機第一眼 5.1～7.5 → 3.2～4.2 個畫面。
- [ ] 若還想再短：把站卡頂端和抽屜標題重複的站名區塊拿掉（約省 0.1 個畫面）。
- [ ] 剩下 6 項 `pendingConfirm`（都是簡章寫「詳見條款」的細節）由督導決定是否再問協會；回覆後改成明確寫法再部署。
- [x] 每站語音導覽（2026-11-23，8 站，manifest 新增 `stop_<站>`；同日從 Edge-TTS 曉臻換成 Gemini 女聲 `Sulafat`＋聊天說法；已部署，版本 `51c4db91-7c8a-42d0-9f9e-45dbd233fdf3`，正式站 13 項語音測試都過）。
- [x] 兩個聽寫程式意見不一樣的 5 小段（3 號站「D 計畫」「健康聲明書」「核保通過」、6 號站「健康聲明書」、7 號站「健康聲明書」「核保通過」、8 號站「就選 A3」前有沒有多「我也」）：切成小段給使用者聽，使用者聽完說「上線」（2026-11-23）。之後若有社員反映哪一站念錯，用 `--stop` 只重錄那一站（一站約台幣 0.5 元，先問）。
- [ ] 開場、勝利、5 攤導覽的 7 句語音（`vo_*.mp3`，Edge-TTS）改成跟語音導覽同一個 Gemini 聲音：使用者想統一再做（要花錢）。
- [x] 進島前先加來福好友（2026-11-23，LIFF `2009715141-C0OePFPc`，做法跟選罷法一樣；本機假 LINE 測試 23 項通過；已部署，版本 `d778f10a-f8d2-4177-b53a-5e1ce6d5594a`，正式站真的 LINE 程式測 6 項、語音導覽 13 項都過）。手機 LINE 實機（登入授權、加好友、回來放行）由使用者測；AI 只能用無頭瀏覽器測到「沒登入就擋下」。
- [x] 分享連結、戰績卡／路線卡的 QR code 改成互助島的 LINE 入口 `https://liff.line.me/2009715141-C0OePFPc`（2026-11-23 使用者同意）：在 LINE 裡點開，LINE 先問許可、加好友再開網站，不會「看完片頭跳去 LINE 登入再跳回來」。兩張卡用 Playwright 畫出來、OpenCV 實掃都掃得出 LINE 入口；已部署（版本 `23cb3983-ba76-4f97-a91b-2c196bfc8951`），正式站兩張卡 5 項、守門 6 項都過；LINE 入口網址用一般瀏覽器打開也會轉到互助島。換 LIFF 入口時，`share_card.js` 的 `GAME_URL`、`QR_MATRIX` 和 `laifu_gate.js` 的 `QR_ISLAND` 要一起重產。
- [x] 開場短片換成 Google Flow 重新生成的版本（2026-11-24，原片 5.1 秒起高鐵一台變兩台，見 §4 第 23 點；用第二版提示詞生成 4 支，使用者選 `Omni 1.2 Flash` 第 1 支）：本機短片 11 項、守門 23 項都過；已部署（版本 `65578741-322e-4081-826f-ab38afca622b`），正式站短片 11 項、真的 LINE 程式守門 6 項都過，正式站短片跟本機檔案 SHA-256 相同。手機 LINE 實機播放由使用者試。
- [ ] 語音導覽的台語版（意傳媠聲，`ffmpeg` 調到約 `-18.5 dBFS`）：使用者要的話再做；台語稿要另外寫成台語說法，不能直接把華語稿丟進去。
- [ ] 小管家角色在島上走到目前這站（沿用島民走路動畫）。
- [x] 修正 §4 第 18 點的遊戲題庫與 `funds_data.js` 錯漏（2026-11-22）。
- [ ] 於 `index.html` 加入 Open Graph（`og:url`、`og:title`、`og:description`、`og:image`）與 `theme-color`，強化 LINE 群組轉貼連結時的縮圖預覽卡片。
- [ ] 透過 `cu-portal-manager` 技能將《儲互社互助島》掛載至「儲互社督導管理入口網（`cu-board-info-site`）」。
- [ ] 若未來需要各儲互社積分榮譽榜或使用統計，因已採用 Cloudflare Workers Static Assets，可直接於同專案綁定 Cloudflare D1 或 Web Analytics 擴充。
- [ ] 若未來有線下園遊會大量發放需求，可另輸出獨立高解析 QR Code 海報圖或加上「現場兌獎通關券」時間戳記畫面。
