import Phaser from "phaser";

/** Retro caretaker: cream box head, lens eyes, aerials and copper-jointed blue steel. */
export function createDesertRobot(scene: Phaser.Scene, x: number, y: number): {
  robot: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Rectangle[];
} {
  const g=scene.add.graphics();
  const r=(px:number,py:number,w:number,h:number,c:number)=>{g.fillStyle(c).fillRect(px,py,w,h);};
  const ink=0x293c45, dark=0x42555a, steel=0x7d9b9b, shine=0xb8c9bb;
  const cream=0xdacda3, ivory=0xf5e9c6, copper=0xb67c4c, gold=0xe0b36c;
  // Narrow ribbed legs, large articulated boots and a spring waist.
  r(-27,55,57,3,0x9e785a);
  for(const sx of [-18,15]) {
    r(sx-5,16,11,32,ink); r(sx-3,17,7,28,steel);
    for(let yy=19;yy<42;yy+=5)r(sx-3,yy,7,2,dark);
    r(sx-8,12,17,12,ink);r(sx-5,13,11,8,dark);r(sx-2,15,5,4,copper);
    r(sx-10,36,20,18,ink);r(sx-8,38,16,12,steel);r(sx-6,39,7,3,shine);
    r(sx-13,49,26,8,ink);r(sx-10,48,19,6,steel);r(sx-6,48,9,2,shine);
    r(sx-4,33,8,6,copper);r(sx-2,34,4,2,gold);
  }
  r(-14,5,29,10,ink);r(-11,7,23,3,copper);r(-8,12,17,3,dark);
  // Steel torso with the warm brass service hatch.
  r(-22,-32,44,40,ink);r(-18,-30,37,35,steel);r(-18,-30,6,32,shine);
  r(14,-27,5,31,dark);r(-12,-25,26,28,ink);r(-10,-23,22,24,copper);
  r(-8,-21,17,3,gold);r(-8,-20,3,19,0xc99459);r(8,-20,2,20,0x895d43);
  r(0,-17,2,6,ink);r(-3,-11,4,2,ink);r(-5,-8,3,2,ink);
  r(-9,-23,2,2,ivory);r(8,-23,2,2,ivory);r(-9,-2,2,2,ivory);r(8,-2,2,2,ivory);
  // Copper shoulder joints and segmented hands.
  for(const side of [-1,1]) {
    const sx=side*27;
    r(sx-7,-31,14,16,ink);r(sx-5,-29,10,12,copper);r(sx-3,-28,5,3,gold);
    r(sx-3,-15,7,13,ink);r(sx-1,-13,3,9,shine);r(sx-4,-3,10,7,dark);
    r(sx-5,3,12,17,ink);r(sx-3,4,8,12,steel);r(sx-2,5,3,7,shine);
    r(sx-6,17,14,7,ink);r(sx-4,18,10,4,steel);
    for(let finger=0;finger<3;finger++) {r(sx-5+finger*5,23,3,7,ink);r(sx-5+finger*5,23,2,4,shine);}
  }
  // Short bellows neck keeps the oversized head distinct from the body.
  r(-8,-42,17,12,ink);for(let yy=-40;yy<-31;yy+=4)r(-7,yy,15,2,steel);
  // Multiple fine aerials with stepped round tips.
  for(const [ax,top] of [[-18,-111],[9,-116],[-32,-99],[28,-97]]) {
    r(ax,-86,2,Math.abs(top+86),ink);r(ax,top,2,Math.abs(top+86),ink);
    r(ax-4,top-5,10,9,ink);r(ax-2,top-3,6,5,shine);r(ax,top-2,2,3,copper);
    r(ax-1,-92,4,5,copper);r(ax,-91,2,2,gold);
  }
  // Cuboid cream head: lit top, cool side wall and oxidised edges.
  r(-38,-86,72,43,ink);r(-34,-91,62,6,ink);r(-35,-83,61,37,cream);
  r(-31,-88,57,5,ivory);r(-33,-81,57,5,ivory);r(26,-83,12,39,ink);
  r(29,-80,7,33,steel);r(29,-80,3,26,shine);r(25,-76,2,30,dark);
  r(-35,-78,3,31,0xb7aa83);r(-33,-48,57,3,0xa69877);
  // Large round lens rims built from pixel clusters rather than smooth circles.
  for(const ex of [-20,12]) {
    r(ex-11,-73,22,19,ink);r(ex-8,-77,16,27,ink);
    r(ex-9,-71,18,15,shine);r(ex-6,-75,12,23,shine);
    r(ex-7,-71,14,15,dark);r(ex-5,-73,10,19,dark);
    r(ex-3,-73,7,2,ivory);
  }
  // Side ear drum, tiny nose, wry mouth, screws and weathering.
  r(35,-72,9,24,ink);r(38,-69,7,18,copper);r(40,-67,7,14,steel);r(41,-64,4,7,shine);
  r(-43,-70,5,15,copper);r(-41,-68,3,10,gold);
  r(-5,-61,3,5,ink);r(-8,-57,8,2,ink);
  r(-15,-50,25,2,ink);r(8,-52,4,2,ink);
  for(const [px,py] of [[-31,-79],[21,-79],[-31,-51],[21,-51]]){r(px,py,3,3,ink);r(px,py,1,1,ivory);}
  r(-28,-82,6,1,0x9d947a);r(14,-82,4,1,0x9d947a);r(30,-57,3,5,copper);
  const eyes=[-20,12].map(ex=>scene.add.rectangle(ex,-63,10,13,0x273942));
  const glints=[-20,12].map(ex=>scene.add.rectangle(ex-2,-67,3,3,0xf8f0d4));
  const robot=scene.add.container(x,y,[g,...eyes,...glints]).setDepth(12);
  return {robot,eyes};
}
