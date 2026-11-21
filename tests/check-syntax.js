// 語法檢查：所有 js 檔、index.html 引用的檔案都存在
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let bad = 0;
const files = ['js/hangul.js', 'js/data.js', 'js/art.js', 'js/speech-art.js', 'js/app.js'];
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
console.log(bad ? `check-syntax: ${bad} 個問題` : 'check-syntax: 全部通過');
process.exit(bad ? 1 : 0);
