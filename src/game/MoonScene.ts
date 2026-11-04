import Phaser from "phaser";
import { addReliefBlock, addWorldGrain } from "./artEngine";
import { audio } from "./audio";
import { createEntityImage } from "./entityArt";
import { TouchInput } from "./input";
import { icon, t } from "./language";
import { PlayerController } from "./player";
import { loadSave, writeSave } from "./types";
import { createBeachCharacter } from "./beachArt";
import { createCompanionMonkey } from "./companionArt";
import { createOriginalBeachBoat } from "./boatArt";

type MoonTarget = {
  id: "alien" | "device" | "ice" | "gate" | "giraffe" | "pinkwindkis";
  x: number;
  y: number;
  radius: number;
  action: () => void;
};

export class MoonScene extends Phaser.Scene {
  private player!: PlayerController;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private inputController?: TouchInput;
  private messagePanel!: Phaser.GameObjects.Rectangle;
  private messageText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;
  private targets: MoonTarget[] = [];
  private hasIce = false;
  private gateInspected = false;
  private generatorKnown = false;
  private laserOffered = false;
  private hasWater = false;
  private alienMet = false;
  private deviceHelped = false;
  private ending = false;
  private arriving = false;
  private gate!: Phaser.GameObjects.Container;
  private gateCore!: Phaser.GameObjects.Ellipse;
  private deviceSmoke!: Phaser.GameObjects.Container;
  private alien!: Phaser.GameObjects.Container;

  constructor() {
    super("MoonScene");
  }

  create(): void {
    this.targets = [];
    this.hasIce = false;
    this.gateInspected = false;
    this.generatorKnown = false;
    this.laserOffered = false;
    this.hasWater = false;
    this.deviceHelped = false;
    this.alienMet = false;
    this.ending = false;
    this.arriving = true;
    this.physics.world.setBounds(0, 0, 1520, 760);
    this.cameras.main.setBounds(0, 0, 1520, 760).setBackgroundColor("#111827");
    this.drawMoon();
    this.createPlatforms();
    this.createArrivalBoat();
    this.createAtmosphereDevice();
    this.createAlien();
    this.createIceCrater();
    this.createStargate();

    this.player = new PlayerController(this, 80, 520);
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
    this.animateArrival();
  }

  update(): void {
    if (!this.ending && !this.arriving) this.player.update(() => true);
  }

