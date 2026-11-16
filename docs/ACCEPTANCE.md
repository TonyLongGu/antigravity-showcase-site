# antigravity-showcase-site 驗收標準

> 版本 1.1　凍結日 2026-11-16
> 適用：本 repo 任一交付（純靜態展示站、GitHub Pages 部署）。
> 判定者：秘書。執行者提供證據，不自稱通過。
> 基線：commit `c54a844c`、Node `v24.18.0`、Windows、PowerShell 5.1、Chrome。文中「預期輸出」以此基線實跑為準；數字要變，只有工單明列契約變更才算。
> 怎麼做這個 repo 的程式、圖譜與反模式：`.agents/skills/antigravity-showcase-site-maintenance/SKILL.md`。本檔只寫「怎麼判定」。
> 凍結判定：秘書 2026-11-16 逐項實跑核對通過（工單 P-20261116-01；v1.1 版），基線數字全部重現、M2 判定指令 19/19 `EXIT=0`。B7–B11 列觀察項，不作通過條件。此後本檔要改，一律走工單升版。

---

## 0. 驗收前就該有的東西

缺一項就退回，不進入驗收。

- [ ] 工單：一句話目標、包含什麼、明確不包含什麼、必讀文件。
- [ ] 變更清單：`git diff --stat <base>..<head>` 的每一列，都有一句「為什麼動」。
- [ ] 指令與完整輸出：逐字貼，不是摘要；每個指令附退出碼。
- [ ] 環境四行：`node --version`、`git rev-parse --short=8 HEAD`、`$PSVersionTable.PSVersion.ToString()`、實測瀏覽器與版本（Chrome／Edge；沒測的寫「未測 Chrome」）。
- [ ] 判定依據：交付時註明依 `docs/ACCEPTANCE.md` 哪個 commit 判定（`git log -1 --format=%h -- docs/ACCEPTANCE.md`）。
- [ ] 圖譜收尾：改了 `assets/js/**`、`tools/**`、`preview.js`，或改了 `*.md` 的標題，要附 `graphify update .` 的節點／邊／社群變化與 `Built from commit`。

## 1. 意圖符合

- [ ] **1.1 範圍**：`git diff --name-only <base>..<head>` 每一列都能對到工單一句。出現清單外檔案即退回。
      例外：`docs/ACCEPTANCE.md` 本身；`graphify-out/` 是忽略目錄，不該出現。
- [ ] **1.2 行為對得上描述**：工單寫的行為，能在 §2 找到對應的通過項。只有文字描述、沒有任何輸出或畫面判定 ⇒ 退回。
- [ ] **1.3 只做被要求的事**：沒有「順手」改文案、改主題色、改粒子參數、換第三方資源。判定＝§3.1 的 C1–C8 與 §3.2 的 B 層都過，且 diff 中沒有工單以外的 `assets/**`／`index.html` 變更。
- [ ] **1.4 版本標示**：若工單要求更新網站版本或更新時間，`assets/js/config.js` 的 `version`／`lastUpdated` 必須同步；沒要求則不得改動。
- [ ] **1.5 對外描述不誇大**：頁面與 README 只宣稱實作得到的支援（Antigravity／Cursor／VS Code）；不得宣稱未支援的宿主或功能。

## 2. 功能正確（含邊界、失敗、可重複、可復原）

### 2.1 主路徑

