---
name: antigravity-showcase-site-maintenance
description: 維護 antigravity-showcase-site（純靜態展示站、GitHub Pages 部署）的專案知識：圖譜讀取紀律、改完自動更新授權、粒子引擎紅線、驗收契約 C1–C8／B1–B21、快取版號與反模式。當在此 repo 改 assets/js／主題／文案、要跑 health-check、要更新圖譜，或提到 nebula-canvas、COUNTS、?v= 時觸發。
---

# antigravity-showcase-site：專案維護

> 一句話：**這個 repo 的「事實」都在這裡；數字會過期——§3 一律先驗證再用。**
> 分工：圖譜通用流程（安裝、旗標、成本）→ skill `graphify-knowledge-graph`；技能格式 → `skill-authoring`。本技能只管**這個 repo**。
> 本檔＝專案知識落點：repo 根 `AGENTS.md` 只有技能索引；`docs/project-notes.md` 已於 2026-10-28 併回本檔後**刪除**（回收筒可還原），⛔ 不要再建平行副本。

---

## 1. 快速觸發

| 類型 | 內容 |
| :--- | :--- |
| **正例** | 「改首頁的粒子效果」／「新增一個視覺主題要改哪幾處？」／「health-check 紅燈了」 |
| **正例** | 「網站更新了但線上還是舊的」／「這個 repo 的圖譜過期了嗎？」 |
| **負例** | 「graphify 怎麼安裝／`--no-viz` 是什麼」→ `graphify-knowledge-graph` |
| **負例** | 「antigravity-plugins 外掛要改什麼」→ 那個 repo 自己的技能 |
| **怎麼被叫用** | repo 根 `AGENTS.md` 的**技能索引**會指向本技能；也可直接打 `/antigravity-showcase-site-maintenance`。⚠️ 清單沒看到 ⇒ 直讀 `.agents/skills/antigravity-showcase-site-maintenance/SKILL.md` |

> **何時不必用（不適用）**：只問「怎麼建圖／旗標」→ `graphify-knowledge-graph`；只是改錯字、調一行 CSS 且不談驗收 → 直接改、不要叫用本技能。

---

## 2. 這個 repo 是什麼

| 項目 | 內容 |
| :--- | :--- |
| 定位 | Google Antigravity IDE 擴充套件生態的**純靜態展示站**（同時說明 Cursor／VS Code 安裝） |
| 技術棧 | `index.html` ＋ `assets/css/*`（6 檔）＋ `assets/js/*`（原生 JS、IIFE）；**無建置、無 npm、無框架** |
| 部署 | GitHub Pages：`main` 分支、根目錄，由 `.github/workflows/deploy.yml` 部署 |
| 開發 | 本機 `preview-site.bat`；改完存檔、重新整理即生效 |

- ⛔ **只有 push 到 `main` 才會更新線上站**。在特性分支改＝線上不會變 ——「本機好了、線上還是舊的」第一個要懷疑的就是這件事。
- 本站**公開部署到網路**：一律相對路徑，⛔ 不寫死磁碟路徑或本機憑證。

---

## 3. 圖譜常數（2026-10-28 複驗，graphify 0.9.80）

