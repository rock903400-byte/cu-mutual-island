# 專案記憶與開發規範：《儲互社互助島》（cu-mutual-island）

> 最後更新：2026-11-22（Asia/Taipei）  
> 線上網址（Cloudflare Workers Static Assets）：`https://cu-mutual-island.rock903400.workers.dev`  
> GitHub 公開儲存庫：`https://github.com/rock903400-byte/cu-mutual-island`（主分支：`main`）  
> 本檔目的：保存本專案的架構設計、8 大互助基金資料原則、多媒體資產規格、歷史踩坑修復紀錄與部署檢核流程，供後續 AI 助手（Antigravity / Gemini / Claude / Codex）直接接續維護，不需重複摸索或破壞既有體驗。

---

## 0. 給後續 Agent 的核心鐵律

1. **原始 7 份協會 PDF 絕對不可異動，且嚴禁推上公開網站／Repo**：
   - 本機根目錄保留 7 份中華民國儲蓄互助協會原始 PDF 簡章作為唯一法規與數據核對依據（見 §2），**禁止修改、重命名或刪除**。
   - `.gitignore` 與 `.assetsignore` 皆已設定排除 `*.pdf`；每次提交 Git 與執行 `wrangler deploy` 前，必須確認零 `.pdf` 與零 `.wrangler/` 外流。
2. **基金規則與數據零幻覺、用語對齊儲互社實務**：
   - 所有承保年齡、最高額度、職業類別（第 1～4 類與拒保職業）、等待期、給付倍數與 25 日送件規定，均以 7 份官方 PDF 與已校對的 `js/data/funds_data.js`、`js/data/game_content.js` 為準，不得自行憑印象編造。
   - 統一使用繁體中文與台灣儲蓄互助社用語（互助基金、互助費、社員、加保、續約、股金、備轉金），避免誤導為商業保險保單。
3. **行動優先與長輩友善介面鐵律**：
   - 主要使用情境為**手機（含 LINE 內建瀏覽器）**，其次為桌機。
   - 採「全螢幕 3D 微縮島舞台 ＋ 可捲動抽屜（桌機右側 460px／手機底部上滑）」結構，**不可將 3D 畫布與長表單垂直堆疊導致滑不動**。
   - 維持 **18–20px 高對比大字**、固定底部拇指操作列（`#game-bottom-bar`）、答題解析後一律**手動點「下一題 →」**（不可自動倒數跳題），且點擊 📖 翻查圖鑑時**必須自動暫停計時**。
4. **快取版本號同步規則**：
   - 修改 `css/styles.css`、`js/**/*.js` 或替換 `assets/audio/*.mp3` 後，必須同步調升 `index.html` 與 `js/core/assets_manifest.js` 對應的 `?v=` 查詢參數，避免手機端吃到舊快取。
5. **變更後必做驗證**：
   - 本地或正式環境皆須驗證 **Console 0 Errors**、全部載入中資源為 `200`/`206`、手機 `390×844` 與桌機雙視窗版面無破版；若有更新音檔，須先實際試聽品質並統一響度至約 `-19 dBFS`。

---

## 1. 專案目標與設計定位

- **專案名稱**：《儲互社互助島｜8 大互助基金 3D 微縮遊樂場》
- **技術形態**：純前端零後端靜態網站（HTML + CSS + Vanilla JS + Three.js ESM via jsDelivr CDN），不需任何建置工具（no webpack/vite），直接由 Cloudflare Workers Static Assets 託管。
- **視覺美學**：參考《HEART 政策島》之建築微縮模型（Architectural Miniature Diorama）風格——19 格《卡坦島》六角島嶼、柔和鼠尾草綠遠山背景、6 座衛星小島（風機、茶園、沙洲、陽傘、旋轉光束燈塔、松樹島）、高架橋與 3 節高鐵列車、航行帆船與盤旋飛機、30+ 漫步島民、29° 長焦微縮鏡頭、毛玻璃極簡線框 SVG 工具列與白色編號膠囊建築名牌（`00`–`13`）。

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

### 公開部署檔案（43 個靜態檔，總計 13.25 MB）

