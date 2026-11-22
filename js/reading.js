/* ================= TOPIK 單字與閱讀文章（i+1 可理解輸入） =================
 * TOPIK_TOPICS：主題（1 級 25 個，每個主題固定 34 個字的編號區段：主題 n＝v_(1001+(n-1)×34)～+33）。ready＝已完成。
 * READ_VOCAB：單字 {id, level, topic, word, pos, hanja, meaning_zh, example_ko, example_zh}；id 是複習進度 key，不可改。
 * READ_ARTICLES：文章；target_words 的 surface 必須照順序出現在句子裡，vocab_id 指向 READ_VOCAB 或該篇的 challenge_vocab（+1 生字）。
 * VOCAB_ID_MAP：舊編號 → 新編號（2026-11 重新編號，migrate() 會把複習進度換過去）。
 * 檢查：tests/hangul.js 的 R1～R5。 */
const TOPIK_TOPICS = [{"no": 1, "level": 1, "title": "自我介紹與國籍職業", "desc": "問候、名字、學生/上班族、各國名稱", "ids": ["v_1001", "v_1034"], "ready": true}, {"no": 2, "level": 1, "title": "家庭成員與稱謂", "desc": "父母、兄弟姊妹、爺爺奶奶、基本人稱", "ids": ["v_1035", "v_1068"], "ready": true}, {"no": 3, "level": 1, "title": "數字與日期（漢字詞數字）", "desc": "年月日、星期、電話號碼、樓層", "ids": ["v_1069", "v_1102"], "ready": true}, {"no": 4, "level": 1, "title": "時間與作息（固有詞數字）", "desc": "幾點幾分、早上/晚上、起床/睡覺", "ids": ["v_1103", "v_1136"], "ready": true}, {"no": 5, "level": 1, "title": "教室與文具用品", "desc": "書桌、鉛筆、課本、老師/同學、上課", "ids": ["v_1137", "v_1170"], "ready": true}, {"no": 6, "level": 1, "title": "居家空間與基本家具", "desc": "客廳、房間、床、電視、冰箱", "ids": ["v_1171", "v_1204"], "ready": true}, {"no": 7, "level": 1, "title": "位置與方位介詞", "desc": "上面、下面、裡面、旁邊、對面", "ids": ["v_1205", "v_1238"], "ready": true}, {"no": 8, "level": 1, "title": "常見交通工具", "desc": "公車、地鐵、計程車、飛機、走路", "ids": ["v_1239", "v_1272"], "ready": true}, {"no": 9, "level": 1, "title": "問路與城市地標", "desc": "學校、醫院、銀行、郵局、直走/左轉", "ids": ["v_1273", "v_1306"], "ready": true}, {"no": 10, "level": 1, "title": "咖啡廳與飲料點餐", "desc": "美式咖啡、拿鐵、果汁、冰的/熱的、一杯", "ids": ["v_1307", "v_1340"], "ready": true}, {"no": 11, "level": 1, "title": "韓國常見平民美食", "desc": "拌飯、烤肉、泡菜、拉麵、辣炒年糕", "ids": ["v_1341", "v_1374"], "ready": true}, {"no": 12, "level": 1, "title": "餐廳點餐與口味形容", "desc": "菜單、好吃/不好吃、辣、甜、鹹", "ids": ["v_1375", "v_1408"], "ready": true}, {"no": 13, "level": 1, "title": "水果與生鮮食材", "desc": "蘋果、香蕉、肉、魚、牛奶、麵包", "ids": ["v_1409", "v_1442"], "ready": true}, {"no": 14, "level": 1, "title": "超市購物與貨幣單位", "desc": "多少錢、便宜/貴、買、給、韓國貨幣", "ids": ["v_1443", "v_1476"], "ready": true}, {"no": 15, "level": 1, "title": "基礎服飾與配件", "desc": "衣服、褲子、鞋子、帽子、眼鏡、穿/戴", "ids": ["v_1477", "v_1510"], "ready": true}, {"no": 16, "level": 1, "title": "顏色與外觀形容詞", "desc": "紅黃藍黑白、大/小、長/短、漂亮", "ids": ["v_1511", "v_1544"], "ready": true}, {"no": 17, "level": 1, "title": "四季與基礎天氣", "desc": "春夏秋冬、晴天、下雨、下雪、冷/熱", "ids": ["v_1545", "v_1578"], "ready": true}, {"no": 18, "level": 1, "title": "週末休閒與基本興趣", "desc": "看電影、聽音樂、運動、看書、睡覺", "ids": ["v_1579", "v_1612"], "ready": true}, {"no": 19, "level": 1, "title": "基礎球類與常見運動", "desc": "足球、籃球、游泳、登山、散步", "ids": ["v_1613", "v_1646"], "ready": true}, {"no": 20, "level": 1, "title": "身體部位與基礎外觀", "desc": "頭、眼睛、鼻子、嘴巴、手、腳、高/矮", "ids": ["v_1647", "v_1680"], "ready": true}, {"no": 21, "level": 1, "title": "基礎情緒與心理狀態", "desc": "開心、難過、生氣、累、忙、無聊", "ids": ["v_1681", "v_1714"], "ready": false}, {"no": 22, "level": 1, "title": "電話聯絡與約定時間", "desc": "打電話、傳簡訊、見面、等一下、遲到", "ids": ["v_1715", "v_1748"], "ready": false}, {"no": 23, "level": 1, "title": "常用高頻基礎動詞（動作篇）", "desc": "去、來、吃、喝、看、聽、寫、讀", "ids": ["v_1749", "v_1782"], "ready": false}, {"no": 24, "level": 1, "title": "常用高頻基礎形容詞（狀態篇）", "desc": "好、壞、多、少、快、慢、難、簡單", "ids": ["v_1783", "v_1816"], "ready": false}, {"no": 25, "level": 1, "title": "基礎時間副詞與連接詞", "desc": "今天、明天、昨天、現在、然後、但是", "ids": ["v_1817", "v_1850"], "ready": false}];

const VOCAB_ID_MAP = {"v_1029": "v_1118", "v_1011": "v_1307", "v_1003": "v_1308", "v_1022": "v_1309", "v_1001": "v_1341", "v_1002": "v_1342", "v_1013": "v_1343", "v_1014": "v_1344", "v_1015": "v_1345", "v_1016": "v_1346", "v_1004": "v_1375", "v_1005": "v_1376", "v_1017": "v_1377", "v_1018": "v_1378", "v_1019": "v_1379", "v_1023": "v_1380", "v_1024": "v_1381", "v_1025": "v_1382", "v_1026": "v_1383", "v_1027": "v_1384", "v_1028": "v_1385", "v_1030": "v_1386", "v_1006": "v_1409", "v_1007": "v_1410", "v_1008": "v_1411", "v_1009": "v_1412", "v_1010": "v_1413", "v_1012": "v_1414", "v_1020": "v_1749", "v_1021": "v_1750"};
const ARTICLE_ID_MAP = { 'art_101:new_01': 'art_112:new_01', 'art_101:new_02': 'art_112:new_02' };

