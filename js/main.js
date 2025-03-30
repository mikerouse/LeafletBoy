// main.js

import PreloadScene from "./scenes/PreloadScene.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";

// Expose global variables for shared access between scenes.
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
  parent: "game-container", // Make sure your index.php has a div with id "game-container"
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: "#333333",
  physics: { default: "arcade", arcade: { debug: false } },
  // The scenes are loaded in order: PreloadScene, then MenuScene, then GameScene.
  scene: [PreloadScene, MenuScene, GameScene]
};

const game = new Phaser.Game(config);
