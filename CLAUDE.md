# CLAUDE.md

## 專案概述

「호야 韓語」：給完全沒學過韓文的大人（台灣、繁體中文介面）的韓文練習網頁。從 40 音、拼音、收音開始，再用生活主題練單字、聽力、口說。有遊戲、點數（₩）與商店換獎品（介面風格、吉祥物小老虎호야的服裝）。掛在 GitHub Pages。

- **沒有建置流程、沒有套件**：純 HTML + CSS + 原生 JavaScript。字型來自 Google Fonts（Noto Sans KR／Noto Serif KR）。
- 檔案：
  - `index.html`：骨架，依序載入下面四支 js
  - `js/hangul.js`：韓文核心（`KH`）：組字／拆字、`pronounce()` 實際發音、`romanize()` 羅馬拼音、`score()` 跟讀分數。瀏覽器是 `window.KH`，Node 可以 `require`
  - `js/data.js`：課程內容：`VOWELS`、`VOWELS2`、`CONSONANTS`、`DOUBLES`（共 40 音）、`TRIOS`、`BATCHIM`、`RULES`、`VPAIRS`（母音對比）、`VCHAINS`（嘴型連續動作）、`TOPICS`、`LESSONS`
  - `js/art.js`：吉祥物 `mascot(wear, size, mood)`（平面色塊 SVG，mood：normal／happy／think）、配件 `MA_HAT`／`MA_FACE`／`MA_NECK`／`MA_HAND`／`MA_BG`、商店 `SHOP`；母音嘴型 `MOUTH`／`MOUTH_SEQ`（`mouthSvg()`、`mouthHtml()`）與母音位置圖 `vowelMap()`
  - `js/app.js`：主程式
  - `css/style.css`：樣式與 6 種介面風格
  - `tools/make-icons.js`：由吉祥物產生 `icon.svg`、`apple-touch-icon.png`

## 內容規則

- **羅馬拼音不要手寫**：一律由 `KH.romanize()` 依實際發音產生（連音、鼻音化、ㅎ、流音化、顎化；硬音化只出現在 `pronounce()` 的顯示，RR 不標）。新增內容後跑 `tests/hangul.js`，它會檢查拼音只含英文字母；遇到規則處理不了的字（例如 ㄴ 添加：서울역、명동역），換一個例子，或在 `hangul.js` 加規則並在 H2 補標準答案。
- 主題：`{id, ic, t, ko, w:[[韓文, 中文]...], s:[[韓文, 中文]...], note?}`。單字 id `<主題>-w<i>`、句子 id `<主題>-s<i>`、商店 id（`分類:代號`）都是進度 key：**只能接在陣列尾端新增，不可改順序、改 id 或刪除**。
- 同一主題的單字中文意思不可重複（測驗選項會分不出來）。
- 發音規則例子 `[韓文, 中文, 常見念錯]`：念錯的不能等於正確發音。
- 母音對比 `VPAIRS`：`[母音1, 母音2, 訣竅, [[[單字1, 中文], [單字2, 中文]]...]]`，每對單字只能差這兩個母音（`tests/hangul.js` H6 檢查）。新增母音時 `MOUTH` 或 `MOUTH_SEQ` 要有嘴型。
- `LESSONS` 的進度以 id 記錄，可以插在中間（顯示順序＝建議學習順序），但 id 不可改。

## 架構重點

- 全域狀態：`S`（進度，存 localStorage key `hoya-korean-v1`）、`U`（介面狀態）。`render()` 依 `U.view` 呼叫 `VIEWS` 裡的 `vXxx()` 回傳 HTML；切畫面用 `go(v)`（會關麥克風、停語音、停計時）。
- 事件委派：元素加 `data-act`，處理函式在 `ACT`。輸出文字一律經 `h()` 跳脫。
- 課程：`buildLesson()` 產生步驟（`intro`、`letter`、`trio`、`vmap`、`vchain`、`vpair`、`syl`、`bat`、`bpair`、`rule`、`word`、`sent`、`quiz`），測驗用 `mkQuiz()`；聽力題答完 `cmpHtml()` 讓學生逐一播放韓文選項比較。
- 進度：`S.done[課程]`、`S.srs[單字id] = {l, d(dayNo), m}`（間隔 `SRS_INT`）、`S.log["YYYY-M-D"] = {l 課, g 遊戲, s 跟讀, r 複習}`、`S.streak`、`S.day`（每日：簽到、任務、遊戲第一次、跟讀加分），`resetDay()` 換日重置。
- 點數：只能用 `earn()` 加；購買要點兩次（`U.arm`）。新增欄位要在 `newProg()` 加預設值，`migrate()` 會補齊舊資料並修正壞資料（負數、沒買的風格／配件）。
- 語音：`speak()`（`ko-KR`，優先挑 Google／Yuna 等聲音）；辨識 `startRec()` 同時只開一個，`abortRec()` 關掉，舊的結果不可蓋掉新的。
- 錄自己的聲音（`myRecHtml(key, 標準句)`、`myStart()`／`myStop()`，狀態在 `U.my`）：MediaRecorder，最長 5 秒，錄完自動播放並記一次跟讀；換步驟、切畫面、切到背景一律 `myStop(true)` 丟掉並關麥克風。
- 介面風格：`body[data-skin]` 切換 CSS 變數，深色是 `night`、`neon`；新樣式一律用變數（`--ink`、`--card`、`--accent`、`--r`…）。
- 手機為主：最小 320 寬；格子用 `repeat(auto-fill, minmax(...))`；1000 寬以上頁籤移到左側。

## 測試

```bash
node tests/run-all.js
```

| 腳本 | 內容 |
|---|---|
| `check-syntax.js` | js 語法、index.html 引用的檔案存在 |
| `hangul.js` | 11172 字組字往返、羅馬拼音與實際發音標準答案、數字、跟讀分數（所有課程句 100 分、隨機輸入範圍）、課程內容完整性、母音對比單字只差一個母音、每個母音都有嘴型 |
| `e2e.js` | 用點的上完所有課、5 種遊戲與點數、任務簽到不重複、跟讀（假麥克風）、換日複習、商店兩段確認與點數不為負、6 風格、設定、備份匯入、壞資料、母音特訓（位置圖、嘴型、錄自己的聲音＝假 MediaRecorder、答完比較） |
| `mobile.js` | 所有畫面 × 7 種尺寸（320～1440）× 淺深風格：不可超出螢幕、文字擠出、被頁籤擋住；`--shots` 存 320 寬截圖到 `tests/output/` |

修改後一律跑完全部測試；新增畫面要加進 `mobile.js` 的 `SCENES`，新增流程加進 `e2e.js`。測試用 `blockExternal(page)` 擋掉外部請求；語音播放與真實麥克風在無頭瀏覽器裡無法驗證，回報時要註明。