const READ_VOCAB = [
 {
  "id": "v_1001",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "안녕하세요",
  "pos": "慣用語",
  "hanja": null,
  "meaning_zh": "你好（見面問候）",
  "example_ko": "안녕하세요? 저는 민수예요.",
  "example_zh": "你好！我是民秀。"
 },
 {
  "id": "v_1002",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "반갑다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "高興（見到你）",
  "example_ko": "만나서 반가워요.",
  "example_zh": "很高興認識你。"
 },
 {
  "id": "v_1003",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "감사하다",
  "pos": "動詞",
  "hanja": "感謝",
  "meaning_zh": "感謝、謝謝",
  "example_ko": "정말 감사합니다.",
  "example_zh": "真的很感謝您。"
 },
 {
  "id": "v_1004",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "고맙다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "謝謝、感激",
  "example_ko": "선물 고마워요.",
  "example_zh": "謝謝你的禮物。"
 },
 {
  "id": "v_1005",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "미안하다",
  "pos": "形容詞",
  "hanja": "未安",
  "meaning_zh": "抱歉、對不起",
  "example_ko": "늦어서 미안해요.",
  "example_zh": "對不起，我遲到了。"
 },
 {
  "id": "v_1006",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "괜찮다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "沒關係、還好",
  "example_ko": "괜찮아요. 걱정하지 마세요.",
  "example_zh": "沒關係，別擔心。"
 },
 {
  "id": "v_1007",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "네",
  "pos": "感嘆詞",
  "hanja": null,
  "meaning_zh": "是、對、好",
  "example_ko": "네, 저는 학생이에요.",
  "example_zh": "是的，我是學生。"
 },
 {
  "id": "v_1008",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "아니요",
  "pos": "感嘆詞",
  "hanja": null,
  "meaning_zh": "不是、不",
  "example_ko": "아니요, 저는 일본 사람이 아니에요.",
  "example_zh": "不，我不是日本人。"
 },
 {
  "id": "v_1009",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "이름",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "名字",
  "example_ko": "이름이 뭐예요?",
  "example_zh": "你叫什麼名字？"
 },
 {
  "id": "v_1010",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "저",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "我（謙稱）",
  "example_ko": "저는 대만 사람이에요.",
  "example_zh": "我是台灣人。"
 },
 {
  "id": "v_1011",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "나",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "我（對平輩、晚輩）",
  "example_ko": "나는 학생이야.",
  "example_zh": "我是學生。（對朋友說的半語）"
 },
 {
  "id": "v_1012",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "누구",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "誰",
  "example_ko": "이 사람은 누구예요?",
  "example_zh": "這個人是誰？"
 },
 {
  "id": "v_1013",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "무엇",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "什麼（口語常說 뭐）",
  "example_ko": "이것은 무엇입니까?",
  "example_zh": "這是什麼？"
 },
 {
  "id": "v_1014",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "어느",
  "pos": "冠形詞",
  "hanja": null,
  "meaning_zh": "哪、哪一個",
  "example_ko": "어느 나라 사람이에요?",
  "example_zh": "你是哪國人？"
 },
 {
  "id": "v_1015",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "사람",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "人",
  "example_ko": "저 사람은 선생님이에요.",
  "example_zh": "那個人是老師。"
 },
 {
  "id": "v_1016",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "나라",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "國家",
  "example_ko": "어느 나라에서 왔어요?",
  "example_zh": "你是從哪個國家來的？"
 },
 {
  "id": "v_1017",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "외국인",
  "pos": "名詞",
  "hanja": "外國人",
  "meaning_zh": "外國人",
  "example_ko": "그 식당에는 외국인이 많아요.",
  "example_zh": "那家餐廳外國人很多。"
 },
 {
  "id": "v_1018",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "한국",
  "pos": "名詞",
  "hanja": "韓國",
  "meaning_zh": "韓國",
  "example_ko": "저는 한국에 가고 싶어요.",
  "example_zh": "我想去韓國。"
 },
 {
  "id": "v_1019",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "대만",
  "pos": "名詞",
  "hanja": "臺灣",
  "meaning_zh": "台灣",
  "example_ko": "대만 음식은 맛있어요.",
  "example_zh": "台灣的食物很好吃。"
 },
 {
  "id": "v_1020",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "중국",
  "pos": "名詞",
  "hanja": "中國",
  "meaning_zh": "中國",
  "example_ko": "제 친구는 중국 사람이에요.",
  "example_zh": "我朋友是中國人。"
 },
 {
  "id": "v_1021",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "일본",
  "pos": "名詞",
  "hanja": "日本",
  "meaning_zh": "日本",
  "example_ko": "다음 달에 일본에 가요.",
  "example_zh": "我下個月要去日本。"
 },
 {
  "id": "v_1022",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "미국",
  "pos": "名詞",
  "hanja": "美國",
  "meaning_zh": "美國",
  "example_ko": "미국은 아주 커요.",
  "example_zh": "美國非常大。"
 },
 {
  "id": "v_1023",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "학생",
  "pos": "名詞",
  "hanja": "學生",
  "meaning_zh": "學生",
  "example_ko": "우리 반에는 학생이 스무 명 있어요.",
  "example_zh": "我們班有二十個學生。"
 },
 {
  "id": "v_1024",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "대학생",
  "pos": "名詞",
  "hanja": "大學生",
  "meaning_zh": "大學生",
  "example_ko": "제 동생은 대학생이에요.",
  "example_zh": "我弟弟是大學生。"
 },
 {
  "id": "v_1025",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "회사원",
  "pos": "名詞",
  "hanja": "會社員",
  "meaning_zh": "上班族、公司職員",
  "example_ko": "아버지는 회사원이세요.",
  "example_zh": "爸爸是上班族。"
 },
 {
  "id": "v_1026",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "선생님",
  "pos": "名詞",
  "hanja": "先生",
  "meaning_zh": "老師",
  "example_ko": "선생님, 질문이 있어요.",
  "example_zh": "老師，我有問題。"
 },
 {
  "id": "v_1027",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "의사",
  "pos": "名詞",
  "hanja": "醫師",
  "meaning_zh": "醫生",
  "example_ko": "의사 선생님이 친절해요.",
  "example_zh": "醫生很親切。"
 },
 {
  "id": "v_1028",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "간호사",
  "pos": "名詞",
  "hanja": "看護師",
  "meaning_zh": "護理師",
  "example_ko": "우리 언니는 간호사예요.",
  "example_zh": "我姊姊是護理師。"
 },
 {
  "id": "v_1029",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "요리사",
  "pos": "名詞",
  "hanja": "料理師",
  "meaning_zh": "廚師",
  "example_ko": "요리사가 음식을 만들어요.",
  "example_zh": "廚師在做菜。"
 },
 {
  "id": "v_1030",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "가수",
  "pos": "名詞",
  "hanja": "歌手",
  "meaning_zh": "歌手",
  "example_ko": "저는 그 가수를 좋아해요.",
  "example_zh": "我喜歡那個歌手。"
 },
 {
  "id": "v_1031",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "경찰",
  "pos": "名詞",
  "hanja": "警察",
  "meaning_zh": "警察",
  "example_ko": "경찰은 사람들을 도와요.",
  "example_zh": "警察幫助大家。"
 },
 {
  "id": "v_1032",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "직업",
  "pos": "名詞",
  "hanja": "職業",
  "meaning_zh": "職業、工作",
  "example_ko": "직업이 뭐예요?",
  "example_zh": "你的職業是什麼？"
 },
 {
  "id": "v_1033",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "회사",
  "pos": "名詞",
  "hanja": "會社",
  "meaning_zh": "公司",
  "example_ko": "아버지는 아침 여덟 시에 회사에 가요.",
  "example_zh": "爸爸早上八點去公司。"
 },
 {
  "id": "v_1034",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "word": "소개하다",
  "pos": "動詞",
  "hanja": "紹介",
  "meaning_zh": "介紹",
  "example_ko": "제 친구를 소개합니다.",
  "example_zh": "我來介紹我的朋友。"
 },
 {
  "id": "v_1035",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "가족",
  "pos": "名詞",
  "hanja": "家族",
  "meaning_zh": "家人、家庭",
  "example_ko": "우리 가족은 네 명이에요.",
  "example_zh": "我家有四個人。"
 },
 {
  "id": "v_1036",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "아버지",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "父親、爸爸",
  "example_ko": "아버지는 키가 커요.",
  "example_zh": "爸爸個子很高。"
 },
 {
  "id": "v_1037",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "어머니",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "母親、媽媽",
  "example_ko": "어머니는 요리를 잘하세요.",
  "example_zh": "媽媽很會做菜。"
 },
 {
  "id": "v_1038",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "아빠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "爸爸（口語）",
  "example_ko": "아빠, 사랑해요!",
  "example_zh": "爸爸，我愛你！"
 },
 {
  "id": "v_1039",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "엄마",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "媽媽（口語）",
  "example_ko": "엄마가 김밥을 만들었어요.",
  "example_zh": "媽媽做了紫菜包飯。"
 },
 {
  "id": "v_1040",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "부모님",
  "pos": "名詞",
  "hanja": "父母",
  "meaning_zh": "父母、爸媽",
  "example_ko": "부모님은 대만에 사세요.",
  "example_zh": "我爸媽住在台灣。"
 },
 {
  "id": "v_1041",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "할아버지",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "爺爺、外公",
  "example_ko": "할아버지는 일흔 살이세요.",
  "example_zh": "爺爺七十歲。"
 },
 {
  "id": "v_1042",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "할머니",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "奶奶、外婆",
  "example_ko": "할머니 댁에 가요.",
  "example_zh": "我要去奶奶家。"
 },
 {
  "id": "v_1043",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "형",
  "pos": "名詞",
  "hanja": "兄",
  "meaning_zh": "哥哥（男生稱呼）",
  "example_ko": "형은 저보다 세 살 많아요.",
  "example_zh": "哥哥比我大三歲。"
 },
 {
  "id": "v_1044",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "오빠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "哥哥（女生稱呼）",
  "example_ko": "오빠는 대학생이에요.",
  "example_zh": "哥哥是大學生。"
 },
 {
  "id": "v_1045",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "누나",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "姊姊（男生稱呼）",
  "example_ko": "누나는 은행에서 일해요.",
  "example_zh": "姊姊在銀行工作。"
 },
 {
  "id": "v_1046",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "언니",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "姊姊（女生稱呼）",
  "example_ko": "언니하고 같이 쇼핑했어요.",
  "example_zh": "我和姊姊一起去逛街了。"
 },
 {
  "id": "v_1047",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "동생",
  "pos": "名詞",
  "hanja": "同生",
  "meaning_zh": "弟弟、妹妹",
  "example_ko": "동생이 한 명 있어요.",
  "example_zh": "我有一個弟弟（或妹妹）。"
 },
 {
  "id": "v_1048",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "남동생",
  "pos": "名詞",
  "hanja": "男同生",
  "meaning_zh": "弟弟",
  "example_ko": "남동생은 고등학생이에요.",
  "example_zh": "弟弟是高中生。"
 },
 {
  "id": "v_1049",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "여동생",
  "pos": "名詞",
  "hanja": "女同生",
  "meaning_zh": "妹妹",
  "example_ko": "여동생이 귀여워요.",
  "example_zh": "妹妹很可愛。"
 },
 {
  "id": "v_1050",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "형제",
  "pos": "名詞",
  "hanja": "兄弟",
  "meaning_zh": "兄弟姊妹",
  "example_ko": "형제가 있어요?",
  "example_zh": "你有兄弟姊妹嗎？"
 },
 {
  "id": "v_1051",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "남편",
  "pos": "名詞",
  "hanja": "男便",
  "meaning_zh": "丈夫、先生",
  "example_ko": "남편은 회사원이에요.",
  "example_zh": "我先生是上班族。"
 },
 {
  "id": "v_1052",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "아내",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "妻子、太太",
  "example_ko": "아내와 같이 산책해요.",
  "example_zh": "我和太太一起散步。"
 },
 {
  "id": "v_1053",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "아들",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "兒子",
  "example_ko": "아들이 두 명 있어요.",
  "example_zh": "我有兩個兒子。"
 },
 {
  "id": "v_1054",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "딸",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "女兒",
  "example_ko": "딸이 피아노를 쳐요.",
  "example_zh": "女兒在彈鋼琴。"
 },
 {
  "id": "v_1055",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "아이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "小孩、孩子",
  "example_ko": "아이가 공원에서 놀아요.",
  "example_zh": "小孩在公園玩。"
 },
 {
  "id": "v_1056",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "친구",
  "pos": "名詞",
  "hanja": "親舊",
  "meaning_zh": "朋友",
  "example_ko": "친구하고 영화를 봤어요.",
  "example_zh": "我和朋友看了電影。"
 },
 {
  "id": "v_1057",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "남자",
  "pos": "名詞",
  "hanja": "男子",
  "meaning_zh": "男生、男人",
  "example_ko": "저 남자는 누구예요?",
  "example_zh": "那個男生是誰？"
 },
 {
  "id": "v_1058",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "여자",
  "pos": "名詞",
  "hanja": "女子",
  "meaning_zh": "女生、女人",
  "example_ko": "그 여자는 제 언니예요.",
  "example_zh": "那個女生是我姊姊。"
 },
 {
  "id": "v_1059",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "우리",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "我們、我的（家人、國家等）",
  "example_ko": "우리 같이 가요.",
  "example_zh": "我們一起去吧。"
 },
 {
  "id": "v_1060",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "명",
  "pos": "名詞（量詞）",
  "hanja": "名",
  "meaning_zh": "個人、名（算人數）",
  "example_ko": "교실에 학생이 열 명 있어요.",
  "example_zh": "教室裡有十個學生。"
 },
 {
  "id": "v_1061",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "분",
  "pos": "名詞（量詞）",
  "hanja": null,
  "meaning_zh": "位（算人數的敬稱）",
  "example_ko": "몇 분이세요?",
  "example_zh": "請問幾位？"
 },
 {
  "id": "v_1062",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "있다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "有、在",
  "example_ko": "저는 언니가 있어요.",
  "example_zh": "我有姊姊。"
 },
 {
  "id": "v_1063",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "없다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "沒有、不在",
  "example_ko": "저는 형제가 없어요.",
  "example_zh": "我沒有兄弟姊妹。"
 },
 {
  "id": "v_1064",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "같이",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "一起",
  "example_ko": "가족하고 같이 저녁을 먹어요.",
  "example_zh": "我和家人一起吃晚餐。"
 },
 {
  "id": "v_1065",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "살다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "住、生活",
  "example_ko": "저는 서울에 살아요.",
  "example_zh": "我住在首爾。"
 },
 {
  "id": "v_1066",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "결혼하다",
  "pos": "動詞",
  "hanja": "結婚",
  "meaning_zh": "結婚",
  "example_ko": "언니가 내년에 결혼해요.",
  "example_zh": "姊姊明年要結婚。"
 },
 {
  "id": "v_1067",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "사랑하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "愛",
  "example_ko": "저는 가족을 사랑해요.",
  "example_zh": "我愛我的家人。"
 },
 {
  "id": "v_1068",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "word": "사진",
  "pos": "名詞",
  "hanja": "寫眞",
  "meaning_zh": "照片",
  "example_ko": "가족 사진을 찍었어요.",
  "example_zh": "我們拍了全家福。"
 },
 {
  "id": "v_1069",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "공",
  "pos": "數詞",
  "hanja": "空",
  "meaning_zh": "零（電話號碼的 0）",
  "example_ko": "휴대폰 번호는 공일공으로 시작해요.",
  "example_zh": "手機號碼是 010 開頭。"
 },
 {
  "id": "v_1070",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "일",
  "pos": "數詞",
  "hanja": "一",
  "meaning_zh": "一",
  "example_ko": "일 더하기 일은 이예요.",
  "example_zh": "一加一等於二。"
 },
 {
  "id": "v_1071",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "이",
  "pos": "數詞",
  "hanja": "二",
  "meaning_zh": "二",
  "example_ko": "이 층에 화장실이 있어요.",
  "example_zh": "二樓有洗手間。"
 },
 {
  "id": "v_1072",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "삼",
  "pos": "數詞",
  "hanja": "三",
  "meaning_zh": "三",
  "example_ko": "삼월에 학교가 시작해요.",
  "example_zh": "三月開學。"
 },
 {
  "id": "v_1073",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "사",
  "pos": "數詞",
  "hanja": "四",
  "meaning_zh": "四",
  "example_ko": "사월 사일이에요.",
  "example_zh": "四月四日。"
 },
 {
  "id": "v_1074",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "오",
  "pos": "數詞",
  "hanja": "五",
  "meaning_zh": "五",
  "example_ko": "오 번 버스를 타세요.",
  "example_zh": "請搭五號公車。"
 },
 {
  "id": "v_1075",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "육",
  "pos": "數詞",
  "hanja": "六",
  "meaning_zh": "六",
  "example_ko": "육 층으로 올라가세요.",
  "example_zh": "請上六樓。"
 },
 {
  "id": "v_1076",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "칠",
  "pos": "數詞",
  "hanja": "七",
  "meaning_zh": "七",
  "example_ko": "칠월에 여름 방학이 있어요.",
  "example_zh": "七月有暑假。"
 },
 {
  "id": "v_1077",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "팔",
  "pos": "數詞",
  "hanja": "八",
  "meaning_zh": "八",
  "example_ko": "팔월은 아주 더워요.",
  "example_zh": "八月很熱。"
 },
 {
  "id": "v_1078",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "구",
  "pos": "數詞",
  "hanja": "九",
  "meaning_zh": "九",
  "example_ko": "구 번 출구로 나가세요.",
  "example_zh": "請從九號出口出去。"
 },
 {
  "id": "v_1079",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "십",
  "pos": "數詞",
  "hanja": "十",
  "meaning_zh": "十",
  "example_ko": "십 분 후에 만나요.",
  "example_zh": "十分鐘後見。"
 },
 {
  "id": "v_1080",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "백",
  "pos": "數詞",
  "hanja": "百",
  "meaning_zh": "百",
  "example_ko": "이 책은 백 쪽이에요.",
  "example_zh": "這本書有一百頁。"
 },
 {
  "id": "v_1081",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "천",
  "pos": "數詞",
  "hanja": "千",
  "meaning_zh": "千",
  "example_ko": "커피가 삼천 원이에요.",
  "example_zh": "咖啡三千韓元。"
 },
 {
  "id": "v_1082",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "만",
  "pos": "數詞",
  "hanja": "萬",
  "meaning_zh": "萬",
  "example_ko": "이 가방은 오만 원이에요.",
  "example_zh": "這個包包五萬韓元。"
 },
 {
  "id": "v_1083",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "년",
  "pos": "名詞（量詞）",
  "hanja": "年",
  "meaning_zh": "年",
  "example_ko": "저는 이천 년에 태어났어요.",
  "example_zh": "我是 2000 年出生的。"
 },
 {
  "id": "v_1084",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "월",
  "pos": "名詞（量詞）",
  "hanja": "月",
  "meaning_zh": "月",
  "example_ko": "지금은 몇 월이에요?",
  "example_zh": "現在是幾月？"
 },
 {
  "id": "v_1085",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "일",
  "pos": "名詞（量詞）",
  "hanja": "日",
  "meaning_zh": "日、號（日期）",
  "example_ko": "오늘은 십오 일이에요.",
  "example_zh": "今天是十五號。"
 },
 {
  "id": "v_1086",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "날짜",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "日期",
  "example_ko": "오늘 날짜가 어떻게 돼요?",
  "example_zh": "今天是幾月幾號？"
 },
 {
  "id": "v_1087",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "요일",
  "pos": "名詞",
  "hanja": "曜日",
  "meaning_zh": "星期（幾）",
  "example_ko": "오늘은 무슨 요일이에요?",
  "example_zh": "今天星期幾？"
 },
 {
  "id": "v_1088",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "월요일",
  "pos": "名詞",
  "hanja": "月曜日",
  "meaning_zh": "星期一",
  "example_ko": "월요일에 한국어 수업이 있어요.",
  "example_zh": "星期一有韓文課。"
 },
 {
  "id": "v_1089",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "화요일",
  "pos": "名詞",
  "hanja": "火曜日",
  "meaning_zh": "星期二",
  "example_ko": "화요일 저녁에 운동해요.",
  "example_zh": "我星期二晚上運動。"
 },
 {
  "id": "v_1090",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "수요일",
  "pos": "名詞",
  "hanja": "水曜日",
  "meaning_zh": "星期三",
  "example_ko": "수요일은 바빠요.",
  "example_zh": "星期三很忙。"
 },
 {
  "id": "v_1091",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "목요일",
  "pos": "名詞",
  "hanja": "木曜日",
  "meaning_zh": "星期四",
  "example_ko": "목요일에 친구를 만나요.",
  "example_zh": "我星期四要見朋友。"
 },
 {
  "id": "v_1092",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "금요일",
  "pos": "名詞",
  "hanja": "金曜日",
  "meaning_zh": "星期五",
  "example_ko": "금요일 밤에 영화를 봐요.",
  "example_zh": "我星期五晚上看電影。"
 },
 {
  "id": "v_1093",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "토요일",
  "pos": "名詞",
  "hanja": "土曜日",
  "meaning_zh": "星期六",
  "example_ko": "토요일에는 늦게 일어나요.",
  "example_zh": "星期六我會晚起。"
 },
 {
  "id": "v_1094",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "일요일",
  "pos": "名詞",
  "hanja": "日曜日",
  "meaning_zh": "星期日、星期天",
  "example_ko": "일요일에 교회에 가요.",
  "example_zh": "我星期天去教會。"
 },
 {
  "id": "v_1095",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "주말",
  "pos": "名詞",
  "hanja": "週末",
  "meaning_zh": "週末",
  "example_ko": "주말에 뭐 해요?",
  "example_zh": "週末要做什麼？"
 },
 {
  "id": "v_1096",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "주",
  "pos": "名詞",
  "hanja": "週",
  "meaning_zh": "週、星期（一週）",
  "example_ko": "다음 주에 시험이 있어요.",
  "example_zh": "下週有考試。"
 },
 {
  "id": "v_1097",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "생일",
  "pos": "名詞",
  "hanja": "生日",
  "meaning_zh": "生日",
  "example_ko": "생일이 언제예요?",
  "example_zh": "你的生日是什麼時候？"
 },
 {
  "id": "v_1098",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "전화번호",
  "pos": "名詞",
  "hanja": "電話番號",
  "meaning_zh": "電話號碼",
  "example_ko": "전화번호 좀 알려 주세요.",
  "example_zh": "請告訴我你的電話號碼。"
 },
 {
  "id": "v_1099",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "번",
  "pos": "名詞（量詞）",
  "hanja": "番",
  "meaning_zh": "號、次",
  "example_ko": "몇 번 버스를 타요?",
  "example_zh": "要搭幾號公車？"
 },
 {
  "id": "v_1100",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "층",
  "pos": "名詞（量詞）",
  "hanja": "層",
  "meaning_zh": "樓、層",
  "example_ko": "화장실은 삼 층에 있어요.",
  "example_zh": "洗手間在三樓。"
 },
 {
  "id": "v_1101",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "몇",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "幾、多少",
  "example_ko": "가족이 몇 명이에요?",
  "example_zh": "你家有幾個人？"
 },
 {
  "id": "v_1102",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "word": "며칠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "幾號、幾天",
  "example_ko": "오늘은 며칠이에요?",
  "example_zh": "今天是幾號？"
 },
 {
  "id": "v_1103",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "하나",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "一（固有詞數字）",
  "example_ko": "사과 하나 주세요.",
  "example_zh": "請給我一顆蘋果。"
 },
 {
  "id": "v_1104",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "둘",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "二",
  "example_ko": "우리 둘이 같이 가요.",
  "example_zh": "我們兩個一起去吧。"
 },
 {
  "id": "v_1105",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "셋",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "三",
  "example_ko": "하나, 둘, 셋! 사진 찍어요.",
  "example_zh": "一、二、三！拍照囉。"
 },
 {
  "id": "v_1106",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "넷",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "四",
  "example_ko": "의자가 넷 있어요.",
  "example_zh": "有四張椅子。"
 },
 {
  "id": "v_1107",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "다섯",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "五",
  "example_ko": "다섯 시에 만나요.",
  "example_zh": "五點見。"
 },
 {
  "id": "v_1108",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "여섯",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "六",
  "example_ko": "저는 여섯 시에 일어나요.",
  "example_zh": "我六點起床。"
 },
 {
  "id": "v_1109",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "일곱",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "七",
  "example_ko": "일곱 시에 아침을 먹어요.",
  "example_zh": "我七點吃早餐。"
 },
 {
  "id": "v_1110",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "여덟",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "八",
  "example_ko": "여덟 시에 회사에 가요.",
  "example_zh": "我八點去公司。"
 },
 {
  "id": "v_1111",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "아홉",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "九",
  "example_ko": "수업은 아홉 시에 시작해요.",
  "example_zh": "課九點開始。"
 },
 {
  "id": "v_1112",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "열",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "十",
  "example_ko": "열 시에 자요.",
  "example_zh": "我十點睡覺。"
 },
 {
  "id": "v_1113",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "스물",
  "pos": "數詞",
  "hanja": null,
  "meaning_zh": "二十",
  "example_ko": "저는 스물다섯 살이에요.",
  "example_zh": "我二十五歲。"
 },
 {
  "id": "v_1114",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "시",
  "pos": "名詞（量詞）",
  "hanja": "時",
  "meaning_zh": "點（幾點鐘）",
  "example_ko": "지금 몇 시예요?",
  "example_zh": "現在幾點？"
 },
 {
  "id": "v_1115",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "분",
  "pos": "名詞（量詞）",
  "hanja": "分",
  "meaning_zh": "分（幾分鐘）",
  "example_ko": "세 시 십 분이에요.",
  "example_zh": "三點十分。"
 },
 {
  "id": "v_1116",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "시간",
  "pos": "名詞",
  "hanja": "時間",
  "meaning_zh": "時間、小時",
  "example_ko": "시간이 없어요.",
  "example_zh": "我沒有時間。"
 },
 {
  "id": "v_1117",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "반",
  "pos": "名詞",
  "hanja": "半",
  "meaning_zh": "半（點半）",
  "example_ko": "두 시 반에 만나요.",
  "example_zh": "兩點半見。"
 },
 {
  "id": "v_1118",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "아침",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "早上、早餐",
  "example_ko": "아침을 꼭 드세요.",
  "example_zh": "一定要吃早餐喔。"
 },
 {
  "id": "v_1119",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "점심",
  "pos": "名詞",
  "hanja": "點心",
  "meaning_zh": "中午、午餐",
  "example_ko": "점심에 비빔밥을 먹었어요.",
  "example_zh": "中午吃了拌飯。"
 },
 {
  "id": "v_1120",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "저녁",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "晚上、晚餐",
  "example_ko": "저녁에 가족하고 밥을 먹어요.",
  "example_zh": "晚上和家人一起吃飯。"
 },
 {
  "id": "v_1121",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "밤",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "夜晚、晚上",
  "example_ko": "밤에 별이 많아요.",
  "example_zh": "晚上星星很多。"
 },
 {
  "id": "v_1122",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "오전",
  "pos": "名詞",
  "hanja": "午前",
  "meaning_zh": "上午",
  "example_ko": "오전에 수업이 있어요.",
  "example_zh": "上午有課。"
 },
 {
  "id": "v_1123",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "오후",
  "pos": "名詞",
  "hanja": "午後",
  "meaning_zh": "下午",
  "example_ko": "오후에 도서관에 가요.",
  "example_zh": "下午去圖書館。"
 },
 {
  "id": "v_1124",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "새벽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "凌晨、清晨",
  "example_ko": "새벽 두 시에 잤어요.",
  "example_zh": "凌晨兩點才睡。"
 },
 {
  "id": "v_1125",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "일어나다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "起床、站起來",
  "example_ko": "저는 매일 일곱 시에 일어나요.",
  "example_zh": "我每天七點起床。"
 },
 {
  "id": "v_1126",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "자다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "睡覺",
  "example_ko": "어제 늦게 잤어요.",
  "example_zh": "我昨天很晚睡。"
 },
 {
  "id": "v_1127",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "세수하다",
  "pos": "動詞",
  "hanja": "洗手",
  "meaning_zh": "洗臉",
  "example_ko": "일어나서 세수해요.",
  "example_zh": "起床後洗臉。"
 },
 {
  "id": "v_1128",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "샤워하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "淋浴、洗澡",
  "example_ko": "운동하고 샤워해요.",
  "example_zh": "運動完洗澡。"
 },
 {
  "id": "v_1129",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "출근하다",
  "pos": "動詞",
  "hanja": "出勤",
  "meaning_zh": "上班",
  "example_ko": "아홉 시까지 출근해요.",
  "example_zh": "九點前要上班。"
 },
 {
  "id": "v_1130",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "퇴근하다",
  "pos": "動詞",
  "hanja": "退勤",
  "meaning_zh": "下班",
  "example_ko": "여섯 시에 퇴근해요.",
  "example_zh": "六點下班。"
 },
 {
  "id": "v_1131",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "매일",
  "pos": "副詞",
  "hanja": "每日",
  "meaning_zh": "每天",
  "example_ko": "매일 한국어를 공부해요.",
  "example_zh": "我每天學韓文。"
 },
 {
  "id": "v_1132",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "보통",
  "pos": "副詞",
  "hanja": "普通",
  "meaning_zh": "通常、一般",
  "example_ko": "주말에는 보통 집에 있어요.",
  "example_zh": "週末我通常待在家。"
 },
 {
  "id": "v_1133",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "늦다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "晚、遲",
  "example_ko": "늦어서 죄송해요.",
  "example_zh": "對不起我遲到了。"
 },
 {
  "id": "v_1134",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "일찍",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "早、提早",
  "example_ko": "오늘은 일찍 자요.",
  "example_zh": "今天早點睡。"
 },
 {
  "id": "v_1135",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "쯤",
  "pos": "名詞（依存）",
  "hanja": null,
  "meaning_zh": "左右、大約",
  "example_ko": "열두 시쯤 점심을 먹어요.",
  "example_zh": "十二點左右吃午餐。"
 },
 {
  "id": "v_1136",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "word": "하루",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "一天",
  "example_ko": "하루에 세 번 밥을 먹어요.",
  "example_zh": "一天吃三餐。"
 },
 {
  "id": "v_1137",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "교실",
  "pos": "名詞",
  "hanja": "教室",
  "meaning_zh": "教室",
  "example_ko": "교실에 학생들이 있어요.",
  "example_zh": "教室裡有學生。"
 },
 {
  "id": "v_1138",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "책상",
  "pos": "名詞",
  "hanja": "冊床",
  "meaning_zh": "書桌",
  "example_ko": "책상 위에 책이 있어요.",
  "example_zh": "書桌上有書。"
 },
 {
  "id": "v_1139",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "의자",
  "pos": "名詞",
  "hanja": "椅子",
  "meaning_zh": "椅子",
  "example_ko": "의자에 앉으세요.",
  "example_zh": "請坐在椅子上。"
 },
 {
  "id": "v_1140",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "책",
  "pos": "名詞",
  "hanja": "冊",
  "meaning_zh": "書",
  "example_ko": "이 책은 재미있어요.",
  "example_zh": "這本書很有趣。"
 },
 {
  "id": "v_1141",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "교과서",
  "pos": "名詞",
  "hanja": "教科書",
  "meaning_zh": "課本",
  "example_ko": "교과서 십 쪽을 보세요.",
  "example_zh": "請看課本第十頁。"
 },
 {
  "id": "v_1142",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "공책",
  "pos": "名詞",
  "hanja": "空冊",
  "meaning_zh": "筆記本",
  "example_ko": "공책에 단어를 쓰세요.",
  "example_zh": "請把單字寫在筆記本上。"
 },
 {
  "id": "v_1143",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "연필",
  "pos": "名詞",
  "hanja": "鉛筆",
  "meaning_zh": "鉛筆",
  "example_ko": "연필 좀 빌려 주세요.",
  "example_zh": "請借我一下鉛筆。"
 },
 {
  "id": "v_1144",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "볼펜",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "原子筆",
  "example_ko": "볼펜으로 이름을 쓰세요.",
  "example_zh": "請用原子筆寫名字。"
 },
 {
  "id": "v_1145",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "지우개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "橡皮擦",
  "example_ko": "지우개가 있어요?",
  "example_zh": "你有橡皮擦嗎？"
 },
 {
  "id": "v_1146",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "가방",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "書包、包包",
  "example_ko": "가방에 책이 많아요.",
  "example_zh": "書包裡有很多書。"
 },
 {
  "id": "v_1147",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "칠판",
  "pos": "名詞",
  "hanja": "漆板",
  "meaning_zh": "黑板",
  "example_ko": "선생님이 칠판에 글을 써요.",
  "example_zh": "老師在黑板上寫字。"
 },
 {
  "id": "v_1148",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "종이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "紙",
  "example_ko": "종이 한 장 주세요.",
  "example_zh": "請給我一張紙。"
 },
 {
  "id": "v_1149",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "사전",
  "pos": "名詞",
  "hanja": "辭典",
  "meaning_zh": "字典、辭典",
  "example_ko": "모르는 단어는 사전을 찾아요.",
  "example_zh": "不會的單字就查字典。"
 },
 {
  "id": "v_1150",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "컴퓨터",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "電腦",
  "example_ko": "컴퓨터로 숙제를 해요.",
  "example_zh": "用電腦寫作業。"
 },
 {
  "id": "v_1151",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "시계",
  "pos": "名詞",
  "hanja": "時計",
  "meaning_zh": "時鐘、手錶",
  "example_ko": "교실에 시계가 있어요.",
  "example_zh": "教室裡有時鐘。"
 },
 {
  "id": "v_1152",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "필통",
  "pos": "名詞",
  "hanja": "筆筒",
  "meaning_zh": "筆袋、鉛筆盒",
  "example_ko": "필통에 볼펜이 있어요.",
  "example_zh": "筆袋裡有原子筆。"
 },
 {
  "id": "v_1153",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "수업",
  "pos": "名詞",
  "hanja": "授業",
  "meaning_zh": "課、上課",
  "example_ko": "수업이 아홉 시에 시작해요.",
  "example_zh": "課九點開始。"
 },
 {
  "id": "v_1154",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "숙제",
  "pos": "名詞",
  "hanja": "宿題",
  "meaning_zh": "作業、功課",
  "example_ko": "오늘 숙제가 많아요.",
  "example_zh": "今天作業很多。"
 },
 {
  "id": "v_1155",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "시험",
  "pos": "名詞",
  "hanja": "試驗",
  "meaning_zh": "考試",
  "example_ko": "내일 한국어 시험이 있어요.",
  "example_zh": "明天有韓文考試。"
 },
 {
  "id": "v_1156",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "공부하다",
  "pos": "動詞",
  "hanja": "工夫",
  "meaning_zh": "讀書、學習",
  "example_ko": "도서관에서 공부해요.",
  "example_zh": "我在圖書館讀書。"
 },
 {
  "id": "v_1157",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "배우다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "學、學習",
  "example_ko": "저는 한국어를 배워요.",
  "example_zh": "我在學韓文。"
 },
 {
  "id": "v_1158",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "가르치다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "教",
  "example_ko": "어머니는 학교에서 영어를 가르치세요.",
  "example_zh": "媽媽在學校教英文。"
 },
 {
  "id": "v_1159",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "질문",
  "pos": "名詞",
  "hanja": "質問",
  "meaning_zh": "問題（提問）",
  "example_ko": "질문이 있어요?",
  "example_zh": "有問題嗎？"
 },
 {
  "id": "v_1160",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "대답하다",
  "pos": "動詞",
  "hanja": "對答",
  "meaning_zh": "回答",
  "example_ko": "학생이 질문에 대답해요.",
  "example_zh": "學生回答問題。"
 },
 {
  "id": "v_1161",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "알다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "知道、認識",
  "example_ko": "그 사람을 알아요?",
  "example_zh": "你認識那個人嗎？"
 },
 {
  "id": "v_1162",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "모르다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "不知道、不認識",
  "example_ko": "이 단어를 몰라요.",
  "example_zh": "我不知道這個單字。"
 },
 {
  "id": "v_1163",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "반",
  "pos": "名詞",
  "hanja": "班",
  "meaning_zh": "班、班級",
  "example_ko": "우리 반에는 학생이 열 명 있어요.",
  "example_zh": "我們班有十個學生。"
 },
 {
  "id": "v_1164",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "학년",
  "pos": "名詞",
  "hanja": "學年",
  "meaning_zh": "年級",
  "example_ko": "저는 대학교 이 학년이에요.",
  "example_zh": "我是大學二年級。"
 },
 {
  "id": "v_1165",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "한국어",
  "pos": "名詞",
  "hanja": "韓國語",
  "meaning_zh": "韓文、韓語",
  "example_ko": "한국어는 재미있어요.",
  "example_zh": "韓文很有趣。"
 },
 {
  "id": "v_1166",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "영어",
  "pos": "名詞",
  "hanja": "英語",
  "meaning_zh": "英文、英語",
  "example_ko": "영어를 조금 할 수 있어요.",
  "example_zh": "我會說一點英文。"
 },
 {
  "id": "v_1167",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "단어",
  "pos": "名詞",
  "hanja": "單語",
  "meaning_zh": "單字",
  "example_ko": "이 단어는 어려워요.",
  "example_zh": "這個單字很難。"
 },
 {
  "id": "v_1168",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "문제",
  "pos": "名詞",
  "hanja": "問題",
  "meaning_zh": "題目、問題",
  "example_ko": "이 문제는 쉬워요.",
  "example_zh": "這題很簡單。"
 },
 {
  "id": "v_1169",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "시작하다",
  "pos": "動詞",
  "hanja": "始作",
  "meaning_zh": "開始",
  "example_ko": "수업을 시작합시다.",
  "example_zh": "我們開始上課吧。"
 },
 {
  "id": "v_1170",
  "level": 1,
  "topic": "教室與文具用品",
  "word": "끝나다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "結束",
  "example_ko": "수업이 세 시에 끝나요.",
  "example_zh": "課三點結束。"
 },
 {
  "id": "v_1171",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "집",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "家、房子",
  "example_ko": "우리 집은 학교 근처에 있어요.",
  "example_zh": "我家在學校附近。"
 },
 {
  "id": "v_1172",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "아파트",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "公寓（大樓）",
  "example_ko": "저는 아파트 십 층에 살아요.",
  "example_zh": "我住在公寓十樓。"
 },
 {
  "id": "v_1173",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "방",
  "pos": "名詞",
  "hanja": "房",
  "meaning_zh": "房間",
  "example_ko": "제 방은 작아요.",
  "example_zh": "我的房間很小。"
 },
 {
  "id": "v_1174",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "거실",
  "pos": "名詞",
  "hanja": "居室",
  "meaning_zh": "客廳",
  "example_ko": "가족들이 거실에서 텔레비전을 봐요.",
  "example_zh": "家人在客廳看電視。"
 },
 {
  "id": "v_1175",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "부엌",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "廚房",
  "example_ko": "어머니가 부엌에서 요리해요.",
  "example_zh": "媽媽在廚房做菜。"
 },
 {
  "id": "v_1176",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "화장실",
  "pos": "名詞",
  "hanja": "化粧室",
  "meaning_zh": "洗手間、廁所",
  "example_ko": "화장실이 어디예요?",
  "example_zh": "洗手間在哪裡？"
 },
 {
  "id": "v_1177",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "욕실",
  "pos": "名詞",
  "hanja": "浴室",
  "meaning_zh": "浴室",
  "example_ko": "욕실에서 샤워해요.",
  "example_zh": "在浴室洗澡。"
 },
 {
  "id": "v_1178",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "침실",
  "pos": "名詞",
  "hanja": "寢室",
  "meaning_zh": "臥室",
  "example_ko": "침실에 침대가 두 개 있어요.",
  "example_zh": "臥室裡有兩張床。"
 },
 {
  "id": "v_1179",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "현관",
  "pos": "名詞",
  "hanja": "玄關",
  "meaning_zh": "玄關、門口",
  "example_ko": "현관에서 신발을 벗으세요.",
  "example_zh": "請在玄關脫鞋。"
 },
 {
  "id": "v_1180",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "문",
  "pos": "名詞",
  "hanja": "門",
  "meaning_zh": "門",
  "example_ko": "문을 닫아 주세요.",
  "example_zh": "請幫我關門。"
 },
 {
  "id": "v_1181",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "창문",
  "pos": "名詞",
  "hanja": "窗門",
  "meaning_zh": "窗戶",
  "example_ko": "창문을 열까요?",
  "example_zh": "要開窗嗎？"
 },
 {
  "id": "v_1182",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "벽",
  "pos": "名詞",
  "hanja": "壁",
  "meaning_zh": "牆壁",
  "example_ko": "벽에 사진이 있어요.",
  "example_zh": "牆上有照片。"
 },
 {
  "id": "v_1183",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "바닥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "地板",
  "example_ko": "바닥에 앉아서 밥을 먹어요.",
  "example_zh": "坐在地板上吃飯。"
 },
 {
  "id": "v_1184",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "계단",
  "pos": "名詞",
  "hanja": "階段",
  "meaning_zh": "樓梯",
  "example_ko": "엘리베이터가 없어서 계단으로 올라가요.",
  "example_zh": "沒有電梯，所以走樓梯上去。"
 },
 {
  "id": "v_1185",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "엘리베이터",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "電梯",
  "example_ko": "엘리베이터를 타고 오 층에 가요.",
  "example_zh": "搭電梯到五樓。"
 },
 {
  "id": "v_1186",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "침대",
  "pos": "名詞",
  "hanja": "寢臺",
  "meaning_zh": "床",
  "example_ko": "침대가 아주 편해요.",
  "example_zh": "床很舒服。"
 },
 {
  "id": "v_1187",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "소파",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "沙發",
  "example_ko": "소파에서 잠깐 쉬었어요.",
  "example_zh": "在沙發上休息了一下。"
 },
 {
  "id": "v_1188",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "책장",
  "pos": "名詞",
  "hanja": "冊欌",
  "meaning_zh": "書櫃、書架",
  "example_ko": "책장에 책이 많아요.",
  "example_zh": "書櫃裡有很多書。"
 },
 {
  "id": "v_1189",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "옷장",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "衣櫃",
  "example_ko": "옷장에 옷을 넣으세요.",
  "example_zh": "請把衣服放進衣櫃。"
 },
 {
  "id": "v_1190",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "식탁",
  "pos": "名詞",
  "hanja": "食卓",
  "meaning_zh": "餐桌",
  "example_ko": "식탁 위에 과일이 있어요.",
  "example_zh": "餐桌上有水果。"
 },
 {
  "id": "v_1191",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "냉장고",
  "pos": "名詞",
  "hanja": "冷藏庫",
  "meaning_zh": "冰箱",
  "example_ko": "냉장고에 우유가 있어요.",
  "example_zh": "冰箱裡有牛奶。"
 },
 {
  "id": "v_1192",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "텔레비전",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "電視",
  "example_ko": "저녁에 텔레비전을 봐요.",
  "example_zh": "晚上看電視。"
 },
 {
  "id": "v_1193",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "세탁기",
  "pos": "名詞",
  "hanja": "洗濯機",
  "meaning_zh": "洗衣機",
  "example_ko": "세탁기로 빨래를 해요.",
  "example_zh": "用洗衣機洗衣服。"
 },
 {
  "id": "v_1194",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "에어컨",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "冷氣",
  "example_ko": "더워요. 에어컨을 켜 주세요.",
  "example_zh": "好熱，請開冷氣。"
 },
 {
  "id": "v_1195",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "거울",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鏡子",
  "example_ko": "화장실에 거울이 있어요.",
  "example_zh": "洗手間有鏡子。"
 },
 {
  "id": "v_1196",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "이불",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "棉被",
  "example_ko": "겨울에는 두꺼운 이불을 덮어요.",
  "example_zh": "冬天蓋厚棉被。"
 },
 {
  "id": "v_1197",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "베개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "枕頭",
  "example_ko": "베개가 너무 높아요.",
  "example_zh": "枕頭太高了。"
 },
 {
  "id": "v_1198",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "불",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "燈、火",
  "example_ko": "방에 불을 켜세요.",
  "example_zh": "請打開房間的燈。"
 },
 {
  "id": "v_1199",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "켜다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "打開（燈、電器）",
  "example_ko": "컴퓨터를 켜요.",
  "example_zh": "打開電腦。"
 },
 {
  "id": "v_1200",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "끄다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "關掉（燈、電器）",
  "example_ko": "자기 전에 불을 꺼요.",
  "example_zh": "睡覺前關燈。"
 },
 {
  "id": "v_1201",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "열다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "打開（門、窗、蓋子）",
  "example_ko": "창문을 열어요.",
  "example_zh": "打開窗戶。"
 },
 {
  "id": "v_1202",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "닫다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "關上（門、窗）",
  "example_ko": "추워요. 문을 닫으세요.",
  "example_zh": "好冷，請關門。"
 },
 {
  "id": "v_1203",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "깨끗하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "乾淨",
  "example_ko": "방이 아주 깨끗해요.",
  "example_zh": "房間很乾淨。"
 },
 {
  "id": "v_1204",
  "level": 1,
  "topic": "居家空間與基本家具",
  "word": "넓다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "寬敞、寬",
  "example_ko": "거실이 넓어요.",
  "example_zh": "客廳很寬敞。"
 },
 {
  "id": "v_1205",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "위",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "上面",
  "example_ko": "책상 위에 컴퓨터가 있어요.",
  "example_zh": "書桌上有電腦。"
 },
 {
  "id": "v_1206",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "아래",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "下面",
  "example_ko": "의자 아래에 가방이 있어요.",
  "example_zh": "椅子下面有包包。"
 },
 {
  "id": "v_1207",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "밑",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "底下、下面",
  "example_ko": "침대 밑에 고양이가 있어요.",
  "example_zh": "床底下有一隻貓。"
 },
 {
  "id": "v_1208",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "안",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "裡面",
  "example_ko": "가방 안에 책이 있어요.",
  "example_zh": "包包裡有書。"
 },
 {
  "id": "v_1209",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "밖",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "外面",
  "example_ko": "밖에 비가 와요.",
  "example_zh": "外面在下雨。"
 },
 {
  "id": "v_1210",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "속",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "裡頭、內部",
  "example_ko": "주머니 속에 열쇠가 있어요.",
  "example_zh": "口袋裡有鑰匙。"
 },
 {
  "id": "v_1211",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "앞",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "前面",
  "example_ko": "학교 앞에서 만나요.",
  "example_zh": "在學校前面見。"
 },
 {
  "id": "v_1212",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "뒤",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "後面",
  "example_ko": "집 뒤에 공원이 있어요.",
  "example_zh": "家後面有公園。"
 },
 {
  "id": "v_1213",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "옆",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "旁邊",
  "example_ko": "제 옆에 앉으세요.",
  "example_zh": "請坐我旁邊。"
 },
 {
  "id": "v_1214",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "사이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "之間、中間",
  "example_ko": "은행과 우체국 사이에 카페가 있어요.",
  "example_zh": "銀行和郵局之間有咖啡廳。"
 },
 {
  "id": "v_1215",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "가운데",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "正中間",
  "example_ko": "방 가운데에 식탁이 있어요.",
  "example_zh": "房間正中間有餐桌。"
 },
 {
  "id": "v_1216",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "맞은편",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "對面",
  "example_ko": "병원 맞은편에 약국이 있어요.",
  "example_zh": "醫院對面有藥局。"
 },
 {
  "id": "v_1217",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "건너편",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "（馬路、河的）對面",
  "example_ko": "길 건너편에 버스 정류장이 있어요.",
  "example_zh": "馬路對面有公車站。"
 },
 {
  "id": "v_1218",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "근처",
  "pos": "名詞",
  "hanja": "近處",
  "meaning_zh": "附近",
  "example_ko": "이 근처에 편의점이 있어요?",
  "example_zh": "這附近有便利商店嗎？"
 },
 {
  "id": "v_1219",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "오른쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "右邊",
  "example_ko": "오른쪽으로 가세요.",
  "example_zh": "請往右走。"
 },
 {
  "id": "v_1220",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "왼쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "左邊",
  "example_ko": "화장실은 왼쪽에 있어요.",
  "example_zh": "洗手間在左邊。"
 },
 {
  "id": "v_1221",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "邊、方向",
  "example_ko": "이쪽으로 오세요.",
  "example_zh": "請往這邊來。"
 },
 {
  "id": "v_1222",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "여기",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "這裡",
  "example_ko": "여기가 우리 교실이에요.",
  "example_zh": "這裡是我們的教室。"
 },
 {
  "id": "v_1223",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "거기",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "那裡（離聽話者近）",
  "example_ko": "거기에서 기다리세요.",
  "example_zh": "請在那裡等。"
 },
 {
  "id": "v_1224",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "저기",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "那裡（離兩人都遠）",
  "example_ko": "저기가 우리 학교예요.",
  "example_zh": "那邊是我們學校。"
 },
 {
  "id": "v_1225",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "어디",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "哪裡",
  "example_ko": "집이 어디예요?",
  "example_zh": "你家在哪裡？"
 },
 {
  "id": "v_1226",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "이",
  "pos": "冠形詞",
  "hanja": null,
  "meaning_zh": "這（個）",
  "example_ko": "이 책은 제 책이에요.",
  "example_zh": "這本書是我的。"
 },
 {
  "id": "v_1227",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "그",
  "pos": "冠形詞",
  "hanja": null,
  "meaning_zh": "那（個）（剛提到的）",
  "example_ko": "그 사람은 제 친구예요.",
  "example_zh": "那個人是我朋友。"
 },
 {
  "id": "v_1228",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "저",
  "pos": "冠形詞",
  "hanja": null,
  "meaning_zh": "那（個）（遠處的）",
  "example_ko": "저 건물이 병원이에요.",
  "example_zh": "那棟建築是醫院。"
 },
 {
  "id": "v_1229",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "이것",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "這個（東西）",
  "example_ko": "이것은 제 가방이에요.",
  "example_zh": "這是我的包包。"
 },
 {
  "id": "v_1230",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "그것",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "那個（東西）",
  "example_ko": "그것은 무엇이에요?",
  "example_zh": "那是什麼？"
 },
 {
  "id": "v_1231",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "저것",
  "pos": "代名詞",
  "hanja": null,
  "meaning_zh": "那個（遠處的東西）",
  "example_ko": "저것은 남산타워예요.",
  "example_zh": "那是南山塔。"
 },
 {
  "id": "v_1232",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "곳",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "地方、場所",
  "example_ko": "여기는 조용한 곳이에요.",
  "example_zh": "這裡是個安靜的地方。"
 },
 {
  "id": "v_1233",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "동쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "東邊",
  "example_ko": "해는 동쪽에서 떠요.",
  "example_zh": "太陽從東邊升起。"
 },
 {
  "id": "v_1234",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "서쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "西邊",
  "example_ko": "해가 서쪽으로 져요.",
  "example_zh": "太陽往西邊落下。"
 },
 {
  "id": "v_1235",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "남쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "南邊",
  "example_ko": "부산은 한국 남쪽에 있어요.",
  "example_zh": "釜山在韓國南部。"
 },
 {
  "id": "v_1236",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "북쪽",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "北邊",
  "example_ko": "서울은 부산의 북쪽에 있어요.",
  "example_zh": "首爾在釜山的北邊。"
 },
 {
  "id": "v_1237",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "놓다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "放、擺",
  "example_ko": "책을 책상 위에 놓으세요.",
  "example_zh": "請把書放在書桌上。"
 },
 {
  "id": "v_1238",
  "level": 1,
  "topic": "位置與方位介詞",
  "word": "두다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "放、擱（放著）",
  "example_ko": "열쇠를 어디에 뒀어요?",
  "example_zh": "你把鑰匙放在哪裡了？"
 },
 {
  "id": "v_1239",
  "level": 1,
  "topic": "常見交通工具",
  "word": "교통",
  "pos": "名詞",
  "hanja": "交通",
  "meaning_zh": "交通",
  "example_ko": "서울은 교통이 편리해요.",
  "example_zh": "首爾交通很方便。"
 },
 {
  "id": "v_1240",
  "level": 1,
  "topic": "常見交通工具",
  "word": "버스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "公車、巴士",
  "example_ko": "버스로 학교에 가요.",
  "example_zh": "我搭公車去學校。"
 },
 {
  "id": "v_1241",
  "level": 1,
  "topic": "常見交通工具",
  "word": "지하철",
  "pos": "名詞",
  "hanja": "地下鐵",
  "meaning_zh": "地鐵、捷運",
  "example_ko": "지하철이 빨라요.",
  "example_zh": "地鐵很快。"
 },
 {
  "id": "v_1242",
  "level": 1,
  "topic": "常見交通工具",
  "word": "택시",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "計程車",
  "example_ko": "늦어서 택시를 탔어요.",
  "example_zh": "因為遲到了，所以搭了計程車。"
 },
 {
  "id": "v_1243",
  "level": 1,
  "topic": "常見交通工具",
  "word": "기차",
  "pos": "名詞",
  "hanja": "汽車",
  "meaning_zh": "火車",
  "example_ko": "기차로 부산에 가요.",
  "example_zh": "搭火車去釜山。"
 },
 {
  "id": "v_1244",
  "level": 1,
  "topic": "常見交通工具",
  "word": "비행기",
  "pos": "名詞",
  "hanja": "飛行機",
  "meaning_zh": "飛機",
  "example_ko": "비행기로 두 시간 걸려요.",
  "example_zh": "搭飛機要兩個小時。"
 },
 {
  "id": "v_1245",
  "level": 1,
  "topic": "常見交通工具",
  "word": "배",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "船",
  "example_ko": "배를 타고 제주도에 갔어요.",
  "example_zh": "搭船去了濟州島。"
 },
 {
  "id": "v_1246",
  "level": 1,
  "topic": "常見交通工具",
  "word": "자전거",
  "pos": "名詞",
  "hanja": "自轉車",
  "meaning_zh": "腳踏車",
  "example_ko": "주말에 자전거를 타요.",
  "example_zh": "週末騎腳踏車。"
 },
 {
  "id": "v_1247",
  "level": 1,
  "topic": "常見交通工具",
  "word": "오토바이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "機車、摩托車",
  "example_ko": "대만에는 오토바이가 많아요.",
  "example_zh": "台灣的機車很多。"
 },
 {
  "id": "v_1248",
  "level": 1,
  "topic": "常見交通工具",
  "word": "자동차",
  "pos": "名詞",
  "hanja": "自動車",
  "meaning_zh": "汽車",
  "example_ko": "아버지는 자동차를 운전해요.",
  "example_zh": "爸爸開車。"
 },
 {
  "id": "v_1249",
  "level": 1,
  "topic": "常見交通工具",
  "word": "차",
  "pos": "名詞",
  "hanja": "車",
  "meaning_zh": "車子",
  "example_ko": "차가 많이 막혀요.",
  "example_zh": "很塞車。"
 },
 {
  "id": "v_1250",
  "level": 1,
  "topic": "常見交通工具",
  "word": "정류장",
  "pos": "名詞",
  "hanja": "停留場",
  "meaning_zh": "公車站、停靠站",
  "example_ko": "버스 정류장에서 기다려요.",
  "example_zh": "在公車站等車。"
 },
 {
  "id": "v_1251",
  "level": 1,
  "topic": "常見交通工具",
  "word": "역",
  "pos": "名詞",
  "hanja": "驛",
  "meaning_zh": "車站（火車、地鐵）",
  "example_ko": "역 앞에서 만나요.",
  "example_zh": "在車站前面見。"
 },
 {
  "id": "v_1252",
  "level": 1,
  "topic": "常見交通工具",
  "word": "공항",
  "pos": "名詞",
  "hanja": "空港",
  "meaning_zh": "機場",
  "example_ko": "공항까지 지하철로 가요.",
  "example_zh": "搭地鐵到機場。"
 },
 {
  "id": "v_1253",
  "level": 1,
  "topic": "常見交通工具",
  "word": "표",
  "pos": "名詞",
  "hanja": "票",
  "meaning_zh": "票",
  "example_ko": "기차 표를 샀어요.",
  "example_zh": "我買了火車票。"
 },
 {
  "id": "v_1254",
  "level": 1,
  "topic": "常見交通工具",
  "word": "운전하다",
  "pos": "動詞",
  "hanja": "運轉",
  "meaning_zh": "開車、駕駛",
  "example_ko": "저는 운전할 수 있어요.",
  "example_zh": "我會開車。"
 },
 {
  "id": "v_1255",
  "level": 1,
  "topic": "常見交通工具",
  "word": "타다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "搭、坐、騎（交通工具）",
  "example_ko": "저는 매일 지하철을 타요.",
  "example_zh": "我每天搭地鐵。"
 },
 {
  "id": "v_1256",
  "level": 1,
  "topic": "常見交通工具",
  "word": "내리다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "下（車）",
  "example_ko": "다음 역에서 내리세요.",
  "example_zh": "請在下一站下車。"
 },
 {
  "id": "v_1257",
  "level": 1,
  "topic": "常見交通工具",
  "word": "걷다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "走、走路",
  "example_ko": "매일 삼십 분 걸어요.",
  "example_zh": "我每天走路三十分鐘。"
 },
 {
  "id": "v_1258",
  "level": 1,
  "topic": "常見交通工具",
  "word": "걸어가다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "走路去",
  "example_ko": "학교까지 걸어가요.",
  "example_zh": "我走路去學校。"
 },
 {
  "id": "v_1259",
  "level": 1,
  "topic": "常見交通工具",
  "word": "출발하다",
  "pos": "動詞",
  "hanja": "出發",
  "meaning_zh": "出發",
  "example_ko": "기차가 아홉 시에 출발해요.",
  "example_zh": "火車九點出發。"
 },
 {
  "id": "v_1260",
  "level": 1,
  "topic": "常見交通工具",
  "word": "도착하다",
  "pos": "動詞",
  "hanja": "到着",
  "meaning_zh": "到達、抵達",
  "example_ko": "부산에 오후 한 시에 도착해요.",
  "example_zh": "下午一點抵達釜山。"
 },
 {
  "id": "v_1261",
  "level": 1,
  "topic": "常見交通工具",
  "word": "멀다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "遠",
  "example_ko": "회사가 집에서 멀어요.",
  "example_zh": "公司離家很遠。"
 },
 {
  "id": "v_1262",
  "level": 1,
  "topic": "常見交通工具",
  "word": "가깝다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "近",
  "example_ko": "학교가 아주 가까워요.",
  "example_zh": "學校很近。"
 },
 {
  "id": "v_1263",
  "level": 1,
  "topic": "常見交通工具",
  "word": "길",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "路、道路",
  "example_ko": "길을 몰라요.",
  "example_zh": "我不知道路。"
 },
 {
  "id": "v_1264",
  "level": 1,
  "topic": "常見交通工具",
  "word": "걸리다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "花（時間）、需要（多久）",
  "example_ko": "집에서 회사까지 한 시간 걸려요.",
  "example_zh": "從家裡到公司要一個小時。"
 },
 {
  "id": "v_1265",
  "level": 1,
  "topic": "常見交通工具",
  "word": "호선",
  "pos": "名詞（量詞）",
  "hanja": "號線",
  "meaning_zh": "號線（地鐵路線）",
  "example_ko": "이 호선으로 갈아타세요.",
  "example_zh": "請轉乘二號線。"
 },
 {
  "id": "v_1266",
  "level": 1,
  "topic": "常見交通工具",
  "word": "출구",
  "pos": "名詞",
  "hanja": "出口",
  "meaning_zh": "出口",
  "example_ko": "삼 번 출구로 나오세요.",
  "example_zh": "請從三號出口出來。"
 },
 {
  "id": "v_1267",
  "level": 1,
  "topic": "常見交通工具",
  "word": "입구",
  "pos": "名詞",
  "hanja": "入口",
  "meaning_zh": "入口",
  "example_ko": "입구가 어디예요?",
  "example_zh": "入口在哪裡？"
 },
 {
  "id": "v_1268",
  "level": 1,
  "topic": "常見交通工具",
  "word": "기사",
  "pos": "名詞",
  "hanja": "技士",
  "meaning_zh": "司機",
  "example_ko": "택시 기사님이 친절해요.",
  "example_zh": "計程車司機很親切。"
 },
 {
  "id": "v_1269",
  "level": 1,
  "topic": "常見交通工具",
  "word": "자리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "座位、位子",
  "example_ko": "이 자리에 앉아도 돼요?",
  "example_zh": "我可以坐這個位子嗎？"
 },
 {
  "id": "v_1270",
  "level": 1,
  "topic": "常見交通工具",
  "word": "고속버스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "客運、長途巴士",
  "example_ko": "고속버스로 대구에 가요.",
  "example_zh": "搭客運去大邱。"
 },
 {
  "id": "v_1271",
  "level": 1,
  "topic": "常見交通工具",
  "word": "터미널",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "客運站、轉運站",
  "example_ko": "버스 터미널은 역 옆에 있어요.",
  "example_zh": "客運站在車站旁邊。"
 },
 {
  "id": "v_1272",
  "level": 1,
  "topic": "常見交通工具",
  "word": "천천히",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "慢慢地",
  "example_ko": "천천히 운전하세요.",
  "example_zh": "請慢慢開。"
 },
 {
  "id": "v_1273",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "학교",
  "pos": "名詞",
  "hanja": "學校",
  "meaning_zh": "學校",
  "example_ko": "우리 학교는 크고 예뻐요.",
  "example_zh": "我們學校又大又漂亮。"
 },
 {
  "id": "v_1274",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "대학교",
  "pos": "名詞",
  "hanja": "大學校",
  "meaning_zh": "大學",
  "example_ko": "형은 서울에 있는 대학교에 다녀요.",
  "example_zh": "哥哥在首爾的大學念書。"
 },
 {
  "id": "v_1275",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "병원",
  "pos": "名詞",
  "hanja": "病院",
  "meaning_zh": "醫院",
  "example_ko": "아파서 병원에 갔어요.",
  "example_zh": "因為不舒服，所以去了醫院。"
 },
 {
  "id": "v_1276",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "은행",
  "pos": "名詞",
  "hanja": "銀行",
  "meaning_zh": "銀行",
  "example_ko": "은행은 네 시에 문을 닫아요.",
  "example_zh": "銀行四點關門。"
 },
 {
  "id": "v_1277",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "우체국",
  "pos": "名詞",
  "hanja": "郵遞局",
  "meaning_zh": "郵局",
  "example_ko": "우체국에서 편지를 보내요.",
  "example_zh": "在郵局寄信。"
 },
 {
  "id": "v_1278",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "도서관",
  "pos": "名詞",
  "hanja": "圖書館",
  "meaning_zh": "圖書館",
  "example_ko": "도서관은 조용해요.",
  "example_zh": "圖書館很安靜。"
 },
 {
  "id": "v_1279",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "공원",
  "pos": "名詞",
  "hanja": "公園",
  "meaning_zh": "公園",
  "example_ko": "공원에서 산책해요.",
  "example_zh": "在公園散步。"
 },
 {
  "id": "v_1280",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "시장",
  "pos": "名詞",
  "hanja": "市場",
  "meaning_zh": "市場",
  "example_ko": "전통 시장은 물건이 싸요.",
  "example_zh": "傳統市場的東西很便宜。"
 },
 {
  "id": "v_1281",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "백화점",
  "pos": "名詞",
  "hanja": "百貨店",
  "meaning_zh": "百貨公司",
  "example_ko": "백화점에서 옷을 샀어요.",
  "example_zh": "在百貨公司買了衣服。"
 },
 {
  "id": "v_1282",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "편의점",
  "pos": "名詞",
  "hanja": "便宜店",
  "meaning_zh": "便利商店",
  "example_ko": "편의점은 이십사 시간 문을 열어요.",
  "example_zh": "便利商店二十四小時營業。"
 },
 {
  "id": "v_1283",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "약국",
  "pos": "名詞",
  "hanja": "藥局",
  "meaning_zh": "藥局、藥房",
  "example_ko": "약국은 병원 옆에 있어요.",
  "example_zh": "藥局在醫院旁邊。"
 },
 {
  "id": "v_1284",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "서점",
  "pos": "名詞",
  "hanja": "書店",
  "meaning_zh": "書店",
  "example_ko": "서점에서 한국어 책을 샀어요.",
  "example_zh": "在書店買了韓文書。"
 },
 {
  "id": "v_1285",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "빵집",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "麵包店",
  "example_ko": "빵집에서 빵 냄새가 나요.",
  "example_zh": "麵包店傳來麵包香。"
 },
 {
  "id": "v_1286",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "교회",
  "pos": "名詞",
  "hanja": "教會",
  "meaning_zh": "教會、教堂",
  "example_ko": "교회 앞에 사람들이 많아요.",
  "example_zh": "教會前面人很多。"
 },
 {
  "id": "v_1287",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "건물",
  "pos": "名詞",
  "hanja": "建物",
  "meaning_zh": "建築物、大樓",
  "example_ko": "저 높은 건물이 회사예요.",
  "example_zh": "那棟高樓是公司。"
 },
 {
  "id": "v_1288",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "거리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "街道、街",
  "example_ko": "명동 거리는 항상 복잡해요.",
  "example_zh": "明洞的街上總是很擁擠。"
 },
 {
  "id": "v_1289",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "사거리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "十字路口",
  "example_ko": "사거리에서 오른쪽으로 가세요.",
  "example_zh": "請在十字路口往右走。"
 },
 {
  "id": "v_1290",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "건너다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "越過、過（馬路）",
  "example_ko": "길을 건너세요.",
  "example_zh": "請過馬路。"
 },
 {
  "id": "v_1291",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "쭉",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "一直（往前）",
  "example_ko": "이 길로 쭉 가세요.",
  "example_zh": "請沿著這條路一直走。"
 },
 {
  "id": "v_1292",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "돌다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "轉、轉彎",
  "example_ko": "저 모퉁이에서 왼쪽으로 도세요.",
  "example_zh": "請在那個轉角左轉。"
 },
 {
  "id": "v_1293",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "좌회전하다",
  "pos": "動詞",
  "hanja": "左回轉",
  "meaning_zh": "左轉",
  "example_ko": "다음 사거리에서 좌회전하세요.",
  "example_zh": "請在下一個十字路口左轉。"
 },
 {
  "id": "v_1294",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "우회전하다",
  "pos": "動詞",
  "hanja": "右回轉",
  "meaning_zh": "右轉",
  "example_ko": "은행 앞에서 우회전하세요.",
  "example_zh": "請在銀行前面右轉。"
 },
 {
  "id": "v_1295",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "지나다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "經過、通過",
  "example_ko": "다리를 지나면 학교가 있어요.",
  "example_zh": "過了橋就是學校。"
 },
 {
  "id": "v_1296",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "찾다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "找、尋找",
  "example_ko": "우체국을 찾고 있어요.",
  "example_zh": "我在找郵局。"
 },
 {
  "id": "v_1297",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "묻다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "問",
  "example_ko": "길을 몰라서 경찰에게 물었어요.",
  "example_zh": "我不知道路，所以問了警察。"
 },
 {
  "id": "v_1298",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "동네",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "社區、街坊",
  "example_ko": "우리 동네에는 공원이 많아요.",
  "example_zh": "我們社區有很多公園。"
 },
 {
  "id": "v_1299",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "도시",
  "pos": "名詞",
  "hanja": "都市",
  "meaning_zh": "城市、都市",
  "example_ko": "서울은 큰 도시예요.",
  "example_zh": "首爾是大城市。"
 },
 {
  "id": "v_1300",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "시내",
  "pos": "名詞",
  "hanja": "市內",
  "meaning_zh": "市區、市中心",
  "example_ko": "주말에 시내에 나가요.",
  "example_zh": "週末去市區。"
 },
 {
  "id": "v_1301",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "서울",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "首爾",
  "example_ko": "저는 서울에서 일해요.",
  "example_zh": "我在首爾工作。"
 },
 {
  "id": "v_1302",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "가게",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "店、商店",
  "example_ko": "이 가게는 밤 열 시까지 해요.",
  "example_zh": "這家店開到晚上十點。"
 },
 {
  "id": "v_1303",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "주차장",
  "pos": "名詞",
  "hanja": "駐車場",
  "meaning_zh": "停車場",
  "example_ko": "주차장이 건물 뒤에 있어요.",
  "example_zh": "停車場在大樓後面。"
 },
 {
  "id": "v_1304",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "꽃집",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "花店",
  "example_ko": "꽃집에서 장미를 샀어요.",
  "example_zh": "在花店買了玫瑰。"
 },
 {
  "id": "v_1305",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "끝",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "盡頭、結尾",
  "example_ko": "이 길 끝에 은행이 있어요.",
  "example_zh": "這條路的盡頭有銀行。"
 },
 {
  "id": "v_1306",
  "level": 1,
  "topic": "問路與城市地標",
  "word": "바로",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "就、正好、馬上",
  "example_ko": "약국은 바로 옆에 있어요.",
  "example_zh": "藥局就在旁邊。"
 },
 {
  "id": "v_1307",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "커피",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "咖啡",
  "example_ko": "커피 한 잔 마실까요?",
  "example_zh": "要不要喝杯咖啡？"
 },
 {
  "id": "v_1308",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "물",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "水",
  "example_ko": "물 한 잔 주세요.",
  "example_zh": "請給我一杯水。"
 },
 {
  "id": "v_1309",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "주문하다",
  "pos": "動詞",
  "hanja": "注文",
  "meaning_zh": "點餐、訂購",
  "example_ko": "커피를 두 잔 주문했어요.",
  "example_zh": "我點了兩杯咖啡。"
 },
 {
  "id": "v_1310",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "카페",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "咖啡廳",
  "example_ko": "카페에서 친구를 기다려요.",
  "example_zh": "在咖啡廳等朋友。"
 },
 {
  "id": "v_1311",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "아메리카노",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "美式咖啡",
  "example_ko": "아이스 아메리카노 한 잔 주세요.",
  "example_zh": "請給我一杯冰美式。"
 },
 {
  "id": "v_1312",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "라떼",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "拿鐵",
  "example_ko": "저는 따뜻한 라떼를 좋아해요.",
  "example_zh": "我喜歡熱拿鐵。"
 },
 {
  "id": "v_1313",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "녹차",
  "pos": "名詞",
  "hanja": "綠茶",
  "meaning_zh": "綠茶",
  "example_ko": "녹차는 건강에 좋아요.",
  "example_zh": "綠茶對健康很好。"
 },
 {
  "id": "v_1314",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "홍차",
  "pos": "名詞",
  "hanja": "紅茶",
  "meaning_zh": "紅茶",
  "example_ko": "홍차에 설탕을 넣어요.",
  "example_zh": "在紅茶裡加糖。"
 },
 {
  "id": "v_1315",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "차",
  "pos": "名詞",
  "hanja": "茶",
  "meaning_zh": "茶",
  "example_ko": "따뜻한 차를 마셔요.",
  "example_zh": "喝熱茶。"
 },
 {
  "id": "v_1316",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "주스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "果汁",
  "example_ko": "오렌지 주스 두 잔 주세요.",
  "example_zh": "請給我兩杯柳橙汁。"
 },
 {
  "id": "v_1317",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "콜라",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "可樂",
  "example_ko": "콜라는 너무 달아요.",
  "example_zh": "可樂太甜了。"
 },
 {
  "id": "v_1318",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "케이크",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "蛋糕",
  "example_ko": "생일 케이크를 샀어요.",
  "example_zh": "我買了生日蛋糕。"
 },
 {
  "id": "v_1319",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "쿠키",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "餅乾",
  "example_ko": "쿠키하고 우유를 먹어요.",
  "example_zh": "吃餅乾配牛奶。"
 },
 {
  "id": "v_1320",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "빙수",
  "pos": "名詞",
  "hanja": "冰水",
  "meaning_zh": "刨冰（韓式剉冰）",
  "example_ko": "여름에는 빙수가 인기가 많아요.",
  "example_zh": "夏天刨冰很受歡迎。"
 },
 {
  "id": "v_1321",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "아이스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "冰的（飲料）",
  "example_ko": "아이스로 드릴까요?",
  "example_zh": "要冰的嗎？"
 },
 {
  "id": "v_1322",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "따뜻하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "溫暖、熱的（飲料）",
  "example_ko": "따뜻한 커피 주세요.",
  "example_zh": "請給我熱咖啡。"
 },
 {
  "id": "v_1323",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "뜨겁다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "燙、很熱",
  "example_ko": "커피가 뜨거워요. 조심하세요.",
  "example_zh": "咖啡很燙，小心。"
 },
 {
  "id": "v_1324",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "차갑다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "冰冷、冰涼",
  "example_ko": "차가운 물 한 잔 주세요.",
  "example_zh": "請給我一杯冰水。"
 },
 {
  "id": "v_1325",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "시원하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "涼爽、冰涼爽口",
  "example_ko": "시원한 주스를 마시고 싶어요.",
  "example_zh": "我想喝冰涼的果汁。"
 },
 {
  "id": "v_1326",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "잔",
  "pos": "名詞（量詞）",
  "hanja": "盞",
  "meaning_zh": "杯（算飲料）",
  "example_ko": "커피 두 잔 주세요.",
  "example_zh": "請給我兩杯咖啡。"
 },
 {
  "id": "v_1327",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "컵",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "杯子",
  "example_ko": "컵이 깨졌어요.",
  "example_zh": "杯子破了。"
 },
 {
  "id": "v_1328",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "얼음",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "冰塊",
  "example_ko": "얼음은 조금만 넣어 주세요.",
  "example_zh": "冰塊請少放一點。"
 },
 {
  "id": "v_1329",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "설탕",
  "pos": "名詞",
  "hanja": "雪糖",
  "meaning_zh": "糖、砂糖",
  "example_ko": "설탕은 빼 주세요.",
  "example_zh": "請不要加糖。"
 },
 {
  "id": "v_1330",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "빨대",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "吸管",
  "example_ko": "빨대 하나 주세요.",
  "example_zh": "請給我一根吸管。"
 },
 {
  "id": "v_1331",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "사이즈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "尺寸、大小（杯）",
  "example_ko": "사이즈는 어떻게 드릴까요?",
  "example_zh": "請問要什麼尺寸？"
 },
 {
  "id": "v_1332",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "포장",
  "pos": "名詞",
  "hanja": "包裝",
  "meaning_zh": "外帶、打包；包裝",
  "example_ko": "포장해 주세요.",
  "example_zh": "請幫我外帶。"
 },
 {
  "id": "v_1333",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "손님",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "客人",
  "example_ko": "손님, 주문하시겠어요?",
  "example_zh": "客人，請問要點餐嗎？"
 },
 {
  "id": "v_1334",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "점원",
  "pos": "名詞",
  "hanja": "店員",
  "meaning_zh": "店員",
  "example_ko": "점원이 아주 친절해요.",
  "example_zh": "店員非常親切。"
 },
 {
  "id": "v_1335",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "초콜릿",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "巧克力",
  "example_ko": "초콜릿 케이크가 맛있어요.",
  "example_zh": "巧克力蛋糕很好吃。"
 },
 {
  "id": "v_1336",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "샌드위치",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "三明治",
  "example_ko": "점심에 샌드위치를 먹었어요.",
  "example_zh": "中午吃了三明治。"
 },
 {
  "id": "v_1337",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "휴지",
  "pos": "名詞",
  "hanja": "休紙",
  "meaning_zh": "衛生紙、紙巾",
  "example_ko": "휴지 좀 주세요.",
  "example_zh": "請給我一些紙巾。"
 },
 {
  "id": "v_1338",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "영수증",
  "pos": "名詞",
  "hanja": "領收證",
  "meaning_zh": "收據",
  "example_ko": "영수증 필요하세요?",
  "example_zh": "需要收據嗎？"
 },
 {
  "id": "v_1339",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "쓰다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "苦",
  "example_ko": "이 커피는 너무 써요.",
  "example_zh": "這杯咖啡太苦了。"
 },
 {
  "id": "v_1340",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "word": "디저트",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "甜點",
  "example_ko": "디저트로 케이크를 먹어요.",
  "example_zh": "甜點吃蛋糕。"
 },
 {
  "id": "v_1341",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "음식",
  "pos": "名詞",
  "hanja": "飲食",
  "meaning_zh": "食物、料理",
  "example_ko": "저는 한국 음식을 좋아해요.",
  "example_zh": "我喜歡韓國料理。"
 },
 {
  "id": "v_1342",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "밥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "飯、餐",
  "example_ko": "저는 아침에 밥을 먹어요.",
  "example_zh": "我早上吃飯。"
 },
 {
  "id": "v_1343",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "김치",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式泡菜",
  "example_ko": "김치가 조금 매워요.",
  "example_zh": "泡菜有點辣。"
 },
 {
  "id": "v_1344",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "라면",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "泡麵、拉麵",
  "example_ko": "배가 고파서 라면을 먹었어요.",
  "example_zh": "肚子餓了，所以吃了泡麵。"
 },
 {
  "id": "v_1345",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "비빔밥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式拌飯",
  "example_ko": "비빔밥 하나 주세요.",
  "example_zh": "請給我一份拌飯。"
 },
 {
  "id": "v_1346",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "불고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式烤肉",
  "example_ko": "불고기가 정말 맛있어요.",
  "example_zh": "韓式烤肉真的很好吃。"
 },
 {
  "id": "v_1347",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "떡볶이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "辣炒年糕",
  "example_ko": "학교 앞에서 떡볶이를 사 먹었어요.",
  "example_zh": "在學校前面買了辣炒年糕來吃。"
 },
 {
  "id": "v_1348",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "김밥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "紫菜包飯",
  "example_ko": "소풍 때 김밥을 싸요.",
  "example_zh": "郊遊時會包紫菜包飯。"
 },
 {
  "id": "v_1349",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "냉면",
  "pos": "名詞",
  "hanja": "冷麵",
  "meaning_zh": "冷麵",
  "example_ko": "여름에는 시원한 냉면이 맛있어요.",
  "example_zh": "夏天冰涼的冷麵很好吃。"
 },
 {
  "id": "v_1350",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "삼겹살",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "五花肉",
  "example_ko": "친구들하고 삼겹살을 구워 먹었어요.",
  "example_zh": "和朋友們烤五花肉來吃。"
 },
 {
  "id": "v_1351",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "갈비",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "排骨（韓式烤排骨）",
  "example_ko": "갈비는 조금 비싸요.",
  "example_zh": "排骨有點貴。"
 },
 {
  "id": "v_1352",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "치킨",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "炸雞",
  "example_ko": "치킨하고 맥주를 시켰어요.",
  "example_zh": "點了炸雞和啤酒。"
 },
 {
  "id": "v_1353",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "짜장면",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "炸醬麵",
  "example_ko": "이사하는 날에 짜장면을 먹어요.",
  "example_zh": "搬家那天吃炸醬麵。"
 },
 {
  "id": "v_1354",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "짬뽕",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "炒碼麵（辣海鮮湯麵）",
  "example_ko": "짬뽕은 국물이 매워요.",
  "example_zh": "炒碼麵的湯很辣。"
 },
 {
  "id": "v_1355",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "김치찌개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "泡菜鍋",
  "example_ko": "어머니가 김치찌개를 끓였어요.",
  "example_zh": "媽媽煮了泡菜鍋。"
 },
 {
  "id": "v_1356",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "된장찌개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "大醬湯",
  "example_ko": "된장찌개는 한국의 집밥이에요.",
  "example_zh": "大醬湯是韓國的家常菜。"
 },
 {
  "id": "v_1357",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "순두부찌개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "嫩豆腐鍋",
  "example_ko": "순두부찌개에 계란을 넣어요.",
  "example_zh": "在嫩豆腐鍋裡加雞蛋。"
 },
 {
  "id": "v_1358",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "찌개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鍋、燉湯（湯少料多）",
  "example_ko": "찌개를 같이 먹어요.",
  "example_zh": "一起吃鍋。"
 },
 {
  "id": "v_1359",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "국",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "湯",
  "example_ko": "아침에 국하고 밥을 먹어요.",
  "example_zh": "早上吃湯和飯。"
 },
 {
  "id": "v_1360",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "국수",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "麵、麵條",
  "example_ko": "점심에 국수를 먹었어요.",
  "example_zh": "中午吃了麵。"
 },
 {
  "id": "v_1361",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "떡",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "年糕",
  "example_ko": "떡을 좋아해요?",
  "example_zh": "你喜歡年糕嗎？"
 },
 {
  "id": "v_1362",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "만두",
  "pos": "名詞",
  "hanja": "饅頭",
  "meaning_zh": "餃子",
  "example_ko": "만두를 쪄서 먹어요.",
  "example_zh": "把餃子蒸來吃。"
 },
 {
  "id": "v_1363",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "김",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "海苔",
  "example_ko": "김에 밥을 싸서 먹어요.",
  "example_zh": "用海苔包飯吃。"
 },
 {
  "id": "v_1364",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "반찬",
  "pos": "名詞",
  "hanja": "飯饌",
  "meaning_zh": "小菜、配菜",
  "example_ko": "한국 식당은 반찬이 많아요.",
  "example_zh": "韓國餐廳的小菜很多。"
 },
 {
  "id": "v_1365",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "삼계탕",
  "pos": "名詞",
  "hanja": "蔘雞湯",
  "meaning_zh": "人蔘雞湯",
  "example_ko": "여름에 삼계탕을 먹어요.",
  "example_zh": "夏天吃人蔘雞湯。"
 },
 {
  "id": "v_1366",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "잡채",
  "pos": "名詞",
  "hanja": "雜菜",
  "meaning_zh": "雜菜（韓式炒冬粉）",
  "example_ko": "잡채는 생일에 자주 먹어요.",
  "example_zh": "生日時常吃雜菜。"
 },
 {
  "id": "v_1367",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "파전",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "蔥煎餅",
  "example_ko": "비가 오는 날에는 파전이 생각나요.",
  "example_zh": "下雨天會想吃蔥煎餅。"
 },
 {
  "id": "v_1368",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "순대",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "血腸（韓式米腸）",
  "example_ko": "시장에서 순대를 샀어요.",
  "example_zh": "在市場買了血腸。"
 },
 {
  "id": "v_1369",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "어묵",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "魚板",
  "example_ko": "겨울에는 따뜻한 어묵이 좋아요.",
  "example_zh": "冬天熱熱的魚板最棒了。"
 },
 {
  "id": "v_1370",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "튀김",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "炸物、天婦羅",
  "example_ko": "떡볶이하고 튀김을 같이 먹어요.",
  "example_zh": "辣炒年糕配炸物一起吃。"
 },
 {
  "id": "v_1371",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "호떡",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "糖餅（韓式黑糖餅）",
  "example_ko": "호떡은 달고 맛있어요.",
  "example_zh": "糖餅甜甜的很好吃。"
 },
 {
  "id": "v_1372",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "한식",
  "pos": "名詞",
  "hanja": "韓食",
  "meaning_zh": "韓式料理",
  "example_ko": "외국인 친구가 한식을 좋아해요.",
  "example_zh": "外國朋友喜歡韓式料理。"
 },
 {
  "id": "v_1373",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "분식",
  "pos": "名詞",
  "hanja": "粉食",
  "meaning_zh": "小吃（麵食、炸物等平價小吃）",
  "example_ko": "분식집에서 김밥을 먹었어요.",
  "example_zh": "在小吃店吃了紫菜包飯。"
 },
 {
  "id": "v_1374",
  "level": 1,
  "topic": "韓國常見平民美食",
  "word": "요리",
  "pos": "名詞",
  "hanja": "料理",
  "meaning_zh": "料理、做菜",
  "example_ko": "저는 요리를 잘 못해요.",
  "example_zh": "我不太會做菜。"
 },
 {
  "id": "v_1375",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "식당",
  "pos": "名詞",
  "hanja": "食堂",
  "meaning_zh": "餐廳、飯館",
  "example_ko": "학교 앞 식당에서 점심을 먹어요.",
  "example_zh": "我在學校前面的餐廳吃午餐。"
 },
 {
  "id": "v_1376",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "메뉴",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "菜單",
  "example_ko": "메뉴 좀 보여 주세요.",
  "example_zh": "請給我看一下菜單。"
 },
 {
  "id": "v_1377",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "숟가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "湯匙",
  "example_ko": "숟가락 좀 주세요.",
  "example_zh": "請給我湯匙。"
 },
 {
  "id": "v_1378",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "젓가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "筷子",
  "example_ko": "젓가락으로 국수를 먹어요.",
  "example_zh": "用筷子吃麵。"
 },
 {
  "id": "v_1379",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맛",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "味道",
  "example_ko": "이 음식은 맛이 좋아요.",
  "example_zh": "這道菜味道很好。"
 },
 {
  "id": "v_1380",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맛있다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "好吃、美味",
  "example_ko": "이 식당 음식이 맛있어요.",
  "example_zh": "這家餐廳的菜很好吃。"
 },
 {
  "id": "v_1381",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맵다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "辣",
  "example_ko": "떡볶이가 너무 매워요.",
  "example_zh": "辣炒年糕太辣了。"
 },
 {
  "id": "v_1382",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "달다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "甜",
  "example_ko": "이 케이크는 아주 달아요.",
  "example_zh": "這個蛋糕很甜。"
 },
 {
  "id": "v_1383",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "짜다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "鹹",
  "example_ko": "국이 좀 짜요.",
  "example_zh": "湯有點鹹。"
 },
 {
  "id": "v_1384",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "배고프다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "肚子餓",
  "example_ko": "배고파요. 밥 먹으러 가요.",
  "example_zh": "我餓了，我們去吃飯吧。"
 },
 {
  "id": "v_1385",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "배부르다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "吃飽、肚子飽",
  "example_ko": "많이 먹어서 배불러요.",
  "example_zh": "吃了很多，好飽。"
 },
 {
  "id": "v_1386",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "많이",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "多、很多地",
  "example_ko": "많이 드세요.",
  "example_zh": "請多吃一點。"
 },
 {
  "id": "v_1387",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맛없다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "不好吃、難吃",
  "example_ko": "이 국은 맛없어요.",
  "example_zh": "這碗湯不好吃。"
 },
 {
  "id": "v_1388",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "싱겁다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "（味道）淡",
  "example_ko": "국이 좀 싱거워요. 소금 주세요.",
  "example_zh": "湯有點淡，請給我鹽。"
 },
 {
  "id": "v_1389",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "시다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "酸",
  "example_ko": "레몬이 너무 셔요.",
  "example_zh": "檸檬太酸了。"
 },
 {
  "id": "v_1390",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "고소하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "香、香醇（芝麻、堅果類的香味）",
  "example_ko": "참기름 냄새가 고소해요.",
  "example_zh": "香油的味道好香。"
 },
 {
  "id": "v_1391",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맛보다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "嚐、品嚐",
  "example_ko": "이 김치 좀 맛보세요.",
  "example_zh": "嚐嚐看這個泡菜。"
 },
 {
  "id": "v_1392",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "느끼하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "油膩",
  "example_ko": "피자가 좀 느끼해요.",
  "example_zh": "披薩有點油膩。"
 },
 {
  "id": "v_1393",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "그릇",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "碗、器皿",
  "example_ko": "그릇이 뜨거워요.",
  "example_zh": "碗很燙。"
 },
 {
  "id": "v_1394",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "접시",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "盤子",
  "example_ko": "접시 하나 더 주세요.",
  "example_zh": "請再給我一個盤子。"
 },
 {
  "id": "v_1395",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "수저",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "餐具（湯匙和筷子）",
  "example_ko": "수저는 테이블 서랍에 있어요.",
  "example_zh": "餐具在桌子的抽屜裡。"
 },
 {
  "id": "v_1396",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "계산서",
  "pos": "名詞",
  "hanja": "計算書",
  "meaning_zh": "帳單",
  "example_ko": "계산서 주세요.",
  "example_zh": "請給我帳單。"
 },
 {
  "id": "v_1397",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "음료수",
  "pos": "名詞",
  "hanja": "飲料水",
  "meaning_zh": "飲料",
  "example_ko": "음료수는 뭐 드릴까요?",
  "example_zh": "飲料要喝什麼呢？"
 },
 {
  "id": "v_1398",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "맥주",
  "pos": "名詞",
  "hanja": "麥酒",
  "meaning_zh": "啤酒",
  "example_ko": "치킨에는 맥주가 잘 어울려요.",
  "example_zh": "炸雞配啤酒很搭。"
 },
 {
  "id": "v_1399",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "소주",
  "pos": "名詞",
  "hanja": "燒酒",
  "meaning_zh": "燒酒",
  "example_ko": "한국 사람들은 소주를 자주 마셔요.",
  "example_zh": "韓國人常喝燒酒。"
 },
 {
  "id": "v_1400",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "술",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "酒",
  "example_ko": "저는 술을 못 마셔요.",
  "example_zh": "我不能喝酒。"
 },
 {
  "id": "v_1401",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "인분",
  "pos": "名詞（量詞）",
  "hanja": "人分",
  "meaning_zh": "人份",
  "example_ko": "삼겹살 이 인분 주세요.",
  "example_zh": "請給我兩人份五花肉。"
 },
 {
  "id": "v_1402",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "더",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "再、更",
  "example_ko": "밥 좀 더 주세요.",
  "example_zh": "請再給我一點飯。"
 },
 {
  "id": "v_1403",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "너무",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "太、非常",
  "example_ko": "너무 맛있어요!",
  "example_zh": "太好吃了！"
 },
 {
  "id": "v_1404",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "조금",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "一點、稍微",
  "example_ko": "조금만 맵게 해 주세요.",
  "example_zh": "請做得稍微辣一點就好。"
 },
 {
  "id": "v_1405",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "저기요",
  "pos": "感嘆詞",
  "hanja": null,
  "meaning_zh": "不好意思（叫人、引起注意）",
  "example_ko": "저기요, 물 좀 주세요.",
  "example_zh": "不好意思，請給我水。"
 },
 {
  "id": "v_1406",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "여기요",
  "pos": "感嘆詞",
  "hanja": null,
  "meaning_zh": "這邊（叫服務生）",
  "example_ko": "여기요! 주문할게요.",
  "example_zh": "這邊！我要點餐。"
 },
 {
  "id": "v_1407",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "식사",
  "pos": "名詞",
  "hanja": "食事",
  "meaning_zh": "用餐、飯",
  "example_ko": "식사하셨어요?",
  "example_zh": "您吃飯了嗎？"
 },
 {
  "id": "v_1408",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "word": "냄새",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "氣味、味道（聞到的）",
  "example_ko": "음식 냄새가 좋아요.",
  "example_zh": "食物的味道很香。"
 },
 {
  "id": "v_1409",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "肉",
  "example_ko": "주말에 친구하고 고기를 먹었어요.",
  "example_zh": "週末和朋友去吃了肉。"
 },
 {
  "id": "v_1410",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "생선",
  "pos": "名詞",
  "hanja": "生鮮",
  "meaning_zh": "魚（食用的魚）",
  "example_ko": "어머니는 생선을 좋아하세요.",
  "example_zh": "媽媽喜歡吃魚。"
 },
 {
  "id": "v_1411",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "과일",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "水果",
  "example_ko": "시장에서 과일을 샀어요.",
  "example_zh": "我在市場買了水果。"
 },
 {
  "id": "v_1412",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "야채",
  "pos": "名詞",
  "hanja": "野菜",
  "meaning_zh": "蔬菜",
  "example_ko": "저는 야채를 좋아해요.",
  "example_zh": "我喜歡吃蔬菜。"
 },
 {
  "id": "v_1413",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "빵",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "麵包",
  "example_ko": "아침에 빵을 먹었어요.",
  "example_zh": "我早上吃了麵包。"
 },
 {
  "id": "v_1414",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "우유",
  "pos": "名詞",
  "hanja": "牛乳",
  "meaning_zh": "牛奶",
  "example_ko": "저는 매일 우유를 마셔요.",
  "example_zh": "我每天都喝牛奶。"
 },
 {
  "id": "v_1415",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "사과",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "蘋果",
  "example_ko": "사과 하나에 천 원이에요.",
  "example_zh": "蘋果一顆一千韓元。"
 },
 {
  "id": "v_1416",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "배",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "梨子",
  "example_ko": "한국 배는 크고 달아요.",
  "example_zh": "韓國的梨子又大又甜。"
 },
 {
  "id": "v_1417",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "바나나",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "香蕉",
  "example_ko": "아침에 바나나를 먹어요.",
  "example_zh": "早上吃香蕉。"
 },
 {
  "id": "v_1418",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "포도",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "葡萄",
  "example_ko": "포도 주스를 좋아해요.",
  "example_zh": "我喜歡葡萄汁。"
 },
 {
  "id": "v_1419",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "딸기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "草莓",
  "example_ko": "겨울에 딸기가 맛있어요.",
  "example_zh": "冬天的草莓很好吃。"
 },
 {
  "id": "v_1420",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "수박",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "西瓜",
  "example_ko": "여름에는 수박을 많이 먹어요.",
  "example_zh": "夏天常吃西瓜。"
 },
 {
  "id": "v_1421",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "귤",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "橘子",
  "example_ko": "제주도 귤이 유명해요.",
  "example_zh": "濟州島的橘子很有名。"
 },
 {
  "id": "v_1422",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "복숭아",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "桃子",
  "example_ko": "복숭아가 아주 부드러워요.",
  "example_zh": "桃子很軟嫩。"
 },
 {
  "id": "v_1423",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "레몬",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "檸檬",
  "example_ko": "레몬차를 마셨어요.",
  "example_zh": "喝了檸檬茶。"
 },
 {
  "id": "v_1424",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "돼지고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "豬肉",
  "example_ko": "저는 돼지고기를 안 먹어요.",
  "example_zh": "我不吃豬肉。"
 },
 {
  "id": "v_1425",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "소고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "牛肉",
  "example_ko": "소고기는 비싸요.",
  "example_zh": "牛肉很貴。"
 },
 {
  "id": "v_1426",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "닭고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雞肉",
  "example_ko": "닭고기로 삼계탕을 만들어요.",
  "example_zh": "用雞肉做人蔘雞湯。"
 },
 {
  "id": "v_1427",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "계란",
  "pos": "名詞",
  "hanja": "雞卵",
  "meaning_zh": "雞蛋",
  "example_ko": "아침에 계란 두 개를 먹었어요.",
  "example_zh": "早上吃了兩顆雞蛋。"
 },
 {
  "id": "v_1428",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "두부",
  "pos": "名詞",
  "hanja": "豆腐",
  "meaning_zh": "豆腐",
  "example_ko": "두부는 건강에 좋아요.",
  "example_zh": "豆腐對健康很好。"
 },
 {
  "id": "v_1429",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "쌀",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "米",
  "example_ko": "쌀로 밥을 지어요.",
  "example_zh": "用米煮飯。"
 },
 {
  "id": "v_1430",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "양파",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "洋蔥",
  "example_ko": "양파를 썰면 눈물이 나요.",
  "example_zh": "切洋蔥會流眼淚。"
 },
 {
  "id": "v_1431",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "마늘",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "大蒜",
  "example_ko": "한국 요리에는 마늘을 많이 넣어요.",
  "example_zh": "韓國料理會放很多大蒜。"
 },
 {
  "id": "v_1432",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "감자",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "馬鈴薯",
  "example_ko": "감자를 삶아서 먹어요.",
  "example_zh": "把馬鈴薯煮來吃。"
 },
 {
  "id": "v_1433",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "고구마",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "地瓜",
  "example_ko": "겨울에는 군고구마가 맛있어요.",
  "example_zh": "冬天的烤地瓜很好吃。"
 },
 {
  "id": "v_1434",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "당근",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "紅蘿蔔",
  "example_ko": "당근은 눈에 좋아요.",
  "example_zh": "紅蘿蔔對眼睛很好。"
 },
 {
  "id": "v_1435",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "배추",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "大白菜",
  "example_ko": "배추로 김치를 만들어요.",
  "example_zh": "用大白菜做泡菜。"
 },
 {
  "id": "v_1436",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "오이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "小黃瓜",
  "example_ko": "오이는 시원하고 맛있어요.",
  "example_zh": "小黃瓜清脆爽口。"
 },
 {
  "id": "v_1437",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "토마토",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "番茄",
  "example_ko": "토마토는 과일이에요? 야채예요?",
  "example_zh": "番茄是水果還是蔬菜？"
 },
 {
  "id": "v_1438",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "버섯",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "菇、香菇",
  "example_ko": "찌개에 버섯을 넣었어요.",
  "example_zh": "在鍋裡加了菇。"
 },
 {
  "id": "v_1439",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "새우",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "蝦子",
  "example_ko": "새우 튀김이 맛있어요.",
  "example_zh": "炸蝦很好吃。"
 },
 {
  "id": "v_1440",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "해산물",
  "pos": "名詞",
  "hanja": "海產物",
  "meaning_zh": "海鮮",
  "example_ko": "부산은 해산물이 유명해요.",
  "example_zh": "釜山的海鮮很有名。"
 },
 {
  "id": "v_1441",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "치즈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "起司",
  "example_ko": "치즈 떡볶이를 먹어 봤어요?",
  "example_zh": "你吃過起司辣炒年糕嗎？"
 },
 {
  "id": "v_1442",
  "level": 1,
  "topic": "水果與生鮮食材",
  "word": "소금",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鹽",
  "example_ko": "소금을 조금 넣으세요.",
  "example_zh": "請加一點鹽。"
 },
 {
  "id": "v_1443",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "마트",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "超市、大賣場",
  "example_ko": "마트에서 우유를 샀어요.",
  "example_zh": "在超市買了牛奶。"
 },
 {
  "id": "v_1444",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "물건",
  "pos": "名詞",
  "hanja": "物件",
  "meaning_zh": "東西、物品",
  "example_ko": "이 가게는 물건이 많아요.",
  "example_zh": "這家店東西很多。"
 },
 {
  "id": "v_1445",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "사다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "買",
  "example_ko": "시장에서 사과를 사요.",
  "example_zh": "在市場買蘋果。"
 },
 {
  "id": "v_1446",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "팔다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "賣",
  "example_ko": "이 가게에서 과일을 팔아요.",
  "example_zh": "這家店有賣水果。"
 },
 {
  "id": "v_1447",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "주다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "給",
  "example_ko": "사과 세 개 주세요.",
  "example_zh": "請給我三顆蘋果。"
 },
 {
  "id": "v_1448",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "얼마",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "多少（錢）",
  "example_ko": "이거 얼마예요?",
  "example_zh": "這個多少錢？"
 },
 {
  "id": "v_1449",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "원",
  "pos": "名詞（量詞）",
  "hanja": null,
  "meaning_zh": "韓元（韓國貨幣單位）",
  "example_ko": "이 볼펜은 천 원이에요.",
  "example_zh": "這支原子筆一千韓元。"
 },
 {
  "id": "v_1450",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "돈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "錢",
  "example_ko": "돈이 없어요.",
  "example_zh": "我沒有錢。"
 },
 {
  "id": "v_1451",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "가격",
  "pos": "名詞",
  "hanja": "價格",
  "meaning_zh": "價格",
  "example_ko": "가격이 좀 비싸요.",
  "example_zh": "價格有點貴。"
 },
 {
  "id": "v_1452",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "값",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "價錢、價格",
  "example_ko": "과일 값이 올랐어요.",
  "example_zh": "水果的價錢漲了。"
 },
 {
  "id": "v_1453",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "싸다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "便宜",
  "example_ko": "시장은 마트보다 싸요.",
  "example_zh": "市場比超市便宜。"
 },
 {
  "id": "v_1454",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "비싸다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "貴",
  "example_ko": "이 가방은 너무 비싸요.",
  "example_zh": "這個包包太貴了。"
 },
 {
  "id": "v_1455",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "개",
  "pos": "名詞（量詞）",
  "hanja": "個",
  "meaning_zh": "個（算東西）",
  "example_ko": "계란 열 개 주세요.",
  "example_zh": "請給我十顆雞蛋。"
 },
 {
  "id": "v_1456",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "병",
  "pos": "名詞（量詞）",
  "hanja": "瓶",
  "meaning_zh": "瓶",
  "example_ko": "물 두 병 샀어요.",
  "example_zh": "買了兩瓶水。"
 },
 {
  "id": "v_1457",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "봉지",
  "pos": "名詞（量詞）",
  "hanja": "封紙",
  "meaning_zh": "包、袋",
  "example_ko": "과자 한 봉지에 이천 원이에요.",
  "example_zh": "餅乾一包兩千韓元。"
 },
 {
  "id": "v_1458",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "상자",
  "pos": "名詞",
  "hanja": "箱子",
  "meaning_zh": "箱子、盒子",
  "example_ko": "귤 한 상자를 샀어요.",
  "example_zh": "買了一箱橘子。"
 },
 {
  "id": "v_1459",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "장바구니",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "購物籃、購物袋",
  "example_ko": "장바구니를 가지고 가요.",
  "example_zh": "帶著購物袋去。"
 },
 {
  "id": "v_1460",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "계산대",
  "pos": "名詞",
  "hanja": "計算臺",
  "meaning_zh": "收銀台",
  "example_ko": "계산대는 저쪽에 있어요.",
  "example_zh": "收銀台在那邊。"
 },
 {
  "id": "v_1461",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "카드",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "信用卡、卡片",
  "example_ko": "카드로 계산할게요.",
  "example_zh": "我用卡結帳。"
 },
 {
  "id": "v_1462",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "현금",
  "pos": "名詞",
  "hanja": "現金",
  "meaning_zh": "現金",
  "example_ko": "현금으로 내도 돼요?",
  "example_zh": "可以付現金嗎？"
 },
 {
  "id": "v_1463",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "거스름돈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "找零、找的錢",
  "example_ko": "여기 거스름돈이요.",
  "example_zh": "這是找您的錢。"
 },
 {
  "id": "v_1464",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "동전",
  "pos": "名詞",
  "hanja": "銅錢",
  "meaning_zh": "硬幣、零錢",
  "example_ko": "동전이 많아서 지갑이 무거워요.",
  "example_zh": "零錢太多，錢包好重。"
 },
 {
  "id": "v_1465",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "지폐",
  "pos": "名詞",
  "hanja": "紙幣",
  "meaning_zh": "紙鈔",
  "example_ko": "만 원짜리 지폐가 있어요.",
  "example_zh": "我有一萬元的紙鈔。"
 },
 {
  "id": "v_1466",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "할인",
  "pos": "名詞",
  "hanja": "割引",
  "meaning_zh": "折扣",
  "example_ko": "오늘은 이십 퍼센트 할인해요.",
  "example_zh": "今天打八折。"
 },
 {
  "id": "v_1467",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "세일",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "特價、拍賣",
  "example_ko": "백화점이 세일 중이에요.",
  "example_zh": "百貨公司正在特價。"
 },
 {
  "id": "v_1468",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "봉투",
  "pos": "名詞",
  "hanja": "封套",
  "meaning_zh": "袋子、信封",
  "example_ko": "봉투 필요하세요?",
  "example_zh": "需要袋子嗎？"
 },
 {
  "id": "v_1469",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "고르다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "挑選、選",
  "example_ko": "마음에 드는 걸로 고르세요.",
  "example_zh": "請挑你喜歡的。"
 },
 {
  "id": "v_1470",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "필요하다",
  "pos": "形容詞",
  "hanja": "必要",
  "meaning_zh": "需要",
  "example_ko": "우유가 필요해요.",
  "example_zh": "我需要牛奶。"
 },
 {
  "id": "v_1471",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "전부",
  "pos": "名詞",
  "hanja": "全部",
  "meaning_zh": "全部、總共",
  "example_ko": "전부 얼마예요?",
  "example_zh": "全部多少錢？"
 },
 {
  "id": "v_1472",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "다",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "都、全部",
  "example_ko": "우유가 다 팔렸어요.",
  "example_zh": "牛奶全賣完了。"
 },
 {
  "id": "v_1473",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "쇼핑하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "購物、逛街",
  "example_ko": "주말에 백화점에서 쇼핑해요.",
  "example_zh": "週末在百貨公司購物。"
 },
 {
  "id": "v_1474",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "무겁다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "重",
  "example_ko": "장바구니가 무거워요.",
  "example_zh": "購物籃好重。"
 },
 {
  "id": "v_1475",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "가볍다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "輕",
  "example_ko": "이 가방은 가벼워요.",
  "example_zh": "這個包包很輕。"
 },
 {
  "id": "v_1476",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "word": "달러",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "美元",
  "example_ko": "달러를 원으로 바꿨어요.",
  "example_zh": "把美元換成了韓元。"
 },
 {
  "id": "v_1477",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "옷",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "衣服",
  "example_ko": "새 옷을 샀어요.",
  "example_zh": "我買了新衣服。"
 },
 {
  "id": "v_1478",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "바지",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "褲子",
  "example_ko": "이 바지는 좀 길어요.",
  "example_zh": "這條褲子有點長。"
 },
 {
  "id": "v_1479",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "치마",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "裙子",
  "example_ko": "언니는 치마를 자주 입어요.",
  "example_zh": "姊姊常穿裙子。"
 },
 {
  "id": "v_1480",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "셔츠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "襯衫",
  "example_ko": "아버지는 흰 셔츠를 입으세요.",
  "example_zh": "爸爸穿白襯衫。"
 },
 {
  "id": "v_1481",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "티셔츠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "T 恤",
  "example_ko": "여름에는 티셔츠를 입어요.",
  "example_zh": "夏天穿 T 恤。"
 },
 {
  "id": "v_1482",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "원피스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "連身裙",
  "example_ko": "파티에 원피스를 입고 갔어요.",
  "example_zh": "穿連身裙去了派對。"
 },
 {
  "id": "v_1483",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "코트",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "大衣",
  "example_ko": "겨울에는 코트가 필요해요.",
  "example_zh": "冬天需要大衣。"
 },
 {
  "id": "v_1484",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "재킷",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "夾克、外套",
  "example_ko": "날씨가 쌀쌀해서 재킷을 입었어요.",
  "example_zh": "天氣涼涼的，所以穿了夾克。"
 },
 {
  "id": "v_1485",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "스웨터",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "毛衣",
  "example_ko": "할머니가 스웨터를 만들어 주셨어요.",
  "example_zh": "奶奶幫我織了毛衣。"
 },
 {
  "id": "v_1486",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "청바지",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "牛仔褲",
  "example_ko": "저는 청바지를 좋아해요.",
  "example_zh": "我喜歡牛仔褲。"
 },
 {
  "id": "v_1487",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "양복",
  "pos": "名詞",
  "hanja": "洋服",
  "meaning_zh": "西裝",
  "example_ko": "회사에 양복을 입고 가요.",
  "example_zh": "穿西裝去公司。"
 },
 {
  "id": "v_1488",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "속옷",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "內衣",
  "example_ko": "속옷은 서랍에 있어요.",
  "example_zh": "內衣在抽屜裡。"
 },
 {
  "id": "v_1489",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "양말",
  "pos": "名詞",
  "hanja": "洋襪",
  "meaning_zh": "襪子",
  "example_ko": "양말을 신으세요.",
  "example_zh": "請穿上襪子。"
 },
 {
  "id": "v_1490",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "신발",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鞋子",
  "example_ko": "신발을 벗고 들어오세요.",
  "example_zh": "請脫鞋進來。"
 },
 {
  "id": "v_1491",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "운동화",
  "pos": "名詞",
  "hanja": "運動靴",
  "meaning_zh": "運動鞋",
  "example_ko": "운동화를 신고 산에 가요.",
  "example_zh": "穿運動鞋去爬山。"
 },
 {
  "id": "v_1492",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "구두",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "皮鞋",
  "example_ko": "새 구두가 좀 불편해요.",
  "example_zh": "新皮鞋有點不舒服。"
 },
 {
  "id": "v_1493",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "모자",
  "pos": "名詞",
  "hanja": "帽子",
  "meaning_zh": "帽子",
  "example_ko": "햇빛이 강해서 모자를 썼어요.",
  "example_zh": "陽光很強，所以戴了帽子。"
 },
 {
  "id": "v_1494",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "안경",
  "pos": "名詞",
  "hanja": "眼鏡",
  "meaning_zh": "眼鏡",
  "example_ko": "저는 안경을 써요.",
  "example_zh": "我戴眼鏡。"
 },
 {
  "id": "v_1495",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "선글라스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "太陽眼鏡",
  "example_ko": "바다에 갈 때 선글라스를 써요.",
  "example_zh": "去海邊時戴太陽眼鏡。"
 },
 {
  "id": "v_1496",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "목도리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "圍巾",
  "example_ko": "목도리를 하면 따뜻해요.",
  "example_zh": "圍上圍巾很暖和。"
 },
 {
  "id": "v_1497",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "장갑",
  "pos": "名詞",
  "hanja": "掌匣",
  "meaning_zh": "手套",
  "example_ko": "추워서 장갑을 꼈어요.",
  "example_zh": "好冷，所以戴了手套。"
 },
 {
  "id": "v_1498",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "지갑",
  "pos": "名詞",
  "hanja": "紙匣",
  "meaning_zh": "錢包、皮夾",
  "example_ko": "지갑을 잃어버렸어요.",
  "example_zh": "我把錢包弄丟了。"
 },
 {
  "id": "v_1499",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "반지",
  "pos": "名詞",
  "hanja": "半指",
  "meaning_zh": "戒指",
  "example_ko": "결혼 반지가 예뻐요.",
  "example_zh": "結婚戒指很漂亮。"
 },
 {
  "id": "v_1500",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "목걸이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "項鍊",
  "example_ko": "엄마 생일에 목걸이를 선물했어요.",
  "example_zh": "媽媽生日時送了項鍊。"
 },
 {
  "id": "v_1501",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "귀걸이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "耳環",
  "example_ko": "귀걸이가 잘 어울려요.",
  "example_zh": "耳環很適合你。"
 },
 {
  "id": "v_1502",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "넥타이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "領帶",
  "example_ko": "넥타이를 매고 회사에 가요.",
  "example_zh": "打領帶去公司。"
 },
 {
  "id": "v_1503",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "블라우스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "女用襯衫",
  "example_ko": "흰 블라우스에 검은 치마를 입었어요.",
  "example_zh": "穿了白色女襯衫配黑裙子。"
 },
 {
  "id": "v_1504",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "패딩",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "羽絨外套",
  "example_ko": "패딩이 정말 따뜻해요.",
  "example_zh": "羽絨外套真的很暖。"
 },
 {
  "id": "v_1505",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "입다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "穿（衣服、褲子）",
  "example_ko": "오늘 무슨 옷을 입어요?",
  "example_zh": "今天要穿什麼衣服？"
 },
 {
  "id": "v_1506",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "신다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "穿（鞋子、襪子）",
  "example_ko": "구두를 신어요.",
  "example_zh": "穿皮鞋。"
 },
 {
  "id": "v_1507",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "쓰다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "戴（帽子、眼鏡）",
  "example_ko": "모자를 쓰세요.",
  "example_zh": "請戴帽子。"
 },
 {
  "id": "v_1508",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "끼다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "戴（戒指、手套）",
  "example_ko": "반지를 꼈어요.",
  "example_zh": "戴上了戒指。"
 },
 {
  "id": "v_1509",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "벗다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "脫（衣服、鞋子）",
  "example_ko": "코트를 벗으세요.",
  "example_zh": "請脫下大衣。"
 },
 {
  "id": "v_1510",
  "level": 1,
  "topic": "基礎服飾與配件",
  "word": "차다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "戴（手錶）、佩戴",
  "example_ko": "시계를 차고 있어요.",
  "example_zh": "我戴著手錶。"
 },
 {
  "id": "v_1511",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "색깔",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "顏色",
  "example_ko": "무슨 색깔을 좋아해요?",
  "example_zh": "你喜歡什麼顏色？"
 },
 {
  "id": "v_1512",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "빨간색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "紅色",
  "example_ko": "빨간색 가방을 샀어요.",
  "example_zh": "我買了紅色的包包。"
 },
 {
  "id": "v_1513",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "노란색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "黃色",
  "example_ko": "노란색은 밝은 색이에요.",
  "example_zh": "黃色是明亮的顏色。"
 },
 {
  "id": "v_1514",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "파란색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "藍色",
  "example_ko": "하늘이 파란색이에요.",
  "example_zh": "天空是藍色的。"
 },
 {
  "id": "v_1515",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "초록색",
  "pos": "名詞",
  "hanja": "草綠色",
  "meaning_zh": "綠色",
  "example_ko": "봄에는 나무가 초록색이에요.",
  "example_zh": "春天的樹是綠色的。"
 },
 {
  "id": "v_1516",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "검은색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "黑色",
  "example_ko": "검은색 구두를 신었어요.",
  "example_zh": "穿了黑色皮鞋。"
 },
 {
  "id": "v_1517",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "흰색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "白色",
  "example_ko": "흰색 셔츠가 깨끗해요.",
  "example_zh": "白襯衫很乾淨。"
 },
 {
  "id": "v_1518",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "회색",
  "pos": "名詞",
  "hanja": "灰色",
  "meaning_zh": "灰色",
  "example_ko": "회색 코트를 입었어요.",
  "example_zh": "穿了灰色大衣。"
 },
 {
  "id": "v_1519",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "분홍색",
  "pos": "名詞",
  "hanja": "粉紅色",
  "meaning_zh": "粉紅色",
  "example_ko": "동생은 분홍색을 좋아해요.",
  "example_zh": "妹妹喜歡粉紅色。"
 },
 {
  "id": "v_1520",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "보라색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "紫色",
  "example_ko": "보라색 꽃이 예뻐요.",
  "example_zh": "紫色的花很漂亮。"
 },
 {
  "id": "v_1521",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "갈색",
  "pos": "名詞",
  "hanja": "褐色",
  "meaning_zh": "咖啡色、棕色",
  "example_ko": "갈색 머리가 잘 어울려요.",
  "example_zh": "咖啡色頭髮很適合你。"
 },
 {
  "id": "v_1522",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "주황색",
  "pos": "名詞",
  "hanja": "朱黃色",
  "meaning_zh": "橘色",
  "example_ko": "귤은 주황색이에요.",
  "example_zh": "橘子是橘色的。"
 },
 {
  "id": "v_1523",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "하늘색",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "天藍色",
  "example_ko": "하늘색 원피스를 입었어요.",
  "example_zh": "穿了天藍色連身裙。"
 },
 {
  "id": "v_1524",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "빨갛다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "紅、紅紅的",
  "example_ko": "사과가 빨개요.",
  "example_zh": "蘋果紅紅的。"
 },
 {
  "id": "v_1525",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "노랗다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "黃、黃黃的",
  "example_ko": "바나나가 노래요.",
  "example_zh": "香蕉黃黃的。"
 },
 {
  "id": "v_1526",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "파랗다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "藍、藍藍的",
  "example_ko": "바다가 파래요.",
  "example_zh": "大海藍藍的。"
 },
 {
  "id": "v_1527",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "까맣다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "黑、黑黑的",
  "example_ko": "고양이가 까매요.",
  "example_zh": "貓咪黑黑的。"
 },
 {
  "id": "v_1528",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "하얗다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "白、白白的",
  "example_ko": "눈이 하얘요.",
  "example_zh": "雪白白的。"
 },
 {
  "id": "v_1529",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "크다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "大；（個子）高",
  "example_ko": "이 신발은 저한테 커요.",
  "example_zh": "這雙鞋我穿太大。"
 },
 {
  "id": "v_1530",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "작다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "小；（個子）矮",
  "example_ko": "제 방은 작지만 깨끗해요.",
  "example_zh": "我的房間雖然小但很乾淨。"
 },
 {
  "id": "v_1531",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "길다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "長",
  "example_ko": "이 바지는 너무 길어요.",
  "example_zh": "這條褲子太長了。"
 },
 {
  "id": "v_1532",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "짧다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "短",
  "example_ko": "머리가 짧아요.",
  "example_zh": "頭髮很短。"
 },
 {
  "id": "v_1533",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "예쁘다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "漂亮、好看",
  "example_ko": "꽃이 정말 예뻐요.",
  "example_zh": "花真漂亮。"
 },
 {
  "id": "v_1534",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "귀엽다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "可愛",
  "example_ko": "강아지가 너무 귀여워요.",
  "example_zh": "小狗好可愛。"
 },
 {
  "id": "v_1535",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "높다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "高",
  "example_ko": "저 산은 아주 높아요.",
  "example_zh": "那座山很高。"
 },
 {
  "id": "v_1536",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "낮다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "低",
  "example_ko": "이 의자는 너무 낮아요.",
  "example_zh": "這張椅子太低了。"
 },
 {
  "id": "v_1537",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "두껍다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "厚",
  "example_ko": "이 책은 두꺼워요.",
  "example_zh": "這本書很厚。"
 },
 {
  "id": "v_1538",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "얇다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "薄",
  "example_ko": "얇은 옷을 입었어요.",
  "example_zh": "穿了薄衣服。"
 },
 {
  "id": "v_1539",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "밝다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "亮、明亮",
  "example_ko": "방이 밝고 따뜻해요.",
  "example_zh": "房間又亮又溫暖。"
 },
 {
  "id": "v_1540",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "어둡다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "暗、黑暗",
  "example_ko": "밖이 어두워요.",
  "example_zh": "外面很暗。"
 },
 {
  "id": "v_1541",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "새",
  "pos": "冠形詞",
  "hanja": null,
  "meaning_zh": "新的",
  "example_ko": "새 옷을 입었어요.",
  "example_zh": "穿了新衣服。"
 },
 {
  "id": "v_1542",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "모양",
  "pos": "名詞",
  "hanja": "模樣",
  "meaning_zh": "形狀、樣子",
  "example_ko": "이 컵은 모양이 예뻐요.",
  "example_zh": "這個杯子形狀很漂亮。"
 },
 {
  "id": "v_1543",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "둥글다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "圓、圓圓的",
  "example_ko": "달이 둥글어요.",
  "example_zh": "月亮圓圓的。"
 },
 {
  "id": "v_1544",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "word": "오래되다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "舊、老、年代久遠",
  "example_ko": "이 건물은 아주 오래됐어요.",
  "example_zh": "這棟建築很老了。"
 },
 {
  "id": "v_1545",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "계절",
  "pos": "名詞",
  "hanja": "季節",
  "meaning_zh": "季節",
  "example_ko": "어느 계절을 좋아해요?",
  "example_zh": "你喜歡哪個季節？"
 },
 {
  "id": "v_1546",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "봄",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "春天",
  "example_ko": "봄에는 꽃이 많이 피어요.",
  "example_zh": "春天開很多花。"
 },
 {
  "id": "v_1547",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "여름",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "夏天",
  "example_ko": "여름에는 바다에 가요.",
  "example_zh": "夏天去海邊。"
 },
 {
  "id": "v_1548",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "가을",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "秋天",
  "example_ko": "가을에는 하늘이 높아요.",
  "example_zh": "秋天的天空很高。"
 },
 {
  "id": "v_1549",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "겨울",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "冬天",
  "example_ko": "겨울에는 눈이 와요.",
  "example_zh": "冬天會下雪。"
 },
 {
  "id": "v_1550",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "날씨",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "天氣",
  "example_ko": "오늘 날씨가 어때요?",
  "example_zh": "今天天氣怎麼樣？"
 },
 {
  "id": "v_1551",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "비",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雨",
  "example_ko": "비가 와서 우산을 썼어요.",
  "example_zh": "下雨了，所以撐了傘。"
 },
 {
  "id": "v_1552",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "눈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雪",
  "example_ko": "어제 눈이 많이 왔어요.",
  "example_zh": "昨天下了很多雪。"
 },
 {
  "id": "v_1553",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "바람",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "風",
  "example_ko": "바람이 많이 불어요.",
  "example_zh": "風很大。"
 },
 {
  "id": "v_1554",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "구름",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雲",
  "example_ko": "하늘에 구름이 많아요.",
  "example_zh": "天上雲很多。"
 },
 {
  "id": "v_1555",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "하늘",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "天空",
  "example_ko": "하늘이 맑아요.",
  "example_zh": "天空很晴朗。"
 },
 {
  "id": "v_1556",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "해",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "太陽",
  "example_ko": "해가 떴어요.",
  "example_zh": "太陽出來了。"
 },
 {
  "id": "v_1557",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "별",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "星星",
  "example_ko": "시골에서는 별이 잘 보여요.",
  "example_zh": "在鄉下可以清楚看到星星。"
 },
 {
  "id": "v_1558",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "달",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "月亮",
  "example_ko": "오늘 밤 달이 밝아요.",
  "example_zh": "今晚月亮很亮。"
 },
 {
  "id": "v_1559",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "맑다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "晴朗、清澈",
  "example_ko": "오늘은 날씨가 맑아요.",
  "example_zh": "今天天氣晴朗。"
 },
 {
  "id": "v_1560",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "흐리다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "陰天、不清楚",
  "example_ko": "날씨가 흐려요. 비가 올 것 같아요.",
  "example_zh": "天氣陰陰的，好像要下雨了。"
 },
 {
  "id": "v_1561",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "불다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "（風）吹",
  "example_ko": "바람이 세게 불어요.",
  "example_zh": "風吹得很強。"
 },
 {
  "id": "v_1562",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "춥다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "冷（天氣）",
  "example_ko": "겨울은 너무 추워요.",
  "example_zh": "冬天太冷了。"
 },
 {
  "id": "v_1563",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "덥다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "熱（天氣）",
  "example_ko": "여름은 아주 더워요.",
  "example_zh": "夏天很熱。"
 },
 {
  "id": "v_1564",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "쌀쌀하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "涼颼颼、有點冷",
  "example_ko": "아침저녁으로 쌀쌀해요.",
  "example_zh": "早晚涼颼颼的。"
 },
 {
  "id": "v_1565",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "도",
  "pos": "名詞（量詞）",
  "hanja": "度",
  "meaning_zh": "度（溫度）",
  "example_ko": "오늘 기온은 영하 오 도예요.",
  "example_zh": "今天氣溫零下五度。"
 },
 {
  "id": "v_1566",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "우산",
  "pos": "名詞",
  "hanja": "雨傘",
  "meaning_zh": "雨傘",
  "example_ko": "우산을 가지고 가세요.",
  "example_zh": "請帶傘出門。"
 },
 {
  "id": "v_1567",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "일기예보",
  "pos": "名詞",
  "hanja": "日氣預報",
  "meaning_zh": "天氣預報",
  "example_ko": "일기예보를 봤어요?",
  "example_zh": "你看了天氣預報嗎？"
 },
 {
  "id": "v_1568",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "꽃",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "花",
  "example_ko": "꽃이 예쁘게 피었어요.",
  "example_zh": "花開得很漂亮。"
 },
 {
  "id": "v_1569",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "단풍",
  "pos": "名詞",
  "hanja": "丹楓",
  "meaning_zh": "楓葉、紅葉",
  "example_ko": "가을에는 단풍이 아름다워요.",
  "example_zh": "秋天的楓葉很美。"
 },
 {
  "id": "v_1570",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "눈사람",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雪人",
  "example_ko": "아이들이 눈사람을 만들어요.",
  "example_zh": "孩子們在堆雪人。"
 },
 {
  "id": "v_1571",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "방학",
  "pos": "名詞",
  "hanja": "放學",
  "meaning_zh": "（學校的）寒暑假",
  "example_ko": "여름 방학에 여행을 가요.",
  "example_zh": "暑假要去旅行。"
 },
 {
  "id": "v_1572",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "무지개",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "彩虹",
  "example_ko": "비가 그치고 무지개가 떴어요.",
  "example_zh": "雨停了，出現了彩虹。"
 },
 {
  "id": "v_1573",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "햇빛",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "陽光",
  "example_ko": "햇빛이 강해요.",
  "example_zh": "陽光很強。"
 },
 {
  "id": "v_1574",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "공기",
  "pos": "名詞",
  "hanja": "空氣",
  "meaning_zh": "空氣",
  "example_ko": "산은 공기가 맑아요.",
  "example_zh": "山上的空氣很清新。"
 },
 {
  "id": "v_1575",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "비옷",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "雨衣",
  "example_ko": "비옷을 입고 학교에 가요.",
  "example_zh": "穿雨衣去上學。"
 },
 {
  "id": "v_1576",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "선풍기",
  "pos": "名詞",
  "hanja": "扇風機",
  "meaning_zh": "電風扇",
  "example_ko": "선풍기를 켜 주세요.",
  "example_zh": "請開電風扇。"
 },
 {
  "id": "v_1577",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "날",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "天、日子；天氣",
  "example_ko": "비가 오는 날에는 집에 있어요.",
  "example_zh": "下雨天我待在家。"
 },
 {
  "id": "v_1578",
  "level": 1,
  "topic": "四季與基礎天氣",
  "word": "낮",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "白天",
  "example_ko": "낮에는 덥고 밤에는 추워요.",
  "example_zh": "白天熱，晚上冷。"
 },
 {
  "id": "v_1579",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "취미",
  "pos": "名詞",
  "hanja": "趣味",
  "meaning_zh": "興趣、嗜好",
  "example_ko": "취미가 뭐예요?",
  "example_zh": "你的興趣是什麼？"
 },
 {
  "id": "v_1580",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "영화",
  "pos": "名詞",
  "hanja": "映畫",
  "meaning_zh": "電影",
  "example_ko": "주말에 영화를 봤어요.",
  "example_zh": "週末看了電影。"
 },
 {
  "id": "v_1581",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "음악",
  "pos": "名詞",
  "hanja": "音樂",
  "meaning_zh": "音樂",
  "example_ko": "저는 음악을 자주 들어요.",
  "example_zh": "我常聽音樂。"
 },
 {
  "id": "v_1582",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "노래",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "歌、歌曲",
  "example_ko": "이 노래를 알아요?",
  "example_zh": "你知道這首歌嗎？"
 },
 {
  "id": "v_1583",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "부르다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "唱（歌）；叫、喊",
  "example_ko": "노래를 불러 주세요.",
  "example_zh": "請唱首歌。"
 },
 {
  "id": "v_1584",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "노래방",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "KTV、練歌房",
  "example_ko": "친구들하고 노래방에 갔어요.",
  "example_zh": "和朋友們去了 KTV。"
 },
 {
  "id": "v_1585",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "춤",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "舞、舞蹈",
  "example_ko": "춤을 잘 춰요?",
  "example_zh": "你很會跳舞嗎？"
 },
 {
  "id": "v_1586",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "추다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "跳（舞）",
  "example_ko": "같이 춤을 춰요.",
  "example_zh": "一起跳舞吧。"
 },
 {
  "id": "v_1587",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "그림",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "畫、圖畫",
  "example_ko": "벽에 그림이 있어요.",
  "example_zh": "牆上有一幅畫。"
 },
 {
  "id": "v_1588",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "그리다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "畫",
  "example_ko": "공원에서 그림을 그려요.",
  "example_zh": "在公園畫畫。"
 },
 {
  "id": "v_1589",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "게임",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "遊戲、電玩",
  "example_ko": "동생은 게임을 좋아해요.",
  "example_zh": "弟弟喜歡玩遊戲。"
 },
 {
  "id": "v_1590",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "카메라",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "相機",
  "example_ko": "새 카메라를 샀어요.",
  "example_zh": "買了新相機。"
 },
 {
  "id": "v_1591",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "찍다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "拍（照）",
  "example_ko": "여기에서 사진을 찍어요.",
  "example_zh": "在這裡拍照。"
 },
 {
  "id": "v_1592",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "여행",
  "pos": "名詞",
  "hanja": "旅行",
  "meaning_zh": "旅行、旅遊",
  "example_ko": "방학에 제주도로 여행을 가요.",
  "example_zh": "放假要去濟州島旅行。"
 },
 {
  "id": "v_1593",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "독서",
  "pos": "名詞",
  "hanja": "讀書",
  "meaning_zh": "閱讀、讀書",
  "example_ko": "제 취미는 독서예요.",
  "example_zh": "我的興趣是閱讀。"
 },
 {
  "id": "v_1594",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "드라마",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "連續劇",
  "example_ko": "한국 드라마를 보면서 한국어를 배워요.",
  "example_zh": "邊看韓劇邊學韓文。"
 },
 {
  "id": "v_1595",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "만화",
  "pos": "名詞",
  "hanja": "漫畫",
  "meaning_zh": "漫畫、卡通",
  "example_ko": "만화책이 재미있어요.",
  "example_zh": "漫畫書很有趣。"
 },
 {
  "id": "v_1596",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "잡지",
  "pos": "名詞",
  "hanja": "雜誌",
  "meaning_zh": "雜誌",
  "example_ko": "카페에서 잡지를 읽어요.",
  "example_zh": "在咖啡廳看雜誌。"
 },
 {
  "id": "v_1597",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "낚시",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "釣魚",
  "example_ko": "아버지는 낚시를 좋아하세요.",
  "example_zh": "爸爸喜歡釣魚。"
 },
 {
  "id": "v_1598",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "캠핑",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "露營",
  "example_ko": "주말에 가족하고 캠핑을 갔어요.",
  "example_zh": "週末和家人去露營了。"
 },
 {
  "id": "v_1599",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "드라이브",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "開車兜風",
  "example_ko": "바닷가로 드라이브를 가요.",
  "example_zh": "開車去海邊兜風。"
 },
 {
  "id": "v_1600",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "재미있다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "有趣、好玩",
  "example_ko": "이 영화는 정말 재미있어요.",
  "example_zh": "這部電影真的很有趣。"
 },
 {
  "id": "v_1601",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "재미없다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "無聊、不好玩",
  "example_ko": "그 드라마는 재미없어요.",
  "example_zh": "那部連續劇很無聊。"
 },
 {
  "id": "v_1602",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "좋아하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "喜歡",
  "example_ko": "저는 운동을 좋아해요.",
  "example_zh": "我喜歡運動。"
 },
 {
  "id": "v_1603",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "싫어하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "討厭、不喜歡",
  "example_ko": "저는 벌레를 싫어해요.",
  "example_zh": "我討厭蟲子。"
 },
 {
  "id": "v_1604",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "놀다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "玩、遊玩",
  "example_ko": "주말에 친구하고 놀았어요.",
  "example_zh": "週末和朋友一起玩了。"
 },
 {
  "id": "v_1605",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "휴일",
  "pos": "名詞",
  "hanja": "休日",
  "meaning_zh": "假日、休假日",
  "example_ko": "휴일에는 늦게까지 자요.",
  "example_zh": "假日會睡到很晚。"
 },
 {
  "id": "v_1606",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "평일",
  "pos": "名詞",
  "hanja": "平日",
  "meaning_zh": "平日、平常日",
  "example_ko": "평일에는 바빠요.",
  "example_zh": "平日很忙。"
 },
 {
  "id": "v_1607",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "낮잠",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "午覺、午睡",
  "example_ko": "점심을 먹고 낮잠을 잤어요.",
  "example_zh": "吃完午餐睡了午覺。"
 },
 {
  "id": "v_1608",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "혼자",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "獨自、一個人",
  "example_ko": "혼자 영화를 봤어요.",
  "example_zh": "一個人看了電影。"
 },
 {
  "id": "v_1609",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "함께",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "一起、一同",
  "example_ko": "가족하고 함께 여행해요.",
  "example_zh": "和家人一起旅行。"
 },
 {
  "id": "v_1610",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "가끔",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "偶爾、有時候",
  "example_ko": "가끔 노래방에 가요.",
  "example_zh": "偶爾去 KTV。"
 },
 {
  "id": "v_1611",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "자주",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "常常、經常",
  "example_ko": "저는 자주 산책해요.",
  "example_zh": "我常常散步。"
 },
 {
  "id": "v_1612",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "word": "유명하다",
  "pos": "形容詞",
  "hanja": "有名",
  "meaning_zh": "有名、出名",
  "example_ko": "이 식당은 아주 유명해요.",
  "example_zh": "這家餐廳很有名。"
 },
 {
  "id": "v_1613",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "운동",
  "pos": "名詞",
  "hanja": "運動",
  "meaning_zh": "運動",
  "example_ko": "운동은 건강에 좋아요.",
  "example_zh": "運動對健康很好。"
 },
 {
  "id": "v_1614",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "운동하다",
  "pos": "動詞",
  "hanja": "運動",
  "meaning_zh": "運動、做運動",
  "example_ko": "저는 아침마다 운동해요.",
  "example_zh": "我每天早上運動。"
 },
 {
  "id": "v_1615",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "축구",
  "pos": "名詞",
  "hanja": "蹴球",
  "meaning_zh": "足球",
  "example_ko": "남동생은 축구를 좋아해요.",
  "example_zh": "弟弟喜歡足球。"
 },
 {
  "id": "v_1616",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "야구",
  "pos": "名詞",
  "hanja": "野球",
  "meaning_zh": "棒球",
  "example_ko": "야구 경기를 보러 가요.",
  "example_zh": "去看棒球比賽。"
 },
 {
  "id": "v_1617",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "농구",
  "pos": "名詞",
  "hanja": "籠球",
  "meaning_zh": "籃球",
  "example_ko": "학교에서 농구를 해요.",
  "example_zh": "在學校打籃球。"
 },
 {
  "id": "v_1618",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "배구",
  "pos": "名詞",
  "hanja": "排球",
  "meaning_zh": "排球",
  "example_ko": "배구는 여섯 명이 한 팀이에요.",
  "example_zh": "排球是六個人一隊。"
 },
 {
  "id": "v_1619",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "테니스",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "網球",
  "example_ko": "주말에 테니스를 쳐요.",
  "example_zh": "週末打網球。"
 },
 {
  "id": "v_1620",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "탁구",
  "pos": "名詞",
  "hanja": "卓球",
  "meaning_zh": "桌球、乒乓球",
  "example_ko": "탁구를 잘 쳐요?",
  "example_zh": "你桌球打得好嗎？"
 },
 {
  "id": "v_1621",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "배드민턴",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "羽毛球",
  "example_ko": "공원에서 배드민턴을 쳤어요.",
  "example_zh": "在公園打了羽毛球。"
 },
 {
  "id": "v_1622",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "골프",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "高爾夫球",
  "example_ko": "아버지는 골프를 치세요.",
  "example_zh": "爸爸打高爾夫球。"
 },
 {
  "id": "v_1623",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "수영",
  "pos": "名詞",
  "hanja": "水泳",
  "meaning_zh": "游泳",
  "example_ko": "수영을 배우고 싶어요.",
  "example_zh": "我想學游泳。"
 },
 {
  "id": "v_1624",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "수영장",
  "pos": "名詞",
  "hanja": "水泳場",
  "meaning_zh": "游泳池",
  "example_ko": "여름에 수영장에 가요.",
  "example_zh": "夏天去游泳池。"
 },
 {
  "id": "v_1625",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "등산",
  "pos": "名詞",
  "hanja": "登山",
  "meaning_zh": "爬山、登山",
  "example_ko": "주말마다 등산을 해요.",
  "example_zh": "每個週末都去爬山。"
 },
 {
  "id": "v_1626",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "산",
  "pos": "名詞",
  "hanja": "山",
  "meaning_zh": "山",
  "example_ko": "한국에는 산이 많아요.",
  "example_zh": "韓國的山很多。"
 },
 {
  "id": "v_1627",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "산책하다",
  "pos": "動詞",
  "hanja": "散策",
  "meaning_zh": "散步",
  "example_ko": "저녁에 공원에서 산책해요.",
  "example_zh": "晚上在公園散步。"
 },
 {
  "id": "v_1628",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "달리기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "跑步、賽跑",
  "example_ko": "달리기 대회에 나갔어요.",
  "example_zh": "參加了跑步比賽。"
 },
 {
  "id": "v_1629",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "스키",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "滑雪",
  "example_ko": "겨울에 스키를 타요.",
  "example_zh": "冬天去滑雪。"
 },
 {
  "id": "v_1630",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "요가",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "瑜伽",
  "example_ko": "요가를 하면 마음이 편해요.",
  "example_zh": "做瑜伽心情很平靜。"
 },
 {
  "id": "v_1631",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "태권도",
  "pos": "名詞",
  "hanja": "跆拳道",
  "meaning_zh": "跆拳道",
  "example_ko": "태권도는 한국의 전통 운동이에요.",
  "example_zh": "跆拳道是韓國的傳統運動。"
 },
 {
  "id": "v_1632",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "경기",
  "pos": "名詞",
  "hanja": "競技",
  "meaning_zh": "比賽",
  "example_ko": "오늘 축구 경기가 있어요.",
  "example_zh": "今天有足球比賽。"
 },
 {
  "id": "v_1633",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "선수",
  "pos": "名詞",
  "hanja": "選手",
  "meaning_zh": "選手、運動員",
  "example_ko": "그 선수는 아주 유명해요.",
  "example_zh": "那個選手很有名。"
 },
 {
  "id": "v_1634",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "팀",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "隊、團隊",
  "example_ko": "우리 팀이 이겼어요!",
  "example_zh": "我們隊贏了！"
 },
 {
  "id": "v_1635",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "공",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "球",
  "example_ko": "공을 던지세요.",
  "example_zh": "請把球丟過來。"
 },
 {
  "id": "v_1636",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "치다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "打（球）；彈（琴）",
  "example_ko": "공을 세게 쳤어요.",
  "example_zh": "用力打了球。"
 },
 {
  "id": "v_1637",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "차다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "踢",
  "example_ko": "공을 차요.",
  "example_zh": "踢球。"
 },
 {
  "id": "v_1638",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "던지다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "丟、投、扔",
  "example_ko": "공을 멀리 던졌어요.",
  "example_zh": "把球丟得很遠。"
 },
 {
  "id": "v_1639",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "이기다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "贏、勝",
  "example_ko": "어제 경기에서 이겼어요.",
  "example_zh": "昨天的比賽贏了。"
 },
 {
  "id": "v_1640",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "지다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "輸",
  "example_ko": "아쉽게 졌어요.",
  "example_zh": "可惜輸了。"
 },
 {
  "id": "v_1641",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "응원하다",
  "pos": "動詞",
  "hanja": "應援",
  "meaning_zh": "加油、應援",
  "example_ko": "우리 팀을 응원해요.",
  "example_zh": "為我們隊加油。"
 },
 {
  "id": "v_1642",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "체육관",
  "pos": "名詞",
  "hanja": "體育館",
  "meaning_zh": "體育館",
  "example_ko": "체육관에서 배구를 해요.",
  "example_zh": "在體育館打排球。"
 },
 {
  "id": "v_1643",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "운동장",
  "pos": "名詞",
  "hanja": "運動場",
  "meaning_zh": "操場、運動場",
  "example_ko": "운동장에서 축구를 해요.",
  "example_zh": "在操場踢足球。"
 },
 {
  "id": "v_1644",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "헬스장",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "健身房",
  "example_ko": "퇴근 후에 헬스장에 가요.",
  "example_zh": "下班後去健身房。"
 },
 {
  "id": "v_1645",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "잘하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "擅長、做得好",
  "example_ko": "형은 수영을 잘해요.",
  "example_zh": "哥哥很會游泳。"
 },
 {
  "id": "v_1646",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "word": "못하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "不擅長、做不好",
  "example_ko": "저는 운동을 못해요.",
  "example_zh": "我不擅長運動。"
 },
 {
  "id": "v_1647",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "몸",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "身體",
  "example_ko": "몸이 피곤해요.",
  "example_zh": "身體很累。"
 },
 {
  "id": "v_1648",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "머리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "頭；頭髮",
  "example_ko": "머리가 아파요.",
  "example_zh": "頭痛。"
 },
 {
  "id": "v_1649",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "얼굴",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "臉",
  "example_ko": "얼굴이 작아요.",
  "example_zh": "臉很小。"
 },
 {
  "id": "v_1650",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "눈",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "眼睛",
  "example_ko": "동생은 눈이 커요.",
  "example_zh": "妹妹的眼睛很大。"
 },
 {
  "id": "v_1651",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "코",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鼻子",
  "example_ko": "코가 높아요.",
  "example_zh": "鼻子很挺。"
 },
 {
  "id": "v_1652",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "입",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "嘴巴",
  "example_ko": "입을 크게 벌리세요.",
  "example_zh": "請把嘴巴張大。"
 },
 {
  "id": "v_1653",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "귀",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "耳朵",
  "example_ko": "귀가 아파요.",
  "example_zh": "耳朵痛。"
 },
 {
  "id": "v_1654",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "이",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "牙齒",
  "example_ko": "밥을 먹고 이를 닦아요.",
  "example_zh": "吃完飯刷牙。"
 },
 {
  "id": "v_1655",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "목",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "脖子；喉嚨",
  "example_ko": "목이 말라요.",
  "example_zh": "口好渴。"
 },
 {
  "id": "v_1656",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "어깨",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "肩膀",
  "example_ko": "어깨가 넓어요.",
  "example_zh": "肩膀很寬。"
 },
 {
  "id": "v_1657",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "팔",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "手臂",
  "example_ko": "팔이 길어요.",
  "example_zh": "手臂很長。"
 },
 {
  "id": "v_1658",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "손",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "手",
  "example_ko": "밥 먹기 전에 손을 씻으세요.",
  "example_zh": "吃飯前請洗手。"
 },
 {
  "id": "v_1659",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "손가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "手指",
  "example_ko": "손가락이 길고 예뻐요.",
  "example_zh": "手指又長又好看。"
 },
 {
  "id": "v_1660",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "배",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "肚子",
  "example_ko": "배가 아파요.",
  "example_zh": "肚子痛。"
 },
 {
  "id": "v_1661",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "등",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "背",
  "example_ko": "등이 가려워요.",
  "example_zh": "背好癢。"
 },
 {
  "id": "v_1662",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "허리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "腰",
  "example_ko": "오래 앉아 있어서 허리가 아파요.",
  "example_zh": "坐太久，腰很痛。"
 },
 {
  "id": "v_1663",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "다리",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "腿",
  "example_ko": "많이 걸어서 다리가 아파요.",
  "example_zh": "走了很多路，腿很痠。"
 },
 {
  "id": "v_1664",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "발",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "腳",
  "example_ko": "발이 커서 신발이 작아요.",
  "example_zh": "腳太大，鞋子穿不下。"
 },
 {
  "id": "v_1665",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "무릎",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "膝蓋",
  "example_ko": "무릎이 아파서 계단을 못 올라가요.",
  "example_zh": "膝蓋痛，爬不了樓梯。"
 },
 {
  "id": "v_1666",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "키",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "個子、身高",
  "example_ko": "형은 키가 커요.",
  "example_zh": "哥哥個子很高。"
 },
 {
  "id": "v_1667",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "머리카락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "頭髮（一根根的）",
  "example_ko": "머리카락이 길어요.",
  "example_zh": "頭髮很長。"
 },
 {
  "id": "v_1668",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "피부",
  "pos": "名詞",
  "hanja": "皮膚",
  "meaning_zh": "皮膚",
  "example_ko": "피부가 하얘요.",
  "example_zh": "皮膚很白。"
 },
 {
  "id": "v_1669",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "뚱뚱하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "胖",
  "example_ko": "고양이가 좀 뚱뚱해요.",
  "example_zh": "貓有點胖。"
 },
 {
  "id": "v_1670",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "날씬하다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "苗條",
  "example_ko": "언니는 키가 크고 날씬해요.",
  "example_zh": "姊姊個子高又苗條。"
 },
 {
  "id": "v_1671",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "마르다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "瘦；（口）渴",
  "example_ko": "동생은 너무 말랐어요.",
  "example_zh": "弟弟太瘦了。"
 },
 {
  "id": "v_1672",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "잘생기다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "長得帥、好看",
  "example_ko": "그 배우는 정말 잘생겼어요.",
  "example_zh": "那個演員真的很帥。"
 },
 {
  "id": "v_1673",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "아프다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "痛、不舒服",
  "example_ko": "어디가 아파요?",
  "example_zh": "哪裡不舒服？"
 },
 {
  "id": "v_1674",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "젊다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "年輕",
  "example_ko": "할머니는 나이보다 젊어 보여요.",
  "example_zh": "奶奶看起來比實際年齡年輕。"
 },
 {
  "id": "v_1675",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "닮다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "像、長得像",
  "example_ko": "저는 엄마를 닮았어요.",
  "example_zh": "我長得像媽媽。"
 },
 {
  "id": "v_1676",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "발가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "腳趾",
  "example_ko": "발가락이 다섯 개예요.",
  "example_zh": "有五根腳趾。"
 },
 {
  "id": "v_1677",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "입술",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "嘴唇",
  "example_ko": "입술이 건조해요.",
  "example_zh": "嘴唇很乾。"
 },
 {
  "id": "v_1678",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "눈썹",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "眉毛",
  "example_ko": "눈썹이 진해요.",
  "example_zh": "眉毛很濃。"
 },
 {
  "id": "v_1679",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "가슴",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "胸、胸口",
  "example_ko": "가슴이 두근거려요.",
  "example_zh": "心怦怦跳。"
 },
 {
  "id": "v_1680",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "word": "수염",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "鬍子",
  "example_ko": "할아버지는 수염이 길어요.",
  "example_zh": "爺爺的鬍子很長。"
 },
 {
  "id": "v_1749",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "먹다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "吃",
  "example_ko": "점심에 뭐 먹어요?",
  "example_zh": "中午要吃什麼？"
 },
 {
  "id": "v_1750",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "마시다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "喝",
  "example_ko": "저는 아침마다 차를 마셔요.",
  "example_zh": "我每天早上都喝茶。"
 },
 {
  "id": "v_1751",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "가다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "去",
  "example_ko": "주말에 친구 집에 가요.",
  "example_zh": "週末要去朋友家。"
 },
 {
  "id": "v_1752",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "오다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "來；（雨、雪）下",
  "example_ko": "비가 와요.",
  "example_zh": "下雨了。"
 },
 {
  "id": "v_1753",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "보다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "看、看見",
  "example_ko": "같이 사진을 봐요.",
  "example_zh": "一起看照片吧。"
 },
 {
  "id": "v_1754",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "듣다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "聽",
  "example_ko": "저는 매일 음악을 들어요.",
  "example_zh": "我每天聽音樂。"
 },
 {
  "id": "v_1755",
  "level": 1,
  "topic": "常用高頻基礎動詞（動作篇）",
  "word": "하다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "做、從事",
  "example_ko": "주말에 뭐 해요?",
  "example_zh": "週末要做什麼？"
 }
];

