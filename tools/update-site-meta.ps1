<#
.SYNOPSIS
    更新 Antigravity 展示站的「網站更新時間」與各工具（外掛）版本號。

.DESCRIPTION
    本腳本做兩件事：
      1. 網站更新時間：寫入展示站 assets/js/config.js 的 SITE_CONFIG.lastUpdated，
         並同步 index.html 中 #hero-last-updated-date 的靜態備援值。
      2. 工具版本號：讀取外掛來源根目錄下各外掛資料夾的 package.json 之 version，
         回寫展示站 assets/js/plugins-data.js 內對應外掛 id 的 version。

    路徑以 $PSScriptRoot 自動推導（換磁碟代號、換專案路徑、再搬家皆可運作），不再依賴固定層級：
      SiteRoot    —— 由本腳本所在目錄往上找，第一個同時含 index.html 與 assets\js\config.js
                     的目錄；找不到時再往上看同層是否有 antigravity-showcase-site。
      PluginsRoot —— 由 SiteRoot 往上找，第一個含外掛的 antigravity-plugins
                     （內有 ≥2 個帶 package.json 的子資料夾）；本層若本身即是外掛庫則直接用。
    兩者皆可用 -SiteRoot / -PluginsRoot 覆寫；自動偵測失敗時會明確報錯並提示改用手動指定。
    寫檔維持 UTF-8（無 BOM），與網站現有 JS 檔編碼一致。

    2026-10-06 變更：本腳本已由「展示站同層的 AntigravityPlugins\tools\」移入「展示站內部
    tools\」，原本寫死 `..\antigravity-showcase-site` / `..\..\AntigravityPlugins\antigravity-plugins`
    的推導會多推一層而失效（實測 exit 1），故全面改為自動偵測。

.PARAMETER SiteRoot
    展示站根目錄（含 index.html 與 assets）。未指定時自動偵測。

.PARAMETER PluginsRoot
    外掛來源根目錄（底下為各外掛資料夾，名稱需等於 plugins-data.js 的 id）。未指定時自動偵測。

.PARAMETER Timestamp
    網站更新時間，格式 'yyyy-MM-dd HH:mm'。未指定時使用「現在時間」。

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .\update-site-meta.ps1

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File .\update-site-meta.ps1 -Timestamp '2026-10-05 09:30'

.EXAMPLE
    # 只預覽不寫檔
    powershell -NoProfile -ExecutionPolicy Bypass -File .\update-site-meta.ps1 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$SiteRoot,
    [string]$PluginsRoot,
    [string]$Timestamp
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# 主控台輸出改 UTF-8：PS 5.1 預設為 ANSI/ASCII，避免中文日誌顯示亂碼
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# UTF-8（無 BOM）：與網站現有 JS 檔一致，避免寫入 BOM 造成多餘差異
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Text([string]$path) {
    return [System.IO.File]::ReadAllText($path, $utf8NoBom)
}
function Write-Text([string]$path, [string]$text) {
    [System.IO.File]::WriteAllText($path, $text, $utf8NoBom)
}

# --- 路徑推導（可遷移：自動偵測，不寫死磁碟／使用者路徑，也不依賴固定層級）---
# $ScriptDir：優先取 $PSScriptRoot；被 dot-source 時 $PSScriptRoot 會是空，改由 $MyInvocation 推導
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent -Path $MyInvocation.MyCommand.Definition }
if (-not $ScriptDir -or -not (Test-Path -LiteralPath $ScriptDir -PathType Container)) { $ScriptDir = (Get-Location).Path }

# 展示站特徵：同時具備 index.html 與 assets\js\config.js
function Test-IsSiteRoot([string]$dir) {
    return [bool]($dir -and
        (Test-Path -LiteralPath (Join-Path $dir 'index.html') -PathType Leaf) -and
        (Test-Path -LiteralPath (Join-Path $dir 'assets\js\config.js') -PathType Leaf))
}

# 外掛庫特徵：內含 >=2 個帶 package.json 的子資料夾（各外掛資料夾名稱＝plugins-data.js 的 id）
function Test-IsPluginsDir([string]$dir) {
    if (-not $dir -or -not (Test-Path -LiteralPath $dir -PathType Container)) { return $false }
    $n = @(Get-ChildItem -LiteralPath $dir -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'package.json') }).Count
    return ($n -ge 2)
}

