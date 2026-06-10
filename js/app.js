const countries = {
  秦: {
    color: "#9d493c",
    hint: "强军重法，易成众矢之的。",
    stats: { military: 72, economy: 56, hearts: 48, court: 66, diplomacy: 38 },
    capital: "咸阳",
  },
  楚: {
    color: "#6f8f5d",
    hint: "地广人众，贵族盘根错节。",
    stats: { military: 58, economy: 66, hearts: 58, court: 42, diplomacy: 48 },
    capital: "郢",
  },
  齐: {
    color: "#4f88a6",
    hint: "财赋丰厚，纵横余地最大。",
    stats: { military: 52, economy: 76, hearts: 62, court: 56, diplomacy: 66 },
    capital: "临淄",
  },
  赵: {
    color: "#c28b38",
    hint: "胡服骑射，强敌环伺。",
    stats: { military: 68, economy: 50, hearts: 56, court: 52, diplomacy: 44 },
    capital: "邯郸",
  },
  魏: {
    color: "#9f76a8",
    hint: "旧日霸主，四面受敌。",
    stats: { military: 58, economy: 60, hearts: 52, court: 58, diplomacy: 42 },
    capital: "大梁",
  },
  韩: {
    color: "#b6aa63",
    hint: "小国居中，术法可救危亡。",
    stats: { military: 42, economy: 48, hearts: 54, court: 64, diplomacy: 54 },
    capital: "新郑",
  },
  燕: {
    color: "#6e7fa9",
    hint: "北境偏远，隐忍可图后发。",
    stats: { military: 50, economy: 44, hearts: 58, court: 48, diplomacy: 52 },
    capital: "蓟",
  },
};

const MAX_TURNS = 250;
const ENDGAME_TURN = 220;
const CONQUEST_TARGET = 42;

const eras = [
  { id: "early", name: "三家分晋", year: -403, hint: "前403，七雄格局初定，诸侯尚可周旋。" },
  { id: "middle", name: "合纵连横", year: -318, hint: "前318，秦势渐起，山东诸侯纵横相抗。" },
  { id: "late", name: "长平之后", year: -260, hint: "前260，天下大势趋急，退让与豪赌皆有代价。" },
];

const rulerStyles = [
  { id: "martial", name: "尚武", hint: "尚武：兵威起势，民力承压。", effects: { military: 8, hearts: -4 } },
  { id: "legalist", name: "重法", hint: "重法：朝政清明，宗室怨望。", effects: { court: 8, diplomacy: -3 } },
  { id: "benevolent", name: "怀柔", hint: "怀柔：民心稳固，扩张较缓。", effects: { hearts: 8, military: -3 } },
  { id: "diplomat", name: "纵横", hint: "纵横：外交有利，财赋多耗。", effects: { diplomacy: 8, economy: -4 } },
];

const constitutions = [
  { id: "vigorous", name: "强健", health: 100, age: [24, 33], loss: -1, early: -0.004, long: 0.08 },
  { id: "balanced", name: "平和", health: 94, age: [28, 39], loss: 0, early: 0, long: 0.04 },
  { id: "frail", name: "多病", health: 86, age: [30, 44], loss: 1, early: 0.012, long: -0.03 },
];

const statMeta = {
  military: "兵威",
  economy: "财赋",
  hearts: "民心",
  court: "朝政",
  diplomacy: "外交",
};

const cities = [
  { id: "xianyang", name: "咸阳", country: "秦", type: "都城", defense: 8, value: 10, x: 138, y: 286, points: [[92,248],[138,226],[188,250],[196,304],[150,330],[96,310]] },
  { id: "yong", name: "雍", country: "秦", type: "旧都", defense: 7, value: 7, x: 84, y: 246, points: [[42,212],[92,200],[126,232],[100,276],[54,282],[28,244]] },
  { id: "hanzhong", name: "汉中", country: "秦", type: "粮仓", defense: 6, value: 7, x: 128, y: 374, points: [[76,338],[132,326],[184,362],[168,420],[104,432],[62,386]] },
  { id: "shangjun", name: "上郡", country: "秦", type: "边城", defense: 6, value: 6, x: 146, y: 176, points: [[104,132],[168,122],[218,166],[196,218],[134,222],[90,182]] },
  { id: "hexi", name: "河西", country: "秦", type: "险关", defense: 7, value: 8, x: 220, y: 250, points: [[184,210],[252,204],[292,246],[266,304],[202,306],[174,262]] },
  { id: "ying", name: "郢", country: "楚", type: "都城", defense: 7, value: 10, x: 394, y: 390, points: [[340,346],[402,326],[464,362],[454,424],[392,452],[330,412]] },
  { id: "shouchun", name: "寿春", country: "楚", type: "新都", defense: 6, value: 8, x: 506, y: 384, points: [[458,342],[524,334],[576,374],[558,430],[498,450],[446,412]] },
  { id: "wan", name: "宛", country: "楚", type: "要塞", defense: 6, value: 7, x: 318, y: 330, points: [[278,292],[336,284],[382,320],[364,372],[306,384],[262,344]] },
  { id: "jiangling", name: "江陵", country: "楚", type: "粮仓", defense: 5, value: 7, x: 356, y: 474, points: [[300,430],[362,420],[420,456],[408,506],[346,522],[288,486]] },
  { id: "qianzhong", name: "黔中", country: "楚", type: "边城", defense: 5, value: 5, x: 228, y: 456, points: [[178,410],[240,398],[292,438],[274,500],[210,512],[166,464]] },
  { id: "linzi", name: "临淄", country: "齐", type: "都城", defense: 7, value: 10, x: 570, y: 180, points: [[524,138],[586,128],[638,166],[628,226],[566,246],[514,204]] },
  { id: "jimo", name: "即墨", country: "齐", type: "铁城", defense: 8, value: 7, x: 642, y: 134, points: [[606,94],[660,90],[698,130],[682,178],[628,184],[594,142]] },
  { id: "ju", name: "莒", country: "齐", type: "边城", defense: 5, value: 5, x: 626, y: 256, points: [[576,218],[638,210],[686,246],[674,302],[614,318],[566,278]] },
  { id: "pinglu", name: "平陆", country: "齐", type: "粮仓", defense: 5, value: 6, x: 506, y: 232, points: [[458,198],[518,186],[562,224],[546,278],[490,292],[444,252]] },
  { id: "gaotang", name: "高唐", country: "齐", type: "边城", defense: 5, value: 5, x: 488, y: 138, points: [[438,104],[496,94],[544,132],[530,180],[474,192],[428,150]] },
  { id: "handan", name: "邯郸", country: "赵", type: "都城", defense: 7, value: 10, x: 356, y: 194, points: [[306,154],[366,142],[416,180],[402,238],[342,252],[296,210]] },
  { id: "jinyang", name: "晋阳", country: "赵", type: "险关", defense: 8, value: 8, x: 300, y: 112, points: [[246,76],[310,64],[360,102],[344,158],[284,170],[236,126]] },
  { id: "dai", name: "代", country: "赵", type: "边城", defense: 6, value: 6, x: 370, y: 74, points: [[324,38],[386,30],[432,68],[414,116],[356,128],[314,88]] },
  { id: "changping", name: "长平", country: "赵", type: "要塞", defense: 8, value: 8, x: 278, y: 208, points: [[230,168],[290,160],[336,200],[318,252],[260,264],[216,222]] },
  { id: "zhongshan", name: "中山", country: "赵", type: "旧国", defense: 6, value: 6, x: 432, y: 128, points: [[384,92],[442,82],[490,120],[476,174],[418,184],[374,144]] },
  { id: "daliang", name: "大梁", country: "魏", type: "都城", defense: 7, value: 10, x: 408, y: 266, points: [[356,226],[418,214],[468,254],[452,312],[390,326],[344,284]] },
  { id: "anyang", name: "安邑", country: "魏", type: "旧都", defense: 6, value: 7, x: 280, y: 272, points: [[236,230],[296,224],[342,262],[326,318],[266,328],[224,286]] },
  { id: "puyang", name: "濮阳", country: "魏", type: "粮仓", defense: 5, value: 6, x: 468, y: 292, points: [[420,252],[480,244],[530,282],[514,338],[454,352],[410,310]] },
  { id: "ye", name: "邺", country: "魏", type: "要塞", defense: 6, value: 7, x: 410, y: 206, points: [[362,168],[422,158],[470,198],[454,250],[394,262],[350,220]] },
  { id: "hexinei", name: "河内", country: "魏", type: "险关", defense: 7, value: 7, x: 322, y: 254, points: [[282,214],[338,208],[382,246],[366,296],[310,306],[270,266]] },
  { id: "xinzheng", name: "新郑", country: "韩", type: "都城", defense: 6, value: 9, x: 336, y: 302, points: [[294,264],[350,258],[394,294],[378,344],[322,356],[282,318]] },
  { id: "yiyang", name: "宜阳", country: "韩", type: "险关", defense: 8, value: 7, x: 270, y: 324, points: [[224,286],[282,280],[328,318],[310,372],[252,382],[212,340]] },
  { id: "yangdi", name: "阳翟", country: "韩", type: "普通", defense: 5, value: 5, x: 374, y: 334, points: [[334,300],[386,292],[428,326],[414,374],[360,386],[320,350]] },
  { id: "shangdang", name: "上党", country: "韩", type: "要塞", defense: 7, value: 8, x: 294, y: 178, points: [[248,140],[306,132],[350,170],[334,222],[276,232],[236,190]] },
  { id: "nanyang", name: "南阳", country: "楚", type: "粮道", defense: 5, value: 6, x: 302, y: 380, points: [[256,340],[314,334],[360,372],[342,426],[284,436],[242,394]] },
  { id: "ji", name: "蓟", country: "燕", type: "都城", defense: 7, value: 10, x: 494, y: 66, points: [[450,28],[508,22],[552,58],[538,108],[480,118],[438,78]] },
  { id: "liaodong", name: "辽东", country: "燕", type: "边城", defense: 6, value: 6, x: 620, y: 58, points: [[570,22],[634,20],[690,56],[670,106],[606,114],[558,76]] },
  { id: "yuyang", name: "渔阳", country: "燕", type: "要塞", defense: 6, value: 6, x: 532, y: 118, points: [[486,80],[546,76],[592,112],[576,162],[518,174],[474,132]] },
  { id: "wuyang", name: "武阳", country: "燕", type: "边城", defense: 5, value: 5, x: 458, y: 90, points: [[412,54],[470,46],[514,82],[500,132],[442,142],[400,102]] },
  { id: "yidu", name: "易都", country: "燕", type: "旧城", defense: 5, value: 5, x: 470, y: 166, points: [[426,130],[482,122],[526,158],[512,206],[456,218],[414,180]] },
  { id: "longxi", name: "陇西", country: "秦", type: "边郡", defense: 6, value: 6, x: 70, y: 80, points: [] },
  { id: "beidi", name: "北地", country: "秦", type: "边郡", defense: 6, value: 6, x: 150, y: 90, points: [] },
  { id: "ba", name: "巴", country: "秦", type: "山地", defense: 6, value: 6, x: 80, y: 380, points: [] },
  { id: "shu", name: "蜀", country: "秦", type: "粮仓", defense: 6, value: 8, x: 70, y: 460, points: [] },
  { id: "hangu", name: "函谷", country: "秦", type: "险关", defense: 9, value: 8, x: 190, y: 350, points: [] },
  { id: "chen", name: "陈", country: "楚", type: "旧都", defense: 5, value: 6, x: 470, y: 420, points: [] },
  { id: "caixian", name: "蔡", country: "楚", type: "要地", defense: 5, value: 6, x: 500, y: 470, points: [] },
  { id: "pengcheng", name: "彭城", country: "楚", type: "边城", defense: 6, value: 7, x: 610, y: 420, points: [] },
  { id: "jiangxia", name: "江夏", country: "楚", type: "水陆", defense: 5, value: 7, x: 320, y: 500, points: [] },
  { id: "kuaiji", name: "会稽", country: "楚", type: "远郡", defense: 5, value: 6, x: 640, y: 500, points: [] },
  { id: "hengshan", name: "衡山", country: "楚", type: "山地", defense: 6, value: 5, x: 230, y: 500, points: [] },
  { id: "cangwu", name: "苍梧", country: "楚", type: "远郡", defense: 5, value: 5, x: 130, y: 510, points: [] },
  { id: "wu", name: "吴", country: "楚", type: "水乡", defense: 5, value: 7, x: 220, y: 430, points: [] },
  { id: "langya", name: "琅琊", country: "齐", type: "海城", defense: 5, value: 6, x: 650, y: 230, points: [] },
  { id: "e", name: "阿", country: "齐", type: "粮仓", defense: 5, value: 6, x: 600, y: 350, points: [] },
  { id: "xue", name: "薛", country: "齐", type: "商邑", defense: 5, value: 6, x: 560, y: 420, points: [] },
  { id: "yunzhong", name: "云中", country: "赵", type: "边郡", defense: 6, value: 6, x: 250, y: 70, points: [] },
  { id: "yanmen", name: "雁门", country: "赵", type: "险关", defense: 8, value: 7, x: 320, y: 70, points: [] },
  { id: "wuan", name: "武安", country: "赵", type: "要塞", defense: 7, value: 7, x: 360, y: 240, points: [] },
  { id: "suanzao", name: "酸枣", country: "魏", type: "边城", defense: 5, value: 5, x: 520, y: 330, points: [] },
  { id: "guzhu", name: "孤竹", country: "燕", type: "边城", defense: 5, value: 5, x: 540, y: 60, points: [] },
];

const countryCenters = {
  秦: [134, 282],
  楚: [390, 406],
  齐: [582, 194],
  赵: [356, 158],
  魏: [394, 258],
  韩: [316, 320],
  燕: [526, 82],
};

const mosaicRows = [
  ["longxi", "beidi", "yunzhong", "yanmen", "dai", "guzhu", "yuyang", "liaodong"],
  ["yong", "shangjun", "jinyang", "zhongshan", "wuyang", "ji", "yidu", "jimo"],
  ["xianyang", "hexi", "changping", "wuan", "handan", "gaotang", "linzi", "langya"],
  ["ba", "hanzhong", "yiyang", "shangdang", "hexinei", "ye", "pinglu", "ju"],
  ["shu", "hangu", "xinzheng", "yangdi", "anyang", "daliang", "puyang", "e"],
  ["qianzhong", "wu", "nanyang", "wan", "ying", "chen", "xue", "pengcheng"],
  ["cangwu", "hengshan", "jiangxia", "jiangling", "caixian", "shouchun", "kuaiji", "suanzao"],
];

const eraOwnershipOverrides = {
  early: {
    nanyang: "韩",
    wuan: "魏",
    zhongshan: "燕",
  },
  middle: {
    nanyang: "楚",
    zhongshan: "赵",
    wuan: "赵",
    suanzao: "魏",
  },
  late: {
    yiyang: "秦",
    shangdang: "秦",
    changping: "秦",
    wuan: "秦",
    nanyang: "秦",
    wan: "秦",
    ying: "秦",
    jiangling: "秦",
    qianzhong: "秦",
    anyang: "秦",
    hexinei: "秦",
    yangdi: "韩",
    zhongshan: "赵",
    suanzao: "魏",
    chen: "楚",
    shouchun: "楚",
  },
};

function initialOwnersForEra(eraId) {
  const owners = {};
  cities.forEach((city) => {
    owners[city.id] = city.country;
  });
  Object.entries(eraOwnershipOverrides[eraId] || {}).forEach(([cityId, owner]) => {
    owners[cityId] = owner;
  });
  return owners;
}

function initialCountForCountry(country, owners = null) {
  const initialOwners = owners || state?.initialOwners;
  if (initialOwners) return cities.filter((city) => initialOwners[city.id] === country).length;
  return cities.filter((city) => city.country === country).length;
}

function eraMapHint(eraId) {
  const owners = initialOwnersForEra(eraId);
  const counts = Object.keys(countries)
    .map((name) => `${name}${initialCountForCountry(name, owners)}`)
    .join(" ");
  return `起始城数：${counts}`;
}

function mosaicVertex(col, row) {
  const jitterX = [0, 7, -5, 4, -7, 5][(col * 2 + row) % 6];
  const jitterY = [0, -6, 5, -3, 6, -4][(row * 3 + col) % 6];
  const edgeX = col === 0 || col === 8 ? 0 : jitterX;
  const edgeY = row === 0 || row === 7 ? 0 : jitterY;
  return [24 + col * 84 + edgeX, 34 + row * 72 + edgeY];
}

function applyMosaicLayout() {
  const byId = Object.fromEntries(cities.map((city) => [city.id, city]));
  mosaicRows.forEach((rowItems, row) => {
    rowItems.forEach((id, col) => {
      const city = byId[id];
      const points = [
        mosaicVertex(col, row),
        mosaicVertex(col + 1, row),
        mosaicVertex(col + 1, row + 1),
        mosaicVertex(col, row + 1),
      ];
      city.points = points;
      city.x = Math.round(points.reduce((sum, point) => sum + point[0], 0) / points.length);
      city.y = Math.round(points.reduce((sum, point) => sum + point[1], 0) / points.length);
    });
  });

  Object.keys(countryCenters).forEach((country) => {
    const owned = cities.filter((city) => city.country === country);
    countryCenters[country] = [
      Math.round(owned.reduce((sum, city) => sum + city.x, 0) / owned.length),
      Math.round(owned.reduce((sum, city) => sum + city.y, 0) / owned.length),
    ];
  });
}

applyMosaicLayout();