| 項目 | 值 |
| :--- | :--- |
| 圖譜位置 | `graphify-out/`（`.gitignore` 已排除，**勿 commit** —— 會被 Pages 部署出去） |
| 規模 | **287** nodes / **507** edges / **17** communities（12 shown、5 thin 省略） |
| 建圖標記 | `Built from commit` `1c2ad856`＝**HEAD**（2026-10-28 刪除 `project-notes.md` 後重跑 `update`；前版 289／509／17、`95b53d32`） |
| 語料 | 18 files · ~56,075 words；25 檔未分類（`.vtt` 14、`.css` 6 等） |
| 產物大小 | `GRAPH_REPORT.md` **6.8 KB**（可整讀）、`graph.json` **280 KB**（禁整讀）、`graph.html` **241 KB** |
| 節點來源（TOP） | `assets/js/app.js` 51、`assets/js/nebula-canvas.js` 40、`tools/health-check-browser.js` 35、`tools/health-check.js` 33、`preview.js` 28、`README.md` 14、`assets/js/theme.js` 13、**本技能 `SKILL.md` 13**、`tools/build-subtitles.js` 11、`tools/dead-css.js` 11 |
| 不產生節點 | `index.html`（實測 **0**）、`assets/css/*`（6 檔）、`plugins-data.js`／`subtitles-data.js`（`.graphifyignore` 排除）、`.vtt`（14 檔） |
| ⚠️ `*.md` 特性 | **只取標題節點**：改**標題**才動圖，改內文不會。**本技能自己的標題也在圖裡**（13 節點）⇒ 增刪章節後要跑 `update` |

> ⚠️ 上表是**快照**。用前先驗：
>
> ```powershell
> Test-Path graphify-out\graph.json                                        # 圖譜存在嗎
> Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8   # Summary ＋ Built from commit
> git rev-parse --short=8 HEAD                                             # 必須 8 碼比；用預設 7 碼會誤報過期
> ```

---

## 4. 讀取紀律（省 token）

1. 報告只有 **6.3 KB** ⇒ **整份讀也划算**。
2. 要細節才用 CLI（本地、0 元）：`god-nodes --top 10`／`explain "<節點>"`／`affected "<節點>" --depth 2`／`query "…" --context call --budget 1500`。
3. ⛔ **永不整檔讀** `graph.json`（282 KB）。
4. `query` 不加 `--context` 會超預算（exit 1，**不是壞掉**）。
5. 要改的檔先讀**檔頭長註解**（`nebula-canvas.js` 等記錄了每版設計理由與實測值）。
6. 圖譜與程式碼不一致 ⇒ **以程式碼為準**，收尾依 §5 更新。

---

## 5. 改完自動更新（**本節即授權**）

- 改了 `assets/js/**`、`tools/**`、`preview.js` ⇒ 收尾**直接跑** `graphify update .`，不必再問；回報節點／邊／社群變化 ＋ `Built from commit` 是否＝HEAD。
- 只改 **CSS／`index.html`／`.vtt`／圖片** ⇒ **不用跑**。
- ⚠️ 改 `*.md` 的**標題**（含本技能、`AGENTS.md`、`README.md`、`docs/*.md`）⇒ **要跑**（`*.md` 會產生標題節點，節點數會變）；只改內文 ⇒ 不用。
- 邊界：

| 情況 | 做法 |
| :--- | :--- |
| 一般更新 | `graphify update .` |
| 無拓撲變更 | 回 `No code-graph topology changes`、`$LASTEXITCODE`＝`0` ⇒ 正常，不重跑 |
| 節點變少被縮圖保護擋下 | 才加 `--force` |
| 想順手重分群 | ⛔ 不加 `--no-cluster` |
| `graphify-out/` 不存在 | ⛔ 不可直接 `update` ⇒ 見 §9 |
| 產物 | **不 commit**（會被 GitHub Pages 一起部署出去）；也不要裝 graphify 的 git hook |

---

## 6. 圖譜邊界

| 進圖（附 `檔名:行號`，可靠） | 不進圖（直接開檔，別查圖） |
| :--- | :--- |
| `assets/js/**`、`tools/**`、`preview.js` 的函式／呼叫／`require` | `index.html`（實測 **0** 節點）、`assets/css/**`（6 檔）、`plugins-data.js`／`subtitles-data.js`、`.vtt`、圖片 |
| `*.md` 只取**標題節點**（改標題才動圖，改內文本影響） | 檔案內容、CSS 版面、文案全文 |
| 靜態結構（誰呼叫誰、定義在哪） | 「某功能怎麼運作」的行為語意 → 靠 `explain`／`query --context` ＋ 原始碼檔頭註解 |

