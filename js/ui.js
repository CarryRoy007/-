const UI = {
  showStartScreen() {
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('era-select').style.display = 'none';
    document.getElementById('country-select').style.display = 'none';
  },

  showEraSelect() {
    document.getElementById('era-select').style.display = 'block';
    document.getElementById('country-select').style.display = 'none';
    const container = document.getElementById('era-list');
    container.innerHTML = '';
    for (const era of ERAS) {
      const card = document.createElement('div');
      card.className = 'era-card';
      card.innerHTML = `
        <h3>${era.name}</h3>
        <p class="era-year">${era.year < 0 ? '前' + Math.abs(era.year) + '年' : era.year + '年'}</p>
        <p class="era-desc">${era.desc}</p>
        ${era.special ? `<p class="era-special">${era.special}</p>` : ''}
      `;
      card.addEventListener('click', () => this.showCountrySelect(era.id));
      container.appendChild(card);
    }
  },

  showCountrySelect(eraId) {
    document.getElementById('era-select').style.display = 'none';
    document.getElementById('country-select').style.display = 'block';
    const era = ERAS.find(e => e.id === eraId);
    const container = document.getElementById('country-list');
    container.innerHTML = '';
    for (const name of era.countries) {
      const c = COUNTRIES[name];
      const card = document.createElement('div');
      card.className = 'country-card';
      card.style.borderColor = c.color;
      card.innerHTML = `
        <div class="country-header" style="background:${c.color}">
          <span class="country-name">${name}</span>
        </div>
        <div class="country-body">
          <p class="country-desc">${c.desc}</p>
          <div class="stat-bars">
            <div class="stat-bar"><span>军事</span><div class="bar"><div class="bar-fill" style="width:${c.base.military}%;background:#e74c3c"></div></div><span>${c.base.military}</span></div>
            <div class="stat-bar"><span>经济</span><div class="bar"><div class="bar-fill" style="width:${c.base.economy}%;background:#f39c12"></div></div><span>${c.base.economy}</span></div>
            <div class="stat-bar"><span>外交</span><div class="bar"><div class="bar-fill" style="width:${c.base.diplomacy}%;background:#3498db"></div></div><span>${c.base.diplomacy}</span></div>
            <div class="stat-bar"><span>内政</span><div class="bar"><div class="bar-fill" style="width:${c.base.governance}%;background:#2ecc71"></div></div><span>${c.base.governance}</span></div>
            <div class="stat-bar"><span>民心</span><div class="bar"><div class="bar-fill" style="width:${c.base.morale}%;background:#9b59b6"></div></div><span>${c.base.morale}</span></div>
          </div>
        </div>
      `;
      card.addEventListener('click', () => Engine.startGame(eraId, name));
      container.appendChild(card);
    }
  },

  showGameScreen() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'grid';
    document.getElementById('end-screen').style.display = 'none';
  },

  updateAll() {
    this.updateHeader();
    this.updateStats();
    this.updateCharacters();
    this.updateDiplomacy();
  },

  updateHeader() {
    const player = GameState.getPlayer();
    const country = COUNTRIES[GameState.playerCountry];
    document.getElementById('header-year').textContent = GameState.getYearStr();
    document.getElementById('header-turn').textContent = `第 ${GameState.turn} / ${GameState.maxTurns} 回合`;
    document.getElementById('header-season').textContent = GameState.getSeason();
    document.getElementById('header-country').textContent = GameState.playerCountry;
    document.getElementById('header-country').style.color = country.highlight;
    document.getElementById('header-cities').textContent = `${GameState.getCityCount(GameState.playerCountry)} / ${GameState.getTotalCities()} 城`;

    const healthEl = document.getElementById('header-health');
    if (healthEl) {
      const h = GameState.rulerHealth || 100;
      let hText = '康健', hColor = '#2ecc71';
      if (h < 25) { hText = '垂危'; hColor = '#c41e3a'; }
      else if (h < 50) { hText = '抱恙'; hColor = '#f39c12'; }
      else if (h < 70) { hText = '尚可'; hColor = '#3498db'; }
      healthEl.textContent = `龙体：${hText} ${GameState.generation > 1 ? '· 第' + GameState.generation + '代' : ''}`;
      healthEl.style.color = hColor;
    }

    const avgStat = (player.military + player.economy + player.governance + player.morale + player.diplomacy) / 5;
    let healthText = '康健', healthColor = '#2ecc71';
    if (avgStat < 30) { healthText = '危殆'; healthColor = '#e74c3c'; }
    else if (avgStat < 45) { healthText = '虚弱'; healthColor = '#f39c12'; }
    else if (avgStat < 60) { healthText = '尚可'; healthColor = '#3498db'; }
    // No longer needed — replaced by rulerHealth above
  },

  showSuccession() {
    const outPanel = document.getElementById('outcome-panel');
    const evtPanel = document.getElementById('event-panel');
    evtPanel.style.display = 'none';
    outPanel.style.display = 'block';

    document.getElementById('outcome-verdict-text').textContent = '王疾大渐，宜立嗣君。';
    document.getElementById('outcome-verdict-text').style.color = '#c9a84c';

    document.getElementById('outcome-chronicle').textContent = '王病日笃，太医束手。国不可一日无君，当择贤嗣以继社稷。';

    document.getElementById('outcome-stats').innerHTML = '';
    document.getElementById('outcome-territory').innerHTML = '';
    document.getElementById('outcome-fate').innerHTML = '';

    const continueBtn = document.getElementById('outcome-continue');
    continueBtn.style.display = 'none';

    // Put heir buttons directly into outcome-body, after chronicle
    const body = document.querySelector('#outcome-panel .outcome-scroll');
    // Remove old heir buttons if any
    const oldBtns = body.querySelectorAll('.choice-btn');
    oldBtns.forEach(b => b.remove());

    const heirs = [
      { label: '立贤能的太子', desc: '太子素有贤名，继位可安社稷。', effects: { governance: 5, morale: 5 } },
      { label: '立勇武的公子', desc: '公子善战，继位可扬国威。', effects: { military: 8, governance: -3 } },
      { label: '择外戚扶持幼主', desc: '幼主年少，以外戚辅政，权倾朝野。', effects: { military: -5, governance: 3, diplomacy: 5 } },
    ];

    heirs.forEach((h, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.style.marginBottom = '10px';
      btn.innerHTML = `
        <span class="choice-letter">${String.fromCharCode(65 + i)}</span>
        <span class="choice-text">${h.label}</span>
        <span class="choice-hint">${h.desc}</span>
      `;
      btn.addEventListener('click', () => {
        // Remove all heir buttons
        body.querySelectorAll('.choice-btn').forEach(b => b.remove());
        GameState.successionPending = false;
        GameState.rulerHealth = 80 + Math.floor(Math.random() * 20);
        GameState.rulerAge = 20 + Math.floor(Math.random() * 15);
        GameState.generation++;
        GameState.applyEffects(h.effects, GameState.playerCountry);
        GameState.addChronicle(`第${GameState.generation}代嗣君即位。`);
        continueBtn.style.display = 'block';
        continueBtn.textContent = '新君即位，承继大统';
        outPanel.scrollIntoView({ behavior: 'smooth' });

        continueBtn.onclick = () => {
          UI.hideOutcome();
          continueBtn.textContent = '史笔留此，君王珍重';
          GameState.pendingTurn = true;
          Engine.onContinue();
        };
      });
      body.appendChild(btn);
    });
    outPanel.scrollIntoView({ behavior: 'smooth' });
  },

  updateStats() {
    const player = GameState.getPlayer();
    if (!player) return;
    const stats = [
      { key: 'military', label: '军事', color: '#e74c3c', val: player.military },
      { key: 'economy', label: '经济', color: '#f39c12', val: player.economy },
      { key: 'diplomacy', label: '外交', color: '#3498db', val: player.diplomacy },
      { key: 'governance', label: '内政', color: '#2ecc71', val: player.governance },
      { key: 'morale', label: '民心', color: '#9b59b6', val: player.morale }
    ];
    const container = document.getElementById('stats-panel');
    container.innerHTML = '';
    for (const s of stats) {
      const div = document.createElement('div');
      div.className = 'game-stat';
      div.innerHTML = `
        <div class="stat-label">${s.label}</div>
        <div class="stat-bar-large">
          <div class="bar-fill-large" style="width:${s.val}%;background:${s.color}"></div>
        </div>
        <div class="stat-value">${s.val}</div>
      `;
      container.appendChild(div);
    }
  },

  updateCharacters() {
    const container = document.getElementById('characters-panel');
    container.innerHTML = '';
    if (GameState.characters.length === 0) {
      container.innerHTML = '<p class="empty-hint">尚无在朝人物</p>';
      return;
    }
    for (const char of GameState.characters) {
      const icon = ROLE_ICONS[char.type] || { symbol: '?', cssClass: '' };
      const div = document.createElement('div');
      div.className = `char-card ${icon.cssClass}`;
      div.innerHTML = `
        <span class="char-icon">${icon.symbol}</span>
        <span class="char-name">${char.name}</span>
        <span class="char-type">${char.type}</span>
        <div class="char-stats">
          ${char.military > 50 ? `<span class="char-stat" title="军事">⚔${char.military}</span>` : ''}
          ${char.governance > 50 ? `<span class="char-stat" title="内政">☰${char.governance}</span>` : ''}
          ${char.diplomacy > 50 ? `<span class="char-stat" title="外交">◈${char.diplomacy}</span>` : ''}
          ${char.strategy > 50 ? `<span class="char-stat" title="谋略">✦${char.strategy}</span>` : ''}
        </div>
      `;
      div.title = char.desc;
      container.appendChild(div);
    }
  },

  updateDiplomacy() {
    const container = document.getElementById('diplomacy-panel');
    container.innerHTML = '';
    const player = GameState.playerCountry;
    const panelSection = document.getElementById('diplomacy-panel').parentElement;
    const existingTitle = panelSection.querySelector('.panel-title');
    if (existingTitle) existingTitle.textContent = '外交（绿=善 · 红=恶）';

    for (const [name, country] of Object.entries(GameState.countries)) {
      if (name === player) continue;
      if (!country.alive) continue;
      const relation = GameState.getRelation(player, name);
      let status = '中立';
      let statusClass = 'neutral';
      if (relation >= 30) { status = '友好'; statusClass = 'friendly'; }
      else if (relation >= 60) { status = '同盟'; statusClass = 'allied'; }
      else if (relation <= -30) { status = '敌对'; statusClass = 'hostile'; }
      else if (relation <= -10) { status = '紧张'; statusClass = 'tense'; }

      const div = document.createElement('div');
      div.className = `diplo-item ${statusClass}`;
      const barWidth = Math.abs(relation);
      const barColor = relation >= 0 ? '#5ac08d' : '#c41e3a';
      div.innerHTML = `
        <span class="diplo-country" style="color:${COUNTRIES[name].highlight}">${name}</span>
        <span class="diplo-status">${status}</span>
        <span class="diplo-number" style="color:${barColor}">${relation >= 0 ? '+' : ''}${relation}</span>
        <div class="diplo-bar"><div class="diplo-fill" style="width:${barWidth}%;background:${barColor}"></div></div>
      `;
      container.appendChild(div);
    }
    // Draw diplomacy lines on map
    MapRenderer.drawDiploLines();
  },

  showEvent(event, isCrisis = false) {
    const panel = document.getElementById('event-panel');
    const title = document.getElementById('event-title');
    const text = document.getElementById('event-text');
    const choices = document.getElementById('event-choices');

    title.textContent = `第${GameState.turn}回 · ${event.title}`;
    // Dynamic text substitution for {neighbor}/{enemy}/{ally}
    let displayText = event.text;
    const player = GameState.playerCountry;
    const neighbors = GameState.getNeighbors(player);
    const enemy = neighbors.sort((a, b) => (GameState.getRelation(player, a) || 0) - (GameState.getRelation(player, b) || 0))[0];
    const ally = neighbors.sort((a, b) => (GameState.getRelation(player, b) || 0) - (GameState.getRelation(player, a) || 0))[0];
    const rando = neighbors[Math.floor(Math.random() * neighbors.length)];
    displayText = displayText.replace(/\{neighbor\}/g, rando || '邻国');
    displayText = displayText.replace(/\{enemy\}/g, enemy || '敌国');
    displayText = displayText.replace(/\{ally\}/g, ally || '盟国');
    text.textContent = displayText;
    if (isCrisis) text.className = 'crisis';
    else text.className = '';
    choices.innerHTML = '';

    event.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      if (isCrisis) btn.classList.add('choice-crisis');
      const effectHints = Object.entries(choice.effects)
        .map(([k, v]) => {
          const labels = { military: '军事', economy: '经济', diplomacy: '外交', governance: '内政', morale: '民心' };
          const arrow = v > 0 ? '↑' : '↓';
          return `${labels[k] || k}${arrow}`;
        }).join(' ');
      // Vague risk hint — no numbers, only descriptors
      const p = GameState.getPlayer();
      const dynRisk = choice.risk ? calcDynamicRisk(choice.risk, p, GameState.characters) : 0;
      let riskLabel = '';
      let riskClass = '';
      if (choice.risk > 0) {
        if (dynRisk > 0.5) { riskLabel = '险'; riskClass = 'risk-high'; }
        else if (dynRisk > 0.25) { riskLabel = '慎'; riskClass = 'risk-mid'; }
        else { riskLabel = '可'; riskClass = 'risk-low'; }
      }
      btn.innerHTML = `
        <span class="choice-letter">${String.fromCharCode(65 + idx)}</span>
        <span class="choice-text">${choice.text}</span>
        <span class="choice-hint">${effectHints} ${riskLabel ? `<span class="choice-risk ${riskClass}">${riskLabel}</span>` : ''}</span>
      `;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
        btn.classList.add('selected');
        Engine.applyChoice(idx);
      });
      choices.appendChild(btn);
    });

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
  },

  showWorldNotify(messages) {
    const el = document.getElementById('world-notify');
    if (!el) return;
    el.innerHTML = messages.slice(0, 2).join(' · ');
    el.style.display = 'block';
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'notifyFade 4s forwards';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  },

  showRiskResult(choice, success) {
    if (!success) {
      const toast = document.createElement('div');
      toast.className = 'risk-toast';
      toast.textContent = '抉择未能如愿，事与愿违...';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  },

  showOutcome(outcome) {
    const evtPanel = document.getElementById('event-panel');
    const outPanel = document.getElementById('outcome-panel');
    evtPanel.style.display = 'none';
    outPanel.style.display = 'block';

    const labels = { military: '军事', economy: '经济', diplomacy: '外交', governance: '内政', morale: '民心' };

    // ── Verdict: one-line historical judgment ──
    const verdict = document.getElementById('outcome-verdict-text');
    const eventTitle = GameState.keyDecisions.length > 0
      ? GameState.keyDecisions[GameState.keyDecisions.length - 1].text.split('：')[0] : '';

    if (outcome.fate) {
      verdict.textContent = `大限已至，${outcome.fate.text}`;
      verdict.style.color = '#c41e3a';
      verdict.style.borderColor = '#c41e3a';
    } else if (outcome.success && outcome.territoryChanged) {
      verdict.textContent = `「善哉！王之决断，得天时、乘人和，拓土开疆。」`;
      verdict.style.color = '#e8d07a';
      verdict.style.borderColor = '#c9a84c';
    } else if (outcome.success) {
      verdict.textContent = `「王策允当。虽未尽善，然社稷赖之以安。」`;
      verdict.style.color = '#5ac08d';
      verdict.style.borderColor = '#2d8c5a';
    } else {
      verdict.textContent = `「噫！事与愿违。然人谋固有不逮，天意岂可尽知？」`;
      verdict.style.color = '#c9a84c';
      verdict.style.borderColor = '#b8860b';
    }

    // ── 史官记述: rich historical narrative ──
    const chronicle = document.getElementById('outcome-chronicle');
    let record = '';
    // Which choice
    record += `王${outcome.choice.text.substring(0, 1) === '「' ? '曰' : ''}「${outcome.choice.text.substring(0, 30)}${outcome.choice.text.length > 30 ? '…' : ''}」，`;
    // Success/fail
    if (outcome.fate) {
      record += `${outcome.fate.chronicle || outcome.fate.text}。`;
    } else if (outcome.success) {
      record += `事遂。`;
    } else {
      record += `事不遂，乃天不假便也。`;
    }
    // Effects in literary form
    const gains = [], losses = [];
    for (const [k, v] of Object.entries(outcome.applied)) {
      if (v > 0) gains.push(`${labels[k] || k}`);
      else if (v < 0) losses.push(`${labels[k] || k}`);
    }
    if (gains.length > 0) record += `${gains.join('、')}振。`;
    if (losses.length > 0) record += `${losses.join('、')}损。`;

    if (outcome.territoryChanged) {
      record += `疆域变迁，城邑易手。`;
    }
    chronicle.textContent = record;

    // ── Stat annotations ──
    const statsDiv = document.getElementById('outcome-stats');
    statsDiv.innerHTML = '';
    if (!outcome.fate) {
      for (const [key, val] of Object.entries(outcome.applied)) {
        if (val === 0) continue;
        const label = labels[key] || key;
        const arrow = val > 0 ? '↗' : '↘';
        const color = val > 0 ? '#5ac08d' : '#c41e3a';
        const span = document.createElement('span');
        span.className = 'outcome-stat';
        span.innerHTML = `<span class="ostat-label">${label}</span><span class="ostat-val" style="color:${color}">${arrow}${Math.abs(val)}</span>`;
        statsDiv.appendChild(span);
      }
    }

    // Territory hint
    const terrDiv = document.getElementById('outcome-territory');
    terrDiv.innerHTML = '';
    if (outcome.territoryChanged) {
      terrDiv.innerHTML = '<span class="outcome-territory-change">⚔ 疆域有变，请观图中城池归属</span>';
    }

    // Fate
    const fateDiv = document.getElementById('outcome-fate');
    fateDiv.innerHTML = '';
    if (outcome.fate) {
      fateDiv.innerHTML = `<span class="outcome-fate-warn">${outcome.fate.text}</span>`;
    }

    // Special — rare bonus
    if (outcome.special) {
      const specialDiv = document.getElementById('outcome-fate');
      let html = '';
      if (outcome.special.type === 'character') {
        html = `<span class="outcome-special">✦ 奇遇：<strong>${outcome.special.name}</strong>（${outcome.special.role}）来投！</span>`;
      } else if (outcome.special.type === 'boost') {
        html = `<span class="outcome-special">✦ ${outcome.special.chronicle || '天降机缘，国力大涨。'}</span>`;
      } else if (outcome.special.type === 'fortune') {
        html = `<span class="outcome-special">✦ ${outcome.special.chronicle || '祥瑞降世。'}</span>`;
      }
      specialDiv.innerHTML += html;
    }

    outPanel.scrollIntoView({ behavior: 'smooth' });
  },

  hideOutcome() {
    document.getElementById('outcome-panel').style.display = 'none';
  },

  showEndScreen(result) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'flex';

    const fate = GameState.rulerFate;
    const fateHtml = fate ? `
      <div class="epitaph-divider"></div>
      <div class="epitaph-fate">
        <div class="fate-label">终局</div>
        <div class="fate-text">${fate.text}</div>
      </div>
    ` : '';

    const container = document.getElementById('end-content');
    container.innerHTML = `
      <div class="epitaph-card">
        <h1 class="epitaph-title">${result.fullName}</h1>
        <div class="epitaph-subtitle">${result.epitaphMeaning}</div>
        <div class="epitaph-divider"></div>
        <div class="epitaph-stats">
          <div>在位：${GameState.turn * 3}年</div>
          <div>拓地：${result.citiesGained > 0 ? '+' : ''}${result.citiesGained}城</div>
          <div>灭国：${result.countriesDestroyed.join('、') || '无'}</div>
        </div>
        ${fateHtml}
        <div class="epitaph-divider"></div>
        <div class="epitaph-evaluation">${result.evaluation}</div>
        <div class="epitaph-divider"></div>
        <div class="epitaph-legacy">${result.legacy}</div>
        <div class="epitaph-divider"></div>
        <div class="epitaph-rating">${'★'.repeat(result.stars)}${'☆'.repeat(5 - result.stars)}</div>
        <div class="epitaph-rating-text">${result.ratingText}</div>
      </div>
      <div class="end-buttons">
        <button class="btn-primary" onclick="Chronicle.show()">史书回放</button>
        <button class="btn-secondary" onclick="SaveManager.clearSave();UI.showStartScreen();UI.showEraSelect();">返回初始界面</button>
      </div>
    `;
  },

  showChronicle(entries) {
    const modal = document.getElementById('chronicle-modal');
    const content = document.getElementById('chronicle-content');
    content.innerHTML = '';
    for (const entry of entries) {
      const div = document.createElement('div');
      div.className = `chronicle-entry ${entry.important ? 'important' : ''}`;
      div.innerHTML = `
        <span class="chronicle-year">${entry.year < 0 ? '前' + Math.abs(entry.year) + '年' : entry.year + '年'}</span>
        <span class="chronicle-text">${entry.text}</span>
      `;
      content.appendChild(div);
    }
    modal.style.display = 'flex';
  },

  hideChronicle() {
    document.getElementById('chronicle-modal').style.display = 'none';
  }
};
