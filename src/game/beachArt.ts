import Phaser from "phaser";
import { createFutureMonkey } from "./companionArt";
import { createOriginalGiraffe } from "./giraffeArt";
import { createOriginalPalm } from "./palmArt";
import { createOriginalBeachBoat } from "./boatArt";

type Role = "giraffe" | "pinkwindkis" | "penguin";
export function createBeachCharacter(scene: Phaser.Scene, x:number,y:number,role:Role): Phaser.GameObjects.Container {
  if(role==="pinkwindkis") return createFutureMonkey(scene,x,y);
  if(role==="giraffe") return createOriginalGiraffe(scene,x,y);
  const g=scene.add.graphics();const r=(x:number,y:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(x,y,w,h);
  const ink=0x26384a;
  {
    r(-16,-24,32,58,ink);r(-12,-29,24,10,ink);r(-12,-10,24,40,0xe4e6d0);
    r(-8,-22,4,5,0xf6efdb);r(5,-22,4,5,0xf6efdb);r(-4,-14,10,5,0xe5aa64);
    r(-23,-6,8,26,ink);r(16,-6,8,26,ink);r(-17,32,15,7,0xe5aa64);r(4,32,15,7,0xe5aa64);
    r(-15,-24,31,9,0x617b92);r(-12,-22,11,5,0x85c8ca);r(3,-22,10,5,0x85c8ca);
    r(-12,3,24,9,0x566b82);r(-9,5,18,3,0xc6d6de);
    r(17,10,16,6,0x394358);r(26,8,4,10,0xcda66a);
    g.lineStyle(12,0x4ff9ff,0.28).lineBetween(30,10,53,-38);
    g.lineStyle(7,0x34dfff).lineBetween(30,10,53,-38);
    g.lineStyle(3,0xeaffff).lineBetween(30,10,53,-38);
  }
  return scene.add.container(x,y,[g]).setDepth(18);
}

export function drawBeach(scene:Phaser.Scene):void {
  const g=scene.add.graphics().setDepth(1);const r=(x:number,y:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(x,y,w,h);
  const sky=[0x738fa9,0x9cabb1,0xc9bab0,0xe1bea0,0xf3c491];
  sky.forEach((c,i)=>r(0,i*80,1920,81,c));
  for(let y=-29;y<=29;y++){const h=Math.floor(Math.sqrt(29*29-y*y)/2)*2;r(285-h,148+y,h*2,1,0xffe2a4);}
  r(0,360,1920,190,0x447d8b);r(0,395,1920,36,0x528e98);r(0,431,1920,49,0x64a5a8);r(0,480,1920,70,0x80b9b0);
  for(let i=0;i<220;i++){const x=(i*137%1910),y=371+(i*19%158);r(x,y,8+(i%4)*6,1,i%3?0xa7d0bd:0x3b788a);}
  for(let x=0;x<1920;x+=4){const y=530+Math.floor(Math.sin(x/110)*3)*2;r(x,y,4,550-y,0xc5d8bd);}
  r(0,550,1920,90,0xd5b581);r(0,550,1920,4,0xf1d7a2);r(0,582,1920,58,0xb9906b);
  for(let i=0;i<700;i++){const x=i*149%1918,y=556+i*23%82;r(x,y,2+i%3*2,1,i%3?0xc19e70:0xead099);}
  // Low islands, a stranded buoy and clustered shells frame rather than cover the clues.
  for(let i=0;i<4;i++){r(440+i*350,350-i%2*7,98,9,0x5c7885);r(456+i*350,344-i%2*7,54,9,0x5c7885);}
  for(const x of [350,690,1060,1480]){r(x,546,13,4,0xa48469);r(x+3,543,7,3,0xe9d4ab);r(x+19,548,5,2,0xb39a77);}
  const foam=scene.add.graphics().setDepth(2);
  for(let x=0;x<1920;x+=30)foam.fillStyle(0xe1e7cb).fillRect(x,526+(x%90)/15,18,2);
  scene.tweens.add({targets:foam,y:5,alpha:0.45,duration:2300,yoyo:true,repeat:-1,ease:"Sine.inOut"});
}

export function createBeachPalm(scene:Phaser.Scene,x:number,y:number):Phaser.GameObjects.Container {
  return createOriginalPalm(scene,x,y);
}

export function createBeachBoat(scene:Phaser.Scene,x:number,y:number):{boat:Phaser.GameObjects.Container;algae:Phaser.GameObjects.Container} {
  return createOriginalBeachBoat(scene,x,y);
}

export function createBeachObject(scene:Phaser.Scene,x:number,y:number,kind:"vr"|"book"|"cloth"|"radio"):Phaser.GameObjects.Container {
  const g=scene.add.graphics();const r=(x:number,y:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(x,y,w,h);
  if(kind==="vr"){r(-21,-10,42,20,0x293d4b);r(-17,-7,34,14,0xc3c9bd);r(-13,-5,11,10,0x557c8a);r(3,-5,11,10,0x557c8a);r(-8,-17,16,4,0x293d4b);r(-17,-15,10,6,0x293d4b);r(8,-15,10,6,0x293d4b);}
  if(kind==="book"){r(-19,-12,38,26,0x77634f);r(-16,-10,32,20,0xc7c6a5);r(-2,-10,2,20,0x8a8b76);r(5,-5,9,2,0x688975);r(8,-7,4,10,0x688975);r(-12,2,7,1,0x8a8b76);}
  if(kind==="cloth"){r(-19,-10,38,6,0xad7685);r(-16,-4,32,6,0xcd9b9f);r(-11,2,22,5,0xcd9b9f);r(-6,7,12,5,0xad7685);r(-15,-9,3,3,0xe4b8ad);}
  if(kind==="radio"){r(-16,-9,32,22,0x2d4653);r(-12,-5,17,14,0x7f9a96);for(let i=0;i<4;i++)r(-10,-2+i*3,12,1,0x405d64);r(9,-3,4,4,0xc2a371);r(2,-31,2,22,0x667d7e);r(4,-32,19,2,0x98aca0);}
  return scene.add.container(x,y,[g]).setDepth(15);
}
