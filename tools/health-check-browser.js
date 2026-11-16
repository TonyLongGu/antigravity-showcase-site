#!/usr/bin/env node
/**
 * 展示站瀏覽器實測健檢（選用第二層；可重跑，無外部相依）
 *
 *   用法：node tools/health-check-browser.js
 *         node tools/health-check-browser.js --only B7,B8      只跑指定項目
 *         node tools/health-check-browser.js --browser <路徑>  指定 Chromium 系瀏覽器
 *         node tools/health-check-browser.js --keep-profile    保留暫存 profile（除錯用）
 *         node tools/health-check-browser.js --calibrate       負對照自我校準（預設＝drift）
 *         node tools/health-check-browser.js --calibrate push0 只注入「推力歸零」，看 B8 是否變紅
 *             可選：drift／push0／radius／dark／cap／speed（對應 B7／B8／B9／B10／B10／B11）
 *
 * 為什麼要第二層：
 *   tools/health-check.js（C1–C8）只看原始碼——秒級、無相依、掛得上 hook；
 *   本工具真的開一個瀏覽器載入真檔、跑真 rAF，量畫布像素與粒子軌跡，約 30 秒、需要 Chromium 系瀏覽器。
 *   兩者互補：前者守契約，後者守「跑起來的樣子」。
 *
 * 驗什麼（B1–B21）：
 *   載入與契約
 *     B1  粒子引擎就緒（window.NebulaEngine 存在）
 *     B2  全程 console 例外 0
 *     B3  各模式每幀 fills ＝ 該模式粒子數（星空 75／字形 92／餘燼 90）
 *     B4  每幀 fills 零抖動（每顆恰好一次 fill＝無殘影）
 *     B5  視窗縮到 1200×800，顆數隨 emberScale 縮（67）
 *     B6  回到 1440×900，顆數復原（90）
 *     B12 切回餘燼顆數仍正確（無雙重註冊／殘留）
 *   滑鼠互動（餘燼；4.11 起＝HEAD 7f9f3d3 的模型：每幀直接位移、無速度累積、共用半徑 160）
 *     B7  近場橫向跟移 ≈ 0（左右掃掠差；順勢帶／滑行不存在）
 *     B8  推力存在：游標貼在粒子右側 30px 時，同一顆粒子的水平位移比基準大 ≥0.35px/幀
 *     B9  推力不越過 160px：游標貼在 200px 外時水平位移不變（|Δmx| ≤ 0.15）
 *     B10 近場提亮存在（Δalpha ≥ 0.03）且繪製 alpha 不超過 0.95（烙暗沒復活）
 *     B11 近場粒子沒被推快：同一顆粒子的每幀位移量不增加超過 1.8px
 *     （B7–B11 的統計量與取樣方式見下方「量測設計」）
 *   生命週期
 *     B13 prefers-reduced-motion 下只畫一幀（畫完即停）
 *     B14 該模式下切風格會補畫一幀，且跑完整顆數
 *     B15 取消 reduced-motion 後動畫自動恢復
 *     B16 pause() 後不再產生新幀
 *     B17 resume() 後動畫恢復且顆數不變
 *     B21 重複觸發 visibilitychange 不會多開一條 rAF 鏈（每幀仍只畫一次）
 *     B18 像素層沒有烙暗暗紅 #60120c
 *     B19 游標附近有墨點（不是空場）
 *     B20 平均 rAF 間隔 ≤ 20ms
 *
 * 測不到什麼（覆蓋邊界）：
 *   - 真實手感（本工具只給數值，好不好看要人眼）
 *   - 高刷新率螢幕（4.20 起已做 dt 正規化，速度與刷新率無關；本工具仍只量 60Hz 邏輯）
 *   - DPR ≠ 1 的實機；Safari／Firefox（只驅動 Chromium 系）
 *   - 觸控裝置（本站粒子設計上沒有觸控互動）
 *   - macOS／Linux 的瀏覽器路徑表只實作、未實測（開發機是 Windows）
 *
 * 量測設計（B7–B11；2026-11-16 改寫，原本是「跨時間窗比絕對值」）：
 *   粒子只有 90 顆且場非穩態，舊寫法把「游標在場中」與「游標不在場中」量在兩個不同
 *   時間窗、再比絕對值 → 兩窗的整體漂移與近場樣本數都會直接改變結論。實測同一份未改動
 *   的程式碼連跑 10 次：8 次全綠，1 次 B8 紅（近場 0.079 vs 基準 −0.148，推力整段消失）、
 *   1 次 B10 紅（maxAlpha 0.744 vs 基準 0.776）——不是程式壞了，是量法在擲骰子。
 *   新寫法＝控制變因量測：
 *   ① 先從畫面上挑一顆「位置已知」的粒子（y 480–700，避開淡入淡出），把游標貼在它
 *      右側 30px。粒子上升很快，所以 ON 段開始前會「再貼一次」，讓量測時的距離維持
 *      30–50px；幾何固定 → 推力的期望值是常數，不再受「這一輪剛好有哪些粒子在近場」影響。
 *   ② 同一顆粒子量三段：游標在角落（基準 1）→ 游標貼在右側（ON）→ 游標在角落（基準 2）。
 *      Δmx＝基準平均 − ON 的水平位移。基準的環境漂移與老化是同一顆粒子的，會抵銷。
 *   ③ B8 用 30px、B9 用 200px（>160，正常應為 0；半徑偷跑時會變正）。
 *      B10 比同一顆粒子的繪製 alpha，B11 比同一顆粒子的每幀位移量。
 *   ④ B7 用左右各掃一次、以中點為參考的差 (dx右−dx左)/2：環境漂移相同、徑向推力相反、
 *      順勢帶也相反 → 只剩「粒子被拖著走」的量（正常 ≈0）。
 *   負對照（每個門檻都有一個會變紅的注入；全部只改記憶體中的回應，不動磁碟）：
 *     --calibrate drift → B7（注入順勢帶：依游標最後移動方向拖粒子）
 *     --calibrate push0 → B8   --calibrate radius → B9
 *     --calibrate dark  → B10  --calibrate cap   → B10  --calibrate speed  → B11
 *
 * 退出碼：0 = 無 FAIL（含 SKIP 與 --calibrate 成功）；1 = 有 FAIL
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync, spawn, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f) => (argv.indexOf(f) >= 0 ? argv[argv.indexOf(f) + 1] : null);
const KEEP_PROFILE = flag('--keep-profile');
const CALIBRATE_ARG = (() => {
  const i = argv.indexOf('--calibrate');
  if (i < 0) return null;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : 'drift';
})();
const CALIBRATE = CALIBRATE_ARG != null;
let calibrateExpect = null;     // 校準模式預期變紅的項目（由注入種類決定）
let calibrateWhy = '';
const BROWSER_ARG = opt('--browser');
const PORT_ARG = opt('--port');
const ONLY = (() => {
  const v = opt('--only');
  return v ? new Set(v.split(',').map((s) => s.trim().toUpperCase())) : null;
})();

const fails = [];
const results = [];
const notes = [];

function check(id, name, ok, detail) {
  if (ONLY && !ONLY.has(id)) return;
  results.push({ id, ok });
  if (!ok) fails.push(`${id} ${name} — ${detail}`);
  console.log('  ' + (ok ? '✓' : '✗') + ' ' + id + '  ' + name + ' — ' + detail);
}
const note = (m) => { notes.push(m); console.log('  ' + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* 契約值：改動粒子設計時要同步這裡（就像 C1 會擋版本號打錯一樣） */
const COUNTS = { antigravity: 75, vscode: 92, cursor: 90 };
const COUNT_SMALL = 67;      // 1200×800：emberScale 0.74 → 90 × 0.74 ≒ 67
const VIEW = { w: 1440, h: 900 };

