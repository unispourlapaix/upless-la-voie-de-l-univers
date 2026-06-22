import Phaser from "phaser";

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super("LevelCompleteScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111936");
    this.add.circle(180, 175, 90, 0xffd36a, 0.12);
    this.add.text(180, 145, "✦", { fontSize: "78px", color: "#ffd36a" }).setOrigin(0.5);
    this.add
      .text(180, 250, "Niveau terminé !", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.add
      .text(180, 315, "Le petit héros avance\nsur la voie de l’univers.", {
        fontFamily: "system-ui",
        align: "center",
        fontSize: "17px",
        color: "#b8c5ff",
        lineSpacing: 8,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 435, "LA SUITE ARRIVE BIENTÔT…", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "13px",
        color: "#17203c",
        backgroundColor: "#ffd36a",
        padding: { x: 20, y: 14 },
      })
      .setOrigin(0.5);
  }
}
