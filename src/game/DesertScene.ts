import Phaser from "phaser";
import { audio } from "./audio";
import { TouchInput } from "./input";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

type DesertItemId = "rocket" | "plastic" | "battery" | "virus" | "redWater" | "oil";

type DesertItem = {
  id: DesertItemId;
  label: string;
  x: number;
  y: number;
  phrase: string;
  solution?: boolean;
  found: boolean;
  container: Phaser.GameObjects.Container;
};

export class DesertScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private items: DesertItem[] = [];
  private robot!: Phaser.GameObjects.Container;
  private robotEyes!: Phaser.GameObjects.Arc[];
  private robotNoCount = 0;
  private hasOil = false;
  private robotLubricated = false;
  private bunkerOpen = false;
  private bunkerDoor!: Phaser.GameObjects.Rectangle;
  private giraffe?: Phaser.GameObjects.Container;
  private finishing = false;
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("DesertScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 1600, 760);
    this.cameras.main.setBounds(0, 0, 1600, 760).setBackgroundColor("#f2b96d");

    this.drawWorld();
    this.createPlatforms();
    this.createBunker();
    this.createRobot();
    this.createMonkey();
    this.createItems();

    this.player = new PlayerController(this, 70, 520);
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

    this.showIntro();
  }

  update(): void {
    if (!this.finishing) this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
  }

  private drawWorld(): void {
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0xffd39a, 0xffd39a, 0xe87955, 0x8c435f, 1);
    sky.fillRect(0, 0, 360, 640);
    this.add.circle(294, 95, 45, 0xfff2b8, 0.9).setScrollFactor(0);
    this.add.circle(294, 95, 68, 0xfff2b8, 0.16).setScrollFactor(0);

    const dust = this.add.graphics().setScrollFactor(0);
    dust.fillStyle(0xffffff, 0.16);
    for (let i = 0; i < 55; i += 1) {
      dust.fillCircle(Phaser.Math.Between(0, 360), Phaser.Math.Between(70, 590), Phaser.Math.FloatBetween(0.7, 1.8));
    }

    for (let x = 0; x < 1600; x += 180) {
      this.add.ellipse(x + 80, 584, 260, 66, x % 360 === 0 ? 0xd9924f : 0xc97845, 0.8);
      this.add.ellipse(x + 35, 615, 310, 60, 0xb7643f, 0.34);
    }

    this.add.rectangle(250, 568, 260, 34, 0xc47448, 0.45).setAngle(-3);
    this.add.rectangle(348, 486, 40, 185, 0x8db7b2).setStrokeStyle(5, 0x2f3c4c);
    this.add.rectangle(316, 410, 92, 48, 0x8db7b2).setStrokeStyle(5, 0x2f3c4c).setAngle(-8);
    this.add.rectangle(258, 454, 92, 18, 0x7da8a4).setStrokeStyle(4, 0x2f3c4c).setAngle(18);
    this.add.rectangle(222, 431, 18, 82, 0x7da8a4).setStrokeStyle(4, 0x2f3c4c).setAngle(18);
    this.add.rectangle(205, 384, 37, 34, 0x7da8a4).setStrokeStyle(4, 0x2f3c4c).setAngle(18);
    this.add.triangle(205, 351, -16, 20, 16, 20, 0, -23, 0xcc6b49).setStrokeStyle(3, 0x2f3c4c).setAngle(18);
    this.add.circle(286, 389, 24, 0x8db7b2).setStrokeStyle(5, 0x2f3c4c);
    this.add.triangle(286, 345, -24, 34, 24, 34, 0, -36, 0x8db7b2).setStrokeStyle(4, 0x2f3c4c);
    [-20, -10, 0, 10, 20].forEach((offset, index) => {
      this.add.triangle(286 + offset, 356 + Math.abs(offset) * 0.25, -5, 17, 5, 17, 0, -13 - index, 0x8db7b2)
        .setStrokeStyle(2, 0x2f3c4c)
        .setAngle(offset * 0.7);
    });
    this.add.rectangle(286, 422, 16, 44, 0x2f3c4c, 0.35).setAngle(-8);
    this.add.line(0, 0, 336, 415, 315, 452, 0x2f3c4c, 0.9).setLineWidth(3);
    this.add.line(0, 0, 351, 500, 333, 535, 0x2f3c4c, 0.75).setLineWidth(3);
    this.add.circle(376, 567, 19, 0x8db7b2).setStrokeStyle(4, 0x2f3c4c);
    this.add.rectangle(410, 558, 78, 18, 0x8db7b2).setStrokeStyle(4, 0x2f3c4c).setAngle(9);
    this.add.text(196, 356, "STATUE\nBRISÉE", {
      fontFamily: "system-ui",
      fontSize: "10px",
      color: "#5e3b43",
      fontStyle: "bold",
      align: "center",
    }).setAngle(-9);

    for (let x = 560; x < 1070; x += 130) {
      this.add.rectangle(x, 548, 70, 6, 0x6f493e, 0.4).setAngle(Phaser.Math.Between(-8, 8));
    }

    this.drawToxicPond();
    this.drawSickFrog();
  }

  private drawToxicPond(): void {
    this.add.ellipse(1065, 552, 185, 44, 0x5e1726, 0.42);
    this.add.ellipse(1065, 541, 165, 38, 0xb82539, 0.9).setStrokeStyle(4, 0x5b1523, 0.8);
    this.add.ellipse(1022, 535, 53, 14, 0xf2eef0, 0.78).setStrokeStyle(2, 0x5b7890, 0.85).setAngle(-9);
    this.add.rectangle(1023, 528, 29, 8, 0xdaf6ff, 0.9).setStrokeStyle(2, 0x5b7890).setAngle(-9);
    this.add.ellipse(1108, 545, 36, 9, 0xff6a76, 0.4);
    this.add.circle(1000, 545, 4, 0xff8390, 0.75);
    this.add.circle(1127, 536, 3, 0xff9ca5, 0.6);
  }

  private drawSickFrog(): void {
    const frog = this.add.container(1182, 530).setDepth(10);
    const shadow = this.add.ellipse(0, 32, 66, 13, 0x25172a, 0.3);
    const body = this.add.ellipse(0, 12, 56, 38, 0x75b553).setStrokeStyle(4, 0x263b2b);
    const head = this.add.ellipse(0, -12, 64, 42, 0x86c761).setStrokeStyle(4, 0x263b2b);
    const eye1 = this.add.circle(-19, -31, 11, 0xe8ffe0).setStrokeStyle(3, 0x263b2b);
    const eye2 = this.add.circle(19, -31, 11, 0xe8ffe0).setStrokeStyle(3, 0x263b2b);
    const pupil1 = this.add.circle(-19, -29, 3, 0x263b2b);
    const pupil2 = this.add.circle(19, -29, 3, 0x263b2b);
    const mouth = this.add.arc(0, -7, 17, 18, 162, false, 0x263b2b).setStrokeStyle(3, 0x263b2b);
    const sweat1 = this.add.ellipse(-30, -5, 7, 13, 0x8cf06a, 0.92).setAngle(-20);
    const sweat2 = this.add.ellipse(30, 1, 6, 12, 0x8cf06a, 0.82).setAngle(20);
    const sweat3 = this.add.ellipse(8, -42, 5, 10, 0x8cf06a, 0.86);
    const sign = this.add.text(0, 52, "grenouille contaminée", {
      fontFamily: "system-ui",
      fontSize: "8px",
      color: "#5e3b43",
      fontStyle: "bold",
    }).setOrigin(0.5);
    frog.add([shadow, body, head, eye1, eye2, pupil1, pupil2, mouth, sweat1, sweat2, sweat3, sign]);
    this.tweens.add({ targets: [sweat1, sweat2, sweat3], alpha: 0.35, y: "+=7", duration: 650, yoyo: true, repeat: -1 });
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(800, 580, 1600, 58, 0xa95d39).setStrokeStyle(3, 0xffd08b, 0.34);
    this.platforms.add(ground);
  }

  private createBunker(): void {
    this.add.ellipse(1330, 575, 330, 42, 0x2b2132, 0.33);
    this.add.rectangle(1330, 482, 250, 184, 0x394050).setStrokeStyle(6, 0x181b25);
    this.add.rectangle(1330, 398, 220, 38, 0x515a70).setStrokeStyle(4, 0x181b25);
    this.add.circle(1230, 398, 13, 0xd95959, 0.8);
    this.add.circle(1430, 398, 13, 0xd95959, 0.8);
    this.bunkerDoor = this.add.rectangle(1330, 512, 112, 124, 0x151a24).setStrokeStyle(5, 0x6f778d);
    this.add.rectangle(1330, 512, 78, 98, 0x252d3a, 0.9);
    this.add.text(1330, 342, "BUNKER 08", {
      fontFamily: "system-ui",
      fontSize: "19px",
      color: "#fff2c2",
      fontStyle: "bold",
      stroke: "#1d1b27",
      strokeThickness: 5,
    }).setOrigin(0.5);
  }

  private createRobot(): void {
    const shadow = this.add.ellipse(0, 42, 78, 16, 0x1b1725, 0.35);
    const body = this.add.rectangle(0, 0, 58, 78, 0x8b7b69).setStrokeStyle(5, 0x312831);
    const rust1 = this.add.circle(-18, -15, 7, 0xc25f32, 0.85);
    const rust2 = this.add.circle(16, 17, 9, 0x9e4b31, 0.75);
    const head = this.add.rectangle(0, -58, 66, 44, 0x9a8c77).setStrokeStyle(5, 0x312831);
    const antenna = this.add.line(0, -91, 0, 0, 0, -24, 0x312831).setLineWidth(4);
    const antennaTip = this.add.circle(0, -116, 6, 0xd95959);
    const eye1 = this.add.circle(-16, -59, 6, 0x4b1010);
    const eye2 = this.add.circle(16, -59, 6, 0x4b1010);
    const mouth = this.add.rectangle(0, -42, 32, 5, 0x312831);
    const arm1 = this.add.rectangle(-43, -8, 16, 70, 0x776a5c).setStrokeStyle(3, 0x312831).setAngle(9);
    const arm2 = this.add.rectangle(43, -8, 16, 70, 0x776a5c).setStrokeStyle(3, 0x312831).setAngle(-9);
    const leg1 = this.add.rectangle(-17, 50, 17, 32, 0x716457).setStrokeStyle(3, 0x312831);
    const leg2 = this.add.rectangle(17, 50, 17, 32, 0x716457).setStrokeStyle(3, 0x312831);
    this.robotEyes = [eye1, eye2];
    this.robot = this.add.container(1195, 493, [
      shadow,
      arm1,
      arm2,
      body,
      rust1,
      rust2,
      head,
      antenna,
      antennaTip,
      eye1,
      eye2,
      mouth,
      leg1,
      leg2,
    ]).setDepth(12);
    this.tweens.add({ targets: this.robot, angle: 1.4, duration: 410, yoyo: true, repeat: -1 });
  }

  private createMonkey(): void {
    const tail = this.add.arc(0, 5, 23, 40, 300, false, 0x6b3c2f).setStrokeStyle(5, 0x6b3c2f);
    const body = this.add.ellipse(0, 12, 35, 43, 0x8f543d).setStrokeStyle(3, 0x302844);
    const head = this.add.circle(0, -20, 22, 0x9f6245).setStrokeStyle(3, 0x302844);
    const face = this.add.ellipse(0, -16, 25, 20, 0xf0b176);
    const eye1 = this.add.circle(-7, -21, 3, 0x302844);
    const eye2 = this.add.circle(7, -21, 3, 0x302844);
    const grin = this.add.arc(0, -13, 9, 10, 170, false, 0x302844).setStrokeStyle(2, 0x302844);
    const monkey = this.add.container(420, 500, [tail, body, head, face, eye1, eye2, grin]).setDepth(14);
    this.tweens.add({ targets: monkey, y: 492, duration: 520, yoyo: true, repeat: -1 });
  }

  private createItems(): void {
    this.items = [
      this.addItem("rocket", "Bout de fusée", 540, 545, "Ils ont voulu fuir vers le ciel…"),
      this.addItem("plastic", "Déchet plastique", 1024, 532, "Même après la fin, ça flotte encore là…"),
      this.addItem("battery", "Batterie smartphone", 850, 532, "Ils tenaient le monde dans leurs mains… puis ils l’ont laissé tomber."),
      this.addItem("virus", "Virus alien", 1188, 505, "Cette grenouille transpire quelque chose de vivant…"),
      this.addItem("redWater", "Mare rouge", 1070, 540, "L’eau elle-même a changé de couleur."),
      this.addItem("oil", "Huile rare", 625, 536, "De l’huile rare… précieuse pour les vieilles machines.", true),
    ];
  }

  private addItem(
    id: DesertItemId,
    label: string,
    x: number,
    y: number,
    phrase: string,
    solution = false,
  ): DesertItem {
    const sticker =
      id === "redWater"
        ? this.add.ellipse(0, 7, 58, 24, 0xffffff, 0.16).setStrokeStyle(2, 0xffffff, 0.25)
        : this.add.circle(0, 0, solution ? 20 : 18, 0xffffff).setStrokeStyle(3, 0x302844);
    const parts: Phaser.GameObjects.GameObject[] = [sticker];

    if (id === "rocket") {
      parts.push(this.add.triangle(0, -3, -14, 14, 14, 14, 0, -16, 0xd55f58).setStrokeStyle(2, 0x302844));
      parts.push(this.add.rectangle(0, 7, 16, 18, 0xd8e0ef).setStrokeStyle(2, 0x302844));
    } else if (id === "plastic") {
      parts.push(this.add.ellipse(0, 3, 34, 12, 0xdaf6ff, 0.9).setStrokeStyle(2, 0x5b7890));
      parts.push(this.add.rectangle(0, -5, 20, 7, 0xdaf6ff, 0.86).setStrokeStyle(2, 0x5b7890).setAngle(-6));
    } else if (id === "battery") {
      parts.push(this.add.rectangle(0, 0, 26, 15, 0x3f4656).setStrokeStyle(2, 0x151923));
      parts.push(this.add.rectangle(17, 0, 5, 8, 0x151923));
      parts.push(this.add.text(0, 0, "⚡", { fontSize: "12px", color: "#f6d66c" }).setOrigin(0.5));
    } else if (id === "virus") {
      parts.push(this.add.circle(0, 0, 11, 0x8cf06a).setStrokeStyle(2, 0x244328));
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8;
        parts.push(this.add.circle(Math.cos(angle) * 13, Math.sin(angle) * 13, 2.5, 0x8cf06a));
      }
    } else if (id === "redWater") {
      parts.push(this.add.ellipse(0, 6, 72, 18, 0xb82539, 0.55).setStrokeStyle(2, 0x5b1523));
      parts.push(this.add.circle(-18, 1, 5, 0xf05a68, 0.75));
      parts.push(this.add.circle(21, 4, 4, 0xff8791, 0.65));
    } else {
      parts.push(this.add.rectangle(0, 0, 28, 24, 0xc8b080).setStrokeStyle(3, 0x302844));
      parts.push(this.add.rectangle(0, -3, 31, 7, 0x807766).setStrokeStyle(2, 0x302844));
      parts.push(this.add.text(0, 4, "OIL", { fontSize: "8px", color: "#302844", fontStyle: "bold" }).setOrigin(0.5));
    }

    const container = this.add.container(x, y, parts).setDepth(11);
    if (id === "plastic") {
      this.tweens.add({ targets: container, y: y + 3, angle: 4, duration: 900, yoyo: true, repeat: -1 });
    } else if (id === "virus") {
      this.tweens.add({ targets: container, scale: 1.12, duration: 620, yoyo: true, repeat: -1 });
    } else {
      this.tweens.add({ targets: container, scale: 1.05, duration: 900 + (x % 4) * 80, yoyo: true, repeat: -1 });
    }
    return { id, label, x, y, phrase, solution, found: false, container };
  }

  private createHud(): void {
    this.add.rectangle(180, 27, 332, 42, 0x20182b, 0.86).setScrollFactor(0).setDepth(100);
    this.add.text(27, 18, "NIV. 3", {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#ffd36a",
      fontStyle: "bold",
    }).setScrollFactor(0).setDepth(101);
    this.objectiveText = this.add.text(328, 18, "🔎 ENQUÊTE", {
      fontFamily: "system-ui",
      fontSize: "12px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    const sound = this.add
      .text(270, 17, audio.isEnabled() ? "♪" : "×", { fontSize: "16px", color: "#ffd36a" })
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive();
    sound.on("pointerdown", () => sound.setText(audio.toggle() ? "♪" : "×"));

    this.messagePanel = this.add
      .rectangle(180, 588, 326, 66, 0x20182b, 0.94)
      .setStrokeStyle(3, 0xffd36a, 0.35)
      .setScrollFactor(0)
      .setDepth(109)
      .setAlpha(0);
    this.messageText = this.add
      .text(180, 590, "", {
        fontFamily: "system-ui",
        fontSize: "13px",
        color: "#fff7db",
        fontStyle: "bold",
        align: "center",
        lineSpacing: 4,
        wordWrap: { width: 292 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110)
      .setAlpha(0);
  }

  private showIntro(): void {
    this.showMessage("Niveau 3 — Le désert des derniers signes", 2400);
    this.time.delayedCall(2700, () => this.showMessage("Non !! Ils l’ont fait…", 2100));
    this.time.delayedCall(5100, () => {
      audio.play("monkey");
      this.showMessage("Singe : Hihihi…", 1700);
    });
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.finishing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (this.bunkerOpen && world.x > 1270) {
      this.enterBunker();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    if (this.finishing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);

    const item = this.items.find((candidate) => Phaser.Math.Distance.Between(world.x, world.y, candidate.x, candidate.y) < 58);
    if (item) {
      this.interactWithItem(item);
      return;
    }

    if (Phaser.Math.Distance.Between(world.x, world.y, this.robot.x, this.robot.y - 38) < 92) {
      this.interactWithRobot();
      return;
    }

    if (world.x > 1240 && world.x < 1455 && world.y > 355 && world.y < 590) {
      if (this.bunkerOpen) this.showMessage("Le bunker s’est ouvert…", 1500);
      else if (this.robotLubricated) this.showMessage("La porte glisse lentement.", 1400);
      else this.showMessage("Cette porte est trop lourde…\nLe robot garde l’entrée.", 1900);
      return;
    }

    if (world.x > 210 && world.x < 390 && world.y > 320 && world.y < 570) {
      this.showMessage("Quelque chose s’est passé ici…", 1700);
      return;
    }

    this.showMessage("Le sable ne répond pas.\nIl cache peut-être autre chose.", 1300);
  }

  private interactWithItem(item: DesertItem): void {
    if (item.solution) {
      if (this.hasOil) {
        this.showMessage("Tu as déjà l’huile rare.", 1100);
        return;
      }
      this.hasOil = true;
      item.found = true;
      audio.play("flower");
      this.tweens.add({
        targets: item.container,
        scale: 1.45,
        alpha: 0,
        y: item.container.y - 42,
        duration: 420,
        ease: "Back.in",
        onComplete: () => item.container.setVisible(false),
      });
      this.objectiveText.setText("🛢 HUILE");
      this.showMessage("Cette huile pourrait aider une vieille machine…", 2300);
      this.time.delayedCall(2350, () => this.showMessage("Singe : Hihihi… ça grince moins avec ça.", 2100));
      return;
    }

    item.found = true;
    audio.play("confirm");
    this.tweens.add({ targets: item.container, scale: 1.18, duration: 130, yoyo: true });
    this.showMessage(item.phrase, 2300);
    this.updateObjective();

    const foundClues = this.items.filter((candidate) => candidate.found && !candidate.solution).length;
    if (foundClues >= 4 && !this.hasOil) {
      this.time.delayedCall(2300, () =>
        this.showMessage("Singe : Hihihi… il te manque ce qui fait taire les grincements.", 2600),
      );
    }
  }

  private interactWithRobot(): void {
    if (this.robotLubricated) {
      this.showMessage("Robot : Passage autorisé.", 1500);
      return;
    }
    if (this.hasOil) {
      this.lubricateRobot();
      return;
    }

    this.robotNoCount += 1;
    audio.play("wire");
    this.tweens.add({
      targets: this.robot,
      x: this.robot.x + (this.robotNoCount % 2 ? 7 : -7),
      duration: 65,
      yoyo: true,
      repeat: 4,
    });
    this.cameras.main.shake(140, 0.003);

    if (this.robotNoCount === 1) this.showMessage("Robot : Non.", 1300);
    else if (this.robotNoCount === 2) this.showMessage("Robot : Non.\nHéros : Il bloque la porte…", 1900);
    else if (this.robotNoCount === 3) this.showMessage("Robot : Non.\nHéros : Il est complètement rouillé.", 2100);
    else this.showMessage("Robot : Non.\nIl grince à chaque mouvement.", 1900);

    if (this.robotNoCount === 1) {
      this.time.delayedCall(1450, () => this.showMessage("Singe : Hihihi… il aime pas parler.", 1900));
    }
  }

  private lubricateRobot(): void {
    this.robotLubricated = true;
    this.player.stop();
    audio.play("bridge");
    const oilDrop = this.add.circle(this.player.sprite.x + 12, this.player.sprite.y - 26, 5, 0x3f2a1b).setDepth(40);
    this.tweens.add({
      targets: oilDrop,
      x: this.robot.x - 6,
      y: this.robot.y - 42,
      scale: 1.7,
      duration: 520,
      ease: "Sine.in",
      onComplete: () => oilDrop.destroy(),
    });
    this.tweens.add({
      targets: this.robotEyes,
      fillColor: 0x68f5ff,
      duration: 320,
      delay: 430,
    });
    this.tweens.add({
      targets: this.robot,
      angle: 0,
      y: this.robot.y - 8,
      duration: 620,
      delay: 520,
      ease: "Back.out",
      onComplete: () => {
        this.showMessage("Robot : …Oui.\nPassage autorisé.", 2100);
        this.time.delayedCall(900, () => this.openBunker());
      },
    });
  }

  private openBunker(): void {
    if (this.bunkerOpen) return;
    this.bunkerOpen = true;
    audio.play("portal");
    this.objectiveText.setText("🚪 BUNKER");
    this.tweens.add({
      targets: this.bunkerDoor,
      x: this.bunkerDoor.x + 72,
      alpha: 0.55,
      duration: 1100,
      ease: "Sine.inOut",
    });
    this.cameras.main.shake(350, 0.005);
    this.showMessage("Le bunker s’ouvre…", 1800);
    this.time.delayedCall(1200, () => this.createGiraffe());
  }

  private createGiraffe(): void {
    if (this.giraffe) return;
    const legs = [
      this.add.rectangle(-10, 38, 8, 52, 0xd9a24b).setStrokeStyle(2, 0x302844),
      this.add.rectangle(13, 38, 8, 52, 0xd9a24b).setStrokeStyle(2, 0x302844),
    ];
    const body = this.add.ellipse(0, 5, 44, 62, 0xe8b85d).setStrokeStyle(4, 0x302844);
    const neck = this.add.rectangle(5, -48, 18, 82, 0xe8b85d).setStrokeStyle(3, 0x302844);
    const head = this.add.ellipse(15, -94, 43, 28, 0xe8b85d).setStrokeStyle(3, 0x302844);
    const horn1 = this.add.rectangle(4, -113, 5, 18, 0x8c5838).setStrokeStyle(2, 0x302844);
    const horn2 = this.add.rectangle(23, -113, 5, 18, 0x8c5838).setStrokeStyle(2, 0x302844);
    const eye = this.add.circle(23, -97, 3, 0x302844);
    const spots = [
      this.add.circle(-9, -3, 6, 0x9a693e),
      this.add.circle(9, 18, 5, 0x9a693e),
      this.add.circle(4, -51, 4, 0x9a693e),
      this.add.circle(11, -72, 4, 0x9a693e),
    ];
    this.giraffe = this.add.container(1360, 522, [...legs, body, neck, head, horn1, horn2, eye, ...spots])
      .setDepth(18)
      .setAlpha(0)
      .setScale(0.85);
    this.tweens.add({ targets: this.giraffe, alpha: 1, x: 1308, duration: 850, ease: "Sine.out" });
    this.time.delayedCall(900, () => this.showMessage("Girafe : Entre. Il reste encore des réponses.", 2600));
  }

  private enterBunker(): void {
    if (!this.bunkerOpen || this.finishing) return;
    this.finishing = true;
    this.player.stop();
    this.player.sprite.body!.enable = false;
    this.tweens.add({
      targets: this.player.sprite,
      x: 1330,
      y: 515,
      alpha: 0,
      duration: 1000,
      ease: "Sine.inOut",
      onComplete: () => {
        const save = loadSave();
        writeSave({ ...save, lastLevel: 3, unlockedLevel: Math.max(save.unlockedLevel, 4) });
        audio.play("portal");
        this.cameras.main.flash(600, 255, 232, 166);
        this.time.delayedCall(500, () => this.scene.start("LevelCompleteScene", { completedLevel: 3 }));
      },
    });
  }

  private canMoveTo(fromX: number, targetX: number): boolean {
    if (!this.bunkerOpen && fromX < 1160 && targetX > 1185) {
      this.showMessage("Le robot garde l’entrée.", 1400);
      return false;
    }
    return true;
  }

  private updateObjective(): void {
    if (this.hasOil) {
      this.objectiveText.setText("🛢 HUILE");
      return;
    }
    const foundClues = this.items.filter((candidate) => candidate.found && !candidate.solution).length;
    this.objectiveText.setText(`🔎 ${foundClues}/5`);
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
