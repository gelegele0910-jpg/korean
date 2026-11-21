// 版面檢查：每個畫面 × 多種螢幕寬度，不可超出螢幕、按鈕文字不可擠出、彈出視窗要在螢幕內。--shots 另存 320 寬截圖到 tests/output/
const { chromium } = require('playwright');
const { start, blockExternal } = require('./server.js');
const path = require('path'), fs = require('fs');
const SHOTS = process.argv.includes('--shots');
const OUT = path.join(__dirname, 'output'); if (SHOTS) fs.mkdirSync(OUT, { recursive: true });
const SIZES = [[320, 568], [360, 740], [375, 667], [414, 896], [768, 1024], [1024, 768], [1440, 900]];
const lessonAt = (id, k) => `startLesson('${id}'); U.ls.i = U.ls.steps.findIndex(s => s.k === '${k}'); render();`;
const SCENES = {
  home: "S.coins=123456; S.streak={last:today(),count:120,best:120}; go('home')", learn: "go('learn')", chart: "go('chart')",
  builder: "U.bd={l:'ㄲ',v:'ㅙ',t:'ㄳ'}; U.moreT=true; go('builder')", intro: "startLesson('t-num')",
  letter: lessonAt('c2', 'letter'), trio: lessonAt('c2', 'trio'), syl: lessonAt('sy', 'syl'), bat: lessonAt('b1', 'bat'), bpair: lessonAt('b1', 'bpair'),
  rule: lessonAt('r1', 'rule'), cplace: lessonAt('cs', 'cplace'), cair: lessonAt('cs', 'cair'), ctrio: lessonAt('cs', 'ctrio'),
  ctrioRes: lessonAt('cs', 'ctrio') + " U.ck={key:'ct-ㄷㅌㄸ', si:1, wi:2, r:{kind:'rival', heard:'턱', rival:['턱','下巴'], hint:'不要吐氣，喉嚨繃緊、短短的。'}}; render();",
  ctrioOk: lessonAt('cs', 'ctrio') + " U.ck={key:'ct-ㄷㅌㄸ', si:0, wi:0, r:{kind:'ok', heard:'달'}, gain:10}; render();",
  consCard: "startLesson('c2'); U.ls.i = U.ls.steps.findIndex(s => s.k==='letter' && s.x.j==='ㅉ'); render();", vmap: lessonAt('v3', 'vmap'), vchain: lessonAt('v3', 'vchain'), vpair: lessonAt('v3', 'vpair'),
  vpairRec: lessonAt('v3', 'vpair') + " U.my={key:'p-ㅓㅗ', url:'blob:x'}; render();",
  vowelSeq: "startLesson('v2'); U.ls.i = U.ls.steps.findIndex(s => s.k==='letter' && s.x.j==='ㅙ'); render();",
  vowelCmp: "startGame('hear','v'); const q=U.g.qs[0]; q.picked=(q.ans+1)%q.opts.length; render();", word: "startLesson('t-cafe'); U.ls.i = U.ls.steps.findIndex(s => s.k==='word' && s.w.ko.length > 6); render();",
  sent: "startLesson('t-go'); U.ls.i = U.ls.steps.findIndex(s => s.k==='sent'); U.sp={id:U.ls.steps[U.ls.i].s.id, sc:72, heard:'택시 공항으로 가 주세요 정말 고마워요', gain:20}; render();",
  quiz: "startLesson('t-hello'); U.ls.i = U.ls.steps.length-1; U.ls.steps[U.ls.i].picked=(U.ls.steps[U.ls.i].ans+1)%U.ls.steps[U.ls.i].opts.length; render();",
  done: "startLesson('v1'); U.ls.ok=8; U.ls.n=8; U.ls.gain=140; U.ls.first=true; go('done')",
  games: "S.best={hear:10,quick:33}; go('games')", hearPick: "startGame('hear')", hear: "startGame('hear','c')",
  build: "startGame('build'); const q=U.g.qs[0]; q.sel={l:q.s.l,v:q.s.v,t:q.s.t}; q.res='ng'; render();",
  match: "startGame('match'); U.g.open=[0,1]; render();", quick: "startGame('quick'); stopQuick();",
  order: "startGame('order'); const q=U.g.qs[0]; q.put=q.chips.splice(0,2); render();",
  gameEnd: "startGame('hear','v'); U.g.ok=10; U.g.gain=180; U.g.first=true; U.g.end=true; render();",
  reviewEmpty: "go('review')", review: "WORDS.forEach(w=>S.srs[w.id]={l:0,d:0,m:0}); startReview(); U.rv.show=true; render();",
  reviewDone: "startReview(); U.rv.i=U.rv.ids.length; U.rv.gain=200; render();",
  words: "WORDS.forEach((w,i)=>S.srs[w.id]={l:i%5,d:0,m:i%3===0?1:0}); go('words')",
  shop: "S.coins=900; U.meTab='shop'; U.shopCat='skin'; U.arm='skin:hanji'; go('me')", shopHat: "S.coins=99999; U.meTab='shop'; U.shopCat='hand'; go('me')",
  stats: "U.meTab='stats'; go('me')", settings: "U.meTab='set'; U.arm='reset'; go('me')",
  pop: "U.pops=[{ic:'🔥',t:'連續學習 100 天！',x:'太厲害了！送你 ₩10,000。',mood:'happy'}]; render();",
};
(async () => {
  const srv = await start(); const b = await chromium.launch();
  let fail = 0, n = 0; const errs = [];
  for (const [w, hgt] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: hgt } }); await blockExternal(p);
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.speechSynthesis.speak = () => {}; });
    await p.goto(srv.url); await p.waitForSelector('#tabs button');
    for (const skin of ['fresh', 'neon']) for (const [name, code] of Object.entries(SCENES)) {
      await p.evaluate(([c, sk]) => { localStorage.clear(); S = newProg(); S.own['skin:' + sk] = 1; S.skin = sk; U.pops = []; U.arm = ''; eval(c); }, [code, skin]);
      const probs = await p.evaluate(() => {
        const out = [], W = innerWidth, H = innerHeight;
        if (document.documentElement.scrollWidth > W + 1) out.push('水平捲動 ' + document.documentElement.scrollWidth);
        for (const el of document.querySelectorAll('#main *, #top *, #sheet *')) {
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
          if (el.closest('svg') && el.tagName !== 'svg') continue;
          if (r.right > W + 1 || r.left < -1) { out.push('超出螢幕 ' + el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '~' + Math.round(r.right)); break; }
        }
        for (const el of document.querySelectorAll('.btn, .opt, .tile, .chip, .pill, .lesson, .say, .cats button, .seg button, .jamo button, .mcard, .item, .koline')) {
          if (el.scrollWidth > el.clientWidth + 2) { out.push('內容擠出 ' + el.className + ' 「' + el.textContent.trim().slice(0, 20) + '」'); }
        }
        const box = document.querySelector('#sheet:not(.hide) .box');
        if (box) { const r = box.getBoundingClientRect(); if (r.top < 0 || r.bottom > H + 1) out.push('彈出視窗超出螢幕'); }
        // 最後一個按鈕捲到底時不能被底部頁籤擋住
        const tabs = document.querySelector('#tabs').getBoundingClientRect();
        const side = getComputedStyle(document.querySelector('#tabs')).top === '0px';
        window.scrollTo(0, document.documentElement.scrollHeight);
        const all = [...document.querySelectorAll('#main button')].filter(x => x.getBoundingClientRect().height);
        const last = all[all.length - 1];
        if (last && !side && last.getBoundingClientRect().bottom > tabs.top + 1) out.push('最後的按鈕被底部頁籤擋住');
        window.scrollTo(0, 0);
        return out;
      });
      n++;
      if (probs.length) { fail++; console.log(`  ✗ ${w}px ${skin} ${name}：${uniqStr(probs)}`); }
      if (SHOTS && w === 320) await p.screenshot({ path: path.join(OUT, `${skin}-${name}.png`), fullPage: true });
    }
    await p.close();
  }
  if (errs.length) { fail++; console.log('  ✗ 錯誤：', [...new Set(errs)].join(' | ')); }
  await b.close(); srv.close();
  console.log(fail ? `mobile: ${fail}/${n} 失敗` : `mobile: ${n} 個畫面全部通過`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
function uniqStr(a) { return [...new Set(a)].slice(0, 4).join('；'); }
