// 瀏覽器實際操作：上完所有課、玩每種遊戲、複習換日、跟讀（假麥克風）、任務簽到、商店、設定、備份、重新整理保留
const { chromium } = require('playwright');
const { start, blockExternal } = require('./server.js');
let fail = 0, n = 0;
const ok = (c, msg) => { n++; if (!c) { fail++; console.log('  ✗', msg); } else if (process.env.V) console.log('  ok', msg); };

// 假的語音（播放）與辨識；時間可以往後調（window.__off 毫秒）
const INIT = () => {
  window.__spoken = []; window.__heard = null;
  window.speechSynthesis.speak = u => window.__spoken.push(u.text);
  class FakeRec { start() { const me = this; setTimeout(() => {
      if (window.__heard == null && window.__heardAlts == null) { me.onerror && me.onerror({ error: 'no-speech' }); me.onend && me.onend(); return; }
      const alt = (window.__heardAlts || [window.__heard]).map(t => ({ transcript: t })); me.onresult && me.onresult({ results: [alt] }); me.onend && me.onend(); }, window.__srDelay || 30); }
    stop() {} abort() {} }
  window.SpeechRecognition = FakeRec;
  // 假的錄音：getUserMedia＋MediaRecorder
  window.__tracksOpen = 0; window.__played = 0;
  navigator.mediaDevices.getUserMedia = async () => { if (window.__micDeny) throw new Error('NotAllowed'); window.__tracksOpen++; return { getTracks: () => [{ stop: () => window.__tracksOpen-- }] }; };
  window.MediaRecorder = class { constructor() { this.state = 'inactive'; this.mimeType = 'audio/webm'; } start() { this.state = 'recording'; }
    stop() { if (this.state !== 'recording') return; this.state = 'inactive'; setTimeout(() => { this.ondataavailable && this.ondataavailable({ data: new Blob(['x']) }); this.onstop && this.onstop(); }, 10); } };
  window.Audio = class { constructor(u) { this.src = u; } play() { window.__played++; return Promise.resolve(); } };
  const RD = Date; const off = () => Number(localStorage.getItem('__off') || 0);
  class D extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off()); } static now() { return RD.now() + off(); } }
  window.Date = D;
};

