// 測試用的靜態檔案伺服器：在隨機埠號提供 repo 根目錄的檔案
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function start() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(ROOT, rel);
      if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${srv.address().port}/index.html`, close: () => srv.close() }));
  });
}

/** 擋掉所有對外請求（Google Fonts 等），測試不連網 */
async function blockExternal(page) {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
}

/** 固定種子的亂數，讓測試可以重現 */
function seeded(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

module.exports = { start, blockExternal, seeded, ROOT };
