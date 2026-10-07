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
node tools/health-check-browser.js               # B1–B20，約 40 秒
node tools/health-check-browser.js --calibrate   # 負對照自我校準：故意注入缺陷，證明它真的抓得到
node tools/health-check-browser.js --only B7,B8  # 只跑指定項目（除錯用）
node tools/health-check-browser.js --keep-profile  # 保留暫存 profile
```

驗什麼：粒子顆數契約（各模式每幀 fills）、殘影、視窗縮放的密度同步、餘燼的滑鼠互動
（推力存在／不越過 160px／無順勢帶橫向漂移／提亮不變暗）、像素層（無烙暗）、生命週期
（切風格、reduced-motion 單幀、pause／resume）、rAF 效能、console 例外。

它會自己開一個**隨機埠**的臨時靜態伺服器（不動 `preview.js` 的 3300）、自動偵測 Chrome／Edge／Chromium，
測完自動清掉暫存 profile；**找不到瀏覽器或 Node < 22 時一律 SKIP 並以退出碼 `0` 結束**（不誤報）。
退出碼：`0` = 無 FAIL、`1` = 有 FAIL。涵蓋邊界（真實手感、高刷新率、DPR≠1、Safari／Firefox、觸控）寫在腳本檔頭。

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

