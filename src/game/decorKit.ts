import Phaser from "phaser";

type LibertyPiece = "head" | "bust" | "torch" | "foot";

const pieceKeys: Record<LibertyPiece, string> = {
  head: "upless-liberty-piece-head",
  bust: "upless-liberty-piece-bust",
  torch: "upless-liberty-piece-torch",
  foot: "upless-liberty-piece-foot",
};

export function createBrokenLibertyStatue(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  (Object.keys(pieceKeys) as LibertyPiece[]).forEach((piece) => {
    if (!scene.textures.exists(pieceKeys[piece])) drawPieceTexture(scene, piece);
  });

  const layout = [
    { piece: "foot" as const, x: -190, y: 62, angle: 5, label: "pied" },
    { piece: "head" as const, x: -92, y: -10, angle: -13, label: "tête" },
    { piece: "bust" as const, x: 28, y: 48, angle: -6, label: "buste" },
    { piece: "torch" as const, x: 165, y: 42, angle: 8, label: "torche" },
  ];

  const children: Phaser.GameObjects.GameObject[] = [
    scene.add.ellipse(0, 96, 430, 38, 0x3f2530, 0.2),
  ];

  layout.forEach(({ piece, x: px, y: py, angle, label }) => {
    children.push(scene.add.ellipse(px + 3, py + 48, piece === "torch" ? 145 : 112, 18, 0x1e1423, 0.22));
    children.push(scene.add.image(px, py, pieceKeys[piece]).setAngle(angle));
    children.push(scene.add.text(px, py + 70, label, {
      fontFamily: "system-ui",
      fontSize: "13px",
      color: "#5e3b43",
      fontStyle: "bold",
    }).setOrigin(0.5));
  });

  return scene.add
    .container(x, y, children)
    .setDepth(7)
    .setData("renderMode", "separate-sticker-piece-textures")
    .setData("decorKind", "complete-liberty-sticker-broken-into-ground-pieces");
}

function drawPieceTexture(scene: Phaser.Scene, piece: LibertyPiece): void {
  const width = piece === "torch" ? 220 : 170;
  const height = 160;
  const texture = scene.textures.createCanvas(pieceKeys[piece], width, height);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(width / 2, height / 2);

  if (piece === "head") drawHead(ctx);
  else if (piece === "bust") drawBust(ctx);
  else if (piece === "torch") drawTorch(ctx);
  else drawFoot(ctx);

  for (let i = 0; i < 70; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(47,60,76,.05)" : "rgba(255,255,255,.08)";
    dot(ctx, -width / 2 + Math.random() * width, -height / 2 + Math.random() * height, Math.random() * 1.25);
  }
  texture.refresh();
}

function drawHead(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  outline(ctx, () => crown(ctx));
  fillStroke(ctx, green, dark, () => crown(ctx), 5);
  outline(ctx, () => face(ctx));
  fillStroke(ctx, green, dark, () => face(ctx), 4);
  angryFace(ctx, dark);
  crack(ctx, -25, -10, -6, 11, -18, 29);
}

function drawBust(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  outline(ctx, () => bustShape(ctx));
  fillStroke(ctx, green, dark, () => bustShape(ctx), 5);
  ctx.fillStyle = "#6ea8a3";
  rounded(ctx, -18, -18, 68, 54, 8);
  ctx.fill();
  ctx.stroke();
  crack(ctx, -62, -12, -30, 16, -48, 40);
  crack(ctx, 8, -31, 36, 2, 67, 24);
  crack(ctx, -2, 11, 17, 36, 4, 55);
}

function drawTorch(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  outline(ctx, () => torchShape(ctx));
  fillStroke(ctx, green, dark, () => torchShape(ctx), 5);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 4;
  ctx.fillStyle = "#ffb65f";
  flame(ctx, -91, -47, 1);
  ctx.fillStyle = "#e86b49";
  flame(ctx, -116, -34, 0.8);
  ctx.fillStyle = "#d94a3d";
  flame(ctx, -67, -35, 0.75);
  crack(ctx, -38, 4, -4, 24, 25, 7);
}

function drawFoot(ctx: CanvasRenderingContext2D): void {
  const green = "#8fc4bc";
  const dark = "#273b46";
  outline(ctx, () => footShape(ctx));
  fillStroke(ctx, green, dark, () => footShape(ctx), 5);
  ctx.fillStyle = "#6ea8a3";
  rounded(ctx, -34, -42, 46, 35, 7);
  ctx.fill();
  ctx.stroke();
  crack(ctx, -39, -12, -7, 9, 29, -1);
}

function outline(ctx: CanvasRenderingContext2D, path: () => void): void {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 11;
  path();
  ctx.stroke();
}

function fillStroke(ctx: CanvasRenderingContext2D, fill: string, stroke: string, path: () => void, lineWidth: number): void {
  ctx.fillStyle = fill;
  path();
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  path();
  ctx.stroke();
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

function bustShape(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-89, 38);
  ctx.quadraticCurveTo(-72, -41, -19, -49);
  ctx.quadraticCurveTo(45, -55, 91, 8);
  ctx.quadraticCurveTo(71, 55, -18, 61);
  ctx.quadraticCurveTo(-70, 58, -89, 38);
  ctx.closePath();
}

function torchShape(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.roundRect(-11, -3, 137, 29, 8);
  ctx.roundRect(-58, -8, 42, 35, 7);
  ctx.arc(-91, -8, 30, 0, Math.PI * 2);
}

function footShape(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(-61, -12);
  ctx.quadraticCurveTo(4, -38, 65, -7);
  ctx.lineTo(51, 25);
  ctx.quadraticCurveTo(-25, 35, -66, 13);
  ctx.closePath();
}

function angryFace(ctx: CanvasRenderingContext2D, dark: string): void {
  ctx.save();
  ctx.strokeStyle = dark;
  ctx.fillStyle = dark;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-28, -8);
  ctx.lineTo(-10, 0);
  ctx.moveTo(24, -10);
  ctx.lineTo(8, 1);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-21, 8);
  ctx.quadraticCurveTo(-15, 13, -7, 9);
  ctx.moveTo(8, 9);
  ctx.quadraticCurveTo(16, 13, 22, 8);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-17, 25);
  ctx.quadraticCurveTo(0, 16, 19, 25);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(32, -24);
  ctx.lineTo(42, -24);
  ctx.moveTo(37, -30);
  ctx.lineTo(37, -18);
  ctx.moveTo(30, -31);
  ctx.lineTo(44, -17);
  ctx.stroke();
  ctx.font = "bold 12px system-ui";
  ctx.fillText("-'-", 0, -22);
  ctx.restore();
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

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