const universalEvents = [
  {
    id: "grain_tax",
    type: "内政",
    title: "仓廪告急",
    text: "连岁用兵，府库渐空。少府请增田赋，廷尉请裁冗官，乡老则愿缓征以安民。",
    choices: [
      { text: "加赋一年，以充军国", risk: 0.18, effects: { economy: 12, hearts: -9, court: -2 }, chronicle: "王加赋一年，府库稍实，而民间多怨。" },
      { text: "裁省冗官，节用度支", risk: 0.32, effects: { economy: 7, court: 7, diplomacy: -2 }, chronicle: "王裁省冗官，朝中震动，度支乃宽。" },
      { text: "开仓贷民，缓取其利", risk: 0.22, effects: { hearts: 10, economy: -7, court: 3 }, chronicle: "王开仓贷民，民心归附，府库为之一虚。" },
    ],
  },
  {
    id: "border_raid",
    type: "边患",
    title: "边邑被掠",
    text: "{enemy}骑卒犯边，夺牛马而去。将军请追，御史请固守，行人请以币责其君。",
    choices: [
      { text: "遣锐士追击，示不可犯", risk: 0.38, effects: { military: 8, economy: -5, hearts: 2 }, attack: true, chronicle: "王遣锐士追击，边人壮之，军费亦耗。" },
      { text: "筑垒修防，待其再来", risk: 0.12, effects: { military: 3, economy: -4, court: 5 }, chronicle: "王修边垒，贼不敢深入，然士气未振。" },
      { text: "遣使责问，勿开大战", risk: 0.28, effects: { diplomacy: 8, hearts: -3, military: -2 }, chronicle: "王遣使责问，兵戈暂息，边民犹疑。" },
    ],
  },
  {
    id: "talent_arrives",
    type: "人才",
    title: "客卿叩关",
    text: "有游士自称知强国之术，愿以十策干君。群臣疑其来历，太子傅言可一试。",
    choices: [
      { text: "破格拜用，听其变法", risk: 0.42, effects: { court: 12, military: 5, hearts: -6 }, chronicle: "王拜客卿，法令骤新，国中有喜有惧。" },
      { text: "置于幕府，观其所能", risk: 0.18, effects: { court: 6, diplomacy: 3, economy: -2 }, chronicle: "王置客卿幕府，试其才而未尽用。" },
      { text: "厚赐遣归，勿扰旧制", risk: 0.08, effects: { hearts: 4, court: -4, diplomacy: 2 }, chronicle: "王厚赐游士，朝局安而新政止。" },
    ],
  },
  {
    id: "noble_plot",
    type: "朝堂",
    title: "宗室夜议",
    text: "宗室贵戚私会于第，言新令伤旧恩。内侍得其辞，问是否穷治。",
    choices: [
      { text: "穷治首恶，以明君威", risk: 0.44, effects: { court: 10, hearts: -8, diplomacy: -3 }, chronicle: "王穷治宗室，朝令遂行，而亲贵离心。" },
      { text: "召而抚之，许以爵禄", risk: 0.22, effects: { hearts: 3, economy: -7, court: 2 }, chronicle: "王抚宗室，爵禄稍耗，怨议暂止。" },
      { text: "佯作不知，暗察其党", risk: 0.36, effects: { diplomacy: 3, court: 7, military: -3 }, chronicle: "王暗察其党，得失未彰，朝中多惧。" },
    ],
  },
  {
    id: "alliance_offer",
    type: "外交",
    title: "{neighbor}请盟",
    text: "{neighbor}遣使奉璧，愿与我国结盟以抗{enemy}。群臣或言可借其势，或言受盟即受怨。",
    choices: [
      { text: "歃血为盟，共拒强邻", risk: 0.3, effects: { diplomacy: 10, economy: -4 }, relation: { target: "neighbor", delta: 24 }, policy: { id: "ally_neighbor", name: "与{neighbor}结盟", duration: 5, ally: "neighbor", effectsPerTurn: { diplomacy: 1, economy: -1 }, relationPerTurn: [{ target: "neighbor", delta: 5 }] }, chronicle: "王与邻国盟，诸侯闻而侧目。" },
      { text: "受璧不盟，留其余地", risk: 0.16, effects: { diplomacy: 4, economy: 3 }, relation: { target: "neighbor", delta: 8 }, chronicle: "王受璧而不盟，进退尚可。" },
      { text: "拒其使，免卷入兵祸", risk: 0.2, effects: { hearts: 3, diplomacy: -6 }, relation: { target: "neighbor", delta: -12 }, policy: { id: "guard_neighbor", name: "戒备{neighbor}", duration: 5, enemy: "neighbor", effectsPerTurn: { military: 1, diplomacy: -1 }, relationPerTurn: [{ target: "neighbor", delta: -4 }] }, chronicle: "王拒盟使，国中暂安，邻国怨之。" },
    ],
  },
  {
    id: "famine",
    type: "民生",
    title: "岁饥民徙",
    text: "秋收不登，野有流民。司农请闭粜保仓，令尹请赈济收心。",
    choices: [
      { text: "开仓赈饥，许民复业", risk: 0.2, effects: { hearts: 14, economy: -12, court: 2 }, chronicle: "王开仓赈饥，民复其业，府库大损。" },
      { text: "平粜限购，缓济其急", risk: 0.14, effects: { hearts: 6, economy: -5, court: 4 }, chronicle: "王平粜限购，饥民稍安。" },
      { text: "徙民实边，以饥为兵", risk: 0.48, effects: { military: 9, economy: 4, hearts: -12 }, chronicle: "王徙饥民实边，边备增而怨声起。" },
    ],
  },
  {
    id: "spy_case",
    type: "密报",
    title: "间者入市",
    text: "市中获{enemy}间者，供称我国大夫亦通其书。廷尉请连坐，客卿请反用其间。",
    choices: [
      { text: "连坐穷捕，宁枉勿纵", risk: 0.4, effects: { court: 9, hearts: -10, diplomacy: -4 }, chronicle: "王穷捕间党，法网峻急，民多不安。" },
      { text: "反间其国，借刀乱敌", risk: 0.5, effects: { diplomacy: 6, military: 8, economy: -5 }, chronicle: "王反用其间，敌国疑惧，我亦费资。" },
      { text: "只诛明犯，勿扰百姓", risk: 0.14, effects: { hearts: 5, court: -2 }, chronicle: "王只诛明犯，市井遂安，廷尉以为宽。" },
    ],
  },
  {
    id: "canal",
    type: "工程",
    title: "水渠之议",
    text: "工师言可凿渠通田，三年乃成。将军言兵事方急，不宜劳民。",
    choices: [
      { text: "发徒凿渠，富国在后", risk: 0.34, effects: { economy: 13, hearts: -7, court: 3 }, chronicle: "王发徒凿渠，民劳而田利渐兴。" },
      { text: "缓工一年，先养民力", risk: 0.1, effects: { hearts: 6, economy: 2, military: -2 }, chronicle: "王缓工养民，国中称便，富强稍迟。" },
      { text: "使豪族出资，许以盐铁", risk: 0.46, effects: { economy: 10, court: -8, diplomacy: 2 }, chronicle: "王使豪族出资，渠成有望，而权门益重。" },
    ],
  },
  {
    id: "campaign_window",
    type: "征伐",
    title: "{enemy}内乱",
    text: "{enemy}君臣相疑，边城守备松弛。大将请乘隙取地，太史言师出无名恐失诸侯心。",
    choices: [
      { text: "乘乱进兵，取其边城", risk: 0.52, effects: { military: 6, economy: -7, diplomacy: -8 }, attack: true, policy: { id: "war_enemy", name: "专攻{enemy}", duration: 5, enemy: "enemy", effectsPerTurn: { military: 2, economy: -2, diplomacy: -1 }, relationPerTurn: [{ target: "enemy", delta: -5 }] }, chronicle: "王乘乱进兵，天下议其利而薄其义。" },
      { text: "陈兵境上，逼其献地", risk: 0.36, effects: { diplomacy: -3, military: 4, economy: 2 }, attack: true, chronicle: "王陈兵境上，敌国惧而边境震动。" },
      { text: "遣使调停，换取盟约", risk: 0.22, effects: { diplomacy: 9, economy: 3, military: -3 }, relation: { target: "enemy", delta: 12 }, policy: { id: "truce_enemy", name: "与{enemy}议和", duration: 5, ally: "enemy", effectsPerTurn: { diplomacy: 2, military: -1, economy: 1 }, relationPerTurn: [{ target: "enemy", delta: 4 }] }, chronicle: "王遣使调停，取名于诸侯。" },
    ],
  },
  {
    id: "ritual",
    type: "礼制",
    title: "周室来使",
    text: "周室微弱，仍遣使求贡。群臣或笑其虚名，或言名器不可轻。",
    choices: [
      { text: "厚贡周室，取尊王之名", risk: 0.08, effects: { diplomacy: 7, economy: -5, hearts: 2 }, chronicle: "王厚贡周室，诸侯称其知礼。" },
      { text: "薄礼遣使，名实两全", risk: 0.12, effects: { diplomacy: 3, economy: -1 }, chronicle: "王薄礼周室，不失其名。" },
      { text: "拒贡自尊，示诸侯新命", risk: 0.38, effects: { military: 5, diplomacy: -8, court: 4 }, chronicle: "王拒贡周室，强者悦，守礼者惧。" },
    ],
  },
];

const militaryEvents = [
  {
    id: "military_border_push",
    type: "征伐",
    title: "边城可取",
    text: "{enemy}边城守将新丧，军吏请急攻。相国言攻城虽利，若久围不下，财赋与民心皆伤。",
    choices: [
      { text: "急攻边城，夺其门户", risk: 0.46, effects: { military: 8, economy: -7, hearts: -3, diplomacy: -7 }, attack: true, chronicle: "王急攻边城，兵锋甚锐。" },
      { text: "围而不攻，逼其自乱", risk: 0.34, effects: { military: 4, economy: -4, diplomacy: -3 }, attack: true, chronicle: "王围城不攻，待敌自乱。" },
      { text: "罢兵修备，留待来年", risk: 0.12, effects: { military: 4, economy: 3, hearts: 2 }, chronicle: "王罢兵修备，边境暂宁。" },
    ],
  },
  {
    id: "military_joint_campaign",
    type: "合兵",
    title: "{neighbor}约共伐{enemy}",
    text: "{neighbor}使者入朝，愿共伐{enemy}，胜则分地。此举可借盟友之力，亦可能为他人作嫁。",
    choices: [
      { text: "合兵伐敌，约分其地", risk: 0.42, effects: { diplomacy: 6, military: 6, economy: -7 }, attack: true, relation: { target: "neighbor", delta: 10 }, policy: { id: "joint_war", name: "联{neighbor}攻{enemy}", duration: 5, enemy: "enemy", ally: "neighbor", effectsPerTurn: { military: 2, diplomacy: 1, economy: -2 }, relationPerTurn: [{ target: "neighbor", delta: 3 }, { target: "enemy", delta: -5 }] }, chronicle: "王与邻国合兵，约分敌地。" },
      { text: "只出偏师，取近城便还", risk: 0.32, effects: { military: 4, economy: -4, diplomacy: -2 }, attack: true, chronicle: "王出偏师取利，不肯深入。" },
      { text: "拒其约，防盟友坐大", risk: 0.18, effects: { court: 3, diplomacy: -5, economy: 3 }, relation: { target: "neighbor", delta: -10 }, chronicle: "王拒共伐之约，盟情转薄。" },
    ],
  },
  {
    id: "military_counterattack",
    type: "反攻",
    title: "失地可复",
    text: "旧臣请复昔日失城，言民心尚向故国。将军愿为先锋，司农忧军粮不足。",
    choices: [
      { text: "举兵复城，慰国人心", risk: 0.5, effects: { hearts: 5, military: 7, economy: -8 }, attack: true, chronicle: "王举兵复城，国人望之。" },
      { text: "遣间入城，先乱其守", risk: 0.44, effects: { court: 4, diplomacy: -4, economy: -3 }, attack: true, chronicle: "王遣间入城，欲不战而取。" },
      { text: "祭告宗庙，暂忍其辱", risk: 0.1, effects: { hearts: 4, economy: 4, military: -2 }, chronicle: "王祭告宗庙，暂忍失地之辱。" },
    ],
  },
  {
    id: "military_enemy_pressure",
    type: "守土",
    title: "{enemy}陈兵境上",
    text: "{enemy}大军压境，求我割一城以退兵。朝中主战主和相争，百姓已闻烽烟。",
    choices: [
      { text: "出兵迎战，勿割寸土", risk: 0.54, effects: { military: 9, economy: -8, hearts: 4 }, attack: true, policy: { id: "hard_war", name: "与{enemy}交兵", duration: 5, enemy: "enemy", effectsPerTurn: { military: 2, economy: -2, hearts: -1 }, relationPerTurn: [{ target: "enemy", delta: -6 }] }, chronicle: "王出兵迎敌，不肯割寸土。" },
      { text: "献边城，保社稷根本", risk: 0.2, effects: { diplomacy: 4, military: -2, hearts: -9 }, loseCity: true, policy: { id: "appease_enemy", name: "与{enemy}休兵", duration: 5, ally: "enemy", effectsPerTurn: { diplomacy: 2, economy: 1, military: -1 }, relationPerTurn: [{ target: "enemy", delta: 5 }] }, chronicle: "王献边城以退敌，社稷暂安。" },
      { text: "遣使拖延，暗调援军", risk: 0.38, effects: { diplomacy: 7, economy: -4, court: 3 }, relation: { target: "enemy", delta: -5 }, chronicle: "王遣使拖延，暗调援军。" },
    ],
  },
  {
    id: "military_general_glory",
    type: "将权",
    title: "大将请战",
    text: "大将连胜而名重，愿乘势再攻。若许之，或可拓地；若不许，恐其部曲怨望。",
    choices: [
      { text: "许其再战，以功压敌", risk: 0.48, effects: { military: 10, economy: -7, court: -4 }, attack: true, chronicle: "王许大将再战，军中欢呼。" },
      { text: "召还大将，分其兵权", risk: 0.36, effects: { court: 8, military: -5, hearts: -2 }, chronicle: "王召还大将，兵权归朝，军心稍沮。" },
      { text: "厚赏而止兵，养威不用", risk: 0.16, effects: { hearts: 3, economy: -5, military: 3 }, chronicle: "王厚赏大将而止兵，威名仍在。" },
    ],
  },
  {
    id: "military_raze_or_hold",
    type: "占领",
    title: "新取之城不服",
    text: "新取城邑豪强闭门，旧民暗通故国。将军请徙民实之，县令请宽赋三年。",
    choices: [
      { text: "徙民实城，断其旧望", risk: 0.4, effects: { court: 7, military: 4, hearts: -9 }, chronicle: "王徙民实城，新地可控，旧民多怨。" },
      { text: "宽赋三年，收其民心", risk: 0.24, effects: { hearts: 9, economy: -7, diplomacy: 2 }, chronicle: "王宽新城之赋，民渐安堵。" },
      { text: "驻军镇守，暂不更制", risk: 0.3, effects: { military: 5, economy: -4, court: 2 }, chronicle: "王驻军镇守，新城未乱，耗费亦多。" },
    ],
  },
  {
    id: "military_grain_road",
    type: "袭粮",
    title: "{enemy}粮道外露",
    text: "{enemy}大军在外，粮车绵延。袭其粮道可不战而乱敌，但若被伏，前军必损。",
    choices: [
      { text: "夜袭粮道，乱其军心", risk: 0.44, effects: { military: 7, economy: -4, diplomacy: -4 }, attack: true, chronicle: "王命夜袭粮道，敌军震动。" },
      { text: "佯攻正面，诱其分兵", risk: 0.36, effects: { military: 5, court: 3, economy: -5 }, attack: true, chronicle: "王佯攻正面，使敌分兵。" },
      { text: "固守关隘，待其粮尽", risk: 0.18, effects: { military: 4, economy: 2, hearts: -2 }, chronicle: "王固守关隘，待敌粮尽。" },
    ],
  },
  {
    id: "military_fortress_choice",
    type: "攻城",
    title: "坚城当前",
    text: "{enemy}有坚城挡路。强攻最快，围困最稳，买通守将则省兵却伤名。",
    choices: [
      { text: "强攻坚城，速决胜负", risk: 0.58, effects: { military: 10, economy: -10, hearts: -4 }, attack: true, chronicle: "王强攻坚城，胜负系于一日。" },
      { text: "围城断粮，缓取其地", risk: 0.34, effects: { military: 5, economy: -7, court: 2 }, attack: true, chronicle: "王围城断粮，缓缓逼降。" },
      { text: "重金买将，开门纳城", risk: 0.48, effects: { economy: -9, diplomacy: -5, court: 4 }, attack: true, chronicle: "王重金买通守将，城门或开，名声亦损。" },
    ],
  },
  {
    id: "military_rebel_border",
    type: "叛城",
    title: "{enemy}边城请降",
    text: "{enemy}边城不满其君，暗遣人请降。受降可得城，若是诱饵，则军心受挫。",
    choices: [
      { text: "纳其请降，疾取边城", risk: 0.46, effects: { military: 6, court: 4, diplomacy: -6 }, attack: true, chronicle: "王纳边城请降，兵入其地。" },
      { text: "先遣密探，验其真假", risk: 0.26, effects: { court: 6, economy: -3 }, attack: true, chronicle: "王先遣密探，察其虚实。" },
      { text: "拒其请降，免中敌计", risk: 0.12, effects: { military: 2, diplomacy: 2, hearts: 2 }, chronicle: "王拒纳降城，边境无事。" },
    ],
  },
  {
    id: "military_weak_neighbor",
    type: "吞并",
    title: "小邑无主",
    text: "{enemy}内乱，边上一邑无人统领。取之易，守之难，诸国也会看在眼里。",
    choices: [
      { text: "即刻出兵，收入版图", risk: 0.38, effects: { military: 5, economy: -4, diplomacy: -5 }, attack: true, chronicle: "王乘乱取邑，版图稍广。" },
      { text: "扶立傀儡，暗握其地", risk: 0.48, effects: { diplomacy: 4, court: 5, economy: -5 }, attack: true, chronicle: "王扶立其邑新主，实握其地。" },
      { text: "暂不吞并，令其纳贡", risk: 0.2, effects: { economy: 6, diplomacy: 2, military: -2 }, chronicle: "王不吞其地，令其纳贡称臣。" },
    ],
  },
  {
    id: "military_coalition_against_strong",
    type: "合纵",
    title: "诸国畏强",
    text: "{enemy}近年拓地太急，诸国皆惧。若我国出面合兵，可借众力削其锋。",
    choices: [
      { text: "合诸国之兵，共攻强敌", risk: 0.5, effects: { diplomacy: 8, military: 7, economy: -8 }, attack: true, policy: { id: "coalition_enemy", name: "合纵攻{enemy}", duration: 5, enemy: "enemy", ally: "ally", effectsPerTurn: { diplomacy: 2, military: 1, economy: -2 }, relationPerTurn: [{ target: "ally", delta: 4 }, { target: "enemy", delta: -5 }] }, chronicle: "王合诸国之兵，共攻强敌。" },
      { text: "只供粮草，借他国厮杀", risk: 0.28, effects: { diplomacy: 6, economy: -5, military: 2 }, chronicle: "王供粮助战，坐观诸国相攻。" },
      { text: "暗通强敌，两边取利", risk: 0.56, effects: { economy: 8, diplomacy: -10, court: 3 }, relation: { target: "enemy", delta: 12 }, chronicle: "王暗通强敌，暂得其利，诸国疑我。" },
    ],
  },
  {
    id: "military_mountain_pass",
    type: "夺关",
    title: "险关可夺",
    text: "{enemy}守关兵少。夺关则门户大开；若久攻不下，师老于山道。",
    choices: [
      { text: "轻兵夜上，夺其险关", risk: 0.52, effects: { military: 9, economy: -5, hearts: -2 }, attack: true, chronicle: "王遣轻兵夜上，欲夺险关。" },
      { text: "筑营逼关，稳步推进", risk: 0.32, effects: { military: 5, economy: -6, court: 2 }, attack: true, chronicle: "王筑营逼关，步步推进。" },
      { text: "绕道袭后，赌其不备", risk: 0.6, effects: { military: 12, economy: -7, diplomacy: -3 }, attack: true, chronicle: "王绕道袭后，以奇兵赌胜。" },
    ],
  },
  {
    id: "military_cavalry_reform",
    type: "练兵",
    title: "骑兵新法",
    text: "边将献骑战新法。练成可快攻远袭，但耗马耗粮，旧军也会不满。",
    choices: [
      { text: "重练骑兵，准备远袭", risk: 0.34, effects: { military: 11, economy: -8, hearts: -3 }, chronicle: "王重练骑兵，军势渐锐。" },
      { text: "只练精骑，保步卒旧制", risk: 0.2, effects: { military: 6, economy: -4, court: 2 }, chronicle: "王只练精骑，新旧军制并行。" },
      { text: "暂缓练骑，先足粮马", risk: 0.12, effects: { economy: 5, military: -2, hearts: 2 }, chronicle: "王暂缓练骑，先养粮马。" },
    ],
  },
  {
    id: "military_failed_ally",
    type: "救盟",
    title: "{ally}战败求援",
    text: "{ally}新败，遣使求救。救之可守盟约，不救则可趁其虚弱取利。",
    choices: [
      { text: "出兵救盟，稳住诸国信义", risk: 0.4, effects: { diplomacy: 9, military: 4, economy: -7 }, attack: true, relation: { target: "ally", delta: 14 }, chronicle: "王出兵救盟，诸国称其守信。" },
      { text: "借道救援，顺取边城", risk: 0.52, effects: { military: 8, diplomacy: -6, economy: -5 }, attack: true, chronicle: "王借救盟之名，顺取边城。" },
      { text: "只送粮，不发兵", risk: 0.18, effects: { diplomacy: 5, economy: -4, military: 1 }, relation: { target: "ally", delta: 8 }, chronicle: "王只送粮草，不动大兵。" },
    ],
  },
  {
    id: "military_capital_road",
    type: "逼都",
    title: "兵临都畿",
    text: "{enemy}都城外郡空虚。若直逼都畿，或可震动其国；若失手，诸军难返。",
    choices: [
      { text: "直逼都畿，一战震国", risk: 0.64, effects: { military: 13, economy: -10, diplomacy: -7 }, attack: true, chronicle: "王直逼敌国都畿，天下震动。" },
      { text: "先取外郡，缓逼其都", risk: 0.4, effects: { military: 7, economy: -6, diplomacy: -4 }, attack: true, chronicle: "王先取外郡，渐逼其都。" },
      { text: "止于边境，迫其割地", risk: 0.3, effects: { economy: 4, military: 3, diplomacy: -2 }, attack: true, chronicle: "王止兵边境，迫敌割地。" },
    ],
  },
  {
    id: "military_winter_campaign",
    type: "冬战",
    title: "冬日可袭",
    text: "冬日苦寒，诸军多归营。此时出兵可出其不意，也最伤士卒。",
    choices: [
      { text: "冒寒出兵，奇袭敌境", risk: 0.58, effects: { military: 10, economy: -7, hearts: -7 }, attack: true, chronicle: "王冒寒出兵，奇袭敌境。" },
      { text: "小股骚扰，不求大胜", risk: 0.3, effects: { military: 5, economy: -3, hearts: -2 }, attack: true, chronicle: "王遣小股兵骚扰敌境。" },
      { text: "休兵过冬，养卒蓄锐", risk: 0.1, effects: { military: 3, hearts: 4, economy: 2 }, chronicle: "王休兵过冬，养卒蓄锐。" },
    ],
  },
  {
    id: "military_river_crossing",
    type: "渡河",
    title: "大河可渡",
    text: "{enemy}以河为险，守军自恃天堑。若夜渡成功，可直入腹地；若舟楫失序，精兵尽丧。",
    choices: [
      { text: "夜渡奇袭，直趋敌后", risk: 0.6, effects: { military: 12, economy: -8, hearts: -3, diplomacy: -5 }, attack: true, chronicle: "王命舟师夜渡，欲破敌腹心。" },
      { text: "筑浮桥，重兵压渡口", risk: 0.42, effects: { military: 7, economy: -9, court: 2 }, attack: true, chronicle: "王筑浮桥压渡，军声震河上。" },
      { text: "佯渡诱敌，另取边邑", risk: 0.34, effects: { military: 5, economy: -4, diplomacy: -3 }, attack: true, chronicle: "王佯渡大河，暗取敌边邑。" },
    ],
  },
  {
    id: "military_two_fronts",
    type: "两线",
    title: "两面烽烟",
    text: "{enemy}扰我一境，另一邻国亦蠢动。分兵可保全，集中一路则有破局之机。",
    choices: [
      { text: "分兵两路，各守要害", risk: 0.38, effects: { military: 5, economy: -7, court: 4 }, chronicle: "王分兵两路，诸边皆有备。" },
      { text: "弃一隅，聚兵痛击{enemy}", risk: 0.56, effects: { military: 11, hearts: -6, diplomacy: -5 }, attack: true, loseCity: true, chronicle: "王弃小隅以聚兵，痛击{enemy}。" },
      { text: "请盟国牵制，许以战利", risk: 0.46, effects: { diplomacy: 8, economy: -5, military: 3 }, attack: true, relation: { target: "ally", delta: 12 }, chronicle: "王请盟国牵制敌势，许以战利。" },
    ],
  },
  {
    id: "military_veteran_reward",
    type: "军功",
    title: "老卒求赏",
    text: "老卒冒死取城，军中皆望重赏。厚赏可激军心，薄赏可保府库，却恐士卒寒心。",
    choices: [
      { text: "按功赐田，军心大振", risk: 0.24, effects: { military: 10, economy: -8, hearts: 3 }, chronicle: "王按功赐田，军中皆奋。" },
      { text: "赐爵不赐田，留财备战", risk: 0.34, effects: { military: 5, court: 5, economy: -3 }, chronicle: "王赐爵慰军，府库尚可支撑。" },
      { text: "严禁邀功，归功朝廷", risk: 0.5, effects: { court: 8, military: -8, hearts: -3 }, chronicle: "王禁军中邀功，法度立而士气折。" },
    ],
  },
  {
    id: "military_siege_engine",
    type: "攻具",
    title: "攻城器成",
    text: "工匠造云梯、冲车，请试于{enemy}坚城。成则破城甚速，败则器械尽焚。",
    choices: [
      { text: "尽出攻具，强破坚城", risk: 0.58, effects: { military: 13, economy: -11, hearts: -4 }, attack: true, chronicle: "王尽出攻具，强攻敌城。" },
      { text: "先试小城，稳验器械", risk: 0.34, effects: { military: 6, economy: -6, court: 3 }, attack: true, chronicle: "王先试小城，器械渐熟。" },
      { text: "藏器不用，待大战时", risk: 0.16, effects: { military: 4, economy: -2, court: 2 }, chronicle: "王藏攻具不用，待天下大变。" },
    ],
  },
  {
    id: "military_conscription",
    type: "征发",
    title: "急征壮丁",
    text: "前线缺兵，郡县可再征壮丁。军数虽增，田亩必荒，民间亦有怨色。",
    choices: [
      { text: "大征壮丁，今岁必战", risk: 0.48, effects: { military: 14, economy: -10, hearts: -12 }, attack: true, chronicle: "王大征壮丁，军数骤增。" },
      { text: "只征边郡，内地休养", risk: 0.28, effects: { military: 7, economy: -5, hearts: -4 }, chronicle: "王只征边郡，内地稍安。" },
      { text: "募勇士，以爵赏诱之", risk: 0.38, effects: { military: 9, economy: -7, court: -3 }, chronicle: "王募勇士从军，以爵赏激之。" },
    ],
  },
  {
    id: "military_field_battle",
    type: "决战",
    title: "平原会战",
    text: "{enemy}主力出营，愿与我军决战。胜则敌胆尽破，败则边境洞开。",
    choices: [
      { text: "列阵决战，赌一日胜负", risk: 0.64, effects: { military: 15, economy: -10, hearts: -5 }, attack: true, fatalOnFail: true, chronicle: "王列阵决战，旌旗蔽野。" },
      { text: "坚壁不战，待其粮尽", risk: 0.28, effects: { military: 5, economy: -4, hearts: -2 }, chronicle: "王坚壁不战，敌师渐疲。" },
      { text: "遣轻骑绕后，断其归路", risk: 0.52, effects: { military: 11, economy: -6, diplomacy: -3 }, attack: true, chronicle: "王遣轻骑绕后，断敌归路。" },
    ],
  },
  {
    id: "military_city_exchange",
    type: "换地",
    title: "{enemy}愿换城",
    text: "{enemy}遣使言愿以远城换我近邑。此举可调边防，也可能是割裂我国形势的计策。",
    choices: [
      { text: "受其换城，重整边界", risk: 0.3, effects: { diplomacy: 5, court: 4, military: -2 }, loseCity: true, attack: true, chronicle: "王受换城之议，边界一变。" },
      { text: "索取两城，方可议换", risk: 0.48, effects: { military: 5, diplomacy: -7, economy: -2 }, attack: true, chronicle: "王索地甚急，敌使色变。" },
      { text: "拒绝换地，严守旧疆", risk: 0.18, effects: { court: 3, military: 3, diplomacy: -3 }, chronicle: "王拒换城，边防如故。" },
    ],
  },
  {
    id: "military_defector_general",
    type: "降将",
    title: "{enemy}将军来奔",
    text: "{enemy}将军失宠，携军图来奔。用之可知敌虚实，不用则少一祸根。",
    choices: [
      { text: "授兵为前导，攻其旧主", risk: 0.56, effects: { military: 12, diplomacy: -8, court: -4 }, attack: true, chronicle: "王用降将为前导，兵指其旧主。" },
      { text: "留其图籍，夺其部曲", risk: 0.38, effects: { court: 8, military: 5, hearts: -3 }, chronicle: "王夺降将部曲，尽取其图籍。" },
      { text: "厚赐闲居，不使掌兵", risk: 0.18, effects: { diplomacy: 3, economy: -3, court: 3 }, chronicle: "王厚赐降将，使闲居都中。" },
    ],
  },
  {
    id: "military_frontier_revolt",
    type: "边乱",
    title: "边郡兵变",
    text: "边郡久戍，士卒思归，军吏又克其粮。若处置失当，边城恐失。",
    choices: [
      { text: "诛军吏，厚赐戍卒", risk: 0.28, effects: { military: 5, economy: -7, hearts: 4, court: -2 }, chronicle: "王诛贪吏、赐戍卒，边军稍安。" },
      { text: "以新军替防，旧卒归田", risk: 0.36, effects: { hearts: 6, economy: -5, military: -2 }, chronicle: "王替换边军，旧卒得归。" },
      { text: "严令镇压，不许军乱", risk: 0.54, effects: { court: 8, military: 4, hearts: -10 }, loseCity: true, chronicle: "王严令镇压，边郡震恐。" },
    ],
  },
  {
    id: "military_late_hegemony",
    type: "终局",
    title: "诸侯疲敝",
    text: "天下久战，诸侯皆疲。此时进取，或可定霸；稍一失算，百年之积亦会崩解。",
    choices: [
      { text: "倾国一击，求定天下", risk: 0.66, effects: { military: 16, economy: -14, hearts: -10, diplomacy: -8 }, attack: true, fatalOnFail: true, chronicle: "王倾国一击，欲定天下。" },
      { text: "连下近邑，稳成霸业", risk: 0.48, effects: { military: 9, economy: -8, diplomacy: -5 }, attack: true, chronicle: "王连取近邑，霸势渐成。" },
      { text: "会盟诸侯，承认疆界", risk: 0.28, effects: { diplomacy: 12, hearts: 5, military: -4 }, chronicle: "王会盟诸侯，欲以成势定疆。" },
    ],
  },
];

