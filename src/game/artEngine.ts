import Phaser from "phaser";

type ReliefOptions = {
  texture?: "paper" | "sand" | "moon" | "metal" | "water";
  stroke?: number;
  strokeAlpha?: number;
  shadow?: number;
  highlight?: number;
  depth?: number;
  radius?: number;
};

const textureKeys = {
  paper: "upless-texture-paper",
  sand: "upless-texture-sand",
  moon: "upless-texture-moon",
  metal: "upless-texture-metal",
  water: "upless-texture-water",
};

export function generateArtTextures(scene: Phaser.Scene): void {
  makeNoiseTexture(scene, textureKeys.paper, 96, 0xf8f1df, 0x4a3d5f, 0.08);
  makeNoiseTexture(scene, textureKeys.sand, 96, 0xf0bb6d, 0x7a4d33, 0.16);
  makeNoiseTexture(scene, textureKeys.moon, 96, 0xaeb4c6, 0x3d455a, 0.18);
  makeNoiseTexture(scene, textureKeys.metal, 96, 0x778199, 0x1d2433, 0.13);
  makeNoiseTexture(scene, textureKeys.water, 96, 0x64d8e8, 0xffffff, 0.12);
}

export function addWorldGrain(
  scene: Phaser.Scene,
  key: keyof typeof textureKeys = "paper",
  alpha = 0.12,
): Phaser.GameObjects.TileSprite {
  return scene.add
    .tileSprite(180, 320, 360, 640, textureKeys[key])
    .setScrollFactor(0)
    .setAlpha(alpha)
    .setBlendMode(Phaser.BlendModes.MULTIPLY)
    .setDepth(0.5);
}

export function addReliefBlock(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  options: ReliefOptions = {},
): Phaser.GameObjects.Rectangle {
  const depth = options.depth ?? 2;
  const shadow = options.shadow ?? 0.32;
  const highlight = options.highlight ?? 0.24;
  const stroke = options.stroke ?? 0xffffff;
  const strokeAlpha = options.strokeAlpha ?? 0.32;
  const texture = options.texture ?? "paper";
  const radius = options.radius ?? Math.min(12, Math.max(4, height / 3));

  scene.add.rectangle(x + 5, y + 8, width, height, 0x050712, shadow).setDepth(depth - 1);
  const body = scene.add.rectangle(x, y, width, height, color).setStrokeStyle(3, stroke, strokeAlpha).setDepth(depth);
  scene.add
    .tileSprite(x, y, width - 4, Math.max(4, height - 4), textureKeys[texture])
    .setAlpha(0.2)
    .setBlendMode(Phaser.BlendModes.MULTIPLY)
    .setDepth(depth + 0.05);
  scene.add.rectangle(x, y - height / 2 + 4, Math.max(8, width - 10), 4, 0xffffff, highlight).setDepth(depth + 0.1);
  scene.add.rectangle(x, y + height / 2 - 5, Math.max(8, width - 12), 5, 0x000000, 0.1).setDepth(depth + 0.1);

  if (radius > 0) {
    scene.add.circle(x - width / 2 + radius, y - height / 2 + radius, Math.max(1, radius / 5), 0xffffff, 0.28).setDepth(depth + 0.2);
    scene.add.circle(x + width / 2 - radius, y + height / 2 - radius, Math.max(1, radius / 6), 0x000000, 0.12).setDepth(depth + 0.2);
  }

  return body;
}

export function addStickerDepth(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth = 1): Phaser.GameObjects.Container {
  const shadow = scene.add.ellipse(5, height / 2 - 4, width * 0.92, height * 0.18, 0x070915, 0.28);
  const paper = scene.add.ellipse(0, 0, width, height, 0xffffff, 0.92).setStrokeStyle(3, 0x2a2440, 0.18);
  const grain = scene.add.tileSprite(0, 0, width * 0.84, height * 0.72, textureKeys.paper).setAlpha(0.12).setBlendMode(Phaser.BlendModes.MULTIPLY);
  return scene.add.container(x, y, [shadow, paper, grain]).setDepth(depth);
}

function makeNoiseTexture(scene: Phaser.Scene, key: string, size: number, base: number, fleck: number, density: number): void {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, size, size);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = colorToCss(base, 0.72);
  context.fillRect(0, 0, size, size);
  // Seeded clusters tile consistently, without blurry subpixel noise.
  let seed = base >>> 0;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < size * size * density / 4; i += 1) {
    const x = Math.floor(random() * size / 2) * 2;
    const y = Math.floor(random() * size / 2) * 2;
    context.fillStyle = colorToCss(fleck, 0.15 + random() * 0.16);
    context.fillRect(x, y, 2 + Math.floor(random() * 2) * 2, 2);
    context.fillStyle = colorToCss(0xffffff, 0.12);
    context.fillRect(x, (y + 2) % size, 2, 1);
  }
  texture.refresh();
}

function colorToCss(color: number, alpha: number): string {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