- `index.html`：主頁面、浮動頂部極簡 HUD（24H 四段光影、名牌／協作線／暫停／全景／片頭、輕鬆／魔王難度切換）、底部生命週期協作濾鏡列（`all`／`kids`／`adult`／`officer`／`senior`）、460px 抽屜、速查圖鑑、護照戰績卡、開場影片彈窗。
- `css/styles.css`（`?v=8`）：行動優先響應式排版、毛玻璃視覺與大字高對比樣式。
- `js/data/`：
  - `funds_data.js`（`?v=5`）：8 大互助基金完整權威欄位資料。
  - `game_content.js`（`?v=5`）：5 大攤位雙難度（`easy` 🌱社員輕鬆版 / `hard` 🔥幹部魔王版）題庫、小管家語錄與台語口頭禪掛鉤。
- `js/core/`：
  - `assets_manifest.js`（`?v=12`）：讀取單一 `assets/manifest.json` 避免 404 探測洗版；日夜配樂目前為 `?v=3`。
  - `sound.js`（`?v=12`）：Web Audio 音效 ＋ 日夜配樂平滑交叉淡入淡出（`fadingOutAudios` 防重疊）＋ 語音閃避（播放國台語語音時 BGM 自動降至 26% 並於結束後還原）＋ 影片播放自動暫停／恢復配樂（`pauseBgmForVideo` / `resumeBgmAfterVideo`）。
  - `storage.js`（`?v=5`）：本機 `localStorage` 集星（滿分 15★）、稱號與 8 枚成就勳章紀錄。
  - `handbook.js`（`?v=5`）：📖 8 大基金速查圖鑑（關鍵字即時搜尋＋分類頁籤）。
  - `share_card.js`（`?v=5`）：Canvas `900×1140` 高畫質 PNG 園遊會戰績卡一鍵下載。
- `js/games/`（皆 `?v=5`）：
  - `game1_swipe.js`（核保快刷亭）
  - `game2_clinic.js`（互助配對診所）
  - `game3_detective.js`（理賠神算偵探社）
  - `game4_life85.js`（互助人生 85 歲衝刺）
  - `game5_calendar.js`（25 號送件大亂鬥）
- `js/app.js`（`?v=11`）：全站狀態控制、開場短片關閉與自動起播 BGM、`file://` 離線 2D 降級介面。
- `js/scene/island3d.js`（`?v=7`）：Three.js 19 格微縮島 3D 引擎、4 段光影切換與生命週期貝茲發光協作弧線。
- `_headers`：Cloudflare Workers Static Assets 快取與安全標頭（`/`、`/index.html`、`/assets/manifest.json` 為 `max-age=0, must-revalidate`；圖片／音檔／影片為 `max-age=86400, stale-while-revalidate=604800`；全域 `X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`）。

### 多媒體資產清冊（位於 `assets/`，皆已於 `assets/manifest.json` 啟用）

| 類別 | 數量 | 規格與來源 |
| --- | --- | --- |
| 角色立繪 (`assets/images/`) | 10 檔（12 槽位映射） | 黏土微縮風格 JPG（26–40 KB／張），含 `mascot_host.jpg` 與 9 位情境角色 |
| 開場／勝利短片 (`assets/videos/`) | 2 檔 | Google Flow Veo 3.1 Lite 720p 16:9 MP4：`intro_carnival.mp4`（2.82 MB，7.9s）、`victory_fireworks.mp4`（4.26 MB，7.9s） |
| 台灣國語語音 (`assets/audio/vo_*.mp3`) | 7 檔 | Edge-TTS 生成（`tools/generate_audio_local.py`）：開場、勝利、5 大攤位導覽 |
| 道地台灣台語 (`assets/audio/vo_taigi_*.mp3`) | 5 檔 | 意傳科技「媠聲」生成（`tools/generate_taigi_ithuan.py`），經 `pydub` 標準化至 `-17.7`～`-19.4 dBFS` |
| 日夜原創純演奏配樂 (`assets/audio/bgm_*.mp3`) | 2 檔 | **Google Flow Music（Lyria 3.5）** 客製純演奏曲，轉為 48kHz 128kbps 立體聲 MP3（靜音修剪、100ms 淡入 / 1.2s 淡出）：<br>• `bgm_day.mp3`（*Mutual Island Sunny Day*，2.41 MB，158.13s，`-19.3 dBFS`）<br>• `bgm_night.mp3`（*Mutual Island Starry Night*，2.69 MB，176.02s，`-19.1 dBFS`） |

