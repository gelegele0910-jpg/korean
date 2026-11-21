/* ================= 子音發音動畫（發音地圖） =================
 * 人物外觀是使用者提供的插畫 img/girl.webp（1254×1254），口腔部分用 SVG 疊上去做動畫。
 * 口腔用自己的座標（約 240×200，臉朝左），經 HY_T 換算到圖片的像素座標。
 * 對外只公開 window.SA：stage() 產生畫面、mountAll() 畫靜止畫面、play() 播放、stop() 停止。 */
(function (root) {
'use strict';
const HY_KX = 3.34, HY_KY = 2.95, HY_X = 90, HY_Y = 456, HY_W = 1254;
const HY_T = `translate(${HY_X} ${HY_Y}) scale(${HY_KX} ${HY_KY})`;
// 視角：full＝全臉、mouth＝放大嘴巴（都是正方形，切換時版面不會跳動）
const VIEW = { full: [24, 24, 1206, 1206], mouth: [103, 500, 688, 688] };
const IMG = 'img/girl.webp';
/* ---------- 資料：每個子音的部位與出氣方式 ---------- */
const C = {
  'ㄱ':['back','plain'], 'ㅋ':['back','asp'], 'ㄲ':['back','tense'], 'ㅇ':['back','nasal'],
  'ㄷ':['tip','plain'], 'ㅌ':['tip','asp'], 'ㄸ':['tip','tense'], 'ㄴ':['tip','nasal'], 'ㄹ':['flap','plain'],
  'ㅂ':['lips','plain'], 'ㅍ':['lips','asp'], 'ㅃ':['lips','tense'], 'ㅁ':['lips','nasal'],
  'ㅅ':['s','plain'], 'ㅆ':['s','tense'], 'ㅈ':['blade','plain'], 'ㅊ':['blade','asp'], 'ㅉ':['blade','tense'], 'ㅎ':['h','asp'],
};
const L = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const RR = { 'ㄱ':'ga','ㄲ':'kka','ㄴ':'na','ㄷ':'da','ㄸ':'tta','ㄹ':'ra','ㅁ':'ma','ㅂ':'ba','ㅃ':'ppa','ㅅ':'sa','ㅆ':'ssa','ㅇ':'ang','ㅈ':'ja','ㅉ':'jja','ㅊ':'cha','ㅋ':'ka','ㅌ':'ta','ㅍ':'pa','ㅎ':'ha' };
const syl = j => j === 'ㅇ' ? '앙' : String.fromCharCode(0xAC00 + L.indexOf(j) * 588);
const KIND = { plain:'平音', asp:'送氣音', tense:'硬音', nasal:'鼻音' };
const PLACE = { lips:'雙唇閉起來', tip:'舌尖頂住上牙齦', flap:'舌尖靠近上牙齦', s:'舌尖靠近上牙齦，留一條小縫', blade:'舌面貼住上顎', back:'舌根往上頂住軟顎', h:'嘴巴張開，舌頭放鬆' };

/* ---------- 姿勢：舌頭 4 個點（舌尖、舌面、舌背、舌根）、下巴 j、嘴唇閉合 l、軟顎放下 v ---------- */
const POSE = {
  neutral: { t:[[68,124],[88,116],[120,110],[150,116]], j:.3, l:0, v:0 },
  a:       { t:[[70,133],[92,127],[124,123],[154,124]], j:1,  l:0, v:0 },
  ng:      { t:[[68,126],[94,116],[132,96],[160,84]],   j:.35, l:0, v:1 },
  tip:     { t:[[69,94.5],[84,101],[118,109],[150,116]], j:.12, l:0, v:0 },
  flap:    { t:[[69,95.5],[84,102],[118,110],[150,116]], j:.15, l:0, v:0 },
  s:       { t:[[70,100],[85,104],[118,110],[150,116]],   j:.1,  l:0, v:0 },
  blade:   { t:[[66,110],[90,88],[116,89],[150,112]],     j:.12, l:0, v:0 },
  back:    { t:[[68,124],[94,114],[132,95],[160,84]],     j:.2,  l:0, v:0 },
  lips:    { t:[[68,124],[88,116],[120,110],[150,116]],   j:0,   l:1, v:0 },
  h:       { t:[[70,128],[92,121],[124,117],[154,121]],   j:.75, l:0, v:0 },
};
const CONTACT = { lips:[47,105], tip:[70,93], flap:[70,94], s:[71,96], blade:[92,85], back:[158,81] };
// 氣流路線：口腔中線、鼻腔
const MOUTH_PATH = [[186,192],[184,150],[178,112],[160,100],[130,100],[100,102],[76,104],[56,107],[34,108],[8,108]];
const NOSE_PATH  = [[186,192],[184,150],[180,104],[178,84],[168,68],[130,64],[90,68],[56,76],[34,82],[10,86]];
const BLOCK_X = { lips:52, tip:74, flap:74, blade:96, back:164 };

/* ---------- 工具 ---------- */
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function mix(p, q, k) {
  return { t: p.t.map((pt, i) => [lerp(pt[0], q.t[i][0], k), lerp(pt[1], q.t[i][1], k)]), j: lerp(p.j, q.j, k), l: lerp(p.l, q.l, k), v: lerp(p.v, q.v, k), r: lerp(p.r || 0, q.r || 0, k) };
}
function smooth(pts) { // Catmull-Rom → 三次貝茲
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
function along(path, f) { // 路線上比例 f 的位置
  const seg = []; let tot = 0;
  for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); tot += d; }
  let r = f * tot;
  for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const k = r / seg[i]; return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)]; } r -= seg[i]; }
  return path[path.length - 1];
}
function fracAtX(path, x) { // 路線第一次到達 x（往左）時的比例
  for (let f = 0; f <= 1; f += .005) if (along(path, f)[0] <= x) return f;
  return 1;
}

