import Phaser from "phaser";

const pinkwindkisKey = "upless-pinkwindkis-cute-astro";

export function createPinkwindkisSprite(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  if (!scene.textures.exists(pinkwindkisKey)) drawPinkwindkisTexture(scene);
  const shadow = scene.add.ellipse(0, 58, 62, 13, 0x10212a, 0.22);
  const drawing = scene.add.image(0, 0, pinkwindkisKey).setScale(0.52);
  return scene.add
    .container(x, y, [shadow, drawing])
    .setData("renderMode", "drawn-character-texture")
    .setData("character", "Pinkwindkis");
}

function drawPinkwindkisTexture(scene: Phaser.Scene): void {
  const texture = scene.textures.createCanvas(pinkwindkisKey, 180, 220);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, 180, 220);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(90, 108);

  drawTail(ctx);
  drawLegs(ctx);
  drawArms(ctx);
  drawSuit(ctx);
  drawHead(ctx);
  drawHelmet(ctx);
  drawCuteFace(ctx);
  drawDetails(ctx);
  addSoftGrain(ctx);
  texture.refresh();
}

function drawTail(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(-32, 25);
  ctx.quadraticCurveTo(-65, 15, -57, -14);
  ctx.stroke();
  ctx.strokeStyle = "#1f2a44";
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = "#f5f3e9";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();
}

function drawLegs(ctx: CanvasRenderingContext2D): void {
  fillStroke(ctx, "#f8f4e9", "#1f2a44", 7, () => rounded(ctx, -25, 37, 20, 52, 8));
  fillStroke(ctx, "#f8f4e9", "#1f2a44", 7, () => rounded(ctx, 7, 37, 20, 52, 8));
  fillStroke(ctx, "#e2762e", "#1f2a44", 6, () => boot(ctx, -18, 86));
  fillStroke(ctx, "#e2762e", "#1f2a44", 6, () => boot(ctx, 18, 86));
}

function drawArms(ctx: CanvasRenderingContext2D): void {
  fillStroke(ctx, "#f8f4e9", "#1f2a44", 7, () => arm(ctx, -44, 8, -0.28));
  fillStroke(ctx, "#f8f4e9", "#1f2a44", 7, () => arm(ctx, 44, 8, 0.28));
  fillStroke(ctx, "#e2762e", "#1f2a44", 5, () => cuff(ctx, -48, 38, -0.25));
  fillStroke(ctx, "#e2762e", "#1f2a44", 5, () => cuff(ctx, 48, 38, 0.25));
  fillStroke(ctx, "#1f2a44", "#1f2a44", 2, () => circlePath(ctx, -51, 52, 10));
  fillStroke(ctx, "#1f2a44", "#1f2a44", 2, () => circlePath(ctx, 51, 52, 10));
}

function drawSuit(ctx: CanvasRenderingContext2D): void {
  fillStroke(ctx, "#f8f4e9", "#1f2a44", 8, () => body(ctx));
  fillStroke(ctx, "#ffffff", "#d5cfc5", 3, () => ovalPath(ctx, 0, 23, 38, 62));
  fillStroke(ctx, "#e2762e", "#1f2a44", 5, () => strap(ctx, -21, 20, -0.22));
  fillStroke(ctx, "#e2762e", "#1f2a44", 5, () => strap(ctx, 21, 20, 0.22));
  fillStroke(ctx, "#e2762e", "#1f2a44", 5, () => rounded(ctx, -33, 48, 66, 13, 6));
  fillStroke(ctx, "#8eeaff", "#1f2a44", 5, () => circlePath(ctx, 26, 13, 9));
  ctx.fillStyle = "rgba(31,42,68,.14)";
  oval(ctx, -9, 18, 22, 49);
  ctx.fill();
}

function drawHead(ctx: CanvasRenderingContext2D): void {
  fillStroke(ctx, "#f7f4ea", "#1f2a44", 8, () => circlePath(ctx, 0, -47, 36));
  fillStroke(ctx, "#f7f4ea", "#1f2a44", 5, () => circlePath(ctx, -33, -50, 12));
  fillStroke(ctx, "#f7f4ea", "#1f2a44", 5, () => circlePath(ctx, 33, -50, 12));
  fillStroke(ctx, "#ffdec0", "#1f2a44", 3, () => ovalPath(ctx, 0, -43, 45, 30));
}

function drawHelmet(ctx: CanvasRenderingContext2D): void {
  fillStroke(ctx, "#e2762e", "#1f2a44", 7, () => helmetRing(ctx));
  fillStroke(ctx, "rgba(142,234,255,.26)", "#8eeaff", 4, () => visorArc(ctx));
  fillStroke(ctx, "#1f2a44", "#ffffff", 3, () => rounded(ctx, -26, -48, 52, 17, 8));
  ctx.fillStyle = "rgba(255,255,255,.45)";
  rounded(ctx, -18, -54, 19, 4, 3);
  ctx.fill();
}

function drawCuteFace(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-13, -44);
  ctx.quadraticCurveTo(-8, -39, -3, -44);
  ctx.moveTo(4, -44);
  ctx.quadraticCurveTo(9, -39, 14, -44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.quadraticCurveTo(0, -28, 9, -34);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,130,150,.45)";
  oval(ctx, -18, -36, 9, 5);
  oval(ctx, 19, -36, 9, 5);
  ctx.fill();
  ctx.restore();
}

function drawDetails(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#e2762e";
  ctx.font = "bold 15px system-ui";
  ctx.fillText("P", 0, 112);
  ctx.strokeStyle = "rgba(31,42,68,.32)";
  ctx.lineWidth = 3;
  fold(ctx, -28, 6, -6, 34, -25, 66);
  fold(ctx, 28, 9, 8, 34, 24, 68);
  fold(ctx, -4, 68, -6, 83, -18, 95);
  ctx.restore();
}

function addSoftGrain(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (let i = 0; i < 120; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(31,42,68,.045)" : "rgba(255,255,255,.07)";
    circle(ctx, -70 + Math.random() * 140, -100 + Math.random() * 200, Math.random() * 1.2);
    ctx.fill();
  }
  ctx.restore();
}

function fillStroke(ctx: CanvasRenderingContext2D, fill: string, stroke: string, lineWidth: number, path: () => void): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  path();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function body(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-34, -5);
  ctx.quadraticCurveTo(-37, 42, -20, 75);
  ctx.quadraticCurveTo(0, 86, 21, 75);
  ctx.quadraticCurveTo(38, 42, 34, -5);
  ctx.quadraticCurveTo(18, -23, 0, -24);
  ctx.quadraticCurveTo(-18, -23, -34, -5);
  ctx.closePath();
}

function arm(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  rounded(ctx, -8, -21, 16, 53, 8);
  ctx.restore();
}

function cuff(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  rounded(ctx, -11, -6, 22, 13, 5);
  ctx.restore();
}

function boot(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 7);
  ctx.lineTo(x + 8, y - 9);
  ctx.lineTo(x + 18, y + 8);
  ctx.lineTo(x - 18, y + 10);
  ctx.closePath();
}

function strap(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  rounded(ctx, -7, -33, 14, 66, 6);
  ctx.restore();
}

function helmetRing(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.ellipse(0, -48, 45, 38, 0, 0, Math.PI * 2);
}

function visorArc(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.arc(0, -57, 29, Math.PI * 1.05, Math.PI * 1.95);
}

function fold(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(x2, y2, x3, y3);
  ctx.stroke();
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function circlePath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ovalPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
}

function oval(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
}