const READ_ARTICLES = [
 {
  "article_id": "art_101",
  "level": 1,
  "topic": "自我介紹與國籍職業",
  "title_ko": "저를 소개합니다",
  "title_zh": "我的自我介紹",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "안녕하세요? 제 이름은 왕지민이에요.",
    "zh": "大家好！我的名字是王智敏。",
    "target_words": [
     {
      "surface": "안녕하세요",
      "lemma": "안녕하세요",
      "vocab_id": "v_1001"
     },
     {
      "surface": "제",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "이름은",
      "lemma": "이름",
      "vocab_id": "v_1009"
     }
    ],
    "grammar_ids": [
     "g_101",
     "g_102"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "저는 대만 사람이에요.",
    "zh": "我是台灣人。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "대만",
      "lemma": "대만",
      "vocab_id": "v_1019"
     },
     {
      "surface": "사람이에요",
      "lemma": "사람",
      "vocab_id": "v_1015"
     }
    ],
    "grammar_ids": [
     "g_101",
     "g_102"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "직업은 회사원이에요.",
    "zh": "我的職業是上班族。",
    "target_words": [
     {
      "surface": "직업은",
      "lemma": "직업",
      "vocab_id": "v_1032"
     },
     {
      "surface": "회사원이에요",
      "lemma": "회사원",
      "vocab_id": "v_1025"
     }
    ],
    "grammar_ids": [
     "g_101",
     "g_102"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "그래서 한국어를 배워요.",
    "zh": "所以我在學韓文。",
    "target_words": [
     {
      "surface": "한국어를",
      "lemma": "한국어",
      "vocab_id": "v_1165"
     },
     {
      "surface": "배워요",
      "lemma": "배우다",
      "vocab_id": "v_1157"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "제 한국어 선생님은 친절한 한국 사람이에요.",
    "zh": "我的韓文老師是一位親切的韓國人。",
    "target_words": [
     {
      "surface": "제",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "한국어",
      "lemma": "한국어",
      "vocab_id": "v_1165"
     },
     {
      "surface": "선생님은",
      "lemma": "선생님",
      "vocab_id": "v_1026"
     },
     {
      "surface": "친절한",
      "lemma": "친절하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "한국",
      "lemma": "한국",
      "vocab_id": "v_1018"
     },
     {
      "surface": "사람이에요",
      "lemma": "사람",
      "vocab_id": "v_1015"
     }
    ],
    "grammar_ids": [
     "g_101",
     "g_102"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "반가워요. 잘 부탁드려요.",
    "zh": "很高興認識大家，請多多指教。",
    "target_words": [
     {
      "surface": "반가워요",
      "lemma": "반갑다",
      "vocab_id": "v_1002"
     },
     {
      "surface": "부탁드려요",
      "lemma": "부탁드리다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "친절하다",
    "pos": "形容詞",
    "hanja": "親切",
    "meaning_zh": "親切、友善"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "부탁드리다",
    "pos": "動詞",
    "hanja": "付託",
    "meaning_zh": "拜託、麻煩（부탁하다 的謙讓說法）"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_101",
    "pattern": "名詞 + 이에요/예요",
    "meaning": "是…（禮貌的口語）",
    "explanation": "用來說「我是…」「這是…」。名詞最後一個字有收音（받침）接 -이에요（사람 → 사람이에요），沒有收音接 -예요（저 → 저예요、의사 → 의사예요）。問句只要語尾上揚就好：학생이에요?↗",
    "extra_example_ko": "제 친구는 의사예요.",
    "extra_example_zh": "我的朋友是醫生。"
   },
   {
    "grammar_id": "g_102",
    "pattern": "名詞 + 은/는",
    "meaning": "主題助詞（說到…的話）",
    "explanation": "標示這句話在講「誰」或「什麼」。有收音接 -은（이름 → 이름은），沒有收音接 -는（저 → 저는）。自我介紹時常說「저는…」，也有「至於…呢」對比的感覺，例如「직업은 회사원이에요」（職業的話，是上班族）。",
    "extra_example_ko": "저는 학생이에요. 동생은 회사원이에요.",
    "extra_example_zh": "我是學生。弟弟（妹妹）是上班族。"
   }
  ]
 },
 {
  "article_id": "art_102",
  "level": 1,
  "topic": "家庭成員與稱謂",
  "title_ko": "우리 가족",
  "title_zh": "我們家",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "가족이 몇 명이에요?",
    "zh": "你家有幾個人？",
    "target_words": [
     {
      "surface": "가족이",
      "lemma": "가족",
      "vocab_id": "v_1035"
     },
     {
      "surface": "몇",
      "lemma": "몇",
      "vocab_id": "v_1101"
     },
     {
      "surface": "명이에요",
      "lemma": "명",
      "vocab_id": "v_1060"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "다섯 명이에요. 부모님하고 언니, 남동생이 있어요.",
    "zh": "五個人。有爸媽、姊姊和弟弟。",
    "target_words": [
     {
      "surface": "다섯",
      "lemma": "다섯",
      "vocab_id": "v_1107"
     },
     {
      "surface": "명이에요",
      "lemma": "명",
      "vocab_id": "v_1060"
     },
     {
      "surface": "부모님하고",
      "lemma": "부모님",
      "vocab_id": "v_1040"
     },
     {
      "surface": "언니",
      "lemma": "언니",
      "vocab_id": "v_1046"
     },
     {
      "surface": "남동생이",
      "lemma": "남동생",
      "vocab_id": "v_1048"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_103",
     "g_104"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "언니는 직업이 뭐예요?",
    "zh": "你姊姊做什麼工作？",
    "target_words": [
     {
      "surface": "언니는",
      "lemma": "언니",
      "vocab_id": "v_1046"
     },
     {
      "surface": "직업이",
      "lemma": "직업",
      "vocab_id": "v_1032"
     },
     {
      "surface": "뭐예요",
      "lemma": "무엇",
      "vocab_id": "v_1013"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "언니는 간호사예요. 남동생은 대학생이에요.",
    "zh": "姊姊是護理師。弟弟是大學生。",
    "target_words": [
     {
      "surface": "언니는",
      "lemma": "언니",
      "vocab_id": "v_1046"
     },
     {
      "surface": "간호사예요",
      "lemma": "간호사",
      "vocab_id": "v_1028"
     },
     {
      "surface": "남동생은",
      "lemma": "남동생",
      "vocab_id": "v_1048"
     },
     {
      "surface": "대학생이에요",
      "lemma": "대학생",
      "vocab_id": "v_1024"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "저는 형제가 없어서 조금 외로워요. 하지만 할머니하고 같이 살아요.",
    "zh": "我沒有兄弟姊妹，所以有點寂寞。不過我和奶奶一起住。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "형제가",
      "lemma": "형제",
      "vocab_id": "v_1050"
     },
     {
      "surface": "없어서",
      "lemma": "없다",
      "vocab_id": "v_1063"
     },
     {
      "surface": "조금",
      "lemma": "조금",
      "vocab_id": "v_1404"
     },
     {
      "surface": "외로워요",
      "lemma": "외롭다",
      "vocab_id": "new_03"
     },
     {
      "surface": "할머니하고",
      "lemma": "할머니",
      "vocab_id": "v_1042"
     },
     {
      "surface": "같이",
      "lemma": "같이",
      "vocab_id": "v_1064"
     },
     {
      "surface": "살아요",
      "lemma": "살다",
      "vocab_id": "v_1065"
     }
    ],
    "grammar_ids": [
     "g_103",
     "g_104"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "할머니가 건강하세요? 가족 사진이 궁금해요!",
    "zh": "奶奶身體好嗎？好想看你們的全家福！",
    "target_words": [
     {
      "surface": "할머니가",
      "lemma": "할머니",
      "vocab_id": "v_1042"
     },
     {
      "surface": "건강하세요",
      "lemma": "건강하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "가족",
      "lemma": "가족",
      "vocab_id": "v_1035"
     },
     {
      "surface": "사진이",
      "lemma": "사진",
      "vocab_id": "v_1068"
     },
     {
      "surface": "궁금해요",
      "lemma": "궁금하다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "건강하다",
    "pos": "形容詞",
    "hanja": "健康",
    "meaning_zh": "健康"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "궁금하다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "好奇、想知道"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "외롭다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "寂寞、孤單"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_103",
    "pattern": "名詞 + 이/가 있다／없다",
    "meaning": "有…／沒有…",
    "explanation": "說自己「有」或「沒有」某人某物。名詞有收音接 -이（남동생 → 남동생이），沒有收音接 -가（형제 → 형제가）。現在式說「있어요／없어요」，要說原因時可以變成「없어서」（因為沒有…所以）。",
    "extra_example_ko": "저는 오빠가 있어요. 하지만 언니는 없어요.",
    "extra_example_zh": "我有哥哥，但是沒有姊姊。"
   },
   {
    "grammar_id": "g_104",
    "pattern": "名詞 + 하고",
    "meaning": "和…、跟…",
    "explanation": "把兩個名詞連在一起（A 하고 B＝A 和 B），也可以表示「跟誰一起」（할머니하고 같이 살아요＝跟奶奶一起住）。不管有沒有收音都直接接 -하고，口語最常用。",
    "extra_example_ko": "아빠하고 엄마는 회사원이에요.",
    "extra_example_zh": "爸爸和媽媽都是上班族。"
   }
  ]
 },
 {
  "article_id": "art_103",
  "level": 1,
  "topic": "數字與日期（漢字詞數字）",
  "title_ko": "생일이 언제예요?",
  "title_zh": "你的生日是哪天？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "생일이 몇 월 며칠이에요?",
    "zh": "你的生日是幾月幾號？",
    "target_words": [
     {
      "surface": "생일이",
      "lemma": "생일",
      "vocab_id": "v_1097"
     },
     {
      "surface": "몇",
      "lemma": "몇",
      "vocab_id": "v_1101"
     },
     {
      "surface": "월",
      "lemma": "월",
      "vocab_id": "v_1084"
     },
     {
      "surface": "며칠이에요",
      "lemma": "며칠",
      "vocab_id": "v_1102"
     }
    ],
    "grammar_ids": [
     "g_105"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "삼월 구일이에요. 이번 주 토요일이에요.",
    "zh": "三月九號，就是這個星期六。",
    "target_words": [
     {
      "surface": "삼",
      "lemma": "삼",
      "vocab_id": "v_1072"
     },
     {
      "surface": "월",
      "lemma": "월",
      "vocab_id": "v_1084"
     },
     {
      "surface": "구",
      "lemma": "구",
      "vocab_id": "v_1078"
     },
     {
      "surface": "일이에요",
      "lemma": "일",
      "vocab_id": "v_1085"
     },
     {
      "surface": "주",
      "lemma": "주",
      "vocab_id": "v_1096"
     },
     {
      "surface": "토요일이에요",
      "lemma": "토요일",
      "vocab_id": "v_1093"
     }
    ],
    "grammar_ids": [
     "g_105"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "와, 축하해요! 생일 파티를 해요?",
    "zh": "哇，生日快樂！要辦生日派對嗎？",
    "target_words": [
     {
      "surface": "축하해요",
      "lemma": "축하하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "생일",
      "lemma": "생일",
      "vocab_id": "v_1097"
     },
     {
      "surface": "파티를",
      "lemma": "파티",
      "vocab_id": "new_02"
     },
     {
      "surface": "해요",
      "lemma": "하다",
      "vocab_id": "v_1755"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "네, 토요일 저녁에 식당에 친구들을 초대해요. 식당은 삼 층에 있어요.",
    "zh": "對，星期六晚上我請朋友們來餐廳。餐廳在三樓。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "토요일",
      "lemma": "토요일",
      "vocab_id": "v_1093"
     },
     {
      "surface": "저녁에",
      "lemma": "저녁",
      "vocab_id": "v_1120"
     },
     {
      "surface": "식당에",
      "lemma": "식당",
      "vocab_id": "v_1375"
     },
     {
      "surface": "친구들을",
      "lemma": "친구",
      "vocab_id": "v_1056"
     },
     {
      "surface": "초대해요",
      "lemma": "초대하다",
      "vocab_id": "new_03"
     },
     {
      "surface": "식당은",
      "lemma": "식당",
      "vocab_id": "v_1375"
     },
     {
      "surface": "삼",
      "lemma": "삼",
      "vocab_id": "v_1072"
     },
     {
      "surface": "층에",
      "lemma": "층",
      "vocab_id": "v_1100"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_106",
     "g_105"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "알겠어요. 전화번호가 몇 번이에요?",
    "zh": "我知道了。你的電話號碼是幾號？",
    "target_words": [
     {
      "surface": "알겠어요",
      "lemma": "알다",
      "vocab_id": "v_1161"
     },
     {
      "surface": "전화번호가",
      "lemma": "전화번호",
      "vocab_id": "v_1098"
     },
     {
      "surface": "몇",
      "lemma": "몇",
      "vocab_id": "v_1101"
     },
     {
      "surface": "번이에요",
      "lemma": "번",
      "vocab_id": "v_1099"
     }
    ],
    "grammar_ids": [
     "g_105"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "공일공 일이삼사에 오육칠팔이에요.",
    "zh": "010-1234-5678。",
    "target_words": [
     {
      "surface": "공",
      "lemma": "공",
      "vocab_id": "v_1069"
     },
     {
      "surface": "일",
      "lemma": "일",
      "vocab_id": "v_1070"
     },
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1071"
     },
     {
      "surface": "삼",
      "lemma": "삼",
      "vocab_id": "v_1072"
     },
     {
      "surface": "사",
      "lemma": "사",
      "vocab_id": "v_1073"
     },
     {
      "surface": "오",
      "lemma": "오",
      "vocab_id": "v_1074"
     },
     {
      "surface": "육",
      "lemma": "육",
      "vocab_id": "v_1075"
     },
     {
      "surface": "칠",
      "lemma": "칠",
      "vocab_id": "v_1076"
     },
     {
      "surface": "팔",
      "lemma": "팔",
      "vocab_id": "v_1077"
     }
    ],
    "grammar_ids": [
     "g_105"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "축하하다",
    "pos": "動詞",
    "hanja": "祝賀",
    "meaning_zh": "祝賀、恭喜"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "파티",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "派對"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "초대하다",
    "pos": "動詞",
    "hanja": "招待",
    "meaning_zh": "邀請"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_105",
    "pattern": "漢字詞數字 + 월／일／번／층",
    "meaning": "月份、日期、號碼、樓層都用漢字詞數字（일、이、삼…）",
    "explanation": "韓文有兩套數字。日期、電話、樓層、公車號碼、價錢都用漢字詞數字：삼월 구일（3 月 9 日）、삼 층（3 樓）、오 번（5 號）。電話號碼一個字一個字念，0 念「공」，中間的「-」念成「에」。注意 6 月念「유월」、10 月念「시월」。",
    "extra_example_ko": "제 생일은 유월 이십오일이에요.",
    "extra_example_zh": "我的生日是六月二十五號。"
   },
   {
    "grammar_id": "g_106",
    "pattern": "名詞 + 에",
    "meaning": "在（時間）、在／到（地點）",
    "explanation": "放在時間後面表示「在那個時間」（저녁에＝在晚上、토요일에＝在星期六），放在地點後面表示「在哪裡」或「去哪裡」（삼 층에 있어요＝在三樓、식당에 가요＝去餐廳）。不管有沒有收音都接 -에。",
    "extra_example_ko": "금요일에 친구 집에 가요.",
    "extra_example_zh": "星期五我要去朋友家。"
   }
  ]
 },
 {
  "article_id": "art_104",
  "level": 1,
  "topic": "時間與作息（固有詞數字）",
  "title_ko": "나의 하루",
  "title_zh": "我的一天",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "저는 매일 아침 여섯 시 반에 일어나요.",
    "zh": "我每天早上六點半起床。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "매일",
      "lemma": "매일",
      "vocab_id": "v_1131"
     },
     {
      "surface": "아침",
      "lemma": "아침",
      "vocab_id": "v_1118"
     },
     {
      "surface": "여섯",
      "lemma": "여섯",
      "vocab_id": "v_1108"
     },
     {
      "surface": "시",
      "lemma": "시",
      "vocab_id": "v_1114"
     },
     {
      "surface": "반에",
      "lemma": "반",
      "vocab_id": "v_1117"
     },
     {
      "surface": "일어나요",
      "lemma": "일어나다",
      "vocab_id": "v_1125"
     }
    ],
    "grammar_ids": [
     "g_107"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "일어나서 세수하고 아침을 먹어요.",
    "zh": "起床後洗臉，然後吃早餐。",
    "target_words": [
     {
      "surface": "일어나서",
      "lemma": "일어나다",
      "vocab_id": "v_1125"
     },
     {
      "surface": "세수하고",
      "lemma": "세수하다",
      "vocab_id": "v_1127"
     },
     {
      "surface": "아침을",
      "lemma": "아침",
      "vocab_id": "v_1118"
     },
     {
      "surface": "먹어요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": [
     "g_108"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "여덟 시쯤 회사에 출근해요.",
    "zh": "八點左右去公司上班。",
    "target_words": [
     {
      "surface": "여덟",
      "lemma": "여덟",
      "vocab_id": "v_1110"
     },
     {
      "surface": "시",
      "lemma": "시",
      "vocab_id": "v_1114"
     },
     {
      "surface": "쯤",
      "lemma": "쯤",
      "vocab_id": "v_1135"
     },
     {
      "surface": "회사에",
      "lemma": "회사",
      "vocab_id": "v_1033"
     },
     {
      "surface": "출근해요",
      "lemma": "출근하다",
      "vocab_id": "v_1129"
     }
    ],
    "grammar_ids": [
     "g_107"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "점심은 열두 시에 회사 식당에서 먹어요.",
    "zh": "午餐在十二點，在公司餐廳吃。",
    "target_words": [
     {
      "surface": "점심은",
      "lemma": "점심",
      "vocab_id": "v_1119"
     },
     {
      "surface": "열",
      "lemma": "열",
      "vocab_id": "v_1112"
     },
     {
      "surface": "두",
      "lemma": "둘",
      "vocab_id": "v_1104"
     },
     {
      "surface": "시에",
      "lemma": "시",
      "vocab_id": "v_1114"
     },
     {
      "surface": "회사",
      "lemma": "회사",
      "vocab_id": "v_1033"
     },
     {
      "surface": "식당에서",
      "lemma": "식당",
      "vocab_id": "v_1375"
     },
     {
      "surface": "먹어요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": [
     "g_107"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "저녁 여섯 시에 퇴근해요. 그런데 금요일에는 야근해요.",
    "zh": "晚上六點下班。不過星期五要加班。",
    "target_words": [
     {
      "surface": "저녁",
      "lemma": "저녁",
      "vocab_id": "v_1120"
     },
     {
      "surface": "여섯",
      "lemma": "여섯",
      "vocab_id": "v_1108"
     },
     {
      "surface": "시에",
      "lemma": "시",
      "vocab_id": "v_1114"
     },
     {
      "surface": "퇴근해요",
      "lemma": "퇴근하다",
      "vocab_id": "v_1130"
     },
     {
      "surface": "금요일에는",
      "lemma": "금요일",
      "vocab_id": "v_1092"
     },
     {
      "surface": "야근해요",
      "lemma": "야근하다",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": [
     "g_107"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "밤에 샤워하고 보통 열한 시에 자요. 주말에는 푹 쉬어요.",
    "zh": "晚上洗完澡，通常十一點睡覺。週末就好好休息。",
    "target_words": [
     {
      "surface": "밤에",
      "lemma": "밤",
      "vocab_id": "v_1121"
     },
     {
      "surface": "샤워하고",
      "lemma": "샤워하다",
      "vocab_id": "v_1128"
     },
     {
      "surface": "보통",
      "lemma": "보통",
      "vocab_id": "v_1132"
     },
     {
      "surface": "열",
      "lemma": "열",
      "vocab_id": "v_1112"
     },
     {
      "surface": "한",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "시에",
      "lemma": "시",
      "vocab_id": "v_1114"
     },
     {
      "surface": "자요",
      "lemma": "자다",
      "vocab_id": "v_1126"
     },
     {
      "surface": "주말에는",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "푹",
      "lemma": "푹",
      "vocab_id": "new_02"
     },
     {
      "surface": "쉬어요",
      "lemma": "쉬다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": [
     "g_108",
     "g_107"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "야근하다",
    "pos": "動詞",
    "hanja": "夜勤",
    "meaning_zh": "加班（到晚上）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "푹",
    "pos": "副詞",
    "hanja": null,
    "meaning_zh": "（睡、休息）得很好、充分地"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "쉬다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "休息"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_107",
    "pattern": "固有詞數字 + 시 ／ 漢字詞數字 + 분",
    "meaning": "說時間：「幾點」用固有詞數字，「幾分」用漢字詞數字",
    "explanation": "「點」用 하나、둘、셋…（放在 시 前面會變短：한 시、두 시、세 시、네 시、열두 시），「分」用 일、이、삼…（십 분、삼십 분）。「半」說 반：여섯 시 반（六點半）。大約幾點加 -쯤：여덟 시쯤（八點左右）。",
    "extra_example_ko": "지금 세 시 이십 분이에요.",
    "extra_example_zh": "現在是三點二十分。"
   },
   {
    "grammar_id": "g_108",
    "pattern": "動詞語幹 + -고",
    "meaning": "…然後…（依序做兩件事）",
    "explanation": "把兩個動作照順序連起來：세수하고 아침을 먹어요（洗臉，然後吃早餐）。不管有沒有收音都直接接 -고，時態只要放在最後一個動詞。",
    "extra_example_ko": "숙제하고 텔레비전을 봐요.",
    "extra_example_zh": "寫完作業然後看電視。"
   }
  ]
 },
 {
  "article_id": "art_105",
  "level": 1,
  "topic": "教室與文具用品",
  "title_ko": "교실에서",
  "title_zh": "在教室",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "선생님, 질문이 있어요.",
    "zh": "老師，我有問題。",
    "target_words": [
     {
      "surface": "선생님",
      "lemma": "선생님",
      "vocab_id": "v_1026"
     },
     {
      "surface": "질문이",
      "lemma": "질문",
      "vocab_id": "v_1159"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "네, 뭐예요?",
    "zh": "好，什麼問題？",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "뭐예요",
      "lemma": "무엇",
      "vocab_id": "v_1013"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "'숙제'가 무슨 뜻이에요?",
    "zh": "「숙제」是什麼意思？",
    "target_words": [
     {
      "surface": "숙제",
      "lemma": "숙제",
      "vocab_id": "v_1154"
     },
     {
      "surface": "뜻이에요",
      "lemma": "뜻",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "수업이 끝나고 공부하는 문제예요.",
    "zh": "就是下課以後要做的題目。",
    "target_words": [
     {
      "surface": "수업이",
      "lemma": "수업",
      "vocab_id": "v_1153"
     },
     {
      "surface": "끝나고",
      "lemma": "끝나다",
      "vocab_id": "v_1170"
     },
     {
      "surface": "공부하는",
      "lemma": "공부하다",
      "vocab_id": "v_1156"
     },
     {
      "surface": "문제예요",
      "lemma": "문제",
      "vocab_id": "v_1168"
     }
    ],
    "grammar_ids": [
     "g_110"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "아, 알겠어요. 숙제는 교과서 오십 쪽이에요?",
    "zh": "啊，我懂了。作業是課本第五十頁嗎？",
    "target_words": [
     {
      "surface": "알겠어요",
      "lemma": "알다",
      "vocab_id": "v_1161"
     },
     {
      "surface": "숙제는",
      "lemma": "숙제",
      "vocab_id": "v_1154"
     },
     {
      "surface": "교과서",
      "lemma": "교과서",
      "vocab_id": "v_1141"
     },
     {
      "surface": "오",
      "lemma": "오",
      "vocab_id": "v_1074"
     },
     {
      "surface": "십",
      "lemma": "십",
      "vocab_id": "v_1079"
     },
     {
      "surface": "쪽이에요",
      "lemma": "쪽",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "네. 다음 수업 시간에 시험이 있어요. 열심히 공부하세요.",
    "zh": "對。下堂課有考試，要認真讀書喔。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "수업",
      "lemma": "수업",
      "vocab_id": "v_1153"
     },
     {
      "surface": "시간에",
      "lemma": "시간",
      "vocab_id": "v_1116"
     },
     {
      "surface": "시험이",
      "lemma": "시험",
      "vocab_id": "v_1155"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "열심히",
      "lemma": "열심히",
      "vocab_id": "new_03"
     },
     {
      "surface": "공부하세요",
      "lemma": "공부하다",
      "vocab_id": "v_1156"
     }
    ],
    "grammar_ids": [
     "g_109"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "뜻",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "意思、意義"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "쪽",
    "pos": "名詞（量詞）",
    "hanja": null,
    "meaning_zh": "頁"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "열심히",
    "pos": "副詞",
    "hanja": "熱心",
    "meaning_zh": "認真地、努力地"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_109",
    "pattern": "動詞語幹 + -(으)세요",
    "meaning": "請…（禮貌地請對方做某事）",
    "explanation": "老師、店員最常用的禮貌命令。語幹沒有收音接 -세요（공부하다 → 공부하세요、가다 → 가세요），有收音接 -으세요（앉다 → 앉으세요）。比直接命令客氣，日常生活都可以用。",
    "extra_example_ko": "교과서를 펴세요.",
    "extra_example_zh": "請翻開課本。"
   },
   {
    "grammar_id": "g_110",
    "pattern": "動詞語幹 + -는 + 名詞",
    "meaning": "（正在／習慣）做…的＋名詞（用動詞修飾名詞）",
    "explanation": "把動詞變成形容名詞的樣子：공부하는 문제（要做的題目）、자는 아이（在睡覺的小孩）。現在的動作或平常的事用 -는，不管有沒有收音都接 -는（ㄹ 結尾的動詞要去掉 ㄹ：살다 → 사는）。",
    "extra_example_ko": "저기 책을 읽는 사람이 제 친구예요.",
    "extra_example_zh": "在那邊看書的人是我朋友。"
   }
  ]
 },
 {
  "article_id": "art_106",
  "level": 1,
  "topic": "居家空間與基本家具",
  "title_ko": "우리 집",
  "title_zh": "我的家",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "우리 집은 아파트 칠 층에 있어요.",
    "zh": "我家在公寓七樓。",
    "target_words": [
     {
      "surface": "우리",
      "lemma": "우리",
      "vocab_id": "v_1059"
     },
     {
      "surface": "집은",
      "lemma": "집",
      "vocab_id": "v_1171"
     },
     {
      "surface": "아파트",
      "lemma": "아파트",
      "vocab_id": "v_1172"
     },
     {
      "surface": "칠",
      "lemma": "칠",
      "vocab_id": "v_1076"
     },
     {
      "surface": "층에",
      "lemma": "층",
      "vocab_id": "v_1100"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_112"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "집에 방이 세 개 있어요.",
    "zh": "家裡有三個房間。",
    "target_words": [
     {
      "surface": "집에",
      "lemma": "집",
      "vocab_id": "v_1171"
     },
     {
      "surface": "방이",
      "lemma": "방",
      "vocab_id": "v_1173"
     },
     {
      "surface": "세",
      "lemma": "셋",
      "vocab_id": "v_1105"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_112"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "거실은 넓고 깨끗해요.",
    "zh": "客廳又寬敞又乾淨。",
    "target_words": [
     {
      "surface": "거실은",
      "lemma": "거실",
      "vocab_id": "v_1174"
     },
     {
      "surface": "넓고",
      "lemma": "넓다",
      "vocab_id": "v_1204"
     },
     {
      "surface": "깨끗해요",
      "lemma": "깨끗하다",
      "vocab_id": "v_1203"
     }
    ],
    "grammar_ids": [
     "g_111"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "거실에 소파하고 텔레비전이 있어요.",
    "zh": "客廳裡有沙發和電視。",
    "target_words": [
     {
      "surface": "거실에",
      "lemma": "거실",
      "vocab_id": "v_1174"
     },
     {
      "surface": "소파하고",
      "lemma": "소파",
      "vocab_id": "v_1187"
     },
     {
      "surface": "텔레비전이",
      "lemma": "텔레비전",
      "vocab_id": "v_1192"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_112"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "제 방에는 침대하고 책상이 있어요.",
    "zh": "我的房間裡有床和書桌。",
    "target_words": [
     {
      "surface": "제",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "방에는",
      "lemma": "방",
      "vocab_id": "v_1173"
     },
     {
      "surface": "침대하고",
      "lemma": "침대",
      "vocab_id": "v_1186"
     },
     {
      "surface": "책상이",
      "lemma": "책상",
      "vocab_id": "v_1138"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_112"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "그런데 곧 이사해요. 그래서 짐을 정리해요.",
    "zh": "不過我們快要搬家了，所以我在整理行李。",
    "target_words": [
     {
      "surface": "이사해요",
      "lemma": "이사하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "짐을",
      "lemma": "짐",
      "vocab_id": "new_02"
     },
     {
      "surface": "정리해요",
      "lemma": "정리하다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "이사하다",
    "pos": "動詞",
    "hanja": "移徙",
    "meaning_zh": "搬家"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "짐",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "行李、東西"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "정리하다",
    "pos": "動詞",
    "hanja": "整理",
    "meaning_zh": "整理、收拾"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_111",
    "pattern": "形容詞語幹 + -고",
    "meaning": "又…又…（把兩個特點連在一起）",
    "explanation": "形容一個東西有兩個特點時，第一個形容詞接 -고，時態和語尾放在最後一個：넓고 깨끗해요（又寬又乾淨）。不管有沒有收音都直接接 -고。動詞也能用 -고 表示「然後」（見主題 04）。",
    "extra_example_ko": "제 방은 작고 조용해요.",
    "extra_example_zh": "我的房間又小又安靜。"
   },
   {
    "grammar_id": "g_112",
    "pattern": "地點 + 에 + 名詞 + 이/가 있다",
    "meaning": "某個地方有…",
    "explanation": "說「哪裡有什麼」：先說地點加 -에，再說東西加 -이/가，最後用 있어요。數量放在名詞後面：방이 세 개 있어요（有三個房間）。固有詞數字放在量詞前會變短：하나→한、둘→두、셋→세、넷→네。",
    "extra_example_ko": "냉장고에 우유가 두 개 있어요.",
    "extra_example_zh": "冰箱裡有兩瓶牛奶。"
   }
  ]
 },
 {
  "article_id": "art_107",
  "level": 1,
  "topic": "位置與方位介詞",
  "title_ko": "가방이 어디에 있어요?",
  "title_zh": "包包在哪裡？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "엄마, 제 가방이 어디에 있어요?",
    "zh": "媽，我的包包在哪裡？",
    "target_words": [
     {
      "surface": "엄마",
      "lemma": "엄마",
      "vocab_id": "v_1039"
     },
     {
      "surface": "제",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "가방이",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "어디에",
      "lemma": "어디",
      "vocab_id": "v_1225"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "책상 위에 없어요?",
    "zh": "不在書桌上嗎？",
    "target_words": [
     {
      "surface": "책상",
      "lemma": "책상",
      "vocab_id": "v_1138"
     },
     {
      "surface": "위에",
      "lemma": "위",
      "vocab_id": "v_1205"
     },
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     }
    ],
    "grammar_ids": [
     "g_113"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "없어요. 침대 밑에도 없어요.",
    "zh": "沒有。床底下也沒有。",
    "target_words": [
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     },
     {
      "surface": "침대",
      "lemma": "침대",
      "vocab_id": "v_1186"
     },
     {
      "surface": "밑에도",
      "lemma": "밑",
      "vocab_id": "v_1207"
     },
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     }
    ],
    "grammar_ids": [
     "g_114",
     "g_113"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "아, 현관에 있어요! 문 옆 의자 위에 있어요.",
    "zh": "啊，在玄關！就在門旁邊的椅子上。",
    "target_words": [
     {
      "surface": "현관에",
      "lemma": "현관",
      "vocab_id": "v_1179"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "문",
      "lemma": "문",
      "vocab_id": "v_1180"
     },
     {
      "surface": "옆",
      "lemma": "옆",
      "vocab_id": "v_1213"
     },
     {
      "surface": "의자",
      "lemma": "의자",
      "vocab_id": "v_1139"
     },
     {
      "surface": "위에",
      "lemma": "위",
      "vocab_id": "v_1205"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_113"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "아, 드디어 찾았어요! 그런데 열쇠는 어디에 있어요?",
    "zh": "啊，終於找到了！那鑰匙在哪裡？",
    "target_words": [
     {
      "surface": "드디어",
      "lemma": "드디어",
      "vocab_id": "new_03"
     },
     {
      "surface": "찾았어요",
      "lemma": "찾다",
      "vocab_id": "v_1296"
     },
     {
      "surface": "열쇠는",
      "lemma": "열쇠",
      "vocab_id": "new_01"
     },
     {
      "surface": "어디에",
      "lemma": "어디",
      "vocab_id": "v_1225"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "가방 속 주머니 안에 있어요.",
    "zh": "在包包裡的口袋裡面。",
    "target_words": [
     {
      "surface": "가방",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "속",
      "lemma": "속",
      "vocab_id": "v_1210"
     },
     {
      "surface": "주머니",
      "lemma": "주머니",
      "vocab_id": "new_02"
     },
     {
      "surface": "안에",
      "lemma": "안",
      "vocab_id": "v_1208"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_113"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "열쇠",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "鑰匙"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "주머니",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "口袋"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "드디어",
    "pos": "副詞",
    "hanja": null,
    "meaning_zh": "終於"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_113",
    "pattern": "名詞 + 위／아래／밑／안／옆 + 에 있다",
    "meaning": "在…的上面／下面／裡面／旁邊",
    "explanation": "韓文的方位詞放在名詞「後面」，跟中文順序一樣：책상 위（書桌上面）、문 옆（門旁邊）、가방 안（包包裡面）。後面再接 -에 있어요（在）或 -에 없어요（不在）。兩個方位可以連著用：가방 속 주머니 안에（包包裡的口袋裡面）。",
    "extra_example_ko": "고양이가 소파 뒤에 있어요.",
    "extra_example_zh": "貓在沙發後面。"
   },
   {
    "grammar_id": "g_114",
    "pattern": "名詞（＋助詞）+ 도",
    "meaning": "也…",
    "explanation": "-도 表示「也」，直接接在名詞後面，會取代 -이/가、-을/를：가방도 없어요（包包也沒有）。如果前面有 -에、-에서 這類助詞就保留它，再加 -도：밑에도（底下也）。",
    "extra_example_ko": "저도 학생이에요.",
    "extra_example_zh": "我也是學生。"
   }
  ]
 },
 {
  "article_id": "art_108",
  "level": 1,
  "topic": "常見交通工具",
  "title_ko": "출근길",
  "title_zh": "上班的路上",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "저는 매일 지하철을 타고 출근해요.",
    "zh": "我每天搭地鐵上班。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "매일",
      "lemma": "매일",
      "vocab_id": "v_1131"
     },
     {
      "surface": "지하철을",
      "lemma": "지하철",
      "vocab_id": "v_1241"
     },
     {
      "surface": "타고",
      "lemma": "타다",
      "vocab_id": "v_1255"
     },
     {
      "surface": "출근해요",
      "lemma": "출근하다",
      "vocab_id": "v_1129"
     }
    ],
    "grammar_ids": [
     "g_115"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "집에서 역까지 걸어서 십 분 걸려요.",
    "zh": "從家裡走到車站要十分鐘。",
    "target_words": [
     {
      "surface": "집에서",
      "lemma": "집",
      "vocab_id": "v_1171"
     },
     {
      "surface": "역까지",
      "lemma": "역",
      "vocab_id": "v_1251"
     },
     {
      "surface": "걸어서",
      "lemma": "걷다",
      "vocab_id": "v_1257"
     },
     {
      "surface": "십",
      "lemma": "십",
      "vocab_id": "v_1079"
     },
     {
      "surface": "분",
      "lemma": "분",
      "vocab_id": "v_1115"
     },
     {
      "surface": "걸려요",
      "lemma": "걸리다",
      "vocab_id": "v_1264"
     }
    ],
    "grammar_ids": [
     "g_116"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "이 호선 지하철을 타고 다섯 번째 역에서 내려요.",
    "zh": "搭二號線地鐵，在第五站下車。",
    "target_words": [
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1071"
     },
     {
      "surface": "호선",
      "lemma": "호선",
      "vocab_id": "v_1265"
     },
     {
      "surface": "지하철을",
      "lemma": "지하철",
      "vocab_id": "v_1241"
     },
     {
      "surface": "타고",
      "lemma": "타다",
      "vocab_id": "v_1255"
     },
     {
      "surface": "다섯",
      "lemma": "다섯",
      "vocab_id": "v_1107"
     },
     {
      "surface": "번째",
      "lemma": "번째",
      "vocab_id": "new_01"
     },
     {
      "surface": "역에서",
      "lemma": "역",
      "vocab_id": "v_1251"
     },
     {
      "surface": "내려요",
      "lemma": "내리다",
      "vocab_id": "v_1256"
     }
    ],
    "grammar_ids": [
     "g_115"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "아침에는 지하철이 복잡해서 자리가 없어요.",
    "zh": "早上地鐵很擠，所以沒有座位。",
    "target_words": [
     {
      "surface": "아침에는",
      "lemma": "아침",
      "vocab_id": "v_1118"
     },
     {
      "surface": "지하철이",
      "lemma": "지하철",
      "vocab_id": "v_1241"
     },
     {
      "surface": "복잡해서",
      "lemma": "복잡하다",
      "vocab_id": "new_03"
     },
     {
      "surface": "자리가",
      "lemma": "자리",
      "vocab_id": "v_1269"
     },
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "그래서 가끔 버스를 타요. 버스 정류장은 집 바로 앞에 있어요.",
    "zh": "所以我有時候搭公車。公車站就在我家正前面。",
    "target_words": [
     {
      "surface": "버스를",
      "lemma": "버스",
      "vocab_id": "v_1240"
     },
     {
      "surface": "타요",
      "lemma": "타다",
      "vocab_id": "v_1255"
     },
     {
      "surface": "버스",
      "lemma": "버스",
      "vocab_id": "v_1240"
     },
     {
      "surface": "정류장은",
      "lemma": "정류장",
      "vocab_id": "v_1250"
     },
     {
      "surface": "집",
      "lemma": "집",
      "vocab_id": "v_1171"
     },
     {
      "surface": "바로",
      "lemma": "바로",
      "vocab_id": "v_1306"
     },
     {
      "surface": "앞에",
      "lemma": "앞",
      "vocab_id": "v_1211"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": [
     "g_115"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "주말에는 자전거를 타고 한강 공원까지 달려요.",
    "zh": "週末我騎腳踏車到漢江公園。",
    "target_words": [
     {
      "surface": "주말에는",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "자전거를",
      "lemma": "자전거",
      "vocab_id": "v_1246"
     },
     {
      "surface": "타고",
      "lemma": "타다",
      "vocab_id": "v_1255"
     },
     {
      "surface": "공원까지",
      "lemma": "공원",
      "vocab_id": "v_1279"
     },
     {
      "surface": "달려요",
      "lemma": "달리다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": [
     "g_115",
     "g_116"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "번째",
    "pos": "名詞（量詞）",
    "hanja": null,
    "meaning_zh": "第…（個、次）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "달리다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "跑、奔馳"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "복잡하다",
    "pos": "形容詞",
    "hanja": "複雜",
    "meaning_zh": "擁擠；複雜"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_115",
    "pattern": "交通工具 + 을/를 타다",
    "meaning": "搭、騎（交通工具）",
    "explanation": "中文說「搭地鐵」，韓文的交通工具要加受詞助詞 -을/를，再接 타다：지하철을 타요、자전거를 타요。有收音接 -을（지하철 → 지하철을），沒有收音接 -를（버스 → 버스를）。下車是「名詞 + 에서 내리다」：역에서 내려요。",
    "extra_example_ko": "저는 택시를 타고 공항에 가요.",
    "extra_example_zh": "我搭計程車去機場。"
   },
   {
    "grammar_id": "g_116",
    "pattern": "地點 + 에서 + 地點 + 까지",
    "meaning": "從…到…",
    "explanation": "-에서 表示起點（從），-까지 表示終點（到）。常和 걸리다（花時間）一起用：집에서 역까지 십 분 걸려요（從家到車站要十分鐘）。只說終點時單獨用 -까지：공원까지 달려요（跑到公園）。",
    "extra_example_ko": "서울에서 부산까지 기차로 세 시간 걸려요.",
    "extra_example_zh": "從首爾到釜山搭火車要三個小時。"
   }
  ]
 },
 {
  "article_id": "art_109",
  "level": 1,
  "topic": "問路與城市地標",
  "title_ko": "우체국이 어디예요?",
  "title_zh": "郵局在哪裡？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "실례합니다. 이 근처에 우체국이 있어요?",
    "zh": "不好意思，請問這附近有郵局嗎？",
    "target_words": [
     {
      "surface": "실례합니다",
      "lemma": "실례하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1226"
     },
     {
      "surface": "근처에",
      "lemma": "근처",
      "vocab_id": "v_1218"
     },
     {
      "surface": "우체국이",
      "lemma": "우체국",
      "vocab_id": "v_1277"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "네, 있어요. 이 길로 쭉 걸어가세요.",
    "zh": "有的。沿著這條路一直走。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1226"
     },
     {
      "surface": "길로",
      "lemma": "길",
      "vocab_id": "v_1263"
     },
     {
      "surface": "쭉",
      "lemma": "쭉",
      "vocab_id": "v_1291"
     },
     {
      "surface": "걸어가세요",
      "lemma": "걸어가다",
      "vocab_id": "v_1258"
     }
    ],
    "grammar_ids": [
     "g_117"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "B",
    "ko": "그리고 사거리에서 왼쪽으로 도세요. 약 오 분 걸려요.",
    "zh": "然後在十字路口往左轉，大約五分鐘。",
    "target_words": [
     {
      "surface": "사거리에서",
      "lemma": "사거리",
      "vocab_id": "v_1289"
     },
     {
      "surface": "왼쪽으로",
      "lemma": "왼쪽",
      "vocab_id": "v_1220"
     },
     {
      "surface": "도세요",
      "lemma": "돌다",
      "vocab_id": "v_1292"
     },
     {
      "surface": "약",
      "lemma": "약",
      "vocab_id": "new_03"
     },
     {
      "surface": "오",
      "lemma": "오",
      "vocab_id": "v_1074"
     },
     {
      "surface": "분",
      "lemma": "분",
      "vocab_id": "v_1115"
     },
     {
      "surface": "걸려요",
      "lemma": "걸리다",
      "vocab_id": "v_1264"
     }
    ],
    "grammar_ids": [
     "g_118",
     "g_117"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "A",
    "ko": "사거리에서 좌회전해요? 멀어요?",
    "zh": "在十字路口左轉嗎？遠嗎？",
    "target_words": [
     {
      "surface": "사거리에서",
      "lemma": "사거리",
      "vocab_id": "v_1289"
     },
     {
      "surface": "좌회전해요",
      "lemma": "좌회전하다",
      "vocab_id": "v_1293"
     },
     {
      "surface": "멀어요",
      "lemma": "멀다",
      "vocab_id": "v_1261"
     }
    ],
    "grammar_ids": [
     "g_118"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "B",
    "ko": "아니요, 가까워요. 은행하고 약국 사이에 있어요.",
    "zh": "不遠，很近。就在銀行和藥局中間。",
    "target_words": [
     {
      "surface": "아니요",
      "lemma": "아니요",
      "vocab_id": "v_1008"
     },
     {
      "surface": "가까워요",
      "lemma": "가깝다",
      "vocab_id": "v_1262"
     },
     {
      "surface": "은행하고",
      "lemma": "은행",
      "vocab_id": "v_1276"
     },
     {
      "surface": "약국",
      "lemma": "약국",
      "vocab_id": "v_1283"
     },
     {
      "surface": "사이에",
      "lemma": "사이",
      "vocab_id": "v_1214"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "A",
    "ko": "정말 감사합니다. 아주 친절하세요!",
    "zh": "真的很謝謝您，您人真好！",
    "target_words": [
     {
      "surface": "감사합니다",
      "lemma": "감사하다",
      "vocab_id": "v_1003"
     },
     {
      "surface": "친절하세요",
      "lemma": "친절하다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "실례하다",
    "pos": "動詞",
    "hanja": "失禮",
    "meaning_zh": "打擾、不好意思（向陌生人搭話）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "친절하다",
    "pos": "形容詞",
    "hanja": "親切",
    "meaning_zh": "親切、友善"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "약",
    "pos": "冠形詞",
    "hanja": "約",
    "meaning_zh": "大約"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_117",
    "pattern": "名詞 + (으)로",
    "meaning": "往…（方向）、沿著…（路線）",
    "explanation": "表示移動的方向或路線：왼쪽으로（往左）、이 길로（沿著這條路）。沒有收音或收音是 ㄹ 接 -로（길 → 길로），其他有收音接 -으로（앞 → 앞으로）。常和 가다、걸어가다、돌다 一起用。",
    "extra_example_ko": "오른쪽으로 가세요.",
    "extra_example_zh": "請往右走。"
   },
   {
    "grammar_id": "g_118",
    "pattern": "地點 + 에서",
    "meaning": "在…（做某個動作）",
    "explanation": "-에서 表示動作發生的地點：사거리에서 도세요（在十字路口轉彎）。和 -에 的差別：「在哪裡有／存在」用 -에（은행 옆에 있어요），「在哪裡做動作」用 -에서（도서관에서 공부해요）。",
    "extra_example_ko": "공원에서 친구를 만나요.",
    "extra_example_zh": "在公園跟朋友見面。"
   }
  ]
 },
 {
  "article_id": "art_110",
  "level": 1,
  "topic": "咖啡廳與飲料點餐",
  "title_ko": "카페에서",
  "title_zh": "在咖啡廳",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "B",
    "ko": "어서 오세요. 주문하시겠어요?",
    "zh": "歡迎光臨，請問要點什麼？",
    "target_words": [
     {
      "surface": "주문하시겠어요",
      "lemma": "주문하다",
      "vocab_id": "v_1309"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "A",
    "ko": "아이스 아메리카노 한 잔하고 녹차 라떼 한 잔 주세요.",
    "zh": "請給我一杯冰美式和一杯綠茶拿鐵。",
    "target_words": [
     {
      "surface": "아이스",
      "lemma": "아이스",
      "vocab_id": "v_1321"
     },
     {
      "surface": "아메리카노",
      "lemma": "아메리카노",
      "vocab_id": "v_1311"
     },
     {
      "surface": "한",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "잔하고",
      "lemma": "잔",
      "vocab_id": "v_1326"
     },
     {
      "surface": "녹차",
      "lemma": "녹차",
      "vocab_id": "v_1313"
     },
     {
      "surface": "라떼",
      "lemma": "라떼",
      "vocab_id": "v_1312"
     },
     {
      "surface": "한",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "잔",
      "lemma": "잔",
      "vocab_id": "v_1326"
     },
     {
      "surface": "주세요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     }
    ],
    "grammar_ids": [
     "g_119"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "B",
    "ko": "사이즈는 어떻게 드릴까요?",
    "zh": "請問要什麼尺寸？",
    "target_words": [
     {
      "surface": "사이즈는",
      "lemma": "사이즈",
      "vocab_id": "v_1331"
     },
     {
      "surface": "드릴까요",
      "lemma": "드리다",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "A",
    "ko": "보통 사이즈로 주세요. 그리고 설탕은 빼 주세요.",
    "zh": "請給我一般大小，然後不要加糖。",
    "target_words": [
     {
      "surface": "보통",
      "lemma": "보통",
      "vocab_id": "v_1132"
     },
     {
      "surface": "사이즈로",
      "lemma": "사이즈",
      "vocab_id": "v_1331"
     },
     {
      "surface": "주세요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     },
     {
      "surface": "설탕은",
      "lemma": "설탕",
      "vocab_id": "v_1329"
     },
     {
      "surface": "빼",
      "lemma": "빼다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": [
     "g_120"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "B",
    "ko": "여기서 드세요? 포장이에요?",
    "zh": "要內用還是外帶？",
    "target_words": [
     {
      "surface": "여기서",
      "lemma": "여기",
      "vocab_id": "v_1222"
     },
     {
      "surface": "드세요",
      "lemma": "드시다",
      "vocab_id": "new_03"
     },
     {
      "surface": "포장이에요",
      "lemma": "포장",
      "vocab_id": "v_1332"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "A",
    "ko": "포장해 주세요. 그리고 영수증도 주세요.",
    "zh": "請幫我外帶，也請給我收據。",
    "target_words": [
     {
      "surface": "포장",
      "lemma": "포장",
      "vocab_id": "v_1332"
     },
     {
      "surface": "영수증도",
      "lemma": "영수증",
      "vocab_id": "v_1338"
     },
     {
      "surface": "주세요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     }
    ],
    "grammar_ids": [
     "g_120"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "드리다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "給（주다 的敬語，給長輩或客人）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "빼다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "去掉、拿掉、不加"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "드시다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "吃、喝（먹다、마시다 的敬語）"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_119",
    "pattern": "名詞 + 固有詞數字 + 量詞",
    "meaning": "（幾）杯、（幾）個…",
    "explanation": "點東西時的順序是「東西＋數量＋量詞」，跟中文相反：커피 한 잔（一杯咖啡）、케이크 두 개（兩個蛋糕）。數量用固有詞數字，而且 하나、둘、셋、넷 在量詞前會變短：한 잔、두 잔、세 잔、네 잔。",
    "extra_example_ko": "콜라 세 잔하고 쿠키 두 개 주세요.",
    "extra_example_zh": "請給我三杯可樂和兩片餅乾。"
   },
   {
    "grammar_id": "g_120",
    "pattern": "動詞語幹 + -아/어 주세요",
    "meaning": "請（幫我）…",
    "explanation": "請對方為自己做某件事。接法和 -아요/어요 一樣：빼다 → 빼 주세요、넣다 → 넣어 주세요、포장하다 → 포장해 주세요。比單獨的 -(으)세요 更有「麻煩您幫我」的感覺，點餐、問路都很常用。",
    "extra_example_ko": "얼음을 많이 넣어 주세요.",
    "extra_example_zh": "請幫我多加一點冰塊。"
   }
  ]
 },
 {
  "article_id": "art_111",
  "level": 1,
  "topic": "韓國常見平民美食",
  "title_ko": "점심 뭐 먹을까요?",
  "title_zh": "午餐吃什麼？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "배고파요. 점심에 뭐 먹을까요?",
    "zh": "我餓了。中午要吃什麼？",
    "target_words": [
     {
      "surface": "배고파요",
      "lemma": "배고프다",
      "vocab_id": "v_1384"
     },
     {
      "surface": "점심에",
      "lemma": "점심",
      "vocab_id": "v_1119"
     },
     {
      "surface": "뭐",
      "lemma": "무엇",
      "vocab_id": "v_1013"
     },
     {
      "surface": "먹을까요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": [
     "g_121"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "분식 어때요? 떡볶이하고 김밥을 먹어요.",
    "zh": "吃小吃怎麼樣？我們吃辣炒年糕和紫菜包飯吧。",
    "target_words": [
     {
      "surface": "분식",
      "lemma": "분식",
      "vocab_id": "v_1373"
     },
     {
      "surface": "떡볶이하고",
      "lemma": "떡볶이",
      "vocab_id": "v_1347"
     },
     {
      "surface": "김밥을",
      "lemma": "김밥",
      "vocab_id": "v_1348"
     },
     {
      "surface": "먹어요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "떡볶이는 너무 매워요. 저는 매운 음식을 잘 못 먹어요.",
    "zh": "辣炒年糕太辣了。我不太能吃辣。",
    "target_words": [
     {
      "surface": "떡볶이는",
      "lemma": "떡볶이",
      "vocab_id": "v_1347"
     },
     {
      "surface": "너무",
      "lemma": "너무",
      "vocab_id": "v_1403"
     },
     {
      "surface": "매워요",
      "lemma": "맵다",
      "vocab_id": "v_1381"
     },
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "매운",
      "lemma": "맵다",
      "vocab_id": "v_1381"
     },
     {
      "surface": "음식을",
      "lemma": "음식",
      "vocab_id": "v_1341"
     },
     {
      "surface": "먹어요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": [
     "g_122"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "그럼 순두부찌개는요? 순한 맛도 있어요.",
    "zh": "那嫩豆腐鍋呢？也有不辣的口味。",
    "target_words": [
     {
      "surface": "순두부찌개는요",
      "lemma": "순두부찌개",
      "vocab_id": "v_1357"
     },
     {
      "surface": "순한",
      "lemma": "순하다",
      "vocab_id": "new_01"
     },
     {
      "surface": "맛도",
      "lemma": "맛",
      "vocab_id": "v_1379"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "좋아요. 반찬도 많이 줘요?",
    "zh": "好啊。小菜也給很多嗎？",
    "target_words": [
     {
      "surface": "반찬도",
      "lemma": "반찬",
      "vocab_id": "v_1364"
     },
     {
      "surface": "많이",
      "lemma": "많이",
      "vocab_id": "v_1386"
     },
     {
      "surface": "줘요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "네, 반찬은 김치하고 김이에요. 그리고 무료로 더 줘요.",
    "zh": "對，小菜有泡菜和海苔，而且可以免費續。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "반찬은",
      "lemma": "반찬",
      "vocab_id": "v_1364"
     },
     {
      "surface": "김치하고",
      "lemma": "김치",
      "vocab_id": "v_1343"
     },
     {
      "surface": "김이에요",
      "lemma": "김",
      "vocab_id": "v_1363"
     },
     {
      "surface": "무료로",
      "lemma": "무료",
      "vocab_id": "new_02"
     },
     {
      "surface": "더",
      "lemma": "더",
      "vocab_id": "v_1402"
     },
     {
      "surface": "줘요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "순하다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "（味道）溫和、不辣"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "무료",
    "pos": "名詞",
    "hanja": "無料",
    "meaning_zh": "免費"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_121",
    "pattern": "動詞語幹 + -(으)ㄹ까요?",
    "meaning": "我們…好嗎？／要…嗎？（提議、商量）",
    "explanation": "跟對方商量要不要一起做某事：뭐 먹을까요?（要吃什麼呢？）、같이 갈까요?（一起去好嗎？）。語幹沒有收音接 -ㄹ까요（가다 → 갈까요），有收音接 -을까요（먹다 → 먹을까요）。回答常用 -아요/어요（좋아요、먹어요）。",
    "extra_example_ko": "주말에 같이 냉면 먹을까요?",
    "extra_example_zh": "週末一起吃冷麵好嗎？"
   },
   {
    "grammar_id": "g_122",
    "pattern": "못 + 動詞",
    "meaning": "不能…、沒辦法…（能力或情況不允許）",
    "explanation": "-못 放在動詞前面，表示想做卻做不到：매운 음식을 못 먹어요（不能吃辣）。和 안（不，主觀不想）不同：안 먹어요＝不吃（不想吃），못 먹어요＝不能吃（吃不了）。加 잘 變成「잘 못 먹어요」，語氣比較委婉：不太能吃。",
    "extra_example_ko": "저는 술을 못 마셔요.",
    "extra_example_zh": "我不能喝酒。"
   }
  ]
 },
 {
  "article_id": "art_113",
  "level": 1,
  "topic": "水果與生鮮食材",
  "title_ko": "시장에서 장 보기",
  "title_zh": "去市場買菜",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "주말에 엄마하고 시장에서 장을 봤어요.",
    "zh": "週末我和媽媽去市場買菜。",
    "target_words": [
     {
      "surface": "주말에",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "엄마하고",
      "lemma": "엄마",
      "vocab_id": "v_1039"
     },
     {
      "surface": "시장에서",
      "lemma": "시장",
      "vocab_id": "v_1280"
     },
     {
      "surface": "장을 봤어요",
      "lemma": "장을 보다",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": [
     "g_125"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "과일 가게에서 사과하고 딸기를 샀어요.",
    "zh": "在水果店買了蘋果和草莓。",
    "target_words": [
     {
      "surface": "과일",
      "lemma": "과일",
      "vocab_id": "v_1411"
     },
     {
      "surface": "가게에서",
      "lemma": "가게",
      "vocab_id": "v_1302"
     },
     {
      "surface": "사과하고",
      "lemma": "사과",
      "vocab_id": "v_1415"
     },
     {
      "surface": "딸기를",
      "lemma": "딸기",
      "vocab_id": "v_1419"
     },
     {
      "surface": "샀어요",
      "lemma": "사다",
      "vocab_id": "v_1445"
     }
    ],
    "grammar_ids": [
     "g_125"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "딸기가 아주 싱싱하고 달았어요.",
    "zh": "草莓很新鮮又很甜。",
    "target_words": [
     {
      "surface": "딸기가",
      "lemma": "딸기",
      "vocab_id": "v_1419"
     },
     {
      "surface": "싱싱하고",
      "lemma": "싱싱하다",
      "vocab_id": "new_02"
     },
     {
      "surface": "달았어요",
      "lemma": "달다",
      "vocab_id": "v_1382"
     }
    ],
    "grammar_ids": [
     "g_125"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "그리고 돼지고기하고 두부, 양파도 샀어요.",
    "zh": "還買了豬肉、豆腐和洋蔥。",
    "target_words": [
     {
      "surface": "돼지고기하고",
      "lemma": "돼지고기",
      "vocab_id": "v_1424"
     },
     {
      "surface": "두부",
      "lemma": "두부",
      "vocab_id": "v_1428"
     },
     {
      "surface": "양파도",
      "lemma": "양파",
      "vocab_id": "v_1430"
     },
     {
      "surface": "샀어요",
      "lemma": "사다",
      "vocab_id": "v_1445"
     }
    ],
    "grammar_ids": [
     "g_125"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "저녁에 엄마가 맛있는 김치찌개를 끓였어요.",
    "zh": "晚上媽媽煮了好吃的泡菜鍋。",
    "target_words": [
     {
      "surface": "저녁에",
      "lemma": "저녁",
      "vocab_id": "v_1120"
     },
     {
      "surface": "엄마가",
      "lemma": "엄마",
      "vocab_id": "v_1039"
     },
     {
      "surface": "맛있는",
      "lemma": "맛있다",
      "vocab_id": "v_1380"
     },
     {
      "surface": "김치찌개를",
      "lemma": "김치찌개",
      "vocab_id": "v_1355"
     },
     {
      "surface": "끓였어요",
      "lemma": "끓이다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": [
     "g_126",
     "g_125"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "김치찌개에 두부하고 돼지고기가 많이 있어서 정말 맛있었어요.",
    "zh": "泡菜鍋裡有很多豆腐和豬肉，真的很好吃。",
    "target_words": [
     {
      "surface": "김치찌개에",
      "lemma": "김치찌개",
      "vocab_id": "v_1355"
     },
     {
      "surface": "두부하고",
      "lemma": "두부",
      "vocab_id": "v_1428"
     },
     {
      "surface": "돼지고기가",
      "lemma": "돼지고기",
      "vocab_id": "v_1424"
     },
     {
      "surface": "많이",
      "lemma": "많이",
      "vocab_id": "v_1386"
     },
     {
      "surface": "있어서",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "맛있었어요",
      "lemma": "맛있다",
      "vocab_id": "v_1380"
     }
    ],
    "grammar_ids": [
     "g_125"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "장을 보다",
    "pos": "慣用語",
    "hanja": null,
    "meaning_zh": "（去市場、超市）買菜、採買"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "싱싱하다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "新鮮"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "끓이다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "煮、燒開"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_125",
    "pattern": "動詞／形容詞語幹 + -았/었어요",
    "meaning": "過去式（…了、過去是…）",
    "explanation": "說已經發生的事。語幹最後的母音是 ㅏ 或 ㅗ 接 -았어요（사다 → 샀어요、달다 → 달았어요），其他接 -었어요（있다 → 있었어요），하다 變成 했어요。母音相同時會合在一起（사+았 → 샀），ㅣ 會變成 ㅕ（끓이다 → 끓였어요）。",
    "extra_example_ko": "어제 마트에서 계란을 샀어요.",
    "extra_example_zh": "昨天在超市買了雞蛋。"
   },
   {
    "grammar_id": "g_126",
    "pattern": "形容詞語幹 + -(으)ㄴ + 名詞（있다／없다 用 -는）",
    "meaning": "…的＋名詞（用形容詞修飾名詞）",
    "explanation": "把形容詞放在名詞前面修飾它。沒有收音接 -ㄴ（싸다 → 싼 과일），有收音接 -은（작다 → 작은 가방）。以 있다／없다 結尾的字要用 -는：맛있다 → 맛있는 김치찌개、재미없다 → 재미없는 영화。",
    "extra_example_ko": "싱싱한 과일을 사고 싶어요.",
    "extra_example_zh": "我想買新鮮的水果。"
   }
  ]
 },
 {
  "article_id": "art_114",
  "level": 1,
  "topic": "超市購物與貨幣單位",
  "title_ko": "이거 얼마예요?",
  "title_zh": "這個多少錢？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "사과 얼마예요?",
    "zh": "蘋果多少錢？",
    "target_words": [
     {
      "surface": "사과",
      "lemma": "사과",
      "vocab_id": "v_1415"
     },
     {
      "surface": "얼마예요",
      "lemma": "얼마",
      "vocab_id": "v_1448"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "한 개에 이천 원이에요. 다섯 개에 만 원이에요.",
    "zh": "一顆兩千韓元，五顆一萬韓元。",
    "target_words": [
     {
      "surface": "한",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "개에",
      "lemma": "개",
      "vocab_id": "v_1455"
     },
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1071"
     },
     {
      "surface": "천",
      "lemma": "천",
      "vocab_id": "v_1081"
     },
     {
      "surface": "원이에요",
      "lemma": "원",
      "vocab_id": "v_1449"
     },
     {
      "surface": "다섯",
      "lemma": "다섯",
      "vocab_id": "v_1107"
     },
     {
      "surface": "개에",
      "lemma": "개",
      "vocab_id": "v_1455"
     },
     {
      "surface": "만",
      "lemma": "만",
      "vocab_id": "v_1082"
     },
     {
      "surface": "원이에요",
      "lemma": "원",
      "vocab_id": "v_1449"
     }
    ],
    "grammar_ids": [
     "g_128",
     "g_127"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "좀 비싸요. 깎아 주세요.",
    "zh": "有點貴，算便宜一點吧。",
    "target_words": [
     {
      "surface": "비싸요",
      "lemma": "비싸다",
      "vocab_id": "v_1454"
     },
     {
      "surface": "깎아",
      "lemma": "깎다",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "그럼 다섯 개에 구천 원에 드릴게요.",
    "zh": "那五顆算你九千韓元。",
    "target_words": [
     {
      "surface": "다섯",
      "lemma": "다섯",
      "vocab_id": "v_1107"
     },
     {
      "surface": "개에",
      "lemma": "개",
      "vocab_id": "v_1455"
     },
     {
      "surface": "구",
      "lemma": "구",
      "vocab_id": "v_1078"
     },
     {
      "surface": "천",
      "lemma": "천",
      "vocab_id": "v_1081"
     },
     {
      "surface": "원에",
      "lemma": "원",
      "vocab_id": "v_1449"
     },
     {
      "surface": "드릴게요",
      "lemma": "드리다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": [
     "g_128",
     "g_127"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "좋아요. 그리고 계란 한 상자도 주세요. 전부 얼마예요?",
    "zh": "好。另外也請給我一盒雞蛋。全部多少錢？",
    "target_words": [
     {
      "surface": "계란",
      "lemma": "계란",
      "vocab_id": "v_1427"
     },
     {
      "surface": "한",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "상자도",
      "lemma": "상자",
      "vocab_id": "v_1458"
     },
     {
      "surface": "주세요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     },
     {
      "surface": "전부",
      "lemma": "전부",
      "vocab_id": "v_1471"
     },
     {
      "surface": "얼마예요",
      "lemma": "얼마",
      "vocab_id": "v_1448"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "전부 만 오천 원이에요. 봉투는 유료예요. 필요하세요?",
    "zh": "總共一萬五千韓元。袋子要另外付費，需要嗎？",
    "target_words": [
     {
      "surface": "전부",
      "lemma": "전부",
      "vocab_id": "v_1471"
     },
     {
      "surface": "만",
      "lemma": "만",
      "vocab_id": "v_1082"
     },
     {
      "surface": "오",
      "lemma": "오",
      "vocab_id": "v_1074"
     },
     {
      "surface": "천",
      "lemma": "천",
      "vocab_id": "v_1081"
     },
     {
      "surface": "원이에요",
      "lemma": "원",
      "vocab_id": "v_1449"
     },
     {
      "surface": "봉투는",
      "lemma": "봉투",
      "vocab_id": "v_1468"
     },
     {
      "surface": "유료예요",
      "lemma": "유료",
      "vocab_id": "new_03"
     },
     {
      "surface": "필요하세요",
      "lemma": "필요하다",
      "vocab_id": "v_1470"
     }
    ],
    "grammar_ids": [
     "g_127"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "깎다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "殺價、打折；削、剪"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "드리다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "給（주다 的敬語，給長輩或客人）"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "유료",
    "pos": "名詞",
    "hanja": "有料",
    "meaning_zh": "需付費、收費"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_127",
    "pattern": "漢字詞數字 + 원",
    "meaning": "價錢的說法（…韓元）",
    "explanation": "價錢一律用漢字詞數字：천 원（一千）、만 원（一萬）、만 오천 원（一萬五千）。韓文以「萬」為單位，一萬不說「일만」，直接說「만」；同樣一百、一千也直接說「백」「천」。問價錢說「얼마예요?」。",
    "extra_example_ko": "이 우유는 삼천오백 원이에요.",
    "extra_example_zh": "這瓶牛奶三千五百韓元。"
   },
   {
    "grammar_id": "g_128",
    "pattern": "數量 + 에 + 價錢",
    "meaning": "每…（多少錢）",
    "explanation": "-에 接在數量後面表示「以這個數量計算」：한 개에 이천 원（一個兩千）、다섯 개에 만 원（五個一萬）。量詞前的固有詞數字會變短：한 개、두 개、세 개、네 개。",
    "extra_example_ko": "귤은 한 상자에 만 원이에요.",
    "extra_example_zh": "橘子一箱一萬韓元。"
   }
  ]
 },
 {
  "article_id": "art_115",
  "level": 1,
  "topic": "基礎服飾與配件",
  "title_ko": "파티에 뭐 입어요?",
  "title_zh": "派對要穿什麼？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "주말 파티에 뭐 입어요?",
    "zh": "週末的派對你要穿什麼？",
    "target_words": [
     {
      "surface": "주말",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "파티에",
      "lemma": "파티",
      "vocab_id": "new_01"
     },
     {
      "surface": "뭐",
      "lemma": "무엇",
      "vocab_id": "v_1013"
     },
     {
      "surface": "입어요",
      "lemma": "입다",
      "vocab_id": "v_1505"
     }
    ],
    "grammar_ids": [
     "g_129"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "원피스를 입고 구두를 신어요.",
    "zh": "我要穿連身裙和皮鞋。",
    "target_words": [
     {
      "surface": "원피스를",
      "lemma": "원피스",
      "vocab_id": "v_1482"
     },
     {
      "surface": "입고",
      "lemma": "입다",
      "vocab_id": "v_1505"
     },
     {
      "surface": "구두를",
      "lemma": "구두",
      "vocab_id": "v_1492"
     },
     {
      "surface": "신어요",
      "lemma": "신다",
      "vocab_id": "v_1506"
     }
    ],
    "grammar_ids": [
     "g_129"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "와, 멋있어요! 저는 청바지하고 티셔츠를 입어요.",
    "zh": "哇，好好看！我要穿牛仔褲和 T 恤。",
    "target_words": [
     {
      "surface": "멋있어요",
      "lemma": "멋있다",
      "vocab_id": "new_02"
     },
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "청바지하고",
      "lemma": "청바지",
      "vocab_id": "v_1486"
     },
     {
      "surface": "티셔츠를",
      "lemma": "티셔츠",
      "vocab_id": "v_1481"
     },
     {
      "surface": "입어요",
      "lemma": "입다",
      "vocab_id": "v_1505"
     }
    ],
    "grammar_ids": [
     "g_129"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "밤에 늦게 끝나요. 코트도 입으세요.",
    "zh": "派對很晚才結束，你也穿件大衣吧。",
    "target_words": [
     {
      "surface": "밤에",
      "lemma": "밤",
      "vocab_id": "v_1121"
     },
     {
      "surface": "늦게",
      "lemma": "늦다",
      "vocab_id": "v_1133"
     },
     {
      "surface": "끝나요",
      "lemma": "끝나다",
      "vocab_id": "v_1170"
     },
     {
      "surface": "코트도",
      "lemma": "코트",
      "vocab_id": "v_1483"
     },
     {
      "surface": "입으세요",
      "lemma": "입다",
      "vocab_id": "v_1505"
     }
    ],
    "grammar_ids": [
     "g_129"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "네. 모자도 쓰고 장갑도 낄게요.",
    "zh": "好，我也會戴帽子和手套。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "모자도",
      "lemma": "모자",
      "vocab_id": "v_1493"
     },
     {
      "surface": "쓰고",
      "lemma": "쓰다",
      "vocab_id": "v_1507"
     },
     {
      "surface": "장갑도",
      "lemma": "장갑",
      "vocab_id": "v_1497"
     },
     {
      "surface": "낄게요",
      "lemma": "끼다",
      "vocab_id": "v_1508"
     }
    ],
    "grammar_ids": [
     "g_129"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "아, 지갑하고 안경도 잊지 마세요!",
    "zh": "啊，別忘了錢包和眼鏡喔！",
    "target_words": [
     {
      "surface": "지갑하고",
      "lemma": "지갑",
      "vocab_id": "v_1498"
     },
     {
      "surface": "안경도",
      "lemma": "안경",
      "vocab_id": "v_1494"
     },
     {
      "surface": "잊지",
      "lemma": "잊다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": [
     "g_130"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "파티",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "派對"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "멋있다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "好看、帥氣、很棒"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "잊다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "忘記"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_129",
    "pattern": "穿戴動詞：입다／신다／쓰다／끼다／차다",
    "meaning": "韓文的「穿、戴」依部位用不同動詞",
    "explanation": "中文都說「穿」「戴」，韓文要分清楚：衣服褲子用 입다（옷을 입다），鞋襪用 신다（구두를 신다），帽子眼鏡用 쓰다（모자를 쓰다），戒指手套用 끼다（반지를 끼다），手錶用 차다（시계를 차다）。脫下來大多用 벗다，眼鏡、戒指則用 빼다。",
    "extra_example_ko": "추워요. 패딩을 입고 장갑을 끼세요.",
    "extra_example_zh": "好冷，穿上羽絨外套、戴上手套吧。"
   },
   {
    "grammar_id": "g_130",
    "pattern": "動詞語幹 + -지 마세요",
    "meaning": "請不要…",
    "explanation": "禮貌地請對方不要做某事。不管有沒有收音都接 -지 마세요：잊다 → 잊지 마세요（別忘了）、가다 → 가지 마세요（不要去）。和 -(으)세요（請做…）正好相反。",
    "extra_example_ko": "여기에서 신발을 신지 마세요.",
    "extra_example_zh": "請不要在這裡穿鞋。"
   }
  ]
 },
 {
  "article_id": "art_116",
  "level": 1,
  "topic": "顏色與外觀形容詞",
  "title_ko": "어떤 가방이 좋아요?",
  "title_zh": "哪個包包好？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "이 가방 어때요? 색깔이 예뻐요.",
    "zh": "這個包包怎麼樣？顏色很漂亮。",
    "target_words": [
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1226"
     },
     {
      "surface": "가방",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "색깔이",
      "lemma": "색깔",
      "vocab_id": "v_1511"
     },
     {
      "surface": "예뻐요",
      "lemma": "예쁘다",
      "vocab_id": "v_1533"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "빨간색은 좀 밝아요. 검은색은 없어요?",
    "zh": "紅色有點太亮了。沒有黑色的嗎？",
    "target_words": [
     {
      "surface": "빨간색은",
      "lemma": "빨간색",
      "vocab_id": "v_1512"
     },
     {
      "surface": "밝아요",
      "lemma": "밝다",
      "vocab_id": "v_1539"
     },
     {
      "surface": "검은색은",
      "lemma": "검은색",
      "vocab_id": "v_1516"
     },
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "검은색은 너무 커요. 이 하얀 가방은 작고 귀여워요.",
    "zh": "黑色的太大了。這個白色包包小小的很可愛。",
    "target_words": [
     {
      "surface": "검은색은",
      "lemma": "검은색",
      "vocab_id": "v_1516"
     },
     {
      "surface": "너무",
      "lemma": "너무",
      "vocab_id": "v_1403"
     },
     {
      "surface": "커요",
      "lemma": "크다",
      "vocab_id": "v_1529"
     },
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1226"
     },
     {
      "surface": "하얀",
      "lemma": "하얗다",
      "vocab_id": "v_1528"
     },
     {
      "surface": "가방은",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "작고",
      "lemma": "작다",
      "vocab_id": "v_1530"
     },
     {
      "surface": "귀여워요",
      "lemma": "귀엽다",
      "vocab_id": "v_1534"
     }
    ],
    "grammar_ids": [
     "g_131",
     "g_132"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "그런데 흰색은 금방 더러워져요.",
    "zh": "可是白色很快就會髒。",
    "target_words": [
     {
      "surface": "흰색은",
      "lemma": "흰색",
      "vocab_id": "v_1517"
     },
     {
      "surface": "금방",
      "lemma": "금방",
      "vocab_id": "new_01"
     },
     {
      "surface": "더러워져요",
      "lemma": "더러워지다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "그럼 이 갈색 가방은요? 모양도 둥글고 예뻐요.",
    "zh": "那這個咖啡色的包包呢？形狀圓圓的也很漂亮。",
    "target_words": [
     {
      "surface": "이",
      "lemma": "이",
      "vocab_id": "v_1226"
     },
     {
      "surface": "갈색",
      "lemma": "갈색",
      "vocab_id": "v_1521"
     },
     {
      "surface": "가방은요",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "모양도",
      "lemma": "모양",
      "vocab_id": "v_1542"
     },
     {
      "surface": "둥글고",
      "lemma": "둥글다",
      "vocab_id": "v_1543"
     },
     {
      "surface": "예뻐요",
      "lemma": "예쁘다",
      "vocab_id": "v_1533"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "좋아요! 그 가방이 제일 잘 어울려요.",
    "zh": "好！那個包包最適合你。",
    "target_words": [
     {
      "surface": "그",
      "lemma": "그",
      "vocab_id": "v_1227"
     },
     {
      "surface": "가방이",
      "lemma": "가방",
      "vocab_id": "v_1146"
     },
     {
      "surface": "어울려요",
      "lemma": "어울리다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "금방",
    "pos": "副詞",
    "hanja": null,
    "meaning_zh": "馬上、很快"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "더러워지다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "變髒"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "어울리다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "適合、相配"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_131",
    "pattern": "ㅂ 不規則：形容詞語幹 ㅂ → 우 + -어요",
    "meaning": "귀엽다 → 귀여워요、덥다 → 더워요",
    "explanation": "很多形容詞的語幹最後是 ㅂ，接 -아요/어요 或 -(으)ㄴ 時，ㅂ 會變成 우：귀엽다 → 귀여워요、춥다 → 추워요、두껍다 → 두꺼운 책。不過 좁다、입다 等少數字是規則變化（좁아요、입어요）。",
    "extra_example_ko": "오늘은 날씨가 너무 더워요.",
    "extra_example_zh": "今天天氣太熱了。"
   },
   {
    "grammar_id": "g_132",
    "pattern": "ㅎ 不規則：顏色形容詞 하얗다／빨갛다…",
    "meaning": "하얗다 → 하얀、하얘요",
    "explanation": "顏色形容詞（하얗다、빨갛다、노랗다、파랗다、까맣다）的 ㅎ 會脫落。修飾名詞時去掉 ㅎ 加 ㄴ：하얀 가방、빨간 사과；說「…的顏色」時變成 -애요：하얘요、빨개요、노래요。名詞「흰색、빨간색」則是顏色的名稱。",
    "extra_example_ko": "빨간 사과가 정말 빨개요.",
    "extra_example_zh": "紅蘋果真的好紅。"
   }
  ]
 },
 {
  "article_id": "art_117",
  "level": 1,
  "topic": "四季與基礎天氣",
  "title_ko": "한국의 사계절",
  "title_zh": "韓國的四季",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "한국에는 계절이 네 개 있어요. 봄, 여름, 가을, 겨울이에요.",
    "zh": "韓國有四個季節：春、夏、秋、冬。",
    "target_words": [
     {
      "surface": "한국에는",
      "lemma": "한국",
      "vocab_id": "v_1018"
     },
     {
      "surface": "계절이",
      "lemma": "계절",
      "vocab_id": "v_1545"
     },
     {
      "surface": "네",
      "lemma": "넷",
      "vocab_id": "v_1106"
     },
     {
      "surface": "개",
      "lemma": "개",
      "vocab_id": "v_1455"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "봄",
      "lemma": "봄",
      "vocab_id": "v_1546"
     },
     {
      "surface": "여름",
      "lemma": "여름",
      "vocab_id": "v_1547"
     },
     {
      "surface": "가을",
      "lemma": "가을",
      "vocab_id": "v_1548"
     },
     {
      "surface": "겨울이에요",
      "lemma": "겨울",
      "vocab_id": "v_1549"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "봄에는 날씨가 따뜻하고 꽃이 많이 피어요.",
    "zh": "春天天氣溫暖，開很多花。",
    "target_words": [
     {
      "surface": "봄에는",
      "lemma": "봄",
      "vocab_id": "v_1546"
     },
     {
      "surface": "날씨가",
      "lemma": "날씨",
      "vocab_id": "v_1550"
     },
     {
      "surface": "따뜻하고",
      "lemma": "따뜻하다",
      "vocab_id": "v_1322"
     },
     {
      "surface": "꽃이",
      "lemma": "꽃",
      "vocab_id": "v_1568"
     },
     {
      "surface": "많이",
      "lemma": "많이",
      "vocab_id": "v_1386"
     },
     {
      "surface": "피어요",
      "lemma": "피다",
      "vocab_id": "new_01"
     }
    ],
    "grammar_ids": [
     "g_133"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "여름은 아주 더워요. 그래서 선풍기하고 에어컨을 켜요.",
    "zh": "夏天很熱，所以會開電風扇和冷氣。",
    "target_words": [
     {
      "surface": "여름은",
      "lemma": "여름",
      "vocab_id": "v_1547"
     },
     {
      "surface": "더워요",
      "lemma": "덥다",
      "vocab_id": "v_1563"
     },
     {
      "surface": "선풍기하고",
      "lemma": "선풍기",
      "vocab_id": "v_1576"
     },
     {
      "surface": "에어컨을",
      "lemma": "에어컨",
      "vocab_id": "v_1194"
     },
     {
      "surface": "켜요",
      "lemma": "켜다",
      "vocab_id": "v_1199"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "가을에는 하늘이 맑고 단풍이 아름다워요.",
    "zh": "秋天天空晴朗，楓葉很美。",
    "target_words": [
     {
      "surface": "가을에는",
      "lemma": "가을",
      "vocab_id": "v_1548"
     },
     {
      "surface": "하늘이",
      "lemma": "하늘",
      "vocab_id": "v_1555"
     },
     {
      "surface": "맑고",
      "lemma": "맑다",
      "vocab_id": "v_1559"
     },
     {
      "surface": "단풍이",
      "lemma": "단풍",
      "vocab_id": "v_1569"
     },
     {
      "surface": "아름다워요",
      "lemma": "아름답다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": [
     "g_133"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "겨울은 정말 추워요. 그래서 코트하고 장갑이 필요해요.",
    "zh": "冬天真的很冷，所以需要大衣和手套。",
    "target_words": [
     {
      "surface": "겨울은",
      "lemma": "겨울",
      "vocab_id": "v_1549"
     },
     {
      "surface": "추워요",
      "lemma": "춥다",
      "vocab_id": "v_1562"
     },
     {
      "surface": "코트하고",
      "lemma": "코트",
      "vocab_id": "v_1483"
     },
     {
      "surface": "장갑이",
      "lemma": "장갑",
      "vocab_id": "v_1497"
     },
     {
      "surface": "필요해요",
      "lemma": "필요하다",
      "vocab_id": "v_1470"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "저는 바람이 시원한 가을을 제일 좋아해요.",
    "zh": "我最喜歡風很涼爽的秋天。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "바람이",
      "lemma": "바람",
      "vocab_id": "v_1553"
     },
     {
      "surface": "시원한",
      "lemma": "시원하다",
      "vocab_id": "v_1325"
     },
     {
      "surface": "가을을",
      "lemma": "가을",
      "vocab_id": "v_1548"
     },
     {
      "surface": "제일",
      "lemma": "제일",
      "vocab_id": "new_02"
     },
     {
      "surface": "좋아해요",
      "lemma": "좋아하다",
      "vocab_id": "v_1602"
     }
    ],
    "grammar_ids": [
     "g_134"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "피다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "（花）開"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "제일",
    "pos": "副詞",
    "hanja": "第一",
    "meaning_zh": "最、第一"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "아름답다",
    "pos": "形容詞",
    "hanja": null,
    "meaning_zh": "美麗、美"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_133",
    "pattern": "時間名詞 + 에는",
    "meaning": "在…的時候（對比不同時間）",
    "explanation": "-에（在…時）加上主題助詞 -는，變成 -에는，用來對比不同的時間：봄에는 따뜻하고, 겨울에는 추워요（春天溫暖，冬天寒冷）。介紹季節、平日／週末的差別時很常用。",
    "extra_example_ko": "평일에는 바쁘고 주말에는 한가해요.",
    "extra_example_zh": "平日很忙，週末很閒。"
   },
   {
    "grammar_id": "g_134",
    "pattern": "제일 + 形容詞／動詞",
    "meaning": "最…",
    "explanation": "제일 放在形容詞或動詞前面表示「最」：제일 좋아해요（最喜歡）、제일 커요（最大）。口語也常說 가장，意思一樣、比較書面。",
    "extra_example_ko": "저는 여름을 제일 싫어해요.",
    "extra_example_zh": "我最討厭夏天。"
   }
  ]
 },
 {
  "article_id": "art_118",
  "level": 1,
  "topic": "週末休閒與基本興趣",
  "title_ko": "취미가 뭐예요?",
  "title_zh": "你的興趣是什麼？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "취미가 뭐예요?",
    "zh": "你的興趣是什麼？",
    "target_words": [
     {
      "surface": "취미가",
      "lemma": "취미",
      "vocab_id": "v_1579"
     },
     {
      "surface": "뭐예요",
      "lemma": "무엇",
      "vocab_id": "v_1013"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "저는 영화하고 드라마를 좋아해요.",
    "zh": "我喜歡電影和連續劇。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "영화하고",
      "lemma": "영화",
      "vocab_id": "v_1580"
     },
     {
      "surface": "드라마를",
      "lemma": "드라마",
      "vocab_id": "v_1594"
     },
     {
      "surface": "좋아해요",
      "lemma": "좋아하다",
      "vocab_id": "v_1602"
     }
    ],
    "grammar_ids": [
     "g_135"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "B",
    "ko": "주말에는 보통 혼자 영화관에서 영화를 봐요.",
    "zh": "週末我通常一個人去電影院看電影。",
    "target_words": [
     {
      "surface": "주말에는",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "보통",
      "lemma": "보통",
      "vocab_id": "v_1132"
     },
     {
      "surface": "혼자",
      "lemma": "혼자",
      "vocab_id": "v_1608"
     },
     {
      "surface": "영화관에서",
      "lemma": "영화관",
      "vocab_id": "new_01"
     },
     {
      "surface": "영화를",
      "lemma": "영화",
      "vocab_id": "v_1580"
     },
     {
      "surface": "봐요",
      "lemma": "보다",
      "vocab_id": "v_1753"
     }
    ],
    "grammar_ids": [
     "g_136"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "A",
    "ko": "와, 저도 영화를 좋아해요! 저는 노래방에도 자주 가요.",
    "zh": "哇，我也喜歡電影！我也常去 KTV。",
    "target_words": [
     {
      "surface": "저도",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "영화를",
      "lemma": "영화",
      "vocab_id": "v_1580"
     },
     {
      "surface": "좋아해요",
      "lemma": "좋아하다",
      "vocab_id": "v_1602"
     },
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "노래방에도",
      "lemma": "노래방",
      "vocab_id": "v_1584"
     },
     {
      "surface": "자주",
      "lemma": "자주",
      "vocab_id": "v_1611"
     },
     {
      "surface": "가요",
      "lemma": "가다",
      "vocab_id": "v_1751"
     }
    ],
    "grammar_ids": [
     "g_135",
     "g_136"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "B",
    "ko": "노래를 잘 불러요? 저는 노래 실력이 없어요.",
    "zh": "你很會唱歌嗎？我唱歌不行。",
    "target_words": [
     {
      "surface": "노래를",
      "lemma": "노래",
      "vocab_id": "v_1582"
     },
     {
      "surface": "불러요",
      "lemma": "부르다",
      "vocab_id": "v_1583"
     },
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "노래",
      "lemma": "노래",
      "vocab_id": "v_1582"
     },
     {
      "surface": "실력이",
      "lemma": "실력",
      "vocab_id": "new_02"
     },
     {
      "surface": "없어요",
      "lemma": "없다",
      "vocab_id": "v_1063"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "A",
    "ko": "괜찮아요. 다음 주 토요일에 같이 연습해요!",
    "zh": "沒關係，下週六一起練習吧！",
    "target_words": [
     {
      "surface": "괜찮아요",
      "lemma": "괜찮다",
      "vocab_id": "v_1006"
     },
     {
      "surface": "주",
      "lemma": "주",
      "vocab_id": "v_1096"
     },
     {
      "surface": "토요일에",
      "lemma": "토요일",
      "vocab_id": "v_1093"
     },
     {
      "surface": "같이",
      "lemma": "같이",
      "vocab_id": "v_1064"
     },
     {
      "surface": "연습해요",
      "lemma": "연습하다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "영화관",
    "pos": "名詞",
    "hanja": "映畫館",
    "meaning_zh": "電影院"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "실력",
    "pos": "名詞",
    "hanja": "實力",
    "meaning_zh": "實力、能力"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "연습하다",
    "pos": "動詞",
    "hanja": "練習",
    "meaning_zh": "練習"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_135",
    "pattern": "名詞 + 을/를 좋아하다",
    "meaning": "喜歡…",
    "explanation": "韓文的「喜歡」是動詞 좋아하다，喜歡的對象要加受詞助詞 -을/를：영화를 좋아해요、드라마를 좋아해요。注意不要和形容詞 좋다（好）混淆：영화가 좋아요 也可以說「喜歡電影」，但助詞是 -이/가。",
    "extra_example_ko": "저는 한국 음식을 정말 좋아해요.",
    "extra_example_zh": "我真的很喜歡韓國料理。"
   },
   {
    "grammar_id": "g_136",
    "pattern": "頻率副詞：자주／가끔／보통",
    "meaning": "常常／偶爾／通常",
    "explanation": "說明做某件事的頻率，副詞放在動詞前面（中間可以有受詞）：자주 가요（常去）、가끔 노래방에 가요（偶爾去 KTV）、보통 혼자 봐요（通常一個人看）。頻率從高到低：항상（總是）> 자주 > 보통 > 가끔 > 전혀 안（完全不）。",
    "extra_example_ko": "저는 가끔 혼자 영화를 봐요.",
    "extra_example_zh": "我偶爾一個人看電影。"
   }
  ]
 },
 {
  "article_id": "art_119",
  "level": 1,
  "topic": "基礎球類與常見運動",
  "title_ko": "나는 운동이 좋아요",
  "title_zh": "我愛運動",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": null,
    "ko": "저는 운동을 아주 좋아해요.",
    "zh": "我非常喜歡運動。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "운동을",
      "lemma": "운동",
      "vocab_id": "v_1613"
     },
     {
      "surface": "좋아해요",
      "lemma": "좋아하다",
      "vocab_id": "v_1602"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 2,
    "speaker": null,
    "ko": "평일에는 회사 근처 헬스장에서 운동해요.",
    "zh": "平日在公司附近的健身房運動。",
    "target_words": [
     {
      "surface": "평일에는",
      "lemma": "평일",
      "vocab_id": "v_1606"
     },
     {
      "surface": "회사",
      "lemma": "회사",
      "vocab_id": "v_1033"
     },
     {
      "surface": "근처",
      "lemma": "근처",
      "vocab_id": "v_1218"
     },
     {
      "surface": "헬스장에서",
      "lemma": "헬스장",
      "vocab_id": "v_1644"
     },
     {
      "surface": "운동해요",
      "lemma": "운동하다",
      "vocab_id": "v_1614"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 3,
    "speaker": null,
    "ko": "주말에는 친구들하고 공원에서 축구를 해요.",
    "zh": "週末和朋友們在公園踢足球。",
    "target_words": [
     {
      "surface": "주말에는",
      "lemma": "주말",
      "vocab_id": "v_1095"
     },
     {
      "surface": "친구들하고",
      "lemma": "친구",
      "vocab_id": "v_1056"
     },
     {
      "surface": "공원에서",
      "lemma": "공원",
      "vocab_id": "v_1279"
     },
     {
      "surface": "축구를",
      "lemma": "축구",
      "vocab_id": "v_1615"
     },
     {
      "surface": "해요",
      "lemma": "하다",
      "vocab_id": "v_1755"
     }
    ],
    "grammar_ids": [
     "g_137"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": null,
    "ko": "우리 팀은 축구를 잘해요. 지난 경기에서 삼 대 일로 이겼어요.",
    "zh": "我們隊足球踢得很好，上一場比賽以三比一贏了。",
    "target_words": [
     {
      "surface": "우리",
      "lemma": "우리",
      "vocab_id": "v_1059"
     },
     {
      "surface": "팀은",
      "lemma": "팀",
      "vocab_id": "v_1634"
     },
     {
      "surface": "축구를",
      "lemma": "축구",
      "vocab_id": "v_1615"
     },
     {
      "surface": "잘해요",
      "lemma": "잘하다",
      "vocab_id": "v_1645"
     },
     {
      "surface": "경기에서",
      "lemma": "경기",
      "vocab_id": "v_1632"
     },
     {
      "surface": "삼",
      "lemma": "삼",
      "vocab_id": "v_1072"
     },
     {
      "surface": "대",
      "lemma": "대",
      "vocab_id": "new_01"
     },
     {
      "surface": "일로",
      "lemma": "일",
      "vocab_id": "v_1070"
     },
     {
      "surface": "이겼어요",
      "lemma": "이기다",
      "vocab_id": "v_1639"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 5,
    "speaker": null,
    "ko": "여름에는 수영장에서 수영을 하고, 겨울에는 스키를 타요.",
    "zh": "夏天在游泳池游泳，冬天去滑雪。",
    "target_words": [
     {
      "surface": "여름에는",
      "lemma": "여름",
      "vocab_id": "v_1547"
     },
     {
      "surface": "수영장에서",
      "lemma": "수영장",
      "vocab_id": "v_1624"
     },
     {
      "surface": "수영을",
      "lemma": "수영",
      "vocab_id": "v_1623"
     },
     {
      "surface": "하고",
      "lemma": "하다",
      "vocab_id": "v_1755"
     },
     {
      "surface": "겨울에는",
      "lemma": "겨울",
      "vocab_id": "v_1549"
     },
     {
      "surface": "스키를",
      "lemma": "스키",
      "vocab_id": "v_1629"
     },
     {
      "surface": "타요",
      "lemma": "타다",
      "vocab_id": "v_1255"
     }
    ],
    "grammar_ids": [
     "g_137"
    ]
   },
   {
    "sentence_index": 6,
    "speaker": null,
    "ko": "운동을 하면 스트레스가 풀려요.",
    "zh": "一運動，壓力就消除了。",
    "target_words": [
     {
      "surface": "운동을",
      "lemma": "운동",
      "vocab_id": "v_1613"
     },
     {
      "surface": "하면",
      "lemma": "하다",
      "vocab_id": "v_1755"
     },
     {
      "surface": "스트레스가",
      "lemma": "스트레스",
      "vocab_id": "new_02"
     },
     {
      "surface": "풀려요",
      "lemma": "풀리다",
      "vocab_id": "new_03"
     }
    ],
    "grammar_ids": [
     "g_138",
     "g_137"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "대",
    "pos": "名詞（依存）",
    "hanja": "對",
    "meaning_zh": "比（比分：삼 대 일＝三比一）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "스트레스",
    "pos": "名詞",
    "hanja": null,
    "meaning_zh": "壓力"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "풀리다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "（壓力、疲勞）消除、解開"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_137",
    "pattern": "運動名稱 + 을/를 하다（球類也可用 치다／차다，滑雪用 타다）",
    "meaning": "做（某種運動）",
    "explanation": "大部分運動都用「名詞＋을/를 하다」：축구를 해요、수영을 해요、요가를 해요。有些運動有專用動詞：網球、桌球、高爾夫用 치다（테니스를 쳐요），踢球用 차다（공을 차요），滑雪、腳踏車用 타다（스키를 타요）。",
    "extra_example_ko": "저는 주말마다 테니스를 쳐요.",
    "extra_example_zh": "我每個週末都打網球。"
   },
   {
    "grammar_id": "g_138",
    "pattern": "動詞／形容詞語幹 + -(으)면",
    "meaning": "如果…就…、一…就…",
    "explanation": "表示條件。語幹沒有收音或收音是 ㄹ 接 -면（하다 → 하면、놀다 → 놀면），有收音接 -으면（먹다 → 먹으면）。後半句說結果：운동을 하면 스트레스가 풀려요（一運動壓力就消除了）。",
    "extra_example_ko": "비가 오면 집에서 영화를 봐요.",
    "extra_example_zh": "如果下雨，就在家看電影。"
   }
  ]
 },
 {
  "article_id": "art_120",
  "level": 1,
  "topic": "身體部位與基礎外觀",
  "title_ko": "어디가 아파요?",
  "title_zh": "哪裡不舒服？",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "괜찮아요? 어디가 아파요?",
    "zh": "你還好嗎？哪裡不舒服？",
    "target_words": [
     {
      "surface": "괜찮아요",
      "lemma": "괜찮다",
      "vocab_id": "v_1006"
     },
     {
      "surface": "어디가",
      "lemma": "어디",
      "vocab_id": "v_1225"
     },
     {
      "surface": "아파요",
      "lemma": "아프다",
      "vocab_id": "v_1673"
     }
    ],
    "grammar_ids": [
     "g_139",
     "g_140"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "머리가 아프고 목도 아파요.",
    "zh": "頭痛，喉嚨也痛。",
    "target_words": [
     {
      "surface": "머리가",
      "lemma": "머리",
      "vocab_id": "v_1648"
     },
     {
      "surface": "아프고",
      "lemma": "아프다",
      "vocab_id": "v_1673"
     },
     {
      "surface": "목도",
      "lemma": "목",
      "vocab_id": "v_1655"
     },
     {
      "surface": "아파요",
      "lemma": "아프다",
      "vocab_id": "v_1673"
     }
    ],
    "grammar_ids": [
     "g_139",
     "g_140"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "열도 있어요?",
    "zh": "也有發燒嗎？",
    "target_words": [
     {
      "surface": "열도",
      "lemma": "열",
      "vocab_id": "new_01"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "네, 조금 있어요. 그리고 어깨하고 허리도 아파요.",
    "zh": "有，一點點。還有肩膀和腰也痛。",
    "target_words": [
     {
      "surface": "네",
      "lemma": "네",
      "vocab_id": "v_1007"
     },
     {
      "surface": "조금",
      "lemma": "조금",
      "vocab_id": "v_1404"
     },
     {
      "surface": "있어요",
      "lemma": "있다",
      "vocab_id": "v_1062"
     },
     {
      "surface": "어깨하고",
      "lemma": "어깨",
      "vocab_id": "v_1656"
     },
     {
      "surface": "허리도",
      "lemma": "허리",
      "vocab_id": "v_1662"
     },
     {
      "surface": "아파요",
      "lemma": "아프다",
      "vocab_id": "v_1673"
     }
    ],
    "grammar_ids": [
     "g_139"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "감기예요. 따뜻한 물을 많이 마시고 푹 자요.",
    "zh": "是感冒。多喝溫水，好好睡一覺吧。",
    "target_words": [
     {
      "surface": "감기예요",
      "lemma": "감기",
      "vocab_id": "new_02"
     },
     {
      "surface": "따뜻한",
      "lemma": "따뜻하다",
      "vocab_id": "v_1322"
     },
     {
      "surface": "물을",
      "lemma": "물",
      "vocab_id": "v_1308"
     },
     {
      "surface": "많이",
      "lemma": "많이",
      "vocab_id": "v_1386"
     },
     {
      "surface": "마시고",
      "lemma": "마시다",
      "vocab_id": "v_1750"
     },
     {
      "surface": "푹",
      "lemma": "푹",
      "vocab_id": "new_03"
     },
     {
      "surface": "자요",
      "lemma": "자다",
      "vocab_id": "v_1126"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "고마워요. 일찍 집에 가요.",
    "zh": "謝謝，我早點回家。",
    "target_words": [
     {
      "surface": "고마워요",
      "lemma": "고맙다",
      "vocab_id": "v_1004"
     },
     {
      "surface": "일찍",
      "lemma": "일찍",
      "vocab_id": "v_1134"
     },
     {
      "surface": "집에",
      "lemma": "집",
      "vocab_id": "v_1171"
     },
     {
      "surface": "가요",
      "lemma": "가다",
      "vocab_id": "v_1751"
     }
    ],
    "grammar_ids": []
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "열",
    "pos": "名詞",
    "hanja": "熱",
    "meaning_zh": "發燒、熱度"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "감기",
    "pos": "名詞",
    "hanja": "感氣",
    "meaning_zh": "感冒"
   },
   {
    "id": "new_03",
    "level": 2,
    "word": "푹",
    "pos": "副詞",
    "hanja": null,
    "meaning_zh": "（睡、休息）得很好、充分地"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_139",
    "pattern": "身體部位 + 이/가 아프다",
    "meaning": "（某個部位）痛",
    "explanation": "說哪裡痛：머리가 아파요（頭痛）、배가 아파요（肚子痛）。問別人哪裡不舒服說「어디가 아파요?」。兩個部位都痛可以用 -고 連接，第二個部位加 -도（也）：머리가 아프고 목도 아파요。",
    "extra_example_ko": "어제부터 배가 아파요.",
    "extra_example_zh": "從昨天開始肚子痛。"
   },
   {
    "grammar_id": "g_140",
    "pattern": "ㅡ 脫落：아프다 → 아파요",
    "meaning": "語幹最後是 ㅡ 的字，ㅡ 會消失",
    "explanation": "語幹以 ㅡ 結尾的字，接 -아요/어요 時 ㅡ 會掉：아프다 → 아파요、바쁘다 → 바빠요、크다 → 커요、예쁘다 → 예뻐요。要接 -아 還是 -어，看 ㅡ 前面那個字的母音（아 → 아파요、크 前面沒有字 → 커요）。",
    "extra_example_ko": "요즘 너무 바빠요.",
    "extra_example_zh": "最近太忙了。"
   }
  ]
 },
 {
  "article_id": "art_112",
  "level": 1,
  "topic": "餐廳點餐與口味形容",
  "title_ko": "식당에서",
  "title_zh": "在餐廳",
  "sentences": [
   {
    "sentence_index": 1,
    "speaker": "A",
    "ko": "배고파요. 이 식당 음식이 맛있어요?",
    "zh": "我餓了。這家餐廳的菜好吃嗎？",
    "target_words": [
     {
      "surface": "배고파요",
      "lemma": "배고프다",
      "vocab_id": "v_1384"
     },
     {
      "surface": "식당",
      "lemma": "식당",
      "vocab_id": "v_1375"
     },
     {
      "surface": "음식이",
      "lemma": "음식",
      "vocab_id": "v_1341"
     },
     {
      "surface": "맛있어요",
      "lemma": "맛있다",
      "vocab_id": "v_1380"
     }
    ],
    "grammar_ids": [
     "g_123"
    ]
   },
   {
    "sentence_index": 2,
    "speaker": "B",
    "ko": "네, 불고기하고 비빔밥이 맛있어요.",
    "zh": "嗯，烤肉和拌飯很好吃。",
    "target_words": [
     {
      "surface": "불고기하고",
      "lemma": "불고기",
      "vocab_id": "v_1346"
     },
     {
      "surface": "비빔밥이",
      "lemma": "비빔밥",
      "vocab_id": "v_1345"
     },
     {
      "surface": "맛있어요",
      "lemma": "맛있다",
      "vocab_id": "v_1380"
     }
    ],
    "grammar_ids": [
     "g_123"
    ]
   },
   {
    "sentence_index": 3,
    "speaker": "A",
    "ko": "그런데 저는 매운 음식을 못 먹어요.",
    "zh": "可是我不能吃辣的食物。",
    "target_words": [
     {
      "surface": "저는",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "매운",
      "lemma": "맵다",
      "vocab_id": "v_1381"
     },
     {
      "surface": "음식을",
      "lemma": "음식",
      "vocab_id": "v_1341"
     },
     {
      "surface": "먹어요",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     }
    ],
    "grammar_ids": [
     "g_123"
    ]
   },
   {
    "sentence_index": 4,
    "speaker": "B",
    "ko": "그럼 불고기를 시켜요. 불고기는 안 맵고 달아요.",
    "zh": "那我們點烤肉吧。烤肉不辣，而且甜甜的。",
    "target_words": [
     {
      "surface": "불고기를",
      "lemma": "불고기",
      "vocab_id": "v_1346"
     },
     {
      "surface": "시켜요",
      "lemma": "시키다",
      "vocab_id": "new_01"
     },
     {
      "surface": "불고기는",
      "lemma": "불고기",
      "vocab_id": "v_1346"
     },
     {
      "surface": "맵고",
      "lemma": "맵다",
      "vocab_id": "v_1381"
     },
     {
      "surface": "달아요",
      "lemma": "달다",
      "vocab_id": "v_1382"
     }
    ],
    "grammar_ids": [
     "g_123"
    ]
   },
   {
    "sentence_index": 5,
    "speaker": "A",
    "ko": "저기요! 불고기 하나하고 물 주세요.",
    "zh": "不好意思！請給我一份烤肉和水。",
    "target_words": [
     {
      "surface": "저기요",
      "lemma": "저기요",
      "vocab_id": "v_1405"
     },
     {
      "surface": "불고기",
      "lemma": "불고기",
      "vocab_id": "v_1346"
     },
     {
      "surface": "하나하고",
      "lemma": "하나",
      "vocab_id": "v_1103"
     },
     {
      "surface": "물",
      "lemma": "물",
      "vocab_id": "v_1308"
     },
     {
      "surface": "주세요",
      "lemma": "주다",
      "vocab_id": "v_1447"
     }
    ],
    "grammar_ids": []
   },
   {
    "sentence_index": 6,
    "speaker": "B",
    "ko": "아, 많이 먹어서 배불러요. 제가 계산해요.",
    "zh": "啊，吃了好多，好飽。我來結帳。",
    "target_words": [
     {
      "surface": "많이",
      "lemma": "많이",
      "vocab_id": "v_1386"
     },
     {
      "surface": "먹어서",
      "lemma": "먹다",
      "vocab_id": "v_1749"
     },
     {
      "surface": "배불러요",
      "lemma": "배부르다",
      "vocab_id": "v_1385"
     },
     {
      "surface": "제가",
      "lemma": "저",
      "vocab_id": "v_1010"
     },
     {
      "surface": "계산해요",
      "lemma": "계산하다",
      "vocab_id": "new_02"
     }
    ],
    "grammar_ids": [
     "g_124",
     "g_123"
    ]
   }
  ],
  "challenge_vocab": [
   {
    "id": "new_01",
    "level": 2,
    "word": "시키다",
    "pos": "動詞",
    "hanja": null,
    "meaning_zh": "點（餐）、叫（外送）"
   },
   {
    "id": "new_02",
    "level": 2,
    "word": "계산하다",
    "pos": "動詞",
    "hanja": "計算",
    "meaning_zh": "結帳、付錢；計算"
   }
  ],
  "grammar_notes": [
   {
    "grammar_id": "g_123",
    "pattern": "動詞／形容詞語幹 + -아요/어요",
    "meaning": "禮貌的口語結尾（현재 해요體）",
    "explanation": "最常用的禮貌說法，日常對話幾乎都用它。語幹最後的母音是 ㅏ 或 ㅗ 就接 -아요（달다 → 달아요），其他接 -어요（먹다 → 먹어요），하다 變成 해요（계산하다 → 계산해요）。同一個形式靠語調分辨：句尾往下是陳述（맛있어요.），往上是問句（맛있어요?↗），也可以當「我們一起…吧」的提議（불고기를 시켜요.）。",
    "extra_example_ko": "저는 아침에 우유를 마셔요.",
    "extra_example_zh": "我早上喝牛奶。"
   },
   {
    "grammar_id": "g_124",
    "pattern": "動詞／形容詞語幹 + -아서/어서",
    "meaning": "因為…所以…（說明原因）",
    "explanation": "前半句說原因，後半句說結果。接法和 -아요/어요 一樣：먹다 → 먹어서、배고프다 → 배고파서。要注意兩點：① 就算是過去的事，前半句也不加 -았/었，時態放在後半句（많이 먹어서 배불렀어요）；② 後半句不能接命令或提議，例如不能說「배고파서 먹으세요」。",
    "extra_example_ko": "배가 고파서 라면을 먹었어요.",
    "extra_example_zh": "肚子餓了，所以吃了泡麵。"
   }
  ]
 }
];
