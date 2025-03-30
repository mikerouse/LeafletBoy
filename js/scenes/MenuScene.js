export default class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }
    create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      // Adjusted text styles to prevent overflow.
      this.add.text(centerX, centerY - 160, "Choose Your Party", { font: "28px Arial", fill: "#fff" }).setOrigin(0.5);
      
      const rulesText = "Move with arrows or WASD or swipe (drag) your avatar to move.\n" +
                        "Tap anywhere (that isn’t dragging) to deliver a leaflet.\n" +
                        "Houses fall from the top—get underneath to deliver a leaflet into its letterbox,\n" +
                        "then move away before you get hit. Don’t trespass or lose a life.";
      // Wrap the text with a fixed width so it wraps neatly.
      this.add.text(centerX, centerY - 100, rulesText, { font: "16px Arial", fill: "#fff", align: "center", wordWrap: { width: 400 } }).setOrigin(0.5);
      
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
  