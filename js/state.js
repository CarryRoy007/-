const GameState = {
  era: null,
  year: 0,
  turn: 0,
  maxTurns: 80,
  playerCountry: "",
  countries: {},
  characters: [],
  diplomacy: {},
  territory: {},
  chronicle: [],
  keyDecisions: [],
  warLog: [],
  gameOver: false,
  currentEvent: null,
  pendingTurn: false,
  triggeredEvents: [],
  triggeredRandomEvents: [],
  rulerFate: null,
  rulerHealth: 100,
  rulerAge: 40,
  generation: 1,
  dynastyName: "",
  successionPending: false,
  attackArrows: [],

  init(eraId, countryName) {
    const era = ERAS.find(e => e.id === eraId);
    this.era = era;
    this.year = era.year;
    this.turn = 0;
    this.maxTurns = 80;
    this.playerCountry = countryName;
    this.gameOver = false;
    this.chronicle = [];
    this.keyDecisions = [];
    this.triggeredEvents = [];
    this.triggeredRandomEvents = [];
    this.rulerFate = null;
    this.rulerHealth = 100;
    this.rulerAge = 40;
    this.generation = 1;
    this.dynastyName = countryName;
    this.successionPending = false;
    this.attackArrows = [];
    this.warLog = [];
    this.currentEvent = null;
    this.characters = [];

    this.countries = {};
    const activeCountries = era.countries;
    for (const name of activeCountries) {
      const c = COUNTRIES[name];
      this.countries[name] = {
        name: name,
        military: c.base.military,
        economy: c.base.economy,
        diplomacy: c.base.diplomacy,
        governance: c.base.governance,
        morale: c.base.morale,
        cities: [...c.cities],
        capital: c.capital,
        alive: true,
        isPlayer: name === countryName
      };
    }

    this.territory = {};
    for (const name of activeCountries) {
      const c = COUNTRIES[name];
      for (const city of c.cities) {
        this.territory[city] = name;
      }
    }

    this.diplomacy = {};
    for (const a of activeCountries) {
      this.diplomacy[a] = {};
      for (const b of activeCountries) {
        if (a !== b) {
          this.diplomacy[a][b] = this._initRelation(a, b);
        }
      }
    }

    this.chronicle.push({
      year: this.year,
      turn: 0,
      text: `${era.name}纪元开启。${countryName}开始争霸之路。`
    });
  },

  _initRelation(a, b) {
    const ca = COUNTRIES[a];
    if (!ca.neighbors.includes(b)) return 0;
    if (a === "秦" && (b === "魏" || b === "韩" || b === "赵")) return -30;
    if (b === "秦" && (a === "魏" || a === "韩" || a === "赵")) return -30;
    if (a === "秦" && b === "楚") return -10;
    if (b === "秦" && a === "楚") return -10;
    if (a === "秦" && b === "齐") return 10;
    if (b === "秦" && a === "齐") return 10;
    if ((a === "赵" && b === "魏") || (a === "魏" && b === "赵")) return 20;
    if ((a === "赵" && b === "韩") || (a === "韩" && b === "赵")) return 20;
    if ((a === "魏" && b === "韩") || (a === "韩" && b === "魏")) return 20;
    if ((a === "齐" && b === "燕") || (a === "燕" && b === "齐")) return -10;
    return 0;
  },

  getPlayer() {
    return this.countries[this.playerCountry];
  },

  getAliveCountries() {
    return Object.values(this.countries).filter(c => c.alive);
  },

  getNeighbors(countryName) {
    const c = COUNTRIES[countryName];
    if (!c) return [];
    return c.neighbors.filter(n => this.countries[n] && this.countries[n].alive);
  },

  getRelation(a, b) {
    if (!this.diplomacy[a] || this.diplomacy[a][b] === undefined) return 0;
    return this.diplomacy[a][b];
  },

  setRelation(a, b, val) {
    val = Math.max(-100, Math.min(100, val));
    if (this.diplomacy[a]) this.diplomacy[a][b] = val;
    if (this.diplomacy[b]) this.diplomacy[b][a] = val;
  },

  modifyRelation(a, b, delta) {
    this.setRelation(a, b, this.getRelation(a, b) + delta);
  },

  applyEffects(effects, countryName) {
    const c = this.countries[countryName];
    if (!c) return;
    if (effects.military) c.military = Math.max(0, Math.min(100, c.military + effects.military));
    if (effects.economy) c.economy = Math.max(0, Math.min(100, c.economy + effects.economy));
    if (effects.diplomacy) c.diplomacy = Math.max(0, Math.min(100, c.diplomacy + effects.diplomacy));
    if (effects.governance) c.governance = Math.max(0, Math.min(100, c.governance + effects.governance));
    if (effects.morale) c.morale = Math.max(0, Math.min(100, c.morale + effects.morale));
  },

  transferCity(city, from, to) {
    if (this.territory[city] !== from) return;
    this.territory[city] = to;
    const fromC = this.countries[from];
    const toC = this.countries[to];
    if (fromC) {
      fromC.cities = fromC.cities.filter(c => c !== city);
      if (city === fromC.capital && fromC.cities.length > 0) {
        fromC.capital = fromC.cities[0];
        this.addChronicle(`${from}迁都于${fromC.capital}。`);
      }
    }
    if (toC) toC.cities.push(city);
    if (fromC && fromC.cities.length === 0) {
      fromC.alive = false;
      this.addChronicle(`${from}灭亡！`, true);
    }
  },

  getCityCount(countryName) {
    return Object.values(this.territory).filter(owner => owner === countryName).length;
  },

  getTotalCities() {
    return Object.keys(this.territory).length;
  },

  addChronicle(text, important = false) {
    this.chronicle.push({
      year: this.year,
      turn: this.turn,
      text: text,
      important: important
    });
  },

  addDecision(text) {
    this.keyDecisions.push({
      year: this.year,
      turn: this.turn,
      text: text
    });
  },

  getSeason() {
    return SEASONS[this.turn % 4];
  },

  getYearStr() {
    return `前${Math.abs(this.year)}年`;
  },

  save() {
    const data = JSON.stringify(this);
    localStorage.setItem('warring_states_save', data);
  },

  load() {
    const data = localStorage.getItem('warring_states_save');
    if (data) {
      const saved = JSON.parse(data);
      Object.assign(this, saved);
      return true;
    }
    return false;
  },

  clearSave() {
    localStorage.removeItem('warring_states_save');
  }
};
