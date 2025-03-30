import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";

// Expose partyColors and playerParty to global scope for easy access.
window.partyColors = {
  blue: 0x0000ff,
  red: 0xff0000,
  yellow: 0xffff00,
  green: 0x00ff00,
  turquoise: 0x40E0D0
};
window.playerParty = null;

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 900,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: "#333333",
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);
