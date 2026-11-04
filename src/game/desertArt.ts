import Phaser from "phaser";

type Painter = (x: number, y: number, w: number, h: number, color: number) => void;
const palette = {sand: 0xd7a56b, light: 0xf3ce91, rust: 0x955b49, dark: 0x594451, metal: 0x7e9995};

export function drawDesertTerrain(scene: Phaser.Scene): void {
  const g = scene.add.graphics().setDepth(3);
  const r: Painter = (x,y,w,h,c) => { g.fillStyle(c).fillRect(x,y,w,h); };
  let seed = 3187;
  const random = () => {seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;};
  r(0,551,2000,209,0x885347);
  // A continuous walkable lip, with eroded bands underneath rather than a floating platform.
  r(0,551,2000,7,palette.light); r(0,558,2000,18,palette.sand);
  r(0,576,2000,25,0xb97d55); r(0,601,2000,36,0xa66b50); r(0,637,2000,123,0x885347);
  for(let x=0;x<2000;x+=8) {
    const lip=2+Math.floor(random()*3)*2;
    r(x,558,8,lip,0xe7ba7a);
    r(x,574+Math.floor(random()*4)*2,8,2,0xc78b58);
    const band=620+Math.floor(Math.sin(x/60)*4)*2;
    r(x,band,8,4,0xc68d64); r(x,band+6,8,2,0x79504a);
  }
  for(let i=0;i<1300;i++) {
    const x=Math.floor(random()*1000)*2, y=562+Math.floor(random()*98)*2;
    const colors=[0xe4b77d,0xc58d5c,0x79504a,0xa56b50];
    r(x,y,2+Math.floor(random()*3)*2,2,colors[i%4]);
  }
  // Pebbles, compacted sand ripples and occasional buried metal layers.
  for(let x=18;x<1990;x+=37) {
    const y=552+Math.floor(random()*8)*2;
    r(x,y,10,2,0xc18d5e); r(x+2,y-2,4,2,0xf3ce91);
    if(x%3===0) {r(x,592,14,4,palette.dark);r(x+2,592,8,2,0x8d9d92);}
  }
  for(let x=85;x<1980;x+=159) {
    const y=652+Math.floor(random()*12)*2;
    r(x,y,22,4,0x533e45);r(x+4,y-4,14,4,0x9f7865);r(x+6,y-4,6,2,0xd2a077);
    for(let j=0;j<4;j++) r(x+22+j*3,y+4+j*4,3,4,0x65444a);
  }
}

export function drawDesertRubble(scene: Phaser.Scene): void {
  const g=scene.add.graphics().setDepth(6);
  const r: Painter=(x,y,w,h,c)=>{g.fillStyle(c).fillRect(x,y,w,h);};
  // Irregular small groups sit in the gaps between interactive landmarks.
  const clusters = [[645,546],[665,543],[865,545],[883,541],[1010,544],[1030,546],[1175,543],[1200,545],[1535,545],[1555,542],[1730,545]];
  clusters.forEach(([x,y],i) => {
    r(x-5,y+2,31,3,0xa27458);
    r(x,y-5,19,7,palette.dark);r(x+3,y-11,12,7,0x968775);
    r(x+4,y-11,8,2,0xcfb58a);r(x+14,y-4,6,5,0x695852);
    if(i%3===0) {r(x+20,y-16,3,17,0x5b6263);r(x+23,y-15,13,3,0x87958a);r(x+25,y-15,7,1,0xc2c7ac);}
    r(x-2,y+1,27,2,palette.sand);
  });
}

