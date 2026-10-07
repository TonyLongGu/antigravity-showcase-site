#!/usr/bin/env node
/**
 * 展示站瀏覽器實測健檢（選用第二層；可重跑，無外部相依）
 *
 *   用法：node tools/health-check-browser.js
 *         node tools/health-check-browser.js --only B7,B8      只跑指定項目
 *         node tools/health-check-browser.js --browser <路徑>  指定 Chromium 系瀏覽器
 *         node tools/health-check-browser.js --keep-profile    保留暫存 profile（除錯用）
 *         node tools/health-check-browser.js --calibrate       負對照自我校準（故意注入缺陷，證明本工具抓得到）
 *
 * 為什麼要第二層：
 *   tools/health-check.js（C1–C8）只看原始碼——秒級、無相依、掛得上 hook；
 *   本工具真的開一個瀏覽器載入真檔、跑真 rAF，量畫布像素與粒子軌跡，約 30 秒、需要 Chromium 系瀏覽器。
 *   兩者互補：前者守契約，後者守「跑起來的樣子」。
 *
 * 驗什麼（B1–B20）：
 *   載入與契約
 *     B1  粒子引擎就緒（window.NebulaEngine 存在）
 *     B2  全程 console 例外 0
 *     B3  各模式每幀 fills ＝ 該模式粒子數（星空 75／字形 92／餘燼 90）
 *     B4  每幀 fills 零抖動（每顆恰好一次 fill＝無殘影）
 *     B5  視窗縮到 1200×800，顆數隨 emberScale 縮（67）
 *     B6  回到 1440×900，顆數復原（90）
 *     B12 切回餘燼顆數仍正確（無雙重註冊／殘留）
 *   滑鼠互動（餘燼；4.11 起＝HEAD 7f9f3d3 的模型：每幀直接位移、無速度累積、共用半徑 160）
 *     B7  近場橫向跟移 dx ≈ 0（順勢帶／滑行不存在）
 *     B8  推力存在（近場徑向位移明顯大於未受擾基準）
 *     B9  推力不越過 160px（遠場徑向位移與基準相同；半徑偷跑時會跟著變正）
 *     B10 近場提亮不超過上限 0.95，且不比基準暗（烙暗沒復活）
 *     B11 近場粒子沒被推快（平均速度 ≤ 基準 ×1.25）
 *   生命週期
 *     B13 prefers-reduced-motion 下只畫一幀（畫完即停）
 *     B14 該模式下切風格會補畫一幀，且跑完整顆數
 *     B15 取消 reduced-motion 後動畫自動恢復
 *     B16 pause() 後不再產生新幀
 *     B17 resume() 後動畫恢復且顆數不變
 *     B18 像素層沒有烙暗暗紅 #60120c
 *     B19 游標附近有墨點（不是空場）
 *     B20 平均 rAF 間隔 ≤ 20ms
 *
 * 測不到什麼（覆蓋邊界）：
 *   - 真實手感（本工具只給數值，好不好看要人眼）
 *   - 高刷新率螢幕（引擎全程 per-frame，量測固定為 60Hz 邏輯）
 *   - DPR ≠ 1 的實機；Safari／Firefox（只驅動 Chromium 系）
 *   - 觸控裝置（本站粒子設計上沒有觸控互動）
 *   - macOS／Linux 的瀏覽器路徑表只實作、未實測（開發機是 Windows）
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
const CALIBRATE = flag('--calibrate');
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

const BANDS = [40, 80, 130, 170, 250];
const R_NEAR = 170;   // 「近場」界線（舊半徑值，用來描述影響範圍）
/* 提亮門檻：未受擾的粒子 alpha 實測上限約 0.75，貼身提亮會到 0.8 以上 →
   超過 0.80 幾乎可斷定「被提亮」（比對大量樣本比逐顆比對穩）。 */
const BRIGHT_A = 0.80;
const BAND_AREA = BANDS.map((b, i) => Math.PI * (b * b - (i ? BANDS[i - 1] ** 2 : 0)));

