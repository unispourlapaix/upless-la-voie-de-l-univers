import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { createDetailedMonkey } from "./characterKit";
import { createEntityImage } from "./entityArt";
import { TouchInput } from "./input";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

type DialogueLine = {
  speaker: "MIMI" | "TOI";
  text: string;
};

export class OfficeScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messageText!: Phaser.GameObjects.Text;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private dialogueBox!: Phaser.GameObjects.Container;
  private dialogueNameText!: Phaser.GameObjects.Text;
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
  private dialogueLines: DialogueLine[] = [];
  private dialogueIndex = 0;
  private dialogueFullText = "";
  private dialogueTyped = 0;
  private dialogueComplete?: () => void;

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
    addWorldGrain(this, "paper", 0.13);
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
    const ground = addReliefBlock(this, 770, 580, 1540, 60, 0x263653, { texture: "metal", stroke: 0x6f86ad, strokeAlpha: 0.5, depth: 2 });
    const upper = addReliefBlock(this, 1080, 430, 560, 30, 0x446e68, { texture: "paper", stroke: 0xa9d6b1, strokeAlpha: 0.7, depth: 2 });
    this.platforms.add(ground);
    this.platforms.add(upper);

    this.add.rectangle(790, 510, 78, 128, 0x17243c, 0.92).setStrokeStyle(4, 0x7897c7, 0.65);
    this.add.rectangle(790, 510, 58, 102, 0x274263, 0.76).setStrokeStyle(2, 0xb6c7e3, 0.34);
    this.add.circle(790, 476, 20, 0xffd36a, 0.12);
    this.add.text(790, 494, "↑", { fontSize: "29px", color: "#ffd36a", fontStyle: "bold" }).setOrigin(0.5);
  }

  private createExecutives(): void {
    [
      { x: 390, tint: 0xffffff },
      { x: 485, tint: 0xdbe8ff },
      { x: 580, tint: 0xffefd1 },
      { x: 690, tint: 0xeadcff },
    ].forEach(({ x, tint }, index) => {
      const drawing = createEntityImage(this, "officeExecutive").setScale(0.74).setTint(tint);
      const man = this.add.container(x, 486, [drawing]).setDepth(9);
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
    const directorArt = createEntityImage(this, "officeDirector").setScale(0.82);
    this.director = this.add.container(x, y, [directorArt]).setDepth(14);

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
    createEntityImage(this, "controlPanel", 220, 455).setDepth(12);
    this.panelWire = this.add.circle(220, 468, 12, 0xff5d76, 0.001).setDepth(13);
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

    this.treeSwitch = this.add.container(115, 505, [createEntityImage(this, "powerSwitch")]).setDepth(13);
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
    createEntityImage(this, "projectorScreen", 660, 310).setDepth(6);
    this.projectorImage = this.add.container(660, 305).setDepth(7);

    this.officeCat = this.add
      .container(610, 515, [createEntityImage(this, "officeCat")])
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
    this.dialogueNameText = this.add
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
        this.dialogueNameText,
        this.dialogueText,
        continueMark,
      ])
      .setScrollFactor(0)
      .setDepth(180)
      .setVisible(false);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.dialogueOpen) {
      this.advanceDialogue();
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
    audio.play("cat");
    this.player.stop();
    this.openDialogueSequence(
      [
        { speaker: "MIMI", text: "Bonjour toi ! Mais qu’est-ce que tu fais là ? Tu es maboul ?" },
        { speaker: "TOI", text: "Non, je cherche un singe." },
        { speaker: "MIMI", text: "Il y a plein de singes ici, hahaha !" },
        { speaker: "TOI", text: "Trêve de plaisanterie, peux-tu m’aider ?" },
        { speaker: "MIMI", text: "Je pense qu’il faudrait couper le wifi. Regarde la boîte dehors." },
      ],
      () => {
        this.catHintReceived = true;
        this.objectiveText.setText("▣ BOÎTE");
        this.showMessage("La boîte dehors peut ouvrir le panneau", 1700);
      },
    );
    this.tweens.add({ targets: this.officeCat, scaleY: 0.76, scaleX: 0.9, duration: 150, yoyo: true });
  }

  private openDialogueSequence(lines: DialogueLine[], onComplete?: () => void): void {
    this.dialogueLines = lines;
    this.dialogueIndex = 0;
    this.dialogueComplete = onComplete;
    this.showDialogueLine();
  }

  private showDialogueLine(): void {
    this.dialogueTimer?.remove(false);
    this.dialogueOpen = true;
    this.dialogueBox.setVisible(true).setScale(0.94).setAlpha(0);
    const line = this.dialogueLines[this.dialogueIndex];
    this.dialogueFullText = line.text;
    this.dialogueTyped = 0;
    this.dialogueNameText.setText(line.speaker);
    this.dialogueNameText.setColor(line.speaker === "MIMI" ? "#ffffff" : "#302844");
    this.dialogueText.setText("");
    this.tweens.add({ targets: this.dialogueBox, alpha: 1, scale: 1, duration: 180, ease: "Back.out" });
    this.dialogueTimer = this.time.addEvent({
      delay: 23,
      repeat: this.dialogueFullText.length - 1,
      callback: () => {
        this.dialogueTyped += 1;
        this.dialogueText.setText(this.dialogueFullText.slice(0, this.dialogueTyped));
      },
    });
  }

  private advanceDialogue(): void {
    if (this.dialogueTyped < this.dialogueFullText.length) {
      this.dialogueTimer?.remove(false);
      this.dialogueTyped = this.dialogueFullText.length;
      this.dialogueText.setText(this.dialogueFullText);
      return;
    }
    if (this.dialogueIndex < this.dialogueLines.length - 1) {
      this.dialogueIndex += 1;
      this.showDialogueLine();
      return;
    }
    this.closeDialogue();
    const onComplete = this.dialogueComplete;
    this.dialogueComplete = undefined;
    onComplete?.();
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
    const catMeme = createEntityImage(this, "officeCat").setScale(0.9).setPosition(0, -12);
    const caption = this.add.text(0, 52, "MIAOU ORBITAL !", {
      fontSize: "12px",
      color: "#33405d",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.projectorImage.add([catMeme, caption]);
    this.executives.forEach((man, index) => {
      this.tweens.add({ targets: man, alpha: 0, duration: 220, delay: index * 40 });
      this.tweens.add({ targets: man, y: man.y - 12, duration: 180, yoyo: true, delay: index * 80 });
      this.add.text(man.x, man.y - 95, "HA !", { fontSize: "13px", color: "#ffd36a" }).setOrigin(0.5);
    });
    const laughingMen = createEntityImage(this, "laughingBusinessmen", 500, 430).setDepth(13).setAlpha(0).setScale(0.92);
    this.tweens.add({ targets: laughingMen, alpha: 1, y: 424, scale: 1, duration: 420, ease: "Back.out" });
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
    this.monkey = createDetailedMonkey(this, 1325, 340, {
      fur: 0x8a5e3c,
      face: 0xd6a77e,
      outfit: "none",
      sunglasses: false,
      orangeJuice: false,
      smile: true,
      skinny: true,
    }).setScale(0.64).setDepth(20);
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
        writeSave({ ...save, lastLevel: 2, unlockedLevel: Math.max(save.unlockedLevel, 3) });
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
