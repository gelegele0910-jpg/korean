/* ================= 吉祥物小老虎 호야 與商店獎品 =================
 * 平面畫風：只畫色塊。mascot(wear, size, mood) 回傳 SVG 字串，wear = {bg, hat, face, neck, hand}。 */

const ART_C = { fur:'#F6A03C', furD:'#E2852A', light:'#FFF4E4', stripe:'#5A3A2A', pink:'#FF9FA8', eye:'#2B2233' };

// 背景（畫在圓形裡）
const MA_BG = {
  '':      () => '<circle cx="100" cy="100" r="100" fill="var(--mascot-bg,#FFE7CF)"/>',
  tower:   () => `<rect width="200" height="200" fill="#BFE3FF"/><circle cx="160" cy="44" r="16" fill="#FFF3B0"/>
    <path d="M0 160 Q60 110 120 150 T200 140 V200 H0Z" fill="#7DC383"/><path d="M0 175 Q80 150 200 172 V200 H0Z" fill="#5BAA6A"/>
    <rect x="44" y="70" width="6" height="70" fill="#9AA5B1"/><rect x="38" y="92" width="18" height="10" rx="3" fill="#E85D5D"/>
    <rect x="46" y="54" width="2" height="18" fill="#9AA5B1"/><rect x="34" y="136" width="26" height="8" rx="3" fill="#8794A0"/>`,
  river:   () => `<rect width="200" height="200" fill="#1F2552"/><circle cx="150" cy="40" r="14" fill="#FFF3B0"/>
    <circle cx="40" cy="30" r="1.6" fill="#fff"/><circle cx="90" cy="22" r="1.4" fill="#fff"/><circle cx="120" cy="56" r="1.2" fill="#fff"/>
    <path d="M0 120 h20 v-30 h16 v30 h10 v-46 h18 v46 h12 v-22 h16 v22 h14 v-38 h18 v38 h12 v-26 h20 v26 h44 V200 H0Z" fill="#323A75"/>
    <rect y="140" width="200" height="60" fill="#2A3C7A"/><rect x="20" y="150" width="40" height="3" rx="1.5" fill="#FFD36E" opacity=".6"/>
    <rect x="120" y="162" width="56" height="3" rx="1.5" fill="#FF8FC8" opacity=".6"/><rect x="60" y="176" width="50" height="3" rx="1.5" fill="#7FE3FF" opacity=".6"/>`,
  sakura:  () => `<rect width="200" height="200" fill="#FFE4EC"/>
    ${[[30,40],[160,30],[60,150],[170,140],[110,24],[20,110],[178,88]].map(([x,y]) => `<g transform="translate(${x} ${y})" fill="#FF9DBB">
      ${[0,72,144,216,288].map(a => `<ellipse rx="4" ry="7" transform="rotate(${a}) translate(0 -6)"/>`).join('')}<circle r="2.5" fill="#FFE07A"/></g>`).join('')}`,
  beach:   () => `<rect width="200" height="200" fill="#9EE0F5"/><circle cx="40" cy="44" r="16" fill="#FFE27A"/>
    <rect y="120" width="200" height="40" fill="#3FB5D9"/><path d="M0 126 q12 -6 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 v6 H0Z" fill="#fff" opacity=".7"/>
    <rect y="156" width="200" height="44" fill="#FFE1A8"/>`,
  palace:  () => `<rect width="200" height="200" fill="#FFF1D6"/><rect y="150" width="200" height="50" fill="#D9C3A0"/>
    <path d="M18 92 Q100 64 182 92 L170 100 H30Z" fill="#3E5C4B"/><rect x="34" y="100" width="132" height="10" fill="#C0392B"/>
    <path d="M30 110 h140 v40 h-140z" fill="#E9D7B5"/><rect x="40" y="110" width="8" height="40" fill="#C0392B"/><rect x="152" y="110" width="8" height="40" fill="#C0392B"/>
    <rect x="86" y="118" width="28" height="32" fill="#7A3B2A"/>`,
};

