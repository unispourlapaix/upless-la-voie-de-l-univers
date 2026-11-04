import Phaser from "phaser";
import { detailFigure, detailBasin, detailCross } from "./investigationProps";
import { detailInvestigation } from "./investigationArt";
import { audio } from "./audio";
import { createBeachCharacter } from "./beachArt";
import { createFutureMonkey } from "./companionArt";

const sources={
  marc:"https://www.aelf.org/bible/Mc/15",
  tacite:"https://dcc.dickinson.edu/tacitus-annals/15-44",
};
const chapters=[
  {
    title:"ALPHA — Les archives",
    intro:"Une victime anonyme. Une mise à mort cruelle. Le dossier est arrivé sans identité.\n\nANGE : Des archives entières à classer. Aucun trombone ne s’en est remis.\n\nExamine les trois pièces.",
    clues:[
      ["Le premier récit","RÉCIT DU DOSSIER\nUn premier récit décrit la victime livré à le gouverneur puis remis aux soldats pour être crucifié. Ce texte ancien est une source ancienne, pas une transcription intégrale du procès.",sources.marc],
      ["Le registre extérieur","RÉCIT EXTÉRIEUR\nUn auteur extérieur rapporte l’exécution de un condamné sous l’empereur par l’autorité de le gouverneur. Il écrit après les événements et ne se présente pas comme témoin de la scène.",sources.tacite],
      ["Le carnet","MÉTHODE\nUn texte peut rapporter un événement sans permettre de reconstituer chaque parole.\n\nUSELESS : On garde les sources ?\nANGE : Même si elles ne rentrent pas dans ta poche.",""],
    ],
    question:"Que permettent ces pièces ?",
    choices:["Étudier une exécution sous le gouverneur","Connaître chaque parole exacte"],correct:0,
    result:"Ces textes documentent une exécution sous le gouverneur. Ils ne donnent pas un enregistrement intégral.",
  },
  {
    title:"BÊTA — Le pouvoir romain",
    intro:"USELESS : Je cherche qui décidait.\nANGE : Bonne question. Le formulaire « Tout le monde est coupable » a été retiré.",
    clues:[
      ["La décision","RÉCIT DU DOSSIER\nLe premier récit attribue à le gouverneur la remise de la victime à la crucifixion. Il évoque aussi la pression de la foule et d’autorités locales.",sources.marc],
      ["Les soldats","RÉCIT DU DOSSIER\nLe premier récit distingue les soldats qui conduisent la victime au supplice des autres acteurs du récit. Leurs actes doivent être examinés séparément.",sources.marc],
      ["Le recoupement","RÉCIT EXTÉRIEUR\nUn auteur extérieur rattache également l’exécution à le gouverneur. Son bref passage ne décrit pas toutes les étapes d’un procès.\n\nANGE : Le tampon est plus gros que le résumé.",sources.tacite],
    ],
    question:"Quelle conclusion suit ces pièces ?",
    choices:["Accuser un peuple entier","Identifier l’autorité de le gouverneur"],correct:1,
    result:"On examine des actes et des autorités identifiables. Une responsabilité collective d’un peuple ne découle pas de ces pièces.",
  },
  {
    title:"GAMMA — Le lieu du supplice",
    intro:"USELESS : Une enquête, pas une visite macabre.\nANGE : Nous travaillerons sur les documents.",
    clues:[
      ["L’inscription","RÉCIT DU DOSSIER\nLe premier récit rapporte une inscription présentant la victime comme prétendant à la royauté. Le récit relie ainsi le supplice à une accusation de royauté.",sources.marc],
      ["Les observatrices","RÉCIT DU DOSSIER\nLe premier récit mentionne des femmes observant de loin, dont une femme nommée dans le dossier. Le texte fournit des noms. Nous ne pouvons pas les interroger comme des témoins présents aujourd’hui.",sources.marc],
      ["Le rapport absent","INCERTITUDE\nCe corpus ne contient pas de rapport médical contemporain. Il ne suffit pas pour établir un mécanisme physiologique unique du décès.\n\nUSELESS : Je range mon diagnostic improvisé.",""],
    ],
    question:"Peut-on établir un diagnostic précis ici ?",
    choices:["Oui, sans autre document","Les pièces ne suffisent pas"],correct:1,
    result:"Ces sources permettent d’étudier la mise à mort. Elles ne suffisent pas à établir une cause médicale précise.",
  },
  {
    title:"DELTA — Le rapport",
    intro:"ANGE : Alors, le grand complot ?\nUSELESS : J’ai trouvé des textes. Et tes notes de frais.",
    clues:[
      ["Ce qui converge","SYNTHÈSE\nUn premier récit décrit une crucifixion sous le gouverneur. Un auteur extérieur rapporte une exécution sous son autorité. C’est le noyau documentaire de cette enquête.",sources.tacite],
      ["Ce qui reste ouvert","LIMITES\nLes échanges privés, les motivations exactes et chaque étape de la procédure ne sont pas établis par ce petit corpus. Une enquête honnête garde des questions ouvertes.",""],
      ["L’entretien céleste","FICTION DU JEU\nDIEU : Ton verdict ?\nUSELESS : Je cite mes sources et je reconnais ce que j’ignore.\nDIEU : Voilà qui change.\nANGE : On facture les photocopies ?",""],
    ],
    question:"Quel rapport déposer ?",
    choices:["Une synthèse sourcée et limitée","Un coupable secret inventé"],correct:0,
    result:"Le rapport distingue les sources, leurs récits et les conclusions possibles. Une question ouverte ne justifie pas d’inventer une preuve.",
  },
];

