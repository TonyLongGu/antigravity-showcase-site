#!/usr/bin/env node
/**
 * 展示站健檢（可重跑，無外部相依）
 *
 *   用法：node tools/health-check.js
 *
 * 驗什麼：
 *   C1 資產存在性   —— index.html 引用的本機檔案是否真的存在（擋版本號打錯、漏檔）
 *   C2 JS 語法      —— 以 vm.Script 實際編譯每個 .js
 *   C3 CSS 結構     —— 每個 .css 的 { } 是否平衡
 *   C4 HTML 結構    —— index.html 常見標籤的開合是否平衡
 *   C5 主題契約     —— theme.js / index.html（head 白名單＋標籤）/ nebula-canvas.js /
 *                      theme-<key>.css 四處的主題鍵集合是否一致
 *   C6 i18n 契約    —— index.html 與 JS 用到的鍵，在每個語系是否都存在
 *   C7 殘留掃描     —— 是否有臨時／備份檔、未掛載的孤兒資產
 *   C8 主題覆蓋平整 —— 各風格（theme-<key>.css）是否涵蓋基準風格已處理的每個選擇器
 *
 * 註：掃描 CSS 前會先移除註解，避免說明用的示意選擇器（例如主題選擇器範例）被當成真的規則。
 *
 * 測不到什麼（覆蓋邊界）：
 *   - 瀏覽器實際渲染、CSS 疊層與視覺結果（沒有真實瀏覽器）→ 這一塊改由 tools/health-check-browser.js 覆蓋
 *   - 外部資源（Google Fonts、GitHub 連結）的可達性
 *   - GitHub Pages 的部署結果（本腳本只看原始碼）
 *
 * 退出碼：0 = 無 ERROR；1 = 有 ERROR（WARN 不影響退出碼）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const errors = [];
const warns = [];
const notes = [];

const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const note = (m) => notes.push(m);

const read = (r) => fs.readFileSync(path.join(ROOT, r), 'utf8');
const exists = (r) => fs.existsSync(path.join(ROOT, r));

/* 掃描 CSS 時先拔掉註解：註解裡若出現示意的 data-theme 選擇器（說明用），
   會被 C5／C8 當成真的選擇器而誤報，實作本身其實沒問題。 */
const stripCssComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '');
const readCss = (r) => stripCssComments(read(r));