# 由 $startDir 往上找展示站根目錄（本層 → 同層 antigravity-showcase-site → 上一層，最多 6 層）
function Find-SiteRoot([string]$startDir) {
    $d = $startDir
    for ($i = 0; $i -le 6 -and $d; $i++) {
        if (Test-IsSiteRoot $d) { return $d }
        $sibling = Join-Path $d 'antigravity-showcase-site'
        if (Test-IsSiteRoot $sibling) { return $sibling }
        $up = Split-Path -Parent $d
        if (-not $up -or $up -eq $d) { break }
        $d = $up
    }
    return $null
}

# 由 $startDir 往上找外掛來源根目錄（同層/上層的 antigravity-plugins，或本層本身，最多 6 層）
function Find-PluginsRoot([string]$startDir) {
    $d = $startDir
    for ($i = 0; $i -le 6 -and $d; $i++) {
        if ((Split-Path $d -Leaf) -ieq 'antigravity-plugins' -and (Test-IsPluginsDir $d)) { return $d }
        $sibling = Join-Path $d 'antigravity-plugins'
        if (Test-IsPluginsDir $sibling) { return $sibling }
        if (Test-IsPluginsDir $d) { return $d }
        $up = Split-Path -Parent $d
        if (-not $up -or $up -eq $d) { break }
        $d = $up
    }
    return $null
}

if ([string]::IsNullOrWhiteSpace($SiteRoot)) {
    $SiteRoot = Find-SiteRoot $ScriptDir
    if (-not $SiteRoot) {
        throw "找不到展示站根目錄（由 '$ScriptDir' 往上 6 層皆無 index.html＋assets\js\config.js）→ 請以 -SiteRoot 指定展示站根目錄。"
    }
} else {
    $SiteRoot = [System.IO.Path]::GetFullPath($SiteRoot)
}

if ([string]::IsNullOrWhiteSpace($PluginsRoot)) {
    $PluginsRoot = Find-PluginsRoot $SiteRoot
    if (-not $PluginsRoot) {
        throw "找不到外掛來源根目錄（由 '$SiteRoot' 往上 6 層皆無含外掛的 antigravity-plugins）→ 請以 -PluginsRoot 指定外掛來源根目錄。"
    }
} else {
    $PluginsRoot = [System.IO.Path]::GetFullPath($PluginsRoot)
}

$configPath = Join-Path $SiteRoot 'assets\js\config.js'
$pluginsDataPath = Join-Path $SiteRoot 'assets\js\plugins-data.js'
$indexPath = Join-Path $SiteRoot 'index.html'

foreach ($p in @($configPath, $pluginsDataPath, $indexPath)) {
    if (-not (Test-Path -LiteralPath $p)) {
        throw "找不到必要檔案：$p（可用 -SiteRoot 指定展示站根目錄）"
    }
}

# --- 時間戳（未指定則用現在時間）---
if ([string]::IsNullOrWhiteSpace($Timestamp)) {
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
}
if ($Timestamp -notmatch '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$') {
    throw "時間格式錯誤：'$Timestamp'（需為 yyyy-MM-dd HH:mm，例如 2026-10-05 09:30）"
}

Write-Host "展示站    ：$SiteRoot"
Write-Host "外掛來源  ：$PluginsRoot"
Write-Host "網站時間  ：$Timestamp"
Write-Host ''

# --- 1) 網站更新時間：config.js 的 SITE_CONFIG.lastUpdated ---
$configText = Read-Text $configPath
$configPat = "(lastUpdated:\s*')([^']*)(')"
$configMatches = [regex]::Matches($configText, $configPat)
if ($configMatches.Count -ne 1) {
    throw "config.js 的 lastUpdated 欄位預期 1 處，實際 $($configMatches.Count) 處；為避免誤改已中止。"
}
$oldSiteTime = $configMatches[0].Groups[2].Value
$newConfigText = [regex]::Replace($configText, $configPat, ('${1}' + $Timestamp + '${3}'))

