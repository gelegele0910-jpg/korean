/* ================= 호야 韓語：主程式 =================
 * 全域狀態：S（學習進度，存 localStorage）、U（介面狀態，U.view 決定畫面）。
 * 繪製：render() 依 U.view 呼叫 VIEWS[...]() 產生 HTML 字串塞進 #main。
 * 事件：元素加 data-act="名稱"（參數放 data-*），處理函式在 ACT。輸出文字一律用 h() 跳脫。 */
'use strict';

/* ================= 基本工具 ================= */
const $ = s => document.querySelector(s);
const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const dstr = d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
const today = () => dstr(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dstr(d); };
const dayNo = () => { const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const uniq = a => [...new Set(a)];
const fmt = n => Number(n || 0).toLocaleString('en-US');

// 所有單字、句子（id = 主題 + 位置，是進度 key）
const WORDS = TOPICS.flatMap(tp => tp.w.map((w, i) => ({ id: tp.id + '-w' + i, ko: w[0], zh: w[1], tp: tp.id })));
const SENTS = TOPICS.flatMap(tp => tp.s.map((s, i) => ({ id: tp.id + '-s' + i, ko: s[0], zh: s[1], tp: tp.id })));
const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));
const ALL_LETTERS = [...VOWELS, ...VOWELS2, ...CONSONANTS, ...DOUBLES];

/* ================= 資料儲存 ================= */
const KEY = 'hoya-korean-v1';
function newProg() {
  return { v: 1, created: Date.now(), updated: 0, coins: 0, earned: 0, done: {}, srs: {}, own: {}, best: {},
    wear: { bg: '', hat: '', face: '', neck: '', hand: '' }, skin: 'fresh',
    set: { rr: 'show', pron: true, rate: 0.9, voice: '', auto: true },
    log: {}, streak: { last: null, count: 0, best: 0 }, ms: {},
    day: { d: '', checkin: 0, tasks: {}, games: {}, spk: {} } };
}
function migrate(o) {
  const n = newProg();
  if (!o || typeof o !== 'object' || Array.isArray(o)) return n;
  for (const k in n) {
    const want = n[k];
    if (o[k] === undefined || o[k] === null || typeof o[k] !== typeof want || Array.isArray(o[k]) !== Array.isArray(want)) o[k] = want;
    else if (want && typeof want === 'object' && !Array.isArray(want) && ['wear', 'set', 'streak', 'day'].includes(k)) o[k] = Object.assign({}, want, o[k]);
  }
  if (!(o.coins >= 0)) o.coins = 0;
  o.coins = Math.floor(o.coins);
  if (![0.7, 0.9, 1.05].includes(o.set.rate)) o.set.rate = 0.9;
  if (!['show', 'tap', 'hide'].includes(o.set.rr)) o.set.rr = 'show';
  if (!owned('skin:' + o.skin, o)) o.skin = 'fresh';
  for (const c of ['hat', 'face', 'neck', 'hand', 'bg']) if (o.wear[c] && !owned(c + ':' + o.wear[c], o)) o.wear[c] = '';
  return o;
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function load() { try { const raw = lsGet(KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { /* 壞掉的資料就重新開始 */ } return newProg(); }
let saveWarned = false;
function save() {
  S.updated = Date.now();
  if (!lsSet(KEY, JSON.stringify(S)) && !saveWarned) { saveWarned = true; toast('無法存檔（可能是私密瀏覽模式），進度可能會不見'); }
}

let S = load();
const U = { view: 'home', ls: null, g: null, rv: null, sp: null, sheet: null, pops: [], arm: '', shopCat: 'skin', meTab: 'shop', moreT: false, my: null, bd: { l: 'ㄱ', v: 'ㅏ', t: '' } };

/* ================= 進度工具 ================= */
function owned(id, s) { s = s || S; const it = SHOP.find(x => x.id === id); return !!it && (it.price === 0 || !!s.own[id]); }
function logT() { const t = today(); return S.log[t] || (S.log[t] = {}); }
function resetDay() { if (S.day.d !== today()) S.day = { d: today(), checkin: 0, tasks: {}, games: {}, spk: {} }; }
const practicedToday = () => { const lg = S.log[today()]; return !!lg && Object.values(lg).some(v => v > 0); };
const STREAK_MS = [[3, 300], [7, 700], [14, 1500], [30, 3000], [60, 5000], [100, 10000]];
/** 記一筆練習並更新連續天數 */
function bump(kind, n) {
  resetDay();
  const lg = logT(); lg[kind] = (lg[kind] || 0) + (n == null ? 1 : n);
  const st = S.streak, t = today();
  if (st.last !== t) {
    st.count = st.last === yesterday() ? st.count + 1 : 1;
    st.last = t; st.best = Math.max(st.best, st.count);
    for (const [d, c] of STREAK_MS) if (st.count >= d && !S.ms['st' + d]) {
      S.ms['st' + d] = t; earn(c);
      U.pops.push({ ic: '🔥', t: `連續學習 ${d} 天！`, x: `太厲害了！送你 ₩${fmt(c)}。`, mood: 'happy' });
    }
  }
}
function earn(n) { n = Math.max(0, Math.floor(n)); S.coins += n; S.earned += n; return n; }
function streakNow() { const st = S.streak; return (st.last === today() || st.last === yesterday()) ? st.count : 0; }

const TASKS = [
  { id: 'lesson', t: '完成 1 課（新課或重練都可以）', n: 1, get: lg => lg.l || 0 },
  { id: 'game',   t: '玩 2 次遊戲', n: 2, get: lg => lg.g || 0 },
  { id: 'voice',  t: '跟讀或複習單字 5 次', n: 5, get: lg => (lg.s || 0) + (lg.r || 0) },
];
const TASK_COIN = 100, TASK_ALL = 200, CHECKIN_COIN = 50;

// 拼字間隔複習
const SRS_INT = [1, 3, 7, 14, 30];
const due = () => Object.keys(S.srs).filter(id => WORD[id] && !S.srs[id].m && S.srs[id].d <= dayNo());
function srsAdd(id) { if (!S.srs[id]) S.srs[id] = { l: 0, d: dayNo() + 1, m: 0 }; }
function srsAnswer(id, ok) {
  const r = S.srs[id]; if (!r) return;
  if (ok) { r.l = Math.min(r.l + 1, 5); if (r.l >= 5) { r.m = 1; r.d = null; } else r.d = dayNo() + SRS_INT[r.l]; }
  else { r.l = 0; r.m = 0; r.d = dayNo() + 1; }
}

/* ================= 語音 ================= */
let koVoices = [], voicesLoaded = false, voiceWarned = false;
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  if (all.length) voicesLoaded = true;
  koVoices = all.filter(v => /^ko/i.test(v.lang));
}
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = () => { loadVoices(); if (U.view === 'me' && U.meTab === 'set') render(); }; }
function pickVoice() {
  if (!koVoices.length) return null;
  return koVoices.find(v => v.voiceURI === S.set.voice) || koVoices.find(v => /google|yuna|sora|heami|sun-?hi|injoon/i.test(v.name)) || koVoices[0];
}
function speak(text, rate) {
  if (!('speechSynthesis' in window)) { toast('這個瀏覽器不能播放語音'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = 'ko-KR'; u.rate = rate || S.set.rate;
  const v = pickVoice(); if (v) u.voice = v;
  if (!v && voicesLoaded && !voiceWarned) { voiceWarned = true; toast('找不到韓文語音，可能念不出來；可在手機的「文字轉語音」設定加裝韓文'); }
  speechSynthesis.speak(u);
}
function stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

// 口說辨識（同時只開一個）
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null, recTimer = 0;
function abortRec() { clearTimeout(recTimer); if (recog) { const r = recog; recog = null; try { r.abort(); } catch (e) { /* 已經結束 */ } } }
function startRec(target, cb) {
  abortRec(); stopSpeak();
  const r = new SR(); const me = r; let fin = false;
  const end = (best, err) => { if (fin || recog !== me) return; fin = true; clearTimeout(recTimer); recog = null; cb(best, err); };
  r.lang = 'ko-KR'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
  r.onresult = e => {
    const res = e.results[0]; let best = null;
    for (let i = 0; i < res.length; i++) { const tx = res[i].transcript; const sc = KH.score(target, tx); if (!best || sc > best.sc) best = { sc, heard: tx }; }
    end(best, null); try { r.stop(); } catch (e2) { /* 已經結束 */ }
  };
  r.onerror = e => end(null, e.error || 'error');
  r.onend = () => end(null, 'no-speech');
  recog = r;
  try { r.start(); } catch (e) { end(null, 'start'); return; }
  recTimer = setTimeout(() => { if (recog === me) { try { r.stop(); } catch (e) { /* 已經結束 */ } setTimeout(() => end(null, 'no-speech'), 2000); } }, 12000);
}

/* ================= 顯示小工具 ================= */
function rrHtml(ko, cls) {
  if (S.set.rr === 'hide') return '';
  const tap = S.set.rr === 'tap';
  return `<span class="rr ${tap ? 'tap' : ''} ${cls || ''}" ${tap ? 'data-act="rrshow" title="點一下顯示拼音"' : ''}>${h(KH.romanize(ko))}</span>`;
}
function pronHtml(ko) {
  if (!S.set.pron) return '';
  const p = KH.pronounce(ko);
  return p !== ko ? `<span class="pron">[${h(p)}]</span>` : '';
}
const sayBtn = (ko, cls) => `<button class="say ${cls || ''}" data-act="say" data-t="${h(ko)}" aria-label="播放">🔊</button>`;
const slowBtn = ko => `<button class="say slow" data-act="say" data-t="${h(ko)}" data-r="0.6" aria-label="慢速播放">慢</button>`;
function koLine(ko, zh, extra) {
  return `<div class="koline">${sayBtn(ko, 'sm')}<div class="tx"><div class="k">${h(ko)} ${pronHtml(ko)}</div>
    <div>${rrHtml(ko)}${zh ? ` <span class="sub">${h(zh)}</span>` : ''}</div></div>${extra || ''}</div>`;
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.tm); toast.tm = setTimeout(() => t.classList.remove('on'), 2400); }
const coinPill = () => `<button class="pill" data-act="go" data-v="me" data-tab="shop" aria-label="點數">🪙 ₩${fmt(S.coins)}</button>`;

/* ================= 課程：產生步驟 ================= */
function mkQuiz(o) {
  // o: {q, show, showKo, audio, ans, wrong:[...], ko(選項是韓文), exp}
  const opts = shuffle(uniq([o.ans, ...o.wrong.filter(w => w !== o.ans)]).slice(0, 4));
  return { k: 'quiz', q: o.q, show: o.show, showKo: o.showKo, audio: o.audio, opts, ans: opts.indexOf(o.ans), ko: !!o.ko, exp: o.exp, picked: null };
}
const others = (arr, x, n) => shuffle(arr.filter(y => y !== x)).slice(0, n);
function quizLetters(set) {
  const qs = [];
  shuffle(set).slice(0, Math.min(8, set.length)).forEach((x, i) => {
    if (i % 2 === 0) qs.push(mkQuiz({ q: '聽聽看，是哪一個字母？', audio: x.say, ans: x.j, wrong: others(set, x, 3).map(y => y.j), ko: true, exp: `${x.j}（${x.rr}），例：${x.say}` }));
    else qs.push(mkQuiz({ q: '這個字母念什麼？', show: x.j, showKo: true, audio: null, ans: x.rr, wrong: others(set, x, 3).map(y => y.rr), exp: `${x.j} 念 ${x.rr}，例如 ${x.ex[0]}（${x.ex[1]}）` }));
  });
  return qs;
}
const VERT = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ'], HORI = ['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ'];
const MIX = { 'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅐ'], 'ㅚ':['ㅗ','ㅣ'], 'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅔ'], 'ㅟ':['ㅜ','ㅣ'], 'ㅢ':['ㅡ','ㅣ'] };
const SIMPLE_L = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const SIMPLE_V = ['ㅏ','ㅓ','ㅗ','ㅜ','ㅡ','ㅣ','ㅑ','ㅕ','ㅛ','ㅠ','ㅐ','ㅔ','ㅘ','ㅝ'];
const SIMPLE_T = ['', 'ㄱ','ㄴ','ㄹ','ㅁ','ㅂ','ㅇ'];
function randSyl(withT) { return { l: pick(SIMPLE_L), v: pick(SIMPLE_V), t: withT ? pick(SIMPLE_T) : '' }; }
const sylStr = s => KH.comp(s.l, s.v, s.t);
function nearSyls(s, n) {
  const out = new Set([sylStr(s)]); let guard = 0;
  while (out.size < n + 1 && guard++ < 200) {
    const m = Object.assign({}, s), r = Math.random();
    if (r < .4) m.v = pick(SIMPLE_V); else if (r < .75) m.l = pick(SIMPLE_L); else m.t = pick(SIMPLE_T);
    out.add(sylStr(m));
  }
  out.delete(sylStr(s));
  return [...out];
}
function buildLesson(L) {
  const st = [{ k: 'intro' }];
  if (L.kind === 'letters') {
    const set = LETTER_SETS[L.set];
    set.forEach(x => st.push({ k: 'letter', x }));
    if (L.set === 'DOUBLES') st.push({ k: 'trio' });
    st.push(...quizLetters(set));
    if (L.set === 'DOUBLES') shuffle(TRIOS).slice(0, 3).forEach(tr => {
      const row = tr.filter(Boolean), x = pick(row);
      st.push(mkQuiz({ q: '平音、送氣音、硬音：聽到的是哪一個？', audio: x, ans: x, wrong: row, ko: true, exp: `${row.join('・')}：輕輕的・吐氣・繃緊` }));
    });
  } else if (L.kind === 'vowels') {
    st.push({ k: 'vmap' }, { k: 'vchain' });
    VPAIRS.forEach(p => st.push({ k: 'vpair', p }));
    const pool = VPAIRS.flatMap(p => p[3].map(ws => [p, ws]));
    shuffle(pool.concat(shuffle(pool))).slice(0, 10).forEach(([p, ws]) => {
      const [a, b] = Math.random() < .5 ? ws : [ws[1], ws[0]];
      st.push(mkQuiz({ q: `聽聽看：是 ${p[0]} 還是 ${p[1]}？`, audio: a[0], ans: a[0], wrong: [b[0]], ko: true, exp: `${a[0]}（${a[1]}）／${b[0]}（${b[1]}）` }));
    });
  } else if (L.kind === 'syllable') {
    st.push({ k: 'syl', n: 0 }, { k: 'syl', n: 1 }, { k: 'syl', n: 2 }, { k: 'syl', n: 3 });
    for (let i = 0; i < 8; i++) {
      const s = randSyl(i >= 4), ch = sylStr(s);
      if (i % 2 === 0) st.push(mkQuiz({ q: '這個字怎麼念？', show: ch, showKo: true, ans: KH.romanize(ch), wrong: nearSyls(s, 3).map(x => KH.romanize(x)), exp: `${ch}＝${s.l}＋${s.v}${s.t ? '＋' + s.t : ''}` }));
      else st.push(mkQuiz({ q: '聽聽看，是哪一個字？', audio: ch, ans: ch, wrong: nearSyls(s, 3), ko: true, exp: `${ch}（${KH.romanize(ch)}）` }));
    }
  } else if (L.kind === 'batchim') {
    BATCHIM.forEach(x => st.push({ k: 'bat', x }));
    st.push({ k: 'bpair' });
    for (let i = 0; i < 8; i++) {
      const base = { l: pick(['ㅂ','ㄱ','ㅁ','ㅅ','ㄴ']), v: pick(['ㅏ','ㅓ','ㅗ','ㅜ','ㅣ']) };
      const fins = shuffle(BATCHIM.map(b => b.j)).slice(0, 4), ans = KH.comp(base.l, base.v, fins[0]);
      st.push(mkQuiz({ q: '聽收音：是哪一個字？', audio: ans, ans, wrong: fins.slice(1).map(t => KH.comp(base.l, base.v, t)), ko: true, exp: `${ans} 的收音是 ${fins[0]}（${KH.romanize(ans)}）` }));
    }
  } else if (L.kind === 'rules') {
    RULES.forEach(x => st.push({ k: 'rule', x }));
    RULES.forEach(r => {
      const e = pick(r.ex), p = KH.pronounce(e[0]);
      st.push(mkQuiz({ q: `「${e[0]}」實際怎麼念？`, audio: e[0], ans: `[${p}]`, wrong: uniq([e[2], e[0]]).filter(x => x !== p).map(x => `[${x}]`), ko: true, exp: `${r.nm}：${e[0]} → [${p}]` }));
    });
  } else if (L.kind === 'topic') {
    const tp = TOPICS.find(t => t.id === L.topic);
    const ws = WORDS.filter(w => w.tp === tp.id), ss = SENTS.filter(s => s.tp === tp.id);
    ws.forEach(w => st.push({ k: 'word', w }));
    ss.forEach(s => st.push({ k: 'sent', s }));
    const zhs = ws.map(w => w.zh);
    shuffle(ws).slice(0, 4).forEach(w => st.push(mkQuiz({ q: '聽聽看，這個單字是什麼意思？', audio: w.ko, ans: w.zh, wrong: others(zhs, w.zh, 3), exp: `${w.ko}（${KH.romanize(w.ko)}）＝${w.zh}` })));
    shuffle(ws).slice(0, 2).forEach(w => st.push(mkQuiz({ q: `「${w.zh}」的韓文是？`, ans: w.ko, wrong: others(ws.map(x => x.ko), w.ko, 3), ko: true, exp: `${w.zh}＝${w.ko}` })));
    shuffle(ss).slice(0, 2).forEach(s => st.push(mkQuiz({ q: '聽句子，意思是？', audio: s.ko, ans: s.zh, wrong: others(ss.map(x => x.zh), s.zh, 3), exp: `${s.ko}＝${s.zh}` })));
  }
  return st;
}
function startLesson(id) {
  const L = LESSONS.find(x => x.id === id); if (!L) return;
  U.ls = { id, L, steps: buildLesson(L), i: 0, ok: 0, n: 0 };
  go('lesson');
}