const policyEvents = [
  {
    id: "policy_flood",
    type: "灾害",
    title: "河水冲城",
    text: "大雨坏城，田畴多毁。先修城可保边防，先救民可安人心，二者皆耗国库。",
    choices: [
      { text: "先修城墙，防敌趁乱", risk: 0.18, effects: { military: 5, economy: -6, hearts: -3 }, chronicle: "王先修城墙，边防稳住了，受灾百姓有怨。" },
      { text: "先救百姓，缓修城防", risk: 0.24, effects: { hearts: 10, economy: -8, military: -2 }, chronicle: "王先救百姓，民心回升，城防暂时吃紧。" },
      { text: "令豪族出钱，朝廷赐名", risk: 0.42, effects: { economy: 5, court: -6, hearts: 3 }, chronicle: "王令豪族出钱救灾，事虽办成，地方豪族亦更重。" },
    ],
  },
  {
    id: "policy_trade",
    type: "商路",
    title: "商队请求开关",
    text: "外地商队请过我国关市。开商路可厚国库，也可能让敌国探知虚实。",
    choices: [
      { text: "开关通商，重收关税", risk: 0.3, effects: { economy: 10, diplomacy: 4, court: -2 }, chronicle: "王开关通商，国库稍厚，边关亦难管。" },
      { text: "只许盟国商队入关", risk: 0.18, effects: { economy: 5, diplomacy: 5 }, chronicle: "王限商路，只许可信之国通行。" },
      { text: "闭关守密，少取商税", risk: 0.16, effects: { military: 3, economy: -5, diplomacy: -4 }, chronicle: "王闭关守密，边防稍安，商税遂少。" },
    ],
  },
  {
    id: "policy_hostage",
    type: "外交",
    title: "{neighbor}请送质子",
    text: "{neighbor}愿送公子为质，换两国暂安。受之可稳边境，也可能卷入其国内争位。",
    choices: [
      { text: "接纳质子，换边境安宁", risk: 0.28, effects: { diplomacy: 9, economy: -3 }, relation: { target: "neighbor", delta: 16 }, chronicle: "王接纳质子，边境暂时安定。" },
      { text: "要求割地，再谈和平", risk: 0.48, effects: { military: 4, diplomacy: -5 }, attack: true, chronicle: "王要求割地才肯议和，局势更紧。" },
      { text: "拒收质子，不入其局", risk: 0.14, effects: { court: 3, diplomacy: -3 }, relation: { target: "neighbor", delta: -8 }, chronicle: "王拒收质子，少一分牵连，也少一枚筹码。" },
    ],
  },
  {
    id: "policy_assassin",
    type: "刺客",
    title: "刺客被擒",
    text: "宫门外擒得刺客，自称受{enemy}指使。可借此报复，也可持证据与诸国周旋。",
    choices: [
      { text: "立刻报复，攻其边城", risk: 0.5, effects: { military: 8, economy: -6, diplomacy: -8 }, attack: true, chronicle: "王以刺客为名发兵报复。" },
      { text: "公开证据，争取各国支持", risk: 0.26, effects: { diplomacy: 9, court: 2, economy: -2 }, chronicle: "王公开证据，各国舆论开始偏向我国。" },
      { text: "暗中交换，赎俘得粮", risk: 0.34, effects: { economy: 6, hearts: 4, diplomacy: -2 }, chronicle: "王暗中交换，得粮赎俘，名声稍损。" },
    ],
  },
  {
    id: "policy_refugees",
    type: "边民",
    title: "{enemy}边民来投",
    text: "{enemy}边地饥荒，民多来投。收之可增户口，也耗粮粟，且敌国必怨。",
    choices: [
      { text: "收留边民，编入户籍", risk: 0.3, effects: { hearts: 7, economy: -5, military: 3, diplomacy: -4 }, chronicle: "王收留边民，户口渐增，敌国亦怨。" },
      { text: "选其壮丁，其余遣返", risk: 0.42, effects: { military: 8, hearts: -5, diplomacy: -5 }, chronicle: "王留壮丁入军，军力增，民间颇有议论。" },
      { text: "设粥棚暂养，缓议去留", risk: 0.18, effects: { hearts: 5, economy: -4, diplomacy: 2 }, chronicle: "王设粥棚暂养边民，局面先稳。" },
    ],
  },
  {
    id: "policy_queen_family",
    type: "外戚",
    title: "王后家族求官",
    text: "王后家族请掌一郡。许之可安宫中，朝臣却忧外戚坐大。",
    choices: [
      { text: "授一郡实权，安宫中", risk: 0.36, effects: { diplomacy: 4, court: -8, hearts: 2 }, chronicle: "王使外戚掌一郡，宫中安，朝臣疑。" },
      { text: "只赐虚爵，不交实权", risk: 0.2, effects: { court: 4, economy: -3 }, chronicle: "王赐外戚虚爵，留其颜面，不交实权。" },
      { text: "明拒其请，公私分明", risk: 0.32, effects: { court: 8, diplomacy: -4, hearts: -2 }, chronicle: "王明拒外戚求官，朝政清楚，宫中不悦。" },
    ],
  },
];

const chainEvents = [
  {
    id: "chain_ally_claims_city",
    type: "盟约",
    title: "{ally}索取战利",
    text: "昔日合兵之后，{ally}使者入朝，称当初有约：得地当分。若拒之，盟约恐裂；若许之，国人必怨。",
    choices: [
      { text: "割一边邑，以全盟约", risk: 0.22, effects: { diplomacy: 8, hearts: -8, military: -2 }, loseCity: true, relation: { target: "ally", delta: 18 }, chronicle: "王割边邑以全旧盟，盟友喜，国人怨。" },
      { text: "厚赐金帛，不割寸土", risk: 0.36, effects: { economy: -9, diplomacy: 3, court: 3 }, relation: { target: "ally", delta: 6 }, chronicle: "王厚赐金帛，暂平盟友之请。" },
      { text: "拒其无礼，整军防变", risk: 0.5, effects: { military: 7, diplomacy: -8, hearts: 2 }, relation: { target: "ally", delta: -18 }, chronicle: "王拒盟友索地，旧盟生裂。" },
    ],
  },
  {
    id: "chain_reform_backlash",
    type: "反扑",
    title: "旧贵反扑",
    text: "前日新法推行太急，宗室旧贵暗中串连。若宽之，法令受损；若杀之，朝中血气更重。",
    choices: [
      { text: "诛其首恶，法不可摇", risk: 0.5, effects: { court: 10, hearts: -10, diplomacy: -3 }, chronicle: "王诛旧贵首恶，法令不摇，怨气更深。" },
      { text: "减其爵禄，留其宗庙", risk: 0.34, effects: { court: 6, economy: 3, hearts: -4 }, chronicle: "王削旧贵爵禄，法存而血少。" },
      { text: "暂缓新令，安抚旧族", risk: 0.2, effects: { hearts: 7, court: -7, diplomacy: 2 }, chronicle: "王暂缓新令，旧族稍安，变法之势亦缓。" },
    ],
  },
  {
    id: "chain_occupied_city",
    type: "新地",
    title: "{city}未稳",
    text: "{city}新入版图，旧吏与豪族仍怀故主。若不处置，城中可能再乱。",
    choices: [
      { text: "迁旧族于内地，另置新吏", risk: 0.44, effects: { court: 8, hearts: -7, economy: -4 }, chronicle: "王迁旧族、置新吏，{city}渐入掌中。" },
      { text: "宽赋三年，留旧吏听用", risk: 0.26, effects: { hearts: 8, economy: -7, court: -2 }, chronicle: "王宽{city}之赋，旧民渐安。" },
      { text: "重兵镇守，先压后抚", risk: 0.36, effects: { military: 5, economy: -5, hearts: -3 }, chronicle: "王重兵镇{city}，乱不敢起，民心未服。" },
    ],
  },
  {
    id: "chain_hostage_claim",
    type: "质子",
    title: "质子归国争位",
    text: "昔日入我国为质的公子，如今要归国争位。助之可得一盟，失败则两国皆怨。",
    choices: [
      { text: "助其归国，扶为新君", risk: 0.52, effects: { diplomacy: 12, economy: -7, military: -3 }, relation: { target: "neighbor", delta: 18 }, chronicle: "王助质子归国争位，诸国观望。" },
      { text: "留而不遣，继续为质", risk: 0.28, effects: { diplomacy: -2, court: 5, hearts: -2 }, relation: { target: "neighbor", delta: -8 }, chronicle: "王留质子不遣，边境仍可牵制。" },
      { text: "送归其国，不问争位", risk: 0.18, effects: { diplomacy: 5, economy: -2 }, relation: { target: "neighbor", delta: 8 }, chronicle: "王送质子归国，不深涉其乱。" },
    ],
  },
  {
    id: "chain_enemy_truce",
    type: "议和",
    title: "{enemy}遣使请和",
    text: "连年攻伐之后，{enemy}遣使请和，愿献币求安。休兵可养民，继续进兵或可再取一城。",
    choices: [
      { text: "受币休兵，养民一年", risk: 0.16, effects: { economy: 8, hearts: 6, military: -2 }, relation: { target: "enemy", delta: 12 }, policy: { id: "recover_truce", name: "休兵养民", duration: 5, ally: "enemy", effectsPerTurn: { economy: 2, hearts: 1, military: -1 }, relationPerTurn: [{ target: "enemy", delta: 3 }] }, chronicle: "王受币休兵，边境稍宁。" },
      { text: "索其割地，方许议和", risk: 0.46, effects: { military: 4, diplomacy: -5, economy: -3 }, attack: true, relation: { target: "enemy", delta: -10 }, chronicle: "王索地议和，兵锋未止。" },
      { text: "拒和追击，求一举破敌", risk: 0.62, effects: { military: 10, economy: -9, hearts: -5, diplomacy: -8 }, attack: true, chronicle: "王拒和追击，欲乘胜破敌。" },
    ],
  },
  {
    id: "chain_general_power",
    type: "将权",
    title: "功臣坐大",
    text: "前线大将因连胜而名重，军中只知将军，不知朝廷。夺其兵权易生变，放任又恐尾大。",
    choices: [
      { text: "召将入朝，夺其兵权", risk: 0.48, effects: { court: 9, military: -7, hearts: -2 }, chronicle: "王召大将入朝，兵权归上，军中不平。" },
      { text: "封侯赐地，使其守边", risk: 0.34, effects: { military: 5, court: -6, economy: -3 }, chronicle: "王封将守边，军心安，边将权重。" },
      { text: "使监军同行，缓收其权", risk: 0.28, effects: { court: 5, military: 1, economy: -2 }, chronicle: "王遣监军同行，渐收将权。" },
    ],
  },
];

