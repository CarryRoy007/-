const Chronicle = {
  show() {
    const entries = [...GameState.chronicle].sort((a, b) => a.year - b.year);
    UI.showChronicle(entries);
  },

  getSummary() {
    const entries = GameState.chronicle;
    const important = entries.filter(e => e.important);
    return important.map(e => `${e.year < 0 ? '前' + Math.abs(e.year) + '年' : e.year + '年'}：${e.text}`).join('\n');
  }
};
