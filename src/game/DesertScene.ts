import Phaser from "phaser";
import { addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { createCompanionMonkey } from "./companionArt";
import { drawDesertTerrain, drawDesertRubble, createPixelSalvage, createPixelPond, createPixelFrog, setPixelPondState, setPixelFrogState } from "./desertArt";
import { createBrokenLibertyStatue } from "./decorKit";
import { TouchInput } from "./input";
import { createDetailedObject, type DetailObjectKind } from "./objectKit";
import { PlayerController } from "./player";
import { createDesertRobot } from "./robotArt";
import { createRepairedRocket } from "./flightArt";
import { createDesertStargate } from "./stargateArt";
import { createBeachCharacter } from "./beachArt";
import { createRocketCrashDetails } from "./desertArt";
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
  private robotEyes!: Phaser.GameObjects.Rectangle[];
  private pondWater!: Phaser.GameObjects.Container;
  private frog!: Phaser.GameObjects.Container;
  private robotNoCount = 0;
  private triedBunker = false;
  private smartphoneEventDone = false;
  private rocketLaunched = false;
  private rocketAnimating = false;
  private rocketNose!: Phaser.GameObjects.Container;
  private rocketWing!: Phaser.GameObjects.Container;
  private pondHealed = false;
  private hasOil = false;
  private robotLubricated = false;
  private bunkerOpen = false;
  private bunkerDoor!: Phaser.GameObjects.Container;
  private giraffe?: Phaser.GameObjects.Container;
  private giraffeArriving = false;
  private finishing = false;
  private messageTimer?: Phaser.Time.TimerEvent;
  private monkey!: Phaser.GameObjects.Container;
  private introTimers: Phaser.Time.TimerEvent[] = [];
  private introOpen = false;
  private introIndex = -1;
  private readonly introLines = [
    "Vous franchissez la porte du bureau ensemble.\nDevant vous : le désert des derniers signes.",
    "TOI : Non !! Ils l’ont fait…\nRegarde la statue. Regarde ce qu’il reste !",
    "SINGE : Hm. Charmant accueil.\nCes ruines sont celles de leurs anciens exploits.",
    "SINGE : Tu as empêché une nouvelle salve.\nLe comité n’efface pas ses dégâts en fermant la porte.",
    "SINGE : Je reste avec toi. Allons au bunker.\nLe robot grince… Cherchons de quoi l’aider.",
  ];
  private companionHint = 0;

  constructor() {
    super("DesertScene");
  }

  create(): void {
    this.robotNoCount = 0;
    this.triedBunker = false;
    this.smartphoneEventDone = false;
    this.rocketLaunched = false;
    this.rocketAnimating = false;
    this.pondHealed = false;
    this.hasOil = false;
    this.robotLubricated = false;
    this.bunkerOpen = false;
    this.giraffe = undefined;
    this.giraffeArriving = false;
    this.finishing = false;
    this.companionHint = 0;
    this.introTimers = [];
    this.introOpen = false;
    this.introIndex = -1;
    this.physics.world.setBounds(0, 0, 2000, 760);
    this.cameras.main.setBounds(0, 0, 2000, 760).setBackgroundColor("#f2b96d");

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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.inputController?.destroy();
      this.introTimers.forEach((timer) => timer.remove(false));
    });

    this.showIntro();
  }

  update(_time: number, delta: number): void {
    if (this.introOpen || this.rocketAnimating) return;
    if (!this.finishing) this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
    if (this.finishing || this.rocketAnimating) return;
    const hero = this.player.sprite;
    const targetX = Phaser.Math.Clamp(hero.x - (hero.flipX ? -64 : 64), 28, 1960);
    const distance = targetX - this.monkey.x;
    if (Math.abs(distance) > 8) {
      const step = Math.sign(distance) * Math.min(Math.abs(distance), delta * 0.16);
      this.monkey.x += step;
      this.monkey.setScale(step < 0 ? -1 : 1, 1);
      this.monkey.y = 511 + Math.sin(this.time.now / 95) * 2;
    } else this.monkey.y = 511;
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

    const dunes = this.add.graphics().setDepth(1);
    for (let layer = 0; layer < 3; layer++) {
      dunes.fillStyle([0xc88a68, 0xc58157, 0xce955e][layer]);
      for (let x = 0; x < 2000; x += 4) {
        const y = 475 + layer * 24 + Math.floor((Math.sin(x / 135 + layer * 2) * 22 + Math.sin(x / 47) * 5) / 4) * 4;
        dunes.fillRect(x, y, 4, 551 - y);
      }
    }
    drawDesertRubble(this);
    const crash = createRocketCrashDetails(this, 770, 532);
    this.rocketNose = crash.nose;
    this.rocketWing = crash.wing;
    this.drawBrokenLibertyStatue();

    this.drawToxicPond();
    this.drawSickFrog();
  }

  private drawBrokenLibertyStatue(): void {
    createBrokenLibertyStatue(this, 430, 492).setDepth(30);
  }

  private drawToxicPond(): void {
    this.pondWater = createPixelPond(this, 1340, 541);
  }

  private drawSickFrog(): void {
    this.frog = createPixelFrog(this, 1470, 530);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    drawDesertTerrain(this);
    const ground = this.add.rectangle(1000, 580, 2000, 58, 0xa95d39, 0);
    this.platforms.add(ground);
  }

  private createBunker(): void {
    this.bunkerDoor = createDesertStargate(this, 1850, 450);
  }

  private createRobot(): void {
    const art = createDesertRobot(this, 1640, 493);
    this.robot = art.robot;
    this.robotEyes = art.eyes;
    this.tweens.add({ targets: this.robot, angle: 1.2, duration: 800, yoyo: true, repeat: -1 });
  }

  private createMonkey(): void {
    this.monkey = createCompanionMonkey(this, 140, 511);
    const door = this.add.graphics().setDepth(7);
    door.fillStyle(0x253144).fillRect(15, 425, 49, 126);
    door.fillStyle(0x0e1c2b).fillRect(20, 430, 39, 121);
    door.fillStyle(0x4d7c71).fillRect(59, 430, 5, 121);
    this.add.text(41, 410, "BUREAU", {fontFamily: "monospace", fontSize: "8px", color: "#5e3b43"}).setOrigin(0.5).setDepth(8);
  }

  private createItems(): void {
    this.items = [
      this.addItem(
        "rocket",
        "Bout de fusée",
        770,
        532,
        "Un gros morceau de fusée moderne.\nMême la technologie la plus brillante a fini dans le sable.",
        false,
        "Singe : Hm. Très bel exemple d’arrogance aérodynamique.",
      ),
      this.addItem(
        "plastic",
        "Déchet plastique",
        1260,
        532,
        "Un vieux sac plastique flotte dans la mare rouge.\nLéger, inutile… et toujours vivant.",
        false,
        "Singe : Remarquable. Même l’apocalypse recycle mal.",
      ),
      this.addItem(
        "battery",
        "Batterie smartphone",
        1110,
        532,
        "Une batterie gonflée. À côté, un vieux smartphone poussiéreux attend encore un doigt.",
        false,
        "Singe : Prudence. Cet objet mange les regards.",
      ),
      this.addItem(
        "virus",
        "Virus alien",
        1490,
        505,
        "Cette grenouille transpire quelque chose de vivant…",
        false,
        "Singe : Diagnostic simple : votre planète tousse.",
      ),
      this.addItem(
        "redWater",
        "Mare rouge",
        1375,
        540,
        "L’eau elle-même a changé de couleur.",
        false,
        "Singe : Une soupe toxique. Quelle civilisation raffinée.",
      ),
      this.addItem("oil", "Huile rare", 945, 536, "De l’huile rare… précieuse pour les vieilles machines.", true),
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
    const container = (id === "redWater" ? this.add.container(x, y) : id === "rocket" || id === "battery" || id === "oil" || id === "plastic"
      ? createPixelSalvage(this, id, x, y)
      : createDetailedObject(this, objectKind[id], x, y, { label, scale: 1 })).setDepth(11);
    if (id === "rocket") {
      container.setScale(1.5);
      container.setData("buriedDebris", true);
    } else if (id === "plastic") {
      this.tweens.add({ targets: container, y: y + 2, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    } else if (id === "virus") {
      container.setScale(0.38);
      this.tweens.add({ targets: container, scale: 0.42, duration: 900, yoyo: true, repeat: -1 });
    } else if (id !== "battery" && id !== "oil") {
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
    this.introOpen = true;
    this.player.stop();
    this.player.sprite.setX(35);
    this.monkey.setX(40);
    this.objectiveText.setText("SORTIE DU BUREAU");
    this.messagePanel.setSize(326, 108).setY(575);
    this.messageText.setFontSize(12).setY(577);
    this.tweens.add({targets: this.monkey, x: 140, duration: 900, ease: "Sine.out"});
    this.tweens.add({targets: this.player.sprite, x: 70, duration: 700, ease: "Sine.out",
      onComplete: () => this.advanceIntro(),
    });
  }

  private advanceIntro(): void {
    this.introTimers.forEach((timer) => timer.remove(false));
    this.introTimers = [];
    this.introIndex++;
    if (this.introIndex >= this.introLines.length) {
      this.introOpen = false;
      this.messagePanel.setSize(326, 66).setY(588);
      this.messageText.setFontSize(13).setY(590);
      this.objectiveText.setText("🔎 ENQUÊTE");
      this.showMessage("Touche le chemin pour avancer.\nDouble-touche les débris pour les examiner.", 3300);
      return;
    }
    this.showMessage(this.introLines[this.introIndex] + "\n[ toucher pour la suite ]", 120000);
  }

  private talkToCompanion(x: number, y: number): boolean {
    if (Math.abs(x - this.monkey.x) > 29 || Math.abs(y - (this.monkey.y - 4)) > 48) return false;
    this.player.stop();
    audio.play("monkey");
    const lines = this.bunkerOpen
      ? ["SINGE : La porte est ouverte. Après toi.\nJ’ai déjà fait les présentations au bureau."]
      : this.hasOil
        ? ["SINGE : Cette huile est pour le robot.\nPas pour le comité : eux glissent déjà assez."]
        : ["SINGE : Oui, c’est toujours moi. Même queue,\nmême mauvais pressentiment. Je reste avec toi.", "SINGE : Regarde les débris, puis le robot.\nOn va réparer un passage, pas relancer une guerre."];
    this.showMessage(lines[this.companionHint++ % lines.length], 3600);
    return true;
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.finishing || this.rocketAnimating) return;
    if (this.introOpen) {
      if (this.introIndex >= 0) this.advanceIntro();
      return;
    }
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    if (this.talkToCompanion(world.x, world.y)) return;
    audio.play("tap");
    if (this.bunkerOpen && world.x > 1745 && world.x < 1960 && world.y > 340 && world.y < 570) {
      this.enterBunker();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    if (this.finishing || this.rocketAnimating) return;
    if (this.introOpen) {
      if (this.introIndex >= 0) this.advanceIntro();
      return;
    }
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    if (this.talkToCompanion(world.x, world.y)) return;

    // Choose the closest target where water, plastic and frog interaction areas meet.
    const item = this.items
      .map((candidate) => ({candidate, distance: Phaser.Math.Distance.Between(world.x, world.y, candidate.x, candidate.y)}))
      .filter(({candidate, distance}) => distance < (candidate.id === "rocket" ? 112 : 58))
      .sort((a, b) => a.distance - b.distance)[0]?.candidate;
    if (item) {
      this.interactWithItem(item);
      return;
    }

    if (Phaser.Math.Distance.Between(world.x, world.y, this.robot.x, this.robot.y - 38) < 92) {
      this.interactWithRobot();
      return;
    }

    if (world.x > 1745 && world.x < 1960 && world.y > 340 && world.y < 570) {
      this.triedBunker = true;
      if (this.bunkerOpen) this.enterBunker();
      else if (this.robotLubricated) this.showMessage("La porte glisse lentement.", 1400);
      else this.showMessage("Cette porte est trop lourde…\nLe robot garde l’entrée.", 1900);
      return;
    }

    if (world.x > 300 && world.x < 540 && world.y > 320 && world.y < 570) {
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
    const item = this.items.find((candidate) => candidate.id === "rocket");
    if (!item) return;
    this.rocketLaunched = true;
    this.rocketAnimating = true;
    item.found = true;
    this.player.stop();
    this.cameras.main.stopFollow();
    this.cameras.main.pan(item.x, 320, 650, Phaser.Math.Easing.Sine.InOut);
    this.showMessage("Les pièces se soulèvent…\nLe nez et l’aile retrouvent leur place.", 2300);
    audio.play("wire");
    const {rocket, flame} = createRepairedRocket(this, item.x, 477);
    rocket.setAngle(-90).setAlpha(0).setScale(0.8);
    const shadow = this.add.rectangle(item.x, 552, 124, 5, 0x664b49, 0.5).setDepth(5);
    const pieces = [item.container, this.rocketNose, this.rocketWing];
    pieces.forEach((piece, index) => {
      this.tweens.killTweensOf(piece);
      this.tweens.add({targets: piece, x: item.x + [0, 52, -35][index], y: 478 + [0, -10, 20][index],
        angle: [0, 90, -90][index], duration: 1000, ease: "Sine.inOut"});
    });
    this.time.delayedCall(850, () => {
      audio.play("bridge");
      this.tweens.add({targets: pieces, alpha: 0, duration: 500});
      this.tweens.add({targets: rocket, alpha: 1, angle: 0, scale: 1, duration: 850, ease: "Sine.inOut"});
    });
    this.time.delayedCall(1850, () => {
      this.showMessage("Réparation terminée. Allumage…\nSINGE : Elle n’a même pas demandé un budget.", 2900);
      audio.play("portal");
      flame.setAlpha(1);
      this.tweens.add({targets: flame, scaleY: 0.65, scaleX: 0.8, duration: 95, yoyo: true, repeat: -1});
      this.tweens.add({targets: rocket, y: 473, duration: 130, yoyo: true, repeat: 3});
      this.cameras.main.shake(700, 0.003);
      for (let i = 0; i < 12; i++) {
        const dust = this.add.rectangle(item.x + (i % 2 ? 12 : -12), 549, 8 + i % 3 * 4, 4, 0xe8be86, 0.8).setDepth(35);
        this.tweens.add({targets: dust, x: item.x + (i % 2 ? 1 : -1) * (35 + i * 9),
          y: 537 - i % 3 * 7, alpha: 0, scaleX: 2, duration: 1000 + i * 30,
          delay: i * 35, onComplete: () => dust.destroy()});
      }
    });
    this.time.delayedCall(3000, () => {
      this.showMessage("Décollage !\nSINGE : Voilà. Un départ sans missiles.", 2600);
      this.tweens.add({targets: shadow, scaleX: 0.25, alpha: 0, duration: 1700});
      this.tweens.add({targets: rocket, x: item.x + 130, y: -350, angle: 12, scale: 0.72,
        duration: 2400, ease: "Cubic.in", onComplete: () => {
          this.tweens.killTweensOf(flame);
          rocket.destroy(true);
          shadow.destroy();
          pieces.forEach((piece) => piece.setVisible(false));
          this.rocketAnimating = false;
          this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -55, 50);
          this.cameras.main.setDeadzone(90, 180);
          this.updateObjective();
        }});
    });
  }

  private healFrogAndPond(): void {
    if (this.pondHealed) {
      this.showMessage("La mare est déjà verte.\nLa grenouille respire mieux.", 1500);
      return;
    }
    this.pondHealed = true;
    const virusItem = this.items.find((item) => item.id === "virus");
    if (virusItem) this.tweens.killTweensOf(virusItem.container);
    virusItem?.container.setVisible(true).setAlpha(1).setDepth(16);
    if (virusItem) virusItem.found = true;
    audio.play("flower");
    this.tweens.add({
      targets: this.frog,
      x: this.pondWater.x + 19,
      y: 522,
      angle: -18,
      duration: 760,
      ease: "Back.out",
      onComplete: () => {
        this.frog.setAngle(0);
        setPixelPondState(this.pondWater, this.pondHealed);
        setPixelFrogState(this.frog, this.pondHealed);
        this.tweens.add({ targets: this.pondWater, scaleX: 1.08, scaleY: 1.16, duration: 240, yoyo: true });
        this.time.delayedCall(650, () => {
          if (this.pondHealed) this.showMessage("La grenouille saute dans la mare.\nL’eau redevient verte.", 2300);
        });
      },
    });
    if (virusItem) {
      this.tweens.add({
        targets: virusItem.container,
        x: this.pondWater.x + 39,
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
    setPixelPondState(this.pondWater, false);
    setPixelFrogState(this.frog, false);
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
    this.objectiveText.setText("⬡ PORTE STELLAIRE");
    this.tweens.add({
      targets: this.bunkerDoor,
      scaleX: 0.08,
      alpha: 0,
      duration: 1100,
      ease: "Sine.inOut",
    });
    this.cameras.main.shake(350, 0.005);
    this.showMessage("La porte stellaire s’ouvre…", 1800);
  }

  private createGiraffe(): void {
    if (this.giraffe) return;
    this.giraffeArriving = true;
    this.player.stop();
    audio.play("portal");
    this.giraffe = createBeachCharacter(this, 1880, 506, "giraffe")
      .setDepth(18)
      .setAlpha(0)
      .setScale(0.85);
    this.tweens.add({ targets: this.giraffe, alpha: 1, x: 1780, duration: 850, ease: "Sine.out",
      onComplete: () => {
        this.giraffeArriving = false;
        this.showMessage("GIRAFE : Tu as frappé ? Me voilà.\nTouche encore la porte pour entrer.", 4000);
      },
    });
  }

  private enterBunker(): void {
    if (!this.bunkerOpen || this.finishing) return;
    if (Math.abs(this.player.sprite.x - this.bunkerDoor.x) > 145) {
      this.player.moveTo(this.bunkerDoor.x - 40, 520);
      this.showMessage("Approche-toi de la porte stellaire.", 1800);
      return;
    }
    if (!this.giraffe) {
      this.showMessage("Une silhouette apparaît dans le voile bleu…", 1800);
      this.createGiraffe();
      return;
    }
    if (this.giraffeArriving) return;
    this.finishing = true;
    this.player.stop();
    this.player.sprite.body!.enable = false;
    this.tweens.add({
      targets: this.player.sprite,
      x: this.bunkerDoor.x,
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
    if (!this.bunkerOpen && fromX < 1594 && targetX > 1614) {
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




