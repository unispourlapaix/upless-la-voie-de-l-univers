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
  private bridgeLift?: Phaser.GameObjects.Container;
  private liftTween?: Phaser.Tweens.Tween;
  private encounter: "idle" | "throwing" | "launching" | "attacking" | "over" | "exiting" = "idle";
  private launchedByOgre = false;
  private familyCalled = false;
  private ogreFamily: Phaser.GameObjects.Container[] = [];
  private exitGlow?: Phaser.GameObjects.Arc;
  private windowFrame?: Phaser.GameObjects.Container;
  private bee?: Phaser.GameObjects.Container;
  private ladder?: Phaser.GameObjects.Container;
  private uiBounds: Phaser.Geom.Rectangle[] = [];
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super("GameScene");
  }

  private timeGateTrap = false;

  init(data: { levelId?: number; timeGateTrap?: boolean }): void {
    this.timeGateTrap = data.timeGateTrap === true;
    this.level = levels.find((candidate) => candidate.id === (data.levelId ?? 1)) ?? levels[0];
    this.blocks = 0;
    this.flowers = 0;
    this.hasRock = false;
    this.ogreDefeated = false;
    this.encounter = "idle";
    this.launchedByOgre = false;
    this.familyCalled = false;
    this.ogreFamily = [];
    this.bridgeLift = undefined;
    this.liftTween = undefined;
    this.uiBounds = [];
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
    if (this.timeGateTrap && this.ogre) {
      this.player.sprite.setPosition(this.ogre.x - 30, this.ogre.y - 10);
      this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
      this.spawnOgreFamily();
      this.startFamilyAttack();
    }
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
      if (danger.x > this.level.enemies[0].x) {
        const sign = this.add.graphics().setDepth(15);
        const cx = danger.x + danger.width / 2;
        const cy = danger.y - 28;
        sign.fillStyle(0x293344).fillRect(cx - 3, cy + 20, 6, 35);
        sign.fillStyle(0xffcf75).fillTriangle(cx, cy - 36, cx - 35, cy + 25, cx + 35, cy + 25);
        sign.lineStyle(4, 0x63394a).strokeTriangle(cx, cy - 36, cx - 35, cy + 25, cx + 35, cy + 25);
        // Pixel hand and a red diagonal strike: no emoji/font dependency.
        sign.fillStyle(0x293344).fillRect(cx - 9, cy - 2, 20, 18);
        for (let finger = 0; finger < 4; finger++) sign.fillRect(cx - 10 + finger * 6, cy - 15 + Math.abs(finger - 1) * 3, 4, 19);
        sign.fillRect(cx - 15, cy + 1, 7, 8);
        sign.lineStyle(5, 0xcb4960).lineBetween(cx - 22, cy + 18, cx + 20, cy - 20);
        return;
      }
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
    this.createBridgeWorkout();
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
    if (this.isClimbing || this.encounter !== "idle") return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (this.tryStartFamilyAttack(world.x, world.y)) return;
    if (this.tryCallOgreFamily(world.x, world.y)) return;
    if (this.tryHitOgre(world.x, world.y)) return;
    if (this.ladderReady && this.player.sprite.y > 650 && world.x > 415) {
      this.climbLadder();
      return;
    }
    this.player.moveTo(world.x, world.y);
  }

  handleDoubleTap(screenX: number, screenY: number): void {
    if (this.isClimbing || this.encounter !== "idle") return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    if (this.tryStartFamilyAttack(world.x, world.y)) return;
    if (this.tryCallOgreFamily(world.x, world.y)) return;
    if (this.tryHitOgre(world.x, world.y)) return;
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
    this.showMessage("Rocher récupéré !\nTouche le monstre pour l’assommer", 2400);
  }

  private tryHitOgre(x: number, y: number): boolean {
    if (!this.ogre) return false;
    // Graphics has no geometry-derived bounds: use the drawn silhouette plus touch padding.
    const bounds = new Phaser.Geom.Rectangle(this.ogre.x - 52, this.ogre.y - 48, 104, 106);
    if (!bounds.contains(x, y)) return false;
    if (this.ogreDefeated) {
      this.showMessage("Le monstre est sonné. La voie est libre !", 1800);
      return true;
    }
    if (!this.hasRock) {
      this.showMessage("Récupère le rocher, puis touche le monstre", 2200);
      return true;
    }
    this.dropRock(this.actionZones.find((zone) => zone.type === "dropRock"));
    return true;
  }

  private tryCallOgreFamily(x: number, y: number): boolean {
    const enemy = this.level.enemies[0];
    const triangle = this.level.dangers.find((danger) => danger.x > enemy.x);
    if (!triangle) return false;
    const hit = new Phaser.Geom.Rectangle(triangle.x + triangle.width / 2 - 45, triangle.y - 74, 90, 108);
    if (!hit.contains(x, y)) return false;
    this.player.stop();
    if (this.familyCalled) {
      this.showMessage("Sa famille est déjà là… Grrr… !", 1800);
      return true;
    }
    this.familyCalled = true;
    this.showMessage("Le triangle appelle sa famille…\nIls ne sont pas contents !", 3200);
    audio.play("danger");
    this.spawnOgreFamily();
    this.time.addEvent({ delay: 1600, repeat: 4, callback: () => audio.play("ogre") });
    return true;
  }

  private spawnOgreFamily(): void {
    const family = [
      { x: 46, scale: 1.1, delay: 200, tint: 0xd9b485 },
      { x: 133, scale: 1.35, delay: 850, tint: 0xb4c885 },
      { x: 225, scale: 0.85, delay: 1500, tint: 0xc4accc },
      { x: 313, scale: 1.05, delay: 2100, tint: 0x91b9af },
    ];
    family.forEach(({ x: screenX, scale, delay, tint }, index) => {
      const relative = this.createOgre(screenX, 750).setScrollFactor(0).setDepth(85).setScale(scale);
      this.ogreFamily.push(relative);
      const face = this.add.graphics();
      // Slanted brows and clenched teeth make their mood readable at native resolution.
      face.fillStyle(0x293344).fillRect(-23, -23, 8, 3).fillRect(-15, -20, 10, 3);
      face.fillRect(6, -20, 10, 3).fillRect(16, -23, 8, 3);
      face.fillStyle(tint).fillRect(-21, 18, 42, 13);
      face.fillStyle(0xffefd0).fillRect(-12, 4, 25, 5);
      face.fillStyle(0x293344);
      for (let px = -7; px < 12; px += 6) face.fillRect(px, 4, 2, 5);
      relative.add(face);
      const growl = this.add.text(0, -60, index % 2 ? "GRRR… !" : "Grrr…", {
        fontFamily: "monospace", fontStyle: "bold", fontSize: "12px", color: "#ffcf91",
        backgroundColor: "#293344", padding: { x: 5, y: 4 },
      }).setOrigin(0.5);
      relative.add(growl);
      this.tweens.add({
        targets: relative, y: 554 + (index % 2) * 15, delay, duration: 5200,
        ease: "Sine.out",
        onStart: () => audio.play("ogre"),
        onComplete: () => {
          this.tweens.add({ targets: relative, y: relative.y - 3, duration: 950 + index * 100, yoyo: true, repeat: -1 });
        },
      });
    });
  }

  private tryStartFamilyAttack(x: number, y: number): boolean {
    const last = this.level.dangers[this.level.dangers.length - 1];
    if (!last) return false;
    const cx = last.x + last.width / 2;
    if (!new Phaser.Geom.Rectangle(cx - 45, last.y - 74, 90, 108).contains(x, y)) return false;
    if (!this.familyCalled) {
      const call = this.level.dangers.find((danger) => danger.x > this.level.enemies[0].x);
      if (call) this.tryCallOgreFamily(call.x + call.width / 2, call.y + call.height / 2);
    }
    this.startFamilyAttack();
    return true;
  }

  private startFamilyAttack(): void {
    this.encounter = "attacking";
    this.player.stop();
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.body!.enable = false;
    this.stopBridgeWorkout();
    this.cameras.main.stopFollow();
    this.showMessage("GRRR… ! Toute la famille arrive !", 3000);
    audio.play("ogre");
    const targetX = this.player.sprite.x - this.cameras.main.scrollX;
    const targetY = this.player.sprite.y - this.cameras.main.scrollY;
    this.ogreFamily.forEach((relative, index) => {
      this.tweens.killTweensOf(relative);
      const direction = index % 2 ? 1 : -1;
      relative.setPosition(direction < 0 ? -70 - index * 25 : 430 + index * 25, Math.min(590, targetY + 60));
      this.tweens.add({
        targets: relative, x: targetX + direction * (20 + index * 8), y: targetY + 8,
        delay: index * 250, duration: 3600 + index * 200, ease: "Sine.in",
        onStart: () => audio.play("ogre"),
        onUpdate: () => relative.setAngle(Math.sin(this.time.now / 110 + index) * 5),
        onComplete: () => {
          relative.setAngle(0);
          if (index !== 0) return;
          const mouth = this.add.ellipse(0, -8, 43, 33, 0x251c31).setStrokeStyle(4, 0xa7bc7e);
          relative.add(mouth);
          this.tweens.add({
            targets: this.player.sprite,
            x: relative.x + this.cameras.main.scrollX,
            y: relative.y - 8 + this.cameras.main.scrollY,
            scaleX: 0, scaleY: 0, angle: 180, duration: 500,
            onComplete: () => {
              this.player.sprite.setVisible(false);
              mouth.setScale(1, 0.15);
              this.cameras.main.shake(200, 0.012);
              this.time.delayedCall(700, () => this.showOgreGameOver(true));
            },
          });
        },
      });
    });
  }

  private dropRock(zone?: ActionZone): void {
    if (this.ogreDefeated || this.encounter !== "idle") return;
    if (!this.hasRock) {
      this.showMessage("Il te faut le caillou", 1400);
      return;
    }
    if (zone) zone.used = true;
    this.hasRock = false;
    const carried = this.player.sprite.getData("carriedRock") as Phaser.GameObjects.Image | undefined;
    carried?.destroy();
    this.player.sprite.setData("carriedRock", undefined);
    this.player.stop();
    this.encounter = "throwing";
    this.updateObjective();
    const fallingRock = this.add.image(this.player.sprite.x, this.player.sprite.y - 30, "rock").setDepth(30);
    this.tweens.add({
      targets: fallingRock,
      x: this.ogre?.x ?? this.level.enemies[0].x,
      y: (this.ogre?.y ?? this.level.enemies[0].y) - 25,
      angle: 250,
      duration: 460,
      ease: "Quad.in",
      onComplete: () => {
        fallingRock.destroy();
        this.encounter = "idle";
        this.defeatOgre();
      },
    });
  }

  private defeatOgre(): void {
    this.ogreDefeated = true;
    this.stopBridgeWorkout();
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
    if (this.encounter !== "idle") return;
    if (!this.ogreDefeated) {
      this.ogreSwallowsPlayer();
      return;
    }
    this.encounter = "exiting";
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
    return true;
  }

  update(): void {
    if (this.encounter !== "idle") return;
    const bridge = this.bridges.get("bridge-2")?.definition;
    const heroBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    if (bridge && !this.ogreDefeated && !this.launchedByOgre && !this.isClimbing &&
      this.player.sprite.x >= bridge.x + 36 && this.player.sprite.x <= bridge.x + bridge.width - 16 &&
      Math.abs(heroBody.bottom - bridge.y) < 6 && heroBody.blocked.down) {
      this.launchPlayerToDoor();
      return;
    }
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
    if (this.encounter !== "idle") return;
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
    const g = this.add.graphics();
    const rect = (px: number, py: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(px, py, w, h);
    const ink = 0x293344;
    rect(-32, -30, 64, 55, ink);
    rect(-28, -34, 56, 55, 0x77976a);
    rect(-24, -34, 45, 47, 0xa2ba7b);
    rect(-24, -31, 36, 8, 0xc5d597);
    rect(-38, -23, 10, 16, ink); rect(-36, -21, 8, 10, 0x96b276);
    rect(28, -23, 10, 16, ink); rect(28, -21, 8, 10, 0x77976a);
    rect(-29, 15, 58, 24, ink); rect(-25, 16, 50, 18, 0x68556b);
    rect(-24, 35, 17, 8, ink); rect(9, 35, 17, 8, ink);
    rect(-21, -17, 15, 10, 0xfff3ce); rect(7, -17, 15, 10, 0xfff3ce);
    rect(-13, -15, 5, 6, ink); rect(9, -15, 5, 6, ink);
    rect(-23, -21, 18, 4, 0x56725a); rect(6, -21, 18, 4, 0x56725a);
    rect(-6, -7, 13, 6, 0x789361);
    rect(-16, 4, 33, 7, ink); rect(-14, 2, 5, 6, 0xfff3ce); rect(10, 2, 5, 6, 0xfff3ce);
    for (let i = 0; i < 18; i++) {
      const px = -24 + (i * 17 % 47), py = -29 + (i * 13 % 33);
      if (py < -22 || px < -19 || px > 20) rect(px, py, 2, 2, i % 2 ? 0x829f68 : 0xc5d597);
    }
    return this.add.container(x, y + 12, [g]).setDepth(8);
  }

  private createBridgeWorkout(): void {
    const bridge = this.bridges.get("bridge-2");
    if (!bridge?.body || !this.ogre) return;
    bridge.body.setVisible(false);
    const { x, y, width, height } = bridge.definition;
    const art = this.add.graphics();
    art.fillStyle(0x27243c).fillRect(-4, -3, width + 8, height + 6);
    art.fillStyle(0x805b58).fillRect(0, 0, width, height);
    for (let px = 0; px < width; px += 16) {
      art.fillStyle(0xc59a76).fillRect(px + 1, 0, 13, 4);
      art.fillStyle(0xa77960).fillRect(px + 2, 7, 11, 2);
      art.fillStyle(0x473b4d).fillRect(px + 13, 4, 2, height - 4);
      art.fillStyle(0xe1bc8a).fillRect(px + 5, 4, 2, 2);
    }
    // Raised hands travel with the bridge; its invisible walking surface stays stable.
    const hands = [-49, 49].map((offset) => {
      const hand = this.add.rectangle(width / 2 + offset, height + 5, 19, 13, 0x94ae72);
      hand.setStrokeStyle(3, 0x303646);
      return hand;
    });
    this.bridgeLift = this.add.container(x, y, [art, ...hands]).setDepth(10);
    this.liftTween = this.tweens.add({
      targets: this.bridgeLift, y: y - 17, duration: 680,
      ease: "Sine.inOut", yoyo: true, repeat: -1,
    });
  }

  private stopBridgeWorkout(): void {
    this.liftTween?.stop();
    const bridge = this.bridges.get("bridge-2");
    if (this.bridgeLift && bridge) {
      this.tweens.add({ targets: this.bridgeLift, y: bridge.definition.y, duration: 180 });
      this.bridgeLift.list.slice(1).forEach((hand) => (hand as Phaser.GameObjects.Rectangle).setVisible(false));
    }
  }

  private launchPlayerToDoor(): void {
    if (!this.bridgeLift || !this.ogre) return;
    this.encounter = "launching";
    this.launchedByOgre = true;
    this.player.stop();
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.body!.enable = false;
    this.liftTween?.stop();
    const bridgeY = this.bridges.get("bridge-2")!.definition.y;
    const growl = this.add.text(this.ogre.x, this.ogre.y - 66, "GRRR… !", {
      fontFamily: "monospace", fontSize: "19px", fontStyle: "bold",
      color: "#ffdf9e", backgroundColor: "#293344", padding: { x: 8, y: 5 },
    }).setOrigin(0.5).setDepth(40);
    audio.play("ogre");
    this.showMessage("Grrr… ! Le monstre te propulse !", 2200);
    this.cameras.main.shake(200, 0.008);
    this.tweens.add({ targets: this.bridgeLift, y: bridgeY - 42, duration: 180, ease: "Back.out" });
    const startX = this.player.sprite.x;
    const startY = this.player.sprite.y;
    const landingX = this.level.exit.x - 68;
    const landingY = this.level.playerStart.y;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 1550, ease: "Linear",
      onUpdate: (tween) => {
        const t = tween.getValue() ?? 0;
        this.player.sprite.setPosition(
          Phaser.Math.Linear(startX, landingX, t),
          Phaser.Math.Linear(startY, landingY, t) - Math.sin(t * Math.PI) * 175,
        );
        this.player.sprite.setAngle(360 * t);
        const carried = this.player.sprite.getData("carriedRock") as Phaser.GameObjects.Image | undefined;
        carried?.setPosition(this.player.sprite.x, this.player.sprite.y - 29);
      },
      onComplete: () => {
        growl.destroy();
        this.player.sprite.setPosition(landingX, landingY).setAngle(0).setVelocity(0, 0);
        this.player.sprite.body!.enable = true;
        this.encounter = "idle";
        this.cameras.main.shake(140, 0.005);
        this.showMessage("Devant la porte… Attention au monstre !", 2400);
        this.tweens.add({ targets: this.bridgeLift, y: bridgeY, duration: 350 });
      },
    });
  }

  private ogreSwallowsPlayer(): void {
    if (!this.ogre) return;
    this.encounter = "attacking";
    this.stopBridgeWorkout();
    this.player.stop();
    this.player.sprite.setVelocity(0, 0);
    this.player.sprite.body!.enable = false;
    this.ogre.setDepth(35);
    this.showMessage("La porte grince… Le monstre arrive !", 1800);
    audio.play("ogre");
    this.tweens.add({
      targets: this.ogre, x: this.player.sprite.x + 26, y: this.player.sprite.y,
      duration: 1200, ease: "Quad.in",
      onComplete: () => {
        const mouth = this.add.ellipse(-12, -8, 44, 34, 0x251c31).setStrokeStyle(4, 0xa7bc7e);
        this.ogre!.add(mouth);
        this.tweens.add({
          targets: this.player.sprite, x: this.ogre!.x - 12, y: this.ogre!.y - 8,
          scaleX: 0, scaleY: 0, angle: 160, duration: 440, ease: "Back.in",
          onComplete: () => {
            this.player.sprite.setVisible(false);
            mouth.setScale(1, 0.15);
            this.cameras.main.shake(220, 0.012);
            this.time.delayedCall(450, () => this.showOgreGameOver());
          },
        });
      },
    });
  }

  private showOgreGameOver(familyAttack = false): void {
    this.encounter = "over";
    this.messageText.setAlpha(0);
    this.add.rectangle(180, 320, 360, 640, 0x101526, 0.94).setScrollFactor(0).setDepth(200);
    this.add.text(180, 230, "GAME OVER", {
      fontFamily: "monospace", fontSize: "32px", color: "#ffcf91", fontStyle: "bold",
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.add.text(180, 308, this.timeGateTrap
      ? "La porte temporelle t’a ramené\nchez les monstres. Ils t’ont avalé !"
      : familyAttack
      ? "La famille t’a avalé !\n\nAttention au panneau\navec la main barrée…"
      : "Le monstre t’a avalé !\n\nUtilise le rocher sur le pont\navant d’ouvrir la porte.", {
      fontFamily: "monospace", fontSize: "13px", color: "#e0e8da", align: "center", lineSpacing: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    const retry = this.add.text(180, 418, "↻ RECOMMENCER", {
      fontFamily: "monospace", fontSize: "16px", color: "#ffffff",
      backgroundColor: "#365e68", padding: { x: 22, y: 16 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });
    retry.on("pointerdown", () => {
      if (this.timeGateTrap) this.scene.start("BeachScene");
      else this.scene.restart({ levelId: this.level.id });
    });
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
