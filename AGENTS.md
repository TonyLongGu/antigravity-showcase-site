# AGENTS.md — antigravity-showcase-site（專案層規範）

> 若你的 Harness／工作區另有**全域或使用者層**規範，**衝突時以全域為準**（安全／授權 ＞ 正確性 ＞ 精簡）。
> 本檔只放「**AI 必須自己知道、不能靠查**」的東西：① 圖譜優先　② 改完主動更新圖譜　③ 驗收契約　④ 實測陷阱。
> **查閱型資料不放這裡**（檔案地圖、完整圖譜邊界、指令速查）→ 見 `README.md` 的「🧠 知識圖譜」「🗺️ 檔案地圖」兩節。

---

## 0. 專案一句話

Google Antigravity IDE 擴充套件生態系的**純靜態展示站**（同時說明 Cursor／VS Code 安裝），
以 **GitHub Pages** 託管：`main` 分支、根目錄，由 `.github/workflows/deploy.yml` 部署。

- **技術棧**：`index.html` ＋ `assets/css/*`（6 檔）＋ `assets/js/*`（原生 JS、IIFE 模組）
  → **沒有建置步驟、沒有 npm 相依、沒有框架**；改完存檔、重新整理即生效。
- **部署**：只有 push 到 `main` 才會更新線上站。改在特性分支＝**線上不會變**（「本機好了、線上還是舊的」最常見原因）。
- **可攜性**：本檔與所有指令都用**相對路徑**；不要在任何檔案寫死磁碟路徑。

---

## 1. 圖譜優先（本專案最重要的規則）

> **本專案已建好知識圖譜（Graphify）。凡涉及「理解架構／找檔案／改功能／評估影響半徑」的任務，
> 一律先讀圖譜，再讀原始碼。使用者不需要引用、也不需要提醒任何 skill——看到任務就自己讀。**

### 1.1 圖譜在哪、什麼時候讀

| 路徑 | 內容 | 讀取時機 |
| :--- | :--- | :--- |
| `graphify-out/GRAPH_REPORT.md` | 摘要（節點／邊／社群數、EXTRACTED 比例、建圖 commit）＋ Community Hubs ＋ God Nodes ＋ 意外關聯 | **第一個讀它**（10–20 KB，多數問題這份就夠） |
| `graphify-out/graph.html` | 互動式視覺化 | 使用者要「看圖」時才提 |
| `graphify-out/graph.json` | 完整圖（0.26–1.8 MB） | **永不整檔讀**（幾乎必然超 token 預算） |

### 1.2 讀取順序（token 預算鐵律）

1. 讀 `graphify-out/GRAPH_REPORT.md` → 先掌握 **Community Hubs（樞紐檔）** 與 **God Nodes（核心抽象）**。
2. 要細節才用 CLI 查（**全部本地、免 API key**）：

   | 目的 | 指令 |
   | :--- | :--- |
   | 架構樞紐 | `graphify god-nodes --top 10` |
   | 單一節點（附檔名＋行號） | `graphify explain "initCustomVideoPlayer"` |
   | **改動影響半徑** | `graphify affected "initCustomVideoPlayer" --depth 2` |
   | 提問（BFS） | `graphify query "影片播放器怎麼初始化" --context call --budget 1500` |
   | 兩點關係路徑 | `graphify path "A" "B"` |
   | 圖譜品質診斷 | `graphify diagnose multigraph` |

3. 只有確定要動手改時，才打開對應原始碼檔（用圖譜給的**檔名＋行號**直接跳，不要整目錄翻）。

> ⚠️ `query` **不加 `--context`** 會撈出整片社群、遠超預算並回 exit code 1（那是超預算提示，不是壞掉）。
> ⚠️ `graph_stats` 是 MCP 專屬工具名，**CLI 沒有**這個子命令。

### 1.3 什麼時候「不必」先讀圖譜

- 純 **CSS 版面／視覺**調整（CSS 完全不進圖，見 §2）
- 只改**文字／文案**（`i18n.js`、`README.md`、`開發者筆記.md`）
- 已經明確知道要改哪個檔的哪一行（例如使用者直接指定）

### 1.4 每次啟動的自我檢查（建議、成本極低）

```powershell
# 圖譜是否存在
Test-Path graphify-out\graph.json

# 圖譜新不新（報告存的是 8 碼前綴 → 必須用 --short=8；用預設 7 碼比會誤報過期）
$rep  = (Select-String graphify-out\GRAPH_REPORT.md -Pattern 'Built from commit: `([0-9a-f]+)`').Matches[0].Groups[1].Value
$head = git rev-parse --short=8 HEAD
if ($head -like "$rep*") { "圖譜與 HEAD 一致（$rep）" } else { "圖譜落後：built $rep vs HEAD $head" }
```