export function drawPixelLibertyRuins(scene: Phaser.Scene): void {
  const g=scene.add.graphics().setDepth(7);
  const r: Painter=(x,y,w,h,c)=>{g.fillStyle(c).fillRect(x,y,w,h);};
  const edge=0x465c60, copper=0x73988b, lit=0xadc4a5, shadow=0x53776f;
  r(134,542,259,5,0xb0805c);
  // Fallen crown and face, visibly fractured oxidised copper, partly buried in sand.
  r(191,457,83,71,edge);r(198,449,66,84,edge);
  r(198,460,68,64,copper);r(204,452,54,17,lit);r(248,468,18,53,shadow);
  for(let i=0;i<5;i++){r(192+i*17,431-(i%2)*12,7,32,edge);r(194+i*17,435-(i%2)*12,3,24,lit);}
  r(207,477,14,6,edge);r(236,477,14,6,edge);r(222,481,6,21,shadow);r(222,500,16,4,edge);
  r(210,513,32,3,edge);r(212,516,27,2,lit);
  r(238,455,3,14,edge);r(235,468,3,12,edge);r(232,479,3,17,edge);r(229,494,3,11,edge);
  for(let i=0;i<24;i++)r(203+(i*19%58),464+(i*13%57),3,2,i%2?shadow:lit);
  // Detached torch, severed pedestal and collapsed draped torso.
  r(123,510,18,34,edge);r(126,510,11,30,copper);r(119,499,26,13,edge);r(122,500,20,6,lit);
  r(127,479,7,20,0xb4825d);r(133,486,6,13,0xcf9a63);
  r(290,485,61,59,edge);r(297,481,40,60,copper);r(304,477,24,9,lit);
  for(let i=0;i<5;i++){r(299+i*9,493+i*3,4,42-i*3,shadow);r(303+i*9,491+i*3,2,42-i*3,lit);}
  r(352,526,48,18,edge);r(357,523,33,17,copper);r(359,523,26,4,lit);
  for(let i=0;i<17;i++){const x=141+i*15;r(x,536+(i%3)*3,12,7,palette.sand);r(x+2,535+(i%3)*3,6,2,palette.light);}
}

export function createPixelSalvage(scene: Phaser.Scene, kind: "rocket"|"battery"|"oil"|"plastic", x: number, y: number): Phaser.GameObjects.Container {
  const g=scene.add.graphics();
  const r: Painter=(px,py,w,h,c)=>{g.fillStyle(c).fillRect(px,py,w,h);};
  if(kind==="rocket") {
    r(-73,15,146,4,0x9f7458);
    r(-66,-15,115,29,palette.dark);r(-61,-19,99,35,0x7e9291);
    r(-58,-16,92,9,0xd3d1b5);r(-58,-6,92,17,0xa4b4aa);r(-57,11,94,4,0x647d7b);
    r(-19,-18,7,33,0xb67558);r(-17,-16,2,27,0xf1b37b);
    r(38,-12,14,24,palette.dark);r(42,-8,14,16,0x354957);r(47,-5,17,10,0x111e2e);
    r(-66,-8,9,14,palette.dark);r(-70,-3,8,6,0x566d72);
    r(-48,-30,27,11,palette.dark);r(-44,-28,20,8,0xb7bfa9);
    r(-40,15,28,5,palette.rust);r(-34,19,18,3,palette.sand);
    for(let i=0;i<8;i++){r(-52+i*11,-12,2,2,0x566d72);r(-52+i*11,8,2,2,0x566d72);}
    r(16,-12,7,10,0x304655);r(18,-10,3,3,0x97c2bf);
    r(47,13,4,4,0x984e41);r(51,16,12,2,0x984e41);
  } else if(kind==="battery") {
    r(-26,13,51,4,0x9f7458);r(-24,-9,20,23,palette.dark);r(-21,-7,14,18,0x899a8c);
    r(-19,-12,6,3,0xd7c5a1);r(-18,-2,8,2,0xcfac73);
    r(2,-17,24,32,palette.dark);r(5,-13,18,22,0x314f5a);r(8,-10,10,2,0x658b8a);
    r(15,-5,2,5,0xa09e80);r(13,0,2,6,0xa09e80);r(11,6,2,3,0xa09e80);r(12,12,5,1,0xa4b4aa);
  } else if(kind==="plastic") {
    // Torn shopping bag: open handles, crumpled film and a submerged lower edge.
    r(-26,10,52,3,0x6b414b); r(-20,13,41,2,0x9b4652);
    r(-20,-9,6,18,0x647b7c); r(13,-8,7,16,0x647b7c);
    r(-16,-15,10,4,0xaabeb1); r(-17,-12,4,10,0xc7d4bf);
    r(-9,-12,4,8,0x8fa69d); r(5,-15,11,4,0xaabeb1);
    r(5,-12,4,8,0x8fa69d); r(13,-12,4,9,0xd9ddc5);
    // Muted transparent panels let the polluted water show through the thin plastic.
    g.fillStyle(0xc6d8c7,0.63).fillRect(-16,-4,32,14);
    g.fillStyle(0xc6d8c7,0.45).fillRect(-19,0,38,8);
    r(-16,-4,9,2,0xe2e7cc); r(4,-4,11,2,0xe2e7cc);
    r(-14,-1,3,9,0xb6c8b4); r(-11,5,5,2,0xd6ddc2);
    r(-5,-1,2,5,0x6f8580); r(-3,3,3,2,0x6f8580);
    r(0,5,3,3,0x6f8580); r(7,-1,2,7,0xd6ddc2);
    r(9,6,6,2,0xaabeb1); r(-17,8,7,3,0x8fa69d);
    r(-9,9,10,3,0xaabeb1); r(3,10,8,2,0x8fa69d);
    r(15,2,8,3,0xb6c8b4); r(21,1,3,2,0xd6ddc2);
    g.fillStyle(0x9b4652,0.55).fillRect(-18,10,35,3);
    r(-24,9,9,1,0xcb7b6d); r(16,10,11,1,0xcb7b6d);
  } else {
    r(-16,13,33,4,0x9f7458);r(-13,-16,26,31,palette.dark);r(-10,-13,20,26,0xb18c4e);
    r(-7,-13,4,24,0xe1b86a);r(-8,-4,16,13,0x445e5b);r(-2,-1,5,6,0xa9bf9c);
    r(-5,-22,15,6,palette.dark);r(0,-20,8,2,0x8eaaa0);r(10,-19,9,4,0x5d7774);
  }
  return scene.add.container(x,y,[g]).setDepth(11).setData("detailKind",kind);
}