- [ ] **2.1.1** 靜態健檢 8 項全過：M1 → C1–C8 每行 `✓`、`結果：通過（WARN 0）`、`EXIT=0`。C7 只判有無 WARN；掃描檔數含 `graphify-out`、隨圖譜產出變動，不作判定依據。
- [ ] **2.1.2** 瀏覽器實測 19 項全過：M2 的 `--only` 指令 → 19 項全 `✓`、`結果：通過（FAIL 0）`、`EXIT=0`。B7–B11 列觀察項、一律記「未驗證（工具取樣抖動，另案改善）」，見 §2.4。
- [ ] **2.1.3** 首頁內容對得上資料：六張外掛卡、安裝指令、粒子背景都在（畫面）；卡片數等於 `PLUGINS_DATA.length`（M4 → `PLUGINS=6`），且首頁按鈕文字「瀏覽 6 大插件」的數字相同。
- [ ] **2.1.4** 工單描述的操作實測一次：寫明「點哪個按鈕／選哪個選項／畫面出現什麼」，並附對應自動檢查（C 層或 B 層）。兩者缺一即退回。

### 2.2 邊界

- [ ] 視窗 1200×800：粒子顆數縮為 67（B5），不是沿用 90。
- [ ] 回到 1440×900：顆數復原為 90（B6）。
- [ ] 四種視覺模式每幀 fills 正確：VS Code 92、餘燼 90、字形 92、星空 75（B3）。
- [ ] 系統開啟「減少動態效果」：畫完即停，切換風格仍補畫完整顆數，取消設定後自動恢復（B13–B15）。
- [ ] `pause()` 後不再產生新幀；`resume()` 後幀數恢復且顆數不變（B16、B17）。
- [ ] 重複觸發 `visibilitychange` 不會出現第二條 rAF 鏈（B21）。
- [ ] 視覺主題切換：三顆按鈕（`data-theme-value` 為 `antigravity`／`vscode`／`cursor`）每次只有被點的那顆 `aria-pressed="true"`；重整後維持同一主題；清除 `localStorage` 的 `antigravity_visual_theme` 後回預設 `vscode`。
- [ ] 語言切換：按鈕文字在 `EN` 與 `中` 之間切換；繁中首頁標題為「極致擴展你的／AI 協同開發體驗」，英文為 `Supercharge Your／AI Pair Programming Flow`；重整後維持；清除 `localStorage` 的 `antigravity_lang` 後回繁中。

### 2.3 失敗乾淨

- [ ] 載入期間 console 例外 0（B2）。
- [ ] 外部資源不可達不得讓主要內容消失：在瀏覽器封鎖 `fonts.googleapis.com` 與 `fonts.gstatic.com` 後重整，六張外掛卡、安裝指令、頁尾授權仍可讀；字型降級不算失敗。
- [ ] C 層的「未驗證」清單不得當成通過：交付只貼 C 層卻宣稱「瀏覽器實際渲染已驗證」即退回；反之只貼 B 層也不能取代 C 層。

### 2.4 可重複

- [ ] M9：M1、M3 各連跑兩次，退出碼與各項計數完全相同。
- [ ] B7–B11（稀疏取樣統計量）**不作通過條件**：一律記「未驗證（工具取樣抖動，另案改善）」。交付仍要貼完整 24 項輸出，但 B7–B11 的綠燈不得當成推力／提亮行為的證據，紅燈也不作退回依據。
- [ ] 理由與能力上限：同一份未改動的程式碼連跑，約每四次有一次紅燈（實測曾 22/24，B8、B10 紅；也曾 24/24 全綠）；B10 訊息裡的「基準」是每次執行現場取樣，不是固定門檻，所以把數字寫死當門檻也不成立。偏離幅度小於抖動帶的漂移測不出來，屬未驗證；改善取樣窗是另一張工單，不在驗收範圍。

### 2.5 可復原

- [ ] 使用者狀態可回預設：主題回 `vscode`、語言回繁中（清除上述兩個 `localStorage` 鍵即可）；交付不需提供其他還原步驟。
- [ ] 上線可回滾：`git revert <commit>` 後 push 到 `main`，1–2 分鐘後線上 `assets/js/config.js` 的 `version` 回到前一版值（M8 的線上檢查）。
- [ ] 交付若新增會寫入 `localStorage` 的狀態，必須寫明鍵名與清除後應回到的預設值；沒寫即退回。

### 2.6 真實規模

