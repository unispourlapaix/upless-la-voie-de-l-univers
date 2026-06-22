import Phaser from "phaser";
import { audio } from "./audio";
import { TouchInput } from "./input";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

export class OfficeScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messageText!: Phaser.GameObjects.Text;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private wireDisconnected = false;
  private panelOpen = false;
  private catHintReceived = false;
  private hasFunnyDisc = false;
  private catShown = false;
  private onUpperPlatform = false;
  private flowers = 0;
  private ropeReady = false;
  private climbing = false;
  private executives: Phaser.GameObjects.Container[] = [];
  private director!: Phaser.GameObjects.Container;
  private directorBubble!: Phaser.GameObjects.Container;
  private rocketScreen!: Phaser.GameObjects.Container;
  private panelWire!: Phaser.GameObjects.Arc;
  private panelDoor!: Phaser.GameObjects.Container;
  private treeSwitch!: Phaser.GameObjects.Container;
  private projectorImage!: Phaser.GameObjects.Container;
  private officeCat!: Phaser.GameObjects.Container;
  private monkey?: Phaser.GameObjects.Container;
  private rope?: Phaser.GameObjects.Container;
  private messageTimer?: Phaser.Time.TimerEvent;
  private dialogueTimer?: Phaser.Time.TimerEvent;
  private dialogueOpen = false;

  constructor() {
    super("OfficeScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 1540, 760);
    this.cameras.main.setBounds(0, 0, 1540, 760).setBackgroundColor("#17213b");
    this.drawOffice();
    this.createPlatforms();
    this.createExecutives();
    this.createDirector();
    this.createControlPanel();
    this.createProjector();
    this.createUpperGarden();

    this.player = new PlayerController(this, 55, 520);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -65, 50);
    this.cameras.main.setDeadzone(90, 180);

    this.createHud();
    this.createDialogueBox();
    this.inputController = new TouchInput(this, {
      onTap: (x, y) => this.handleTap(x, y),
      onDoubleTap: (x, y) => this.handleDoubleTap(x, y),
      isUiHit: (_x, y) => y < 60,
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.inputController?.destroy());
    this.showMessage("Niveau 2 — Le bureau de la fusée", 2400);
  }

  update(): void {
    if (!this.climbing) this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
    this.collectFlowers();
  }

  private drawOffice(): void {
    const background = this.add.graphics().setScrollFactor(0);
    background.fillGradientStyle(0xf7f2e8, 0xf7f2e8, 0xdad7ef, 0xdad7ef, 1);
    background.fillRect(0, 0, 360, 640);
    const halftone = this.add.graphics().setScrollFactor(0);
    halftone.fillStyle(0x493d69, 0.11);
    for (let y = 95; y < 590; y += 14) {
      for (let x = (y / 14) % 2 ? 6 : 13; x < 360; x += 14) halftone.fillCircle(x, y, 1.5);
    }

    for (let x = 60; x < 1540; x += 210) {
      this.add.rectangle(x + 8, 176, 158, 190, 0x392f54, 0.17);
      this.add.rectangle(x, 168, 158, 190, 0xffffff).setStrokeStyle(6, 0x302844, 0.9);
      this.add.rectangle(x, 168, 142, 174, 0x90c9df);
      this.add.circle(x - 42, 132, 20, 0xeabf7b, 0.25);
      this.add.rectangle(x - 36, 196, 3, 166, 0x8ba5ca, 0.28);
      this.add.rectangle(x + 36, 196, 3, 166, 0x8ba5ca, 0.28);
      this.add.rectangle(x, 163, 140, 3, 0x8ba5ca, 0.2);
    }

    this.add.rectangle(186, 76, 306, 54, 0xffffff, 0.94).setStrokeStyle(3, 0x302844, 1);
    this.add.circle(51, 76, 18, 0xff4f8b, 0.9).setStrokeStyle(3, 0x302844);
    this.add.text(51, 76, "U", {
      fontFamily: "system-ui",
      fontStyle: "bold",
      fontSize: "17px",
      color: "#ffffff",
    }).setOrigin(0.5);
    this.add.text(78, 63, "UPLESS AEROSPACE", {
      fontFamily: "system-ui",
      fontStyle: "bold",
      fontSize: "15px",
      color: "#302844",
      letterSpacing: 1,
    });
    this.add.text(78, 84, "CONSEIL DU PROGRAMME ORBITE", {
      fontFamily: "system-ui",
      fontSize: "8px",
      color: "#665b7d",
      letterSpacing: 1,
    });

    for (let x = 0; x < 1540; x += 95) {
      this.add.rectangle(x, 551, 93, 4, x % 190 === 0 ? 0x7a8caf : 0x5e7197, 0.28);
    }

    this.add.ellipse(500, 480, 374, 104, 0x302844, 0.18);
    this.add.rectangle(500, 462, 366, 82, 0x73503e).setStrokeStyle(5, 0x302844, 1);
    this.add.ellipse(500, 433, 366, 88, 0xe39a5c).setStrokeStyle(5, 0x302844, 1);
    this.add.ellipse(500, 426, 340, 66, 0xffbd75, 0.9);
    this.add.rectangle(500, 480, 250, 16, 0x332b2d, 0.5);
    this.add.text(500, 426, "PROJET ORBITE", {
      fontSize: "13px",
      color: "#302844",
      fontStyle: "bold",
      letterSpacing: 2,
    }).setOrigin(0.5);

    for (let x = 115; x < 1450; x += 320) {
      this.add.ellipse(x, 550, 100, 14, 0x0b1325, 0.28);
      this.add.rectangle(x, 515, 45, 70, 0x314765).setStrokeStyle(2, 0x637da2, 0.4);
      this.add.circle(x - 14, 475, 23, 0x4d8c76);
      this.add.circle(x + 10, 468, 27, 0x67a87f);
      this.add.circle(x + 24, 486, 19, 0x3f7b68);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(770, 580, 1540, 60, 0x263653).setStrokeStyle(3, 0x6f86ad, 0.4);
    const upper = this.add
      .rectangle(1080, 430, 560, 30, 0x446e68)
      .setStrokeStyle(4, 0xa9d6b1, 0.65);
    this.platforms.add(ground);
    this.platforms.add(upper);

    this.add.rectangle(790, 510, 78, 128, 0x17243c, 0.92).setStrokeStyle(4, 0x7897c7, 0.65);
    this.add.rectangle(790, 510, 58, 102, 0x274263, 0.76).setStrokeStyle(2, 0xb6c7e3, 0.34);
    this.add.circle(790, 476, 20, 0xffd36a, 0.12);
    this.add.text(790, 494, "↑", { fontSize: "29px", color: "#ffd36a", fontStyle: "bold" }).setOrigin(0.5);
  }

  private createExecutives(): void {
    [
      { x: 390, tie: 0xe66565 },
      { x: 485, tie: 0x5e8ce6 },
      { x: 580, tie: 0xe6b85e },
      { x: 690, tie: 0x9c6ee6 },
    ].forEach(({ x, tie }, index) => {
      const shadow = this.add.ellipse(0, 28, 48, 11, 0x0a1020, 0.28);
      const stickerBody = this.add.rectangle(0, 5, 52, 67, 0xffffff);
      const stickerHead = this.add.ellipse(0, -50, 39, 45, 0xffffff);
      const stickerEar1 = this.add.circle(-20, -49, 6, 0xffffff);
      const stickerEar2 = this.add.circle(20, -49, 6, 0xffffff);
      const suit = this.add.rectangle(0, 0, 42, 58, index % 2 ? 0x334e8a : 0x51447b).setStrokeStyle(3, 0x302844);
      const shoulder = this.add.ellipse(0, -16, 48, 23, index % 2 ? 0x334e8a : 0x51447b).setStrokeStyle(2, 0x302844);
      const shirt = this.add.triangle(0, -18, -10, 0, 10, 0, 0, 20, 0xf3f4f7);
      const necktie = this.add.triangle(0, 0, -5, -12, 5, -12, 0, 19, tie);
      const neck = this.add.rectangle(0, -35, 13, 14, index % 2 ? 0xd5a77f : 0xb97f5d);
      const head = this.add.ellipse(0, -50, 31, 37, index % 2 ? 0xf0bf91 : 0xc98a66).setStrokeStyle(2, 0x302844);
      const ear1 = this.add.circle(-16, -49, 4, index % 2 ? 0xd5a77f : 0xb97f5d);
      const ear2 = this.add.circle(16, -49, 4, index % 2 ? 0xd5a77f : 0xb97f5d);
      const hair = this.add.arc(0, -56, 16, 180, 360, false, index % 2 ? 0x413329 : 0x2e2521);
      const eye1 = this.add.ellipse(-6, -50, 5, 7, 0xffffff).setStrokeStyle(1, 0x302844);
      const eye2 = this.add.ellipse(6, -50, 5, 7, 0xffffff).setStrokeStyle(1, 0x302844);
      const pupil1 = this.add.circle(-6, -50, 1.5, 0x302844);
      const pupil2 = this.add.circle(6, -50, 1.5, 0x302844);
      const brow1 = this.add.rectangle(-7, -57, 9, 2, 0x302844).setAngle(index % 2 ? 13 : -13);
      const brow2 = this.add.rectangle(7, -57, 9, 2, 0x302844).setAngle(index % 2 ? -13 : 13);
      const worriedMouth = this.add.arc(0, -39, 6, 195, 345, false, 0x7b4051).setStrokeStyle(2, 0x7b4051);
      const sweat = this.add.ellipse(18, -55, 5, 9, 0x8edfff, 0.9).setAngle(12);
      const man = this.add
        .container(x, 486, [
          shadow,
          stickerBody,
          stickerHead,
          stickerEar1,
          stickerEar2,
          suit,
          shoulder,
          shirt,
          necktie,
          neck,
          head,
          ear1,
          ear2,
          hair,
          eye1,
          eye2,
          pupil1,
          pupil2,
          brow1,
          brow2,
          worriedMouth,
          sweat,
        ])
        .setDepth(9);
      this.executives.push(man);
      this.tweens.add({
        targets: man,
        angle: index % 2 ? 1.8 : -1.8,
        scaleX: { from: 0.98, to: 1.02 },
        duration: 700 + index * 90,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createDirector(): void {
    const x = 520;
    const y = 258;
    const shadow = this.add.ellipse(4, 42, 68, 13, 0x302844, 0.18);
    const stickerTorso = this.add.rectangle(0, 8, 58, 76, 0xffffff);
    const stickerHead = this.add.ellipse(0, -42, 45, 51, 0xffffff);
    const stickerArm = this.add.rectangle(-35, -25, 24, 76, 0xffffff).setAngle(-28);
    const torso = this.add.rectangle(0, 8, 48, 68, 0x222f50).setStrokeStyle(3, 0x302844);
    const shoulder = this.add.ellipse(0, -11, 54, 25, 0x222f50).setStrokeStyle(2, 0x302844);
    const shirt = this.add.triangle(0, -14, -11, 0, 11, 0, 0, 22, 0xf7f4ee);
    const tie = this.add.triangle(0, 4, -6, -11, 6, -11, 0, 22, 0xd94867);
    const raisedArm = this.add.rectangle(-32, -29, 16, 67, 0x222f50).setStrokeStyle(3, 0x302844).setAngle(-28);
    const hand = this.add.circle(-48, -61, 10, 0xd99b72).setStrokeStyle(2, 0x302844);
    const finger = this.add.rectangle(-50, -76, 7, 25, 0xd99b72).setStrokeStyle(2, 0x302844).setAngle(-5);
    const neck = this.add.rectangle(0, -26, 15, 16, 0xd99b72);
    const head = this.add.ellipse(0, -45, 37, 43, 0xd99b72).setStrokeStyle(3, 0x302844);
    const hair = this.add.arc(0, -54, 19, 180, 360, false, 0x262332);
    const brow1 = this.add.rectangle(-8, -51, 11, 3, 0x302844).setAngle(15);
    const brow2 = this.add.rectangle(8, -51, 11, 3, 0x302844).setAngle(-15);
    const eye1 = this.add.circle(-7, -45, 2.5, 0x302844);
    const eye2 = this.add.circle(7, -45, 2.5, 0x302844);
    const mouth = this.add.ellipse(0, -34, 12, 8, 0x6e2e3e).setStrokeStyle(2, 0x302844);
    this.director = this.add
      .container(x, y, [
        shadow,
        stickerArm,
        stickerTorso,
        stickerHead,
        torso,
        shoulder,
        shirt,
        tie,
        raisedArm,
        hand,
        finger,
        neck,
        head,
        hair,
        brow1,
        brow2,
        eye1,
        eye2,
        mouth,
      ])
      .setDepth(14);

    const bubbleShadow = this.add.ellipse(4, 5, 150, 58, 0x302844, 0.2);
    const bubble = this.add.ellipse(0, 0, 150, 58, 0xffffff).setStrokeStyle(3, 0x302844);
    const tail = this.add.triangle(-55, 28, -12, 0, 12, 0, 0, 30, 0xffffff).setStrokeStyle(3, 0x302844);
    const text = this.add
      .text(0, -4, "ON LANCE\nLA FUSÉE !", {
        fontFamily: "system-ui",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#302844",
        align: "center",
        lineSpacing: 1,
      })
      .setOrigin(0.5);
    this.directorBubble = this.add.container(x + 105, y - 98, [bubbleShadow, tail, bubble, text]).setDepth(15);
    this.tweens.add({
      targets: this.director,
      angle: { from: -1, to: 1 },
      duration: 420,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: this.directorBubble,
      scale: { from: 0.97, to: 1.03 },
      duration: 520,
      yoyo: true,
      repeat: -1,
    });
  }

  private createControlPanel(): void {
    this.add.rectangle(224, 462, 104, 122, 0x091224, 0.38);
    const panel = this.add.rectangle(220, 455, 100, 116, 0x1a2943).setStrokeStyle(4, 0x7193c4);
    this.add.rectangle(220, 455, 82, 96, 0x223957).setStrokeStyle(2, 0xa9bad5, 0.25);
    const lights = [
      this.add.circle(198, 427, 6, 0x71e69b),
      this.add.circle(220, 427, 6, 0xffd36a),
      this.add.circle(242, 427, 6, 0xff7185),
    ];
    this.add.rectangle(220, 475, 48, 28, 0x111b30).setStrokeStyle(2, 0x536c94);
    this.panelWire = this.add.circle(220, 468, 12, 0xff5d76).setStrokeStyle(4, 0x7d2941);
    this.add.circle(220, 468, 4, 0xffd9df);
    this.add.container(0, 0, [panel, ...lights]);
    this.add.text(220, 516, "ALIMENTATION", { fontSize: "8px", color: "#9fb4d3", letterSpacing: 1 }).setOrigin(0.5);

    const doorShadow = this.add.rectangle(4, 5, 100, 116, 0x302844, 0.22);
    const door = this.add.rectangle(0, 0, 100, 116, 0xe5e0d8).setStrokeStyle(4, 0x302844);
    const inset = this.add.rectangle(0, 0, 79, 94, 0xf7f2e8).setStrokeStyle(2, 0x746b83, 0.5);
    const warning = this.add.triangle(0, -9, -20, 24, 20, 24, 0, -24, 0xffd45f).setStrokeStyle(3, 0x302844);
    const bolt = this.add.text(0, -6, "⚡", { fontSize: "22px", color: "#302844" }).setOrigin(0.5);
    const handle = this.add.rectangle(33, 25, 8, 28, 0x8c819c).setStrokeStyle(2, 0x302844);
    this.panelDoor = this.add
      .container(220, 455, [doorShadow, door, inset, warning, bolt, handle])
      .setDepth(18);

    const switchShadow = this.add.rectangle(4, 5, 46, 48, 0x302844, 0.2);
    const switchSticker = this.add.rectangle(0, 0, 52, 54, 0xffffff);
    const switchBox = this.add.rectangle(0, 0, 44, 46, 0xff8cae).setStrokeStyle(3, 0x302844);
    const switchButton = this.add.circle(0, -3, 11, 0xffd45f).setStrokeStyle(3, 0x302844);
    const switchLabel = this.add.text(0, 18, "OPEN", {
      fontSize: "7px",
      color: "#302844",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.treeSwitch = this.add
      .container(115, 505, [switchShadow, switchSticker, switchBox, switchButton, switchLabel])
      .setDepth(13);
    this.tweens.add({
      targets: this.treeSwitch,
      scale: { from: 0.96, to: 1.04 },
      duration: 750,
      yoyo: true,
      repeat: -1,
    });

    const rocket = this.add.triangle(0, -8, -16, 24, 16, 24, 0, -30, 0xeef3ff);
    const flame = this.add.triangle(0, 25, -8, 0, 8, 0, 0, 25, 0xff815f);
    const status = this.add.text(0, 48, "LANCEMENT", { fontSize: "10px", color: "#ff7185" }).setOrigin(0.5);
    this.rocketScreen = this.add.container(320, 410, [rocket, flame, status]).setDepth(8);
    this.tweens.add({ targets: flame, scaleY: 1.45, duration: 180, yoyo: true, repeat: -1 });
  }

  private createProjector(): void {
    this.add.rectangle(668, 320, 188, 138, 0x08101f, 0.38);
    const screen = this.add.rectangle(660, 310, 180, 130, 0xf5f0df).setStrokeStyle(8, 0x2d3b58);
    const rocket = this.add.triangle(0, -8, -25, 35, 25, 35, 0, -48, 0x697997);
    const moon = this.add.circle(45, -35, 15, 0xffd36a);
    const label = this.add.text(0, 48, "DÉPART IMMÉDIAT", {
      fontSize: "11px",
      color: "#33405d",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.projectorImage = this.add.container(660, 305, [rocket, moon, label]).setDepth(6);
    this.add.container(0, 0, [screen]);

    const catShadow = this.add.ellipse(0, 30, 58, 12, 0x080e1b, 0.28);
    const catStickerBody = this.add.ellipse(0, 12, 46, 35, 0xffffff);
    const catStickerHead = this.add.circle(0, -11, 25, 0xffffff);
    const catStickerEar1 = this.add.triangle(-14, -28, -10, 4, 10, 4, 0, -16, 0xffffff);
    const catStickerEar2 = this.add.triangle(14, -28, -10, 4, 10, 4, 0, -16, 0xffffff);
    const catBody = this.add.ellipse(0, 12, 36, 25, 0xf0a05c).setStrokeStyle(2, 0x302844);
    const catHead = this.add.circle(0, -11, 19, 0xffb86f).setStrokeStyle(2, 0x302844);
    const ear1 = this.add.triangle(-12, -27, -8, 4, 8, 4, 0, -13, 0xffb86f).setStrokeStyle(2, 0x302844);
    const ear2 = this.add.triangle(12, -27, -8, 4, 8, 4, 0, -13, 0xffb86f).setStrokeStyle(2, 0x302844);
    const eye1 = this.add.arc(-7, -13, 4, 0, 180, false, 0x302844).setStrokeStyle(2, 0x302844);
    const eye2 = this.add.arc(7, -13, 4, 0, 180, false, 0x302844).setStrokeStyle(2, 0x302844);
    const blush1 = this.add.ellipse(-12, -7, 6, 3, 0xff7298, 0.65);
    const blush2 = this.add.ellipse(12, -7, 6, 3, 0xff7298, 0.65);
    const mouth = this.add.text(0, -5, "ω", { fontSize: "12px", color: "#6d4430" }).setOrigin(0.5);
    const paw1 = this.add.ellipse(-9, 21, 10, 7, 0xffb86f).setStrokeStyle(2, 0x302844);
    const paw2 = this.add.ellipse(9, 21, 10, 7, 0xffb86f).setStrokeStyle(2, 0x302844);
    const tail = this.add.arc(19, 10, 14, 230, 75, false, 0xe7934f).setStrokeStyle(5, 0xe7934f);
    const catLabel = this.add.text(0, 42, "TOUCHE-MOI", {
      fontSize: "9px",
      color: "#ffd36a",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.officeCat = this.add
      .container(610, 515, [
        catShadow,
        catStickerBody,
        catStickerHead,
        catStickerEar1,
        catStickerEar2,
        tail,
        catBody,
        catHead,
        ear1,
        ear2,
        eye1,
        eye2,
        blush1,
        blush2,
        mouth,
        paw1,
        paw2,
        catLabel,
      ])
      .setScale(0.82)
      .setDepth(12);
    this.tweens.add({
      targets: this.officeCat,
      y: 498,
      angle: { from: -2, to: 2 },
      duration: 850,
      yoyo: true,
      repeat: -1,
    });
  }

  private createUpperGarden(): void {
    [920, 1060, 1200].forEach((x, index) => {
      const stem = this.add.rectangle(0, 8, 4, 22, 0x70c98c);
      const sticker = this.add.circle(0, -4, 19, 0xffffff);
      const color = [0xff8fb3, 0x92c8ff, 0xd39aff][index];
      const petals = [
        this.add.circle(-7, -4, 6, color),
        this.add.circle(7, -4, 6, color),
        this.add.circle(0, -11, 6, color),
        this.add.circle(0, 3, 6, color),
      ];
      const center = this.add.circle(0, -4, 5, 0xffd36a);
      const flower = this.add.container(x, 393, [sticker, stem, ...petals, center]).setData("officeFlower", true);
      this.tweens.add({ targets: flower, angle: { from: -4, to: 4 }, duration: 900, yoyo: true, repeat: -1 });
    });

    this.add.rectangle(1325, 300, 100, 120, 0x293650).setStrokeStyle(6, 0x97a9cd);
    this.add.rectangle(1325, 300, 72, 92, 0x111a2d);
  }

  private createHud(): void {
    this.add.rectangle(181, 35, 334, 52, 0x302844, 0.2).setScrollFactor(0).setDepth(99);
    const panel = this.add.rectangle(180, 31, 330, 48, 0xffffff, 0.96).setScrollFactor(0).setDepth(100);
    panel.setStrokeStyle(3, 0x302844, 1);
    this.add.circle(43, 31, 15, 0xff4f8b, 0.9).setStrokeStyle(2, 0x302844).setScrollFactor(0).setDepth(101);
    this.add
      .text(62, 18, "BUREAU ORBITE", { fontSize: "12px", color: "#302844", fontStyle: "bold", letterSpacing: 1 })
      .setScrollFactor(0)
      .setDepth(101);
    this.objectiveText = this.add
      .text(330, 18, "🐱 PARLER", { fontSize: "13px", color: "#ff4f8b", fontStyle: "bold" })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(101);
    const sound = this.add
      .text(260, 17, audio.isEnabled() ? "♪" : "×", { fontSize: "16px", color: "#ffd36a" })
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive();
    sound.on("pointerdown", () => sound.setText(audio.toggle() ? "♪" : "×"));

    this.messagePanel = this.add
      .rectangle(180, 588, 326, 58, 0x071020, 0.92)
      .setStrokeStyle(2, 0x7189b4, 0.28)
      .setScrollFactor(0)
      .setDepth(109)
      .setAlpha(0);
    this.messageText = this.add
      .text(180, 590, "", {
        fontFamily: "system-ui",
        fontSize: "13px",
        color: "#fff",
        fontStyle: "bold",
        align: "center",
        lineSpacing: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110)
      .setAlpha(0);
  }

  private createDialogueBox(): void {
    const shadow = this.add.rectangle(4, 6, 332, 126, 0x302844, 0.25);
    const paper = this.add.rectangle(0, 0, 332, 126, 0xfffcf5).setStrokeStyle(4, 0x302844);
    const portraitSticker = this.add.circle(-128, -17, 35, 0xffffff).setStrokeStyle(2, 0x302844);
    const portraitHead = this.add.circle(-128, -17, 27, 0xffb86f).setStrokeStyle(3, 0x302844);
    const ear1 = this.add.triangle(-145, -41, -9, 5, 9, 5, 0, -15, 0xffb86f).setStrokeStyle(2, 0x302844);
    const ear2 = this.add.triangle(-111, -41, -9, 5, 9, 5, 0, -15, 0xffb86f).setStrokeStyle(2, 0x302844);
    const eye1 = this.add.arc(-137, -19, 5, 0, 180, false, 0x302844).setStrokeStyle(2, 0x302844);
    const eye2 = this.add.arc(-119, -19, 5, 0, 180, false, 0x302844).setStrokeStyle(2, 0x302844);
    const nameTag = this.add.rectangle(-82, -55, 76, 24, 0xff4f8b).setStrokeStyle(3, 0x302844);
    const name = this.add
      .text(-82, -55, "MIMI", { fontSize: "11px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);
    this.dialogueText = this.add.text(-82, -29, "", {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#302844",
      wordWrap: { width: 208 },
      lineSpacing: 5,
    });
    const continueMark = this.add.text(145, 47, "▼", {
      fontSize: "13px",
      color: "#ff4f8b",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.tweens.add({ targets: continueMark, y: 52, duration: 450, yoyo: true, repeat: -1 });
    this.dialogueBox = this.add
      .container(180, 555, [
        shadow,
        paper,
        portraitSticker,
        portraitHead,
        ear1,
        ear2,
        eye1,
        eye2,
        nameTag,
        name,
        this.dialogueText,
        continueMark,
      ])
      .setScrollFactor(0)
      .setDepth(180)
      .setVisible(false);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.dialogueOpen) {
      this.closeDialogue();
      return;
    }
    if (this.climbing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (
      !this.catHintReceived &&
      Phaser.Math.Distance.Between(world.x, world.y, this.officeCat.x, this.officeCat.y) < 70
    ) {
      this.giveCatHint();
      return;
    }
    if (
      !this.panelOpen &&
      Phaser.Math.Distance.Between(world.x, world.y, this.treeSwitch.x, this.treeSwitch.y) < 65
    ) {
      if (!this.catHintReceived) {
        this.showMessage("Cette petite boîte semble verrouillée…", 1300);
        return;
      }
      this.openElectricalPanel();
      return;
    }
    if (
      this.wireDisconnected &&
      !this.hasFunnyDisc &&
      Phaser.Math.Distance.Between(world.x, world.y, this.officeCat.x, this.officeCat.y) < 70
    ) {
      this.receiveFunnyDisc();
      return;
    }
    if (this.ropeReady && world.x > 1270) {
      this.climbRope();
      return;
    }
    if (this.catShown && !this.onUpperPlatform && world.x > 760) {
      this.rideLift();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    if (!this.wireDisconnected && Phaser.Math.Distance.Between(world.x, world.y, 220, 455) < 85) {
      if (!this.panelOpen) {
        this.showMessage("Le panneau est fermé.\nLe chat connaît peut-être le mécanisme", 1900);
        return;
      }
      this.disconnectWire();
      return;
    }
    if (
      this.wireDisconnected &&
      !this.catShown &&
      Phaser.Math.Distance.Between(world.x, world.y, 660, 310) < 115
    ) {
      if (!this.hasFunnyDisc) {
        this.showMessage("Le rétroprojecteur attend un CD…\nTouche le chat", 1700);
        return;
      }
      this.showCatCassette();
      return;
    }
    this.showMessage("Rien à modifier ici", 1100);
  }

  private disconnectWire(): void {
    if (this.player.sprite.x > 330) {
      this.showMessage("Approche-toi du panneau", 1300);
      return;
    }
    this.wireDisconnected = true;
    audio.play("wire");
    this.tweens.add({ targets: this.panelWire, y: 492, angle: 35, duration: 350, ease: "Back.out" });
    this.rocketScreen.setAlpha(0.35);
    this.objectiveText.setText("🐱 CHAT");
    this.showMessage("Fusée débranchée !\nLe chat a quelque chose pour toi", 2200);
  }

  private openElectricalPanel(): void {
    if (this.panelOpen) return;
    this.panelOpen = true;
    audio.play("confirm");
    this.tweens.add({
      targets: this.panelDoor,
      x: 145,
      angle: -8,
      scaleX: 0.35,
      duration: 620,
      ease: "Back.inOut",
    });
    this.tweens.add({
      targets: this.treeSwitch,
      scale: 0.84,
      duration: 130,
      yoyo: true,
    });
    this.objectiveText.setText("⚡ FIL");
    this.showMessage("Le panneau électrique s’ouvre !\nDouble tape sur le fil rouge", 2200);
  }

  private giveCatHint(): void {
    if (this.player.sprite.x < 500) {
      this.showMessage("Un petit chat t’observe près de la table", 1400);
      return;
    }
    this.catHintReceived = true;
    audio.play("cat");
    this.player.stop();
    this.objectiveText.setText("▣ BOÎTE");
    this.openDialogue(
      "Miaou ! Tu vois la petite boîte rose près de l’arbre ? Touche-la : elle ouvre le panneau électrique.",
    );
    this.tweens.add({ targets: this.officeCat, scaleY: 0.76, scaleX: 0.9, duration: 150, yoyo: true });
  }

  private openDialogue(text: string): void {
    this.dialogueTimer?.remove(false);
    this.dialogueOpen = true;
    this.dialogueBox.setVisible(true).setScale(0.94).setAlpha(0);
    this.dialogueText.setText("");
    this.tweens.add({ targets: this.dialogueBox, alpha: 1, scale: 1, duration: 180, ease: "Back.out" });
    let index = 0;
    this.dialogueTimer = this.time.addEvent({
      delay: 23,
      repeat: text.length - 1,
      callback: () => {
        index += 1;
        this.dialogueText.setText(text.slice(0, index));
      },
    });
  }

  private closeDialogue(): void {
    this.dialogueTimer?.remove(false);
    this.dialogueOpen = false;
    this.tweens.add({
      targets: this.dialogueBox,
      alpha: 0,
      scale: 0.96,
      duration: 130,
      onComplete: () => this.dialogueBox.setVisible(false),
    });
  }

  private receiveFunnyDisc(): void {
    if (this.player.sprite.x < 500) {
      this.showMessage("Approche-toi du chat", 1300);
      return;
    }
    this.hasFunnyDisc = true;
    audio.play("cat");
    const disc = this.add.circle(this.officeCat.x, this.officeCat.y - 18, 16, 0x8ee7ff)
      .setStrokeStyle(4, 0xe8fbff)
      .setDepth(30);
    this.add.circle(disc.x, disc.y, 4, 0x27334c).setDepth(31);
    const label = this.add
      .text(disc.x, disc.y + 27, "CD IMAGE DRÔLE", {
        fontSize: "9px",
        color: "#fff",
        backgroundColor: "#27334c",
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(31);
    this.tweens.add({
      targets: [disc, label],
      x: this.player.sprite.x,
      y: this.player.sprite.y - 35,
      duration: 600,
      ease: "Back.out",
      onComplete: () => {
        disc.destroy();
        label.destroy();
      },
    });
    this.tweens.add({ targets: this.officeCat, scaleY: 1.18, duration: 150, yoyo: true });
    this.objectiveText.setText("💿 IMAGE");
    this.showMessage("Le chat te donne le CD « Image drôle » !\nDouble tape le rétroprojecteur", 2500);
  }

  private showCatCassette(): void {
    if (this.player.sprite.x < 520) {
      this.showMessage("Approche-toi du rétroprojecteur", 1400);
      return;
    }
    this.catShown = true;
    this.hasFunnyDisc = false;
    audio.play("cat");
    this.projectorImage.removeAll(true);
    const head = this.add.circle(0, -5, 34, 0xf3a45f);
    const ear1 = this.add.triangle(-22, -30, -10, 0, 10, 0, 0, -22, 0xf3a45f);
    const ear2 = this.add.triangle(22, -30, -10, 0, 10, 0, 0, -22, 0xf3a45f);
    const eye1 = this.add.circle(-12, -8, 4, 0x25304a);
    const eye2 = this.add.circle(12, -8, 4, 0x25304a);
    const smile = this.add.text(0, 12, "ω", { fontSize: "23px", color: "#6d4430" }).setOrigin(0.5);
    const caption = this.add.text(0, 52, "MIAOU ORBITAL !", {
      fontSize: "12px",
      color: "#33405d",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.projectorImage.add([head, ear1, ear2, eye1, eye2, smile, caption]);
    this.executives.forEach((man, index) => {
      this.tweens.add({ targets: man, y: man.y - 12, duration: 180, yoyo: true, delay: index * 80 });
      this.add.text(man.x, man.y - 95, "HA !", { fontSize: "13px", color: "#ffd36a" }).setOrigin(0.5);
    });
    this.tweens.add({
      targets: this.director,
      angle: -8,
      y: this.director.y + 8,
      duration: 250,
      ease: "Back.out",
    });
    const directorText = this.directorBubble.list.find(
      (item) => item instanceof Phaser.GameObjects.Text,
    ) as Phaser.GameObjects.Text | undefined;
    directorText?.setText("QUOI ?!\nUN CHAT ?");
    this.objectiveText.setText("⇧ MONTER");
    this.showMessage("Ils adorent le chat !\nLe passage est libre", 2200);
  }

  private rideLift(): void {
    this.player.stop();
    this.climbing = true;
    this.player.sprite.body!.enable = false;
    this.tweens.add({
      targets: this.player.sprite,
      x: 850,
      y: 390,
      duration: 900,
      ease: "Sine.inOut",
      onComplete: () => {
        this.player.sprite.body!.enable = true;
        this.onUpperPlatform = true;
        this.climbing = false;
        this.objectiveText.setText("✿ 0/3");
        this.showMessage("Cueille trois fleurs", 1500);
      },
    });
  }

  private collectFlowers(): void {
    if (!this.onUpperPlatform) return;
    this.children.list.forEach((child) => {
      if (!(child instanceof Phaser.GameObjects.Container) || child.getData("officeFlower") !== true) return;
      if (Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, child.x, child.y) < 34) {
        child.setData("officeFlower", false);
        this.flowers += 1;
        audio.play("flower");
        this.objectiveText.setText(`✿ ${this.flowers}/3`);
        this.tweens.add({
          targets: child,
          y: child.y - 35,
          alpha: 0,
          scale: 1.5,
          duration: 350,
          onComplete: () => child.destroy(),
        });
        if (this.flowers === 3) this.summonMonkey();
      }
    });
  }

  private summonMonkey(): void {
    audio.play("monkey");
    const stickerHead = this.add.circle(0, 0, 32, 0xffffff);
    const stickerEar1 = this.add.circle(-29, 0, 13, 0xffffff);
    const stickerEar2 = this.add.circle(29, 0, 13, 0xffffff);
    const head = this.add.circle(0, 0, 25, 0x8a5e3c);
    const face = this.add.ellipse(0, 4, 28, 23, 0xd6a77e);
    const ear1 = this.add.circle(-25, 0, 9, 0x9a6845);
    const ear2 = this.add.circle(25, 0, 9, 0x9a6845);
    const eye1 = this.add.circle(-7, 1, 3, 0x24202a);
    const eye2 = this.add.circle(7, 1, 3, 0x24202a);
    const smile = this.add.arc(0, 8, 8, 12, 168, false, 0x4e3329).setStrokeStyle(3, 0x4e3329);
    this.monkey = this.add
      .container(1325, 340, [stickerEar1, stickerEar2, stickerHead, ear1, ear2, head, face, eye1, eye2, smile])
      .setDepth(20);
    this.tweens.add({
      targets: this.monkey,
      y: 300,
      duration: 600,
      ease: "Back.out",
      onComplete: () => this.throwRope(),
    });
    this.showMessage("Un singe apparaît à la fenêtre !", 1800);
  }

  private throwRope(): void {
    const ropeLine = this.add.rectangle(0, 85, 5, 210, 0xb88755);
    const knots = Array.from({ length: 8 }, (_, index) =>
      this.add.circle(0, index * 25, 5, 0xd8aa72),
    );
    this.rope = this.add.container(1325, 315, [ropeLine, ...knots]).setScale(1, 0.05).setDepth(15);
    this.tweens.add({
      targets: this.rope,
      scaleY: 1,
      duration: 750,
      ease: "Bounce.out",
      onComplete: () => {
        this.ropeReady = true;
        audio.play("ladder");
        this.objectiveText.setText("↟ CORDE");
        this.showMessage("Le singe lance une corde !\nTouche-la", 2200);
      },
    });
  }

  private climbRope(): void {
    if (!this.ropeReady || this.climbing) return;
    this.climbing = true;
    this.player.stop();
    this.player.sprite.body!.enable = false;
    this.tweens.add({
      targets: this.player.sprite,
      x: 1325,
      y: 295,
      duration: 1100,
      ease: "Sine.inOut",
      onComplete: () => {
        audio.play("portal");
        const save = loadSave();
        writeSave({ ...save, lastLevel: 2, unlockedLevel: Math.max(save.unlockedLevel, 2) });
        this.cameras.main.flash(600, 255, 220, 145);
        this.time.delayedCall(500, () => this.scene.start("LevelCompleteScene", { completedLevel: 2 }));
      },
    });
  }

  private canMoveTo(fromX: number, targetX: number): boolean {
    if (!this.catShown && fromX < 735 && targetX > 750) {
      this.showMessage("Les hommes bloquent le passage", 1400);
      return false;
    }
    if (this.onUpperPlatform && !this.ropeReady && targetX > 1270) {
      this.showMessage("Il manque encore des fleurs", 1300);
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
