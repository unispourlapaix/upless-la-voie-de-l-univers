import Phaser from "phaser";
import {audio} from "./audio";
import {TouchInput} from "./input";
import {PlayerController} from "./player";
import {createCompanionMonkey} from "./companionArt";
import {createDesertStargate} from "./stargateArt";
import {createBeachCharacter,createBeachBoat,createBeachObject,createBeachPalm,drawBeach} from "./beachArt";
import {loadSave,writeSave} from "./types";

type BeachPhase="explore"|"falling"|"dialogue"|"repair"|"boarding"|"sailing"|"teleport";
type BeachTarget={id:string;x:number;y:number;rx:number;ry:number;action:()=>void};

export class BeachScene extends Phaser.Scene {
  private player!:PlayerController;
  private platforms!:Phaser.Physics.Arcade.StaticGroup;
  private controls?:TouchInput;
  private phase:BeachPhase="explore";
  private message!:Phaser.GameObjects.Text;
  private objective!:Phaser.GameObjects.Text;
  private messageTimer?:Phaser.Time.TimerEvent;
  private targets:BeachTarget[]=[];
  private giraffe!:Phaser.GameObjects.Container;
  private monkey!:Phaser.GameObjects.Container;
  private boat!:Phaser.GameObjects.Container;
  private algae!:Phaser.GameObjects.Container;
  private headset!:Phaser.GameObjects.Container;
  private palm!:Phaser.GameObjects.Container;
  private belongings:Phaser.GameObjects.Container[]=[];
  private helperFallen=false;
  private helper?:Phaser.GameObjects.Container;
  private boatInspected=false;
  private propellerInspected=false;
  private allBelongingsFound=false;
  private transformed=false;
  private coconutTradeOffered=false;
  private hasCoconut=false;
  private helperFound=false;
  private repaired=false;
  private dialogueLines:string[]=[];
  private dialogueIndex=0;
  private dialogueDone?:()=>void;
  private dialoguePanel?:Phaser.GameObjects.Container;
  private dialogueText!:Phaser.GameObjects.Text;
  private stopWhispers?:()=>void;

  constructor(){super("BeachScene");}

