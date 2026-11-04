import Phaser from "phaser";

export function createDesertStargate(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const frame = scene.add.graphics().setDepth(9);
  const r = (px: number, py: number, w: number, h: number, c: number) => frame.fillStyle(c).fillRect(x + px, y + py, w, h);
  // Rounded silhouette, kept on the same crisp two-pixel grid as the desert.
  for (const [radius, color] of [[94, 0x334b50], [91, 0xf4f4dc], [87, 0x9bcaa2], [83, 0x243c3c], [79, 0x142c50]]) {
    for (let py = -radius; py <= radius; py += 2) {
      const half = Math.floor(Math.sqrt(Math.max(0, radius * radius - py * py)) / 2) * 2;
      r(-half, py, half * 2, 2, color);
    }
  }
  // A soft blue veil with layered currents and a bright inner rim.
  for (let py = -77; py <= 77; py += 2) {
    const half = Math.floor(Math.sqrt(Math.max(0, 77 * 77 - py * py)) / 2) * 2;
    r(-half, py, half * 2, 2, py < -28 ? 0x254d79 : py < 26 ? 0x326d9c : 0x244c78);
    const shift = Math.floor(Math.sin(py / 18) * 12 / 2) * 2;
    const left = Math.max(-half + 2, -32 + shift), right = Math.min(half - 2, 24 + shift);
    if (right > left) r(left, py, right - left, 2, py < 10 ? 0x4386b0 : 0x3878a4);
    if (half > 10 && py % 6 === 1) { r(-half, py, 2, 2, 0x79c6d1); r(half - 2, py, 2, 2, 0x79c6d1); }
  }
  // Fixed peripheral mechanisms remain black and gold when the locks retract.
  for (const [px, py] of [[-62, -64], [62, -64], [-89, 0], [89, 0], [-62, 64], [62, 64]]) {
    r(px - 7, py - 5, 14, 10, 0x18292d); r(px - 5, py - 3, 10, 6, 0xc5a367);
    r(px - 3, py - 3, 4, 2, 0xf0dba1); r(px - 2, py, 4, 2, 0x648f78);
  }
  // Substantial plinth: two supports, white bevel, green panel and dark/gold foundation.
  r(-62, 71, 14, 21, 0x263d42); r(48, 71, 14, 21, 0x263d42);
  r(-59, 74, 8, 15, 0xdfe7cb); r(51, 74, 8, 15, 0xdfe7cb);
  r(-65, 88, 130, 6, 0xf4f4dc); r(-74, 94, 148, 6, 0x405953);
  r(-70, 94, 140, 3, 0x99b894); r(-79, 100, 158, 4, 0x1d3037);
  r(-70, 100, 140, 2, 0xc5a367); r(-17, 91, 34, 7, 0x18292d);
  r(-11, 92, 22, 4, 0x7bbda0); r(-5, 92, 10, 2, 0xc6eac5);

  const stars = scene.add.graphics().setDepth(9.1);
  let seed = 4721;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 46; i++) {
    const px = Math.floor((random() * 140 - 70) / 2) * 2;
    const py = Math.floor((random() * 140 - 70) / 2) * 2;
    if (px * px + py * py > 70 * 70) continue;
    stars.fillStyle(i % 3 ? 0xa2d6e8 : 0xf0f2d5).fillRect(x + px, y + py, 2, 2);
    if (i % 9 === 0) {
      stars.fillRect(x + px - 2, y + py, 6, 2);
      stars.fillRect(x + px, y + py - 2, 2, 6);
    }
  }
  scene.tweens.add({targets: stars, alpha: 0.4, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.inOut"});
  // Only the small locking tabs retract; the starry blue veil stays visible.
  const locks = scene.add.graphics();
  for (const side of [-1, 1]) {
    locks.fillStyle(0x15272e).fillRect(side < 0 ? -78 : 66, -13, 12, 26);
    locks.fillStyle(0xc5a367).fillRect(side < 0 ? -76 : 67, -8, 9, 16);
    locks.fillStyle(0xf0dba1).fillRect(side < 0 ? -74 : 68, -7, 4, 3);
  }
  return scene.add.container(x, y, [locks]).setDepth(10);
}
