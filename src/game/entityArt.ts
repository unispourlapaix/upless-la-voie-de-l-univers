import Phaser from "phaser";

export type EntityArtKind =
  | "ogre"
  | "rustyRobot"
  | "beachGiraffe"
  | "sailingBoat"
  | "repairedBoat"
  | "officeExecutive"
  | "officeDirector"
  | "officeDirectorSurprised"
  | "moonBoat"
  | "moonDevice"
  | "moonAlien"
  | "stargate"
  | "coconutTree"
  | "laughingBusinessmen"
  | "pinkwindkisPenguin"
  | "sickFrog"
  | "iceCrater"
  | "toxicPond"
  | "desertBunker"
  | "officeCat"
  | "controlPanel"
  | "powerSwitch"
  | "projectorScreen";

const textureKeys: Record<EntityArtKind, string> = {
  ogre: "upless-entity-ogre-comic",
  rustyRobot: "upless-entity-rusty-robot-comic",
  beachGiraffe: "upless-entity-beach-giraffe-comic",
  sailingBoat: "upless-entity-sailing-boat-comic",
  repairedBoat: "upless-entity-repaired-boat-comic",
  officeExecutive: "upless-entity-office-executive-comic",
  officeDirector: "upless-entity-office-director-comic",
  officeDirectorSurprised: "upless-entity-office-director-surprised-comic",
  moonBoat: "upless-entity-moon-boat-comic",
  moonDevice: "upless-entity-moon-device-comic",
  moonAlien: "upless-entity-moon-alien-comic",
  stargate: "upless-entity-stargate-comic",
  coconutTree: "upless-entity-coconut-tree-comic",
  laughingBusinessmen: "upless-entity-laughing-businessmen-comic",
  pinkwindkisPenguin: "upless-entity-pinkwindkis-penguin-comic",
  sickFrog: "upless-entity-sick-frog-comic",
  iceCrater: "upless-entity-ice-crater-comic",
  toxicPond: "upless-entity-toxic-pond-comic",
  desertBunker: "upless-entity-desert-bunker-comic",
  officeCat: "upless-entity-office-cat-comic",
  controlPanel: "upless-entity-control-panel-comic",
  powerSwitch: "upless-entity-power-switch-comic",
  projectorScreen: "upless-entity-projector-screen-comic",
};

const mangaSheetKey = "upless-manga-sticker-sheet-v1";
const giraffeBipedKey = "upless-giraffe-biped-tshirt-jeans-v1";
const alienCyberOctopusKey = "upless-alien-cyber-octopus-vr-v2";
const atmosphereMachineKey = "upless-atmosphere-machine-sticker-v1";
const repairedBoatKey = "upless-boat-repaired-clean-v1";
const galacticBoatKey = "upless-boat-galactic-futuristic-v1";
const laughingBusinessmenKey = "upless-businessmen-laughing-cat-video-v2";
const directorSurprisedKey = "upless-director-surprised-right-v1";
const launchPanelKey = "upless-launch-panel-wires-buttons-v1";
const coconutTreeKey = "upless-coconut-tree-v1";
const iceCraterKey = "upless-ice-crater-v1";

const standaloneSources: Partial<Record<EntityArtKind, { key: string; targetWidth: number; targetHeight: number }>> = {
  beachGiraffe: { key: giraffeBipedKey, targetWidth: 170, targetHeight: 235 },
  moonAlien: { key: alienCyberOctopusKey, targetWidth: 180, targetHeight: 225 },
  moonDevice: { key: atmosphereMachineKey, targetWidth: 245, targetHeight: 275 },
  repairedBoat: { key: repairedBoatKey, targetWidth: 360, targetHeight: 220 },
  moonBoat: { key: galacticBoatKey, targetWidth: 320, targetHeight: 210 },
  laughingBusinessmen: { key: laughingBusinessmenKey, targetWidth: 300, targetHeight: 150 },
  officeDirectorSurprised: { key: directorSurprisedKey, targetWidth: 155, targetHeight: 190 },
  controlPanel: { key: launchPanelKey, targetWidth: 150, targetHeight: 170 },
  coconutTree: { key: coconutTreeKey, targetWidth: 190, targetHeight: 245 },
  iceCrater: { key: iceCraterKey, targetWidth: 180, targetHeight: 115 },
};

