# AGENTS.md — antigravity-showcase-site

> 一句話：**這個 repo 的知識在圖譜裡。動工前先讀（§1）、改完更新（§2）**；細節見 §4 指標。
> 衝突優先序：安全／授權 ＞ 正確性 ＞ 精簡；harness 全域規範優先。路徑一律相對。
> ⚠️ Cline 只讀**第一個根目錄**的 `AGENTS.md`（2026-10-26 實測）⇒ 在本 repo 工作請**單獨開啟這個資料夾**。

## 這個專案是什麼

- Google Antigravity IDE 外掛生態的**純靜態展示站**（同時說明 Cursor／VS Code 安裝）。
- `index.html` ＋ `assets/css/*` ＋ `assets/js/*`（原生 JS、IIFE）；**無建置、無 npm、無框架**。
- 部署：GitHub Pages —— ⛔ **只有 push 到 `main` 才會更新線上站**；內容公開，一律相對路徑、不寫本機路徑或憑證。
- 本機預覽：`preview-site.bat`。

## 1. 動工前：先讀圖譜

- 讀 `graphify-out/GRAPH_REPORT.md`（約 7 KB，**整份讀也划算**）。
- 要細節才用 CLI（本地、0 元）：`god-nodes --top 10`／`explain "<節點>"`／`affected "<節點>" --depth 2`／`query "…" --context call --budget 1500`。
- ⛔ 永不整檔讀 `graph.json`；`query` 不加 `--context` 會超預算（exit 1，不是壞掉）。
- 要改的檔先讀**檔頭長註解**（`nebula-canvas.js` 等記錄了每版設計理由與實測值）。
- 圖譜與程式碼不一致 ⇒ **以程式碼為準**。
- 沒有 `graphify-out/` ⇒ 先建圖（`extract . --code-only` → `cluster-only . --no-label`），**不可**直接 `update`。

## 2. 動工後：更新圖譜（本節即授權）

- 改了 `assets/js/**`、`tools/**`、`preview.js` ⇒ 收尾**直接跑** `graphify update .`，不必再問；回報「節點／邊／社群變化」＋`Built from commit` 是否＝HEAD。
- 只改 CSS／`index.html`／`.vtt`／圖片 ⇒ 不用跑；改 `*.md` 只有**標題**變動才影響圖（本檔標題增減也會動節點數）。
- ⛔ 不加 `--no-cluster`；`graphify-out/` **不 commit**（否則會被 Pages 一起部署出去）；不要裝 graphify 的 git hook。

## 3. 最貴的紅線（其餘看 §4）

- 動到 `assets/**` 或 `index.html` 的引用 ⇒ **同步 `?v=` 版本號**，否則瀏覽器吃舊快取。
- 粒子引擎：每幀位移／相位**必乘 `dt`**；迴圈只走 `startLoop()`／`stopLoop()`，⛔ 不直接 `animate()`（只有 B 層測得出來）。
- 提交前跑驗收：`node tools/health-check.js`（C1–C8）；動到粒子／播放器／互動再加 `node tools/health-check-browser.js`（B1–B21）。B7–B11 是取樣統計，紅燈先 `--only B7,B8` 重跑再判斷。
- 改粒子設計＝同時改 `tools/health-check-browser.js` 的 `COUNTS` 契約，只改一邊會紅燈。

## 4. 細節去哪找

| 要什麼 | 去哪 |
| :--- | :--- |
| 圖譜通用流程（安裝、旗標、驗證、成本） | skill `graphify-knowledge-graph` |
| 本專案細節備忘（圖譜快照、邊界、紅線全文、反模式、驗收契約） | [`docs/project-notes.md`](docs/project-notes.md) |
| 檔案地圖、主題同步五處、使用者向說明 | [`README.md`](README.md)、[`開發者筆記.md`](開發者筆記.md) |
