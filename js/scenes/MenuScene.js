export default class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }
    create() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      // Title text with additional bottom margin.
      this.add.text(centerX, centerY - 180, "Choose Your Party", { font: "32px Arial", fill: "#fff" }).setOrigin(0.5);
      
      // Rules text placed further down with a wordWrap width for neat layout.
      const rulesText = "Move with arrows or WASD and swipe (drag) your avatar to move.\n" +
                        "Tap anywhere (that isn’t dragging) to deliver a leaflet.\n" +
                        "Houses fall from the top—get underneath to deliver a leaflet into its letterbox, then move away!\n" +
                        "Don't trespass onto a house or you'll lose a life.";
      this.add.text(centerX, centerY - 100, rulesText, { font: "16px Arial", fill: "#fff", align: "center", wordWrap: { width: 400 } }).setOrigin(0.5);
      
      const parties = ["blue", "red", "yellow", "green", "turquoise"];
      parties.forEach((party, index) => {
        let block = this.add.rectangle(centerX, centerY + 20 + index * 60, 100, 40, window.partyColors[party]);
        block.setStrokeStyle(2, 0xffffff);
        block.setInteractive();
        block.on("pointerdown", () => {
          window.playerParty = party;
          this.scene.start("GameScene");
        });
      });
    }
  }
  