(async () => {
  const srv = await start(); const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 740 } });
  await ctx.addInitScript(INIT);
  const p = await ctx.newPage(); await blockExternal(p);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
  await p.goto(srv.url); await p.waitForSelector('#tabs button');
  const ev = (f, a) => p.evaluate(f, a);
  // 點固定畫面下面的按鈕：先捲到畫面中間（上方的發音動畫是固定的）
  const tapC = async sel => { await p.$eval(sel, e => e.scrollIntoView({ block: 'center' })); await p.click(sel); };
  const prog = () => ev(() => JSON.parse(localStorage.getItem('hoya-korean-v1') || 'null'));

  // E1 首頁進入第一課，用點的上完所有課
  await p.click('[data-act=lesson]');
  ok(await ev(() => U.view) === 'lesson', 'E1 首頁開始學習');
  const lessons = await ev(() => LESSONS.map(l => l.id));
  let wrongOnce = false;
  for (const id of lessons) {
    if (await ev(() => U.view) !== 'lesson') { await ev(() => go('learn')); await p.click(`.lesson[data-id="${id}"]`); }
    ok(await ev(() => U.ls.id) === id, 'E1 進入課程 ' + id);
    for (let k = 0; k < 120 && await ev(() => U.view) === 'lesson'; k++) {
      const st = await ev(() => { const s = U.ls.steps[U.ls.i]; return { k: s.k, ans: s.ans, picked: s.picked, nopt: s.opts && s.opts.length }; });
      if (st.k === 'quiz') {
        ok(st.nopt >= 2, 'E1 選項至少 2 個 ' + id);
        const pickI = !wrongOnce && st.nopt > 1 ? (st.ans + 1) % st.nopt : st.ans; // 故意答錯一題
        await p.click(`.opt[data-i="${pickI}"]`);
        await p.waitForSelector('.fb');
        if (!wrongOnce) { ok(await p.$('.opt.bad') && await p.$('.opt.good'), 'E1 答錯顯示正確答案'); wrongOnce = true; }
      }
      await p.click('[data-act="ls-next"]');
    }
    ok(await ev(() => U.view) === 'done', 'E1 完成畫面 ' + id);
  }
  let pr = await prog();
  ok(Object.keys(pr.done).length === lessons.length, 'E1 所有課程記錄完成');
  ok(Object.keys(pr.srs).length === await ev(() => WORDS.length), 'E1 主題單字加進複習');
  ok(pr.coins > 0 && pr.coins === pr.earned, 'E1 賺到點數 ' + pr.coins);
  ok(pr.streak.count === 1, 'E1 連續 1 天');

  // E2 重練只給少一點的點數
  const c0 = (await prog()).coins;
  await ev(() => startLesson('v1'));
  await ev(() => { U.ls.i = U.ls.steps.length - 1; render(); });
  const last = await ev(() => U.ls.steps[U.ls.i]);
  if (last.k === 'quiz') { await p.click(`.opt[data-i="${last.ans}"]`); }
  await p.click('[data-act="ls-next"]');
  ok((await prog()).coins - c0 === 30 + 5 * (last.k === 'quiz' ? 1 : 0), 'E2 重練點數');

  // E3 遊戲：每種玩完
  for (const g of ['hear', 'build', 'match', 'quick', 'order']) {
    await ev(() => go('games'));
    await p.click(`[data-act=game][data-id=${g}]`);
    if (g === 'hear') await p.click('[data-act=game][data-m=b]');
    const before = (await prog()).coins;
    if (g === 'hear') for (let i = 0; i < 10; i++) { const a = await ev(() => U.g.qs[U.g.i].ans); await p.click(`.opt[data-i="${a}"]`); await p.click('[data-act=g-next]'); }
    if (g === 'build') for (let i = 0; i < 8; i++) {
      const s = await ev(() => U.g.qs[U.g.i].s);
      for (const k of ['l', 'v', 't']) await p.click(`[data-act=b-pick][data-k=${k}][data-j="${s[k]}"]`);
      await p.click('[data-act=b-check]'); ok(await ev(() => U.g.qs[U.g.i].res) === 'ok', 'E3 組字答對'); await p.click('[data-act=g-next]');
    }
    if (g === 'match') {
      await p.click('.mcard[data-i="0"]'); const k0 = await ev(() => U.g.cards[0].k);
      const wrong = await ev(k => U.g.cards.findIndex((c, i) => i && c.k !== k), k0);
      await p.click(`.mcard[data-i="${wrong}"]`);
      await p.waitForFunction(() => U.g.open.length === 0);
      for (let k = 0; k < 6; k++) { const [a, c] = await ev(k => U.g.cards.map((x, i) => x.k === k ? i : -1).filter(i => i >= 0), k); await p.click(`.mcard[data-i="${a}"]`); await p.click(`.mcard[data-i="${c}"]`); }
      await p.waitForFunction(() => U.g.end);
      ok(await ev(() => U.g.tries) === 7, 'E3 配對次數');
    }
    if (g === 'quick') {
      for (let i = 0; i < 5; i++) { const a = await ev(() => U.g.q.ans); await p.click(`.opt[data-i="${a}"]`); }
      const a = await ev(() => U.g.q.ans); await p.click(`.opt[data-i="${(a + 1) % 4}"]`); await p.click('[data-act=g-next]');
      await ev(() => { U.g.left = 1; });
      await p.waitForFunction(() => U.g.end, null, { timeout: 4000 });
      ok(await ev(() => U.g.ok) === 5 && await ev(() => U.g.n) === 6, 'E3 快問快答計分');
    }
    if (g === 'order') for (let i = 0; i < 6; i++) {
      const words = await ev(() => U.g.qs[U.g.i].s.ko.split(' '));
      for (const w of words) { const k = await ev(w => U.g.qs[U.g.i].chips.findIndex(c => c.w === w), w); await p.click(`[data-act=o-put][data-k="${k}"]`); }
      await p.click('[data-act=o-check]'); ok(await ev(() => U.g.qs[U.g.i].res) === 'ok', 'E3 排句答對'); await p.click('[data-act=g-next]');
    }
    await p.waitForFunction(() => U.g.end);
    const got = (await prog()).coins - before;
    const okN = await ev(() => U.g.ok);
    ok(got === okN * 10 + 30 + 50, `E3 ${g} 點數 ${got}`);
    await p.click(`[data-act=game][data-id=${g}]`); // 再玩一次，不再有每日第一次獎勵
    if (g === 'hear') ok(await ev(() => U.g.mode) === 'b', 'E3 再玩一次保留模式');
    await ev(() => { U.g.ok = 0; endGame(); });
    ok((await prog()).coins - before - got === 30, 'E3 同一天再玩不送第一次獎勵 ' + g);
  }

  // E4 任務與簽到（只能領一次）
  await ev(() => go('home'));
  await p.click('[data-act=checkin]'); await p.click('[data-act=pop-ok]');
  ok((await prog()).day.checkin === 1, 'E4 簽到');
  ok(!(await p.$('[data-act=checkin]')), 'E4 簽到後按鈕消失');
  for (const t of ['lesson', 'game']) { const c = (await prog()).coins; await p.click(`[data-act=task][data-id=${t}]`); await p.click('[data-act=pop-ok]'); ok((await prog()).coins - c === 100, 'E4 任務 ' + t); }
  ok(await p.$('[data-act=task][data-id=voice][disabled]'), 'E4 沒達成的任務不能領');
  ok(await ev(() => { const c = S.coins; ACT.task({ id: 'lesson' }); return S.coins === c; }), 'E4 同一任務不能領兩次');

  // E5 跟讀（假麥克風）
  await ev(() => startLesson('t-hello'));
  await ev(() => { U.ls.i = U.ls.steps.findIndex(s => s.k === 'sent'); render(); });
  const sent = await ev(() => U.ls.steps[U.ls.i].s.ko);
  await ev(s => { window.__heard = s; }, sent);
  let c1 = (await prog()).coins;
  await p.click('[data-act=rec]'); await p.waitForSelector('.score');
  ok(/100 分/.test(await p.textContent('.score')), 'E5 念對 100 分');
  ok((await prog()).coins - c1 === 20, 'E5 80 分以上 +20');
  await p.click('[data-act=rec]'); await p.waitForSelector('.score');
  ok((await prog()).coins - c1 === 20, 'E5 同一句同一天只送一次');
  await ev(() => { window.__heard = '바나나'; }); await p.click('[data-act=rec]'); await p.waitForSelector('.score');
  ok(parseInt(await p.textContent('.score')) < 50, 'E5 念錯低分');
  await ev(() => { window.__heard = null; }); await p.click('[data-act=rec]'); await p.waitForSelector('.card .sub:has-text("沒有聽到")');
  ok(true, 'E5 沒聲音提示');
  ok((await prog()).log[await ev(() => today())].s === 3, 'E5 跟讀次數記錄');
  // 錄音中離開不會留下狀態
  await ev(() => { window.__heard = '안녕'; }); await p.click('[data-act=rec]'); await p.click('[data-act=ls-next]');
  await p.waitForTimeout(100);
  ok(await ev(() => U.sp === null && !document.querySelector('.score')), 'E5 換下一步清掉跟讀結果');
  await ev(() => go('home'));
  // 任務 voice：跟讀 3 次 + 複習 2 次
  // E6 複習：今天沒有到期，換到明天才有
  ok(await ev(() => due().length) === 0, 'E6 今天沒有到期');
  await ev(() => localStorage.setItem('__off', String(864e5)));
  await p.reload(); await p.waitForSelector('#tabs button');
  const dueN = await ev(() => due().length);
  ok(dueN > 0, 'E6 明天有到期 ' + dueN);
  ok(await p.$('#main [data-act=review]'), 'E6 首頁顯示複習卡');
  await p.click('#main [data-act=review]');
  const total = await ev(() => U.rv.ids.length);
  for (let i = 0; i < total; i++) { await p.click('[data-act=rv-show]'); await p.click(`[data-act=rv-ans][data-ok="${i === 0 ? 0 : 1}"]`); }
  pr = await prog();
  const firstId = await ev(() => U.rv.ids[0]), dn = await ev(() => dayNo());
  ok(pr.srs[firstId].l === 0 && pr.srs[firstId].d === dn + 1, 'E6 不熟的字明天再複習');
  const secondId = await ev(() => U.rv.ids[1]);
  ok(pr.srs[secondId].l === 1 && pr.srs[secondId].d === dn + 3, 'E6 記得的字 3 天後');
  ok(pr.streak.count === 2, 'E6 連續 2 天');
  ok(pr.day.checkin === 0, 'E6 換日任務重置');
  await p.click('[data-act=rv-close]');
  ok(await ev(() => due().length) === Math.max(0, dueN - total), 'E6 複習完到期數減少');

  // E7 商店：兩段確認購買、穿上脫下、錢不夠不能買
  await ev(() => { S.coins = 1000; save(); U.shopCat = 'hat'; U.meTab = 'shop'; go('me'); });
  await p.click('[data-act=buy][data-id="hat:beret"]');
  ok(!(await prog()).own['hat:beret'], 'E7 第一次點不會直接買');
  await p.click('[data-act=buy][data-id="hat:beret"]'); await p.click('[data-act=pop-ok]');
  pr = await prog();
  ok(pr.own['hat:beret'] && pr.coins === 200 && pr.wear.hat === 'beret', 'E7 買到並穿上');
  await p.click('[data-act=wear][data-id="hat:beret"]'); ok((await prog()).wear.hat === '', 'E7 脫下');
  ok(await p.$('[data-id="hat:crown"][disabled]') === null && await p.$('.item button[disabled]'), 'E7 錢不夠的按鈕不能按');
  ok(await ev(() => { ACT.buy({ id: 'hat:crown' }); ACT.buy({ id: 'hat:crown' }); return S.coins === 200 && !S.own['hat:crown']; }), 'E7 錢不夠買不到');
  await ev(() => { ACT.wear({ id: 'hat:crown' }); });
  ok(await ev(() => S.wear.hat) === '', 'E7 沒買的不能穿');
  // 隨機購買 300 次：點數不會變負
  ok(await ev(() => { for (let i = 0; i < 300; i++) { S.coins = Math.floor(Math.random() * 4000); const it = SHOP[Math.floor(Math.random() * SHOP.length)]; ACT.buy({ id: it.id }); ACT.buy({ id: it.id }); U.pops = []; if (S.coins < 0) return false; } return true; }), 'E7 點數不為負');

  // E8 風格 × 畫面：沒有錯誤
  const views = ['home', 'learn', 'chart', 'builder', 'games', 'review', 'words', 'me'];
  for (const sk of ['fresh', 'night', 'hanji', 'sakura', 'notebook', 'neon']) {
    await ev(sk => { S.own['skin:' + sk] = '2026-1-1'; S.skin = sk; save(); }, sk);
    for (const v of views) await ev(v => go(v), v);
    ok(await ev(() => document.body.dataset.skin) === sk, 'E8 風格 ' + sk);
  }
  // E9 設定：拼音隱藏／點才看、實際發音
  await ev(() => { U.meTab = 'set'; go('me'); });
  await p.click('[data-act=set-rr][data-v=hide]'); await ev(() => go('words'));
  ok(!(await p.$('.rr')), 'E9 隱藏拼音');
  await ev(() => { S.set.rr = 'tap'; go('words'); });
  const tap = await p.$('.rr.tap'); await tap.click(); ok(!(await tap.evaluate(e => e.classList.contains('tap'))), 'E9 點一下顯示');
  await ev(() => { S.set.rr = 'show'; S.set.pron = false; go('words'); });
  ok(!(await p.$('.pron')), 'E9 不顯示實際發音');
  await ev(() => { S.set.pron = true; S.set.auto = true; save(); startLesson('v1'); });
  await p.click('[data-act=ls-next]');
  await p.waitForFunction(() => window.__spoken.includes('아'));
  ok(true, 'E9 自動播放');
  await ev(() => go('home'));

  // E10 備份與匯入
  await ev(() => { U.meTab = 'set'; go('me'); });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=export]')]);
  const fs = require('fs'); const backup = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(backup.v === 1 && backup.coins === (await prog()).coins, 'E10 下載備份');
  await p.click('[data-act=reset]'); await p.click('[data-act=reset]');
  ok((await prog()).coins === 0 && Object.keys((await prog()).done).length === 0, 'E10 清除進度');
  const tmp = require('path').join(require('os').tmpdir(), 'hoya-backup.json'); fs.writeFileSync(tmp, JSON.stringify(backup));
  await ev(() => { U.meTab = 'set'; go('me'); });
  await p.setInputFiles('#file', tmp);
  await p.waitForFunction(c => S.coins === c, backup.coins);
  ok(Object.keys((await prog()).done).length === lessons.length, 'E10 匯入備份');
  fs.writeFileSync(tmp, '{"hello":1}'); await p.setInputFiles('#file', tmp);
  await p.waitForFunction(() => /不是/.test(document.querySelector('#toast').textContent));
  ok((await prog()).coins === backup.coins, 'E10 錯的檔案不會覆蓋');

  // E11 舊資料／壞資料
  for (const bad of ['{bad json', '[]', '{"v":1,"coins":-50,"skin":"neon","wear":{"hat":"crown"},"set":{"rate":9}}', '{"v":1,"srs":{"nope-w9":{"l":1,"d":1}}}']) {
    await ev(x => localStorage.setItem('hoya-korean-v1', x), bad);
    await p.reload(); await p.waitForSelector('#tabs button');
    for (const v of views) await ev(v => go(v), v);
    const s = await ev(() => ({ coins: S.coins, skin: S.skin, hat: S.wear.hat, rate: S.set.rate }));
    ok(s.coins >= 0 && s.skin === 'fresh' && s.hat === '' && s.rate === 0.9, 'E11 修正壞資料 ' + bad.slice(0, 20));
  }
  // E13 母音聽辨特訓：位置圖、對比單字、錄自己的聲音、答完比較
  await ev(() => localStorage.setItem('__off', '0')); await p.reload(); await p.waitForSelector('#tabs button');
  await ev(() => { S.set.auto = false; save(); startLesson('v3'); });
  await p.click('[data-act=ls-next]');
  ok(await ev(() => U.ls.steps[U.ls.i].k) === 'vmap', 'E13 位置圖');
  await tapC('.fam-js [data-j="ㅗ"]'); await p.waitForFunction(() => window.__spoken.at(-1) === '오');
  ok(await ev(() => SA.isPlaying() && document.querySelector('.sa-mouth.on svg.mouth') !== null), 'E13 點母音地圖播放動畫並念出');
  await p.click('[data-act=ls-next]');
  ok(await ev(() => U.ls.steps[U.ls.i].k) === 'vchain' && (await p.$$('.chain svg.mouth')).length === 6, 'E13 嘴型連續動作');
  await p.click('[data-act=ls-next]');
  ok((await p.$$('.vpair svg.mouth')).length === 2, 'E13 對比卡兩個嘴型');
  await p.click('.wpair button >> nth=1'); ok(await ev(() => window.__spoken.at(-1)) === '고리', 'E13 對比單字播放');
  const s0 = ((await prog()).log[await ev(() => today())] || {}).s || 0;
  await p.click('[data-act=my-rec]'); await p.waitForSelector('[data-act=my-rec]:has-text("停止")');
  await p.click('[data-act=my-rec]'); await p.waitForSelector('[data-act=my-play]');
  ok(await ev(() => window.__played) === 1, 'E13 錄完自動播放自己的聲音');
  ok(await ev(() => window.__tracksOpen) === 0, 'E13 錄完關掉麥克風');
  ok(((await prog()).log[await ev(() => today())].s || 0) === s0 + 1, 'E13 錄音算一次跟讀');
  await p.click('[data-act=my-play]'); ok(await ev(() => window.__played) === 2, 'E13 再聽一次');
  await p.click('.myrec [data-act=say]'); ok(await ev(() => window.__spoken.at(-1)) === '거리, 고리', 'E13 標準發音');
  // 錄音中換下一步：丟掉、關麥克風
  await p.click('[data-act=ls-next]'); await p.click('[data-act=my-rec]'); await p.waitForSelector('[data-act=my-rec]:has-text("停止")');
  await p.click('[data-act=ls-next]');
  await p.waitForFunction(() => window.__tracksOpen === 0);
  ok(await ev(() => U.my === null && !document.querySelector('[data-act=my-play]')), 'E13 錄音中換步驟會丟掉');
  // 麥克風被拒絕
  await ev(() => { window.__micDeny = true; }); await p.click('[data-act=my-rec]');
  await p.waitForFunction(() => /麥克風/.test(document.querySelector('#toast').textContent) && U.my === null);
  ok(true, 'E13 麥克風被拒絕有提示'); await ev(() => { window.__micDeny = false; });
  // 測驗：只有兩個選項，答完可以比較
  await ev(() => { U.ls.i = U.ls.steps.findIndex(x => x.k === 'quiz'); render(); });
  const q = await ev(() => U.ls.steps[U.ls.i]);
  ok(q.opts.length === 2, 'E13 對比題兩個選項');
  await p.click(`.opt[data-i="${q.ans}"]`);
  ok((await p.$$('.cmp [data-act=say]')).length === 2, 'E13 答完可以比較兩個發音');
  await ev(() => go('home'));
  // 第一課的母音卡有嘴型，子音卡沒有
  await ev(() => startLesson('v1')); await p.click('[data-act=ls-next]');
  ok(await p.$('.card svg.mouth'), 'E13 母音卡有嘴型');
  await ev(() => { startLesson('v2'); U.ls.i = U.ls.steps.findIndex(x => x.k === 'letter' && x.x.j === 'ㅘ'); render(); });
  ok((await p.$$('.mouthseq svg.mouth')).length === 2, 'E13 雙母音兩個嘴型');
  await ev(() => startLesson('c1')); await p.click('[data-act=ls-next]');
  ok(!(await p.$('.card svg.mouth')), 'E13 子音卡沒有嘴型');
  await ev(() => go('home'));

  // E14 子音聽辨特訓：側面圖、念給 App 聽（念對／念成別的字／很接近／沒聽清楚）
  await ev(() => { S.set.auto = false; save(); startLesson('cs'); });
  await p.click('[data-act=ls-next]');
  ok(await ev(() => U.ls.steps[U.ls.i].k) === 'cplace' && (await p.$$('svg[data-sa]')).length === 1 && (await p.$$('.fam')).length === 6, 'E14 發音地圖 6 個部位');
  await tapC('.fam-js [data-j="ㅁ"]');
  await p.waitForFunction(() => window.__spoken.at(-1) === '마');
  ok(await ev(() => SA.isPlaying() && document.querySelector('.fam[data-fam=lips]').classList.contains('on')), 'E14 點子音播動畫、念出來、亮起家族卡');
  ok(await ev(() => document.querySelector('svg[data-sa]').getAttribute('viewBox') !== '24 24 1206 1206'), 'E14 播放時放大嘴巴');
  await p.click('[data-act=ls-next]');
  ok(await ev(() => !SA.isPlaying()) && (await p.$$('svg[data-sa]')).length === 1 && (await p.$$('.sa-j')).length === 3, 'E14 三種出氣方式（換步驟會停掉動畫）');
  await p.click('[data-act=ls-next]');
  ok(await ev(() => U.ls.steps[U.ls.i].k) === 'ctrio' && (await p.$$('svg[data-sa]')).length === 1 && (await p.$$('.sa-j')).length === 3, 'E14 ㄷㅌㄸ 卡片');
  await p.click('.sa-j[data-j="ㅌ"]'); await p.waitForFunction(() => window.__spoken.at(-1) === '타');
  await p.waitForFunction(() => /吐一大口氣/.test(document.querySelector('.sa-cap').textContent), null, { timeout: 3000 });
  ok(true, 'E14 送氣音放開時的說明');
  const ckc = async () => { await p.click('.ckbox [data-act=ck]'); await p.waitForSelector('.ckres:not(.sub)'); return (await p.textContent('.ckres')).trim(); };
  const k0 = (await prog()).coins;
  await ev(() => { window.__heardAlts = ['달']; });
  ok(/念對了/.test(await ckc()), 'E14 念對');
  ok((await prog()).coins - k0 === 10, 'E14 念對 +10');
  ok(/念對了/.test(await ckc()) && (await prog()).coins - k0 === 10, 'E14 同一個字同一天只送一次');
  await ev(() => { window.__heardAlts = ['탈', '달']; });
  let t = await ckc(); ok(/탈/.test(t) && /面具/.test(t) && /吐氣太多/.test(t), 'E14 念成送氣音有提示：' + t);
  await p.click('.ckpick button:has-text("딸")'); ok(await ev(() => window.__spoken.at(-1)) === '딸', 'E14 選字會念');
  await ev(() => { window.__heardAlts = ['탈']; });
  t = await ckc(); ok(/面具/.test(t) && /不要吐氣/.test(t), 'E14 硬音念成送氣音提示：' + t);
  await ev(() => { window.__heardAlts = ['딸기']; });
  ok(/念對了/.test(await ckc()), 'E14 句子裡有目標字也算對');
  await p.click('.ckpick button:has-text("떡")');
  await ev(() => { window.__heardAlts = ['덕'] }); t = await ckc(); ok(/德/.test(t) && /繃緊/.test(t), 'E14 第二組單字：' + t);
  await ev(() => { window.__heardAlts = ['바나나'] }); t = await ckc(); ok(/再試一次/.test(t) && /바나나/.test(t), 'E14 聽成無關的字');
  await ev(() => { window.__heardAlts = null; window.__heard = null; }); await p.click('.ckbox [data-act=ck]'); await p.waitForSelector('.ckres:has-text("沒有聽到")');
  ok(true, 'E14 沒聲音提示');
  // 檢查中按錄音：檢查停止
  await ev(() => { window.__heardAlts = ['달']; window.__srDelay = 400; }); await p.click('.ckbox [data-act=ck]');
  await p.waitForSelector('.ckres:has-text("正在聽")');
  await p.click('[data-act=my-rec]');
  await p.waitForSelector('[data-act=my-rec]:has-text("停止")');
  ok(await ev(() => U.ck === null), 'E14 錄音時檢查會停止');
  await p.waitForTimeout(500); // 等舊的辨識結果送達
  ok(await ev(() => U.ck === null && !document.querySelector('.ckres')), 'E14 停止後晚到的辨識結果不會出現');
  await ev(() => { window.__srDelay = 0; });
  await p.click('[data-act=my-rec]'); await p.waitForSelector('[data-act=my-play]');
  await p.click('[data-act=ls-next]'); ok(await ev(() => U.ck === null && U.my === null), 'E14 換步驟清掉');
  ok(await ev(() => judgeSay('사다', [['싸다', '便宜']], ['싸다', '사다']).kind === 'rival' && judgeSay('사다', [['싸다', '便宜']], ['사다', '싸다']).kind === 'ok'), 'E14 依辨識順序判斷');
  ok(await ev(() => judgeSay('이', [], ['2']).kind === 'near'), 'E14 數字也接受');
  ok(await ev(() => ckHint('거리', '고리') === '嘴唇太圓了，放鬆、不要嘟。' && ckHint('사다', '싸다') !== ''), 'E14 母音與子音提示');
  // 字母卡：子音有側面圖、字形由來與念給 App 聽；母音卡也有
  await ev(() => startLesson('c1')); await p.click('[data-act=ls-next]');
  ok(await p.$('.card svg[data-sa]') && /字形由來/.test(await p.textContent('.tip')) && await p.$('.ckbox'), 'E14 子音卡');
  await ev(() => { window.__heardAlts = ['가방']; }); ok(/念對了/.test(await ckc()), 'E14 子音卡例字念對');
  await ev(() => startLesson('v1')); await p.click('[data-act=ls-next]');
  ok(await p.$('.ckbox') && await p.$('.card svg[data-sa][data-mode="v"]'), 'E14 母音卡有檢查、有母音動畫');
  await ev(() => { startLesson('v3'); U.ls.i = U.ls.steps.findIndex(x => x.k === 'vpair'); render(); });
  await ev(() => { window.__heardAlts = ['고리']; }); t = await ckc(); ok(/고리/.test(t) && /嘴唇太圓/.test(t), 'E14 母音對比念錯提示：' + t);
  await ev(() => { window.__heardAlts = null; go('home'); });

  // E15 子音發音地圖：從學習頁進入、19 個子音都能播放、慢動作、離開會停止
  await ev(() => { S.set.auto = true; save(); go('learn'); });
  await p.click('[data-act=go][data-v=cmap]');
  ok((await p.$$('.cmap .fam')).length === 6 && (await p.$$('.manner .fam-js button')).length === 14, 'E15 地圖畫面');
  await p.waitForFunction(() => { const im = document.querySelector('svg[data-sa] image'); return im && im.getAttribute('href') === 'img/girl.webp'; });
  const imgOk = await ev(() => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); i.src = 'img/girl.webp'; }));
  ok(imgOk === 1254, 'E15 人物圖片載入 ' + imgOk);
  for (const j of await ev(() => Object.keys(SA.C))) {
    await ev(() => { window.__spoken = []; });
    await tapC(`.cm-cards [data-j="${j}"]`);
    await p.waitForFunction(s => window.__spoken.includes(s), await ev(j => SA.syl(j), j), { timeout: 5000 });
  }
  ok(true, 'E15 19 個子音都會播放並念出');
  await p.click('[data-act=sa-slow]'); ok(await ev(() => U.saSlow && document.querySelector('[data-act=sa-slow]').classList.contains('on')), 'E15 慢動作開關');
  await tapC('.cm-cards [data-j="ㄷ"]');
  const t0 = Date.now(); await p.waitForFunction(() => window.__spoken.at(-1) === '다');
  ok(Date.now() - t0 > 1500, 'E15 慢動作比較慢才念 ' + (Date.now() - t0));
  await p.click('[data-act=sa-slow]');
  await p.click('[data-act=go][data-v=home]');
  ok(await ev(() => !SA.isPlaying()), 'E15 離開畫面停止動畫');
  // 母音發音地圖：21 個母音都會播放並念出、正面嘴型小窗
  await ev(() => go('learn')); await p.click('[data-act=go][data-v=vwmap]');
  ok((await p.$$('.cmap .fam')).length === 6, 'E16 母音地圖 6 張家族卡');
  for (const v of await ev(() => [...VOWELS, ...VOWELS2].map(x => x.j))) {
    await ev(() => { window.__spoken = []; });
    await tapC(`.cm-cards [data-j="${v}"]`);
    await p.waitForFunction(s => window.__spoken.includes(s), await ev(v => SA.vsyl(v), v), { timeout: 5000 });
  }
  ok(await ev(() => document.querySelector('.sa-mouth.on svg.mouth') !== null), 'E16 21 個母音都會播放、有正面嘴型');
  await p.click('[data-act=go][data-v=home]');
  ok(await ev(() => !SA.isPlaying()), 'E16 離開停止');
  // E17 閱讀文章：點單字看解釋卡、+1 挑戰單字、加入複習（今天就到期）、翻譯、文法、重新整理保留
  await ev(() => go('learn')); await p.click('[data-act=tp-open][data-n="12"]'); await p.click('[data-act=rd-open][data-id=art_112]');
  const nTW = await ev(() => READ_ARTICLES.find(a => a.article_id === 'art_112').sentences.reduce((n, s) => n + s.target_words.length, 0));
  ok(await ev(() => U.view === 'article') && (await p.$$('.rd-text .rw')).length === nTW, 'E17 文章可以點的單字 ' + nTW);
  ok(!(await p.$('.rd-card')), 'E17 一開始沒有解釋卡');
  const tapW = async sel => { await p.$eval(sel, e => e.scrollIntoView({ block: 'start' })); await p.click(sel); };
  await ev(() => { window.__spoken = []; });
  await tapW('.rd-text .rw >> text=맛있어요');
  ok(/好吃、美味/.test(await p.textContent('.rd-card')) && /맛있다/.test(await p.textContent('.rd-word')), 'E17 點變化形顯示原型與解釋');
  ok(await ev(() => window.__spoken.includes('맛있다')), 'E17 點單字念出原型');
  await tapW('.rd-text .rw.plus >> nth=0');
  ok(/挑戰/.test(await p.textContent('.rd-badges')) && /시키다/.test(await p.textContent('.rd-word')), 'E17 +1 挑戰單字');
  const dN = await ev(() => due().length);
  await p.click('[data-act=rd-add]');
  ok(await ev(() => S.srs['art_112:new_01'] && S.srs['art_112:new_01'].d === dayNo()), 'E17 加入複習、今天到期');
  ok(await ev(() => due().length) === dN + 1 && await p.$('[data-act=rd-add][disabled]'), 'E17 複習數 +1、按鈕變已加入');
  await tapW('.rd-text .rw >> text=불고기를');
  await p.click('[data-act=rd-add]');
  ok(await ev(() => !!S.srs['v_1346']), 'E17 清單單字加入複習');
  await tapW('.rd-text .rw >> text=불고기는');
  ok(await p.$('[data-act=rd-add][disabled]'), 'E17 同一個單字的其他變化形也顯示已加入');
  await p.click('[data-act=rd-allzh]'); ok((await p.$$('.rd-zh')).length === 6, 'E17 顯示全部翻譯');
  await p.click('[data-act=rd-close]'); ok(!(await p.$('.rd-card')), 'E17 關閉解釋卡');
  await tapW('[data-act=rd-gram]'); await p.waitForFunction(() => document.querySelector('.rd-gn.flash'));
  await tapW('.rd-text .rw >> text=물'); await p.click('[data-act=rd-ex]');
  ok(/물 한 잔 주세요/.test(await p.textContent('.rd-ex.open')), 'E17 手機上點開例句');
  ok((await p.$$('.rd-gn')).length === 2, 'E17 文法筆記');
  await p.reload(); await p.waitForSelector('#tabs button');
  ok(await ev(() => !!S.srs['art_112:new_01'] && WORD['art_112:new_01'].ko === '시키다'), 'E17 重新整理後還在複習清單');
  ok(await ev(() => due().includes('art_112:new_01') && due().includes('v_1346')), 'E17 複習清單裡有閱讀加入的單字');
  await ev(() => { U.rv = { ids: ['art_112:new_01'], i: 0, show: false, ok: 0, free: false, gain: 0 }; go('review'); });
  ok(/시키다/.test(await p.textContent('#main')), 'E17 複習卡顯示閱讀單字');
  await p.click('[data-act=rv-show]'); await p.click('[data-act=rv-ans][data-ok="1"]');
  ok(await ev(() => S.srs['art_112:new_01'].l === 1), 'E17 閱讀單字照間隔複習');
  // E18 TOPIK 主題頁：34 個字、看例句、單一加入、全部加入、文章入口與返回
  await ev(() => go('learn'));
  ok((await p.$$('.tp-tile[data-act=tp-open]')).length >= 5 && (await p.$$('.tp-tile.off')).length > 0, 'E18 主題列表（完成的可以點、其他準備中）');
  await p.click('[data-act=tp-open][data-n="1"]');
  ok((await p.$$('.tp-w')).length === 34, 'E18 主題 1 有 34 個字');
  await ev(() => { window.__spoken = []; }); await p.click('[data-act=tp-ex][data-id=v_1009]');
  ok(/이름이 뭐예요/.test(await p.textContent('.tp-ex')) && await ev(() => window.__spoken.includes('이름')), 'E18 點單字看例句並念出');
  await p.click('[data-act=tp-add][data-id=v_1009]');
  ok(await ev(() => S.srs['v_1009'] && S.srs['v_1009'].d === dayNo()) && await p.$('[data-act=tp-add][data-id=v_1009][disabled]'), 'E18 單一加入複習');
  await p.click('[data-act=tp-addall]');
  ok(await ev(() => tpWords(1).every(w => S.srs[w.id])) && await p.$('[data-act=tp-addall][disabled]'), 'E18 全部加入複習');
  await p.click('[data-act=rd-open][data-id=art_101]'); ok(await ev(() => U.view === 'article'), 'E18 進入主題文章');
  await p.click('.step-top [data-act=tp-open]'); ok(await ev(() => U.view === 'topic' && U.tp === 1), 'E18 文章返回主題頁');
  // E19 舊編號的複習進度會換到新編號（只換一次）
  await ev(() => { const o = JSON.parse(localStorage.getItem('hoya-korean-v1')); o.srs = { v_1029: { l: 3, d: 5, m: 0 }, v_1016: { l: 2, d: 6, m: 0 }, 'art_101:new_01': { l: 1, d: 7, m: 0 }, 'me-w0': { l: 1, d: 8, m: 0 } }; delete o.vocabV; localStorage.setItem('hoya-korean-v1', JSON.stringify(o)); });
  await p.reload(); await p.waitForSelector('#tabs button');
  const mig = await ev(() => S.srs);
  ok(mig.v_1118 && mig.v_1118.l === 3 && mig.v_1346 && mig.v_1346.l === 2 && mig['art_112:new_01'] && mig['art_112:new_01'].l === 1 && mig['me-w0'] && !mig.v_1029 && !mig.v_1016 && !mig['art_101:new_01'], 'E19 舊編號轉到新編號');
  await p.reload(); await p.waitForSelector('#tabs button');
  ok(await ev(() => S.vocabV === 2 && !!S.srs.v_1118 && !S.srs.v_1149), 'E19 只轉換一次'); 
  await ev(() => go('words')); ok(/閱讀加入的單字/.test(await p.textContent('#main')), 'E17 單字本有閱讀單字');
  await ev(() => go('home'));
  // 子音字母卡：自動播放＝播動畫並念出
  await ev(() => { window.__spoken = []; startLesson('c1'); }); await p.click('[data-act=ls-next]');
  await p.waitForFunction(() => window.__spoken.includes('가'));
  ok(await ev(() => SA.isPlaying()), 'E15 子音卡自動播動畫');
  await ev(() => { S.set.auto = false; save(); go('home'); });

  // E12 名稱或內容不會被當成 HTML
  ok(await ev(() => h('<img src=x onerror=alert(1)>') === '&lt;img src=x onerror=alert(1)&gt;'), 'E12 跳脫');

  ok(errs.length === 0, 'E0 沒有錯誤：' + errs.join(' | '));
  await b.close(); srv.close();
  console.log(fail ? `e2e: ${fail}/${n} 失敗` : `e2e: ${n} 項全部通過`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
