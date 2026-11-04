import Phaser from "phaser";
import { audio } from "./audio";
import { TouchInput } from "./input";
import { PlayerController } from "./player";
import { createCompanionMonkey } from "./companionArt";
import { officeDialogue, catPlanDialogue } from "./officeDialogue";
import { loadSave, writeSave } from "./types";

type OfficePhase = "connected" | "offline" | "hacking" | "diversion" | "welcoming" | "leaving";

export class OfficeScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private controls?: TouchInput;
  private phase: OfficePhase = "connected";
  private objective!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;
  private guard!: Phaser.GameObjects.Container;
  private guardAway = false;
  private door!: Phaser.GameObjects.Container;
  private routerLight!: Phaser.GameObjects.Rectangle;
  private networkLabel!: Phaser.GameObjects.Text;
  private display!: Phaser.GameObjects.Text;
  private directorLine!: Phaser.GameObjects.Text;
  private staff: Phaser.GameObjects.Container[] = [];
  private hackPanel?: Phaser.GameObjects.Container;
  private hackStep = 0;
  private hackHint!: Phaser.GameObjects.Text;
  private hackOptions: Phaser.GameObjects.Text[] = [];
  private hackTitle!: Phaser.GameObjects.Text;
  private briefingOpen = false;
  private briefingHeard = false;
  private briefingKind: "meeting" | "cat" = "meeting";
  private briefingIndex = 0;
  private briefingPanel?: Phaser.GameObjects.Container;
  private briefingName!: Phaser.GameObjects.Text;
  private briefingText!: Phaser.GameObjects.Text;
  private briefingTimer?: Phaser.Time.TimerEvent;
  private stopWhispers?: () => void;
  private hasUsb = false;
  private officeCat!: Phaser.GameObjects.Container;
  private usbLabel!: Phaser.GameObjects.Text;
  private monkey!: Phaser.GameObjects.Container;
  private monkeyWelcomed = false;
  private exitDoor!: Phaser.GameObjects.Container;

  constructor() { super("OfficeScene"); }

  create(): void {
    this.phase = "connected";
    this.guardAway = false;
    this.hackStep = 0;
    this.staff = [];
    this.hackPanel = undefined;
    this.briefingOpen = false;
    this.briefingHeard = false;
    this.hasUsb = false;
    this.monkeyWelcomed = false;
    this.physics.world.setBounds(0, 0, 1240, 640);
    this.cameras.main.setBounds(0, 0, 1240, 640).setBackgroundColor("#1b2439");
    this.drawOffice();
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(this.add.rectangle(620, 583, 1240, 66, 0x273548).setDepth(2));
    this.player = new PlayerController(this, 58, 524);
    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09, -65, 0);
    this.createHud();
    this.controls = new TouchInput(this, {
      onTap: (x, y) => this.handleTap(x, y),
      onDoubleTap: (x, y) => this.handleTap(x, y),
      isUiHit: (_x, y) => y < 64 || this.phase === "leaving",
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls?.destroy();
      this.messageTimer?.remove(false);
      this.stopBriefingVoice();
    });
    this.showMessage("Réunion d’urgence derrière la porte.\nApproche-toi et touche leur bureau pour écouter.", 4200);
  }

  update(): void {
    if (this.briefingOpen || this.phase === "hacking" || this.phase === "welcoming" || this.phase === "leaving") return;
    this.player.update((_fromX, targetX) => {
      if (!this.guardAway && targetX > 525) {
        this.player.targetX = 507;
        if (this.player.sprite.x >= 500) {
          this.showMessage("GARDE : Réunion d’urgence.\nMême l’espoir doit avoir un badge.", 2800);
          return false;
        }
      }
      return true;
    });
    if (!this.guardAway && this.player.sprite.x > 512) {
      this.player.sprite.setX(512).setVelocityX(0);
      this.player.stop();
    }
  }

  private label(x: number, y: number, text: string, size = 11, color = "#d4decd"): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, { fontFamily: "monospace", fontSize: `${size}px`, color, align: "center", lineSpacing: 4 }).setOrigin(0.5).setDepth(12);
  }

  private drawOffice(): void {
    const g = this.add.graphics();
    const r = (x: number, y: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(x, y, w, h);
    r(0, 64, 1240, 486, 0x263249);
    r(0, 350, 1240, 200, 0x334254);
    for (let x = 0; x < 1240; x += 48) {
      r(x, 350, 2, 200, 0x253448);
      r(x + 5, 356, 35, 2, 0x45576a);
    }
    for (let x = 35; x < 1240; x += 220) {
      r(x, 95, 150, 180, 0x141e30); r(x + 5, 100, 140, 168, 0x50637b);
      for (let k = 0; k < 7; k++) {
        const bx = x + 8 + k * 20, by = 175 - (k * 17 % 54);
        r(bx, by, 17, 90, 0x35445b);
        for (let wy = by + 8; wy < 260; wy += 17) r(bx + 5, wy, 3, 4, 0xb8ad88);
      }
      r(x + 72, 100, 4, 168, 0x1c293e); r(x + 5, 182, 140, 4, 0x1c293e);
      r(x + 5, 100, 140, 4, 0x7e8b96);
    }
    for (let x = 0; x < 1240; x += 22) {
      r(x, 550, 20, 3, 0x9baa95); r(x, 558, 2, 24, 0x172337);
    }
    this.label(180, 78, "UPLESS · SIÈGE DES DÉCISIONS TARDIVES", 10, "#ead9b1");
    this.label(185, 308, "ACCUEIL / SUPPORT", 13);
    this.label(832, 78, "RÉUNION D’URGENCE · HUIS CLOS", 12, "#ffc38b");
    this.label(830, 108, "ORDRE DU JOUR : ÉVITER LE PIRE AVANT 18 H", 9);
    this.label(170, 385, "PROCÉDURE DE SECOURS\nSans Wi-Fi : liaison locale\nConsole → HDMI → message", 10, "#e4d9b7");
    // Wi-Fi router: two antennas, tactile switch, cable and distinct status lamp.
    r(160, 465, 75, 38, 0x152034); r(164, 469, 67, 28, 0x617d81);
    r(165, 442, 4, 26, 0xa5b6af); r(224, 442, 4, 26, 0xa5b6af);
    r(178, 478, 21, 3, 0x243748); r(245, 485, 4, 65, 0xc1a36c);
    this.routerLight = this.add.rectangle(216, 482, 6, 6, 0x90dfab).setDepth(13);
    this.networkLabel = this.label(197, 424, "WI-FI : CONNECTÉ", 10, "#9be0b0");
    this.label(197, 523, "ROUTEUR · TOUCHER", 9);
    // Wired maintenance console sits outside the guarded meeting room.
    r(342, 432, 74, 55, 0x152034); r(348, 438, 62, 41, 0x244b53);
    r(374, 487, 10, 23, 0x7f9195); r(350, 509, 60, 6, 0x7f9195);
    r(416, 465, 103, 3, 0xc1a36c);
    this.label(379, 457, ">_ LOCAL", 10, "#b9e7c2");
    this.label(379, 533, "CONSOLE ÉCRAN", 10);
    // The guard and a physical door clearly separate lobby and committee.
    const doorArt = this.add.graphics();
    doorArt.fillStyle(0x142034).fillRect(-27, -65, 54, 130);
    doorArt.fillStyle(0x607b7b).fillRect(-22, -60, 44, 120);
    doorArt.fillStyle(0xb6c8b3).fillRect(10, -5, 4, 10);
    this.door = this.add.container(585, 485, [doorArt]).setDepth(8);
    this.label(585, 405, "ACCÈS RÉSERVÉ", 10, "#ffc38b");
    this.guard = this.person(542, 506, "guard");
    this.label(542, 448, "SÉCURITÉ", 9, "#f4d391");
    this.officeCat = this.pixelCat(478, 527).setDepth(14);
    this.label(473, 479, "MIMI", 9, "#f2c899");
    this.usbLabel = this.label(473, 563, "CLÉ USB ?", 8, "#b9dfad");
    this.monkey = createCompanionMonkey(this, 1144, 510).setVisible(false);
    // Screen and committee belong to the same room, with readable reactions.
    r(725, 150, 230, 154, 0x111c2e); r(730, 155, 220, 144, 0x345864);
    r(725, 150, 230, 3, 0x8caaa7);
    this.display = this.label(840, 225, "PLAN MISSILES : EN ATTENTE\n\nVote du conseil en cours\nBudget : 10 000 milliards", 11, "#d3e5d1");
    [742, 805, 872, 934].forEach((x, index) => {
      const person = this.person(x, 470, index === 2 ? "director" : "staff");
      this.staff.push(person);
      this.tweens.add({ targets: person, y: 468, duration: 850 + index * 130, yoyo: true, repeat: -1 });
    });
    r(700, 493, 290, 17, 0xa77f63); r(700, 493, 290, 3, 0xdbc29a);
    r(710, 510, 12, 40, 0x574859); r(968, 510, 12, 40, 0x574859);
    for (let x = 740; x < 980; x += 65) { r(x, 486, 12, 7, 0xddd7bd); r(x + 17, 488, 22, 3, 0x718b91); }
    this.directorLine = this.label(841, 352, "DIRECTEUR : « RESTEZ CALMES.\nJ’AI CRÉÉ UN GROUPE DE TRAVAIL. »", 10, "#f2c899");
    r(1110, 420, 68, 130, 0x111c2e);
    const exitLeaf = this.add.rectangle(0, 0, 56, 124, 0x4d7c71).setStrokeStyle(2, 0x91b49d);
    const exitHandle = this.add.rectangle(18, 5, 4, 10, 0xe6d5ab);
    const exitText = this.add.text(0, -5, "VERS\nLE DÉSERT", {fontFamily: "monospace", fontSize: "10px", color: "#d4decd", align: "center"}).setOrigin(0.5);
    this.exitDoor = this.add.container(1144, 488, [exitLeaf, exitHandle, exitText]).setDepth(16);
    this.label(1144, 397, "SORTIE →", 13, "#b9dfad");
    this.label(1030, 330, "SALLE DE PAUSE\nLe travail attendra.", 9);
    r(1011, 448, 36, 44, 0x172538); r(1016, 454, 26, 20, 0x7c9692); r(1000, 496, 60, 5, 0xb39876);
  }

  private person(x: number, y: number, role: "guard" | "staff" | "director"): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    const r = (px: number, py: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(px, py, w, h);
    const coat = role === "guard" ? 0x617e83 : role === "director" ? 0x856272 : 0x566780;
    r(-14, -20, 28, 42, 0x182237); r(-12, -18, 24, 34, coat);
    r(-10, 20, 8, 22, 0x182237); r(4, 20, 8, 22, 0x182237);
    r(-14, 39, 12, 4, 0x101a2b); r(4, 39, 12, 4, 0x101a2b);
    r(-13, -43, 26, 26, 0x182237); r(-10, -40, 20, 22, 0xd3a27e);
    r(-8, -39, 14, 5, 0xefc49a); r(-15, -13, 4, 29, coat); r(13, -13, 4, 29, coat);
    r(-6, -30, 3, 3, 0x182237); r(5, -30, 3, 3, 0x182237); r(-3, -23, 8, 2, 0x795b5d);
    r(-3, -16, 6, 10, 0xeee1c4); r(-1, -13, 3, 18, 0xb57b76);
    if (role === "guard") {
      r(-16, -46, 32, 7, 0x182237); r(-11, -52, 23, 8, coat); r(2, -48, 5, 3, 0xe1c78d);
      r(5, -9, 5, 6, 0xe1c78d); r(-8, -31, 19, 4, 0x263249);
    } else { r(-13, -45, 26, 7, role === "director" ? 0xa6a6a2 : 0x453c49); }
    return this.add.container(x, y, [g]).setDepth(10);
  }

  private createHud(): void {
    this.add.rectangle(180, 31, 344, 52, 0x101b2e).setStrokeStyle(2, 0x64817f).setScrollFactor(0).setDepth(100);
    this.label(0, 0, "", 10); // All HUD text uses the same pixel-friendly typeface.
    this.add.text(19, 14, "II · RÉUNION D’URGENCE", {fontFamily: "monospace", fontSize: "11px", color: "#eddbaf"}).setScrollFactor(0).setDepth(101);
    this.objective = this.add.text(19, 34, "1/3 · COUPER LE WI-FI", {fontFamily: "monospace", fontSize: "10px", color: "#b6d6c2"}).setScrollFactor(0).setDepth(101);
    const sound = this.add.text(320, 20, audio.isEnabled() ? "♪" : "×", {fontSize: "18px", color: "#eddbaf"}).setScrollFactor(0).setDepth(102).setInteractive({useHandCursor: true});
    sound.on("pointerdown", () => {
      const enabled = audio.toggle();
      sound.setText(enabled ? "♪" : "×");
      if (!enabled) this.stopWhispers?.();
    });
    this.message = this.add.text(180, 596, "", {
      fontFamily: "monospace", fontSize: "11px", color: "#f5e8ca", align: "center", lineSpacing: 5,
      backgroundColor: "#101b2e", padding: {x: 12, y: 10}, wordWrap: {width: 308},
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.briefingOpen) {
      if (screenY >= 594 && screenX >= 220) this.finishBriefing();
      else this.showBriefingLine(this.briefingIndex + 1);
      return;
    }
    if (this.phase === "hacking") {
      if (screenX >= 30 && screenX <= 330) {
        const choice = Math.floor((screenY - 236) / 49);
        if (choice >= 0 && choice < 3 && screenY <= 236 + choice * 49 + 38) this.chooseHack(choice);
        else if (screenY >= 465 && screenY <= 503) {
          this.phase = "offline";
          this.hackPanel?.destroy(true);
        }
      }
      return;
    }
    if (this.phase === "welcoming" || this.phase === "leaving") return;
    const p = this.cameras.main.getWorldPoint(screenX, screenY);
    audio.play("tap");
    if (this.hit(p, 478, 527, 30, 35)) { this.receiveUsb(); return; }
    if (this.hit(p, 197, 475, 58, 60)) { this.cutWifi(); return; }
    if (this.hit(p, 379, 471, 52, 64)) {
      if (!this.near(379)) return;
      if (this.phase === "connected") this.showMessage("CONSOLE : Pilotage distant actif.\nCoupe le Wi-Fi pour ouvrir le mode local.", 3200);
      else if (this.phase === "offline" && !this.hasUsb) this.showMessage("Il faut un fichier sur clé USB.\nLe chat près du garde a quelque chose…", 3000);
      else if (this.phase === "offline") this.openHack();
      else this.showMessage("Console : diversion diffusée.\nLe mensonge fonctionne en haute définition.", 2600);
      return;
    }
    if (this.hit(p, 555, 490, 58, 75)) {
      if (!this.near(555)) return;
      if (!this.guardAway) this.showMessage(this.phase === "connected"
        ? "GARDE : Personne n’entre. Ils décident\nqui sera responsable de ne rien décider."
        : "GARDE : Le Wi-Fi est mort. Je protège\nla porte jusqu’à la fin du deuil.", 3500);
      else this.player.moveTo(650, 524);
      return;
    }
    if (this.hit(p, 840, 225, 123, 85)) {
      this.showMessage(this.phase === "connected" ? "ÉCRAN : Plan de secours en chargement…\nDepuis mardi." : this.phase === "offline" ? "ÉCRAN : Réseau perdu.\nEntrée locale disponible à la console." : "ÉCRAN : CHAT HYPNOTIQUE.\nLe conseil ne voit plus que ses yeux.", 3100);
      return;
    }
    if (p.x > 1095 && p.y > 390 && p.y < 560) { this.leaveOffice(); return; }
    if (p.x > 695 && p.x < 990 && p.y > 320 && p.y < 540) {
      if (!this.briefingHeard && this.phase !== "diversion") {
        if (p.y < 480) {
          this.showMessage("Touche le bureau, en bas,\npour écouter discrètement la réunion.", 2400);
        } else if (Math.abs(this.player.sprite.x - 585) > 115) {
          this.showMessage("Approche-toi de la porte,\npuis touche le bureau derrière le garde.", 2600);
        } else {
          this.openBriefing();
        }
        return;
      }
      this.showMessage(this.phase === "diversion" ? "LE CONSEIL : Ces yeux… ce chat…\nOn vote pour une autre boucle. Unanimité." : "DIRECTEUR : Nous avons un plan.\nIl attend juste le mot de passe du Wi-Fi.", 3200);
      return;
    }
    this.player.moveTo(Phaser.Math.Clamp(p.x, 24, 1210), 524);
  }

  private hit(p: Phaser.Math.Vector2, x: number, y: number, rx: number, ry: number): boolean {
    return Math.abs(p.x - x) <= rx && Math.abs(p.y - y) <= ry;
  }

  private receiveUsb(): void {
    if (!this.near(478)) return;
    if (!this.briefingHeard) {
      this.showMessage("MIMI : Qu’est-ce qu’ils complotent ?\nÉcoute à la porte en touchant leur bureau.", 3500);
      return;
    }
    if (this.hasUsb || this.phase === "diversion") {
      this.showMessage(this.phase === "diversion" ? "MIMI : Miaou. Le monde est sauvé.\nMa carrière de vidéaste aussi." : "MIMI : Coupe le Wi-Fi, puis branche\nma clé à la console. Choisis ma vidéo !", 3500);
      return;
    }
    this.openBriefing("cat");
  }

  private grantUsb(): void {
    if (this.hasUsb || !this.briefingHeard) return;
    this.hasUsb = true;
    audio.play("cat");
    this.usbLabel.setText("USB EN POCHE");
    const key = this.add.graphics().setDepth(30);
    key.fillStyle(0xa8d1c4).fillRect(-5, -9, 10, 18);
    key.fillStyle(0xe6d5ab).fillRect(-3, -15, 6, 7);
    key.setPosition(this.officeCat.x, this.officeCat.y - 26);
    this.tweens.add({targets: key, x: this.player.sprite.x, y: this.player.sprite.y - 32, duration: 650, onComplete: () => key.destroy()});
    this.objective.setText(this.phase === "connected" ? "1/3 · COUPER LE WI-FI" : "2/3 · PIRATER L’ÉCRAN");
    this.showMessage("MIMI te donne une clé USB.\n« Ma vidéo hypnotique. Plus fort que le café. »", 4300);
  }

  private pixelCat(x: number, y: number, hypnotic = false): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    const r = (px: number, py: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(px, py, w, h);
    r(-17, -22, 34, 30, 0x202b3e); r(-14, -19, 28, 25, 0xd3a17a);
    r(-16, -30, 10, 12, 0x202b3e); r(6, -30, 10, 12, 0x202b3e);
    r(-13, -26, 5, 9, 0xe7b99a); r(8, -26, 5, 9, 0xe7b99a);
    r(-11, -17, 20, 5, 0xf3c791); r(-13, 6, 26, 14, 0x202b3e); r(-10, 6, 20, 11, 0xc38b6d);
    r(-10, 16, 7, 4, 0xf3c791); r(4, 16, 7, 4, 0xf3c791);
    r(13, 8, 10, 5, 0xc38b6d); r(20, 2, 4, 10, 0xc38b6d);
    r(-10, -12, 6, 5, 0x283b46); r(5, -12, 6, 5, 0x283b46);
    r(-2, -4, 5, 3, 0x8b5964); r(-4, 0, 3, 2, 0x283b46); r(3, 0, 3, 2, 0x283b46);
    const cat = this.add.container(x, y, [g]);
    if (hypnotic) {
      [-7, 8].forEach((eyeX) => {
        const spiral = this.add.graphics();
        spiral.lineStyle(1, 0xe7f4b2);
        spiral.beginPath();
        for (let i = 0; i <= 36; i++) {
          const a = i * 0.43, radius = i / 9;
          if (i === 0) spiral.moveTo(0, 0);
          else spiral.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
        }
        spiral.strokePath();
        const eye = this.add.container(eyeX, -10, [spiral]);
        cat.add(eye);
        this.tweens.add({targets: eye, angle: 360, duration: 1800, repeat: -1});
      });
    } else this.tweens.add({targets: cat, y: y - 2, duration: 900, yoyo: true, repeat: -1});
    return cat;
  }

  private near(x: number): boolean {
    if (Math.abs(this.player.sprite.x - x) <= 145) { this.player.stop(); return true; }
    this.player.moveTo(x < 525 || this.guardAway ? x - 35 : 505, 524);
    this.showMessage("Approche-toi, puis touche l’objet.", 1700);
    return false;
  }

  private cutWifi(): void {
    if (!this.near(197)) return;
    if (this.phase !== "connected") { this.showMessage("Wi-Fi coupé.\nLe câble local, lui, respire encore.", 2300); return; }
    this.phase = "offline";
    audio.play("wire");
    this.routerLight.setFillStyle(0xce6974);
    this.networkLabel.setText("WI-FI : HORS LIGNE").setColor("#f3ad9b");
    this.display.setText("LIAISON MISSILES INTERROMPUE\n\nORDRES NON TRANSMIS\nMode local : console →");
    this.directorLine.setText("DIRECTEUR : « PAS DE RÉSEAU, PAS DE PRIME ?!\nQUELQU’UN IMPRIME INTERNET ! »");
    this.objective.setText(this.hasUsb ? "2/3 · PIRATER L’ÉCRAN" : "2/3 · CLÉ USB DU CHAT");
    this.cameras.main.shake(140, 0.003);
    this.showMessage("Liaison coupée : les ordres ne partent plus.\nPirate l’écran pour détourner le garde.", 3400);
  }

  private openBriefing(kind: "meeting" | "cat" = "meeting"): void {
    this.briefingKind = kind;
    this.briefingOpen = true;
    this.player.stop();
    this.objective.setText(kind === "cat" ? "MIMI A UN PLAN…" : "DERRIÈRE LA PORTE… ÉCOUTER");
    const paper = this.add.rectangle(180, 501, 336, 254, 0x101b2e, 0.98).setStrokeStyle(2, 0xc19b75);
    this.briefingName = this.add.text(28, 390, "", {fontFamily: "monospace", fontSize: "12px", color: "#f2c899", fontStyle: "bold"});
    this.briefingText = this.add.text(28, 427, "", {fontFamily: "monospace", fontSize: "13px", color: "#e4ebd3", wordWrap: {width: 300}, lineSpacing: 8});
    const next = this.add.text(28, 608, "TOUCHER : SUITE", {fontFamily: "monospace", fontSize: "10px", color: "#b6d6c2"});
    const skip = this.add.text(254, 608, "PASSER →", {fontFamily: "monospace", fontSize: "10px", color: "#f2c899"});
    this.briefingPanel = this.add.container(0, 0, [paper, this.briefingName, this.briefingText, next, skip]).setScrollFactor(0, 0, true).setDepth(190);
    this.showBriefingLine(0);
  }

  private stopBriefingVoice(): void {
    this.briefingTimer?.remove(false);
    this.stopWhispers?.();
    this.stopWhispers = undefined;
  }

  private showBriefingLine(index: number): void {
    this.stopBriefingVoice();
    const lines = this.briefingKind === "cat" ? catPlanDialogue : officeDialogue;
    if (index >= lines.length) { this.finishBriefing(); return; }
    this.briefingIndex = index;
    const line = lines[index];
    this.briefingName.setText(line.speaker);
    this.briefingText.setText(line.text);
    const duration = Math.max(4000, line.text.length * 80);
    const advance = () => {
      if (this.briefingOpen && this.briefingIndex === index) this.showBriefingLine(index + 1);
    };
    this.briefingTimer = this.time.delayedCall(duration + 1000, advance);
    this.stopWhispers = audio.whisper(duration / 1000, line.pitch);
    if (this.briefingKind === "meeting" && index === 3) this.directorLine.setText("« 10 000 MILLIARDS POUR NOUS. »");
    if (this.briefingKind === "meeting" && index === 4) {
      this.directorLine.setText("LE CONSEIL : « OK ! MAKE ME UP AGAIN! »");
      this.staff.forEach((person, i) => this.tweens.add({targets: person, angle: i % 2 ? 8 : -8, duration: 180, yoyo: true, repeat: 3}));
    }
  }

  private finishBriefing(): void {
    this.briefingOpen = false;
    this.stopBriefingVoice();
    this.briefingPanel?.destroy(true);
    if (this.briefingKind === "cat") {
      this.grantUsb();
      return;
    }
    this.briefingHeard = true;
    this.objective.setText("PARLER À MIMI PRÈS DU GARDE");
    this.showMessage("Ils ont voté pour les missiles.\nDemande à Mimi ce qu’il en pense…", 4000);
  }

  private openHack(): void {
    if (!this.hasUsb || this.phase !== "offline") return;
    this.phase = "hacking";
    this.hackStep = 0;
    this.player.stop();
    const parts: Phaser.GameObjects.GameObject[] = [];
    parts.push(this.add.rectangle(180, 320, 360, 640, 0x0c1728, 0.94));
    parts.push(this.add.rectangle(180, 303, 332, 416, 0x1d3443).setStrokeStyle(2, 0x8da99b));
    this.hackTitle = this.add.text(30, 121, "", {fontFamily: "monospace", fontSize: "13px", color: "#e6d6ad", wordWrap: {width: 295}, lineSpacing: 6});
    parts.push(this.hackTitle);
    this.hackHint = this.add.text(30, 394, "", {fontFamily: "monospace", fontSize: "11px", color: "#a8c8b9", wordWrap: {width: 295}, lineSpacing: 5});
    parts.push(this.hackHint);
    for (let i = 0; i < 3; i++) {
      const option = this.add.text(30, 236 + i * 49, "", {
        fontFamily: "monospace", fontSize: "11px", color: "#e4ebd3", backgroundColor: "#365965",
        padding: {x: 9, y: 12}, fixedWidth: 300,
      });
      this.hackOptions[i] = option;
      parts.push(option);
    }
    const close = this.add.text(180, 481, "[ FERMER LA CONSOLE ]", {fontFamily: "monospace", fontSize: "11px", color: "#e6d6ad"}).setOrigin(0.5);
    parts.push(close);
    this.hackPanel = this.add.container(0, 0, parts).setScrollFactor(0, 0, true).setDepth(180);
    this.refreshHack();
  }

  private refreshHack(): void {
    const screens = [
      {title: "1/3 · CHOISIR LA LIAISON", options: ["Wi-Fi · disparu tragiquement", "HDMI · câble local", "Télépathie · service fermé"], hint: "La panne a libéré l’entrée locale.\nLe câble arrive directement à l’écran."},
      {title: "2/3 · FICHIER SUR LA CLÉ USB", options: ["Bilan_des_missiles.pdf", "Chat_hypnotique_boucle.mp4", "Veuillez_travailler.txt"], hint: "Mimi a préparé sa meilleure vidéo.\nSes yeux rendent les réunions inutiles."},
      {title: "3/3 · CIBLE DE DIFFUSION", options: ["Imprimante du sous-sol", "Mon écran uniquement", "Écran de la réunion"], hint: "Le garde et le conseil doivent voir\nla vidéo de Mimi sur le grand écran."},
    ];
    const screen = screens[this.hackStep];
    this.hackTitle.setText("CONSOLE LOCALE\n\n" + screen.title);
    this.hackOptions.forEach((option, i) => option.setText(screen.options[i]));
    this.hackHint.setText(screen.hint);
  }

  private chooseHack(choice: number): void {
    if (this.phase !== "hacking") return;
    const correct = [1, 1, 2];
    if (choice !== correct[this.hackStep]) {
      audio.play("danger");
      this.hackHint.setText(["Connexion impossible. Internet n’a\npas ressuscité. Essaie le câble.", "Ce fichier n’hypnotise personne.\nCherche la vidéo de Mimi sur la clé.", "Mauvaise cible. Le conseil ne lit\njamais ce qui vient du sous-sol."][this.hackStep]);
      return;
    }
    audio.play("confirm");
    this.hackStep++;
    if (this.hackStep < 3) this.refreshHack();
    else { this.hackPanel?.destroy(true); this.startDiversion(); }
  }

  private startDiversion(): void {
    this.phase = "diversion";
    this.display.setPosition(840, 174).setFontSize(10).setText("USB · CHAT HYPNOTIQUE\nLECTURE EN BOUCLE ∞").setColor("#ffe2a3");
    this.pixelCat(840, 253, true).setScale(1.7).setDepth(14);
    this.directorLine.setText("DIRECTEUR : « LES MISSILES ATTENDRONT.\nREMETTEZ LE CHAT… ENCORE… »");
    this.objective.setText("3/3 · PASSER LA PORTE");
    audio.play("danger");
    this.showMessage("GARDE : Je surveille juste la vidéo…\nCes yeux… Je ne peux plus regarder ailleurs.", 4200);
    this.tweens.add({targets: this.door, scaleX: 0.12, x: 610, duration: 750, delay: 400});
    this.tweens.add({targets: this.guard, x: 685, duration: 3500, delay: 600,
      onUpdate: () => this.guard.setAngle(Math.sin(this.time.now / 100) * 3),
      onComplete: () => {
        this.guard.setAngle(0);
        this.guardAway = true;
        this.objective.setText("3/3 · SORTIE À DROITE →");
        this.showMessage("La porte est libre. Tous hypnotisés.\nMême le garde ronronne. Passe !", 3500);
      },
    });
    this.staff.forEach((person, i) => {
      this.tweens.killTweensOf(person);
      this.tweens.add({targets: person, angle: i % 2 ? 7 : -7, y: person.y - 7, duration: 180, yoyo: true, repeat: 4, delay: i * 130});
    });
  }

  private leaveOffice(): void {
    if (!this.guardAway) { this.showMessage("Le garde bloque encore l’accès.\nCoupe le Wi-Fi, puis pirate l’écran.", 2800); return; }
    if (!this.near(1144)) return;
    if (!this.monkeyWelcomed) {
      this.phase = "welcoming";
      this.player.stop();
      audio.play("window");
      this.showMessage("La porte du fond s’ouvre…", 1600);
      this.tweens.add({
        targets: this.exitDoor, scaleX: 0.1, x: 1170, duration: 700, ease: "Sine.inOut",
        onComplete: () => {
          this.monkey.setVisible(true);
          audio.play("monkey");
          this.tweens.add({
            targets: this.monkey, x: 1100, duration: 800, ease: "Sine.out",
            onComplete: () => {
              this.monkeyWelcomed = true;
              this.phase = "diversion";
              this.objective.setText("TOUCHER LA PORTE POUR SORTIR →");
              this.showMessage("SINGE : Bienvenue ! J’attendais derrière.\nTouche la porte : on file avant la fin du chat !", 5000);
            },
          });
        },
      });
      return;
    }
    this.phase = "leaving";
    this.player.stop();
    this.tweens.add({targets: this.monkey, x: 1144, duration: 850, ease: "Sine.inOut"});
    const save = loadSave();
    writeSave({...save, lastLevel: 2, unlockedLevel: Math.max(save.unlockedLevel, 3)});
    audio.play("portal");
    this.showMessage("SINGE : Viens, je t’accompagne dehors.\nMimi occupe le conseil. À nous le désert !", 2500);
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(450, 16, 27, 46);
      this.time.delayedCall(450, () => this.scene.start("LevelCompleteScene", {completedLevel: 2}));
    });
  }

  private showMessage(text: string, duration: number): void {
    this.messageTimer?.remove(false);
    this.message.setText(text).setAlpha(1);
    this.messageTimer = this.time.delayedCall(duration, () => this.message.setAlpha(0));
  }
}