// 頭頂
const MA_HAT = {
  beret:  () => `<ellipse cx="96" cy="52" rx="44" ry="15" fill="#D9475A"/><ellipse cx="96" cy="47" rx="38" ry="14" fill="#E8596B"/><circle cx="96" cy="33" r="4" fill="#D9475A"/>`,
  bunny:  () => `<rect x="54" y="44" width="92" height="8" rx="4" fill="#FF8FB1"/>
    <ellipse cx="78" cy="22" rx="10" ry="24" fill="#fff"/><ellipse cx="78" cy="24" rx="5" ry="16" fill="#FFC1D3"/>
    <ellipse cx="122" cy="22" rx="10" ry="24" fill="#fff"/><ellipse cx="122" cy="24" rx="5" ry="16" fill="#FFC1D3"/>`,
  chef:   () => `<rect x="70" y="36" width="60" height="18" rx="4" fill="#fff"/><circle cx="78" cy="30" r="14" fill="#fff"/><circle cx="100" cy="22" r="17" fill="#fff"/><circle cx="122" cy="30" r="14" fill="#fff"/>
    <rect x="70" y="48" width="60" height="6" fill="#E6E6EF"/>`,
  crown:  () => `<path d="M68 54 L70 26 L84 40 L100 20 L116 40 L130 26 L132 54Z" fill="#FFC93C"/><rect x="68" y="48" width="64" height="8" rx="3" fill="#F4A91E"/>
    <circle cx="100" cy="38" r="4" fill="#4DB6FF"/><circle cx="83" cy="44" r="3" fill="#FF6B8A"/><circle cx="117" cy="44" r="3" fill="#FF6B8A"/>`,
  gat:    () => `<ellipse cx="100" cy="52" rx="66" ry="11" fill="#1E1E26" opacity=".88"/><rect x="78" y="18" width="44" height="36" rx="10" fill="#1E1E26" opacity=".9"/>
    <rect x="78" y="44" width="44" height="5" fill="#4A3B6B"/><path d="M60 58 Q56 130 70 150" stroke="#1E1E26" stroke-width="2" fill="none" opacity=".6"/>`,
  ribbon: () => `<path d="M104 46 L86 30 Q80 48 100 50 Z" fill="#FF6FA5"/><path d="M110 46 L128 30 Q134 48 114 50 Z" fill="#FF6FA5"/><circle cx="107" cy="47" r="6" fill="#E84C8A"/>`,
};
// 臉上
const MA_FACE = {
  round:  () => `<g fill="none" stroke="#3B2A22" stroke-width="3.5"><circle cx="76" cy="98" r="15"/><circle cx="124" cy="98" r="15"/><path d="M91 97 Q100 92 109 97"/></g>`,
  sun:    () => `<rect x="58" y="86" width="34" height="24" rx="10" fill="#26222E"/><rect x="108" y="86" width="34" height="24" rx="10" fill="#26222E"/>
    <rect x="90" y="94" width="20" height="4" fill="#26222E"/><rect x="64" y="90" width="10" height="5" rx="2.5" fill="#fff" opacity=".5"/><rect x="114" y="90" width="10" height="5" rx="2.5" fill="#fff" opacity=".5"/>`,
  heart:  () => `<g fill="#FF5C8A"><path d="M66 110 c-6 -6 -2 -13 4 -10 c6 -3 10 4 4 10 l-4 4z"/><path d="M130 110 c-6 -6 -2 -13 4 -10 c6 -3 10 4 4 10 l-4 4z"/></g>`,
};
// 脖子
const MA_NECK = {
  scarf:  () => `<rect x="62" y="146" width="76" height="16" rx="8" fill="#3D8BFF"/><rect x="114" y="152" width="14" height="30" rx="6" fill="#2F75E0"/>
    <rect x="62" y="150" width="76" height="4" fill="#7FB2FF" opacity=".6"/>`,
  bow:    () => `<path d="M100 156 L80 146 L80 166 Z" fill="#E8434F"/><path d="M100 156 L120 146 L120 166 Z" fill="#E8434F"/><circle cx="100" cy="156" r="5" fill="#C0303B"/>`,
  hanbok: () => `<path d="M64 150 Q100 166 136 150 L144 200 H56Z" fill="#FFD1DC"/><path d="M84 150 L100 176 L116 150" fill="#fff"/>
    <path d="M100 168 q-16 6 -10 24" stroke="#E0457B" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 168 q14 4 12 22" stroke="#E0457B" stroke-width="4" fill="none" stroke-linecap="round"/>`,
};
// 手上（右下方，小圓手握著）
const PAW = '<circle cx="150" cy="172" r="10" fill="' + ART_C.fur + '"/>';
const MA_HAND = {
  coffee: () => `<rect x="142" y="136" width="22" height="30" rx="4" fill="#fff"/><rect x="142" y="146" width="22" height="10" fill="#8B5A3C"/>
    <rect x="140" y="132" width="26" height="6" rx="3" fill="#5A3A2A"/><rect x="152" y="118" width="3" height="16" fill="#FF7A59"/>${PAW}`,
  mic:    () => `<rect x="147" y="146" width="7" height="28" rx="3" fill="#3B3B48"/><circle cx="150.5" cy="140" r="10" fill="#9AA0B4"/>
    <path d="M142 138 h17 M142 143 h17" stroke="#6E7488" stroke-width="1.5"/>${PAW}`,
  stick:  () => `<rect x="148" y="134" width="6" height="40" rx="3" fill="#3B3B48"/><circle cx="151" cy="126" r="14" fill="#B47CFF"/><circle cx="151" cy="126" r="8" fill="#E4CCFF"/>
    <path d="M144 120 l14 12 M158 120 l-14 12" stroke="#fff" stroke-width="2" opacity=".7"/>${PAW}`,
  flag:   () => `<rect x="148" y="112" width="4" height="62" fill="#8B6B4A"/><rect x="152" y="112" width="34" height="24" fill="#fff"/>
    <circle cx="169" cy="124" r="7" fill="#CD2E3A"/><path d="M162 124 a7 7 0 0 0 14 0 a3.5 3.5 0 0 0 -7 0 a3.5 3.5 0 0 1 -7 0" fill="#0047A0"/>${PAW}`,
  kimbap: () => `<circle cx="152" cy="146" r="16" fill="#1F2A22"/><circle cx="152" cy="146" r="12" fill="#fff"/>
    <circle cx="148" cy="142" r="3" fill="#F4C430"/><circle cx="156" cy="143" r="3" fill="#E8434F"/><circle cx="152" cy="151" r="3" fill="#5BB85B"/>${PAW}`,
};