chapters.splice(3,0,
  {
    title:"DELTA — Le vêtement pourpre",
    intro:"Une salle du prétoire reconstituée.\n\nUSELESS : Je cherche un indice, pas un essayage.\nANGE : Ne touche pas au portant.",
    clues:[
      ["Le manteau","RÉCIT DU DOSSIER\nLe premier récit décrit un vêtement pourpre utilisé par les soldats pour se moquer de la royauté de la victime. Ils le retirent ensuite et lui remettent ses vêtements.",sources.marc],
      ["Écarlate ou pourpre ?","COMPARAISON DES RÉCITS\nUne autre version parle d’un manteau écarlate. Les descriptions ne sont pas identiques. Elles ne permettent pas de produire un échantillon de tissu authentifié.","https://www.aelf.org/bible/Mt/27"],
      ["Deux moments distincts","RECROISEMENT\nLe premier récit rapporte aussi le partage des vêtements au lieu du supplice. Le vêtement de dérision et le partage ultérieur appartiennent à deux moments du récit.\n\nUSELESS : Même les vêtements ont une chronologie.",sources.marc],
    ],
    question:"Que faut-il comparer ?",
    choices:["Les récits et leurs différences","Une pièce supposée authentique"],correct:0,
    result:"On compare les textes et les étapes. Le vêtement présenté dans le jeu est une reconstitution.",
  },
  {
    title:"EPSILON — L’argent de l’intermédiaire",
    intro:"Une bourse attend dans les archives.\n\nANGE : Enfin de la comptabilité.\nUSELESS : Tu as l’air beaucoup trop heureux.",
    clues:[
      ["La somme","RÉCIT DU DOSSIER\nUn autre récit rapporte que l’intermédiaire rend trente pièces d’argent après la condamnation de la victime. Le récit ne fournit pas un reçu archéologique.","https://www.aelf.org/bible/Mt/27"],
      ["Le champ","RÉCIT DU DOSSIER\nUn autre récit raconte l’achat du champ du potier avec l’argent rendu. Le texte relie ce champ à la sépulture des étrangers.","https://www.aelf.org/bible/Mt/27"],
      ["L’autre formulation","COMPARAISON\nUne troisième version évoque un accord financier avec l’intermédiaire, sans chiffrer la somme dans ce passage. Une précision d’un récit ne devient pas automatiquement celle de tous les autres.","https://www.aelf.org/bible/Lc/22"],
    ],
    question:"Comment noter les trente pièces ?",
    choices:["Comme un montant donné par un autre récit","Comme un reçu retrouvé sur place"],correct:0,
    result:"Le montant est attribué à son récit. La bourse du décor est un accessoire de l’enquête.",
  },
  {
    title:"ZÊTA — Le bois et le sang",
    intro:"Le chemin du supplice, reconstitué dans le dossier.\n\nUSELESS : Une tache rouge suffit ?\nANGE : Pour salir ton carnet, oui. Pour identifier quelqu’un, non.",
    clues:[
      ["Le bois du supplice","RÉCIT DU DOSSIER\nLe premier récit raconte que un passant est réquisitionné pour porter le bois du supplice. Ce passage ne précise pas l’essence du bois et n’authentifie aucun fragment conservé.",sources.marc],
      ["Les blessures","RÉCIT DU DOSSIER\nLe premier récit évoque flagellation, blessures à la tête et coups. Ces violences appartiennent au récit. Il ne décrit pas une collecte de gouttes de sang pour expertise.",sources.marc],
      ["La trace rouge","RECONSTITUTION DU JEU\nUne marque rouge dans le décor est un indice scénarisé. Sans provenance ni analyse, on ne peut l’attribuer à la victime.\n\nUSELESS : Le laboratoire céleste demande aussi une étiquette ?\nANGE : Deux exemplaires.",""],
    ],
    question:"Que peut-on certifier sur cette trace ?",
    choices:["L’identité de la victime par sa couleur","Son attribution reste inconnue"],correct:1,
    result:"L’origine d’une trace ou d’un fragment doit être établie. Le décor ne constitue pas une preuve matérielle authentifiée.",
  },
);
chapters[chapters.length-1].title="ÊTA — Le rapport";

export class InvestigationScene extends Phaser.Scene {
  private chapter=0;
  private evidence=new Set<string>();
  private links=new Set<string>();
  private notebookButton?:Phaser.GameObjects.Text;
  private notebook?:Phaser.GameObjects.Container;

  private read=new Set<number>();
  private body!:Phaser.GameObjects.Text;
  private buttons!:Phaser.GameObjects.Container;
  constructor(){super("InvestigationScene");}
  create():void {this.chapter=0;this.evidence.clear();this.links.clear();this.showGolgotha();}

  private showGolgotha():void {
    this.children.removeAll();
    this.cameras.main.setZoom(1).setScroll(0,0).setBackgroundColor("#100f20");
    const art=this.add.graphics();
    art.fillGradientStyle(0x100e20,0x211329,0x30313e,0x141b28,1);
    art.fillRect(0,0,360,640);
    art.fillStyle(0xb62b47,0.09).fillCircle(264,130,69);
    art.fillStyle(0xa83c4b).fillCircle(264,130,39);
    art.fillStyle(0x652e40,0.6).fillEllipse(253,122,19,13).fillEllipse(278,142,16,22);
    art.fillStyle(0xdb7968,0.35).fillEllipse(258,107,27,9);
    const aurora=this.add.graphics();
    for(let i=0;i<14;i++){
      aurora.lineStyle(3, i%2?0x6d7f87:0x88566d,0.055);
      aurora.beginPath();
      aurora.moveTo(-30,85+i*5);
      aurora.lineTo(70,125+i*4);
      aurora.lineTo(166,92+i*6);
      aurora.lineTo(390,190+i*3);
      aurora.strokePath();
    }
    this.tweens.add({targets:aurora,alpha:0.35,duration:2800,yoyo:true,repeat:-1});
    const clouds=this.add.graphics();
    for(let i=0;i<12;i++){
      clouds.fillStyle(0x37333e,0.6).fillEllipse((i*91)%430-35,165+(i%3)*33,180,36);
    }
    this.tweens.add({targets:clouds,x:18,duration:8500,yoyo:true,repeat:-1});
    art.fillStyle(0x151b23).fillTriangle(0,470,130,330,275,480);
    art.fillStyle(0x192029).fillTriangle(90,480,315,345,390,495);
    art.fillStyle(0x10171e).fillRect(0,470,360,170);
    // Dark trunks frame the evidence without revealing the victim.
    for(const x of [12,52,310,348]){
      art.lineStyle(9,0x0b1118).lineBetween(x,480,x-5,250);
      art.lineStyle(4,0x0b1118).lineBetween(x-3,307,x-30,274);
      art.lineBetween(x-3,335,x+24,293);
    }
    const wood=this.add.graphics();
    wood.fillStyle(0x30242b);
    wood.beginPath();wood.moveTo(74,460);wood.lineTo(283,427);
    wood.lineTo(295,448);wood.lineTo(82,489);wood.closePath();wood.fillPath();
    wood.lineStyle(2,0x766052).lineBetween(86,465,278,436);
    wood.lineStyle(1,0x51413c).lineBetween(91,479,279,444);
    for(const stain of [{x:132,y:463,w:28},{x:186,y:451,w:45},{x:249,y:444,w:18}]){
      wood.fillStyle(0x591e2c).fillEllipse(stain.x,stain.y,stain.w,10);
      wood.fillStyle(0x833043,0.7).fillEllipse(stain.x-3,stain.y-2,stain.w*0.5,3);
    }
    for(let i=0;i<29;i++){
      const x=83+i*7,y=466-(x-83)*0.17;
      wood.fillStyle(i%3?0x997750:0x201c23,0.65).fillRect(x,y+i%3*4,4,1);
    }
    wood.lineStyle(1,0x282128).strokeEllipse(222,448,12,5);
    wood.fillStyle(0x591e2c).fillEllipse(175,496,7,4).fillEllipse(195,503,4,3);
    this.add.text(24,35,"ALPHA — GOLGOTHA",{
      fontFamily:"monospace",fontSize:"18px",color:"#d4c4c3",
    });
    const text=this.add.text(24,548,"Du bois souillé de sang.\nUne victime sans nom.\n\nToucher le bois pour examiner.",{
      fontFamily:"monospace",fontSize:"13px",color:"#dccbca",lineSpacing:5,
      wordWrap:{width:310},
    });
    const evidence=this.add.rectangle(183,459,238,75,0xffffff,0.001)
      .setInteractive({useHandCursor:true});
    const thorn=this.add.graphics().setVisible(false);
    thorn.fillStyle(0xc6ac7f).fillTriangle(192,451,209,423,201,452);
    thorn.lineStyle(1,0x594438).lineBetween(196,449,209,423);
    thorn.fillStyle(0x6b2534).fillEllipse(198,449,6,3);
    const thornHit=this.add.rectangle(201,439,48,54,0xffffff,0.001)
      .setVisible(false);
    const purse=this.add.graphics().setVisible(false);
    purse.fillStyle(0x624936).fillEllipse(281,506,29,29);
    purse.fillStyle(0x8e6b48).fillTriangle(269,493,291,493,286,508);
    purse.lineStyle(2,0xc5a978).lineBetween(272,497,289,497);
    purse.fillStyle(0xd5d9e0).fillCircle(273,519,4).fillCircle(286,517,4);
    const purseHit=this.add.rectangle(281,507,52,50,0xffffff,0.001).setVisible(false);
    evidence.once("pointerdown",()=>{
      this.evidence.add("Bois ensanglanté");
      audio.play("tap");
      text.setText("USELESS : Qui a subi une telle atrocité… et perdu tout ce sang ?");
      this.time.delayedCall(4500,()=>{
        evidence.disableInteractive();
        thorn.setVisible(true);
        thornHit.setVisible(true).setInteractive({useHandCursor:true});
        text.setText("Quelque chose dépasse du bois…\n\nToucher pour examiner.");
      });
    });
    thornHit.once("pointerdown",()=>{
      this.evidence.add("Épine");
      thornHit.disableInteractive();
      audio.play("confirm");
      text.setText("USELESS : Une épine… Elle était coincée dans le bois.\n\nNouvel indice recueilli.");
      this.time.delayedCall(4000,()=>{
        purse.setVisible(true);
        purseHit.setVisible(true).setInteractive({useHandCursor:true});
        text.setText("Une bourse dépasse de la poussière, près du bois.\n\nToucher pour l’ouvrir.");
      });
    });
    purseHit.once("pointerdown",()=>{
      this.evidence.add("Trente pièces");
      purseHit.disableInteractive();
      audio.play("confirm");
      text.setText("USELESS : Trente pièces d’argent…\nAucun nom. À qui appartenait cette bourse ?");
      this.time.delayedCall(4500,()=>{
        this.tweens.killTweensOf([aurora,clouds]);
        text.setText("Un sentier s’enfonce dans la forêt…");
        const path=this.add.text(180,359,"AVANCER DANS LA FORÊT →",{
          fontFamily:"monospace",fontSize:"12px",color:"#dae7dc",
          backgroundColor:"#293a3c",padding:{x:12,y:12},
        }).setOrigin(0.5).setInteractive({useHandCursor:true});
        path.once("pointerdown",()=>this.showGarden());
      });
    });
    detailInvestigation(this,"forest");
  }

