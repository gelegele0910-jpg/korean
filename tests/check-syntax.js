// 語法檢查：所有 js 檔、index.html 引用的檔案都存在
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let bad = 0;
const files = ['js/hangul.js', 'js/data.js', 'js/reading.js', 'js/art.js', 'js/speech-art.js', 'js/app.js'];
for (const f of files) {
  try { new vm.Script(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f }); console.log('  ok', f); }
  catch (e) { bad++; console.log('  ✗', f, e.message); }
}
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const m of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) {
  if (!fs.existsSync(path.join(ROOT, m[1]))) { bad++; console.log('  ✗ 找不到', m[1]); }
}
// 發音動畫用的人物插畫（1254×1254 WebP）
const img = path.join(ROOT, 'img/girl.webp');
if (!fs.existsSync(img)) { bad++; console.log('  ✗ 找不到 img/girl.webp'); }
else { const b = fs.readFileSync(img); if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') { bad++; console.log('  ✗ img/girl.webp 不是 WebP'); } }
// 安裝成 App（Android）：manifest 的圖示存在且尺寸正確、sw.js 語法正確
try {
  const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  new vm.Script(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), { filename: 'sw.js' });
  const sizes = (mf.icons || []).map(i => i.sizes);
  if (!sizes.includes('192x192') || !sizes.includes('512x512')) { bad++; console.log('  ✗ manifest 缺 192 或 512 圖示'); }
  for (const ic of mf.icons || []) {
    const b = fs.readFileSync(path.join(ROOT, ic.src)), w = b.readUInt32BE(16), hh = b.readUInt32BE(20);
    if (ic.sizes !== `${w}x${hh}`) { bad++; console.log('  ✗', ic.src, '尺寸', w, hh); }
  }
  console.log('  ok manifest.webmanifest、sw.js、圖示');
} catch (e) { bad++; console.log('  ✗ manifest／sw.js', e.message); }
console.log(bad ? `check-syntax: ${bad} 個問題` : 'check-syntax: 全部通過');
process.exit(bad ? 1 : 0);
