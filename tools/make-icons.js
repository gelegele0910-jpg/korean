// 產生網站圖示：icon.svg（瀏覽器分頁）與 apple-touch-icon.png（手機主畫面，180×180）
// 用法：node tools/make-icons.js（需要 Playwright）
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/art.js'), 'utf8') + ';this.mascot=mascot;', ctx);
const svg = ctx.mascot({}, 180, 'happy').replace(/var\(--mascot-bg,#FFE7CF\)/g, '#FFE7CF')
  .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
fs.writeFileSync(path.join(ROOT, 'icon.svg'), svg);
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 180, height: 180 } });
  await p.setContent(`<body style="margin:0;background:#FFE7CF">${svg.replace(/<clipPath[\s\S]*?<\/clipPath>/, '').replace(/clip-path="[^"]*"/, '')}</body>`);
  await p.screenshot({ path: path.join(ROOT, 'apple-touch-icon.png') });
  await b.close(); console.log('icons done');
})();
