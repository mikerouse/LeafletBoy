// main.js

// Expose global variables for party colors and player's party.
window.partyColors = {
    blue: 0x0000ff,
    red: 0xff0000,
    yellow: 0xffff00,
    green: 0x00ff00,
    turquoise: 0x40E0D0
  };
  window.playerParty = null;
  
  // MenuScene: Displays party selection and rules.
  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }
    create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.add.text(centerX, centerY - 140, "Choose Your Party", { font: "32px Arial", fill: "#fff" }).setOrigin(0.5);
      
      const rulesText = "Move with arrows or WASD and swipe (drag) your avatar to move.\n" +
                        "Tap anywhere (that isn’t dragging) to deliver a leaflet.\n" +
                        "Houses fall from the top—get underneath to deliver a leaflet into its letterbox, then move away!\n" +
                        "Don't trespass onto a house or you'll lose a life.";
      this.add.text(centerX, centerY - 100, rulesText, {
        font: "16px Arial",
        fill: "#fff",
        align: "center",
        wordWrap: { width: 400 }
      }).setOrigin(0.5);
      
      const parties = ["blue", "red", "yellow", "green", "turquoise"];
      parties.forEach((party, index) => {
        let block = this.add.rectangle(centerX, centerY + 20 + index * 50, 100, 35, window.partyColors[party]);
        block.setStrokeStyle(2, 0xffffff);
        block.setInteractive();
        block.on("pointerdown", () => {
          window.playerParty = party;
          this.scene.start("GameScene");
        });
      });
    }
  }
  
  // GameScene: For now, it simply displays a confirmation message.
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
    }
    preload() {
      // For demonstration, we generate a simple texture for the player.
      let playerGfx = this.add.graphics();
      playerGfx.fillStyle(0xffcc99, 1);
      playerGfx.fillCircle(15, 10, 10);
      let bodyColor = window.playerParty ? window.partyColors[window.playerParty] : 0xffffff;
      playerGfx.fillStyle(bodyColor, 1);
      playerGfx.fillRect(5, 20, 20, 20);
      playerGfx.fillStyle(0x000000, 1);
      playerGfx.fillRect(8, 40, 4, 10);
      playerGfx.fillRect(18, 40, 4, 10);
      playerGfx.generateTexture("player", 30, 50);
      playerGfx.destroy();
      
      // (Preload your other assets as needed.)
    }
    create() {
      // For now, just display text confirming the transition.
      this.add.text(240, 450, "GameScene Loaded!\nParty: " + window.playerParty, { 
        font: "24px Arial", fill: "#fff", align: "center" 
      }).setOrigin(0.5);
      
      // (Add your gameplay setup code here.)
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 900,
    parent: "game-container", // Ensure this matches the id in your index.php
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#333333",
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [MenuScene, GameScene]
  };
  
  const game = new Phaser.Game(config);
  