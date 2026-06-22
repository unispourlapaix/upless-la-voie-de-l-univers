import Phaser from "phaser";
import { audio } from "./audio";
import { loadSave } from "./types";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#10162f");
    this.add.circle(180, 210, 112, 0x6574d9, 0.12);
    this.add.circle(180, 210, 72, 0xffd36a, 0.08);

    const orbit = this.add.graphics();
    orbit.lineStyle(2, 0x8da2ff, 0.4).strokeEllipse(180, 210, 240, 92);
    this.tweens.add({ targets: orbit, angle: 360, duration: 16000, repeat: -1 });

    this.add
      .text(180, 190, "UPLESS", {
        fontFamily: "Arial Rounded MT Bold, system-ui",
        fontSize: "48px",
        color: "#ffffff",
        letterSpacing: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 236, "LA VOIE DE L’UNIVERS", {
        fontFamily: "system-ui",
        fontSize: "13px",
        color: "#b8c5ff",
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 278, "♫  POP POLYPHONIQUE SYNTHÉTISÉE", {
        fontFamily: "system-ui",
        fontSize: "10px",
        color: "#8799dc",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const hero = this.add.image(180, 365, "hero").setScale(1.5);
    this.tweens.add({ targets: hero, y: 354, duration: 850, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const start = this.add
      .text(180, 486, "TOUCHER POUR COMMENCER", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "15px",
        color: "#17203c",
        backgroundColor: "#ffd36a",
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
      if (requestedLevel === "2" || save.lastLevel >= 2) {
        this.scene.start("OfficeScene");
      } else {
        this.scene.start("GameScene", { levelId: 1 });
      }
    });
  }
}
