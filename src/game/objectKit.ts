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
  sticker?: boolean;
};

export function createDetailedObject(
  scene: Phaser.Scene,
  kind: DetailObjectKind,
  x: number,
  y: number,
  options: DetailObjectOptions = {},
): Phaser.GameObjects.Container {
  const parts: Phaser.GameObjects.GameObject[] = [];
  const scale = options.scale ?? 1;
  const sticker = options.sticker ?? true;

  parts.push(scene.add.ellipse(4, 18, 72, 15, 0x120d1b, 0.22));
  if (sticker) {
    const backing = kind === "redPuddle"
      ? scene.add.ellipse(0, 6, 86, 32, 0xffffff, 0.16).setStrokeStyle(2, 0xffffff, 0.24)
      : scene.add.ellipse(0, 0, 62, 48, 0xffffff, 0.92).setStrokeStyle(3, 0x302844, 0.2);
    parts.push(backing);
  }

  if (kind === "rocketPiece") addRocketPiece(scene, parts);
  else if (kind === "plasticWaste") addPlasticWaste(scene, parts);
  else if (kind === "smartBattery") addSmartBattery(scene, parts);
  else if (kind === "alienVirus") addAlienVirus(scene, parts);
  else if (kind === "redPuddle") addRedPuddle(scene, parts);
  else if (kind === "rareOil") addRareOil(scene, parts);
  else if (kind === "vrHeadset") addVrHeadset(scene, parts);
  else if (kind === "pinkUnderwear") addPinkUnderwear(scene, parts);
  else if (kind === "dinoBook") addDinoBook(scene, parts);
  else addSatelliteAntenna(scene, parts);

  const container = scene.add.container(x, y, parts).setScale(scale);
  container.setData("detailKind", kind);
  container.setData("detailLabel", options.label ?? kind);
  return container;
}

function addRocketPiece(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.ellipse(0, 0, 66, 34, 0xe9edf6).setStrokeStyle(4, 0x302844).setAngle(-8));
  parts.push(scene.add.ellipse(20, -3, 23, 15, 0x78d7ff, 0.92).setStrokeStyle(2, 0x302844).setAngle(-8));
  parts.push(scene.add.rectangle(-24, 5, 23, 11, 0xd55f58).setStrokeStyle(2, 0x302844).setAngle(-8));
  parts.push(scene.add.triangle(-37, 7, -8, 8, 8, 8, 0, -15, 0xffa14d).setStrokeStyle(2, 0x302844).setAngle(-98));
  parts.push(scene.add.line(0, 0, -12, -15, 24, 13, 0x302844, 0.55).setLineWidth(2));
  parts.push(scene.add.rectangle(6, 9, 38, 4, 0x6949d7, 0.62).setAngle(-8));
  parts.push(scene.add.circle(31, 8, 4, 0xffd36a).setStrokeStyle(1, 0x302844));
}

function addPlasticWaste(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.ellipse(0, 4, 42, 16, 0xdaf6ff, 0.72).setStrokeStyle(2, 0x5b7890).setAngle(-5));
  parts.push(scene.add.rectangle(-3, -7, 27, 9, 0xdaf6ff, 0.68).setStrokeStyle(2, 0x5b7890).setAngle(-11));
  parts.push(scene.add.arc(-13, -9, 9, 220, 30, false, 0x5b7890).setStrokeStyle(2, 0x5b7890));
  parts.push(scene.add.line(0, 0, -16, 5, 15, -1, 0xffffff, 0.7).setLineWidth(2));
  parts.push(scene.add.circle(17, 2, 3, 0xff8390, 0.75));
}

function addSmartBattery(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.rectangle(0, 0, 38, 23, 0x3f4656).setStrokeStyle(3, 0x151923));
  parts.push(scene.add.rectangle(23, 0, 6, 12, 0x151923));
  parts.push(scene.add.rectangle(-4, 0, 22, 12, 0x74e7ff, 0.26).setStrokeStyle(1, 0x74e7ff, 0.5));
  parts.push(scene.add.text(-3, 0, "⚡", { fontSize: "15px", color: "#f6d66c" }).setOrigin(0.5));
  parts.push(scene.add.circle(-17, -10, 3, 0xff5d76, 0.9));
}

