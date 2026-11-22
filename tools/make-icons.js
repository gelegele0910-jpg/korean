// 產生網站圖示：icon.svg（瀏覽器分頁）、apple-touch-icon.png（iPhone 主畫面，180）、icon-192.png／icon-512.png（Android 安裝成 App，manifest.webmanifest 用）
// 用法：node tools/make-icons.js（需要 Playwright）
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/art.js'), 'utf8') + ';this.mascotSvg=mascotSvg;', ctx);
const svg = ctx.mascotSvg(180)
  .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
fs.writeFileSync(path.join(ROOT, 'icon.svg'), svg);
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  for (const [n, f] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  const p = await b.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: n / 180 });
  await p.setContent(`<body style="margin:0;background:#FFE7CF">${svg.replace(/<clipPath[\s\S]*?<\/clipPath>/, '').replace(/clip-path="[^"]*"/, '')}</body>`);
  await p.screenshot({ path: path.join(ROOT, f) }); await p.close();
  }
  await b.close(); console.log('icons done');
})();
