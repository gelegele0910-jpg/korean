# CLAUDE.md

## 專案概述

「호야 韓語」：給完全沒學過韓文的大人（台灣、繁體中文介面）的韓文練習網頁。從 40 音、拼音、收音開始，再用生活主題練單字、聽力、口說。有遊戲、點數（₩）與商店換獎品（介面風格、吉祥物小老虎호야的服裝）。掛在 GitHub Pages。

- **沒有建置流程、沒有套件**：純 HTML + CSS + 原生 JavaScript。字型來自 Google Fonts（Noto Sans KR／Noto Serif KR）。
- 檔案：
  - `index.html`：骨架，依序載入下面五支 js
  - `js/hangul.js`：韓文核心（`KH`）：組字／拆字、`pronounce()` 實際發音、`romanize()` 羅馬拼音、`score()` 跟讀分數。瀏覽器是 `window.KH`，Node 可以 `require`
  - `js/data.js`：課程內容：`VOWELS`、`VOWELS2`、`CONSONANTS`、`DOUBLES`（共 40 音）、`TRIOS`、`BATCHIM`、`RULES`、`VPAIRS`（母音對比）、`VCHAINS`（嘴型連續動作）、`CTRIOS`（子音對比）、`TOPICS`、`LESSONS`
  - `js/art.js`：吉祥物 `mascot(wear, size, mood)`（平面色塊 SVG，mood：normal／happy／think）、配件 `MA_HAT`／`MA_FACE`／`MA_NECK`／`MA_HAND`／`MA_BG`、商店 `SHOP`；母音嘴型 `MOUTH`／`MOUTH_SEQ`（`mouthSvg()`、`mouthHtml()`）與母音位置圖 `vowelMap()`；子音字形由來 `CSHAPE`
  - `js/speech-art.js`：子音發音動畫（`window.SA`）。人物外觀是使用者提供、可公開的插畫 `img/girl.webp`（1254×1254），只有口腔用 SVG 疊上去做動畫（`drawHybrid()`，口腔座標經 `HY_T` 換算到圖片像素；`patch` 範圍蓋掉原圖的剖面與編號）。`stateAt(子音, 毫秒)` 是時間軸（準備→頂住→放開→念母音），`FAM` 是 6 個部位家族卡、`MANNERS` 是平音／送氣音／硬音卡、`closeup()` 是卡片的圓形特寫圖。對外：`SA.stage()` 產生畫面、`SA.mountAll()` 畫靜止畫面、`SA.play(svg, 子音, {slow, labels, cap, onRelease})`（播放時自動放大嘴巴，放開那一刻呼叫 `onRelease` 念字）、`SA.stop()`。減少動態時直接停在「放開」那一格
  - `js/app.js`：主程式
  - `css/style.css`：樣式與 6 種介面風格
  - `tools/make-icons.js`：由吉祥物產生 `icon.svg`、`apple-touch-icon.png`

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
- `LESSONS` 的進度以 id 記錄，可以插在中間（顯示順序＝建議學習順序），但 id 不可改。

## 架構重點

- 全域狀態：`S`（進度，存 localStorage key `hoya-korean-v1`）、`U`（介面狀態）。`render()` 依 `U.view` 呼叫 `VIEWS` 裡的 `vXxx()` 回傳 HTML；切畫面用 `go(v)`（會關麥克風、停語音、停計時）。
- 事件委派：元素加 `data-act`，處理函式在 `ACT`。輸出文字一律經 `h()` 跳脫。
- 課程：`buildLesson()` 產生步驟（`intro`、`letter`、`trio`、`vmap`、`vchain`、`vpair`、`cplace`、`cair`、`ctrio`、`syl`、`bat`、`bpair`、`rule`、`word`、`sent`、`quiz`），測驗用 `mkQuiz()`；聽力題答完 `cmpHtml()` 讓學生逐一播放韓文選項比較。
- 進度：`S.done[課程]`、`S.srs[單字id] = {l, d(dayNo), m}`（間隔 `SRS_INT`）、`S.log["YYYY-M-D"] = {l 課, g 遊戲, s 跟讀, r 複習}`、`S.streak`、`S.day`（每日：簽到、任務、遊戲第一次、跟讀加分），`resetDay()` 換日重置。
- 點數：只能用 `earn()` 加；購買要點兩次（`U.arm`）。新增欄位要在 `newProg()` 加預設值，`migrate()` 會補齊舊資料並修正壞資料（負數、沒買的風格／配件）。
- 語音：`speak()`（`ko-KR`，優先挑 Google／Yuna 等聲音）；辨識 `startRec()` 同時只開一個，`abortRec()` 關掉，舊的結果不可蓋掉新的。
- 發音檢查「念給 App 聽」（`checkHtml(key, 對比單字組)`，狀態在 `U.ck`）：用語音辨識的所有候選，`judgeSay()` 依可能性順序先碰到目標字＝念對、先碰到同組其他字＝念成那個字，`ckHint()` 依兩字差的字母給提示（平音／送氣／硬音、圓唇／拉平…）。念對每個字每天 +10。與錄音互斥：開始一個就停掉另一個。
- 子音發音動畫在 app 裡：`saBox(子音...)`（一個畫面＋子音按鈕）、`cmapHtml(full)`（發音地圖，`cplace` 步驟與 `cmap` 畫面共用）、`saPlay(scope, 子音)`；按鈕是 `data-act="sa-play"`，同一個 `data-sa-scope` 裡找畫面。`render()` 會先 `SA.stop()` 再 `SA.mountAll()`；子音字母卡的自動播放改成播動畫（動畫放開時念字）。
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
| `hangul.js` | 11172 字組字往返、羅馬拼音與實際發音標準答案、數字、跟讀分數（所有課程句 100 分、隨機輸入範圍）、課程內容完整性、母音／子音對比單字只差那個字母、每個母音有嘴型、每個子音有動畫資料與字形由來、每個子音每個時間點都畫得出來 |
| `e2e.js` | 用點的上完所有課、5 種遊戲與點數、任務簽到不重複、跟讀（假麥克風）、換日複習、商店兩段確認與點數不為負、6 風格、設定、備份匯入、壞資料、母音特訓（位置圖、嘴型、錄自己的聲音＝假 MediaRecorder、答完比較）、子音特訓與念給 App 聽（念對／念成同組別的字＋提示／無關的字／沒聲音、每日只加一次點數、與錄音互斥、晚到的辨識結果不出現）、子音發音地圖（圖片載入、19 個子音都會播放並念出、慢動作、離開畫面停止、子音卡自動播動畫） |
| `mobile.js` | 所有畫面 × 7 種尺寸（320～1440）× 淺深風格：不可超出螢幕、文字擠出、被頁籤擋住；`--shots` 存 320 寬截圖到 `tests/output/` |

修改後一律跑完全部測試；新增畫面要加進 `mobile.js` 的 `SCENES`，新增流程加進 `e2e.js`。測試用 `blockExternal(page)` 擋掉外部請求；語音播放與真實麥克風在無頭瀏覽器裡無法驗證，回報時要註明。
