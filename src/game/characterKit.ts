import Phaser from "phaser";

export type MonkeyDetailOptions = {
  fur?: number;
  face?: number;
  outfit?: "kimono" | "none";
  belt?: boolean;
  sunglasses?: boolean;
  orangeJuice?: boolean;
  smile?: boolean;
  skinny?: boolean;
};

export function createDetailedMonkey(
  scene: Phaser.Scene,
  x: number,
  y: number,
  options: MonkeyDetailOptions = {},
): Phaser.GameObjects.Container {
  const fur = options.fur ?? 0x8f9299;
  const face = options.face ?? 0xd7b18d;
  const skinny = options.skinny ?? true;
  const parts: Phaser.GameObjects.GameObject[] = [];

  const shadow = scene.add.ellipse(4, 47, 62, 12, 0x15111f, 0.28);
  const stickerBack = scene.add.ellipse(0, 4, skinny ? 58 : 70, 108, 0xffffff, 0.9).setStrokeStyle(3, 0x302844, 0.16);
  const tail = scene.add.graphics();
  tail.lineStyle(6, fur, 1).beginPath().arc(-23, 12, 22, Phaser.Math.DegToRad(260), Phaser.Math.DegToRad(70), false).strokePath();
  const tailTip = scene.add.circle(-43, -4, 5, 0x6f737c).setStrokeStyle(2, 0x302844);

  const leg1 = scene.add.rectangle(-10, 41, 9, 34, fur).setStrokeStyle(2, 0x302844).setAngle(4);
  const leg2 = scene.add.rectangle(10, 41, 9, 34, fur).setStrokeStyle(2, 0x302844).setAngle(-4);
  const foot1 = scene.add.ellipse(-13, 59, 19, 8, face).setStrokeStyle(2, 0x302844);
  const foot2 = scene.add.ellipse(13, 59, 19, 8, face).setStrokeStyle(2, 0x302844);

  const body = scene.add.ellipse(0, 16, skinny ? 32 : 42, 58, fur).setStrokeStyle(3, 0x302844);
  const belly = scene.add.ellipse(0, 23, skinny ? 18 : 26, 35, 0xbfc2c8, 0.74);
  const arm1 = scene.add.rectangle(-24, 12, 8, 48, fur).setStrokeStyle(2, 0x302844).setAngle(16);
  const arm2 = scene.add.rectangle(29, 11, 8, 43, fur).setStrokeStyle(2, 0x302844).setAngle(-28);
  const hand1 = scene.add.circle(-29, 34, 6, face).setStrokeStyle(2, 0x302844);
  const hand2 = scene.add.circle(39, 26, 6, face).setStrokeStyle(2, 0x302844);

  parts.push(shadow, stickerBack, tail, tailTip, leg1, leg2, foot1, foot2, arm1, arm2, body, belly, hand1, hand2);

  if (options.outfit === "kimono") {
    const robeLeft = scene.add.triangle(-7, 15, -22, -24, 18, -24, -10, 36, 0xf8f8f2).setStrokeStyle(2, 0x302844);
    const robeRight = scene.add.triangle(8, 14, -16, -25, 21, -25, 10, 37, 0xffffff).setStrokeStyle(2, 0x302844);
    const collar1 = scene.add.rectangle(-7, -1, 5, 39, 0xe3e6ef).setAngle(-28);
    const collar2 = scene.add.rectangle(8, -1, 5, 39, 0xd9dce8).setAngle(28);
    const sleeve1 = scene.add.ellipse(-25, 10, 19, 35, 0xf8f8f2).setStrokeStyle(2, 0x302844).setAngle(13);
    const sleeve2 = scene.add.ellipse(29, 7, 18, 33, 0xffffff).setStrokeStyle(2, 0x302844).setAngle(-24);
    parts.push(sleeve1, sleeve2, robeLeft, robeRight, collar1, collar2);
  }

  if (options.belt) {
    parts.push(scene.add.rectangle(0, 24, 39, 8, 0x111218).setStrokeStyle(2, 0x302844));
    parts.push(scene.add.rectangle(13, 25, 12, 4, 0x302844));
  }

  if (options.orangeJuice) {
    const glass = scene.add.rectangle(43, 14, 14, 22, 0xffc46b, 0.72).setStrokeStyle(2, 0xffffff, 0.9);
    const juiceTop = scene.add.ellipse(43, 3, 15, 5, 0xfff0a8, 0.85).setStrokeStyle(1, 0xffffff);
    const straw = scene.add.rectangle(48, -5, 2, 24, 0xffffff).setAngle(18);
    const orange = scene.add.circle(37, 4, 4, 0xff8b2d).setStrokeStyle(1, 0xffffff);
    parts.push(straw, glass, juiceTop, orange);
  }

  const ear1 = scene.add.circle(-23, -24, 9, fur).setStrokeStyle(2, 0x302844);
  const ear2 = scene.add.circle(23, -24, 9, fur).setStrokeStyle(2, 0x302844);
  const head = scene.add.circle(0, -25, 25, fur).setStrokeStyle(3, 0x302844);
  const facePatch = scene.add.ellipse(0, -18, 27, 23, face).setStrokeStyle(1, 0xa77c5c, 0.35);
  const cheek1 = scene.add.circle(-10, -12, 4, 0xf2a0a8, 0.38);
  const cheek2 = scene.add.circle(10, -12, 4, 0xf2a0a8, 0.38);
  parts.push(ear1, ear2, head, facePatch, cheek1, cheek2);

  if (options.sunglasses) {
    const lens1 = scene.add.ellipse(-8, -24, 14, 10, 0x111218, 0.94).setStrokeStyle(2, 0x5f6678);
    const lens2 = scene.add.ellipse(8, -24, 14, 10, 0x111218, 0.94).setStrokeStyle(2, 0x5f6678);
    const bridge = scene.add.rectangle(0, -24, 6, 2, 0x111218);
    const shine1 = scene.add.rectangle(-11, -27, 6, 2, 0xffffff, 0.46).setAngle(-18);
    const shine2 = scene.add.rectangle(5, -27, 6, 2, 0xffffff, 0.38).setAngle(-18);
    parts.push(lens1, lens2, bridge, shine1, shine2);
  } else {
    parts.push(scene.add.circle(-8, -23, 3, 0x302844), scene.add.circle(8, -23, 3, 0x302844));
  }

  const nose = scene.add.ellipse(0, -16, 5, 4, 0x6b4a43, 0.95);
  const smile = options.smile !== false
    ? scene.add.arc(0, -11, 9, 10, 162, false, 0x302844).setStrokeStyle(3, 0x302844)
    : scene.add.rectangle(0, -10, 11, 3, 0x302844);
  parts.push(nose, smile);

  const container = scene.add.container(x, y, parts);
  container.setData("artRole", "detailed-character");
  container.setData("details", {
    species: "small grey monkey",
    outfit: options.outfit ?? "none",
    accessories: [
      options.belt ? "black belt" : "",
      options.sunglasses ? "sunglasses" : "",
      options.orangeJuice ? "orange juice" : "",
    ].filter(Boolean),
  });
  return container;
}