/* ================= 畫面：首頁 ================= */
const nextLesson = () => LESSONS.find(L => !S.done[L.id]);
function vHome() {
  resetDay();
  const nx = nextLesson(), lg = S.log[today()] || {}, d = due().length;
  const doneN = LESSONS.filter(L => S.done[L.id]).length;
  const tasks = TASKS.map(t => {
    const v = Math.min(t.get(lg), t.n), got = S.day.tasks[t.id];
    return `<div class="task"><div class="tx"><div>${h(t.t)}</div><div class="bar mt" style="margin-top:6px"><i style="width:${v / t.n * 100}%"></i></div></div>
      ${got ? '<span class="ok" style="color:var(--good);font-weight:800">已領 ✓</span>'
        : `<button class="btn sm ${v >= t.n ? 'main' : ''}" data-act="task" data-id="${t.id}" ${v >= t.n ? '' : 'disabled'}>${v}/${t.n}・₩${TASK_COIN}</button>`}</div>`;
  }).join('');
  return `
  <div class="card hero">${mascot(S.wear, 96, practicedToday() ? 'happy' : 'normal')}
    <div class="bub"><div class="line ko">${h(HOYA_LINES[new Date().getDate() % HOYA_LINES.length])}</div>
    <div class="sub mt" style="margin-top:6px">🔥 連續 ${streakNow()} 天　📘 完成 ${doneN}/${LESSONS.length} 課</div></div></div>
  ${nx ? `<div class="card"><div class="sub">繼續學習</div><div class="row" style="margin-top:6px">
      <div class="lesson" style="box-shadow:none;margin:0;padding:0;cursor:default"><div class="ic">${h(nx.ic)}</div><div class="tx"><b>${h(nx.t)}</b><span class="sub">${h(nx.sub)}</span></div></div></div>
      <button class="btn main block mt" data-act="lesson" data-id="${nx.id}">開始學習 ▶</button></div>`
    : `<div class="card"><b>🎉 全部課程都完成了！</b><div class="sub">可以重練任何一課、玩遊戲或複習單字。</div></div>`}
  ${d ? `<div class="card soft row"><div class="grow"><b>📇 今天要複習 ${d} 個單字</b><div class="sub">間隔複習，記得更久</div></div><button class="btn main" data-act="review">複習</button></div>` : ''}
  <div class="card tasks"><div class="row"><h3 class="grow" style="margin:0">今日任務</h3>
    ${S.day.checkin ? '<span class="sub">已簽到 ✓</span>' : `<button class="btn sm ${practicedToday() ? 'main' : ''}" data-act="checkin">簽到 ₩${CHECKIN_COIN}</button>`}</div>
    ${tasks}<div class="sub small" style="margin-top:6px">三個任務都領取，再送 ₩${TASK_ALL}！</div></div>
  <div class="tile-grid">
    <button class="tile" data-act="go" data-v="chart"><span class="ic ko">가</span><b>40 音表</b><span class="sub small">點字母聽發音</span></button>
    <button class="tile" data-act="go" data-v="builder"><span class="ic">🧩</span><b>拼音工坊</b><span class="sub small">自己組字聽聽看</span></button>
    <button class="tile" data-act="go" data-v="games"><span class="ic">🎮</span><b>遊戲</b><span class="sub small">邊玩邊賺點數</span></button>
    <button class="tile" data-act="go" data-v="me" data-tab="shop"><span class="ic">🎁</span><b>商店</b><span class="sub small">幫호야換裝</span></button>
  </div>`;
}

