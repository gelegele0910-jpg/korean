# CLAUDE.md

## 專案概述

「호야 韓語」：給完全沒學過韓文的大人（台灣、繁體中文介面）的韓文練習網頁。從 40 音、拼音、收音開始，再用生活主題練單字、聽力、口說。有遊戲、點數（₩）與商店換獎品（介面風格、吉祥物小老虎호야的服裝）。掛在 GitHub Pages。

- **沒有建置流程、沒有套件**：純 HTML + CSS + 原生 JavaScript。字型來自 Google Fonts（Noto Sans KR／Noto Serif KR）。
- 檔案：
  - `index.html`：骨架，依序載入下面六支 js
  - `js/hangul.js`：韓文核心（`KH`）：組字／拆字、`pronounce()` 實際發音、`romanize()` 羅馬拼音、`score()` 跟讀分數。瀏覽器是 `window.KH`，Node 可以 `require`
  - `js/data.js`：課程內容：`VOWELS`、`VOWELS2`、`CONSONANTS`、`DOUBLES`（共 40 音）、`TRIOS`、`BATCHIM`、`RULES`、`VPAIRS`（母音對比）、`VCHAINS`（嘴型連續動作）、`CTRIOS`（子音對比）、`TOPICS`、`LESSONS`
  - `js/reading.js`：TOPIK 主題單字與閱讀文章（使用者提供的 JSON 格式）：`TOPIK_TOPICS`（1 級 25 個主題，`ready`＝已完成）、`VOCAB_ID_MAP`／`ARTICLE_ID_MAP`（2026-11 重新編號的舊→新對照）、`READ_VOCAB`（TOPIK 分級核心單字 `{id:'v_xxxx', level, topic, word, pos, hanja, meaning_zh, example_ko, example_zh}`）、`READ_ARTICLES`（`{article_id, level, topic, title_ko, title_zh, sentences:[{sentence_index, speaker, ko, zh, target_words:[{surface, lemma, vocab_id}], grammar_ids}], challenge_vocab, grammar_notes}`）
  - `js/art.js`：吉祥物換裝 `mascot(wear, size, mood, cls)`：把 `img/wear/` 裡對齊好的 400×400 圖層疊起來（順序見 `WEAR_ORDER`：背景→身後特效（彩虹 `FX_BACK`）→小老虎表情→服裝→頸部→臉部貼紙→眼鏡→髮飾→帽子→手上→特效；有邊框 `frame` 時整隻縮小放在框裡）。檔名 `<欄位>-<代號>.webp`，表情 `tiger-<表情>.webp`（`EXPRS` 9 種；`MOOD` 把 normal／happy／think 對到 happy／laugh／surprise）。欄位：bg、hat、hair、face、stk、neck、outfit、hand、fx、frame。商店 `SHOP` 的 `cat` 就是 `S.wear` 的欄位，代號用 `itemKey(it)`，**不要用 id 前綴判斷欄位**（`hat:ribbon` 在髮飾、`neck:hanbok` 在服裝）；`off:true`＝沒有插畫已下架，買過的人 `migrate()` 退還點數（`S.rf` 記錄，只退一次）。`mascotSvg()` 只給 `tools/make-icons.js` 產生網站圖示用；母音嘴型 `MOUTH`／`MOUTH_SEQ`（`mouthSvg()`、`mouthHtml()`）與母音位置圖 `vowelMap()`；子音字形由來 `CSHAPE`
  - `js/speech-art.js`：子音與母音發音動畫（`window.SA`）。人物外觀是使用者提供、可公開的插畫 `img/girl.webp`（1254×1254），只有口腔用 SVG 疊上去做動畫（`drawHybrid()`，口腔座標經 `HY_T` 換算到圖片像素；`patch` 範圍蓋掉原圖的剖面與編號）。`stateAt(子音, 毫秒)` 是時間軸（準備→頂住→放開→念母音），`FAM` 是 6 個部位家族卡、`MANNERS` 是平音／送氣音／硬音卡、`closeup()` 是卡片的圓形特寫圖。對外：`SA.stage()` 產生畫面、`SA.mountAll()` 畫靜止畫面、`SA.play(svg, 子音, {slow, labels, cap, onRelease})`（播放時自動放大嘴巴，放開那一刻呼叫 `onRelease` 念字）、`SA.stop()`。減少動態時直接停在「放開」那一格。母音：`VPOSE`（舌頭四點＋下巴 `j`＋嘴唇 `r`：1 嘟圓往前、-1 拉平）、`VSEQ`（雙母音起點→終點）、`vStateAt(母音, 毫秒)`、`VFAM`（6 張母音家族卡）、`vsyl()`；`SA.play()` 子音、母音都能播，母音畫面用 `SA.stage(說明, 'v')`（不顯示子音的 ①～⑥）
  - `js/app.js`：主程式
  - `css/style.css`：樣式與 6 種介面風格
  - `tools/topik/gen.py`：產生 `js/reading.js`（TOPIK 單字與文章都寫在這裡和 `batchN.py`，**不要手改 reading.js**）。新的一批寫成 `tools/topik/batchN.py`（單字清單＋`articles(S, TITLE)`），在 gen.py 匯入並把 `ready` 範圍往後改；`ID()` 會擋下同形異義字（例如 저＝我／那）沒指定主題的情況。本批 JSON 另存到 `tools/topik/out/`（不進 git）給使用者下載
  - `img/ic/*.webp`（192×192）：使用者提供、可公開的小老虎插畫圖示，用 `pic(代號, 'sm'?)` 輸出：頁籤 `t-home`／`t-learn`／`t-games`／`t-review`／`t-me`、工具 `chart`／`builder`／`cmap`／`vwmap`、遊戲 `g-<GAMES 的 id>`。`img/hoya.webp`：首頁打招呼的小老虎（沒穿任何配件時顯示；有穿就改顯示換裝的 `mascot()`）。新增遊戲要補 `img/ic/g-代號.webp`（`check-syntax.js` 檢查）。原圖轉檔：去掉透明度很低的雜點、裁掉空白、縮到 192 存 WebP
  - `tools/wear/`：產生換裝圖層。`src/tiger.png`＝使用者提供的小老虎本體（1254），`src/items/`＝從使用者配件總覽圖切出的單件（`cut.py` 的結果；總覽圖原檔不在 repo，已裁好去背）。`blank.py` 擦掉眼睛嘴巴 → `expr.js` 畫 9 種表情 → `build.py` 依位置表（`LAYERS` 欄位代號→素材、`POS` 各欄位預設位置、`ADJ` 個別微調；一對的臉部貼紙拆左右兩半貼兩頰）輸出 `img/wear/`，`--gallery` 另存每件穿上的檢查圖到 `tools/wear/out/`。需要 numpy、scipy、opencv-python-headless、Pillow。新增配件：圖放 `src/items/` → `LAYERS` 加代號 → 跑 build 看 gallery → `SHOP` 尾端加一筆
  - `tools/make-icons.js`：由吉祥物產生 `icon.svg`、`apple-touch-icon.png`、`icon-192.png`、`icon-512.png`
  - 安裝成 App：`manifest.webmanifest`（`display: minimal-ui`；不要改成 `standalone`：iPhone 的獨立 App 模式和 Safari 不共用 localStorage，已加到主畫面的人會像資料不見）＋`sw.js`（只轉送網頁開啟、不做快取，只在 https 註冊）。Android Chrome 需要這兩個才能「安裝」（桌面圖示沒有 Chrome 小標誌）

