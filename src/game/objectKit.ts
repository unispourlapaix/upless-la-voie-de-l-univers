import Phaser from "phaser";

export type DetailObjectKind =
  | "rocketPiece"
  | "plasticWaste"
  | "smartBattery"
  | "alienVirus"
  | "redPuddle"
  | "rareOil"
  | "vrHeadset"
  | "pinkUnderwear"
  | "dinoBook"
  | "satelliteAntenna";

export type DetailObjectOptions = {
  label?: string;
  scale?: number;
};

const texturePrefix = "upless-drawn-object";

const standaloneSources: Partial<Record<DetailObjectKind, { key: string; width: number; height: number; scale: number }>> = {
  rocketPiece: { key: "upless-rocket-crashed-broken-v1", width: 230, height: 150, scale: 0.72 },
};

export function createDetailedObject(
  scene: Phaser.Scene,
  kind: DetailObjectKind,
  x: number,
  y: number,
  options: DetailObjectOptions = {},
): Phaser.GameObjects.Container {
  const key = `${texturePrefix}-${kind}`;
  if (!scene.textures.exists(key)) drawObjectTexture(scene, key, kind);

  const shadow = scene.add.ellipse(2, 22, 72, 15, 0x120d1b, 0.22);
  const drawing = scene.add.image(0, 0, key).setScale(standaloneSources[kind]?.scale ?? 0.5);
  const container = scene.add.container(x, y, [shadow, drawing]).setScale(options.scale ?? 1);
  container.setData("detailKind", kind);
  container.setData("detailLabel", options.label ?? kind);
  container.setData("renderMode", "drawn-texture");
  return container;
}

function drawObjectTexture(scene: Phaser.Scene, key: string, kind: DetailObjectKind): void {
  if (tryDrawStandaloneObject(scene, key, kind)) return;

  const texture = scene.textures.createCanvas(key, 160, 130);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.translate(80, 64);

  if (kind !== "redPuddle") drawStickerPaper(ctx);

  if (kind === "rocketPiece") drawRocketPiece(ctx);
  else if (kind === "plasticWaste") drawPlasticWaste(ctx);
  else if (kind === "smartBattery") drawSmartBattery(ctx);
  else if (kind === "alienVirus") drawAlienVirus(ctx);
  else if (kind === "redPuddle") drawRedPuddle(ctx);
  else if (kind === "rareOil") drawRareOil(ctx);
  else if (kind === "vrHeadset") drawVrHeadset(ctx);
  else if (kind === "pinkUnderwear") drawPinkUnderwear(ctx);
  else if (kind === "dinoBook") drawDinoBook(ctx);
  else drawSatelliteAntenna(ctx);

  addInkGrain(ctx);
  texture.refresh();
}

function tryDrawStandaloneObject(scene: Phaser.Scene, key: string, kind: DetailObjectKind): boolean {
  const source = standaloneSources[kind];
  if (!source || !scene.textures.exists(source.key)) return false;

  const texture = scene.textures.createCanvas(key, source.width, source.height);
  if (!texture) return false;

  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;
  const imageWidth = Number((image as HTMLImageElement).width ?? source.width);
  const imageHeight = Number((image as HTMLImageElement).height ?? source.height);
  const scale = Math.min(source.width / imageWidth, source.height / imageHeight) * 0.96;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  ctx.clearRect(0, 0, source.width, source.height);
  ctx.drawImage(image, (source.width - drawWidth) / 2, (source.height - drawHeight) / 2, drawWidth, drawHeight);
  removeMagentaKey(ctx, source.width, source.height);
  texture.refresh();
  return true;
}

function removeMagentaKey(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const pixels = ctx.getImageData(0, 0, width, height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 220 && g < 55 && b > 190) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(pixels, 0, 0);
}