const SKIP_DIRS = new Set(['.git', 'node_modules', '.github', '.vscode']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const p = dir ? dir + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

const files = walk('');
const byExt = (ext) => files.filter((f) => f.endsWith(ext));

/* ------------------------------------------------------------------ C1 */
function checkAssets() {
  const html = read('index.html');
  const refs = new Set();
  const re = /(?:src|href)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (/^(https?:)?\/\//.test(url) || /^(mailto:|data:|#)/.test(url)) continue;
    refs.add(url.split('#')[0].split('?')[0]);
  }
  const missing = [...refs].filter((r) => r !== '' && !exists(r));
  if (missing.length) missing.forEach((r) => err(`C1 資產不存在：index.html 引用「${r}」但檔案不存在`));
  else note(`C1 index.html 引用的本機資產全部存在（${refs.size} 個）`);
}

/* ------------------------------------------------------------------ C2 */
function checkJsSyntax() {
  for (const f of byExt('.js')) {
    try {
      new vm.Script(read(f), { filename: f });
    } catch (e) {
      err(`C2 JS 語法錯誤：${f} → ${e.message}`);
    }
  }
  note(`C2 已編譯 ${byExt('.js').length} 個 JS 檔`);
}

/* ------------------------------------------------------------------ C3 */
function checkCssBraces() {
  for (const f of byExt('.css')) {
    const src = read(f);
    let open = 0;
    let close = 0;
    for (const ch of src) {
      if (ch === '{') open++;
      else if (ch === '}') close++;
    }
    if (open !== close) err(`C3 CSS 括號不平衡：${f} → { ×${open} vs } ×${close}`);
  }
  note(`C3 已檢查 ${byExt('.css').length} 個 CSS 檔的括號平衡`);
}

/* ------------------------------------------------------------------ C4 */
function checkHtmlTags() {
  const html = read('index.html');
  const tags = ['div', 'section', 'ul', 'ol', 'li', 'article', 'header', 'footer',
    'span', 'p', 'button', 'a', 'nav', 'main', 'aside', 'h1', 'h2', 'h3', 'h4'];
  for (const tag of tags) {
    const openRe = new RegExp(`<${tag}\\b[^>]*?(/?)>`, 'gi');
    const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
    let open = 0;
    let m;
    while ((m = openRe.exec(html))) {
      if (m[1] !== '/') open++;
    }
    const close = (html.match(closeRe) || []).length;
    if (open !== close) err(`C4 HTML 標籤不平衡：<${tag}> 開 ${open} / 閉 ${close}`);
  }
  note('C4 index.html 常見標籤開合平衡');
}

/* ------------------------------------------------------------------ C5 */
function loadThemeRegistry() {
  const src = read('assets/js/theme.js');
  const start = src.indexOf('const THEMES = {');
  const end = src.indexOf('};', start);
  const block = src.slice(start, end);
  const themes = {};
  const re = /(\w+)\s*:\s*\{\s*attr:\s*(null|'([^']*)')\s*\}/g;
  let m;
  while ((m = re.exec(block))) themes[m[1]] = m[2] === 'null' ? null : m[3];
  return themes;
}

function loadModeSpecs() {
  const src = read('assets/js/nebula-canvas.js');
  const start = src.indexOf('const MODE_SPECS = {');
  const end = src.indexOf('};', start);
  const block = src.slice(start, end);
  return [...block.matchAll(/^\s{4}(\w+)\s*:\s*\{/gm)].map((m) => m[1]);
}

/* 預設風格由 theme.js 決定（首次造訪用），這裡改為解析而非寫死，
   換預設風格時健檢才不會跟著要求錯誤的白名單。 */
function loadDefaultTheme() {
  const m = read('assets/js/theme.js').match(/DEFAULT_THEME\s*=\s*'([^']+)'/);
  return m ? m[1] : 'antigravity';
}

function checkThemeContract() {
  const themes = loadThemeRegistry();
  const keys = Object.keys(themes);
  if (!keys.length) return err('C5 無法從 theme.js 解析 THEMES 註冊表');

  const DEFAULT_KEY = loadDefaultTheme();
  if (!keys.includes(DEFAULT_KEY)) {
    err(`C5 theme.js 的 DEFAULT_THEME「${DEFAULT_KEY}」不在 THEMES 內`);
  }

  const html = read('index.html');

  // (a) head 的 bootstrap 白名單必須涵蓋每一個主題鍵：
  //     漏掉任一鍵，該風格的舊訪客在載入時會被誤判成「無紀錄」而閃一下預設風格（FOUC）
  const head = html.slice(0, html.indexOf('</head>'));
  for (const k of keys) {
    if (!head.includes(`'${k}'`)) {
      err(`C5 head 白名單缺「${k}」：載入時會先閃一下預設風格（FOUC）`);
    }
  }

  // (b) 畫布模式註冊表鍵集合必須一致
  const modes = loadModeSpecs();
  for (const k of keys) {
    if (!modes.includes(k)) err(`C5 nebula-canvas.js 的 MODE_SPECS 缺主題鍵「${k}」`);
  }
  for (const m of modes) {
    if (!keys.includes(m)) err(`C5 MODE_SPECS 有孤兒模式「${m}」（THEMES 沒有）`);
  }

  // (c) 標籤的 data-theme-value 集合必須等於主題鍵集合
  const pillValues = [...new Set([...html.matchAll(/data-theme-value="([^"]+)"/g)].map((m) => m[1]))];
  for (const k of keys) {
    if (!pillValues.includes(k)) err(`C5 沒有對應的主題標籤 data-theme-value="${k}"（使用者切不到）`);
  }
  for (const v of pillValues) {
    if (!keys.includes(v)) err(`C5 標籤 data-theme-value="${v}" 不在 THEMES 內，按下不會切換`);
  }

  // (d) 每個非 null 的 attr 都要有樣式檔、要被掛載、且要有對應選擇器
  for (const [k, attr] of Object.entries(themes)) {
    if (!attr) continue;
    const css = `assets/css/theme-${attr}.css`;
    if (!exists(css)) { err(`C5 主題「${k}」缺少樣式檔 ${css}`); continue; }
    if (!html.includes(css)) err(`C5 ${css} 存在但沒有被 index.html 掛載`);
    if (!readCss(css).includes(`html[data-theme="${attr}"]`)) {
      err(`C5 ${css} 內找不到 html[data-theme="${attr}"] 選擇器`);
    }
  }

  // (e) CSS 內出現的 data-theme 值不得是孤兒
  const attrSet = new Set(Object.values(themes).filter(Boolean));
  for (const f of byExt('.css')) {
    for (const m of readCss(f).matchAll(/html\[data-theme="([^"]+)"\]/g)) {
      if (!attrSet.has(m[1])) err(`C5 ${f} 使用未註冊的 data-theme="${m[1]}"`);
    }
  }

  note(`C5 主題契約一致：${keys.join(' / ')}（模式 ${modes.length} 個、標籤 ${pillValues.length} 顆）`);
}

/* ------------------------------------------------------------------ C6 */
function loadI18N() {
  const src = read('assets/js/i18n.js');
  const sandbox = {
    SafeStorage: { get: (k, d) => d, set: () => {}, remove: () => {} },
    window: {}, document: {}, console,
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const locales = vm.runInContext('Object.keys(I18N)', sandbox);
  const out = {};
  for (const l of locales) {
    out[l] = vm.runInContext(`Object.keys(I18N[${JSON.stringify(l)}])`, sandbox);
  }
  return out;
}

function checkI18n() {
  let locales;
  try {
    locales = loadI18N();
  } catch (e) {
    return err(`C6 i18n.js 無法載入（頂層執行失敗）：${e.message}`);
  }
  const names = Object.keys(locales);
  if (names.length < 2) err(`C6 語系數量異常：${names.join(', ')}`);

  const used = new Set();
  const addFrom = (text, re) => {
    let m;
    while ((m = re.exec(text))) used.add(m[1]);
  };
  const I18N_ATTR = /data-i18n(?:-placeholder|-title|-aria-label|-html)?="([^"]+)"/g;
  const JS_CALL = /\bt\(\s*'([A-Za-z0-9_]+)'\s*\)/g;

  // HTML 也要掃（inline onclick 會直接呼叫 t('...')），否則會誤報成未使用
  const html = read('index.html');
  addFrom(html, I18N_ATTR);
  addFrom(html, JS_CALL);
  for (const f of byExt('.js')) {
    const src = read(f);
    addFrom(src, I18N_ATTR);
    addFrom(src, JS_CALL);
  }

  for (const l of names) {
    const missing = [...used].filter((k) => !locales[l].includes(k));
    if (missing.length) err(`C6 語系「${l}」缺少 ${missing.length} 個鍵：${missing.slice(0, 8).join(', ')}${missing.length > 8 ? ' …' : ''}`);
  }

  const base = new Set(locales[names[0]]);
  for (const l of names.slice(1)) {
    const extra = locales[l].filter((k) => !base.has(k));
    const lack = [...base].filter((k) => !locales[l].includes(k));
    if (extra.length) warn(`C6 語系「${l}」有 ${extra.length} 個其他語系沒有的鍵：${extra.slice(0, 6).join(', ')}`);
    if (lack.length) warn(`C6 語系「${l}」缺少基準語系的 ${lack.length} 個鍵：${lack.slice(0, 6).join(', ')}`);
  }

  const orphan = [...base].filter((k) => !used.has(k));
  if (orphan.length) warn(`C6 可能有未使用的 i18n 鍵（${orphan.length} 個，動態用法無法完全追蹤）：${orphan.slice(0, 8).join(', ')}${orphan.length > 8 ? ' …' : ''}`);

  note(`C6 i18n 契約：${names.join(' / ')} 各 ${locales[names[0]].length} / ${locales[names[1]] ? locales[names[1]].length : '-'} 鍵，實際使用 ${used.size} 鍵`);
}

/* ------------------------------------------------------------------ C7 */
function checkResidue() {
  const badPatterns = [/(^|\/)~\$/, /\.tmp$/, /\.bak$/, /\.orig$/, /\.log$/, /(^|\/)Thumbs\.db$/, /(^|\/)\.DS_Store$/];
  for (const f of files) {
    if (badPatterns.some((re) => re.test(f))) warn(`C7 疑似殘留／備份檔：${f}`);
  }

  // 孤兒資產：存在但沒有任何地方引用（字幕原始檔為建置來源，刻意豁免）
  const haystack = files
    .filter((f) => /\.(html|css|js)$/.test(f))
    .map((f) => read(f))
    .join('\n');
  for (const f of files) {
    if (!f.startsWith('assets/')) continue;
    if (f.startsWith('assets/subtitles/')) continue;
    if (/\.(png|svg|mp4|webm|jpg|webp)$/.test(f) && !haystack.includes(f.split('/').pop())) {
      warn(`C7 孤兒資產（未被引用）：${f}`);
    }
    if ((f.endsWith('.css') || f.endsWith('.js')) && !haystack.includes(f)) {
      warn(`C7 孤兒 ${f.endsWith('.css') ? 'CSS' : 'JS'}（未被 index.html 掛載）：${f}`);
    }
  }

  note(`C7 已掃描 ${files.length} 個檔案的殘留與孤兒引用`);
}

/* ------------------------------------------------------------------ C8 */
/* 主題覆蓋平整性：新主題若漏掉既有主題已處理的選擇器，該元件會在該風格殘留別的主題配色。 */
function pickSelectors(file, key) {
  const re = new RegExp('html\\[data-theme="' + key + '"]\\s*([^,{]+?)\\s*(?=[,{])', 'g');
  const out = new Set();
  const src = readCss(file);
  let m;
  while ((m = re.exec(src))) {
    const sel = m[1].trim().replace(/\s+/g, ' ');
    if (sel) out.add(sel);
  }
  return out;
}

/* C8 的基準風格：其他風格必須涵蓋它已處理的每個選擇器（它的清單＝共用元件表面）。
   取 cursor（暖橘炭黑）當基準，因為 vscode 另有自己專屬的裝飾（狀態列等），
   拿 vscode 當基準會把那些專屬選擇器也算成「大家都該有」而誤報。
   風格鍵改名時記得同步這裡；查不到會退回第一個有 data-theme 的風格並發出警告。 */
const PARITY_BASE_KEY = 'cursor';

function checkThemeParity() {
  const themes = loadThemeRegistry();
  if (!themes[PARITY_BASE_KEY]) {
    warn(`C8 找不到基準風格「${PARITY_BASE_KEY}」（可能已改名），暫用第一個有 data-theme 的風格；請同步 PARITY_BASE_KEY`);
  }
  const fallbackEntry = Object.entries(themes).find(([, attr]) => attr);
  const baseAttr = themes[PARITY_BASE_KEY] || (fallbackEntry && fallbackEntry[1]);
  if (!baseAttr) return;   // 沒有可當基準的風格就略過
  const baseFile = `assets/css/theme-${baseAttr}.css`;
  if (!exists(baseFile)) return;   // 缺檔已由 C5 回報
  const base = pickSelectors(baseFile, baseAttr);

  for (const [key, attr] of Object.entries(themes)) {
    if (!attr || attr === baseAttr) continue;
    const f = `assets/css/theme-${attr}.css`;
    if (!exists(f)) continue;   // 缺檔已由 C5 回報
    const cur = pickSelectors(f, attr);
    const missing = [...base].filter((s) => !cur.has(s));
    if (missing.length) {
      warn(`C8 ${f} 未覆蓋 ${missing.length} 個 ${baseFile} 已處理的選擇器（可能殘留基準風格的配色）：${missing.slice(0, 5).join(' | ')}${missing.length > 5 ? ' …' : ''}`);
    } else {
      note(`C8 ${f} 覆蓋完整（${cur.size} 個選擇器，含 ${baseFile} 全部 ${base.size} 個）`);
    }
  }
}

/* ------------------------------------------------------------------ run */
checkAssets();
checkJsSyntax();
checkCssBraces();
checkHtmlTags();
checkThemeContract();
checkI18n();
checkResidue();
checkThemeParity();

const bar = '='.repeat(64);
console.log(bar);
console.log('展示站健檢 (tools/health-check.js)');
console.log('根目錄：' + ROOT);
console.log(bar);
for (const n of notes) console.log('  ✓ ' + n);
if (warns.length) {
  console.log('\n--- WARN (' + warns.length + ') ---');
  for (const w of warns) console.log('  ! ' + w);
}
if (errors.length) {
  console.log('\n--- ERROR (' + errors.length + ') ---');
  for (const e of errors) console.log('  ✗ ' + e);
}
console.log('\n' + bar);
console.log(errors.length ? `結果：不通過（ERROR ${errors.length}、WARN ${warns.length}）`
  : `結果：通過（WARN ${warns.length}）`);
console.log('未驗證：瀏覽器實際渲染（→ tools/health-check-browser.js）、CSS 疊層視覺、外部資源可達性、Pages 部署結果');
console.log(bar);
process.exit(errors.length ? 1 : 0);


