// 在空白臉上畫 9 種表情（SVG，座標＝原圖 1254×1254 像素），用 Chromium 輸出透明 PNG
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = process.argv[2];
const L = [474, 447], R = [778, 446];
const INK = '#6B3416', DARK = '#3A1A0C';
const defs = `<defs>
  <radialGradient id="iris" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#6E3618"/><stop offset=".7" stop-color="#3B1A0B"/><stop offset="1" stop-color="#2A1006"/></radialGradient>
  <linearGradient id="tear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE9FF"/><stop offset="1" stop-color="#5BB8F2"/></linearGradient>
  <radialGradient id="heart" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FF8AA6"/><stop offset="1" stop-color="#E8325A"/></radialGradient>
  <linearGradient id="mouth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E2A2A"/><stop offset="1" stop-color="#B83A3E"/></linearGradient>
</defs>`;
// 大圓眼（照原圖：白邊＋深咖啡眼珠＋兩個亮點）；look＝眼珠偏移
const eye = ([x, y], s = 1, look = [0, 0]) => `<g transform="translate(${x} ${y}) scale(${s})">
  <circle r="72" fill="#fff"/><circle cx="${look[0]}" cy="${look[1]}" r="60" fill="url(#iris)"/>
  <circle cx="${-18 + look[0]}" cy="${-22 + look[1]}" r="17" fill="#fff"/><circle cx="${20 + look[0]}" cy="${20 + look[1]}" r="7" fill="#fff" opacity=".9"/></g>`;
const arc = ([x, y], up = true, w = 46) => `<path d="M${x - w} ${y + (up ? 14 : -10)} Q${x} ${y + (up ? -34 : 30)} ${x + w} ${y + (up ? 14 : -10)}" stroke="${DARK}" stroke-width="15" fill="none" stroke-linecap="round"/>`;
const chevron = ([x, y], left) => `<path d="M${x + (left ? -38 : 38)} ${y - 30} L${x + (left ? 30 : -30)} ${y} L${x + (left ? -38 : 38)} ${y + 30}" stroke="${DARK}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const catMouth = (y = 540, w = 34) => `<path d="M628 504 V${y - 14} M${628 - w} ${y - 10} Q${628 - w / 2} ${y + 10} 628 ${y - 12} Q${628 + w / 2} ${y + 10} ${628 + w} ${y - 10}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
// 張嘴笑（上緣平、下緣圓，舌頭）
const openSmile = (w = 72, h = 100, y = 532) => `<g><path d="M${628 - w} ${y} Q628 ${y + 12} ${628 + w} ${y} Q${628 + w * .9} ${y + h} 628 ${y + h} Q${628 - w * .9} ${y + h} ${628 - w} ${y}Z" fill="url(#mouth)" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <path d="M${628 - w * .62} ${y + h * .72} Q628 ${y + h * .42} ${628 + w * .62} ${y + h * .72} Q${628 + w * .5} ${y + h - 6} 628 ${y + h - 6} Q${628 - w * .5} ${y + h - 6} ${628 - w * .62} ${y + h * .72}Z" fill="#F47C8C"/>
  <path d="M628 504 V${y + 4}" stroke="${INK}" stroke-width="8" stroke-linecap="round"/></g>`;
const oMouth = `<path d="M628 504 V520" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><ellipse cx="628" cy="566" rx="30" ry="38" fill="url(#mouth)" stroke="${INK}" stroke-width="8"/><ellipse cx="628" cy="584" rx="17" ry="13" fill="#F47C8C"/>`;
const sadMouth = `<path d="M628 504 V524" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M566 590 Q596 548 628 552 Q660 548 690 590 Q660 574 628 576 Q596 574 566 590Z" fill="url(#mouth)" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
const heartEye = ([x, y]) => `<path transform="translate(${x} ${y + 6}) scale(1.25)" d="M0 40 C-62 0 -56 -46 -24 -46 C-10 -46 -2 -36 0 -28 C2 -36 10 -46 24 -46 C56 -46 62 0 0 40Z" fill="url(#heart)" stroke="#B8203F" stroke-width="5"/>
  <ellipse cx="${x - 26}" cy="${y - 26}" rx="14" ry="9" fill="#fff" opacity=".85" transform="rotate(-30 ${x - 26} ${y - 26})"/>`;
const tears = ([x, y]) => `<path d="M${x - 30} ${y + 34} Q${x - 46} ${y + 120} ${x - 22} ${y + 176} Q${x + 8} ${y + 196} ${x + 10} ${y + 150} Q${x + 4} ${y + 90} ${x - 4} ${y + 40}Z" fill="url(#tear)" opacity=".95"/>`;
const blushLines = ([x, y]) => `<g stroke="#E8607A" stroke-width="7" stroke-linecap="round" opacity=".9"><path d="M${x - 28} ${y + 4} l14 -22 M${x - 4} ${y + 6} l14 -22 M${x + 20} ${y + 8} l14 -22"/></g>`;
const bigBlush = ([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="62" ry="38" fill="#FF7E95" opacity=".45" filter="url(#bl)"/>`;
const zzz = `<g fill="#6FA8FF" stroke="#fff" stroke-width="6" paint-order="stroke" font-family="Arial Black, Arial, sans-serif" font-weight="900">
  <text x="880" y="300" font-size="90">Z</text><text x="975" y="215" font-size="64">z</text><text x="1040" y="160" font-size="46">z</text></g>`;
const flower = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="20" ry="30" cy="-26" transform="rotate(${a})" fill="#FF8FB0" stroke="#E5607F" stroke-width="3"/>`).join('')}<circle r="14" fill="#FFD45C"/></g>`;
const sweat = `<path d="M905 330 Q890 372 906 388 Q924 398 930 376 Q932 352 905 330Z" fill="url(#tear)"/>`;

const EXPR = {
  happy:    null,  // 原圖（開心張嘴）
  laugh:    chevron(L, true) + chevron(R, false) + openSmile(80, 110),
  smile:    eye(L) + eye(R) + catMouth(),
  surprise: eye(L, 1.05, [0, -4]).replace('r="60"', 'r="46"') + eye(R, 1.05, [0, -4]).replace('r="60"', 'r="46"') + oMouth,
  love:     heartEye(L) + heartEye(R) + openSmile(66, 90),
  cry:      arc(L, false, 44) + arc(R, false, 44) + tears([L[0], L[1] + 4]) + tears([R[0] + 20, R[1] + 4]) + sadMouth,
  wink:     eye(L) + arc(R, true) + openSmile(60, 78) + flower(380, 560, .9),
  sleepy:   arc([L[0], L[1] + 16], false, 40) + arc([R[0], R[1] + 16], false, 40) + catMouth(536, 26) + zzz,
  shy:      arc(L, true, 40) + arc(R, true, 40) + bigBlush([420, 560]) + bigBlush([836, 560]) + blushLines([420, 560]) + blushLines([836, 560]) + catMouth(538, 28) + sweat,
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1254, height: 1254 } });
  const blank = 'data:image/png;base64,' + fs.readFileSync(path.join(DIR, 'blank.png')).toString('base64');
  const orig = 'data:image/png;base64,' + fs.readFileSync(process.argv[3]).toString('base64');
  for (const [k, g] of Object.entries(EXPR)) {
    await p.setContent(`<body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1254 1254">${defs}
      <filter id="bl"><feGaussianBlur stdDeviation="10"/></filter><image href="${g ? blank : orig}" width="1254" height="1254"/>${g || ''}</svg></body>`);
    await p.screenshot({ path: path.join(DIR, 'expr_' + k + '.png'), omitBackground: true });
  }
  await b.close(); console.log('ok');
})();
