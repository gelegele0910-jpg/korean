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
