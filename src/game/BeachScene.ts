import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { TouchInput } from "./input";
import { createDetailedObject } from "./objectKit";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

type BeachItemId = "vr" | "underwear" | "dinoBook" | "antenna" | "tree" | "boat" | "propeller" | "giraffe";

type BeachItem = {
  id: BeachItemId;
  x: number;
  y: number;
  radius: number;
  used: boolean;
  interact: () => void;
};

export class BeachScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;
  private items: BeachItem[] = [];
  private hasVrHeadset = false;
  private pinwinkisFound = false;
  private pinwinkisPenguinMode = false;
  private boatInspected = false;
  private boatRepaired = false;
  private departing = false;
  private pinwinkis?: Phaser.GameObjects.Container;
  private algae!: Phaser.GameObjects.Container;
  private boat!: Phaser.GameObjects.Container;
  private giraffe!: Phaser.GameObjects.Container;

  constructor() {
    super("BeachScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 1520, 760);
    this.cameras.main.setBounds(0, 0, 1520, 760).setBackgroundColor("#8fe3ff");

    this.drawParadise();
    this.createPlatforms();
    this.createGiraffe();
    this.createBoat();
    this.createCoconutTree();
    this.createStrangeObjects();

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

    this.showMessage("Niveau 4 — La plage des objets suspects", 2400);
    this.time.delayedCall(2600, () => this.showMessage("La girafe t’attend devant la mer.", 1900));
  }

  update(): void {
    if (!this.departing) this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
  }

  private drawParadise(): void {
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0x91e7ff, 0x91e7ff, 0xffd79a, 0xff8d76, 1);
    sky.fillRect(0, 0, 360, 640);
    addWorldGrain(this, "sand", 0.1);
    this.add.circle(292, 116, 45, 0xfff1a3, 0.9).setScrollFactor(0);
    this.add.circle(292, 116, 72, 0xfff1a3, 0.16).setScrollFactor(0);

    for (let x = 0; x < 1520; x += 160) {
      this.add.ellipse(x + 70, 610, 270, 76, 0xf2c572, 0.96);
      this.add.ellipse(x + 20, 570, 260, 52, 0xffd98a, 0.75);
    }

    const sea = this.add.rectangle(760, 455, 1520, 142, 0x3ac6d7, 0.82);
    sea.setStrokeStyle(3, 0x1b92aa, 0.24);
    this.add.tileSprite(760, 455, 1520, 132, "upless-texture-water").setAlpha(0.12).setBlendMode(Phaser.BlendModes.ADD).setDepth(0.8);
    for (let x = 0; x < 1520; x += 85) {
      this.add.arc(x, 438, 35, 0, 180, false, 0xe7ffff, 0.22).setStrokeStyle(3, 0xe7ffff, 0.55);
      this.add.arc(x + 42, 491, 30, 0, 180, false, 0xe7ffff, 0.15).setStrokeStyle(2, 0xe7ffff, 0.42);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(addReliefBlock(this, 760, 580, 1520, 60, 0xd8994a, { texture: "sand", stroke: 0xffe3a8, strokeAlpha: 0.48, depth: 2 }));
  }

  private createGiraffe(): void {
    const body = this.add.ellipse(0, 8, 42, 62, 0xe8b85d).setStrokeStyle(4, 0x302844);
    const neck = this.add.rectangle(6, -45, 18, 82, 0xe8b85d).setStrokeStyle(3, 0x302844);
    const head = this.add.ellipse(18, -92, 43, 28, 0xe8b85d).setStrokeStyle(3, 0x302844);
    const eye = this.add.circle(25, -96, 3, 0x302844);
    const spot1 = this.add.circle(-8, 5, 6, 0x9a693e);
    const spot2 = this.add.circle(9, 25, 5, 0x9a693e);
    const leg1 = this.add.rectangle(-10, 48, 8, 48, 0xd9a24b).setStrokeStyle(2, 0x302844);
    const leg2 = this.add.rectangle(14, 48, 8, 48, 0xd9a24b).setStrokeStyle(2, 0x302844);
    this.giraffe = this.add.container(180, 500, [leg1, leg2, body, neck, head, eye, spot1, spot2]).setDepth(13);
    this.tweens.add({ targets: this.giraffe, y: 493, duration: 1200, yoyo: true, repeat: -1 });
    this.items.push({
      id: "giraffe",
      x: 180,
      y: 500,
      radius: 70,
      used: false,
      interact: () => this.showMessage("Girafe : Je ne sais pas nager.\nIl nous faut ce bateau.", 2300),
    });
  }

  private createBoat(): void {
    const shadow = this.add.ellipse(0, 78, 310, 35, 0x143142, 0.28);
    const hull = this.add.ellipse(0, 52, 292, 82, 0xffffff).setStrokeStyle(6, 0x1f2a44);
    const lower = this.add.rectangle(0, 70, 238, 35, 0x4a67d8).setStrokeStyle(4, 0x1f2a44);
    const cabin = this.add.rectangle(-18, 3, 116, 70, 0xfffbef).setStrokeStyle(5, 0x1f2a44);
    const window1 = this.add.ellipse(-45, -5, 26, 22, 0x8eeaff, 0.88).setStrokeStyle(3, 0x1f2a44);
    const window2 = this.add.ellipse(-3, -5, 26, 22, 0x8eeaff, 0.88).setStrokeStyle(3, 0x1f2a44);
    const mast = this.add.rectangle(70, -40, 8, 120, 0x1f2a44);
    const sail = this.add.triangle(98, -25, -34, 58, 32, 58, -34, -58, 0xffd36a).setStrokeStyle(4, 0x1f2a44);
    const propeller = this.add.circle(132, 75, 22, 0x8eeaff).setStrokeStyle(4, 0x1f2a44);
    this.algae = this.add.container(132, 75, [
      this.add.arc(0, 0, 29, 210, 20, false, 0x2d9b5f).setStrokeStyle(8, 0x2d9b5f),
      this.add.arc(5, 2, 22, 180, 50, false, 0x4abf68).setStrokeStyle(7, 0x4abf68),
      this.add.circle(-14, -5, 6, 0x3dbb60),
    ]);
    this.boat = this.add.container(1220, 486, [shadow, mast, sail, hull, lower, cabin, window1, window2, propeller, this.algae]).setDepth(12);
    this.items.push(
      {
        id: "boat",
        x: 1220,
        y: 505,
        radius: 140,
        used: false,
        interact: () => this.tryBoat(),
      },
      {
        id: "propeller",
        x: 1352,
        y: 562,
        radius: 62,
        used: false,
        interact: () => this.inspectPropeller(),
      },
    );
  }

  private createCoconutTree(): void {
    const trunk = this.add.rectangle(0, 35, 24, 142, 0xa46b3d).setStrokeStyle(4, 0x5c3527).setAngle(-8);
    const leaves = [
      this.add.ellipse(-42, -45, 100, 28, 0x2fa66a).setStrokeStyle(3, 0x1f6b4a).setAngle(-24),
      this.add.ellipse(44, -45, 104, 28, 0x2fa66a).setStrokeStyle(3, 0x1f6b4a).setAngle(24),
      this.add.ellipse(0, -64, 112, 30, 0x3cc17a).setStrokeStyle(3, 0x1f6b4a).setAngle(0),
      this.add.ellipse(-8, -39, 92, 24, 0x52c777).setStrokeStyle(3, 0x1f6b4a).setAngle(65),
    ];
    const coconuts = [this.add.circle(-14, -34, 8, 0x6a422c), this.add.circle(5, -36, 8, 0x6a422c), this.add.circle(20, -30, 7, 0x6a422c)];
    this.add.container(520, 455, [trunk, ...leaves, ...coconuts]).setDepth(9);
    this.items.push({
      id: "tree",
      x: 520,
      y: 416,
      radius: 90,
      used: false,
      interact: () => this.findPinwinkis(),
    });
  }

  private createStrangeObjects(): void {
    this.createVrHeadset(720, 545);
    this.createUnderwear(835, 548);
    this.createDinoBook(950, 543);
    this.createAntenna(1060, 527);
  }

  private createVrHeadset(x: number, y: number): void {
    createDetailedObject(this, "vrHeadset", x, y, { label: "casque VR" }).setDepth(12);
    this.items.push({
      id: "vr",
      x,
      y,
      radius: 45,
      used: false,
      interact: () => this.takeVrHeadset(),
    });
  }

  private createUnderwear(x: number, y: number): void {
    createDetailedObject(this, "pinkUnderwear", x, y, { label: "slip rose fraise" }).setDepth(12);
    this.items.push({
      id: "underwear",
      x,
      y,
      radius: 50,
      used: false,
      interact: () => this.showMessage("Un slip rose bonbon parfum fraise.\nLa mer refuse de commenter.", 2400),
    });
  }

  private createDinoBook(x: number, y: number): void {
    createDetailedObject(this, "dinoBook", x, y, { label: "livre dinosaures" }).setDepth(12);
    this.items.push({
      id: "dinoBook",
      x,
      y,
      radius: 50,
      used: false,
      interact: () => this.showMessage("Un livre ancien sur les dinosaures.\nPage 12 : « éviter les météorites ».", 2500),
    });
  }

  private createAntenna(x: number, y: number): void {
    createDetailedObject(this, "satelliteAntenna", x, y, { label: "antenne satellite", scale: 1.05 }).setDepth(12);
    this.items.push({
      id: "antenna",
      x,
      y,
      radius: 58,
      used: false,
      interact: () => this.showMessage("L’antenne retransmet :\n« krr… zzz… pwi… nk… »\nMessage inaudible.", 2800),
    });
  }

  private createHud(): void {
    this.add.rectangle(180, 27, 332, 42, 0x163647, 0.86).setScrollFactor(0).setDepth(100);
    this.add.text(27, 18, "NIV. 4", { fontFamily: "system-ui", fontSize: "13px", color: "#ffd36a", fontStyle: "bold" }).setScrollFactor(0).setDepth(101);
    this.objectiveText = this.add.text(328, 18, "⛵ BATEAU", {
      fontFamily: "system-ui",
      fontSize: "12px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.messagePanel = this.add.rectangle(180, 588, 326, 66, 0x163647, 0.94).setStrokeStyle(3, 0xffd36a, 0.35).setScrollFactor(0).setDepth(109).setAlpha(0);
    this.messageText = this.add.text(180, 590, "", {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#fffdf2",
      fontStyle: "bold",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 292 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.departing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (this.boatRepaired && world.x > 1150) {
      this.departAtSunset();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    if (this.departing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    const item = this.items.find((candidate) => Phaser.Math.Distance.Between(world.x, world.y, candidate.x, candidate.y) < candidate.radius);
    if (item) {
      item.interact();
      return;
    }
    this.showMessage("Rien d’étrange ici.\nEnfin… presque rien.", 1400);
  }

  private takeVrHeadset(): void {
    if (this.hasVrHeadset) {
      this.showMessage("Tu as déjà le casque VR.", 1200);
      return;
    }
    this.hasVrHeadset = true;
    audio.play("confirm");
    this.objectiveText.setText("🥽 PINWINKIS");
    this.showMessage("Tu ramasses un casque de réalité virtuelle.\nTrès utile, évidemment.", 2400);
  }

  private findPinwinkis(): void {
    if (!this.pinwinkisFound) {
      this.pinwinkisFound = true;
      this.pinwinkis = this.createPinwinkis(520, 350).setAlpha(0).setScale(0.35).setDepth(16);
      this.tweens.add({ targets: this.pinwinkis, alpha: 1, y: 402, scale: 1, duration: 720, ease: "Bounce.out" });
      audio.play("monkey");
      this.playPinwinkisIntroDialogue();
      this.objectiveText.setText("🥽 CASQUE VR");
      return;
    }
    if (!this.hasVrHeadset) {
      this.showMessage("Pinwinkis : non.\nJe répare seulement en immersion.", 2100);
      return;
    }
    if (!this.boatInspected) {
      this.showMessage("Pinwinkis renifle le casque.\n« Pourquoi faire ? Va voir le bateau d’abord. »", 2600);
      this.objectiveText.setText("⛵ BATEAU");
      return;
    }
    this.giveVrToPinwinkis();
  }

  private createPinwinkis(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 53, 58, 12, 0x10212a, 0.24);
    const tail = this.add.arc(-20, 18, 22, 34, 270, false, 0xf7f4ea).setStrokeStyle(5, 0xf7f4ea);
    const boot1 = this.add.rectangle(-11, 48, 12, 18, 0xe2762e).setStrokeStyle(3, 0x1f2a44).setAngle(3);
    const boot2 = this.add.rectangle(12, 48, 12, 18, 0xe2762e).setStrokeStyle(3, 0x1f2a44).setAngle(-3);
    const leg1 = this.add.rectangle(-11, 31, 12, 32, 0xf2efe4).setStrokeStyle(3, 0x1f2a44).setAngle(4);
    const leg2 = this.add.rectangle(12, 31, 12, 32, 0xf2efe4).setStrokeStyle(3, 0x1f2a44).setAngle(-4);
    const body = this.add.ellipse(0, 8, 42, 60, 0xf7f4ea).setStrokeStyle(4, 0x1f2a44);
    const suitCore = this.add.ellipse(0, 12, 27, 43, 0xffffff).setStrokeStyle(2, 0xd8d1c6);
    const orangeStrap1 = this.add.rectangle(-15, 9, 8, 52, 0xe2762e).setStrokeStyle(2, 0x1f2a44).setAngle(-12);
    const orangeStrap2 = this.add.rectangle(15, 9, 8, 52, 0xe2762e).setStrokeStyle(2, 0x1f2a44).setAngle(12);
    const belt = this.add.rectangle(0, 28, 40, 8, 0xe2762e).setStrokeStyle(2, 0x1f2a44);
    const arm1 = this.add.rectangle(-28, 10, 10, 42, 0xf7f4ea).setStrokeStyle(3, 0x1f2a44).setAngle(18);
    const arm2 = this.add.rectangle(29, 10, 10, 42, 0xf7f4ea).setStrokeStyle(3, 0x1f2a44).setAngle(-18);
    const glove1 = this.add.circle(-34, 29, 7, 0x1f2a44);
    const glove2 = this.add.circle(35, 29, 7, 0x1f2a44);
    const helmetRing = this.add.ellipse(0, -25, 58, 50, 0xe2762e).setStrokeStyle(4, 0x1f2a44);
    const head = this.add.circle(0, -28, 24, 0xf7f4ea).setStrokeStyle(4, 0x1f2a44);
    const face = this.add.ellipse(0, -25, 31, 23, 0xffdec0).setStrokeStyle(2, 0x1f2a44, 0.45);
    const ear1 = this.add.circle(-22, -29, 8, 0xf7f4ea).setStrokeStyle(2, 0x1f2a44);
    const ear2 = this.add.circle(22, -29, 8, 0xf7f4ea).setStrokeStyle(2, 0x1f2a44);
    const visor = this.add.arc(0, -35, 20, 190, 350, false, 0x8eeaff, 0.34).setStrokeStyle(3, 0x8eeaff, 0.75);
    const lens = this.add.rectangle(0, -26, 33, 11, 0x1f2a44).setStrokeStyle(2, 0xffffff, 0.55);
    const lensGlow = this.add.rectangle(-7, -29, 13, 3, 0xffffff, 0.45).setAngle(-8);
    const grin = this.add.arc(0, -17, 8, 12, 166, false, 0xffffff).setStrokeStyle(2, 0xffffff);
    const patch = this.add.circle(18, 10, 5, 0x8eeaff).setStrokeStyle(2, 0x1f2a44);
    const label = this.add.text(0, 65, "P", { fontSize: "10px", color: "#e2762e", fontStyle: "bold" }).setOrigin(0.5);
    return this.add.container(x, y, [
      shadow,
      tail,
      boot1,
      boot2,
      leg1,
      leg2,
      arm1,
      arm2,
      body,
      suitCore,
      orangeStrap1,
      orangeStrap2,
      belt,
      glove1,
      glove2,
      helmetRing,
      ear1,
      ear2,
      head,
      face,
      visor,
      lens,
      lensGlow,
      grin,
      patch,
      label,
    ]);
  }

  private playPinwinkisIntroDialogue(): void {
    const lines = [
      "Toi : D’où viens-tu, petit bonhomme ?",
      "Pinwinkis : Moi ? Je viens de très, très loin.",
      "Pinwinkis : Je cherche mon amie Origine.",
      "Pinwinkis : Elle fait du SAV planétaire. Tu l’as vue ?",
      "Pinwinkis : Wouww… bouge pas.",
      "Pinwinkis : Il y a une image de mon skin.",
      "Pinwinkis : Ils ont ajouté un doigt. MDR.",
      "Pinwinkis : Ils sont fous, ces développeurs.",
    ];
    lines.forEach((line, index) => {
      this.time.delayedCall(index * 2450, () => this.showMessage(line, 2250));
    });
  }

  private giveVrToPinwinkis(): void {
    if (!this.pinwinkis || this.boatRepaired) return;
    this.hasVrHeadset = false;
    audio.play("confirm");
    this.showMessage("Le casque charge Pinwinkis…\nMode pingouin en cours.", 2400);
    this.transformPinwinkisIntoPenguin();
    this.time.delayedCall(1150, () => this.repairBoat());
  }

  private transformPinwinkisIntoPenguin(): void {
    if (!this.pinwinkis || this.pinwinkisPenguinMode) return;
    this.pinwinkisPenguinMode = true;
    const x = this.pinwinkis.x;
    const y = this.pinwinkis.y;
    this.tweens.add({
      targets: this.pinwinkis,
      scale: 0.15,
      angle: 360,
      alpha: 0.25,
      duration: 430,
      ease: "Back.in",
      onComplete: () => {
        this.pinwinkis?.destroy();
        this.pinwinkis = this.createPinwinkisPenguin(x, y).setScale(0.2).setAlpha(0).setDepth(18);
        this.tweens.add({ targets: this.pinwinkis, scale: 1, alpha: 1, angle: 0, duration: 520, ease: "Back.out" });
        audio.play("confirm");
        this.showMessage("Pinwinkis est chargé en pingouin.\nRéparation nautique en réalité virtuelle.", 2600);
      },
    });
  }

  private createPinwinkisPenguin(x: number, y: number): Phaser.GameObjects.Container {
    const body = this.add.ellipse(0, 13, 44, 60, 0x23283b).setStrokeStyle(4, 0xffffff);
    const belly = this.add.ellipse(0, 19, 27, 42, 0xffffff);
    const head = this.add.circle(0, -23, 24, 0x23283b).setStrokeStyle(4, 0xffffff);
    const face = this.add.ellipse(0, -21, 29, 20, 0xffffff);
    const headset = this.add.rectangle(0, -25, 39, 16, 0x20263b).setStrokeStyle(3, 0x8eeaff);
    const lens1 = this.add.ellipse(-10, -25, 12, 9, 0x8eeaff, 0.9);
    const lens2 = this.add.ellipse(10, -25, 12, 9, 0x8eeaff, 0.9);
    const beak = this.add.triangle(0, -14, -8, -4, 8, -4, 0, 8, 0xffb44a).setStrokeStyle(2, 0x2d1c12);
    const foot1 = this.add.ellipse(-13, 46, 21, 9, 0xffb44a);
    const foot2 = this.add.ellipse(13, 46, 21, 9, 0xffb44a);
    const flipper1 = this.add.ellipse(-28, 12, 14, 42, 0x23283b).setStrokeStyle(3, 0xffffff).setAngle(20);
    const flipper2 = this.add.ellipse(28, 12, 14, 42, 0x23283b).setStrokeStyle(3, 0xffffff).setAngle(-20);
    return this.add.container(x, y, [foot1, foot2, flipper1, flipper2, body, belly, head, face, headset, lens1, lens2, beak]);
  }

  private repairBoat(): void {
    if (!this.pinwinkis) return;
    audio.play("bridge");
    this.tweens.add({
      targets: this.pinwinkis,
      x: 1340,
      y: 535,
      duration: 900,
      ease: "Sine.inOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.algae,
          alpha: 0,
          scale: 0.15,
          angle: 180,
          duration: 650,
          ease: "Back.in",
          onComplete: () => {
            this.boatRepaired = true;
            this.objectiveText.setText("🌅 DÉPART");
            this.showMessage("L’hélice est libérée !\nTouche le bateau pour partir au large.", 2600);
          },
        });
      },
    });
  }

  private tryBoat(): void {
    if (!this.boatRepaired) {
      this.boatInspected = true;
      this.objectiveText.setText("🌴 PINWINKIS");
      this.showMessage("Le bateau ne marche pas.\nDes algues bloquent l’hélice.", 2200);
      return;
    }
    this.departAtSunset();
  }

  private inspectPropeller(): void {
    this.boatInspected = true;
    this.objectiveText.setText("🌴 PINWINKIS");
    this.showMessage("Des algues sont coincées sur l’hélice.\nIl faut quelqu’un de très petit.", 2300);
  }

  private departAtSunset(): void {
    if (this.departing || !this.boatRepaired) return;
    this.departing = true;
    this.player.stop();
    this.player.sprite.body!.enable = false;
    audio.play("portal");
    this.showMessage("Au coucher du soleil,\nils partent tous au large.", 2600);
    this.cameras.main.fade(2600, 255, 156, 105);
    this.tweens.add({ targets: this.boat, x: 1620, y: 455, duration: 2600, ease: "Sine.inOut" });
    if (this.pinwinkis) this.tweens.add({ targets: this.pinwinkis, x: 1240, y: 430, duration: 900, ease: "Sine.out" });
    this.tweens.add({ targets: this.giraffe, x: 1180, y: 452, scale: 0.7, duration: 1200, ease: "Sine.inOut" });
    this.tweens.add({ targets: this.player.sprite, x: 1140, y: 500, alpha: 0.25, duration: 1100, ease: "Sine.inOut" });
    this.time.delayedCall(2700, () => {
      const save = loadSave();
      writeSave({ ...save, lastLevel: 4, unlockedLevel: Math.max(save.unlockedLevel, 5) });
      this.scene.start("MoonScene");
    });
  }

  private canMoveTo(fromX: number, targetX: number): boolean {
    if (!this.boatRepaired && fromX < 1120 && targetX > 1140) {
      this.boatInspected = true;
      this.objectiveText.setText("🌴 PINWINKIS");
      this.showMessage("Le bateau est bloqué.\nIl faut d’abord libérer l’hélice.", 1600);
      return false;
    }
    return true;
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
