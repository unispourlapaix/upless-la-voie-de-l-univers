import Phaser from "phaser";

export function createRepairedRocket(scene: Phaser.Scene, x: number, y: number): {rocket: Phaser.GameObjects.Container; flame: Phaser.GameObjects.Container} {
  const g=scene.add.graphics();
  const r=(px:number,py:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(px,py,w,h);
  const ink=0x243945, white=0xe9e4cb, steel=0x8fa8a3;
  // Match the wreck's pointed black nose, pale hull and oxidised copper band.
  for(let row=0;row<25;row++) {
    const half=Math.max(1,Math.floor(row*0.7));
    r(-half,-100+row*2,half*2,2,ink);
    if(row>12)r(-half+2,-100+row*2,half*2-4,2,white);
    else if(row>3)r(-half+2,-100+row*2,2,2,0x607379);
  }
  r(-20,-51,40,103,ink);r(-17,-50,34,99,steel);
  r(-15,-49,12,95,white);r(-13,-46,4,74,0xfff3da);r(11,-45,5,88,0x617e7e);
  r(-9,-30,18,25,ink);r(-6,-27,12,19,0x5f9da9);r(-5,-26,4,9,0xb4e7dd);
  r(-18,7,36,9,0x9a6448);r(-16,8,31,3,0xdba06a);
  for(let i=0;i<5;i++) {r(-16,-42+i*18,2,2,ink);r(14,-42+i*18,2,2,ink);}
  for(let i=0;i<15;i++) {
    r(-22-i,25+i*2,5+i,2,ink);r(18,25+i*2,5+i,2,ink);
    if(i>2){r(-20-i,25+i*2,3+i,2,steel);r(20,25+i*2,2+i,2,steel);}
  }
  r(-19,49,38,9,ink);r(-16,50,32,3,0xc5a367);
  r(-13,58,26,10,ink);r(-10,58,20,5,0x546d73);r(-8,63,16,3,0x9edbd2);
  const exhaust=scene.add.graphics();
  for(let row=0;row<26;row++) {
    const half=Math.max(1,12-Math.floor(row/2));
    exhaust.fillStyle(row<12?0xeaa05b:0xb2694d).fillRect(-half,row*2,half*2,2);
    if(row<19)exhaust.fillStyle(row<6?0xd0f0dc:0xffe0a0).fillRect(-Math.max(1,half-4),row*2,Math.max(2,(half-4)*2),2);
  }
  const flame=scene.add.container(0,66,[exhaust]).setAlpha(0);
  return {rocket:scene.add.container(x,y,[flame,g]).setDepth(36),flame};
}
