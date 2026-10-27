# antigravity-showcase-site：專案細節備忘（非每輪必讀）

> 用途：`AGENTS.md` 只留「概況 ＋ 讀圖／更新圖 ＋ 紅線」；細節放本檔，**不進每輪 context**。
> **讀圖／更新的規則以 [`AGENTS.md`](../AGENTS.md) 為準**，不要從本檔抄。
> 來源：2026-10-27 由 `AGENTS.md` 全文拆出（章節編號沿用原文，故從 §3 起）。

---
## 3. 這個 repo 是什麼

| 項目 | 內容 |
| :--- | :--- |
| 定位 | Google Antigravity IDE 擴充套件生態系的**純靜態展示站**（同時說明 Cursor／VS Code 安裝） |
| 技術棧 | `index.html` ＋ `assets/css/*`（6 檔）＋ `assets/js/*`（原生 JS、IIFE 模組）；**無建置、無 npm、無框架** |
| 部署 | GitHub Pages：`main` 分支、根目錄，由 `.github/workflows/deploy.yml` 部署 |
| 開發 | 本機 `preview-site.bat`；改完存檔、重新整理即生效 |

- ⛔ **只有 push 到 `main` 才會更新線上站**。在特性分支改＝線上不會變 ——「本機好了、線上還是舊的」第一個要懷疑的就是這件事。
- 本站內容**公開部署到網路**：一律相對路徑，⛔ 不要在檔案裡寫死磁碟路徑或本機憑證。

---

## 4. 圖譜快照（2026-10-27 實測）

| 項目 | 值 |
| :--- | :--- |
| 圖譜位置 | `graphify-out/`（`.gitignore` 已排除，**勿 commit** —— 會被 GitHub Pages 部署出去） |
| 規模 | **288** nodes / **510** edges / **15** communities（12 shown、3 thin 省略） |
| 建圖 | `graphify update .`（2026-10-27 同日兩次：先 305／534／16，**刪除退役技能檔後** 288／510／15；2026-10-23 舊版為 288／508／16、commit `b6acbe41`） |
| `Built from commit` | `bd7dcf12（＝HEAD）` |
| 語料 | 17 files · ~56,121 words；25 檔未進圖（`.vtt` 14、`.css` 6 等） |
| 產物大小 | `GRAPH_REPORT.md` **6.6 KB（6,751 bytes）**（可整讀）、`graph.json` **277 KB（284,152 bytes）**（禁整讀）、`graph.html` **240 KB（245,416 bytes）** |
| 節點來源（前 8） | `assets/js/app.js` 51、`assets/js/nebula-canvas.js` 40、`tools/health-check-browser.js` 35、`tools/health-check.js` 33、`preview.js` 28、`AGENTS.md` 16、`README.md` 14、`assets/js/theme.js` 13 |
| 不產生節點 | `index.html`（實測 **0**）、`assets/css/*`（6 檔）、`plugins-data.js`／`subtitles-data.js`（`.graphifyignore` 排除）、`.vtt`（14 檔未分類） |
| 現況判讀 | 只改 CSS／文案／`.vtt` 時圖譜不動；改 `assets/js/**`、`tools/**`、`preview.js` 才需要更新（§2.2） |

> ⚠️ 上表是**快照**。用前先驗（成本極低）：
>
> ```powershell
> Test-Path graphify-out\graph.json                                        # 圖譜存在嗎
> Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8   # Summary ＋ Built from commit
> git rev-parse --short=8 HEAD                                             # 必須 8 碼比；用預設 7 碼會誤報過期
> ```

---

## 5. 這張圖的邊界

| 進圖（附 `檔名:行號`，可靠） | 不進圖（直接開檔，別查圖） |
| :--- | :--- |
| `assets/js/**`、`tools/**`、`preview.js` 的函式／呼叫／`require` | `index.html`（實測 0 節點）、`assets/css/**`（6 檔）、`plugins-data.js`／`subtitles-data.js`、`.vtt`、圖片 |
| `*.md` 只取**標題節點**；⚠️ 只有改**標題**才會動圖譜，改內文不影響 | 檔案內容、CSS 版面、文案全文 |
| 靜態結構（誰呼叫誰、定義在哪） | 「某功能怎麼運作」的行為語意 → 靠 `explain`／`query --context` ＋ 原始碼檔頭註解 |

- 完整邊界表與各檔節點數 → [`README.md`](README.md) 的「🧠 知識圖譜」章節；要改哪個檔 → 同檔「🗺️ 檔案地圖」章節。
- 圖譜是**程式架構圖**，不是行為文件；與原始碼衝突時一律以原始碼為準。

---

## 6. 驗收契約（提交前必跑）

| 改到什麼 | 至少要跑 |
| :--- | :--- |
| 任何 `.js`／主題／i18n／跨檔改動 | `node tools/health-check.js`（**C1–C8**，秒級、無相依；2026-10-26 複驗 8 個 id 齊全） |
| 粒子引擎、影片播放器、生命週期、UI 互動 | 再加 `node tools/health-check-browser.js`（**B1–B21**，約 40 秒，需本機 Chrome／Edge；2026-10-26 複驗 21 個 id 齊全） |
| 主題相關 | 「**新增／修改一個視覺主題要同步五個地方**」（`README.md` 有專節，`C5` 會擋漏） |
| 動到 `assets/**` 或 `index.html` 的引用 | **同步 `index.html` 的 `?v=` 版本號**（快取失效；`C1` 只擋「檔案不存在」） |

```powershell
node tools/health-check.js          # 退出碼 0＝通過、1＝有 FAIL（WARN 不影響）
node tools/health-check-browser.js  # 需要本機 Chrome／Edge
node tools/health-check-browser.js --only B7,B8   # 判斷 B7–B11 抖動時用
```

