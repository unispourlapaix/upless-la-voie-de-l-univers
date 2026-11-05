import { loadSave, writeSave } from "./types";

export type TrophyId="cross"|"basin"|"robe"|"slip"|"headset"|"thorn"|"coins"|"ear"|"shroud"|"book"|"radio"|"bag";

export function collectedTrophies():TrophyId[] {
  const value=loadSave().trophies;
  return Array.isArray(value)?value:[];
}

export function collectTrophy(id:TrophyId):void {
  const trophies=collectedTrophies();
  if(trophies.includes(id))return;
  writeSave({...loadSave(),trophies:[...trophies,id]});
}

export const trophyReflections:{
  id:TrophyId;name:string;pages:string[];source?:string;
}[]=[
  {id:"cross",name:"La croix",source:"https://www.aelf.org/bible/1Co/1",pages:[
    "LE LANGAGE DE LA CROIX\n\n« Car le langage de la croix est folie pour ceux qui vont à leur perte »\n\n1 Corinthiens 1,18 — extrait AELF.",
    "USELESS : Moi, on me prenait déjà pour un fou avant les lunettes.\n\nL’ANGE : Et si la vraie force était d’aimer au lieu d’écraser ?\n\nLa croix nous invite à regarder la souffrance, à protéger les plus fragiles et à laisser l’amour transformer nos choix.",
  ]},
  {id:"basin",name:"Le lave-mains",pages:[
    "CHOISIR UN AUTRE CHEMIN\n\nUSELESS : On peut laver ses mains. Et changer sa vie ?\n\nL’ANGE : Tu peux reconnaître le mal causé, demander pardon et commencer à réparer.",
    "Et si, au lieu de se décharger de sa responsabilité, on passait par les eaux du baptême ?\n\nDans la foi chrétienne, elles invitent à une vie renouvelée avec le Christ. Ce trophée nous pose une question personnelle : quel chemin allons-nous choisir maintenant ?",
  ]},
  {id:"robe",name:"La tunique pourpre",pages:[
    "CE QUI RESTERA DE NOUS\n\nUSELESS : Elle brille. Je vais enfin avoir l’air important.\n\nL’ANGE : Et quand le tissu sera usé, que restera-t-il ?",
    "Les richesses, les vêtements et le prestige passent. Briller aux yeux du monde ne suffit pas à donner du sens à une vie.\n\nDans cette réflexion chrétienne, la pourpre invite à préférer les gestes d’amour, la justice et le bien partagé aux apparences que nous laisserons derrière nous.",
  ]},
  {id:"slip",name:"Le slip rose",pages:[
    "DÉSIRER AVEC RESPECT\n\nUSELESS : Même le slip donne une leçon ?\n\nL’ANGE : Il nous rappelle que l’autre a une intimité, une liberté et une dignité.",
    "Nos désirs et nos fantasmes peuvent nous égarer et nous attrister lorsqu’ils deviennent obsession, pression ou domination. Regardons aussi le mal que nos actes peuvent engendrer.",
    "Par amour, on protège et on respecte. On écoute le consentement et les limites de chacun.\n\nConstruis tes désirs sur de bonnes bases, sans brutalité ni vulgarité, dans la tendresse et le respect de l’intimité. C’est cet amour sain que nous souhaitons à chacun.",
  ]},
  {id:"headset",name:"Le casque de réalité",source:"https://www.aelf.org/bible/1Th/5",pages:[
    "VEILLER ET DISCERNER\n\n« mais discernez la valeur de toute chose : ce qui est bien, gardez-le »\n\n1 Thessaloniciens 5,21 — extrait AELF.",
    "USELESS : Ce casque montre tout. Il dit forcément vrai ?\n\nL’ANGE : Éprouve chaque parole. Vérifie les faits, les intentions et les conséquences.",
    "Ce qui nourrit le vol, la destruction, la haine et la guerre appelle notre vigilance. Une promesse séduisante peut conduire au mal.\n\nCherchons ce qui protège la vie, la dignité et la paix. La sagesse commence aussi quand on accepte de remettre ses certitudes en question.",
  ]},
  {id:"thorn",name:"L’épine",pages:["LA DOULEUR DE L’AUTRE\n\nUne petite épine peut laisser une grande blessure.\n\nUSELESS : Mes paroles aussi ?\n\nL’ANGE : Oui. Choisis celles qui relèvent et répare celles qui blessent."]},
  {id:"coins",name:"Les trente pièces",pages:["LE PRIX D’UNE VIE\n\nUSELESS : Tout cet argent…\n\nL’ANGE : Que vaut-il si l’on trahit quelqu’un pour le gagner ?\n\nAucune personne ne se réduit à un prix. La fidélité et la dignité méritent d’être protégées."]},
  {id:"ear",name:"L’oreille",pages:["ÉCOUTER AVANT DE FRAPPER\n\nUSELESS : On aurait pu commencer par parler.\n\nL’ANGE : Et surtout par écouter.\n\nLa violence ferme le dialogue. Prendre le temps d’entendre l’autre ouvre parfois un chemin de paix."]},
  {id:"shroud",name:"Le linceul blanc",pages:["LAISSER UNE PLACE À L’ESPÉRANCE\n\nUSELESS : Je croyais trouver seulement une fin.\n\nL’ANGE : Dans la foi chrétienne, la résurrection ouvre un horizon de vie.\n\nL’espérance nous invite à accompagner ceux qui pleurent, avec douceur et présence."]},
  {id:"book",name:"Le livre retrouvé",pages:["APPRENDRE AVEC HUMILITÉ\n\nUSELESS : Je connais la couverture.\n\nL’ANGE : Laisse aussi une chance aux pages.\n\nLa sagesse grandit lorsqu’on lit, qu’on questionne et qu’on reconnaît ce qu’on ignore."]},
  {id:"radio",name:"La radio",pages:["LA PAROLE QUI CIRCULE\n\nUSELESS : Si tout le monde le répète, c’est vrai ?\n\nL’ANGE : Une rumeur amplifiée reste une rumeur.\n\nAvant de transmettre une parole, demande-toi si elle est vérifiée, juste et bienveillante."]},
  {id:"bag",name:"Le sachet ramassé",pages:["PRENDRE SOIN DU MONDE\n\nUne petite chose de mieux.\n\nPrendre soin de la création commence aussi par ce qui est à portée de main. Nos gestes modestes peuvent protéger la vie autour de nous."]},
];
