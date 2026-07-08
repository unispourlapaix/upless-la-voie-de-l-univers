import Phaser from "phaser";

export type EntityArtKind =
  | "ogre"
  | "rustyRobot"
  | "beachGiraffe"
  | "sailingBoat"
  | "officeExecutive"
  | "officeDirector"
  | "moonBoat"
  | "moonDevice"
  | "moonAlien"
  | "stargate";

const textureKeys: Record<EntityArtKind, string> = {
  ogre: "upless-entity-ogre-comic",
  rustyRobot: "upless-entity-rusty-robot-comic",
  beachGiraffe: "upless-entity-beach-giraffe-comic",
  sailingBoat: "upless-entity-sailing-boat-comic",
  officeExecutive: "upless-entity-office-executive-comic",
  officeDirector: "upless-entity-office-director-comic",
  moonBoat: "upless-entity-moon-boat-comic",
  moonDevice: "upless-entity-moon-device-comic",
  moonAlien: "upless-entity-moon-alien-comic",
  stargate: "upless-entity-stargate-comic",
};

export function createEntityImage(
  scene: Phaser.Scene,
  kind: EntityArtKind,
  x = 0,
  y = 0,
): Phaser.GameObjects.Image {
  ensureEntityTexture(scene, kind);
  return scene.add.image(x, y, textureKeys[kind]);
}

function ensureEntityTexture(scene: Phaser.Scene, kind: EntityArtKind): void {
  if (scene.textures.exists(textureKeys[kind])) {
    return;
  }

  if (kind === "ogre") drawOgre(scene, textureKeys[kind]);
  if (kind === "rustyRobot") drawRustyRobot(scene, textureKeys[kind]);
  if (kind === "beachGiraffe") drawBeachGiraffe(scene, textureKeys[kind]);
  if (kind === "sailingBoat") drawSailingBoat(scene, textureKeys[kind]);
  if (kind === "officeExecutive") drawOfficeExecutive(scene, textureKeys[kind]);
  if (kind === "officeDirector") drawOfficeDirector(scene, textureKeys[kind]);
  if (kind === "moonBoat") drawMoonBoat(scene, textureKeys[kind]);
  if (kind === "moonDevice") drawMoonDevice(scene, textureKeys[kind]);
  if (kind === "moonAlien") drawMoonAlien(scene, textureKeys[kind]);
  if (kind === "stargate") drawStargate(scene, textureKeys[kind]);
}

function makeCanvas(scene: Phaser.Scene, key: string, width: number, height: number): CanvasRenderingContext2D {
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) {
    throw new Error(`Unable to create texture ${key}`);
  }
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
}

function finish(scene: Phaser.Scene, key: string): void {
  (scene.textures.get(key) as Phaser.Textures.CanvasTexture).refresh();
}

function stroke(ctx: CanvasRenderingContext2D, color = "#20335d", width = 7): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  line = "#20335d",
  width = 6,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  stroke(ctx, line, width);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  line = "#20335d",
  width = 6,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  stroke(ctx, line, width);
}

function drawOgre(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 190, 170);
  ctx.translate(95, 88);

  ellipse(ctx, 0, 60, 62, 13, "rgba(14,19,36,0.28)", "rgba(14,19,36,0)", 0);
  ellipse(ctx, -42, -18, 18, 21, "#72809b");
  ellipse(ctx, 42, -18, 18, 21, "#72809b");
  roundRect(ctx, -36, 24, 28, 38, 12, "#65718c");
  roundRect(ctx, 8, 24, 28, 38, 12, "#65718c");
  ellipse(ctx, 0, 1, 56, 50, "#6e7b96");
  ellipse(ctx, 0, 15, 34, 28, "#8793ab", "#44516a", 4);

  ctx.beginPath();
  ctx.moveTo(-38, -34);
  ctx.quadraticCurveTo(-60, -65, -24, -52);
  ctx.quadraticCurveTo(-12, -74, 0, -48);
  ctx.quadraticCurveTo(15, -75, 27, -50);
  ctx.quadraticCurveTo(63, -64, 39, -31);
  ctx.fillStyle = "#5e6a85";
  ctx.fill();
  stroke(ctx, "#20335d", 6);

  ellipse(ctx, -16, -6, 10, 12, "#f5f8ff", "#20335d", 4);
  ellipse(ctx, 16, -6, 10, 12, "#f5f8ff", "#20335d", 4);
  ellipse(ctx, -13, -4, 4, 5, "#18233d", "#18233d", 1);
  ellipse(ctx, 13, -4, 4, 5, "#18233d", "#18233d", 1);
  ctx.beginPath();
  ctx.moveTo(-29, -20);
  ctx.lineTo(-6, -15);
  stroke(ctx, "#17223d", 6);
  ctx.beginPath();
  ctx.moveTo(29, -20);
  ctx.lineTo(6, -15);
  stroke(ctx, "#17223d", 6);
  ctx.beginPath();
  ctx.arc(0, 12, 15, 0.1, Math.PI - 0.1);
  stroke(ctx, "#263149", 5);
  ellipse(ctx, -26, 8, 9, 6, "rgba(255,191,189,0.22)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 26, 8, 9, 6, "rgba(255,191,189,0.22)", "rgba(0,0,0,0)", 0);

  finish(scene, key);
}