const mangaSources: Partial<Record<EntityArtKind, { x: number; y: number; width: number; height: number; targetWidth: number; targetHeight: number }>> = {
  rustyRobot: { x: 34, y: 365, width: 258, height: 318, targetWidth: 180, targetHeight: 230 },
  beachGiraffe: { x: 33, y: 972, width: 198, height: 345, targetWidth: 170, targetHeight: 215 },
  sailingBoat: { x: 247, y: 966, width: 367, height: 267, targetWidth: 360, targetHeight: 205 },
  officeExecutive: { x: 258, y: 704, width: 454, height: 268, targetWidth: 120, targetHeight: 150 },
  officeDirector: { x: 726, y: 670, width: 265, height: 302, targetWidth: 150, targetHeight: 175 },
  moonBoat: { x: 247, y: 966, width: 367, height: 267, targetWidth: 210, targetHeight: 135 },
  moonDevice: { x: 554, y: 1190, width: 221, height: 330, targetWidth: 150, targetHeight: 160 },
  moonAlien: { x: 344, y: 1210, width: 200, height: 312, targetWidth: 135, targetHeight: 150 },
  stargate: { x: 762, y: 1175, width: 260, height: 340, targetWidth: 160, targetHeight: 205 },
  coconutTree: { x: 33, y: 972, width: 198, height: 345, targetWidth: 190, targetHeight: 230 },
  pinkwindkisPenguin: { x: 681, y: 374, width: 253, height: 310, targetWidth: 135, targetHeight: 145 },
  sickFrog: { x: 760, y: 966, width: 240, height: 225, targetWidth: 150, targetHeight: 120 },
  toxicPond: { x: 604, y: 962, width: 396, height: 258, targetWidth: 230, targetHeight: 90 },
  desertBunker: { x: 762, y: 1175, width: 260, height: 340, targetWidth: 310, targetHeight: 250 },
  officeCat: { x: 35, y: 705, width: 210, height: 270, targetWidth: 120, targetHeight: 120 },
  controlPanel: { x: 554, y: 1190, width: 221, height: 330, targetWidth: 135, targetHeight: 155 },
  projectorScreen: { x: 258, y: 704, width: 454, height: 268, targetWidth: 220, targetHeight: 165 },
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

  if (tryDrawStandaloneCutout(scene, kind, textureKeys[kind]) || tryDrawMangaCutout(scene, kind, textureKeys[kind])) {
    return;
  }

  if (kind === "ogre") drawOgre(scene, textureKeys[kind]);
  if (kind === "rustyRobot") drawRustyRobot(scene, textureKeys[kind]);
  if (kind === "beachGiraffe") drawBeachGiraffe(scene, textureKeys[kind]);
  if (kind === "sailingBoat") drawSailingBoat(scene, textureKeys[kind]);
  if (kind === "repairedBoat") drawSailingBoat(scene, textureKeys[kind]);
  if (kind === "officeExecutive") drawOfficeExecutive(scene, textureKeys[kind]);
  if (kind === "officeDirector") drawOfficeDirector(scene, textureKeys[kind]);
  if (kind === "officeDirectorSurprised") drawOfficeDirector(scene, textureKeys[kind]);
  if (kind === "moonBoat") drawMoonBoat(scene, textureKeys[kind]);
  if (kind === "moonDevice") drawMoonDevice(scene, textureKeys[kind]);
  if (kind === "moonAlien") drawMoonAlien(scene, textureKeys[kind]);
  if (kind === "stargate") drawStargate(scene, textureKeys[kind]);
  if (kind === "coconutTree") drawCoconutTree(scene, textureKeys[kind]);
  if (kind === "laughingBusinessmen") drawOfficeExecutive(scene, textureKeys[kind]);
  if (kind === "pinkwindkisPenguin") drawPinkwindkisPenguin(scene, textureKeys[kind]);
  if (kind === "sickFrog") drawSickFrog(scene, textureKeys[kind]);
  if (kind === "iceCrater") drawToxicPond(scene, textureKeys[kind]);
  if (kind === "toxicPond") drawToxicPond(scene, textureKeys[kind]);
  if (kind === "desertBunker") drawDesertBunker(scene, textureKeys[kind]);
  if (kind === "officeCat") drawOfficeCat(scene, textureKeys[kind]);
  if (kind === "controlPanel") drawControlPanel(scene, textureKeys[kind]);
  if (kind === "powerSwitch") drawPowerSwitch(scene, textureKeys[kind]);
  if (kind === "projectorScreen") drawProjectorScreen(scene, textureKeys[kind]);
}

