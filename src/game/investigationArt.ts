import Phaser from "phaser";

type Setting="forest"|"garden"|"palace"|"temple"|"hill"|"tomb"|"chamber"|"heaven"|"beach";

/** Material details are limited to the actual surfaces, behind actors and clues. */
export function detailInvestigation(scene:Phaser.Scene,setting:Setting):void {
  const marks=scene.add.graphics().setDepth(0.5);
  let seed=431;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(["forest","garden","hill","tomb","heaven","beach"].includes(setting)){
    const clouds=scene.add.graphics().setDepth(0.4);
    const dark=setting==="forest"||setting==="garden";
    const palette=setting==="heaven"?[0xc3cedf,0xdce3ed,0xf2f1e9,0xfff7db]:
      dark?[0x222736,0x343748,0x45485a,0x626071]:
      [0x8399aa,0xa5b8c3,0xd2dce0,0xeee8d8];
    for(const cloud of [{x:-25,y:179,w:142},{x:125,y:224,w:119},{x:239,y:168,w:151}]){
      const {x,y,w}=cloud;
      clouds.fillStyle(palette[0]).fillRect(x+12,y+15,w-15,8);
      clouds.fillStyle(palette[1]).fillRect(x,y+8,w,9).fillRect(x+9,y,w-17,9);
      clouds.fillStyle(palette[2]).fillRect(x+20,y-8,w-47,12);
      clouds.fillRect(x+39,y-17,28,12).fillRect(x+w-49,y-10,22,13);
      clouds.fillStyle(palette[3]).fillRect(x+41,y-17,23,2);
      clouds.fillRect(x+23,y-8,16,2).fillRect(x+w-47,y-10,16,2);
      clouds.fillStyle(palette[0]).fillRect(x+20,y+13,24,2).fillRect(x+66,y+15,31,2);
      clouds.fillStyle(palette[2]).fillRect(x+4,y+8,12,2).fillRect(x+w-13,y+9,9,2);
      clouds.fillStyle(palette[1]);
      for(let i=0;i<8;i++)clouds.fillRect(x+27+i*8,y+3+i%3,3,1);
    }
  }
  const groundTop={forest:490,garden:500,palace:511,temple:515,hill:522,tomb:522,chamber:491,heaven:540,beach:496}[setting];
  if(setting!=="heaven"){
    for(let i=0;i<150;i++){
      const x=Math.floor(random()*360),y=groundTop+Math.floor(random()*(537-groundTop));
      marks.fillStyle(i%4?0x27332f:0xc5b999,i%4?0.18:0.25).fillRect(x,y,1+i%3,1);
    }
  }
  if(setting==="palace"||setting==="temple"){
    const columns=setting==="palace"?[31,304]:[43,99,239,295];
    const isWall=(x:number,y:number)=>{
      const inWall=setting==="palace"?x>=0&&x<360&&y>=185&&y<490:x>=24&&x<336&&y>=194&&y<415;
      const inDoor=setting==="palace"?x>112&&x<248:x>139&&x<221&&y>235;
      return inWall&&!inDoor&&!columns.some(column=>x>=column-7&&x<=column+31);
    };
    for(let row=0;row<10;row++){
      const y=194+row*28;
      for(let x=0;x<360;x++){
        if(!isWall(x,y))continue;
        marks.fillStyle(0x342c31,0.35).fillRect(x,y,1,1);
        if((x+(row%2)*27)%55===0){
          for(let h=1;h<27;h++){
            if(isWall(x,y+h))marks.fillStyle(0x342c31,0.25).fillRect(x,y+h,1,1);
          }
        }
        if(isWall(x,y+2))marks.fillStyle(0xd6c7a8,0.22).fillRect(x,y+2,1,1);
      }
    }
    for(const x of columns){
      marks.fillStyle(0xf0dec1,0.3).fillRect(x+3,195,2,208);
      marks.fillStyle(0x49403d,0.3).fillRect(x+18,195,2,208);
    }
  }
  if(setting==="tomb"||setting==="chamber"){
    for(let i=0;i<210;i++){
      const x=Math.floor(25+random()*310),y=Math.floor(160+random()*330);
      const inRock=setting==="tomb"
        ? ((x-190)/183)**2+((y-430)/143)**2<1&&!(x>153&&x<233&&y>394)
        : false;
      // The chamber uses its outer wall only, leaving the ledge and shroud clear.
      const inChamberWall=setting==="chamber"&&x>=22&&x<=338&&y>=160&&y<490&&
        (x<44||x>316||y<175);
      if(!(setting==="tomb"?inRock:inChamberWall))continue;
      marks.fillStyle(i%3?0x27343a:0xd0cbbc,0.3).fillRect(x,y,2+i%4,1);
    }
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
  }
}