## 部署

GitHub Pages 從 `main` 的根目錄發佈（網址 `https://gelegele0910-jpg.github.io/korean/`）。使用者同意：修改在 `node tests/run-all.js` 全部通過後，**直接推到 `main`**（不需開 PR），推上去約 1～2 分鐘網站就會更新。

## 內容規則

- **羅馬拼音不要手寫**：一律由 `KH.romanize()` 依實際發音產生（連音、鼻音化、ㅎ、流音化、顎化；硬音化只出現在 `pronounce()` 的顯示，RR 不標）。新增內容後跑 `tests/hangul.js`，它會檢查拼音只含英文字母；遇到規則處理不了的字（例如 ㄴ 添加：서울역、명동역），換一個例子，或在 `hangul.js` 加規則並在 H2 補標準答案。
- 主題：`{id, ic, t, ko, w:[[韓文, 中文]...], s:[[韓文, 中文]...], note?}`。單字 id `<主題>-w<i>`、句子 id `<主題>-s<i>`、商店 id（`分類:代號`）都是進度 key：**只能接在陣列尾端新增，不可改順序、改 id 或刪除**。
- 同一主題的單字中文意思不可重複（測驗選項會分不出來）。
- 發音規則例子 `[韓文, 中文, 常見念錯]`：念錯的不能等於正確發音。
- 母音對比 `VPAIRS`：`[母音1, 母音2, 訣竅, [[[單字1, 中文], [單字2, 中文]]...]]`，每對單字只能差這兩個母音（`tests/hangul.js` H6 檢查）。新增母音時 `MOUTH` 或 `MOUTH_SEQ` 要有嘴型。
- 子音對比 `CTRIOS`：`[[子音...], 訣竅, [[[單字, 中文], ...], ...]]`，同一組單字只差那組子音（H7 檢查）；每個子音都要有 `SA.C`（部位＋出氣方式）與 `CSHAPE`，`SA.FAM` 每個子音剛好出現一次。
- 換人物圖時要重新對齊 `HY_KX`／`HY_KY`／`HY_X`／`HY_Y`（嘴唇、上顎、喉嚨後壁、舌頭底部要對準）與 `patch` 範圍，並看一次全臉與放大的截圖。
- TOPIK 單字編號：1 級每個主題固定 34 個字的區段，主題 n＝`v_(1001+(n-1)×34)`～+33（01＝v_1001～v_1034…25＝v_1817～v_1850）；`topic` 欄位要等於區段的主題名稱，同一個字（字＋意思）不可重複出現在兩個主題。主題 n 的文章 id 是 `art_1NN`（例如 art_105、art_112），文法 id 是 `g_(100+2n-1)`、`g_(100+2n)`。一次做 5 個主題，給使用者看過再上線；做完一個主題把 `ready` 改成 true（R5 會檢查 34 個字與文章）。之前飲食的 30 個字放在主題 10～13 的區段開頭；主題 23 的 1～7 是 먹다、마시다、가다、오다、보다、듣다、하다（batch4 的 `PRE23`），8～34 在 batch5（`START[23]=8`）。1 級 25 個主題已全部完成（850 字）。`batch5.AUTO` 是常用字（그리고、그래서、지금、오늘、좋아요…）：gen.py 的 `autolink()` 會把所有文章裡一模一樣、還沒標的詞自動補成可點的單字。同形異義字（이＝二／這／牙齒、눈＝雪／眼睛、배＝船／梨／肚子…）在文章裡要用 `('surface','lemma',主題)` 指定。
- 閱讀文章：`target_words` 的 `surface` 必須照順序出現在 `ko` 裡（前端靠它切出可點的單字），`lemma` 要等於單字庫的 `word`；清單單字比例 ≥85%、+1 挑戰單字 2～3 個且高一級（`tests/hangul.js` R1～R4 檢查）。`READ_VOCAB` 的 id 與文章 id 是複習進度 key，不可改；+1 單字的複習 key 是「文章id:new_xx」。新文章接在 `READ_ARTICLES` 尾端。
- `LESSONS` 的進度以 id 記錄，可以插在中間（顯示順序＝建議學習順序），但 id 不可改。