function tryDrawStandaloneCutout(scene: Phaser.Scene, kind: EntityArtKind, key: string): boolean {
  const source = standaloneSources[kind];
  if (!source || !scene.textures.exists(source.key)) {
    return false;
  }

  const texture = scene.textures.createCanvas(key, source.targetWidth, source.targetHeight);
  if (!texture) return false;

  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const image = scene.textures.get(source.key).getSourceImage() as CanvasImageSource;
  const imageWidth = Number((image as HTMLImageElement).width ?? source.targetWidth);
  const imageHeight = Number((image as HTMLImageElement).height ?? source.targetHeight);
  ctx.clearRect(0, 0, source.targetWidth, source.targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale = Math.min(source.targetWidth / imageWidth, source.targetHeight / imageHeight) * 0.98;
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const dx = (source.targetWidth - drawWidth) / 2;
  const dy = (source.targetHeight - drawHeight) / 2;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  removeChromaKey(ctx, source.targetWidth, source.targetHeight);
  texture.refresh();
  return true;
}

function tryDrawMangaCutout(scene: Phaser.Scene, kind: EntityArtKind, key: string): boolean {
  const source = mangaSources[kind];
  if (!source || !scene.textures.exists(mangaSheetKey)) {
    return false;
  }

  const texture = scene.textures.createCanvas(key, source.targetWidth, source.targetHeight);
  if (!texture) return false;

  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const sheet = scene.textures.get(mangaSheetKey).getSourceImage() as CanvasImageSource;
  ctx.clearRect(0, 0, source.targetWidth, source.targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale = Math.min(source.targetWidth / source.width, source.targetHeight / source.height) * 0.96;
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;
  const dx = (source.targetWidth - drawWidth) / 2;
  const dy = (source.targetHeight - drawHeight) / 2;
  ctx.drawImage(sheet, source.x, source.y, source.width, source.height, dx, dy, drawWidth, drawHeight);

  removeChromaKey(ctx, source.targetWidth, source.targetHeight);
  texture.refresh();
  return true;
}

function removeChromaKey(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const pixels = ctx.getImageData(0, 0, width, height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isMagentaKey = r > 210 && g < 85 && b > 180 && r - g > 120 && b - g > 110;
    const isGreenKey = g > 180 && r < 95 && b < 110 && g - r > 95 && g - b > 80;
    if (isMagentaKey || isGreenKey) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(pixels, 0, 0);
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

function drawCoconutTree(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 190, 230);
  ctx.translate(95, 132);

  ellipse(ctx, 0, 82, 72, 12, "rgba(20,40,35,0.2)", "rgba(0,0,0,0)", 0);
  ctx.save();
  ctx.rotate(-0.14);
  roundRect(ctx, -14, -11, 28, 124, 13, "#a46b3d", "#5c3527", 6);
  ctx.fillStyle = "rgba(255,220,150,0.28)";
  for (let y = 3; y < 95; y += 22) {
    ctx.beginPath();
    ctx.moveTo(-12, y);
    ctx.quadraticCurveTo(0, y + 10, 13, y + 3);
    stroke(ctx, "#6f442f", 3);
  }
  ctx.restore();

  const leaf = (angle: number, color: string, sx = 1) => {
    ctx.save();
    ctx.rotate(angle);
    ctx.scale(sx, 1);
    ctx.beginPath();
    ctx.moveTo(0, -74);
    ctx.quadraticCurveTo(64, -112, 97, -73);
    ctx.quadraticCurveTo(50, -65, 4, -46);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    stroke(ctx, "#1f6b4a", 5);
    ctx.beginPath();
    ctx.moveTo(7, -69);
    ctx.quadraticCurveTo(42, -83, 78, -74);
    stroke(ctx, "rgba(255,255,255,0.25)", 3);
    ctx.restore();
  };
  leaf(-0.68, "#2fa66a");
  leaf(0.58, "#3cc17a");
  leaf(0.02, "#52c777", 1.08);
  leaf(1.28, "#2fa66a", 0.86);
  leaf(-1.25, "#42b870", 0.88);
  ellipse(ctx, -15, -45, 10, 11, "#6a422c", "#3f281d", 4);
  ellipse(ctx, 4, -49, 10, 11, "#6a422c", "#3f281d", 4);
  ellipse(ctx, 23, -43, 9, 10, "#6a422c", "#3f281d", 4);

  finish(scene, key);
}

function drawPinkwindkisPenguin(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 135, 145);
  ctx.translate(68, 75);

  ellipse(ctx, 0, 50, 38, 8, "rgba(0,0,0,0.22)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, -15, 44, 16, 7, "#ffb44a", "#2d1c12", 3);
  ellipse(ctx, 15, 44, 16, 7, "#ffb44a", "#2d1c12", 3);
  ellipse(ctx, -29, 13, 11, 33, "#23283b", "#ffffff", 4);
  ellipse(ctx, 29, 13, 11, 33, "#23283b", "#ffffff", 4);
  ellipse(ctx, 0, 13, 30, 43, "#23283b", "#ffffff", 5);
  ellipse(ctx, 0, 19, 18, 31, "#ffffff", "#ffffff", 1);
  ellipse(ctx, 0, -26, 28, 27, "#23283b", "#ffffff", 5);
  ellipse(ctx, 0, -23, 19, 14, "#ffffff", "#ffffff", 1);
  roundRect(ctx, -24, -34, 48, 19, 8, "#20263b", "#8eeaff", 4);
  ellipse(ctx, -11, -25, 9, 7, "#8eeaff", "#20335d", 2);
  ellipse(ctx, 11, -25, 9, 7, "#8eeaff", "#20335d", 2);
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(-9, -3);
  ctx.lineTo(9, -3);
  ctx.closePath();
  ctx.fillStyle = "#ffb44a";
  ctx.fill();
  stroke(ctx, "#2d1c12", 3);

  finish(scene, key);
}

function drawSickFrog(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 150, 120);
  ctx.translate(75, 64);

  ellipse(ctx, 0, 36, 43, 8, "rgba(37,23,42,0.28)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 0, 10, 37, 25, "#75b553", "#263b2b", 5);
  ellipse(ctx, 0, -15, 43, 29, "#86c761", "#263b2b", 5);
  ellipse(ctx, -22, -33, 13, 13, "#e8ffe0", "#263b2b", 4);
  ellipse(ctx, 22, -33, 13, 13, "#e8ffe0", "#263b2b", 4);
  ellipse(ctx, -22, -31, 4, 5, "#263b2b", "#263b2b", 1);
  ellipse(ctx, 22, -31, 4, 5, "#263b2b", "#263b2b", 1);
  ctx.beginPath();
  ctx.arc(0, -10, 16, 0.12, Math.PI - 0.12);
  stroke(ctx, "#263b2b", 4);
  ellipse(ctx, -32, -4, 6, 12, "#8cf06a", "#2b7d45", 2);
  ellipse(ctx, 32, 1, 5, 10, "#8cf06a", "#2b7d45", 2);
  ellipse(ctx, 9, -45, 5, 9, "#8cf06a", "#2b7d45", 2);
  ctx.fillStyle = "#5e3b43";
  ctx.font = "bold 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("contaminée", 0, 54);

  finish(scene, key);
}

function drawToxicPond(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 230, 90);
  ctx.translate(115, 46);

  ellipse(ctx, 0, 13, 98, 23, "rgba(94,23,38,0.4)", "rgba(0,0,0,0)", 0);
  ctx.beginPath();
  ctx.moveTo(-89, 0);
  ctx.quadraticCurveTo(-45, -27, 19, -20);
  ctx.quadraticCurveTo(85, -15, 94, 8);
  ctx.quadraticCurveTo(62, 30, -22, 26);
  ctx.quadraticCurveTo(-90, 24, -89, 0);
  ctx.fillStyle = "#b82539";
  ctx.fill();
  stroke(ctx, "#5b1523", 6);
  ellipse(ctx, -42, -7, 29, 8, "rgba(242,238,240,0.78)", "#5b7890", 3);
  roundRect(ctx, -56, -15, 33, 9, 4, "rgba(218,246,255,0.9)", "#5b7890", 2);
  ellipse(ctx, 44, 5, 22, 7, "rgba(255,106,118,0.4)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, -74, 10, 4, 4, "rgba(255,131,144,0.75)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 73, -2, 3, 3, "rgba(255,156,165,0.6)", "rgba(0,0,0,0)", 0);

  finish(scene, key);
}

function drawDesertBunker(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 310, 250);
  ctx.translate(155, 130);

  ellipse(ctx, 0, 92, 152, 19, "rgba(43,33,50,0.33)", "rgba(0,0,0,0)", 0);
  roundRect(ctx, -125, -38, 250, 184, 16, "#394050", "#181b25", 8);
  roundRect(ctx, -110, -122, 220, 41, 10, "#515a70", "#181b25", 6);
  ellipse(ctx, -100, -101, 13, 13, "#d95959", "#5b1d25", 3);
  ellipse(ctx, 100, -101, 13, 13, "#d95959", "#5b1d25", 3);
  roundRect(ctx, -58, -10, 116, 132, 8, "#151a24", "#6f778d", 7);
  roundRect(ctx, -39, 6, 78, 98, 6, "#252d3a", "#2e3547", 3);
  ctx.fillStyle = "#fff2c2";
  ctx.strokeStyle = "#1d1b27";
  ctx.lineWidth = 6;
  ctx.font = "bold 23px system-ui";
  ctx.textAlign = "center";
  ctx.strokeText("BUNKER 08", 0, -150);
  ctx.fillText("BUNKER 08", 0, -150);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-96, -9);
  ctx.lineTo(95, -32);
  ctx.stroke();

  finish(scene, key);
}

