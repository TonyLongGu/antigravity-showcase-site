---
name: antigravity-showcase-site-maintenance
description: 維護 antigravity-showcase-site（GitHub Pages 純靜態展示站）的專案知識：圖譜讀取紀律、改完自動更新授權、圖譜紅線、C／B 兩層健檢契約與粒子陷阱。當在此站改 JS／CSS／文案或版本號、要查或重建圖譜、要跑 health-check，或提到 nebula-canvas、?v= 快取、B21 時觸發。
---

# antigravity-showcase-site：專案維護（Showcase Site Maintenance）

> 一句話：**這個 repo 的規則都集中在這裡；但數字會過期——§3 一律先驗證再用。**
> **分工**：通用圖譜流程（怎麼裝、怎麼建、旗標怎麼選）→ [`../graphify-knowledge-graph/SKILL.md`](../graphify-knowledge-graph/SKILL.md)。⚠️ 本 repo 內**沒有**那個目錄，它來自全域技能層（`%USERPROFILE%\.agents\skills`）；在那裡兩者是同層鄰居，別把連結當壞掉。本技能只管**這個站的常數、契約與授權**。
> 查閱型資料（檔案地圖、完整邊界表、主題要同步的五個地方）→ repo 根 [`README.md`](../../../README.md)。

---

## 1. 快速觸發

| 類型 | 內容 |
| :--- | :--- |
| **正例** | 「首頁粒子數量改了，順便跑一下健檢」／「`nebula-canvas.js` 的 dt 有沒有漏乘？」 |
| **正例** | 「這站的圖譜過期了嗎？」／「改 `app.js` 會影響哪些檔案？」 |
| **負例** | 「幫我建一份知識圖譜」→ 走 `graphify-knowledge-graph` |
| **負例** | 「antigravity-plugins 的安裝腳本要支援 VSCodium」→ 那是**另一個 repo**，走該 repo 自己的技能 |
| **怎麼被叫用** | repo 根 `AGENTS.md` 只有派送句；也可直接打 `/antigravity-showcase-site-maintenance` |

> **何時不必用本技能**：只問「graphify 怎麼安裝／某個旗標什麼意思」→ `graphify-knowledge-graph`；只是要看網站跑起來沒 → 直接跑 `preview-site.bat`；處理**別的 repo** → 該 repo 自己的規則。本技能**不適用**於跨 repo 的通用圖譜問題。

---

## 2. 這個 repo 是什麼

| 項目 | 內容 |
| :--- | :--- |
| 定位 | Google Antigravity IDE 擴充套件生態系的**純靜態展示站**（同時說明 Cursor／VS Code 安裝） |
| 技術棧 | `index.html` ＋ `assets/css/*`（6 檔）＋ `assets/js/*`（原生 JS、IIFE 模組）；**無建置、無 npm、無框架** |
| 部署 | GitHub Pages：`main` 分支、根目錄，由 `.github/workflows/deploy.yml` 部署 |
| 開發 | 本機 `preview-site.bat`；改完存檔、重新整理即生效 |

- ⛔ **只有 push 到 `main` 才會更新線上站**。在特性分支改＝線上不會變——「本機好了、線上還是舊的」第一個要懷疑的就是這件事。
- 本站內容**公開部署到網路**：一律相對路徑，⛔ 不要在檔案裡寫死磁碟路徑或本機憑證。

---

## 3. 圖譜狀態（2026-10-26 複驗）

| 項目 | 值 |
| :--- | :--- |
| 圖譜位置 | `graphify-out/`（已被 `.gitignore` 排除，**勿 commit**——會被 GitHub Pages 一起部署出去） |
| 規模 | **288** nodes / **508** edges / **16** communities（13 shown、3 thin omitted）；95% EXTRACTED · 5% INFERRED |
| 建圖 commit | `b6acbe41`（報告日期 2026-10-23）；當日 HEAD＝`af16ba6` ⇒ **報告已落後**（其間只改文案／時間戳，屬無害過期） |
| 產物大小 | `GRAPH_REPORT.md` **7.1 KB**（可整讀）、`graph.json` **279 KB**（禁整讀）、`graph.html` **242 KB** |
| 節點來源（前 8） | `app.js` 51、`nebula-canvas.js` 40、`health-check-browser.js` 35、`health-check.js` 33、`preview.js` 28、`AGENTS.md` 16、`README.md` 14、`theme.js` 13 |
| 不產生節點 | `index.html`（實測 **0**）、`assets/css/*`（6 檔）、`plugins-data.js`／`subtitles-data.js`（`.graphifyignore` 排除）、`.vtt`（14 檔未分類） |
| 現況判讀 | 只改 CSS／文案／`.vtt` 時圖譜不動；改 `assets/js/**`、`tools/**`、`preview.js` 才需要更新（§5） |