function mascot(wear, size, mood) {
  wear = wear || {}; size = size || 120; mood = mood || 'normal';
  const C = ART_C;
  const part = (tbl, k) => (k && tbl[k] ? tbl[k]() : '');
  const eyes = mood === 'happy'
    ? `<path d="M66 100 Q76 88 86 100" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 100 Q124 88 134 100" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    : mood === 'think'
    ? `<circle cx="76" cy="98" r="11" fill="#fff"/><circle cx="124" cy="98" r="11" fill="#fff"/><circle cx="79" cy="94" r="6" fill="${C.eye}"/><circle cx="127" cy="94" r="6" fill="${C.eye}"/>`
    : `<circle cx="76" cy="98" r="11" fill="#fff"/><circle cx="124" cy="98" r="11" fill="#fff"/><circle cx="77" cy="100" r="6.5" fill="${C.eye}"/><circle cx="125" cy="100" r="6.5" fill="${C.eye}"/>
       <circle cx="79" cy="97" r="2" fill="#fff"/><circle cx="127" cy="97" r="2" fill="#fff"/>`;
  const mouth = mood === 'happy'
    ? `<path d="M90 124 Q100 138 110 124 Z" fill="#7A2E3A"/>`
    : `<path d="M91 124 Q100 131 100 123 Q100 131 109 124" stroke="${C.stripe}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const id = 'm' + Math.random().toString(36).slice(2, 8);
  return `<svg class="mascot" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="小老虎호야">
  <defs><clipPath id="${id}"><circle cx="100" cy="100" r="100"/></clipPath></defs>
  <g clip-path="url(#${id})">${(MA_BG[wear.bg || ''] || MA_BG[''])()}
  <ellipse cx="100" cy="186" rx="46" ry="34" fill="${C.fur}"/><ellipse cx="100" cy="192" rx="26" ry="22" fill="${C.light}"/>
  <path d="M60 176 q8 4 6 12 M140 176 q-8 4 -6 12" stroke="${C.stripe}" stroke-width="5" fill="none" stroke-linecap="round"/>
  ${part(MA_NECK, wear.neck)}
  <circle cx="58" cy="58" r="20" fill="${C.fur}"/><circle cx="58" cy="58" r="10" fill="${C.light}"/>
  <circle cx="142" cy="58" r="20" fill="${C.fur}"/><circle cx="142" cy="58" r="10" fill="${C.light}"/>
  <ellipse cx="100" cy="102" rx="64" ry="56" fill="${C.fur}"/>
  <path d="M90 48 h20 l-4 18 h-12z M70 54 l12 -2 -2 14z M130 54 l-12 -2 2 14z" fill="${C.stripe}"/>
  <path d="M36 96 h16 M37 108 h14 M148 96 h16 M149 108 h14" stroke="${C.stripe}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="100" cy="124" rx="32" ry="22" fill="${C.light}"/>
  <ellipse cx="60" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".7"/><ellipse cx="140" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".7"/>
  ${eyes}
  <path d="M93 111 h14 q-7 9 -14 0z" fill="${C.stripe}"/>
  ${mouth}
  ${part(MA_FACE, wear.face)}${part(MA_HAT, wear.hat)}${part(MA_HAND, wear.hand)}
  </g></svg>`;
}

