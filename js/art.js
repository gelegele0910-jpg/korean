/* ================= 吉祥物小老虎 호야 與商店獎品 =================
 * 小老虎與配件是使用者提供、可公開的插畫。tools/wear/build.py 把每一件預先對好位置，
 * 輸出成同樣大小（400×400）的透明圖層 img/wear/<欄位>-<代號>.webp，表情是 img/wear/tiger-<表情>.webp。
 * mascot(wear, size, mood) 只要把圖層疊起來，順序見 WEAR_ORDER；邊框（frame）把整隻縮小放在框裡。 */

// 9 種表情（tools/wear/expr.js 畫的）；mood 是程式裡用的心情名稱
const EXPRS = ['happy', 'laugh', 'smile', 'surprise', 'love', 'cry', 'wink', 'sleepy', 'shy'];
const MOOD = { normal: 'happy', happy: 'laugh', think: 'surprise' };
// 疊圖順序：背景 → 身後的特效（彩虹）→ 小老虎 → 服裝 → 頸部 → 臉部貼紙 → 眼鏡 → 髮飾 → 帽子 → 手上 → 特效
const WEAR_ORDER = ['outfit', 'neck', 'stk', 'face', 'hair', 'hat', 'hand'];
const FX_BACK = ['rainbow'];

/** cls：額外的 class（商店預覽用 zoom-face、zoom-head 放大局部） */
function mascot(wear, size, mood, cls) {
  wear = wear || {}; size = size || 120;
  const ok = c => wear[c] && SHOP.some(it => it.cat === c && !it.off && itemKey(it) === wear[c]);
  const img = f => `<img src="img/wear/${f}.webp" alt="" draggable="false">`;
  const e = EXPRS.includes(mood) ? mood : MOOD[mood] || 'happy';
  const fxBack = ok('fx') && FX_BACK.includes(wear.fx), fxFront = ok('fx') && !fxBack;
  const inner = (ok('bg') ? img('bg-' + wear.bg) : '') + (fxBack ? img('fx-' + wear.fx) : '') + img('tiger-' + e)
    + WEAR_ORDER.map(c => ok(c) ? img(c + '-' + wear[c]) : '').join('') + (fxFront ? img('fx-' + wear.fx) : '');
  return `<span class="mascot ${ok('frame') ? 'framed' : ''} ${cls || ''}" role="img" aria-label="小老虎호야" style="width:${size}px;height:${size}px">`
    + `<span class="mi">${inner}</span>${ok('frame') ? img('frame-' + wear.frame) : ''}</span>`;
}

/* 網站圖示用的平面小老虎（tools/make-icons.js 產生 icon.svg、PNG 圖示；App 畫面不用） */
const ART_C = { fur:'#F6A03C', light:'#FFF4E4', stripe:'#5A3A2A', pink:'#FF9FA8', eye:'#2B2233' };
function mascotSvg(size) {
  const C = ART_C;
  return `<svg class="mascot" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="小老虎호야">
  <circle cx="100" cy="100" r="100" fill="#FFE7CF"/>
  <ellipse cx="100" cy="186" rx="46" ry="34" fill="${C.fur}"/><ellipse cx="100" cy="192" rx="26" ry="22" fill="${C.light}"/>
  <path d="M60 176 q8 4 6 12 M140 176 q-8 4 -6 12" stroke="${C.stripe}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="58" cy="58" r="20" fill="${C.fur}"/><circle cx="58" cy="58" r="10" fill="${C.light}"/>
  <circle cx="142" cy="58" r="20" fill="${C.fur}"/><circle cx="142" cy="58" r="10" fill="${C.light}"/>
  <ellipse cx="100" cy="102" rx="64" ry="56" fill="${C.fur}"/>
  <path d="M90 48 h20 l-4 18 h-12z M70 54 l12 -2 -2 14z M130 54 l-12 -2 2 14z" fill="${C.stripe}"/>
  <path d="M36 96 h16 M37 108 h14 M148 96 h16 M149 108 h14" stroke="${C.stripe}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="100" cy="124" rx="32" ry="22" fill="${C.light}"/>
  <ellipse cx="60" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".7"/><ellipse cx="140" cy="122" rx="10" ry="6" fill="${C.pink}" opacity=".7"/>
  <path d="M66 100 Q76 88 86 100" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 100 Q124 88 134 100" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M93 111 h14 q-7 9 -14 0z" fill="${C.stripe}"/><path d="M90 124 Q100 138 110 124 Z" fill="#7A2E3A"/></svg>`;
}

