import Phaser from "phaser";
import { audio } from "./audio";
import { loadSave } from "./types";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#f4f0e8");
    this.add.rectangle(180, 320, 360, 640, 0xf4f0e8);
    this.add.circle(180, 202, 145, 0xff4f8b, 0.16);
    this.add.circle(180, 202, 104, 0x6949d7, 0.12);
    this.add.circle(180, 202, 66, 0xffd45f, 0.24);
    const burst = this.add.graphics();
    burst.lineStyle(2, 0x2a2440, 0.12);
    for (let i = 0; i < 42; i += 1) {
      const angle = (Math.PI * 2 * i) / 42;
      burst.lineBetween(180 + Math.cos(angle) * 105, 202 + Math.sin(angle) * 105, 180 + Math.cos(angle) * 245, 202 + Math.sin(angle) * 245);
    }
    const dots = this.add.graphics();
    dots.fillStyle(0x342d4f, 0.13);
    for (let y = 330; y < 620; y += 13) {
      for (let x = (y / 13) % 2 ? 8 : 14; x < 360; x += 14) dots.fillCircle(x, y, 1.5);
    }
    for (let i = 0; i < 28; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(20, 340),
        Phaser.Math.Between(40, 560),
        Phaser.Math.Between(1, 3),
        0xdce4ff,
        Phaser.Math.FloatBetween(0.15, 0.6),
      );
      this.tweens.add({
        targets: star,
        alpha: 0.05,
        duration: Phaser.Math.Between(900, 2000),
        yoyo: true,
        repeat: -1,
      });
    }

    const orbit = this.add.graphics();
    orbit.lineStyle(2, 0x8da2ff, 0.4).strokeEllipse(180, 210, 240, 92);
    this.tweens.add({ targets: orbit, angle: 360, duration: 16000, repeat: -1 });

    this.add
      .text(180, 190, "UPLESS", {
        fontFamily: "Arial Rounded MT Bold, system-ui",
        fontSize: "48px",
        color: "#211b38",
        stroke: "#ffffff",
        strokeThickness: 7,
        letterSpacing: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 236, "LA VOIE DE L’UNIVERS", {
        fontFamily: "system-ui",
        fontSize: "13px",
        color: "#5d43c2",
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 278, "♫  POP POLYPHONIQUE SYNTHÉTISÉE", {
        fontFamily: "system-ui",
        fontSize: "10px",
        color: "#7e6d91",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    this.add.ellipse(180, 389, 76, 15, 0x2a2440, 0.22);
    const hero = this.add.image(180, 360, "hero").setScale(1.65);
    this.tweens.add({ targets: hero, y: 354, duration: 850, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const start = this.add
      .text(180, 486, "TOUCHER POUR COMMENCER", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "15px",
        color: "#ffffff",
        backgroundColor: "#ff4f8b",
        stroke: "#2a2440",
        strokeThickness: 2,
        padding: { x: 22, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: start, scale: 1.04, duration: 900, yoyo: true, repeat: -1 });
    this.input.once("pointerdown", () => {
      void audio.start();
      audio.play("confirm");
      const requestedLevel = new URLSearchParams(window.location.search).get("level");
      const save = loadSave();
      if (requestedLevel === "3" || save.lastLevel >= 3) {
        this.scene.start("DesertScene");
      } else if (requestedLevel === "2" || save.lastLevel >= 2) {
        this.scene.start("OfficeScene");
      } else {
        this.scene.start("GameScene", { levelId: 1 });
      }
    });
  }
}