function drawOfficeCat(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 120, 120);
  ctx.translate(60, 62);

  ellipse(ctx, 0, 34, 37, 8, "rgba(8,14,27,0.24)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 0, 13, 28, 21, "#f0a05c", "#302844", 4);
  ctx.beginPath();
  ctx.moveTo(-17, -23);
  ctx.lineTo(-7, -46);
  ctx.lineTo(3, -24);
  ctx.moveTo(17, -23);
  ctx.lineTo(7, -46);
  ctx.lineTo(-3, -24);
  ctx.fillStyle = "#ffb86f";
  ctx.fill();
  stroke(ctx, "#302844", 4);
  ellipse(ctx, 0, -16, 24, 23, "#ffb86f", "#302844", 4);
  ctx.beginPath();
  ctx.arc(-8, -18, 5, 0, Math.PI);
  ctx.arc(8, -18, 5, 0, Math.PI);
  stroke(ctx, "#302844", 3);
  ellipse(ctx, -13, -10, 6, 3, "rgba(255,114,152,0.65)", "rgba(0,0,0,0)", 0);
  ellipse(ctx, 13, -10, 6, 3, "rgba(255,114,152,0.65)", "rgba(0,0,0,0)", 0);
  ctx.fillStyle = "#6d4430";
  ctx.font = "bold 13px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("ω", 0, -4);
  ellipse(ctx, -10, 23, 8, 6, "#ffb86f", "#302844", 3);
  ellipse(ctx, 10, 23, 8, 6, "#ffb86f", "#302844", 3);
  ctx.beginPath();
  ctx.arc(23, 9, 17, 1.2 * Math.PI, 0.25 * Math.PI);
  stroke(ctx, "#e7934f", 7);
  ctx.fillStyle = "#ffd36a";
  ctx.font = "bold 10px system-ui";
  ctx.fillText("TOUCHE-MOI", 0, 51);

  finish(scene, key);
}

