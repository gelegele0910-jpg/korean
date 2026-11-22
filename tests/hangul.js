// 韓文核心與課程內容：組字往返、羅馬拼音與實際發音、跟讀分數、內容完整性
const fs = require('fs'), path = require('path'), vm = require('vm');
const { seeded } = require('./server.js');
const ROOT = path.resolve(__dirname, '..');
const KH = require('../js/hangul.js');
const ctx = { KH }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + ';this.D={VOWELS,VOWELS2,CONSONANTS,DOUBLES,BATCHIM,RULES,TOPICS,LESSONS,TRIOS,VPAIRS,VCHAINS,CTRIOS};', ctx);
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

// H6 母音對比：每組單字只差這兩個母音（其他字母、長度都一樣），而且兩個母音都有嘴型
const actx = { KH }; vm.createContext(actx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/art.js'), 'utf8') + ';this.A={MOUTH,MOUTH_SEQ,mouthSvg,mouthHtml,VMAP,CSHAPE};', actx);
for (const [a, b, tip, ws] of D.VPAIRS) {
  ok(tip && ws.length >= 2, 'H6 每組至少 2 對單字 ' + a + b);
  for (const [x, y] of ws) {
    const p = KH.jamo(x[0]), q = KH.jamo(y[0]);
    const diff = p.map((j, i) => [j, q[i]]).filter(([j, k]) => j !== k);
    ok(p.length === q.length && diff.length === 1 && diff[0][0] === a && diff[0][1] === b, `H6 ${x[0]}/${y[0]} 要只差 ${a}/${b}`);
    ok(x[1] && y[1], 'H6 中文 ' + x[0]);
  }
}
for (const v of [...D.VOWELS, ...D.VOWELS2].map(x => x.j)) ok(actx.A.mouthHtml(v, 90).includes('<svg'), 'H6 嘴型 ' + v);
for (const c of D.VCHAINS) for (const v of c.v) ok(actx.A.MOUTH[v], 'H6 連續動作嘴型 ' + v);
for (const [v] of actx.A.VMAP) ok(actx.A.MOUTH[v], 'H6 位置圖 ' + v);

// H7 子音對比：同一組單字只差那組子音、每個子音都有側面圖與字形由來
for (const [js, tip, ws] of D.CTRIOS) {
  ok(tip && ws.length >= 1, 'H7 子音組 ' + js.join(''));
  for (const set of ws) {
    ok(set.length >= 2 && set.length <= js.length, 'H7 單字數 ' + set.map(w => w[0]).join('/'));
    const jm = set.map(w => KH.jamo(w[0]));
    ok(jm.every(x => x.length === jm[0].length), 'H7 長度一樣 ' + set.map(w => w[0]).join('/'));
    const diffAt = jm[0].map((_, i) => i).filter(i => jm.some(x => x[i] !== jm[0][i]));
    ok(diffAt.length === 1 && set.every((w, k) => js.includes(jm[k][diffAt[0]])), 'H7 只差這組子音 ' + set.map(w => w[0]).join('/'));
    ok(new Set(set.map(w => w[0])).size === set.length && set.every(w => w[1]), 'H7 單字不重複、有中文 ' + set[0][0]);
  }
}
// 發音動畫（speech-art.js）：每個子音都有部位與出氣方式、家族卡剛好涵蓋每個子音一次、每個時間點都畫得出來
const sctx = {}; vm.createContext(sctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/speech-art.js'), 'utf8'), sctx);
const SA = sctx.SA;
const allC = [...D.CONSONANTS, ...D.DOUBLES].map(x => x.j);
for (const j of allC) {
  ok(SA.C[j] && actx.A.CSHAPE[j], 'H7 動畫資料與字形 ' + j);
  ok(SA.FAM.filter(f => f.js.includes(j)).length === 1, 'H7 家族卡剛好一張 ' + j);
  let rel = 0;
  for (let ms = 0; ms <= 2400; ms += 50) {
    const st = SA.stateAt(j, ms); st.now = ms; st.labels = true; st.zoom = 1;
    const svg = SA.drawHybrid(st, 't');
    if (!/^[\s\S]*<\/g>\s*$/.test(svg) || /NaN|undefined/.test(svg)) { ok(false, `H7 ${j} ${ms}ms 畫不出來`); break; }
    if (st.step === 2) rel++;
  }
  ok(rel > 0 || j === 'ㅇ', 'H7 有「放開」階段 ' + j);
  ok(SA.syl(j) && KH.isSyl(SA.syl(j)), 'H7 念的字 ' + j);
}
// 母音動畫：每個母音（含雙母音）每個時間點都畫得出來、念的字正確、家族卡剛好涵蓋每個母音一次
for (const v of [...D.VOWELS, ...D.VOWELS2].map(x => x.j)) {
  ok(SA.isVowel(v) && SA.vsyl(v) === KH.comp('ㅇ', v), 'H8 母音動畫 ' + v);
  ok(SA.VFAM.filter(f => f.vs.includes(v)).length === 1, 'H8 母音家族卡剛好一張 ' + v);
  for (let ms = 0; ms <= 2100; ms += 50) {
    const st = SA.vStateAt(v, ms); st.now = ms; st.mode = 'v';
    if (/NaN|undefined/.test(SA.drawHybrid(st, 't'))) { ok(false, `H8 ${v} ${ms}ms 畫不出來`); break; }
  }
}
ok(Object.keys(SA.C).sort().join('') === [...allC].sort().join(''), 'H7 動畫子音＝40 音的子音');
ok(SA.MANNERS.map(m => m.js).join('').split('').sort().join('') === 'ㄱㄲㄷㄸㅂㅃㅅㅆㅈㅉㅊㅋㅌㅍ'.split('').sort().join(''), 'H7 平音・送氣音・硬音卡');

// R1～R4 閱讀文章：surface 照順序出現在句子裡、vocab_id 對得上、清單單字比例 85～90% 以上、文法編號存在、拼音正常
const rctx = { KH }; vm.createContext(rctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/reading.js'), 'utf8') + ';this.RV=READ_VOCAB;this.RA=READ_ARTICLES;this.RT=TOPIK_TOPICS;this.RM=VOCAB_ID_MAP;this.RAM=ARTICLE_ID_MAP;', rctx);
const RV = Object.fromEntries(rctx.RV.map(v => [v.id, v]));
ok(rctx.RV.length === Object.keys(RV).length, 'R1 單字 id 不重複');
for (const v of rctx.RV) {
  ok(/^v_\d{4}$/.test(v.id) && v.word && v.meaning_zh && v.example_ko && v.example_zh && [1, 2, 3, 4, 5, 6].includes(v.level), 'R1 單字欄位 ' + v.id);
  ok(!['動詞', '形容詞'].includes(v.pos) || v.word.endsWith('다'), 'R1 動詞形容詞以 -다 結尾 ' + v.word);
  ok(/^[a-z0-9 .,!?']+$/.test(KH.romanize(v.example_ko)), 'R1 例句拼音 ' + v.example_ko);
}
// R5 TOPIK 主題：每個字的編號落在所屬主題的區段、完成的主題剛好 34（1 級）／38（2 級）個字、同一個字不重複出現、舊編號對照都指得到
const seenWM = new Set();
for (const v of rctx.RV) {
  const n = Number(v.id.slice(2)), t = rctx.RT.find(x => x.level === v.level && n >= Number(x.ids[0].slice(2)) && n <= Number(x.ids[1].slice(2)));
  ok(t && t.title === v.topic, `R5 ${v.id} ${v.word} 的主題要是區段的主題（${t && t.title}／${v.topic}）`);
  const k = v.word + '|' + v.meaning_zh; ok(!seenWM.has(k), 'R5 單字重複 ' + k); seenWM.add(k);
}
for (const t of rctx.RT.filter(t => t.ready)) {
  const ws = rctx.RV.filter(v => { const n = Number(v.id.slice(2)); return n >= Number(t.ids[0].slice(2)) && n <= Number(t.ids[1].slice(2)); });
  const per = { 1: 34, 2: 38 }[t.level], first = { 1: 1, 2: 26 }[t.level], base = { 1: 1001, 2: 2001 }[t.level];
  ok(ws.length === per && ws.every(v => v.level === t.level), `R5 主題 ${t.no} 要有 ${per} 個 ${t.level} 級的字（現在 ${ws.length}）`);
  ok(t.ids[0] === 'v_' + (base + (t.no - first) * per), `R5 主題 ${t.no} 的編號區段 ${t.ids[0]}`);
  ok(t.art === 'art_' + t.level + String(t.no - first + 1).padStart(2, '0') && rctx.RA.some(a => a.article_id === t.art && a.level === t.level), `R5 主題 ${t.no} 要有文章 ${t.art}`);
}
for (const [o, nw] of Object.entries(rctx.RM)) ok(RV[nw], `R5 舊編號 ${o} 對到 ${nw}`);
for (const [o, nw] of Object.entries(rctx.RAM)) { const [a, c] = nw.split(':'); ok(rctx.RA.some(x => x.article_id === a && x.challenge_vocab.some(y => y.id === c)), 'R5 舊文章單字 ' + o); }
const aIds = new Set();
for (const a of rctx.RA) {
  ok(!aIds.has(a.article_id), 'R2 文章 id 不重複 ' + a.article_id); aIds.add(a.article_id);
  const ch = Object.fromEntries(a.challenge_vocab.map(c => [c.id, c]));
  const gIds = new Set(a.grammar_notes.map(g => g.grammar_id));
  let list = 0, plus = 0;
  a.sentences.forEach((s, i) => {
    ok(s.sentence_index === i + 1 && s.ko && s.zh, `R2 ${a.article_id} 句子編號 ${i + 1}`);
    ok(/^[a-z0-9 .,!?']+$/.test(KH.romanize(s.ko)), 'R2 句子拼音 ' + s.ko);
    let pos = 0;
    for (const t of s.target_words) {
      const at = s.ko.indexOf(t.surface, pos);
      ok(at >= 0, `R3 ${a.article_id} 第 ${i + 1} 句找不到「${t.surface}」（要照順序）`); if (at >= 0) pos = at + t.surface.length;
      const v = t.vocab_id.startsWith('new_') ? ch[t.vocab_id] : RV[t.vocab_id];
      ok(v && v.word === t.lemma, `R3 ${t.surface} 的 lemma／vocab_id 對不上（${t.lemma} ${t.vocab_id}）`);
      if (t.vocab_id.startsWith('new_')) plus++; else list++;
    }
    for (const g of s.grammar_ids) ok(gIds.has(g), `R4 ${a.article_id} 第 ${i + 1} 句的文法 ${g} 沒有筆記`);
  });
  const ratio = list / (list + plus);
  ok(ratio >= .85 && plus >= 2 && plus <= 3 || a.challenge_vocab.length === 0, `R3 ${a.article_id} 清單單字比例 ${Math.round(ratio * 100)}%、+1 單字 ${plus} 個`);
  for (const c of a.challenge_vocab) ok(c.level === a.level + 1 && a.sentences.some(s => s.target_words.some(t => t.vocab_id === c.id)), 'R3 +1 單字要高一級且出現在文章裡 ' + c.word);
  for (const g of a.grammar_notes) ok(g.pattern && g.meaning && g.explanation && g.extra_example_ko && g.extra_example_zh, 'R4 文法筆記欄位 ' + g.grammar_id);
}

console.log(fail ? `hangul: ${fail}/${n} 失敗` : `hangul: ${n} 項全部通過`);
process.exit(fail ? 1 : 0);