  create():void {
    this.phase="explore";this.targets=[];this.boatInspected=false;this.allBelongingsFound=false;this.helperFound=false;this.repaired=false;
    this.helper=undefined;this.dialoguePanel=undefined;this.dialogueDone=undefined;
    this.transformed=false;
    this.coconutTradeOffered=false;
    this.hasCoconut=false;
    this.helperFallen=false;this.belongings=[];
    this.physics.world.setBounds(0,0,1920,640);
    this.cameras.main.setBounds(0,0,1920,640).setBackgroundColor("#9cabb1");
    drawBeach(this);
    this.platforms=this.physics.add.staticGroup();
    this.platforms.add(this.add.rectangle(960,580,1920,60,0xd5b581,0));
    createDesertStargate(this,55,450);
    this.giraffe=createBeachCharacter(this,232,506,"giraffe");
    this.monkey=createCompanionMonkey(this,135,511);
    this.palm=createBeachPalm(this,575,551);
    const craft=createBeachBoat(this,1670,510);this.boat=craft.boat;this.algae=craft.algae;
    this.headset=createBeachObject(this,1340,536,"vr");
    this.belongings=[this.headset,createBeachObject(this,365,538,"cloth"),createBeachObject(this,1070,536,"book"),createBeachObject(this,1535,530,"radio")];
    this.belongings.forEach((object)=>object.setVisible(false));
    this.player=new PlayerController(this,92,525);
    this.physics.add.collider(this.player.sprite,this.platforms);
    this.cameras.main.startFollow(this.player.sprite,true,0.08,0.08,-55,0).setDeadzone(90,180);
    this.createHud();this.registerTargets();
    this.controls=new TouchInput(this,{onTap:(x,y)=>this.handleTap(x,y),onDoubleTap:(x,y)=>this.handleDoubleTap(x,y),isUiHit:(_x,y)=>y<62});
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.controls?.destroy();this.stopWhispers?.();this.messageTimer?.remove(false);});
    this.openDialogue([
      "Vous ressortez du voile bleu. La même girafe vous attend sur une plage presque trop calme.",
      "GIRAFE : Bienvenue sur la côte. Ici, la mer monte. Les responsabilités, beaucoup moins.",
      "TOI : On est arrivés où, exactement ?",
      "GIRAFE : Sur une plage. Pour le reste, j’attends encore la brochure.",
      "SINGE : Ça a l’air calme. Restons prudents avec les apparences.",
    ]);
  }

  update(_time:number,delta:number):void {
    if(this.phase!=="explore")return;
    this.player.update(()=>true);
    const goal=Phaser.Math.Clamp(this.player.sprite.x-(this.player.sprite.flipX?-65:65),105,1830);
    const difference=goal-this.monkey.x;
    if(Math.abs(difference)>8){this.monkey.x+=Math.sign(difference)*Math.min(Math.abs(difference),delta*0.15);this.monkey.setScale(difference<0?-1:1,1);this.monkey.y=511+Math.sin(this.time.now/100)*2;}
    else this.monkey.y=511;
  }

  private createHud():void {
    this.add.rectangle(180,29,340,49,0x203845,0.97).setStrokeStyle(2,0x90b8aa).setScrollFactor(0).setDepth(100);
    this.add.text(22,12,"IV · LA PLAGE DES ÉCHOUÉS",{fontFamily:"monospace",fontSize:"11px",color:"#f4dfb2"}).setScrollFactor(0).setDepth(101);
    this.objective=this.add.text(22,33,"EXPLORER LA PLAGE",{fontFamily:"monospace",fontSize:"10px",color:"#b9daca"}).setScrollFactor(0).setDepth(101);
    const sound=this.add.text(321,23,audio.isEnabled()?"♪":"×",{fontSize:"17px",color:"#f4dfb2"}).setScrollFactor(0).setDepth(102).setInteractive({useHandCursor:true});
    sound.on("pointerdown",()=>{const on=audio.toggle();sound.setText(on?"♪":"×");if(!on)this.stopWhispers?.();});
    this.message=this.add.text(180,140,"",{fontFamily:"monospace",fontSize:"11px",color:"#f3e4c6",align:"center",lineSpacing:5,wordWrap:{width:300},backgroundColor:"#203845",padding:{x:12,y:10}}).setOrigin(0.5).setScrollFactor(0).setDepth(110).setAlpha(0);
  }

  private registerTargets():void {
    const target=(id:string,x:number,y:number,rx:number,ry:number,action:()=>void)=>this.targets.push({id,x,y,rx,ry,action});
    target("timeGate",55,450,45,65,()=>this.say("La porte temporelle vibre encore."));
    target("giraffe",232,485,30,68,()=>{
      if(this.helperFound&&this.belongings[2].visible){
        if(this.hasCoconut){
          this.openDialogue([
            "TOI : Voilà ta noix de coco !",
            "GIRAFE : Marché conclu. Tenez, voilà le livre. Dites à Pinkwindkis que j’en étais au troisième coup.",
          ],()=>{
            this.hasCoconut=false;
            this.takeBelonging(2);
          });
          return;
        }
        if(this.coconutTradeOffered){
          this.say("GIRAFE : Une noix de coco contre le livre.\nIl en reste dans le cocotier.");
          return;
        }
        this.openDialogue([
          "TOI : Tu as trouvé quelque chose sur la plage ?",
          "GIRAFE : Oui, plein de coquillages et du sable. À part le cocotier, il n’y a pas grand-chose ici. Laissez-moi maintenant, j’ai une lecture à terminer.",
          "TOI : Une lecture ? Tu as trouvé un livre ?",
          "GIRAFE : Oui, j’aime lire. Je l’ai trouvé sur la plage. « Les 12 coups de fouet de l’apocalypse », par Pinkwindkis.",
          "TOI : C’est justement son livre qu’on cherche. Tu peux nous le rendre ?",
          "GIRAFE : Je veux finir mon chapitre. Mais si vous me rapportez une noix de coco, je vous laisse le livre. J’ai beau tirer sur les noix, aucune ne tombe.",
        ],()=>{this.coconutTradeOffered=true;});
        return;
      }
      this.say(this.repaired?"GIRAFE : Cette fois, je crois qu’on peut partir.":"GIRAFE : Je garde mon calme et mes pieds au sec.\nChacun ses ambitions.");
    });
    target("palm",575,420,100,138,()=>this.say("Un grand cocotier. Les noix sont bien mûres.\nQuelque chose remue entre les palmes…"));
    target("coconuts",575,380,29,26,()=>{
      if(this.helperFound&&this.headset.visible){
        this.openDialogue(["Tu écartes les noix de coco. Derrière la grappe, le casque de Pinkwindkis est coincé entre deux palmes."],()=>this.takeBelonging(0));
        return;
      }
      if(this.coconutTradeOffered&&!this.hasCoconut&&this.belongings[2].visible){
        this.hasCoconut=true;
        audio.play("confirm");
        this.say("Tu tires sur une noix de coco. Elle se décroche !\nRapporte-la à la girafe.");
        return;
      }
      this.dropPinkwindkis();
    });
    target("helper",585,500,28,45,()=>this.talkToHelper());
    this.belongings.forEach((object,index)=> {
      if(index===0||index===2)return;
      target(["vr","cloth","book","radio"][index],object.x,object.y,28,28,()=>this.takeBelonging(index));
    });
    target("propeller",1558,426,30,30,()=>this.inspectPropeller());
    target("boat",1670,448,165,118,()=>{if(this.repaired)this.depart();else this.inspectBoat();});
  }

  private handleTap(x:number,y:number):void {
    if(this.phase==="dialogue"){this.advanceDialogue();return;}
    if(this.phase!=="explore")return;
    const p=this.cameras.main.getWorldPoint(x,y);
    audio.play("tap");
    const target=this.targets.filter(t=>(!["vr","cloth","book","radio"].includes(t.id)||this.belongings[["vr","cloth","book","radio"].indexOf(t.id)].visible)&&(this.helperFound||!["helper","vr","cloth","book","radio"].includes(t.id))&&Math.abs(p.x-t.x)<=t.rx&&Math.abs(p.y-t.y)<=t.ry)
      .sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
    if(target){
      if(Math.abs(this.player.sprite.x-target.x)>155){this.player.moveTo(Math.min(1800,target.x-70),525);this.say("Approche-toi, puis touche l’objet.");return;}
      this.player.stop();target.action();return;
    }
    if(Math.abs(p.x-this.monkey.x)<27&&Math.abs(p.y-this.monkey.y)<49){this.player.stop();this.say(this.repaired?"SINGE : Tout le monde à bord.\nPour une fois, personne ne vote.":this.propellerInspected?"SINGE : Des algues dans un propulseur.\nLa nature s’est mise à faire des barrages.":"SINGE : Regardons ce qui nous entoure.\nLes choses parlent. En général, pour se plaindre.");return;}
    this.player.moveTo(Phaser.Math.Clamp(p.x,30,1800),525);
  }

  private handleDoubleTap(x:number,y:number):void {
    const point=this.cameras.main.getWorldPoint(x,y);
    if(this.phase!=="explore"||Math.abs(point.x-55)>45||Math.abs(point.y-450)>65){
      this.handleTap(x,y);
      return;
    }
    this.phase="teleport";
    this.player.stop();
    audio.play("portal");
    this.cameras.main.fadeOut(450,83,163,218);
    this.time.delayedCall(450,()=>this.scene.start("GameScene",{levelId:1,timeGateTrap:true}));
  }

  private inspectBoat():void {
    if(this.repaired){this.say("Le propulseur arrière est dégagé. Touche la cabine\npour embarquer avec toute l’équipe.");return;}
    this.boatInspected=true;
    this.refreshObjective();
    this.openDialogue(this.propellerInspected
      ? ["TOI : Le bateau est toujours là. Les algues aussi.","SINGE : Au moins, le diagnostic n’a pas changé."]
      : ["Tu examines la coque et essaies le moteur. Il tousse, mais le bateau reste immobile.","TOI : Quelque chose le retient…", "Un bruit sourd vient de l’arrière. D’ici, tu ne vois pas ce qui bloque."]);
  }

  private inspectPropeller():void {
    if(this.repaired){this.say("Le propulseur arrière est dégagé.");return;}
    this.boatInspected=true;this.propellerInspected=true;this.refreshObjective();
    this.openDialogue(["Tu te penches à l’arrière du bateau. Des lianes rouges enserrent la tuyère du propulseur arrière.","TOI : Voilà ce qui bloque. C’est trop profond pour les atteindre depuis la berge.","SINGE : Pas question de tirer au hasard. On finirait avec un moteur en souvenir."]);
  }

  private takeBelonging(index:number):void {
    const object=this.belongings[index];
    if(!this.helperFound||!object.visible)return;
    object.setVisible(false);
    audio.play("confirm");
    this.allBelongingsFound=!this.belongings.some(item=>item.visible);
    this.refreshObjective();
    this.say(this.allBelongingsFound?"Tout est retrouvé ! Rapporte ses affaires à Pinkwindkis.":["Casque VR retrouvé !","Slip rose retrouvé !","Livre retrouvé !","Radio retrouvée !"][index]);
  }

  private dropPinkwindkis():void {
    if(this.helperFallen){this.say("PINKWINDKIS : Les noix, c’est bon.\nMoi, j’ai déjà donné.");return;}
    this.helperFallen=true;this.phase="falling";this.player.stop();
    this.say("Tu tires sur une noix. Tout le cocotier bouge…",1900);
    audio.play("rock");
    this.tweens.add({targets:this.palm,angle:3,duration:90,yoyo:true,repeat:3});
    this.helper=createBeachCharacter(this,575,373,"pinkwindkis").setDepth(19);
    const coconut=this.add.rectangle(565,382,11,13,0x9d7958).setDepth(20);
    this.tweens.add({targets:coconut,x:539,y:543,angle:130,duration:750,ease:"Bounce.out",onComplete:()=>coconut.destroy()});
    this.belongings.forEach((object,index)=>{
      if(index===0||index===2){
        object.setVisible(true).setAlpha(0);
        return;
      }
      const landingX=object.x,landingY=object.y;
      object.setPosition(575,385).setVisible(true);
      this.tweens.addCounter({from:0,to:1,delay:180+index*70,duration:650,onUpdate:t=>{
        const progress=t.getValue()??0;
        object.setPosition(575+(landingX-575)*progress,385+(landingY-385)*progress-Math.sin(progress*Math.PI)*65);
      }});
    });
    this.tweens.add({targets:this.helper,x:585,y:507,angle:0,duration:1150,ease:"Bounce.out",onComplete:()=>{
      audio.play("monkey");this.phase="explore";this.talkToHelper();
    }});
  }

  private talkToHelper():void {
    if(this.repaired){this.say("PINKWINDKIS : Mission accomplie.\nLe pingouin exige maintenant des vacances.");return;}
    if(!this.helperFound){
      if(!this.helperFallen)return;
      this.helperFound=true;
      this.refreshObjective();
      const introduction = [
        "Quelqu’un tombe du cocotier avec son sac. Un casque, un slip, un livre et une radio s’éparpillent sur le sable.",
        "PINKWINDKIS : Aïe ! Je venais juste de m’installer. Mes affaires… Vous cherchiez une noix ou un accident ?",
        "TOI : La même tête, les mêmes oreilles blanches… Tu ressembles beaucoup à notre singe.",
        "PINKWINDKIS : Normal. Je suis lui, dans le futur. On m’appelle Pinkwindkis. Pas besoin de crier, il est déjà assez inquiet.",
        "SINGE : Je deviens astronaute ? Et on me fournit cette combinaison ?",
        "PINKWINDKIS : Explorateur indépendant. Le sac de survie est inclus. Pour la retraite, on cherche encore une planète habitable.",
        "PINKWINDKIS : Je cherche Origine. Elle fait le service après-vente des mondes. En attendant, ce cocotier est mon bureau.",
      ];
      introduction.push("PINKWINDKIS : Je peux vous aider si vous m’aidez à retrouver mes affaires.");
      this.refreshObjective();this.openDialogue(introduction);
      return;
    }
    if(this.transformed){
      if(this.propellerInspected)this.repairBoat();
      else this.say("PINKWINDKIS : En mode pingouin, je peux plonger. Montrez-moi le problème !");
      return;
    }
    if(!this.allBelongingsFound){
      this.say("PINKWINDKIS : Il me manque encore "+this.belongings.filter(item=>item.visible).length+" affaire(s).");
      return;
    }
    this.openDialogue(["TOI : On a retrouvé toutes tes affaires !","PINKWINDKIS : Merci ! Je remets mon casque. Mode pingouin… activation !"],()=>this.transformHelper());
  }

  private refreshObjective():void {
    this.objective.setText(this.repaired?"BATEAU PRÊT":this.helperFound&&!this.transformed?(this.allBelongingsFound?"RETOURNER VOIR PINKWINDKIS":"AFFAIRES RETROUVÉES : "+this.belongings.filter(item=>!item.visible).length+"/4"):this.propellerInspected?"PROPULSEUR OBSTRUÉ":this.boatInspected?"LE BATEAU RESTE IMMOBILE":"EXPLORER LA PLAGE");
  }

  private openDialogue(lines:string[],done?:()=>void):void {
    this.phase="dialogue";this.player.stop();this.message.setAlpha(0);this.messageTimer?.remove(false);
    this.dialogueLines=lines;this.dialogueIndex=0;this.dialogueDone=done;
    const panel=this.add.rectangle(180,205,336,220,0x203845,0.99).setStrokeStyle(2,0xb6c9ad);
    this.dialogueText=this.add.text(27,112,"",{fontFamily:"monospace",fontSize:"12px",color:"#f2e4c8",wordWrap:{width:303},lineSpacing:7});
    const next=this.add.text(27,293,"[ TOUCHER POUR LA SUITE ]",{fontFamily:"monospace",fontSize:"10px",color:"#a9cfc2"});
    this.dialoguePanel=this.add.container(0,0,[panel,this.dialogueText,next]).setScrollFactor(0,0,true).setDepth(150);
    this.showDialogueLine();
  }
  private showDialogueLine():void {
    this.stopWhispers?.();const text=this.dialogueLines[this.dialogueIndex];this.dialogueText.setText(text);
    this.stopWhispers=audio.whisper(Math.min(7,text.length*0.045),this.dialogueIndex%2?1.15:0.85);
  }
  private advanceDialogue():void {
    this.stopWhispers?.();
    this.dialogueIndex++;
    if(this.dialogueIndex<this.dialogueLines.length){this.showDialogueLine();return;}
    this.dialoguePanel?.destroy(true);this.phase="explore";const done=this.dialogueDone;this.dialogueDone=undefined;done?.();
  }

  private transformHelper():void {
    if(!this.helper||!this.allBelongingsFound||this.transformed)return;
    this.phase="repair";this.player.stop();audio.play("confirm");
    this.say("MODE PINGOUIN GUERRIER ACTIVÉ",3000);
    this.tweens.add({targets:this.helper,scale:0.1,alpha:0,duration:650,onComplete:()=>{
      this.helper?.destroy(true);
      this.helper=createBeachCharacter(this,585,507,"penguin").setDepth(19);
      this.transformed=true;
      this.phase="explore";
      this.refreshObjective();
      if(this.propellerInspected)this.repairBoat();
    }});
  }

  private repairBoat():void {
    if(this.phase!=="explore"||this.repaired||!this.helper||!this.transformed||!this.propellerInspected)return;
    this.phase="repair";this.player.stop();
      this.cameras.main.stopFollow();this.cameras.main.pan(1670,320,1200,Phaser.Math.Easing.Sine.InOut);
      this.tweens.addCounter({from:0,to:1,duration:1800,onUpdate:t=>{
        const progress=t.getValue()??0;this.helper!.setPosition(585+973*progress,507-81*progress-Math.sin(progress*Math.PI)*95);
      },onComplete:()=>{
        audio.play("bridge");
        this.say("Pinkwindkis dégage le propulseur arrière.\nLes algues n’avaient pas signé pour ça.",3300);
        this.tweens.add({targets:this.algae,y:-36,x:this.algae.x-38,alpha:0,duration:850,onComplete:()=>{
          this.repaired=true;this.phase="explore";this.helper!.setPosition(1558,460);
          this.refreshObjective();this.cameras.main.startFollow(this.player.sprite,true,0.08,0.08,-55,0).setDeadzone(90,180);
          this.say("Le propulseur fonctionne. Le bateau est prêt.\nTouche sa cabine pour embarquer tout le monde.",4000);
        }});
      }});

  }

  private depart():void {
    if(!this.repaired||this.phase!=="explore")return;
    this.phase="boarding";this.player.stop();this.player.sprite.body!.enable=false;
    // The beached diagonal yacht levels out only as the crew prepares to sail.
    this.tweens.add({targets:this.boat,angle:0,y:489,duration:700,ease:"Sine.inOut"});
    this.cameras.main.stopFollow();this.cameras.main.pan(1670,320,800,Phaser.Math.Easing.Sine.InOut);
    this.say("Embarquement. Même la girafe a une place.\nSINGE : Enfin une politique de transport inclusive.",4000);
    const passengers=[this.player.sprite,this.monkey,this.giraffe,this.helper!];
    const seats=[-60,-22,20,65];
    passengers.forEach((person,index)=>{
      this.tweens.killTweensOf(person);
      this.tweens.add({targets:person,x:1670+seats[index]*1.12,y:467,duration:1300+index*220,ease:"Sine.inOut",onComplete:()=>{
        person.setScale(index===2?0.65:0.75);person.setPosition(seats[index],-13);this.boat.add(person);
      }});
    });
    this.time.delayedCall(2200,()=>{
      this.phase="sailing";this.tweens.killTweensOf(this.boat);audio.play("portal");
      this.say("GIRAFE : Cap sur Origine.\nLa mer est vaste. Notre plan tient dans une bouée.",3500);
      this.tweens.add({targets:this.boat,x:2070,y:434,scale:0.65,duration:3300,ease:"Sine.inOut",onComplete:()=>{
        const save=loadSave();writeSave({...save,lastLevel:4,unlockedLevel:Math.max(save.unlockedLevel,5)});
        this.cameras.main.fadeOut(600,28,47,69);this.time.delayedCall(650,()=>this.scene.start("MoonScene"));
      }});
    });
  }

  private say(text:string,duration=2900):void {
    this.messageTimer?.remove(false);this.message.setText(text).setAlpha(1);
    this.messageTimer=this.time.delayedCall(duration,()=>this.message.setAlpha(0));
  }
}