const countryEvents = {
  秦: [
    {
      id: "qin_shang_yang",
      type: "变法",
      title: "商君之法",
      text: "法家之士献强秦之术，欲废井田、奖耕战、明军功。宗室切齿，军吏振奋。",
      choices: [
        { text: "尽行新法，破旧贵之权", risk: 0.46, effects: { military: 13, court: 12, hearts: -10, diplomacy: -5 }, chronicle: "王用商君，秦法大行，兵农并作，旧贵多怨。" },
        { text: "先试一郡，观其成败", risk: 0.2, effects: { military: 6, court: 7, hearts: -3 }, chronicle: "王试新法一郡，成效渐见，怨亦可制。" },
        { text: "守旧安宗室，勿遽更张", risk: 0.08, effects: { hearts: 7, court: -6, military: -3 }, chronicle: "王安宗室，新法不行，国势稍缓。" },
      ],
    },
    {
      id: "qin_eastward",
      type: "东出",
      title: "函谷东望",
      text: "函谷以东，韩魏相争。客卿请出兵取河内，以启东进之门。",
      choices: [
        { text: "发兵东出，夺其要地", risk: 0.5, effects: { military: 8, economy: -8, diplomacy: -10 }, attack: true, chronicle: "王出函谷，兵锋东向，诸侯皆惊。" },
        { text: "结魏伐韩，借路取势", risk: 0.35, effects: { diplomacy: 4, economy: -5, military: 4 }, attack: true, chronicle: "王结魏伐韩，得势而失信。" },
        { text: "修关养兵，待山东自敝", risk: 0.12, effects: { military: 5, economy: 5, diplomacy: -2 }, chronicle: "王闭关养兵，秦势内蓄。" },
      ],
    },
  ],
  楚: [
    {
      id: "chu_wu_qi",
      type: "变法",
      title: "吴起在楚",
      text: "吴起言楚地广而政散，欲裁贵族、明赏罚。令尹以为可，宗族大夫皆怒。",
      choices: [
        { text: "任吴起，削封君之权", risk: 0.52, effects: { court: 14, military: 9, hearts: -8 }, chronicle: "王任吴起，楚政一新，贵族怨毒。" },
        { text: "用其兵法，不触封君", risk: 0.24, effects: { military: 7, court: 3, hearts: -2 }, chronicle: "王取吴起兵法，而封君未动。" },
        { text: "罢其急法，以安宗族", risk: 0.1, effects: { hearts: 7, court: -6, economy: 3 }, chronicle: "王罢急法，宗族安，国政仍缓。" },
      ],
    },
    {
      id: "chu_north",
      type: "北伐",
      title: "问鼎中原",
      text: "淮泗诸城愿附，然北上则与魏齐相争。楚将请乘水陆之便，夺中原门户。",
      choices: [
        { text: "北上取城，重振楚威", risk: 0.44, effects: { military: 7, economy: -6, diplomacy: -7 }, attack: true, chronicle: "王北上取城，楚威复振，诸侯戒惧。" },
        { text: "经营江汉，先固根本", risk: 0.14, effects: { economy: 8, hearts: 5, military: -2 }, chronicle: "王经营江汉，国本渐厚。" },
        { text: "联齐制魏，借盟动兵", risk: 0.32, effects: { diplomacy: 9, economy: -5 }, relation: { target: "neighbor", delta: 15 }, chronicle: "王联齐制魏，纵横之势起。" },
      ],
    },
  ],
  齐: [
    {
      id: "qi_jixia",
      type: "学宫",
      title: "稷下群贤",
      text: "临淄学士云集，或言王道，或言霸术。养士费财，然天下名流皆归齐。",
      choices: [
        { text: "广开稷下，纳天下士", risk: 0.16, effects: { diplomacy: 9, court: 8, economy: -7 }, chronicle: "王广开稷下，齐名闻天下。" },
        { text: "择其能者，入官任事", risk: 0.28, effects: { court: 9, economy: -3, hearts: -2 }, chronicle: "王择士任官，清议入政。" },
        { text: "罢虚谈，专理盐铁市舶", risk: 0.2, effects: { economy: 10, diplomacy: -4, court: -3 }, chronicle: "王罢虚谈，财赋日丰，士人散去。" },
      ],
    },
    {
      id: "qi_save_zhao",
      type: "救援",
      title: "围魏救赵",
      text: "赵急告于齐，魏军围城甚迫。田忌请袭魏虚，群臣惧远师劳民。",
      choices: [
        { text: "袭魏救赵，取名天下", risk: 0.42, effects: { diplomacy: 11, military: 6, economy: -7 }, attack: true, chronicle: "王袭魏救赵，齐名大震。" },
        { text: "遣师牵制，勿决大兵", risk: 0.22, effects: { diplomacy: 5, military: 2, economy: -3 }, chronicle: "王遣偏师牵制，赵感而魏怨。" },
        { text: "坐观魏赵相敝", risk: 0.18, effects: { economy: 6, diplomacy: -7, hearts: -2 }, chronicle: "王坐观其敝，齐得休养而失义名。" },
      ],
    },
  ],
  赵: [
    {
      id: "zhao_hufu",
      type: "军改",
      title: "胡服骑射",
      text: "北地骑兵驰突如风，赵武灵王欲易服习射。宗室谓变夏从夷，不可。",
      choices: [
        { text: "胡服骑射，破俗强兵", risk: 0.38, effects: { military: 14, hearts: -6, court: 4 }, chronicle: "王行胡服骑射，赵兵遂强，旧俗哗然。" },
        { text: "先练边军，不及国中", risk: 0.18, effects: { military: 7, economy: -3 }, chronicle: "王先练边军，骑射渐兴。" },
        { text: "守华夏衣冠，抚宗室心", risk: 0.08, effects: { hearts: 5, military: -5, diplomacy: 2 }, chronicle: "王守旧服，宗室悦，边患如故。" },
      ],
    },
    {
      id: "zhao_changping",
      type: "决战",
      title: "长平之议",
      text: "秦赵相持，廉颇坚壁。秦人反间，言赵括善兵。国中粮尽，朝议纷纷。",
      choices: [
        { text: "仍用廉颇，坚守待变", risk: 0.26, effects: { military: -2, economy: -8, hearts: -4, court: 4 }, chronicle: "王仍用廉颇，军不败而国中困。" },
        { text: "换赵括，求一战定局", risk: 0.62, effects: { military: 14, economy: -10, hearts: -8 }, attack: true, fatalOnFail: true, chronicle: "王使赵括代将，举国系于一战。" },
        { text: "割地求和，保全主力", risk: 0.2, effects: { diplomacy: 5, military: 4, hearts: -10 }, loseCity: true, chronicle: "王割地求和，赵存其兵而伤其气。" },
      ],
    },
  ],
  魏: [
    {
      id: "wei_ximen",
      type: "治水",
      title: "西门豹治邺",
      text: "邺地巫祝惑民，岁费甚巨。西门豹请治其弊，豪强与巫党相结。",
      choices: [
        { text: "尽除巫弊，兴渠利民", risk: 0.34, effects: { economy: 10, hearts: 8, court: 4 }, chronicle: "王用西门豹，邺地水利兴而淫祀绝。" },
        { text: "渐禁其费，勿激乡俗", risk: 0.12, effects: { economy: 4, hearts: 4, court: 2 }, chronicle: "王渐禁淫祀，民俗稍正。" },
        { text: "借巫祝安民，暂不更张", risk: 0.1, effects: { hearts: 5, court: -5, economy: -2 }, chronicle: "王不更邺俗，民安而政弊仍存。" },
      ],
    },
    {
      id: "wei_hexi",
      type: "失地",
      title: "河西危局",
      text: "秦兵压河西，韩赵观望。魏将请决战，谋臣请弃地保大梁。",
      choices: [
        { text: "决战河西，守旧霸业", risk: 0.56, effects: { military: 12, economy: -9, hearts: -5 }, attack: true, chronicle: "王决战河西，魏之旧威尽系于此。" },
        { text: "弃河西，保大梁根本", risk: 0.18, effects: { military: 3, hearts: -7, court: 5 }, loseCity: true, chronicle: "王弃河西，国人痛之，而大梁得全。" },
        { text: "结赵韩，共拒秦师", risk: 0.38, effects: { diplomacy: 10, economy: -5, military: 3 }, relation: { target: "neighbor", delta: 18 }, chronicle: "王结赵韩拒秦，合纵有形。" },
      ],
    },
  ],
  韩: [
    {
      id: "han_fei",
      type: "法术",
      title: "术士献书",
      text: "韩地狭兵弱，有士言法、术、势三者可使小国不亡。贵臣畏其夺权。",
      choices: [
        { text: "用其术法，束群臣手", risk: 0.44, effects: { court: 13, military: 5, hearts: -5 }, chronicle: "王用术法，群臣敛手，韩政益密。" },
        { text: "采其刑名，缓触贵臣", risk: 0.2, effects: { court: 7, diplomacy: 2 }, chronicle: "王采刑名之术，政令稍明。" },
        { text: "不用峻法，专事和邻", risk: 0.14, effects: { diplomacy: 8, court: -5, hearts: 4 }, chronicle: "王不用峻法，以外交求存。" },
      ],
    },
    {
      id: "han_yiyang",
      type: "守关",
      title: "宜阳守否",
      text: "宜阳为韩国西门，秦使索地。献则辱国，拒则兵临新郑。",
      choices: [
        { text: "死守宜阳，以小抗大", risk: 0.6, effects: { military: 10, hearts: 6, economy: -8 }, attack: true, chronicle: "王死守宜阳，国小而志烈。" },
        { text: "献半地，换三年安宁", risk: 0.18, effects: { diplomacy: 5, military: -3, hearts: -8 }, loseCity: true, chronicle: "王献地求安，韩人耻之，国祚暂延。" },
        { text: "请魏赵出兵，共保门户", risk: 0.42, effects: { diplomacy: 12, economy: -5 }, relation: { target: "neighbor", delta: 20 }, chronicle: "王请魏赵共保宜阳，诸侯难齐其心。" },
      ],
    },
  ],
  燕: [
    {
      id: "yan_yi",
      type: "招贤",
      title: "黄金台",
      text: "燕昭王欲雪国耻，筑台招贤。国中贫弱，群臣疑其虚费。",
      choices: [
        { text: "筑黄金台，延天下才", risk: 0.18, effects: { diplomacy: 10, court: 8, economy: -7 }, chronicle: "王筑黄金台，贤士北至。" },
        { text: "密访名将，勿事浮名", risk: 0.32, effects: { military: 8, diplomacy: 3, economy: -4 }, chronicle: "王密访名将，燕军渐整。" },
        { text: "省其费，先足府库", risk: 0.1, effects: { economy: 7, diplomacy: -4, court: -2 }, chronicle: "王省黄金台之费，府库稍实。" },
      ],
    },
    {
      id: "yan_attack_qi",
      type: "复仇",
      title: "伐齐之机",
      text: "齐国骄横，诸侯多怨。乐毅请合五国伐齐，一雪前耻。",
      choices: [
        { text: "合诸侯伐齐，雪燕国耻", risk: 0.54, effects: { military: 10, diplomacy: 5, economy: -9 }, attack: true, chronicle: "王合诸侯伐齐，燕人奋起。" },
        { text: "先结赵魏，待齐更骄", risk: 0.24, effects: { diplomacy: 9, military: 2, economy: -3 }, relation: { target: "neighbor", delta: 15 }, chronicle: "王结赵魏，待齐自骄。" },
        { text: "修北境，勿远征齐地", risk: 0.12, effects: { military: 5, economy: 4, hearts: 2 }, chronicle: "王修北境，燕国渐稳。" },
      ],
    },
  ],
};

const majorEvents = [
  {
    id: "major_changping_scale_battle",
    type: "大战",
    title: "天下决战",
    text: "{enemy}倾国出师，主力已在平原列阵。此战若胜，可折一国脊梁；若败，我国十年难复。",
    major: true,
    minTurn: 55,
    choices: [
      { text: "倾精锐决战，求破其主力", risk: 0.66, effects: { military: 18, economy: -14, hearts: -8, diplomacy: -8 }, attack: true, captures: 3, fatalOnFail: true, loseOnFail: 2, chronicle: "王倾精锐决战，欲一举摧敌主力。" },
      { text: "坚壁耗敌，待其粮绝", risk: 0.34, effects: { military: 7, economy: -8, hearts: -3, court: 4 }, attack: true, captures: 1, chronicle: "王坚壁耗敌，使其师老粮乏。" },
      { text: "割地退兵，保存本军", risk: 0.18, effects: { diplomacy: 8, military: 5, hearts: -12 }, loseCity: true, relation: { target: "enemy", delta: 10 }, chronicle: "王割地退兵，国人痛之，而主力尚存。" },
    ],
  },
  {
    id: "major_five_state_coalition",
    type: "合纵",
    title: "五国伐强",
    text: "诸侯畏一国坐大，谋合兵伐之。我国若为盟主，可借众力改天下势；若盟约不齐，反成众怨之首。",
    major: true,
    minTurn: 70,
    choices: [
      { text: "执盟主之旗，共伐强敌", risk: 0.56, effects: { diplomacy: 14, military: 10, economy: -12 }, attack: true, captures: 3, relation: { target: "ally", delta: 18 }, chronicle: "王执盟主之旗，合诸侯伐强。" },
      { text: "出兵不深，只取近利", risk: 0.34, effects: { military: 7, diplomacy: 4, economy: -6 }, attack: true, captures: 2, chronicle: "王出兵不深，取近利而还。" },
      { text: "暗通强国，坐收盟乱", risk: 0.58, effects: { economy: 12, diplomacy: -16, court: 5 }, relation: { target: "enemy", delta: 18 }, chronicle: "王暗通强国，盟军未战先疑。" },
    ],
  },
  {
    id: "major_capital_breakthrough",
    type: "破都",
    title: "敌都门户洞开",
    text: "{enemy}都畿外屏尽失，内臣争权，城中粮贵。若直取其都，天下格局立变。",
    major: true,
    minTurn: 90,
    choices: [
      { text: "直趋都畿，逼其迁庙", risk: 0.62, effects: { military: 16, economy: -13, diplomacy: -12, hearts: -4 }, attack: true, captures: 4, fatalOnFail: true, chronicle: "王直趋敌都，兵临宗庙。" },
      { text: "先扫外屏，断其羽翼", risk: 0.44, effects: { military: 10, economy: -9, diplomacy: -6 }, attack: true, captures: 2, chronicle: "王先扫敌国外屏，渐逼其都。" },
      { text: "逼其称臣，暂不入都", risk: 0.28, effects: { diplomacy: 10, economy: 6, military: 3 }, relation: { target: "enemy", delta: 12 }, chronicle: "王逼敌称臣，暂不入其都。" },
    ],
  },
  {
    id: "major_water_attack",
    type: "水攻",
    title: "决水灌城",
    text: "工师言可决水灌{enemy}重城。城可速下，然百姓与田庐亦将同没，史书必重书此事。",
    major: true,
    minTurn: 80,
    choices: [
      { text: "决水灌城，速破重围", risk: 0.52, effects: { military: 15, economy: -10, hearts: -18, diplomacy: -14 }, attack: true, captures: 3, chronicle: "王决水灌城，敌城崩溃，民庐俱没。" },
      { text: "围堤断粮，不伤满城", risk: 0.36, effects: { military: 8, economy: -9, hearts: -4 }, attack: true, captures: 2, chronicle: "王围堤断粮，城中自困。" },
      { text: "罢水攻，另寻战机", risk: 0.16, effects: { hearts: 7, diplomacy: 3, military: -3 }, chronicle: "王罢水攻，士卒虽疑，百姓免难。" },
    ],
  },
  {
    id: "major_far_near_strategy",
    type: "国策",
    title: "远交近攻",
    text: "策士献谋：厚交远国，专攻近邻。此策若行，诸侯虽知其意，也难同日合兵。",
    major: true,
    minTurn: 45,
    choices: [
      { text: "定为国策，专攻近邻", risk: 0.42, effects: { diplomacy: 8, military: 12, economy: -7, hearts: -4 }, attack: true, captures: 2, chronicle: "王定远交近攻之策，兵锋专指近邻。" },
      { text: "只取其术，不绝诸盟", risk: 0.24, effects: { diplomacy: 7, military: 5, court: 5 }, attack: true, chronicle: "王取其术而不尽绝诸盟。" },
      { text: "拒绝欺盟，守旧日信义", risk: 0.18, effects: { diplomacy: 10, hearts: 4, military: -4 }, chronicle: "王拒绝欺盟，诸侯称信，我兵势稍缓。" },
    ],
  },
  {
    id: "major_weak_state_partition",
    type: "瓜分",
    title: "诸侯瓜分弱国",
    text: "一弱国仅余孤城，诸侯皆遣兵压境。若我国迟疑，土地将尽入他人囊中。",
    major: true,
    minTurn: 100,
    choices: [
      { text: "抢先入境，尽取其地", risk: 0.5, effects: { military: 10, economy: -8, diplomacy: -12 }, attack: true, captures: 3, chronicle: "王抢先入境，弱国社稷遂危。" },
      { text: "与盟国分取，少树众敌", risk: 0.34, effects: { diplomacy: 6, military: 6, economy: -5 }, attack: true, captures: 2, relation: { target: "ally", delta: 12 }, chronicle: "王与盟国分取弱邦，诸侯各有所得。" },
      { text: "扶其孤君为屏障", risk: 0.28, effects: { diplomacy: 9, economy: -4, military: -2 }, relation: { target: "enemy", delta: 10 }, chronicle: "王扶弱国孤君，使其为屏障。" },
    ],
  },
  {
    id: "major_comeback_general",
    type: "名将",
    title: "亡命名将归来",
    text: "旧将流亡在外，今夜携残部归国，言{enemy}军中有隙。若信其谋，可用败军求一场翻盘；若不用，至少可稳住人心。",
    major: true,
    underdog: true,
    minTurn: 18,
    choices: [
      { text: "拜为上将，突袭{enemy}空营", risk: 0.46, effects: { military: 14, economy: -7, hearts: 5 }, attack: true, captures: 3, comeback: true, policy: { id: "comeback_war", name: "随名将反攻{enemy}", duration: 5, enemy: "enemy", effectsPerTurn: { military: 2, economy: -1, hearts: 1 }, relationPerTurn: [{ target: "enemy", delta: -6 }] }, chronicle: "王拜亡命旧将为上将，夜袭敌营。" },
      { text: "使其练新军，三年复仇", risk: 0.24, effects: { military: 8, hearts: 6, economy: -5 }, comeback: true, policy: { id: "train_revenge", name: "练军复仇", duration: 5, enemy: "enemy", effectsPerTurn: { military: 3, economy: -2 } }, chronicle: "王使旧将练新军，国人复有战心。" },
      { text: "封其闲职，免军心再乱", risk: 0.12, effects: { hearts: 8, court: 4, military: -2 }, chronicle: "王封旧将闲职，军心稍定。" },
    ],
  },
  {
    id: "major_desperate_coalition",
    type: "救亡",
    title: "诸侯救亡之盟",
    text: "{enemy}势逼我国，诸侯亦惧其独强。若我国屈身请盟，或可借众兵反击；只是盟成之后，处处要让利。",
    major: true,
    underdog: true,
    minTurn: 25,
    choices: [
      { text: "割利许盟，合兵反击{enemy}", risk: 0.42, effects: { diplomacy: 16, military: 8, economy: -10 }, attack: true, captures: 2, comeback: true, relation: { target: "ally", delta: 24 }, policy: { id: "salvation_coalition", name: "救亡合纵", duration: 5, enemy: "enemy", ally: "ally", effectsPerTurn: { diplomacy: 3, military: 1, economy: -2 }, relationPerTurn: [{ target: "ally", delta: 5 }, { target: "enemy", delta: -5 }] }, chronicle: "王屈身请盟，合诸侯之兵反击强敌。" },
      { text: "以质子求援，只守都畿", risk: 0.22, effects: { diplomacy: 12, hearts: 4, military: 4, economy: -6 }, relation: { target: "ally", delta: 18 }, policy: { id: "defensive_alliance", name: "守国盟约", duration: 5, ally: "ally", effectsPerTurn: { diplomacy: 2, military: 1, economy: -1 }, relationPerTurn: [{ target: "ally", delta: 4 }] }, chronicle: "王遣质子求援，诸侯出兵护我都畿。" },
      { text: "拒绝屈身，独守宗庙", risk: 0.54, effects: { hearts: 10, court: 6, military: 5, diplomacy: -8 }, comeback: true, chronicle: "王拒绝屈身，独守宗庙，国人悲壮。" },
    ],
  },
  {
    id: "major_lost_cities_revolt",
    type: "复国",
    title: "故城举火",
    text: "昔日失城中，旧民夜举烽火，愿为内应。此机稍纵即逝，若成，则数城可复；若败，旧民将遭屠戮。",
    major: true,
    underdog: true,
    minTurn: 35,
    choices: [
      { text: "尽遣死士入城，内外并起", risk: 0.5, effects: { military: 12, hearts: 8, economy: -8, diplomacy: -4 }, attack: true, captures: 3, comeback: true, chronicle: "王遣死士入故城，内外并起。" },
      { text: "只救一城，勿害旧民", risk: 0.28, effects: { hearts: 10, military: 5, economy: -4 }, attack: true, captures: 1, comeback: true, chronicle: "王只救一城，旧民多得免。" },
      { text: "暗给粮械，待来年再动", risk: 0.18, effects: { court: 6, hearts: 5, economy: -5 }, policy: { id: "restore_old_cities", name: "暗结故城", duration: 5, enemy: "enemy", effectsPerTurn: { court: 1, military: 1, economy: -1 }, relationPerTurn: [{ target: "enemy", delta: -3 }] }, chronicle: "王暗给故城粮械，待来年再举。" },
    ],
  },
];

