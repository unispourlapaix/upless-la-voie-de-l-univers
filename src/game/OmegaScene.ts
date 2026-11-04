import Phaser from "phaser";
import { createFutureMonkey } from "./companionArt";
import { audio } from "./audio";

export class OmegaScene extends Phaser.Scene {
  private line=0;
  private dialogue!:Phaser.GameObjects.Text;
  private stopWhispers?:()=>void;
  private readonly lines=[
    "USELESS : Le paradis ? Je m’attendais à un accueil un peu moins administratif.",
    "Un ange blanc s’avance. Il ressemble étrangement à Pinkwindkis.",
    "ANGE : Le sachet de plastique dans la mare était le tien. Il s’est accroché à la fusée, puis s’est retrouvé dans la ventilation de la porte temporelle.",
    "ANGE : Résultat : une surchauffe cataclysmique. Voilà où mène le manque de responsabilité ! Je demande la peine capitale !",
    "DIEU : Il est déjà au paradis. Nous allons essayer de varier les procédures.",
    "DIEU : Useless… qu’as-tu encore fait ?",
    "USELESS : Ben… ce que j’ai pu.",
    "DIEU : Crois-tu en moi, mon enfant ?",
    "Useless regarde Dieu droit dans les yeux, avec un petit sourire.",
    "USELESS : Je ne crois pas à ce que je ne vois pas.",
    "L’ange, effaré, se prend la tête entre les mains.",
    "ANGE : Même au paradis, on a un athée !",
    "DIEU : J’ai une mission pour toi. Une victime a subi une mise à mort cruelle. Son identité restera scellée jusqu’à ton rapport. Enquête sur les faits, les actes et les responsabilités.",
    "USELESS : D’accord… Par où je commence ?",
    "DIEU : Par le commencement.",
  ];

  constructor(){super("OmegaScene");}

  create():void {
    this.line=0;
    const camera=this.cameras.main;
    camera.setZoom(1).setScroll(0,0).setBackgroundColor("#bbcbdc");
    camera.fadeIn(900,240,246,255);
    const sky=this.add.graphics();
    sky.fillGradientStyle(0x9bb9d5,0xc7cae0,0xf5e9d4,0xf8edda,1);
    sky.fillRect(0,0,360,640);
    for(let i=0;i<18;i++){
      const x=(i*83)%420-30,y=365+(i*41)%240;
      this.add.ellipse(x,y,135+i%3*25,40,0xffffff,0.55);
    }
    const gate=this.add.graphics();
    gate.lineStyle(9,0xd8b970).strokeRoundedRect(25,160,106,210,48);
    gate.lineStyle(2,0xfff5c9).strokeRoundedRect(30,165,96,200,44);
    for(let i=0;i<6;i++)gate.lineBetween(40+i*15,212,40+i*15,363);
    this.add.text(180,35,"AU-DELÀ D’OMÉGA",{
      fontFamily:"monospace",fontSize:"18px",color:"#4c5870",
    }).setOrigin(0.5);
    this.add.image(90,412,"hero").setScale(1.4);
    const wings=this.add.graphics();
    wings.fillStyle(0xffffff).fillEllipse(248,379,58,24).fillEllipse(311,379,58,24);
    wings.lineStyle(2,0xc6d7e4).lineBetween(225,377,255,386);
    wings.lineBetween(304,386,333,377);
    const angel=createFutureMonkey(this,280,407).setScale(0.75);
    const halo=this.add.ellipse(280,322,33,9).setStrokeStyle(3,0xe8c56a);
    const god=this.add.graphics();
    god.fillStyle(0xfff1b5,0.08).fillCircle(183,288,110);
    god.fillStyle(0xfff8d8,0.12).fillCircle(183,288,80);
    for(let ray=0;ray<9;ray++){
      const angle=-Math.PI+ray*Math.PI/8;
      const endX=183+Math.cos(angle)*105;
      const endY=288+Math.sin(angle)*95;
      god.fillStyle(0xfff7c8,0.13);
      god.fillTriangle(177,288,endX,endY,189,288);
    }
    god.fillStyle(0xfffde9,0.4).fillEllipse(183,292,54,95);
    god.fillStyle(0xffffff,0.9).fillEllipse(183,292,19,56);
    const clouds=this.add.graphics();
    for(const cloud of [{x:147,y:316,w:65},{x:211,y:314,w:69},{x:179,y:329,w:92}]){
      clouds.fillStyle(0xd7dfec,0.85).fillEllipse(cloud.x,cloud.y+7,cloud.w,28);
      clouds.fillStyle(0xffffff,0.95).fillEllipse(cloud.x,cloud.y,cloud.w,28);
    }
    this.tweens.add({targets:god,alpha:0.65,duration:1800,yoyo:true,repeat:-1,ease:"Sine.inOut"});
    this.add.rectangle(180,525,336,170,0x27334b,0.96).setStrokeStyle(2,0xe7c889);
    this.dialogue=this.add.text(27,455,"",{
      fontFamily:"monospace",fontSize:"13px",color:"#fff0d8",
      wordWrap:{width:305},lineSpacing:6,
    });
    this.add.text(180,594,"[ TOUCHER POUR CONTINUER ]",{
      fontFamily:"monospace",fontSize:"10px",color:"#b7d5e0",
    }).setOrigin(0.5);
    const next=this.add.rectangle(180,525,336,170,0xffffff,0.001)
      .setInteractive({useHandCursor:true});
    this.showLine();
    next.on("pointerdown",()=>{
      this.stopWhispers?.();
      this.line++;
      if(this.line===10){
        this.tweens.add({targets:[angel,halo],angle:8,duration:130,yoyo:true,repeat:3});
      }
      if(this.line<this.lines.length)this.showLine();
      else{
        next.disableInteractive();
        camera.fadeOut(800,244,237,217);
        this.time.delayedCall(850,()=>this.beginAlpha());
      }
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.stopWhispers?.());
  }

  private showLine():void {
    const text=this.lines[this.line];
    this.dialogue.setText(text);
    this.stopWhispers=audio.whisper(Math.min(6,text.length*0.04),0.85);
  }

  private beginAlpha():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#171c30").fadeIn(900);
    this.add.text(180,210,"Α",{
      fontFamily:"serif",fontSize:"110px",color:"#ebcd8d",
    }).setOrigin(0.5);
    this.add.text(180,330,"CHAPITRE ALPHA",{
      fontFamily:"monospace",fontSize:"25px",color:"#fff0d4",
    }).setOrigin(0.5);
    this.add.text(180,410,"La victime sans nom",{
      fontFamily:"monospace",fontSize:"16px",color:"#b9cce0",
    }).setOrigin(0.5);
    const enter=this.add.text(180,510,"OUVRIR LE DOSSIER",{
      fontFamily:"monospace",fontSize:"17px",color:"#bffff0",
      backgroundColor:"#33465a",padding:{x:16,y:14},
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    enter.once("pointerdown",()=>this.scene.start("InvestigationScene"));
  }
}