> ⚠️ 上表是**快照**。用前先驗（成本極低）：
>
> ```powershell
> Test-Path graphify-out\graph.json          # 圖譜存在嗎
> Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8   # Summary ＋ Built from commit
> git rev-parse --short=8 HEAD               # 必須用 8 碼比；用預設 7 碼比會誤報過期
> ```

---

## 4. 讀取紀律（token 預算鐵律）

1. **先讀** `graphify-out/GRAPH_REPORT.md`（7.1 KB，整份讀也划算）→ 掌握 **Community Hubs** 與 **God Nodes**。
2. 要細節才用 CLI（全部本地、免 API key、**0 元**）：

   | 目的 | 指令 |
   | :--- | :--- |
   | 架構樞紐 | `graphify god-nodes --top 10` |
   | 單一節點（附檔名＋行號） | `graphify explain "initCustomVideoPlayer"` |
   | **改動影響半徑** | `graphify affected "initCustomVideoPlayer" --depth 2` |
   | 提問（BFS） | `graphify query "影片播放器怎麼初始化" --context call --budget 1500` |
   | 兩點關係路徑 | `graphify path "A" "B"` |
   | 圖譜品質診斷 | `graphify diagnose multigraph` |

3. **永不整檔讀** `graph.json`（279 KB 起跳，且會隨程式成長）。
4. 確定要動手時才開原始碼：用圖譜給的 `檔名:行號` 直接跳，不要整目錄翻。
5. 先讀會改到的檔**檔頭長註解**（`nebula-canvas.js` 等記錄了每版設計理由與實測數據），避免改壞已調校的數值。
6. 圖譜與原始碼有出入 ⇒ **以原始碼為準**，收尾依 §5 更新。

> ⚠️ `query` **不加 `--context`** 會撈出整片社群、遠超預算並回 exit code 1（那是**超預算提示**，不是壞掉）。
> ⚠️ `graph_stats` 是 MCP 專屬工具名，**CLI 沒有**這個子命令。

---

## 5. 改完自動更新（本節即授權）

### 5.1 決策表

| 專案現況 | 指令 | 成本 |
| :--- | :--- | :--- |
| **已有** `graphify-out/`（本站現況） | `graphify update .` | 0（純 AST、原始碼不外送） |
| **沒有** `graphify-out/` | `graphify extract . --code-only` **＋** `graphify cluster-only . --no-label` | 0 |
| 只想重新分群／產生報告 | `graphify cluster-only . --no-label` | 0 |
| 節點數變少被「縮圖保護」拒絕 | 同上再加 `--force` | 0 |

> ⛔ **嚴禁**對「沒有 `graphify-out/`」的專案執行 `graphify update .` —— 會生出只含變更檔的**部分圖譜**，且報告不會有任何警示。

### 5.2 什麼時候要更新（本專案的固定收尾）

| 本次改動內容 | 收尾動作 |
| :--- | :--- |
| `assets/js/**`、`tools/**`、`preview.js` | **主動執行** `graphify update .`（零成本、可還原 → 屬自主執行範圍，**不必再問使用者**） |
| `*.md`（含 `AGENTS.md`／本技能／`README.md`／`開發者筆記.md`） | **標題有變**才會動到圖譜（只改內文不影響）→ 同批有程式改動就一起跑；純文件改動可延後 |
| 只動 `assets/css/**`、`index.html`、`.vtt`、圖片 | 圖譜不會變 → 不必跑（跑了也只會回 `No code-graph topology changes detected; outputs left untouched.`） |

