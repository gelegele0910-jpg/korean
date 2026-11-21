/* ================= 閱讀文章（i+1 可理解輸入） =================
 * READ_VOCAB：TOPIK 分級核心單字（id 是複習進度的 key，不可改）。
 * READ_ARTICLES：文章；target_words 的 surface 必須照順序出現在句子裡，vocab_id 指向 READ_VOCAB 或該篇的 challenge_vocab（+1 生字）。
 * 新增文章：接在 READ_ARTICLES 尾端，跑 tests/hangul.js（R1～R4）檢查。 */
const READ_VOCAB = [
 {
  "id": "v_1001",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "음식",
  "pos": "名詞",
  "hanja": "飲食",
  "meaning_zh": "食物、料理",
  "example_ko": "저는 한국 음식을 좋아해요.",
  "example_zh": "我喜歡韓國料理。"
 },
 {
  "id": "v_1002",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "밥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "飯、餐",
  "example_ko": "저는 아침에 밥을 먹어요.",
  "example_zh": "我早上吃飯。"
 },
 {
  "id": "v_1003",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "물",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "水",
  "example_ko": "물 한 잔 주세요.",
  "example_zh": "請給我一杯水。"
 },
 {
  "id": "v_1004",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "식당",
  "pos": "名詞",
  "hanja": "食堂",
  "meaning_zh": "餐廳、飯館",
  "example_ko": "학교 앞 식당에서 점심을 먹어요.",
  "example_zh": "我在學校前面的餐廳吃午餐。"
 },
 {
  "id": "v_1005",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "메뉴",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "菜單",
  "example_ko": "메뉴 좀 보여 주세요.",
  "example_zh": "請給我看一下菜單。"
 },
 {
  "id": "v_1006",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "肉",
  "example_ko": "주말에 친구하고 고기를 먹었어요.",
  "example_zh": "週末和朋友去吃了肉。"
 },
 {
  "id": "v_1007",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "생선",
  "pos": "名詞",
  "hanja": "生鮮",
  "meaning_zh": "魚（食用的魚）",
  "example_ko": "어머니는 생선을 좋아하세요.",
  "example_zh": "媽媽喜歡吃魚。"
 },
 {
  "id": "v_1008",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "과일",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "水果",
  "example_ko": "시장에서 과일을 샀어요.",
  "example_zh": "我在市場買了水果。"
 },
 {
  "id": "v_1009",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "야채",
  "pos": "名詞",
  "hanja": "野菜",
  "meaning_zh": "蔬菜",
  "example_ko": "저는 야채를 좋아해요.",
  "example_zh": "我喜歡吃蔬菜。"
 },
 {
  "id": "v_1010",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "빵",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "麵包",
  "example_ko": "아침에 빵을 먹었어요.",
  "example_zh": "我早上吃了麵包。"
 },
 {
  "id": "v_1011",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "커피",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "咖啡",
  "example_ko": "커피 한 잔 마실까요?",
  "example_zh": "要不要喝杯咖啡？"
 },
 {
  "id": "v_1012",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "우유",
  "pos": "名詞",
  "hanja": "牛乳",
  "meaning_zh": "牛奶",
  "example_ko": "저는 매일 우유를 마셔요.",
  "example_zh": "我每天都喝牛奶。"
 },
 {
  "id": "v_1013",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "김치",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式泡菜",
  "example_ko": "김치가 조금 매워요.",
  "example_zh": "泡菜有點辣。"
 },
 {
  "id": "v_1014",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "라면",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "泡麵、拉麵",
  "example_ko": "배가 고파서 라면을 먹었어요.",
  "example_zh": "肚子餓了，所以吃了泡麵。"
 },
 {
  "id": "v_1015",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "비빔밥",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式拌飯",
  "example_ko": "비빔밥 하나 주세요.",
  "example_zh": "請給我一份拌飯。"
 },
 {
  "id": "v_1016",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "불고기",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "韓式烤肉",
  "example_ko": "불고기가 정말 맛있어요.",
  "example_zh": "韓式烤肉真的很好吃。"
 },
 {
  "id": "v_1017",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "숟가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "湯匙",
  "example_ko": "숟가락 좀 주세요.",
  "example_zh": "請給我湯匙。"
 },
 {
  "id": "v_1018",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "젓가락",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "筷子",
  "example_ko": "젓가락으로 국수를 먹어요.",
  "example_zh": "用筷子吃麵。"
 },
 {
  "id": "v_1019",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "맛",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "味道",
  "example_ko": "이 음식은 맛이 좋아요.",
  "example_zh": "這道菜味道很好。"
 },
 {
  "id": "v_1020",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "먹다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "吃",
  "example_ko": "점심에 뭐 먹어요?",
  "example_zh": "中午要吃什麼？"
 },
 {
  "id": "v_1021",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "마시다",
  "pos": "動詞",
  "hanja": null,
  "meaning_zh": "喝",
  "example_ko": "저는 아침마다 차를 마셔요.",
  "example_zh": "我每天早上都喝茶。"
 },
 {
  "id": "v_1022",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "주문하다",
  "pos": "動詞",
  "hanja": "注文",
  "meaning_zh": "點餐、訂購",
  "example_ko": "커피를 두 잔 주문했어요.",
  "example_zh": "我點了兩杯咖啡。"
 },
 {
  "id": "v_1023",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "맛있다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "好吃、美味",
  "example_ko": "이 식당 음식이 맛있어요.",
  "example_zh": "這家餐廳的菜很好吃。"
 },
 {
  "id": "v_1024",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "맵다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "辣",
  "example_ko": "떡볶이가 너무 매워요.",
  "example_zh": "辣炒年糕太辣了。"
 },
 {
  "id": "v_1025",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "달다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "甜",
  "example_ko": "이 케이크는 아주 달아요.",
  "example_zh": "這個蛋糕很甜。"
 },
 {
  "id": "v_1026",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "짜다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "鹹",
  "example_ko": "국이 좀 짜요.",
  "example_zh": "湯有點鹹。"
 },
 {
  "id": "v_1027",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "배고프다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "肚子餓",
  "example_ko": "배고파요. 밥 먹으러 가요.",
  "example_zh": "我餓了，我們去吃飯吧。"
 },
 {
  "id": "v_1028",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "배부르다",
  "pos": "形容詞",
  "hanja": null,
  "meaning_zh": "吃飽、肚子飽",
  "example_ko": "많이 먹어서 배불러요.",
  "example_zh": "吃了很多，好飽。"
 },
 {
  "id": "v_1029",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "아침",
  "pos": "名詞",
  "hanja": null,
  "meaning_zh": "早上、早餐",
  "example_ko": "아침을 꼭 드세요.",
  "example_zh": "一定要吃早餐喔。"
 },
 {
  "id": "v_1030",
  "level": 1,
  "topic": "飲食與餐廳",
  "word": "많이",
  "pos": "副詞",
  "hanja": null,
  "meaning_zh": "多、很多地",
  "example_ko": "많이 드세요.",
  "example_zh": "請多吃一點。"
 }
];