/* ------------------------------------------------------------------ 瀏覽器 */
function regAppPath(exe) {
  try {
    const out = execFileSync('reg', ['query',
      `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exe}`, '/ve'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const m = out.match(/REG_SZ\s+(.+?)\s*$/m);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

function whichInPath(cmd) {
  for (const d of (process.env.PATH || '').split(path.delimiter)) {
    const p = path.join(d, cmd);
    try { if (fs.existsSync(p)) return p; } catch (e) { /* ignore */ }
  }
  return null;
}

function findBrowser() {
  if (BROWSER_ARG) return fs.existsSync(BROWSER_ARG) ? BROWSER_ARG : null;
  const cands = [];
  if (process.platform === 'win32') {
    cands.push(regAppPath('chrome.exe'), regAppPath('msedge.exe'),
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe');
  } else if (process.platform === 'darwin') {
    cands.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    for (const c of ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge', 'msedge']) {
      cands.push(whichInPath(c));
    }
  }
  return cands.find((p) => p && fs.existsSync(p)) || null;
}

/* ------------------------------------------------------------ 自帶靜態伺服器 */
/* 不依賴 preview.js、不佔用使用者的 3300：自己開一個（預設隨機埠），測完就關。 */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.vtt': 'text/vtt',
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const abs = path.join(ROOT, rel);
    if (!abs.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
    fs.readFile(abs, (err, buf) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',   // 實測要拿到手上的原始碼，不能被快取騙
      });
      res.end(buf);
    });
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port || 0, '127.0.0.1', () => resolve({
      port: server.address().port,
      close: () => new Promise((res) => server.close(() => res())),
    }));
  });
}

/* ------------------------------------------------------------------ 量測儀器 */
/* 鉤 canvas 的 fill／fillText，每顆記一次（位置與 alpha）；以 clearRect 當「一幀」的界線。
   pending()＝還沒被下一次 clearRect 封存的那一幀顆數——reduced-motion 停在單幀時只有它看得到。
   字形（vscode）模式是 fillText 畫字，沒有粒子座標，因此標記 t:1 並在位置統計中略過。 */
const INSTRUMENT = `
(() => {
  const P = window.CanvasRenderingContext2D.prototype;
  const oFill = P.fill, oFillText = P.fillText, oClear = P.clearRect;
  const oSave = P.save, oRestore = P.restore, oTranslate = P.translate;
  let stack = [], items = [];
  const F = window.__f = { frames: [] };
  F.pending = function () { return items.length; };
  F.last = function () { return items; };
  F.take = function () { const f = this.frames; this.frames = []; return f; };
  const mine = (c) => c && c.id === 'nebula-canvas';
  P.clearRect = function () {
    if (mine(this.canvas)) {
      if (items.length) F.frames.push({ items });
      while (F.frames.length > 400) F.frames.shift();
      items = []; stack = [];
    }
    return oClear.apply(this, arguments);
  };
  P.save = function () { stack.push(null); return oSave.apply(this, arguments); };
  P.translate = function (x, y) {
    if (stack.length) stack[stack.length - 1] = [x, y];
    return oTranslate.apply(this, arguments);
  };
  P.restore = function () { stack.pop(); return oRestore.apply(this, arguments); };
  P.fill = function () {
    if (mine(this.canvas) && items.length < 4000) {
      const at = stack.length ? stack[stack.length - 1] : null;
      items.push({ x: at ? at[0] : 0, y: at ? at[1] : 0, a: this.globalAlpha });
    }
    return oFill.apply(this, arguments);
  };
  P.fillText = function () {
    if (mine(this.canvas) && items.length < 4000) items.push({ x: -1, y: -1, a: this.globalAlpha, t: 1 });
    return oFillText.apply(this, arguments);
  };
})();
`;

