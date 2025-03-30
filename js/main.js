// main.js

// Global party color mapping.
const partyColors = {
    blue: 0x0000ff,
    red: 0xff0000,
    yellow: 0xffff00,
    green: 0x00ff00,
    turquoise: 0x40E0D0
  };
  
  let playerParty = null;
  
  // Menu Scene: Party selection and rules.
  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }
    create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      this.add.text(centerX, centerY - 140, "Choose Your Party", { font: "32px Arial", fill: "#fff" }).setOrigin(0.5);
  
      const rulesText = "Move with arrows or WASD and swipe (drag) your avatar to move.\n" +
                        "Tap anywhere (that isn’t dragging your character) to deliver a leaflet.\n" +
                        "Each house shows a door number (voter count) above its door.\n" +
                        "Houses fall from the top – get underneath a falling house to deliver a leaflet into its letterbox, then move away!\n" +
                        "Don't trespass onto a house or you'll lose a life.";
      this.add.text(centerX, centerY - 80, rulesText, { font: "18px Arial", fill: "#fff", align: "center" }).setOrigin(0.5);
  
      const parties = ["blue", "red", "yellow", "green", "turquoise"];
      parties.forEach((party, index) => {
        let block = this.add.rectangle(centerX, centerY + 20 + index * 60, 100, 40, partyColors[party]);
        block.setStrokeStyle(2, 0xffffff);
        block.setInteractive();
        block.on("pointerdown", () => {
          playerParty = party;
          this.scene.start("GameScene");
        });
      });
    }
  }
  
  // Game Scene: Main gameplay and results.
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
    }
    preload() {
      // Create player texture.
      let playerGfx = this.add.graphics();
      playerGfx.fillStyle(0xffcc99, 1);
      playerGfx.fillCircle(15, 10, 10);
      let bodyColor = playerParty ? partyColors[playerParty] : 0xffffff;
      playerGfx.fillStyle(bodyColor, 1);
      playerGfx.fillRect(5, 20, 20, 20);
      playerGfx.fillStyle(0x000000, 1);
      playerGfx.fillRect(8, 40, 4, 10);
      playerGfx.fillRect(18, 40, 4, 10);
      playerGfx.generateTexture("player", 30, 50);
      playerGfx.destroy();
  
      // Create house texture.
      let houseGfx = this.add.graphics();
      houseGfx.fillStyle(0x888888, 1);
      houseGfx.fillRect(0, 20, 80, 80);
      houseGfx.fillStyle(0x444444, 1);
      houseGfx.fillTriangle(0, 20, 40, -10, 80, 20);
      houseGfx.fillStyle(0x654321, 1);
      houseGfx.fillRect(30, 60, 20, 40);
      houseGfx.fillStyle(0xffffff, 1);
      houseGfx.fillRect(34, 75, 12, 4);
      houseGfx.generateTexture("house", 80, 100);
      houseGfx.destroy();
  
      // Create leaflet texture.
      let leafletGfx = this.add.graphics();
      leafletGfx.fillStyle(0x00ff00, 1);
      leafletGfx.fillRect(0, 0, 4, 10);
      leafletGfx.generateTexture("leaflet", 4, 10);
      leafletGfx.destroy();
  
      this.load.audio("bleep", "https://labs.phaser.io/assets/audio/SoundEffects/key.wav");
    }
    create() {
      // Portrait dimensions: 600x900.
      this.houseSpacing = 300;
      this.totalHouses = 10;
      this.houses = [];
      this.totalVotes = { blue: 0, red: 0, yellow: 0, green: 0, turquoise: 0 };
      this.playerLives = 3;
      this.gameOver = false;
      this.playerLost = false;
      this.leaflet = null;
      this.houseSpeed = 2;
  
      // Create player near bottom center.
      this.player = this.physics.add.sprite(300, 800, "player");
      this.player.setCollideWorldBounds(true);
      this.player.setInteractive();
      this.input.setDraggable(this.player);
      this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
        gameObject.x = Phaser.Math.Clamp(dragX, 0, this.sys.game.config.width);
        gameObject.y = Phaser.Math.Clamp(dragY, 0, this.sys.game.config.height);
      });
  
      // Create houses falling from the top.
      this.houseGroup = this.physics.add.group();
      for (let i = 0; i < this.totalHouses; i++) {
        let x = Phaser.Math.Between(0, 520);
        let y = -Phaser.Math.Between(50, 150) - i * this.houseSpacing;
        let house = this.physics.add.sprite(x, y, "house");
        house.setOrigin(0, 0);
        house.setImmovable(true);
        house.votes = Phaser.Math.Between(1, 4);
        house.hitLetterbox = false;
        house.evaluated = false;
        house.collided = false;
        house.fullRect = new Phaser.Geom.Rectangle(x, y, 80, 100);
        house.doorRect = new Phaser.Geom.Rectangle(x + 30, y + 60, 20, 40);
        house.letterbox = new Phaser.Geom.Rectangle(x + 34, y + 75, 12, 4);
        house.doorNumberText = this.add.text(x + 40, y + 50, house.votes.toString(), { font: "16px Arial", fill: "#fff" }).setOrigin(0.5);
        this.houses.push(house);
        this.houseGroup.add(house);
      }
  
      // Permanent HUD for votes.
      this.hudBlocks = {};
      const hudStartX = 20, hudStartY = 20, blockSize = 20, blockGap = 10, partyGap = 120;
      const parties = ["blue", "red", "yellow", "green", "turquoise"];
      parties.forEach((party, index) => {
        let block = this.add.rectangle(hudStartX, hudStartY + index * partyGap, blockSize, blockSize, partyColors[party]).setOrigin(0, 0);
        let txt = this.add.text(hudStartX + blockSize + blockGap, hudStartY + index * partyGap, "0", { font: "16px Arial", fill: "#fff" });
        this.hudBlocks[party] = { block, txt };
      });
      this.livesText = this.add.text(20, hudStartY + parties.length * partyGap, "Lives: " + this.playerLives, { font: "16px Arial", fill: "#fff" });
  
      // Global tap-to-fire.
      this.input.on("pointerup", (pointer) => {
        if (!pointer.wasDragged && !this.leaflet) {
          this.fireLeaflet();
        }
      });
  
      // Keyboard input.
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
      this.physics.add.overlap(this.player, this.houseGroup, this.handlePlayerHouseCollision, null, this);
  
      this.gameOverText = this.add.text(300, 450, "Game Over\nTap to Play Again", { font: "32px Arial", fill: "#fff", align: "center" });
      this.gameOverText.setOrigin(0.5);
      this.gameOverText.setVisible(false);
      this.input.on("pointerdown", () => {
        if (this.gameOver) { this.scene.restart(); }
      });
    }
    fireLeaflet() {
      this.leaflet = this.physics.add.sprite(this.player.x, this.player.y - 15, "leaflet");
      this.leaflet.setVelocityY(-300);
    }
    updateHUD() {
      for (const party in this.hudBlocks) {
        this.hudBlocks[party].txt.setText(this.totalVotes[party] ? this.totalVotes[party].toString() : "0");
      }
      this.livesText.setText("Lives: " + this.playerLives);
    }
    handlePlayerHouseCollision(player, house) {
      if (!house.collided) {
        house.collided = true;
        this.playerLives--;
        this.updateHUD();
        if (this.playerLives > 0) {
          this.player.setPosition(300, 800);
        } else {
          this.playerLost = true;
          this.endGame();
        }
      }
    }
    computeVotes(voteCount, boosted) {
      let distribution = { blue: 0, red: 0, yellow: 0, green: 0, turquoise: 0 };
      for (let i = 0; i < voteCount; i++) {
        let rnd = Math.random();
        if (boosted) {
          if (rnd < 0.5) {
            distribution[playerParty]++;
          } else {
            let others = ["blue", "red", "yellow", "green", "turquoise"].filter(p => p !== playerParty);
            let idx = Math.floor(Math.random() * others.length);
            distribution[others[idx]]++;
          }
        } else {
          if (rnd < 0.2) {
            distribution["blue"]++;
          } else if (rnd < 0.4) {
            distribution["red"]++;
          } else if (rnd < 0.6) {
            distribution["yellow"]++;
          } else if (rnd < 0.8) {
            distribution["green"]++;
          } else {
            distribution["turquoise"]++;
          }
        }
      }
      return distribution;
    }
    explodeLeaflet(leaflet) {
      let explosion = this.add.circle(leaflet.x, leaflet.y, 10, 0xff0000);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        duration: 300,
        onComplete: () => { explosion.destroy(); }
      });
    }
    update(time, delta) {
      if (this.gameOver) return;
      let velocityX = 0, velocityY = 0;
      if (this.cursors.left.isDown || this.wasd.left.isDown) { velocityX = -150; }
      else if (this.cursors.right.isDown || this.wasd.right.isDown) { velocityX = 150; }
      if (this.cursors.up.isDown || this.wasd.up.isDown) { velocityY = -150; }
      else if (this.cursors.down.isDown || this.wasd.down.isDown) { velocityY = 150; }
      this.player.setVelocity(velocityX, velocityY);
  
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.leaflet) { this.fireLeaflet(); }
  
      if (this.leaflet) {
        if (this.leaflet.y < 0) {
          this.leaflet.destroy();
          this.leaflet = null;
        } else {
          let leafletCenter = { x: this.leaflet.x, y: this.leaflet.y };
          for (let i = 0; i < this.houses.length; i++) {
            let house = this.houses[i];
            house.fullRect = new Phaser.Geom.Rectangle(house.x, house.y, 80, 100);
            house.doorRect = new Phaser.Geom.Rectangle(house.x + 30, house.y + 60, 20, 40);
            house.letterbox = new Phaser.Geom.Rectangle(house.x + 34, house.y + 75, 12, 4);
            if (Phaser.Geom.Rectangle.Overlaps(house.fullRect, this.leaflet.getBounds())) {
              if (Phaser.Geom.Rectangle.Overlaps(house.letterbox, this.leaflet.getBounds())) {
                if (!house.hitLetterbox) {
                  house.hitLetterbox = true;
                  let distribution = this.computeVotes(house.votes, true);
                  for (let p in distribution) { this.totalVotes[p] += distribution[p]; }
                  this.updateHUD();
                  let maxVotes = Math.max(distribution.blue, distribution.red, distribution.yellow, distribution.green, distribution.turquoise);
                  let winners = [];
                  if (distribution.blue === maxVotes) winners.push("blue");
                  if (distribution.red === maxVotes) winners.push("red");
                  if (distribution.yellow === maxVotes) winners.push("yellow");
                  if (distribution.green === maxVotes) winners.push("green");
                  if (distribution.turquoise === maxVotes) winners.push("turquoise");
                  if (winners.length === 1) {
                    let tint;
                    switch(winners[0]) {
                      case "blue": tint = partyColors.blue; break;
                      case "red": tint = partyColors.red; break;
                      case "yellow": tint = partyColors.yellow; break;
                      case "green": tint = partyColors.green; break;
                      case "turquoise": tint = partyColors.turquoise; break;
                    }
                    house.setTint(tint);
                  } else { house.clearTint(); }
                  this.sound.play("bleep");
                }
                this.leaflet.destroy();
                this.leaflet = null;
                break;
              }
              if (!Phaser.Geom.Rectangle.Overlaps(house.doorRect, this.leaflet.getBounds())) {
                this.explodeLeaflet(this.leaflet);
                this.leaflet.destroy();
                this.leaflet = null;
                break;
              }
            }
          }
        }
      }
  
      this.houses.forEach(function(house) {
        if (!house.evaluated) {
          house.y += this.houseSpeed;
          house.fullRect = new Phaser.Geom.Rectangle(house.x, house.y, 80, 100);
          house.doorRect.setTo(house.x + 30, house.y + 60, 20, 40);
          house.letterbox.setTo(house.x + 34, house.y + 75, 12, 4);
          if (house.doorNumberText) { house.doorNumberText.setPosition(house.x + 40, house.y + 50); }
          if (house.y > this.sys.game.config.height) {
            if (house.doorNumberText) { house.doorNumberText.destroy(); }
            house.evaluated = true;
            house.destroy();
          }
        }
      }, this);
  
      if (this.houses.every(function(h) { return h.evaluated; })) { this.endGame(); }
    }
    endGame() {
      this.gameOver = true;
      this.player.setVelocity(0);
      if (this.leaflet) {
        this.leaflet.destroy();
        this.leaflet = null;
      }
      this.gameOverText.setVisible(false);
      this.showResults();
    }
    showResults() {
      let scores = [
        { party: "blue", score: this.totalVotes.blue },
        { party: "red", score: this.totalVotes.red },
        { party: "yellow", score: this.totalVotes.yellow },
        { party: "green", score: this.totalVotes.green },
        { party: "turquoise", score: this.totalVotes.turquoise }
      ];
      scores.sort(function(a, b) { return b.score - a.score; });
      let maxScore = scores[0].score || 1;
      const scoreColors = {
        blue: partyColors.blue,
        red: partyColors.red,
        yellow: partyColors.yellow,
        green: partyColors.green,
        turquoise: partyColors.turquoise
      };
      let chartX = 50;
      let chartY = 550;
      let barWidth = 100;
      let maxBarHeight = 200;
      let gap = 20;
      let graphics = this.add.graphics();
      scores.forEach(function(entry, index) {
        let barHeight = (entry.score / maxScore) * maxBarHeight;
        let x = chartX + index * (barWidth + gap);
        let y = chartY - barHeight;
        graphics.fillStyle(scoreColors[entry.party], 1);
        graphics.fillRect(x, y, barWidth, barHeight);
        this.add.rectangle(x + barWidth / 2, chartY + 30, 20, 20, scoreColors[entry.party]).setOrigin(0.5);
        this.add.text(x + barWidth / 2, chartY + 55, entry.score.toString(), { font: "20px Arial", fill: "#fff", align: "center" }).setOrigin(0.5);
      }, this);
      if (!this.playerLost) {
        if (scores[0].score > (scores[1] ? scores[1].score : 0)) {
          if (scores[0].party === playerParty) {
            this.add.text(240, 100, "WINNER", { font: "80px Arial", fill: "#fff" }).setOrigin(0.5);
          }
        } else {
          this.add.text(240, 100, "DRAW LOTS", { font: "80px Arial", fill: "#fff" }).setOrigin(0.5);
        }
      }
    }
  }
  
  const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 900,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: "#333333",
    physics: { default: "arcade", arcade: { debug: false } },
    scene: [MenuScene, GameScene]
  };
  
  const game = new Phaser.Game(config);
  