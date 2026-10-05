#!/usr/bin/env node
/**
 * 死 CSS 盤點（可重跑，無外部相依）
 *
 *   用法：node tools/dead-css.js
 *         node tools/dead-css.js --strict   # 有死碼時以退出碼 1 結束（可掛 CI／hook）
 *
 * 做什麼：
 *   1. 讀 assets/css/*.css，移除註解後抓出每一條規則的 class 選擇器（含所在行號）
 *   2. 在 index.html 與 assets/js/*.js 內以「詞邊界」搜尋是否有引用
 *      （用詞邊界是為了避免 .card 誤命中 .card-icon 這種前綴相同的類別）
 *   3. 列出 0 命中的 class，依檔案分組
 *
 * 為什麼需要：舊版區塊移除後，樣式常留在 CSS 裡變孤兒；本工具把它們列出來再人工確認刪除。
 * 本工具**只盤點、不修改檔案**。
 *
 * 測不到什麼（覆蓋邊界）：
 *   - 由 JS 以字串拼接產生的類別（例如 `badge-${type}`）：只要字串片段有出現在程式碼裡就算有引用
 *   - 只透過行內 style／CSS 變數／keyframes 使用的死碼
 *   - 偽元素與狀態（`:hover`、`::before`）本身不算引用，但同一條規則的 class 仍會被檢查
 *
 * 退出碼：0 = 沒發現死碼（或未加 --strict）；1 = --strict 且有死碼
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');

const read = (p) => fs.readFileSync(p, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** 會被搜尋引用來源的檔案：index.html ＋ 所有 JS。 */
function referenceSources() {
  const files = ['index.html'];
  const jsDir = path.join(ROOT, 'assets', 'js');
  for (const name of fs.readdirSync(jsDir)) {
    if (name.endsWith('.js')) files.push(path.join('assets', 'js', name));
  }
  return files.map((f) => ({ file: f, text: read(path.join(ROOT, f)) }));
}

/** class 是否被引用：以詞邊界比對，避免 .card 命中 .card-icon。 */
function isReferenced(name, sources) {
  const re = new RegExp('(^|[^A-Za-z0-9_-])' + name.replace(/[-]/g, '\\-') + '($|[^A-Za-z0-9_-])');
  return sources.some((s) => re.test(s.text));
}

const sources = referenceSources();
const cssFiles = fs.readdirSync(path.join(ROOT, 'assets', 'css')).filter((f) => f.endsWith('.css'));
let deadCount = 0;

console.log('='.repeat(64));
console.log('死 CSS 盤點 (tools/dead-css.js)');
console.log('根目錄：' + ROOT);
console.log('='.repeat(64));

for (const name of cssFiles) {
  const rel = 'assets/css/' + name;
  const raw = read(path.join(ROOT, rel));
  const css = stripComments(raw);
  const seen = new Map();   // class → 第一次出現的行號
  const re = /([^{}]+)\{/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim();
    if (!selector || selector.startsWith('@')) continue;
    const line = css.slice(0, m.index).split('\n').length;
    for (const token of selector.match(/\.[A-Za-z0-9_-]+/g) || []) {
      const cls = token.slice(1);
      if (!seen.has(cls)) seen.set(cls, line);
    }
  }

  const dead = [...seen.entries()].filter(([cls]) => !isReferenced(cls, sources));
  deadCount += dead.length;
  if (!dead.length) {
    console.log('  ✓ ' + rel + '：' + seen.size + ' 個 class 全部有引用');
    continue;
  }
  console.log('  ! ' + rel + '：' + dead.length + ' 個 class 沒有任何引用');
  for (const [cls, line] of dead) {
    console.log('      .' + cls + '   (去註解後第 ' + line + ' 行)');
  }
}

console.log('='.repeat(64));
console.log(deadCount ? '結果：發現 ' + deadCount + ' 個疑似死碼（請人工確認後再刪）' : '結果：沒有發現死碼');
console.log('註：只被 JS 動態拼接、或只透過行內 style 使用的類別不會出現在引用來源，需自行判斷。');
process.exit(STRICT && deadCount ? 1 : 0);
