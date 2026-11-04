import Phaser from "phaser";

/** Native-resolution pixels, drawn into the existing animated objects. */
export function detailFigure(g:Phaser.GameObjects.Graphics,role:"governor"|"jesus"):void {
  const x=role==="governor"?181:200;
  const y=role==="governor"?328:326;
  const r=(dx:number,dy:number,w:number,h:number,color:number)=>
    g.fillStyle(color).fillRect(x+dx,y+dy,w,h);
  // Face planes, brows, eyelids, nose and reflected light.
  r(-12,-8,5,17,0xb58869);r(-9,-10,14,8,0xe1ba95);
  r(9,-5,4,15,0xa77a61);r(-5,-2,3,2,0x382e31);
  r(5,-2,3,2,0x382e31);r(-6,-5,5,1,0x685042);
  r(4,-5,5,1,0x685042);r(0,-1,2,7,0xb68768);
  r(2,4,3,2,0xf0cba4);r(-3,9,7,1,0x916454);
  r(-13,0,2,6,0xe8bd95);
  if(role==="governor"){
    r(-14,-14,27,4,0x292c34);r(-11,-15,16,2,0x74716a);
    r(-12,-9,3,6,0x6f6961);r(11,-10,3,7,0x504f50);
    r(-7,17,14,6,0xb69c83);
    r(-12,25,5,57,0xbcb6a4);r(4,35,4,65,0xf5ebd3);
    r(15,49,3,59,0x9c9f97);r(-23,99,46,3,0xaaa899);
    r(-18,61,4,35,0xf5ead1);r(8,91,3,23,0xb2ae9c);
    r(-14,24,5,7,0xc7ad75);r(-10,30,5,8,0x8d4655);
    r(-5,38,4,11,0x9d5360);r(0,49,4,11,0x9d5360);
    r(5,60,4,11,0x9d5360);r(10,71,4,11,0x9d5360);
    r(-6,65,9,4,0xe1b797);r(2,64,9,4,0xd8ae8d);
    r(-7,71,8,2,0x9e7e6a);r(5,71,8,2,0x9e7e6a);
  }else{
    r(-15,-10,4,29,0x493b34);r(12,-9,4,29,0x493b34);
    r(-12,-15,22,3,0x86654b);r(-15,10,3,13,0x79573f);
    r(-9,10,5,9,0x674a3b);r(5,10,5,9,0x674a3b);
    r(-4,15,10,6,0x614637);r(-1,19,4,4,0x987255);
    r(-9,25,5,41,0xd3d3c5);r(6,32,4,61,0xffffff);
    r(17,62,4,37,0xb9c4c2);r(-22,82,4,22,0xc6cfc9);
    r(-29,107,58,3,0xc1cbc6);r(-15,96,3,12,0xffffff);
    r(-36,48,6,3,0xefc49b);r(36,48,6,3,0xefc49b);
    r(-41,51,3,2,0x8a4752);r(40,51,3,2,0x8a4752);
    r(16,53,5,7,0xb68772);r(18,55,2,3,0x8a4752);
  }
}

export function detailBasin(g:Phaser.GameObjects.Graphics):void {
  g.fillStyle(0x444f58).fillRect(188,418,10,45);
  g.fillStyle(0xd7d1bc).fillRect(168,420,5,39);
  g.fillStyle(0x9b9b92).fillRect(173,421,3,38);
  g.fillStyle(0xa9a899).fillEllipse(182,465,47,9);
  g.fillStyle(0xd3cbb8).fillEllipse(179,462,39,6);
  g.lineStyle(2,0xe6decb).beginPath().arc(183,406,33,0.1,3.1).strokePath();
  g.fillStyle(0x3e6978).fillEllipse(183,404,50,7);
  g.lineStyle(1,0xc7edf0).strokeEllipse(180,401,24,4);
  g.lineStyle(1,0x8ebbc4).strokeEllipse(189,404,14,3);
  g.fillStyle(0xead9af).fillRect(150,404,4,3).fillRect(210,404,4,3);
  for(let i=0;i<5;i++){
    g.fillStyle(0x6a7477,0.5).fillRect(177+i%2*7,425+i*6,3,1);
  }
}

export function detailCross(g:Phaser.GameObjects.Graphics):void {
  g.fillStyle(0x9d7951).fillRect(-9,-229,3,226).fillRect(-63,-179,125,2);
  g.fillStyle(0x312b2a).fillRect(7,-229,3,229).fillRect(-63,-165,125,3);
  for(let i=0;i<24;i++){
    const y=-224+i*9,x=-4+i%3*3;
    g.fillStyle(i%2?0x332a27:0xb18b5b,0.65).fillRect(x,y,1,5+i%4);
  }
  for(const x of [-48,48,0]){
    const y=x===0?-37:-171;
    g.lineStyle(1,0xb48d65).strokeEllipse(x,y,9,7);
    g.fillStyle(0x171e24).fillRect(x-2,y-2,4,4);
    g.fillStyle(0x4e2330).fillRect(x-2,y+5,2,10);
  }
  g.lineStyle(1,0x2b2526).lineBetween(-4,-100,2,-89);
  g.lineBetween(2,-89,-2,-75);
}