## 架構重點

- 全域狀態：`S`（進度，存 localStorage key `hoya-korean-v1`）、`U`（介面狀態）。`render()` 依 `U.view` 呼叫 `VIEWS` 裡的 `vXxx()` 回傳 HTML；切畫面用 `go(v)`（會關麥克風、停語音、停計時）。
- 事件委派：元素加 `data-act`，處理函式在 `ACT`。輸出文字一律經 `h()` 跳脫。
- 課程：`buildLesson()` 產生步驟（`intro`、`letter`、`trio`、`vmap`、`vchain`、`vpair`、`cplace`、`cair`、`ctrio`、`syl`、`bat`、`bpair`、`rule`、`word`、`sent`、`quiz`），測驗用 `mkQuiz()`；聽力題答完 `cmpHtml()` 讓學生逐一播放韓文選項比較。
- 進度：`S.done[課程]`、`S.srs[單字id] = {l, d(dayNo), m}`（間隔 `SRS_INT`）、`S.log["YYYY-M-D"] = {l 課, g 遊戲, s 跟讀, r 複習}`、`S.streak`、`S.day`（每日：簽到、任務、遊戲第一次、跟讀加分），`resetDay()` 換日重置。
- 點數：只能用 `earn()` 加；購買要點兩次（`U.arm`）。新增欄位要在 `newProg()` 加預設值，`migrate()` 會補齊舊資料並修正壞資料（負數、沒買的風格／配件）。
- 語音：`speak()`（`ko-KR`，優先挑 Google／Yuna 等聲音）；辨識 `startRec()` 同時只開一個，`abortRec()` 關掉，舊的結果不可蓋掉新的。
- 發音檢查「念給 App 聽」（`checkHtml(key, 對比單字組)`，狀態在 `U.ck`）：用語音辨識的所有候選，`judgeSay()` 依可能性順序先碰到目標字＝念對、先碰到同組其他字＝念成那個字，`ckHint()` 依兩字差的字母給提示（平音／送氣／硬音、圓唇／拉平…）。念對每個字每天 +10。與錄音互斥：開始一個就停掉另一個。
- 發音動畫在 app 裡：`saBox(字母...)`（一個畫面＋按鈕；母音會加左上角的正面嘴型 `.sa-mouth`）、`cmapHtml(full)`（子音發音地圖，`cplace` 步驟與 `cmap` 畫面共用）、`vmapHtml(full)`（母音發音地圖，`vmap` 步驟與 `vwmap` 畫面共用）、`saPlay(scope, 字母)`；按鈕是 `data-act="sa-play"`，同一個 `data-sa-scope` 裡找畫面。`render()` 會先 `SA.stop()` 再 `SA.mountAll()`；子音與母音字母卡的自動播放改成播動畫（子音在放開時、母音在擺好嘴型時念字）。
- 學習頁 `vLearn()` 順序：① 基礎發音（工具格子＋`sec:'基礎發音'` 的課）→ ② 旅遊實用會話（原本叫生活主題，`TOPICS` 的課）→ ③ TOPIK 專欄（一張收起來的卡，`tk-open`）。TOPIK 專欄 `vTopik()`：`U.tlv` 空＝1～4 級（`TOPIK_LV`，沒有主題的級數顯示準備中），有值＝那一級的主題格子；主題頁返回該級列表（`tk-lv`）。基礎發音沒做完會顯示提示（`pronLeft()`），不擋。
- 說明文字裡夾的韓文用 `koRuby(文字)` 輸出（會跳脫）：每段韓文上方加 `KH.romanize()` 的小字拼音（`<ruby>`，跟著 `S.set.rr`：顯示／點一下才看／不顯示），點了念出來。用在文法筆記（pattern、meaning、explanation）與會話課的 note；新增中文說明含韓文的地方也用它。
- 主題畫面 `vTopic()`（`U.tp` 主題編號、`U.tpx` 展開例句的單字）：單字列表（發音、例句、單一／全部加入複習）＋文章入口；「學習」頁的主題格子（`tpWords()`、`tpArticle()`）。`migrate()` 依 `S.vocabV` 只做一次舊編號轉換。
- 閱讀畫面 `vArticle()`（狀態 `U.rd = {id, si, wi, zh, allZh, ex}`）：`rdSegs()` 依 `target_words` 切句子，點單字（`rd-word`）顯示 `rdCard()`——電腦版在右側固定，手機版從下方滑出（例句收在「例句 ▾」）。`rd-add` 加入 `S.srs`（當天到期）。閱讀單字放在 `RWORD`，並併入 `WORD` 查詢表（不加進主題遊戲用的 `WORDS`），所以複習、單字本都能用。
- 錄自己的聲音（`myRecHtml(key, 標準句)`、`myStart()`／`myStop()`，狀態在 `U.my`）：MediaRecorder，最長 5 秒，錄完自動播放並記一次跟讀；換步驟、切畫面、切到背景一律 `myStop(true)` 丟掉並關麥克風。
- 介面風格：`body[data-skin]` 切換 CSS 變數，深色是 `night`、`neon`；新樣式一律用變數（`--ink`、`--card`、`--accent`、`--r`…）。
- 手機為主：最小 320 寬；格子用 `repeat(auto-fill, minmax(...))`；1000 寬以上頁籤移到左側。