/* ================= 畫面：課程列表、40 音表、拼音工坊 ================= */
function vLearn() {
  const secs = uniq(LESSONS.map(L => L.sec));
  return `<h2 class="mt">學習</h2>
  <div class="tile-grid">
    <button class="tile" data-act="go" data-v="chart"><span class="ic ko">가</span><b>40 音表</b></button>
    <button class="tile" data-act="go" data-v="builder"><span class="ic">🧩</span><b>拼音工坊</b></button>
  </div>
  ${secs.map(sec => `<h3 class="mt">${h(sec)}</h3>` + LESSONS.filter(L => L.sec === sec).map(L => `
    <button class="lesson" data-act="lesson" data-id="${L.id}"><div class="ic">${h(L.ic)}</div>
      <div class="tx"><b>${h(L.t)}</b><span class="sub small">${h(L.sub)}</span></div>${S.done[L.id] ? '<span class="ok">✓</span>' : ''}</button>`).join('')).join('')}`;
}
function vChart() {
  const grp = (t, set, nm) => `<h3 class="mt">${t}</h3><div class="chart">${set.map(x => `<button data-act="say" data-t="${h(x.say)}"><b>${h(x.j)}</b><span>${h(x.rr)}</span>${nm && x.nm ? `<div class="sub small ko">${h(x.nm)}</div>` : ''}</button>`).join('')}</div>`;
  return `<div class="step-top"><button class="x" data-act="go" data-v="learn" aria-label="返回">←</button><h2 style="margin:0">40 音表</h2></div>
  <div class="sub">點字母聽發音（子音配 ㅏ 念）。</div>
  ${grp('基本母音（10）', VOWELS)}${grp('複合母音（11）', VOWELS2)}${grp('基本子音（14）', CONSONANTS, 1)}${grp('硬音（5）', DOUBLES, 1)}`;
}
function diagram(l, v, t) {
  let areas, cells;
  if (MIX[v]) { areas = t ? '"c w" "hh w" "t t"' : '"c w" "hh w"'; cells = `<div class="c" style="grid-area:c">${l}</div><div class="v" style="grid-area:hh">${MIX[v][0]}</div><div class="v" style="grid-area:w">${MIX[v][1]}</div>`; }
  else if (HORI.includes(v)) { areas = t ? '"c" "v" "t"' : '"c" "v"'; cells = `<div class="c" style="grid-area:c">${l}</div><div class="v" style="grid-area:v">${v}</div>`; }
  else { areas = t ? '"c v" "t t"' : '"c v"'; cells = `<div class="c" style="grid-area:c">${l}</div><div class="v" style="grid-area:v">${v}</div>`; }
  if (t) cells += `<div class="t" style="grid-area:t">${t}</div>`;
  return `<div class="diagram ko" style="grid-template-areas:${areas}" aria-hidden="true">${cells}</div>`;
}
function vBuilder() {
  const b = U.bd, ch = KH.comp(b.l, b.v, b.t);
  const row = (arr, key, cls) => `<div class="jamo">${arr.map(j => `<button class="${b[key] === j ? 'on' : ''} ${j ? '' : 'none'} ${cls || ''}" data-act="bd" data-k="${key}" data-j="${j}">${j || '無'}</button>`).join('')}</div>`;
  const finals = U.moreT ? KH.T : ['', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];
  return `<div class="step-top"><button class="x" data-act="go" data-v="learn" aria-label="返回">←</button><h2 style="margin:0">拼音工坊</h2></div>
  <div class="card"><div class="syl-box">${diagram(b.l, b.v, b.t)}<div class="center"><div class="big">${h(ch)}</div>
    <div>${rrHtml(ch)} ${pronHtml(ch)}</div></div></div>
    <div class="btns"><button class="btn main" data-act="say" data-t="${h(ch)}">🔊 念念看</button><button class="btn" data-act="bd-rand">🎲 隨機一個字</button></div></div>
  <div class="card"><h3>① 子音（初聲）</h3>${row(KH.L, 'l')}
    <h3 class="mt">② 母音</h3>${row(KH.V, 'v')}
    <h3 class="mt">③ 收音（可以沒有）</h3>${row(finals, 't')}
    <button class="btn sm ghost mt" data-act="bd-more">${U.moreT ? '只顯示常用收音' : '顯示全部 27 種收音'}</button></div>
  <div class="tip">藍色＝子音、橙色＝母音、綠色＝收音。直的母音（ㅏ ㅓ ㅣ…）放右邊；橫的母音（ㅗ ㅜ ㅡ…）放下面；收音永遠在最下面。</div>`;
}

