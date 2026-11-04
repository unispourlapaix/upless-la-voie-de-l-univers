import Phaser from "phaser";

type Setting="forest"|"garden"|"palace"|"temple"|"hill"|"tomb"|"chamber"|"heaven"|"beach";

/** Small, deterministic marks keep each scene's materials readable at native size. */
export function detailInvestigation(scene:Phaser.Scene,setting:Setting):void {
  const marks=scene.add.graphics().setDepth(18);
  let seed=431;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const heaven=setting==="heaven";
  const dark=["forest","garden","chamber"].includes(setting);
  const ground=setting==="chamber"?490:setting==="hill"?505:480;
  const shadow=dark?0x0b1720:0x37493e;
  const light=heaven?0xfff5d5:dark?0x879585:0xc4b79a;

  if(!heaven){
    for(let i=0;i<230;i++){
      const x=Math.floor(random()*360),y=ground+Math.floor(random()*(537-ground));
      marks.fillStyle(i%4?shadow:light,i%4?0.15:0.22)
        .fillRect(x,y,1+Math.floor(random()*4),1);
    }
    for(let i=0;i<18;i++){
      const x=Math.floor(random()*350),y=ground+10+Math.floor(random()*25);
      marks.fillStyle(shadow,0.5).fillRect(x,y,6,3);
      marks.fillStyle(light,0.4).fillRect(x+1,y,3,1);
    }
  }
  if(setting==="forest"||setting==="garden"){
    if(setting==="forest"){
      for(let i=0;i<20;i++){
        const x=84+i*9,y=472-(x-84)*0.17;
        marks.fillStyle(i%3?0x9d7954:0x201e25,0.35).fillRect(x,y+(i%3)*3,5,1);
      }
    }
    for(let i=0;i<170;i++){
      const side=i%2===0;
      const x=side?random()*72:290+random()*70;
      const y=210+random()*280;
      marks.fillStyle(i%3?0x405747:0x708066,0.35).fillRect(x,y,3,2);
    }
    for(let i=0;i<26;i++){
      const x=random()*360,y=490+random()*35;
      marks.fillStyle(0x506647,0.65).fillRect(x,y,1,5).fillRect(x+2,y+2,1,3);
    }
    for(let i=0;i<28;i++){
      const x=5+random()*350,y=280+random()*245;
      marks.fillStyle(0xc4d3bc,0.22).fillRect(x,y,1,1);
    }
  }
  if(setting==="palace"||setting==="temple"){
    const top=setting==="palace"?185:175;
    for(let row=0;row<8;row++){
      const y=top+row*30;
      for(let column=0;column<5;column++){
        const x=24+column*64-(row%2)*26;
        if(x>130&&x<231)continue;
        marks.lineStyle(1,0x352e35,0.22).lineBetween(x,y,x+56,y);
        marks.lineBetween(x,y,x,y+28);
        marks.fillStyle(0xe4d4b5,0.15).fillRect(x+2,y+2,48,1);
      }
    }
    for(const x of [48,105,244,301]){
      marks.fillStyle(0xf4dfbb,0.18).fillRect(x,194,2,208);
      marks.fillStyle(0x392f30,0.2).fillRect(x+8,194,1,208);
    }
    for(const x of [83,273]){
      marks.fillStyle(0x342a2d).fillRect(x,271,5,39);
      marks.fillStyle(0xe6a358).fillRect(x-2,259,9,13);
      marks.fillStyle(0xffdca0).fillRect(x,255,4,12);
      marks.fillStyle(0xffb861,0.07).fillRect(x-15,242,34,45);
    }
  }
  if(setting==="tomb"||setting==="chamber"){
    if(setting==="chamber"){
      for(let i=0;i<8;i++){
        marks.fillStyle(0xffffff,0.2).fillRect(155+i*17,393+(i%3)*4,8,1);
      }
    }
    const top=setting==="chamber"?161:330;
    for(let i=0;i<120;i++){
      const x=30+random()*302,y=top+random()*(480-top);
      if(setting==="chamber"&&x>80&&x<297&&y<451)continue;
      if(setting==="tomb"&&x>152&&x<234&&y>391)continue;
      marks.fillStyle(i%3?0x242f35:0xd0cbbc,0.24).fillRect(x,y,2+random()*8,1);
    }
    marks.lineStyle(1,0x202c31,0.4).lineBetween(87,380,101,400);
    marks.lineBetween(101,400,96,419);
  }
  if(setting==="hill"){
    // Metal highlights, armour joints and cloth folds on the two guards.
    // These details belong to the moving guard graphics, so they stay attached
    // when the cartoon knockout animation compresses the figures.
    const guardLayer=scene.children.list.find(object=>
      object instanceof Phaser.GameObjects.Container&&object.depth===9,
    ) as Phaser.GameObjects.Container|undefined;
    if(guardLayer){
      const armour=scene.add.graphics();
      for(const x of [225,280]){
        armour.fillStyle(0xaab7bc).fillRect(x-11,395,19,2);
        armour.fillStyle(0x303c49).fillRect(x-12,405,4,6).fillRect(x+9,405,3,6);
        armour.fillStyle(0xb2b4a7).fillRect(x-9,424,18,15);
        armour.fillStyle(0x64747c).fillRect(x-8,429,16,2).fillRect(x-8,434,16,2);
        armour.fillStyle(0x272f3b).fillRect(x-13,448,26,4);
        armour.fillStyle(0xd1ac64).fillRect(x-2,448,5,4);
        armour.fillStyle(0xbf6a68).fillRect(x-8,455,2,18);
        armour.fillStyle(0x492f41).fillRect(x+7,455,2,24);
        armour.fillStyle(0xa7a99b).fillRect(x-14,482,8,3).fillRect(x+5,482,8,3);
      }
      guardLayer.add(armour);
    }
    for(let i=0;i<35;i++){
      const x=random()*360,y=376+random()*138;
      // Keep the centre clear for the cross, guards and evidence.
      if(x>112&&x<323)continue;
      marks.fillStyle(0x5c6757,0.6).fillRect(x,y,3,2);
      marks.fillStyle(0xc4b593,0.4).fillRect(x,y,2,1);
    }
  }
  if(heaven){
    for(let i=0;i<70;i++){
      const x=random()*360,y=180+random()*255;
      marks.fillStyle(0xfff7d3,0.28).fillRect(x,y,1,2);
    }
  }
  // A fine film of pixel grain unifies vector shapes and character sprites.
  for(let i=0;i<850;i++){
    const x=Math.floor(random()*360),y=70+Math.floor(random()*465);
    marks.fillStyle(i%2?0xffffff:0x10121e,0.025).fillRect(x,y,1,1);
  }
}
