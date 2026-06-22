import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0x111526, 0.35).fillEllipse(4, 39, 32, 7);
    graphics.lineStyle(3, 0x161827, 1);
    graphics.fillStyle(0xffd16b).fillRoundedRect(4, 7, 28, 30, 10).strokeRoundedRect(4, 7, 28, 30, 10);
    graphics.fillStyle(0xffe7a5).fillRoundedRect(7, 9, 22, 21, 8);
    graphics.fillStyle(0x20263b).fillTriangle(4, 14, 7, 2, 14, 9);
    graphics.fillTriangle(11, 9, 18, 0, 20, 9);
    graphics.fillTriangle(18, 9, 27, 2, 28, 13);
    graphics.fillTriangle(25, 12, 34, 7, 31, 19);
    graphics.fillStyle(0xffffff).fillEllipse(13, 19, 7, 9).fillEllipse(24, 19, 7, 9);
    graphics.fillStyle(0x273150).fillEllipse(14, 20, 3, 5).fillEllipse(23, 20, 3, 5);
    graphics.lineStyle(2, 0x8a5537, 1).beginPath().arc(19, 25, 5, 0.2, Math.PI - 0.2).strokePath();
    graphics.fillStyle(0x5d6fe5).fillRoundedRect(7, 31, 9, 9, 3);
    graphics.fillStyle(0x3e50ba).fillRoundedRect(20, 31, 9, 9, 3);
    graphics.generateTexture("hero", 37, 43);
    graphics.clear();

    graphics.fillStyle(0x7e8aab).fillCircle(13, 13, 13);
    graphics.fillStyle(0xaeb7d0).fillCircle(9, 9, 4);
    graphics.generateTexture("rock", 26, 26);
    graphics.destroy();

    this.scene.start("MenuScene");
  }
}
