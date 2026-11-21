/* 韓文字母工具：組字、拆字、實際發音、羅馬拼音（韓國文化觀光部 2000 年標準，依實際發音標注）、跟讀比對
 * 瀏覽器裡是 window.KH，Node 測試用 require('./js/hangul.js')。 */
(function (root) {
  'use strict';
  const L = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const V = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
  const T = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  // 雙收音拆成兩個
  const SPLIT = { 'ㄳ':['ㄱ','ㅅ'], 'ㄵ':['ㄴ','ㅈ'], 'ㄶ':['ㄴ','ㅎ'], 'ㄺ':['ㄹ','ㄱ'], 'ㄻ':['ㄹ','ㅁ'], 'ㄼ':['ㄹ','ㅂ'],
    'ㄽ':['ㄹ','ㅅ'], 'ㄾ':['ㄹ','ㅌ'], 'ㄿ':['ㄹ','ㅍ'], 'ㅀ':['ㄹ','ㅎ'], 'ㅄ':['ㅂ','ㅅ'] };
  // 收音的 7 個代表音
  const REP = { 'ㄱ':'ㄱ','ㄲ':'ㄱ','ㅋ':'ㄱ','ㄳ':'ㄱ','ㄺ':'ㄱ', 'ㄴ':'ㄴ','ㄵ':'ㄴ','ㄶ':'ㄴ',
    'ㄷ':'ㄷ','ㅅ':'ㄷ','ㅆ':'ㄷ','ㅈ':'ㄷ','ㅊ':'ㄷ','ㅌ':'ㄷ','ㅎ':'ㄷ',
    'ㄹ':'ㄹ','ㄼ':'ㄹ','ㄽ':'ㄹ','ㄾ':'ㄹ','ㅀ':'ㄹ', 'ㅁ':'ㅁ','ㄻ':'ㅁ', 'ㅂ':'ㅂ','ㅍ':'ㅂ','ㅄ':'ㅂ','ㄿ':'ㅂ', 'ㅇ':'ㅇ' };
  const ASP = { 'ㄱ':'ㅋ','ㄷ':'ㅌ','ㅂ':'ㅍ','ㅈ':'ㅊ' };
  const TENSE = { 'ㄱ':'ㄲ','ㄷ':'ㄸ','ㅂ':'ㅃ','ㅅ':'ㅆ','ㅈ':'ㅉ' };
  const RR_L = { 'ㄱ':'g','ㄲ':'kk','ㄴ':'n','ㄷ':'d','ㄸ':'tt','ㄹ':'r','ㅁ':'m','ㅂ':'b','ㅃ':'pp','ㅅ':'s','ㅆ':'ss',
    'ㅇ':'','ㅈ':'j','ㅉ':'jj','ㅊ':'ch','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'h' };
  const RR_V = { 'ㅏ':'a','ㅐ':'ae','ㅑ':'ya','ㅒ':'yae','ㅓ':'eo','ㅔ':'e','ㅕ':'yeo','ㅖ':'ye','ㅗ':'o','ㅘ':'wa','ㅙ':'wae',
    'ㅚ':'oe','ㅛ':'yo','ㅜ':'u','ㅝ':'wo','ㅞ':'we','ㅟ':'wi','ㅠ':'yu','ㅡ':'eu','ㅢ':'ui','ㅣ':'i' };
  const RR_T = { 'ㄱ':'k','ㄴ':'n','ㄷ':'t','ㄹ':'l','ㅁ':'m','ㅂ':'p','ㅇ':'ng' };

  const isSyl = ch => { const c = ch.charCodeAt(0); return c >= 0xAC00 && c <= 0xD7A3; };
  function dec(ch) {
    const c = ch.charCodeAt(0) - 0xAC00;
    return { l: L[Math.floor(c / 588)], v: V[Math.floor((c % 588) / 28)], t: T[c % 28] };
  }
  function comp(l, v, t) {
    const li = L.indexOf(l), vi = V.indexOf(v), ti = T.indexOf(t || '');
    if (li < 0 || vi < 0 || ti < 0) return '';
    return String.fromCharCode(0xAC00 + (li * 21 + vi) * 28 + ti);
  }

  // 切成「連續的韓文字」（一個詞）與其他字元
  function chunks(text) {
    const out = []; let run = null;
    for (const ch of String(text == null ? '' : text)) {
      if (isSyl(ch)) { if (!run) { run = []; out.push(run); } run.push(dec(ch)); }
      else { run = null; out.push(ch); }
    }
    return out;
  }

  /* 套用發音規則（同一個詞裡）：連音、ㅎ 送氣與脫落、收音代表音、鼻音化、流音化、顎化。
   * s.l 是實際發音的初聲（羅馬拼音用這個）；s.tn 是硬音化後的初聲（只用在顯示實際發音，羅馬拼音不標硬音）。 */
  function applyRules(run) {
    const sy = run.map(s => ({ l: s.l, v: s.v, t: s.t }));
    for (let i = 0; i < sy.length; i++) {
      const a = sy[i], b = sy[i + 1];
      if (!b) { a.t = REP[a.t] || a.t; break; }
      let t = a.t;
      if (!t) continue;
      if (b.l === 'ㅇ') {                         // 後面是不發音的 ㅇ：連音
        if (t === 'ㅇ') continue;
        if (t === 'ㅎ') { a.t = ''; continue; }   // 좋아요 → 조아요
        if (t === 'ㄶ' || t === 'ㅀ') { a.t = ''; b.l = SPLIT[t][0]; continue; } // 괜찮아요 → 괜차나요
        if (SPLIT[t]) {                           // 읽어요 → 일거요、없어요 → 업서요
          a.t = SPLIT[t][0]; b.l = SPLIT[t][1];
          if ((a.t === 'ㄱ' || a.t === 'ㅂ') && TENSE[b.l]) b.tn = TENSE[b.l];
          continue;
        }
        if ((t === 'ㄷ' || t === 'ㅌ') && b.v === 'ㅣ') { a.t = ''; b.l = t === 'ㄷ' ? 'ㅈ' : 'ㅊ'; continue; } // 같이 → 가치
        a.t = ''; b.l = t; continue;
      }
      if (t === 'ㅎ' || t === 'ㄶ' || t === 'ㅀ') { // ㅎ 在前：좋다 → 조타、많다 → 만타
        const keep = t === 'ㅎ' ? '' : SPLIT[t][0];
        if (ASP[b.l]) { b.l = ASP[b.l]; a.t = keep; continue; }
        if (b.l === 'ㅅ') { b.l = 'ㅆ'; a.t = keep; continue; }
        if (b.l === 'ㄴ') a.t = keep || 'ㄴ';
      }
      if (b.l === 'ㅎ') {                         // ㅎ 在後：축하 → 추카
        let first = '', last = a.t;
        if (SPLIT[last]) { first = SPLIT[last][0]; last = SPLIT[last][1]; }
        if (last === 'ㅈ' || last === 'ㅊ') { b.l = 'ㅊ'; a.t = first; continue; }
        const r = REP[last];
        if (r === 'ㄱ' || r === 'ㄷ' || r === 'ㅂ') { b.l = ASP[r]; a.t = first; continue; }
      }
      a.t = REP[a.t] || a.t; t = a.t;
      if (b.l === 'ㄴ' || b.l === 'ㅁ') {         // 鼻音化：합니다 → 함니다
        if (t === 'ㄱ') a.t = 'ㅇ'; else if (t === 'ㄷ') a.t = 'ㄴ'; else if (t === 'ㅂ') a.t = 'ㅁ';
      } else if (b.l === 'ㄹ') {                  // 流音化、ㄹ 鼻音化
        if (t === 'ㄴ') a.t = 'ㄹ';
        else if (t === 'ㅁ' || t === 'ㅇ') b.l = 'ㄴ';
        else if (t === 'ㄱ') { a.t = 'ㅇ'; b.l = 'ㄴ'; }
        else if (t === 'ㅂ') { a.t = 'ㅁ'; b.l = 'ㄴ'; }
      }
      if (a.t === 'ㄹ' && b.l === 'ㄴ') b.l = 'ㄹ'; // 설날 → 설랄
      if ((a.t === 'ㄱ' || a.t === 'ㄷ' || a.t === 'ㅂ') && TENSE[b.l]) b.tn = TENSE[b.l]; // 학교 → 학꾜
    }
    return sy;
  }

  function rrRun(sy) {
    let out = '';
    sy.forEach((s, i) => {
      const prev = sy[i - 1];
      out += s.l === 'ㄹ' ? (prev && prev.t === 'ㄹ' ? 'l' : 'r') : RR_L[s.l];
      out += RR_V[s.v];
      if (s.t) out += RR_T[s.t] || '';
    });
    return out;
  }
  const analyze = text => chunks(text).map(c => typeof c === 'string' ? c : applyRules(c));
  /** 羅馬拼音（依實際發音） */
  const romanize = text => analyze(text).map(c => typeof c === 'string' ? c : rrRun(c)).join('');
  /** 實際發音（韓文字），例如 감사합니다 → 감사함니다 */
  const pronounce = text => analyze(text).map(c => typeof c === 'string' ? c : c.map(s => comp(s.tn || s.l, s.v, s.t)).join('')).join('');

  /** 拆成字母序列（雙收音拆開） */
  function jamo(text) {
    const out = [];
    for (const ch of String(text == null ? '' : text)) {
      if (!isSyl(ch)) continue;
      const s = dec(ch);
      out.push(s.l, s.v);
      if (s.t) (SPLIT[s.t] || [s.t]).forEach(x => out.push(x));
    }
    return out;
  }

  const DIG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  /** 阿拉伯數字 → 漢字音數字（辨識結果常出現數字） */
  function numToSino(n) {
    n = Math.floor(Number(n));
    if (!isFinite(n) || n < 0) return '';
    if (n === 0) return '영';
    const small = x => {
      let r = '';
      for (const [u, nm] of [[1000, '천'], [100, '백'], [10, '십']]) {
        const q = Math.floor(x / u);
        if (q) r += (q === 1 ? '' : DIG[q]) + nm;
        x %= u;
      }
      return r + DIG[x];
    };
    if (n >= 100000000) return String(n);
    const man = Math.floor(n / 10000);
    return (man ? (man === 1 ? '' : small(man)) + '만' : '') + small(n % 10000);
  }

  // 現在的首爾口音裡幾乎分不出來的母音，比對時當成一樣
  const SAME = { 'ㅔ':'ㅐ', 'ㅖ':'ㅒ', 'ㅞ':'ㅙ', 'ㅚ':'ㅙ' };
  const norm = t => String(t == null ? '' : t).replace(/\d+/g, m => numToSino(m)).replace(/[^가-힣]/g, '');
  function lev(a, b) {
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  /** 跟讀分數 0～100：寫法和實際發音各比一次，取較高的 */
  function score(target, heard) {
    const a = norm(target), b = norm(heard);
    if (!a || !b) return 0;
    const ja = x => jamo(x).map(j => SAME[j] || j);
    let best = 0;
    for (const [x, y] of [[a, b], [pronounce(a), pronounce(b)]]) {
      const p = ja(x), q = ja(y);
      best = Math.max(best, 1 - lev(p, q) / Math.max(p.length, q.length));
    }
    return Math.round(100 * best);
  }

  const KH = { L, V, T, SPLIT, REP, RR_L, RR_V, RR_T, isSyl, dec, comp, romanize, pronounce, jamo, numToSino, score, lev };
  if (typeof module !== 'undefined' && module.exports) module.exports = KH;
  else root.KH = KH;
})(typeof window !== 'undefined' ? window : globalThis);