- 完整邊界表與各檔節點數 → `README.md` 的「🧠 知識圖譜」章節；要改哪個檔 → 同檔「🗺️ 檔案地圖」章節。
- 圖譜是**程式架構圖**，不是行為文件；與原始碼衝突時一律以原始碼為準。

---

## 7. 驗收契約（提交前必跑）

| 改到什麼 | 至少要跑 |
| :--- | :--- |
| 任何 `.js`／主題／i18n／跨檔改動 | `node tools/health-check.js`（**C1–C8**，秒級、無相依；2026-10-26 複驗 8 個 id 齊全） |
| 粒子引擎、影片播放器、生命週期、UI 互動 | 再加 `node tools/health-check-browser.js`（**B1–B21**，約 40 秒，需本機 Chrome／Edge） |
| 主題相關 | 「**新增／修改一個視覺主題要同步五個地方**」（`README.md` 有專節，`C5` 會擋漏） |
| 動到 `assets/**` 或 `index.html` 的引用 | **同步 `index.html` 的 `?v=` 版本號**（快取失效；`C1` 只擋「檔案不存在」） |

```powershell
node tools/health-check.js          # 退出碼 0＝通過、1＝有 FAIL（WARN 不影響）
node tools/health-check-browser.js  # 需要本機 Chrome／Edge
node tools/health-check-browser.js --only B7,B8   # 判斷 B7–B11 抖動時用
```

- **契約值**：`tools/health-check-browser.js` 的 `COUNTS = { antigravity: 75, vscode: 92, cursor: 90 }`（L100，2026-10-26 實測）；視窗 1200×800 時餘燼縮為 **67**。**改粒子設計＝同時改程式與測試契約**，只改一邊直接紅燈。
- **粒子引擎特有規則**：所有「每幀位移／相位」必須乘 `dt`；迴圈的啟動／停止一律走 `startLoop()`／`stopLoop()`。⛔ 禁止直接呼叫 `animate()` 開鏈 —— 漏任一項會讓高刷新率螢幕變快或速度翻倍，**只有 B 層測得出來**。
- **已知抖動（不是壞掉）**：B7–B11 是稀疏取樣統計量（餘燼只有 90 顆），同一份原始碼連跑也會隨機紅燈 ⇒ 先 `--only B7,B8` 重跑再判斷。
- 驗收完成後別忘了 §5 的圖譜更新。

---

## 8. 反模式（實際踩過）

| # | 反模式 | 後果 | 正確做法 |
| :-: | :--- | :--- | :--- |
| 1 | 用 `git rev-parse --short`（7 碼）比報告 8 碼 | 誤報「圖譜過期」 | 一律 `--short=8`（§3） |
| 2 | 把 B7–B11 的隨機紅燈當真 | 白改程式、越改越亂 | 先 `--only B7,B8` 重跑；本質是取樣統計量 |
| 3 | 改了 `assets/**` 卻忘了 bump `?v=` | 瀏覽器吃舊快取 → 「改了沒效」 | 同步 `index.html` 版本號 |
| 4 | 動到「每幀位移」卻沒乘 `dt` | 高刷新率螢幕變快，肉眼難察 | 乘 `dt`；靠 B 層驗 |
| 5 | 直接 `animate()` 開鏈 | 多出第二條 rAF 鏈 → 速度翻倍 | 只走 `startLoop()`／`stopLoop()`（B21 會抓） |
| 6 | 把 `graphify-out/` 納入版控 | 被 GitHub Pages 一起部署出去 | 維持 `.gitignore` 排除 |
| 7 | 對沒有 `graphify-out/` 的專案跑 `update .` | 生出部分圖譜且無警示 | 先 `extract --code-only` ＋ `cluster-only`（§9） |
| 8 | 只改 CSS／文案卻跑 `update .` | 浪費時間、誤以為圖譜有變 | 依 §5 判斷；純視覺改動不需跑 |
| 9 | 整檔讀 `graph.json` | 爆 token、沒有導航價值 | 先讀報告，再 `god-nodes`／`explain` |
| 10 | 把知識寫回 `AGENTS.md`、或又建 `docs/project-notes.md` 平行副本 | 兩份真相，改一邊忘一邊（2026-10-27／10-28 各一次） | 知識只放技能（可多支）；`AGENTS.md` 只放索引 |

