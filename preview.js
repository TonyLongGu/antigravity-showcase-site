const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3300;
const DOCS_DIR = path.join(__dirname);

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
  '.webm': 'video/webm'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  
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
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    
    file.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });

    req.on('close', () => {
      if (!file.destroyed) file.destroy();
    });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const file = fs.createReadStream(filePath);
    file.on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });

    req.on('close', () => {
      if (!file.destroyed) file.destroy();
    });

    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    };
    res.writeHead(200, head);
    file.pipe(res);
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`  Antigravity IDE Plugins 展示網站本機預覽伺服器`);
  console.log(`  本機網址: ${url}`);
  console.log(`  (具備 HTTP Referer，YouTube 影片可直接在網頁內播放)`);
  console.log(`======================================================\n`);
  
  exec(`start ${url}`);
});
