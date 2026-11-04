import Phaser from "phaser";

/** Shared companion silhouette: white-furred monkey, uncovered face and white sci-fi shinobi suit. */
export function createCompanionMonkey(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  const r = (px: number, py: number, w: number, h: number, color: number) => g.fillStyle(color).fillRect(px, py, w, h);
  const ink = 0x26354b, white = 0xf5f7ee, light = 0xffffff, shade = 0xb9c8d4;
  const deep = 0x7d93aa, cyan = 0x76e7e1, fur = 0xf0f1e7;

  // Tail remains unmistakably simian; armour segments follow its curled outline.
  r(15, 12, 14, 7, ink); r(25, -6, 7, 23, ink); r(18, -10, 12, 7, ink);
  r(17, 13, 11, 4, shade); r(27, -4, 3, 18, white); r(20, -8, 8, 3, white);
  r(26, 2, 5, 2, deep); r(26, 9, 5, 2, deep); r(20, -7, 3, 2, cyan);

  // Narrow ninja trousers, ribbed joints and armoured boots.
  r(-13, 19, 12, 23, ink); r(2, 19, 12, 23, ink);
  r(-11, 21, 8, 13, white); r(4, 21, 8, 13, shade);
  r(-10, 23, 3, 9, light); r(5, 22, 3, 9, white);
  r(-11, 32, 8, 4, deep); r(4, 32, 8, 4, deep);
  r(-15, 36, 14, 7, ink); r(2, 36, 14, 7, ink);
  r(-13, 36, 10, 4, white); r(4, 36, 10, 4, shade);
  r(-13, 40, 10, 1, cyan); r(4, 40, 10, 1, cyan);

  // Layered white wrap jacket over a dark flexible undersuit.
  r(-15, -13, 30, 38, ink); r(-12, -11, 24, 33, shade);
  r(-12, -11, 13, 27, white); r(1, -9, 10, 25, 0xdce5e8);
  r(-10, -9, 4, 20, light); r(-7, -10, 3, 5, deep);
  r(-4, -5, 3, 6, deep); r(-1, 1, 3, 7, deep);
  r(-5, -10, 3, 5, light); r(-2, -5, 3, 6, light); r(1, 1, 3, 6, light);
  r(6, -6, 4, 2, cyan); r(6, -3, 3, 1, light);
  r(-14, 13, 28, 6, ink); r(-2, 13, 6, 5, deep); r(-1, 14, 4, 3, cyan);
  r(8, 19, 4, 10, white); r(9, 28, 3, 3, shade);

  // Angular pauldrons, sleeves, wrist controls and gloves.
  r(-21, -12, 9, 14, ink); r(12, -12, 10, 14, ink);
  r(-19, -10, 7, 9, white); r(14, -10, 6, 9, shade);
  r(-18, -9, 4, 2, light); r(14, -9, 4, 2, white);
  r(-20, 1, 8, 18, ink); r(13, 1, 8, 18, ink);
  r(-18, 2, 5, 13, white); r(14, 2, 5, 13, shade);
  r(-19, 12, 7, 5, deep); r(13, 12, 7, 5, deep);
  r(-18, 13, 4, 2, cyan); r(14, 13, 4, 2, cyan);
  r(-19, 18, 6, 5, white); r(14, 18, 6, 5, white);

  // Bare white-furred head: soft tufts, round ears and an uncovered expressive muzzle.
  r(-24, -33, 12, 15, ink); r(12, -33, 12, 15, ink);
  r(-22, -31, 9, 11, fur); r(14, -31, 8, 11, fur);
  r(-20, -28, 4, 5, 0xd6b4a5); r(16, -28, 4, 5, 0xd6b4a5);
  r(-16, -37, 33, 25, ink); r(-12, -41, 25, 32, ink);
  r(-13, -35, 27, 22, fur); r(-10, -39, 21, 27, fur);
  r(-8, -43, 5, 6, fur); r(1, -45, 5, 8, light); r(8, -42, 4, 5, fur);
  r(-11, -36, 7, 5, light); r(9, -34, 4, 17, 0xcbd3ce);
  r(-10, -30, 10, 12, 0xe6c9af); r(1, -30, 10, 12, 0xe6c9af);
  r(-7, -31, 5, 2, 0xb3bcb8); r(4, -31, 5, 2, 0xb3bcb8);
  r(-7, -28, 4, 5, ink); r(5, -28, 4, 5, ink);
  r(-7, -28, 1, 2, light); r(5, -28, 1, 2, light);
  r(-7, -21, 16, 9, 0xe6c9af); r(-5, -20, 12, 5, 0xf2d8ba);
  r(-1, -22, 4, 2, 0x85675e);
  r(-4, -16, 3, 2, 0x85675e); r(-1, -14, 5, 1, 0x85675e); r(4, -16, 3, 2, 0x85675e);

  return scene.add.container(x, y, [g]).setDepth(15).setData("character", "white-sci-fi-ninja-monkey");
}


/** Pinkwindkis is the same white monkey later in life, in an independent explorer's spacesuit. */
export function createFutureMonkey(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const monkey = createCompanionMonkey(scene, x, y);
  const back = scene.add.graphics();
  back.fillStyle(0x223146).fillRect(-24,-15,48,35);
  back.fillStyle(0x687d98).fillRect(-23,-12,7,27).fillRect(18,-12,7,27);
  back.fillStyle(0xbabda9).fillRect(-22,-10,3,18).fillRect(20,-10,3,18);
  back.fillStyle(0x89e2d5).fillRect(-22,9,3,3).fillRect(20,9,3,3);
  monkey.addAt(back,0);
  const g=scene.add.graphics();
  const r=(px:number,py:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(px,py,w,h);
  // Indigo pressure suit with pale ceramic plates and a warm metallic utility harness.
  r(-12,-10,24,24,0x485374);r(-9,-9,6,21,0x647799);r(7,-8,4,19,0x303f5c);
  r(-10,-10,20,4,0xdde6d7);r(-6,-7,12,3,0x889eae);
  r(-7,-2,15,13,0x24394a);r(-5,0,11,8,0x91d8cd);
  r(-3,1,3,2,0xe4f5d5);r(2,1,3,2,0x3c8a92);r(-3,5,7,1,0x3c8a92);
  r(-14,13,28,6,0x29394d);r(-2,13,6,5,0xc6a16c);r(-1,14,4,2,0xf1d29a);
  r(-13,18,8,7,0x66758e);r(6,18,7,7,0x66758e);
  r(-19,-10,7,8,0xcddace);r(14,-10,6,8,0xb3c4c1);
  r(-18,2,5,10,0x485374);r(14,2,5,10,0x485374);
  r(-19,12,7,5,0x29394d);r(13,12,7,5,0x29394d);
  r(-18,13,4,2,0xe3b983);r(14,13,4,2,0x8ee4d7);
  r(-11,23,8,9,0x566584);r(4,23,8,9,0x485374);
  r(-11,31,8,4,0xb6c8c4);r(4,31,8,4,0xb6c8c4);
  r(-12,37,9,3,0x66758e);r(4,37,9,3,0x66758e);
  r(-12,40,9,1,0x8ee4d7);r(4,40,9,1,0x8ee4d7);
  // Small asymmetric mission patch marks his future identity without obscuring his bare face.
  r(9,-7,3,4,0xd8b37e);r(9,-7,2,1,0xf3d99f);
  monkey.add(g);
  return monkey.setData("character","Pinkwindkis").setData("identity","future-white-monkey");
}