/* ---------- 共用幾何：三種畫風都用同一組位置，動畫才會一致 ---------- */
function geom(s) {
  const jd = s.pose.j * 11, ld = s.pose.l, lowLipY = (1 - ld) * jd - ld * 6.5, tp = s.pose.t, vy = s.pose.v;
  const uvX = lerp(182, 164, vy), uvY = lerp(80, 104, vy);
  return {
    jd, ld, lowLipY, tp, vy, uvX, uvY,
    tongue: smooth([[88, 162 + jd * .5], [72, 146 + jd * .6], tp[0], tp[1], tp[2], tp[3], [176, 146], [180, 166]]) + ' L182 200 L100 200 Z',
    tongueTop: smooth([tp[0], tp[1], tp[2], tp[3]]),
    vel: `M140 72 Q166 70 ${uvX + 2} ${uvY - 7} Q${uvX + 4} ${uvY + 2} ${uvX - 2} ${uvY + 3} Q${lerp(160, 156, vy)} ${lerp(84, 96, vy)} 140 81 Z`,
    cavity: `M50 106 Q56 100 62 96 Q66 93 72 92 Q90 86 110 82 Q128 79 140 80 L176 80 Q186 82 187 92 L187 200 L100 200 Q94 ${176 + jd * .5} 88 ${160 + jd * .5} Q78 ${148 + jd} 66 ${138 + jd} Q58 ${130 + jd} 50 ${120 + jd} Z`,
    nasal: 'M28 84 Q42 72 64 68 Q110 60 150 60 Q178 62 186 72 L186 86 Q172 76 150 72 Q110 74 78 84 Q58 90 40 90 Z',
    palate: 'M60 90 Q88 82 110 78 Q130 74 142 74 L142 70 Q110 71 78 81 Q66 85 58 88 Z',
    upTooth: 'M56.5 89 L64 91 L64.5 107 Q63 113 59.5 112 L56 103 Z',
    lowTooth: `M57 ${132 + jd} L64.5 ${128 + jd} L65 ${118 + jd} Q62 ${114 + jd} 59 ${116 + jd} L57 ${123 + jd} Z`,
    upLip: `M33 92 Q45 87 56 91 L58 ${103 + ld * 1.5} Q47 ${109 + ld * 1.5} 36 ${104 + ld} Q29 98 33 92 Z`,
    lowLip: `M36 ${112 + lowLipY} Q48 ${109 + lowLipY} 58 ${113 + lowLipY} L58 ${125 + lowLipY} Q46 ${132 + lowLipY} 36 ${126 + lowLipY} Q29 ${119 + lowLipY} 36 ${112 + lowLipY} Z`,
    gGap: s.tense ? 0 : s.voice ? 1.5 + Math.sin(s.now / 18) * 1.3 : 3.5,
  };
}
function flowDots(s, fn) {
  let out = '';
  for (const fl of s.flows) {
    const n = fl.n || 9;
    for (let i = 0; i < n; i++) {
      let f = ((s.now / 1000) * fl.speed + i / n) % 1;
      f = fl.from + f * (fl.to - fl.from);
      const [x, y] = along(fl.path, f), [x2, y2] = along(fl.path, Math.max(fl.from, f - .025));
      out += fn(x, y, x2, y2, fl);
    }
  }
  return out;
}