# --- 2) index.html 的靜態備援時間 ---
$indexText = Read-Text $indexPath
$indexPat = "(<span id=""hero-last-updated-date""[^>]*>)([^<]*)(</span>)"
$indexMatches = [regex]::Matches($indexText, $indexPat)
if ($indexMatches.Count -eq 0) {
    Write-Warning 'index.html 找不到 #hero-last-updated-date，略過靜態備援時間。'
    $oldIndexTime = '(無)'
    $newIndexText = $indexText
} else {
    $oldIndexTime = $indexMatches[0].Groups[2].Value
    $newIndexText = [regex]::Replace($indexText, $indexPat, ('${1}' + $Timestamp + '${3}'))
}

# --- 3) 各工具（外掛）版本號：plugins-data.js <- 各外掛 package.json ---
$pluginsText = Read-Text $pluginsDataPath
$rows = New-Object System.Collections.Generic.List[object]

# 只抓「外掛 id」：id 僅含小寫英數與連字號（含點的指令 id 自然排除）
$idMatches = [regex]::Matches($pluginsText, "id:\s*'(?<id>[a-z0-9\-]+)'", [System.Text.RegularExpressions.RegexOptions]::Multiline)
foreach ($m in $idMatches) {
    $id = $m.Groups['id'].Value
    # 外掛來源根目錄內確實存在 package.json 者才處理（IDE 代號、教學影片 id 會自然略過）
    $pkgPath = Join-Path (Join-Path $PluginsRoot $id) 'package.json'
    if (-not (Test-Path -LiteralPath $pkgPath)) { continue }

    $pkgRaw = Read-Text $pkgPath
    $vm = [regex]::Match($pkgRaw, '"version"\s*:\s*"([^"]+)"')
    if (-not $vm.Success) {
        Write-Warning "外掛 $id 的 package.json 找不到 version，已略過。"
        continue
    }
    $newVer = $vm.Groups[1].Value

    # 由該 id 往後找「第一個」version: '...'（即該外掛物件自身的版本）
    $entryPat = "(id:\s*'" + [regex]::Escape($id) + "',[\s\S]*?version:\s*')([^']*)(')"
    $em = [regex]::Match($pluginsText, $entryPat)
    if (-not $em.Success) {
        Write-Warning "plugins-data.js 找不到 id '$id' 對應的 version 欄位，已略過。"
        continue
    }
    $oldVer = $em.Groups[2].Value
    $pluginsText = [regex]::Replace($pluginsText, $entryPat, ('${1}' + $newVer.Replace('$', '$$') + '${3}'))

    $rows.Add([pscustomobject]@{
            Id      = $id
            Old     = $oldVer
            New     = $newVer
            Changed = ($oldVer -ne $newVer)
        })
}

# --- 寫檔（受 -WhatIf / -Confirm 控制）---
if ($PSCmdlet.ShouldProcess($configPath, "網站更新時間設為 $Timestamp")) {
    Write-Text $configPath $newConfigText
}
if ($newIndexText -ne $indexText) {
    if ($PSCmdlet.ShouldProcess($indexPath, "hero-last-updated-date 設為 $Timestamp")) {
        Write-Text $indexPath $newIndexText
    }
}
if ($rows.Count -gt 0) {
    if ($PSCmdlet.ShouldProcess($pluginsDataPath, "更新 $($rows.Count) 個外掛版本號")) {
        Write-Text $pluginsDataPath $pluginsText
    }
}

# --- 結果摘要 ---
$changed = @($rows | Where-Object { $_.Changed })

Write-Host '網站更新時間'
Write-Host ("  config.js   : {0}  ->  {1}" -f $oldSiteTime, $Timestamp)
Write-Host ("  index.html  : {0}  ->  {1}" -f $oldIndexTime, $Timestamp)
Write-Host ''

if ($rows.Count -eq 0) {
    Write-Warning "未從 $PluginsRoot 讀到任何外掛版本（請以 -PluginsRoot 確認路徑）。"
} else {
    Write-Host ("工具版本號：共 {0} 個，其中 {1} 個有變更" -f $rows.Count, $changed.Count)
    $rows | Format-Table Id, Old, New, Changed -AutoSize | Out-Host
}

Write-Host '完成。（若使用 -WhatIf，以上僅為預覽，未實際寫檔）'