  private drawMoon(): void {
    const sky = this.add.graphics().setScrollFactor(0);
    sky.fillGradientStyle(0x10182f, 0x10182f, 0x2a2147, 0x5c3c69, 1);
    sky.fillRect(0, 0, 360, 640);
    addWorldGrain(this, "moon", 0.1);
    for (let i = 0; i < 70; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 360), Phaser.Math.Between(40, 520), Phaser.Math.FloatBetween(0.7, 2), 0xffffff, Phaser.Math.FloatBetween(0.25, 0.8)).setScrollFactor(0);
    }
    const earth=this.add.graphics().setScrollFactor(0);
    earth.fillStyle(0x83b8df,0.09).fillCircle(288,108,60);
    earth.fillStyle(0x203c60).fillCircle(288,108,49);
    earth.fillStyle(0x365e80).fillCircle(283,104,44);
    earth.fillStyle(0xa93443,0.9).fillEllipse(256,111,21,37);
    earth.fillStyle(0xde5a57,0.65).fillEllipse(253,106,7,22);
    earth.lineStyle(2,0x91b8ca,0.7).strokeCircle(288,108,49);
    // Africa faces the viewer, from its Mediterranean coast to the Cape.
    const africa=[
      270,83,279,79,294,80,302,86,303,94,314,103,
      306,106,305,118,298,128,293,141,288,145,
      283,135,281,124,276,119,275,110,263,108,
      258,100,261,90,
    ];
    earth.fillStyle(0xbda479).fillPoints(
      Array.from({length:africa.length/2},(_,i)=>new Phaser.Geom.Point(africa[i*2],africa[i*2+1])),true);
    earth.fillStyle(0xd8bf8b).fillEllipse(281,94,35,16);
    earth.fillStyle(0x658061).fillEllipse(286,113,21,15);
    earth.fillStyle(0x8f976b).fillTriangle(283,120,300,118,289,140);
    earth.lineStyle(1,0x46687a).lineBetween(298,89,296,103);
    earth.fillStyle(0xa8ad7d).fillEllipse(309,131,4,12);
    earth.fillStyle(0xb6ad8a);
    earth.beginPath();earth.moveTo(297,74);earth.lineTo(306,69);earth.lineTo(320,78);
    earth.lineTo(328,94);earth.lineTo(314,92);earth.lineTo(305,82);earth.closePath();earth.fillPath();
    earth.fillStyle(0xc8b38a).fillTriangle(306,90,319,96,313,105);
    earth.lineStyle(3,0xf0e9d8,0.55).beginPath();
    earth.arc(282,104,36,3.7,4.7);earth.strokePath();
    earth.lineStyle(2,0xf0e9d8,0.45).beginPath();
    earth.arc(283,106,36,0.6,1.5);earth.strokePath();
    earth.fillStyle(0x131828,0.18).fillEllipse(320,111,25,65);
    const trail=this.add.graphics().setScrollFactor(0);
    trail.fillStyle(0xe68b64,0.08).fillTriangle(104,150,9,204,116,179);
    trail.fillStyle(0xf3ad78,0.17).fillTriangle(104,150,27,191,115,174);
    trail.lineStyle(4,0xf2b382,0.3).lineBetween(39,185,101,158);
    trail.lineStyle(2,0xffdfaa,0.55).lineBetween(58,177,106,156);
    const asteroid=this.add.graphics().setScrollFactor(0);
    asteroid.fillStyle(0xb66b55,0.1).fillEllipse(102,160,110,55);
    asteroid.fillStyle(0x302d39);
    asteroid.beginPath();
    asteroid.moveTo(65,152);asteroid.lineTo(78,132);asteroid.lineTo(103,128);
    asteroid.lineTo(128,141);asteroid.lineTo(140,160);asteroid.lineTo(125,180);
    asteroid.lineTo(96,188);asteroid.lineTo(72,174);asteroid.closePath();asteroid.fillPath();
    asteroid.fillStyle(0x8c7c7b).fillTriangle(78,132,103,128,96,157);
    asteroid.fillStyle(0x695d66).fillTriangle(103,128,128,141,96,157);
    asteroid.fillStyle(0x514552).fillTriangle(96,157,125,180,72,174);
    asteroid.fillStyle(0xaa9690).fillTriangle(78,132,96,157,65,152);
    for(const crater of [{x:113,y:149,r:9},{x:84,y:164,r:7},{x:109,y:176,r:4}]){
      asteroid.fillStyle(0x252333).fillEllipse(crater.x,crater.y,crater.r*2,crater.r*1.3);
      asteroid.lineStyle(2,0xb39a8c,0.65);
      asteroid.beginPath();asteroid.arc(crater.x,crater.y,crater.r,Math.PI,Math.PI*1.7);asteroid.strokePath();
    }
    asteroid.lineStyle(1,0xd39971,0.7).lineBetween(100,134,98,146);
    asteroid.lineBetween(98,146,104,158);
    // A slow approach toward Earth, with the wake extending away from it.
    this.tweens.add({targets:[asteroid,trail],x:22,y:-6,duration:28000,ease:"Linear"});

    for (let x = 0; x < 1520; x += 160) {
      this.add.ellipse(x + 72, 585, 245, 70, 0xaeb4c6, 0.92);
      this.add.ellipse(x + 35, 615, 280, 55, 0x777f97, 0.25);
    }
    [210, 420, 700, 980, 1280].forEach((x, index) => {
      this.add.ellipse(x, 548 + (index % 2) * 9, 86, 25, 0x565d70, 0.32).setStrokeStyle(2, 0xdce3f3, 0.16);
    });
    const relief = this.add.graphics().setDepth(3);
    for (let i = 0; i < 115; i++) {
      const x = (i * 137 + 31) % 1520;
      const y = 557 + (i * 19) % 74;
      relief.fillStyle(i % 3 ? 0x626b81 : 0xc3c8d3, 0.6);
      relief.fillRect(x, y, 3 + i % 7, 2 + i % 3);
    }
    for (const x of [350, 890, 1170, 1450]) {
      relief.fillStyle(0x40495e, 0.8).fillEllipse(x, 544, 42, 12);
      relief.fillStyle(0x939db0).fillTriangle(x-18,542,x-7,524,x+12,542);
      relief.fillStyle(0xc5ccd6).fillTriangle(x-7,524,x+12,542,x+1,541);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.add(addReliefBlock(this, 760, 580, 1520, 60, 0x8d94aa, { texture: "moon", stroke: 0xdce3f3, strokeAlpha: 0.42, depth: 2 }));
  }

  private createArrivalBoat(): void {
    const ship=this.add.graphics().setDepth(9);
    ship.fillStyle(0x111a28,0.35).fillEllipse(207,548,340,16);
    // Both landing pads share the same baseline and attach beneath the hull.
    for(const x of [105,285]){
      ship.lineStyle(15,0x202d3b).lineBetween(x,489,x,535);
      ship.lineStyle(8,0x8b9ca7).lineBetween(x,490,x,535);
      ship.lineStyle(3,0xe8eee9).lineBetween(x-2,495,x-2,530);
      ship.fillStyle(0x202d3b).fillRoundedRect(x-30,535,60,14,4);
      ship.fillStyle(0x81eee1).fillRect(x-21,539,42,3);
    }
    ship.fillStyle(0x202733);
    ship.fillRoundedRect(25,414,80,61,14);
    ship.fillStyle(0xf5cf62).fillRoundedRect(29,424,13,41,5);
    ship.fillStyle(0x0e1622);
    ship.beginPath();
    ship.moveTo(42,431);ship.lineTo(305,431);ship.lineTo(380,471);
    ship.lineTo(330,496);ship.lineTo(71,496);ship.lineTo(42,477);
    ship.closePath();ship.fillPath();
    ship.fillStyle(0xe8e8de);
    ship.beginPath();
    ship.moveTo(52,431);ship.lineTo(300,431);ship.lineTo(380,471);
    ship.lineTo(85,471);ship.closePath();ship.fillPath();
    ship.lineStyle(3,0x8b9da8).lineBetween(85,474,354,474);
    ship.fillStyle(0xadb7bc).fillRoundedRect(110,397,183,49,12);
    ship.fillStyle(0x323a44).fillRoundedRect(125,405,151,30,7);
    ship.fillStyle(0x8a9398).fillRoundedRect(133,410,134,7,3);
    ship.fillStyle(0xd4d8d4).fillTriangle(180,398,239,362,273,398);
    ship.fillStyle(0x586b79).fillTriangle(193,396,239,370,260,396);
    for(const x of [80,110,140]){
      ship.fillStyle(0x66828d).fillRoundedRect(x,480,17,5,2);
    }
    // Open airlock, luminous interior and ramp on the near side.
    ship.fillStyle(0x647887).fillRoundedRect(214,442,36,51,6);
    ship.fillStyle(0x090f19).fillRoundedRect(219,446,26,43,4);
    ship.fillStyle(0xf8dfaa).fillRect(224,450,16,35);
    ship.fillStyle(0x536979);
    ship.beginPath();ship.moveTo(217,489);ship.lineTo(247,489);
    ship.lineTo(278,546);ship.lineTo(228,546);ship.closePath();ship.fillPath();
    ship.lineStyle(3,0xc5d4d6).lineBetween(217,489,228,546);
    ship.lineBetween(247,489,278,546);
    for(let step=1;step<6;step++){
      const progress=step/6;
      ship.lineStyle(2,0x91cec9).lineBetween(217+11*progress,489+57*progress,247+31*progress,489+57*progress);
    }
    this.add.text(184,420,t("SPATIOPORT LUNAIRE","LUNAR SPACEPORT"),{
      fontFamily:"monospace",fontSize:"9px",color:"#b8fff0",
    }).setOrigin(0.5).setDepth(11);
  }

  private animateArrival():void {
    this.player.stop();
    this.player.sprite.setVisible(false);
    this.player.sprite.body!.enable=false;
    this.cameras.main.stopFollow();
    this.cameras.main.setScroll(0,0);
    this.showMessage(t("SPATIOPORT LUNAIRE\nApproche autorisée. Essayez de garder le bâtiment entier.","LUNAR SPACEPORT\nLanding cleared. Please spare the building."),3500);
    const craft=createOriginalBeachBoat(this,190,-180);
    craft.algae.setVisible(false);
    craft.boat.setDepth(14).setScale(0.5).setAngle(0);
    audio.play("portal");
    this.tweens.add({
      targets:craft.boat,y:352,duration:2800,ease:"Sine.out",
      onComplete:()=>{
        audio.play("bridge");
        this.cameras.main.shake(180,0.003);
        // The dock receives the craft before the passengers reach its airlock.
        this.tweens.add({targets:craft.boat,y:404,scale:0.38,alpha:0,duration:900,
          onComplete:()=>{
            craft.boat.destroy(true);
            const passengers=[
              this.player.sprite,
              createBeachCharacter(this,0,0,"giraffe"),
              createCompanionMonkey(this,0,0),
              createBeachCharacter(this,0,0,"penguin"),
            ];
            passengers.forEach((person,index)=>{
              if(index===1)person.setScale(-1,1);
              const offset=index===1?44:0;
              person.setPosition(232,477-offset).setVisible(false).setDepth(12);
              this.time.delayedCall(index*950,()=>{
                person.setVisible(true);
                this.tweens.add({targets:person,x:255,y:535-offset,duration:850,ease:"Sine.inOut",
                  onComplete:()=>{
                    this.tweens.add({targets:person,x:index===1?165:310+index*48,y:index===1?516:index===0?530:535-offset,duration:750,
                      onComplete:()=>{
                        if(index!==passengers.length-1)return;
                        this.player.sprite.body!.enable=true;
                        this.player.sprite.setDepth(20);
                        this.arriving=false;
                        this.targets.push({id:"giraffe",x:165,y:500,radius:65,action:()=>this.talkGiraffe()});
                        this.targets.push({id:"pinkwindkis",x:454,y:523,radius:40,action:()=>this.talkPinkwindkis()});
                        const coffee=this.add.graphics().setDepth(19);
                        coffee.fillStyle(0x34404a).fillRoundedRect(185,531,31,18,4);
                        coffee.fillStyle(0x89e8c3).fillCircle(192,540,3);
                        coffee.fillStyle(0xc7b391).fillRect(194,520,16,12);
                        coffee.lineStyle(2,0xc7b391).strokeCircle(212,525,4);
                        this.cameras.main.startFollow(this.player.sprite,true,0.08,0.08,-55,50).setDeadzone(90,180);
                        this.showMessage(t("PINKWINDKIS : Tiens, c’est un astéroïde de niveau 6. J’espère qu’ils l’ont détecté, car le dernier que j’ai vu a fait la révolution.", "PINKWINDKIS: A level 6 asteroid. I hope they detected it. The last one I saw started a revolution."),8500);
                      },
                    });
                  },
                });
              });
            });
          },
        });
      },
    });
  }

  private createAtmosphereDevice(): void {
    const device = createEntityImage(this, "moonDevice").setScale(0.96);
    this.deviceSmoke = this.add.container(0, -48, [
      this.add.circle(-24, 0, 16, 0xbff7ff, 0.25),
      this.add.circle(0, -12, 22, 0xdffcff, 0.22),
      this.add.circle(26, 2, 15, 0xffffff, 0.18),
    ]);
    this.tweens.add({ targets: this.deviceSmoke.list, y: "-=16", alpha: 0.08, duration: 900, yoyo: true, repeat: -1 });
    this.add.container(620, 462, [device, this.deviceSmoke]).setDepth(12);
    this.targets.push({ id: "device", x: 620, y: 500, radius: 95, action: () => this.inspectDevice() });
  }

  private createAlien(): void {
    const alien = createEntityImage(this, "moonAlien").setScale(0.9);
    this.alien = this.add.container(790, 490, [alien]).setDepth(13);
    this.tweens.add({ targets: this.alien, y: 492, duration: 780, yoyo: true, repeat: -1 });
    this.targets.push({ id: "alien", x: 790, y: 500, radius: 92, action: () => this.talkAlien() });
  }

  private createIceCrater(): void {
    createEntityImage(this, "iceCrater", 1040, 535).setScale(1.05).setDepth(10);
    this.add.text(1040, 576, t("cratère glacé", "ice crater"), { fontSize: "10px", color: "#eef6ff", fontStyle: "bold" }).setOrigin(0.5);
    this.targets.push({ id: "ice", x: 1040, y: 536, radius: 72, action: () => this.collectIce() });
  }

  private createStargate(): void {
    const gateArt = createEntityImage(this, "stargate").setScale(1.08);
    this.gateCore = this.add.ellipse(0, -4, 94, 142, 0x8eeaff, 0.18).setStrokeStyle(3, 0xffffff, 0.18);
    const sparks = [0, 1, 2, 3, 4, 5, 6].map((i) =>
      this.add.rectangle(Math.cos(i) * 72, Math.sin(i * 1.7) * 88 - 4, 5, 38, 0x8eeaff, 0.62).setAngle(i * 31),
    );
    this.gate = this.add.container(1335, 458, [gateArt, this.gateCore, ...sparks]).setDepth(11);
    this.tweens.add({ targets: sparks, alpha: 0.05, duration: 160, yoyo: true, repeat: -1 });
    this.targets.push({ id: "gate", x: 1335, y: 486, radius: 130, action: () => this.inspectGate() });
  }

  private createHud(): void {
    this.add.rectangle(180, 27, 332, 42, 0x111827, 0.9).setScrollFactor(0).setDepth(100);
    this.add.text(27, 18, t("NIV. 5", "LV. 5"), { fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setScrollFactor(0).setDepth(101);
    this.objectiveText = this.add.text(328, 18, t("EXPLORER", "EXPLORE"), { fontSize: "12px", color: "#ffffff", fontStyle: "bold" }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    this.messagePanel = this.add.rectangle(180, 250, 326, 122, 0x111827, 0.94).setStrokeStyle(3, 0x8eeaff, 0.35).setScrollFactor(0).setDepth(109).setAlpha(0);
    this.messageText = this.add.text(180, 250, "", {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#eef6ff",
      fontStyle: "bold",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 292 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
  }

  private handleTap(screenX: number, screenY: number): void {
    if (this.ending || this.arriving) return;
    const world = this.cameras.main.getWorldPoint(screenX, screenY);
    const target = this.targets.find(candidate => Phaser.Math.Distance.Between(world.x,world.y,candidate.x,candidate.y)<candidate.radius);
    if(target){
      if(Math.abs(this.player.sprite.x-target.x)>160){
        this.player.moveTo(target.x-65,520);
        this.showMessage(t("Approche-toi, puis touche pour examiner.", "Move closer, then tap to inspect."),1800);
      }else{
        this.player.stop();
        target.action();
      }
      return;
    }
    audio.play("tap");
    this.player.moveTo(world.x, world.y);
  }

  private handleDoubleTap(screenX: number, screenY: number): void {
    this.handleTap(screenX,screenY);
  }

  private talkAlien(): void {
    if(this.deviceHelped){this.inspectGate();return;}
    if(!this.alienMet){
      this.alienMet=true;
      this.showMessage(t("ALIEN : Service après-vente lunaire. Vous avez rendez-vous ?\nTOI : On cherche Origine.\nALIEN : Alors il faut remettre la porte en marche. Examinez le générateur.", "ALIEN: Lunar support. Appointment?\nYOU: We seek Origine.\nALIEN: Check the generator to restart the gate."),6500);
      return;
    }
    if (!this.hasWater) {
      this.showMessage(icon("👽", "Alien : calcul en cours…\nIl manque de l’eau pour l’atmosphère.", "Alien: computing…\nWater is missing for the atmosphere."), 2600);
      this.objectiveText.setText(icon("🧊", "GLACE", "ICE"));
      return;
    }
    this.helpAlien();
  }

  private inspectDevice(): void {
    if(this.deviceHelped){this.inspectGate();return;}
    if (!this.hasWater) {
      this.showMessage(icon("⚙", "L’appareil fabrique atmosphère et fumée.\nIl clignote : EAU MANQUANTE.", "The device makes atmosphere and smoke.\nIt blinks: WATER MISSING."), 2600);
      this.objectiveText.setText(icon("🧊", "CRATÈRE", "CRATER"));
      return;
    }
    this.helpAlien();
  }

  private collectIce(): void {
    if(this.deviceHelped){this.showMessage(t("Le générateur a reçu sa réserve de glace.", "The generator has its ice supply."),2200);return;}
    if(!this.generatorKnown){
      this.showMessage(t("Une couche de glace bleutée au fond du cratère.\nIl faudrait une raison pour y mettre les mains.", "Blue ice lines the crater.\nBetter find a reason to collect it."),3200);
      return;
    }
    if (this.hasIce || this.hasWater) {
      this.showMessage(icon("🧊", "Tu as déjà la glace lunaire.", "You already have the moon ice."), 1200);
      return;
    }
    this.hasIce = true;
    audio.play("flower");
    this.objectiveText.setText(t("PINKWINDKIS","PINKWINDKIS"));
    this.showMessage(t("Tu récupères de la glace. Il faut la faire fondre.\nPinkwindkis a peut-être une idée…","You collect ice. It needs melting.\nPerhaps Pinkwindkis has an idea…"),3500);
  }

  private talkGiraffe():void {
    if(!this.gateInspected){
      this.showMessage(t("GIRAFE : Un instant, je chauffe l’eau de mon café.","GIRAFFE: A moment, I am heating water for my coffee."),3000);
      return;
    }
    this.generatorKnown=true;
    this.showMessage(t("TOI : La porte a besoin d’eau. Tu nous prêtes ton générateur ?\nGIRAFE : Mon générateur atomique ? Non. Je chauffe l’eau de mon café avec.\nUPLESS : Mais comment on peut utiliser toute cette énergie seulement pour chauffer de l’eau !\nGIRAFE : Le café d’abord. Voyez avec Pinkwindkis.","YOU: The gate needs water. May we borrow your generator?\nGIRAFFE: My atomic generator? No. It heats my coffee.\nUPLESS: How can you use all that energy just to heat water!\nGIRAFFE: Coffee first. Ask Pinkwindkis."),11000);
    this.objectiveText.setText(t("PINKWINDKIS","PINKWINDKIS"));
  }

  private talkPinkwindkis():void {
    if(!this.generatorKnown){
      this.showMessage(t("PINKWINDKIS : La girafe surveille sa tasse comme un réacteur nucléaire.","PINKWINDKIS: The giraffe guards that cup like a nuclear reactor."),3500);
      return;
    }
    if(this.hasWater||this.deviceHelped){
      this.showMessage(t("PINKWINDKIS : Les 33 milliards, je vous envoie la facture où ?","PINKWINDKIS: Where should I send the bill for 33 billion?"),3500);
      return;
    }
    if(!this.laserOffered){
      this.laserOffered=true;
      this.showMessage(t("PINKWINDKIS : J’ai la solution. Je peux donner mon sabre laser pour le bien de l’humanité… et 33 milliards de crédits. Apportez la glace.","PINKWINDKIS: I have a solution. My lightsaber, for humanity… and 33 billion credits. Bring the ice."),7000);
      this.objectiveText.setText(t("CHERCHER DE LA GLACE","FIND ICE"));
      return;
    }
    if(!this.hasIce){
      this.showMessage(t("PINKWINDKIS : Il manque la glace. Le sabre, lui, est chaud.","PINKWINDKIS: We still need ice. The saber is warm already."),3500);
      return;
    }
    this.hasIce=false;
    this.hasWater=true;
    audio.play("confirm");
    this.showMessage(t("Pinkwindkis fait fondre la glace avec son sabre.\nPINKWINDKIS : Humanité sauvée. Paiement en attente.","Pinkwindkis melts the ice with his saber.\nPINKWINDKIS: Humanity saved. Payment pending."),5500);
    this.objectiveText.setText(t("EAU POUR L’ALIEN","WATER FOR THE ALIEN"));
  }

  private helpAlien(): void {
    if(!this.hasWater)return;
    if (this.deviceHelped) {
      this.inspectGate();
      return;
    }
    this.deviceHelped = true;
    this.ending = true;
    this.player.stop();
    this.cameras.main.stopFollow();
    this.cameras.main.pan(1280,380,1400,Phaser.Math.Easing.Sine.InOut);
    this.hasIce = false;
    this.hasWater = false;
    audio.play("bridge");
    this.objectiveText.setText(icon("✦", "PORTE", "GATE"));
    this.showMessage(t("Tu donnes l’eau à l’alien.\nIl programme le dispositif.","You give the water to the alien.\nIt programs the device."),2600);
    this.tweens.add({ targets: this.deviceSmoke.list, alpha: 0.45, scale: 1.4, duration: 650, yoyo: true, repeat: 2 });
    this.time.delayedCall(1700, () => this.openThenBreakGate());
  }

  private inspectGate(): void {
    this.gateInspected=true;
    if (!this.deviceHelped) {
      this.showMessage(t("La porte affiche : EAU LIQUIDE NÉCESSAIRE.\nTOI : La girafe chauffait quelque chose près du spatioport…","The gate reads: LIQUID WATER REQUIRED.\nYOU: The giraffe was heating something near the spaceport…"),4200);
      this.objectiveText.setText(t("PARLER À LA GIRAFE","TALK TO THE GIRAFFE"));
      return;
    }
    this.showMessage(icon("♨", "La porte sent le brûlé cosmique.", "The gate smells like cosmic burning."), 1600);
  }

  private openThenBreakGate(): void {
    audio.play("portal");
    this.showMessage(icon("✦", "La porte stellaire s’ouvre !", "The stargate opens!"), 1600);
    this.gateCore.setFillStyle(0x8eeaff, 0.75).setStrokeStyle(4, 0xffffff, 0.8);
    this.cameras.main.shake(400, 0.006);
    this.tweens.add({ targets: this.gate, scale: 1.12, duration: 320, yoyo: true, repeat: 2 });
    for (let i = 0; i < 14; i += 1) {
      const spark = this.add.rectangle(1330 + Phaser.Math.Between(-45, 45), 494 + Phaser.Math.Between(-70, 70), 4, 30, 0x8eeaff).setDepth(30).setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({ targets: spark, x: spark.x + Phaser.Math.Between(-80, 80), y: spark.y + Phaser.Math.Between(-80, 80), alpha: 0, duration: 700, onComplete: () => spark.destroy() });
    }
    this.time.delayedCall(1800, () => {
      audio.play("danger");
      this.gateCore.setFillStyle(0x22111d, 0.82).setStrokeStyle(4, 0xff4f8b, 0.35);
      this.cameras.main.shake(650, 0.012);
      this.showMessage(icon("⚠", "Puis… panne générale.", "Then… total system failure."), 1300);
      this.time.delayedCall(1050, () => this.bigBangBoom());
    });
  }

  private bigBangBoom(): void {
    audio.play("ogre");
    this.cameras.main.flash(500, 255, 230, 120);
    this.cameras.main.shake(1100, 0.024);
    const boom = this.add.text(1330, 392, "BA DA\nBOUM!!!", {
      fontFamily: "monospace",
      fontSize: "42px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      stroke: "#ff4f8b",
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(80).setScale(0.2);
    const shockwave = this.add.circle(1330, 494, 20, 0xffd36a, 0.25).setStrokeStyle(6, 0xffffff, 0.85).setDepth(75);
    const burst = this.add.circle(1330, 494, 55, 0xff4f8b, 0.35).setDepth(74);
    this.tweens.add({ targets: boom, scale: 1.15, angle: 4, duration: 420, ease: "Back.out" });
    this.tweens.add({ targets: shockwave, scale: 8, alpha: 0, duration: 1050, ease: "Sine.out", onComplete: () => shockwave.destroy() });
    this.tweens.add({ targets: burst, scale: 3.8, alpha: 0, duration: 780, ease: "Sine.out", onComplete: () => burst.destroy() });
    this.tweens.add({ targets: this.gate, scale: 1.35, angle: 9, duration: 120, yoyo: true, repeat: 6 });
    this.time.delayedCall(1550, () => {
      boom.destroy();
      this.collapseIntoBlackHole();
    });
  }

  private collapseIntoBlackHole():void {
    this.ending=true;
    this.player.stop();
    this.player.sprite.body!.enable=false;
    this.messageTimer?.remove(false);
    this.tweens.killAll();
    const camera=this.cameras.main;
    const worldObjects=this.children.list.filter(object=>
      (object as Phaser.GameObjects.Container).depth<100,
    ) as Phaser.GameObjects.Container[];
    // Convert sky objects to world positions before moving the camera.
    for(const object of worldObjects){
      if(object.scrollFactorX===0){
        object.x+=camera.scrollX;
        object.y+=camera.scrollY;
        object.setScrollFactor(1);
      }
    }
    camera.stopFollow();
    camera.pan(760,380,900,Phaser.Math.Easing.Sine.InOut);
    camera.zoomTo(0.5,900);
    this.showMessage(t("La porte s’effondre sur elle-même…\nTout est aspiré !","The gate collapses inward…\nEverything is being pulled in!"),5200);
    const ring=this.add.ellipse(1335,458,145,100,0x8758d5,0.4).setStrokeStyle(6,0xffc993).setDepth(90);
    const hole=this.add.circle(1335,458,47,0x020108).setDepth(91);
    this.tweens.add({targets:ring,scale:1.7,angle:360,duration:1200,repeat:3});
    audio.play("portal");
    worldObjects.forEach((object,index)=>{
      const fromX=object.x,fromY=object.y;
      const scaleX=object.scaleX,scaleY=object.scaleY,angle=object.angle;
      const delay=900+(index%9)*160;
      this.tweens.addCounter({from:0,to:1,delay,duration:3300,ease:"Sine.in",onUpdate:tween=>{
        const progress=tween.getValue()??0;
        const swirl=Math.sin(progress*Math.PI)*65;
        object.setPosition(fromX+(1335-fromX)*progress+Math.sin(progress*8)*swirl,fromY+(458-fromY)*progress-Math.cos(progress*8)*swirl);
        object.setScale(scaleX*(1-progress),scaleY*(1-progress));
        object.setAngle(angle+progress*360);
      },onComplete:()=>object.setVisible(false)});
    });
    this.time.delayedCall(5700,()=>{
      this.tweens.killTweensOf(ring);
      this.tweens.add({targets:[ring,hole],scale:0,alpha:0,duration:700,
        onComplete:()=>this.showCredits()});
    });
  }

  private showCredits(): void {
    this.ending = true;
    this.inputController?.destroy();
    const save = loadSave();
    writeSave({ ...save, lastLevel: 5, unlockedLevel: Math.max(save.unlockedLevel, 5) });
    this.cameras.main.fadeOut(700, 10, 12, 24);
    this.time.delayedCall(750, () => {
      this.cameras.main.fadeIn(700, 10, 12, 24);
      this.children.removeAll();
      this.cameras.main.stopFollow();
      this.cameras.main.setScroll(0, 0).setZoom(1);
      this.cameras.main.setBackgroundColor("#0b1024");
      this.add.rectangle(180, 320, 360, 640, 0x0b1024);
      for (let i = 0; i < 55; i += 1) {
        this.add.circle(Phaser.Math.Between(0, 360), Phaser.Math.Between(0, 640), Phaser.Math.FloatBetween(0.8, 2), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.75));
      }

      const credits = this.add.container(180, 720);
      const titleStyle = { fontFamily: "monospace", fontSize: "34px", color: "#ffd36a", fontStyle: "bold" };
      const smallStyle = { fontFamily: "monospace", fontSize: "14px", color: "#b8c5ff", align: "center", lineSpacing: 8 };
      credits.add([
        this.add.text(0, 0, "UPLESS", titleStyle).setOrigin(0.5),
        this.add.text(0, 48, t("GÉNÉRIQUE DE FIN", "END CREDITS"), { fontFamily: "monospace", fontSize: "16px", color: "#e8eeff", fontStyle: "bold", letterSpacing: 2 }).setOrigin(0.5),
        this.add.text(0, 115, t("AVEC", "WITH"), { fontFamily: "monospace", fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setOrigin(0.5),
        this.add.text(0, 154, t("LE HÉROS\nLA GIRAFE\nPINWINKIS\nLE SINGE CIVILISÉ\nMIMI LE CHAT\nL’ALIEN CALCULATEUR\nL’OGRE SONNÉ\nLA GRENOUILLE\nLE BATEAU LUNAIRE", "THE HERO\nTHE GIRAFFE\nPINWINKIS\nTHE CIVILIZED MONKEY\nMIMI THE CAT\nTHE CALCULATING ALIEN\nTHE DIZZY OGRE\nTHE FROG\nTHE MOON BOAT"), smallStyle).setOrigin(0.5, 0),
        this.add.text(0, 390, t("REMERCIEMENTS", "THANKS"), { fontFamily: "monospace", fontSize: "13px", color: "#8eeaff", fontStyle: "bold" }).setOrigin(0.5),
        this.add.text(0, 430, t("aux algues coincées\naux développeurs fous\nau SAV planétaire\nà Origine, quelque part", "to the stuck seaweed\nto the mad developers\nto planetary support\nto Origine, somewhere"), smallStyle).setOrigin(0.5, 0),
        this.add.text(0, 590, "😄   🦒   🐧   🐒   🐱   👽   🐸", { fontSize: "25px" }).setOrigin(0.5),
        this.add.text(0, 675, t("TOUT LE MONDE RIGOLE", "EVERYONE LAUGHS"), { fontFamily: "monospace", fontSize: "16px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5),
      ]);

      this.tweens.add({
        targets: credits,
        y: -790,
        duration: 15000,
        ease: "Linear",
        onComplete: () => this.showFinalPunchline(),
      });
    });
  }

  private showFinalPunchline(): void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#060812");
    this.add.circle(180, 175, 92, 0xffd36a, 0.08);
    this.add.text(180, 144, "✦", { fontSize: "72px", color: "#ffd36a" }).setOrigin(0.5);
    this.add.text(180, 292, t("Voilà, c’est comme ça\nque le Big Bang s’est fait.", "So that is how\nthe Big Bang happened."), {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      lineSpacing: 8,
    }).setOrigin(0.5);
    this.add.text(180, 390, t("La vraie fausse histoire\ndu monde humain. lol", "The true fake story\nof the human world. lol"), {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#b8c5ff",
      align: "center",
      lineSpacing: 7,
    }).setOrigin(0.5);
    const omega=this.add.text(180, 500, "Ω  OMÉGA", {
      fontFamily: "monospace",
      fontSize: "32px",
      color: "#ffd36a",
      fontStyle: "bold",
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    let clicks=0;
    omega.on("pointerdown",()=>{
      if(clicks>=12)return;
      clicks++;
      audio.play("confirm");
      omega.setColor(clicks%2?"#8eeaff":"#ffd36a");
      if(clicks===12){
        omega.disableInteractive();
        this.cameras.main.fadeOut(800,230,244,255);
        this.time.delayedCall(850,()=>this.scene.start("OmegaScene"));
      }
    });
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