  private showGarden():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#111c24");
    const garden=this.add.graphics();
    garden.fillGradientStyle(0x141c2a,0x241a2c,0x26392e,0x1a2825,1);
    garden.fillRect(0,0,360,640);
    garden.fillStyle(0x9c424b,0.6).fillCircle(282,97,28);
    for(const x of [18,77,288,347]){
      garden.lineStyle(17,0x161d20).lineBetween(x,480,x-12,205);
      garden.lineStyle(7,0x161d20).lineBetween(x-7,294,x-39,254);
      garden.lineBetween(x-5,325,x+33,273);
      garden.fillStyle(0x263b32).fillEllipse(x,213,116,80);
      garden.fillStyle(0x314539,0.7).fillEllipse(x-15,198,74,40);
    }
    garden.fillStyle(0x364235).fillEllipse(181,474,286,90);
    garden.fillStyle(0x57604a,0.3).fillEllipse(180,470,180,50);
    for(let i=0;i<35;i++){
      garden.lineStyle(1,0x697057,0.45).lineBetween((i*47)%360,490+i%7,(i*47)%360+3,483+i%7);
    }
    this.add.text(24,35,"ALPHA — GAT SHEMANIM",{
      fontFamily:"monospace",fontSize:"18px",color:"#d6d8c5",
    });
    const hero=this.add.image(45,453,"hero");
    this.tweens.add({targets:hero,x:117,duration:1800,ease:"Sine.inOut"});
    const message=this.add.text(24,542,"Le jardin de Gat Shemanim. Deux hommes dorment profondément. Des pas ont piétiné le chemin.",{
      fontFamily:"monospace",fontSize:"13px",color:"#e2decb",
      wordWrap:{width:310},lineSpacing:6,
    });
    let examinedSleepers=false;
    let foundEar=false;
    let exit:Phaser.GameObjects.Text|undefined;
    const unlock=()=>{
      if(!examinedSleepers||!foundEar||exit)return;
      exit=this.add.text(180,315,"CONFRONTER LES INDICES",{
        fontFamily:"monospace",fontSize:"12px",color:"#d9ece6",
        backgroundColor:"#344558",padding:{x:12,y:12},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      exit.once("pointerdown",()=>{
        this.showPilatos();
      });
    };
    for(const [index,x] of [85,269].entries()){
      const sleeper=this.add.graphics();
      sleeper.fillStyle(index?0x6a6059:0x626c79).fillRoundedRect(x-30,464,64,22,9);
      sleeper.fillStyle(0xba967d).fillCircle(x-34,466,10);
      sleeper.lineStyle(2,0x443c3b).lineBetween(x-40,465,x-34,466);
      this.add.text(x-9,439,"z Z",{fontSize:"12px",color:"#a9bbbd"});
      this.add.rectangle(x,468,100,51,0xffffff,0.001).setInteractive({useHandCursor:true})
        .on("pointerdown",()=>{
          examinedSleepers=true;
          message.setText("USELESS : Hé… Vous m’entendez ?\nIls sont trop épuisés pour se réveiller. Un murmure, puis le silence.");
          this.tweens.add({targets:sleeper,y:-1,duration:250,yoyo:true});
          unlock();
        });
    }
    const ear=this.add.graphics();
    ear.fillStyle(0x662b36).fillEllipse(185,488,20,7);
    ear.fillStyle(0xc29c83).fillEllipse(183,481,9,14);
    ear.lineStyle(2,0x805b53).strokeEllipse(184,481,4,8);
    this.add.rectangle(184,483,42,38,0xffffff,0.001).setInteractive({useHandCursor:true})
      .once("pointerdown",()=>{
        foundEar=true;
        this.evidence.add("Oreille");
        ear.setVisible(false);
        audio.play("confirm");
        message.setText("USELESS : Une oreille… ensanglantée.\nÀ qui appartient-elle ?\nDes hommes sont venus chercher quelqu’un ici. Qui ont-ils emmené ?");
        unlock();
      });
    detailInvestigation(this,"garden");
  }

  private showPilatos():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#242335");
    const room=this.add.graphics();
    room.fillStyle(0x70615a).fillRect(0,170,360,350);
    room.fillStyle(0x39333b).fillRect(0,510,360,130);
    room.fillStyle(0x302c3b).fillRoundedRect(112,145,136,238,60);
    for(const x of [31,304]){
      room.fillStyle(0xa69a86).fillRect(x,174,24,329);
      room.fillStyle(0xc4b59b).fillRect(x-7,166,38,16).fillRect(x-7,495,38,16);
      room.fillStyle(0x776d65).fillRect(x+17,183,5,311);
    }
    room.fillStyle(0x642b39).fillRect(119,182,25,204).fillRect(217,182,25,204);
    const pilate=this.add.graphics();
    pilate.fillStyle(0xd3b18f).fillCircle(181,328,16);
    pilate.fillStyle(0x423c3d).fillEllipse(181,316,33,14);
    pilate.fillStyle(0xe1d7bf).fillTriangle(181,344,149,452,211,452);
    pilate.lineStyle(9,0xbfa890).lineBetween(166,362,180,397);
    pilate.lineBetween(197,362,188,397);
    pilate.lineStyle(4,0x824451).lineBetween(166,349,197,446);
    const basin=this.add.graphics();
    basin.fillStyle(0x807f82).fillRect(166,413,32,53);
    basin.fillStyle(0xbcb9ad).fillEllipse(183,407,75,24);
    basin.fillStyle(0x80a8b4).fillEllipse(183,402,58,13);
    detailFigure(pilate,"governor");
    detailBasin(basin);
    const washing=this.add.graphics();
    washing.lineStyle(2,0xc7e6e9,0.8).lineBetween(181,394,177,404);
    washing.lineBetween(188,394,192,405);
    this.tweens.add({targets:washing,alpha:0.15,y:3,duration:450,yoyo:true,repeat:-1});
    this.add.image(83,475,"hero");
    this.add.text(24,35,"LA DEMEURE DU GOUVERNEUR",{
      fontFamily:"monospace",fontSize:"17px",color:"#e9d1a6",
    });
    const message=this.add.text(24,540,"Un homme se lave les mains.\n\nUSELESS : Il a quelque chose à se reprocher ?",{
      fontFamily:"monospace",fontSize:"13px",color:"#ede3d2",wordWrap:{width:310},lineSpacing:5,
    });
    let step=0;
    let basinCollected=false;
    const basinHit=this.add.rectangle(183,412,84,66,0xffffff,0.001);
    const lines=[
      "USELESS : Qu’avez-vous fait à cet homme ?",
      "LE GOUVERNEUR : Moi, je n’ai rien fait. Je m’en lave les mains, de ce sang.",
      "LE GOUVERNEUR : Allez voir au temple. Ils sont tous là-bas.",
      "USELESS : Le savon enlève les taches. Pour les responsabilités, je vais vérifier le dossier.",
      "CARNET : Le gouverneur est une personne à interroger. Son geste ne suffit pas à établir son rôle exact.",
    ];
    const talk=this.add.rectangle(183,374,116,169,0xffffff,0.001)
      .setInteractive({useHandCursor:true});
    talk.on("pointerdown",()=>{
      audio.play("tap");
      message.setText(lines[step]);
      step++;
      if(step<lines.length)return;
      talk.disableInteractive();
      message.setText("USELESS : Je prends le lave-mains comme pièce à conviction.\nLE GOUVERNEUR : Et je me lave les mains où, maintenant ?");
      basinHit.setInteractive({useHandCursor:true});
    });
    basinHit.once("pointerdown",()=>{
      if(basinCollected)return;
      basinCollected=true;
      this.evidence.add("Lave-mains");
      basinHit.disableInteractive();
      this.tweens.killTweensOf(washing);
      basin.setVisible(false);
      washing.setVisible(false);
      audio.play("confirm");
      message.setText("PIÈCE À CONVICTION RECUEILLIE\nLe lave-mains du gouverneur.\nUSELESS : Il faudra un plus grand sac.");
      const next=this.add.text(180,485,"SORTIR VERS LE TEMPLE →",{
        fontFamily:"monospace",fontSize:"12px",color:"#d9ece6",
        backgroundColor:"#344558",padding:{x:12,y:12},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      next.once("pointerdown",()=>{
        this.tweens.killTweensOf(washing);
        this.showTemple();
      });
    });
    detailInvestigation(this,"palace");
  }

  private showTemple():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#292333");
    const temple=this.add.graphics();
    temple.fillStyle(0x8f7d67).fillRect(24,162,312,282);
    temple.fillStyle(0xb2a087).fillTriangle(12,168,180,88,348,168);
    temple.fillStyle(0x332b31).fillRect(139,235,82,180);
    for(const x of [43,99,239,295]){
      temple.fillStyle(0xc4b395).fillRect(x,187,21,233);
      temple.fillStyle(0x80715f).fillRect(x+16,190,5,230);
      temple.fillStyle(0xd6c4a4).fillRect(x-5,180,31,12);
    }
    for(let i=0;i<4;i++){
      temple.fillStyle(i%2?0x766959:0x95846c).fillRect(17-i*5,421+i*13,326+i*10,13);
    }
    for(let i=0;i<12;i++){
      const x=38+(i%6)*55,y=405+Math.floor(i/6)*62;
      temple.fillStyle([0x5a5365,0x797260,0x696379][i%3]).fillTriangle(x,y+10,x-17,y+57,x+18,y+57);
      temple.fillStyle(0xbc987c).fillCircle(x,y,9);
      temple.fillStyle(0x3c3334).fillEllipse(x,y-7,20,9);
    }
    this.add.image(31,518,"hero");
    this.add.text(24,32,"DEVANT LE TEMPLE",{
      fontFamily:"monospace",fontSize:"18px",color:"#e0c7a4",
    });
    const message=this.add.text(24,546,"La foule parle bruyamment.\nLes voix se coupent et se répondent.",{
      fontFamily:"monospace",fontSize:"13px",color:"#efe3cc",
      wordWrap:{width:310},lineSpacing:5,
    });
    const claims=[
      "UNE VOIX : C’était un fou ! Un blasphémateur !",
      "UNE AUTRE : Un brigand !",
      "DANS LA FOULE : Il ne respectait même pas le sabbat !",
      "UN HOMME : Il était petit, barbu, et traînait avec des gens de mauvaise vie.",
      "UN AUTRE : Petit ? Il était grand, barbu ! On le voyait parmi les malades et les mendiants.",
      "UNE VOIX AU FOND : Il nous donnait à manger… et il nous a guéris.",
      "USELESS : Petit ou grand ? Vous parlez bien du même homme ?\nLa foule hésite, puis chacun reprend sa version.",
      "USELESS : Vous l’avez vu faire quoi, exactement ?\nLes voix se recouvrent. Personne ne répond clairement.",
      "CARNET : Accusations entendues. Il reste à trouver des témoins et à vérifier leurs récits.",
      "UNE VOIX : Allez voir vous-même à Golgotha. Vous pourrez vous faire votre propre idée.",
    ];
    const heard=new Set<number>();
    const stopNoise=audio.whisper(8,0.75);
    const witnesses=[
      {x:65,claims:[claims[0],claims[3],"USELESS : Vous l’avez vu ?\nTÉMOIN : Non… c’est ce qu’on m’a raconté."]},
      {x:175,claims:[claims[4],"USELESS : Vous étiez sur place ?\nTÉMOIN : Oui. Je l’ai vu parmi les malades et les mendiants."]},
      {x:285,claims:[claims[5],"USELESS : Vous parlez de votre expérience ?\nTÉMOIN : Oui. Il nous a aidés."]},
    ];
    witnesses.forEach((witness,index)=>{
      const actions=this.add.text(witness.x,490,["RUMEUR","OBSERVATEUR","AIDÉ"][index],{
        fontFamily:"monospace",fontSize:"10px",color:"#e9ddc4",backgroundColor:"#3b3646",padding:{x:4,y:8},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      let turn=0;
      actions.on("pointerdown",()=>{
        stopNoise();
        message.setText(witness.claims[turn]);
        turn++;
        if(turn<witness.claims.length)return;
        turn=0;
        heard.add(index);
        this.evidence.add(["Rumeur","Témoin des malades","Témoin aidé"][index]);
        actions.setColor("#aee3cb");
        if(heard.size!==3)return;
        const next=this.add.text(180,120,"DEMANDER OÙ ALLER",{
          fontFamily:"monospace",fontSize:"12px",color:"#dceee3",backgroundColor:"#344558",padding:{x:12,y:12},
        }).setOrigin(0.5).setInteractive({useHandCursor:true});
        next.once("pointerdown",()=>{
          message.setText("UNE VOIX : Allez voir vous-même à Golgotha.");
          next.setText("RETOURNER À GOLGOTHA →").once("pointerdown",()=>this.showGolgothaReturn());
        });
      });
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>stopNoise());

    detailInvestigation(this,"temple");
  }

  private showGolgothaReturn():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#b2c5cf");
    const ground=this.add.graphics();
    ground.fillStyle(0x8d846f).fillTriangle(0,520,205,318,360,520);
    ground.fillStyle(0x6e7166).fillRect(0,520,360,120);
    this.add.circle(280,88,30,0xffedba,0.7);
    this.add.text(24,28,"GOLGOTHA — AU JOUR",{
      fontFamily:"monospace",fontSize:"16px",color:"#253644",
    });
    const wood=this.add.graphics();
    wood.fillStyle(0x563d30).fillRect(-10,-231,20,231).fillRect(-65,-180,130,18);
    wood.lineStyle(2,0x9b7852).lineBetween(-6,-225,-6,-5);
    wood.lineBetween(-59,-176,58,-176);
    wood.fillStyle(0x241e20).fillCircle(-48,-171,4).fillCircle(48,-171,4).fillCircle(0,-37,4);
    wood.fillStyle(0x702d37).fillEllipse(-48,-165,9,16).fillEllipse(48,-165,9,16).fillEllipse(0,-31,9,18);
    detailCross(wood);
    const cross=this.add.container(162,510,[wood]).setDepth(8);
    const sign=this.add.text(162,285,"LE ROI DES JUIFS",{
      fontFamily:"monospace",fontSize:"10px",color:"#302b28",
      backgroundColor:"#d3ba86",padding:{x:7,y:5},
    }).setOrigin(0.5).setDepth(10);
    const guards=this.add.container(0,0).setDepth(9);
    for(const x of [225,280]){
      const guard=this.add.graphics();
      guard.fillStyle(0x863b45).fillTriangle(x,414,x-17,485,x+17,485);
      guard.fillStyle(0xb8a28e).fillCircle(x,407,11);
      guard.fillStyle(0x626f7b).fillEllipse(x,399,27,15);
      guard.lineStyle(7,0x434653).lineBetween(x-9,480,x-10,508);
      guard.lineBetween(x+9,480,x+10,508);
      guards.add(guard);
    }
    const tunic=this.add.graphics().setDepth(10);
    tunic.fillStyle(0x743b77);
    tunic.beginPath();tunic.moveTo(276,466);tunic.lineTo(289,458);
    tunic.lineTo(305,465);tunic.lineTo(315,481);tunic.lineTo(306,486);
    tunic.lineTo(304,508);tunic.lineTo(280,508);tunic.lineTo(280,485);
    tunic.lineTo(270,482);tunic.closePath();tunic.fillPath();
    tunic.lineStyle(2,0xb676a2).lineBetween(288,475,286,501);
    const wedge=this.add.triangle(176,509,0,10,22,10,19,0,0xbe9861).setDepth(11);
    const hero=this.add.image(72,507,"hero").setDepth(12);
    const message=this.add.text(24,548,"Deux gardes démontent une pancarte.\nUne tunique pourpre repose près d’eux.\nUne cale maintient la croix à sa base.",{
      fontFamily:"monospace",fontSize:"13px",color:"#fff0db",
      wordWrap:{width:310},lineSpacing:5,
    });
    this.tweens.add({targets:sign,y:307,angle:4,duration:2200,yoyo:true,repeat:-1});
    this.add.text(25,95,"OBSERVER",{
      fontFamily:"monospace",fontSize:"11px",color:"#233744",backgroundColor:"#d6d3bf",padding:{x:6,y:8},
    }).setInteractive({useHandCursor:true}).on("pointerdown",()=>message.setText("USELESS : Ces trous… Ce sang. Quelle souffrance. La cale retient tout le poids du bois."));
    this.add.text(25,130,"INTERROGER",{
      fontFamily:"monospace",fontSize:"11px",color:"#233744",backgroundColor:"#d6d3bf",padding:{x:6,y:8},
    }).setInteractive({useHandCursor:true}).on("pointerdown",()=>message.setText("GARDE : On décroche la pancarte. Circulez.\nUSELESS : Très accueillants, les lieux de mémoire."));
    this.add.text(25,165,"PRENDRE LA CROIX",{
      fontFamily:"monospace",fontSize:"11px",color:"#233744",backgroundColor:"#d6d3bf",padding:{x:6,y:8},
    }).setInteractive({useHandCursor:true}).on("pointerdown",()=>message.setText("USELESS : Elle rentre dans mon sac ?\nMême le lave-mains trouve cette idée excessive."));
    let guardsStunned=false;
    const garmentHit=this.add.rectangle(292,485,46,54,0xffffff,0.001)
      .setDepth(15).setInteractive({useHandCursor:true});
    garmentHit.on("pointerdown",()=>{
      if(!guardsStunned){
        message.setText("GARDE : Pose ça. On n’a pas terminé.\nUSELESS : Je vois. Il faut trouver une diversion.");
        return;
      }
      this.evidence.add("Tunique pourpre");
      garmentHit.disableInteractive();
      tunic.setVisible(false);
      audio.play("confirm");
      message.setText("PIÈCE RECUEILLIE — TUNIQUE POURPRE\nUSELESS : Une tenue, des trous et du sang.\nIl faut recouper tout ça.");
      const next=this.add.text(180,120,"REGARDER LE LIEU DU SUPPLICE",{
        fontFamily:"monospace",fontSize:"12px",color:"#e8f4eb",
        backgroundColor:"#344558",padding:{x:12,y:12},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      next.once("pointerdown",()=>{
        const lines=[
          "Useless regarde les trous dans le bois. Il imagine les hommes exposés ici, nus, à la vue de tous.",
          "USELESS : Toute cette souffrance… et cette humiliation. C’est horrible. Quelle tristesse.",
          "USELESS : Mais… où est le mort ?",
          "DES GENS, SUR LE CHEMIN : On l’a déposé au tombeau.",
          "USELESS : Bien. Allons au tombeau faire une autopsie.",
        ];
        let line=0;
        next.setText("CONTINUER");
        next.removeAllListeners("pointerdown");
        message.setText(lines[line++]);
        next.on("pointerdown",()=>{
          if(line<lines.length){message.setText(lines[line++]);return;}
          this.tweens.killAll();
          this.showTomb();
        });
      });
    });
    this.add.rectangle(176,509,38,30,0xffffff,0.001).setDepth(15)
      .setInteractive({useHandCursor:true}).once("pointerdown",function(this:Phaser.GameObjects.Rectangle){
        this.disableInteractive();
        hero.setX(113);
        audio.play("rock");
        wedge.scene.tweens.add({targets:wedge,x:117,angle:-60,duration:400});
        message.setText("La cale glisse… Le bois craque !");
        cross.scene.tweens.killTweensOf(sign);
        cross.scene.tweens.add({targets:cross,angle:78,delay:450,duration:800,ease:"Sine.in",
          onComplete:()=>{
            guardsStunned=true;
            audio.play("bridge");
            guards.setScale(1,0.6).setY(204);
            sign.setPosition(320,505).setAngle(12);
            for(const x of [225,280]){
              const stars=cross.scene.add.text(x,444,"✦  ✧",{fontSize:"18px",color:"#ffe099"}).setDepth(16);
              cross.scene.tweens.add({targets:stars,angle:15,y:438,duration:650,yoyo:true,repeat:-1});
            }
            message.setText("BONK ! Les gardes sont sonnés.\nLa tunique est à portée de main.");
          },
        });
      });
    detailInvestigation(this,"hill");
  }

  private showTomb():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#8e9d9f");
    const tomb=this.add.graphics();
    tomb.fillStyle(0x5e6863).fillEllipse(190,430,370,290);
    tomb.fillStyle(0x737c70).fillEllipse(182,406,296,237);
    tomb.fillStyle(0x1b252a).fillRoundedRect(153,394,80,129,37);
    tomb.fillStyle(0x4e5a53).fillRect(0,521,360,119);
    tomb.fillStyle(0x92998a).fillCircle(270,480,47);
    tomb.lineStyle(3,0x697266).strokeCircle(270,480,37);
    this.add.image(94,506,"hero");
    createFutureMonkey(this,133,481).setScale(0.65);
    createBeachCharacter(this,308,492,"penguin").setScale(0.7);
    this.add.text(24,35,"LE CHEMIN DU TOMBEAU",{
      fontFamily:"monospace",fontSize:"17px",color:"#1b2b37",
    });
    this.add.text(24,549,"Les deux versions de Pinkwindkis attendent.\nPINKWINDKIS : Il n’est plus ici.\nPINGOUIN : Je l’avais dit avant toi.\nPINKWINDKIS : Je facture l’enquête.\nPINGOUIN : Moi, les déplacements.",{
      fontFamily:"monospace",fontSize:"13px",color:"#eee5d4",lineSpacing:5,
      wordWrap:{width:310},
    });
    const notebook=this.add.text(180,120,"ENTRER DANS LE TOMBEAU →",{
      fontFamily:"monospace",fontSize:"12px",color:"#e2eee6",
      backgroundColor:"#344558",padding:{x:12,y:12},
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    notebook.once("pointerdown",()=>{
      this.showEmptyTomb();
    });
    detailInvestigation(this,"tomb");
  }

  private showEmptyTomb():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#161d26");
    const chamber=this.add.graphics();
    chamber.fillStyle(0x454a4c).fillRoundedRect(22,112,316,384,70);
    chamber.fillStyle(0x252e35).fillRoundedRect(42,135,276,333,60);
    chamber.fillStyle(0x555b5b).fillRect(0,490,360,150);
    chamber.fillStyle(0x747973).fillRect(115,396,204,54);
    chamber.fillStyle(0x91958a).fillEllipse(216,397,207,25);
    const shroud=this.add.graphics();
    shroud.fillStyle(0xebece3);
    shroud.beginPath();shroud.moveTo(141,386);shroud.lineTo(177,378);
    shroud.lineTo(214,386);shroud.lineTo(251,380);shroud.lineTo(296,390);
    shroud.lineTo(278,417);shroud.lineTo(241,408);shroud.lineTo(215,420);
    shroud.lineTo(180,409);shroud.lineTo(152,423);shroud.closePath();shroud.fillPath();
    shroud.lineStyle(2,0xa4afb0).lineBetween(174,387,166,409);
    shroud.lineBetween(213,391,203,410);shroud.lineBetween(251,387,245,405);
    this.add.image(64,472,"hero");
    this.add.text(24,35,"LE TOMBEAU VIDE",{
      fontFamily:"monospace",fontSize:"18px",color:"#d5d9d4",
    });
    const message=this.add.text(24,550,"Aucun corps sur la pierre.\nUn linceul blanc est resté là.",{
      fontFamily:"monospace",fontSize:"13px",color:"#eee5d4",
      lineSpacing:6,wordWrap:{width:310},
    });
    const shroudHit=this.add.rectangle(218,402,205,64,0xffffff,0.001);
    message.setAlpha(0);
    this.time.delayedCall(3500,()=>{
      this.tweens.add({targets:message,alpha:1,duration:1200});
      shroudHit.setInteractive({useHandCursor:true});
    });
    shroudHit.once("pointerdown",()=>{
        this.evidence.add("Linceul blanc");
        audio.play("confirm");
        message.setText("USELESS : Le tombeau est vide…\nEt ce linceul blanc ?\nOù est passé le corps ?");
        const next=this.add.text(180,120,"SORTIR DU TOMBEAU →",{
          fontFamily:"monospace",fontSize:"12px",color:"#e2eee6",
          backgroundColor:"#344558",padding:{x:12,y:12},
        }).setOrigin(0.5).setInteractive({useHandCursor:true});
        next.once("pointerdown",()=>{
          this.showTomb();
          this.add.rectangle(180,589,360,102,0x4e5a53).setDepth(30);
          this.add.text(24,552,"USELESS : J’ai compris…\nJ’ai résolu l’affaire !",{
            fontFamily:"monospace",fontSize:"15px",color:"#fff0d4",lineSpacing:8,
          }).setDepth(31);
          this.children.list.filter(object=>object instanceof Phaser.GameObjects.Text&&object.text==="ENTRER DANS LE TOMBEAU →")
            .forEach(object=>object.destroy());
          const report=this.add.text(180,120,"EXPOSER LA CONCLUSION",{
            fontFamily:"monospace",fontSize:"12px",color:"#e2eee6",
            backgroundColor:"#344558",padding:{x:12,y:12},
          }).setOrigin(0.5).setInteractive({useHandCursor:true});
          report.once("pointerdown",()=>{
            this.showParadiseConclusion();
          });
        });
      });
    detailInvestigation(this,"chamber");
  }

  private showParadiseConclusion():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#b8cadc").fadeIn(800,245,241,222);
    const sky=this.add.graphics();
    sky.fillStyle(0xfff1bc,0.12).fillCircle(180,205,120);
    sky.fillStyle(0xfff8de,0.25).fillCircle(180,205,75);
    sky.fillStyle(0xffffff,0.85).fillEllipse(180,202,24,90);
    for(let i=0;i<12;i++){
      sky.fillStyle(0xffffff,0.65).fillEllipse((i*91)%400-20,255+(i%4)*64,145,43);
    }
    this.add.image(74,420,"hero");
    createFutureMonkey(this,297,413).setScale(0.7);
    this.add.ellipse(297,333,31,9).setStrokeStyle(3,0xf3d77f);
    const jesus=this.add.graphics().setVisible(false);
    jesus.fillStyle(0xf4eee1).fillTriangle(200,342,163,438,238,438);
    jesus.fillStyle(0xcba27f).fillCircle(200,326,15);
    jesus.fillStyle(0x59483d).fillEllipse(200,317,32,16);
    jesus.fillStyle(0x59483d).fillTriangle(188,332,212,332,200,346);
    jesus.lineStyle(8,0xcba27f).lineBetween(186,361,161,378);
    jesus.lineBetween(215,361,240,378);
    jesus.fillStyle(0x814550).fillCircle(160,378,2).fillCircle(241,378,2);
    jesus.fillStyle(0xcba27f).fillEllipse(218,383,11,15);
    jesus.lineStyle(2,0x814550).lineBetween(216,380,220,385);
    detailFigure(jesus,"jesus");
    this.add.text(180,35,"LE RAPPORT AU PARADIS",{
      fontFamily:"monospace",fontSize:"17px",color:"#37465c",
    }).setOrigin(0.5);
    const evidence=this.add.text(180,126,"",{
      fontFamily:"monospace",fontSize:"18px",color:"#644650",
      backgroundColor:"#f0e7d2",padding:{x:14,y:12},
    }).setOrigin(0.5).setVisible(false);
    this.add.rectangle(180,529,336,178,0x27334b,0.96).setStrokeStyle(2,0xe7c889);
    const dialogue=this.add.text(26,455,"",{
      fontFamily:"monospace",fontSize:"13px",color:"#fff0d8",
      wordWrap:{width:306},lineSpacing:6,
    });
    const lines=[
      ["LE BOIS ET L’ÉPINE","USELESS : Du bois percé, du sang, et cette épine coincée dedans."],
      ["TRENTE PIÈCES D’ARGENT","USELESS : Une bourse contenant exactement trente pièces d’argent."],
      ["LE LAVE-MAINS","USELESS : Le gouverneur se lavait les mains et renvoyait tout le monde au temple."],
      ["LA TUNIQUE POURPRE","USELESS : Une tunique pourpre. Et la pancarte : « Le roi des Juifs »."],
      ["LE LINCEUL BLANC","USELESS : Enfin, un tombeau vide et un linceul blanc."],
      ["","USELESS : C’est Jésus. Il peut confirmer mes dires. Appelez-le, s’il vous plaît."],
      ["","DIEU : Je suis !"],
      ["","Jésus apparaît. Useless voit les marques à ses mains et son côté percé."],
      ["","USELESS : Ben voilà ! Maintenant, je crois. Il fallait commencer par ça ! On aurait gagné du temps."],
      ["","JÉSUS : Plus heureux ceux qui ont cru sans voir. Par la foi, ils ont une place avec moi au paradis et la vie éternelle."],
      ["","USELESS : Mais moi, qui ai fait plein de bêtises… j’ai une place aussi ?"],
      ["","JÉSUS : Je t’ai appelé et tu as répondu. Tu as déjà beaucoup changé en bien, et ton cœur est vrai."],
    ];
    let index=0;
    let stopWhispers:(()=>void)|undefined;
    const show=()=>{
      stopWhispers?.();
      evidence.setText(lines[index][0]).setVisible(Boolean(lines[index][0]));
      dialogue.setText(lines[index][1]);
      stopWhispers=audio.whisper(Math.min(6,lines[index][1].length*0.04));
      if(index===7){
        jesus.setVisible(true).setAlpha(0);
        audio.play("portal");
        this.tweens.add({targets:jesus,alpha:1,duration:1100});
      }
    };
    show();
    const next=this.add.text(180,597,"[ CONTINUER ]",{
      fontFamily:"monospace",fontSize:"12px",color:"#bde9df",
      padding:{x:40,y:10},
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    next.on("pointerdown",()=>{
      if(index<lines.length-1){index++;show();return;}
      stopWhispers?.();
      next.removeAllListeners("pointerdown").setText("RETOURNER SUR TERRE");
      next.once("pointerdown",()=>this.showEpilogue());
      dialogue.setText("ANGE : Je classe le dossier. Et la note de frais du lave-mains.\n\nÉpilogue fictif de l’enquête.");
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>stopWhispers?.());
  }

  update():void {
    if(this.notebookButton?.active)return;
    this.notebookButton=this.add.text(338,610,"CARNET",{
      fontFamily:"monospace",fontSize:"11px",color:"#c8eddf",
      backgroundColor:"#243745",padding:{x:7,y:7},
    }).setOrigin(1,0).setDepth(300).setInteractive({useHandCursor:true});
    this.notebookButton.on("pointerdown",()=>this.openNotebook());
    detailInvestigation(this,"heaven");
  }

  private openNotebook():void {
    if(this.notebook?.active)return;
    const panel=this.add.rectangle(180,320,350,610,0x172330,0.99)
      .setInteractive().setStrokeStyle(2,0xb8b597);
    const title=this.add.text(24,32,"CARNET D’USELESS",{
      fontFamily:"monospace",fontSize:"18px",color:"#e7d3aa",
    });
    const hint=this.add.text(24,80,"Choisis deux pièces pour les relier.",{
      fontFamily:"monospace",fontSize:"12px",color:"#d1e2dc",wordWrap:{width:310},
    });
    this.notebook=this.add.container(0,0,[panel,title,hint]).setDepth(400);
    const notes=this.add.text(24,455,[...this.links].join("\n"),{
      fontFamily:"monospace",fontSize:"10px",color:"#a6c8bd",
      wordWrap:{width:306},maxLines:6,
    });
    this.notebook.add(notes);
    let first:string|undefined;
    const items=[...this.evidence];
    if(!items.length)hint.setText("Le carnet attend ta première découverte.");
    items.forEach((name,index)=>{
      const x=index%2?185:24,y=130+Math.floor(index/2)*65;
      const entry=this.add.text(x,y,"◈ "+name,{
        fontFamily:"monospace",fontSize:"11px",color:"#f1e5cc",
        backgroundColor:"#344656",padding:{x:6,y:12},wordWrap:{width:135},
      }).setInteractive({useHandCursor:true});
      this.notebook!.add(entry);
      entry.on("pointerdown",()=>{
        if(!first){first=name;entry.setColor("#a9ffda");hint.setText("Relier « "+name+" » à quelle pièce ?");return;}
        if(first===name){first=undefined;entry.setColor("#f1e5cc");return;}
        this.links.add([first,name].sort().join(" ↔ "));
        hint.setText("Lien noté. Une piste à vérifier.");
        first=undefined;
        notes.setText([...this.links].join("\n"));
      });
    });
    const close=this.add.text(180,574,"FERMER LE CARNET",{
      fontFamily:"monospace",fontSize:"13px",color:"#e5d5ae",padding:{x:12,y:12},
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    this.notebook.add(close);
    close.once("pointerdown",()=>{this.notebook?.destroy(true);this.notebook=undefined;});
  }

  private showEpilogue():void {
    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#a6cbd0");
    const beach=this.add.graphics();
    beach.fillStyle(0x638f9b).fillRect(0,280,360,240);
    beach.fillStyle(0xe0cca0).fillRect(0,490,360,150);
    beach.fillStyle(0xf3ecce).fillRect(0,490,360,5);
    this.add.circle(275,100,35,0xffe3a4);
    const hero=this.add.image(92,510,"hero");
    const bag=this.add.graphics();
    bag.fillStyle(0xe9f0e7,0.8).fillRect(200,515,18,21);
    bag.lineStyle(2,0xf8fff3,0.8).strokeRoundedRect(201,509,15,13,4);
    const text=this.add.text(24,65,"DE RETOUR SUR TERRE\n\nUn sachet plastique traîne sur la plage.",{
      fontFamily:"monospace",fontSize:"14px",color:"#263e4c",
      wordWrap:{width:310},lineSpacing:7,
    });
    this.add.rectangle(209,520,50,55,0xffffff,0.001)
      .setInteractive({useHandCursor:true}).once("pointerdown",()=>{
        this.tweens.add({targets:hero,x:182,duration:900,onComplete:()=>{
          bag.setVisible(false);
          audio.play("confirm");
          text.setText("Useless ramasse le sachet.\n\nUSELESS : Cette fois, tu viens avec moi.\n\nUne petite chose de mieux.");
          this.evidence.add("Sachet ramassé");
          const halo=this.add.ellipse(0,-32,29,8).setStrokeStyle(3,0xffe19b);
          hero.setPosition(0,0);
          const dancer=this.add.container(182,510,[hero,halo]).setDepth(25);
          this.tweens.add({targets:dancer,y:502,angle:8,duration:280,yoyo:true,repeat:9});
          this.tweens.add({targets:hero,scaleX:0.92,scaleY:1.06,duration:280,yoyo:true,repeat:9});
          this.time.delayedCall(1800,()=>this.showEncouragementCredits(dancer));
        }});
      });
    detailInvestigation(this,"beach");
  }

  private showEncouragementCredits(dancer:Phaser.GameObjects.Container):void {
    this.notebook?.destroy(true);
    this.notebookButton?.setVisible(false);
    // Keep the final dance in view while the credits rise beside it.
    this.add.rectangle(180,320,360,640,0x101b2b,0.94).setDepth(20);
    this.tweens.killTweensOf(dancer);
    dancer.setPosition(180,540).setDepth(25);
    this.tweens.add({targets:dancer,y:532,angle:-9,duration:330,yoyo:true,repeat:-1});
    const credits=this.add.container(180,660).setDepth(24);
    const blocks=[
      ["UPLESS","ALPHA — LE CHEMIN RETROUVÉ"],
      ["Avec","Useless\nLa girafe\nLe singe\nLes deux Pinkwindkis"],
      ["Psaume 22 (23), 1","« Le Seigneur est mon berger :\nje ne manque de rien. »"],
      ["Psaume 26 (27), 1","« Le Seigneur est ma lumière\net mon salut »"],
      ["Psaume 26 (27), 14","« sois fort et prends courage »"],
      ["Matthieu 5, 9","« Heureux les artisans de paix »"],
      ["Romains 12, 21","« Ne te laisse pas vaincre par le mal,\nmais sois vainqueur du mal par le bien. »"],
      ["Merci d’avoir joué","Et d’avoir ramassé le sachet."],
      ["Textes bibliques","Courts extraits de la traduction AELF\nRéférences des Psaumes\nnumérotation liturgique (hébraïque)"],
    ];
    blocks.forEach(([heading,body],index)=>{
      credits.add(this.add.text(0,index*205,heading,{
        fontFamily:"monospace",fontSize:"17px",color:"#f1d798",
        align:"center",wordWrap:{width:320},
      }).setOrigin(0.5,0));
      credits.add(this.add.text(0,index*205+48,body,{
        fontFamily:"monospace",fontSize:"13px",color:"#d7e6e3",
        align:"center",lineSpacing:8,wordWrap:{width:314},
      }).setOrigin(0.5,0));
    });
    this.tweens.add({targets:credits,y:-blocks.length*205,duration:65000,ease:"Linear",
      onComplete:()=>{
        credits.destroy(true);
        this.add.text(180,245,"PAIX SUR TON CHEMIN",{
          fontFamily:"monospace",fontSize:"18px",color:"#f1d798",
        }).setOrigin(0.5).setDepth(26);
        const menu=this.add.text(180,335,"RETOUR AU MENU",{
          fontFamily:"monospace",fontSize:"13px",color:"#d7e6e3",
          backgroundColor:"#344558",padding:{x:14,y:12},
        }).setOrigin(0.5).setDepth(26).setInteractive({useHandCursor:true});
        menu.once("pointerdown",()=>{this.tweens.killAll();this.scene.start("MenuScene");});
      },
    });
  }

  private button(y:number,label:string,action:()=>void):void {
    const button=this.add.text(24,y,label,{
      fontFamily:"monospace",fontSize:"12px",color:"#e5f6ef",
      backgroundColor:"#344558",padding:{x:10,y:10},wordWrap:{width:286},
    }).setInteractive({useHandCursor:true});
    button.on("pointerdown",()=>{audio.play("tap");action();});
    this.buttons.add(button);
  }

  private showChapter():void {
    this.children.removeAll();
    this.read.clear();
    this.cameras.main.setZoom(1).setScroll(0,0).setBackgroundColor("#171f30");
    const chapter=chapters[this.chapter];
    this.add.text(24,30,chapter.title,{fontFamily:"monospace",fontSize:"16px",color:"#ebcf96"});
    this.add.text(24,65,"DOSSIER "+(this.chapter+1)+"/"+chapters.length,{fontFamily:"monospace",fontSize:"11px",color:"#9bb9cb"});
    this.body=this.add.text(24,100,chapter.intro,{
      fontFamily:"monospace",fontSize:"13px",color:"#f1eadc",
      lineSpacing:7,wordWrap:{width:310},
    });
    this.buttons=this.add.container(0,0);
    this.showClues();
  }

  private showClues():void {
    this.buttons.removeAll(true);
    const chapter=chapters[this.chapter];
    chapter.clues.forEach((clue,index)=>this.button(390+index*48,(this.read.has(index)?"✓ ":"")+clue[0],()=>{
      this.read.add(index);
      this.body.setText(clue[1]);
      this.showClues();

    }));
    if(this.read.size===chapter.clues.length)this.button(548,"CONFRONTER LES INDICES",()=>this.ask());
  }

  private ask():void {
    const chapter=chapters[this.chapter];
    this.body.setText(chapter.question);
    this.buttons.removeAll(true);
    chapter.choices.forEach((choice,index)=>this.button(390+index*70,choice,()=>{
      this.body.setText(chapter.result);
      this.buttons.removeAll(true);
      if(index!==chapter.correct){
        this.body.setText("ANGE : Relis les pièces avant de signer.\n\n"+chapter.result);
        this.button(530,"REVENIR AUX PIÈCES",()=>this.showClues());
        return;
      }
      this.button(530,this.chapter<chapters.length-1?"CHAPITRE SUIVANT":"DÉPOSER LE RAPPORT",()=>{
        if(this.chapter<chapters.length-1){this.chapter++;this.showChapter();}
        else{
          this.buttons.removeAll(true);
          this.body.setText("IDENTITÉ RÉVÉLÉE\n\nDIEU : Cette victime était Jésus. Le gouverneur était Ponce Pilate.\n\nLe dossier adapte les récits de Marc 15, Matthieu 27 et Luc 22, ainsi que Tacite, Annales 15.44. Les objets sont des reconstitutions.\n\nUSELESS : Un nom change notre regard. Pas le besoin de preuves.");
          this.button(390,"LIRE LES SOURCES",()=>{
            this.buttons.removeAll(true);
            this.body.setText("LES ARCHIVES OUVERTES\n\nLes récits religieux et le texte romain sont désormais identifiés. Le jeu les a anonymisés pour laisser l’enquête précéder la révélation.");
            [sources.marc,sources.tacite,"https://www.aelf.org/bible/Mt/27","https://www.aelf.org/bible/Lc/22"].forEach((url,index)=>{
              this.button(310+index*52,["Marc 15","Tacite — Annales 15.44","Matthieu 27","Luc 22"][index],()=>window.open(url,"_blank","noopener,noreferrer"));
            });
            this.button(540,"RECOMMENCER",()=>{this.chapter=0;this.showChapter();});
          });
          this.button(530,"RELIRE L’ENQUÊTE",()=>{this.chapter=0;this.showChapter();});
        }
      });
    }));
  }
}