/* ================= 畫面：上課 ================= */
const SYL_CARDS = [
  { t:'左右型：直的母音放右邊', d:'母音是直的（ㅏ ㅑ ㅓ ㅕ ㅣ ㅐ ㅔ），子音寫在左邊。', ex:[['ㄴ','ㅏ',''],['ㅁ','ㅣ',''],['ㅅ','ㅓ','']] },
  { t:'上下型：橫的母音放下面', d:'母音是橫的（ㅗ ㅛ ㅜ ㅠ ㅡ），子音寫在上面。', ex:[['ㄱ','ㅗ',''],['ㄴ','ㅜ',''],['ㅁ','ㅡ','']] },
  { t:'複合母音：包住子音', d:'複合母音（ㅘ ㅝ ㅟ ㅢ…）同時有橫的和直的部分，子音在左上角。', ex:[['ㄱ','ㅘ',''],['ㅇ','ㅝ',''],['ㄱ','ㅟ','']] },
  { t:'加上收音：放在最下面', d:'有收音（받침）的字，收音放在整個字的最下面。下一課會專門練收音的念法。', ex:[['ㄱ','ㅏ','ㅇ'],['ㅅ','ㅏ','ㄴ'],['ㄱ','ㅗ','ㅁ']] },
];
function stepNav(next, label) { return `<div class="btns">${U.ls.i > 1 ? '<button class="btn" data-act="ls-prev">← 上一步</button>' : ''}<button class="btn main" data-act="${next || 'ls-next'}">${label || '下一步 →'}</button></div>`; }
function vStep(s) {
  const L = U.ls.L;
  switch (s.k) {
    case 'intro': return `<div class="card center">${mascot(S.wear, 110, 'happy')}<h2>${h(L.t)}</h2><p style="text-align:left">${h(L.intro)}</p>
      ${L.kind === 'topic' && TOPICS.find(t => t.id === L.topic).note ? `<div class="tip" style="text-align:left">💡 ${h(TOPICS.find(t => t.id === L.topic).note)}</div>` : ''}
      <div class="sub">${U.ls.steps.filter(x => x.k !== 'quiz').length - 1} 張學習卡＋${U.ls.steps.filter(x => x.k === 'quiz').length} 題小測驗</div>
      <button class="btn main block mt" data-act="ls-next">開始 ▶</button></div>`;
    case 'letter': { const x = s.x; return `<div class="card center"><div class="big">${h(x.j)}</div>
      <div>${x.nm ? `<span class="ko sub">${h(x.nm)}</span>　` : ''}<span class="rr" style="font-size:1.3rem">${h(x.rr)}</span></div>
      ${mouthHtml(x.j, 110) ? `<div class="mouthrow">${mouthHtml(x.j, 110)}</div>` : ''}
      <div class="btns" style="justify-content:center"><button class="btn main" data-act="say" data-t="${h(x.say)}">🔊 ${h(x.say)}</button><button class="btn" data-act="say" data-t="${h(x.say)}" data-r="0.6">🐢 慢慢念</button></div>
      <div class="tip" style="text-align:left">${h(x.tip)}</div>
      ${myRecHtml('l-' + x.j, x.say)}
      <div style="text-align:left">${koLine(x.ex[0], x.ex[1])}</div></div>${stepNav()}`; }
    case 'vmap': return `<div class="card"><h3>母音位置圖</h3><div class="sub">點圓圈聽發音。橙色＝嘴唇不圓，藍色＝嘴唇嘟圓。虛線連起來的兩個，舌頭位置幾乎一樣，<b>只差嘴唇圓不圓</b>。</div>
      ${vowelMap()}<div class="sub small center">虛線＝只差嘴唇圓不圓</div><div class="tip">💡 所以只要記住：<b class="ko">ㅓ</b>＋嘟嘴＝<b class="ko">ㅗ</b>；<b class="ko">ㅡ</b>＋嘟嘴＝<b class="ko">ㅜ</b>。</div></div>${stepNav()}`;
    case 'vchain': return `<div class="card"><h3>嘴型連續動作</h3><div class="sub">依序點下去，邊聽邊跟著做嘴型，感覺每次只改變一個地方。可以對著鏡子或手機前鏡頭練習。</div>
      ${VCHAINS.map((c, k) => `<h3 class="mt">${h(c.t)}</h3><div class="chain">${c.v.map((v, i) => `${i ? '<span class="arr">→</span>' : ''}<button data-act="say" data-t="${KH.comp('ㅇ', v)}">${mouthSvg(v, 52)}<b>${v}</b></button>`).join('')}</div>
        <div class="center"><button class="btn sm" data-act="say" data-t="${c.v.map(v => KH.comp('ㅇ', v)).join(', ')}" data-r="0.6">▶ 連續慢慢念</button></div>`).join('')}</div>${stepNav()}`;
    case 'vpair': { const [a, b, tip, ws] = s.p; return `<div class="card"><h3><span class="ko">${a}</span> 和 <span class="ko">${b}</span></h3>
      <div class="vpair">${[a, b].map(v => `<div><div class="vj">${v}</div><div class="rr">${KH.RR_V[v]}</div>${mouthHtml(v, 90)}<div class="btns" style="justify-content:center;margin-top:6px">${sayBtn(KH.comp('ㅇ', v))}${slowBtn(KH.comp('ㅇ', v))}</div></div>`).join('')}</div>
      <div class="tip">${h(tip)}</div>
      <div class="sub">只差一個母音、意思就不一樣的單字，交替點來聽：</div>
      ${ws.map(([x, y]) => `<div class="wpair"><button data-act="say" data-t="${h(x[0])}"><b>${h(x[0])}</b><small>${h(x[1])}</small></button><span class="vs">vs</span><button data-act="say" data-t="${h(y[0])}"><b>${h(y[0])}</b><small>${h(y[1])}</small></button></div>`).join('')}
      <div class="mt"><b>錄自己的聲音比比看</b><div class="sub small">念「${h(ws[0][0][0])}、${h(ws[0][1][0])}」，再和標準發音對照。</div>${myRecHtml('p-' + a + b, ws[0][0][0] + ', ' + ws[0][1][0])}</div></div>${stepNav()}`; }
    case 'trio': return `<div class="card"><h3>三種比較：平音・送氣音・硬音</h3><div class="sub">一組一組點來聽，注意吐氣和喉嚨的感覺。手放在嘴巴前面：送氣音會感覺到風。</div>
      ${TRIOS.map(tr => `<div class="trio">${tr.map((x, i) => x ? `<button data-act="say" data-t="${x}">${x}<small>${['平音・輕', '送氣・吐氣', '硬音・繃緊'][i]}</small></button>` : '<span></span>').join('')}</div>`).join('')}</div>${stepNav()}`;
    case 'syl': { const c = SYL_CARDS[s.n]; return `<div class="card"><h3>${h(c.t)}</h3><p>${h(c.d)}</p>
      ${c.ex.map(([l, v, t]) => { const ch = KH.comp(l, v, t); return `<div class="row" style="margin:10px 0">${diagram(l, v, t)}<div class="grow"><div class="big md" style="text-align:left">${ch}</div>${rrHtml(ch)}</div>${sayBtn(ch)}</div>`; }).join('')}</div>${stepNav()}`; }
    case 'bat': { const x = s.x; return `<div class="card center"><div class="sub">收音</div><div class="big">${h(x.j)}</div><div><span class="rr" style="font-size:1.3rem">${h(x.rr)}</span></div>
      <div class="tip" style="text-align:left">${h(x.tip)}<div class="mt" style="margin-top:6px">念成這個音的收音：<b class="ko">${h(x.grp)}</b></div></div>
      <div style="text-align:left">${x.ex.map(e => koLine(e[0], e[1])).join('')}</div></div>${stepNav()}`; }
    case 'bpair': { const set = ['박','반','받','발','밤','밥','방']; return `<div class="card"><h3>聽聽看：7 種收音</h3><div class="sub">同樣是 바，加上不同收音。注意聲音最後停在哪裡。</div>
      <div class="trio">${set.map(x => `<button data-act="say" data-t="${x}">${x}<small>${h(KH.romanize(x))}</small></button>`).join('')}</div></div>${stepNav()}`; }
    case 'rule': { const x = s.x; return `<div class="card"><h3>${h(x.nm)} <span class="ko sub">${h(x.ko)}</span></h3><div class="tip">${h(x.tip)}</div>
      ${x.ex.map(e => `<div class="koline">${sayBtn(e[0], 'sm')}<div class="tx"><div class="k">${h(e[0])} → <span class="pron">[${h(KH.pronounce(e[0]))}]</span></div><div>${rrHtml(e[0])} <span class="sub">${h(e[1])}</span></div></div></div>`).join('')}</div>${stepNav()}`; }
    case 'word': { const w = s.w; return `<div class="card center"><div class="sub">單字</div><div class="big md">${h(w.ko)}</div>
      <div>${rrHtml(w.ko)} ${pronHtml(w.ko)}</div><div style="font-size:1.2rem;font-weight:700;margin-top:6px">${h(w.zh)}</div>
      <div class="btns" style="justify-content:center">${sayBtn(w.ko)}${slowBtn(w.ko)}</div></div>${stepNav()}`; }
    case 'sent': return vSentStep(s.s);
    case 'quiz': return vQuiz(s, 'ls-ans', 'ls-next');
  }
  return '';
}
function vSentStep(x) {
  const sp = U.sp && U.sp.id === x.id ? U.sp : null;
  let res = '';
  if (sp && sp.on) res = '<div class="center sub">正在聽…請念出上面的句子</div>';
  else if (sp && sp.sc != null) res = `<div class="score" style="color:${sp.sc >= 80 ? 'var(--good)' : sp.sc >= 50 ? 'var(--accent)' : 'var(--bad)'}">${sp.sc} 分</div>
      <div class="center"><b>${sp.sc >= 80 ? '완벽해요！非常好！' : sp.sc >= 50 ? '很接近了，再試一次？' : '再聽一次、慢慢念看看'}</b></div><div class="heard">聽到：${h(sp.heard)}</div>${sp.gain ? `<div class="center coin-up">+₩${sp.gain}</div>` : ''}`;
  else if (sp && sp.err) res = `<div class="center sub">${h(recErrMsg(sp.err))}</div>`;
  return `<div class="card"><div class="sub">例句</div><div class="koline" style="border:0"><div class="tx"><div class="k" style="font-size:1.45rem">${h(x.ko)}</div>
    <div>${rrHtml(x.ko)}</div>${pronHtml(x.ko) ? `<div>${pronHtml(x.ko)}</div>` : ''}<div style="font-weight:700;margin-top:4px">${h(x.zh)}</div></div></div>
    <div class="btns">${sayBtn(x.ko)}${slowBtn(x.ko)}</div></div>
  <div class="card center"><b>跟著念念看</b>${SR
    ? `<button class="mic ${sp && sp.on ? 'on' : ''}" data-act="rec" data-id="${x.id}" data-t="${h(x.ko)}" aria-label="開始跟讀">${sp && sp.on ? '■' : '🎤'}</button><div class="sub small">${sp && sp.on ? '念完會自動評分' : '按下麥克風後念出句子'}</div>`
    : `<div class="sub mt">這個瀏覽器不支援語音辨識（建議用 Chrome）。可以聽完後大聲念出來，再按下面的按鈕。</div><button class="btn mt" data-act="rec-self" data-id="${x.id}">我念完了 ✓</button>`}
    ${res}</div>${stepNav()}`;
}
function recErrMsg(e) {
  return e === 'not-allowed' || e === 'service-not-allowed' ? '麥克風被拒絕了：請在瀏覽器設定允許這個網站使用麥克風。'
    : e === 'no-speech' ? '沒有聽到聲音，再試一次？' : e === 'network' ? '語音辨識需要網路連線。' : '辨識失敗，再試一次？';
}
function vQuiz(s, ansAct, nextAct) {
  const done = s.picked != null;
  return `<div class="card"><div class="sub">小測驗</div><h3>${h(s.q)}</h3>
    ${s.show ? `<div class="big ${s.show.length > 3 ? 'md' : ''} ${s.showKo ? 'ko' : ''}">${h(s.show)}</div>` : ''}
    ${s.audio ? `<div class="center">${sayBtn(s.audio)} ${slowBtn(s.audio)}</div>` : ''}
    <div class="opts">${s.opts.map((o, i) => `<button class="opt ${s.ko ? 'ko' : ''} ${done && i === s.ans ? 'good' : ''} ${done && i === s.picked && i !== s.ans ? 'bad' : ''}" data-act="${ansAct}" data-i="${i}" ${done ? 'disabled' : ''}>${h(o)}</button>`).join('')}</div>
    ${done ? `<div class="fb ${s.picked === s.ans ? 'good' : 'bad'}">${s.picked === s.ans ? '答對了！' : '再記一下：'}${s.exp ? ' ' + h(s.exp) : ''}</div>
      ${cmpHtml(s)}<button class="btn main block mt" data-act="${nextAct}">${'下一題 →'}</button>` : ''}</div>`;
}
/** 聽力題答完後，可以一個一個聽選項比較（只限韓文選項） */
function cmpHtml(s) {
  if (!s.audio || !s.ko) return '';
  const ko = s.opts.filter(o => /^[가-힣 ]+$/.test(o));
  if (ko.length < 2) return '';
  return `<div class="cmp"><span class="lbl">比較聽聽看：</span>${ko.map(o => `<button class="btn sm" data-act="say" data-t="${h(o)}">🔊 ${h(o)}</button>`).join('')}</div>`;
}

