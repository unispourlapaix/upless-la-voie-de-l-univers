import Phaser from "phaser";

const brokenLibertyKey = "upless-drawn-broken-liberty";

export function createBrokenLibertyStatue(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  if (!scene.textures.exists(brokenLibertyKey)) drawBrokenLibertyTexture(scene);
  const statue = scene.add.image(x, y, brokenLibertyKey).setDepth(7);
  statue.setData("renderMode", "drawn-texture");
  statue.setData("decorKind", "broken-liberty-statue-four-pieces");
  return statue;
}

function drawBrokenLibertyTexture(scene: Phaser.Scene): void {
  const texture = scene.textures.createCanvas(brokenLibertyKey, 560, 280);
  if (!texture) return;
  const canvas = texture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  drawSandShadow(ctx, 280, 218, 455, 48);
  drawSandSmear(ctx, 278, 226, 370, 22);
  drawFoot(ctx, 95, 203, 0.08);
  drawHead(ctx, 190, 127, -0.22);
  drawBust(ctx, 302, 178, -0.1);
  drawTorch(ctx, 435, 188, 0.12);

  ctx.font = "bold 13px system-ui";
  ctx.fillStyle = "#5e3b43";
  ctx.fillText("tête", 190, 202);
  ctx.fillText("buste", 312, 249);
  ctx.fillText("torche", 438, 250);
  ctx.fillText("pied", 95, 247);

  addGrain(ctx, 560, 280);
  texture.refresh();
}

function drawHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  withTransform(ctx, x, y, angle, () => {
    const stone = "#8db7b2";
    const moss = "#6f9996";
    const dark = "#2f3c4c";
    ctx.fillStyle = stone;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 7;
    blob(ctx, [[-50, -11], [-34, -40], [0, -49], [38, -34], [50, -2], [35, 36], [-10, 45], [-48, 21]]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(47,60,76,.28)";
    ellipse(ctx, -18, 0, 13, 21);
    ellipse(ctx, 13, -6, 11, 18);
    ctx.fill();
    ctx.fillStyle = "rgba(47,60,76,.62)";
    rounded(ctx, -18, 22, 38, 5, 3);
    ctx.fill();

    ctx.fillStyle = moss;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 4;
    rounded(ctx, -47, 7, 25, 12, 3);
    ctx.fill();
    ctx.stroke();

    [-45, -25, -5, 16, 38].forEach((offset, index) => {
      ctx.save();
      ctx.translate(offset, -38 + Math.abs(offset) * 0.14);
      ctx.rotate((-18 + index * 10) * Math.PI / 180);
      ctx.fillStyle = stone;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 4;
      blob(ctx, [[-9, 18], [9, 18], [4, -17 - (index % 2) * 5], [-3, -24]]);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    crack(ctx, [[-22, -8], [-8, 9], [-19, 24]]);
    crack(ctx, [[19, -26], [8, -10], [29, 5]]);
  });
}

function drawBust(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  withTransform(ctx, x, y, angle, () => {
    const stone = "#8db7b2";
    const moss = "#6f9996";
    const dark = "#2f3c4c";
    ctx.fillStyle = stone;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 7;
    blob(ctx, [[-92, -31], [-36, -54], [50, -43], [91, -4], [67, 43], [-28, 53], [-89, 22]]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stone;
    rounded(ctx, -72, -7, 78, 74, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = moss;
    rounded(ctx, 20, -26, 76, 55, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = stone;
    circle(ctx, 77, 40, 17);
    ctx.stroke();

    crack(ctx, [[-72, -5], [-43, 17], [-57, 48]]);
    crack(ctx, [[7, -38], [33, -7], [70, 24]]);
    crack(ctx, [[-13, 6], [10, 30], [-3, 51]]);
  });
}

function drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  withTransform(ctx, x, y, angle, () => {
    const stone = "#8db7b2";
    const moss = "#6f9996";
    const dark = "#2f3c4c";
    ctx.fillStyle = stone;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 6;
    rounded(ctx, -8, 0, 134, 27, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = moss;
    rounded(ctx, -56, -6, 42, 34, 6);
    ctx.fill();
    ctx.stroke();
    rounded(ctx, 72, 8, 34, 22, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = stone;
    circle(ctx, -90, -6, 30);
    ctx.stroke();
    ctx.fillStyle = moss;
    circle(ctx, -90, -6, 17);
    ctx.stroke();

    [-112, -94, -76].forEach((offset, index) => {
      ctx.save();
      ctx.translate(offset, -43 - index * 2);
      ctx.rotate((-24 + index * 17) * Math.PI / 180);
      ctx.fillStyle = stone;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3;
      rounded(ctx, -5, -18, 10, 38, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    drawFlame(ctx, -126, -60, -0.32, "#e86b49");
    drawFlame(ctx, -96, -72, 0.1, "#ffb65f");
    drawFlame(ctx, -64, -59, 0.45, "#d94a3d");
    crack(ctx, [[-37, 3], [-3, 28], [22, 10]]);
    crack(ctx, [[44, 9], [78, 31], [104, 18]]);
  });
}

function drawFoot(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
  withTransform(ctx, x, y, angle, () => {
    const stone = "#8db7b2";
    const moss = "#6f9996";
    const dark = "#2f3c4c";
    ctx.fillStyle = stone;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 7;
    blob(ctx, [[-62, -15], [13, -28], [61, -7], [53, 22], [-48, 25]]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = moss;
    rounded(ctx, -42, -45, 47, 37, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = stone;
    ellipse(ctx, 38, -38, 52, 25);
    ctx.fill();
    ctx.stroke();
    crack(ctx, [[-40, -11], [-8, 10], [27, -1]]);
    crack(ctx, [[10, -48], [34, -29], [55, -39]]);
  });
}

function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string): void {
  withTransform(ctx, x, y, angle, () => {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#2f3c4c";
    ctx.lineWidth = 4;
    blob(ctx, [[-15, 18], [13, 17], [8, -10], [0, -31], [-9, -8]]);
    ctx.fill();
    ctx.stroke();
  });
}

function drawSandShadow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(63,37,48,.22)";
  ellipse(ctx, x, y, w, h);
  ctx.fill();
  ctx.restore();
}

function drawSandSmear(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.03);
  ctx.fillStyle = "rgba(196,116,72,.3)";
  rounded(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.restore();
}

function crack(ctx: CanvasRenderingContext2D, points: number[][]): void {
  ctx.save();
  ctx.strokeStyle = "rgba(47,60,76,.82)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
  ctx.restore();
}

function addGrain(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  for (let i = 0; i < 260; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(47,60,76,.055)" : "rgba(255,255,255,.06)";
    circle(ctx, Math.random() * width, Math.random() * height, Math.random() * 1.4);
  }
  ctx.restore();
}

function withTransform(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, draw: () => void): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  draw();
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