const READ_ARTICLES = [{
 "article_id": "art_101",
 "level": 1,
 "topic": "飲食與餐廳",
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
     "vocab_id": "v_1027"
    },
    {
     "surface": "식당",
     "lemma": "식당",
     "vocab_id": "v_1004"
    },
    {
     "surface": "음식이",
     "lemma": "음식",
     "vocab_id": "v_1001"
    },
    {
     "surface": "맛있어요",
     "lemma": "맛있다",
     "vocab_id": "v_1023"
    }
   ],
   "grammar_ids": [
    "g_101"
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
     "vocab_id": "v_1016"
    },
    {
     "surface": "비빔밥이",
     "lemma": "비빔밥",
     "vocab_id": "v_1015"
    },
    {
     "surface": "맛있어요",
     "lemma": "맛있다",
     "vocab_id": "v_1023"
    }
   ],
   "grammar_ids": [
    "g_101"
   ]
  },
  {
   "sentence_index": 3,
   "speaker": "A",
   "ko": "그런데 저는 매운 음식을 못 먹어요.",
   "zh": "可是我不能吃辣的食物。",
   "target_words": [
    {
     "surface": "매운",
     "lemma": "맵다",
     "vocab_id": "v_1024"
    },
    {
     "surface": "음식을",
     "lemma": "음식",
     "vocab_id": "v_1001"
    },
    {
     "surface": "먹어요",
     "lemma": "먹다",
     "vocab_id": "v_1020"
    }
   ],
   "grammar_ids": [
    "g_101"
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
     "vocab_id": "v_1016"
    },
    {
     "surface": "시켜요",
     "lemma": "시키다",
     "vocab_id": "new_01"
    },
    {
     "surface": "불고기는",
     "lemma": "불고기",
     "vocab_id": "v_1016"
    },
    {
     "surface": "맵고",
     "lemma": "맵다",
     "vocab_id": "v_1024"
    },
    {
     "surface": "달아요",
     "lemma": "달다",
     "vocab_id": "v_1025"
    }
   ],
   "grammar_ids": [
    "g_101"
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
     "vocab_id": "v_1016"
    },
    {
     "surface": "물",
     "lemma": "물",
     "vocab_id": "v_1003"
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
     "vocab_id": "v_1030"
    },
    {
     "surface": "먹어서",
     "lemma": "먹다",
     "vocab_id": "v_1020"
    },
    {
     "surface": "배불러요",
     "lemma": "배부르다",
     "vocab_id": "v_1028"
    },
    {
     "surface": "계산해요",
     "lemma": "계산하다",
     "vocab_id": "new_02"
    }
   ],
   "grammar_ids": [
    "g_102",
    "g_101"
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
   "grammar_id": "g_101",
   "pattern": "動詞／形容詞語幹 + -아요/어요",
   "meaning": "禮貌的口語結尾（현재 해요體）",
   "explanation": "最常用的禮貌說法，日常對話幾乎都用它。語幹最後的母音是 ㅏ 或 ㅗ 就接 -아요（달다 → 달아요），其他接 -어요（먹다 → 먹어요），하다 變成 해요（계산하다 → 계산해요）。同一個形式靠語調分辨：句尾往下是陳述（맛있어요.），往上是問句（맛있어요?↗），也可以當「我們一起…吧」的提議（불고기를 시켜요.）。",
   "extra_example_ko": "저는 아침에 우유를 마셔요.",
   "extra_example_zh": "我早上喝牛奶。"
  },
  {
   "grammar_id": "g_102",
   "pattern": "動詞／形容詞語幹 + -아서/어서",
   "meaning": "因為…所以…（說明原因）",
   "explanation": "前半句說原因，後半句說結果。接法和 -아요/어요 一樣：먹다 → 먹어서、배고프다 → 배고파서。要注意兩點：① 就算是過去的事，前半句也不加 -았/었，時態放在後半句（많이 먹어서 배불렀어요）；② 後半句不能接命令或提議，例如不能說「배고파서 먹으세요」。",
   "extra_example_ko": "배가 고파서 라면을 먹었어요.",
   "extra_example_zh": "肚子餓了，所以吃了泡麵。"
  }
 ]
}];