function drawRustyRobot(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 180, 230);
  ctx.translate(90, 128);

  ellipse(ctx, 0, 82, 45, 10, "rgba(18,18,31,0.28)", "rgba(0,0,0,0)", 0);
  ctx.beginPath();
  ctx.moveTo(0, -88);
  ctx.lineTo(0, -126);
  stroke(ctx, "#2b2840", 6);
  ellipse(ctx, 0, -132, 8, 8, "#e15f64", "#2b2840", 5);
  roundRect(ctx, -42, -88, 84, 54, 13, "#a9967c");
  roundRect(ctx, -36, -28, 72, 86, 16, "#8f806d");

  roundRect(ctx, -71, -18, 22, 76, 10, "#76695d");
  roundRect(ctx, 49, -18, 22, 76, 10, "#76695d");
  roundRect(ctx, -29, 54, 21, 43, 8, "#716457");
  roundRect(ctx, 8, 54, 21, 43, 8, "#716457");

  ellipse(ctx, -23, -11, 10, 8, "#b65c35", "#7c3b2a", 3);
  ellipse(ctx, 20, 26, 12, 10, "#a34c32", "#733828", 3);
  ellipse(ctx, 30, -65, 5, 5, "#cf7043", "#733828", 2);
  ctx.beginPath();
  ctx.moveTo(-21, -45);
  ctx.lineTo(21, -45);
  stroke(ctx, "#30283b", 6);
  ctx.beginPath();
  ctx.moveTo(-18, 4);
  ctx.quadraticCurveTo(0, 18, 20, 4);
  stroke(ctx, "rgba(255,235,180,0.28)", 4);

  finish(scene, key);
}

function drawBeachGiraffe(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 170, 215);
  ctx.translate(85, 128);

  ellipse(ctx, 0, 80, 40, 10, "rgba(23,31,55,0.22)", "rgba(0,0,0,0)", 0);
  roundRect(ctx, -30, 18, 15, 62, 8, "#dca34c");
  roundRect(ctx, 12, 18, 15, 62, 8, "#dca34c");
  ellipse(ctx, -3, 8, 34, 45, "#eab95f");
  roundRect(ctx, 4, -68, 23, 89, 12, "#eab95f");
  ellipse(ctx, 29, -99, 31, 22, "#eab95f");
  ellipse(ctx, 43, -102, 5, 5, "#202947", "#202947", 1);
  ctx.beginPath();
  ctx.moveTo(55, -96);
  ctx.quadraticCurveTo(68, -90, 54, -84);
  stroke(ctx, "#20335d", 5);

  ellipse(ctx, -13, -2, 7, 8, "#98643b", "#98643b", 1);
  ellipse(ctx, 8, 21, 6, 7, "#98643b", "#98643b", 1);
  ellipse(ctx, 16, -36, 5, 7, "#98643b", "#98643b", 1);
  ctx.beginPath();
  ctx.moveTo(15, -119);
  ctx.lineTo(10, -137);
  ctx.moveTo(38, -117);
  ctx.lineTo(43, -136);
  stroke(ctx, "#20335d", 5);
  ellipse(ctx, 10, -140, 5, 5, "#98643b", "#20335d", 3);
  ellipse(ctx, 43, -139, 5, 5, "#98643b", "#20335d", 3);
  ctx.beginPath();
  ctx.moveTo(18, -89);
  ctx.quadraticCurveTo(30, -80, 44, -88);
  stroke(ctx, "#7b4d36", 3);
  ellipse(ctx, -18, -6, 8, 5, "rgba(255,231,174,0.35)", "rgba(0,0,0,0)", 0);

  finish(scene, key);
}

