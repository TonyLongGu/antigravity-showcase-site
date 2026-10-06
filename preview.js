/**
 * 展示站本機預覽伺服器（可重複執行）
 *
 *   用法：node preview.js [--port <埠>] [--no-open]
 *   （亦可用環境變數 PREVIEW_PORT 指定起始埠）
 *
 * 可重複執行的規則：
 *   1. 由上而下嘗試監聽埠（預設 3300，最多連續試 10 個）。
 *   2. 埠被佔用時先「認人」：若上面跑的是本站的預覽伺服器（含改版前的舊 preview.js）
 *      → 直接開啟網站並結束，不重複佔埠，也不會吐出 EADDRINUSE 堆疊錯誤。
 *   3. 被其他程式、或另一份站點副本佔用 → 自動往後找下一個可用埠，並在訊息中告知。
 *   4. 全部被佔用 → 以退出碼 1 結束，並提示可用 --port 指定別的埠。
 *
 * 退出碼：0 = 正常結束（含使用者中止）；2 = 沿用既有伺服器（已開啟網站）；1 = 啟動失敗
 *
 * 健康檢查端點（僅本工具使用，站內資產沒有這個路徑）：
 *   GET /__preview_health → { app, pid, port, root, startedAt }
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3300;
const PORT_SCAN_LIMIT = 10;
const HEALTH_PATH = '/__preview_health';
const APP_ID = 'antigravity-showcase-preview';
/* 舊版 preview.js 沒有健康檢查端點，改用首頁標題辨識「這是本站的伺服器」 */
const SITE_TITLE_MARK = 'Antigravity IDE Plugins';
const DOCS_DIR = path.join(__dirname);
const STARTED_AT = new Date().toISOString();

/* 實際監聽的埠（健康檢查端點回報用） */
let activePort = 0;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mov': 'video/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.srt': 'text/plain; charset=utf-8'
};

/* 靜態檔案服務本體（重複執行時，每個候選埠各建一個實例） */
function handleRequest(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  /* 健康檢查端點：讓下一次執行的本工具認出「這裡已有本工具的伺服器」（見檔頭） */
  if (reqPath === HEALTH_PATH) {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    });
    res.end(JSON.stringify({
      app: APP_ID,
      pid: process.pid,
      port: activePort,
      root: DOCS_DIR,
      startedAt: STARTED_AT
    }));
    return;
  }
  
  try {
    reqPath = decodeURIComponent(reqPath);
  } catch (e) {
    // 忽略格式錯誤的 URI
  }
  
  const filePath = path.join(DOCS_DIR, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // 支援影片 HTTP 206 範圍請求 (Range Requests for streaming)
  if (range && (ext === '.mp4' || ext === '.mov' || ext === '.webm')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10) || 0;
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
        'Content-Type': 'text/plain'
      });
      res.end();
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    req.on('close', () => {
      if (!file.destroyed) file.destroy();
    });

    file.on('error', () => {
      if (!file.destroyed) file.destroy();
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });

    file.pipe(res);
  } else {
    const file = fs.createReadStream(filePath);
    
    req.on('close', () => {
      if (!file.destroyed) file.destroy();
    });

    file.on('error', () => {
      if (!file.destroyed) file.destroy();
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    file.pipe(res);
  }
}

/* ------------------------- 重複執行：參數、認人、開站與啟動 ------------------------- */

function parseArgs(argv) {
  const opts = { port: parseInt(process.env.PREVIEW_PORT, 10) || PORT, open: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--no-open') opts.open = false;
    else if (arg === '--port' || arg === '-p') opts.port = parseInt(argv[++i], 10) || opts.port;
    else if (arg.indexOf('--port=') === 0) opts.port = parseInt(arg.slice(7), 10) || opts.port;
    else if (arg === '--help' || arg === '-h') {
      console.log('用法：node preview.js [--port <埠>] [--no-open]');
      console.log('  --port <埠>  指定起始埠（預設 3300；被佔用時自動往後找）');
      console.log('  --no-open    只啟動伺服器，不自動開啟瀏覽器');
      process.exit(0);
    }
  }
  return opts;
}

const OPTS = parseArgs(process.argv.slice(2));

/* 路徑比較：Windows 忽略大小寫，並統一去掉結尾斜線 */
function normalizeRoot(p) {
  const s = path.resolve(String(p || '')).replace(/[\\/]+$/, '');
  return process.platform === 'win32' ? s.toLowerCase() : s;
}

/* 本目錄首頁（延後讀取並快取）：用來辨識既有伺服器是否服務同一份內容 */
let localIndexCache;
function localIndex() {
  if (localIndexCache === undefined) {
    try {
      localIndexCache = fs.readFileSync(path.join(DOCS_DIR, 'index.html'), 'utf8');
    } catch (e) {
      localIndexCache = '';
    }
  }
  return localIndexCache;
}

function httpGet(port, urlPath, timeout) {
  return new Promise((resolve) => {
    const req = http.get({ host: '127.0.0.1', port: port, path: urlPath, timeout: timeout || 1500 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { if (body.length < 200000) body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: body }));
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', () => resolve({ status: 0, body: '' }));
  });
}

/*
 * 認出佔用埠的是誰：
 *   'ours'       健康檢查端點回答 APP_ID，且 root 就是本目錄 → 沿用
 *   'stale'      沒有健康檢查端點，但首頁與本目錄完全相同（＝舊版 preview.js）→ 沿用
 *   'other-copy' 是本站的頁面但內容不同（另一份副本）→ 不沿用，換埠
 *   'foreign'    其他程式 → 不沿用，換埠
 */
async function identifyPort(port) {
  const health = await httpGet(port, HEALTH_PATH);
  if (health.status === 200) {
    try {
      const info = JSON.parse(health.body);
      if (info && info.app === APP_ID && normalizeRoot(info.root) === normalizeRoot(DOCS_DIR)) {
        return { kind: 'ours', info: info };
      }
    } catch (e) {
      /* 不是本工具的 JSON：改用首頁特徵辨識 */
    }
  }
  const home = await httpGet(port, '/');
  if (home.status === 200 && home.body.indexOf(SITE_TITLE_MARK) !== -1) {
    return { kind: home.body === localIndex() ? 'stale' : 'other-copy' };
  }
  return { kind: 'foreign' };
}

/* 開瀏覽器：Windows／macOS／Linux 各用各的指令（失敗只提示，不中斷伺服器） */
function openBrowser(url) {
  const cmd = process.platform === 'win32'
    ? 'start "" "' + url + '"'
    : (process.platform === 'darwin' ? 'open "' + url + '"' : 'xdg-open "' + url + '"');
  exec(cmd, (err) => {
    if (err) console.log(`（無法自動開啟瀏覽器，請手動前往 ${url}）`);
  });
}

/* 嘗試監聽：成功回 null；失敗回錯誤代碼（'EADDRINUSE' 代表埠已被佔用） */
function listenOn(server, port) {
  return new Promise((resolve) => {
    const onError = (e) => { server.removeListener('listening', onListening); resolve(e.code || 'ERROR'); };
    const onListening = () => { server.removeListener('error', onError); resolve(null); };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port);
  });
}

