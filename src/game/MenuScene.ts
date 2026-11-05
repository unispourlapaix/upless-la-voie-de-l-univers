import Phaser from "phaser";
import { audio } from "./audio";
import { addPixelVista } from "./pixelArt";
import { getLanguage, icon, languages, setLanguage } from "./language";
import { loadSave } from "./types";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    addPixelVista(this);

    this.add
      .text(180, 190, "UPLESS", {
        fontFamily: "monospace",
        fontSize: "48px",
        color: "#fff1cd",
        stroke: "#11172e",
        strokeThickness: 7,
        letterSpacing: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 236, "LA VOIE DE L’UNIVERS", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: "#b7d9cb",
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.add
      .text(180, 278, icon("♫", "POP POLYPHONIQUE SYNTHÉTISÉE", "SYNTH POP POLYPHONY"), {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#a7b8cf",
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const languageButton = this.add
      .text(306, 24, getLanguage().toUpperCase(), {
        fontFamily: "monospace",
        fontStyle: "bold",
        fontSize: "13px",
        color: "#fff1cd",
        backgroundColor: "#293955",
        padding: { x: 10, y: 7 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(180, 310, "👁  ✋  ✦  💬  💥", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#b7d9cb",
      })
      .setOrigin(0.5);

    this.add.ellipse(180, 389, 76, 15, 0x2a2440, 0.22);
    const hero = this.add.image(180, 360, "hero").setScale(2);
    this.tweens.add({ targets: hero, y: 354, duration: 850, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const start = this.add
      .text(180, 486, icon("▶", "TOUCHER POUR COMMENCER", "TOUCH TO START"), {
        fontFamily: "monospace",
        fontStyle: "bold",
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#365e68",
        stroke: "#2a2440",
        strokeThickness: 2,
        padding: { x: 22, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: start, scale: 1.04, duration: 900, yoyo: true, repeat: -1 });
    languageButton.on("pointerdown", () => {
      const panel=this.add.container(0,0).setDepth(300);
      panel.add(this.add.rectangle(180,320,350,620,0x172330,0.99).setInteractive());
      const names=["Français","English","Español","Português","Deutsch","Italiano","Русский","العربية","中文","日本語","한국어","हिन्दी"];
      languages.forEach((language,index)=>{
        const choice=this.add.text(30+(index%2)*155,92+Math.floor(index/2)*72,names[index],{
          fontFamily:"Arial, sans-serif",fontSize:"18px",color:"#f1e5ce",
          backgroundColor:language===getLanguage()?"#527567":"#344558",
          padding:{x:12,y:14},
        }).setInteractive({useHandCursor:true});
        panel.add(choice);
        choice.on("pointerdown",()=>{
          setLanguage(language);
          audio.play("tap");
          this.scene.restart();
        });
      });
      const close=this.add.text(180,555,"×",{
        fontFamily:"Arial",fontSize:"28px",color:"#f1e5ce",padding:{x:25,y:10},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      panel.add(close);
      close.once("pointerdown",()=>panel.destroy(true));
    });

    this.add.text(180,565,"TROPHÉES ET SAGESSE",{
      fontFamily:"monospace",fontSize:"12px",color:"#dce7ce",
      backgroundColor:"#293955",padding:{x:14,y:12},
    }).setOrigin(0.5).setInteractive({useHandCursor:true})
      .on("pointerdown",()=>this.scene.start("TrophyScene"));
    start.on("pointerdown", () => {
      void audio.start();
      audio.play("confirm");
      const requestedLevel = new URLSearchParams(window.location.search).get("level");
      if (requestedLevel === "alpha") {
        this.scene.start("InvestigationScene");
        return;
      }
      const save = loadSave();
      const level = requestedLevel && /^[1-5]$/.test(requestedLevel) ? Number(requestedLevel) : save.lastLevel;
      if (level >= 5) {
        this.scene.start("MoonScene");
      } else if (level >= 4) {
        this.scene.start("BeachScene");
      } else if (level >= 3) {
        this.scene.start("DesertScene");
      } else if (level >= 2) {
        this.scene.start("OfficeScene");
      } else {
        this.scene.start("GameScene", { levelId: 1 });
      }
    });
  }
}


