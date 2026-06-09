const COUNTRIES = {
  "秦": {
    name: "秦", color: "#3a3a3a", highlight: "#8a8a8a",
    desc: "西陲虎狼之国，据函谷之险，有并吞天下之势",
    base: { military: 70, economy: 55, diplomacy: 40, governance: 65, morale: 60 },
    ai: { aggression: 80, diplomacy: 30, reform: 75 },
    cities: ["雍城","咸阳","栎阳","蓝田","郑","汉中","南郑","武城","商於","义渠"],
    capital: "咸阳",
    neighbors: ["魏","韩","楚","赵"],
    startX: 120, startY: 280
  },
  "齐": {
    name: "齐", color: "#1a6b3c", highlight: "#2a9d5c",
    desc: "东海之滨，鱼盐之利，稷下学宫冠绝天下",
    base: { military: 55, economy: 80, diplomacy: 60, governance: 65, morale: 65 },
    ai: { aggression: 35, diplomacy: 70, reform: 50 },
    cities: ["临淄","即墨","莒","薄姑","聊城","高唐","平陆","薛","安阳","襄陵"],
    capital: "临淄",
    neighbors: ["赵","魏","楚","燕"],
    startX: 580, startY: 220
  },
  "楚": {
    name: "楚", color: "#8b1a1a", highlight: "#c62828",
    desc: "南方大国，地方五千里，带甲百万，然贵族割据",
    base: { military: 65, economy: 60, diplomacy: 50, governance: 40, morale: 50 },
    ai: { aggression: 50, diplomacy: 45, reform: 30 },
    cities: ["郢都","陈","寿春","鄢","江陵","黔中","巫郡","宛","上蔡","召陵"],
    capital: "郢都",
    neighbors: ["秦","韩","魏","齐","燕"],
    startX: 380, startY: 420
  },
  "赵": {
    name: "赵", color: "#5c3d8f", highlight: "#7e57c2",
    desc: "四战之地，胡服骑射，北抗匈奴",
    base: { military: 70, economy: 50, diplomacy: 55, governance: 55, morale: 65 },
    ai: { aggression: 60, diplomacy: 50, reform: 65 },
    cities: ["邯郸","晋阳","代","中牟","蔺","离石","阏与","长平","上党","房子"],
    capital: "邯郸",
    neighbors: ["秦","魏","韩","齐","燕"],
    startX: 380, startY: 180
  },
  "魏": {
    name: "魏", color: "#da8a20", highlight: "#f5b642",
    desc: "中原腹地，人才济济，然四面受敌无险可守",
    base: { military: 60, economy: 65, diplomacy: 55, governance: 70, morale: 60 },
    ai: { aggression: 55, diplomacy: 55, reform: 60 },
    cities: ["安邑","大梁","邺","河内","少梁","阴晋","酸枣","襄陵","观","卷"],
    capital: "大梁",
    neighbors: ["秦","赵","韩","齐","楚"],
    startX: 350, startY: 280
  },
  "韩": {
    name: "韩", color: "#1e8a7a", highlight: "#3db8a0",
    desc: "天下之枢，冶铁术冠绝诸侯，然地狭兵弱",
    base: { military: 45, economy: 55, diplomacy: 70, governance: 60, morale: 55 },
    ai: { aggression: 30, diplomacy: 80, reform: 55 },
    cities: ["平阳","阳翟","新郑","宜阳","宛","缑氏","纶","野王","上党","负黍"],
    capital: "新郑",
    neighbors: ["秦","魏","赵","楚"],
    startX: 340, startY: 340
  },
  "燕": {
    name: "燕", color: "#2e5090", highlight: "#4a7cc9",
    desc: "北方苦寒之地，偏远安全，然发展缓慢",
    base: { military: 50, economy: 45, diplomacy: 55, governance: 60, morale: 65 },
    ai: { aggression: 35, diplomacy: 50, reform: 40 },
    cities: ["蓟","武阳","辽阳","渔阳","上谷","右北平","令支","方城","涿","易"],
    capital: "蓟",
    neighbors: ["赵","齐"],
    startX: 480, startY: 100
  }
};