function phaseStats(frames, point) {
  const n = frames.length;
  if (!n) return null;
  const annulus = BANDS.map(() => 0);
  const bright = BANDS.map(() => 0);
  const outBand = BANDS.map(() => ({ sum: 0, n: 0 }));
  let fills = 0, outSum = 0, hOutSum = 0, distSum = 0, dxSum = 0, outN = 0, maxA = 0;
  for (let k = 0; k < n; k++) {
    const it = frames[k].items;
    fills += it.length;
    for (const o of it) {
      if (o.t) continue;
      const dx = o.x - point.x, dy = o.y - point.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      for (let b = 0; b < BANDS.length; b++) {
        if (d <= BANDS[b]) {
          annulus[b]++;
          if (o.a > BRIGHT_A) bright[b]++;
          break;
        }
      }
      if (d <= R_NEAR && o.a > maxA) maxA = o.a;
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
        if (d > 0.5 && d <= BANDS[BANDS.length - 1]) {
          /* 水平向外分量：mx × sign(dx)。粒子自己的上升/蛇行是垂直向、正負對稱，
             會在這裡抵銷；推力是徑向向外，左右兩側都同號 → 會累加成明顯正值。
             （實測：用「徑向投影」會被上升的垂直偏壓蓋掉，同號累加才是穩定訊號。） */
          const hOut = mx * (dx >= 0 ? 1 : -1);
          let bi = 0;
          while (bi < BANDS.length - 1 && d > BANDS[bi]) bi++;
          outBand[bi].sum += hOut;
          outBand[bi].n++;
          if (d <= R_NEAR) {
            outSum += (dx / d) * mx + (dy / d) * my;      // 徑向投影（僅供診斷）
            hOutSum += hOut;
            distSum += Math.sqrt(mx * mx + my * my);      // 位移量
            dxSum += mx;                                  // 橫向跟移（順勢帶的指紋）
            outN++;
          }
        }
      }
    }
  }
  return {
    frames: n,
    fillsPerFrame: +(fills / n).toFixed(2),
    maxAlpha: +maxA.toFixed(3),
    speedPerFrame: outN ? +(distSum / outN).toFixed(3) : null,
    dxPerFrame: outN ? +(dxSum / outN).toFixed(3) : null,
    hOutPerFrame: outN ? +(hOutSum / outN).toFixed(3) : null,
    samples: outN,
    annulus,
    bright,
    outwardBands: outBand.map((o) => (o.n ? +(o.sum / o.n).toFixed(3) : null)),
  };
}