function allEventPools() {
  return [...chainEvents, ...majorEvents, ...Object.values(countryEvents).flat(), ...universalEvents, ...militaryEvents, ...policyEvents];
}

function findEventById(eventId) {
  return allEventPools().find((event) => event.id === eventId);
}

function addChoiceChain(eventId, choiceIndex, chain) {
  const event = allEventPools().find((item) => item.id === eventId);
  if (event?.choices?.[choiceIndex]) event.choices[choiceIndex].chain = chain;
}

function addChoicePolicy(eventId, choiceIndex, policy) {
  const event = allEventPools().find((item) => item.id === eventId);
  if (event?.choices?.[choiceIndex]) event.choices[choiceIndex].policy = policy;
}

[
  ["military_joint_campaign", 0, { eventId: "chain_ally_claims_city", delay: [2, 4], context: { ally: "neighbor" }, chance: 0.8 }],
  ["military_failed_ally", 0, { eventId: "chain_ally_claims_city", delay: [2, 5], context: { ally: "ally" }, chance: 0.55 }],
  ["qin_shang_yang", 0, { eventId: "chain_reform_backlash", delay: [2, 5], chance: 0.85 }],
  ["chu_wu_qi", 0, { eventId: "chain_reform_backlash", delay: [2, 4], chance: 0.85 }],
  ["han_fei", 0, { eventId: "chain_reform_backlash", delay: [2, 5], chance: 0.65 }],
  ["policy_hostage", 0, { eventId: "chain_hostage_claim", delay: [3, 7], context: { neighbor: "neighbor" }, chance: 0.75 }],
  ["military_general_glory", 0, { eventId: "chain_general_power", delay: [2, 4], chance: 0.7 }],
  ["military_capital_road", 0, { eventId: "chain_enemy_truce", delay: [1, 3], context: { enemy: "enemy" }, chance: 0.6 }],
  ["military_fortress_choice", 1, { eventId: "chain_enemy_truce", delay: [1, 3], context: { enemy: "enemy" }, chance: 0.45 }],
].forEach(([eventId, choiceIndex, chain]) => addChoiceChain(eventId, choiceIndex, chain));

[
  ["grain_tax", 0, { id: "war_tax", name: "加赋备战", duration: 5, effectsPerTurn: { economy: 2, military: 1, hearts: -2 } }],
  ["grain_tax", 1, { id: "frugal_rule", name: "裁冗节用", duration: 5, effectsPerTurn: { economy: 1, court: 2, diplomacy: -1 } }],
  ["grain_tax", 2, { id: "rest_people", name: "贷民休养", duration: 5, effectsPerTurn: { hearts: 2, economy: -1, military: -1 } }],
  ["talent_arrives", 0, { id: "reform_policy", name: "任客变法", duration: 5, effectsPerTurn: { court: 2, military: 1, hearts: -2 } }],
  ["talent_arrives", 2, { id: "stability_policy", name: "守旧维稳", duration: 5, effectsPerTurn: { hearts: 1, court: -1, economy: 1 } }],
  ["noble_plot", 0, { id: "centralize", name: "削贵强令", duration: 5, effectsPerTurn: { court: 2, hearts: -2 } }],
  ["noble_plot", 1, { id: "appease_nobles", name: "安抚宗室", duration: 5, effectsPerTurn: { hearts: 1, court: -1, economy: -1 } }],
  ["famine", 0, { id: "relief_policy", name: "开仓赈济", duration: 5, effectsPerTurn: { hearts: 2, economy: -2 } }],
  ["famine", 2, { id: "military_colony", name: "徙民实边", duration: 5, effectsPerTurn: { military: 2, economy: 1, hearts: -2 } }],
  ["canal", 0, { id: "construction_plan", name: "兴修水利", duration: 5, effectsPerTurn: { economy: 2, hearts: -1, court: 1 } }],
  ["canal", 1, { id: "recover_plan", name: "休养民力", duration: 5, effectsPerTurn: { hearts: 2, economy: 1, military: -1 } }],
  ["policy_flood", 0, { id: "fortify_plan", name: "修城备边", duration: 5, effectsPerTurn: { military: 2, economy: -1, hearts: -1 } }],
  ["policy_flood", 1, { id: "disaster_relief", name: "救灾安民", duration: 5, effectsPerTurn: { hearts: 2, economy: -2 } }],
  ["policy_trade", 0, { id: "open_trade", name: "开关通商", duration: 5, effectsPerTurn: { economy: 2, diplomacy: 1, court: -1 } }],
  ["policy_trade", 2, { id: "closed_border", name: "闭关守密", duration: 5, effectsPerTurn: { military: 1, economy: -1, diplomacy: -1 } }],
  ["policy_hostage", 0, { id: "hostage_peace", name: "纳质安边", duration: 5, ally: "neighbor", effectsPerTurn: { diplomacy: 2, economy: -1 }, relationPerTurn: [{ target: "neighbor", delta: 4 }] }],
  ["policy_hostage", 1, { id: "coerce_neighbor", name: "逼{neighbor}割地", duration: 5, enemy: "neighbor", effectsPerTurn: { military: 2, diplomacy: -1 }, relationPerTurn: [{ target: "neighbor", delta: -5 }] }],
  ["policy_assassin", 0, { id: "revenge_war", name: "报复{enemy}", duration: 5, enemy: "enemy", effectsPerTurn: { military: 2, economy: -2, diplomacy: -1 }, relationPerTurn: [{ target: "enemy", delta: -5 }] }],
  ["policy_assassin", 1, { id: "public_case", name: "明证争援", duration: 5, effectsPerTurn: { diplomacy: 2, court: 1, economy: -1 } }],
  ["policy_refugees", 0, { id: "house_refugees", name: "收民实户", duration: 5, effectsPerTurn: { hearts: 1, economy: -1, military: 1 }, relationPerTurn: [{ target: "enemy", delta: -3 }] }],
  ["policy_refugees", 1, { id: "draft_refugees", name: "选丁入军", duration: 5, effectsPerTurn: { military: 2, hearts: -1, diplomacy: -1 } }],
  ["military_cavalry_reform", 0, { id: "cavalry_plan", name: "重练骑兵", duration: 5, effectsPerTurn: { military: 2, economy: -2, hearts: -1 } }],
  ["military_conscription", 0, { id: "mass_draft", name: "大征壮丁", duration: 5, effectsPerTurn: { military: 3, economy: -2, hearts: -3 } }],
  ["military_winter_campaign", 2, { id: "winter_rest", name: "休兵蓄锐", duration: 5, effectsPerTurn: { military: 1, hearts: 1, economy: 1 } }],
  ["major_far_near_strategy", 0, { id: "far_near", name: "远交近攻", duration: 5, enemy: "enemy", ally: "ally", effectsPerTurn: { military: 2, diplomacy: 1, economy: -1 }, relationPerTurn: [{ target: "enemy", delta: -5 }, { target: "ally", delta: 3 }] }],
].forEach(([eventId, choiceIndex, policy]) => addChoicePolicy(eventId, choiceIndex, policy));

const crisisEvents = {
  military: {
    title: "军心溃散",
    text: "兵威已尽，边将不奉王命，诸侯窥我虚实。今日不决，国门将开。",
  },
  economy: {
    title: "府库空虚",
    text: "仓无宿粟，帛不足赏。百官请俸，士卒索粮，朝堂如沸。",
  },
  hearts: {
    title: "民怨沸腾",
    text: "闾里相聚，言王政苛急。若再失其心，国中将不待外敌而乱。",
  },
  court: {
    title: "政令不出",
    text: "法令下县而不行，贵臣各拥门客。王命轻于竹简。",
  },
  diplomacy: {
    title: "诸侯皆敌",
    text: "使节不入邻邦，边境烽火四起。天下似欲共分我土。",
  },
};

let selectedCountry = "秦";
let selectedEra = "early";
let selectedStyle = "martial";
let state = null;

const storageKey = "zhanGuoChoiceSave";

const $ = (selector) => document.querySelector(selector);

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function formatYear(year) {
  return year < 0 ? `前${Math.abs(year)}` : `${year}`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function readable(text = "") {
  const replacements = [
    ["仓廪", "粮仓"],
    ["府库", "国库"],
    ["少府", "司财官"],
    ["廷尉", "司刑官"],
    ["令尹", "执政大臣"],
    ["司农", "司粮官"],
    ["闭粜", "闭市保粮"],
    ["平粜", "平价卖粮"],
    ["秋收不登", "岁收不佳"],
    ["野有流民", "流民渐多"],
    ["闾里", "乡里"],
    ["宗室贵戚", "宗室贵族"],
    ["穷治", "严查"],
    ["连坐", "牵连治罪"],
    ["游士", "游说之士"],
    ["客卿", "外来谋臣"],
    ["帛不足赏", "钱帛不够赏赐"],
    ["社稷", "国家"],
    ["诸侯", "诸国"],
    ["歃血为盟", "盟誓"],
    ["遣使", "派使者"],
    ["遣锐士", "派精兵"],
    ["遣间", "派密探"],
    ["勿", "莫"],
    ["罢兵", "停战"],
    ["称便", "称善"],
    ["安堵", "安居"],
    ["国祚", "国运"],
    ["得失未彰", "成败未明"],
    ["事有龃龉", "事行不顺"],
    ["成效反折", "成效折损"],
    ["侧目", "警惕"],
    ["薨", "去世"],
    ["崩", "去世"],
  ];
  return replacements.reduce((result, [from, to]) => result.replaceAll(from, to), text);
}

function randomRulerProfile() {
  const roll = Math.random();
  const constitution = roll < 0.24 ? constitutions[0] : roll < 0.82 ? constitutions[1] : constitutions[2];
  const [minAge, maxAge] = constitution.age;
  return {
    age: minAge + Math.floor(Math.random() * (maxAge - minAge + 1)),
    health: constitution.health + Math.floor(Math.random() * 5) - 2,
    constitution: constitution.id,
    constitutionName: constitution.name,
    strain: 0,
    reignYears: 0,
    deathCause: "",
  };
}

function constitutionOf(stateLike = state) {
  return constitutions.find((item) => item.id === stateLike.constitution) || constitutions[1];
}

function initSetup() {
  const countryMount = $("#countrySelect");
  countryMount.innerHTML = Object.entries(countries)
    .map(([name, data]) => `<button class="country-card ${name === selectedCountry ? "active" : ""}" data-country="${name}" type="button"><strong>${name}</strong><span>${data.hint}</span></button>`)
    .join("");
  countryMount.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-country]");
    if (!btn) return;
    selectedCountry = btn.dataset.country;
    $("#countryHint").textContent = `${selectedCountry}：${countries[selectedCountry].hint}`;
    initSetup();
  }, { once: true });

  const eraMount = $("#eraSelect");
  eraMount.innerHTML = eras
    .map((era) => `<button class="${era.id === selectedEra ? "active" : ""}" data-era="${era.id}" type="button">${era.name}</button>`)
    .join("");
  eraMount.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-era]");
    if (!btn) return;
    selectedEra = btn.dataset.era;
    $("#eraHint").textContent = `${eras.find((era) => era.id === selectedEra).hint} ${eraMapHint(selectedEra)}`;
    initSetup();
  }, { once: true });

  const styleMount = $("#rulerStyleSelect");
  styleMount.innerHTML = rulerStyles
    .map((style) => `<button class="${style.id === selectedStyle ? "active" : ""}" data-style="${style.id}" type="button">${style.name}</button>`)
    .join("");
  styleMount.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-style]");
    if (!btn) return;
    selectedStyle = btn.dataset.style;
    $("#styleHint").textContent = rulerStyles.find((style) => style.id === selectedStyle).hint;
    initSetup();
  }, { once: true });

  $("#eraHint").textContent = `${eras.find((era) => era.id === selectedEra).hint} ${eraMapHint(selectedEra)}`;
  $("#continueBtn").disabled = !localStorage.getItem(storageKey);
}

function createGame() {
  const era = eras.find((item) => item.id === selectedEra);
  const style = rulerStyles.find((item) => item.id === selectedStyle);
  const base = structuredClone(countries[selectedCountry].stats);
  applyEffects(base, style.effects);
  const ruler = randomRulerProfile();

  const owners = initialOwnersForEra(selectedEra);

  const relations = {};
  Object.keys(countries).forEach((a) => {
    relations[a] = {};
  });
  Object.keys(countries).forEach((a, index, names) => {
    names.slice(index + 1).forEach((b) => {
      const value = initialRelation(a, b);
      relations[a][b] = value;
      relations[b][a] = value;
    });
  });

  state = {
    country: selectedCountry,
    era: selectedEra,
    year: era.year,
    turn: 1,
    maxTurns: MAX_TURNS,
    rulerAge: ruler.age,
    health: ruler.health,
    constitution: ruler.constitution,
    constitutionName: ruler.constitutionName,
    strain: selectedStyle === "martial" ? 8 : selectedStyle === "benevolent" ? -4 : 0,
    reignYears: 0,
    reignStartTerritory: initialCountForCountry(selectedCountry, owners),
    deathCause: "",
    generation: 1,
    stats: base,
    owners,
    initialOwners: structuredClone(owners),
    relations,
    triggered: [],
    majorTriggered: [],
    lastMajorTurn: 0,
    activePolicies: [],
    chronicle: [],
    lastAction: null,
    chainQueue: [],
    contestedCities: [],
    pendingSuccession: null,
    legacy: { battles: 0, reforms: 0, mercy: 0, betrayals: 0, lostCities: 0, earlyDeaths: 0, longLife: 0, fallenStates: [], rulers: [] },
    alive: true,
  };
}

function applyEffects(stats, effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    stats[key] = clamp((stats[key] ?? 0) + value);
  });
}

function initialRelation(a, b) {
  const pair = [a, b].sort().join("");
  const pairBias = {
    楚秦: -34,
    秦赵: -28,
    秦魏: -36,
    秦韩: -44,
    燕齐: -40,
    燕赵: -32,
    魏齐: -32,
    楚齐: 28,
    赵韩: 26,
    韩魏: 28,
  };
  const close = neighborsFor(a).slice(0, 3).includes(b) ? -6 : 4;
  const noise = Math.floor(Math.random() * 15) - 7;
  return clamp((pairBias[pair] ?? 0) + close + noise, -55, 45);
}

function screen(id) {
  document.querySelectorAll(".screen").forEach((node) => node.classList.remove("active"));
  $(id).classList.add("active");
}

function playerCities() {
  return cities.filter((city) => state.owners[city.id] === state.country);
}

function enemyCountries() {
  const set = new Set(cities.filter((city) => state.owners[city.id] !== state.country).map((city) => state.owners[city.id]));
  return [...set];
}

function livingRivals() {
  return aliveCountryNames(false);
}

function neighborsFor(country) {
  const center = countryCenters[country];
  return Object.keys(countries)
    .filter((name) => name !== country)
    .map((name) => ({ name, dist: Math.hypot(countryCenters[name][0] - center[0], countryCenters[name][1] - center[1]) }))
    .sort((a, b) => a.dist - b.dist)
    .map((item) => item.name);
}

function contextNames() {
  const enemies = enemyCountries();
  const rivals = livingRivals();
  const policyEnemy = activePolicyTarget("enemy");
  const policyAlly = activePolicyTarget("ally");
  const enemy = policyEnemy || enemies.sort((a, b) => (state.relations[state.country][a] ?? 0) - (state.relations[state.country][b] ?? 0))[0] || pick(rivals);
  const neighbor = neighborsFor(state.country).find((name) => name !== enemy && countryCityCount(name) > 0) || enemy;
  const ally = policyAlly || rivals
    .filter((name) => name !== enemy)
    .sort((a, b) => (state.relations[state.country][b] ?? 0) - (state.relations[state.country][a] ?? 0))[0] || neighbor;
  return { enemy, neighbor, ally };
}

function activePolicyTarget(kind) {
  return [...(state.activePolicies || [])]
    .reverse()
    .map((policy) => policy[kind])
    .find((target) => target && countryCityCount(target) > 0 && target !== state.country) || "";
}

function fillText(text, ctx) {
  return Object.entries(ctx).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), text);
}

function crisisEvent() {
  const emptyKey = Object.keys(statMeta).find((key) => state.stats[key] <= 0);
  if (!emptyKey) return null;
  const crisis = crisisEvents[emptyKey];
  return {
    id: `crisis_${emptyKey}_${state.turn}`,
    type: "危局",
    title: crisis.title,
    text: crisis.text,
    crisis: true,
    choices: [
      { text: "孤注一掷，赌国运再兴", risk: 0.68, effects: { [emptyKey]: 22, military: -6, hearts: -8 }, chronicle: "王孤注一掷，国势或振，或更危。" },
      { text: "借外援入局，先保社稷", risk: 0.5, effects: { [emptyKey]: 16, diplomacy: 8, court: -8 }, chronicle: "王借外援救急，社稷暂全，权柄稍移。" },
      { text: "以严刑镇之，令出必行", risk: 0.58, effects: { [emptyKey]: 18, court: 7, hearts: -14 }, chronicle: "王以严刑镇局，令行而民惧。" },
      { text: "下罪己诏，减役息兵", risk: 0.22, effects: { [emptyKey]: 11, hearts: 8, military: -4 }, chronicle: "王下罪己诏，危局稍缓。" },
    ],
  };
}

function nextEvent() {
  const crisis = crisisEvent();
  if (crisis) return crisis;

  const chain = popDueChainEvent();
  if (chain) return chain;

  const recentIds = state.triggered.slice(-48);
  const majorPool = majorEvents.filter((event) => !state.majorTriggered.includes(event.id) && state.turn >= (event.minTurn || 1) && majorEventEligible(event));
  if (majorPool.length && shouldOfferMajorEvent()) {
    const underdogPool = majorPool.filter((event) => event.underdog);
    const event = isPlayerUnderdog() && underdogPool.length ? pick(underdogPool) : pick(majorPool);
    return { ...structuredClone(event), chainContext: majorEventContext(event) };
  }

  const basePool = [...(countryEvents[state.country] || []), ...universalEvents, ...militaryEvents, ...policyEvents];
  const latePool = state.turn >= ENDGAME_TURN ? militaryEvents.filter((event) => event.id === "military_late_hegemony") : [];
  const pool = [...latePool, ...basePool].filter((event) => !recentIds.includes(event.id));
  if (!pool.length) {
    state.triggered = state.triggered.slice(-18);
    return pick([...militaryEvents, ...militaryEvents, ...universalEvents, ...policyEvents]);
  }

  const countrySpecific = pool.filter((event) => (countryEvents[state.country] || []).some((own) => own.id === event.id));
  const militaryPool = pool.filter((event) => militaryEvents.some((own) => own.id === event.id));
  const martialCountryPool = countrySpecific.filter((event) => event.choices.some((choice) => choice.attack || choice.loseCity));
  if (martialCountryPool.length && Math.random() < 0.34) return pick(martialCountryPool);
  if (militaryPool.length && Math.random() < 0.62) return pick(militaryPool);
  if (countrySpecific.length && Math.random() < 0.24) return pick(countrySpecific);
  return pick(pool);
}

