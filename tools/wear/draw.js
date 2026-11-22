// 依小老虎的身形畫帽子、髮飾、頸部、服裝（SVG，座標＝小老虎原圖 1254×1254 的像素），輸出成整張畫布大小的透明 PNG：
//   node tools/wear/draw.js        → tools/wear/out/drawn/<欄位>-<代號>.png（build.py 會優先用這些）
// 服裝用小老虎的身體輪廓（tools/wear/out/sil9.png、sil17.png，build.py 前置步驟產生）當遮罩，保證貼身；
// 外層深色、內層淺色兩次遮罩＝自動有一圈外框。頭與身體的交界（下巴）用量好的 CHIN 曲線，衣服都在下巴下面。
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.join(HERE, 'out', 'drawn');
const TS = .78, TX = 138, TY = 250, CV = 1254;                     // 與 build.py 相同的畫布換算
const VB = [-TX / TS, -TY / TS, CV / TS, CV / TS];                 // 畫布在小老虎座標的範圍
const CHIN = [[250, 600], [290, 630], [330, 669], [360, 690], [390, 705], [420, 717], [450, 726], [480, 733], [560, 741], [621, 743], [690, 741],
  [750, 735], [780, 728], [810, 719], [840, 708], [870, 693], [900, 674], [930, 648], [970, 610]];