- 「落後」有兩種：**無害過期**（其間只改 CSS／文件／設定，圖內容沒變）與**真過期**（動過 JS）。
  後者依 §3 收尾更新即可，**不必為此停下任務**。
- 圖譜只是**快照**：與原始碼有出入時，**以原始碼為準**，並在收尾更新圖譜。

---

## 2. 圖譜的邊界（只記三件事）

- **只有程式碼進圖**：`assets/js/**`、`tools/**`、`preview.js`。
  `index.html`、`assets/css/**`（6 檔）、`plugins-data.js`／`subtitles-data.js`、`.vtt`／圖片**一律不進圖** → 直接讀檔，別浪費時間查圖。
- `.md`（含本檔）只有**標題節點**、沒有內容摘要 → 要內容請開檔；⚠️ 只有改**標題**才會動到圖譜（改內文不影響）。
- 圖譜是**程式架構圖**，不是行為文件：「某功能怎麼運作」靠 `explain`／`query --context` ＋ 原始碼**檔頭長註解**
  （`nebula-canvas.js` 等記錄了每版的設計理由與實測數據——改動前先讀，能避免重複踩坑或改壞已調校的數值）。
- 📌 完整邊界表（含現況 288 節點＝code 247／document 34／concept 7、各檔進圖節點數、`Unclassified` 說明）
  → `README.md` 的「🧠 知識圖譜」章節。

---

## 3. 建圖與更新圖譜（**改完程式碼的收尾動作**）

### 3.1 決策表

| 專案現況 | 指令 | 成本 |
| :--- | :--- | :--- |
| **已有** `graphify-out/`（本站現況） | `graphify update .` | 0（純 AST、原始碼不外送） |
| **沒有** `graphify-out/` | `graphify extract . --code-only` **＋** `graphify cluster-only . --no-label` | 0 |
| 只想重新分群／產生報告 | `graphify cluster-only . --no-label` | 0 |
| 節點數變少被「縮圖保護」拒絕 | 同上再加 `--force` | 0 |

> ⛔ **嚴禁**對「沒有 `graphify-out/`」的專案執行 `graphify update .` —— 會生出只含變更檔的**部分圖譜**，且報告不會有任何警示。

### 3.2 什麼時候要更新（本專案的固定收尾）

| 本次改動內容 | 收尾動作 |
| :--- | :--- |
| `assets/js/**`、`tools/**`、`preview.js` | **主動執行** `graphify update .`（零成本、可還原 → 屬自主執行範圍，**不必再問使用者**） |
| `*.md`（含 `AGENTS.md`／`README.md`／`開發者筆記.md`） | **標題有變**才會動到圖譜（只改內文不影響）→ 同批有程式改動就一起跑；純文件改動可延後，不急 |
| 只動 `assets/css/**`、`index.html`、`.vtt`、圖片 | 圖譜不會變 → 不必跑（跑了也只會回 `No code-graph topology changes detected; outputs left untouched.`） |

更新後**必須回報**：節點／邊／社群數（新舊對照）、`Built from commit` 是否＝HEAD，並做一次交叉驗證：

```powershell
# 報告摘要（只讀報告，不讀 graph.json）
Get-Content graphify-out\GRAPH_REPORT.md -TotalCount 20 -Encoding UTF8

# 交叉驗證：報告與圖譜一致（節點數相符、每個節點都有 community）
$j = Get-Content graphify-out\graph.json -Raw -Encoding UTF8 | ConvertFrom-Json
"$($j.nodes.Count) nodes / $(($j.nodes | Where-Object { $_.PSObject.Properties.Name -contains 'community' }).Count) 帶 community / $($j.links.Count) edges"
```

### 3.3 圖譜相關紅線（違反會靜默壞掉）

- **`graphify-out/` 必須維持被 `.gitignore` 排除**（目前是，且 `.gitignore` 本身已入版控）。
  一旦進版控 → 會被 GitHub Pages 一起部署出去。動手前先確認：`git check-ignore -v graphify-out/graph.json`
- **不要安裝 Graphify 的 git hook**：commit 觸發會產生「部分圖譜」，且失敗是靜默的。
- **`update` 沒有 `--code-only`**（v0.9.80 實測會 `exit 2`）；它只吃 `--force`／`--no-cluster`。
  旗標一律查 `graphify --help` 的 `update <path>` 段落，別憑記憶加。
- **不要加 `--no-cluster`**：會寫出「沒有社群」的 `graph.json`，而報告仍留著舊分群文字 → 兩者不一致。
- **語意層預設不啟用**：`graphify label`、HTML／Markdown／圖片進圖都會呼叫 LLM、**可能產生費用** → 需先取得使用者同意。
  更新時若出現 `community set changed since labeling … Run graphify label to refresh names`，那是「社群名沿用 hub 名」的提示，**不是錯誤**；照實回報即可，不要擅自跑 `label`。
  📌 **本專案的群名一直是 hub 名**（群幾乎都是單一檔案 → 名字就是檔名，如 `app.js`／`nebula-canvas.js`；文件群則是文件標題，如 `AGENTS.md — …`）。
  這對「AI 讀圖」零影響，對「人找檔案」反而比語意名更精準；`graphify label` 只在想要「人話群名」時才值得跑，
  且**環境必須先有 LLM key**（本機目前未設 `GEMINI_API_KEY`／`GOOGLE_API_KEY` 等）。
