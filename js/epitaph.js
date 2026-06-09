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
      military: player.military,
      economy: player.economy,
      diplomacy: player.diplomacy,
      governance: player.governance,
      morale: player.morale
    };

    const maxStat = Object.entries(stats).reduce((a, b) => b[1] > a[1] ? b : a);
    const minStat = Object.entries(stats).reduce((a, b) => b[1] < a[1] ? b : a);
    const avgStat = Object.values(stats).reduce((a, b) => a + b, 0) / 5;

    let mainEpitaph = '';
    let mainMeaning = '';
    let subEpitaph = '';
    let stars = 3;
    let ratingText = '';
    let evaluation = '';

    if (!alive) {
      mainEpitaph = '愍';
      mainMeaning = '在国遭忧曰愍';
      stars = 1;
      ratingText = '亡国之君';
    } else if (GameState.rulerFate) {
      const fate = GameState.rulerFate;
      if (fate.type === '被弑' || fate.type === '被毒杀') {
        mainEpitaph = '厉';
        mainMeaning = '暴虐无亲曰厉，杀戮无辜曰厉';
        stars = 2;
        ratingText = '不得善终';
      } else if (fate.type === '被掳' || fate.type === '出使被扣') {
        mainEpitaph = '怀';
        mainMeaning = '失位而死曰怀，慈仁短折曰怀';
        stars = 2;
        ratingText = '身陷囹圄';
      } else if (fate.type === '被架空' || fate.type === '退位') {
        mainEpitaph = '隐';
        mainMeaning = '不显尸国曰隐，隐拂不成曰隐';
        stars = 2;
        ratingText = '权柄旁落';
      } else if (fate.type === '积劳成疾' || fate.type === '病逝') {
        mainEpitaph = avgStat >= 60 ? '勤' : '悼';
        mainMeaning = avgStat >= 60 ? '夙夜匪懈曰勤' : '中年早夭曰悼';
        stars = avgStat >= 60 ? 3 : 2;
        ratingText = avgStat >= 60 ? '鞠躬尽瘁' : '英年早逝';
      } else if (fate.type === '宫变被弑') {
        mainEpitaph = '幽';
        mainMeaning = '壅遏不通曰幽，动静乱常曰幽';
        stars = 1;
        ratingText = '众叛亲离';
      } else {
        mainEpitaph = '悼';
        mainMeaning = '中年早夭曰悼';
        stars = 2;
        ratingText = '不得其终';
      }
    } else if (citiesNow >= totalCities * 0.8) {
      mainEpitaph = '武';
      mainMeaning = '克定祸乱曰武，辟土斥境曰武';
      stars = 5;
      ratingText = '一统天下';
    } else if (citiesNow >= totalCities * 0.5) {
      mainEpitaph = '昭';
      mainMeaning = '明德有功曰昭，圣闻周达曰昭';
      stars = 4;
      ratingText = '一代霸主';
    } else if (avgStat >= 70) {
      mainEpitaph = '文';
      mainMeaning = '经纬天地曰文，道德博闻曰文';
      stars = 4;
      ratingText = '文治之君';
    } else if (avgStat >= 50) {
      mainEpitaph = '安';
      mainMeaning = '好和不争曰安，兆民宁赖曰安';
      stars = 3;
      ratingText = '守成之主';
    } else if (avgStat < 30) {
      mainEpitaph = '幽';
      mainMeaning = '壅遏不通曰幽';
      stars = 2;
      ratingText = '昏庸之君';
    } else {
      mainEpitaph = '平';
      mainMeaning = '治而无眚曰平，执事有制曰平';
      stars = 3;
      ratingText = '平庸之主';
    }

    if (!GameState.rulerFate) {
      if (maxStat[0] === 'military' && maxStat[1] >= 80 && mainEpitaph !== '武') {
        mainEpitaph = '武';
        mainMeaning = '威强睿德曰武';
      }
      if (maxStat[0] === 'economy' && maxStat[1] >= 80 && mainEpitaph !== '文') {
        mainEpitaph = '文';
        mainMeaning = '经纬天地曰文';
      }
      if (maxStat[0] === 'diplomacy' && maxStat[1] >= 80) {
        mainEpitaph = '宣';
        mainMeaning = '圣善周闻曰宣，力施四方曰宣';
      }
      if (maxStat[0] === 'governance' && maxStat[1] >= 80 && mainEpitaph !== '文') {
        mainEpitaph = '明';
        mainMeaning = '照临四方曰明，任贤致远曰明';
      }
      if (maxStat[0] === 'morale' && maxStat[1] >= 80) {
        mainEpitaph = '惠';
        mainMeaning = '柔质慈民曰惠，爱民好与曰惠';
      }
    }

    if (minStat[0] === 'morale' && minStat[1] < 20) {
      subEpitaph = '厉';
    } else if (turn < 30 && !alive) {
      subEpitaph = '悼';
    } else if (countriesDestroyed.length >= 2) {
      subEpitaph = '襄';
    } else if (GameState.keyDecisions.some(d => d.text.includes('变法'))) {
      subEpitaph = '灵';
    }

    const fullName = subEpitaph ? `${country}${mainEpitaph}${subEpitaph}王` : `${country}${mainEpitaph}王`;
    const epitaphMeaning = subEpitaph
      ? `「${mainEpitaph}」— ${mainMeaning}\n「${subEpitaph}」— ${this._getSubMeaning(subEpitaph)}`
      : `「${mainEpitaph}」— ${mainMeaning}`;

    evaluation = this._generateEvaluation(stats, citiesGained, countriesDestroyed, turn, country, mainEpitaph);

    return {
      fullName,
      epitaphMeaning,
      citiesGained,
      countriesDestroyed,
      evaluation,
      stars,
      ratingText,
      stats
    };
  },

  _getSubMeaning(sub) {
    const meanings = {
      '厉': '暴虐无亲曰厉',
      '悼': '中年早夭曰悼',
      '襄': '辟地有德曰襄，甲胄有劳曰襄',
      '灵': '乱而不损曰灵',
      '炀': '好内远礼曰炀',
      '献': '聪明睿智曰献'
    };
    return meanings[sub] || '';
  },

  _generateEvaluation(stats, citiesGained, countriesDestroyed, turn, country, mainEpitaph) {
    const decisions = GameState.keyDecisions.slice(0, 3);
    const fate = GameState.rulerFate;
    let text = '';

    text += `太史公曰：${country}君在位${turn * 3}年，`;

    if (mainEpitaph === '武') {
      text += `以武功著称，辟土斥境，威震诸侯。`;
    } else if (mainEpitaph === '文') {
      text += `以文治见长，经纬天地，国泰民安。`;
    } else if (mainEpitaph === '宣') {
      text += `以外交闻名，纵横捭阖，诸侯宾服。`;
    } else if (mainEpitaph === '明') {
      text += `以明政治国，照临四方，任贤使能。`;
    } else if (mainEpitaph === '惠') {
      text += `以仁惠治民，慈爱百姓，民心思附。`;
    } else if (mainEpitaph === '愍') {
      text += `遭逢乱世，国破家亡，令人扼腕。`;
    } else if (mainEpitaph === '厉') {
      text += `暴虐无亲，臣民怨恨，终遭不测。`;
    } else if (mainEpitaph === '怀') {
      text += `轻信虎狼之国，身陷囹圄，客死他乡，可悲可叹。`;
    } else if (mainEpitaph === '隐') {
      text += `权柄旁落，身不由己，虽居王位，实为傀儡。`;
    } else if (mainEpitaph === '幽') {
      text += `壅遏不通，内外隔绝，终致大祸。`;
    } else if (mainEpitaph === '勤') {
      text += `夙夜匪懈，鞠躬尽瘁，然操劳过度，药石无医。`;
    } else if (mainEpitaph === '悼') {
      text += `英年早逝，壮志未酬，令人扼腕。`;
    } else if (mainEpitaph === '安') {
      text += `守成持重，与民休息，虽无大功，亦无大过。`;
    } else if (mainEpitaph === '平') {
      text += `治国有方，中规中矩，不失为一守成之主。`;
    } else {
      text += `守成持重，无功无过。`;
    }

    if (citiesGained > 5) {
      text += `拓地${citiesGained}城，`;
    } else if (citiesGained > 0) {
      text += `略有拓地，`;
    } else if (citiesGained < 0) {
      text += `失地${Math.abs(citiesGained)}城，`;
    }

    if (countriesDestroyed.length > 0) {
      text += `灭${countriesDestroyed.join('、')}，`;
    }

    if (decisions.length > 0) {
      text += `其要决曰：${decisions[0].text.substring(0, 20)}。`;
    }

    if (stats.military >= 80) {
      text += `军威赫赫，`;
    }
    if (stats.economy >= 80) {
      text += `国富民丰，`;
    }
    if (stats.morale < 30) {
      text += `然民心离散，`;
    }

    if (fate) {
      text += `终${fate.text.substring(0, 15)}，`;
    }

    text += `功过相参，谥曰${mainEpitaph}。`;

    return text;
  }
};