function drawSailingBoat(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 360, 205);
  ctx.translate(180, 102);

  ellipse(ctx, 0, 78, 151, 18, "rgba(20,49,66,0.26)", "rgba(0,0,0,0)", 0);
  ctx.beginPath();
  ctx.moveTo(-142, 36);
  ctx.quadraticCurveTo(-92, 92, 81, 88);
  ctx.quadraticCurveTo(140, 82, 151, 34);
  ctx.quadraticCurveTo(42, 58, -142, 36);
  ctx.fillStyle = "#fff7dc";
  ctx.fill();
  stroke(ctx, "#20335d", 7);
  roundRect(ctx, -94, -28, 126, 64, 16, "#fffaf0");
  ellipse(ctx, -58, -7, 15, 13, "#8eeaff", "#20335d", 4);
  ellipse(ctx, -14, -7, 15, 13, "#8eeaff", "#20335d", 4);
  roundRect(ctx, -113, 60, 225, 24, 9, "#5574e6");

  roundRect(ctx, 70, -83, 9, 120, 4, "#20335d", "#20335d", 1);
  ctx.beginPath();
  ctx.moveTo(82, -77);
  ctx.lineTo(132, 24);
  ctx.lineTo(82, 24);
  ctx.closePath();
  ctx.fillStyle = "#ffd36a";
  ctx.fill();
  stroke(ctx, "#20335d", 6);
  ctx.beginPath();
  ctx.moveTo(66, -66);
  ctx.lineTo(8, 28);
  ctx.lineTo(66, 28);
  ctx.closePath();
  ctx.fillStyle = "#ffe58e";
  ctx.fill();
  stroke(ctx, "#20335d", 6);

  ellipse(ctx, 132, 75, 23, 23, "#8eeaff", "#20335d", 6);
  ctx.beginPath();
  ctx.moveTo(132, 75);
  ctx.lineTo(132, 54);
  ctx.moveTo(132, 75);
  ctx.lineTo(112, 84);
  ctx.moveTo(132, 75);
  ctx.lineTo(151, 86);
  stroke(ctx, "#4779a3", 4);
  ctx.beginPath();
  ctx.moveTo(-105, 48);
  ctx.quadraticCurveTo(-20, 71, 100, 51);
  stroke(ctx, "rgba(90,181,211,0.38)", 5);

  finish(scene, key);
}

function drawOfficeExecutive(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 120, 150);
  ctx.translate(60, 86);

  ellipse(ctx, 0, 45, 34, 8, "rgba(20,18,34,0.22)", "rgba(0,0,0,0)", 0);
  roundRect(ctx, -30, -12, 60, 70, 14, "#394d86");
  ctx.beginPath();
  ctx.moveTo(-18, -23);
  ctx.lineTo(0, 12);
  ctx.lineTo(18, -23);
  ctx.fillStyle = "#f7f2e8";
  ctx.fill();
  stroke(ctx, "#20335d", 3);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-7, 30);
  ctx.lineTo(7, 30);
  ctx.closePath();
  ctx.fillStyle = "#e25f65";
  ctx.fill();
  stroke(ctx, "#20335d", 3);
  roundRect(ctx, -9, -44, 18, 20, 7, "#d8a077", "#20335d", 3);
  ellipse(ctx, 0, -58, 25, 30, "#eeb789");
  ctx.beginPath();
  ctx.arc(0, -68, 20, Math.PI, Math.PI * 2);
  stroke(ctx, "#2d2635", 9);
  ellipse(ctx, -9, -57, 5, 7, "#ffffff", "#20335d", 2);
  ellipse(ctx, 9, -57, 5, 7, "#ffffff", "#20335d", 2);
  ellipse(ctx, -8, -57, 1.8, 2, "#20335d", "#20335d", 1);
  ellipse(ctx, 10, -57, 1.8, 2, "#20335d", "#20335d", 1);
  ctx.beginPath();
  ctx.arc(0, -45, 7, Math.PI + 0.2, Math.PI * 2 - 0.2);
  stroke(ctx, "#7b4051", 3);
  ellipse(ctx, 24, -64, 4, 8, "#8eeaff", "rgba(0,0,0,0)", 0);

  finish(scene, key);
}

