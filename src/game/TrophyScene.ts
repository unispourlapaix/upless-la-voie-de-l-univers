import Phaser from "phaser";
import { collectedTrophies, trophyReflections, type TrophyId } from "./trophies";
import { audio } from "./audio";
import { translateText } from "./language";

export class TrophyScene extends Phaser.Scene {
  constructor(){super("TrophyScene");}
  create():void {this.showGallery();}

  private heading(text:string):void {
    this.cameras.main.setBackgroundColor("#172434");
    this.add.text(180,30,text,{
      fontFamily:"monospace",fontSize:"18px",color:"#f0d7a0",
      wordWrap:{width:326},align:"center",
    }).setOrigin(0.5,0);
  }

  private button(x:number,y:number,text:string,action:()=>void):void {
    this.add.text(x,y,text,{
      fontFamily:"monospace",fontSize:"12px",color:"#e4efe3",
      backgroundColor:"#35495a",padding:{x:12,y:12},
    }).setOrigin(0.5).setInteractive({useHandCursor:true})
      .on("pointerdown",()=>{audio.play("tap");action();});
  }

  private showGallery():void {
    this.children.removeAll();
    this.heading("LES TROPHÉES D’USELESS");
    const preview=new URLSearchParams(window.location.search).get("preview")==="1";
    const collected=collectedTrophies();
    this.add.text(180,75,"Une pièce, une invitation à réfléchir.",{
      fontFamily:"monospace",fontSize:"12px",color:"#bed0cf",wordWrap:{width:310},
      align:"center",
    }).setOrigin(0.5);
    trophyReflections.forEach((trophy,index)=>{
      const x=96+(index%2)*166,y=139+Math.floor(index/2)*70;
      const unlocked=preview||collected.includes(trophy.id);
      this.add.rectangle(x,y,150,61,unlocked?0x344b58:0x263342)
        .setStrokeStyle(1,unlocked?0x809891:0x3b4953)
        .setInteractive({useHandCursor:true}).on("pointerdown",()=>{
          if(unlocked)this.showReflection(index,0);
        });
      this.add.text(x,y,unlocked?trophy.name:"À découvrir",{
        fontFamily:"monospace",fontSize:"12px",color:unlocked?"#f1e0bc":"#77858d",
        align:"center",wordWrap:{width:134},
      }).setOrigin(0.5);
    });
    this.button(180,585,"RETOUR AU MENU",()=>this.scene.start("MenuScene"));
  }

  private drawObject(id:TrophyId):void {
    const g=this.add.graphics();
    const x=180,y=151;
    g.fillStyle(0x070e19,0.3).fillEllipse(x,y+40,87,13);
    if(id==="cross"){
      g.fillStyle(0x49392f).fillRect(x-7,y-48,14,88).fillRect(x-29,y-27,58,12);
      g.fillStyle(0xb18b58).fillRect(x-6,y-47,3,85).fillRect(x-28,y-26,55,2);
      for(let i=0;i<12;i++)g.fillStyle(0x765a3c).fillRect(x+i%3-2,y-43+i*6,1,4);
    }else if(id==="basin"){
      g.fillStyle(0x889599).fillRect(x-9,y+2,18,33).fillEllipse(x,y+35,43,9);
      g.fillStyle(0xc4c5b6).fillEllipse(x,y,77,23);
      g.fillStyle(0x537e92).fillEllipse(x,y-3,61,12);
      g.lineStyle(2,0xd3ece6).strokeEllipse(x-4,y-4,32,4);
    }else if(id==="robe"||id==="slip"){
      if(id==="robe"){
        g.fillStyle(0x7c417d);
        g.beginPath();g.moveTo(x-12,y-31);g.lineTo(x-37,y-9);g.lineTo(x-26,y+2);
        g.lineTo(x-18,y-2);g.lineTo(x-22,y+37);g.lineTo(x+22,y+37);
        g.lineTo(x+18,y-2);g.lineTo(x+26,y+2);g.lineTo(x+37,y-9);
        g.lineTo(x+12,y-31);g.closePath();g.fillPath();
        g.lineStyle(3,0xb77fa8).lineBetween(x-9,y-16,x-13,y+31);
        g.lineStyle(3,0x512e60).lineBetween(x+8,y-13,x+13,y+34);
      }else{
        g.fillStyle(0xe4a5bd).fillTriangle(x-33,y-16,x+33,y-16,x,y+28);
        g.fillStyle(0xa95380).fillRect(x-33,y-20,66,6);
        g.fillStyle(0xffd2df).fillRect(x-25,y-12,49,3);
      }
    }else if(id==="headset"){
      g.lineStyle(7,0x5d6d80).strokeEllipse(x,y-7,72,46);
      g.fillStyle(0x243748).fillRoundedRect(x-39,y-12,78,33,7);
      g.fillStyle(0x71bab9).fillRect(x-30,y-5,60,15);
      g.fillStyle(0xcee9df).fillRect(x-27,y-4,53,2);
      g.fillStyle(0x334858).fillRect(x-2,y-5,4,15);
    }else{
      const symbols:Partial<Record<TrophyId,string>>={
        thorn:"⌁",coins:"● ● ●",ear:"◔",shroud:"▱",book:"▤",radio:"▣",bag:"♧",
      };
      this.add.text(x,y,symbols[id]??"✦",{
        fontFamily:"serif",fontSize:"44px",color:"#d5c8a6",
      }).setOrigin(0.5);
    }
    if(id==="cross"){
      this.add.image(284,174,"hero").setScale(1.6);
      const glasses=this.add.graphics();
      glasses.fillStyle(0x090e18).fillRect(269,164,13,10).fillRect(285,164,13,10);
      glasses.fillRect(281,166,5,3);
      glasses.fillStyle(0x8fa5b5).fillRect(271,165,4,1).fillRect(287,165,4,1);
    }
  }

  private showReflection(index:number,page:number):void {
    const trophy=trophyReflections[index];
    this.children.removeAll();
    this.heading(trophy.name);
    this.drawObject(trophy.id);
    this.add.rectangle(180,350,326,269,0x243547).setStrokeStyle(1,0x647777);
    const body=this.add.text(30,230,trophy.pages[page],{
      fontFamily:"monospace",fontSize:"13px",color:"#f3e9d5",
      wordWrap:{width:300},lineSpacing:6,
    });
    // Translations can be longer, so fit each page inside its reading panel.
    while(body.height>230&&body.style.fontSize!=="10px"){
      const size=parseInt(String(body.style.fontSize),10);
      if(size<=10)break;
      body.setFontSize(size-1);
    }
    this.add.text(180,503,(page+1)+"/"+trophy.pages.length,{
      fontSize:"12px",color:"#a6c5bf",
    }).setOrigin(0.5);
    if(page>0)this.button(86,542,"PRÉCÉDENT",()=>this.showReflection(index,page-1));
    if(page<trophy.pages.length-1)this.button(268,542,"SUIVANT",()=>this.showReflection(index,page+1));
    if(trophy.source)this.button(180,585,"LIRE LE VERSET ↗",()=>window.open(trophy.source!,"_blank","noopener,noreferrer"));
    this.button(180,79,"RETOUR AUX TROPHÉES",()=>this.showGallery());
    // The view remains readable without audio or a timed advance.
    document.title=translateText(trophy.name)+" — Upless";
  }
}
