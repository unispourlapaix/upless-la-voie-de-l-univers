import Phaser from "phaser";
import { generateArtTextures } from "./artEngine";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.load.image("upless-manga-sticker-sheet-v1", "assets/artpacks/upless-manga-sticker-sheet-v1.png");
    this.load.image("upless-giraffe-biped-tshirt-jeans-v1", "assets/artpacks/giraffe-biped-tshirt-jeans-v1.png");
    this.load.image("upless-alien-cyber-octopus-vr-v1", "assets/artpacks/alien-cyber-octopus-vr-v1.png");
    this.load.image("upless-alien-cyber-octopus-vr-v2", "assets/artpacks/alien-cyber-octopus-vr-v2.png");
    this.load.image("upless-atmosphere-machine-sticker-v1", "assets/artpacks/atmosphere-machine-sticker-v1.png");
    this.load.image("upless-boat-repaired-clean-v1", "assets/artpacks/boat-repaired-clean-v1.png");
    this.load.image("upless-boat-galactic-futuristic-v1", "assets/artpacks/boat-galactic-futuristic-v1.png");
    this.load.image("upless-rocket-crashed-broken-v1", "assets/artpacks/rocket-crashed-broken-v1.png");
    this.load.image("upless-businessmen-laughing-cat-video-v2", "assets/artpacks/businessmen-laughing-cat-video-v2.png");
    this.load.image("upless-director-surprised-right-v1", "assets/artpacks/director-surprised-right-v1.png");
    this.load.image("upless-launch-panel-wires-buttons-v1", "assets/artpacks/launch-panel-wires-buttons-v1.png");
    this.load.image("upless-coconut-tree-v1", "assets/artpacks/coconut-tree-v1.png");
    this.load.image("upless-ice-crater-v1", "assets/artpacks/ice-crater-v1.png");
  }

  create(): void {
    generateArtTextures(this);
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0x111526, 0.28).fillEllipse(7, 43, 35, 8);
    graphics.fillStyle(0xffffff).fillRoundedRect(3, 4, 34, 38, 13);
    graphics.fillTriangle(3, 16, 6, 0, 16, 7);
    graphics.fillTriangle(10, 9, 19, 0, 22, 8);
    graphics.fillTriangle(19, 8, 30, 0, 31, 12);
    graphics.fillTriangle(27, 12, 40, 5, 35, 21);
    graphics.lineStyle(3, 0x161827, 1);
    graphics.fillStyle(0xffd16b).fillRoundedRect(6, 8, 28, 30, 10).strokeRoundedRect(6, 8, 28, 30, 10);
    graphics.fillStyle(0xffe7a5).fillRoundedRect(9, 10, 22, 21, 8);
    graphics.fillStyle(0x20263b).fillTriangle(6, 15, 9, 3, 16, 10);
    graphics.fillTriangle(13, 10, 20, 1, 22, 10);
    graphics.fillTriangle(20, 10, 29, 3, 30, 14);
    graphics.fillTriangle(27, 13, 36, 8, 33, 20);
    graphics.fillStyle(0xffffff).fillEllipse(15, 20, 7, 9).fillEllipse(26, 20, 7, 9);
    graphics.fillStyle(0x273150).fillEllipse(16, 21, 3, 5).fillEllipse(25, 21, 3, 5);
    graphics.lineStyle(2, 0x8a5537, 1).beginPath().arc(21, 26, 5, 0.2, Math.PI - 0.2).strokePath();
    graphics.fillStyle(0x5d6fe5).fillRoundedRect(9, 32, 9, 9, 3);
    graphics.fillStyle(0x3e50ba).fillRoundedRect(22, 32, 9, 9, 3);
    graphics.generateTexture("hero", 42, 47);
    graphics.clear();

    graphics.fillStyle(0x7e8aab).fillCircle(13, 13, 13);
    graphics.fillStyle(0xaeb7d0).fillCircle(9, 9, 4);
    graphics.generateTexture("rock", 26, 26);
    graphics.destroy();

    this.scene.start("MenuScene");
  }
}
