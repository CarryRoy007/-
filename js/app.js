document.addEventListener('DOMContentLoaded', () => {
  UI.showStartScreen();
  UI.showEraSelect();

  const newGameBtn = document.getElementById('btn-new-game');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      SaveManager.clearSave();
      UI.showEraSelect();
    });
  }

  const continueBtn = document.getElementById('btn-continue');
  if (continueBtn) {
    if (SaveManager.hasSave()) {
      continueBtn.style.display = 'inline-block';
      continueBtn.addEventListener('click', () => {
        if (SaveManager.load()) {
          if (GameState.gameOver) {
            UI.showEndScreen(Epitaph.generate());
            return;
          }
          UI.showGameScreen();
          MapRenderer.init();
          UI.updateAll();
          MapRenderer.updateTerritory();
          if (GameState.currentEvent) {
            UI.showEvent(GameState.currentEvent);
          } else {
            Engine.nextTurn();
          }
        }
      });
    } else {
      continueBtn.style.display = 'none';
    }
  }
});