function printBanner(port, fallbackFrom, fallbackReason) {
  console.log('');
  console.log('======================================================');
  console.log('  Antigravity IDE Plugins 展示網站本機預覽伺服器');
  if (fallbackFrom) console.log(`  [提示] 埠 ${fallbackFrom} ${fallbackReason}，已改用埠 ${port}`);
  console.log(`  本機網址: http://localhost:${port}`);
  console.log('  (支援 HTTP 206 串流傳輸，原生影片極速流暢播放)');
  console.log('  (可重複執行：伺服器已在跑時，本工具只會開啟網站)');
  console.log('======================================================');
  console.log('');
}

/* 啟動：由起始埠往下找第一個「可用」或「可沿用」的埠 */
async function startPreviewServer() {
  const busy = [];

  for (let i = 0; i < PORT_SCAN_LIMIT; i++) {
    const port = OPTS.port + i;
    const server = http.createServer(handleRequest);

    const errCode = await listenOn(server, port);
    if (!errCode) {
      activePort = port;
      printBanner(port, busy.length ? busy[0].port : 0, busy.length ? busy[0].reason : '');
      if (OPTS.open) openBrowser(`http://localhost:${port}`);
      return;
    }

    if (errCode !== 'EADDRINUSE') {
      console.error(`[錯誤] 無法在埠 ${port} 啟動預覽伺服器：${errCode}`);
      process.exit(1);
    }

    /* 埠被佔用：先認人，是本站的伺服器就只開站、不重複佔埠 */
    const who = await identifyPort(port);
    if (who.kind === 'ours' || who.kind === 'stale') {
      const url = `http://localhost:${port}`;
      console.log('');
      console.log('======================================================');
      console.log(who.kind === 'ours'
        ? `  本機預覽伺服器已在執行中（PID ${who.info.pid}，埠 ${port}），直接開啟網站`
        : `  偵測到既有預覽伺服器（埠 ${port}；無健康檢查端點，應為舊版 preview.js）`);
      console.log(`  本機網址: ${url}`);
      if (who.kind === 'stale') {
        console.log('  (已直接沿用、不重複佔埠；該伺服器重新啟動後才會顯示新版啟動訊息)');
      }
      console.log('======================================================');
      console.log('');
      if (OPTS.open) openBrowser(url);
      /* 留一點時間讓 exec 把指令交給 cmd.exe（開瀏覽器），再以退出碼 2 結束 */
      setTimeout(() => process.exit(2), 200);
      return;
    }

    const reason = who.kind === 'other-copy' ? '被另一份站點副本佔用' : '被其他程式佔用';
    busy.push({ port: port, reason: reason });
    console.log(`[提示] 埠 ${port} ${reason}，改試下一個埠…`);
  }

  console.error('');
  console.error(`[錯誤] 埠 ${OPTS.port}–${OPTS.port + PORT_SCAN_LIMIT - 1} 都無法使用`
    + `（${[...new Set(busy.map((b) => b.reason))].join('／')}）：`
    + busy.map((b) => b.port).join('、'));
  console.error('       請關閉佔用的程式，或用「node preview.js --port <埠>」指定其他埠後重試。');
  process.exit(1);
}

/* 使用者按 Ctrl+C 停止時以退出碼 0 結束（批次檔才不會誤報為啟動失敗） */
process.on('SIGINT', () => {
  console.log('\n（已停止本機預覽伺服器）');
  process.exit(0);
});

startPreviewServer();