function shouldOfferMajorEvent() {
  const alive = aliveCountryNames(true).length;
  const pressure = endgamePressure();
  const underdog = isPlayerUnderdog();
  const turnsSinceMajor = state.lastMajorTurn ? state.turn - state.lastMajorTurn : state.turn;
  const highTension = underdog || playerCities().length >= countryBaseCount(state.country) + 3 || alive <= 5 || state.stats.military >= 72 || state.stats.diplomacy <= 42;
  if (underdog && turnsSinceMajor >= 18) return true;
  if (!state.majorTriggered.length && highTension && state.turn >= 45) return true;
  const pity = turnsSinceMajor >= 35 ? 0.16 : turnsSinceMajor >= 22 ? 0.08 : 0;
  const momentum = hasComebackMomentum() ? 0.1 : 0;
  const chance = clamp(0.08 + pressure * 0.14 + (underdog ? 0.2 : 0) + momentum + (alive <= 4 ? 0.08 : 0) + pity, 0.08, underdog ? 0.52 : 0.38);
  return highTension && Math.random() < chance;
}

function isPlayerUnderdog() {
  const territory = playerCities().length;
  const start = state.reignStartTerritory || countryBaseCount(state.country);
  const leader = dominantCountry(true);
  const avg = Math.round(Object.values(state.stats).reduce((sum, value) => sum + value, 0) / 5);
  return territory <= Math.max(6, start - 2)
    || state.legacy.lostCities >= 2
    || avg < 46
    || (leader && leader.name !== state.country && leader.count >= territory + 8);
}

function majorEventEligible(event) {
  return event.underdog ? isPlayerUnderdog() : true;
}

function majorEventContext(event) {
  const ctx = contextNames();
  if (!event.underdog) return ctx;
  const leader = dominantCountry(true);
  const enemy = leader && leader.name !== state.country ? leader.name : ctx.enemy;
  const ally = livingRivals()
    .filter((name) => name !== enemy)
    .sort((a, b) => (state.relations[state.country][b] ?? 0) - (state.relations[state.country][a] ?? 0))[0] || ctx.ally;
  return { ...ctx, enemy, ally, neighbor: ally || ctx.neighbor };
}

function popDueChainEvent() {
  state.chainQueue = state.chainQueue || [];
  const index = state.chainQueue.findIndex((item) => item.dueTurn <= state.turn);
  if (index < 0) return null;
  const [item] = state.chainQueue.splice(index, 1);
  const event = findEventById(item.eventId);
  if (!event) return null;
  if (item.cityId && state.owners[item.cityId] !== state.country) return null;
  return {
    ...structuredClone(event),
    id: `${event.id}_${item.createdTurn}_${item.dueTurn}`,
    chainSourceId: event.id,
    chainContext: item.context || {},
  };
}

function dynamicRisk(baseRisk) {
  const stabilizer = (state.stats.military + state.stats.hearts + state.stats.court + state.stats.economy) / 400;
  const diplomacy = state.stats.diplomacy / 100;
  const unrest = state.stats.hearts < 35 ? 0.12 : 0;
  const courtDrag = state.stats.court < 35 ? 0.08 : 0;
  return clamp(baseRisk + 0.24 - stabilizer * 0.28 - diplomacy * 0.05 + unrest + courtDrag, 0.05, 0.82);
}

function choiceRisk(choice) {
  const comebackRelief = choice.comeback && isPlayerUnderdog() ? 0.16 : 0;
  const momentumRelief = hasComebackMomentum() && choice.attack ? 0.1 : 0;
  const majorRelief = state.currentEvent?.major ? 0.04 : 0;
  return clamp(dynamicRisk(choice.risk ?? 0.1) - comebackRelief - momentumRelief - majorRelief, 0.05, 0.82);
}

function riskMark(risk) {
  if (risk < 0.25) return { label: "稳", cls: "risk-low" };
  if (risk < 0.48) return { label: "变", cls: "risk-mid" };
  return { label: "险", cls: "risk-high" };
}

function renderGame() {
  migrateState();
  if (state.pendingSuccession) {
    $("#eventCard").hidden = true;
    $("#resultCard").hidden = false;
    $("#resultTag").textContent = "先王已逝";
    $("#resultText").textContent = "先王已去世，请先定其历史评价，再决定是否进入下一世。";
    renderSuccessionPanel();
    renderMap();
    renderChronicle();
    renderStatsOnly();
    return;
  }
  $("#turnLabel").textContent = `${formatYear(state.year)} · 第${state.turn}回合 · 第${state.generation}世 · 君${state.rulerAge}岁`;
  $("#realmTitle").textContent = `${state.country}国朝堂`;
  $("#territoryCount").textContent = `城池 ${playerCities().length}`;
  $("#legacyHint").textContent = legacyTitle();

  $("#statsMount").innerHTML = Object.entries(statMeta)
    .map(([key, label]) => `<div class="stat"><span>${label}</span><strong>${state.stats[key]}</strong></div>`)
    .join("");

  $("#healthMeter").style.width = `${state.health}%`;
  $("#healthLabel").textContent = `${Math.round(state.health)} · ${state.constitutionName}`;
  renderPolicyMount();

  renderMap();
  renderEvent(nextEvent());
  renderChronicle();
}

function renderMap() {
  const relationItems = Object.keys(countries)
    .filter((name) => name !== state.country)
    .map((name) => ({ name, value: state.relations[state.country][name] ?? 0 }));
  const activeRelations = relationItems
    .filter((item) => item.value >= 30 || item.value <= -30);

  const routes = activeRelations.map((item) => {
    const [sx, sy] = countryCenters[state.country];
    const [tx, ty] = countryCenters[item.name];
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2 - 36;
    return `<path class="route ${item.value >= 30 ? "ally" : "enemy"}" d="M${sx} ${sy} Q${mx} ${my} ${tx} ${ty}" />`;
  }).join("");

  const attack = state.lastAction?.from && state.lastAction?.to
    ? `<path class="route attack" d="M${state.lastAction.from[0]} ${state.lastAction.from[1]} Q${(state.lastAction.from[0] + state.lastAction.to[0]) / 2} ${(state.lastAction.from[1] + state.lastAction.to[1]) / 2 - 56} ${state.lastAction.to[0]} ${state.lastAction.to[1]}" />`
    : "";

  $("#relationLegend").innerHTML = `<span><i style="background:#91df77;color:#91df77"></i>盟</span><span><i style="background:#ff5c4d;color:#ff5c4d"></i>敌</span>`;
  const relationsPanel = $("#relationsPanel");
  if (relationsPanel) {
    relationsPanel.innerHTML = relationItems
      .sort((a, b) => a.value - b.value)
      .map((item) => {
        const status = relationStatus(item.value);
        return `<div class="relation-chip ${status.cls}"><strong>${item.name}</strong><span>${status.label}</span></div>`;
      })
      .join("");
  }
  $("#mapMount").innerHTML = `
    <svg viewBox="0 0 720 560" aria-label="战国地图">
      <defs>
        <marker id="arrowGold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#e1b456"></path>
        </marker>
      </defs>
      <rect width="720" height="560" fill="rgba(214,184,123,0.06)"></rect>
      <path class="mountain" d="M178 202 210 146 244 204Z"></path>
      <text class="mountain-label" x="210" y="218">崤山</text>
      <path class="mountain" d="M336 164 370 92 406 164Z"></path>
      <text class="mountain-label" x="370" y="180">太行</text>
      <path class="mountain" d="M560 164 590 108 624 166Z"></path>
      <text class="mountain-label" x="592" y="182">泰山</text>
      <path class="mountain" d="M318 444 354 374 396 446Z"></path>
      <text class="mountain-label" x="358" y="464">巫山</text>
      ${Object.keys(countries).map((name) => `<text class="country-label" x="${countryCenters[name][0]}" y="${countryCenters[name][1] + 12}">${name}</text>`).join("")}
      ${cities.map(renderCity).join("")}
      ${routes}
      ${attack}
      ${Object.keys(countries).map((name) => `<text class="city-label" x="${countryCenters[name][0]}" y="${countryCenters[name][1] + 25}">${name}</text>`).join("")}
    </svg>
  `;

  document.querySelectorAll(".city-cell").forEach((cell) => {
    cell.addEventListener("mousemove", showCityTooltip);
    cell.addEventListener("mouseleave", () => {
      $("#cityTooltip").hidden = true;
    });
  });
}

function relationStatus(value) {
  if (value >= 60) return { label: "盟", cls: "relation-ally" };
  if (value >= 30) return { label: "亲", cls: "relation-ally" };
  if (value <= -60) return { label: "死敌", cls: "relation-enemy" };
  if (value <= -30) return { label: "敌", cls: "relation-enemy" };
  if (value <= -10) return { label: "疑", cls: "relation-tense" };
  return { label: "和", cls: "relation-neutral" };
}

function renderCity(city) {
  const owner = state.owners[city.id];
  const color = countries[owner]?.color || "#777";
  const isPlayer = owner === state.country;
  const targeted = state.lastAction?.cityId === city.id ? " targeted" : "";
  return `
    <polygon class="city-cell ${isPlayer ? "player" : ""}${targeted}" data-city="${city.id}" points="${city.points.map((p) => p.join(",")).join(" ")}" fill="${color}" opacity="${isPlayer ? 0.72 : 0.42}"></polygon>
    <text class="city-label" x="${city.x}" y="${city.y + 4}">${city.name}</text>
  `;
}

function showCityTooltip(event) {
  const city = cities.find((item) => item.id === event.target.dataset.city);
  const tip = $("#cityTooltip");
  tip.innerHTML = `<strong>${city.name}</strong><br>属：${state.owners[city.id]}<br>${city.type} · 城防${city.defense} · 要冲${city.value}`;
  tip.hidden = false;
  tip.style.left = `${event.clientX + 14}px`;
  tip.style.top = `${event.clientY + 14}px`;
}

function renderEvent(event) {
  const ctx = { ...contextNames(), ...(event.chainContext || {}) };
  state.currentEvent = event;
  state.currentContext = ctx;
  $("#eventCard").hidden = false;
  $("#resultCard").hidden = true;
  $("#successionPanel").hidden = true;
  $("#nextTurnBtn").hidden = false;
  $("#eventType").textContent = readable(event.type);
  $("#eventTitle").textContent = readable(fillText(event.title, ctx));
  $("#eventText").textContent = readable(fillText(event.text, ctx));
  $("#riskMood").textContent = moodText();
  $("#choicesMount").innerHTML = event.choices.map((choice, index) => {
    const risk = choiceRisk(choice);
    const mark = riskMark(risk);
    return `<button class="choice-btn" type="button" data-choice="${index}">
      <span class="risk-mark ${mark.cls}">${mark.label}</span>
      <span>${readable(choice.text)}</span>
    </button>`;
  }).join("");
}

function moodText() {
  const low = Object.entries(state.stats).filter(([, value]) => value < 35).map(([key]) => statMeta[key]);
  if (low.length) return `${low.join("、")}承压`;
  if (playerCities().length >= 12) return "诸侯侧目";
  if (state.stats.diplomacy >= 70) return "纵横有势";
  return "局势未明";
}

function renderPolicyMount() {
  const mount = $("#policyMount");
  if (!mount) return;
  const policies = state.activePolicies || [];
  mount.innerHTML = policies.length
    ? policies.map((policy) => `<div class="policy-chip"><span>${readable(policy.name)}</span><strong>余${policy.remaining}年</strong></div>`).join("")
    : `<div class="policy-chip"><span>无定策</span><strong>朝议</strong></div>`;
}

function renderChronicle() {
  $("#chronicleList").innerHTML = state.chronicle.slice(-9).reverse().map((item) => `<li>${readable(item)}</li>`).join("");
}

function resolveChoice(index) {
  const event = state.currentEvent;
  const choice = event.choices[index];
  const risk = choiceRisk(choice);
  const success = Math.random() > risk;
  const multiplier = success ? (risk > 0.5 ? 1.35 : risk > 0.25 ? 1.15 : 1) : -0.45;
  const effects = {};

  Object.entries(choice.effects || {}).forEach(([key, value]) => {
    effects[key] = Math.round(value * multiplier);
  });

  applyEffects(state.stats, effects);
  state.lastAction = null;

  let result = fillText(choice.chronicle, state.currentContext);
  if (!success) {
    result += " 然事有龃龉，成效反折。";
  }

  if (choice.relation) {
    const target = state.currentContext[choice.relation.target] || choice.relation.target;
    adjustRelation(target, Math.round(choice.relation.delta * (success ? 1 : -0.5)));
  }
  if (choice.policy) {
    const policyText = enactPolicy(choice.policy, state.currentContext, success);
    if (policyText) result += ` ${policyText}`;
  }
  if (choice.comeback && success) {
    result += ` ${grantComebackMomentum(state.currentContext)}`;
  }

  if (choice.attack && success) {
    const capture = captureCity(state.currentContext.enemy);
    if (capture) {
      result += ` 遂取${capture.name}，版图益广。`;
      state.legacy.battles += 1;
      const capturedIds = [capture.id];
      const targetCaptures = (choice.captures || 1) + (hasComebackMomentum() ? 1 : 0);
      for (let i = 1; i < targetCaptures; i += 1) {
        const extra = captureCity(state.currentContext.enemy, capturedIds);
        if (!extra) break;
        capturedIds.push(extra.id);
        result += ` 乘势又下${extra.name}。`;
      }
      if (targetCaptures <= 1) {
        const extra = maybeCaptureBonus(risk, capturedIds);
        if (extra) {
          result += ` 余威所及，又下${extra.name}。`;
        }
      }
      if (choice.comeback && Math.random() < 0.45) {
        const extra = captureCity(state.currentContext.enemy, capturedIds);
        if (extra) result += ` 故土响应，复得${extra.name}。`;
      }
      if (!choice.comeback && hasComebackMomentum() && Math.random() < 0.55) {
        const extra = captureCity(state.currentContext.enemy, capturedIds);
        if (extra) result += ` 中兴之势未衰，又拔${extra.name}。`;
      }
    }
  } else if (choice.attack && !success) {
    result += " 师出不利，诸侯窥我。";
    state.stats.military = clamp(state.stats.military - 7);
    state.stats.hearts = clamp(state.stats.hearts - 4);
    if (choice.fatalOnFail) state.stats.military = clamp(state.stats.military - 18);
    for (let i = 0; i < (choice.loseOnFail || 0); i += 1) {
      const lost = losePlayerCity();
      if (lost) result += ` ${lost.name}因败而失。`;
    }
  }

  if (choice.loseCity) {
    const lost = losePlayerCity();
    if (lost) {
      result += ` ${lost.name}不复为我国有。`;
      state.legacy.lostCities += 1;
    }
  }

  if (event.type === "变法" || event.type === "军改" || event.type === "法术") state.legacy.reforms += success ? 1 : 0;
  if ((choice.effects?.hearts || 0) > 5) state.legacy.mercy += 1;
  if ((choice.effects?.diplomacy || 0) < -5) state.legacy.betrayals += 1;
  applyRulerStrain(choice, event, success, risk);
  enqueueChoiceChain(choice, success);

  if (event.major) {
    state.majorTriggered.push(event.id);
    state.lastMajorTurn = state.turn;
  }
  state.triggered.push(event.id);
  state.chronicle.push(`${formatYear(state.year)}：${result}`);
  const lifeNote = advanceTime();
  if (lifeNote) result += ` ${lifeNote}`;
  const terminal = terminalSettlement();

  $("#eventCard").hidden = true;
  $("#resultCard").hidden = false;
  $("#resultTag").textContent = success ? "事成" : "事挫";
  $("#resultText").textContent = readable(result);
  renderSuccessionPanel();
  renderMap();
  renderChronicle();
  renderStatsOnly();

  if (isDefeated()) {
    endGame("亡国");
  } else if (terminal) {
    endGame(terminal);
  }
}

function adjustRelation(target, delta) {
  if (!target || target === state.country) return;
  state.relations[state.country][target] = clamp((state.relations[state.country][target] ?? 0) + delta, -100, 100);
  state.relations[target][state.country] = state.relations[state.country][target];
}

function maybeCaptureBonus(risk, firstCityId) {
  const chance = (risk > 0.45 ? 0.12 : 0.04) + (state.stats.military > 78 ? 0.08 : 0) + (state.stats.economy > 66 ? 0.04 : 0);
  if (Math.random() > chance) return null;
  return captureCity(state.currentContext.enemy, firstCityId);
}

function enqueueChoiceChain(choice, success) {
  if (!success || !choice.chain) return;
  enqueueChain(choice.chain, state.currentContext);
}

function enqueueChain(chain, ctx = {}) {
  if (Math.random() > (chain.chance ?? 1)) return;
  const [minDelay, maxDelay] = chain.delay || [2, 4];
  const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1));
  const context = {};
  Object.entries(chain.context || {}).forEach(([key, value]) => {
    context[key] = ctx[value] || value;
  });
  state.chainQueue = state.chainQueue || [];
  state.chainQueue.push({
    eventId: chain.eventId,
    dueTurn: state.turn + delay,
    createdTurn: state.turn,
    context,
    cityId: chain.cityId || "",
  });
}

function captureCity(preferredOwner = "", excludeCityId = "") {
  const excluded = Array.isArray(excludeCityId) ? excludeCityId : [excludeCityId].filter(Boolean);
  const preferred = cities.filter((city) => state.owners[city.id] === preferredOwner && !excluded.includes(city.id));
  const candidates = preferred.length ? preferred : cities.filter((city) => state.owners[city.id] !== state.country && !excluded.includes(city.id));
  const targets = candidates
    .map((city) => {
      const [px, py] = countryCenters[state.country];
      const dist = Math.hypot(city.x - px, city.y - py);
      const relation = state.relations[state.country][state.owners[city.id]] ?? 0;
      return { city, score: dist + city.defense * 20 + relation };
    })
    .sort((a, b) => a.score - b.score);
  const target = targets[0]?.city;
  if (!target) return null;
  const oldOwner = state.owners[target.id];
  state.owners[target.id] = state.country;
  markContested(target.id, oldOwner, state.country);
  enqueueChain(
    { eventId: "chain_occupied_city", delay: [2, 5], chance: 0.55, cityId: target.id, context: { city: "city", enemy: "enemy" } },
    { city: target.name, enemy: oldOwner },
  );
  adjustRelation(oldOwner, -18);
  if (playerCities().length > countryBaseCount(state.country) + 4) {
    state.stats.diplomacy = clamp(state.stats.diplomacy - 3);
    state.stats.hearts = clamp(state.stats.hearts - 2);
  }
  Object.keys(countries).forEach((name) => {
    if (name !== state.country && name !== oldOwner && playerCities().length > countryBaseCount(state.country) + 3) adjustRelation(name, -5);
  });
  state.lastAction = { from: countryCenters[state.country], to: [target.x, target.y], cityId: target.id };
  return target;
}

function losePlayerCity() {
  const holdings = playerCities().filter((city) => city.type !== "都城").sort((a, b) => a.value - b.value);
  const lost = holdings[0];
  if (!lost) return null;
  const receiver = countryCityCount(state.currentContext.enemy) > 0 ? state.currentContext.enemy : pick(livingRivals());
  if (!receiver) return null;
  state.owners[lost.id] = receiver;
  markContested(lost.id, state.country, receiver);
  state.lastAction = { from: countryCenters[receiver], to: [lost.x, lost.y], cityId: lost.id };
  return lost;
}