const HANDS = [[320, 866], [906, 866]];
const below = dy => `M-300 1600 L-300 ${600 + dy} ${CHIN.map(([x, y]) => `L${x} ${y + dy}`).join(' ')} L1600 ${600 + dy} L1600 1600Z`;
// 脖子範圍（只取身體寬度內的下巴曲線），圍巾、項圈沿著它畫
const chinPath = dy => 'M' + CHIN.filter(([x]) => x >= 390 && x <= 840).map(([x, y]) => `${x} ${y + dy}`).join(' L');
const hl = (x, y, rx, ry, rot = -20, o = .45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="#fff" opacity="${o}"/>`;
const S = (d, fill, st, w = 9, extra = '') => `<path d="${d}" fill="${fill}" stroke="${st}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
const C = (x, y, r, fill, st, w = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${st ? `stroke="${st}" stroke-width="${w}"` : ''}/>`;
const E = (x, y, rx, ry, fill, st, w = 8, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${st ? `stroke="${st}" stroke-width="${w}"` : ''} transform="rotate(${rot} ${x} ${y})"/>`;
const mirror = s => `<g transform="translate(1242 0) scale(-1 1)">${s}</g>`;

const defs = (sil9, sil17) => {
  const m = (id, sil, r) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="-300" y="-400" width="1900" height="2000"><rect x="-300" y="-400" width="1900" height="2000" fill="#000"/>
    <image href="${sil}" x="0" y="0" width="1254" height="1254"/><rect x="-300" y="932" width="688" height="500" fill="#000"/>${HANDS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('')}</mask>`;
  return `<defs>${m('Lo', sil9, 58)}${m('Li', sil17, 66)}${m('So', sil9, 112)}${m('Si', sil17, 120)}${m('No', sil9, 0)}${m('Ni', sil17, 0)}
    <clipPath id="b0"><path d="${below(4)}"/></clipPath><clipPath id="b1"><path d="${below(13)}"/></clipPath>
    <pattern id="plaid" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#fff"/><rect width="44" height="16" y="14" fill="#F08A9A" opacity=".75"/><rect width="16" height="44" x="14" fill="#F08A9A" opacity=".75"/></pattern>
    <pattern id="check" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#D9A15E"/><path d="M0 20H40M20 0V40" stroke="#B27434" stroke-width="5"/></pattern>
    <pattern id="knit" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#FFD23F"/><path d="M13 0V26" stroke="#F0B419" stroke-width="5"/></pattern>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#FF8FB3"/><circle cx="10" cy="10" r="6" fill="#fff"/><circle cx="30" cy="30" r="6" fill="#fff"/></pattern></defs>`;
};
/** 上衣：外層（深色）＋內層（淺色）兩次遮罩出現外框；hem 下擺高度、sl 長袖 L／短袖 S／無袖 N；inside 是畫在內層裡的細節（已遮罩） */
function top({ c, d, hem = 1110, sl = 'L', inside = '', over = '', under = '' }) {
  const o = sl === 'L' ? 'Lo' : sl === 'S' ? 'So' : 'No', i = sl === 'L' ? 'Li' : sl === 'S' ? 'Si' : 'Ni';
  return `${under}<g clip-path="url(#b0)"><g mask="url(#${o})"><rect x="-300" y="600" width="1900" height="${hem - 600}" fill="${d}"/></g></g>
    <g clip-path="url(#b1)"><g mask="url(#${i})"><g><rect x="-300" y="600" width="1900" height="${hem - 609}" fill="${c}"/>${inside}
    ${hl(500, 830, 70, 26, -25, .3)}</g></g></g>${over}`;
}
const BELLY = 'M490 760 Q470 900 520 1080 L708 1080 Q760 900 735 760Z';
const vneck = (fill, st, depth = 900, w = 120) => S(`M${621 - w} 740 L621 ${depth} L${621 + w} 740`, fill, st, 10);
const bow = (x, y, s, f, st) => `<g transform="translate(${x} ${y}) scale(${s})">${S('M0 0 L-70 -42 Q-92 0 -70 42Z', f, st, 9)}${S('M0 0 L70 -42 Q92 0 70 42Z', f, st, 9)}${C(0, 0, 20, f, st, 9)}${hl(-52, -14, 12, 6, -30, .5)}${hl(48, -16, 12, 6, 30, .5)}</g>`;
const buttons = (x, ys, f, st) => ys.map(y => C(x, y, 13, f, st, 5)).join('');
const flower = (x, y, r, f, st, ctr = '#FFD45C') => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="${r * .55}" ry="${r * .8}" cy="${-r * .7}" transform="rotate(${a})" fill="${f}" stroke="${st}" stroke-width="5"/>`).join('')}${C(0, 0, r * .38, ctr)}</g>`;
const paw = (x, y, s, f) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${f}"><ellipse cy="10" rx="22" ry="18"/><circle cx="-24" cy="-16" r="9"/><circle cx="-8" cy="-28" r="9"/><circle cx="10" cy="-28" r="9"/><circle cx="26" cy="-16" r="9"/></g>`;

const ITEMS = {
  /* ---------- 服裝 ---------- */
  'outfit-hanbok': top({ c: '#FFB3C8', d: '#D9607F', hem: 960,
    inside: S('M621 742 L520 742 L621 900 Z', '#fff', '#E2C7D0', 6) + S('M621 742 L722 742 L621 900 Z', '#FFE3EC', '#E2C7D0', 6),
    under: S('M430 940 Q620 925 812 940 L870 1205 Q620 1225 372 1205Z', '#FF8FB0', '#C94F72', 10) + hl(500, 1060, 30, 90, 8, .25),
    over: bow(621, 905, .9, '#4A86E8', '#2A5DB0') + S('M600 925 Q580 1000 560 1080', 'none', '#2A5DB0', 22) + S('M600 925 Q580 1000 560 1080', 'none', '#4A86E8', 13) + S('M640 925 Q655 1010 680 1070', 'none', '#2A5DB0', 22) + S('M640 925 Q655 1010 680 1070', 'none', '#4A86E8', 13) }),
  'outfit-bluehanbok': top({ c: '#A9CBF5', d: '#4E7FC4', hem: 1060,
    inside: S('M520 742 L621 905 L722 742', 'none', '#2F5E9E', 30) + S('M520 742 L621 905 L722 742', 'none', '#fff', 12),
    over: S('M630 900 Q600 990 585 1050', 'none', '#2A5DB0', 22) + S('M630 900 Q600 990 585 1050', 'none', '#5B9BEA', 13) + bow(625, 895, .7, '#5B9BEA', '#2A5DB0') }),
  'outfit-uniform': top({ c: '#FFFFFF', d: '#B9B6C8', hem: 1110,
    inside: S('M470 742 L470 1120 L772 1120 L772 742 L700 742 L621 900 L542 742Z', '#4A4A55', '#2B2B33', 8) + buttons(621, [960, 1020, 1080], '#E5C46A', '#9C7B26')
      + S('M560 742 L621 790 L682 742', '#fff', '#B9B6C8', 6) + S('M621 790 L600 820 L612 940 L621 960 L630 940 L642 820Z', '#E23B3B', '#A81F2A', 6) }),
  'outfit-sailor': top({ c: '#FFFFFF', d: '#AEB8D2', hem: 1110, sl: 'S',
    inside: S('M430 742 L520 742 L621 890 L722 742 L812 742 L840 860 L621 950 L402 860Z', '#2C4FA3', '#1D3570', 8) + S('M440 862 L621 940 L802 862', 'none', '#fff', 8)
      + `<rect x="300" y="1060" width="650" height="18" fill="#2C4FA3"/>`,
    over: bow(621, 905, .75, '#E5383B', '#A81F2A') }),
  'outfit-hoodie': top({ c: '#FFC7D6', d: '#E07B98', hem: 1110,
    inside: S('M540 742 Q621 800 702 742', 'none', '#E07B98', 10) + S('M590 770 V860 M652 770 V860', 'none', '#fff', 9)
      + S('M500 960 L742 960 L760 1080 L482 1080Z', '#FFB2C6', '#E07B98', 7) + paw(621, 1020, 1.2, '#F07899') }),
  'outfit-varsity': top({ c: '#2F5BC4', d: '#18337A', hem: 1110,
    inside: `<rect x="616" y="740" width="10" height="380" fill="#fff"/>` + S('M540 742 L621 800 L702 742', 'none', '#fff', 14)
      + `<rect x="300" y="1068" width="650" height="16" fill="#fff"/>` + C(320, 866, 125, 'none', '#fff', 14) + C(906, 866, 125, 'none', '#fff', 14)
      + `<text x="700" y="900" font-family="Arial Black,Arial" font-weight="900" font-size="90" fill="#fff" stroke="#18337A" stroke-width="4">K</text>` + buttons(595, [880, 960, 1040], '#fff', '#18337A') }),
  'outfit-redcoat': top({ c: '#E8424A', d: '#9E1C27', hem: 1140,
    inside: S('M520 742 L621 905 L722 742', 'none', '#fff', 26) + `<rect x="300" y="1100" width="650" height="30" fill="#fff"/>`,
    over: bow(621, 905, .8, '#fff', '#C9B7BE') + S('M605 925 Q590 1010 575 1080', 'none', '#C9B7BE', 20) + S('M605 925 Q590 1010 575 1080', 'none', '#fff', 12)
      + S('M640 925 Q650 1000 668 1060', 'none', '#C9B7BE', 20) + S('M640 925 Q650 1000 668 1060', 'none', '#fff', 12) }),
  'outfit-apron': top({ c: '#FFD43B', d: '#D99A00', hem: 1150, sl: 'N',
    inside: '', under: '', over: '' }).replace(/<rect x="-300" y="600" width="1900" height="(\d+)" fill="#D99A00"\/>/, (m) => `<path d="M480 820 L762 820 L790 1150 L452 1150Z M480 820 L430 745 L460 742 L515 820Z M762 820 L812 745 L782 742 L727 820Z" fill="#D99A00"/>`)
      .replace(/<rect x="-300" y="600" width="1900" height="(\d+)" fill="#FFD43B"\/>/, `<path d="M492 832 L750 832 L776 1140 L466 1140Z M486 818 L444 752 L456 750 L506 818Z M756 818 L798 752 L786 750 L736 818Z" fill="#FFD43B"/>`
        + S('M545 900 L697 900 L690 1010 L552 1010Z', '#FFE477', '#D99A00', 7) + paw(621, 960, 1.05, '#F59E0B') + C(500, 845, 12, '#fff', '#D99A00', 5) + C(742, 845, 12, '#fff', '#D99A00', 5)),
  'outfit-coat': top({ c: '#FFFFFF', d: '#B9B6C8', hem: 1140,
    inside: S('M520 742 L590 860 L621 800 L652 860 L722 742', '#F1EEF6', '#B9B6C8', 7) + buttons(580, [900, 980, 1060], '#F4B400', '#B07D00') + buttons(662, [900, 980, 1060], '#F4B400', '#B07D00')
      + `<rect x="616" y="860" width="10" height="290" fill="#D8D4E3"/>` }),
  'outfit-explorer': top({ c: '#F2C14E', d: '#B07D12', hem: 1110, sl: 'N',
    inside: `<rect x="575" y="740" width="92" height="400" fill="#FFF4D6"/>` + S('M470 940 h90 v80 h-90z M682 940 h90 v80 h-90z', '#E0A82E', '#B07D12', 6)
      + S('M500 760 L560 900 M742 760 L682 900', 'none', '#6B4A1E', 14),
    over: `<g transform="translate(621 905)"><rect x="-62" y="-40" width="124" height="86" rx="16" fill="#4A4A55" stroke="#22222A" stroke-width="8"/>${C(0, 4, 30, '#9DB4D8', '#22222A', 8)}${C(0, 4, 14, '#2B3F66')}<rect x="-50" y="-55" width="36" height="18" rx="5" fill="#4A4A55" stroke="#22222A" stroke-width="6"/></g>` }),

  /* ---------- 頸部（都在下巴下面） ---------- */
  'neck-bow': `<g clip-path="url(#b0)">${bow(621, 785, 1.35, '#E5383B', '#A81F2A')}</g>`,
  'neck-scarf': `<g clip-path="url(#b0)">${S(chinPath(26), 'none', '#2E7CC2', 76)}${S(chinPath(26), 'none', '#5DB3F0', 58)}</g>`
    + S('M700 760 Q720 860 690 960 L760 965 Q780 860 760 755Z', '#5DB3F0', '#2E7CC2', 9) + S('M705 945 l14 30 M728 948 l10 30 M748 950 l6 28', 'none', '#2E7CC2', 6),
  'neck-check': `<g clip-path="url(#b0)">${S(chinPath(26), 'none', '#C94F5F', 76)}${S(chinPath(26), 'none', 'url(#plaid)', 58)}</g>`
    + S('M520 760 Q505 860 530 960 L592 958 Q575 860 585 755Z', 'url(#plaid)', '#C94F5F', 9),
  'neck-bell': `<g clip-path="url(#b0)">${S(chinPath(12), 'none', '#C88A10', 30)}${S(chinPath(12), 'none', '#FFD34D', 18)}</g>`
    + C(621, 800, 34, '#FFD34D', '#C88A10', 8) + S('M600 806 h42', 'none', '#C88A10', 7) + C(621, 818, 6, '#8A5A00') + hl(608, 788, 9, 5, -30, .7),
  'neck-bandana': `<g clip-path="url(#b0)">${S('M440 725 Q621 770 802 725 L621 930Z', '#E5383B', '#A81F2A', 10)}</g>` + paw(621, 820, 1.1, '#fff'),
  'neck-badge': `<g clip-path="url(#b0)">${S('M470 730 L606 900 M772 730 L636 900', 'none', '#A81F2A', 26)}${S('M470 730 L606 900 M772 730 L636 900', 'none', '#E5383B', 15)}</g>`
    + `<rect x="566" y="885" width="110" height="135" rx="14" fill="#fff" stroke="#3D7BD9" stroke-width="9"/>` + `<rect x="586" y="905" width="70" height="44" rx="6" fill="#CFE3FF"/>` + paw(621, 985, .55, '#3D7BD9') + `<rect x="604" y="872" width="34" height="22" rx="6" fill="#ccc" stroke="#888" stroke-width="5"/>`,
  'neck-phones': `<g clip-path="url(#b0)">${S(chinPath(20), 'none', '#2A6FC9', 34)}${S(chinPath(20), 'none', '#6CB4F5', 20)}</g>`
    + E(420, 770, 52, 66, '#6CB4F5', '#2A6FC9', 9, 15) + E(420, 770, 28, 40, '#CFE7FF', null, 0, 15) + E(822, 770, 52, 66, '#6CB4F5', '#2A6FC9', 9, -15) + E(822, 770, 28, 40, '#CFE7FF', null, 0, -15),

  /* ---------- 帽子（頭頂 y≈132，兩耳中心 (339,190)、(878,190)） ---------- */
  'hat-beret': S('M330 240 Q300 120 520 85 Q760 55 900 150 Q960 215 880 250 Q620 300 330 240Z', '#E5383B', '#A81F2A', 10) + C(660, 66, 24, '#E5383B', '#A81F2A', 9)
    + S('M380 250 Q620 285 860 245', 'none', '#B92530', 12) + hl(470, 140, 70, 22, -12),
  'hat-beanie': S('M350 280 Q340 40 621 20 Q900 40 892 280Z', 'url(#knit)', '#C9950F', 10) + `<rect x="335" y="225" width="572" height="80" rx="34" fill="#FFE36E" stroke="#C9950F" stroke-width="10"/>`
    + S('M380 240 V290 M430 240 V292 M480 240 V294 M530 240 V295 M580 240 V296 M630 240 V296 M680 240 V295 M730 240 V294 M780 240 V292 M830 240 V290', 'none', '#E9B520', 7)
    + C(621, 10, 52, '#fff', '#D8CFC0', 8) + hl(470, 110, 60, 22, -20),
  'hat-bucket': S('M410 210 Q420 40 621 35 Q822 40 832 210Z', '#F6E2B3', '#B98F4A', 10) + S('M300 290 Q330 200 621 200 Q912 200 942 290 Q621 330 300 290Z', '#EBCB8B', '#B98F4A', 10)
    + C(621, 125, 40, '#FFD43B', '#C9950F', 6) + C(606, 118, 5, '#5A3A1A') + C(636, 118, 5, '#5A3A1A') + S('M603 136 Q621 150 639 136', 'none', '#5A3A1A', 5) + hl(500, 100, 50, 18),
  'hat-straw': S('M200 255 Q230 175 621 170 Q1012 175 1042 255 Q621 330 200 255Z', '#F1C97B', '#B88A3A', 10) + S('M430 200 Q440 40 621 35 Q802 40 812 200Z', '#F6D99A', '#B88A3A', 10)
    + S('M432 165 Q621 190 810 165 L812 205 Q621 230 430 205Z', '#FF8FB0', '#D94F7A', 8) + bow(790, 190, .55, '#FF8FB0', '#D94F7A') + hl(520, 90, 50, 18),
  'hat-chef': S('M430 250 L430 160 Q330 140 360 60 Q380 -20 470 0 Q500 -90 621 -80 Q742 -90 772 0 Q862 -20 882 60 Q912 140 812 160 L812 250Z', '#fff', '#B9B6C8', 10)
    + `<rect x="425" y="200" width="392" height="66" rx="14" fill="#fff" stroke="#B9B6C8" stroke-width="10"/>` + hl(520, 40, 50, 22),
  'hat-gat': S('M220 250 Q621 175 1022 250 Q621 315 220 250Z', '#2B2B33', '#16161C', 8, 'fill-opacity=".85"') + S('M500 230 L510 40 Q621 20 732 40 L742 230 Q621 250 500 230Z', '#2B2B33', '#16161C', 9, 'fill-opacity=".92"')
    + S('M508 190 Q621 205 734 190', 'none', '#7A62B8', 14) + hl(560, 80, 20, 40, 0, .25),
  'hat-cap': S('M370 260 Q360 40 621 30 Q882 40 872 260Z', '#fff', '#2A5DB0', 10) + S('M430 250 Q430 60 621 40 L621 250Z', '#3D7BD9', null, 0) + S('M370 260 Q360 40 621 30 Q882 40 872 260Z', 'none', '#2A5DB0', 10)
    + S('M420 250 Q621 215 822 250 Q840 300 621 300 Q402 300 420 250Z', '#3D7BD9', '#2A5DB0', 10) + paw(680, 150, .9, '#F5A623') + C(621, 32, 14, '#3D7BD9', '#2A5DB0', 6),
  'hat-detective': S('M370 255 Q360 40 621 30 Q882 40 872 255Z', 'url(#check)', '#8A5A22', 10) + S('M420 245 Q621 230 822 245 Q800 310 621 305 Q442 310 420 245Z', 'url(#check)', '#8A5A22', 10)
    + bow(621, 40, .5, '#B8833F', '#8A5A22') + hl(480, 110, 50, 18),
  'hat-wizard': S('M330 250 Q621 190 912 250 Q621 315 330 250Z', '#7D4FC4', '#4B2A85', 10) + S('M450 240 L640 -190 Q660 -205 670 -180 L790 240Z', '#8E60D6', '#4B2A85', 10)
    + S('M455 222 Q621 250 787 222 L784 245 Q621 272 458 245Z', '#FFD23F', '#C9950F', 6) + S('M590 60 a40 40 0 1 0 40 55 a30 30 0 1 1 -40 -55Z', '#FFE36E', '#C9950F', 5)
    + `<path d="M680 0 l10 22 24 3 -18 16 5 24 -21 -12 -21 12 5 -24 -18 -16 24 -3z" fill="#FFE36E" stroke="#C9950F" stroke-width="4"/>`,
  'hat-aviator': S('M330 300 Q320 40 621 30 Q922 40 912 300 Q880 330 840 300 Q621 250 402 300 Q362 330 330 300Z', '#8B5A2B', '#5A3515', 10)
    + E(520, 205, 82, 70, '#F7C948', '#5A3515', 12) + E(722, 205, 82, 70, '#F7C948', '#5A3515', 12) + E(520, 205, 56, 46, '#8FD3FF') + E(722, 205, 56, 46, '#8FD3FF') + S('M602 205 h38', 'none', '#5A3515', 14)
    + hl(500, 188, 20, 10, -30, .8) + hl(702, 188, 20, 10, -30, .8),
  'hat-sailor': S('M400 230 Q380 70 621 60 Q862 70 842 230Z', '#fff', '#2C4FA3', 10) + `<rect x="395" y="200" width="452" height="72" rx="20" fill="#2C4FA3" stroke="#1D3570" stroke-width="9"/>`
    + `<g transform="translate(621 140)" stroke="#E0A800" stroke-width="12" fill="none" stroke-linecap="round"><circle cy="-36" r="12"/><path d="M0 -24 V44 M-26 -2 H26 M-40 24 Q0 66 40 24"/></g>`,
  'hat-santa': S('M360 260 Q380 40 621 30 Q850 30 960 200 Q1000 260 960 300 L900 260 Q850 140 760 120 L860 260Z', '#E5383B', '#A81F2A', 10)
    + `<rect x="335" y="215" width="572" height="80" rx="40" fill="#fff" stroke="#D9D2DE" stroke-width="9"/>` + C(980, 300, 48, '#fff', '#D9D2DE', 9) + hl(500, 120, 60, 22),

  /* ---------- 髮飾 ---------- */
  'hair-ribbon': bow(760, 150, 1.15, '#FF8FB3', '#D94F7A'),
  'hair-dotbow': bow(760, 150, 1.15, 'url(#dots)', '#D94F7A'),
  'hair-bunny': S('M300 260 Q621 60 942 260', 'none', '#E07BA0', 30) + S('M300 260 Q621 60 942 260', 'none', '#FFC2D6', 18)
    + S('M500 150 Q430 -150 520 -170 Q600 -160 570 140Z', '#fff', '#E07BA0', 10) + S('M515 130 Q480 -100 525 -130 Q565 -110 548 130Z', '#FFC2D6')
    + S('M742 150 Q812 -150 722 -170 Q642 -160 672 140Z', '#fff', '#E07BA0', 10) + S('M727 130 Q762 -100 717 -130 Q677 -110 694 130Z', '#FFC2D6'),
  'hair-cat': S('M300 260 Q621 60 942 260', 'none', '#D94F7A', 30) + S('M300 260 Q621 60 942 260', 'none', '#FF8FB3', 18)
    + S('M420 170 L440 20 L560 120Z', '#FF8FB3', '#D94F7A', 10) + S('M450 150 L458 70 L520 125Z', '#FFD1E0') + S('M822 170 L802 20 L682 120Z', '#FF8FB3', '#D94F7A', 10) + S('M792 150 L784 70 L722 125Z', '#FFD1E0'),
  'hair-antler': S('M300 260 Q621 60 942 260', 'none', '#7A4A1C', 30) + S('M300 260 Q621 60 942 260', 'none', '#B9773A', 18)
    + mirror(S('M500 145 Q470 40 420 -40 M465 60 Q520 20 540 -30 M440 0 Q380 -10 350 -40', 'none', '#7A4A1C', 34) + S('M500 145 Q470 40 420 -40 M465 60 Q520 20 540 -30 M440 0 Q380 -10 350 -40', 'none', '#B9773A', 20))
    + S('M500 145 Q470 40 420 -40 M465 60 Q520 20 540 -30 M440 0 Q380 -10 350 -40', 'none', '#7A4A1C', 34) + S('M500 145 Q470 40 420 -40 M465 60 Q520 20 540 -30 M440 0 Q380 -10 350 -40', 'none', '#B9773A', 20),
  'hair-flowers': S('M300 250 Q621 70 942 250', 'none', '#5BA85B', 16) + [[330, 225], [400, 175], [480, 140], [560, 122], [640, 120], [720, 130], [800, 160], [870, 200], [925, 240]]
    .map(([x, y], i) => flower(x, y, 38, ['#FF9EC0', '#FFFFFF', '#FFC1D6'][i % 3], '#E07BA0')).join(''),
  'hair-laurel': mirror([0, 1, 2, 3, 4].map(i => E(390 - i * 18, 300 - i * 55, 22, 42, '#7BC67B', '#3E8E41', 6, -35 + i * 10)).join('') + S('M400 330 Q330 200 330 40', 'none', '#3E8E41', 8))
    + [0, 1, 2, 3, 4].map(i => E(390 - i * 18, 300 - i * 55, 22, 42, '#7BC67B', '#3E8E41', 6, -35 + i * 10)).join('') + S('M400 330 Q330 200 330 40', 'none', '#3E8E41', 8),
  'hair-halo': E(621, -40, 200, 52, 'none', '#E8A800', 34) + E(621, -40, 200, 52, 'none', '#FFE066', 20) + hl(520, -70, 40, 8, -5, .8),
  'hair-sprout': S('M300 260 Q621 60 942 260', 'none', '#7A4A1C', 26) + S('M300 260 Q621 60 942 260', 'none', '#B9773A', 14)
    + S('M621 150 V40', 'none', '#3E8E41', 14) + S('M621 60 Q560 -20 470 10 Q520 80 621 60Z', '#7BC67B', '#3E8E41', 8) + S('M621 50 Q690 -40 790 0 Q730 80 621 50Z', '#8FD68F', '#3E8E41', 8),
  'hair-bear': S('M300 260 Q621 60 942 260', 'none', '#C26A12', 30) + S('M300 260 Q621 60 942 260', 'none', '#F5A23C', 18)
    + C(470, 110, 62, '#F5A23C', '#C26A12', 10) + C(470, 110, 30, '#FFD9A8') + C(772, 110, 62, '#F5A23C', '#C26A12', 10) + C(772, 110, 30, '#FFD9A8'),
  'hair-hibiscus': E(880, 250, 40, 80, '#5BB85B', '#3E8E41', 7, 50) + flower(820, 200, 78, '#FF6F91', '#D63C66', '#FFD45C') + S('M820 200 L800 150 M820 200 L850 160', 'none', '#FFD45C', 6),
  'hair-sakura': flower(420, 190, 60, '#FFB7CE', '#E07BA0', '#FF6F91'),
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const uri = f => 'data:image/png;base64,' + fs.readFileSync(path.join(HERE, 'out', f)).toString('base64');
  const d = defs(uri('sil9.png'), uri('sil17.png'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: CV, height: CV } });
  const only = process.argv.slice(2);
  for (const [k, g] of Object.entries(ITEMS)) {
    if (only.length && !only.includes(k)) continue;
    await p.setContent(`<body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${CV}" height="${CV}" viewBox="${VB.join(' ')}">${d}${g}</svg></body>`);
    await p.screenshot({ path: path.join(OUT, k + '.png'), omitBackground: true });
  }
  await b.close(); console.log('drawn', Object.keys(ITEMS).length);
})();