/* ================= 錄自己的聲音（和標準發音對照） ================= */
let myMr = null;
function myRecHtml(key, ko) {
  if (!navigator.mediaDevices || !window.MediaRecorder) return '';
  const my = U.my && U.my.key === key ? U.my : null;
  if (my && my.on) return `<div class="myrec"><button class="btn alt" data-act="my-rec" data-k="${h(key)}">■ 停止錄音（錄音中…）</button></div>`;
  if (my && my.url) return `<div class="myrec"><button class="btn main" data-act="my-play">▶ 我的聲音</button><button class="btn" data-act="say" data-t="${h(ko)}">🔊 標準發音</button><button class="btn" data-act="my-rec" data-k="${h(key)}">🎙 再錄一次</button></div>`;
  return `<div class="myrec"><button class="btn" data-act="my-rec" data-k="${h(key)}">🎙 錄我的聲音來比較</button></div>`;
}
function myStop(discard) {
  if (myMr && myMr.state === 'recording') { myMr.discard = !!discard; try { myMr.stop(); } catch (e) { /* 已停止 */ } }
  myMr = null;
  if (discard && U.my) { if (U.my.url) URL.revokeObjectURL(U.my.url); U.my = null; }
}
async function myStart(key) {
  myStop(true); abortRec(); stopSpeak();
  U.my = { key, on: true }; render();
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
  catch (e) { U.my = null; render(); toast('沒辦法使用麥克風：請在瀏覽器設定允許這個網站使用麥克風'); return; }
  if (!U.my || U.my.key !== key || !U.my.on) { stream.getTracks().forEach(t => t.stop()); return; } // 等待授權時已經離開
  const mr = new MediaRecorder(stream), chunks = [];
  myMr = mr;
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    if (mr.discard || !U.my || U.my.key !== key) return;
    U.my = { key, url: URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' })) };
    bump('s'); save(); render(); ACT['my-play']();
  };
  mr.start();
  setTimeout(() => { if (myMr === mr && mr.state === 'recording') { myMr = null; mr.stop(); } }, 5000);
}
function vLesson() {
  const ls = U.ls; if (!ls) return vLearn();
  const s = ls.steps[ls.i];
  return `<div class="step-top"><button class="x" data-act="ls-quit" aria-label="離開">✕</button><div class="bar"><i style="width:${ls.i / ls.steps.length * 100}%"></i></div><span class="sub small">${ls.i + 1}/${ls.steps.length}</span></div>${vStep(s)}`;
}
function finishLesson() {
  const ls = U.ls, first = !S.done[ls.id];
  S.done[ls.id] = today();
  if (ls.L.kind === 'topic') WORDS.filter(w => w.tp === ls.L.topic).forEach(w => srsAdd(w.id));
  bump('l');
  ls.gain = earn((first ? 100 : 30) + ls.ok * 5);
  ls.first = first;
  save(); go('done');
}
function vDone() {
  const ls = U.ls; if (!ls) return vHome();
  const nx = nextLesson();
  return `<div class="card center"><div class="bounce" style="display:inline-block">${mascot(S.wear, 140, 'happy')}</div>
    <h2>完成「${h(ls.L.t)}」！</h2><div>小測驗答對 <b>${ls.ok}</b> / ${ls.n} 題</div>
    <div class="coin-up" style="font-size:1.4rem;margin-top:8px">+₩${fmt(ls.gain)}</div>
    ${ls.L.kind === 'topic' && ls.first ? '<div class="sub mt">這課的單字已經加進複習，明天會提醒你複習。</div>' : ''}
    <div class="btns">${nx ? `<button class="btn main" data-act="lesson" data-id="${nx.id}">下一課：${h(nx.t)}</button>` : ''}<button class="btn" data-act="go" data-v="learn">回到課程</button></div></div>`;
}

/* ================= 遊戲中心 ================= */
const GAMES = [
  { id: 'hear',  ic: '👂', t: '聽音辨字', d: '聽發音，選出正確的字（母音／子音／收音）' },
  { id: 'build', ic: '🧩', t: '聽音組字', d: '聽到一個字，自己拼出來' },
  { id: 'match', ic: '🃏', t: '字母配對', d: '翻牌找出字母和拼音' },
  { id: 'quick', ic: '⏱️', t: '單字快問快答', d: '60 秒內答對越多越好' },
  { id: 'order', ic: '🧱', t: '句子排列', d: '聽句子，排出正確順序' },
];
const GAME_FIRST = 50, GAME_DONE = 30, GAME_OK = 10;
function vGames() {
  return `<h2 class="mt">遊戲</h2><div class="sub">每答對一題 ₩${GAME_OK}；每種遊戲每天第一次玩完再送 ₩${GAME_FIRST}。</div>
  <div class="tile-grid mt">${GAMES.map(g => `<button class="tile" data-act="game" data-id="${g.id}"><span class="ic">${g.ic}</span><b>${h(g.t)}</b>
    <span class="sub small">${h(g.d)}</span>${S.best[g.id] ? `<span class="small">最佳：${S.best[g.id]}</span>` : ''}${S.day.games[g.id] ? '<span class="small" style="color:var(--good)">今天已玩 ✓</span>' : ''}</button>`).join('')}</div>`;
}
const CONS_GRP = [['ㄱ','ㅋ','ㄲ'], ['ㄷ','ㅌ','ㄸ'], ['ㅂ','ㅍ','ㅃ'], ['ㅈ','ㅊ','ㅉ'], ['ㅅ','ㅆ','ㅎ'], ['ㄴ','ㅁ','ㄹ']];
const VOW_POOL = ['ㅏ','ㅓ','ㅗ','ㅜ','ㅡ','ㅣ','ㅑ','ㅕ','ㅛ','ㅠ','ㅐ','ㅘ','ㅝ','ㅟ','ㅢ'];
const VOW_PAIR = { 'ㅓ':'ㅗ','ㅗ':'ㅓ','ㅜ':'ㅡ','ㅡ':'ㅜ','ㅕ':'ㅛ','ㅛ':'ㅕ','ㅏ':'ㅓ','ㅣ':'ㅢ','ㅢ':'ㅣ','ㅑ':'ㅕ','ㅠ':'ㅛ','ㅐ':'ㅏ','ㅘ':'ㅝ','ㅝ':'ㅘ','ㅟ':'ㅢ' };
function hearQ(mode) {
  if (mode === 'v') {
    const l = pick(['ㅇ','ㄱ','ㄴ','ㅁ','ㅂ','ㅅ']), v = pick(VOW_POOL);
    const vs = uniq([v, VOW_PAIR[v], ...shuffle(VOW_POOL)]).slice(0, 4);
    return mkQuiz({ q: '聽聽看，是哪一個？', audio: KH.comp(l, v), ans: KH.comp(l, v), wrong: vs.slice(1).map(x => KH.comp(l, x)), ko: true, exp: `母音 ${v}（${KH.RR_V[v]}）` });
  }
  if (mode === 'c') {
    const g = pick(CONS_GRP), l = pick(g), v = pick(['ㅏ','ㅓ','ㅗ','ㅜ','ㅣ']);
    const ls = uniq([...g, pick(SIMPLE_L)]).slice(0, 4);
    return mkQuiz({ q: '聽聽看，是哪一個？', audio: KH.comp(l, v), ans: KH.comp(l, v), wrong: ls.filter(x => x !== l).map(x => KH.comp(x, v)), ko: true, exp: `子音 ${l}（${KH.romanize(KH.comp(l, v))}）` });
  }
  const l = pick(['ㅂ','ㄱ','ㅁ','ㅅ','ㄴ','ㄷ']), v = pick(['ㅏ','ㅓ','ㅗ','ㅜ','ㅣ']);
  const fs = shuffle(BATCHIM.map(b => b.j)).slice(0, 4), ans = KH.comp(l, v, fs[0]);
  return mkQuiz({ q: '聽收音，是哪一個？', audio: ans, ans, wrong: fs.slice(1).map(t => KH.comp(l, v, t)), ko: true, exp: `收音 ${fs[0]}（${KH.romanize(ans)}）` });
}
function buildQ() {
  const s = randSyl(Math.random() < .6), grp = CONS_GRP.find(g => g.includes(s.l));
  const rowL = shuffle(uniq([s.l, ...(grp ? shuffle(grp) : []), ...shuffle(SIMPLE_L)]).slice(0, 4));
  const rowV = shuffle(uniq([s.v, VOW_PAIR[s.v] || 'ㅓ', ...shuffle(SIMPLE_V)]).slice(0, 4));
  const rowT = shuffle(uniq([s.t, '', ...shuffle(SIMPLE_T)]).slice(0, 4));
  return { s, ch: sylStr(s), rows: { l: rowL, v: rowV, t: rowT }, sel: { l: null, v: null, t: null }, res: null };
}
function startGame(id, mode) {
  abortRec(); stopQuick();
  const g = { id, i: 0, ok: 0, n: 0, mode };
  if (id === 'hear') { if (!mode) { U.g = { id, pickMode: true }; go('game'); return; } g.qs = Array.from({ length: 10 }, () => hearQ(mode)); }
  if (id === 'build') g.qs = Array.from({ length: 8 }, buildQ);
  if (id === 'match') {
    const ls = shuffle(ALL_LETTERS.filter(x => !/[/（]/.test(x.rr))).slice(0, 6);
    g.cards = shuffle(ls.flatMap((x, k) => [{ t: x.j, k, ko: true }, { t: x.rr, k }]));
    g.open = []; g.got = []; g.tries = 0; g.n = 6;
  }
  if (id === 'quick') { g.left = 60; g.q = quickQ(); g.n = 0; }
  if (id === 'order') {
    g.qs = shuffle(SENTS.filter(s => s.ko.split(' ').length >= 3)).slice(0, 6).map(s => ({ s, chips: shuffle(s.ko.split(' ').map((w, i) => ({ w, i }))), put: [], res: null }));
  }
  U.g = g; go('game');
  if (id === 'quick') startQuick();
}
function quickQ() {
  const w = pick(WORDS);
  return mkQuiz({ q: '這個單字是什麼意思？', show: w.ko, showKo: true, audio: w.ko, ans: w.zh, wrong: others(uniq(WORDS.map(x => x.zh)), w.zh, 3), exp: `${w.ko}＝${w.zh}` });
}
let quickTm = 0;
function startQuick() {
  stopQuick();
  quickTm = setInterval(() => {
    const g = U.g; if (!g || g.id !== 'quick' || U.view !== 'game') { stopQuick(); return; }
    g.left--; const el = $('#timer'); if (el) el.textContent = g.left + ' 秒';
    if (g.left <= 0) { stopQuick(); endGame(); }
  }, 1000);
}
function stopQuick() { clearInterval(quickTm); quickTm = 0; }
function endGame() {
  const g = U.g; stopQuick();
  const first = !S.day.games[g.id];
  S.day.games[g.id] = 1;
  const score = g.ok;
  if (!S.best[g.id] || score > S.best[g.id]) S.best[g.id] = score;
  bump('g');
  g.gain = earn(g.ok * GAME_OK + GAME_DONE + (first ? GAME_FIRST : 0));
  g.first = first; g.end = true;
  save(); render();
}
function gameHead(g, extra) {
  const meta = GAMES.find(x => x.id === g.id);
  const total = g.qs ? g.qs.length : g.n;
  return `<div class="step-top"><button class="x" data-act="g-quit" aria-label="離開">✕</button><b class="grow">${meta.ic} ${h(meta.t)}</b>${extra || `<span class="sub">${Math.min(g.i + 1, total)}/${total}</span>`}</div>`;
}
function vGame() {
  const g = U.g; if (!g) return vGames();
  if (g.pickMode) return `${gameHead({ id: g.id, i: 0, n: 0 }, ' ')}<div class="card"><h3>選擇要練習的部分</h3><div class="tile-grid">
      <button class="tile" data-act="game" data-id="hear" data-m="v"><span class="ic ko">ㅓ ㅗ</span><b>母音</b><span class="sub small">어/오、우/으 分得出來嗎？</span></button>
      <button class="tile" data-act="game" data-id="hear" data-m="c"><span class="ic ko">가 카 까</span><b>子音</b><span class="sub small">平音・送氣音・硬音</span></button>
      <button class="tile" data-act="game" data-id="hear" data-m="b"><span class="ic ko">밥 방</span><b>收音</b><span class="sub small">7 種收音</span></button></div></div>`;
  if (g.end) return `<div class="card center"><div class="bounce" style="display:inline-block">${mascot(S.wear, 130, 'happy')}</div><h2>遊戲結束！</h2>
      <div style="font-size:1.2rem">${g.id === 'match' ? `翻了 <b>${g.tries}</b> 次找到 6 對` : `答對 <b>${g.ok}</b>${g.id === 'quick' ? ' 題' : ' / ' + (g.qs ? g.qs.length : g.n) + ' 題'}`}</div>
      <div class="coin-up" style="font-size:1.4rem;margin-top:8px">+₩${fmt(g.gain)}${g.first ? `<div class="sub small">（含今天第一次玩 ₩${GAME_FIRST}）</div>` : ''}</div>
      <div class="btns"><button class="btn main" data-act="game" data-id="${g.id}" ${g.mode ? `data-m="${g.mode}"` : ''}>再玩一次</button><button class="btn" data-act="go" data-v="games">其他遊戲</button></div></div>`;
  if (g.id === 'hear') return gameHead(g) + vQuiz(g.qs[g.i], 'g-ans', 'g-next');
  if (g.id === 'quick') return gameHead(g, `<span class="timer" id="timer">${g.left} 秒</span>`) + `<div class="sub center">答對 ${g.ok} 題</div>` + vQuiz(g.q, 'g-ans', 'g-next');
  if (g.id === 'match') return gameHead(g, `<span class="sub">找到 ${g.got.length}/6</span>`) + `<div class="sub mb">翻兩張牌，找出字母和它的羅馬拼音。</div>
    <div class="mgrid">${g.cards.map((c, i) => { const on = g.open.includes(i) || g.got.includes(c.k);
      return `<button class="mcard ${on ? 'open' : ''} ${g.got.includes(c.k) ? 'done' : ''} ${c.ko && on ? 'ko' : ''}" data-act="m-flip" data-i="${i}" ${g.got.includes(c.k) ? 'disabled' : ''}>${on ? h(c.t) : '?'}</button>`; }).join('')}</div>`;
  if (g.id === 'build') {
    const q = g.qs[g.i], cur = KH.comp(q.sel.l || 'ㅇ', q.sel.v || 'ㅏ', q.sel.t || '');
    const row = (k, nm) => `<h3 class="mt">${nm}</h3><div class="jamo">${q.rows[k].map(j => `<button class="${q.sel[k] === j ? 'on' : ''} ${j ? '' : 'none'}" data-act="b-pick" data-k="${k}" data-j="${j}" ${q.res ? 'disabled' : ''}>${j || '無'}</button>`).join('')}</div>`;
    const ready = q.sel.l && q.sel.v && q.sel.t !== null;
    return gameHead(g) + `<div class="card center"><h3>聽到的是哪個字？自己拼出來</h3>${sayBtn(q.ch)} ${slowBtn(q.ch)}
      <div class="big">${q.sel.l && q.sel.v ? h(cur) : '?'}</div></div>
      <div class="card">${row('l', '子音')}${row('v', '母音')}${row('t', '收音')}
      ${q.res ? `<div class="fb ${q.res === 'ok' ? 'good' : 'bad'}">${q.res === 'ok' ? '答對了！' : '正確答案是'} <span class="ko">${h(q.ch)}</span>（${h(KH.romanize(q.ch))}）</div><button class="btn main block mt" data-act="g-next">下一題 →</button>`
        : `<button class="btn main block mt" data-act="b-check" ${ready ? '' : 'disabled'}>確認</button>`}</div>`;
  }
  if (g.id === 'order') {
    const q = g.qs[g.i];
    return gameHead(g) + `<div class="card"><h3>${h(q.s.zh)}</h3><div>${sayBtn(q.s.ko)} ${slowBtn(q.s.ko)}</div>
      <div class="sub mt">點下面的詞，依序排成句子（點上面的詞可以拿回來）：</div>
      <div class="chips ans mt">${q.put.map((c, k) => `<button class="chip" data-act="o-back" data-k="${k}" ${q.res ? 'disabled' : ''}>${h(c.w)}</button>`).join('')}</div>
      <div class="chips mt">${q.chips.map((c, k) => `<button class="chip" data-act="o-put" data-k="${k}" ${q.res ? 'disabled' : ''}>${h(c.w)}</button>`).join('')}</div>
      ${q.res ? `<div class="fb ${q.res === 'ok' ? 'good' : 'bad'}">${q.res === 'ok' ? '答對了！' : '正確順序：'} <span class="ko">${h(q.s.ko)}</span></div><button class="btn main block mt" data-act="g-next">下一題 →</button>`
        : `<button class="btn main block mt" data-act="o-check" ${q.chips.length ? 'disabled' : ''}>確認</button>`}</div>`;
  }
  return '';
}

