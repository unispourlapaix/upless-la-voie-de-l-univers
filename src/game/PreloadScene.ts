import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0x18203c, 0.35).fillEllipse(4, 35, 28, 7);
    graphics.fillStyle(0xf2a950).fillRoundedRect(3, 3, 25, 32, 9);
    graphics.fillStyle(0xffd879).fillRoundedRect(5, 3, 21, 25, 8);
    graphics.fillStyle(0xffecae, 0.7).fillRoundedRect(7, 5, 12, 5, 3);
    graphics.fillStyle(0x28304b).fillCircle(11, 16, 2.2).fillCircle(21, 16, 2.2);
    graphics.lineStyle(2, 0x714d35, 0.75).beginPath().arc(16, 20, 5, 0.2, Math.PI - 0.2).strokePath();
    graphics.fillStyle(0x5c75d6).fillRoundedRect(7, 29, 7, 8, 3);
    graphics.fillStyle(0x425bb8).fillRoundedRect(18, 29, 7, 8, 3);
    graphics.generateTexture("hero", 32, 40);
    graphics.clear();

    graphics.fillStyle(0x7e8aab).fillCircle(13, 13, 13);
    graphics.fillStyle(0xaeb7d0).fillCircle(9, 9, 4);
    graphics.generateTexture("rock", 26, 26);
    graphics.destroy();

    this.scene.start("MenuScene");
  }
}