- 更新前工具會自動把既有分群備份到 `graphify-out\<日期>\`（本站已發生過，屬正常行為、同樣不進版控）。

---

## 4. 改動後的驗收（本專案自帶契約測試）

| 改到什麼 | 至少要跑 |
| :--- | :--- |
| 任何 `.js`／主題／i18n／跨檔改動 | `node tools/health-check.js`（C1–C8，秒級、無相依） |
| 粒子引擎、影片播放器、生命週期、UI 互動 | 再加 `node tools/health-check-browser.js`（B1–B21，約 40 秒，需本機 Chrome／Edge） |
| 主題相關 | 記住「**新增／修改一個視覺主題要同步五個地方**」（見 `README.md`，C5 會擋漏） |
| 動到 `assets/**` 或 `index.html` 的引用 | **同步 `index.html` 的 `?v=` 版本號**（快取失效；C1 只擋「檔案不存在」） |

- 退出碼：`0` = 通過、`1` = 有 FAIL（`WARN` 不影響）。
- **契約值**：粒子數 `antigravity 75／vscode 92／cursor 90`；視窗 1200×800 時餘燼縮為 67。
  改粒子設計＝**同時改程式與測試契約**（`tools/health-check-browser.js` 的 `COUNTS`）。
- **粒子引擎特有規則**：所有「每幀位移／相位」必須乘上 `dt`（見 `nebula-canvas.js` 檔頭 dt 正規化）；
  迴圈的啟動／停止一律走 `startLoop()`／`stopLoop()`（禁止直接 `animate()` 開鏈）。
  漏掉任一項會讓高刷新率螢幕變快或速度翻倍，且**只有 B 層測得出來**。
- **已知抖動（不是壞掉）**：B7–B11 是稀疏取樣統計量（餘燼只有 90 顆），**同一份原始碼連跑就會隨機紅燈**；
  看到紅燈先 `--only B7,B8` 重跑一次再判斷（工具檔頭有完整記載）。
- 驗收完成後別忘了 §3.2 的圖譜更新。

---

## 5. 常見陷阱（實測踩過）

| # | 陷阱 | 對策 |
| :--- | :--- | :--- |
| 1 | 圖譜的 `Built from commit` 只反映「建圖當時的 HEAD」 | 工作區有未提交改動時，圖譜其實已含新程式碼；提交後想對齊再跑一次 `update .` |
| 2 | 用 `git rev-parse --short`（7 碼）去比報告的 8 碼 → **誤報過期** | 一律 `--short=8`（§1.4） |
| 3 | B7–B11 隨機紅燈（稀疏取樣統計量） | **先重跑再判斷**，別急著改程式（工具檔頭有完整記載） |
| 4 | 改了 `assets/**` 卻忘了 bump `index.html` 的 `?v=` | 瀏覽器會吃快取舊檔 → 看起來「改了沒效」 |
| 5 | 動到粒子「每幀位移」卻沒乘 `dt` | 高刷新率螢幕會變快；**只有 B 層測得出來** |
| 6 | 直接呼叫 `animate()` 開鏈（繞過 `startLoop()`） | 可能多出第二條 rAF 鏈 → 速度翻倍（B21 會抓） |
| 7 | 把 `graphify-out/` 納入版控 | 會被 GitHub Pages 一起部署出去（§3.3） |
| 8 | 對「沒有 `graphify-out/`」的專案跑 `update .` | 會生出部分圖譜且無警示 → 先 `extract --code-only` |

---

## 6. 本檔的維護

- 本檔是**專案層**規範，目標是「AI 不需要使用者提醒就能照做」；新增規則請維持同樣風格（表格、可照抄的指令、明列紅線）。
- 若你的 Harness／工作區另有全域 `AGENTS.md` 或 `graphify-knowledge-graph` 這類 skill，**流程細節以該處為準**；本檔只保留這個專案的最小可執行版本。
- **分工原則（不要再長回去）**：本檔只放「沒查就會做錯」的規則；
  **查閱型內容**（檔案地圖、完整圖譜邊界表、指令速查）放 `README.md` 對應章節，本檔最多留一行指標。
  判斷法：**這條規則在我「什麼檔案都還沒讀」時就必須知道嗎？** 是 → 放本檔；否 → 放 `README.md`。
- 本檔引用的事實（節點數、契約值、版本號）會隨時間過期：**改了圖譜／契約就順手更新對應數字**。
