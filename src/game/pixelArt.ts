import Phaser from "phaser";

// Draw at native resolution: silhouettes, colour clusters and lighting share a 1 px grid.
export function createPixelHero(scene: Phaser.Scene): void {
  const texture = scene.textures.createCanvas("hero", 42, 47);
  if (!texture) return;
  const c = texture.context;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color; c.fillRect(x, y, w, h);
  };
  const ink = "#20243e";
  rect(7, 43, 29, 2, "#22244055");
  rect(10, 29, 23, 12, ink);
  rect(11, 31, 10, 9, "#7488df"); rect(22, 31, 9, 9, "#4d5dab");
  rect(11, 32, 3, 6, "#a1b2ef"); rect(17, 33, 2, 6, "#5264b6");
  rect(10, 40, 10, 3, ink); rect(23, 40, 10, 3, ink);
  rect(10, 40, 5, 1, "#b6c7ef"); rect(23, 40, 5, 1, "#90a5d6");
  rect(6, 12, 29, 20, ink); rect(9, 8, 23, 27, ink);
  rect(8, 13, 25, 16, "#d49654"); rect(11, 10, 19, 23, "#f1bf70");
  rect(11, 13, 16, 14, "#ffda8b"); rect(11, 12, 4, 10, "#ffe9ad");
  rect(29, 16, 3, 12, "#b57748"); rect(13, 30, 16, 2, "#d49654");
  // The original spiky silhouette stays recognisable.
  [[5, 5, 4, 13], [9, 8, 5, 7], [16, 2, 4, 11], [20, 6, 4, 7], [27, 4, 4, 11], [31, 10, 6, 8]].forEach(([x,y,w,h]) => rect(x,y,w,h,ink));
  rect(6, 6, 1, 6, "#59627d"); rect(17, 4, 1, 5, "#59627d"); rect(28, 6, 1, 6, "#59627d");
  rect(12, 17, 7, 8, "#fff3d6"); rect(24, 17, 6, 8, "#fff3d6");
  rect(16, 19, 3, 5, ink); rect(25, 19, 3, 5, ink);
  rect(16, 19, 1, 1, "#ffffff"); rect(25, 19, 1, 1, "#ffffff");
  rect(20, 24, 3, 2, "#cc8c52"); rect(17, 28, 8, 1, ink); rect(18, 29, 6, 1, "#a96542");
  rect(9, 25, 4, 2, "#e8a16c"); rect(28, 25, 3, 2, "#e8a16c");
  texture.refresh();
}

export function addPixelVista(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const box = (x: number, y: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(x,y,w,h);
  const bands = [0x11172e, 0x171e3b, 0x22274b, 0x33305b, 0x51416b, 0x796080];
  bands.forEach((color, i) => box(0, i * 72, 360, 73, color));
  let seed = 481;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i=0; i<95; i++) {
    const x = Math.floor(random()*180)*2, y = Math.floor(random()*175)*2;
    box(x,y,2,2,i%4 ? 0x8996ba : 0xf8dfa8);
    if(i%13===0) { box(x-2,y,6,2,0xf8dfa8); box(x,y-2,2,6,0xf8dfa8); }
  }
  // Stepped lunar disc, shaded in deliberate colour clusters.
  for(let y=-27;y<=27;y++) {
    const half = Math.floor(Math.sqrt(27*27-y*y)/2)*2;
    box(276-half,84+y,half*2,2,y<0?0xf5dca5:0xdfb887);
  }
  [[264,66,12,6],[286,94,14,8],[258,90,8,4]].forEach(([x,y,w,h])=>box(x,y,w,h,0xc99f7f));
  for(let layer=0;layer<3;layer++) {
    const base = 335+layer*36;
    for(let x=0;x<360;x+=4) {
      const y = base-Math.floor((Math.sin(x/57+layer*2)*18+Math.sin(x/23)*7)/4)*4;
      box(x,y,4,480-y,[0x393956,0x292f4a,0x1b263b][layer]);
    }
  }
  box(0,428,360,212,0x111d30);
  box(0,428,360,3,0x799b91); box(0,431,360,5,0x3d676b);
  for(let i=0;i<180;i++) {
    const x=Math.floor(random()*180)*2, y=438+Math.floor(random()*98)*2;
    box(x,y,2+Math.floor(random()*3)*2,2,i%3?0x1d3041:0x335052);
  }
  // Mossy floating plinth beneath the hero.
  box(124,397,112,6,0x27334a); box(120,391,120,6,0x86b59b);
  box(126,397,108,8,0x4a7772); box(132,405,96,8,0x314955);
  box(142,413,76,6,0x243247);
  for(let x=126;x<235;x+=12) { box(x,389,6,2,0xc3d6a7); box(x+2,399,2,4,0x244756); }
}