/* 商店：cat 分類、price 價格（₩）。0 元＝一開始就有。id 是存檔 key，不要改。 */
const SHOP = [
  { id:'skin:fresh',    cat:'skin', nm:'清新',     price:0 },
  { id:'skin:night',    cat:'skin', nm:'夜間',     price:0, dark:true },
  { id:'skin:hanji',    cat:'skin', nm:'韓紙',     price:1500 },
  { id:'skin:sakura',   cat:'skin', nm:'櫻花',     price:1500 },
  { id:'skin:notebook', cat:'skin', nm:'筆記本',   price:1500 },
  { id:'skin:neon',     cat:'skin', nm:'首爾夜景', price:2500, dark:true },
  { id:'hat:beret',  cat:'hat',  nm:'貝雷帽',   price:800 },
  { id:'hat:ribbon', cat:'hat',  nm:'蝴蝶結',   price:600 },
  { id:'hat:bunny',  cat:'hat',  nm:'兔耳髮箍', price:1000 },
  { id:'hat:chef',   cat:'hat',  nm:'廚師帽',   price:1200 },
  { id:'hat:gat',    cat:'hat',  nm:'韓式笠帽（갓）', price:2000 },
  { id:'hat:crown',  cat:'hat',  nm:'王冠',     price:3000 },
  { id:'face:round', cat:'face', nm:'圓框眼鏡', price:600 },
  { id:'face:sun',   cat:'face', nm:'墨鏡',     price:900 },
  { id:'face:heart', cat:'face', nm:'愛心腮紅', price:500 },
  { id:'neck:bow',    cat:'neck', nm:'領結',     price:500 },
  { id:'neck:scarf',  cat:'neck', nm:'圍巾',     price:700 },
  { id:'neck:hanbok', cat:'neck', nm:'韓服',     price:2500 },
  { id:'hand:coffee', cat:'hand', nm:'冰美式',   price:600 },
  { id:'hand:kimbap', cat:'hand', nm:'海苔飯捲', price:700 },
  { id:'hand:mic',    cat:'hand', nm:'麥克風',   price:1000 },
  { id:'hand:flag',   cat:'hand', nm:'太極旗',   price:1000 },
  { id:'hand:stick',  cat:'hand', nm:'應援棒',   price:1500 },
  { id:'bg:tower',  cat:'bg', nm:'南山塔',   price:1200 },
  { id:'bg:beach',  cat:'bg', nm:'釜山海邊', price:1200 },
  { id:'bg:sakura', cat:'bg', nm:'櫻花季',   price:1200 },
  { id:'bg:palace', cat:'bg', nm:'景福宮',   price:1800 },
  { id:'bg:river',  cat:'bg', nm:'漢江夜景', price:2000 },
];
const SHOP_CATS = [['skin','介面風格'],['hat','頭上'],['face','臉上'],['neck','身上'],['hand','手上'],['bg','背景']];

