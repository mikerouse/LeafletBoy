// PreloadScene.js

export default class PreloadScene extends Phaser.Scene {
    constructor() {
      super({ key: "PreloadScene" });
    }
  
    preload() {
      // Create a loading text at the center of the screen.
      this.loadingText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "Loading... 0%",
        { font: "32px Arial", fill: "#fff" }
      ).setOrigin(0.5);
  
      // Update the loading text as assets load.
      this.load.on("progress", (value) => {
        this.loadingText.setText("Loading... " + Math.round(value * 100) + "%");
      });
  
      // When loading is complete, start the MenuScene.
      this.load.on("complete", () => {
        this.scene.start("MenuScene");
      });
  
      // Preload external assets (for example, audio).
      this.load.audio("bleep", "https://labs.phaser.io/assets/audio/SoundEffects/key.wav");
  
      // Preload additional assets as needed.
    }
  
    create() {
      // Nothing additional is required here as the scene transitions
      // in the "complete" event above.
    }
  }
  