function drawControlPanel(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 135, 155);
  ctx.translate(68, 78);

  roundRect(ctx, -53, -61, 106, 125, 12, "#1a2943", "#7193c4", 6);
  roundRect(ctx, -40, -48, 80, 92, 8, "#223957", "rgba(169,186,213,0.4)", 3);
  ellipse(ctx, -25, -35, 7, 7, "#71e69b", "#20335d", 2);
  ellipse(ctx, 0, -35, 7, 7, "#ffd36a", "#20335d", 2);
  ellipse(ctx, 25, -35, 7, 7, "#ff7185", "#20335d", 2);
  roundRect(ctx, -25, 4, 50, 29, 6, "#111b30", "#536c94", 3);
  ellipse(ctx, 0, -3, 13, 13, "#ff5d76", "#7d2941", 5);
  ellipse(ctx, 0, -3, 4, 4, "#ffd9df", "#ffd9df", 1);
  ctx.fillStyle = "#9fb4d3";
  ctx.font = "bold 8px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("ALIMENTATION", 0, 69);

  finish(scene, key);
}

function drawPowerSwitch(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 82, 86);
  ctx.translate(41, 42);

  roundRect(ctx, -28, -27, 56, 58, 10, "#ffffff", "rgba(48,40,68,0.22)", 4);
  roundRect(ctx, -23, -23, 46, 48, 9, "#ff8cae", "#302844", 5);
  ellipse(ctx, 0, -5, 12, 12, "#ffd45f", "#302844", 4);
  ctx.fillStyle = "#302844";
  ctx.font = "bold 8px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("OPEN", 0, 22);

  finish(scene, key);
}

function drawProjectorScreen(scene: Phaser.Scene, key: string): void {
  const ctx = makeCanvas(scene, key, 220, 165);
  ctx.translate(110, 82);

  roundRect(ctx, -94, -68, 188, 138, 8, "#f5f0df", "#2d3b58", 9);
  ctx.beginPath();
  ctx.moveTo(0, -51);
  ctx.lineTo(-28, 36);
  ctx.lineTo(28, 36);
  ctx.closePath();
  ctx.fillStyle = "#697997";
  ctx.fill();
  stroke(ctx, "#33405d", 5);
  ellipse(ctx, 48, -35, 16, 16, "#ffd36a", "#ad7a28", 3);
  ctx.fillStyle = "#33405d";
  ctx.font = "bold 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("DÉPART IMMÉDIAT", 0, 54);
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-77, -51);
  ctx.lineTo(78, -61);
  ctx.stroke();

  finish(scene, key);
}