const ERAS = [
  {
    id: 1, name: "三家分晋", year: -403, endYear: -223,
    desc: "周天子册封三晋为诸侯，七雄格局正式形成。大争之世，由此开端。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  },
  {
    id: 2, name: "围魏救赵", year: -354, endYear: -174,
    desc: "魏围邯郸，齐以「批亢捣虚」之策直趋大梁。桂陵、马陵两战，天下格局剧变。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  },
  {
    id: 3, name: "合纵连横", year: -318, endYear: -138,
    desc: "苏秦佩六国相印合纵攻秦，张仪连横破之。纵横捭阖，唇齿相依。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  },
  {
    id: 4, name: "白起拔郢", year: -278, endYear: -98,
    desc: "秦将白起攻破楚都郢，楚国被迫东迁。秦势如破竹，天下震恐。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  },
  {
    id: 5, name: "长平决战", year: -260, endYear: -80,
    desc: "长平之战前夕，秦赵争锋，天下命运悬于一线。最后的决战即将开始。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  },
  {
    id: 6, name: "秦灭六国", year: -230, endYear: -50,
    desc: "秦王政十七年，内史腾灭韩。秦以摧枯拉朽之势逐一吞并六国。天下一统，不可逆转。",
    countries: ["秦","齐","楚","赵","魏","韩","燕"],
    special: ""
  }
];

const CITY_CONNECTIONS = [
  ["咸阳","栎阳"],["咸阳","雍城"],["咸阳","蓝田"],["咸阳","汉中"],
  ["栎阳","少梁"],["蓝田","商於"],["蓝田","武城"],
  ["汉中","南郑"],["汉中","黔中"],
  ["雍城","义渠"],
  ["少梁","阴晋"],["少梁","安邑"],
  ["阴晋","商於"],
  ["安邑","大梁"],["安邑","河内"],
  ["大梁","酸枣"],["大梁","襄陵"],["大梁","邺"],
  ["河内","邺"],["河内","卷"],
  ["酸枣","观"],["襄陵","观"],["襄陵","平陆"],
  ["卷","酸枣"],
  ["邺","邯郸"],["邺","房子"],
  ["邯郸","中牟"],["邯郸","阏与"],["邯郸","长平"],
  ["中牟","晋阳"],
  ["晋阳","代"],["晋阳","离石"],["晋阳","蔺"],
  ["离石","蔺"],
  ["长平","上党"],["长平","阏与"],
  ["上党","平阳"],["上党","房子"],
  ["平阳","阳翟"],["平阳","新郑"],
  ["阳翟","新郑"],["阳翟","宛"],
  ["新郑","宜阳"],["新郑","负黍"],
  ["宜阳","郑"],["宜阳","缑氏"],
  ["郑","少梁"],
  ["宛","召陵"],["宛","上蔡"],
  ["郢都","鄢"],["郢都","江陵"],
  ["鄢","上蔡"],["鄢","宛"],
  ["江陵","黔中"],["江陵","巫郡"],
  ["陈","上蔡"],["陈","召陵"],
  ["寿春","陈"],
  ["临淄","薄姑"],["临淄","聊城"],["临淄","平陆"],
  ["即墨","聊城"],["即墨","莒"],["即墨","安阳"],
  ["莒","薛"],
  ["聊城","高唐"],["聊城","安阳"],
  ["高唐","平陆"],
  ["薛","襄陵"],["薛","安阳"],
  ["蓟","武阳"],["蓟","涿"],["蓟","渔阳"],
  ["武阳","易"],["武阳","方城"],
  ["易","涿"],
  ["渔阳","上谷"],["上谷","右北平"],
  ["右北平","令支"],
  ["方城","令支"],
  ["房子","代"],
  ["房子","平阳"],
  ["安阳","薄姑"],
  ["南郑","武城"],
  ["缑氏","纶"],
  ["纶","负黍"],
  ["野王","上党"],["野王","平阳"],
  ["辽阳","右北平"],
  ["涿","方城"]
];

const SEASONS = ["春","夏","秋","冬"];

// 城池特性 — defense(城防1-10), importance(重要性1-10), type(类型)
const CITY_CHARACTERISTICS = {
  // 秦 — 西陲要塞密集
  "咸阳":{defense:9,importance:10,type:"都城"}, "雍城":{defense:8,importance:7,type:"旧都"},
  "栎阳":{defense:6,importance:6,type:"要塞"}, "蓝田":{defense:5,importance:5,type:"关口"},
  "郑":{defense:7,importance:7,type:"边城"}, "汉中":{defense:7,importance:8,type:"粮仓"},
  "南郑":{defense:5,importance:5,type:"边城"}, "武城":{defense:6,importance:5,type:"要塞"},
  "商於":{defense:8,importance:8,type:"关口"}, "义渠":{defense:4,importance:3,type:"边城"},
  // 赵 — 北疆要塞
  "邯郸":{defense:8,importance:10,type:"都城"}, "晋阳":{defense:9,importance:8,type:"重镇"},
  "代":{defense:6,importance:5,type:"边城"}, "中牟":{defense:5,importance:5,type:"普通"},
  "蔺":{defense:6,importance:6,type:"边城"}, "离石":{defense:5,importance:5,type:"边城"},
  "阏与":{defense:7,importance:7,type:"险关"}, "长平":{defense:8,importance:9,type:"险关"},
  "上党":{defense:7,importance:9,type:"重镇"}, "房子":{defense:4,importance:4,type:"普通"},
  // 魏 — 中原四战
  "大梁":{defense:6,importance:10,type:"都城"}, "安邑":{defense:7,importance:8,type:"旧都"},
  "邺":{defense:5,importance:6,type:"重镇"}, "河内":{defense:5,importance:7,type:"粮仓"},
  "少梁":{defense:8,importance:7,type:"关口"}, "阴晋":{defense:7,importance:6,type:"要塞"},
  "酸枣":{defense:4,importance:4,type:"普通"}, "襄陵":{defense:5,importance:5,type:"普通"},
  "观":{defense:5,importance:5,type:"边城"}, "卷":{defense:4,importance:4,type:"普通"},
  // 韩 — 险关冶铁
  "新郑":{defense:6,importance:9,type:"都城"}, "平阳":{defense:5,importance:6,type:"重镇"},
  "阳翟":{defense:5,importance:6,type:"重镇"}, "宜阳":{defense:8,importance:8,type:"铁城"},
  "宛":{defense:6,importance:7,type:"铁城"}, "缑氏":{defense:6,importance:5,type:"要塞"},
  "纶":{defense:4,importance:4,type:"普通"}, "野王":{defense:7,importance:7,type:"险关"},
  "负黍":{defense:4,importance:4,type:"普通"},
  // 楚 — 南国广袤
  "郢都":{defense:7,importance:10,type:"都城"}, "陈":{defense:6,importance:7,type:"陪都"},
  "寿春":{defense:5,importance:8,type:"陪都"}, "鄢":{defense:6,importance:7,type:"重镇"},
  "江陵":{defense:5,importance:6,type:"重镇"}, "黔中":{defense:4,importance:4,type:"边城"},
  "巫郡":{defense:7,importance:6,type:"险关"}, "上蔡":{defense:5,importance:5,type:"普通"},
  "召陵":{defense:4,importance:4,type:"普通"},
  // 齐 — 富庶鱼盐
  "临淄":{defense:5,importance:10,type:"都城"}, "即墨":{defense:7,importance:8,type:"重镇"},
  "莒":{defense:7,importance:7,type:"重镇"}, "薄姑":{defense:4,importance:4,type:"普通"},
  "聊城":{defense:5,importance:6,type:"重镇"}, "高唐":{defense:5,importance:5,type:"普通"},
  "平陆":{defense:5,importance:5,type:"边城"}, "薛":{defense:4,importance:4,type:"普通"},
  "安阳":{defense:5,importance:5,type:"重镇"},
  // 燕 — 北疆险远
  "蓟":{defense:6,importance:10,type:"都城"}, "武阳":{defense:5,importance:7,type:"重镇"},
  "辽阳":{defense:4,importance:4,type:"边城"}, "渔阳":{defense:5,importance:5,type:"边城"},
  "上谷":{defense:4,importance:4,type:"边城"}, "右北平":{defense:4,importance:3,type:"边城"},
  "令支":{defense:4,importance:3,type:"边城"}, "方城":{defense:6,importance:6,type:"要塞"},
  "涿":{defense:5,importance:5,type:"普通"}, "易":{defense:6,importance:7,type:"要塞"},
};

// 攻城概率计算：军力×城防×计策×环境叠加
function calcCaptureChance(attackerMil, cityName, strategyBonus = 0, season = '春') {
  const city = CITY_CHARACTERISTICS[cityName] || { defense: 5, importance: 5, type: '普通' };
  // 基础概率 = 军力/200（0~0.5）
  const base = attackerMil / 200;
  // 城防系数：防御越高越难 （0.4~1.0）
  const defenseMod = 1 - (city.defense / 25);
  // 计策加成 （0~0.2）
  const strategyMod = strategyBonus / 50;
  // 季节影响
  const seasonMod = { '春': 0, '夏': 0.05, '秋': -0.05, '冬': -0.1 }[season] || 0;

  return Math.max(0.05, Math.min(0.85, base + defenseMod * 0.2 + strategyMod + seasonMod));
}

// 动态风险计算：基础风险 + 国力修正
function calcDynamicRisk(baseRisk, player, characters = []) {
  if (baseRisk <= 0) return 0;
  let risk = baseRisk;
  risk -= (player.military - 50) * 0.0015;
  risk += (50 - player.morale) * 0.0015;
  risk -= (player.governance - 50) * 0.001;
  risk -= (player.economy - 50) * 0.0008;
  risk += characters.filter(c => c.currentLoyalty < 40).length * 0.015;
  return Math.max(0.02, Math.min(0.92, risk));
}
