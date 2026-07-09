import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { createDetailedMonkey } from "./characterKit";
import { createBrokenLibertyStatue } from "./decorKit";
import { createEntityImage } from "./entityArt";
import { TouchInput } from "./input";
import { createDetailedObject, type DetailObjectKind } from "./objectKit";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";

type DesertItemId = "rocket" | "plastic" | "battery" | "virus" | "redWater" | "oil";

type DesertItem = {
  id: DesertItemId;
  label: string;
  x: number;
  y: number;
  phrase: string;
  monkeyComment?: string;
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
  private pondWater!: Phaser.GameObjects.Ellipse;
  private frog!: Phaser.GameObjects.Container;
  private robotNoCount = 0;
  private triedBunker = false;
  private smartphoneEventDone = false;
  private rocketLaunched = false;
  private pondHealed = false;
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
    addWorldGrain(this, "sand", 0.16);
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

    this.drawBrokenLibertyStatue();

    for (let x = 560; x < 1070; x += 130) {
      this.add.rectangle(x, 548, 70, 6, 0x6f493e, 0.4).setAngle(Phaser.Math.Between(-8, 8));
    }

    this.drawToxicPond();
    this.drawSickFrog();
  }

  private drawBrokenLibertyStatue(): void {
    createBrokenLibertyStatue(this, 280, 492);
  }

  private drawToxicPond(): void {
    createEntityImage(this, "toxicPond", 1065, 541).setDepth(8);
    this.pondWater = this.add.ellipse(1065, 541, 165, 38, 0xb82539, 0.001).setDepth(8);
  }

  private drawSickFrog(): void {
    this.frog = this.add.container(1182, 530).setDepth(10);
    const frogArt = createEntityImage(this, "sickFrog");
    this.frog.add([frogArt]);
    this.tweens.add({ targets: frogArt, y: "+=5", duration: 650, yoyo: true, repeat: -1 });
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    const ground = addReliefBlock(this, 800, 580, 1600, 58, 0xa95d39, { texture: "sand", stroke: 0xffd08b, strokeAlpha: 0.45, depth: 2 });
    this.platforms.add(ground);
  }

  private createBunker(): void {
    createEntityImage(this, "desertBunker", 1330, 482).setDepth(9);
    this.bunkerDoor = this.add.rectangle(1330, 512, 112, 124, 0x151a24, 0.001).setDepth(10);
  }

  private createRobot(): void {
    const body = createEntityImage(this, "rustyRobot").setScale(0.82).setPosition(0, -16);
    const eye1 = this.add.circle(-16, -59, 6, 0x4b1010);
    const eye2 = this.add.circle(16, -59, 6, 0x4b1010);
    this.robotEyes = [eye1, eye2];
    this.robot = this.add.container(1276, 493, [body, eye1, eye2]).setDepth(12);
    this.tweens.add({ targets: this.robot, angle: 1.4, duration: 410, yoyo: true, repeat: -1 });
  }

  private createMonkey(): void {
    const monkey = createDetailedMonkey(this, 96, 500, {
      fur: 0x8e929a,
      face: 0xd7b18d,
      outfit: "kimono",
      belt: true,
      sunglasses: true,
      orangeJuice: true,
      smile: true,
      skinny: true,
    }).setDepth(14);
    this.add.text(96, 570, "singe sensei\njus d’orange", {
      fontFamily: "system-ui",
      fontSize: "8px",
      color: "#5e3b43",
      fontStyle: "bold",
      align: "center",
    }).setOrigin(0.5);
    this.tweens.add({ targets: monkey, y: 492, duration: 520, yoyo: true, repeat: -1 });
  }

  private createItems(): void {
    this.items = [
      this.addItem(
        "rocket",
        "Bout de fusée",
        540,
        545,
        "Un gros morceau de fusée moderne.\nMême la technologie la plus brillante a fini dans le sable.",
        false,
        "Singe : Hm. Très bel exemple d’arrogance aérodynamique.",
      ),
      this.addItem(
        "plastic",
        "Déchet plastique",
        1024,
        532,
        "Un vieux sac plastique flotte dans la mare rouge.\nLéger, inutile… et toujours vivant.",
        false,
        "Singe : Remarquable. Même l’apocalypse recycle mal.",
      ),
      this.addItem(
        "battery",
        "Batterie smartphone",
        850,
        532,
        "Une batterie gonflée. À côté, un vieux smartphone poussiéreux attend encore un doigt.",
        false,
        "Singe : Prudence. Cet objet mange les regards.",
      ),
      this.addItem(
        "virus",
        "Virus alien",
        1188,
        505,
        "Cette grenouille transpire quelque chose de vivant…",
        false,
        "Singe : Diagnostic simple : votre planète tousse.",
      ),
      this.addItem(
        "redWater",
        "Mare rouge",
        1070,
        540,
        "L’eau elle-même a changé de couleur.",
        false,
        "Singe : Une soupe toxique. Quelle civilisation raffinée.",
      ),
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
    monkeyComment?: string,
  ): DesertItem {
    const objectKind: Record<DesertItemId, DetailObjectKind> = {
      rocket: "rocketPiece",
      plastic: "plasticWaste",
      battery: "smartBattery",
      virus: "alienVirus",
      redWater: "redPuddle",
      oil: "rareOil",
    };
    const container = createDetailedObject(this, objectKind[id], x, y, { label, scale: id === "rocket" ? 1.12 : 1 }).setDepth(11);
    if (id === "plastic") {
      this.tweens.add({ targets: container, y: y + 3, angle: 4, duration: 900, yoyo: true, repeat: -1 });
    } else if (id === "virus") {
      this.tweens.add({ targets: container, scale: 1.12, duration: 620, yoyo: true, repeat: -1 });
    } else {
      this.tweens.add({ targets: container, scale: 1.05, duration: 900 + (x % 4) * 80, yoyo: true, repeat: -1 });
    }
    return { id, label, x, y, phrase, monkeyComment, solution, found: false, container };
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
      this.showMessage("Singe : Hm. Charmant accueil.", 1900);
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
      this.triedBunker = true;
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
    if (item.id === "battery") {
      this.interactWithBattery(item);
      return;
    }

    if (item.id === "rocket" && this.triedBunker) {
      this.launchRocket();
      return;
    }

    if (item.id === "plastic" && this.triedBunker) {
      this.pollutePondWithPlastic(item);
      return;
    }

    if ((item.id === "virus" || item.id === "redWater") && this.triedBunker) {
      this.healFrogAndPond();
      return;
    }

    if (item.solution) {
      if (this.hasOil) {
        this.showMessage("Tu as déjà l’huile rare.", 1100);
        return;
      }
      if (!this.triedBunker && this.robotNoCount === 0) {
        this.showMessage("Une vieille boîte d’huile.\nPour l’instant, tu n’en vois pas l’utilité.", 1900);
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
      this.time.delayedCall(2350, () => this.showMessage("Singe : Enfin une décision presque raisonnable.", 2200));
      return;
    }

    item.found = true;
    audio.play("confirm");
    this.tweens.add({ targets: item.container, scale: 1.18, duration: 130, yoyo: true });
    this.showMessage(item.phrase, 2300);
    this.updateObjective();

    if (item.monkeyComment) {
      this.time.delayedCall(2350, () => this.showMessage(item.monkeyComment!, 2100));
    }

    const foundClues = this.items.filter((candidate) => candidate.found && !candidate.solution).length;
    if (foundClues >= 4 && !this.hasOil && !item.monkeyComment) {
      this.time.delayedCall(2350, () =>
        this.showMessage("Singe : Hihihi… il te manque ce qui fait taire les grincements.", 2600),
      );
    }
  }

  private interactWithBattery(item: DesertItem): void {
    if (!this.triedBunker && this.robotNoCount === 0) {
      this.showMessage("Une batterie de smartphone.\nPas le moment de scroller l’apocalypse.", 1900);
      return;
    }
    if (this.smartphoneEventDone) {
      this.showMessage("Le smartphone est calmé.\nTes yeux aussi.", 1300);
      return;
    }
    this.smartphoneEventDone = true;
    item.found = true;
    this.showSmartphoneRitual(item);
    this.updateObjective();
  }

  private showSpiralEyes(): void {
    const eyes = this.add.text(this.player.sprite.x, this.player.sprite.y - 42, "◎  ◎", {
      fontFamily: "system-ui",
      fontSize: "18px",
      color: "#8cf06a",
      fontStyle: "bold",
      stroke: "#20182b",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(55);
    this.tweens.add({
      targets: eyes,
      angle: 720,
      y: eyes.y - 14,
      alpha: 0,
      duration: 950,
      ease: "Sine.out",
      onComplete: () => eyes.destroy(),
    });
  }

  private showSmartphoneRitual(item: DesertItem): void {
    this.player.stop();
    const phone = this.add.container(this.player.sprite.x + 14, this.player.sprite.y - 32).setDepth(60);
    const body = this.add.rectangle(0, 0, 20, 31, 0x1f2430).setStrokeStyle(3, 0xffffff);
    const screen = this.add.rectangle(0, -1, 14, 21, 0x74e7ff);
    const glow = this.add.circle(0, -1, 28, 0x74e7ff, 0.18);
    const tapText = this.add.text(this.player.sprite.x, this.player.sprite.y - 74, "tic tic tic toc…", {
      fontFamily: "system-ui",
      fontSize: "15px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#20182b",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(61);
    phone.add([glow, body, screen]);
    this.showSpiralEyes();
    this.showMessage("Tu tapotes sans réfléchir…\ntic tic tic toc…", 2300);
    audio.play("wire");

    this.tweens.add({ targets: phone, y: phone.y - 8, angle: 12, duration: 150, yoyo: true, repeat: 7 });
    this.tweens.add({ targets: tapText, scale: 1.15, duration: 180, yoyo: true, repeat: 6 });
    this.tweens.add({
      targets: item.container,
      alpha: 0,
      y: item.container.y - 30,
      duration: 520,
      delay: 900,
      onComplete: () => item.container.setVisible(false),
    });

    this.time.delayedCall(1650, () => {
      tapText.destroy();
      phone.destroy();
      this.showMessage("Singe : Trois secondes dehors et déjà hypnotisé. Fascinant.", 2400);
    });
  }

  private launchRocket(): void {
    if (this.rocketLaunched) {
      this.showMessage("La fusée est déjà partie.\nTrop tard pour réserver.", 1500);
      return;
    }
    const rocketItem = this.items.find((item) => item.id === "rocket");
    if (!rocketItem) return;
    this.rocketLaunched = true;
    rocketItem.found = true;
    audio.play("portal");
    this.showMessage("La fusée se reconstruit…\nElle est beaucoup trop moderne.", 2400);
    this.cameras.main.shake(320, 0.006);

    const rocket = this.createFuturisticRocket(rocketItem.x, rocketItem.y - 72).setAlpha(0).setScale(0.28).setDepth(24);
    const beam = this.add.rectangle(rocketItem.x, rocketItem.y - 62, 7, 130, 0x80f3ff, 0.4).setDepth(23);
    const rings = [0, 1, 2].map((index) =>
      this.add.ellipse(rocketItem.x, rocketItem.y - 62, 52 + index * 28, 18 + index * 10, 0x80f3ff, 0)
        .setStrokeStyle(2, 0x80f3ff, 0.8)
        .setDepth(23),
    );

    this.tweens.add({ targets: rocketItem.container, alpha: 0.15, scale: 0.25, duration: 520, ease: "Back.in" });
    this.tweens.add({ targets: rings, scaleX: 1.7, scaleY: 1.7, alpha: 0, duration: 700, repeat: 2, ease: "Sine.out" });
    this.tweens.add({ targets: beam, alpha: 0, scaleY: 1.4, duration: 1100, ease: "Sine.out" });
    this.tweens.add({
      targets: rocket,
      alpha: 1,
      scale: 1.18,
      y: rocket.y - 28,
      duration: 900,
      ease: "Back.out",
      onComplete: () => {
        this.showMessage("Décollage futuriste !", 1200);
        const flame = this.add.container(rocket.x, rocket.y + 92).setDepth(23);
        flame.add([
          this.add.triangle(0, 24, -27, 0, 27, 0, 0, 84, 0xff8a2a),
          this.add.triangle(0, 18, -15, 0, 15, 0, 0, 56, 0xfff0a0),
          this.add.ellipse(0, 72, 72, 28, 0x80f3ff, 0.28),
        ]);
        this.tweens.add({ targets: flame, scaleY: 1.35, alpha: 0.65, duration: 110, yoyo: true, repeat: 10 });
        this.tweens.add({
          targets: [rocket, flame],
          x: rocket.x + 105,
          y: rocket.y - 540,
          scale: 1.45,
          duration: 1650,
          ease: "Sine.in",
          onComplete: () => {
            rocket.destroy();
            flame.destroy();
            rings.forEach((ring) => ring.destroy());
            beam.destroy();
          },
        });
      },
    });
  }

  private createFuturisticRocket(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 118, 92, 18, 0x20182b, 0.18);
    const hull = this.add.ellipse(0, 0, 58, 166, 0xf4f7ff).setStrokeStyle(5, 0x18223b);
    const nose = this.add.triangle(0, -100, -27, 12, 27, 12, 0, -48, 0x9feaff).setStrokeStyle(4, 0x18223b);
    const glass = this.add.ellipse(0, -34, 34, 42, 0x68ddff, 0.92).setStrokeStyle(4, 0x18223b);
    const shine = this.add.ellipse(-7, -43, 10, 16, 0xffffff, 0.72).setAngle(28);
    const stripe = this.add.rectangle(0, 21, 56, 13, 0xff4f8b).setStrokeStyle(3, 0x18223b);
    const core = this.add.circle(0, 55, 14, 0x80f3ff, 0.9).setStrokeStyle(3, 0x18223b);
    const wing1 = this.add.triangle(-35, 59, -8, -23, 9, 23, -31, 54, 0x6757d8).setStrokeStyle(4, 0x18223b);
    const wing2 = this.add.triangle(35, 59, -9, 23, 8, -23, 31, 54, 0x6757d8).setStrokeStyle(4, 0x18223b);
    const engine1 = this.add.rectangle(-17, 89, 17, 30, 0x4b5878).setStrokeStyle(3, 0x18223b);
    const engine2 = this.add.rectangle(17, 89, 17, 30, 0x4b5878).setStrokeStyle(3, 0x18223b);
    const antenna = this.add.line(0, 0, 0, -122, 0, -101, 0x18223b, 1).setLineWidth(3);
    const antennaTip = this.add.circle(0, -126, 5, 0xffd36a).setStrokeStyle(2, 0x18223b);
    return this.add.container(x, y, [
      shadow,
      wing1,
      wing2,
      hull,
      nose,
      glass,
      shine,
      stripe,
      core,
      engine1,
      engine2,
      antenna,
      antennaTip,
    ]);
  }

  private healFrogAndPond(): void {
    if (this.pondHealed) {
      this.showMessage("La mare est déjà verte.\nLa grenouille respire mieux.", 1500);
      return;
    }
    this.pondHealed = true;
    const virusItem = this.items.find((item) => item.id === "virus");
    virusItem?.container.setVisible(true).setAlpha(1).setDepth(16);
    if (virusItem) virusItem.found = true;
    audio.play("flower");
    this.tweens.add({
      targets: this.frog,
      x: 1084,
      y: 522,
      angle: -18,
      duration: 760,
      ease: "Back.out",
      onComplete: () => {
        this.frog.setAngle(0);
        this.pondWater.setFillStyle(0x58c86a, 0.9).setStrokeStyle(4, 0x2e7b45, 0.8);
        this.tweens.add({ targets: this.pondWater, scaleX: 1.08, scaleY: 1.16, duration: 240, yoyo: true });
        this.time.delayedCall(650, () => this.showMessage("La grenouille saute dans la mare.\nL’eau redevient verte.", 2300));
      },
    });
    if (virusItem) {
      this.tweens.add({
        targets: virusItem.container,
        x: 1104,
        y: 512,
        angle: 35,
        scale: 1.28,
        duration: 760,
        ease: "Back.out",
        onComplete: () => {
          this.tweens.add({
            targets: virusItem.container,
            alpha: 0,
            scale: 0.25,
            y: 536,
            duration: 520,
            ease: "Sine.in",
            onComplete: () => virusItem.container.setVisible(false),
          });
        },
      });
    }
  }

  private pollutePondWithPlastic(item: DesertItem): void {
    audio.play("danger");
    item.found = true;
    this.pondHealed = false;
    this.tweens.add({ targets: item.container, y: item.y + 7, angle: -6, scale: 1.16, duration: 220, yoyo: true });
    this.pondWater.setFillStyle(0xb82539, 0.92).setStrokeStyle(4, 0x5b1523, 0.9);
    this.tweens.add({ targets: this.pondWater, scaleX: 1.13, scaleY: 1.22, duration: 260, yoyo: true });
    this.showMessage("Le plastique flotte encore…\nLa mare redevient rouge.", 2200);
    this.time.delayedCall(2250, () => this.showMessage("Singe : Bravo. Retour à la case pollution.", 2300));
  }

  private interactWithRobot(): void {
    this.triedBunker = true;
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
      this.time.delayedCall(1450, () => this.showMessage("Singe : Il préfère les réponses courtes. Comme les dictateurs.", 2300));
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
    this.giraffe = this.add.container(1360, 522, [createEntityImage(this, "beachGiraffe").setScale(0.74)])
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
    if (!this.bunkerOpen && fromX < 1230 && targetX > 1250) {
      this.triedBunker = true;
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