/* ---------------------------------------------------------------- 量測設計
   B7–B11 讀的是「場」而不是單一顆粒子，所以統計量必須對場本身的隨機漂移不敏感。
   舊寫法把「游標在場中」與「游標不在場中」量在兩個不同時間窗、再比絕對值：
   場只有 90 顆餘燼且非穩態，兩窗的整體漂移（每顆每幀 0.01–0.4 px 的橫向殘留）
   與近場樣本數（常常個位數）都會直接改變結論 → 同一份程式碼連跑會隨機紅燈。
   2026-11-16 改成「配對量測」：
   同一段時間內把游標在 P（近場）與畫面角落之間來回切 10 次，只取每段切換後
   250ms 的穩定段，再把「游標在 P」的幀與「游標在角落」的幀分成兩組。
   兩組取自同一批粒子、同一段時間，場的漂移與粒子組成是共同項，相減就抵銷；
   剩下的只有「游標在不在 P」造成的差：
     dNearOut（0–80px 水平向外位移差）→ B8 推力存在
     dFarOut （170–250px 同一量）     → B9 推力不越過 160px（半徑沒偷跑）
     dAlpha  （0–80px 繪製 alpha 差） → B10 近場提亮存在，且上限 0.95
     dSpeed  （0–80px 每幀位移量差）  → B11 沒有速度累積（只讓開、沒被推快）
   B7 另外量「游標橫向移動 30px 後的近場橫向跟移 dx」：順勢帶這類缺陷會讓 dx 變成
   2.9 px/幀，正常場的殘留是 0.0–0.4。
   負對照（每一項改寫都要有一種注入會讓它變紅，全部只改記憶體、不動磁碟）：
     --calibrate drift   注入橫向漂移（this.x += force*10）      → B7 必須紅
     --calibrate push0   EMBER_MOUSE_PUSH 1.5 → 0               → B8 必須紅
     --calibrate radius  互動半徑 160 → 320                     → B9 必須紅
     --calibrate dark    EMBER_NEAR_BRIGHT 0.22 → −0.5          → B10 必須紅
     --calibrate cap     餘燼繪製 alpha ×1.4                    → B10 必須紅
     --calibrate speed   近場額外縱向位移 force×6                → B11 必須紅
*/
const BANDS = [40, 80, 130, 170, 250, 400];
const BAND_AREA = BANDS.map((b, i) => Math.PI * (b * b - (i ? BANDS[i - 1] ** 2 : 0)));

function phaseStats(frames, point) {
  const n = frames.length;
  if (!n) return null;
  const nb = BANDS.length;
  const bandOf = (d) => { let i = 0; while (i < nb - 1 && d > BANDS[i]) i++; return i; };
  const st = Array.from({ length: nb }, () => ({ n: 0, hOut: 0, speed: 0, alpha: 0 }));
  let maxA = 0, dxNearSum = 0, dxNearN = 0;
  for (let k = 0; k < n; k++) {
    const it = frames[k].items;
    for (const o of it) {
      if (o.t) continue;
      const dx = o.x - point.x, dy = o.y - point.y;
      const b = st[bandOf(Math.sqrt(dx * dx + dy * dy))];
      b.n++; b.alpha += o.a;
      if (o.a > maxA) maxA = o.a;
    }
    if (k > 0) {
      const prev = frames[k - 1].items;
      const m = Math.min(prev.length, it.length);
      for (let i = 0; i < m; i++) {
        const p0 = prev[i], p1 = it[i];
        if (p0.t || p1.t) continue;
        const mx = p1.x - p0.x, my = p1.y - p0.y;
        if (Math.hypot(mx, my) > 30) continue;          // 重生跳位，不是被推的位移
        const dx = p0.x - point.x, dy = p0.y - point.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= 0.5 || d > BANDS[nb - 1]) continue;
        const b = st[bandOf(d)];
        /* 水平向外分量：粒子自己的上升/蛇行是垂直向、正負對稱，會在這裡抵銷；
           推力是徑向向外，左右兩側都同號 → 會累加成明顯正值。
           （實測：用「徑向投影」會被上升的垂直偏壓蓋掉，同號累加才是穩定訊號。） */
        b.hOut += mx * (dx >= 0 ? 1 : -1);
        b.speed += Math.hypot(mx, my);
        if (d <= 170) { dxNearSum += mx; dxNearN++; }
      }
    }
  }
  const band = st.map((b) => ({
    n: b.n,
    hOut: b.n ? +(b.hOut / b.n).toFixed(3) : null,
    speed: b.n ? +(b.speed / b.n).toFixed(3) : null,
    alpha: b.n ? +(b.alpha / b.n).toFixed(3) : null,
  }));
  const weighted = (hi, key) => {
    let sum = 0, nn = 0;
    for (let i = 0; i < nb; i++) {
      if (BANDS[i] > hi) break;
      sum += band[i][key] * band[i].n;
      nn += band[i].n;
    }
    return nn ? +(sum / nn).toFixed(3) : null;
  };
  return {
    frames: n,
    maxAlpha: +maxA.toFixed(3),
    dxNear: dxNearN ? +(dxNearSum / dxNearN).toFixed(3) : null,
    nearOut: weighted(80, 'hOut'),
    farOut: band[4].hOut,
    speedNear: weighted(80, 'speed'),
    alphaNear: weighted(80, 'alpha'),
    band,
  };
}


/* 追蹤「指定的那一顆」粒子：index 是它在陣列中的位置（陣列不重排、reset 原地改），
   所以同一 index 在一個短窗口內就是同一顆。跳位 >30px 記 jumps（重生），該樣本不計。
   mx＝該顆粒子的水平位移（px/幀）；游標固定在它右側時，推力會讓 mx 明顯變負。 */