## 測試

```bash
node tests/run-all.js
```

| 腳本 | 內容 |
|---|---|
| `check-syntax.js` | js 語法、index.html 引用的檔案存在、人物插畫 `img/girl.webp` 存在且是 WebP |
| `hangul.js` | TOPIK 單字（編號在所屬主題區段、完成的主題 34 字＋文章、不重複、舊編號對照）、閱讀文章資料（surface 照順序找得到、lemma／vocab_id 對得上、清單單字比例、+1 單字、文法筆記）、11172 字組字往返、羅馬拼音與實際發音標準答案、數字、跟讀分數（所有課程句 100 分、隨機輸入範圍）、課程內容完整性、母音／子音對比單字只差那個字母、每個母音有嘴型、每個子音有動畫資料與字形由來、每個子音與母音每個時間點都畫得出來、每個字母剛好屬於一張家族卡 |
| `e2e.js` | 用點的上完所有課、5 種遊戲與點數、任務簽到不重複、跟讀（假麥克風）、換日複習、商店兩段確認與點數不為負、6 風格、設定、備份匯入、壞資料、母音特訓（位置圖、嘴型、錄自己的聲音＝假 MediaRecorder、答完比較）、子音特訓與念給 App 聽（念對／念成同組別的字＋提示／無關的字／沒聲音、每日只加一次點數、與錄音互斥、晚到的辨識結果不出現）、子音發音地圖（圖片載入、19 個子音都會播放並念出、慢動作、離開畫面停止、子音卡自動播動畫）、母音發音地圖（21 個母音都會播放並念出、正面嘴型）、閱讀文章（點變化形顯示原型解釋、+1 挑戰單字、加入複習並當天到期、翻譯、文法、重新整理保留、複習與單字本）、TOPIK 主題頁（34 字、例句、單一／全部加入複習、文章入口與返回）、舊編號的複習進度轉換（只做一次） |
| `mobile.js` | 所有畫面 × 7 種尺寸（320～1440）× 淺深風格：不可超出螢幕、文字擠出、被頁籤擋住；`--shots` 存 320 寬截圖到 `tests/output/` |

修改後一律跑完全部測試；新增畫面要加進 `mobile.js` 的 `SCENES`，新增流程加進 `e2e.js`。測試用 `blockExternal(page)` 擋掉外部請求；語音播放與真實麥克風在無頭瀏覽器裡無法驗證，回報時要註明。
