const Engine = {
  startGame(eraId, countryName) {
    GameState.init(eraId, countryName);
    UI.showGameScreen();
    MapRenderer.init();
    UI.updateAll();
    this.nextTurn();
  },

  nextTurn() {
    if (GameState.gameOver || GameState.successionPending) return;
    GameState.turn++;
    GameState.year += 3;
    GameState.rulerAge += 3;

    // Health decay: aging + exertion
    let decay = 1 + Math.floor(GameState.rulerAge / 20);
    if (GameState.getPlayer().military > 70) decay += 1;
    GameState.rulerHealth = Math.max(0, GameState.rulerHealth - decay);

    // Health crisis → succession
    if (GameState.rulerHealth <= 10 && !GameState.successionPending) {
      GameState.successionPending = true;
      GameState.addChronicle(`王疾笃，命在旦夕。`);
      UI.updateAll();
      UI.hideOutcome();
      UI.showSuccession();
      GameState.save();
      return;
    }

    this._checkCharacters();
    GameState.attackArrows = [];
    GameState.worldEvents = [];
    this._runAI();
    MapRenderer.updateTerritory();
    MapRenderer.drawAttackArrows();
    UI.updateDiplomacy();

    // Immediate check: did the player's country die during AI wars?
    if (!GameState.countries[GameState.playerCountry].alive) {
      GameState.gameOver = true;
      GameState.rulerFate = { type: '亡国', text: '国破家亡，社稷不保。' };
      UI.updateAll();
      MapRenderer.updateTerritory();
      this.endGame();
      GameState.save();
      return;
    }

    // Show world events notification
    if (GameState.worldEvents && GameState.worldEvents.length > 0) {
      UI.showWorldNotify(GameState.worldEvents);
    }

    if (this._checkRulerSurvival()) {
      GameState.save();
      return;
    }

    // Zero-stat crisis — overrides normal event
    const crisis = this._checkZeroStats();
    if (crisis) {
      GameState.currentEvent = crisis;
      UI.showEvent(crisis, true);
      this._checkEndConditions();
      GameState.save();
      return;
    }

    const event = this._findEvent();
    if (event) {
      GameState.currentEvent = event;
      UI.showEvent(event);
    } else {
      const randomEvent = this._getRandomEvent();
      GameState.currentEvent = randomEvent;
      UI.showEvent(randomEvent);
    }

    this._checkEndConditions();
    GameState.save();
  },

  _checkRulerSurvival() {
    const player = GameState.getPlayer();
    if (!player) return false;
    const turn = GameState.turn;
    const baseTurns = GameState.maxTurns;

    if (turn < baseTurns * 0.5) return false;

    const progress = (turn - baseTurns * 0.5) / (baseTurns * 0.5);
    let deathChance = progress * 0.08;

    const avgStat = (player.military + player.economy + player.governance + player.morale + player.diplomacy) / 5;

    if (avgStat >= 70) {
      deathChance *= 1.5;
    } else if (avgStat >= 50) {
      deathChance *= 1.0;
    } else {
      deathChance *= 0.6;
    }

    if (player.morale < 20) deathChance += 0.03;
    if (player.military < 15) deathChance += 0.02;

    const loyalChars = GameState.characters.filter(c => c.currentLoyalty < 30);
    if (loyalChars.length > 0) deathChance += 0.02 * loyalChars.length;

    if (Math.random() < deathChance) {
      const fates = this._generateRulerFates(player, avgStat);
      const fate = fates[Math.floor(Math.random() * fates.length)];
      GameState.gameOver = true;
      GameState.rulerFate = fate;
      GameState.addChronicle(fate.chronicle, true);
      UI.updateAll();
      MapRenderer.updateTerritory();
      this.endGame();
      return true;
    }

    return false;
  },

  _generateRulerFates(player, avgStat) {
    const fates = [];

    if (avgStat >= 65) {
      fates.push({
        type: '积劳成疾',
        text: '王日夜操劳国事，积劳成疾，药石无医。',
        chronicle: '王积劳成疾，薨于宫中。'
      });
    }

    if (player.morale < 30) {
      fates.push({
        type: '宫变被弑',
        text: '民心离散，宫中生变。夜半有甲士入宫，王不及逃，遂遇害。',
        chronicle: '宫变，王为乱兵所弑。'
      });
    }

    if (player.military < 25) {
      fates.push({
        type: '被权臣架空',
        text: '军权旁落，权臣当道。王欲收权而不得，终被废为庶人。',
        chronicle: '权臣废王为庶人，另立新君。'
      });
    }

    fates.push({
      type: '病逝',
      text: '王忽染重疾，太医束手无策。数日后薨于寝宫。',
      chronicle: '王染疾薨于寝宫。'
    });

    if (GameState.characters.length > 2) {
      fates.push({
        type: '被毒杀',
        text: '王宴饮后忽觉腹痛，口吐黑血。左右大骇，然已无可救药。',
        chronicle: '王宴饮后被毒杀，凶手在逃。'
      });
    }

    if (player.diplomacy < 25) {
      fates.push({
        type: '出使被扣',
        text: '王出使邻国，被扣为人质。国中另立新君，王终老异乡。',
        chronicle: '王出使被扣，客死他乡。'
      });
    }

    fates.push({
      type: '意外身亡',
      text: '王出猎途中坠马重伤，不治而亡。',
      chronicle: '王出猎坠马，重伤不治。'
    });

    return fates;
  },

  applyChoice(choiceIndex) {
    const event = GameState.currentEvent;
    if (!event) return;
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    const playerBefore = { ...GameState.getPlayer() };
    const citiesBefore = GameState.getCityCount(GameState.playerCountry);
    const territoryBefore = { ...GameState.territory };

    const player = GameState.getPlayer();
    const dynamicRisk = calcDynamicRisk(choice.risk || 0, player, GameState.characters);

    const roll = Math.random();
    const success = roll > dynamicRisk;

    let applied = {};
    if (success) {
      // High risk = high reward: amplify effects
      const amp = dynamicRisk > 0.5 ? 1.35 : dynamicRisk > 0.25 ? 1.15 : 1.0;
      const boosted = {};
      for (const [k, v] of Object.entries(choice.effects)) {
        boosted[k] = Math.round(v * amp);
      }
      GameState.applyEffects(boosted, GameState.playerCountry);
      applied = { ...boosted };
    } else {
      const penalty = {};
      for (const [key, val] of Object.entries(choice.effects)) {
        penalty[key] = val > 0 ? Math.round(val * 0.3) : Math.round(val * 1.5);
      }
      GameState.applyEffects(penalty, GameState.playerCountry);
      applied = { ...penalty };
    }

    if (choice.chronicle) {
      GameState.addChronicle(choice.chronicle, true);
    }
    GameState.addDecision(`${event.title}：${choice.text}`);

    if (event.id) GameState.triggeredEvents.push(event.id);
    if (!event.id || event.id.startsWith('random_')) {
      GameState.triggeredRandomEvents.push(event.id || `random_${GameState.turn}`);
    }

    // Ruler fate
    if (choice.rulerFate) {
      const fateRoll = Math.random();
      if (fateRoll < (choice.rulerFate.chance || 1)) {
        GameState.gameOver = true;
        GameState.rulerFate = choice.rulerFate;
        GameState.addChronicle(choice.rulerFate.chronicle || choice.rulerFate.text, true);
        GameState.currentEvent = null;
        GameState.pendingTurn = true;
        UI.updateAll();
        MapRenderer.updateTerritory();
        UI.showOutcome({
          success: false,
          choice: choice,
          applied: applied,
          chronicle: choice.rulerFate.chronicle || choice.rulerFate.text,
          fate: choice.rulerFate,
          playerBefore: playerBefore,
        });
        return;
      }
    }

    this._processWarResults(event, choiceIndex);
    this._randomMinorEvents();

    // Player country destroyed during the choice?
    if (!GameState.countries[GameState.playerCountry].alive) {
      GameState.gameOver = true;
      GameState.rulerFate = { type: '亡国', text: '国破家亡，社稷不保。' };
      GameState.currentEvent = null;
      GameState.pendingTurn = false;
      UI.updateAll();
      MapRenderer.updateTerritory();
      this.endGame();
      return;
    }

    // Special effects — rare bonus triggers
    let specialResult = null;
    if (choice.specialEffect && Math.random() < (choice.specialEffect.chance || 0.15)) {
      specialResult = this._applySpecialEffect(choice.specialEffect);
      if (specialResult && specialResult.chronicle) {
        GameState.addChronicle(specialResult.chronicle, true);
      }
    }

    const citiesAfter = GameState.getCityCount(GameState.playerCountry);
    const territoryChanged = citiesAfter !== citiesBefore;

    const playerAfter = GameState.getPlayer();

    GameState.currentEvent = null;
    GameState.pendingTurn = true;
    UI.updateAll();
    MapRenderer.updateTerritory();
    MapRenderer.drawAttackArrows();

    if (territoryChanged) {
      for (const [city, owner] of Object.entries(GameState.territory)) {
        if (territoryBefore[city] !== owner && owner === GameState.playerCountry) {
          MapRenderer.highlightCity(city);
          break;
        }
      }
    }

    UI.showOutcome({
      success: success,
      choice: choice,
      applied: applied,
      chronicle: choice.chronicle || '',
      fate: null,
      special: specialResult,
      playerBefore: playerBefore,
      playerAfter: playerAfter,
      territoryChanged: territoryChanged,
    });
  },

  _applySpecialEffect(effect) {
    const player = GameState.playerCountry;
    switch (effect.type) {
      case 'character': {
        let charData;
        if (effect.pool) {
          const pool = SPECIAL_CHARACTERS.filter(c => c.country === player);
          if (pool.length === 0) return null;
          const notInCourt = pool.filter(c => !GameState.characters.find(x => x.id === c.id));
          const candidates = notInCourt.length > 0 ? notInCourt : pool;
          charData = candidates[Math.floor(Math.random() * candidates.length)];
        } else if (effect.characterId) {
          charData = SPECIAL_CHARACTERS.find(c => c.id === effect.characterId);
        }
        if (!charData) return null;
        const existing = GameState.characters.find(c => c.id === charData.id);
        if (existing) return { chronicle: `${charData.name}本已在朝。` };
        GameState.characters.push({ ...charData, currentLoyalty: charData.loyalty });
        return {
          type: 'character',
          name: charData.name,
          role: charData.type,
          chronicle: `奇遇：${charData.type}${charData.name}来投。${charData.desc.substring(0, 30)}…`,
        };
      }
      case 'massive_boost': {
        for (const [k, v] of Object.entries(effect.boost || {})) {
          const c = GameState.getPlayer();
          if (c) c[k] = Math.min(100, (c[k] || 0) + v);
        }
        return {
          type: 'boost',
          chronicle: effect.chronicle || '天降机缘，国力大涨。',
          stats: effect.boost,
        };
      }
      case 'fortune': {
        const c = GameState.getPlayer();
        if (c) {
          c.military = Math.min(100, c.military + 5);
          c.economy = Math.min(100, c.economy + 5);
          c.morale = Math.min(100, c.morale + 5);
        }
        return { type: 'fortune', chronicle: effect.chronicle || '祥瑞降世，举国同庆。' };
      }
    }
    return null;
  },

  onContinue() {
    if (!GameState.pendingTurn) return;
    GameState.pendingTurn = false;
    UI.hideOutcome();
    if (GameState.gameOver || GameState.turn >= GameState.maxTurns) {
      this.endGame();
    } else {
      this.nextTurn();
    }
  },

  _findEvent() {
    const year = GameState.year;
    const player = GameState.playerCountry;
    const candidates = [];

    for (const evt of HISTORICAL_EVENTS) {
      if (GameState.triggeredEvents.includes(evt.id)) continue;
      if (!evt.era.includes(GameState.era.id)) continue;

      if (evt.condition.country) {
        if (evt.condition.country !== player) continue;
      }
      if (evt.condition.countries) {
        if (!evt.condition.countries.includes(player)) continue;
      }
      if (evt.condition.minTurn && GameState.turn < evt.condition.minTurn) continue;
      if (evt.condition.maxTurn && GameState.turn > evt.condition.maxTurn) continue;
      if (evt.condition.minMilitary) {
        const p = GameState.getPlayer();
        if (p.military < evt.condition.minMilitary) continue;
      }
      // Historical adaptation: context country must be strong enough
      if (evt.condition.contextCountry && evt.condition.contextMinMilitary) {
        const ctx = GameState.countries[evt.condition.contextCountry];
        if (ctx && ctx.military < evt.condition.contextMinMilitary) continue;
      }
      if (evt.condition.contextCountry && evt.condition.contextMaxMilitary) {
        const ctx = GameState.countries[evt.condition.contextCountry];
        if (ctx && ctx.military > evt.condition.contextMaxMilitary) continue;
      }

      const yearDiff = Math.abs(evt.year - year);
      const isShared = evt.condition.countries && evt.condition.countries.length >= 6;
      const maxDiff = isShared ? 99 : 5;
      if (yearDiff <= maxDiff) {
        candidates.push({ evt, yearDiff });
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => a.yearDiff - b.yearDiff);
    const top = candidates.slice(0, Math.min(3, candidates.length));
    return top[Math.floor(Math.random() * top.length)].evt;
  },

  _getRandomEvent() {
    const player = GameState.playerCountry;
    const playerData = GameState.getPlayer();
    const pool = RANDOM_EVENTS.filter(evt => {
      if (GameState.triggeredRandomEvents.includes(evt.id)) return false;
      if (evt.condition) {
        if (evt.condition.country && evt.condition.country !== player) return false;
        if (evt.condition.countries && !evt.condition.countries.includes(player)) return false;
        if (evt.condition.minMorale && playerData.morale >= evt.condition.minMorale) return false;
        if (evt.condition.maxMorale && playerData.morale > evt.condition.maxMorale) return false;
        if (evt.condition.minMilitary && playerData.military < evt.condition.minMilitary) return false;
      }
      return true;
    });

    if (pool.length === 0) {
      GameState.triggeredRandomEvents = [];
      return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    }

    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  },

  _checkCharacters() {
    const year = GameState.year;
    const player = GameState.playerCountry;

    for (const char of CHARACTERS) {
      if (char.country !== player) continue;
      const existing = GameState.characters.find(c => c.id === char.id);
      if (existing) {
        if (year >= char.died) {
          GameState.characters = GameState.characters.filter(c => c.id !== char.id);
          GameState.addChronicle(`${char.name}去世。`);
        }
        continue;
      }
      if (year >= char.born && year < char.died) {
        const appearChance = (year - char.born) / 10;
        if (Math.random() < appearChance || year === char.born) {
          GameState.characters.push({
            ...char,
            currentLoyalty: char.loyalty
          });
          GameState.addChronicle(`${char.type}${char.name}来投，${char.desc.substring(0, 20)}...`);
        }
      }
    }

    for (const char of GameState.characters) {
      if (Math.random() < 0.02) {
        char.currentLoyalty = Math.max(0, char.currentLoyalty - 10);
      }
    }
  },

  _runAI() {
    const alive = GameState.getAliveCountries().filter(c => !c.isPlayer);
    for (const country of alive) {
      const ai = COUNTRIES[country.name];
      if (!ai) continue;
      const aiParams = ai.ai;

      if (Math.random() < aiParams.aggression / 90) {
        this._aiWar(country, alive);
      }
      if (Math.random() < aiParams.diplomacy / 120) {
        this._aiDiplomacy(country, alive);
      }
      if (Math.random() < aiParams.reform / 160) {
        this._aiDevelop(country);
      }
    }
  },

  _checkZeroStats() {
    const player = GameState.getPlayer();
    if (!player) return null;
    const labels = { military: '军力', economy: '财力', diplomacy: '外交', governance: '政令', morale: '民心' };
    for (const [key, label] of Object.entries(labels)) {
      if (player[key] <= 0) {
        return {
          id: `crisis_${key}_${GameState.turn}`,
          type: 'crisis',
          title: `国难当头：${label}崩溃`,
          text: `国库空虚，朝野震恐。${label}已至绝境，官不能理事，民不能聊生。朝中大臣各怀心思，有人请辞，有人谋逆。此诚危急存亡之秋也！`,
          choices: [
            {text: `孤注一掷，倾全国之力补救`, effects: {[key]: 15, military: -8, economy: -10, morale: -5}, risk: 0.5,
             chronicle: `倾全国之力挽${label}于既倒`, rulerFate: {type: '众叛亲离', chance: 0.35, text: '民变骤起，叛军破宫', chronicle: `倾国挽危不成，民变骤起，王死于乱军`}},
            {text: `向列国借力，暂渡难关`, effects: {[key]: 10, diplomacy: -12, economy: 8, military: -5}, risk: 0.35,
             chronicle: `借外力暂渡${label}之危`, rulerFate: {type: '被架空', chance: 0.3, text: '列国挟恩图报，王权旁落', chronicle: `借力列国遭反噬，王被架空`}},
            {text: `血腥镇压，以暴力维持秩序`, effects: {[key]: 5, military: 8, morale: -18, governance: -5}, risk: 0.45,
             chronicle: `以暴政镇国`, rulerFate: {type: '被弑', chance: 0.4, text: '民众哗变，刺杀君主', chronicle: `暴政激起民变，王被刺杀`}},
            {text: `下罪己诏，与民更始`, effects: {[key]: 8, morale: 15, governance: 8, economy: -5}, risk: 0.15,
             chronicle: `下罪己诏，与民更始`},
          ]
        };
      }
    }
    return null;
  },

  _addWorldEvent(text) {
    if (!GameState.worldEvents) GameState.worldEvents = [];
    GameState.worldEvents.push(text);
  },

  _aiWar(attacker, allCountries) {
    const neighbors = GameState.getNeighbors(attacker.name);
    const enemies = neighbors.filter(n => GameState.getRelation(attacker.name, n) < -20);
    const target = enemies.length > 0 ? enemies[Math.floor(Math.random() * enemies.length)] : null;
    if (!target) return;

    const targetCountry = GameState.countries[target];
    if (!targetCountry) return;

    const borderCities = targetCountry.cities.filter(c => {
      return CITY_CONNECTIONS.some(([a, b]) =>
        (a === c && attacker.cities.includes(b)) ||
        (b === c && attacker.cities.includes(b))
      );
    });
    if (borderCities.length === 0) return;

    // Pick target city — prefer lower defense
    borderCities.sort((a, b) => {
      const da = (CITY_CHARACTERISTICS[a] || { defense: 5 }).defense;
      const db = (CITY_CHARACTERISTICS[b] || { defense: 5 }).defense;
      return da - db;
    });
    const targetCity = borderCities[0];

    // Capture probability
    const chance = calcCaptureChance(attacker.military, targetCity, 0, GameState.getSeason());
    const captured = Math.random() < chance;

    if (captured && target !== attacker.name) {
      GameState.transferCity(targetCity, target, attacker.name);
      attacker.military = Math.max(0, attacker.military - 8);
      const cityChar = CITY_CHARACTERISTICS[targetCity] || {};
      GameState.addChronicle(`${attacker.name}攻取${target}之${targetCity}（${cityChar.type || '城'}）。`);
      this._addWorldEvent(`⚔ ${attacker.name}攻取${target}之${targetCity}`);
      GameState.attackArrows.push({ from: attacker.name, to: target, city: targetCity, result: 'win' });
    } else {
      attacker.military = Math.max(0, attacker.military - 5);
      if (target === GameState.playerCountry) {
        this._addWorldEvent(`⚔ ${attacker.name}来犯${targetCity}，被我军击退`);
      }
      GameState.attackArrows.push({ from: attacker.name, to: target, city: targetCity, result: 'lose' });
    }
  },

  _aiDiplomacy(country, allCountries) {
    const neighbors = GameState.getNeighbors(country.name);
    if (neighbors.length === 0) return;
    const target = neighbors[Math.floor(Math.random() * neighbors.length)];
    const delta = Math.random() < 0.5 ? 5 : -5;
    GameState.modifyRelation(country.name, target, delta);
    if (Math.abs(delta) >= 5 && (target === GameState.playerCountry || country.name === GameState.playerCountry)) {
      const rel = GameState.getRelation(country.name, target);
      if (rel >= 40) this._addWorldEvent(`🤝 ${country.name}与${target}结为同盟`);
      else if (rel <= -40) this._addWorldEvent(`🔥 ${country.name}与${target}关系恶化`);
    }
  },

  _aiDevelop(country) {
    const stats = ['military', 'economy', 'governance', 'morale'];
    const stat = stats[Math.floor(Math.random() * stats.length)];
    country[stat] = Math.min(100, country[stat] + Math.floor(Math.random() * 8) + 3);
  },

  _processWarResults(event, choiceIndex) {
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    if (choice.territoryEffect) {
      const te = choice.territoryEffect;
      const player = GameState.getPlayer();
      if (!player) return;
      if (te.gain && te.from) {
        const target = GameState.countries[te.from];
        if (target && target.cities.length > 0) {
          // Find border city — prefer lower defense
          const borderCities = target.cities.filter(c => {
            return CITY_CONNECTIONS.some(([a, b]) =>
              (a === c && player.cities.includes(b)) ||
              (b === c && player.cities.includes(b))
            );
          });
          if (borderCities.length > 0) {
            borderCities.sort((a, b) => {
              const da = (CITY_CHARACTERISTICS[a] || { defense: 5 }).defense;
              const db = (CITY_CHARACTERISTICS[b] || { defense: 5 }).defense;
              return da - db;
            });
            const targetCity = borderCities[0];
            // Strategy bonus from military advisors
            const strategists = GameState.characters.filter(c => c.type === '谋士' && c.strategy > 60);
            const stratBonus = strategists.length > 0 ? Math.max(...strategists.map(c => c.strategy)) - 50 : 0;
            const chance = calcCaptureChance(player.military, targetCity, stratBonus, GameState.getSeason());
            if (Math.random() < chance) {
              GameState.transferCity(targetCity, te.from, GameState.playerCountry);
              const cc = CITY_CHARACTERISTICS[targetCity] || {};
              GameState.addChronicle(`我军${stratBonus > 0 ? '用计' : ''}攻取${te.from}之${targetCity}（${cc.type || '城'}）！`, true);
              GameState.attackArrows.push({ from: GameState.playerCountry, to: te.from, city: targetCity, result: 'win' });
            } else {
              GameState.attackArrows.push({ from: GameState.playerCountry, to: te.from, city: targetCity, result: 'lose' });
            }
          }
        }
      }
      if (te.lose && te.to) {
        if (player.cities.length > 0) {
          const city = player.cities[Math.floor(Math.random() * player.cities.length)];
          GameState.transferCity(city, GameState.playerCountry, te.to);
          GameState.addChronicle(`${te.to}攻取我之${city}！`, true);
        }
      }
    }
  },

  _randomMinorEvents() {
    const player = GameState.getPlayer();
    if (Math.random() < 0.15) {
      player.economy = Math.min(100, player.economy + Math.floor(Math.random() * 5) + 1);
    }
    if (Math.random() < 0.1) {
      player.military = Math.min(100, player.military + Math.floor(Math.random() * 3) + 1);
    }
    if (Math.random() < 0.08) {
      player.morale = Math.max(0, player.morale - Math.floor(Math.random() * 3));
    }
  },

  _checkEndConditions() {
    const player = GameState.getPlayer();
    if (!player) return;

    if (!GameState.countries[GameState.playerCountry].alive) {
      GameState.gameOver = true;
      GameState.rulerFate = { type: '亡国', text: '国破家亡，社稷不保。' };
      this.endGame();
      return;
    }

    if (player.military <= 0 && player.economy <= 0 && player.morale <= 0) {
      GameState.gameOver = true;
      GameState.rulerFate = { type: '众叛亲离', text: '国力耗尽，众叛亲离，被迫退位。' };
      this.endGame();
      return;
    }

    const playerCities = GameState.getCityCount(GameState.playerCountry);
    const totalCities = GameState.getTotalCities();
    if (playerCities >= totalCities * 0.8) {
      GameState.gameOver = true;
      this.endGame();
      return;
    }

    if (GameState.turn >= GameState.maxTurns) {
      GameState.gameOver = true;
      this.endGame();
      return;
    }
  },

  endGame() {
    GameState.gameOver = true;
    try {
      const result = Epitaph.generate();
      UI.showEndScreen(result);
    } catch (e) {
      UI.showEndScreen({
        fullName: GameState.playerCountry + '王',
        epitaphMeaning: '评价出错',
        citiesGained: 0, countriesDestroyed: [],
        evaluation: '游戏结束。' + (e.message || ''),
        stars: 3, ratingText: '', legacy: '', stats: {}, generation: 1,
      });
    }
  }
};