function markContested(cityId, oldOwner, newOwner) {
  state.contestedCities = (state.contestedCities || []).filter((item) => item.cityId !== cityId);
  state.contestedCities.push({
    cityId,
    oldOwner,
    newOwner,
    untilTurn: state.turn + 5,
    heat: 2 + Math.floor(Math.random() * 3),
  });
}

function settleContestedCities() {
  state.contestedCities = state.contestedCities || [];
  const survivors = [];
  for (const item of state.contestedCities) {
    const city = cities.find((entry) => entry.id === item.cityId);
    if (!city || state.owners[item.cityId] !== item.newOwner || state.turn > item.untilTurn) continue;

    const isPlayerHeld = item.newOwner === state.country;
    const isPlayerFormer = item.oldOwner === state.country;
    const holdPower = item.newOwner === state.country ? state.stats.court + state.stats.hearts + state.stats.military : aiCountryPower(item.newOwner);
    const oldPower = item.oldOwner === state.country ? state.stats.diplomacy + state.stats.military : aiCountryPower(item.oldOwner);
    const revoltChance = clamp(0.04 + item.heat * 0.025 + city.value * 0.008 + (oldPower - holdPower) / 520, 0.03, 0.2);

    if (Math.random() < revoltChance) {
      state.owners[item.cityId] = item.oldOwner;
      state.lastAction = { from: countryCenters[item.oldOwner], to: [city.x, city.y], cityId: city.id };
      if (isPlayerHeld) {
        state.stats.hearts = clamp(state.stats.hearts - 4);
        state.stats.military = clamp(state.stats.military - 3);
        state.legacy.lostCities += 1;
      }
      if (isPlayerFormer) {
        state.stats.hearts = clamp(state.stats.hearts + 3);
      }
      state.chronicle.push(`${formatYear(state.year)}：${city.name}新附未稳，旧党复起，城归${item.oldOwner}。`);
      continue;
    }

    if (Math.random() < 0.1 && isPlayerHeld) {
      state.stats.economy = clamp(state.stats.economy - 2);
      state.chronicle.push(`${formatYear(state.year)}：${city.name}新附未安，需留兵抚民，国库稍耗。`);
    }
    survivors.push({ ...item, heat: Math.max(0, item.heat - 1) });
  }
  state.contestedCities = survivors;
}

function applyRulerStrain(choice, event, success, risk) {
  let delta = 0;
  const effects = choice.effects || {};
  if (choice.attack) delta += 5;
  if ((effects.military || 0) >= 8) delta += 2;
  if ((effects.hearts || 0) <= -8) delta += 4;
  if ((effects.economy || 0) <= -8) delta += 2;
  if ((effects.court || 0) >= 9 && (effects.hearts || 0) < 0) delta += 3;
  if ((effects.diplomacy || 0) <= -7) delta += 2;
  if (risk >= 0.5) delta += 2;
  if (!success) delta += 4;
  if ((effects.hearts || 0) >= 6) delta -= 4;
  if ((effects.diplomacy || 0) >= 7) delta -= 2;
  if ((effects.economy || 0) >= 8 && !choice.attack) delta -= 2;
  if (event.crisis) delta += 6;
  state.strain = clamp((state.strain || 0) + delta, 0, 100);
}

function healthLossThisTurn() {
  const body = constitutionOf();
  let loss = 1 + Math.floor(state.rulerAge / 38) + body.loss;
  if (state.rulerAge >= 58) loss += 1;
  if (state.rulerAge >= 70) loss += 2;
  if (state.stats.military > 82) loss += 1;
  if (state.stats.hearts < 34) loss += 1;
  if (state.stats.economy < 30) loss += 1;
  if (state.strain > 42) loss += 1;
  if (state.strain > 68) loss += 2;
  if (state.stats.hearts > 72 && state.stats.economy > 62) loss -= 2;
  if (state.stats.diplomacy > 74 && state.stats.military < 72) loss -= 1;
  return clamp(loss + Math.floor(Math.random() * 3) - 1, 0, 9);
}

function rulerLifeEvent() {
  const body = constitutionOf();
  const newReignDampener = (state.reignYears || 0) < 12 && state.stats.court >= 28 && state.stats.hearts >= 28 && state.strain < 86 ? 0.25 : 1;
  const coupChance = clamp((0.0005 + (state.stats.court < 34 ? 0.035 : 0) + (state.stats.hearts < 32 ? 0.025 : 0) + (state.strain > 70 ? 0.018 : 0)) * newReignDampener, 0, 0.12);
  if (Math.random() < coupChance) {
    const cause = state.stats.court < 30 ? "权臣架空，幽居而薨" : "宫中生变";
    prepareSuccession(cause, state.rulerAge < 58);
    return cause === "权臣架空，幽居而薨" ? "王为权臣所制，幽居而薨。" : "宫中生变，王暴崩，新君仓促即位。";
  }

  const ageRisk = state.rulerAge >= 78 ? 0.18 : state.rulerAge >= 70 ? 0.09 : state.rulerAge >= 60 ? 0.04 : state.rulerAge >= 50 ? 0.015 : 0.003;
  const healthRisk = state.health < 14 ? 0.26 : state.health < 28 ? 0.11 : state.health < 42 ? 0.035 : 0;
  const policyRisk = (state.strain || 0) / 900 + (state.stats.hearts < 30 ? 0.035 : 0) + (state.stats.military > 86 ? 0.025 : 0);
  const deathChance = clamp((ageRisk + healthRisk + policyRisk + body.early) * ((state.reignYears || 0) < 10 ? 0.55 : 1), 0.002, 0.42);

  if (Math.random() < deathChance) {
    const causes = [];
    if (state.stats.military > 82 || state.strain > 58) causes.push("劳于兵事");
    if (state.stats.hearts < 32) causes.push("忧民变");
    if (state.stats.court > 78 && state.stats.hearts < 42) causes.push("法急伤神");
    if (state.health < 25 || body.id === "frail") causes.push("宿疾复作");
    if (state.stats.court < 34 && Math.random() < 0.35) causes.push("权柄旁落，郁郁而终");
    if (!causes.length) causes.push(state.rulerAge >= 60 ? "年老疾作" : "暴疾");
    state.deathCause = pick(causes);
    const early = state.rulerAge < 52;
    prepareSuccession(state.deathCause, early);
    return early ? `未至老境而崩，史官记其${state.deathCause}。` : `王以${state.deathCause}崩，新君嗣位。`;
  }

  const longLifeChance = clamp(0.02 + body.long + (state.stats.hearts > 70 ? 0.04 : 0) + (state.stats.economy > 68 ? 0.03 : 0) - (state.strain || 0) / 500, 0, 0.18);
  if (state.rulerAge >= 56 && state.health >= 42 && Math.random() < longLifeChance) {
    const recovery = 6 + Math.floor(Math.random() * 7);
    state.health = clamp(state.health + recovery);
    state.strain = clamp((state.strain || 0) - 8);
    state.legacy.longLife += 1;
    state.chronicle.push(`${formatYear(state.year)}：王体康强，罢急役、近医官，群臣称寿。`);
    return "王体康强，医官称可久视朝政。";
  }

  if (state.health <= 8) {
    prepareSuccession("疾笃不起", state.rulerAge < 52);
    return "王疾笃不起，新君奉遗诏即位。";
  }

  return "";
}

function enactPolicy(policy, ctx, success) {
  const duration = success ? (policy.duration || 5) : Math.max(2, Math.ceil((policy.duration || 5) / 2));
  const resolved = {
    id: `${policy.id || policy.name}_${state.turn}`,
    name: fillText(policy.name || "临时方针", ctx),
    remaining: duration,
    enemy: policy.enemy ? (ctx[policy.enemy] || policy.enemy) : "",
    ally: policy.ally ? (ctx[policy.ally] || policy.ally) : "",
    effectsPerTurn: scaleEffects(policy.effectsPerTurn || {}, success ? 1 : -0.4),
    relationPerTurn: (policy.relationPerTurn || []).map((item) => ({
      target: ctx[item.target] || item.target,
      delta: Math.round(item.delta * (success ? 1 : -0.5)),
    })),
  };
  state.activePolicies = (state.activePolicies || []).filter((item) => item.name !== resolved.name);
  state.activePolicies.push(resolved);
  return `乃定「${resolved.name}」之策，行${duration}年。`;
}

function grantComebackMomentum(ctx = {}) {
  const enemy = ctx.enemy && countryCityCount(ctx.enemy) > 0 ? ctx.enemy : activePolicyTarget("enemy");
  const policy = {
    id: `comeback_momentum_${state.turn}`,
    name: "中兴之势",
    remaining: 8,
    enemy,
    ally: "",
    momentum: true,
    effectsPerTurn: { military: 3, hearts: 2, economy: 1 },
    relationPerTurn: enemy ? [{ target: enemy, delta: -4 }] : [],
  };
  state.activePolicies = (state.activePolicies || []).filter((item) => !item.momentum);
  state.activePolicies.push(policy);
  state.stats.military = clamp(state.stats.military + 8);
  state.stats.hearts = clamp(state.stats.hearts + 6);
  state.stats.economy = clamp(state.stats.economy + 4);
  return "国中士民复振，遂成「中兴之势」。";
}

function hasComebackMomentum() {
  return (state.activePolicies || []).some((policy) => policy.momentum && policy.remaining > 0);
}

function scaleEffects(effects, scale) {
  return Object.fromEntries(Object.entries(effects).map(([key, value]) => [key, Math.round(value * scale)]));
}

function applyActivePolicies() {
  state.activePolicies = state.activePolicies || [];
  const next = [];
  state.activePolicies.forEach((policy) => {
    if (policy.enemy && countryCityCount(policy.enemy) <= 0) policy.enemy = "";
    if (policy.ally && countryCityCount(policy.ally) <= 0) policy.ally = "";
    applyEffects(state.stats, policy.effectsPerTurn);
    (policy.relationPerTurn || []).forEach((item) => {
      if (countryCityCount(item.target) > 0) adjustRelation(item.target, item.delta);
    });
    policy.remaining -= 1;
    if (policy.remaining > 0) {
      next.push(policy);
    } else {
      state.chronicle.push(`${formatYear(state.year)}：「${policy.name}」之策期满，朝议复开。`);
    }
  });
  state.activePolicies = next;
}

function advanceTime() {
  state.turn += 1;
  state.year += 1;
  state.rulerAge += 1;
  state.reignYears = (state.reignYears || 0) + 1;
  state.health = clamp(state.health - healthLossThisTurn());
  state.strain = clamp((state.strain || 0) - (state.stats.hearts > 62 ? 2 : 1));

  Object.entries(state.stats).forEach(([key, value]) => {
    const drift = value > 70 ? -1 : value < 35 ? 2 : 0;
    state.stats[key] = clamp(value + drift);
  });
  applyActivePolicies();

  settleContestedCities();
  aiTurn();
  recordFallenStates();
  const lifeNote = rulerLifeEvent();
  saveGame();
  return lifeNote;
}

function aiTurn() {
  const pressure = endgamePressure();
  const pulses = 1 + (Math.random() < 0.5 + pressure * 0.2 ? 1 : 0) + (Math.random() < 0.12 + pressure * 0.18 ? 1 : 0);
  for (let i = 0; i < pulses; i += 1) {
    if (Math.random() < 0.24 - pressure * 0.08) aiCoalitionStrike();
    if (Math.random() < 0.42 + pressure * 0.24) aiAttackAi();
  }
  if (Math.random() < 0.38 + pressure * 0.16) aiAttackPlayer();
  if (Math.random() < 0.12 + pressure * 0.5 || aliveCountryNames(true).length > desiredAliveCountries()) aiConsolidateWeakState();
}

function endgamePressure() {
  if (state.turn < 120) return 0;
  return clamp((state.turn - 120) / (MAX_TURNS - 120), 0, 1);
}

function desiredAliveCountries() {
  if (state.turn >= 240) return 2;
  if (state.turn >= 220) return 3;
  if (state.turn >= 190) return 4;
  if (state.turn >= 160) return 5;
  if (state.turn >= 120) return 6;
  return 7;
}

function countryCityCount(country) {
  return cities.filter((city) => state.owners[city.id] === country).length;
}

function countryBaseCount(country) {
  return initialCountForCountry(country);
}

function aliveCountryNames(includePlayer = true) {
  return Object.keys(countries).filter((name) => (includePlayer || name !== state.country) && countryCityCount(name) > 0);
}

function aiCountryPower(country) {
  if (country === state.country) {
    return state.stats.military + playerCities().length * 5 + state.stats.economy * 0.18;
  }
  const count = countryCityCount(country);
  const capitalHeld = cities.some((city) => city.country === country && city.type === "都城" && state.owners[city.id] === country);
  const base = countryBaseCount(country);
  const overreach = Math.max(0, count - base - 3) * 5;
  return 42 + count * 7 + (capitalHeld ? 10 : -8) - overreach + Math.random() * 18;
}

function dominantCountry(includePlayer = true) {
  return aliveCountryNames(includePlayer)
    .map((name) => ({ name, count: countryCityCount(name), base: countryBaseCount(name) }))
    .sort((a, b) => (b.count - b.base * 0.45) - (a.count - a.base * 0.45))[0];
}

function borderTargetOwnedBy(owner, attacker, includeCapital = false) {
  const [ax, ay] = countryCenters[attacker];
  return cities
    .filter((city) => state.owners[city.id] === owner && (includeCapital || city.type !== "都城"))
    .sort((a, b) => {
      const scoreA = Math.hypot(a.x - ax, a.y - ay) + a.defense * 15 - a.value * 2;
      const scoreB = Math.hypot(b.x - ax, b.y - ay) + b.defense * 15 - b.value * 2;
      return scoreA - scoreB;
    })[0];
}

function aiAttackPlayer() {
  const vulnerable = playerCities().filter((city) => city.type !== "都城").sort((a, b) => a.defense - b.defense)[0];
  const hostile = Object.keys(countries)
    .filter((name) => name !== state.country && cities.some((city) => state.owners[city.id] === name))
    .sort((a, b) => (state.relations[state.country][a] ?? 0) - (state.relations[state.country][b] ?? 0))[0];
  if (!vulnerable || !hostile) return;

  const playerDominant = dominantCountry(true)?.name === state.country && playerCities().length >= countryBaseCount(state.country) + 4;
  const underdogShield = isPlayerUnderdog() ? 0.12 : 0;
  const momentumShield = hasComebackMomentum() ? 0.1 : 0;
  const danger = 0.08 + (state.stats.military < 44 ? 0.1 : 0) + (state.relations[state.country][hostile] < -30 ? 0.12 : 0) + (playerDominant ? 0.16 : 0) + (state.stats.diplomacy < 38 ? 0.05 : 0) - underdogShield - momentumShield;
  if (Math.random() < danger) {
    state.owners[vulnerable.id] = hostile;
    state.stats.hearts = clamp(state.stats.hearts - 5);
    state.stats.military = clamp(state.stats.military - 4);
    state.legacy.lostCities += 1;
    adjustRelation(hostile, -8);
    state.lastAction = { from: countryCenters[hostile], to: [vulnerable.x, vulnerable.y], cityId: vulnerable.id };
    state.chronicle.push(`${formatYear(state.year)}：${hostile}乘隙袭我，${vulnerable.name}陷。`);
  }
}

function aiAttackAi() {
  const aliveCountries = aliveCountryNames(false);
  const candidates = aliveCountries
    .filter((name) => name !== state.country)
    .map((name) => {
      const count = countryCityCount(name);
      const base = countryBaseCount(name);
      const underdog = count < base ? 0.7 : 0;
      const overgrownPenalty = count > base + 5 ? -1.2 : 0;
      return { name, weight: 1 + Math.random() * 2 + count * 0.12 + underdog + overgrownPenalty };
    })
    .sort((a, b) => b.weight - a.weight);
  const attacker = candidates[0]?.name;
  if (!attacker) return;

  const strong = dominantCountry(false);
  const neighborOptions = neighborsFor(attacker).filter((name) => name !== state.country && name !== attacker && countryCityCount(name) > 0);
  const targetOwner = (strong && strong.name !== attacker && neighborOptions.includes(strong.name) && Math.random() < 0.48)
    ? strong.name
    : neighborOptions
        .map((name) => ({
          name,
          weight: 1 + Math.max(0, countryCityCount(name) - countryCityCount(attacker)) * 0.22 + Math.random(),
        }))
        .sort((a, b) => b.weight - a.weight)[0]?.name;
  if (!targetOwner) return;
  const target = borderTargetOwnedBy(targetOwner, attacker);
  if (!target) return;

  const attackerCount = countryCityCount(attacker);
  const targetCount = countryCityCount(targetOwner);
  const underdogBonus = targetCount > attackerCount ? 0.03 : 0;
  const tinyRaiderPenalty = attackerCount <= 5 && targetCount >= attackerCount + 8 ? 0.12 : 0;
  const overreachPenalty = attackerCount > countryBaseCount(attacker) + 5 ? 0.1 : 0;
  const chance = clamp(0.16 + (aiCountryPower(attacker) - aiCountryPower(targetOwner)) / 310 + underdogBonus - overreachPenalty - tinyRaiderPenalty, 0.05, 0.34);
  if (Math.random() < chance) {
    state.owners[target.id] = attacker;
    markContested(target.id, targetOwner, attacker);
    state.lastAction = { from: countryCenters[attacker], to: [target.x, target.y], cityId: target.id };
    if (Math.random() < 0.62) {
      state.chronicle.push(`${formatYear(state.year)}：${attacker}攻${targetOwner}，取${target.name}，诸侯版图又变。`);
    }
  } else if (Math.random() < 0.32) {
    state.lastAction = { from: countryCenters[attacker], to: [target.x, target.y], cityId: target.id };
    state.chronicle.push(`${formatYear(state.year)}：${attacker}扰${targetOwner}边境，${target.name}烽火数起，城未易主。`);
  }
}

function aiCoalitionStrike() {
  const strong = dominantCountry(true);
  if (!strong || strong.count < strong.base + 4) return;
  const targetOwner = strong.name;
  const attackers = neighborsFor(targetOwner)
    .filter((name) => name !== targetOwner && name !== state.country && countryCityCount(name) > 0)
    .sort((a, b) => countryCityCount(a) - countryCityCount(b));
  const attacker = attackers[0];
  if (!attacker) return;
  const target = targetOwner === state.country ? playerCities().filter((city) => city.type !== "都城").sort((a, b) => a.defense - b.defense)[0] : borderTargetOwnedBy(targetOwner, attacker);
  if (!target) return;
  const chance = targetOwner === state.country
    ? clamp(0.16 + (playerCities().length - countryBaseCount(state.country)) / 80 - state.stats.diplomacy / 500, 0.08, 0.34)
    : clamp(0.28 + (strong.count - strong.base) / 80, 0.16, 0.5);
  if (Math.random() > chance) return;

  state.owners[target.id] = attacker;
  markContested(target.id, targetOwner, attacker);
  if (targetOwner === state.country) {
    state.stats.diplomacy = clamp(state.stats.diplomacy - 4);
    state.stats.hearts = clamp(state.stats.hearts - 3);
    state.legacy.lostCities += 1;
  }
  state.lastAction = { from: countryCenters[attacker], to: [target.x, target.y], cityId: target.id };
  state.chronicle.push(`${formatYear(state.year)}：诸国畏${targetOwner}坐大，${attacker}乘势取${target.name}。`);
}