function drawOfficeDirector(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 150, 175);
  ctx.translate(76, 103);

  ellipse(ctx, 4, 52, 42, 8, "rgba(20,18,34,0.2)", "rgba(0,0,0,0)", 0);
  roundRect(ctx, -32, -10, 64, 82, 14, "#223052");
  ctx.beginPath();
  ctx.moveTo(-20, -21);
  ctx.lineTo(0, 17);
  ctx.lineTo(20, -21);
  ctx.fillStyle = "#fbf3e7";
  ctx.fill();
  stroke(ctx, "#20335d", 3);
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(-8, 33);
  ctx.lineTo(8, 33);
  ctx.closePath();
  ctx.fillStyle = "#d94867";
  ctx.fill();
  stroke(ctx, "#20335d", 3);
  roundRect(ctx, -55, -63, 18, 76, 8, "#223052");
  ellipse(ctx, -49, -89, 11, 11, "#d99b72");
  roundRect(ctx, -55, -117, 8, 32, 4, "#d99b72", "#20335d", 3);
  roundRect(ctx, -9, -46, 18, 20, 7, "#d99b72", "#20335d", 3);
  ellipse(ctx, 0, -66, 29, 34, "#d99b72");
  ctx.beginPath();
  ctx.arc(0, -80, 23, Math.PI, Math.PI * 2);
  stroke(ctx, "#292331", 10);
  ctx.beginPath();
  ctx.moveTo(-17, -71);
  ctx.lineTo(-3, -66);
  ctx.moveTo(17, -71);
  ctx.lineTo(3, -66);
  stroke(ctx, "#20335d", 4);
  ellipse(ctx, -8, -62, 3, 3, "#20335d", "#20335d", 1);
  ellipse(ctx, 8, -62, 3, 3, "#20335d", "#20335d", 1);
  ellipse(ctx, 0, -48, 10, 7, "#6e2e3e", "#20335d", 3);

  finish(scene, key);
}

function drawMoonBoat(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 210, 135);
  ctx.translate(105, 68);

  ellipse(ctx, 0, 52, 90, 11, "rgba(0,0,0,0.22)", "rgba(0,0,0,0)", 0);
  ctx.beginPath();
  ctx.moveTo(-88, 16);
  ctx.quadraticCurveTo(-48, 59, 74, 49);
  ctx.quadraticCurveTo(88, 37, 92, 18);
  ctx.quadraticCurveTo(10, 37, -88, 16);
  ctx.fillStyle = "#fff7dc";
  ctx.fill();
  stroke(ctx, "#20335d", 6);
  ctx.beginPath();
  ctx.moveTo(6, -51);
  ctx.lineTo(52, 22);
  ctx.lineTo(6, 22);
  ctx.closePath();
  ctx.fillStyle = "#ffd36a";
  ctx.fill();
  stroke(ctx, "#20335d", 5);
  ellipse(ctx, -30, 19, 14, 11, "#8eeaff", "#20335d", 4);

  finish(scene, key);
}

function drawMoonDevice(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 150, 160);
  ctx.translate(75, 88);

  ellipse(ctx, 0, 58, 58, 9, "rgba(0,0,0,0.22)", "rgba(0,0,0,0)", 0);
  roundRect(ctx, -53, -2, 22, 89, 9, "#2b3655", "#dce3f3", 4);
  roundRect(ctx, 31, -2, 22, 89, 9, "#2b3655", "#dce3f3", 4);
  roundRect(ctx, -50, 29, 100, 54, 14, "#3f4b6d", "#dce3f3", 5);
  ellipse(ctx, 0, -16, 42, 34, "rgba(142,234,255,0.75)", "#dce3f3", 5);
  ellipse(ctx, -22, -72, 17, 14, "rgba(191,247,255,0.42)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 10, -84, 25, 17, "rgba(223,252,255,0.34)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 35, -68, 15, 13, "rgba(255,255,255,0.28)", "rgba(0,0,0,0)", 0);

  finish(scene, key);
}

function drawMoonAlien(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 135, 150);
  ctx.translate(68, 86);

  ellipse(ctx, 0, 48, 35, 8, "rgba(0,0,0,0.2)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 0, 12, 25, 36, "#7cf06a", "#173820", 5);
  ellipse(ctx, 0, -38, 39, 32, "#8cff78", "#173820", 5);
  ellipse(ctx, -13, -41, 9, 15, "#111827", "#111827", 1);
  ellipse(ctx, 13, -41, 9, 15, "#111827", "#111827", 1);
  roundRect(ctx, 25, -2, 38, 29, 7, "#20263b", "#8eeaff", 4);
  ctx.fillStyle = "#8eeaff";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("∑π", 44, 17);
  ctx.beginPath();
  ctx.moveTo(-15, 42);
  ctx.lineTo(-22, 59);
  ctx.moveTo(15, 42);
  ctx.lineTo(22, 59);
  stroke(ctx, "#173820", 5);

  finish(scene, key);
}

function drawStargate(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 160, 205);
  ctx.translate(80, 102);

  ellipse(ctx, 0, 78, 63, 11, "rgba(0,0,0,0.22)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 0, 0, 58, 82, "rgba(23,32,60,0.65)", "#9ca7c9", 10);
  ellipse(ctx, 0, 0, 39, 61, "rgba(20,28,55,0.82)", "#4b567b", 6);
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    ctx.save();
    ctx.translate(Math.cos(a) * 51, Math.sin(a) * 72);
    ctx.rotate(a);
    roundRect(ctx, -4, -15, 8, 30, 4, "#8eeaff", "#20335d", 2);
    ctx.restore();
  }

  finish(scene, key);
}