/* 商店：cat 分類（＝S.wear 的欄位）、price 價格（₩）。0 元＝一開始就有。id 是存檔 key，不要改、不要刪。
 * 欄位用 cat、代號用 itemKey(it)，不要用 id 的前綴判斷欄位（例如 hat:ribbon 在髮飾、neck:hanbok 在服裝）。
 * off＝目前沒有插畫而下架，買過的人 migrate() 退還點數（S.rf 記錄，只退一次）。 */
const SHOP = [
  { id:'skin:fresh',    cat:'skin', nm:'清新',     price:0 },
  { id:'skin:night',    cat:'skin', nm:'夜間',     price:0, dark:true },
  { id:'skin:hanji',    cat:'skin', nm:'韓紙',     price:1500 },
  { id:'skin:sakura',   cat:'skin', nm:'櫻花',     price:1500 },
  { id:'skin:notebook', cat:'skin', nm:'筆記本',   price:1500 },
  { id:'skin:neon',     cat:'skin', nm:'首爾夜景', price:2500, dark:true },
  { id:'hat:beret',  cat:'hat',  nm:'貝雷帽',   price:800 },
  { id:'hat:ribbon', cat:'hair', nm:'蝴蝶結',   price:600 },
  { id:'hat:bunny',  cat:'hair', nm:'兔耳髮箍', price:1000 },
  { id:'hat:chef',   cat:'hat',  nm:'廚師帽',   price:1200 },
  { id:'hat:gat',    cat:'hat',  nm:'韓式笠帽（갓）', price:2000 },
  { id:'hat:crown',  cat:'hat',  nm:'王冠',     price:3000, off:true },
  { id:'face:round', cat:'face', nm:'圓框眼鏡', price:600 },
  { id:'face:sun',   cat:'face', nm:'墨鏡',     price:900 },
  { id:'face:heart', cat:'face', nm:'愛心眼鏡', price:500 },
  { id:'neck:bow',    cat:'neck', nm:'領結',     price:500 },
  { id:'neck:scarf',  cat:'neck', nm:'圍巾',     price:700 },
  { id:'neck:hanbok', cat:'outfit', nm:'粉紅韓服', price:2500 },
  { id:'hand:coffee', cat:'hand', nm:'珍珠奶茶', price:600 },
  { id:'hand:kimbap', cat:'hand', nm:'海苔飯捲', price:700 },
  { id:'hand:mic',    cat:'hand', nm:'麥克風',   price:1000 },
  { id:'hand:flag',   cat:'hand', nm:'太極旗',   price:1000 },
  { id:'hand:stick',  cat:'hand', nm:'應援棒',   price:1500 },
  { id:'bg:tower',  cat:'bg', nm:'南山塔',   price:1200 },
  { id:'bg:beach',  cat:'bg', nm:'釜山海邊', price:1200 },
  { id:'bg:sakura', cat:'bg', nm:'櫻花季',   price:1200 },
  { id:'bg:palace', cat:'bg', nm:'景福宮',   price:1800 },
  { id:'bg:river',  cat:'bg', nm:'漢江夜景', price:2000 },
  { id:'hat:beanie',     cat:'hat',    nm:'毛線帽',   price:700 },
  { id:'hat:cap',        cat:'hat',    nm:'棒球帽',   price:800 },
  { id:'hat:wizard',     cat:'hat',    nm:'魔法帽',   price:1800 },
  { id:'face:star',      cat:'face',   nm:'星星眼鏡', price:800 },
  { id:'neck:check',     cat:'neck',   nm:'格紋圍巾', price:700 },
  { id:'neck:medal',     cat:'neck',   nm:'金牌',     price:1500, off:true },
  { id:'outfit:hoodie',  cat:'outfit', nm:'連帽衣',   price:1500 },
  { id:'outfit:uniform', cat:'outfit', nm:'背心制服', price:1800 },
  { id:'outfit:coat',    cat:'outfit', nm:'白色大衣', price:1800 },
  { id:'outfit:cape',    cat:'outfit', nm:'魔法斗篷', price:2200, off:true },
  { id:'hand:book',      cat:'hand',   nm:'韓文書',   price:600 },
  { id:'hand:icecream',  cat:'hand',   nm:'冰淇淋',   price:700 },
  { id:'hand:camera',    cat:'hand',   nm:'相機',     price:1200 },
  { id:'bg:cafe',   cat:'bg', nm:'咖啡廳',   price:1000, off:true },
  { id:'bg:autumn', cat:'bg', nm:'楓葉季',   price:1200 },
  { id:'bg:snow',   cat:'bg', nm:'雪景',     price:1200 },
  { id:'fx:hearts', cat:'fx', nm:'愛心飄飄', price:1500 },
  { id:'fx:stars',  cat:'fx', nm:'閃亮星星', price:1500 },
  // 2026-11 第二套插畫（使用者的配件總覽圖）新增
  { id:'hat:bucket',    cat:'hat', nm:'漁夫帽',   price:900 },
  { id:'hat:straw',     cat:'hat', nm:'草帽',     price:1000 },
  { id:'hat:detective', cat:'hat', nm:'偵探帽',   price:1500 },
  { id:'hat:aviator',   cat:'hat', nm:'飛行帽',   price:2000 },
  { id:'hat:sailor',    cat:'hat', nm:'水手帽',   price:1200 },
  { id:'hat:santa',     cat:'hat', nm:'聖誕帽',   price:1500 },
  { id:'hair:dotbow',   cat:'hair', nm:'點點蝴蝶結', price:700 },
  { id:'hair:cat',      cat:'hair', nm:'貓耳髮箍', price:1000 },
  { id:'hair:antler',   cat:'hair', nm:'鹿角',     price:1200 },
  { id:'hair:flowers',  cat:'hair', nm:'花圈',     price:1500 },
  { id:'hair:laurel',   cat:'hair', nm:'月桂葉',   price:1200 },
  { id:'hair:halo',     cat:'hair', nm:'天使光環', price:2000 },
  { id:'hair:sprout',   cat:'hair', nm:'小芽芽',   price:800 },
  { id:'hair:bear',     cat:'hair', nm:'熊耳髮箍', price:1000 },
  { id:'hair:hibiscus', cat:'hair', nm:'扶桑花',   price:800 },
  { id:'hair:sakura',   cat:'hair', nm:'櫻花髮夾', price:800 },
  { id:'face:swirl',    cat:'face', nm:'漩渦眼鏡', price:900 },
  { id:'face:pixel',    cat:'face', nm:'像素墨鏡', price:1500 },
  { id:'face:blue',     cat:'face', nm:'藍框眼鏡', price:700 },
  { id:'stk:blush',     cat:'stk', nm:'害羞線',   price:400 },
  { id:'stk:hearts',    cat:'stk', nm:'愛心腮紅', price:500 },
  { id:'stk:stars',     cat:'stk', nm:'星星腮紅', price:500 },
  { id:'stk:whisker',   cat:'stk', nm:'鬍鬚',     price:400 },
  { id:'stk:paw',       cat:'stk', nm:'肉球貼紙', price:500 },
  { id:'stk:bandage',   cat:'stk', nm:'OK 繃',    price:400 },
  { id:'stk:flag',      cat:'stk', nm:'國旗貼紙', price:600 },
  { id:'stk:sparkle',   cat:'stk', nm:'閃亮亮',   price:600 },
  { id:'neck:bell',     cat:'neck', nm:'鈴鐺項圈', price:900 },
  { id:'neck:bandana',  cat:'neck', nm:'三角領巾', price:700 },
  { id:'neck:badge',    cat:'neck', nm:'識別證',   price:800 },
  { id:'neck:phones',   cat:'neck', nm:'耳機',     price:1500 },
  { id:'outfit:bluehanbok', cat:'outfit', nm:'藍色韓服', price:2500 },
  { id:'outfit:sailor',     cat:'outfit', nm:'水手服',   price:1800 },
  { id:'outfit:varsity',    cat:'outfit', nm:'棒球外套', price:2000 },
  { id:'outfit:redcoat',    cat:'outfit', nm:'紅色斗篷', price:2200 },
  { id:'outfit:apron',      cat:'outfit', nm:'黃色吊帶', price:1200 },
  { id:'outfit:explorer',   cat:'outfit', nm:'探險背心', price:1800 },
  { id:'hand:fan',      cat:'hand', nm:'扇子',     price:900 },
  { id:'hand:bag',      cat:'hand', nm:'購物袋',   price:800 },
  { id:'hand:popsicle', cat:'hand', nm:'雪糕',     price:600 },
  { id:'hand:bingsu',   cat:'hand', nm:'刨冰',     price:1200 },
  { id:'bg:hanok',      cat:'bg', nm:'韓屋村',     price:1500 },
  { id:'fx:rainbow',    cat:'fx', nm:'彩虹',       price:2000 },
  { id:'fx:wow',        cat:'fx', nm:'驚喜光芒',   price:800 },
  { id:'frame:flowers', cat:'frame', nm:'花圈邊框', price:2000 },
  { id:'frame:stars',   cat:'frame', nm:'星星邊框', price:2000 },
  { id:'frame:heart',   cat:'frame', nm:'愛心邊框', price:2000 },
];
const SHOP_CATS = [['skin','介面風格'],['hat','帽子'],['hair','髮飾'],['face','眼鏡'],['stk','臉部貼紙'],['neck','頸部'],['outfit','服裝'],['hand','手上'],['bg','背景'],['fx','特效'],['frame','邊框']];
/** 商品的欄位與代號 */
const itemKey = it => it.id.split(':')[1];

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

