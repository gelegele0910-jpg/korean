// 韓文核心與課程內容：組字往返、羅馬拼音與實際發音、跟讀分數、內容完整性
const fs = require('fs'), path = require('path'), vm = require('vm');
const { seeded } = require('./server.js');
const ROOT = path.resolve(__dirname, '..');
const KH = require('../js/hangul.js');
const ctx = { KH }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + ';this.D={VOWELS,VOWELS2,CONSONANTS,DOUBLES,BATCHIM,RULES,TOPICS,LESSONS,TRIOS};', ctx);
const D = ctx.D;
let fail = 0, n = 0;
const ok = (c, msg) => { n++; if (!c) { fail++; console.log('  ✗', msg); } };

// H1 全部 11172 個字拆開再組回來一樣
for (let c = 0xAC00; c <= 0xD7A3; c++) { const ch = String.fromCharCode(c), s = KH.dec(ch); ok(KH.comp(s.l, s.v, s.t) === ch, 'H1 ' + ch); }

// H2 羅馬拼音與實際發音（標準答案）
const RR = { '감사합니다':'gamsahamnida', '안녕하세요':'annyeonghaseyo', '괜찮아요':'gwaenchanayo', '처음 뵙겠습니다':'cheoeum boepgetseumnida',
  '한국어를':'hangugeoreul', '좋다':'jota', '축하해요':'chukahaeyo', '좋아요':'joayo', '설날':'seollal', '연락':'yeollak', '신라':'silla',
  '학교':'hakgyo', '같이':'gachi', '굳이':'guji', '해돋이':'haedoji', '색깔':'saekkkal', '맛있어요':'masisseoyo', '없어요':'eopseoyo',
  '읽어요':'ilgeoyo', '많다':'manta', '정류장':'jeongnyujang', '이걸로':'igeollo', '깎아':'kkakka', '몇 살이에요':'myeot sarieyo',
  '거짓말':'geojinmal', '한국말':'hangungmal', '독립':'dongnip', '음악':'eumak', '라면':'ramyeon', '걸려요':'geollyeoyo',
  '좋습니다':'josseumnida', '의사':'uisa', '히읗':'hieut', '부엌':'bueok', '꽃':'kkot', '앉다':'anda', '종로':'jongno', '닭':'dak' };
for (const [k, v] of Object.entries(RR)) ok(KH.romanize(k) === v, `H2 ${k} → ${KH.romanize(k)}，應為 ${v}`);
const PR = { '감사합니다':'감사함니다', '학교':'학꾜', '맛있다':'마싣따', '없어요':'업써요', '같이':'가치', '좋습니다':'조씀니다', '국밥':'국빱', '옷':'옫', '설날':'설랄' };
for (const [k, v] of Object.entries(PR)) ok(KH.pronounce(k) === v, `H2 發音 ${k} → ${KH.pronounce(k)}，應為 ${v}`);

// H3 數字
for (const [num, s] of [[0,'영'],[1,'일'],[10,'십'],[11,'십일'],[25,'이십오'],[100,'백'],[3500,'삼천오백'],[10000,'만'],[25000,'이만오천']]) ok(KH.numToSino(num) === s, 'H3 ' + num);

// H4 跟讀分數：原句 100、數字寫法等於念法、分數在 0～100、念錯會扣分
const rnd = seeded(7);
const randKo = () => Array.from({ length: 1 + Math.floor(rnd() * 8) }, () => String.fromCharCode(0xAC00 + Math.floor(rnd() * 11172))).join('');
const all = [...D.TOPICS.flatMap(t => [...t.w, ...t.s].map(x => x[0]))];
for (const s of all) ok(KH.score(s, s) === 100, 'H4 原句 ' + s);
ok(KH.score('3번 출구로 나가세요.', '삼번 출구로 나가세요') === 100, 'H4 數字');
ok(KH.score('감사합니다', '감사함니다') === 100, 'H4 照實際發音寫');
ok(KH.score('안녕하세요', '안녕') < 60, 'H4 只念一半');
ok(KH.score('감사합니다', '') === 0 && KH.score('', '감사') === 0, 'H4 空字串');
for (let i = 0; i < 500; i++) { const a = randKo(), b = randKo(), sc = KH.score(a, b); ok(sc >= 0 && sc <= 100 && Number.isInteger(sc), 'H4 範圍 ' + a + '/' + b); }
for (const weird of ['', '   ', '😀😀', '=SUM(1)', '<b>x</b>', 'a'.repeat(5000)]) { ok(typeof KH.romanize(weird) === 'string' && typeof KH.pronounce(weird) === 'string', 'H4 奇怪輸入'); }

// H5 課程內容：拼音只有英文字母、id 不重複、每個主題至少 4 個字 4 句、測驗選項夠
const ids = new Set();
for (const L of D.LESSONS) { ok(!ids.has(L.id), 'H5 課程 id 重複 ' + L.id); ids.add(L.id); }
for (const t of D.TOPICS) {
  ok(t.w.length >= 4 && t.s.length >= 4, 'H5 主題太少 ' + t.id);
  for (const [ko, zh] of [...t.w, ...t.s]) {
    ok(ko && zh, 'H5 空白 ' + t.id);
    ok(/^[a-z0-9 .,!?']+$/.test(KH.romanize(ko)), 'H5 拼音有怪字 ' + ko + ' → ' + KH.romanize(ko));
  }
  ok(new Set(t.w.map(w => w[1])).size === t.w.length, 'H5 單字中文意思重複 ' + t.id);
}
for (const set of [D.VOWELS, D.VOWELS2, D.CONSONANTS, D.DOUBLES]) for (const x of set) {
  ok(KH.isSyl(x.say) && KH.dec(x.say).l !== undefined, 'H5 say ' + x.j);
  const s = KH.dec(x.say); ok(s.l === x.j || s.v === x.j, 'H5 say 要含字母 ' + x.j);
  ok(KH.jamo(x.ex[0]).includes(x.j), 'H5 例字要含字母 ' + x.j + ' ' + x.ex[0]);
}
ok(D.VOWELS.length + D.VOWELS2.length + D.CONSONANTS.length + D.DOUBLES.length === 40, 'H5 40 音');
for (const b of D.BATCHIM) for (const [w] of b.ex) ok(KH.pronounce(w).endsWith(KH.comp(KH.dec(KH.pronounce(w).slice(-1)).l, KH.dec(KH.pronounce(w).slice(-1)).v, b.j)), 'H5 收音例字 ' + w);
for (const r of D.RULES) for (const [w, , wrong] of r.ex) { ok(KH.pronounce(w) !== wrong, 'H5 錯誤選項等於正確發音 ' + w); ok(KH.pronounce(w) !== w || r.id === 'tense', 'H5 規則例字發音要不同 ' + w); }

console.log(fail ? `hangul: ${fail}/${n} 失敗` : `hangul: ${n} 項全部通過`);
process.exit(fail ? 1 : 0);
