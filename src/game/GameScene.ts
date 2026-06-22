import Phaser from "phaser";
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
  private hasRock = false;
  private ogreDefeated = false;
  private checkpoint!: Point;
  private bridges = new Map<string, BridgeRuntime>();
  private actionZones: ActionZone[] = [];
  private rockSprite?: Phaser.Physics.Arcade.Image;
  private ogre?: Phaser.GameObjects.Container;
  private exitGlow?: Phaser.GameObjects.Arc;
  private uiBounds: Phaser.Geom.Rectangle[] = [];
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("GameScene");
  }

  init(data: { levelId?: number }): void {
    this.level = levels.find((candidate) => candidate.id === (data.levelId ?? 1)) ?? levels[0];
    this.blocks = 0;
    this.hasRock = false;
    this.ogreDefeated = false;
    this.bridges.clear();
    this.actionZones = this.level.actionZones.map((zone) => ({ ...zone }));
    this.checkpoint = { ...this.level.playerStart };
  }

  create(): void {
    this.physics.world.setBounds(0, 0, this.level.worldWidth, 640);
    this.cameras.main.setBounds(0, 0, this.level.worldWidth, 640).setBackgroundColor("#111936");
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
    this.showMessage("Touche le chemin pour avancer", 2200);
  }

  private drawWorld(): void {
    const background = this.add.graphics().setScrollFactor(0);
    background.fillGradientStyle(0x17244d, 0x17244d, 0x3a315d, 0x3a315d, 1);
    background.fillRect(0, 0, 360, 640);

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
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    this.dangers = this.physics.add.staticGroup();
    const colors = [0x6e7ed8, 0x7f8ee5, 0x8d80d7, 0x5f91c9];

    this.level.platforms.forEach((platform, index) => {
      const block = this.add
        .rectangle(
          platform.x + platform.width / 2,
          platform.y + platform.height / 2,
          platform.width,
          platform.height,
          colors[index % colors.length],
        )
        .setStrokeStyle(2, 0xcbd3ff, 0.25);
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
        this.drawActionCross(definition.x - 12, definition.y - 28);
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
    this.createExit();
  }

  private createHud(): void {
    const panel = this.add.rectangle(180, 32, 330, 48, 0x0b1027, 0.78).setScrollFactor(0).setDepth(100);
    panel.setStrokeStyle(1, 0xaebcff, 0.24);
    this.uiBounds.push(new Phaser.Geom.Rectangle(15, 8, 330, 48));

    this.add
      .text(28, 19, "UPLESS", {
        fontFamily: "system-ui",
        fontStyle: "bold",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.objectiveText = this.add
      .text(330, 19, "◆ 0/3", {
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
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
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
    this.vibrate(35);
    this.showMessage("Pont réparé !", 1800);
  }

  private pickupRock(zone: ActionZone): void {
    if (!this.rockSprite?.visible) return;
    zone.used = true;
    this.hasRock = true;
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
    writeSave({ ...save, lastLevel: 1, unlockedLevel: Math.max(save.unlockedLevel, 1) });
    this.player.stop();
    this.cameras.main.flash(600, 255, 230, 150);
    this.time.delayedCall(500, () => this.scene.start("LevelCompleteScene"));
  }

  private updateObjective(): void {
    if (this.ogreDefeated) this.objectiveText.setText("★ OGRE SONNÉ");
    else if (this.hasRock) this.objectiveText.setText("● CAILLOU");
    else this.objectiveText.setText(`◆ ${this.blocks}/3`);
  }

  private canMoveTo(fromX: number, targetX: number): boolean {
    const forward = targetX > fromX;
    const bridge1 = this.bridges.get("bridge-1");
    if (!bridge1?.body && forward && fromX < 238 && targetX > 250) {
      this.showMessage("Obstacle devant toi\nDouble tape pour agir", 1600);
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
    this.player.update((fromX, targetX) => this.canMoveTo(fromX, targetX));
    this.collectNearbyBlocks();
    this.updateCheckpoint();
    const carried = this.player.sprite.getData("carriedRock") as Phaser.GameObjects.Image | undefined;
    if (carried) {
      carried.setPosition(this.player.sprite.x, this.player.sprite.y - 29);
      if (!this.hasRock) {
        carried.destroy();
        this.player.sprite.setData("carriedRock", undefined);
      }
    }
    if (this.player.sprite.y > 625) this.respawn();
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
    this.level.checkpoints.forEach((checkpoint) => {
      if (this.player.sprite.x >= checkpoint.x) this.checkpoint = checkpoint;
    });
  }

  private respawn(): void {
    this.player.stop();
    this.player.sprite.setPosition(this.checkpoint.x, this.checkpoint.y).setVelocity(0, 0);
    this.cameras.main.fadeIn(220);
    this.showMessage("Retour au dernier repère", 1300);
  }

  private createOgre(x: number, y: number): Phaser.GameObjects.Container {
    const body = this.add.rectangle(0, 0, 62, 52, 0x737b91).setStrokeStyle(3, 0xb5bdd0, 0.6);
    const eye1 = this.add.circle(-13, -6, 5, 0xffffff);
    const eye2 = this.add.circle(13, -6, 5, 0xffffff);
    const pupil1 = this.add.circle(-12, -5, 2, 0x20263b);
    const pupil2 = this.add.circle(14, -5, 2, 0x20263b);
    const mouth = this.add.rectangle(0, 14, 25, 5, 0x34394b);
    return this.add.container(x, y - 18, [body, eye1, eye2, pupil1, pupil2, mouth]).setDepth(8);
  }

  private createExit(): void {
    const { x, y } = this.level.exit;
    this.exitGlow = this.add.circle(x, y, 55, 0xffd36a, 0.12);
    this.add.rectangle(x, y, 48, 76, 0x343f78).setStrokeStyle(5, 0xffd36a, 0.9);
    this.add.circle(x, y - 2, 17, 0xffe89b, 0.5);
    this.tweens.add({ targets: this.exitGlow, scale: 1.25, alpha: 0.04, duration: 1100, yoyo: true, repeat: -1 });
  }

  private drawActionCross(x: number, y: number): void {
    const cross = this.add.text(x, y, "✦", { fontSize: "30px", color: "#75e7c2" }).setOrigin(0.5);
    this.tweens.add({ targets: cross, scale: 1.3, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
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