- [ ] 粒子與版面在 1440×900 與 1200×800 都實測（B5、B6），不是只用 CSS 推論。
- [ ] 交付不得以「打開檔案看起來正常」代替 B 層；B 層（B7–B11 除外，見 §2.4）才是每幀行為的證據。

## 3. 不破壞既有

- [ ] **3.1** 靜態健檢 C1–C8 全過（C7 只判 WARN，不看檔數）：M1（與 §2 同一組，不重複跑）。
- [ ] **3.2** 瀏覽器實測 19 項全過：M2 的 `--only` 指令 → `結果：通過（FAIL 0）`、`EXIT=0`。B7–B11 為觀察項，見 §2.4。
- [ ] **3.3 死 CSS 不增加**：M3 → 每個 CSS 檔都是 `✓`，結尾 `結果：沒有發現死碼`、`EXIT=0`。若工單刻意刪樣式使 class 數下降，需在交付說明下降原因。
- [ ] **3.4 主題契約**：M1 的 C5 必須是 `✓ 主題契約一致：antigravity / vscode / cursor（模式 3 個、標籤 3 顆）`；C8 必須是 `✓`。新增或修改主題要同步 README 的「新增／修改一個視覺主題時要同步五個地方」全部五項。
- [ ] **3.5 快取版號**：動到 `assets/**` 或 `index.html` 的引用，`index.html` 對應的 `?v=` 必須遞增。判定見 M6。
- [ ] **3.6 跨 repo 版本落差不得擴大**：M5 → 除已知例外外全部 `OK`。已知例外（2026-11-16）：`antigravity-toolbox` 網站 `1.8.1`、repo `1.8.3`。新增任何 `DIFF` 即退回。
- [ ] **3.7 版控與公開安全**：M7 → `graphify-out` 追蹤檔數 0、絕對路徑命中 0。
- [ ] **3.8 文件落點**：不得重建 `docs/project-notes.md` 平行副本；`AGENTS.md` 只放索引，不承載專案知識（知識在 SKILL.md）。判定：`Test-Path docs/project-notes.md` 為 `False`；`AGENTS.md` 行數不超過 12 行。

## 4. 一致性（UI／命名／文件）

- [ ] **4.1 主題命名**：`data-theme` 的值只能是 `antigravity`／`vscode`／`cursor`；`theme-<key>.css` 的檔名與值一一對應；C5 不得報不一致。
- [ ] **4.2 兩語齊全**：M1 的 C6 必須是 `✓ i18n 契約：zh-TW / en 各 115 / 115 鍵，實際使用 115 鍵`。新增字串時 zh-TW 與 en 都要有；漏一語即退回。本站沒有 zh-CN。
- [ ] **4.3 文件慣例**：README 保留「新增／修改一個視覺主題時要同步五個地方」與 `?v=` 兩節；`開發者筆記.md` 維持純條列、不用空行分段。
- [ ] **4.4 資料與 repo 同名**：`PLUGINS_DATA` 的 `id` 與 `../antigravity-plugins` 的資料夾名稱一一對應（M4 的 `PLUGINS=6` 與 M5 的比對）。
- [ ] **4.5 畫面狀態一致**：三顆主題按鈕只有一顆 `aria-pressed="true"`；語言按鈕文字與目前語言相符（繁中顯示 `EN`、英文顯示 `中`）；卡片數、首頁「瀏覽 6 大插件」、`PLUGINS_DATA.length` 三者相同。

## 5. 證據可重現

> 本節就是可重跑指令與基線；§2、§3 的 M 編號都指回這裡。

所有指令在 repo 根目錄、PowerShell 5.1、Node `v24.18.0` 執行。基線日期 2026-11-16、HEAD `c54a844c`。

### 5.0 基線快照

