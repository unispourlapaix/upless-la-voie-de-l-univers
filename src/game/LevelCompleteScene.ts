import Phaser from "phaser";

export class LevelCompleteScene extends Phaser.Scene {
  private completedLevel = 1;

  constructor() {
    super("LevelCompleteScene");
  }

  init(data: { completedLevel?: number }): void {
    this.completedLevel = data.completedLevel ?? 1;
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
    const hasNextLevel = this.completedLevel < 3;
    const button = this.add
      .text(180, 435, hasNextLevel ? "NIVEAU SUIVANT" : "LA SUITE ARRIVE BIENTÔT…", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "13px",
        color: "#17203c",
        backgroundColor: "#ffd36a",
        padding: { x: 20, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    if (hasNextLevel) {
      button.on("pointerdown", () => {
        if (this.completedLevel === 1) this.scene.start("OfficeScene");
        else if (this.completedLevel === 2) this.scene.start("DesertScene");
      });
    }
  }
}