/* ================= 複習與單字本 ================= */
function startReview(free) {
  let ids = due();
  if (free) ids = shuffle(Object.keys(S.srs).filter(id => WORD[id])).slice(0, 10);
  ids = shuffle(ids).slice(0, 20);
  U.rv = { ids, i: 0, show: false, ok: 0, free: !!free, gain: 0 };
  go('review');
}
function vReview() {
  const rv = U.rv;
  if (!rv) {
    const d = due().length, n = Object.keys(S.srs).filter(id => WORD[id]).length;
    return `<h2 class="mt">複習</h2><div class="card center">${mascot(S.wear, 100, d ? 'think' : 'happy')}
      ${d ? `<h3>今天有 ${d} 個單字要複習</h3><button class="btn main block" data-act="review">開始複習</button>`
        : n ? '<h3>今天的複習都完成了 🎉</h3><div class="sub">想多練習可以自由複習（不影響複習排程）。</div>' : '<h3>還沒有單字</h3><div class="sub">完成「生活主題」的課程後，單字會加進這裡。</div>'}
      ${n && !d ? '<button class="btn block mt" data-act="review-free">自由複習 10 個字</button>' : ''}</div>
      <button class="btn block" data-act="go" data-v="words">📒 單字本（${n} 個）</button>`;
  }
  if (rv.i >= rv.ids.length) return `<div class="card center">${mascot(S.wear, 120, 'happy')}<h2>複習完成！</h2>
      <div>記得 <b>${rv.ok}</b> / ${rv.ids.length} 個</div><div class="coin-up mt">+₩${fmt(rv.gain)}</div>
      <button class="btn main block mt" data-act="rv-close">好的</button></div>`;
  const w = WORD[rv.ids[rv.i]];
  return `<div class="step-top"><button class="x" data-act="rv-close" aria-label="離開">✕</button><div class="bar"><i style="width:${rv.i / rv.ids.length * 100}%"></i></div><span class="sub small">${rv.i + 1}/${rv.ids.length}</span></div>
  <div class="card center"><div class="big md">${h(w.ko)}</div><div class="btns" style="justify-content:center">${sayBtn(w.ko)}${slowBtn(w.ko)}</div>
    ${rv.show ? `<div class="mt">${rrHtml(w.ko)} ${pronHtml(w.ko)}</div><div style="font-size:1.3rem;font-weight:800;margin-top:6px">${h(w.zh)}</div>
      <div class="btns"><button class="btn" data-act="rv-ans" data-ok="0">還不熟 🤔</button><button class="btn main" data-act="rv-ans" data-ok="1">記得 ✓</button></div>`
      : `<div class="sub mt">先想一想意思，再看答案</div><button class="btn main block mt" data-act="rv-show">看答案</button>`}</div>`;
}
function vWords() {
  const st = id => { const r = S.srs[id]; return !r ? '' : r.m ? '<span class="small" style="color:var(--good);font-weight:700">已熟練</span>' : `<span class="small sub">Lv ${r.l}</span>`; };
  return `<div class="step-top"><button class="x" data-act="go" data-v="review" aria-label="返回">←</button><h2 style="margin:0">單字本</h2></div>
  ${TOPICS.map(tp => `<div class="card"><h3>${tp.ic} ${h(tp.t)} ${S.done['t-' + tp.id] ? '' : '<span class="sub small">（還沒學）</span>'}</h3>
    ${WORDS.filter(w => w.tp === tp.id).map(w => koLine(w.ko, w.zh, st(w.id))).join('')}</div>`).join('')}`;
}

