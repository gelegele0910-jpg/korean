/* ================= TOPIK 單字與閱讀文章（i+1 可理解輸入） =================
 * TOPIK_TOPICS：主題（1 級 25 個，每個主題固定 34 個字的編號區段：主題 n＝v_(1001+(n-1)×34)～+33）。ready＝已完成。
 * READ_VOCAB：單字 {id, level, topic, word, pos, hanja, meaning_zh, example_ko, example_zh}；id 是複習進度 key，不可改。
 * READ_ARTICLES：文章；target_words 的 surface 必須照順序出現在句子裡，vocab_id 指向 READ_VOCAB 或該篇的 challenge_vocab（+1 生字）。
 * VOCAB_ID_MAP：舊編號 → 新編號（2026-11 重新編號，migrate() 會把複習進度換過去）。
 * 檢查：tests/hangul.js 的 R1～R5。 */
const TOPIK_TOPICS = [{"no": 1, "level": 1, "title": "自我介紹與國籍職業", "desc": "問候、名字、學生/上班族、各國名稱", "ids": ["v_1001", "v_1034"], "ready": true}, {"no": 2, "level": 1, "title": "家庭成員與稱謂", "desc": "父母、兄弟姊妹、爺爺奶奶、基本人稱", "ids": ["v_1035", "v_1068"], "ready": true}, {"no": 3, "level": 1, "title": "數字與日期（漢字詞數字）", "desc": "年月日、星期、電話號碼、樓層", "ids": ["v_1069", "v_1102"], "ready": true}, {"no": 4, "level": 1, "title": "時間與作息（固有詞數字）", "desc": "幾點幾分、早上/晚上、起床/睡覺", "ids": ["v_1103", "v_1136"], "ready": true}, {"no": 5, "level": 1, "title": "教室與文具用品", "desc": "書桌、鉛筆、課本、老師/同學、上課", "ids": ["v_1137", "v_1170"], "ready": true}, {"no": 6, "level": 1, "title": "居家空間與基本家具", "desc": "客廳、房間、床、電視、冰箱", "ids": ["v_1171", "v_1204"], "ready": false}, {"no": 7, "level": 1, "title": "位置與方位介詞", "desc": "上面、下面、裡面、旁邊、對面", "ids": ["v_1205", "v_1238"], "ready": false}, {"no": 8, "level": 1, "title": "常見交通工具", "desc": "公車、地鐵、計程車、飛機、走路", "ids": ["v_1239", "v_1272"], "ready": false}, {"no": 9, "level": 1, "title": "問路與城市地標", "desc": "學校、醫院、銀行、郵局、直走/左轉", "ids": ["v_1273", "v_1306"], "ready": false}, {"no": 10, "level": 1, "title": "咖啡廳與飲料點餐", "desc": "美式咖啡、拿鐵、果汁、冰的/熱的、一杯", "ids": ["v_1307", "v_1340"], "ready": false}, {"no": 11, "level": 1, "title": "韓國常見平民美食", "desc": "拌飯、烤肉、泡菜、拉麵、辣炒年糕", "ids": ["v_1341", "v_1374"], "ready": false}, {"no": 12, "level": 1, "title": "餐廳點餐與口味形容", "desc": "菜單、好吃/不好吃、辣、甜、鹹", "ids": ["v_1375", "v_1408"], "ready": false}, {"no": 13, "level": 1, "title": "水果與生鮮食材", "desc": "蘋果、香蕉、肉、魚、牛奶、麵包", "ids": ["v_1409", "v_1442"], "ready": false}, {"no": 14, "level": 1, "title": "超市購物與貨幣單位", "desc": "多少錢、便宜/貴、買、給、韓國貨幣", "ids": ["v_1443", "v_1476"], "ready": false}, {"no": 15, "level": 1, "title": "基礎服飾與配件", "desc": "衣服、褲子、鞋子、帽子、眼鏡、穿/戴", "ids": ["v_1477", "v_1510"], "ready": false}, {"no": 16, "level": 1, "title": "顏色與外觀形容詞", "desc": "紅黃藍黑白、大/小、長/短、漂亮", "ids": ["v_1511", "v_1544"], "ready": false}, {"no": 17, "level": 1, "title": "四季與基礎天氣", "desc": "春夏秋冬、晴天、下雨、下雪、冷/熱", "ids": ["v_1545", "v_1578"], "ready": false}, {"no": 18, "level": 1, "title": "週末休閒與基本興趣", "desc": "看電影、聽音樂、運動、看書、睡覺", "ids": ["v_1579", "v_1612"], "ready": false}, {"no": 19, "level": 1, "title": "基礎球類與常見運動", "desc": "足球、籃球、游泳、登山、散步", "ids": ["v_1613", "v_1646"], "ready": false}, {"no": 20, "level": 1, "title": "身體部位與基礎外觀", "desc": "頭、眼睛、鼻子、嘴巴、手、腳、高/矮", "ids": ["v_1647", "v_1680"], "ready": false}, {"no": 21, "level": 1, "title": "基礎情緒與心理狀態", "desc": "開心、難過、生氣、累、忙、無聊", "ids": ["v_1681", "v_1714"], "ready": false}, {"no": 22, "level": 1, "title": "電話聯絡與約定時間", "desc": "打電話、傳簡訊、見面、等一下、遲到", "ids": ["v_1715", "v_1748"], "ready": false}, {"no": 23, "level": 1, "title": "常用高頻基礎動詞（動作篇）", "desc": "去、來、吃、喝、看、聽、寫、讀", "ids": ["v_1749", "v_1782"], "ready": false}, {"no": 24, "level": 1, "title": "常用高頻基礎形容詞（狀態篇）", "desc": "好、壞、多、少、快、慢、難、簡單", "ids": ["v_1783", "v_1816"], "ready": false}, {"no": 25, "level": 1, "title": "基礎時間副詞與連接詞", "desc": "今天、明天、昨天、現在、然後、但是", "ids": ["v_1817", "v_1850"], "ready": false}];

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