| 項目 | 基線值 |
| :--- | :--- |
| `tools/health-check.js` | C1 19 個資產、C2 15 個 JS、C3 6 個 CSS、C6 115/115 鍵、C8 81 個選擇器（含 cursor 71 個）；C7 不列檔數（掃描含 `graphify-out`，隨圖譜產出變動） |
| `tools/health-check-browser.js` | 24 項；判定取其中 19 項（B7–B11 為觀察項，不作通過條件）；B3 92／90／92／75、B5 67、B6 90 |
| `tools/dead-css.js` | animations 0、base 10、components 199、cursor 56、vscode 64、variables 0 |
| `PLUGINS_DATA` | 6 筆（toolbox 1.8.1、mcp-manager 1.10.1、inspector 1.3.1、script-runner 1.7.1、quick-access 1.2.6、quota-status 1.1.0） |
| `SITE_CONFIG` | version `1.9.1`、lastUpdated `2026-11-02 19:03`、defaultLang `zh-TW` |
| 線上站 | `https://tonylonggu.github.io/antigravity-showcase-site/` 回 200；`assets/js/config.js` 的 version 與本機相同 |

### M1 靜態健檢

```powershell
node tools/health-check.js
"EXIT=$LASTEXITCODE"
```

預期：8 行 `✓ C1`–`✓ C8`、`結果：通過（WARN 0）`、`EXIT=0`。內容或樣式刻意變動時，§5.0 的計數可變（C7 的掃描檔數每次 `graphify update` 後也會變），但每行必須仍是 `✓`、WARN 必須是 0。

### M2 瀏覽器實測

證據：完整跑一輪，貼出全部 24 項（含 B7–B11 的觀察值）。這一步不看總結、也不看退出碼。

```powershell
node tools/health-check-browser.js
"EXIT=$LASTEXITCODE"
```

判定：只跑 19 項（排除 B7–B11），必須全 `✓` 且退出碼 0。

```powershell
node tools/health-check-browser.js --only B1,B2,B3,B4,B5,B6,B12,B13,B14,B15,B16,B17,B18,B19,B20,B21
"EXIT=$LASTEXITCODE"
```

預期：`結果：通過（FAIL 0），共 19 項（通過 19）`、`EXIT=0`。第一支若因 B7–B11 紅燈而 `EXIT=1`，不影響判定，照實貼出即可。

### M3 死 CSS 盤點

```powershell
node tools/dead-css.js
"EXIT=$LASTEXITCODE"
```

預期：6 行 `✓`、`結果：沒有發現死碼`、`EXIT=0`。

### M4 外掛資料筆數與清單

```powershell
node -e "const fs=require('fs'),vm=require('vm');const ctx={SITE_CONFIG:{githubUrl:'x'}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/js/plugins-data.js','utf8')+';globalThis.__p=PLUGINS_DATA;',ctx);const p=ctx.__p;console.log('PLUGINS='+p.length);p.forEach(x=>console.log(x.id+' '+x.version))"
```

預期：`PLUGINS=6`，6 行 id 與 §5.0 相同。

### M5 與外掛 repo 的版本比對

需同機存在 `../antigravity-plugins`。

```powershell
node -e "const fs=require('fs'),path=require('path'),vm=require('vm');const ctx={SITE_CONFIG:{githubUrl:'x'}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/js/plugins-data.js','utf8')+';globalThis.__p=PLUGINS_DATA;',ctx);const root=path.resolve('..','antigravity-plugins');for(const p of ctx.__p){const f=path.join(root,p.id,'package.json');let v='(missing)';try{v=JSON.parse(fs.readFileSync(f,'utf8')).version}catch(e){}console.log((p.version===v?'OK  ':'DIFF')+' '+p.id+' site='+p.version+' repo='+v)}"
```

預期：6 行；只允許既知例外 `DIFF antigravity-toolbox site=1.8.1 repo=1.8.3`，其餘 `OK`。出現第二個 `DIFF` 即退回。

### M6 快取版號（`?v=`）

