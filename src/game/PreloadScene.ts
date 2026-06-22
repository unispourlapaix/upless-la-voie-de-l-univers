import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0xffd36a).fillRoundedRect(0, 0, 26, 34, 8);
    graphics.fillStyle(0x20294d).fillCircle(8, 13, 2).fillCircle(18, 13, 2);
    graphics.fillStyle(0xffffff, 0.85).fillRoundedRect(5, 25, 16, 4, 2);
    graphics.generateTexture("hero", 26, 34);
    graphics.clear();

    graphics.fillStyle(0x7e8aab).fillCircle(13, 13, 13);
    graphics.fillStyle(0xaeb7d0).fillCircle(9, 9, 4);
    graphics.generateTexture("rock", 26, 26);
    graphics.destroy();

    this.scene.start("MenuScene");
  }
}