/* ================= 我的：商店、紀錄、設定 ================= */
const SKIN_SW = { fresh:['#F3F6FB','#FF7A45','#3B82F6'], night:['#10141D','#FF925E','#6EA8FF'], hanji:['#EFE6D6','#B8412C','#2F6F5E'],
  sakura:['#FFF0F4','#E8578A','#7C6CF2'], notebook:['#FBFAF3','#2B6CB0','#D9534F'], neon:['#0B0820','#FF4FD8','#33E1FF'] };
function itemPreview(it) {
  const [cat, key] = it.id.split(':');
  if (cat === 'skin') { const c = SKIN_SW[key]; return `<div class="swatch" style="background:${c[0]};border:1px solid var(--line)"><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></div>`; }
  const w = { [cat]: key }; if (cat !== 'bg') w.bg = S.wear.bg;
  return mascot(w, 84);
}
function vShop() {
  const items = SHOP.filter(it => it.cat === U.shopCat);
  return `<div class="cats">${SHOP_CATS.map(([c, nm]) => `<button class="${U.shopCat === c ? 'on' : ''}" data-act="shop-cat" data-c="${c}">${nm}</button>`).join('')}</div>
  <div class="shop">${items.map(it => {
    const [cat, key] = it.id.split(':'), have = owned(it.id);
    const using = cat === 'skin' ? S.skin === key : S.wear[cat] === key;
    let btn;
    if (have) btn = `<button class="btn sm ${using ? '' : 'main'}" data-act="wear" data-id="${it.id}">${cat === 'skin' ? (using ? '使用中' : '使用') : (using ? '脫下' : '穿上')}</button>`;
    else if (S.coins < it.price) btn = `<button class="btn sm" disabled>₩${fmt(it.price)}・還差 ${fmt(it.price - S.coins)}</button>`;
    else btn = `<button class="btn sm ${U.arm === it.id ? 'alt' : 'main'}" data-act="buy" data-id="${it.id}">${U.arm === it.id ? '確定購買？' : '₩' + fmt(it.price)}</button>`;
    return `<div class="item">${itemPreview(it)}<div class="nm">${h(it.nm)}</div>${btn}</div>`; }).join('')}</div>`;
}
function vStats() {
  const days = Object.keys(S.log).filter(d => Object.values(S.log[d]).some(v => v > 0)).length;
  const sum = k => Object.values(S.log).reduce((a, lg) => a + (lg[k] || 0), 0);
  const ids = Object.keys(S.srs).filter(id => WORD[id]);
  return `<div class="stat"><div><b>${streakNow()}</b>連續天數</div><div><b>${S.streak.best}</b>最長連續</div><div><b>${days}</b>累計學習天數</div>
    <div><b>${LESSONS.filter(L => S.done[L.id]).length}/${LESSONS.length}</b>完成課程</div><div><b>${ids.length}</b>學過的單字</div>
    <div><b>${ids.filter(id => S.srs[id].m).length}</b>熟練的單字</div><div><b>${sum('s')}</b>跟讀次數</div><div><b>${sum('g')}</b>玩過的遊戲</div>
    <div><b>₩${fmt(S.earned)}</b>累計賺到</div></div>
    <h3 class="mt">最近 14 天</h3><div style="display:grid;grid-template-columns:repeat(14,1fr);gap:4px">${Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 13 + i); const lg = S.log[dstr(d)] || {}; const n = Object.values(lg).reduce((a, b) => a + b, 0);
      return `<div title="${dstr(d)}" style="aspect-ratio:1;border-radius:4px;background:${n ? `color-mix(in srgb, var(--accent) ${Math.min(100, 30 + n * 10)}%, var(--card))` : 'var(--chip)'}"></div>`; }).join('')}</div>`;
}
function vSettings() {
  const seg = (act, cur, opts) => `<div class="seg">${opts.map(([v, nm]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-act="${act}" data-v="${v}">${nm}</button>`).join('')}</div>`;
  const skins = SHOP.filter(it => it.cat === 'skin' && owned(it.id)).map(it => [it.id.split(':')[1], it.nm]);
  return `<div class="set-row"><span>介面風格</span>${seg('set-skin', S.skin, skins)}</div>
  <div class="set-row"><span>羅馬拼音</span>${seg('set-rr', S.set.rr, [['show', '顯示'], ['tap', '點一下才看'], ['hide', '不顯示']])}</div>
  <div class="set-row"><span>實際發音 [ ]</span>${seg('set-pron', S.set.pron ? 1 : 0, [[1, '顯示'], [0, '不顯示']])}</div>
  <div class="set-row"><span>語速</span>${seg('set-rate', S.set.rate, [[0.7, '慢'], [0.9, '標準'], [1.05, '快']])}</div>
  <div class="set-row"><span>自動播放發音</span>${seg('set-auto', S.set.auto ? 1 : 0, [[1, '開'], [0, '關']])}</div>
  <div class="set-row"><span>韓文聲音</span>${koVoices.length ? `<select data-chg="voice">${koVoices.map(v => `<option value="${h(v.voiceURI)}" ${pickVoice() === v ? 'selected' : ''}>${h(v.name)}</option>`).join('')}</select>`
    : '<span class="sub small">找不到韓文語音（可在手機「文字轉語音」設定加裝）</span>'}<button class="btn sm" data-act="say" data-t="안녕하세요. 만나서 반가워요.">試聽</button></div>
  <div class="set-row"><span>進度備份<div class="sub small">進度只存在這台裝置的瀏覽器裡，換手機前記得備份。</div></span>
    <button class="btn sm" data-act="export">下載備份</button><button class="btn sm" data-act="import">匯入備份</button></div>
  <div class="set-row"><span>重新開始<div class="sub small">清除所有進度、點數與獎品</div></span><button class="btn sm ${U.arm === 'reset' ? 'alt' : ''}" data-act="reset">${U.arm === 'reset' ? '再按一次確定清除' : '清除進度'}</button></div>`;
}
function vMe() {
  const tabs = [['shop', '🎁 商店'], ['stats', '📊 紀錄'], ['set', '⚙️ 設定']];
  return `<div class="card center">${mascot(S.wear, 130)}<div class="mt"><b>호야</b> <span class="sub">的點數</span> <span class="coin-up">₩${fmt(S.coins)}</span></div>
    <div class="sub small">上課、玩遊戲、複習、完成任務都能賺點數</div></div>
  <div class="cats">${tabs.map(([t, nm]) => `<button class="${U.meTab === t ? 'on' : ''}" data-act="me-tab" data-t="${t}">${nm}</button>`).join('')}</div>
  <div class="card">${U.meTab === 'shop' ? vShop() : U.meTab === 'stats' ? vStats() : vSettings()}</div>`;
}

/* ================= 彈出視窗 ================= */
function vSheet() {
  const p = U.pops[0]; if (!p) return '';
  return `<div class="box" role="dialog" aria-modal="true"><div style="font-size:2.4rem">${p.ic || '🎉'}</div>${p.mood ? mascot(S.wear, 100, p.mood) : ''}
    <h2>${h(p.t)}</h2><p>${h(p.x)}</p><button class="btn main block" data-act="pop-ok">好的</button></div>`;
}

/* ================= 繪製 ================= */
const VIEWS = { home: vHome, learn: vLearn, chart: vChart, builder: vBuilder, lesson: vLesson, done: vDone, games: vGames, game: vGame,
  review: vReview, words: vWords, me: vMe };
const TAB_OF = { home: 'home', learn: 'learn', chart: 'learn', builder: 'learn', lesson: 'learn', done: 'learn', games: 'games', game: 'games', review: 'review', words: 'review', me: 'me' };
const TABS = [['home', '🏠', '首頁'], ['learn', '📘', '學習'], ['games', '🎮', '遊戲'], ['review', '📇', '複習'], ['me', '🐯', '我的']];
function applySkin() {
  document.body.dataset.skin = S.skin;
  const m = document.querySelector('meta[name=theme-color]');
  if (m) m.content = (SKIN_SW[S.skin] || SKIN_SW.fresh)[0];
}
function render() {
  resetDay(); applySkin();
  $('#main').innerHTML = (VIEWS[U.view] || vHome)();
  const tab = TAB_OF[U.view];
  $('#tabs .in').innerHTML = TABS.map(([v, i, nm]) => `<button class="${tab === v ? 'on' : ''}" data-act="go" data-v="${v}"><span class="i">${i}</span>${nm}</button>`).join('');
  $('#top .in').innerHTML = `<div class="brand">${mascot(S.wear, 34)}<span class="ko">호야</span> 韓語</div>
    <button class="pill" data-act="go" data-v="me" data-tab="stats" aria-label="連續天數">🔥 ${streakNow()}</button>${coinPill()}`;
  const sh = $('#sheet'); const html = vSheet();
  sh.innerHTML = html; sh.classList.toggle('hide', !html);
}
function go(v) {
  abortRec(); stopSpeak();
  if (v !== 'game') stopQuick();
  U.sp = null; U.arm = ''; myStop(true);
  U.view = v; render(); window.scrollTo(0, 0);
  autoPlay();
}
/** 進入新步驟時自動播放（設定可關） */
function autoPlay() {
  if (!S.set.auto) return;
  let t = null;
  if (U.view === 'lesson' && U.ls) {
    const s = U.ls.steps[U.ls.i];
    t = s.k === 'letter' ? s.x.say : s.k === 'word' ? s.w.ko : s.k === 'sent' ? s.s.ko : s.k === 'quiz' && s.picked == null ? s.audio : null;
  } else if (U.view === 'game' && U.g && !U.g.end) {
    const g = U.g;
    if (g.id === 'hear' && g.qs) t = g.qs[g.i].picked == null ? g.qs[g.i].audio : null;
    else if (g.id === 'quick' && g.q) t = g.q.picked == null ? g.q.audio : null;
    else if (g.id === 'build' && g.qs) t = g.qs[g.i].res ? null : g.qs[g.i].ch;
    else if (g.id === 'order' && g.qs) t = g.qs[g.i].res ? null : g.qs[g.i].s.ko;
  } else if (U.view === 'review' && U.rv && U.rv.i < U.rv.ids.length && !U.rv.show) t = WORD[U.rv.ids[U.rv.i]].ko;
  if (t) setTimeout(() => speak(t), 250);
}

/* ================= 動作 ================= */
const ACT = {
  go: d => { if (d.tab) U.meTab = d.tab; if (d.v === 'review') U.rv = null; go(d.v); },
  say: d => speak(d.t, d.r ? Number(d.r) : null),
  rrshow: (d, el) => el.classList.remove('tap'),
  lesson: d => startLesson(d.id),
  'ls-next': () => {
    const ls = U.ls, s = ls.steps[ls.i];
    if (s.k === 'quiz' && s.picked == null) return;
    if (ls.i >= ls.steps.length - 1) { finishLesson(); return; }
    ls.i++; U.sp = null; abortRec(); myStop(true); render(); window.scrollTo(0, 0); autoPlay();
  },
  'ls-prev': () => { const ls = U.ls; let i = ls.i - 1; while (i > 0 && ls.steps[i].k === 'quiz') i--; ls.i = Math.max(1, i); U.sp = null; abortRec(); myStop(true); render(); autoPlay(); },
  'ls-quit': () => { U.ls = null; go('learn'); },
  'ls-ans': d => {
    const s = U.ls.steps[U.ls.i]; if (s.picked != null) return;
    s.picked = Number(d.i); U.ls.n++; if (s.picked === s.ans) U.ls.ok++;
    render();
  },
  rec: d => {
    if (U.sp && U.sp.on) { abortRec(); U.sp = null; render(); return; }
    myStop(true); U.sp = { id: d.id, on: true };
    render();
    startRec(d.t, (best, err) => {
      if (!U.sp || U.sp.id !== d.id) return;
      if (!best) { U.sp = { id: d.id, err }; render(); return; }
      resetDay(); bump('s');
      let gain = 0;
      if (best.sc >= 80 && !S.day.spk[d.id]) { S.day.spk[d.id] = 1; gain = earn(20); }
      U.sp = { id: d.id, sc: best.sc, heard: best.heard, gain };
      save(); render();
    });
  },
  'my-rec': d => {
    if (U.my && U.my.key === d.k && U.my.on) { if (myMr) { const m = myMr; myMr = null; m.stop(); } else { U.my = null; render(); } return; }
    myStart(d.k);
  },
  'my-play': () => { if (U.my && U.my.url) { stopSpeak(); const a = new Audio(U.my.url); a.play().catch(() => toast('播放失敗，再錄一次看看')); } },
  'rec-self': d => { bump('s'); save(); toast('很棒！再多念幾次會更順'); U.sp = { id: d.id }; render(); },
  game: d => startGame(d.id, d.m),
  'g-quit': () => { stopQuick(); U.g = null; go('games'); },
  'g-ans': d => {
    const g = U.g, q = g.id === 'quick' ? g.q : g.qs[g.i]; if (q.picked != null) return;
    q.picked = Number(d.i);
    if (q.picked === q.ans) g.ok++;
    if (g.id === 'quick') { g.n++; if (q.picked === q.ans) { g.q = quickQ(); render(); autoPlay(); return; } }
    render();
  },
  'g-next': () => {
    const g = U.g;
    if (g.id === 'quick') { g.q = quickQ(); render(); autoPlay(); return; }
    if (g.i >= g.qs.length - 1) { endGame(); return; }
    g.i++; render(); window.scrollTo(0, 0); autoPlay();
  },
  'm-flip': d => {
    const g = U.g, i = Number(d.i);
    if (g.open.length >= 2 || g.open.includes(i) || g.got.includes(g.cards[i].k)) return;
    g.open.push(i);
    if (g.cards[i].ko) speak(ALL_LETTERS.find(x => x.j === g.cards[i].t).say);
    if (g.open.length === 2) {
      g.tries++;
      const [a, b] = g.open.map(x => g.cards[x]);
      if (a.k === b.k) { g.got.push(a.k); g.ok++; g.open = []; if (g.got.length === 6) { render(); setTimeout(endGame, 500); return; } }
      else { render(); setTimeout(() => { if (U.g === g) { g.open = []; render(); } }, 900); return; }
    }
    render();
  },
  'b-pick': d => { const q = U.g.qs[U.g.i]; if (q.res) return; q.sel[d.k] = d.j; render(); },
  'b-check': () => {
    const g = U.g, q = g.qs[g.i]; if (q.res) return;
    q.res = KH.comp(q.sel.l, q.sel.v, q.sel.t) === q.ch ? 'ok' : 'ng';
    if (q.res === 'ok') g.ok++;
    render();
  },
  'o-put': d => { const q = U.g.qs[U.g.i]; q.put.push(q.chips.splice(Number(d.k), 1)[0]); render(); },
  'o-back': d => { const q = U.g.qs[U.g.i]; q.chips.push(q.put.splice(Number(d.k), 1)[0]); render(); },
  'o-check': () => {
    const g = U.g, q = g.qs[g.i]; if (q.res || q.chips.length) return;
    q.res = q.put.map(c => c.w).join(' ') === q.s.ko ? 'ok' : 'ng';
    if (q.res === 'ok') g.ok++;
    render();
  },
  review: () => startReview(false),
  'review-free': () => startReview(true),
  'rv-show': () => { U.rv.show = true; render(); },
  'rv-ans': d => {
    const rv = U.rv, id = rv.ids[rv.i], ok = d.ok === '1';
    if (!rv.free) srsAnswer(id, ok);
    if (ok) rv.ok++;
    rv.gain += earn(10); bump('r');
    rv.i++; rv.show = false; save(); render(); autoPlay();
  },
  'rv-close': () => { U.rv = null; go('review'); },
  checkin: () => {
    resetDay();
    if (S.day.checkin) return;
    if (!practicedToday()) { toast('今天先練習一下（上課、遊戲或複習），再來簽到！'); return; }
    S.day.checkin = 1; earn(CHECKIN_COIN); save();
    U.pops.push({ ic: '📅', t: '簽到成功！', x: `+₩${CHECKIN_COIN}，明天也要來喔！`, mood: 'happy' }); render();
  },
  task: d => {
    resetDay();
    const t = TASKS.find(x => x.id === d.id), lg = S.log[today()] || {};
    if (!t || S.day.tasks[t.id] || t.get(lg) < t.n) return;
    S.day.tasks[t.id] = 1; let c = earn(TASK_COIN);
    if (TASKS.every(x => S.day.tasks[x.id])) c += earn(TASK_ALL);
    save();
    U.pops.push({ ic: '✅', t: '任務完成！', x: `+₩${c}${c > TASK_COIN ? '（三個任務全部完成，加送 ₩' + TASK_ALL + '）' : ''}`, mood: 'happy' }); render();
  },
  'pop-ok': () => { U.pops.shift(); render(); },
  'me-tab': d => { U.meTab = d.t; U.arm = ''; render(); },
  'shop-cat': d => { U.shopCat = d.c; U.arm = ''; render(); },
  buy: d => {
    const it = SHOP.find(x => x.id === d.id);
    if (!it || owned(it.id) || S.coins < it.price) return;
    if (U.arm !== it.id) { U.arm = it.id; render(); return; }
    U.arm = ''; S.coins -= it.price; S.own[it.id] = today();
    ACT.wear({ id: it.id }, null, true);
    U.pops.push({ ic: '🎁', t: `買到「${it.nm}」了！`, x: it.cat === 'skin' ? '已經換上新的介面風格。' : '已經幫호야換上了。', mood: 'happy' });
    save(); render();
  },
  wear: (d, el, quiet) => {
    const [cat, key] = d.id.split(':'); if (!owned(d.id)) return;
    if (cat === 'skin') S.skin = key; else S.wear[cat] = S.wear[cat] === key && !quiet ? '' : key;
    save(); if (!quiet) render();
  },
  'set-skin': d => { if (owned('skin:' + d.v)) { S.skin = d.v; save(); render(); } },
  'set-rr': d => { S.set.rr = d.v; save(); render(); },
  'set-pron': d => { S.set.pron = d.v === '1'; save(); render(); },
  'set-rate': d => { S.set.rate = Number(d.v); save(); render(); speak('안녕하세요'); },
  'set-auto': d => { S.set.auto = d.v === '1'; save(); render(); },
  export: () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hoya-korean-${today()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import: () => $('#file').click(),
  reset: () => {
    if (U.arm !== 'reset') { U.arm = 'reset'; render(); return; }
    S = newProg(); save(); U.arm = ''; U.ls = U.g = U.rv = null; toast('已清除所有進度'); go('home');
  },
  'bd': d => { U.bd[d.k] = d.j; render(); speak(KH.comp(U.bd.l, U.bd.v, U.bd.t)); },
  'bd-rand': () => { const s = randSyl(Math.random() < .5); U.bd = s; render(); speak(sylStr(s)); },
  'bd-more': () => { U.moreT = !U.moreT; render(); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('change', e => {
  if (e.target.dataset.chg === 'voice') { S.set.voice = e.target.value; save(); speak('안녕하세요'); }
  if (e.target.id === 'file' && e.target.files[0]) {
    const f = e.target.files[0], rd = new FileReader();
    rd.onload = () => {
      try {
        const o = JSON.parse(rd.result);
        if (!o || typeof o !== 'object' || o.v !== 1) throw new Error('bad');
        S = migrate(o); save(); toast('已匯入備份'); go('home');
      } catch (err) { toast('這個檔案不是호야韓語的備份'); }
      e.target.value = '';
    };
    rd.readAsText(f);
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { abortRec(); stopSpeak(); if (U.my && U.my.on) { myStop(true); render(); } if (U.sp && U.sp.on) { U.sp = null; render(); } } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && U.pops.length) ACT['pop-ok'](); });

/* ================= 啟動 ================= */
function boot() {
  document.body.classList.add('side');
  resetDay(); render();
}
boot();
