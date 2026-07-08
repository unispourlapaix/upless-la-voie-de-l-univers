import Phaser from "phaser";

const brokenLibertyKey = "upless-sticker-liberty-broken";

export function createBrokenLibertyStatue(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  if (!scene.textures.exists(brokenLibertyKey)) drawBrokenLibertyTexture(scene);
  return scene.add
    .image(x, y, brokenLibertyKey)
    .setDepth(7)
    .setData("renderMode", "sticker-icon-texture")
    .setData("decorKind", "liberty-sticker-broken-into-head-bust-torch-foot");
}

function drawBrokenLibertyTexture(scene: Phaser.Scene): void {
  const texture = scene.textures.createCanvas(brokenLibertyKey, 560, 280);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, 560, 280);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  shadow(ctx, 280, 230, 430, 38);
  stickerPiece(ctx, 92, 202, -0.06, () => drawFootIcon(ctx));
  stickerPiece(ctx, 190, 130, -0.22, () => drawHeadIcon(ctx));
  stickerPiece(ctx, 306, 181, -0.08, () => drawBustIcon(ctx));
  stickerPiece(ctx, 435, 180, 0.12, () => drawTorchIcon(ctx));

  ctx.font = "bold 13px system-ui";
  ctx.fillStyle = "#5e3b43";
  ctx.fillText("pied", 92, 251);
  ctx.fillText("tête", 190, 205);
  ctx.fillText("buste", 306, 251);
  ctx.fillText("torche", 435, 251);

  for (let i = 0; i < 180; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(47,60,76,.05)" : "rgba(255,255,255,.07)";
    dot(ctx, Math.random() * 560, Math.random() * 280, Math.random() * 1.3);
  }
  texture.refresh();
}

function stickerPiece(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, draw: () => void): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(30,20,35,.2)";
  ellipse(ctx, 5, 42, 112, 18);
  ctx.fill();
  draw();
  ctx.restore();
}

function drawHeadIcon(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffffff";
  crown(ctx);
  ctx.stroke();
  ctx.fillStyle = green;
  crown(ctx);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = dark;
  crown(ctx);
  ctx.stroke();

  ctx.lineWidth = 9;
  ctx.strokeStyle = "#ffffff";
  face(ctx);
  ctx.stroke();
  ctx.fillStyle = green;
  face(ctx);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = dark;
  face(ctx);
  ctx.stroke();

  ctx.fillStyle = "rgba(39,59,70,.35)";
  ellipse(ctx, -15, 5, 11, 17);
  ellipse(ctx, 13, 0, 10, 16);
  ctx.fill();
  ctx.fillStyle = dark;
  round(ctx, -17, 22, 36, 5, 3);
  ctx.fill();
  crack(ctx, -25, -10, -6, 11, -18, 29);
}

function drawBustIcon(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  ctx.lineWidth = 11;
  ctx.strokeStyle = "#ffffff";
  bust(ctx);
  ctx.stroke();
  ctx.fillStyle = green;
  bust(ctx);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = dark;
  bust(ctx);
  ctx.stroke();

  ctx.fillStyle = "#6ea8a3";
  round(ctx, -18, -18, 68, 54, 8);
  ctx.fill();
  ctx.stroke();
  crack(ctx, -62, -12, -30, 16, -48, 40);
  crack(ctx, 8, -31, 36, 2, 67, 24);
  crack(ctx, -2, 11, 17, 36, 4, 55);
}

function drawTorchIcon(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffffff";
  torch(ctx);
  ctx.stroke();
  ctx.fillStyle = green;
  torch(ctx);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = dark;
  torch(ctx);
  ctx.stroke();

  ctx.fillStyle = "#ffb65f";
  flame(ctx, -91, -47, 1);
  ctx.fillStyle = "#e86b49";
  flame(ctx, -116, -34, 0.8);
  ctx.fillStyle = "#d94a3d";
  flame(ctx, -67, -35, 0.75);
  ctx.lineWidth = 4;
  ctx.strokeStyle = dark;
  crack(ctx, -38, 4, -4, 24, 25, 7);
}

function drawFootIcon(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#ffffff";
  foot(ctx);
  ctx.stroke();
  ctx.fillStyle = green;
  foot(ctx);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = dark;
  foot(ctx);
  ctx.stroke();
  ctx.fillStyle = "#6ea8a3";
  round(ctx, -34, -42, 46, 35, 7);
  ctx.fill();
  ctx.stroke();
  crack(ctx, -39, -12, -7, 9, 29, -1);
}

function crown(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-47, -31);
  [-42, -24, -5, 16, 38].forEach((x, i) => {
    ctx.lineTo(x, -50 - (i % 2) * 7);
    ctx.lineTo(x + 8, -24);
  });
  ctx.closePath();
}

function face(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.roundRect(-43, -31, 86, 70, 28);
}

function bust(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-89, 38);
  ctx.quadraticCurveTo(-72, -41, -19, -49);
  ctx.quadraticCurveTo(45, -55, 91, 8);
  ctx.quadraticCurveTo(71, 55, -18, 61);
  ctx.quadraticCurveTo(-70, 58, -89, 38);
  ctx.closePath();
}

function torch(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.roundRect(-11, -3, 137, 29, 8);
  ctx.roundRect(-58, -8, 42, 35, 7);
  ctx.arc(-91, -8, 30, 0, Math.PI * 2);
}

function foot(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-61, -12);
  ctx.quadraticCurveTo(4, -38, 65, -7);
  ctx.lineTo(51, 25);
  ctx.quadraticCurveTo(-25, 35, -66, 13);
  ctx.closePath();
}

function flame(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-15, 20);
  ctx.quadraticCurveTo(-7, -8, 0, -32);
  ctx.quadraticCurveTo(8, -7, 15, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function crack(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(39,59,70,.85)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.stroke();
  ctx.restore();
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = "rgba(63,37,48,.2)";
  ellipse(ctx, x, y, w, h);
  ctx.fill();
}

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