> 以上是**實際失敗過**才寫上來的（2026-10-23 前的踩坑 ＋ 2026-10-26／27／28 複驗）。新踩到的坑補進本表。

---

## 9. 首次建圖／重建（`graphify-out/` 不存在時）

```powershell
graphify --version                 # 需 0.9.x（本圖以 0.9.80 建立）
graphify extract . --code-only     # 純 AST、0 元、原始碼不外送
graphify cluster-only . --no-label # 產生 GRAPH_REPORT.md；--no-label 不呼叫 LLM
```

- ⛔ 順序不可顛倒：**先 `extract` 再 `cluster-only`**；沒有 `graphify-out/` 時直接 `update .` 會生出部分圖譜。
- `.graphifyignore` 目前排除 `assets/js/subtitles-data.js`、`assets/js/plugins-data.js`（純字串常數、會產生大量孤立節點）；要排除更多就改那份檔，別改旗標。
- 建完依 §3 更新快照，並在 §10 記一列變更記錄。

---

## 10. 本技能維護

- 本技能＝這個 repo 的**專案知識主技能**：常數、授權、邊界、驗收契約、反模式在這裡；根 `AGENTS.md` 只做**索引＋每輪必做**，**不承載知識**。
- **可擴充（設計前提）**：repo 之後可再加其他技能（動畫／i18n／部署…）。新增時：① 補 `AGENTS.md` 技能索引 ② 在該技能 §1 寫分流 ③ 同一條規則不得兩邊各留一份。
- **取捨**：若技能沒被叫用，§5 的授權與 §6／§7 的鐵律不在 context；`AGENTS.md` 的技能索引就是為了讓「先叫用技能」每輪可見。
- 數字（節點數、產物大小、契約值）會過期 ⇒ 一律「快照 ＋ 日期 ＋ 查法」；無法確認就寫查法，不要寫死。
- **查閱型內容**（檔案地圖、完整圖譜邊界表、主題五處、使用者向說明）留在 `README.md`／`開發者筆記.md`，本檔最多一行指標。
- 本檔不含絕對磁碟路徑。

### 變更記錄

| 日期 | 變更 | 來源 |
| :--- | :--- | :--- |
| 2026-10-28 | **架構切回「技能索引 ＋ 本技能」**：`AGENTS.md`（1,940 字元／42 行）瘦身為條例式索引，`docs/project-notes.md`（§3–§9）整併回本檔後**刪除**（回收筒）；§3 改記 **287／507／17**、`Built from 1c2ad856`（＝HEAD）；新增「`*.md` 只取標題節點、本技能標題也在圖裡」的更新規則 | 使用者指示：三 repo 統一規格（極精簡 AGENTS ＋ 專案技能） |
| 2026-10-27 | 知識回歸 `AGENTS.md`＋`docs/project-notes.md`，技能退役（本檔前身 `.agents/skills/antigravity-showcase-site-maintenance/`） | 使用者指示（當時偏好單一 `AGENTS.md`） |
| 2026-10-27 | 圖譜更新：305／534／16 → **288／510／15**（刪除退役技能檔後） | 收尾依 §2 執行 `graphify update .` |
| 2026-10-26 | 建立技能版（由 repo 根 `AGENTS.md` 全文改寫）：圖譜常數改為複驗值、合併「紅線」「反模式」兩表 | 使用者指示 |