/* ---------- 時間軸 ---------- */
// 回傳某時間點的狀態；ms 是正常速度下的毫秒
function stateAt(j, ms) {
  const [place, man] = C[j];
  const pose0 = POSE.neutral, P = POSE[place === 'back' && man === 'nasal' ? 'ng' : place], A = POSE.a;
  const isNasal = man === 'nasal', isNg = j === 'ㅇ';
  const T = place === 'flap' ? { a:350, b:460, c:620, d:1250, e:1700 } : { a:380, b:900, c:1120, d:1750, e:2250 };
  const st = { pose: pose0, flows: [], puff: 0, contact: null, tense: false, voice: false, step: 0, cap: '' };
  const closure = place !== 'h' && place !== 's';
  const blockF = BLOCK_X[place] ? fracAtX(MOUTH_PATH, BLOCK_X[place] + 6) : 1;
  if (ms < T.a) { // ① 準備
    st.pose = mix(pose0, P, ease(ms / T.a)); st.step = 0; st.cap = PLACE[place];
    if (man === 'tense') st.tense = ms > T.a * .6;
  } else if (ms < T.b) { // ② 頂住
    st.pose = P; st.step = 1; st.contact = CONTACT[place] || null;
    if (place === 'h') { st.flows.push({ path: MOUTH_PATH, from: 0, to: 1, speed: 1.6, n: 12, op: .7 }); st.cap = '氣從喉嚨直接吐出來（ㅎ～）'; }
    else if (place === 's') { st.contact = null; st.tense = man === 'tense'; st.flows.push({ path: MOUTH_PATH, from: .1, to: 1, speed: man === 'tense' ? 2.4 : 1.6, n: 12, r: 2 });
      st.cap = man === 'tense' ? '喉嚨繃緊，氣從小縫用力擠出來（ㅆ～）' : '氣從小縫裡擠出來（ㅅ～）'; }
    else if (isNasal) { st.voice = true; st.flows.push({ path: NOSE_PATH, from: 0, to: 1, speed: 1.2, n: 11 }); st.cap = '軟顎放下，聲音從鼻子出來（' + (isNg ? 'ng' : j === 'ㅁ' ? 'm' : 'n') + '～）'; }
    else if (man === 'tense') { st.tense = true; st.cap = '喉嚨繃緊、憋住氣，不讓氣出來'; }
    else if (man === 'asp') { st.flows.push({ path: MOUTH_PATH, from: 0, to: blockF, speed: 2.2, n: 12 }); st.cap = '氣在後面越積越多…'; }
    else if (place === 'flap') { st.voice = true; st.cap = '舌尖輕輕碰一下上牙齦'; }
    else { st.flows.push({ path: MOUTH_PATH, from: 0, to: blockF, speed: .9, n: 6, op: .6 }); st.cap = '氣被擋住，輕輕的'; }
  } else if (ms < T.c) { // ③ 放開
    const k = ease((ms - T.b) / (T.c - T.b));
    st.pose = isNg ? P : mix(P, A, k); st.step = 2;
    if (isNg) { st.voice = true; st.flows.push({ path: NOSE_PATH, from: 0, to: 1, speed: 1.2, n: 11 }); st.cap = 'ㅇ 在收音：舌根一直頂著，聲音從鼻子出來'; }
    else if (man === 'asp') { st.puff = k; st.puffBig = true; st.cap = '用力放開，吐一大口氣「呼！」'; }
    else if (man === 'tense') { st.tense = k < .5; st.cap = '短促有力地放開，不吐氣'; }
    else if (isNasal) { st.voice = true; st.cap = '放開，軟顎抬起來'; }
    else if (closure) { st.puff = k; st.puffBig = false; st.cap = place === 'flap' ? '彈一下就放開' : '輕輕放開，只有一點點氣'; }
    else st.cap = '接著念母音';
  } else if (ms < T.d) { // ④ 念母音
    st.pose = isNg ? P : A; st.step = 3; st.voice = true;
    st.flows.push(isNg ? { path: NOSE_PATH, from: 0, to: 1, speed: 1.2, n: 11 } : { path: MOUTH_PATH, from: 0, to: 1, speed: 1.1, n: 10, op: .5 });
    st.cap = isNg ? '앙：念完 ㅏ 再用舌根頂住（ng）' : `接著念 ㅏ → ${syl(j)}`;
  } else { // 回到原位
    st.pose = mix(isNg ? P : A, pose0, ease(Math.min(1, (ms - T.d) / (T.e - T.d)))); st.step = 3; st.cap = '';
  }
  if (isNg && ms < T.b && ms >= T.a) { st.cap = '舌根頂住軟顎，軟顎放下，聲音從鼻子出來（ng）'; }
  st.end = T.e; st.release = T.b;
  return st;
}
// ㅇ：先念 ㅏ 再收 ng（順序和其他相反），用簡單的方式：直接沿用上面時間軸


