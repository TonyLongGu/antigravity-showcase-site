# Antigravity IDE Plugins 展示網站 (GitHub Pages)

本目錄為 Google Antigravity IDE 專屬原生擴充套件生態系展示網站（亦完整支援 Cursor 與 VS Code 安裝），可直接透過 **GitHub Pages** 託管上線。

---

## 🚀 GitHub Pages 一鍵發布步驟

1. 確保最新程式碼已 Push 至 GitHub 倉庫：[`https://github.com/TonyLongGu/antigravity-showcase-site`](https://github.com/TonyLongGu/antigravity-showcase-site)。
2. 進入該 GitHub 倉庫設定頁面：[**Settings -> Pages**](https://github.com/TonyLongGu/antigravity-showcase-site/settings/pages)。
3. 在 **Build and deployment** 區塊：
   - **Source** 選擇 `Deploy from a branch`
   - **Branch** 選擇 `main` 分支，資料夾下拉選單選擇 **`/ (root)`**（根目錄）
   - 點擊 **Save**
4. 等待 1~2 分鐘 GitHub 自動建置完成，即可在頂部看見上線網址：
   👉 **`https://tonylonggu.github.io/antigravity-showcase-site/`**

> ⚠️ **部署只由 `main` 觸發**：`.github/workflows/deploy.yml` 監聽 `push` 到 `main`（也可在 Actions 頁用 `workflow_dispatch` 手動觸發）。改動停留在特性分支時，線上站**不會**更新——這也是「本機看起來已修好、線上還是舊的」最常見原因。

---

## 💻 本機預覽方式

直接以瀏覽器雙擊開啟 [`index.html`](./index.html) 或執行 [`preview-site.bat`](./preview-site.bat) 預覽。

本機預覽有兩支批次檔（底層都是 [`preview.js`](./preview.js)）：

| 批次檔 | 用途 |
| --- | --- |
| [`preview-site.bat`](./preview-site.bat) | 啟動預覽（**可重複執行**：已在跑就只開網站） |
| [`preview-site-stop.bat`](./preview-site-stop.bat) | 關閉預覽伺服器（自動找出 PID，不必自己關視窗） |

`preview-site.bat` 的行為固定為：

1. 先跑 `preview.js --probe`（同步、輸出乾淨）判斷狀態：
   - **已有本站的預覽伺服器** → **只開啟網站後結束**（不重複佔埠、不會噴 `EADDRINUSE`，也不會冒出第二個視窗）。
   - 埠被其他程式或另一份站點副本佔用 → 自動往後找下一個可用埠（3300–3309）。
   - 連續 10 個埠都不可用 → 顯示原因後以退出碼 `1` 結束。
2. 確認沒有伺服器時，才由 `preview.js --detach` **背景啟動**：以 `spawn(detached, stdio→NUL)` 建立
   **完全脫離終端機／管線**的伺服器行程（不繼承任何 handle），因此用終端機、管線或重導向呼叫都不會被卡住，
   也不會冒出額外視窗。啟動後會**等伺服器就緒才開站**（最多約 6 秒），起不來就直接顯示錯誤。
3. 停止：跑 `preview-site-stop.bat`（背景伺服器在隱藏主控台中執行，不會佔用你的終端機）。

`preview.js` 也可直接使用：

```bash
node preview.js          # 前景啟動（佔用終端機直到 Ctrl+C）
node preview.js --detach # 背景啟動（脫離終端機；等就緒才開站）
node preview.js --stop   # 關閉伺服器
node preview.js --probe  # 只檢查（已有伺服器就開站並以 2 結束）
```

其他參數：`--port <埠>`（指定起始埠）、`--no-open`（不自動開啟瀏覽器）、`PREVIEW_PORT` 環境變數。
辨識方式：新版伺服器提供 `GET /__preview_health`（回傳 `app`／`pid`／`port`／`root`）供下一次執行認人；
沒有這個端點的舊版伺服器，則以「首頁與本目錄逐字相同」判定後直接沿用。
退出碼：`0`＝正常結束、`2`＝沿用既有伺服器（已開站）、`1`＝啟動失敗。

---

## 🎬 影片與字幕維護

**影片**：放置於 `assets/videos/`，並於 [`assets/js/plugins-data.js`](./assets/js/plugins-data.js) 的 `TUTORIAL_VIDEOS` / `PLUGINS_DATA` 指定 `videoSrc`。

**字幕**：`assets/subtitles/{主題}.{語系}.vtt` 是唯一的人工編輯來源（語系支援 `zh-TW` 與 `en`）。
編輯完成後**必須**執行產生器，把字幕編譯進 `assets/js/subtitles-data.js`：

```bash
node tools/build-subtitles.js
```

產生器會列出每個主題的 cue 條數，並警告時間碼錯誤、起訖顛倒、順序錯亂、重疊或疑似標記的內容。
之所以採「預先編譯」而非執行期 `fetch`：直接雙擊開啟 `index.html`（`file://` 協定）時 `fetch` 會被 CORS 阻擋，字幕會完全失效。

---

## 🩺 提交前健檢

改動跨多個檔案，或動到**主題／i18n 契約**時，提交前先跑一次：

```bash
node tools/health-check.js
```

退出碼 `0` = 通過、`1` = 有 ERROR（`WARN` 不影響退出碼）。無外部相依，路徑自動推導，可直接當提交前的 hook 使用。

| 代號 | 檢查項目 |
| --- | --- |
| C1 | `index.html` 引用的本機資產是否真的存在（擋版本號打錯、漏檔） |
| C2 | 每個 `.js` 是否可編譯（`vm.Script`） |
| C3 | 每個 `.css` 的 `{}` 是否平衡 |
| C4 | `index.html` 常見標籤的開合是否平衡 |
| C5 | **主題契約**：`theme.js` 的 `THEMES`、`index.html` 的 head 白名單與 `data-theme-value` 標籤、`nebula-canvas.js` 的 `MODE_SPECS`、`theme-<key>.css` 四處是否一致 |
| C6 | **i18n 契約**：`index.html`／JS 用到的鍵，在每個語系是否都存在 |
| C7 | 殘留／備份檔、未被任何地方引用的孤兒資產 |
| C8 | **主題覆蓋平整性**：其他風格是否漏掉基準風格（`theme-cursor.css`）已處理的選擇器 |

**未涵蓋**（需人工確認）：外部資源（Google Fonts、GitHub 連結）的可達性、GitHub Pages 部署結果、CSS 疊層的視覺結果。細節見腳本檔頭的「測不到什麼」。

### 🧪 瀏覽器實測（選用第二層）

原始碼層的 C1–C8 驗不到「真的跑起來長怎樣」，所以另有一支用 CDP 驅動本機 Chrome／Edge 的工具：

```bash
node tools/health-check-browser.js               # B1–B21，約 40 秒
node tools/health-check-browser.js --calibrate   # 負對照自我校準：故意注入缺陷，證明它真的抓得到
node tools/health-check-browser.js --only B7,B8  # 只跑指定項目（除錯用）
node tools/health-check-browser.js --keep-profile  # 保留暫存 profile
```

驗什麼：粒子顆數契約（各模式每幀 fills）、殘影、視窗縮放的密度同步、餘燼的滑鼠互動
（推力存在／不越過 160px／無順勢帶橫向漂移／提亮不變暗）、像素層（無烙暗）、生命週期
（切風格、reduced-motion 單幀、pause／resume、重複觸發 visibilitychange 不會多開一條 rAF 鏈）、
rAF 效能、console 例外。

它會自己開一個**隨機埠**的臨時靜態伺服器（不動 `preview.js` 的 3300）、自動偵測 Chrome／Edge／Chromium，
測完自動清掉暫存 profile；**找不到瀏覽器或 Node < 22 時一律 SKIP 並以退出碼 `0` 結束**（不誤報）。
退出碼：`0` = 無 FAIL、`1` = 有 FAIL。涵蓋邊界（真實手感、DPR≠1、Safari／Firefox、觸控）寫在腳本檔頭；
高刷新率螢幕自 4.20 起已由 `nebula-canvas.js` 做 dt 正規化（速度與刷新率無關，高刷只換來更細的步進），本工具仍只量 60Hz 邏輯。

### 新增／修改一個視覺主題時要同步五個地方

C5 會擋住漏掉的任何一項：

1. `assets/js/theme.js` 的 `THEMES` 加一筆（`attr: null` 代表沿用 Antigravity 風格、不掛 `data-theme`）
2. 建立 `assets/css/theme-<key>.css`，並在 `index.html` 用 `<link>` 掛載
3. `assets/js/nebula-canvas.js` 的 `MODE_SPECS` 加一筆（粒子類別／數量／是否畫連線／`blend` 合成模式；
   目前三個風格都是 `'source-over'`（餘燼曾用 `'lighter'`，改成銳利三角形平塗後不再疊光））
4. `index.html` `<head>` 的 bootstrap 白名單加入 `'<key>'`——**漏了會在載入時先閃一下預設風格（FOUC）**
5. 加一顆 `data-theme-value="<key>"` 的標籤，否則使用者切不到

風格鍵一律用 IDE 名稱（`antigravity`／`vscode`／`cursor`），視覺描述只留在粒子類別（`EmberParticle` 等）；
首次造訪的預設風格是 `vscode`（`theme.js` 的 `DEFAULT_THEME`）。

改完 CSS 後也別忘了同步 `index.html` 的 `?v=` 版本號（快取失效）。

---

## 🧹 死碼盤點（選用）

移除區塊後常留下沒人引用的樣式。這支工具會列出「CSS 有定義、但 `index.html` 與任何 JS 都沒引用」的 class：

```bash
node tools/dead-css.js            # 只報告
node tools/dead-css.js --strict   # 有死碼時以退出碼 1 結束（可掛 hook／CI）
```

- 先移除 CSS 註解，再以**詞邊界**比對引用（`.card` 不會誤命中 `.card-icon`）。
- 只盤點、不改檔。由 JS 字串拼接產生的類別（例如 ``badge-${type}``）只要字串片段有出現在程式碼就算有引用，仍可能漏判，需人工確認後再刪。
- 目前狀態：6 個 CSS 檔、329 個 class 全部有引用（2026-10 已清掉 `.feature-box` 系列、舊版子模式卡、`.hero-ide-pill`、`.shortcut-*`、`.chat-quote`、`.code-snippet`，以及沒人用的 `@keyframes float／pulse-slow／shimmer`）。

---

## 🧠 知識圖譜（Graphify，給 AI／維護者）

> 本節於 2026-10-23 由 `AGENTS.md` 搬來：**查閱型資料**（邊界表、節點數、指令）放 README（0 常駐成本），
> `AGENTS.md` 只留「沒查就會做錯」的規則。要改圖譜前，**紅線一律先看 `AGENTS.md` §3.3**。

### 圖譜在哪

| 路徑 | 內容 | 什麼時候讀 |
| --- | --- | --- |
| `graphify-out/GRAPH_REPORT.md` | 摘要（節點／邊／社群數、EXTRACTED 比例、建圖 commit）＋ Community Hubs ＋ God Nodes ＋ 意外關聯 | 第一個讀它（10–20 KB，多數問題這份就夠） |
| `graphify-out/graph.html` | 互動式視覺化 | 想看圖時才開 |
| `graphify-out/graph.json` | 完整圖（0.26–1.8 MB） | **不要整檔讀**（幾乎必然超 token 預算） |

`graphify-out/` 已被 `.gitignore` 排除（`git check-ignore -v graphify-out/graph.json` 可驗），**不可 commit**——否則會被 GitHub Pages 一起部署出去。

### 現況與邊界

> 現況（2026-10-23 更新）：**288 節點 ＝ code 247 ／ document 34 ／ concept 7**（508 邊、16 社群）。
> 節點最多的來源：`app.js` 51、`nebula-canvas.js` 40、`health-check-browser.js` 35、`health-check.js` 33、`preview.js` 28、`AGENTS.md` 16、`theme.js` 13。

| 類別 | 有沒有進圖 | 影響 |
| --- | --- | --- |
| `assets/js/**`、`tools/**`、`preview.js` | ✅ 程式碼節點（附檔名＋行號） | 架構／呼叫鏈／影響半徑都可靠圖譜 |
| `README.md`、`開發者筆記.md`、`AGENTS.md` | ⚠️ **只有標題節點**（`file_type: document`；零成本、無語意抽取） | 能查到「哪份文件談過哪個主題」，但**不會有內容摘要** → 要讀內容請開檔。⚠️ 改 `.md` 的**標題**才會動到圖譜（只改內文不影響） |
| `index.html` | ❌ **不進圖** | DOM 結構、區塊順序、`?v=` 版本號 → 一律直接讀檔 |
| `assets/css/**`（6 檔） | ❌ **完全不進圖** | 版面、間距、顏色、z-index、影格動畫 → 直接讀 CSS，別浪費時間查圖 |
| `assets/js/plugins-data.js`、`subtitles-data.js` | ❌ 已在 `.graphifyignore` 排除 | 避免數十個孤立節點；內容問題直接讀檔 |
| `.vtt`（14）、圖片、`.nojekyll` 等 | ❌ 未進圖 | 報告 `Corpus Check → Unclassified` 會列出它們，屬正常 |

### 常用指令（全部本地、免 API key）

```powershell
# 任務開始：理解架構／找影響半徑
Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8
graphify god-nodes --top 10
graphify explain "initCustomVideoPlayer"          # 單一節點（附檔名＋行號）
graphify affected "initCustomVideoPlayer" --depth 2   # 改動影響半徑
graphify query "影片播放器怎麼初始化" --context call --budget 1500
graphify path "A" "B"                             # 兩點關係路徑
graphify diagnose multigraph                      # 圖譜品質診斷

# 任務收尾：有改 JS／tools／preview.js 就跑（零成本、原始碼不外送）
graphify update .
```

> ⚠️ `query` **不加 `--context`** 會撈出整片社群、遠超預算並回 exit code 1（那是超預算提示，不是壞掉）。
> ⚠️ `graph_stats` 是 MCP 專屬工具名，**CLI 沒有**這個子命令。
> ⚠️ `update` 沒有 `--code-only`（v0.9.80 實測 `exit 2`）；旗標一律查 `graphify --help` 的 `update <path>` 段落。

---

## 🗺️ 檔案地圖（要改哪裡）

> 「進圖節點數」為 2026-10-23 建圖值，重跑 `graphify update .` 後以 `GRAPH_REPORT.md` 為準。

| 檔案 | 職責 | 進圖節點數 |
| --- | --- | --- |
| `index.html` | 全站唯一頁面；`<head>` 的主題 bootstrap 白名單（防 FOUC）＋每支資產的 `?v=` | ❌ |
| `assets/js/nebula-canvas.js` | 背景粒子引擎（星空 75／字形 92／餘燼 90 三模式）；速度與刷新率無關（4.20 dt 正規化）；迴圈守衛（4.21） | 40 |
| `assets/js/app.js` | 自訂影片播放器＋UI 互動（God Nodes：`initCustomVideoPlayer`／`getPlayerDOM`／`switchTutorialVideo`／`wakePlayerUI`） | 51 |
| `assets/js/theme.js` | 主題切換（`THEMES`、`DEFAULT_THEME = 'vscode'`）＋導覽 scrollspy（`initNavCurrent`） | 13 |
| `assets/js/i18n.js` | zh-TW／en 雙語（C6 契約，各 115 鍵） | 7 |
| `assets/js/storage.js` | `SafeStorage`（無痕模式安全存取；主題與語言靠它持久化） | 2 |
| `assets/js/config.js` | 站點設定 `SITE_CONFIG`（appName／author／GitHub／defaultLang／`version`／`lastUpdated`／license） | 2 |
| `assets/js/filter.js` | 外掛分類篩選 | 5 |
| `assets/js/developer-notes.js` | 開發者筆記文章資料 | 2 |
| `assets/js/plugins-data.js`、`subtitles-data.js` | 資料檔（字幕由產生器編譯） | ❌ 已排除 |
| `assets/css/*`（6 檔） | variables／base／components／animations／theme-cursor／theme-vscode | ❌ |
| `preview.js`、`preview-site.bat`、`preview-site-stop.bat` | 本機預覽伺服器（可重複執行；`--probe`／`--detach`／`--stop`） | 28 |
| `tools/health-check.js` | C1–C8 原始碼契約（秒級、無相依） | 33 |
| `tools/health-check-browser.js` | B1–B21 瀏覽器實測（CDP 驅動；`--calibrate`／`--only`） | 35 |
| `tools/build-subtitles.js` | VTT → `subtitles-data.js`（**改字幕後必跑**） | 11 |
| `tools/dead-css.js` | 死碼盤點（只報告；`--strict` 可掛 CI） | 11 |
| `tools/update-site-meta.ps1` | 更新「網站更新時間」與各外掛版本號（寫 `config.js` 的 `lastUpdated`＋`index.html` 靜態備援值＋`plugins-data.js` 的 `version`） | 7 |
| `graphify-out/` | 圖譜產物（**ignored，勿 commit**） | — |
| `.graphifyignore` | 圖譜掃描排除清單（目前兩個資料檔） | — |
| `AGENTS.md` | 專案層 AI 規範（圖譜優先／收尾更新圖譜／驗收契約／實測陷阱） | 16（2026-10-23） |
| `README.md` | 本檔：上線／預覽／字幕／健檢／死碼／主題五處同步＋知識圖譜＋檔案地圖 | 14（標題節點） |
| `開發者筆記.md` | 展示用文章內容 | ⚠️ 標題 |