/* ================= 子音：字形由來（發音動畫在 js/speech-art.js） ================= */
// 字形由來：基本字是模仿發音器官，加一畫＝聲音更強
const CSHAPE = {
  'ㄱ':'ㄱ 的形狀＝舌根往上頂住的樣子。', 'ㄴ':'ㄴ 的形狀＝舌尖往上碰牙齦的樣子。', 'ㅁ':'ㅁ 的形狀＝嘴巴（雙唇）。', 'ㅅ':'ㅅ 的形狀＝牙齒。', 'ㅇ':'ㅇ 的形狀＝喉嚨。',
  'ㅋ':'ㄱ 加一畫＝多吐氣。', 'ㄷ':'ㄴ 加一畫＝舌尖頂住後放開。', 'ㅌ':'ㄷ 再加一畫＝多吐氣。', 'ㅂ':'ㅁ 加兩畫＝雙唇閉住後放開。', 'ㅍ':'ㅂ 再變化＝多吐氣。',
  'ㅈ':'ㅅ 加一畫。', 'ㅊ':'ㅈ 再加一點＝多吐氣。', 'ㅎ':'ㅇ 加上面兩畫＝從喉嚨吐氣。', 'ㄹ':'ㄹ 是舌頭彈動的樣子。',
  'ㄲ':'兩個 ㄱ 並排＝硬音（喉嚨繃緊）。', 'ㄸ':'兩個 ㄷ 並排＝硬音。', 'ㅃ':'兩個 ㅂ 並排＝硬音。', 'ㅆ':'兩個 ㅅ 並排＝硬音。', 'ㅉ':'兩個 ㅈ 並排＝硬音。',
};
