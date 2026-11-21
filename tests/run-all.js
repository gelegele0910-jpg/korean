// 執行所有測試：node tests/run-all.js
const { spawnSync } = require('child_process'), path = require('path');
const ALL = ['check-syntax.js', 'hangul.js', 'e2e.js', 'mobile.js'];
let bad = 0;
for (const f of ALL) {
  console.log('▶ ' + f);
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { stdio: 'inherit' });
  if (r.status !== 0) bad++;
}
console.log(bad ? `\n✗ ${bad} 個測試腳本失敗` : '\n✓ 全部通過');
process.exit(bad ? 1 : 0);
