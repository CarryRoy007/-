const MapRenderer = {
  svg: null,
  cityElements: {},
  cityPolys: {},
  tooltip: null,

  init() {
    const container = document.getElementById('map-container');
    if (!container) return;

    const W = 720, H = 560;
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Glow filter for player territory
    const glow = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    glow.setAttribute("id", "glow");
    glow.innerHTML = `<feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feFlood flood-color="#c9a84c" flood-opacity="0.5" result="color"/>
      <feComposite in="color" in2="blur" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>`;
    defs.appendChild(glow);

    // Drop shadow for mountains
    const ds = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    ds.setAttribute("id", "ds");
    ds.innerHTML = `<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.4"/>`;
    defs.appendChild(ds);

    // Paper texture pattern
    const pat = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pat.setAttribute("id", "terrain"); pat.setAttribute("width", "40"); pat.setAttribute("height", "40");
    pat.setAttribute("patternUnits", "userSpaceOnUse");
    pat.innerHTML = `<rect width="40" height="40" fill="none"/>
      <circle cx="12" cy="18" r="0.5" fill="#fff" opacity="0.08"/>
      <circle cx="30" cy="8" r="0.3" fill="#fff" opacity="0.05"/>
      <circle cx="5" cy="32" r="0.4" fill="#fff" opacity="0.06"/>`;
    defs.appendChild(pat);

    this.svg.appendChild(defs);

    // Background — parchment
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", W); bg.setAttribute("height", H);
    bg.setAttribute("fill", "#f0dcc0");
    bg.setAttribute("opacity", "0.12");
    this.svg.appendChild(bg);

    this._drawTerrain();
    this._drawTerritories();
    this._drawConnections();
    this._drawCities();
    this._drawLegend();
    this._drawCompass();

    container.innerHTML = '';
    container.appendChild(this.svg);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'map-tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  },

  _drawTerrain() {
    // Only 4 major mountains: 崤山, 太行, 泰山, 巫山
    const majorMountains = [
      {name:"崤山",x:195,y:275,w:30,h:18},   // 秦东境，通魏韩要道
      {name:"太行",x:330,y:220,w:40,h:22},  // 赵魏分界，南北屏障
      {name:"泰山",x:570,y:195,w:24,h:16},  // 齐鲁名山，天下所宗
      {name:"巫山",x:290,y:455,w:28,h:16},  // 楚国西境，江水穿行
    ];
    for (const m of majorMountains) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("filter", "url(#ds)");
      const base = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      base.setAttribute("cx", m.x); base.setAttribute("cy", m.y);
      base.setAttribute("rx", m.w/2); base.setAttribute("ry", m.h/2);
      base.setAttribute("fill", "#8b7355");
      base.setAttribute("opacity", "0.2");
      g.appendChild(base);
      for (let i = -1; i <= 1; i++) {
        const px = m.x + i * m.w * 0.28;
        const ph = m.h * (0.6 + Math.abs(i) * 0.2);
        const peak = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        const hs = m.h * 1.1;
        const ws = m.w * 0.22;
        peak.setAttribute("points", `${px},${m.y - hs} ${px - ws},${m.y - m.h * 0.3} ${px + ws},${m.y - m.h * 0.3}`);
        peak.setAttribute("fill", "#9b8b75");
        peak.setAttribute("opacity", "0.45");
        g.appendChild(peak);
      }
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", m.x); text.setAttribute("y", m.y - m.h - 8);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#a09080");
      text.setAttribute("font-size", "9"); text.setAttribute("font-weight", "bold");
      text.setAttribute("letter-spacing", "2");
      text.textContent = m.name;
      g.appendChild(text);
      this.svg.appendChild(g);
    }
  },

  _drawTerritories() {
    // Geographically calibrated polygons
    const territories = {
      "秦": [[40,60],[210,60],[210,280],[230,340],[230,510],[40,510]],
      "赵": [[220,60],[460,60],[460,280],[220,280]],
      "燕": [[430,60],[600,60],[600,160],[440,160]],
      "齐": [[440,240],[600,240],[600,390],[440,390]],
      "魏": [[220,240],[420,240],[420,370],[220,370]],
      "韩": [[220,330],[390,330],[390,440],[220,440]],
      "楚": [[220,390],[600,390],[600,520],[220,520]],
    };

    for (const [name, points] of Object.entries(territories)) {
      const country = COUNTRIES[name];
      if (!country) continue;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      path.setAttribute("points", points.map(p => p.join(",")).join(" "));
      path.setAttribute("fill", country.highlight);
      path.setAttribute("fill-opacity", "0.06");
      path.setAttribute("stroke", country.color);
      path.setAttribute("stroke-width", "0.8");
      path.setAttribute("stroke-opacity", "0.15");
      path.setAttribute("stroke-dasharray", "4 8");
      path.setAttribute("stroke-linejoin", "round");
      path.id = `territory-${name}`;

      const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
      const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", cx); label.setAttribute("y", cy);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "central");
      label.setAttribute("fill", country.highlight);
      label.setAttribute("font-size", "28");
      label.setAttribute("font-weight", "bold");
      label.setAttribute("font-family", "'Ma Shan Zheng','ZCOOL XiaoWei',cursive");
      label.setAttribute("opacity", "0.35");
      label.setAttribute("letter-spacing", "8");
      label.textContent = name;
      this.svg.appendChild(path);
      this.svg.appendChild(label);
    }
  },

  _drawConnections() {
    const drawn = new Set();
    for (const [a, b] of CITY_CONNECTIONS) {
      const key = [a, b].sort().join("-");
      if (drawn.has(key)) continue;
      drawn.add(key);
      const pa = this._getCityPos(a), pb = this._getCityPos(b);
      if (!pa || !pb) continue;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", pa[0]); line.setAttribute("y1", pa[1]);
      line.setAttribute("x2", pb[0]); line.setAttribute("y2", pb[1]);
      line.setAttribute("stroke", "#7b5b3a");
      line.setAttribute("stroke-width", "0.6");
      line.setAttribute("stroke-opacity", "0.25");
      line.setAttribute("stroke-dasharray", "3 4");
      this.svg.appendChild(line);
    }
  },

  _drawCities() {
    // Hash function to generate deterministic pseudo-random vertices per city
    const hashStr = (s) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
      return Math.abs(h);
    };

    for (const [city, owner] of Object.entries(GameState.territory)) {
      const pos = this._getCityPos(city);
      if (!pos) continue;
      const country = COUNTRIES[owner];
      if (!country) continue;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-city", city);
      g.style.cursor = "pointer";

      // ── City polygon (irregular zone) ──
      const seed = hashStr(city);
      const numVerts = 7 + (seed % 3); // 7-9 vertices
      const verts = [];
      for (let i = 0; i < numVerts; i++) {
        const angle = (i / numVerts) * Math.PI * 2;
        const rBase = 14 + (seed * (i + 1)) % 8; // 14-22px radius
        const angleJitter = ((seed * (i + 7)) % 10) / 10 - 0.5; // ±0.5 rad
        const a = angle + angleJitter * 0.3;
        verts.push([
          Math.round(pos[0] + Math.cos(a) * rBase),
          Math.round(pos[1] + Math.sin(a) * rBase)
        ]);
      }

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", verts.map(v => v.join(",")).join(" "));
      poly.setAttribute("fill", country.highlight);
      poly.setAttribute("fill-opacity", "0.28");
      poly.setAttribute("stroke", country.color);
      poly.setAttribute("stroke-width", "1");
      poly.setAttribute("stroke-opacity", "0.55");
      poly.setAttribute("stroke-linejoin", "round");
      poly.id = `citypoly-${city}`;
      this.cityPolys[city] = poly;
      g.appendChild(poly);

      // ── City dot ──
      const stateCountry = GameState.countries[owner];
      const isCapital = stateCountry && stateCountry.capital === city;
      const r = isCapital ? 6 : 4;
      const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      outer.setAttribute("cx", pos[0]); outer.setAttribute("cy", pos[1]);
      outer.setAttribute("r", r + 2);
      outer.setAttribute("fill", "none");
      outer.setAttribute("stroke", country.color);
      outer.setAttribute("stroke-width", "1");
      outer.setAttribute("stroke-opacity", isCapital ? "0.4" : "0.15");

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", pos[0]); circle.setAttribute("cy", pos[1]);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", country.color);
      circle.setAttribute("stroke", isCapital ? "#fff" : country.highlight);
      circle.setAttribute("stroke-width", isCapital ? 2 : 1);
      if (isCapital) circle.setAttribute("filter", "url(#glow)");
      circle.id = `city-${city}`;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", pos[0]); text.setAttribute("y", pos[1] - 12);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", isCapital ? country.highlight : "#a09080");
      text.setAttribute("font-size", isCapital ? "11" : "8.5");
      text.setAttribute("font-weight", isCapital ? "bold" : "normal");
      text.textContent = city;

      g.appendChild(outer); g.appendChild(circle); g.appendChild(text);

      // ── Tooltip ──
      g.addEventListener('mouseenter', (e) => {
        this.tooltip.style.display = 'block';
        const ownerLabel = GameState.territory[city];
        this.tooltip.innerHTML = `<span style="color:${COUNTRIES[ownerLabel]?.highlight||'#fff'}">${city}</span><br/><small>${ownerLabel}${isCapital?' · 都城':''}</small><br/><small>城防:${(CITY_CHARACTERISTICS[city]||{defense:'?'}).defense} 要:${(CITY_CHARACTERISTICS[city]||{importance:'?'}).importance}</small>`;
        this.tooltip.style.left = (e.clientX + 12) + 'px';
        this.tooltip.style.top = (e.clientY - 28) + 'px';
      });
      g.addEventListener('mousemove', (e) => {
        this.tooltip.style.left = (e.clientX + 12) + 'px';
        this.tooltip.style.top = (e.clientY - 28) + 'px';
      });
      g.addEventListener('mouseleave', () => { this.tooltip.style.display = 'none'; });

      this.svg.appendChild(g);
    }
  },

  drawAttackArrows() {
    // Remove old arrows
    this.svg.querySelectorAll('.atk-arrow, .atk-label').forEach(el => el.remove());
    if (!GameState.attackArrows || GameState.attackArrows.length === 0) return;

    const defs = this.svg.querySelector('defs');
    // Add arrowhead marker if not exists
    if (!this.svg.getElementById('atkArrowRed')) {
      for (const [id, color] of [['atkArrowRed', '#c41e3a'], ['atkArrowGold', '#e8d07a']]) {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", id); marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", 5); marker.setAttribute("refY", 5);
        marker.setAttribute("markerWidth", 6); marker.setAttribute("markerHeight", 6);
        marker.setAttribute("orient", "auto");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", color);
        marker.appendChild(path);
        defs.appendChild(marker);
      }
    }

    const drawn = new Set();
    for (const arrow of GameState.attackArrows) {
      const key = arrow.from + '→' + arrow.to;
      if (drawn.has(key)) continue;
      drawn.add(key);

      const fromC = GameState.countries[arrow.from];
      const toC = GameState.countries[arrow.to];
      if (!fromC || !toC || !fromC.alive || !toC.alive) continue;
      const fromCap = fromC.capital || fromC.cities[0];
      const toCity = arrow.city || (toC.cities[0]);
      const fp = this._getCityPos(fromCap);
      const tp = this._getCityPos(toCity);
      if (!fp || !tp) continue;

      const isPlayer = arrow.from === GameState.playerCountry;
      const color = isPlayer ? '#e8d07a' : arrow.result === 'win' ? '#c41e3a' : '#f39c12';

      // Draw curved line
      const midX = (fp[0] + tp[0]) / 2 + (fp[1] - tp[1]) * 0.3;
      const midY = (fp[1] + tp[1]) / 2 - (fp[0] - tp[0]) * 0.3;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${fp[0]},${fp[1]} Q ${midX},${midY} ${tp[0]},${tp[1]}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", color);
      path.setAttribute("stroke-width", isPlayer ? '2.5' : '1.5');
      path.setAttribute("stroke-opacity", '0.7');
      path.setAttribute("marker-end", `url(#${isPlayer ? 'atkArrowGold' : 'atkArrowRed'})`);
      path.setAttribute("class", 'atk-arrow');

      // Pulsing animation for player attacks
      if (isPlayer) {
        path.innerHTML = `<animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>`;
      }

      this.svg.appendChild(path);
    }
  },

  drawDiploLines() {
    // Remove old diplomacy lines
    this.svg.querySelectorAll('.diplo-line').forEach(el => el.remove());

    const player = GameState.playerCountry;
    const playerCap = GameState.countries[player]?.capital;
    const playerPos = playerCap ? this._getCityPos(playerCap) : null;
    if (!playerPos) return;

    const defs = this.svg.querySelector('defs') || this.svg.insertBefore(
      document.createElementNS("http://www.w3.org/2000/svg", "defs"), this.svg.firstChild
    );

    // Define markers if not already
    if (!this.svg.getElementById('dipArrowGreen')) {
      for (const [id, color] of [['dipArrowGreen', '#5ac08d'], ['dipArrowRed', '#c41e3a']]) {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", id);
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", 5); marker.setAttribute("refY", 5);
        marker.setAttribute("markerWidth", 6); marker.setAttribute("markerHeight", 6);
        marker.setAttribute("orient", "auto");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", color); path.setAttribute("opacity", "0.6");
        marker.appendChild(path);
        defs.appendChild(marker);
      }
    }

    for (const [name] of Object.entries(GameState.countries)) {
      if (name === player || !GameState.countries[name].alive) continue;
      const cap = GameState.countries[name].capital;
      const pos = cap ? this._getCityPos(cap) : null;
      if (!pos) continue;

      const rel = GameState.getRelation(player, name);
      const isAlly = rel >= 30;
      const isEnemy = rel <= -30;
      if (!isAlly && !isEnemy) continue;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", playerPos[0]); line.setAttribute("y1", playerPos[1]);
      line.setAttribute("x2", pos[0]); line.setAttribute("y2", pos[1]);
      line.setAttribute("stroke", isAlly ? '#5ac08d' : '#c41e3a');
      line.setAttribute("stroke-width", isAlly ? '1.5' : '1');
      line.setAttribute("stroke-opacity", '0.4');
      line.setAttribute("stroke-dasharray", isAlly ? '4 3' : '2 3');
      line.setAttribute("class", 'diplo-line');
      line.setAttribute("marker-end", isAlly ? 'url(#dipArrowGreen)' : 'url(#dipArrowRed)');
      this.svg.appendChild(line);
    }
  },

  _drawLegend() {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", "translate(8, 8)");

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", "80");
    bg.setAttribute("height", Object.keys(GameState.countries).length * 18 + 14);
    bg.setAttribute("fill", "rgba(44,24,16,0.7)");
    bg.setAttribute("stroke", "rgba(139,115,85,0.3)");
    bg.setAttribute("stroke-width", "1");
    g.appendChild(bg);

    let y = 16;
    for (const [name] of Object.entries(GameState.countries)) {
      const c = COUNTRIES[name];
      if (!c) continue;

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", 12); dot.setAttribute("cy", y - 3);
      dot.setAttribute("r", 4); dot.setAttribute("fill", c.color);
      g.appendChild(dot);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", 22); label.setAttribute("y", y);
      label.setAttribute("fill", c.highlight);
      label.setAttribute("font-size", "10");
      label.setAttribute("font-weight", "bold");
      label.textContent = name;
      g.appendChild(label);
      y += 18;
    }
    this.svg.appendChild(g);
  },

  _drawCompass() {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", "translate(680, 510)");
    g.setAttribute("opacity", "0.3");

    const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outer.setAttribute("r", "14"); outer.setAttribute("fill", "none");
    outer.setAttribute("stroke", "#a09080"); outer.setAttribute("stroke-width", "1");
    g.appendChild(outer);

    const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    inner.setAttribute("r", "12"); inner.setAttribute("fill", "none");
    inner.setAttribute("stroke", "#a09080"); inner.setAttribute("stroke-width", "0.5");
    g.appendChild(inner);

    // Cross lines
    for (const [x1, y1, x2, y2] of [[0,-12,0,12],[-12,0,12,0]]) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1); line.setAttribute("y1", y1);
      line.setAttribute("x2", x2); line.setAttribute("y2", y2);
      line.setAttribute("stroke", "#a09080"); line.setAttribute("stroke-width", "0.5");
      g.appendChild(line);
    }

    const n = document.createElementNS("http://www.w3.org/2000/svg", "text");
    n.setAttribute("x", 0); n.setAttribute("y", -14);
    n.setAttribute("text-anchor", "middle");
    n.setAttribute("fill", "#8b6914"); n.setAttribute("font-size", "9");
    n.setAttribute("font-weight", "bold");
    n.textContent = "北";
    g.appendChild(n);

    this.svg.appendChild(g);
  },

  _getCityPos(city) {
    const positions = {
      // ── 秦 (west, x:40-230, y:60-510) ──
      "义渠":[60,80],"雍城":[80,240],"咸阳":[140,260],"栎阳":[160,250],
      "武城":[110,290],"蓝田":[160,280],"郑":[195,255],"商於":[215,320],
      "汉中":[140,350],"南郑":[130,390],
      // ── 赵 (north-center, x:220-460, y:60-280) ──
      "代":[340,80],"晋阳":[280,150],"蔺":[255,170],"离石":[265,180],
      "房子":[370,220],"中牟":[380,180],"阏与":[360,210],"邯郸":[420,200],
      "长平":[390,250],"上党":[370,265],
      // ── 燕 (northeast, x:430-600, y:60-160) ──
      "辽阳":[580,60],"右北平":[560,65],"上谷":[520,75],"渔阳":[540,80],
      "蓟":[510,110],"令支":[590,100],"涿":[510,140],"易":[490,130],
      "武阳":[490,115],"方城":[480,140],
      // ── 魏 (center, x:220-420, y:250-370) ──
      "安邑":[270,260],"少梁":[240,255],"河内":[310,255],"邺":[350,245],
      "大梁":[340,290],"酸枣":[370,300],"卷":[345,310],"观":[380,320],
      "阴晋":[290,300],"襄陵":[380,310],
      // ── 韩 (center-south, x:220-390, y:330-440) ──
      "平阳":[310,340],"宜阳":[280,350],"缑氏":[320,345],"野王":[340,330],
      "新郑":[350,360],"阳翟":[350,380],"纶":[340,370],"负黍":[350,395],
      "宛":[360,420],
      // ── 楚 (south, x:220-600, y:390-520) ──
      "上蔡":[390,390],"召陵":[380,395],"陈":[430,400],"寿春":[520,410],
      "鄢":[370,440],"郢都":[350,460],"江陵":[330,470],"黔中":[290,480],
      "巫郡":[270,450],
      // ── 齐 (east, x:440-600, y:240-390) ──
      "聊城":[520,250],"高唐":[530,240],"薄姑":[560,245],"临淄":[570,260],
      "安阳":[560,280],"即墨":[590,270],"平陆":[510,290],"莒":[570,300],
      "薛":[530,310],
    };
    return positions[city] || [360, 300];
  },

  updateTerritory() {
    // Update city polygons and dots
    for (const [cityName, owner] of Object.entries(GameState.territory)) {
      const country = COUNTRIES[owner];
      if (!country) continue;

      // City polygon
      const poly = this.cityPolys[cityName];
      if (poly) {
        poly.setAttribute("fill", country.highlight);
        poly.setAttribute("fill-opacity", "0.28");
        poly.setAttribute("stroke", country.color);
        poly.style.transition = "fill 0.6s ease";
      }

      // City dot
      const circle = this.svg.getElementById(`city-${cityName}`);
      if (circle) {
        const isCap = GameState.countries[owner]?.capital === cityName;
        circle.setAttribute("fill", country.color);
        if (isCap) {
          circle.setAttribute("stroke", "#fff");
          circle.setAttribute("filter", "url(#glow)");
          circle.setAttribute("r", "8");
        } else {
          circle.setAttribute("stroke", country.highlight);
          circle.removeAttribute("filter");
          circle.setAttribute("r", "5");
        }
        circle.style.transition = "all 0.6s ease";
        setTimeout(() => {
          circle.setAttribute("r", isCap ? "6" : "4");
        }, 600);
      }
    }

    // Territory polygon player highlight
    const player = GameState.playerCountry;
    for (const name of Object.keys(GameState.countries)) {
      const path = this.svg.getElementById(`territory-${name}`);
      if (!path) continue;
      path.setAttribute("fill-opacity", name === player ? "0.10" : "0.05");
      path.setAttribute("stroke-opacity", name === player ? "0.35" : "0.15");
    }
  },

  highlightCity(city) {
    const circle = this.svg.getElementById(`city-${city}`);
    if (!circle) return;
    circle.setAttribute("r", "9");
    circle.setAttribute("stroke", "#c9a84c");
    circle.setAttribute("stroke-width", "3");
    circle.setAttribute("filter", "url(#glow)");
    setTimeout(() => {
      const country = COUNTRIES[GameState.territory[city]];
      const isCapital = GameState.countries[GameState.territory[city]]?.capital === city;
      circle.setAttribute("r", isCapital ? "7" : "4.5");
      circle.setAttribute("stroke", isCapital ? "#fff" : (country ? country.highlight : "#a09080"));
      circle.setAttribute("stroke-width", isCapital ? "2" : "1");
      if (!isCapital) circle.removeAttribute("filter");
    }, 1500);
  }
};
