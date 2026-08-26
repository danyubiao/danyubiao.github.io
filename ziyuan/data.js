/**
 * 字源模版 — 初始汉字数据
 * 增删条目即可扩展；字段说明见首条注释。
 */
const CHARACTERS = [
  {
    // char: 汉字本体
    // pinyin: 读音
    // lead: 首页导语
    // structure / radical / strokes / method: 解析元信息
    // meaning / usage: 本义与用法
    // examples: [{ word, gloss }]
    // evolution: [{ form, era }] 形体演变
    // evoNote: 演变说明
    char: "山",
    pinyin: "shān",
    lead: "象形字。描摹峰峦起伏之形，是自然与方位的根基。",
    structure: "独体象形",
    radical: "山",
    strokes: "3 画",
    method: "象形",
    meaning:
      "本义指地面上由土石构成、高耸的部分。甲骨文像连绵山峰，中间一峰突起、两侧略低，直观呈现山脉轮廓。",
    usage:
      "作名词指山脉、山岳；亦用于方位与地名。成语如「山清水秀」「开门见山」；偏旁「山」多与高峻、地貌相关。",
    examples: [
      { word: "山水", gloss: "shān shuǐ · 自然风景" },
      { word: "山脉", gloss: "shān mài · 连绵的山体" },
      { word: "登山", gloss: "dēng shān · 攀登高山" },
    ],
    evolution: [
      { form: "山", era: "甲骨文" },
      { form: "山", era: "金文" },
      { form: "山", era: "小篆" },
      { form: "山", era: "隶书" },
      { form: "山", era: "楷书" },
    ],
    evoNote:
      "「山」字形自古稳定：三峰并立的意象贯穿甲骨至楷书，仅笔势由圆转向方正，结构几乎未改。",
  },
  {
    char: "水",
    pinyin: "shuǐ",
    lead: "象形字。中流纵贯，两侧水纹荡漾，是生命与流动的象征。",
    structure: "独体象形",
    radical: "水（氵）",
    strokes: "4 画",
    method: "象形",
    meaning:
      "本义为河流、流水。古文字中间一竖象主流，两侧点画象水波，整体如川流之形。",
    usage:
      "泛指一切液态之水；引申为水域、水性。作偏旁写作「氵」（三点水），多与液体、流动有关。",
    examples: [
      { word: "流水", gloss: "liú shuǐ · 流动的水" },
      { word: "水平", gloss: "shuǐ píng · 水面平静；程度" },
      { word: "饮水", gloss: "yǐn shuǐ · 喝水" },
    ],
    evolution: [
      { form: "水", era: "甲骨文" },
      { form: "水", era: "金文" },
      { form: "水", era: "小篆" },
      { form: "水", era: "隶书" },
      { form: "水", era: "楷书" },
    ],
    evoNote:
      "早期「水」更强调波纹曲线；隶变后点画趋于规整，作偏旁时进一步简化为「氵」。",
  },
  {
    char: "日",
    pinyin: "rì",
    lead: "象形字。外廓为日轮，中点为光芒或日斑，记时与光明之所出。",
    structure: "独体象形",
    radical: "日",
    strokes: "4 画",
    method: "象形",
    meaning:
      "本义为太阳。甲骨文多为圆形或近圆，中有一点；后逐渐方正，成为今日所见之「日」。",
    usage:
      "指太阳，也指一昼夜、白昼、时光。如「日出」「日记」「日新月异」。作偏旁多与光明、时间相关。",
    examples: [
      { word: "日出", gloss: "rì chū · 太阳升起" },
      { word: "日期", gloss: "rì qī · 某一天" },
      { word: "昨日", gloss: "zuó rì · 昨天" },
    ],
    evolution: [
      { form: "日", era: "甲骨文" },
      { form: "日", era: "金文" },
      { form: "日", era: "小篆" },
      { form: "日", era: "隶书" },
      { form: "日", era: "楷书" },
    ],
    evoNote:
      "由圆润日轮变为方形外框，是汉字隶变「化圆为方」的典型；中间一点保留为横或短画。",
  },
  {
    char: "月",
    pinyin: "yuè",
    lead: "象形字。缺月之形，与「日」相对，记夜与时序。",
    structure: "独体象形",
    radical: "月",
    strokes: "4 画",
    method: "象形",
    meaning:
      "本义为月亮。古文字常作弯月形，中有短画示月中阴影；后形体直立，与「肉」旁形近而需依义辨析。",
    usage:
      "指月球、月份、月光。成语如「月白风清」「日积月累」。作偏旁时或表时间，或与「肉」旁混同需据字义判断。",
    examples: [
      { word: "月亮", gloss: "yuè liang · 月球" },
      { word: "年月", gloss: "nián yuè · 时间岁月" },
      { word: "明月", gloss: "míng yuè · 明亮的月亮" },
    ],
    evolution: [
      { form: "月", era: "甲骨文" },
      { form: "月", era: "金文" },
      { form: "月", era: "小篆" },
      { form: "月", era: "隶书" },
      { form: "月", era: "楷书" },
    ],
    evoNote:
      "弯月轮廓逐渐直立、线条化；楷书中「月」与「肉」旁形近，辨义多依赖整字语义。",
  },
  {
    char: "人",
    pinyin: "rén",
    lead: "象形字。侧立人形，是汉字中最根本的主体意象之一。",
    structure: "独体象形",
    radical: "人（亻）",
    strokes: "2 画",
    method: "象形",
    meaning:
      "本义指人类、个人。甲骨文像侧面站立之人，一臂前伸或简省为两笔交会。",
    usage:
      "泛指人类或某人；引申为人格、人手等。作偏旁写作「亻」（单人旁），多与人物、行为相关。",
    examples: [
      { word: "人民", gloss: "rén mín · 民众" },
      { word: "人类", gloss: "rén lèi · 人这一物种" },
      { word: "客人", gloss: "kè rén · 来访的人" },
    ],
    evolution: [
      { form: "人", era: "甲骨文" },
      { form: "人", era: "金文" },
      { form: "人", era: "小篆" },
      { form: "人", era: "隶书" },
      { form: "人", era: "楷书" },
    ],
    evoNote:
      "由具象侧影简化为两笔相撑的「人」；偏旁「亻」进一步省笔，便于左右结构构字。",
  },
  {
    char: "火",
    pinyin: "huǒ",
    lead: "象形字。焰心上腾、两侧火星飞溅，是热能与文明的起点。",
    structure: "独体象形",
    radical: "火（灬）",
    strokes: "4 画",
    method: "象形",
    meaning:
      "本义为火焰。古文字像燃烧之形：中为火苗，旁为迸散火星。",
    usage:
      "指燃烧、火焰，亦喻紧急、暴躁、枪火等。作偏旁居下时常作「灬」（四点底），多与加热、烹煮相关。",
    examples: [
      { word: "火焰", gloss: "huǒ yàn · 燃烧的火苗" },
      { word: "火车", gloss: "huǒ chē · 铁路列车" },
      { word: "熄火", gloss: "xī huǒ · 使火熄灭" },
    ],
    evolution: [
      { form: "火", era: "甲骨文" },
      { form: "火", era: "金文" },
      { form: "火", era: "小篆" },
      { form: "火", era: "隶书" },
      { form: "火", era: "楷书" },
    ],
    evoNote:
      "焰形由写实曲线变为对称点画；作底偏旁时四点「灬」保留「火」的余意。",
  },
];