/* ---------- 插畫風（發音地圖）：柔和粉色、人物側面 ---------- */
const FAM = [
  { id:'lips',  c:'#F7B8C0', d:'#E0607A', nm:'雙唇音', team:'嘴唇家族', js:'ㅁㅂㅍㅃ', pos:'嘴唇', zy:'ㄇ ㄅ ㄆ', tips:['「雙唇緊閉再打開」（ㅂㅍㅃ）', '「雙唇緊閉，鼻子出聲」（ㅁ）'], pin:[42,106] },
  { id:'tip',   c:'#FCE38A', d:'#C99A00', nm:'舌尖音', team:'舌尖彈跳隊', js:'ㄴㄷㅌㄸㄹ', pos:'舌尖碰上牙齦', zy:'ㄋ ㄉ ㄊ ㄌ', tips:['「舌尖頂住上牙齦」', 'ㄹ：「舌尖輕輕彈一下」'], pin:[64,90] },
  { id:'s',     c:'#B9EBD3', d:'#2E9E6A', nm:'牙縫音', team:'牙縫吹風隊', js:'ㅅㅆ', pos:'舌尖靠近上牙齦，留一條縫', zy:'ㄙ（遇到 ㅣ 像 ㄒ）', tips:['「留一條小縫，讓氣擠出來」'], pin:[80,99] },
  { id:'blade', c:'#BFE0FF', d:'#2F7FD0', nm:'舌面音', team:'貼上顎隊', js:'ㅈㅊㅉ', pos:'舌面貼住上顎（硬顎）', zy:'ㄐ ㄑ／ㄗ ㄘ', tips:['「舌面平平往上貼」'], pin:[92,85] },
  { id:'back',  c:'#D9C8F5', d:'#7A55C7', nm:'舌根音', team:'喉嚨守門員', js:'ㄱㅋㄲㅇ', pos:'舌根抬高，頂住軟顎', zy:'ㄍ ㄎ（ㅇ 收音像 ㄥ）', tips:['「舌根抬高，把氣擋住」'], pin:[158,81] },
  { id:'h',     c:'#FFD3B0', d:'#E07A2E', nm:'喉音', team:'哈氣隊', js:'ㅎ', pos:'喉嚨', zy:'ㄏ（但更輕）', tips:['「嘴巴打開，輕輕哈一口氣」'], pin:[184,150] },
];
const MANNERS = [
  { nm:'平音', team:'輕輕隊', js:'ㄱㄷㅂㅈㅅ', tip:'「輕輕說，像嘆一口氣」', sub:'手放嘴前幾乎沒有風，音調比較低', ic:'feather' },
  { nm:'送氣音', team:'吹風隊', js:'ㅋㅌㅍㅊ', tip:'「用力吐氣，面紙會飛起來」', sub:'像注音 ㄎ ㄊ ㄆ ㄑ，音調比較高', ic:'tissue' },
  { nm:'硬音', team:'憋氣隊', js:'ㄲㄸㅃㅉㅆ', tip:'「喉嚨繃緊，短促有力」', sub:'完全不吐氣，音調比較高', ic:'tight' },
];
// 卡片的圓形特寫圖
function closeup(k) {
  const O = '#C9625E';
  const T = {
    lips: `<rect width="80" height="80" fill="#FFF1F2"/><path d="M12 42 Q24 26 34 32 Q40 28 46 32 Q56 26 68 42 Q56 46 40 46 Q24 46 12 42 Z" fill="#E8566C"/><path d="M12 42 Q24 60 40 60 Q56 60 68 42 Q56 46 40 46 Q24 46 12 42 Z" fill="#D9405A"/><path d="M14 42 Q40 48 66 42" stroke="#9E2840" stroke-width="2" fill="none"/><path d="M28 52 Q40 56 50 52" stroke="#fff" stroke-width="2" opacity=".5" fill="none" stroke-linecap="round"/>`,
    tip: `<rect width="80" height="80" fill="#FFF8DC"/><path d="M0 0 H80 V26 Q60 30 44 24 Q34 22 26 30 Q20 34 0 30 Z" fill="#F6B9AE" stroke="${O}" stroke-width="1.5"/><path d="M30 26 l3 10 l4 -9 Z" fill="#fff" stroke="#D9B9AA"/>
      <path d="M8 80 Q6 56 22 44 Q32 34 40 33 Q46 34 46 42 Q44 56 60 62 Q76 66 80 80 Z" fill="#F08F8A" stroke="${O}" stroke-width="1.8"/><circle cx="42" cy="33" r="5" fill="#FFD43B" stroke="#C99A00"/>
      <path d="M52 22 q4 -4 0 -8 q-4 -4 0 -8 M58 26 q4 -4 0 -8" stroke="#C99A00" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    s: `<rect width="80" height="80" fill="#EAFBF2"/><path d="M8 16 H72 V34 Q40 40 8 34 Z" fill="#F6B9AE"/>${[12, 26, 40, 54].map(x => `<rect x="${x + 1}" y="22" width="12" height="16" rx="3" fill="#fff" stroke="#D9B9AA"/>`).join('')}
      ${[12, 26, 40, 54].map(x => `<rect x="${x + 1}" y="44" width="12" height="14" rx="3" fill="#fff" stroke="#D9B9AA"/>`).join('')}<path d="M8 58 Q40 66 72 58 V70 H8 Z" fill="#F6B9AE"/>
      <g stroke="#2E9E6A" stroke-width="2.2" stroke-linecap="round" fill="none"><path d="M40 41 h-34"/><path d="M40 41 q-14 -5 -30 -2"/><path d="M40 41 q-14 5 -30 2"/></g>`,
    blade: `<rect width="80" height="80" fill="#EEF6FF"/><path d="M0 0 H80 V30 Q60 18 40 18 Q20 18 0 30 Z" fill="#F6B9AE" stroke="${O}" stroke-width="1.5"/>
      <path d="M0 80 V44 Q20 22 40 22 Q60 22 80 44 V80 Z" fill="#F08F8A" stroke="${O}" stroke-width="1.8"/><path d="M18 34 Q40 18 62 34" stroke="#FFD43B" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>`,
    back: `<rect width="80" height="80" fill="#F4EEFF"/><path d="M0 0 H80 V60 Q74 30 52 22 Q30 16 0 22 Z" fill="#F6B9AE" stroke="${O}" stroke-width="1.5"/>
      <path d="M0 80 V50 Q26 44 44 30 Q58 22 66 34 Q72 50 72 80 Z" fill="#F08F8A" stroke="${O}" stroke-width="1.8"/><circle cx="56" cy="24" r="5" fill="#FFD43B" stroke="#C99A00"/>`,
    h: `<rect width="80" height="80" fill="#FFF4EA"/><ellipse cx="40" cy="44" rx="20" ry="16" fill="#9E3A4A"/><path d="M20 42 Q40 26 60 42 Q40 34 20 42 Z" fill="#E8566C"/><path d="M20 46 Q40 64 60 46 Q40 56 20 46 Z" fill="#D9405A"/>
      <path d="M30 22 q-6 -6 0 -12 q6 -6 0 -12 M44 22 q-6 -6 0 -12" stroke="#E07A2E" stroke-width="2.4" fill="none" stroke-linecap="round" transform="translate(0 4)"/>`,
    feather: `<rect width="80" height="80" fill="#F3FBEF"/><path d="M58 14 Q30 20 22 56 L18 66" stroke="#7A9A5A" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M58 14 Q66 40 30 52 Q26 30 58 14 Z" fill="#C9E7B5" stroke="#7A9A5A" stroke-width="1.6"/>
      ${[0, 1, 2, 3].map(i => `<path d="M${50 - i * 6} ${22 + i * 7} l8 4" stroke="#7A9A5A" stroke-width="1.2"/>`).join('')}`,
    tissue: `<rect width="80" height="80" fill="#EEF6FF"/><path d="M40 16 Q56 22 62 18 L66 56 Q58 62 44 54 Q36 50 34 56 Z" fill="#fff" stroke="#8FB3DD" stroke-width="1.6" transform="rotate(-18 50 36)"/>
      <g stroke="#2F7FD0" stroke-width="2.4" stroke-linecap="round" fill="none"><path d="M4 30 h20"/><path d="M4 40 q10 -4 22 0"/><path d="M4 50 h20"/></g><text x="6" y="72" font-size="11" font-weight="900" fill="#2F7FD0">呼！</text>`,
    tight: `<rect width="80" height="80" fill="#FFF0F0"/><path d="M28 6 Q24 40 30 78 M52 6 Q56 40 50 78" stroke="#E3A88E" stroke-width="3" fill="none"/>
      <rect x="26" y="34" width="28" height="5" rx="2.5" fill="#E5484D"/><rect x="26" y="40" width="28" height="5" rx="2.5" fill="#E5484D"/>
      <path d="M62 26 l6 6 -6 6 6 6 -6 6" stroke="#E5484D" stroke-width="2.6" fill="none" stroke-linejoin="round"/><path d="M18 26 l-6 6 6 6 -6 6 6 6" stroke="#E5484D" stroke-width="2.6" fill="none" stroke-linejoin="round"/>`,
  };
  return `<svg viewBox="0 0 80 80" class="cu" aria-hidden="true"><defs><clipPath id="cu-${k}"><circle cx="40" cy="40" r="38"/></clipPath></defs><g clip-path="url(#cu-${k})">${T[k]}</g><circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" stroke-width="3"/></svg>`;
}
// 插畫風的頭：後腦勺是圓的、有脖子（前半部和其他畫風一樣，動畫位置才對得上）

const NOSE2 = [[184, 192], [184, 150], [182, 104], [172, 84], [150, 77], [110, 76], [70, 78], [40, 82], [12, 85]];
function cuteHead(jd) {
  return `M60 -96 C40 -70 32 -30 36 0 C38 16 42 28 44 40 C44 50 41 56 37 60 C31 64 27 68 28 73 C29 79 33 81 37 82 C38 85 34 88 31 92 L30 100 L31 ${112 + jd}
    C30 ${124 + jd} 34 ${132 + jd} 40 ${136 + jd} C36 ${146 + jd} 44 ${156 + jd} 58 ${156 + jd} C76 ${158 + jd * .6} 92 ${157 + jd * .3} 100 ${163 + jd * .2}
    C104 180 106 205 108 240 L208 240 C206 204 206 176 212 154 C252 140 298 100 304 50 C310 -40 250 -128 150 -132 C100 -134 72 -116 60 -96 Z`;
}

function drawHybrid(s, u) {
  const g = geom(s), { tp, vy } = g;
  const jd = Math.min(g.jd, 7);   // 圖片的下巴不會動，下巴開合幅度縮小
  const SK = '#FEE5DC', BG = '#FDF4F3', OL = '#F2A99A', WALL = '#F5A8AC', IN = '#FDDCDA', TG = '#F2929A', TGO = '#E07C86';
  const zs = s.zoom == null ? 1 : s.zoom, ui = lerp(1.9, 1, zs);
  const fc = s.tense ? '#E5484D' : '#EFA7AE';
  const head = cuteHead(jd);
  const tongue = smooth([[90, 160 + jd * .5], [72, 146 + jd * .6], tp[0], tp[1], tp[2], tp[3], [174, 140], [176, 158]]) + ` Q170 172 150 ${172 + jd * .2} Q118 ${172 + jd * .4} 90 ${160 + jd * .5} Z`;
  const cav = `M52 104 C56 98 60 94 66 92 C74 88 84 84 100 80 C120 76 146 76 166 80 C182 84 188 96 188 112 L188 186 C188 200 186 220 186 240 L176 240 L176 196
    C172 186 168 178 160 ${174 + jd * .2} C130 ${172 + jd * .4} 100 ${168 + jd * .5} 88 ${161 + jd * .5} C78 ${150 + jd} 70 ${142 + jd} 62 ${136 + jd} C58 ${130 + jd} 54 ${124 + jd} 52 ${118 + jd} Z`;
  const nasalOn = s.flows.some(f => f.path === NOSE_PATH);
  const flows = s.flows.map(f => f.path === NOSE_PATH ? Object.assign({}, f, { path: NOSE2 }) : f);
  const dots = flowDots(Object.assign({}, s, { flows }), (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#BFE0FF" stroke="#5AA8F0" stroke-width="1"/>`);
  const lbl = s.labels && zs > .6 ? `<g font-size="7.5" font-weight="800" fill="#7A4A40" opacity="${((zs - .6) / .4).toFixed(2)}">
      <text x="96" y="94">硬顎</text><text x="140" y="${lerp(97, 113, vy)}">軟顎</text><text x="106" y="${136 + jd * .4}" fill="#9A3A46">舌頭</text>
      <text x="150" y="196">聲帶</text><text x="4" y="122">嘴唇</text><text x="62" y="152">牙齒</text>${nasalOn ? '<text x="88" y="66">鼻子通道</text>' : ''}</g>` : '';
  let puff = '';
  if (s.puff > 0) {
    const k = s.puff, big = s.puffBig, sc = (big ? 1 : .45) * (.6 + k * .9), cx = 22 - k * (big ? 14 : 6), op = (1 - k * .85).toFixed(2);
    puff = `<g transform="translate(${cx} 108) scale(${sc.toFixed(2)})" opacity="${op}"><path d="M-14 6 a8 8 0 0 1 2 -14 a9 9 0 0 1 16 -4 a8 8 0 0 1 13 6 a7 7 0 0 1 -2 13 Z" fill="#DDF0FF" stroke="#7CC0F5" stroke-width="1.8"/></g>`
      + (big ? `<text x="${4 - k * 6}" y="88" font-size="11" font-weight="900" fill="#4D97E6" opacity="${op}">呼！</text>` : '');
  }
  const pins = s.idle && s.mode !== 'v' ? FAM.map((f, i) => `<g><circle cx="${f.pin[0]}" cy="${f.pin[1]}" r="${(6.5 * ui).toFixed(1)}" fill="${f.d}" stroke="#fff" stroke-width="${(1.4 * ui).toFixed(1)}"/><text x="${f.pin[0]}" y="${(f.pin[1] + 3 * ui).toFixed(1)}" font-size="${(8 * ui).toFixed(1)}" font-weight="900" text-anchor="middle" fill="#fff">${i + 1}</text></g>`).join('')
    : s.contact ? `<circle cx="${s.contact[0]}" cy="${s.contact[1]}" r="${6.5 + Math.sin(s.now / 90)}" fill="#FFE04D" stroke="#F2B400" stroke-width="1.2" opacity=".95"/>` : '';
  // 要蓋掉的範圍（原圖的剖面、編號、下半臉）
  const patch = 'M18 86 C30 74 52 66 80 60 L194 56 L195 122 L201 128 L201 178 L196 186 L196 206 L14 206 Z';
  return `<defs>
    <filter id="hyBlur${u}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    <mask id="hyMask${u}" maskUnits="userSpaceOnUse" x="-40" y="0" width="300" height="260"><path d="${patch}" fill="#fff" filter="url(#hyBlur${u})"/></mask>
    <linearGradient id="hySkin${u}" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="206"><stop offset="0" stop-color="#FEE1D7"/><stop offset=".55" stop-color="#FEDCD4"/><stop offset="1" stop-color="#FDD4D0"/></linearGradient>
    <clipPath id="hyHead${u}"><path d="${head}"/></clipPath>
    <clipPath id="hyLow${u}"><rect x="-40" y="84" width="300" height="200"/></clipPath>
  </defs>
  <g transform="${HY_T}">
    <path d="M6 86 L40 86 L44 148 L10 150 Z" fill="${BG}" filter="url(#hyBlur${u})"/>
    <g mask="url(#hyMask${u})"><path d="${head}" fill="url(#hySkin${u})"/></g>
    <path d="${head}" fill="none" stroke="${OL}" stroke-width="1.6" clip-path="url(#hyLow${u})"/>
    <g clip-path="url(#hyHead${u})">
      <path d="M30 80 Q62 71 100 70 Q140 68 168 73 L168 80 Q140 77 100 78 Q62 79 34 86 Z" fill="#F9CBC8" opacity="${nasalOn ? 1 : 0}"/>
      <path d="${cav}" fill="${IN}" stroke="${WALL}" stroke-width="5.5" stroke-linejoin="round"/>
      ${[204, 214, 224].map(y => `<path d="M178 ${y} h8" stroke="#F2B6B8" stroke-width="1.6" stroke-linecap="round"/>`).join('')}
      <path d="${g.vel}" fill="#F8B6BC" stroke="${WALL}" stroke-width="1.2"/>
      <path d="${tongue}" fill="${TG}" stroke="${TGO}" stroke-width="1.2"/>
      <path d="${g.tongueTop}" transform="translate(0 4)" fill="none" stroke="#FCC6CA" stroke-width="2.8" stroke-linecap="round"/>
      <path d="${g.upTooth}" fill="#fff" stroke="#EBD3C8" stroke-width="1"/>
      <path d="M57 ${132 + jd} L64.5 ${128 + jd} L65 ${118 + jd} Q62 ${114 + jd} 59 ${116 + jd} L57 ${123 + jd} Z" fill="#fff" stroke="#EBD3C8" stroke-width="1"/>
      <rect x="177" y="${182 - g.gGap / 2 - 3}" width="10" height="3" rx="1.5" fill="${fc}"/><rect x="177" y="${182 + g.gGap / 2}" width="10" height="3" rx="1.5" fill="${fc}"/>
    </g>
    ${s.tense ? `<path d="M192 172 l4 3.5 -4 3.5 4 3.5 -4 3.5" stroke="#E5484D" stroke-width="2.2" fill="none"/>` : ''}
    <g transform="translate(${((s.pose.r || 0) > 0 ? -5 * s.pose.r : -2.5 * (s.pose.r || 0)).toFixed(2)} 0)">
    <path d="${g.upLip}" fill="#F7A0AA" stroke="#EC8A98" stroke-width="1"/>
    <path d="M36 ${112 + (1 - g.ld) * jd - g.ld * 6.5} Q48 ${109 + (1 - g.ld) * jd - g.ld * 6.5} 58 ${113 + (1 - g.ld) * jd - g.ld * 6.5} L58 ${125 + (1 - g.ld) * jd - g.ld * 6.5} Q46 ${132 + (1 - g.ld) * jd - g.ld * 6.5} 36 ${126 + (1 - g.ld) * jd - g.ld * 6.5} Q29 ${119 + (1 - g.ld) * jd - g.ld * 6.5} 36 ${112 + (1 - g.ld) * jd - g.ld * 6.5} Z" fill="#F38F9E" stroke="#EC8A98" stroke-width="1"/></g>
    ${dots}${puff}${pins}${lbl}
  </g>`;
}

/* ---------- 母音：舌頭高低前後＋下巴＋嘴唇（r：1＝嘟圓往前、-1＝往兩邊拉平） ---------- */
const VL = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const vsyl = v => String.fromCharCode(0xAC00 + 11 * 588 + VL.indexOf(v) * 28);
const VPOSE = {
  'ㅏ': { t:[[70,133],[92,127],[124,123],[154,124]], j:1,   l:0, v:0, r:0 },
  'ㅓ': { t:[[68,129],[92,124],[126,114],[154,106]], j:.62, l:0, v:0, r:0 },
  'ㅗ': { t:[[68,127],[92,120],[128,105],[156,97]],  j:.35, l:0, v:0, r:1 },
  'ㅜ': { t:[[68,126],[92,117],[131,97],[158,89]],   j:.15, l:0, v:0, r:1.25 },
  'ㅡ': { t:[[68,126],[92,117],[129,98],[157,90]],   j:.12, l:0, v:0, r:-1 },
  'ㅣ': { t:[[70,111],[87,96],[117,92],[150,108]],   j:.1,  l:0, v:0, r:-1 },
  'ㅔ': { t:[[70,119],[89,105],[119,102],[152,113]], j:.42, l:0, v:0, r:-.4 },
  'ㅐ': { t:[[70,123],[90,110],[120,107],[153,116]], j:.55, l:0, v:0, r:-.3 },
};
// 雙母音：起點 → 終點
const VSEQ = { 'ㅑ':['ㅣ','ㅏ'], 'ㅕ':['ㅣ','ㅓ'], 'ㅛ':['ㅣ','ㅗ'], 'ㅠ':['ㅣ','ㅜ'], 'ㅒ':['ㅣ','ㅐ'], 'ㅖ':['ㅣ','ㅔ'],
  'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅐ'], 'ㅚ':['ㅜ','ㅔ'], 'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅔ'], 'ㅟ':['ㅜ','ㅣ'], 'ㅢ':['ㅡ','ㅣ'] };
const VDESC = {
  'ㅏ':'嘴巴張大，舌頭放低放平', 'ㅓ':'下巴放鬆、嘴唇不圓，舌頭往後縮', 'ㅗ':'嘴唇嘟成圓形，舌頭往後抬高一點',
  'ㅜ':'嘴唇嘟得更小、更前面，舌根抬高', 'ㅡ':'嘴唇往兩邊拉平，舌根抬高（和 ㅜ 一樣，只是不嘟嘴）',
  'ㅣ':'嘴角往兩邊拉開，舌頭往前抬高', 'ㅔ':'嘴巴半開、嘴角稍微拉開，舌頭往前', 'ㅐ':'嘴巴比 ㅔ 再張大一點，舌頭往前',
};
const isVowel = v => !!(VPOSE[v] || VSEQ[v]);
/** 母音的時間軸：① 準備 → ② 擺好嘴型並念 →（雙母音）③ 滑到終點 → ④ 拉長聲音 → 回到原位 */
function vStateAt(v, ms) {
  const seq = VSEQ[v], a = VPOSE[seq ? seq[0] : v], b = seq ? VPOSE[seq[1]] : a, N = POSE.neutral;
  const T = seq ? { a:350, b:600, c:900, d:1500, e:1950 } : { a:350, b:500, c:500, d:1450, e:1900 };
  const st = { pose: N, flows: [], puff: 0, contact: null, tense: false, voice: false, step: 0, cap: '', end: T.e, release: T.a };
  const flow = { path: MOUTH_PATH, from: 0, to: 1, speed: 1.1, n: 10, op: .55 };
  if (ms < T.a) { st.pose = mix(N, a, ease(ms / T.a)); st.step = 0; st.cap = seq ? `先擺出 ${seq[0]} 的嘴型` : VDESC[v]; }
  else if (ms < T.b) { st.pose = a; st.step = 1; st.voice = true; st.flows.push(flow); st.cap = seq ? `從 ${seq[0]} 開始…` : VDESC[v]; }
  else if (ms < T.c) { st.pose = mix(a, b, ease((ms - T.b) / (T.c - T.b))); st.step = 2; st.voice = true; st.flows.push(flow); st.cap = `快速滑到 ${seq[1]}`; }
  else if (ms < T.d) { st.pose = b; st.step = 3; st.voice = true; st.flows.push(flow); st.cap = seq ? `${seq[0]} → ${seq[1]}＝${v}（${vsyl(v)}）` : `${VDESC[v]} → ${vsyl(v)}`; }
  else { st.pose = mix(b, N, ease(Math.min(1, (ms - T.d) / (T.e - T.d)))); st.step = 3; }
  return st;
}
// 母音家族卡（pin：在側面圖上標舌頭的位置）
const VFAM = [
  { id:'open',   c:'#FFD3B0', d:'#E07A2E', nm:'張大嘴隊', vs:'ㅏㅑ', pos:'嘴巴張大，舌頭放低', zy:'ㄚ', tips:['「嘴巴張大說 ㄚ」'], m:'ㅏ' },
  { id:'relax',  c:'#FCE38A', d:'#C99A00', nm:'放鬆嘴隊', vs:'ㅓㅕ', pos:'下巴放鬆，嘴唇不圓，舌頭往後', zy:'介於 ㄛ 和 ㄜ', tips:['「先說 ㅏ，嘴巴稍微合起來」'], m:'ㅓ' },
  { id:'round',  c:'#BFE0FF', d:'#2F7FD0', nm:'圓嘴隊', vs:'ㅗㅛㅜㅠ', pos:'嘴唇嘟圓往前，舌頭往後抬高', zy:'ㄛ（ㅗ）、ㄨ（ㅜ）', tips:['「ㅗ 圓圓的、ㅜ 嘟更小」'], m:'ㅗ' },
  { id:'flat',   c:'#B9EBD3', d:'#2E9E6A', nm:'扁嘴隊', vs:'ㅡㅣ', pos:'嘴角往兩邊拉平', zy:'ㄜ 不圓（ㅡ）、ㄧ（ㅣ）', tips:['「ㅡ＝ㅜ 不嘟嘴」', '「ㅣ 像微笑」'], m:'ㅡ' },
  { id:'half',   c:'#F7B8C0', d:'#E0607A', nm:'半開嘴隊', vs:'ㅐㅔㅒㅖ', pos:'嘴巴半開，舌頭往前', zy:'ㄝ', tips:['「ㅐ 和 ㅔ 現在念起來幾乎一樣」'], m:'ㅔ' },
  { id:'glide',  c:'#D9C8F5', d:'#7A55C7', nm:'滑動隊', vs:'ㅘㅙㅚㅝㅞㅟㅢ', pos:'從一個嘴型快速滑到另一個', zy:'ㄨㄚ（ㅘ）、ㄨㄛ（ㅝ）…', tips:['「ㅗ／ㅜ／ㅡ 開始，滑到後面的母音」'], m:'ㅘ' },
];

/* ---------- 播放器 ---------- */
let uidN = 0, active = null;
const reduce = () => !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
/** 產生一個畫面（之後呼叫 mountAll 畫出靜止畫面） */
function stage(label, mode) {
  const u = 'sa' + (++uidN);
  return `<svg class="sa-stage" data-sa="${u}" ${mode ? `data-mode="${mode}"` : ''} viewBox="${VIEW.full.join(' ')}" role="img" aria-label="${label || '發音側面動畫'}">
    <image href="${IMG}" x="0" y="0" width="${HY_W}" height="${HY_W}" preserveAspectRatio="none"/><g class="sa-dyn"></g></svg>`;
}
function setView(el, z) {
  const a = VIEW.full, b = VIEW.mouth, e = ease(Math.max(0, Math.min(1, z)));
  el._sa.zoom = z;
  el.setAttribute('viewBox', a.map((v, i) => lerp(v, b[i], e).toFixed(2)).join(' '));
}
function frame(el, st, now) {
  st.now = now; st.labels = el._sa.labels !== false; st.zoom = el._sa.zoom; st.mode = el.dataset.mode;
  el.querySelector('.sa-dyn').innerHTML = drawHybrid(st, el.dataset.sa);
}
function idleFrame(el) { const st = stateAt('ㄷ', 0); st.idle = true; frame(el, st, 0); }
function mountAll(scope) {
  (scope || root.document).querySelectorAll('svg[data-sa]').forEach(el => {
    if (el._sa) return;
    el._sa = { zoom: 0, labels: true };
    setView(el, 0); idleFrame(el);
  });
}
function stop() {
  if (!active) return;
  cancelAnimationFrame(active.raf); clearTimeout(active.tm);
  const el = active.el; active = null;
  if (el && el.isConnected && el._sa) { setView(el, 0); idleFrame(el); }
}
/** 播放一個子音：opts = { slow, labels, zoom(預設開), cap(說明文字的元素), onRelease(念的字) } */
function play(el, j, opts) {
  if (!el || !(C[j] || isVowel(j))) return;
  const at = C[j] ? stateAt : vStateAt, say = C[j] ? syl(j) : vsyl(j);
  opts = opts || {};
  stop(); mountAll(el.parentNode || root.document);
  el._sa.labels = opts.labels !== false;
  const me = active = { el, raf: 0, tm: 0 };
  const k = opts.slow ? 2.6 : 1, t0 = performance.now(), zoom = opts.zoom !== false;
  let spoke = false;
  const tick = now => {
    if (active !== me) return;
    if (!el.isConnected) { active = null; return; }
    const ms = reduce() ? at(j, 0).release + 200 : (now - t0) / k;   // 減少動態：直接停在「放開」那一格
    const st = at(j, ms);
    if (!spoke && ms >= st.release - 60) { spoke = true; if (opts.onRelease) opts.onRelease(say); }
    if (zoom) setView(el, Math.min(1, ms / 380));
    frame(el, st, now);
    if (opts.cap && st.cap) opts.cap.textContent = st.cap;
    if (reduce()) { me.tm = setTimeout(() => { if (active === me) { active = null; setView(el, 0); idleFrame(el); } }, 2500); return; }
    if (ms < st.end) { me.raf = requestAnimationFrame(tick); return; }
    // 播完：停一下再拉回全臉
    const z0 = el._sa.zoom, t1 = performance.now() + 700;
    const back = now2 => {
      if (active !== me || !el.isConnected) return;
      const q = Math.max(0, Math.min(1, (now2 - t1) / 600));
      setView(el, z0 * (1 - q));
      const s2 = at(j, 0); s2.idle = q >= 1; frame(el, s2, now2);
      if (q < 1) me.raf = requestAnimationFrame(back); else active = null;
    };
    me.raf = requestAnimationFrame(back);
  };
  me.raf = requestAnimationFrame(tick);
}
root.SA = { C, FAM, MANNERS, KIND, PLACE, closeup, syl, stage, mountAll, play, stop, stateAt, drawHybrid, VIEW,
  VPOSE, VSEQ, VDESC, VFAM, vsyl, vStateAt, isVowel,
  isPlaying: () => !!active };
})(typeof window !== 'undefined' ? window : globalThis);