function aiConsolidateWeakState() {
  const victims = aliveCountryNames(false)
    .map((name) => ({ name, count: countryCityCount(name), base: countryBaseCount(name) }))
    .filter((item) => item.count <= Math.max(2, Math.floor(item.base * (state.turn >= 190 ? 0.45 : 0.3))))
    .sort((a, b) => a.count - b.count || aiCountryPower(a.name) - aiCountryPower(b.name));
  const victim = victims[0]?.name;
  if (!victim) return;

  const attacker = neighborsFor(victim)
    .filter((name) => name !== victim && countryCityCount(name) > countryCityCount(victim))
    .sort((a, b) => aiCountryPower(b) - aiCountryPower(a))[0];
  if (!attacker) return;

  const takeCount = state.turn >= 220 ? 2 : 1;
  const taken = [];
  for (let i = 0; i < takeCount; i += 1) {
    const includeCapital = countryCityCount(victim) <= 1 || state.turn >= 220;
    const target = borderTargetOwnedBy(victim, attacker, includeCapital);
    if (!target) break;
    state.owners[target.id] = attacker;
    markContested(target.id, victim, attacker);
    taken.push(target.name);
    state.lastAction = { from: countryCenters[attacker], to: [target.x, target.y], cityId: target.id };
  }
  if (taken.length) {
    state.chronicle.push(`${formatYear(state.year)}：${attacker}并攻${victim}，取${taken.join("、")}，列国之数渐少。`);
  }
}

function recordFallenStates() {
  state.legacy.fallenStates = state.legacy.fallenStates || [];
  Object.keys(countries).forEach((name) => {
    if (name === state.country) return;
    if (countryCityCount(name) > 0 || state.legacy.fallenStates.includes(name)) return;
    state.legacy.fallenStates.push(name);
    state.chronicle.push(`${formatYear(state.year)}：${name}无复一城，社稷遂绝。`);
  });
}

const heirs = [
  { name: "贤能太子", text: "稳住朝政与民心", effects: { court: 8, hearts: 6 } },
  { name: "勇武公子", text: "军队拥戴，适合继续扩张", effects: { military: 9, hearts: -2 } },
  { name: "外戚幼主", text: "外交较顺，但朝中权臣变多", effects: { diplomacy: 8, court: -3 } },
];

function prepareSuccession(cause = "病重去世", early = false) {
  if (state.pendingSuccession) return;
  const epitaph = evaluateRulerEpitaph(cause, early);
  state.pendingSuccession = {
    cause,
    early,
    age: state.rulerAge,
    generation: state.generation,
    reignYears: state.reignYears || Math.max(1, state.rulerAge - 25),
    stats: structuredClone(state.stats),
    territory: playerCities().length,
    epitaph,
  };
  state.legacy.rulers.push(state.pendingSuccession);
  if (early) state.legacy.earlyDeaths += 1;
  state.chronicle.push(`${formatYear(state.year)}：第${state.generation}世君主去世，谥曰${epitaph.name}。${epitaph.short}`);
}

function evaluateRulerEpitaph(cause, early) {
  const territory = playerCities().length;
  const baseTerritory = state.reignStartTerritory ?? territory;
  const avg = Math.round(Object.values(state.stats).reduce((sum, value) => sum + value, 0) / 5);
  let word = "安";
  let reason = posthumousReason(word);
  if (cause.includes("架空") || cause.includes("宫中")) word = "幽";
  if (word === "幽") reason = posthumousReason(word);
  else if (early) {
    word = "悼";
    reason = posthumousReason(word);
  } else if (territory >= baseTerritory + 6 && state.legacy.battles >= 3) {
    word = "武";
    reason = posthumousReason(word);
  } else if (state.legacy.reforms >= 2) {
    word = "明";
    reason = posthumousReason(word);
  } else if (state.stats.hearts >= 70) {
    word = "惠";
    reason = posthumousReason(word);
  } else if (avg >= 68) {
    word = "昭";
    reason = posthumousReason(word);
  } else if (state.legacy.lostCities >= 3) {
    word = "愍";
    reason = posthumousReason(word);
  }

  const wordOptions = posthumousCandidates(word);
  const uniqueWord = uniquePosthumous(wordOptions);
  reason = posthumousReasonFor(uniqueWord);
  const name = `${state.country}${uniqueWord}王`;
  const short = `在位${state.reignYears || 1}年，享年${state.rulerAge}岁，死因：${readable(cause)}。`;
  const gains = territory - baseTerritory;
  const territoryLine = gains > 0
    ? `终有城${territory}，较即位时增${gains}。`
    : gains < 0
      ? `终有城${territory}，较即位时失${Math.abs(gains)}。`
      : `终有城${territory}，与即位时疆域相若。`;
  const policyLine = state.stats.hearts < 38
    ? "民心不固，虽有兵威，根本未安。"
    : state.stats.court > 70
      ? "法令颇行，然急政之弊亦随之。"
      : state.stats.diplomacy > 70
        ? "能周旋诸国，借势以存。"
        : "其政有得有失，未可一言尽之。";
  const summary = `史臣曰：王承国于多事之秋，${territoryLine}国力均势${avg}。${policyLine}${reason}`;
  return { name, word: uniqueWord, short, summary, reason };
}

function renderSuccessionPanel() {
  const panel = $("#successionPanel");
  if (!state.pendingSuccession) {
    panel.hidden = true;
    $("#nextTurnBtn").hidden = false;
    return;
  }
  const epitaph = state.pendingSuccession.epitaph;
  panel.hidden = false;
  $("#nextTurnBtn").hidden = true;
  $("#successionTitle").textContent = `先王定谥：${epitaph.name}`;
  $("#successionText").textContent = readable(`${epitaph.short}${epitaph.summary} 可止书于此，亦可立嗣君以续国命。`);
  $("#heirChoices").innerHTML = heirs.map((heir, index) => `<button class="choice-btn" type="button" data-heir="${index}">
    <span class="risk-mark risk-mid">嗣</span>
    <span>${heir.name}：${heir.text}</span>
  </button>`).join("");
}

function inheritThrone(heirIndex = 0) {
  const heir = heirs[heirIndex] || heirs[0];
  const nextRuler = randomRulerProfile();
  applyEffects(state.stats, heir.effects);
  state.health = nextRuler.health;
  state.rulerAge = nextRuler.age;
  state.constitution = nextRuler.constitution;
  state.constitutionName = nextRuler.constitutionName;
  state.strain = 0;
  state.reignYears = 0;
  state.reignStartTerritory = playerCities().length;
  state.generation += 1;
  state.pendingSuccession = null;
  state.chronicle.push(`${formatYear(state.year)}：${heir.name}即位，体质${nextRuler.constitutionName}，故事继续。`);
}

function renderStatsOnly() {
  migrateState();
  $("#turnLabel").textContent = `${formatYear(state.year)} · 第${Math.min(state.turn, state.maxTurns)}回合 · 第${state.generation}世 · 君${state.rulerAge}岁`;
  $("#territoryCount").textContent = `城池 ${playerCities().length}`;
  $("#legacyHint").textContent = legacyTitle();
  $("#statsMount").innerHTML = Object.entries(statMeta)
    .map(([key, label]) => `<div class="stat"><span>${label}</span><strong>${state.stats[key]}</strong></div>`)
    .join("");
  $("#healthMeter").style.width = `${state.health}%`;
  $("#healthLabel").textContent = `${Math.round(state.health)} · ${state.constitutionName}`;
  renderPolicyMount();
}

function isDefeated() {
  return playerCities().length === 0;
}

function terminalSettlement() {
  const territory = playerCities().length;
  const avg = Math.round(Object.values(state.stats).reduce((sum, value) => sum + value, 0) / 5);
  const alive = aliveCountryNames(true);
  const leader = dominantCountry(true);
  const momentum = hasComebackMomentum();
  if (territory >= (momentum ? 36 : CONQUEST_TARGET) || alive.length <= 1) return "天下一统";
  if ((state.turn >= ENDGAME_TURN || momentum) && territory >= (momentum ? 30 : 34) && leader?.name === state.country) return "战国霸主";
  if (state.turn < MAX_TURNS) return "";
  if (leader?.name === state.country && (territory >= 24 || avg >= 70)) return "战国霸主";
  if (territory <= Math.max(6, Math.floor(cities.length * 0.14)) || avg < 42) return "亡国";
  return "偏安终局";
}

function nextTurn() {
  if (state.pendingSuccession) {
    renderSuccessionPanel();
    return;
  }
  const terminal = terminalSettlement();
  if (terminal) {
    endGame(terminal);
    return;
  }
  renderGame();
}

function legacyTitle() {
  const count = playerCities().length;
  if (count >= 26) return "霸业已成";
  if (state.legacy.reforms >= 2) return "法度渐立";
  if (state.stats.hearts >= 75) return "民心归附";
  if (state.stats.diplomacy >= 75) return "诸侯信服";
  if (state.legacy.lostCities >= 3) return "国势多艰";
  return "尚未有定评";
}

function endGame(forced = "") {
  const result = evaluateEnding(forced);
  localStorage.removeItem(storageKey);
  $("#endingTitle").textContent = `谥曰：${state.country}${result.posthumous}王`;
  $("#endingSummary").textContent = result.summary;
  $("#endingGrades").innerHTML = result.grades.map((grade) => `<div class="grade"><span>${grade.label}</span><strong>${grade.value}</strong></div>`).join("");
  $("#endingChronicle").textContent = result.chronicle;
  $("#endingAfterword").textContent = result.afterword;
  screen("#endingScreen");
}

function migrateState() {
  if (!state) return;
  if (!state.constitution) {
    const ruler = randomRulerProfile();
    state.constitution = ruler.constitution;
    state.constitutionName = ruler.constitutionName;
    state.strain = 0;
    state.reignYears = 0;
  }
  if (!state.constitutionName) {
    state.constitutionName = constitutionOf(state).name;
  }
  state.legacy = {
    battles: 0,
    reforms: 0,
    mercy: 0,
    betrayals: 0,
    lostCities: 0,
    earlyDeaths: 0,
    longLife: 0,
    fallenStates: [],
    rulers: [],
    ...(state.legacy || {}),
  };
  state.owners = state.owners || {};
  cities.forEach((city) => {
    if (!state.owners[city.id]) state.owners[city.id] = city.country;
  });
  state.initialOwners = state.initialOwners || initialOwnersForEra(state.era || "early");
  state.triggered = state.triggered || [];
  state.majorTriggered = state.majorTriggered || state.triggered.filter((id) => majorEvents.some((event) => event.id === id));
  state.lastMajorTurn = state.lastMajorTurn || 0;
  state.activePolicies = state.activePolicies || [];
  state.activePolicies.forEach((policy) => {
    if (policy.name === "中兴之势") policy.momentum = true;
  });
  state.maxTurns = MAX_TURNS;
  state.strain = clamp(state.strain || 0);
  state.reignYears = state.reignYears || 0;
  if (typeof state.reignStartTerritory !== "number") state.reignStartTerritory = playerCities().length;
  state.chainQueue = state.chainQueue || [];
  state.contestedCities = state.contestedCities || [];
}

function posthumousReason(word) {
  const reasons = {
    安: "能守宗社，未有大失，故谥曰安。",
    幽: "内受权臣宫变之祸，身没而政晦，故谥曰幽。",
    悼: "在位未久，志业未竟而早终，国人悼惜，故谥曰悼。",
    武: "能用兵拓土，使国威外振，故谥曰武。",
    明: "能修法度、明政令，使国政稍清，故谥曰明。",
    惠: "轻徭恤民，百姓多附，故谥曰惠。",
    昭: "国势明盛，诸政皆有可观，故谥曰昭。",
    愍: "失地频仍，国势多艰，后人哀之，故谥曰愍。",
    桓: "能定大业、服诸侯，使国命有归，故谥曰桓。",
    烈: "用兵甚锐，功烈可称，而其政多急，故谥曰烈。",
    文: "能修文德、安百姓，使国中有治，故谥曰文。",
    宣: "能布信义、合诸国，使邦交有名，故谥曰宣。",
    康: "能息兵养民，使国中小康，故谥曰康。",
    定: "能定乱守成，使邦内少安，故谥曰定。",
    简: "政尚简约，不苛于民，故谥曰简。",
    景: "守成有光，遗泽可称，故谥曰景。",
    襄: "辅成前业，拓境有功，故谥曰襄。",
    成: "能成其志，使国有所立，故谥曰成。",
    穆: "内修礼法，外睦诸邦，故谥曰穆。",
    靖: "能靖边患、息兵安众，故谥曰靖。",
    怀: "失势被制，终身怀忧，故谥曰怀。",
    厉: "政急刑重，民多畏怨，故谥曰厉。",
    灵: "好变多奇，政迹驳杂，故谥曰灵。",
    庄: "临事能断，威仪可观，故谥曰庄。",
    平: "能平内难，使社稷未倾，故谥曰平。",
    睿: "察事能远，谋略有见，故谥曰睿。",
    献: "能献策兴邦，损己益国，故谥曰献。",
    肃: "持法整军，朝野知畏，故谥曰肃。",
    威: "以兵威服敌，使诸侯知惧，故谥曰威。",
  };
  return reasons[word] || `以其行事定谥，故谥曰${word}。`;
}

function posthumousReasonFor(word) {
  if (word.length <= 1) return posthumousReason(word);
  return [...word].map((char) => {
    const reason = posthumousReason(char);
    return reason.replace(`故谥曰${char}。`, `取「${char}」义。`);
  }).join("");
}

function usedPosthumousWords() {
  return new Set((state.legacy.rulers || []).map((ruler) => ruler.epitaph?.word || ruler.epitaph?.name?.replace(`${state.country}`, "").replace("王", "")).filter(Boolean));
}

function posthumousSinglePool() {
  return ["安", "幽", "悼", "武", "明", "惠", "昭", "愍", "桓", "烈", "文", "宣", "康", "定", "简", "景", "襄", "成", "穆", "靖", "怀", "厉", "灵", "庄", "平", "睿", "献", "肃", "威"];
}

function posthumousCandidates(primary) {
  const secondary = [];
  if (state.legacy.battles >= 3 || state.stats.military >= 72) secondary.push("武");
  if (state.stats.hearts >= 65) secondary.push("惠");
  if (state.stats.court >= 68 || state.legacy.reforms >= 2) secondary.push("明");
  if (state.stats.diplomacy >= 68) secondary.push("宣");
  if (state.stats.economy >= 68) secondary.push("文");
  if (state.legacy.lostCities >= 3) secondary.push("愍");
  if (state.legacy.earlyDeaths >= 1) secondary.push("悼");

  const base = [primary, ...secondary.filter((word) => word !== primary)];
  const doubles = base.flatMap((word) => secondary
    .filter((other) => other !== word)
    .map((other) => `${word}${other}`));
  const singles = posthumousSinglePool().filter((word) => !base.includes(word));
  const singleDoubles = base.flatMap((word) => singles.map((other) => `${word}${other}`));
  return [...new Set([...base, ...doubles, ...singles, ...singleDoubles])];
}

function uniquePosthumous(candidates) {
  const used = usedPosthumousWords();
  const direct = candidates.find((word) => !used.has(word));
  if (direct) return direct;

  const roots = [...new Set([...candidates.flatMap((word) => [...word]), ...posthumousSinglePool()])];
  for (const left of roots) {
    for (const right of posthumousSinglePool()) {
      const word = `${left}${right}`;
      if (!used.has(word)) return word;
    }
  }
  return candidates[0];
}

function evaluateEnding(forced) {
  const territory = playerCities().length;
  const avg = Math.round(Object.values(state.stats).reduce((sum, value) => sum + value, 0) / 5);
  const conquered = territory - cities.filter((city) => city.country === state.country).length;

  let ending = "守成";
  let posthumous = "安";
  if (forced === "亡国" || territory <= 1) {
    ending = "亡国";
    posthumous = "愍";
  } else if (forced === "天下一统" || territory >= CONQUEST_TARGET) {
    ending = "天下一统";
    posthumous = state.legacy.betrayals > 3 ? "武" : "桓";
  } else if (forced === "战国霸主" || territory >= 26 || conquered >= 14) {
    ending = "战国霸主";
    posthumous = state.stats.hearts < 35 ? "烈" : "昭";
  } else if (forced === "偏安终局") {
    ending = "偏安终局";
    posthumous = avg >= 58 ? "安" : "愍";
  } else if (avg >= 72 && state.stats.hearts >= 65) {
    ending = "治世";
    posthumous = state.legacy.reforms >= 2 ? "明" : "文";
  } else if (state.stats.diplomacy >= 78) {
    ending = "合纵名主";
    posthumous = "宣";
  } else if (state.legacy.lostCities >= 4) {
    ending = "艰难守国";
    posthumous = "悼";
  }

  const uniquePosthumousWord = uniquePosthumous(posthumousCandidates(posthumous));
  posthumous = uniquePosthumousWord;
  const stars = forced === "亡国" ? "一等" : ending === "天下一统" ? "五等" : ending === "战国霸主" || avg >= 72 ? "四等" : avg >= 56 ? "三等" : "二等";
  const reason = posthumousReasonFor(posthumous);
  const summary = `定局曰：${ending}。历${state.turn - 1}年，传${state.generation}世，终有城${territory}，国势约${avg}。${reason}`;
  const lifeLine = state.legacy.earlyDeaths
    ? `其间早崩${state.legacy.earlyDeaths}次，国策之急亦伤君寿。`
    : state.legacy.longLife
      ? `其君能久视朝政，休养之策亦延其寿。`
      : `君寿随国势起落，未离兵民财法之牵制。`;
  const majorLine = state.majorTriggered?.length ? `大事${state.majorTriggered.length}起，皆撼诸侯之势。` : "";
  const chronicle = `太史公曰：王起于${formatYear(eras.find((era) => era.id === state.era).year)}，承${state.country}国之命。兵威${state.stats.military}，财赋${state.stats.economy}，民心${state.stats.hearts}，朝政${state.stats.court}，邦交${state.stats.diplomacy}。取地${Math.max(0, conquered)}，失地${state.legacy.lostCities}。${majorLine}${lifeLine}用兵有功，急政有怨，恤民可以久安；其兴其替，皆决于一念之间。`;
  const afterword = ending === "亡国"
    ? `《${state.country}世家》载：其君非无志也，然兵、财、民、臣、邻五者俱困，故社稷不守。后世读之，叹强弱之势，非一怒所能回也。`
    : `《${state.country}世家》载：其君处诸侯交逼之时，能择利害、忍毁誉。后世或称其权变，或讥其失仁，然皆谓其能改一国之命。`;

  return {
    posthumous,
    summary,
    chronicle,
    afterword,
    grades: [
      { label: "定局", value: ending },
      { label: "史评", value: stars },
      { label: "疆域", value: territory },
      { label: "国势", value: avg },
    ],
  };
}

function saveGame() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return false;
  state = JSON.parse(raw);
  migrateState();
  screen("#gameScreen");
  if (state.pendingSuccession) {
    renderStatsOnly();
    renderMap();
    renderChronicle();
    $("#eventCard").hidden = true;
    $("#resultCard").hidden = false;
    $("#resultTag").textContent = "先王已逝";
    $("#resultText").textContent = "旧档停在君主去世之后，请选择作结或立新君继续。";
    renderSuccessionPanel();
  } else {
    renderGame();
  }
  return true;
}

function bindEvents() {
  $("#startBtn").addEventListener("click", () => {
    createGame();
    screen("#gameScreen");
    renderGame();
    saveGame();
  });
  $("#continueBtn").addEventListener("click", loadGame);
  $("#restartBtn").addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    screen("#startScreen");
    initSetup();
  });
  $("#saveBtn").addEventListener("click", () => {
    saveGame();
    $("#saveBtn").textContent = "已";
    setTimeout(() => {
      $("#saveBtn").textContent = "存";
    }, 700);
  });
  $("#choicesMount").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-choice]");
    if (!btn) return;
    resolveChoice(Number(btn.dataset.choice));
  });
  $("#nextTurnBtn").addEventListener("click", nextTurn);
  $("#heirChoices").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-heir]");
    if (!btn) return;
    inheritThrone(Number(btn.dataset.heir));
    saveGame();
    renderGame();
  });
  $("#endReignBtn").addEventListener("click", () => {
    endGame("作结");
  });
  $("#endingRestartBtn").addEventListener("click", () => {
    state = null;
    screen("#startScreen");
    initSetup();
  });
}

initSetup();
bindEvents();