export function setPixelPondState(pond: Phaser.GameObjects.Container, healthy: boolean): void {
  const g = pond.getData("surface") as Phaser.GameObjects.Graphics;
  g.clear();
  const r: Painter = (x,y,w,h,c)=>{g.fillStyle(c).fillRect(x,y,w,h);};
  // Stepped shoreline and shallow banks embed the water in the sand.
  r(-99,-2,198,17,0x946d54); r(-89,-10,178,30,0xb4875c); r(-75,-17,150,42,0xc99a65);
  r(-90,1,180,8,0x493c49); r(-80,-5,160,19,0x493c49); r(-62,-11,124,32,0x493c49);
  const deep=healthy?0x285b56:0x683946, mid=healthy?0x427f69:0x9b4652, light=healthy?0x7fab77:0xc76b65;
  r(-85,1,170,6,deep);r(-75,-4,150,18,mid);r(-58,-9,116,27,mid);r(-49,-8,94,4,light);
  r(-63,14,130,4,deep);r(-84,7,16,3,deep);r(69,8,14,3,deep);
  for(let i=0;i<12;i++) {
    const x=-65+i*11, y=-1+(i*7%13);
    r(x,y,6+(i%3)*3,1,i%2?deep:light);
  }
  r(-91,15,17,3,0xe3b77b);r(67,17,22,3,0xe3b77b);r(-53,22,31,2,0xe3b77b);
  [[-90,-4],[-65,-16],[71,-7],[86,7]].forEach(([x,y])=>{r(x,y,10,5,0x6a6259);r(x+2,y-2,6,3,0xc2ae86);});
  if(healthy) {
    r(-45,0,18,4,0x83a86e);r(-42,-2,12,2,0xb3cc87);r(-37,-1,2,3,mid);
    r(40,6,15,3,0x83a86e);r(44,4,8,2,0xb3cc87);
    r(-79,5,2,2,0xc4dfad);r(57,-4,2,2,0xc4dfad);
  } else {
    r(-40,6,24,3,0x593d49);r(27,-3,20,3,0x593d49);
    r(-20,-3,4,3,0xe4a07d);r(42,8,3,3,0xe4a07d);r(4,10,4,3,0xe4a07d);
  }
  pond.setData("healthy",healthy);
}

export function createPixelPond(scene: Phaser.Scene,x:number,y:number): Phaser.GameObjects.Container {
  const surface=scene.add.graphics();
  const pond=scene.add.container(x,y,[surface]).setDepth(8).setData("surface",surface);
  setPixelPondState(pond,false);
  return pond;
}