### 5.3 更新後必須回報（並做交叉驗證）

```powershell
# 報告摘要（只讀報告，不讀 graph.json）
Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8

# 交叉驗證：報告與圖譜一致（節點數相符、每個節點都有 community）
$j = Get-Content graphify-out\graph.json -Raw -Encoding UTF8 | ConvertFrom-Json
"$($j.nodes.Count) nodes / $(($j.nodes | Where-Object { $_.PSObject.Properties.Name -contains 'community' }).Count) 帶 community / $($j.links.Count) edges"
```

回報必須含：**節點／邊／社群數（新舊對照）**、`Built from commit` 是否＝HEAD。

### 5.4 紅線（違反會靜默壞掉）

- `graphify-out/` **必須維持被 `.gitignore` 排除**。動手前先確認：`git check-ignore -v graphify-out/graph.json`
- ⛔ **不要安裝 Graphify 的 git hook**：commit 觸發會產生「部分圖譜」，且失敗是靜默的。
- ⛔ **`update` 沒有 `--code-only`**（v0.9.80 實測會 `exit 2`）；它只吃 `--force`／`--no-cluster`。旗標一律查 `graphify --help` 的 `update <path>` 段落，別憑記憶加。
- ⛔ **不要加 `--no-cluster`**：會寫出「沒有社群」的 `graph.json`，而報告仍留著舊分群文字 → 兩者不一致。
- **語意層預設不啟用**：`graphify label`、HTML／Markdown／圖片進圖都會呼叫 LLM、**可能產生費用** → 需先取得使用者同意。更新時若出現 `community set changed since labeling …`，那是「社群名沿用 hub 名」的提示、**不是錯誤**，照實回報即可。本機目前**未設** `GEMINI_API_KEY`／`GOOGLE_API_KEY` 等 LLM key。
- 更新前工具會自動把既有分群備份到 `graphify-out\<日期>\`（本站已發生過，屬正常行為、同樣不進版控）。

---

## 6. 這張圖的邊界

| 進圖（附 `檔名:行號`，可靠） | 不進圖（直接開檔，別查圖） |
| :--- | :--- |
| `assets/js/**`、`tools/**`、`preview.js` 的函式／呼叫／`require` | `index.html`（實測 0 節點）、`assets/css/**`（6 檔）、`plugins-data.js`／`subtitles-data.js`、`.vtt`、圖片 |
| `*.md` 只取**標題節點**（`AGENTS.md` 16、`README.md` 14）；⚠️ 只有改**標題**才會動圖譜，改內文不影響 | 檔案內容、CSS 版面、文案全文 |
| 靜態結構（誰呼叫誰、定義在哪） | 「某功能怎麼運作」的行為語意 → 靠 `explain`／`query --context` ＋ 原始碼檔頭註解 |

- 完整邊界表與各檔節點數 → [`README.md`](../../../README.md) 的「🧠 知識圖譜」章節；要改哪個檔 → 同檔「🗺️ 檔案地圖」章節。
- 圖譜是**程式架構圖**，不是行為文件；與原始碼衝突時一律以原始碼為準。

---

## 7. 驗收契約（提交前必跑）

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
- **粒子引擎特有規則**：所有「每幀位移／相位」必須乘上 `dt`；迴圈的啟動／停止一律走 `startLoop()`／`stopLoop()`。⛔ 禁止直接呼叫 `animate()` 開鏈——漏掉任一項會讓高刷新率螢幕變快或速度翻倍，**只有 B 層測得出來**。
- **已知抖動（不是壞掉）**：B7–B11 是稀疏取樣統計量（餘燼只有 90 顆），同一份原始碼連跑就會隨機紅燈 ⇒ 看到紅燈先 `--only B7,B8` 重跑再判斷，別急著改程式。
- 驗收完成後別忘了 §5 的圖譜更新。

---

## 8. 反模式（實際踩過）

| # | 反模式 | 後果 | 正確做法 |
| ---: | :--- | :--- | :--- |
| 1 | 用 `git rev-parse --short`（7 碼）比報告的 8 碼 | 誤報「圖譜過期」 | 一律 `--short=8`（§3） |
| 2 | 把 B7–B11 的隨機紅燈當真 | 白改程式、越改越亂 | 先重跑（`--only`），本質是取樣統計量 |
| 3 | 改了 `assets/**` 卻忘了 bump `?v=` | 瀏覽器吃舊快取 → 看起來「改了沒效」 | 同步 `index.html` 的版本號 |
| 4 | 動到「每幀位移」卻沒乘 `dt` | 高刷新率螢幕變快，肉眼難察 | 乘 `dt`；靠 B 層驗 |
| 5 | 直接 `animate()` 開鏈 | 多出第二條 rAF 鏈 → 速度翻倍 | 只走 `startLoop()`／`stopLoop()`（B21 會抓） |
| 6 | 把 `graphify-out/` 納入版控 | 被 GitHub Pages 一起部署出去 | 維持 `.gitignore` 排除 |
| 7 | 對沒有 `graphify-out/` 的專案跑 `update .` | 生出部分圖譜且無警示 | 先 `extract --code-only` ＋ `cluster-only`（§5.1） |
| 8 | 只改 CSS／文案卻跑 `update .` | 浪費時間、誤以為圖譜有變 | 依 §5.2 判斷；純視覺改動不需跑 |
| 9 | 整檔讀 `graph.json` | 爆 token、且沒有任何導航價值 | 先讀報告，再 `god-nodes`／`explain` |

> 以上是**實際失敗過**才寫上來的（本站 2026-10-23 前的踩坑記錄，2026-10-26 複驗數字）。新踩到的坑請補進本表，不要只留在對話裡。

---

## 9. 首次建圖／重建（`graphify-out/` 不存在時）

```powershell
graphify --version                 # 需 0.9.x（本圖以 0.9.x 建立）
graphify extract . --code-only     # 純 AST、0 元、原始碼不外送
graphify cluster-only . --no-label # 產生 GRAPH_REPORT.md；--no-label 不呼叫 LLM
```

- ⛔ 順序不可顛倒：**先 `extract` 再 `cluster-only`**；沒有 `graphify-out/` 時直接 `update .` 會生出部分圖譜（§5.1）。
- `.graphifyignore` 目前排除 `assets/js/subtitles-data.js`、`assets/js/plugins-data.js`（純字串常數、會產生大量孤立節點）；要排除更多就改那份檔，別改旗標。
- 建完依 §3 更新本技能的常數表，並在 §10 記一列變更記錄。

---

## 10. 本技能維護

- **分工原則（不要再長回去）**：本技能放「沒查就會做錯」的規則；**查閱型內容**（檔案地圖、完整圖譜邊界表、主題五處、指令速查）留在 `README.md`，本技能最多一行指標。
  - 判斷法：**這條規則在我「什麼檔案都還沒讀」時就必須知道嗎？** 是 → 放本技能；否 → 放 `README.md`。
- repo 根 `AGENTS.md` 只剩「叫用本技能」的派送句，**不承載知識** → 要改規則只改本檔。
  - 理由（實測 2026-10-26）：Cline 在**多根工作區**只讀得到第一個根目錄的 `AGENTS.md`；本 repo 的 `.agents/skills/` 會被 `antigravity-toolbox` 同步成 `%USERPROFILE%\.agents\skills` 的 junction，技能才進得了單根 Cline 的清單。
- §3、§7 的數字（節點數、報告大小、契約值）會過期：**更新圖譜或改契約後順手更新並改日期**；無法確認就寫「查法」，不要寫死。
- 本檔不含絕對磁碟路徑，repo 搬移或複製到別台機器後仍有效。

### 變更記錄

| 日期 | 變更 | 來源 |
| :--- | :--- | :--- |
| 2026-10-26 | 建立。由 repo 根 `AGENTS.md`（§0–§6 全文）改寫成技能：圖譜常數改為複驗值（報告 10–20 KB → **7.1 KB**、節點來源前 8 名改為實測、`index.html` 0 節點），並合併「紅線」「反模式」兩表；`AGENTS.md` 瘦身為派送句 | 使用者指示（Cline 讀不到多根工作區的 AGENTS.md）／本機 `graphify-out` 實測 |