- **契約值**：`tools/health-check-browser.js` 的 `COUNTS = { antigravity: 75, vscode: 92, cursor: 90 }`（L100，2026-10-26 實測）；視窗 1200×800 時餘燼縮為 **67**（2026-10-26 記載）。**改粒子設計＝同時改程式與測試契約**，只改一邊會直接紅燈。
- **粒子引擎特有規則**：所有「每幀位移／相位」必須乘上 `dt`；迴圈的啟動／停止一律走 `startLoop()`／`stopLoop()`。⛔ 禁止直接呼叫 `animate()` 開鏈 —— 漏掉任一項會讓高刷新率螢幕變快或速度翻倍，**只有 B 層測得出來**。
- **已知抖動（不是壞掉）**：B7–B11 是稀疏取樣統計量（餘燼只有 90 顆），同一份原始碼連跑就會隨機紅燈 ⇒ 看到紅燈先 `--only B7,B8` 重跑再判斷，別急著改程式。
- 驗收完成後別忘了 §2 的圖譜更新。

---

## 7. 反模式（實際踩過）

| # | 反模式 | 後果 | 正確做法 |
| ---: | :--- | :--- | :--- |
| 1 | 用 `git rev-parse --short`（7 碼）比報告的 8 碼 | 誤報「圖譜過期」 | 一律 `--short=8`（§4） |
| 2 | 把 B7–B11 的隨機紅燈當真 | 白改程式、越改越亂 | 先重跑（`--only`），本質是取樣統計量 |
| 3 | 改了 `assets/**` 卻忘了 bump `?v=` | 瀏覽器吃舊快取 → 看起來「改了沒效」 | 同步 `index.html` 的版本號 |
| 4 | 動到「每幀位移」卻沒乘 `dt` | 高刷新率螢幕變快，肉眼難察 | 乘 `dt`；靠 B 層驗 |
| 5 | 直接 `animate()` 開鏈 | 多出第二條 rAF 鏈 → 速度翻倍 | 只走 `startLoop()`／`stopLoop()`（B21 會抓） |
| 6 | 把 `graphify-out/` 納入版控 | 被 GitHub Pages 一起部署出去 | 維持 `.gitignore` 排除 |
| 7 | 對沒有 `graphify-out/` 的專案跑 `update .` | 生出部分圖譜且無警示 | 先 `extract --code-only` ＋ `cluster-only`（§8） |
| 8 | 只改 CSS／文案卻跑 `update .` | 浪費時間、誤以為圖譜有變 | 依 §2.2 判斷；純視覺改動不需跑 |
| 9 | 整檔讀 `graph.json` | 爆 token、且沒有導航價值 | 先讀報告，再 `god-nodes`／`explain` |
| 10 | 把知識寫回技能檔、或又建 `<repo>-maintenance` 技能 | 兩份真相，改一邊忘一邊 | 知識只放**本檔**；查閱型內容放 `README.md` |

> 以上是**實際失敗過**才寫上來的（2026-10-23 前的踩坑記錄，2026-10-26／27 複驗數字）。新踩到的坑請補進本表，不要只留在對話裡。

---

## 8. 首次建圖／重建（`graphify-out/` 不存在時）

```powershell
graphify --version                 # 需 0.9.x（本圖以 0.9.80 建立）
graphify extract . --code-only     # 純 AST、0 元、原始碼不外送
graphify cluster-only . --no-label # 產生 GRAPH_REPORT.md；--no-label 不呼叫 LLM
```

- ⛔ 順序不可顛倒：**先 `extract` 再 `cluster-only`**；沒有 `graphify-out/` 時直接 `update .` 會生出部分圖譜（§2.1）。
- `.graphifyignore` 目前排除 `assets/js/subtitles-data.js`、`assets/js/plugins-data.js`（純字串常數、會產生大量孤立節點）；要排除更多就改那份檔，別改旗標。
- 建完依 §4 更新快照，並在 §9 記一列變更記錄。

---

## 9. 本檔維護

- **本檔＝這個 repo 的唯一真相**：放「沒查就會做錯」的規則。**查閱型內容**（檔案地圖、完整圖譜邊界表、主題五處、指令速查）留在 `README.md`，本檔最多一行指標。
  - 判斷法：**這條規則在我「什麼檔案都還沒讀」時就必須知道嗎？** 是 → 放本檔；否 → 放 `README.md`。
- 數字（節點數、報告大小、契約值）會過期 ⇒ 一律「快照 ＋ 日期 ＋ 查法」；無法確認就寫查法，不要寫死。
- 本檔不含絕對磁碟路徑，repo 搬移或複製到別台機器後仍有效。
- ⛔ 不要再建 `.agents/skills/<repo>-maintenance` 技能；知識只在本檔（2026-10-27 決策）。

### 變更記錄

| 日期 | 變更 | 來源 |
| :--- | :--- | :--- |
| 2026-10-27 | **知識回歸本檔**：`.agents/skills/antigravity-showcase-site-maintenance/` 退役，內容整併成 §1–§9；新增「動工前讀圖譜（§1）／動工後更新圖譜（§2）」兩個必做時點 | 使用者指示：不再用技能維護專案，統一用 `AGENTS.md` |
| 2026-10-27 | 圖譜更新並回填 §4 快照（節點／邊／社群新舊對照與 `Built from commit`） | 收尾依 §2 執行 `graphify update .` |
| 2026-10-26 | 建立技能版（由 repo 根 `AGENTS.md` 全文改寫）：圖譜常數改為複驗值（報告 → **7.1 KB**、節點來源前 8 改實測、`index.html` 0 節點），合併「紅線」「反模式」兩表；`AGENTS.md` 瘦身為派送句 | 使用者指示（Cline 讀不到多根工作區的 AGENTS.md） |

