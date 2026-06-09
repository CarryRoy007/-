const Epitaph = {
  generate() {
    const player = GameState.getPlayer();
    const country = GameState.playerCountry;
    const turn = GameState.turn;
    const citiesNow = GameState.getCityCount(country);
    const totalCities = GameState.getTotalCities();
    const initialCities = COUNTRIES[country].cities.length;
    const citiesGained = citiesNow - initialCities;
    const alive = GameState.countries[country].alive;
    const allCountries = Object.values(GameState.countries);
    const deadCountries = allCountries.filter(c => !c.alive && c.name !== country);
    const countriesDestroyed = deadCountries.map(c => c.name);
    const stats = {
      military: player.military, economy: player.economy,
      diplomacy: player.diplomacy, governance: player.governance, morale: player.morale
    };
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const topStat = sorted[0];
    const bottomStat = sorted[sorted.length - 1];
    const avgStat = Object.values(stats).reduce((a, b) => a + b, 0) / 5;

    let mainEpitaph = '', mainMeaning = '', subEpitaph = '', stars = 3, ratingText = '', legacyText = '';

    // ── Primary epitaph determination ──
    if (!alive) {
      mainEpitaph = '愍'; mainMeaning = '在国遭忧曰愍'; stars = 1; ratingText = '亡国之君';
    } else if (GameState.rulerFate) {
      const fate = GameState.rulerFate;
      if (fate.type === '被弑' || fate.type === '被毒杀') {
        mainEpitaph = '厉'; mainMeaning = '暴虐无亲曰厉'; stars = 2; ratingText = '不得善终';
      } else if (fate.type === '被掳' || fate.type === '出使被扣') {
        mainEpitaph = '怀'; mainMeaning = '失位而死曰怀'; stars = 2; ratingText = '身陷囹圄';
      } else if (fate.type === '被架空' || fate.type === '退位') {
        mainEpitaph = '隐'; mainMeaning = '不显尸国曰隐'; stars = 2; ratingText = '权柄旁落';
      } else if (fate.type === '积劳成疾' || fate.type === '病逝') {
        if (avgStat >= 70) { mainEpitaph = '勤'; mainMeaning = '夙夜匪懈曰勤'; stars = 4; ratingText = '鞠躬尽瘁'; }
        else if (avgStat >= 50) { mainEpitaph = '景'; mainMeaning = '由义而济曰景'; stars = 3; ratingText = '壮年而殁'; }
        else { mainEpitaph = '悼'; mainMeaning = '中年早夭曰悼'; stars = 2; ratingText = '英年早逝'; }
      } else if (fate.type === '宫变被弑') {
        mainEpitaph = '幽'; mainMeaning = '壅遏不通曰幽'; stars = 1; ratingText = '众叛亲离';
      } else {
        mainEpitaph = '悼'; mainMeaning = '中年早夭曰悼'; stars = 2; ratingText = '不得其终';
      }
    } else if (citiesNow >= totalCities * 0.85) {
      mainEpitaph = '武'; mainMeaning = '克定祸乱曰武，辟土斥境曰武'; stars = 5; ratingText = '一统寰宇';
      if (avgStat >= 75) { subEpitaph = '桓'; }
    } else if (citiesNow >= totalCities * 0.6) {
      if (topStat[0] === 'military') { mainEpitaph = '桓'; mainMeaning = '辟土服远曰桓，武定四方曰桓'; }
      else if (topStat[0] === 'diplomacy') { mainEpitaph = '宣'; mainMeaning = '圣善周闻曰宣，力施四方曰宣'; }
      else { mainEpitaph = '昭'; mainMeaning = '明德有功曰昭，圣闻周达曰昭'; }
      stars = 4; ratingText = '一代霸主';
    } else if (avgStat >= 75) {
      if (topStat[0] === 'economy') { mainEpitaph = '文'; mainMeaning = '经纬天地曰文'; }
      else if (topStat[0] === 'governance') { mainEpitaph = '明'; mainMeaning = '照临四方曰明'; }
      else if (topStat[0] === 'morale') { mainEpitaph = '惠'; mainMeaning = '柔质慈民曰惠'; }
      else if (topStat[0] === 'diplomacy') { mainEpitaph = '宣'; mainMeaning = '力施四方曰宣'; }
      else { mainEpitaph = '景'; mainMeaning = '德行可仰曰景'; }
      stars = 4; ratingText = '治世令主';
    } else if (avgStat >= 50) {
      if (topStat[0] === 'governance') { mainEpitaph = '康'; mainMeaning = '安乐抚民曰康'; }
      else if (topStat[0] === 'economy') { mainEpitaph = '定'; mainMeaning = '安民大虑曰定'; }
      else if (topStat[0] === 'military') { mainEpitaph = '庄'; mainMeaning = '胜敌志强曰庄'; }
      else { mainEpitaph = '安'; mainMeaning = '好和不争曰安'; }
      stars = 3; ratingText = '守成之主';
    } else if (avgStat < 30) {
      mainEpitaph = '幽'; mainMeaning = '壅遏不通曰幽'; stars = 2; ratingText = '昏庸之君';
    } else {
      mainEpitaph = '简'; mainMeaning = '一德不懈曰简'; stars = 2; ratingText = '平淡之君';
    }

    // ── Sub-epitaph selection ──
    if (!GameState.rulerFate) {
      if (bottomStat[1] < 15 && bottomStat[0] === 'morale') subEpitaph = subEpitaph || '厉';
      if (countriesDestroyed.length >= 2) subEpitaph = subEpitaph || '烈';
      if (GameState.keyDecisions.filter(d => d.text.includes('变法') || d.text.includes('改革')).length > 0) subEpitaph = subEpitaph || '灵';
      if (citiesGained > 8) subEpitaph = subEpitaph || '襄';
      if (avgStat >= 60 && stats.morale < 30) subEpitaph = subEpitaph || '思';
    }

    // ── Build result ──
    const fullName = subEpitaph ? `${country}${mainEpitaph}${subEpitaph}王` : `${country}${mainEpitaph}王`;
    const epitaphMeaning = subEpitaph
      ? `「${mainEpitaph}」— ${mainMeaning}\n「${subEpitaph}」— ${this._getSubMeaning(subEpitaph)}`
      : `「${mainEpitaph}」— ${mainMeaning}`;

    const evaluation = this._generateEvaluation(stats, citiesGained, countriesDestroyed, turn, country, mainEpitaph, subEpitaph);
    legacyText = this._generateLegacy(stats, citiesGained, countriesDestroyed, country, mainEpitaph, avgStat);

    return {
      fullName, epitaphMeaning, citiesGained, countriesDestroyed,
      evaluation, stars, ratingText, legacy: legacyText, stats,
      generation: GameState.generation || 1,
    };
  },

  _getSubMeaning(sub) {
    const m = {
      '厉':'暴虐无亲', '悼':'中年早夭', '襄':'辟地有德', '灵':'乱而不损', '炀':'好内远礼',
      '献':'聪明睿智', '桓':'辟土服远', '烈':'有功安民', '思':'追悔前过', '成':'安民立政',
      '穆':'布德执义', '敬':'夙夜警戒', '简':'一德不懈', '定':'安民大虑', '康':'安乐抚民',
    };
    return m[sub] || '';
  },

  _generateEvaluation(stats, citiesGained, countriesDestroyed, turn, country, mainEpitaph, subEpitaph) {
    const decisions = GameState.keyDecisions.slice(-3);
    const fate = GameState.rulerFate;
    const avgStat = Object.values(stats).reduce((a, b) => a + b, 0) / 5;
    let text = '';

    // Opening
    const eraYear = GameState.year;
    text += `太史公曰：${country}君起于${eraYear < 0 ? '前' + Math.abs(eraYear) + '年' : eraYear + '年'}，在位${turn * 3}载。`;

    // Military
    if (stats.military >= 80) text += '其军也，威震列国，诸侯畏服。';
    else if (stats.military >= 60) text += '其军也，能守社稷，未尝大败。';
    else if (stats.military >= 40) text += '其军也，屡战屡北，仅保疆土。';
    else text += '其军也，不堪一击，城邑日削。';

    // Economy
    if (stats.economy >= 80) text += '其政也，府库充盈，百姓殷富。';
    else if (stats.economy >= 60) text += '其政也，财用不乏，赋税有度。';
    else if (stats.economy >= 40) text += '其政也，国用常绌，民生凋敝。';
    else text += '其政也，库空如洗，饥馑四起。';

    // Diplomacy
    if (stats.diplomacy >= 80) text += '其交也，折冲樽俎，诸侯信服。';
    else if (stats.diplomacy >= 60) text += '其交也，周旋列国，不失大体。';
    else if (stats.diplomacy >= 40) text += '其交也，孤立无援，四面楚歌。';
    else text += '其交也，举世皆敌，无一可恃。';

    // Ruler character
    if (avgStat >= 75) text += '君明臣贤，政通人和。';
    else if (avgStat >= 50) text += '君臣相得，守成有余。';
    else text += '君臣相疑，政事日非。';

    // Key decisions
    if (decisions.length > 0) {
      text += `其要事曰：${decisions.map(d => d.text.substring(0, 15)).join('；')}。`;
    }

    // End fate
    if (fate) {
      text += `然${fate.text}，`;
    }

    // Territorial summary
    if (citiesGained > 10) text += `拓地千里，${countriesDestroyed.length > 0 ? '灭' + countriesDestroyed.join('、') + '，' : ''}功业彪炳。`;
    else if (citiesGained > 3) text += `略有拓地，国势日张。`;
    else if (citiesGained < -5) text += `丧师失地，国运日蹙。`;

    // Verdict
    text += `论曰：`;
    if (mainEpitaph === '武' || mainEpitaph === '桓') text += '其才足以济世，其威足以服远，虽不及尧舜，亦一时之杰也。';
    else if (mainEpitaph === '文' || mainEpitaph === '明' || mainEpitaph === '宣') text += '守文继体，以德服人，虽无赫赫武功，然社稷赖之。';
    else if (mainEpitaph === '景' || mainEpitaph === '惠' || mainEpitaph === '定') text += '宽仁爱民，恭俭有度，然中道崩殂，未竟其志。';
    else if (mainEpitaph === '安' || mainEpitaph === '康' || mainEpitaph === '简') text += '循规蹈矩，无功无过。史家谓之"守成令主"。';
    else if (mainEpitaph === '厉' || mainEpitaph === '幽') text += '暴戾失众，智术浅薄。史家引以为戒。';
    else if (mainEpitaph === '怀' || mainEpitaph === '隐') text += '懦弱无能，为臣下所制。悲夫！';
    else if (mainEpitaph === '悼' || mainEpitaph === '勤') text += '天不假年，良可叹也。';
    else text += '功过相参，毁誉参半。';

    return text;
  },

  _generateLegacy(stats, citiesGained, countriesDestroyed, country, mainEpitaph, avgStat) {
    let text = '';
    const totalCities = Object.keys(GameState.territory).length;
    const eraName = GameState.era ? GameState.era.name : '战国';

    text += `【后世影响】\n\n`;

    if (citiesGained >= totalCities * 0.8) {
      text += `《${country}世家》载：${country}${mainEpitaph}王起于${eraName}，席卷天下，包举宇内。后世史家论其功过，或曰：\'苦心孤诣，终成大业。然其暴虐之政，亦为秦所承，二世而亡，岂非天意？\'`;
    } else if (citiesGained >= totalCities * 0.4) {
      text += `《${country}世家》载：${country}${mainEpitaph}王，${eraName}中雄主也。虽未一统，然其所创制度、所辟疆土，为后世子孙奠定了争霸之基。其用人之道、治军之法，尤为后代所效。`;
    } else if (avgStat >= 60) {
      text += `《${country}世家》载：${country}${mainEpitaph}王在位之政，虽无赫赫之功，然百姓安居，法制修明。其治国理念影响深远，后世儒者常以之为例，论"守成之君"之道。`;
    } else if (countriesDestroyed.length === 0 && citiesGained >= 0) {
      text += `《${country}世家》载：${country}${mainEpitaph}王，碌碌无为者也。史家或惜之曰：\'生逢大争之世而不争，坐失良机，哀哉。\'然亦有论者以为，不兴轻动，保全黎庶，亦不失为仁。`;
    } else {
      text += `《${country}世家》载：${country}${mainEpitaph}王在位期间，国运日蹙。后世学者论及此段历史，多以${country}之衰为战国转折之一。盖其失在不能审时度势，择人任能也。`;
    }

    text += `\n\n${stars}★ 千年史笔，自有公论。`;

    return text;
  },
};
