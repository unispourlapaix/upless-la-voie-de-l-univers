import Phaser from "phaser";
import { generateArtTextures } from "./artEngine";
import { createPixelHero } from "./pixelArt";

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
    this.load.image("upless-crystal-stargate-blue-v1", "assets/artpacks/crystal-stargate-blue-v1.png");
    this.load.image("upless-broken-liberty-statue-pieces-v1", "assets/artpacks/broken-liberty-statue-pieces-v1.png");
    this.load.image("upless-boat-repaired-clean-v1", "assets/artpacks/boat-repaired-clean-v1.png");
    this.load.image("upless-boat-galactic-futuristic-v1", "assets/artpacks/boat-galactic-futuristic-v1.png");
    this.load.image("upless-rocket-crashed-broken-v1", "assets/artpacks/rocket-crashed-broken-v1.png");
    this.load.image("upless-rocket-crashed-broken-v2", "assets/artpacks/rocket-crashed-broken-v2.png");
    this.load.image("upless-businessmen-laughing-cat-video-v2", "assets/artpacks/businessmen-laughing-cat-video-v2.png");
    this.load.image("upless-director-surprised-right-v1", "assets/artpacks/director-surprised-right-v1.png");
    this.load.image("upless-launch-panel-wires-buttons-v1", "assets/artpacks/launch-panel-wires-buttons-v1.png");
    this.load.image("upless-coconut-tree-v1", "assets/artpacks/coconut-tree-v1.png");
    this.load.image("upless-ice-crater-v1", "assets/artpacks/ice-crater-v1.png");
  }

  create(): void {
    generateArtTextures(this);
    const graphics = this.make.graphics({ x: 0, y: 0 });

    createPixelHero(this);

    graphics.fillStyle(0x7e8aab).fillCircle(13, 13, 13);
    graphics.fillStyle(0xaeb7d0).fillCircle(9, 9, 4);
    graphics.generateTexture("rock", 26, 26);
    graphics.destroy();

    const chapter=new URLSearchParams(window.location.search).get("chapter");
    this.scene.start(chapter==="alpha"?"InvestigationScene":"MenuScene");
  }
}