export function setPixelFrogState(frog: Phaser.GameObjects.Container, healthy: boolean): void {
  const g=frog.getData("bodyArt") as Phaser.GameObjects.Graphics;
  g.clear();
  const r: Painter=(x,y,w,h,c)=>{g.fillStyle(c).fillRect(x,y,w,h);};
  const ink=0x33494b, skin=healthy?0x84b76d:0x82966d, light=healthy?0xbad38a:0xa5af7c;
  r(-25,14,50,3,0x9f7458);
  r(-23,6,17,10,ink);r(7,6,17,10,ink);r(-21,7,13,6,skin);r(9,7,13,6,skin);
  r(-17,-9,34,23,ink);r(-14,-7,28,18,skin);r(-9,3,19,10,0xc3c28c);
  r(-17,-19,13,14,ink);r(5,-19,13,14,ink);
  r(-15,-17,9,11,light);r(7,-17,9,11,light);
  r(-13,-15,6,7,0xf0e0b5);r(8,-15,6,7,0xf0e0b5);
  r(-10,-14,3,5,ink);r(9,-14,3,5,ink);
  r(-17,-2,4,4,light);r(14,-1,3,3,light);r(-6,-5,3,2,light);
  if(healthy) {r(-8,3,3,2,ink);r(-5,5,11,2,ink);r(6,3,3,2,ink);}
  else {
    r(-14,-16,9,4,skin);r(7,-16,9,4,skin);
    r(-6,6,13,2,ink);r(-8,8,3,2,ink);r(7,8,3,2,ink);
    r(-12,0,5,2,0xaf7970);r(9,0,5,2,0xaf7970);
  }
  r(-22,14,15,3,skin);r(8,14,16,3,skin);
  frog.setData("healthy",healthy);
}

export function createPixelFrog(scene: Phaser.Scene,x:number,y:number): Phaser.GameObjects.Container {
  const art=scene.add.graphics();
  const frog=scene.add.container(x,y,[art]).setDepth(12).setData("bodyArt",art);
  setPixelFrogState(frog,false);
  scene.tweens.add({targets:art,y:2,duration:950,yoyo:true,repeat:-1,ease:"Sine.inOut"});
  return frog;
}

export function createRocketCrashDetails(scene: Phaser.Scene, x: number, y: number): {nose: Phaser.GameObjects.Container; wing: Phaser.GameObjects.Container} {
  // Distant wing: smaller, desaturated and sunk into a dune behind the walking path.
  const back=scene.add.graphics();
  const w=(px:number,py:number,width:number,height:number,c:number)=>back.fillStyle(c).fillRect(px,py,width,height);
  for(let row=0;row<13;row++) {
    const left=24-row*3;
    w(left,row*2,10+row*3,2,0x8e8470);
    if(row<11)w(left+2,row*2,6+row*3,2,0xb4aa87);
  }
  w(-10,22,57,4,0x81775f); w(8,9,3,12,0x9c765b);w(27,17,8,2,0x786f61);
  w(-16,26,71,4,0xce955e);w(-7,25,22,2,0xe0ad71);
  const wing=scene.add.container(x+122,y-54,[back]).setDepth(4);
  // Broken nose cone in the foreground, with a dark torn cross-section and exposed ribs.
  const front=scene.add.graphics();
  const r=(px:number,py:number,width:number,height:number,c:number)=>front.fillStyle(c).fillRect(px,py,width,height);
  r(-105,24,159,5,0x8c624f);
  // A long pointed cone, facing left; the heat-resistant tip is distinctly black.
  for(let col=0;col<66;col++) {
    const px=-104+col*2;
    const half=Math.max(1,Math.floor(col*0.43));
    r(px,-7-half,2,half*2+2,0x263b47);
    if(col<16) {
      r(px,-6-half,2,Math.max(2,half*2-1),col<10?0x101a25:0x1d2b35);
      if(col>5)r(px,-7-Math.floor(half*0.55),2,2,0x526169);
    } else {
      r(px,-5-half,2,Math.max(2,half-1),0xd7d0aa);
      r(px,-5,2,Math.max(2,half-1),0x9fb0a5);
      r(px,half-9,2,5,0x718a87);
    }
  }
  // The wide rear edge is broken open, exposing black interior and golden ribs.
  r(28,-32,15,50,0x263b47);r(31,-27,14,40,0x101e2c);
  r(26,-35,9,7,0xb8c0a4);r(38,-24,9,8,0x718a87);r(40,4,8,11,0x718a87);
  for(let i=0;i<5;i++) {
    r(32,-23+i*8,11+(i%2)*5,2,0xb18a59);
    r(32,-23+i*8,6,1,0xe1bf86);
  }
  r(-67,-16,5,16,0x334b53);r(-62,-13,3,16,0xc68a5b);
  r(-39,-18,23,2,0xf0e0b5);r(-18,-6,18,2,0xc68a5b);
  r(22,20,26,3,0xc99a65);r(-93,25,34,3,0xd7a56b);r(-81,24,12,2,0xf3ce91);
  r(50,15,10,4,0x8f9c8b);r(60,20,5,3,0x9a7358);
  const nose=scene.add.container(x-26,y+52,[front]).setDepth(35);
  return {nose,wing};
}