// 吉祥物的話
const HOYA_LINES = ['오늘도 화이팅！今天也加油！', '천천히 해도 괜찮아요. 慢慢來沒關係。', '잘하고 있어요！你做得很好！', '한 걸음씩！一步一步來！', '같이 공부해요！一起學習吧！'];

/* ================= 嘴型圖（母音） =================
 * w 嘴巴寬、h 張開高度、r 圓唇（嘴唇往前嘟）、s 扁平（嘴角往兩邊拉）、c 說明。
 * 雙母音（ㅑ、ㅘ…）用 MOUTH_SEQ 畫「起點 → 終點」兩張。 */
const MOUTH = {
  'ㅏ': { w:58, h:40, c:'張大' },
  'ㅓ': { w:46, h:26, c:'半開・不圓' },
  'ㅗ': { w:26, h:24, r:1, c:'圓・往前嘟' },
  'ㅜ': { w:16, h:14, r:1, c:'小圓・嘟更前' },
  'ㅡ': { w:62, h:6,  s:1, c:'扁平・嘴角拉開' },
  'ㅣ': { w:64, h:9,  s:1, c:'扁平・像微笑' },
  'ㅐ': { w:54, h:30, c:'半開・嘴角稍拉' },
  'ㅔ': { w:52, h:24, c:'半開・嘴角稍拉' },
};
const MOUTH_SEQ = { 'ㅑ':['ㅣ','ㅏ'], 'ㅕ':['ㅣ','ㅓ'], 'ㅛ':['ㅣ','ㅗ'], 'ㅠ':['ㅣ','ㅜ'], 'ㅒ':['ㅣ','ㅐ'], 'ㅖ':['ㅣ','ㅔ'],
  'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅐ'], 'ㅚ':['ㅜ','ㅔ'], 'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅔ'], 'ㅟ':['ㅜ','ㅣ'], 'ㅢ':['ㅡ','ㅣ'] };