### 僅保留於 GitHub、排除於 Cloudflare 之工具與設定

- `wrangler.jsonc` / `.assetsignore` / `.gitignore` / `README.md` / `AGENTS.md` / `start_game.bat`
- `tools/`：
  - `generate_audio_local.py`（Edge-TTS 國語語音）
  - `generate_taigi_ithuan.py`（意傳媠聲台語語音）
  - `generate_audio_colab.ipynb`（歷史備存；**注意：已實測捨棄 `musicgen-small`，日後配樂升級請改用 Google Flow Music**）
  - `build_blender_island.py`（選配：若本機日後安裝 Blender，可產出 `assets/models/carnival_island.glb` 自動接管 3D 島）
  - `google_flow_prompts.md`（視覺與影片提示詞紀錄）

---

## 4. 歷史踩坑與已修復紀錄（切勿重犯）

1. **禁止盲目 `HEAD` 探測不存在素材**：早期對未建置素材發 `HEAD` 導致 Console 滿屏 404 → 已統一改為讀取單一 `assets/manifest.json` 並搭配內嵌 SVG favicon。
2. **禁止在 Three.js / DOM 唯讀屬性上使用 `Object.assign`**：
   - `Mesh.position` 為唯讀 → 必須使用 `.position.set(x, y, z)`。
   - `HTMLAudioElement.dataset` 為唯讀 `DOMStringMap` → 自訂追蹤 URL 改存於 `audio._trackUrl`。
3. **日夜配樂快速切換殭屍重疊音軌**：連續點擊白天↔夜景時舊音軌未停乾淨 → `js/core/sound.js` v12 已改用 `fadingOutAudios` 陣列搭配 `flushFadingAudios()` 徹底清除。
4. **影片與 BGM 打架**：Veo MP4 內含音軌，重播「▶ 片頭」解除靜音時會與 BGM 重疊；點擊背景關閉時也需停止影片 → `js/app.js` v11 已統一走 `closeIntroVideo()` 並整合 `SOUND.pauseBgmForVideo()` / `SOUND.resumeBgmAfterVideo()`，且點擊「立即登島 →」或 3D 地標會自動呼叫 `SOUND.ensureBgm()`。
5. **配樂來源決策**：Colab `musicgen-small` 產出節拍飄移且首尾疊加接縫突兀，**已全面淘汰**；正式配樂採用 Google Flow Music（Lyria 3.5）產製之 2.5–3 分鐘完整編曲純演奏曲。
6. **靜態路由 `not_found_handling`**：`wrangler.jsonc` 維持 `"not_found_handling": "none"`（勿改為 `"single-page-application"`），確保未啟用槽位與被 `.assetsignore` 隔離之路徑正確回傳 `404`。
7. **`file://` 雙擊相容**：瀏覽器禁止 `file://` 載入 ES Module（`island3d.js`），因此保留 `start_game.bat`（起 `127.0.0.1:8765`）與 2D 離線降級介面。

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
並以 Chrome 開啟正式網址確認 **Console 0 Errors** 與手機 `390×844` 互動正常。

---

## 6. 未來可選擴充清單（目前尚未執行，待使用者需求再啟動）

- [ ] 於 `index.html` 加入 Open Graph（`og:url`、`og:title`、`og:description`、`og:image`）與 `theme-color`，強化 LINE 群組轉貼縮圖預覽。
- [ ] 產出高解析手機掃碼用 QR Code PNG 供教育訓練簡報與 LINE 宣導。
- [ ] 透過 `cu-portal-manager` 技能將《儲互社互助島》掛載至「儲互社督導管理入口網（`cu-board-info-site`）」。
- [ ] 若未來需要全社排行榜或使用統計，因已採用 Cloudflare Workers Static Assets，可直接於同專案綁定 Cloudflare D1 或 Web Analytics 擴充。
