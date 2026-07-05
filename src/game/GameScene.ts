import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { TouchInput } from "./input";
import { levels } from "./levels";
import { PlayerController } from "./player";
import { loadSave, writeSave, type ActionZone, type LevelDefinition, type Point } from "./types";

type BridgeRuntime = {
  definition: LevelDefinition["bridges"][number];
  body?: Phaser.GameObjects.Rectangle;
  graphics: Phaser.GameObjects.Graphics;
};

export class GameScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private dangers!: Phaser.Physics.Arcade.StaticGroup;
  private touchInput?: TouchInput;
  private messageText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private blocks = 0;
  private flowers = 0;
  private hasRock = false;
  private ogreDefeated = false;
  private ladderReady = false;
  private isClimbing = false;
  private secretDiscovered = false;
  private checkpoint!: Point;
  private bridges = new Map<string, BridgeRuntime>();
  private actionZones: ActionZone[] = [];
  private rockSprite?: Phaser.Physics.Arcade.Image;
  private ogre?: Phaser.GameObjects.Container;
  private exitGlow?: Phaser.GameObjects.Arc;
  private windowFrame?: Phaser.GameObjects.Container;
  private bee?: Phaser.GameObjects.Container;
  private ladder?: Phaser.GameObjects.Container;
  private uiBounds: Phaser.Geom.Rectangle[] = [];
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("GameScene");
  }

  init(data: { levelId?: number }): void {
    this.level = levels.find((candidate) => candidate.id === (data.levelId ?? 1)) ?? levels[0];
    this.blocks = 0;
    this.flowers = 0;
    this.hasRock = false;
    this.ogreDefeated = false;
    this.ladderReady = false;
    this.isClimbing = false;
    this.secretDiscovered = false;
    this.bridges.clear();
    this.actionZones = this.level.actionZones.map((zone) => ({ ...zone }));
    this.checkpoint = { ...this.level.playerStart };
  }

  create(): void {
    this.physics.world.setBounds(0, 0, this.level.worldWidth, this.level.worldHeight);
    this.cameras.main
      .setBounds(0, 0, this.level.worldWidth, this.level.worldHeight)
      .setBackgroundColor("#111936");
    this.drawWorld();
    this.createPlatforms();
    this.createObjects();

    this.player = new PlayerController(this, this.level.playerStart.x, this.level.playerStart.y);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.overlap(this.player.sprite, this.dangers, () => this.respawn());
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08, -70, 55);
    this.cameras.main.setDeadzone(90, 180);

    this.createHud();
    this.touchInput = new TouchInput(this, {
      onTap: (x, y) => this.handleTap(x, y),
      onDoubleTap: (x, y) => this.handleDoubleTap(x, y),
      isUiHit: (x, y) => this.uiBounds.some((bounds) => bounds.contains(x, y)),
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.touchInput?.destroy());
    this.showMessage("Touche le chemin… et ose tomber", 2400);
  }

  private drawWorld(): void {
    const background = this.add.graphics().setScrollFactor(0);
    background.fillGradientStyle(0x17244d, 0x17244d, 0x3a315d, 0x3a315d, 1);
    background.fillRect(0, 0, 360, 640);
    addWorldGrain(this, "paper", 0.11);

    for (let i = 0; i < 38; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, this.level.worldWidth),
        Phaser.Math.Between(60, 430),
        Phaser.Math.Between(1, 3),
        0xd9e2ff,
        Phaser.Math.FloatBetween(0.15, 0.65),
      );
      this.tweens.add({
        targets: star,
        alpha: { from: star.alpha, to: 0.08 },
        duration: Phaser.Math.Between(900, 2200),
        yoyo: true,
        repeat: -1,
      });
    }

    const path = this.add.graphics();
    path.lineStyle(13, 0x6170c8, 0.16);
    path.strokeEllipse(1010, 380, 560, 280);
    path.strokeEllipse(1390, 380, 560, 280);

    const secretGlow = this.add.graphics();
    secretGlow.fillGradientStyle(0x15244f, 0x15244f, 0x4c376c, 0x4c376c, 0.92);
    secretGlow.fillRoundedRect(170, 610, 355, 225, 32);
    secretGlow.lineStyle(2, 0x9ca9ff, 0.18).strokeRoundedRect(170, 610, 355, 225, 32);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    this.dangers = this.physics.add.staticGroup();
    const colors = [0x6175c8, 0x7185d8, 0x766ac4, 0x4f83b5];

    this.level.platforms.forEach((platform, index) => {
      const block = addReliefBlock(
        this,
        platform.x + platform.width / 2,
        platform.y + platform.height / 2,
        platform.width,
        platform.height,
        colors[index % colors.length],
        { texture: "paper", stroke: 0xdce4ff, strokeAlpha: 0.46, depth: 2 },
      );
      this.platforms.add(block);
    });

    this.level.dangers.forEach((danger) => {
      const triangle = this.add.triangle(
        danger.x + danger.width / 2,
        danger.y + danger.height / 2,
        0,
        danger.height,
        danger.width / 2,
        0,
        danger.width,
        danger.height,
        0xff7185,
      );
      this.dangers.add(triangle);
    });
  }

  private createObjects(): void {
    this.level.repairBlocks.forEach((block) => {
      const visual = this.add.rectangle(block.x, block.y, 20, 20, 0x75e7c2).setStrokeStyle(3, 0xd9fff4, 0.8);
      this.tweens.add({ targets: visual, angle: 90, duration: 2400, repeat: -1, ease: "Sine.inOut" });
      visual.setData("collected", false);
      this.physics.add.existing(visual, true);
    });

    this.level.bridges.forEach((definition) => {
      const graphics = this.add.graphics();
      const runtime: BridgeRuntime = { definition, graphics };
      this.bridges.set(definition.id, runtime);
      if (definition.broken) {
        graphics.fillStyle(0x75e7c2, 0.25);
        graphics.fillRect(definition.x, definition.y + 8, 28, 12);
        graphics.fillRect(definition.x + definition.width - 28, definition.y + 8, 28, 12);
        this.add
          .text(definition.x + definition.width / 2, definition.y - 20, "↓", {
            fontSize: "24px",
            color: "#ffd36a",
          })
          .setOrigin(0.5);
      } else {
        runtime.body = this.add.rectangle(
          definition.x + definition.width / 2,
          definition.y + definition.height / 2,
          definition.width,
          definition.height,
          0x8f75d8,
        );
        runtime.body.setStrokeStyle(2, 0xe4ddff, 0.35);
        this.platforms.add(runtime.body);
      }
    });

    const rock = this.level.rocks[0];
    this.rockSprite = this.physics.add.staticImage(rock.x, rock.y, "rock");
    this.rockSprite.setDepth(12);

    const enemy = this.level.enemies[0];
    this.ogre = this.createOgre(enemy.x, enemy.y);
    this.createSecretGarden();
    this.createExit();
  }

  private createHud(): void {
    this.add.rectangle(181, 35, 334, 52, 0x050916, 0.35).setScrollFactor(0).setDepth(99);
    const panel = this.add.rectangle(180, 31, 330, 48, 0x10182f, 0.94).setScrollFactor(0).setDepth(100);
    panel.setStrokeStyle(2, 0x8ea2d4, 0.3);
    this.add.circle(44, 31, 15, 0xffd36a, 0.14).setScrollFactor(0).setDepth(101);
    this.uiBounds.push(new Phaser.Geom.Rectangle(15, 8, 330, 48));

    this.add
      .text(64, 19, "CHEMIN EN 8", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "12px",
        color: "#ffffff",
        letterSpacing: 1,
      })
      .setScrollFactor(0)
      .setDepth(101);

    const soundButton = this.add
      .text(259, 18, audio.isEnabled() ? "♪" : "×", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "16px",
        color: "#ffd36a",
      })
      .setScrollFactor(0)
      .setDepth(102)
      .setInteractive({ useHandCursor: true });
    soundButton.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      soundButton.setText(audio.toggle() ? "♪" : "×");
    });
    this.objectiveText = this.add
      .text(330, 19, "✿ 0/3", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "14px",
        color: "#75e7c2",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(101);

    this.messageText = this.add
      .text(180, 588, "", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "rgba(11,16,39,0.88)",
        padding: { x: 16, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110)
      .setAlpha(0);
  }

  handleTap(screenX: number, screenY: number): void {
    if (this.isClimbing) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (this.ladderReady && this.player.sprite.y > 650 && world.x > 415) {
      this.climbLadder();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  handleDoubleTap(screenX: number, screenY: number): void {
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    const zone = this.actionZones.find(
      (candidate) =>
        !candidate.used &&
        Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(candidate.x, candidate.y, candidate.width, candidate.height),
          world.x,
          world.y,
        ),
    );

    if (!zone) {
      this.showMessage("Rien à faire ici", 1100);
      return;
    }
    const playerNear = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      zone.x + zone.width / 2,
      zone.y + zone.height / 2,
    ) < 150;
    if (!playerNear) {
      this.showMessage("Approche-toi d’abord", 1400);
      return;
    }

    switch (zone.type) {
      case "repairBridge":
        this.repairBridge(zone);
        break;
      case "pickupRock":
        this.pickupRock(zone);
        break;
      case "dropRock":
        this.dropRock(zone);
        break;
      case "enterExit":
        this.enterExit();
        break;
      case "autoJump":
        this.player.sprite.setVelocityY(-380);
        zone.used = true;
        break;
    }
  }

  private repairBridge(zone: ActionZone): void {
    if (this.blocks < 3) {
      this.showMessage("Il manque des blocs…", 1700);
      return;
    }
    const bridge = this.bridges.get("bridge-1");
    if (!bridge || bridge.body) return;
    zone.used = true;
    this.blocks -= 3;
    this.updateObjective();
    bridge.graphics.clear();
    bridge.body = this.add.rectangle(
      bridge.definition.x + bridge.definition.width / 2,
      bridge.definition.y + bridge.definition.height / 2,
      bridge.definition.width,
      bridge.definition.height,
      0x75e7c2,
    );
    bridge.body.setScale(0.1, 1).setStrokeStyle(2, 0xe3fff6, 0.7);
    this.platforms.add(bridge.body);
    this.tweens.add({ targets: bridge.body, scaleX: 1, duration: 520, ease: "Back.out" });
    this.sparkle(bridge.definition.x + bridge.definition.width / 2, bridge.definition.y);
    audio.play("bridge");
    this.vibrate(35);
    this.showMessage("Pont réparé !", 1800);
  }

  private pickupRock(zone: ActionZone): void {
    if (!this.rockSprite?.visible) return;
    zone.used = true;
    this.hasRock = true;
    audio.play("rock");
    this.rockSprite.setVisible(false);
    const carried = this.add.image(0, -28, "rock").setScale(0.68);
    this.player.sprite.addToUpdateList();
    this.player.sprite.setData("carriedRock", carried);
    carried.setDepth(21);
    this.tweens.add({ targets: this.player.sprite, scaleY: 1.22, duration: 120, yoyo: true });
    this.updateObjective();
    this.showMessage("Caillou récupéré !", 1600);
  }

  private dropRock(zone: ActionZone): void {
    if (!this.hasRock) {
      this.showMessage("Il te faut le caillou", 1400);
      return;
    }
    zone.used = true;
    this.hasRock = false;
    const fallingRock = this.add.image(this.player.sprite.x, this.player.sprite.y - 30, "rock").setDepth(30);
    this.tweens.add({
      targets: fallingRock,
      x: this.level.enemies[0].x,
      y: this.level.enemies[0].y - 20,
      angle: 250,
      duration: 460,
      ease: "Quad.in",
      onComplete: () => {
        fallingRock.destroy();
        this.defeatOgre();
      },
    });
  }

  private defeatOgre(): void {
    this.ogreDefeated = true;
    audio.play("ogre");
    this.cameras.main.shake(180, 0.009);
    if (this.ogre) {
      this.tweens.add({ targets: this.ogre, angle: 12, scaleY: 0.7, duration: 260, ease: "Bounce.out" });
      [-24, 0, 24].forEach((offset, index) => {
        const star = this.add.text(this.ogre!.x + offset, this.ogre!.y - 50, "★", {
          fontSize: "16px",
          color: "#ffd36a",
        });
        this.tweens.add({
          targets: star,
          y: star.y - 12,
          angle: index % 2 ? 20 : -20,
          duration: 650,
          yoyo: true,
          repeat: -1,
        });
      });
    }
    this.vibrate([35, 40, 35]);
    this.updateObjective();
    this.showMessage("L’ogre est sonné !", 2000);
  }

  private enterExit(): void {
    if (!this.ogreDefeated) {
      this.showMessage("Le chemin n’est pas encore sûr", 1600);
      return;
    }
    const save = loadSave();
    writeSave({ ...save, lastLevel: 1, unlockedLevel: Math.max(save.unlockedLevel, 2) });
    this.player.stop();
    audio.play("portal");
    this.cameras.main.flash(600, 255, 230, 150);
    this.time.delayedCall(500, () => this.scene.start("LevelCompleteScene", { completedLevel: 1 }));
  }

  private updateObjective(): void {
    if (this.ogreDefeated) this.objectiveText.setText("★ OGRE SONNÉ");
    else if (this.hasRock) this.objectiveText.setText("● CAILLOU");
    else if (!this.ladderReady) this.objectiveText.setText(`✿ ${this.flowers}/3`);
    else this.objectiveText.setText("⇧ ÉCHELLE");
  }

  private canMoveTo(fromX: number, targetX: number): boolean {
    const forward = targetX > fromX;
    if (this.player.sprite.y > 650 && forward && targetX > 435) {
      if (this.ladderReady) {
        this.climbLadder();
      } else {
        this.showMessage("Cueille les trois fleurs", 1400);
      }
      return false;
    }
    if (!this.ogreDefeated && forward && fromX < 650 && targetX > 700) {
      this.showMessage("Le pont tremble…", 1200);
      this.cameras.main.shake(260, 0.012);
      this.time.delayedCall(280, () => this.respawn());
      return false;
    }
    return true;
  }

  update(): void {
    if (!this.isClimbing) {
      this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
    }
    this.collectNearbyBlocks();
    this.collectNearbyFlowers();
    this.updateCheckpoint();
    if (!this.secretDiscovered && this.player.sprite.y > 650) {
      this.secretDiscovered = true;
      this.checkpoint = { x: 235, y: 730 };
      this.showMessage("Un jardin caché… Cueille 3 fleurs", 2400);
    }
    const carried = this.player.sprite.getData("carriedRock") as Phaser.GameObjects.Image | undefined;
    if (carried) {
      carried.setPosition(this.player.sprite.x, this.player.sprite.y - 29);
      if (!this.hasRock) {
        carried.destroy();
        this.player.sprite.setData("carriedRock", undefined);
      }
    }
    if (this.player.sprite.y > this.level.worldHeight - 20) this.respawn();
  }

  private collectNearbyFlowers(): void {
    this.children.list.forEach((child) => {
      if (!(child instanceof Phaser.GameObjects.Container) || child.getData("flower") !== true) return;
      if (Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, child.x, child.y) < 34) {
        child.setData("flower", false);
        this.flowers += 1;
        this.updateObjective();
        this.tweens.add({
          targets: child,
          y: child.y - 38,
          scale: 1.5,
          alpha: 0,
          duration: 360,
          ease: "Back.in",
          onComplete: () => child.destroy(),
        });
        this.sparkle(child.x, child.y);
        audio.play("flower");
        this.showMessage(`${this.flowers}/3 fleur${this.flowers > 1 ? "s" : ""}`, 900);
        if (this.flowers === 3) this.openWindowAndSendBee();
      }
    });
  }

  private collectNearbyBlocks(): void {
    this.children.list.forEach((child) => {
      if (!(child instanceof Phaser.GameObjects.Rectangle) || child.getData("collected") !== false) return;
      if (Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, child.x, child.y) < 30) {
        child.setData("collected", true);
        this.blocks += 1;
        this.updateObjective();
        this.tweens.add({
          targets: child,
          y: child.y - 35,
          alpha: 0,
          scale: 1.5,
          duration: 300,
          onComplete: () => child.destroy(),
        });
        this.showMessage(`${this.blocks}/3 bloc${this.blocks > 1 ? "s" : ""}`, 900);
      }
    });
  }

  private updateCheckpoint(): void {
    if (this.player.sprite.y > 620) return;
    this.level.checkpoints.forEach((checkpoint) => {
      if (this.player.sprite.x >= checkpoint.x) this.checkpoint = checkpoint;
    });
  }

  private respawn(): void {
    this.player.stop();
    audio.play("window");
    this.player.sprite.setPosition(this.checkpoint.x, this.checkpoint.y).setVelocity(0, 0);
    this.cameras.main.fadeIn(220);
    this.showMessage("Retour au dernier repère", 1300);
  }

  private createSecretGarden(): void {
    this.level.flowers?.forEach((flower, index) => {
      const stem = this.add.rectangle(0, 7, 3, 18, 0x6bd6a1);
      const center = this.add.circle(0, -4, 5, 0xffd36a);
      const color = [0xff8fb3, 0xa999ff, 0x8fe8ff][index % 3];
      const petals = [
        this.add.circle(-7, -4, 6, color),
        this.add.circle(7, -4, 6, color),
        this.add.circle(0, -11, 6, color),
        this.add.circle(0, 3, 6, color),
      ];
      const flowerObject = this.add.container(flower.x, flower.y, [stem, ...petals, center]).setDepth(12);
      flowerObject.setData("flower", true);
      this.tweens.add({
        targets: flowerObject,
        angle: { from: -4, to: 4 },
        duration: 900 + index * 120,
        yoyo: true,
        repeat: -1,
      });
    });

    const windowPoint = this.level.window;
    if (!windowPoint) return;
    const wall = this.add.rectangle(0, 0, 62, 78, 0x31385d).setStrokeStyle(4, 0xa9b5ef, 0.6);
    const leftShutter = this.add.rectangle(-15, 0, 26, 62, 0x5969a7).setStrokeStyle(2, 0xd9ddff, 0.35);
    const rightShutter = this.add.rectangle(15, 0, 26, 62, 0x5969a7).setStrokeStyle(2, 0xd9ddff, 0.35);
    this.windowFrame = this.add
      .container(windowPoint.x, windowPoint.y, [wall, leftShutter, rightShutter])
      .setDepth(10);
    this.windowFrame.setData("left", leftShutter);
    this.windowFrame.setData("right", rightShutter);
  }

  private openWindowAndSendBee(): void {
    if (!this.windowFrame || !this.level.window) return;
    this.player.stop();
    this.showMessage("La fenêtre s’ouvre…", 1600);
    const left = this.windowFrame.getData("left") as Phaser.GameObjects.Rectangle;
    const right = this.windowFrame.getData("right") as Phaser.GameObjects.Rectangle;
    this.tweens.add({ targets: left, x: -34, angle: -18, duration: 520, ease: "Back.out" });
    this.tweens.add({
      targets: right,
      x: 34,
      angle: 18,
      duration: 520,
      ease: "Back.out",
      onComplete: () => this.sendBee(),
    });
  }

  private sendBee(): void {
    if (!this.level.window || !this.level.ladderTop) return;
    const body = this.add.ellipse(0, 0, 25, 17, 0xffd84d).setStrokeStyle(2, 0x463c31);
    const stripe1 = this.add.rectangle(-4, 0, 3, 15, 0x463c31);
    const stripe2 = this.add.rectangle(4, 0, 3, 15, 0x463c31);
    const wing1 = this.add.ellipse(-8, -10, 13, 9, 0xdff7ff, 0.8);
    const wing2 = this.add.ellipse(8, -10, 13, 9, 0xdff7ff, 0.8);
    this.bee = this.add
      .container(this.level.window.x, this.level.window.y, [wing1, wing2, body, stripe1, stripe2])
      .setDepth(30);
    audio.play("bee");
    this.tweens.add({
      targets: [wing1, wing2],
      scaleY: 0.35,
      duration: 70,
      yoyo: true,
      repeat: -1,
    });
    this.tweens.add({
      targets: this.bee,
      x: this.level.ladderTop.x,
      y: this.level.ladderTop.y - 28,
      duration: 1250,
      ease: "Sine.inOut",
      onComplete: () => this.dropLadder(),
    });
  }

  private dropLadder(): void {
    if (!this.level.ladderTop) return;
    const rungs: Phaser.GameObjects.Rectangle[] = [];
    const ropeLeft = this.add.rectangle(-13, 95, 4, 280, 0xd6a963);
    const ropeRight = this.add.rectangle(13, 95, 4, 280, 0xd6a963);
    for (let y = -42; y <= 210; y += 23) {
      rungs.push(this.add.rectangle(0, y, 30, 4, 0xf0c77d));
    }
    this.ladder = this.add
      .container(this.level.ladderTop.x, this.level.ladderTop.y, [ropeLeft, ropeRight, ...rungs])
      .setDepth(15)
      .setScale(1, 0.05);
    this.tweens.add({
      targets: this.ladder,
      scaleY: 1,
      duration: 750,
      ease: "Bounce.out",
      onComplete: () => {
        this.ladderReady = true;
        audio.play("ladder");
        this.updateObjective();
        this.vibrate([25, 30, 25]);
        this.showMessage("L’abeille a lancé une échelle !\nTouche-la pour remonter", 2600);
      },
    });
  }

  private climbLadder(): void {
    if (!this.ladderReady || this.isClimbing || !this.level.ladderTop) return;
    this.isClimbing = true;
    this.player.stop();
    this.player.sprite.body!.enable = false;
    this.tweens.add({
      targets: this.player.sprite,
      x: this.level.ladderTop.x,
      y: this.level.ladderTop.y - 10,
      duration: 1050,
      ease: "Sine.inOut",
      onUpdate: () => {
        this.player.sprite.angle = Math.sin(this.time.now / 80) * 5;
      },
      onComplete: () => {
        this.player.sprite.angle = 0;
        this.player.sprite.setPosition(410, 520);
        this.player.sprite.body!.enable = true;
        this.isClimbing = false;
        this.checkpoint = { x: 410, y: 530 };
        this.showMessage("Te voilà revenu sur la voie", 1700);
      },
    });
  }

  private createOgre(x: number, y: number): Phaser.GameObjects.Container {
    const shadow = this.add.ellipse(0, 29, 76, 15, 0x090d18, 0.38);
    const stickerBody = this.add.ellipse(0, -3, 84, 76, 0xffffff);
    const stickerEar1 = this.add.circle(-39, -8, 14, 0xffffff);
    const stickerEar2 = this.add.circle(39, -8, 14, 0xffffff);
    const stickerLegs = this.add.rectangle(0, 20, 62, 48, 0xffffff);
    const legs = this.add.rectangle(0, 18, 52, 30, 0x525d76).setStrokeStyle(3, 0x818ba2);
    const body = this.add.ellipse(0, -3, 72, 64, 0x68748e).setStrokeStyle(4, 0xaab4c9, 0.65);
    const belly = this.add.ellipse(0, 8, 45, 33, 0x7f8aa0, 0.8);
    const ear1 = this.add.circle(-34, -8, 10, 0x68748e).setStrokeStyle(3, 0xaab4c9);
    const ear2 = this.add.circle(34, -8, 10, 0x68748e).setStrokeStyle(3, 0xaab4c9);
    const brow1 = this.add.rectangle(-14, -17, 16, 4, 0x30384b).setAngle(10);
    const brow2 = this.add.rectangle(14, -17, 16, 4, 0x30384b).setAngle(-10);
    const eye1 = this.add.circle(-14, -9, 7, 0xf5f7ff);
    const eye2 = this.add.circle(14, -9, 7, 0xf5f7ff);
    const pupil1 = this.add.circle(-12, -8, 3, 0x20263b);
    const pupil2 = this.add.circle(12, -8, 3, 0x20263b);
    const mouth = this.add.arc(0, 8, 13, 15, 165, false, 0x34394b).setStrokeStyle(4, 0x34394b);
    return this.add
      .container(x, y - 25, [
        shadow,
        stickerLegs,
        stickerEar1,
        stickerEar2,
        stickerBody,
        legs,
        ear1,
        ear2,
        body,
        belly,
        brow1,
        brow2,
        eye1,
        eye2,
        pupil1,
        pupil2,
        mouth,
      ])
      .setDepth(8);
  }

  private createExit(): void {
    const { x, y } = this.level.exit;
    this.exitGlow = this.add.circle(x, y, 55, 0xffd36a, 0.12);
    this.add.rectangle(x, y, 48, 76, 0x343f78).setStrokeStyle(5, 0xffd36a, 0.9);
    this.add.circle(x, y - 2, 17, 0xffe89b, 0.5);
    this.tweens.add({ targets: this.exitGlow, scale: 1.25, alpha: 0.04, duration: 1100, yoyo: true, repeat: -1 });
  }

  private sparkle(x: number, y: number): void {
    for (let i = 0; i < 12; i += 1) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xb8ffe9);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(30, 85);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        onComplete: () => dot.destroy(),
      });
    }
  }

  private showMessage(message: string, duration: number): void {
    if (!this.messageText) return;
    this.messageTimer?.remove(false);
    this.messageText.setText(message).setAlpha(1);
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: this.messageText, alpha: 0, duration: 220 });
    });
  }

  private vibrate(pattern: number | number[]): void {
    if (loadSave().vibration && navigator.vibrate) navigator.vibrate(pattern);
  }
}