function mouthSvg(v, size) {
  const m = MOUTH[v]; if (!m) return '';
  size = size || 96;
  const lipX = m.w / 2 + (m.r ? 13 : 9), lipY = m.h / 2 + (m.r ? 12 : 8);
  const teeth = !m.r && m.h > 5 ? `<rect x="${60 - m.w / 2}" y="${45 - m.h / 2}" width="${m.w}" height="${Math.min(7, m.h / 2.5)}" fill="#fff"/>` : '';
  const tongue = m.h >= 24 && !m.r ? `<ellipse cx="60" cy="${45 + m.h / 2}" rx="${m.w / 3}" ry="${m.h / 4}" fill="#E86A7A"/>` : '';
  const arrows = m.s ? `<path d="M10 45 h12 M14 41 l-4 4 4 4 M110 45 h-12 M106 41 l4 4 -4 4" stroke="var(--sub,#888)" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
    : m.r ? `<path d="M60 ${45 - lipY - 8} v-5 M60 ${45 + lipY + 8} v5" stroke="var(--sub,#888)" stroke-width="2" stroke-linecap="round"/><circle cx="60" cy="45" r="${lipX + 6}" fill="none" stroke="var(--sub,#888)" stroke-width="1.5" stroke-dasharray="3 4"/>` : '';
  const id = 'mo' + Math.random().toString(36).slice(2, 8);
  return `<svg class="mouth" viewBox="0 0 120 90" width="${size}" height="${size * .75}" role="img" aria-label="${v} 的嘴型：${m.c}">
    <defs><clipPath id="${id}"><ellipse cx="60" cy="45" rx="${m.w / 2}" ry="${m.h / 2}"/></clipPath></defs>
    ${arrows}<ellipse cx="60" cy="45" rx="${lipX}" ry="${lipY}" fill="${m.r ? '#E8737F' : '#F0939C'}"/>
    <ellipse cx="60" cy="45" rx="${m.w / 2}" ry="${m.h / 2}" fill="#5B1F2E"/><g clip-path="url(#${id})">${teeth}${tongue}</g></svg>`;
}
/** 嘴型＋說明；雙母音畫兩張中間加箭頭 */
function mouthHtml(v, size) {
  if (MOUTH[v]) return `<figure class="mouthfig">${mouthSvg(v, size)}<figcaption>${MOUTH[v].c}</figcaption></figure>`;
  const q = MOUTH_SEQ[v]; if (!q) return '';
  return `<div class="mouthseq">${mouthHtml(q[0], size * .8)}<span class="arr">→</span>${mouthHtml(q[1], size * .8)}</div>
    <div class="sub small center">從 ${q[0]} 的嘴型快速滑到 ${q[1]}</div>`;
}

/* 母音位置圖：左＝舌頭在前、右＝舌頭在後；上＝嘴巴閉、下＝嘴巴開。圓唇的母音用藍色。 */
const VMAP = [['ㅣ',48,36],['ㅔ',78,96],['ㅐ',104,146],['ㅏ',168,190],['ㅓ',236,140],['ㅗ',262,92],['ㅡ',196,36],['ㅜ',270,36]];
function vowelMap() {
  const pos = Object.fromEntries(VMAP.map(([v, x, y]) => [v, [x, y]]));
  const link = (a, b) => `<line x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" stroke="var(--accent2)" stroke-width="2" stroke-dasharray="5 5"/>`;
  return `<svg class="vmap" viewBox="0 0 320 236" role="img" aria-label="母音位置圖">
    <path d="M28 20 H300 V214 H120 Z" fill="var(--chip)" stroke="var(--line)" stroke-width="2"/>
    <text x="30" y="14" class="ax">← 舌頭在前</text><text x="300" y="14" class="ax" text-anchor="end">舌頭在後 →</text>
    <text x="30" y="232" class="ax">↓ 嘴巴張大</text>
    ${link('ㅡ', 'ㅜ')}${link('ㅓ', 'ㅗ')}
    ${VMAP.map(([v, x, y]) => { const r = MOUTH[v].r; return `<g class="vdot" data-act="say" data-t="${KH.comp('ㅇ', v)}" tabindex="0" role="button" aria-label="播放 ${v}">
      <circle cx="${x}" cy="${y}" r="19" fill="${r ? 'var(--accent2)' : 'var(--accent)'}"/><text x="${x}" y="${y + 7}" text-anchor="middle" class="vt">${v}</text></g>`; }).join('')}
  </svg>`;
}

/* ================= 子音發音側面圖 =================
 * 從側面看（臉朝左）：舌頭碰哪裡（p）＋怎麼出氣（m：plain 輕／asp 送氣／tense 硬音／nasal 鼻音）。 */