function addAlienVirus(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.circle(0, 0, 13, 0x8cf06a).setStrokeStyle(3, 0x244328));
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    parts.push(scene.add.line(0, 0, Math.cos(angle) * 10, Math.sin(angle) * 10, Math.cos(angle) * 20, Math.sin(angle) * 20, 0x244328, 0.6).setLineWidth(2));
    parts.push(scene.add.circle(Math.cos(angle) * 21, Math.sin(angle) * 21, 3, 0x8cf06a).setStrokeStyle(1, 0x244328));
  }
  parts.push(scene.add.circle(-4, -4, 3, 0xd7ff9a, 0.9), scene.add.circle(5, 4, 2.5, 0xd7ff9a, 0.8));
}

function addRedPuddle(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.ellipse(0, 8, 82, 24, 0xb82539, 0.72).setStrokeStyle(3, 0x5b1523));
  parts.push(scene.add.ellipse(-18, 4, 18, 7, 0xff6a76, 0.52));
  parts.push(scene.add.circle(22, 8, 5, 0xff8791, 0.65));
  parts.push(scene.add.circle(-31, 11, 3, 0xff9ca5, 0.6));
}

function addRareOil(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.rectangle(0, 4, 34, 29, 0xc8b080).setStrokeStyle(3, 0x302844));
  parts.push(scene.add.ellipse(0, -11, 35, 12, 0xe2d3aa).setStrokeStyle(2, 0x302844));
  parts.push(scene.add.rectangle(0, -8, 36, 9, 0x807766).setStrokeStyle(2, 0x302844));
  parts.push(scene.add.text(0, 6, "OIL", { fontSize: "9px", color: "#302844", fontStyle: "bold" }).setOrigin(0.5));
  parts.push(scene.add.circle(13, 17, 4, 0x3f2a1b, 0.9));
}

function addVrHeadset(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.rectangle(0, 0, 52, 29, 0x20263b).setStrokeStyle(4, 0x8eeaff));
  parts.push(scene.add.ellipse(-16, 0, 18, 13, 0x8eeaff, 0.85), scene.add.ellipse(16, 0, 18, 13, 0x8eeaff, 0.85));
  parts.push(scene.add.rectangle(0, -16, 36, 5, 0x5f6ee8).setStrokeStyle(1, 0xffffff, 0.5));
  parts.push(scene.add.text(0, 28, "VR", { fontSize: "10px", color: "#20263b", fontStyle: "bold" }).setOrigin(0.5));
}

function addPinkUnderwear(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.triangle(0, 0, -30, -8, 30, -8, 0, 24, 0xff5fb2).setStrokeStyle(3, 0x5e2a44));
  parts.push(scene.add.circle(-20, -3, 5, 0xffb6da), scene.add.circle(20, -3, 5, 0xffb6da));
  parts.push(scene.add.text(0, 21, "🍓", { fontSize: "11px" }).setOrigin(0.5));
}

function addDinoBook(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.rectangle(0, 0, 48, 34, 0x7b4f2d).setStrokeStyle(3, 0x2f2018).setAngle(-7));
  parts.push(scene.add.rectangle(-17, 0, 5, 35, 0x3d2718).setAngle(-7));
  parts.push(scene.add.text(1, -2, "DINO", { fontSize: "9px", color: "#ffe0a3", fontStyle: "bold" }).setOrigin(0.5).setAngle(-7));
  parts.push(scene.add.circle(15, 8, 5, 0x93d66f));
}

function addSatelliteAntenna(scene: Phaser.Scene, parts: Phaser.GameObjects.GameObject[]): void {
  parts.push(scene.add.rectangle(0, 17, 45, 14, 0x3f4b6d).setStrokeStyle(3, 0x20263b));
  parts.push(scene.add.line(0, 0, 0, 8, 20, -48, 0x20263b, 1).setLineWidth(4));
  parts.push(scene.add.circle(20, -48, 7, 0xffd36a).setStrokeStyle(2, 0x20263b));
  parts.push(scene.add.arc(31, -58, 22, 135, 220, false, 0x8eeaff).setStrokeStyle(2, 0x8eeaff));
  parts.push(scene.add.arc(36, -65, 31, 135, 220, false, 0x8eeaff, 0.45).setStrokeStyle(2, 0x8eeaff, 0.45));
}
