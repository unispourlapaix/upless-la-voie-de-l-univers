import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { createEntityImage } from "./entityArt";
import { TouchInput } from "./input";
import { icon, t } from "./language";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

type MoonTarget = {
  id: "alien" | "device" | "ice" | "gate";
  x: number;
  y: number;
  radius: number;
  action: () => void;
};

export class MoonScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;
  private targets: MoonTarget[] = [];
  private hasIce = false;
  private deviceHelped = false;
  private ending = false;
  private gate!: Phaser.GameObjects.Container;
  private gateCore!: Phaser.GameObjects.Ellipse;
  private deviceSmoke!: Phaser.GameObjects.Container;
  private alien!: Phaser.GameObjects.Container;

  constructor() {
    super("MoonScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 1520, 760);
    this.cameras.main.setBounds(0, 0, 1520, 760).setBackgroundColor("#111827");
    this.drawMoon();
    this.createPlatforms();
    this.createArrivalBoat();
    this.createAtmosphereDevice();
    this.createAlien();
    this.createIceCrater();
    this.createStargate();

    this.player = new PlayerController(this, 80, 520);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -55, 50);
    this.cameras.main.setDeadzone(90, 180);

    this.createHud();
    this.inputController = new TouchInput(this, {
      onTap: (x, y) => this.handleTap(x, y),
      onDoubleTap: (x, y) => this.handleDoubleTap(x, y),
      isUiHit: (_x, y) => y < 58,
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputController?.destroy());
    this.showMessage(icon("🌙", "Niveau 5 — SAV lunaire", "Level 5 — Lunar support desk"), 2300);
    this.time.delayedCall(2400, () => this.showMessage(icon("⛵", "Le bateau arrive sur la Lune.\nNe demande pas comment.", "The boat lands on the Moon.\nDo not ask how."), 2300));
  }

  update(): void {
    if (!this.ending) this.player.update(() => true);
  }

  private drawMoon(): void {
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0x10182f, 0x10182f, 0x2a2147, 0x5c3c69, 1);
    sky.fillRect(0, 0, 360, 640);
    addWorldGrain(this, "moon", 0.1);
    for (let i = 0; i < 70; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 360), Phaser.Math.Between(40, 520), Phaser.Math.FloatBetween(0.7, 2), 0xffffff, Phaser.Math.FloatBetween(0.25, 0.8)).setScrollFactor(0);
    }
    const earthGlow = this.add.circle(290, 105, 52, 0xff3b4d, 0.14);
    const earth = this.add.circle(290, 105, 42, 0x9f1d2f, 0.94).setStrokeStyle(3, 0xff8a76, 0.72);
    const redSea = this.add.ellipse(303, 115, 52, 18, 0xe23535, 0.72).setAngle(-18);
    const africa = this.add.polygon(288, 104, [
      -8, -30,
      12, -21,
      20, -4,
      12, 14,
      3, 34,
      -11, 25,
      -18, 5,
      -15, -15,
    ], 0x050507, 0.9);
    const darkLand = this.add.ellipse(266, 91, 26, 16, 0x140b10, 0.55).setAngle(20);
    this.add.container(0, 0, [earthGlow, earth, redSea, darkLand, africa]).setScrollFactor(0);

    for (let x = 0; x < 1520; x += 160) {
      this.add.ellipse(x + 72, 585, 245, 70, 0xaeb4c6, 0.92);
      this.add.ellipse(x + 35, 615, 280, 55, 0x777f97, 0.25);
    }
    [210, 420, 700, 980, 1280].forEach((x, index) => {
      this.add.ellipse(x, 548 + (index % 2) * 9, 86, 25, 0x565d70, 0.32).setStrokeStyle(2, 0xdce3f3, 0.16);
    });
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(addReliefBlock(this, 760, 580, 1520, 60, 0x8d94aa, { texture: "moon", stroke: 0xdce3f3, strokeAlpha: 0.42, depth: 2 }));
  }

  private createArrivalBoat(): void {
    const boat = createEntityImage(this, "moonBoat").setScale(0.96).setFlipX(true);
    const label = this.add.text(0, 98, t("bateau lunaire", "moon boat"), { fontSize: "10px", color: "#e9eefb", fontStyle: "bold" }).setOrigin(0.5);
    this.add.container(205, 474, [boat, label]).setDepth(9).setAngle(4);
  }

  private createAtmosphereDevice(): void {
    const device = createEntityImage(this, "moonDevice").setScale(0.96);
    this.deviceSmoke = this.add.container(0, -48, [
      this.add.circle(-24, 0, 16, 0xbff7ff, 0.25),
      this.add.circle(0, -12, 22, 0xdffcff, 0.22),
      this.add.circle(26, 2, 15, 0xffffff, 0.18),
    ]);
    this.tweens.add({ targets: this.deviceSmoke.list, y: "-=16", alpha: 0.08, duration: 900, yoyo: true, repeat: -1 });
    this.add.container(620, 462, [device, this.deviceSmoke]).setDepth(12);
    this.targets.push({ id: "device", x: 620, y: 500, radius: 95, action: () => this.inspectDevice() });
  }

  private createAlien(): void {
    const alien = createEntityImage(this, "moonAlien").setScale(0.9);
    this.alien = this.add.container(790, 490, [alien]).setDepth(13);
    this.tweens.add({ targets: this.alien, y: 492, duration: 780, yoyo: true, repeat: -1 });
    this.targets.push({ id: "alien", x: 790, y: 500, radius: 92, action: () => this.talkAlien() });
  }

  private createIceCrater(): void {
    createEntityImage(this, "iceCrater", 1040, 535).setScale(1.05).setDepth(10);
    this.add.text(1040, 576, t("cratère glacé", "ice crater"), { fontSize: "10px", color: "#eef6ff", fontStyle: "bold" }).setOrigin(0.5);
    this.targets.push({ id: "ice", x: 1040, y: 536, radius: 72, action: () => this.collectIce() });
  }

  private createStargate(): void {
    const gateArt = createEntityImage(this, "stargate").setScale(1.08);
    this.gateCore = this.add.ellipse(0, -4, 94, 142, 0x8eeaff, 0.18).setStrokeStyle(3, 0xffffff, 0.18);
    const sparks = [0, 1, 2, 3, 4, 5, 6].map((i) =>
      this.add.rectangle(Math.cos(i) * 72, Math.sin(i * 1.7) * 88 - 4, 5, 38, 0x8eeaff, 0.62).setAngle(i * 31),
    );
    this.gate = this.add.container(1335, 458, [gateArt, this.gateCore, ...sparks]).setDepth(11);
    this.tweens.add({ targets: sparks, alpha: 0.05, duration: 160, yoyo: true, repeat: -1 });
    this.targets.push({ id: "gate", x: 1335, y: 486, radius: 130, action: () => this.inspectGate() });
  }

  private createHud(): void {
    this.add.rectangle(180, 27, 332, 42, 0x111827, 0.9).setScrollFactor(0).setDepth(100);
    this.add.text(27, 18, t("NIV. 5", "LV. 5"), { fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setScrollFactor(0).setDepth(101);
    this.objectiveText = this.add.text(328, 18, icon("💧", "EAU", "WATER"), { fontSize: "12px", color: "#ffffff", fontStyle: "bold" }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.messagePanel = this.add.rectangle(180, 588, 326, 70, 0x111827, 0.94).setStrokeStyle(3, 0x8eeaff, 0.35).setScrollFactor(0).setDepth(109).setAlpha(0);
    this.messageText = this.add.text(180, 590, "", {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#eef6ff",
      fontStyle: "bold",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 292 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.ending) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    if (this.ending) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    const target = this.targets.find((candidate) => Phaser.Math.Distance.Between(world.x, world.y, candidate.x, candidate.y) < candidate.radius);
    if (target) target.action();
    else this.showMessage(icon("…", "La poussière lunaire garde ses secrets.", "Moon dust keeps its secrets."), 1300);
  }

  private talkAlien(): void {
    if (!this.hasIce) {
      this.showMessage(icon("👽", "Alien : calcul en cours…\nIl manque de l’eau pour l’atmosphère.", "Alien: computing…\nWater is missing for the atmosphere."), 2600);
      this.objectiveText.setText(icon("🧊", "GLACE", "ICE"));
      return;
    }
    this.helpAlien();
  }

  private inspectDevice(): void {
    if (!this.hasIce) {
      this.showMessage(icon("⚙", "L’appareil fabrique atmosphère et fumée.\nIl clignote : EAU MANQUANTE.", "The device makes atmosphere and smoke.\nIt blinks: WATER MISSING."), 2600);
      this.objectiveText.setText(icon("🧊", "CRATÈRE", "CRATER"));
      return;
    }
    this.helpAlien();
  }

  private collectIce(): void {
    if (this.hasIce) {
      this.showMessage(icon("🧊", "Tu as déjà la glace lunaire.", "You already have the moon ice."), 1200);
      return;
    }
    this.hasIce = true;
    audio.play("flower");
    this.objectiveText.setText(icon("👽", "ALIEN", "ALIEN"));
    this.showMessage(icon("🧊", "Tu trouves de l’eau en glace dans le cratère.", "You find frozen water in the crater."), 2300);
  }

  private helpAlien(): void {
    if (this.deviceHelped) {
      this.inspectGate();
      return;
    }
    this.deviceHelped = true;
    this.hasIce = false;
    audio.play("bridge");
    this.objectiveText.setText(icon("✦", "PORTE", "GATE"));
    this.showMessage(icon("👽", "Tu donnes la glace à l’alien.\nIl programme le dispositif.", "You give the ice to the alien.\nIt programs the device."), 2600);
    this.tweens.add({ targets: this.deviceSmoke.list, alpha: 0.45, scale: 1.4, duration: 650, yoyo: true, repeat: 2 });
    this.time.delayedCall(1700, () => this.openThenBreakGate());
  }

  private inspectGate(): void {
    if (!this.deviceHelped) {
      this.showMessage(icon("✦", "Une porte stellaire muette.\nElle attend de l’atmosphère.", "A silent stargate.\nIt waits for atmosphere."), 2200);
      return;
    }
    this.showMessage(icon("♨", "La porte sent le brûlé cosmique.", "The gate smells like cosmic burning."), 1600);
  }

  private openThenBreakGate(): void {
    audio.play("portal");
    this.showMessage(icon("✦", "La porte stellaire s’ouvre !", "The stargate opens!"), 1600);
    this.gateCore.setFillStyle(0x8eeaff, 0.75).setStrokeStyle(4, 0xffffff, 0.8);
    this.cameras.main.shake(400, 0.006);
    this.tweens.add({ targets: this.gate, scale: 1.12, duration: 320, yoyo: true, repeat: 2 });
    for (let i = 0; i < 14; i += 1) {
      const spark = this.add.rectangle(1330 + Phaser.Math.Between(-45, 45), 494 + Phaser.Math.Between(-70, 70), 4, 30, 0x8eeaff).setDepth(30).setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({ targets: spark, x: spark.x + Phaser.Math.Between(-80, 80), y: spark.y + Phaser.Math.Between(-80, 80), alpha: 0, duration: 700, onComplete: () => spark.destroy() });
    }
    this.time.delayedCall(1800, () => {
      audio.play("danger");
      this.gateCore.setFillStyle(0x22111d, 0.82).setStrokeStyle(4, 0xff4f8b, 0.35);
      this.cameras.main.shake(650, 0.012);
      this.showMessage(icon("⚠", "Puis… panne générale.", "Then… total system failure."), 1300);
      this.time.delayedCall(1050, () => this.bigBangBoom());
    });
  }

  private bigBangBoom(): void {
    audio.play("ogre");
    this.cameras.main.flash(500, 255, 230, 120);
    this.cameras.main.shake(1100, 0.024);
    const boom = this.add.text(1330, 392, "BA DA\nBOUM!!!", {
      fontFamily: "monospace",
      fontSize: "42px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      stroke: "#ff4f8b",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(80).setScale(0.2);
    const shockwave = this.add.circle(1330, 494, 20, 0xffd36a, 0.25).setStrokeStyle(6, 0xffffff, 0.85).setDepth(75);
    const burst = this.add.circle(1330, 494, 55, 0xff4f8b, 0.35).setDepth(74);
    this.tweens.add({ targets: boom, scale: 1.15, angle: 4, duration: 420, ease: "Back.out" });
    this.tweens.add({ targets: shockwave, scale: 8, alpha: 0, duration: 1050, ease: "Sine.out", onComplete: () => shockwave.destroy() });
    this.tweens.add({ targets: burst, scale: 3.8, alpha: 0, duration: 780, ease: "Sine.out", onComplete: () => burst.destroy() });
    this.tweens.add({ targets: this.gate, scale: 1.35, angle: 9, duration: 120, yoyo: true, repeat: 6 });
    this.time.delayedCall(1550, () => {
      boom.destroy();
      this.showMessage(icon("■", "Fin du jeu.", "End of the game."), 1100);
      this.time.delayedCall(1200, () => this.showCredits());
    });
  }

  private showCredits(): void {
    this.ending = true;
    this.inputController?.destroy();
    const save = loadSave();
    writeSave({ ...save, lastLevel: 5, unlockedLevel: Math.max(save.unlockedLevel, 5) });
    this.cameras.main.fadeOut(700, 10, 12, 24);
    this.time.delayedCall(750, () => {
      this.cameras.main.fadeIn(700, 10, 12, 24);
      this.children.removeAll();
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0);
      this.cameras.main.setBackgroundColor("#0b1024");
      this.add.rectangle(180, 320, 360, 640, 0x0b1024);
      for (let i = 0; i < 55; i += 1) {
        this.add.circle(Phaser.Math.Between(0, 360), Phaser.Math.Between(0, 640), Phaser.Math.FloatBetween(0.8, 2), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.75));
      }

      const credits = this.add.container(180, 720);
      const titleStyle = { fontFamily: "monospace", fontSize: "34px", color: "#ffd36a", fontStyle: "bold" };
      const smallStyle = { fontFamily: "monospace", fontSize: "14px", color: "#b8c5ff", align: "center", lineSpacing: 8 };
      credits.add([
        this.add.text(0, 0, "UPLESS", titleStyle).setOrigin(0.5),
        this.add.text(0, 48, t("GÉNÉRIQUE DE FIN", "END CREDITS"), { fontFamily: "monospace", fontSize: "16px", color: "#e8eeff", fontStyle: "bold", letterSpacing: 2 }).setOrigin(0.5),
        this.add.text(0, 115, t("AVEC", "WITH"), { fontFamily: "monospace", fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setOrigin(0.5),
        this.add.text(0, 154, t("LE HÉROS\nLA GIRAFE\nPINWINKIS\nLE SINGE CIVILISÉ\nMIMI LE CHAT\nL’ALIEN CALCULATEUR\nL’OGRE SONNÉ\nLA GRENOUILLE\nLE BATEAU LUNAIRE", "THE HERO\nTHE GIRAFFE\nPINWINKIS\nTHE CIVILIZED MONKEY\nMIMI THE CAT\nTHE CALCULATING ALIEN\nTHE DIZZY OGRE\nTHE FROG\nTHE MOON BOAT"), smallStyle).setOrigin(0.5, 0),
        this.add.text(0, 390, t("REMERCIEMENTS", "THANKS"), { fontFamily: "monospace", fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setOrigin(0.5),
        this.add.text(0, 430, t("aux algues coincées\naux développeurs fous\nau SAV planétaire\nà Origine, quelque part", "to the stuck seaweed\nto the mad developers\nto planetary support\nto Origine, somewhere"), smallStyle).setOrigin(0.5, 0),
        this.add.text(0, 590, "😄   🦒   🐧   🐒   🐱   👽   🐸", { fontSize: "25px" }).setOrigin(0.5),
        this.add.text(0, 675, t("TOUT LE MONDE RIGOLE", "EVERYONE LAUGHS"), { fontFamily: "monospace", fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5),
      ]);

      this.tweens.add({
        targets: credits,
        y: -790,
        duration: 15000,
        ease: "Linear",
        onComplete: () => this.showFinalPunchline(),
      });
    });
  }

  private showFinalPunchline(): void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#060812");
    this.add.circle(180, 175, 92, 0xffd36a, 0.08);
    this.add.text(180, 144, "✦", { fontSize: "72px", color: "#ffd36a" }).setOrigin(0.5);
    this.add.text(180, 292, t("Voilà, c’est comme ça\nque le Big Bang s’est fait.", "So that is how\nthe Big Bang happened."), {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 8,
    }).setOrigin(0.5);
    this.add.text(180, 390, t("La vraie fausse histoire\ndu monde humain. lol", "The true fake story\nof the human world. lol"), {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#b8c5ff",
      align: "center",
      lineSpacing: 7,
    }).setOrigin(0.5);
    this.add.text(180, 500, t("FIN", "THE END"), {
      fontFamily: "monospace",
      fontSize: "32px",
      color: "#ffd36a",
      fontStyle: "bold",
    }).setOrigin(0.5);
  }

  private showMessage(message: string, duration: number): void {
    this.messageTimer?.remove(false);
    this.messagePanel.setAlpha(1);
    this.messageText.setText(message).setAlpha(1);
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: [this.messageText, this.messagePanel], alpha: 0, duration: 220 });
    });
  }
}