```powershell
git diff --name-only <base>..<head> -- assets index.html
git diff <base>..<head> -- index.html | Select-String '\?v='
```

判定：第一個指令列出的每個 `assets/**` 檔，若在 `index.html` 以 `?v=` 引用，第二個指令必須出現該檔的 `-`／`+` 行；只改檔不改版號即退回。

### M7 版控與公開安全

```powershell
(git ls-files graphify-out | Measure-Object).Count
(Get-ChildItem -Recurse -Include *.html,*.js,*.css |
  Where-Object { $_.FullName -notmatch '\\graphify-out\\' } |
  Select-String -Pattern 'C:\\Users|D:\\PJ|file:///' -List |
  Measure-Object).Count
```

預期：`0`、`0`。

### M8 部署狀態與線上版本

```powershell
git branch --show-current
git status --porcelain
Test-Path .github/workflows/deploy.yml
```

預期：`main`、空白（無未提交變更）、`True`。

工單若含「上線」，加跑：

```powershell
(Invoke-WebRequest -UseBasicParsing 'https://tonylonggu.github.io/antigravity-showcase-site/assets/js/config.js' -TimeoutSec 30).Content | Select-String "version: '([0-9.]+)'"
```

預期：狀態 200，且輸出的 version 等於本機 `assets/js/config.js` 的值。

### M9 重複性

再跑一次 M1 與 M3。預期與第一次逐字相同（8 行 `✓`、6 行 `✓`、兩個 `EXIT=0`）。

## 6. 界線與流程

- [ ] 驗收者只驗不修：發現問題寫成退回清單，不改程式、不改契約值（`COUNTS`、i18n 鍵數、預期顆數）。
- [ ] 判定由秘書做；執行者不自稱通過；需要第二意見由秘書安排。
- [ ] 同一項目退回 2 次即升級給 TonyLongGu。
- [ ] 每次驗收留一筆：HEAD、日期、結論、理由、證據位置（房間訊息或 commit）。
- [ ] 本文件凍結後由秘書管理；執行者不得自行增減條目或放寬預期值，要改走工單並重新凍結。
- [ ] 粒子引擎的「每幀位移乘 `dt`、只走 `startLoop()`／`stopLoop()`」是程式紅線，不是本文件放寬的對象；B 層失敗照實退回。
- [ ] 驗收環境與交付環境不同時，以驗收環境重跑為準；不能重跑的項目記「未驗證」，不算通過。

## 7. 通過／退回怎麼寫

**通過**：一句結論＋證據位置＋已知限制。

> 通過。HEAD `xxxxxxx`。M1 C1–C8 全 `✓`、WARN 0；M2 19/19 `EXIT=0`（B7–B11 未驗證：工具取樣抖動）；M3 無死碼；M6 三個 `?v=` 都已遞增。已知限制：只在 1440×900／1200×800 實測，未測高刷新率螢幕。

**退回**：一句結論＋問題清單；每項寫最小重現步驟、期望與實際、對應條號。

> 退回。① §3.5：改 `assets/css/base.css` 但 `index.html` 的 `base.css?v=2.3` 沒動（重現：M6 第一個指令列出 `base.css`，第二個指令無對應行；期望出現 `+...base.css?v=2.4`）。② §2.2：1200×800 顆數仍 90（重現：M2，B5 顯示 `fills/frame=90（期望 67）`；期望 67）。

**有條件通過**（僅秘書可用）：未過項目屬環境限制且不影響主路徑時使用；列出待補項目與期限，其餘照通過寫法。

---

變更紀錄：1.0 → 1.1（2026-11-16）：① C7 不再寫固定掃描檔數（掃描含 `graphify-out`，隨圖譜產出變動），改為只判 WARN；② B7–B11 移出通過條件、列為觀察項並一律記「未驗證（工具取樣抖動，另案改善）」，M2 判定改為其餘 19 項且 `EXIT=0`。
