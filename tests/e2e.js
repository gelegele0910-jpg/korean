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
      if (window.__heard == null) { me.onerror && me.onerror({ error: 'no-speech' }); me.onend && me.onend(); return; }
      const alt = [{ transcript: window.__heard }]; me.onresult && me.onresult({ results: [alt] }); me.onend && me.onend(); }, 30); }
    stop() {} abort() {} }
  window.SpeechRecognition = FakeRec;
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
  // E12 名稱或內容不會被當成 HTML
  ok(await ev(() => h('<img src=x onerror=alert(1)>') === '&lt;img src=x onerror=alert(1)&gt;'), 'E12 跳脫');

  ok(errs.length === 0, 'E0 沒有錯誤：' + errs.join(' | '));
  await b.close(); srv.close();
  console.log(fail ? `e2e: ${fail}/${n} 失敗` : `e2e: ${n} 項全部通過`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