const CART = {
  'ㄱ':['back'], 'ㅋ':['back','asp'], 'ㄲ':['back','tense'], 'ㅇ':['back','nasal'],
  'ㄴ':['tip','nasal'], 'ㄷ':['tip'], 'ㅌ':['tip','asp'], 'ㄸ':['tip','tense'], 'ㄹ':['flap'],
  'ㅁ':['lips','nasal'], 'ㅂ':['lips'], 'ㅍ':['lips','asp'], 'ㅃ':['lips','tense'],
  'ㅅ':['s'], 'ㅆ':['s','tense'], 'ㅈ':['blade'], 'ㅊ':['blade','asp'], 'ㅉ':['blade','tense'], 'ㅎ':['h','asp'],
};
const CPLACE = { lips:'雙唇閉起來', tip:'舌尖頂住上牙齦', flap:'舌尖輕彈上牙齦', s:'舌尖靠近上牙齦、留一條縫', blade:'舌面貼住上顎', back:'舌根頂住軟顎', h:'嘴巴打開、從喉嚨送氣' };
const CMANNER = { plain:'輕輕的', asp:'吐一大口氣', tense:'喉嚨繃緊・不吐氣', nasal:'從鼻子出聲' };
// 字形由來：基本字是模仿發音器官，加一畫＝聲音更強
const CSHAPE = {
  'ㄱ':'ㄱ 的形狀＝舌根往上頂住的樣子。', 'ㄴ':'ㄴ 的形狀＝舌尖往上碰牙齦的樣子。', 'ㅁ':'ㅁ 的形狀＝嘴巴（雙唇）。', 'ㅅ':'ㅅ 的形狀＝牙齒。', 'ㅇ':'ㅇ 的形狀＝喉嚨。',
  'ㅋ':'ㄱ 加一畫＝多吐氣。', 'ㄷ':'ㄴ 加一畫＝舌尖頂住後放開。', 'ㅌ':'ㄷ 再加一畫＝多吐氣。', 'ㅂ':'ㅁ 加兩畫＝雙唇閉住後放開。', 'ㅍ':'ㅂ 再變化＝多吐氣。',
  'ㅈ':'ㅅ 加一畫。', 'ㅊ':'ㅈ 再加一點＝多吐氣。', 'ㅎ':'ㅇ 加上面兩畫＝從喉嚨吐氣。', 'ㄹ':'ㄹ 是舌頭彈動的樣子。',
  'ㄲ':'兩個 ㄱ 並排＝硬音（喉嚨繃緊）。', 'ㄸ':'兩個 ㄷ 並排＝硬音。', 'ㅃ':'兩個 ㅂ 並排＝硬音。', 'ㅆ':'兩個 ㅅ 並排＝硬音。', 'ㅉ':'兩個 ㅈ 並排＝硬音。',
};
const TONGUE = {
  rest:  'M30 68 Q34 60 46 60 Q70 57 90 61 Q100 67 102 80 L102 100 L44 100 Q40 82 30 68 Z',
  lips:  'M30 68 Q34 60 46 60 Q70 57 90 61 Q100 67 102 80 L102 100 L44 100 Q40 82 30 68 Z',
  tip:   'M33 63 Q31 51 37 47.5 Q43 49 48 57 Q70 58 90 61 Q100 67 102 80 L102 100 L44 100 Q40 82 33 63 Z',
  flap:  'M33 63 Q31 51 37 47.5 Q43 49 48 57 Q70 58 90 61 Q100 67 102 80 L102 100 L44 100 Q40 82 33 63 Z',
  s:     'M33 64 Q32 54 37 51.5 Q43 52 48 58 Q70 58 90 61 Q100 67 102 80 L102 100 L44 100 Q40 82 33 64 Z',
  blade: 'M32 66 Q33 54 43 46 Q53 41 62 44.5 Q76 54 92 61 Q100 67 102 80 V100 H44 Q40 82 32 66 Z',
  back:  'M30 68 Q34 62 46 61 Q66 58 77 48 Q87 41.5 96 46 Q102 58 102 80 V100 H44 Q40 82 30 68 Z',
  h:     'M30 70 Q34 64 46 64 Q70 62 90 65 Q100 70 102 82 L102 100 L44 100 Q40 84 30 70 Z',
};
const CTOUCH = { lips:[18,55], tip:[37,47], flap:[37,47], s:[37,49], blade:[52,42], back:[90,43], h:[103,72] };
function consSvg(j, size) {
  const a = CART[j]; if (!a) return '';
  size = size || 110;
  const p = a[0], m = a[1] || 'plain';
  const lipsClosed = p === 'lips';
  const id = 'cs' + Math.random().toString(36).slice(2, 8);
  const air = 'var(--accent2,#3B82F6)';
  let flow = '';
  if (m === 'nasal') flow = `<path d="M100 62 Q101 40 84 37 L30 40" fill="none" stroke="${air}" stroke-width="2.6" stroke-linecap="round"/><path d="M20 41 l8 -5 v10z" fill="${air}"/>`;
  else if (m === 'asp') flow = `<g stroke="${air}" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M12 50 h-10"/><path d="M12 56 q-6 -3 -11 0"/><path d="M12 62 h-10"/></g><text x="2" y="76" class="cs-t" fill="${air}">呼～</text>`;
  else if (m === 'plain' && p !== 'h') flow = `<path d="M12 56 h-6" stroke="${air}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
  const tense = m === 'tense' ? `<path d="M106 62 l4 4 -4 4 4 4 -4 4 4 4" stroke="#E5484D" stroke-width="2.6" fill="none" stroke-linejoin="round"/><text x="2" y="76" class="cs-t" fill="#E5484D">不吐氣</text>` : '';
  const flap = p === 'flap' ? `<path d="M44 58 q6 -4 2 -10" stroke="#E5484D" stroke-width="2" fill="none" marker-end=""/><path d="M44 46 l2 2 2 -3" stroke="#E5484D" stroke-width="2" fill="none"/>` : '';
  const sGap = p === 's' ? `<path d="M30 49.5 h-12" stroke="${air}" stroke-width="2" stroke-dasharray="2 2"/>` : '';
  const [tx, ty] = CTOUCH[p];
  return `<svg class="cart" viewBox="0 0 120 100" width="${size}" height="${size * 100 / 120}" role="img" aria-label="${j}：${CPLACE[p]}，${CMANNER[m]}">
    <defs><clipPath id="${id}"><path d="M62 0 C44 0 32 8 29 20 L19 33 Q14 38 21 40 L22 43 Q15 46 15 50 L15 62 Q14 72 24 76 Q28 82 34 84 L36 100 H120 V0 Z"/></clipPath></defs>
    <path d="M62 0 C44 0 32 8 29 20 L19 33 Q14 38 21 40 L22 43 Q15 46 15 50 L15 62 Q14 72 24 76 Q28 82 34 84 L36 100 H120 V0 Z" fill="#F6D2BC"/>
    <g clip-path="url(#${id})">
      <path d="M24 37 Q50 30 90 33 Q100 35 101 44 L96 44 Q90 38 60 39 Q40 40 26 43 Z" fill="#E9A99A"/>
      <path d="M22 50 Q30 47 36 45.5 Q44 41 60 39.5 Q80 38.5 92 43 L104 46 L104 100 L80 100 Q60 72 30 68 Z" fill="#7A2E3A"/>
      <path d="${TONGUE[p]}" fill="#E45B6B"/>
      <rect x="25" y="${lipsClosed ? 47 : 45.5}" width="6" height="6" rx="1.5" fill="#fff"/><rect x="25" y="${lipsClosed ? 60 : 62}" width="6" height="5" rx="1.5" fill="#fff"/>
      <ellipse cx="18" cy="${lipsClosed ? 52 : 49}" rx="6" ry="4" fill="#D9707A"/><ellipse cx="18" cy="${lipsClosed ? 59 : 65}" rx="6" ry="4.2" fill="#D9707A"/>
      <rect x="104" y="40" width="16" height="60" fill="#F6D2BC"/>
    </g>
    ${flow}${tense}${flap}${sGap}
    <circle cx="${tx}" cy="${ty}" r="4.5" fill="#FFD43B" stroke="#B8860B" stroke-width="1.2"/>
  </svg>`;
}
/** 側面圖＋說明 */
function consHtml(j, size) {
  const a = CART[j]; if (!a) return '';
  return `<figure class="mouthfig">${consSvg(j, size)}<figcaption>${CPLACE[a[0]]}<br>${CMANNER[a[1] || 'plain']}</figcaption></figure>`;
}