function trackIndex(frames, idx) {
  let n = 0, mxSum = 0, speed = 0, alpha = 0, na = 0, jumps = 0, maxA = 0;
  for (let k = 0; k < frames.length; k++) {
    const it = frames[k].items;
    const o = it[idx];
    if (!o || o.t) continue;
    na++; alpha += o.a;
    if (o.a > maxA) maxA = o.a;
    if (k > 0) {
      const p0 = frames[k - 1].items[idx];
      if (!p0 || p0.t) continue;
      const mx = o.x - p0.x, my = o.y - p0.y;
      if (Math.hypot(mx, my) > 30) { jumps++; continue; }
      mxSum += mx;
      speed += Math.hypot(mx, my);
      n++;
    }
  }
  return {
    n, na, jumps, maxA,
    mx: n ? mxSum / n : null,
    speed: n ? speed / n : null,
    alpha: na ? alpha / na : null,
  };
}

/* --------------------------------------------------------------- CDP 連線 */
async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', () => rej(new Error('WebSocket 連線失敗：' + wsUrl)));
  });
  let seq = 0;
  const pending = new Map();
  const events = [];
  const listeners = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.rej(new Error(m.error.message)); else p.res(m.result);
    } else if (m.method) {
      events.push(m);
      for (const fn of listeners) fn(m);
    }
  });
  const raw = (method, params = {}, sessionId) => {
    const id = ++seq;
    ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((res, rej) => {
      pending.set(id, { res, rej });
      setTimeout(() => { if (pending.delete(id)) rej(new Error('CDP 逾時：' + method)); }, 40000);
    });
  };
  return { raw, events, on: (fn) => listeners.push(fn), close: () => ws.close() };
}


/* ------------------------------------------------------------------ 主流程 */
const bar = '='.repeat(64);
let dbg = null;
let child = null;
let server = null;
let profileDir = null;

function shutdown() {
  try { if (dbg) dbg.close(); } catch (e) { /* ignore */ }
  try {
    if (child) {
      if (process.platform === 'win32') execSync('taskkill /F /T /PID ' + child.pid + ' 2>NUL', { stdio: 'ignore' });
      else child.kill('SIGKILL');
    }
  } catch (e) { /* ignore */ }
}

