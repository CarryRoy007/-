const SaveManager = {
  save() {
    GameState.save();
  },

  load() {
    return GameState.load();
  },

  hasSave() {
    return localStorage.getItem('warring_states_save') !== null;
  },

  clearSave() {
    GameState.clearSave();
  }
};