function drawStickerPaper(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "rgba(15,12,24,.18)";
  blob(ctx, [[-50, 26], [-20, 15], [26, 16], [54, 28], [40, 42], [-22, 46], [-58, 36]]);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.94)";
  ctx.strokeStyle = "rgba(48,40,68,.42)";
  ctx.lineWidth = 5;
  blob(ctx, [[-56, -8], [-38, -38], [-2, -47], [38, -34], [59, -3], [42, 34], [0, 47], [-43, 35]]);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRocketPiece(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.rotate(-0.16);
  ctx.fillStyle = "#e9edf6";
  ctx.strokeStyle = "#302844";
  ctx.lineWidth = 6;
  blob(ctx, [[-53, 4], [-32, -20], [18, -25], [55, -8], [49, 15], [8, 25], [-38, 20]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#78d7ff";
  ctx.lineWidth = 3;
  ellipse(ctx, 22, -5, 23, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d55f58";
  rounded(ctx, -42, 3, 25, 15, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ff9a3d";
  blob(ctx, [[-55, 4], [-70, -10], [-70, 16]]);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(48,40,68,.55)";
  ctx.lineWidth = 3;
  line(ctx, -14, -18, 25, 14);
  line(ctx, -5, 14, 34, 3);
  ctx.fillStyle = "#6949d7";
  rounded(ctx, -4, 9, 44, 5, 2);
  ctx.fill();
  ctx.fillStyle = "#ffd36a";
  circle(ctx, 42, 7, 5);
  ctx.restore();
}

function drawPlasticWaste(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.rotate(-0.12);
  ctx.fillStyle = "rgba(218,246,255,.72)";
  ctx.strokeStyle = "#5b7890";
  ctx.lineWidth = 4;
  blob(ctx, [[-38, 5], [-24, -13], [4, -8], [38, 1], [24, 14], [-8, 18]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(235,252,255,.62)";
  blob(ctx, [[-22, -16], [-4, -25], [24, -18], [15, -5], [-10, -4]]);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.75)";
  ctx.lineWidth = 3;
  line(ctx, -24, 8, 22, -2);
  line(ctx, -8, -18, 9, -10);
  ctx.fillStyle = "rgba(255,131,144,.8)";
  circle(ctx, 29, 5, 4);
  ctx.restore();
}

function drawSmartBattery(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#3f4656";
  ctx.strokeStyle = "#151923";
  ctx.lineWidth = 6;
  rounded(ctx, -34, -18, 63, 38, 8);
  ctx.fill();
  ctx.stroke();
  rounded(ctx, 30, -9, 10, 18, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(116,231,255,.32)";
  rounded(ctx, -24, -10, 38, 20, 5);
  ctx.fill();
  ctx.fillStyle = "#f6d66c";
  ctx.font = "bold 28px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⚡", -5, 2);
  ctx.fillStyle = "#ff5d76";
  circle(ctx, -28, -17, 4);
  ctx.restore();
}

function drawAlienVirus(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = "#244328";
  ctx.fillStyle = "#8cf06a";
  ctx.lineWidth = 4;
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    line(ctx, Math.cos(a) * 15, Math.sin(a) * 15, Math.cos(a) * 33, Math.sin(a) * 33);
    circle(ctx, Math.cos(a) * 37, Math.sin(a) * 37, 5);
  }
  blob(ctx, [[-17, -14], [0, -22], [19, -10], [18, 12], [4, 23], [-18, 14], [-25, -1]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#d7ff9a";
  circle(ctx, -6, -6, 4);
  circle(ctx, 8, 7, 3);
  ctx.restore();
}

function drawRedPuddle(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.14)";
  blob(ctx, [[-58, 10], [-34, -10], [8, -15], [58, 0], [48, 22], [-14, 30]]);
  ctx.fill();
  ctx.fillStyle = "rgba(184,37,57,.82)";
  ctx.strokeStyle = "#5b1523";
  ctx.lineWidth = 5;
  blob(ctx, [[-54, 8], [-28, -12], [20, -14], [60, 4], [36, 24], [-20, 28], [-60, 19]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,106,118,.48)";
  ellipse(ctx, -20, 0, 25, 8);
  ellipse(ctx, 24, 9, 14, 9);
  circle(ctx, -40, 15, 3);
  ctx.restore();
}

function drawRareOil(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#c8b080";
  ctx.strokeStyle = "#302844";
  ctx.lineWidth = 5;
  rounded(ctx, -27, -15, 54, 46, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#e2d3aa";
  ellipse(ctx, 0, -16, 55, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#807766";
  rounded(ctx, -28, -22, 56, 11, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#302844";
  ctx.font = "bold 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("OIL", 0, 12);
  ctx.fillStyle = "#3f2a1b";
  circle(ctx, 20, 25, 5);
  ctx.restore();
}

function drawVrHeadset(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#20263b";
  ctx.strokeStyle = "#8eeaff";
  ctx.lineWidth = 6;
  rounded(ctx, -42, -20, 84, 43, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(142,234,255,.9)";
  ellipse(ctx, -20, 0, 25, 16);
  ellipse(ctx, 20, 0, 25, 16);
  ctx.fillStyle = "#5f6ee8";
  rounded(ctx, -30, -31, 60, 8, 4);
  ctx.fill();
  ctx.fillStyle = "#20263b";
  ctx.font = "bold 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("VR", 0, 45);
  ctx.restore();
}

function drawPinkUnderwear(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = "#ff5fb2";
  ctx.strokeStyle = "#5e2a44";
  ctx.lineWidth = 5;
  blob(ctx, [[-45, -12], [-12, -17], [0, 26], [12, -17], [45, -12], [28, 18], [6, 30], [-8, 30], [-31, 18]]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffb6da";
  circle(ctx, -29, -8, 6);
  circle(ctx, 29, -8, 6);
  ctx.font = "18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("🍓", 0, 23);
  ctx.restore();
}

function drawDinoBook(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.rotate(-0.12);
  ctx.fillStyle = "#7b4f2d";
  ctx.strokeStyle = "#2f2018";
  ctx.lineWidth = 5;
  rounded(ctx, -38, -24, 76, 48, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#3d2718";
  rounded(ctx, -37, -24, 10, 48, 3);
  ctx.fill();
  ctx.fillStyle = "#ffe0a3";
  ctx.font = "bold 16px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("DINO", 5, -2);
  ctx.fillStyle = "#93d66f";
  circle(ctx, 24, 11, 7);
  ctx.restore();
}

function drawSatelliteAntenna(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = "#20263b";
  ctx.fillStyle = "#3f4b6d";
  ctx.lineWidth = 5;
  rounded(ctx, -32, 22, 64, 19, 5);
  ctx.fill();
  ctx.stroke();
  line(ctx, 0, 20, 28, -42);
  ctx.fillStyle = "#ffd36a";
  circle(ctx, 28, -42, 9);
  ctx.stroke();
  ctx.strokeStyle = "#8eeaff";
  ctx.lineWidth = 3;
  arc(ctx, 43, -56, 28, 2.35, 3.88);
  arc(ctx, 50, -63, 42, 2.35, 3.88);
  ctx.restore();
}

function addInkGrain(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  for (let i = 0; i < 90; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(48,40,68,.05)" : "rgba(255,255,255,.07)";
    circle(ctx, -62 + Math.random() * 124, -48 + Math.random() * 96, Math.random() * 1.2);
  }
  ctx.restore();
}

function blob(ctx: CanvasRenderingContext2D, points: number[][]): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    ctx.quadraticCurveTo(current[0], current[1], (current[0] + next[0]) / 2, (current[1] + next[1]) / 2);
  }
  ctx.closePath();
}

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function arc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, start: number, end: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();
}