(async () => {
  console.log(bar);
  console.log('展示站瀏覽器實測健檢 (tools/health-check-browser.js)');
  console.log('根目錄：' + ROOT);
  if (CALIBRATE) console.log('模式：--calibrate ' + CALIBRATE_ARG + ' —— 故意注入缺陷，驗證本工具抓得到（不改磁碟上的檔案）');
  console.log(bar);

  if (typeof WebSocket === 'undefined') {
    console.log('\nSKIP：這個 Node 沒有全域 WebSocket（需要 Node 22 以上），未執行任何檢查。');
    console.log(bar);
    return;   // SKIP 不算失敗，退出碼 0
  }
  const browser = findBrowser();
  if (!browser) {
    console.log('\nSKIP：找不到 Chromium 系瀏覽器（Chrome／Edge／Chromium），未執行任何檢查。');
    console.log('      可用 --browser <路徑> 指定。');
    console.log(bar);
    return;
  }
  note('瀏覽器：' + browser);

  try {
    server = await startServer(PORT_ARG ? Number(PORT_ARG) : 0);
    const base = 'http://127.0.0.1:' + server.port;
    note('臨時靜態伺服器：' + base + '（測完即關，不碰 preview.js 的埠）');

    /* 每次都用全新的暫存 profile：主題記憶（localStorage）不會殘留，
       所以「乾淨載入＝預設風格 vscode」是可重現的。 */
    profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'showcase-hc-'));
    const browserArgs = [
      '--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profileDir,
      '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank',
    ];
    if (process.platform !== 'win32') browserArgs.unshift('--no-sandbox');   // CI（Linux）需要
    child = spawn(browser, browserArgs, { stdio: 'ignore' });

    let versionUrl = null;
    for (let i = 0; i < 80 && !versionUrl; i++) {
      const f = path.join(profileDir, 'DevToolsActivePort');
      if (fs.existsSync(f)) {
        const p = fs.readFileSync(f, 'utf8').split('\n')[0].trim();
        if (p) versionUrl = 'http://127.0.0.1:' + p + '/json/version';
      }
      if (!versionUrl) await sleep(250);
    }
    if (!versionUrl) throw new Error('瀏覽器未在時限內啟動（DevToolsActivePort 未出現）');
    const version = await (await fetch(versionUrl)).json();
    dbg = await cdp(version.webSocketDebuggerUrl);

    const { targetId } = await dbg.raw('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await dbg.raw('Target.attachToTarget', { targetId, flatten: true });
    const S = (m, p) => dbg.raw(m, p, sessionId);
    const ev = async (expr) => {
      const r = await S('Runtime.evaluate', {
        expression: '(function(){' + expr + '})()', returnByValue: true, awaitPromise: true,
      });
      if (r.exceptionDetails) throw new Error('頁面例外：' + JSON.stringify(r.exceptionDetails).slice(0, 200));
      return r.result.value;
    };

    await S('Page.enable');
    await S('Runtime.enable');
    await S('Page.addScriptToEvaluateOnNewDocument', { source: INSTRUMENT });
    await S('Emulation.setDeviceMetricsOverride', {
      width: VIEW.w, height: VIEW.h, deviceScaleFactor: 1, mobile: false,
    });

    /* --calibrate：把一種缺陷注入到「記憶體裡的回應」，不動磁碟上的檔案；
       量完就結束，原始碼全程保持原樣。每一種注入都對應一個會因此變紅的檢查。 */
    if (CALIBRATE) {
      const src = fs.readFileSync(path.join(ROOT, 'assets/js/nebula-canvas.js'), 'utf8');
      const sub = (s, from, to) => {
        if (!s.includes(from)) throw new Error('--calibrate 找不到注入點：' + from);
        return s.replace(from, to);
      };
      /* needle 必須跟著那一行改：4.20 的 dt 正規化在句尾加了 `* dt`。
         這裡用正則容忍 `* dt` 的有無，避免日後再微調係數又讓 --calibrate 失效。 */
      const PUSH_LINE = /this\.y -= \(dy \/ dist\) \* force \* EMBER_MOUSE_PUSH(?: \* dt)?;/;
      const variants = {
        drift: {
          expect: 'B7', why: '注入順勢帶（粒子被拖向游標最後的移動方向）',
          patch: (s) => {
            const mm = /window\.addEventListener\('mousemove', \(e\) => \{\r?\n(\s*)mouse\.x = e\.clientX;/;
            if (!mm.test(s)) throw new Error('--calibrate 找不到 mousemove 監聽');
            if (!PUSH_LINE.test(s)) throw new Error('--calibrate 找不到推力行（原始碼已改動？）');
            const withDir = s.replace(mm,
              "window.addEventListener('mousemove', (e) => {\n$1"
              + 'window.__calDir = Math.sign(e.clientX - mouse.x) || window.__calDir || 1;\n$1mouse.x = e.clientX;');
            return withDir.replace(PUSH_LINE, (m) => m
              + '\n        this.x += (window.__calDir || 1) * force * 8 * dt;   /* calibrate: 順勢帶 */');
          },
        },
        push0: {
          expect: 'B8', why: 'EMBER_MOUSE_PUSH 1.5 → 0（推力消失）',
          patch: (s) => sub(s, 'const EMBER_MOUSE_PUSH = 1.5;', 'const EMBER_MOUSE_PUSH = 0;'),
        },
        radius: {
          expect: 'B9', why: '互動半徑 160 → 320（推力越過 160px）',
          patch: (s) => sub(sub(s, 'radius: 160', 'radius: 320'), 'mouse.radius = 160;', 'mouse.radius = 320;'),
        },
        dark: {
          expect: 'B10', why: 'EMBER_NEAR_BRIGHT 0.22 → −0.5（近場反而變暗）',
          patch: (s) => sub(s, 'const EMBER_NEAR_BRIGHT = 0.22;', 'const EMBER_NEAR_BRIGHT = -0.5;'),
        },
        cap: {
          expect: 'B10', why: '餘燼繪製 alpha ×1.4（突破 0.95 上限）',
          patch: (s) => {
            const re = /ctx\.globalAlpha = alpha;(\r?\n\s*)ctx\.fillStyle = EMBER_RAMP_SETS/;
            if (!re.test(s)) throw new Error('--calibrate 找不到餘燼繪製行');
            return s.replace(re, 'ctx.globalAlpha = alpha * 1.4;$1ctx.fillStyle = EMBER_RAMP_SETS');
          },
        },
        speed: {
          expect: 'B11', why: '近場額外縱向位移 force×6（粒子被推快）',
          patch: (s) => {
            if (!PUSH_LINE.test(s)) throw new Error('--calibrate 找不到推力行（原始碼已改動？）');
            return s.replace(PUSH_LINE, (m) => m + '\n        this.y -= force * 6 * dt;   /* calibrate: 近場加速 */');
          },
        },
      };
      const v = variants[CALIBRATE_ARG];
      if (!v) throw new Error('--calibrate 未知的注入：' + CALIBRATE_ARG
        + '（可用：' + Object.keys(variants).join('／') + '）');
      calibrateExpect = v.expect;
      calibrateWhy = v.why;
      const patched = v.patch(src);
      await S('Fetch.enable', { patterns: [{ urlPattern: '*nebula-canvas.js*', requestStage: 'Request' }] });
      dbg.on((m) => {
        if (m.method !== 'Fetch.requestPaused') return;
        S('Fetch.fulfillRequest', {
          requestId: m.params.requestId,
          responseCode: 200,
          responseHeaders: [
            { name: 'Content-Type', value: 'text/javascript; charset=utf-8' },
            { name: 'Cache-Control', value: 'no-store' },
          ],
          body: Buffer.from(patched, 'utf8').toString('base64'),
        }).catch(() => { /* 連線已關，忽略 */ });
      });
      note('校準注入：' + v.why + '（只在記憶體）');
    }

    await S('Page.navigate', { url: base + '/index.html' });
    await sleep(800);
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (await ev('return !!window.NebulaEngine;')) { ready = true; break; }
      await sleep(250);
    }
    check('B1', '粒子引擎就緒', ready, ready ? 'window.NebulaEngine 存在' : '等了 15 秒仍未就緒');
    if (!ready) throw new Error('引擎未就緒，後續檢查無法進行');

    const clickTheme = async (name) => {
      const p = await ev('const el=document.querySelector(\'.hero-ide-pills [data-theme-value="' + name + '"]\');'
        + 'if(!el) return null; const r=el.getBoundingClientRect();'
        + 'return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)};');
      if (!p) throw new Error('找不到風格按鈕：' + name);
      await S('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1, buttons: 1 });
      await sleep(40);
      await S('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1, buttons: 0 });
      await sleep(1000);
    };
    const sample = async (ms) => {
      await ev('__f.take(); return true;');
      await sleep(ms);
      const frames = await ev('return __f.take();');
      if (!frames.length) return { frames: 0, fills: NaN, jitter: -1 };
      const fills = frames.reduce((s, f) => s + f.items.length, 0) / frames.length;
      let jitter = 0;
      for (const f of frames) if (f.items.length !== frames[0].items.length) jitter++;
      return { frames: frames.length, fills: +fills.toFixed(2), jitter };
    };
    const expectFills = (id, label, got, want) =>
      check(id, label, Math.abs(got - want) < 0.51, 'fills/frame=' + got + '（期望 ' + want + '）');

    /* ------------------------------------------------------- B3–B6、B12 契約 */
    const s0 = await sample(1000);
    expectFills('B3', '預設模式（乾淨 profile＝vscode 字形）每幀 fills', s0.fills, COUNTS.vscode);

    await clickTheme('cursor');
    const c1 = await sample(1200);
    expectFills('B3', '餘燼模式每幀 fills', c1.fills, COUNTS.cursor);
    check('B4', '餘燼每幀 fills 零抖動（每顆恰好一次 fill＝無殘影）', c1.jitter === 0,
      '抖動幀 ' + c1.jitter + ' / 共 ' + c1.frames + ' 幀');

    await S('Emulation.setDeviceMetricsOverride', { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
    await sleep(900);
    const c2 = await sample(1000);
    expectFills('B5', '縮到 1200×800 顆數隨 emberScale 縮', c2.fills, COUNT_SMALL);

    await S('Emulation.setDeviceMetricsOverride', { width: VIEW.w, height: VIEW.h, deviceScaleFactor: 1, mobile: false });
    await sleep(900);
    const c3 = await sample(1000);
    expectFills('B6', '回 1440×900 顆數復原', c3.fills, COUNTS.cursor);

    await clickTheme('vscode');
    expectFills('B3', '字形模式每幀 fills', (await sample(1000)).fills, COUNTS.vscode);
    await clickTheme('antigravity');
    expectFills('B3', '星空模式每幀 fills', (await sample(1000)).fills, COUNTS.antigravity);
    await clickTheme('cursor');
    expectFills('B12', '切回餘燼顆數仍正確（無雙重註冊／殘留）', (await sample(1000)).fills, COUNTS.cursor);


    /* --------------------------------------- B7–B11 滑鼠互動（控制變因量測） */
    const HOME = { x: 10, y: 10 };
    const moveTo = (x, y) => S('Input.dispatchMouseEvent', {
      type: 'mouseMoved', x, y, button: 'none', buttons: 0,
    });

    /* 先挑「位置已知」的粒子（y 480–700：避開上緣淡出與下緣淡入；x 260–1180）。
       對每個目標把游標放在它右側固定距離：ON＝游標在旁、OFF＝游標在角落，
       追蹤同一顆粒子（同一個 index）並相減。幾何固定 → 推力期望值是常數，
       不再受「這一輪剛好有哪些粒子在近場」影響；B9 另外用 200px 的目標驗半徑邊界。 */
    const pickTargets = async (count, maxX) => {
      const list = await ev('const it=__f.last(); const out=[];'
        + 'for(let i=0;i<it.length;i++){const o=it[i]; if(o.t) continue;'
        + 'if(o.x>260&&o.x<' + maxX + '&&o.y>480&&o.y<700) out.push([i,Math.round(o.x),Math.round(o.y)]);}'
        + 'return out;');
      return (list || []).slice(0, count);
    };
    const measurePair = async (target, offset) => {
      const idx = target[0];
      /* 粒子上升很快（上端可到 6px/幀），固定游標會在量測前就離它太遠。
         所以 ON 段先「追」一次：把游標重新貼到它右側 30/200px，再取樣。
         基準段游標停在角落，只量同一顆粒子的水平位移／速度／alpha。 */
      const follow = async () => {
        const p = await ev('const it=__f.last(); const o=it[' + idx + '];'
          + 'return o&&!o.t ? [Math.round(o.x),Math.round(o.y)] : null;');
        if (p) await moveTo(p[0] + offset, p[1]);
      };
      const grab = async (ms) => {
        await ev('__f.take(); return true;');
        await sleep(ms);
        return trackIndex(await ev('return __f.take();'), idx);
      };
      await moveTo(HOME.x, HOME.y);
      await sleep(150);
      const b1 = await grab(250);
      await follow();
      await sleep(200);          // 提亮低通（0.08／幀）到位
      await follow();            // 200ms 內又升了 ~25px，再貼一次
      const on = await grab(250);
      await moveTo(HOME.x, HOME.y);
      await sleep(200);
      const b2 = await grab(250);
      if (on.jumps || b1.jumps || b2.jumps) return null;
      if (on.n < 5 || b1.n < 5 || b2.n < 5) return null;
      return {
        dOut: (b1.mx + b2.mx) / 2 - on.mx,
        dSpeed: on.speed - (b1.speed + b2.speed) / 2,
        dAlpha: on.alpha - (b1.alpha + b2.alpha) / 2,
        maxA: on.maxA,
      };
    };
    await moveTo(HOME.x, HOME.y);
    await sleep(1200);
    /* 一次只挑一顆、量完再挑下一顆：粒子上升很快（上端可到 6px/幀），
       先挑好一批再依序量，後面的目標早就飄走了。 */
    const near = [];
    for (let i = 0; i < 8 && near.length < 6; i++) {
      const t = (await pickTargets(2, 1180))[i % 2];
      if (!t) continue;
      const m = await measurePair(t, 30);
      if (m) near.push(m);
    }
    const far = [];
    for (let i = 0; i < 6 && far.length < 3; i++) {
      const t = (await pickTargets(2, 1000))[i % 2];
      if (!t) continue;
      const m = await measurePair(t, 200);
      if (m) far.push(m);
    }
    const avg = (arr, k) => (arr.length ? arr.reduce((s, m) => s + m[k], 0) / arr.length : null);
    const r3 = (v) => (v == null ? null : +v.toFixed(3));
    const dNearOut = r3(avg(near, 'dOut'));
    const dSpeed = r3(avg(near, 'dSpeed'));
    const dAlpha = r3(avg(near, 'dAlpha'));
    const dFarOut = r3(avg(far, 'dOut'));
    const maxAlpha = near.length ? Math.max(...near.map((m) => m.maxA)) : 0;

    /* B7：順勢帶（粒子被游標拖著走）的指紋是「跟著移動方向」。左右各掃一次、
       以中點 M 為參考：兩次的環境漂移相同、徑向推力的方向相反、順勢帶也相反。
       (dxRight − dxLeft)/2 把環境漂移抵銷，留下的是拖曳量（正常 ≈0，順勢帶 ≈2.9）。 */
    const M = { x: 720, y: 450 };
    await moveTo(M.x - 30, M.y);
    await sleep(900);
    await ev('__f.take(); return true;');
    await moveTo(M.x + 30, M.y);            // 右向掃掠
    await sleep(1500);
    const swipeR = phaseStats(await ev('return __f.take();'), M);
    await moveTo(M.x - 30, M.y);            // 左向掃掠
    await sleep(1500);
    const swipeL = phaseStats(await ev('return __f.take();'), M);
    const dragDx = swipeR && swipeL ? +((swipeR.dxNear - swipeL.dxNear) / 2).toFixed(3) : null;
    check('B7', '近場橫向跟移沒有異常（順勢帶／滑行不存在）',
      dragDx != null && Math.abs(dragDx) <= 1.0,
      '左右掃掠差 ' + dragDx + ' px/幀（正常 ≈0；順勢帶 ≈2.9）');

    check('B8', '推力存在（游標貼近時近場水平向外位移明顯變大）',
      dNearOut != null && dNearOut >= 0.35,
      'Δmx ' + dNearOut + ' px/幀（游標貼在粒子右側 30px，同顆粒子 ON−基準；無推力時 ≈0）');
    check('B9', '推力不越過 160px（200px 外的位移不隨游標改變）',
      dFarOut != null && Math.abs(dFarOut) <= 0.15,
      'Δmx（200px）' + dFarOut + ' px/幀（半徑偷跑時會變正）');
    check('B10', '近場提亮存在、不超過上限 0.95（烙暗沒復活）',
      maxAlpha <= 0.951 && dAlpha != null && dAlpha >= 0.03,
      'maxAlpha=' + r3(maxAlpha) + '（上限 0.95），Δ同一顆 alpha ' + dAlpha);
    check('B11', '近場粒子沒被推快（位移量不因游標增加 >1.8px/幀）',
      dSpeed != null && dSpeed <= 1.8,
      'Δ每幀位移 ' + dSpeed + ' px/幀（推力是位移、不是累積速度）');
    note('控制變因量測：近場 ' + near.length + ' 顆（Δmx ' + near.map((m) => r3(m.dOut)).join('/')
      + '）、邊界 ' + far.length + ' 顆（Δmx ' + far.map((m) => r3(m.dOut)).join('/') + '）');


    /* ------------------------------------------------------------ B18/B19 像素 */
    const cur = { x: 720, y: 450 };
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cur.x, y: cur.y, button: 'none', buttons: 0 });
    await sleep(1500);
    const px = await ev('const c=document.getElementById("nebula-canvas"); const g=c.getContext("2d");'
      + 'const d=g.getImageData(0,0,c.width,c.height).data; let scar=0,ink=0,inkNear=0;'
      + 'for(let y=0;y<c.height;y++){for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4;'
      + 'if(d[i+3]>8){ink++; const dx=x-' + cur.x + ',dy=y-' + cur.y + ';'
      + 'if(dx*dx+dy*dy<=170*170) inkNear++;'
      + 'if(d[i]===96&&d[i+1]===18&&d[i+2]===12) scar++;}}}'
      + 'return {scar:scar,ink:ink,inkNear:inkNear,w:c.width,h:c.height};');
    check('B18', '像素層沒有烙暗暗紅 #60120c', px.scar === 0, 'scar=' + px.scar + '（canvas ' + px.w + '×' + px.h + '）');
    check('B19', '游標附近有墨點（不是空場）', px.inkNear > 0, 'inkNear=' + px.inkNear + ' / 全幅墨點 ' + px.ink);

    /* -------------------------------------------- B13–B15 reduced-motion 生命週期 */
    const st = async () => ev('return {n:__f.frames.length, pending:__f.pending()};');
    await ev('__f.take(); return true;');   // 先清掉前面累積的幀，B13 才數得準
    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await sleep(900);
    const r0 = await st();
    await sleep(800);
    const r0b = await st();
    check('B13', 'reduced-motion：畫完即停（pending 不再變動）',
      r0.pending === COUNTS.cursor && r0b.n === r0.n && r0.n <= 3,
      'pending=' + r0.pending + '（餘燼 ' + COUNTS.cursor + '），frames ' + r0.n + ' → ' + r0b.n + '（1 秒後）');

    await clickTheme('antigravity');        // 該模式下 setMode 必須自己補畫一幀
    const r1 = await st();
    check('B14', 'reduced-motion：切風格補畫的那一幀跑完整顆數',
      r1.pending === COUNTS.antigravity, 'pending=' + r1.pending + '（星空 ' + COUNTS.antigravity + '）');

    await S('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await sleep(1200);
    const r2 = await ev('return __f.frames.length;');
    check('B15', '取消 reduced-motion 後動畫自動恢復', r2 > r1.n + 20, 'frames ' + r1.n + ' → ' + r2);

    /* ------------------------------------------------------ B16/B17 pause 對稱 */
    await clickTheme('cursor');
    await ev('window.NebulaEngine.pause(); return true;');
    await sleep(700);
    const q1 = await sample(900);
    check('B16', 'pause() 後不再產生新幀', q1.frames === 0, 'pause 期間 frames=' + q1.frames);
    await ev('window.NebulaEngine.resume(); return true;');
    const q2 = await sample(900);
    check('B17', 'resume() 後動畫恢復且顆數不變（' + COUNTS.cursor + '）',
      q2.frames > 40 && Math.abs(q2.fills - COUNTS.cursor) < 0.51, 'frames=' + q2.frames + '，fills/frame=' + q2.fills);

    /* -------------------------------------- B21 visibilitychange 不重複開鏈（4.21） */
    /* 舊版（≤4.20）的可見分支是**無條件** animate()：只要在「迴圈已經在跑」時再收到一次
       visibilitychange（被遮擋後恢復、螢幕喚醒、作業系統補發事件等都會遇到），
       就會多出第二條 rAF 鏈 → 每幀繪製次數翻倍，粒子看起來快 2 倍，反覆觸發還會累加成 3×、4×。
       這裡在可見狀態下連發 3 次：正確行為＝每幀仍只畫一次（900ms 約 54 幀，不是 108／216）。 */
    const pageVisible = await ev('return !document.hidden;');
    await ev('for (let i = 0; i < 3; i++) document.dispatchEvent(new Event("visibilitychange")); return true;');
    const q3 = await sample(900);
    check('B21', '重複觸發 visibilitychange 不會產生第二條 rAF 鏈（每幀仍只畫一次）',
      pageVisible && q3.frames <= 75 && Math.abs(q3.fills - COUNTS.cursor) < 0.51,
      'visible=' + pageVisible + '，frames=' + q3.frames + '（單鏈 ≈54、雙鏈 ≈108、四鏈 ≈216），fills/frame=' + q3.fills);

    /* ------------------------------------------------------------- B20 效能 */
    await ev('window.__t=[];(function s(t){window.__t.push(t);'
      + 'if(window.__t.length<200)requestAnimationFrame(s);})(performance.now());return true;');
    await sleep(2000);
    const ts = await ev('return window.__t;');
    const iv = [];
    for (let i = 1; i < ts.length; i++) iv.push(ts[i] - ts[i - 1]);
    iv.sort((a, b) => a - b);
    const mean = iv.reduce((s, v) => s + v, 0) / iv.length;
    const p95 = iv[Math.floor(iv.length * 0.95)];
    check('B20', '平均 rAF 間隔 ≤ 20ms（沒有掉幀）', mean <= 20,
      'mean=' + mean.toFixed(2) + 'ms p95=' + p95.toFixed(2) + 'ms n=' + iv.length);

    /* -------------------------------------------------- B2 console 例外（全程） */
    const exc = dbg.events.filter((m) => m.method === 'Runtime.exceptionThrown');
    check('B2', 'console 例外 0', exc.length === 0,
      'exceptions=' + exc.length + (exc.length ? '：' + JSON.stringify(exc[0].params).slice(0, 180) : ''));
  } catch (e) {
    console.log('\n  ! 執行失敗：' + e.message);
    fails.push('EXEC ' + e.message);
  } finally {
    shutdown();
    try { if (server) await server.close(); } catch (e) { /* ignore */ }
    if (profileDir) {
      if (KEEP_PROFILE) {
        console.log('  暫存 profile 保留於：' + profileDir);
      } else {
        for (let i = 0; i < 5; i++) {
          try { fs.rmSync(profileDir, { recursive: true, force: true }); break; } catch (e) { await sleep(300); }
        }
        console.log('  暫存 profile 已清除：' + (fs.existsSync(profileDir) ? '否（殘留 ' + profileDir + '）' : '是'));
      }
    }
  }

  /* -------------------------------------------------------------- 校準與報告 */
  if (CALIBRATE) {
    const caught = !!calibrateExpect && fails.some((f) => f.startsWith(calibrateExpect + ' '));
    console.log('\n' + bar);
    console.log('負對照校準（' + CALIBRATE_ARG + '）：' + calibrateWhy);
    console.log('  ' + calibrateExpect + ' '
      + (caught ? '確實變紅 → 本工具具鑑別力 ✓' : '沒有變紅 → 門檻或量法把鑑別力吃掉了 ✗'));
    if (caught) {
      /* 注入造成的其他 B7–B11 紅燈是預期連帶效果（例如漂移同時讓 B8 變大）。 */
      for (let i = fails.length - 1; i >= 0; i--) {
        if (/^B(7|8|9|10|11) /.test(fails[i])) fails.splice(i, 1);
      }
    } else {
      fails.push('CALIBRATE ' + CALIBRATE_ARG + ' 注入缺陷後 ' + calibrateExpect + ' 仍通過（量法或門檻要修）');
    }
  }

  const pass = results.filter((r) => r.ok).length;
  console.log('\n' + bar);
  console.log('結果：' + (fails.length ? `不通過（FAIL ${fails.length}）` : '通過（FAIL 0）')
    + '，共 ' + results.length + ' 項（通過 ' + pass + '）');
  console.log('測不到：真實手感、高刷新率螢幕（4.20 起已 dt 正規化，本工具仍只量 60Hz）、DPR≠1、Safari／Firefox、觸控、非 Windows 的瀏覽器路徑表');
  if (fails.length) {
    console.log('\n--- FAIL (' + fails.length + ') ---');
    for (const f of fails) console.log('  ! ' + f);
  }
  console.log(bar);
  process.exitCode = fails.length ? 1 : 0;
})();