/* 各環帶密度 ÷ 基準同環帶密度：1.0＝不受干擾、<1＝被推空（洞）、>1＝堆積 */
function bandRatio(phase, base) {
  if (!phase || !base) return null;
  const out = {};
  for (let i = 0; i < BANDS.length; i++) {
    const lo = i ? BANDS[i - 1] : 0;
    const d = (phase.annulus[i] / phase.frames) / BAND_AREA[i];
    const b = (base.annulus[i] / base.frames) / BAND_AREA[i];
    out[lo + '-' + BANDS[i]] = b > 0 ? +(d / b).toFixed(2) : null;
  }
  return out;
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
  if (CALIBRATE) console.log('模式：--calibrate —— 故意注入缺陷，驗證本工具抓得到（不改磁碟上的檔案）');
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

    /* --calibrate：把「橫向漂移」這一類缺陷（順勢帶的等效指紋）注入到記憶體裡的回應，
       不動磁碟上的檔案；量完就結束，原始碼全程保持原樣。 */
    if (CALIBRATE) {
      const needle = 'this.y -= (dy / dist) * force * EMBER_MOUSE_PUSH;';
      const src = fs.readFileSync(path.join(ROOT, 'assets/js/nebula-canvas.js'), 'utf8');
      if (!src.includes(needle)) throw new Error('--calibrate 找不到注入點（原始碼已改動？請更新 needle）');
      const patched = src.replace(needle, needle + '\n        this.x += force * 10;   /* calibrate: 橫向漂移 */');
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
      note('校準注入：EmberParticle.update() 加 `this.x += force * 10`（只在記憶體）');
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

    /* ------------------------------------------------- B7–B11 滑鼠互動（餘燼） */
    const P = { x: 720, y: 450 };
    const P2 = { x: 750, y: 450 };          // +30px 的 mousemove

    /* 基準必須在「游標遠離取樣點」時量：先把它停到左上角（離 P 超過 380px）。
       否則上一步點風格按鈕留下的游標位置會在環帶內挖洞，基準被低估、比值虛高。 */
    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 10, y: 10, button: 'none', buttons: 0 });
    await sleep(1200);
    await ev('__f.take(); return true;');
    await sleep(4000);
    const baseline = phaseStats(await ev('return __f.take();'), P);

    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: P.x, y: P.y, button: 'none', buttons: 0 });
    await sleep(1500);
    await ev('__f.take(); return true;');
    await sleep(5000);                      // 穩態才算數（環帶密度需要夠多樣本）
    const hover = phaseStats(await ev('return __f.take();'), P);

    await S('Input.dispatchMouseEvent', { type: 'mouseMoved', x: P2.x, y: P2.y, button: 'none', buttons: 0 });
    await ev('__f.take(); return true;');
    await sleep(5000);                      // 樣本越多，橫向跟移的雜訊越小（實測 ~0.02→0.3 之間跳）
    const swipe = phaseStats(await ev('return __f.take();'), P);

    const ratio = bandRatio(hover, baseline);
    const ob = (i) => hover.outwardBands[i];
    const obBase = (i) => baseline.outwardBands[i];
    /* 門檻 1.0：場本身每顆有隨機的持久橫向漂移（drift），整個窗口的平均會殘留 0.4 以內
       （實測 6 次：0.01～0.38）；而順勢帶這類缺陷是 2.9 起跳 → 兩邊都留 2.5 倍以上餘裕。 */
    check('B7', '近場橫向跟移 dx 沒有異常（順勢帶／滑行不存在）', Math.abs(swipe.dxPerFrame) <= 1.0,
      'swipe.dx=' + swipe.dxPerFrame + ' px/幀（場雜訊底線 0.4；有順勢帶時 2.9）');
    /* 推力是「徑向向外」，左右兩側同號 → 用『水平向外位移』當統計量：
       粒子自己的上升與蛇行在這裡正負對稱、會抵銷，推力會累加成明顯正值。
       拿兩個窗口比同一種量：游標剛到的掃掠瞬態（hover）vs 未受擾（baseline）。 */
    check('B8', '推力存在（近場水平向外位移明顯變大）', ob(0) - obBase(0) >= 0.3,
      '0-40px 水平向外 ' + ob(0) + ' vs 基準 ' + obBase(0) + ' px/幀');
    check('B9', '推力不越過 160px（遠場位移與基準相同）', Math.abs(ob(4) - obBase(4)) <= 0.25,
      '170-250px 水平向外 ' + ob(4) + ' vs 基準 ' + obBase(4) + ' px/幀（半徑偷跑時這裡會跟著變正）');
    check('B10', '近場提亮不超過上限 0.95、且不比基準暗（烙暗沒復活）',
      hover.maxAlpha <= 0.95 && hover.maxAlpha >= baseline.maxAlpha,
      'maxAlpha=' + hover.maxAlpha + '（基準 ' + baseline.maxAlpha + '）');
    check('B11', '近場粒子沒被推快（速度 ≤ 基準 ×1.25）',
      hover.speedPerFrame <= baseline.speedPerFrame * 1.25,
      '近場 ' + hover.speedPerFrame + ' vs 基準 ' + baseline.speedPerFrame + ' px/幀');
    note('環帶密度比（診斷用；場只有 90 顆且非穩態，絕對值僅供參考）：'
      + BANDS.map((b, i) => (i ? BANDS[i - 1] : 0) + '-' + b + 'px ' + ratio[(i ? BANDS[i - 1] : 0) + '-' + b]).join('　'));
    note('提亮顆數（alpha>0.80）每幀：'
      + BANDS.map((b, i) => (i ? BANDS[i - 1] : 0) + '-' + b + 'px ' + (hover.bright[i] / hover.frames).toFixed(3)).join('　')
      + '（基準 ' + (baseline.bright[0] / baseline.frames).toFixed(3) + ' 起，僅供診斷）');
    note('各環帶「水平向外」位移（px/幀）：' + BANDS.map((b, i) => (i ? BANDS[i - 1] : 0) + '-' + b + 'px ' + ob(i) + '（基準 ' + obBase(i) + '）').join('　'));


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
    const caught = fails.some((f) => f.startsWith('B7 '));
    console.log('\n' + bar);
    console.log('負對照校準：注入「橫向漂移」（EmberParticle.update() 的 this.x += force * 10）');
    console.log('  B7 ' + (caught ? '確實變紅 → 本工具具鑑價力 ✓' : '沒有變紅 → 本工具抓不到這類缺陷 ✗'));
    if (caught) {
      for (let i = fails.length - 1; i >= 0; i--) {
        if (/^B(7|8|9|10|11) /.test(fails[i])) fails.splice(i, 1);   // 校準模式的預期失敗
      }
    } else {
      fails.push('CALIBRATE 注入缺陷後 B7 仍通過（量法或門檻要修）');
    }
  }

  const pass = results.filter((r) => r.ok).length;
  console.log('\n' + bar);
  console.log('結果：' + (fails.length ? `不通過（FAIL ${fails.length}）` : '通過（FAIL 0）')
    + '，共 ' + results.length + ' 項（通過 ' + pass + '）');
  console.log('測不到：真實手感、高刷新率螢幕、DPR≠1、Safari／Firefox、觸控、非 Windows 的瀏覽器路徑表');
  if (fails.length) {
    console.log('\n--- FAIL (' + fails.length + ') ---');
    for (const f of fails) console.log('  ! ' + f);
  }
  console.log(bar);
  process.exitCode = fails.length ? 1 : 0;
})();

