export type StatuePiece = "head" | "bust" | "torch" | "foot";
type Component = { id: number; count: number; x: number; y: number; right: number; bottom: number };

// Separate the four stickers before resizing, so adjacent pieces cannot enter a crop.
export function isolateStatuePieces(data: Uint8ClampedArray, width: number, height: number): Record<StatuePiece, {width: number; height: number; pixels: Uint8ClampedArray}> {
  const labels = new Int32Array(width * height);
  const queue = new Int32Array(width * height);
  for (let p = 0; p < labels.length; p++) {
    const i = p * 4;
    const magenta = data[i] > 150 && data[i + 2] > 130 && data[i] - data[i + 1] > 25 && data[i + 2] - data[i + 1] > 25;
    if (magenta || data[i + 3] < 128) labels[p] = -1;
  }
  const components: Component[] = [];
  for (let p = 0; p < labels.length; p++) {
    if (labels[p] !== 0) continue;
    const c: Component = {id: components.length + 1, count: 0, x: width, y: height, right: 0, bottom: 0};
    let read = 0, write = 1;
    queue[0] = p; labels[p] = c.id;
    while (read < write) {
      const at = queue[read++], x = at % width, y = Math.floor(at / width);
      c.count++; c.x = Math.min(c.x, x); c.y = Math.min(c.y, y);
      c.right = Math.max(c.right, x); c.bottom = Math.max(c.bottom, y);
      const visit = (next: number) => {if (labels[next] === 0) {labels[next] = c.id; queue[write++] = next;}};
      if (x > 0) visit(at - 1);
      if (x + 1 < width) visit(at + 1);
      if (y > 0) visit(at - width);
      if (y + 1 < height) visit(at + width);
    }
    components.push(c);
  }
  const candidates = components.sort((a, b) => b.count - a.count).slice(0, 4);
  if (candidates.length < 4) throw new Error("Statue sheet must contain four separate pieces");
  const anchors: [StatuePiece, number, number][] = [["head", 0.65, 0.23], ["torch", 0.25, 0.35], ["bust", 0.69, 0.56], ["foot", 0.36, 0.81]];
  const result = {} as Record<StatuePiece, {width: number; height: number; pixels: Uint8ClampedArray}>;
  for (const [piece, ax, ay] of anchors) {
    candidates.sort((a, b) => {
      const distance = (c: Component) => (((c.x + c.right) / 2 / width) - ax) ** 2 + (((c.y + c.bottom) / 2 / height) - ay) ** 2;
      return distance(a) - distance(b);
    });
    const c = candidates.shift()!;
    const w = c.right - c.x + 1, h = c.bottom - c.y + 1;
    const pixels = new Uint8ClampedArray(w * h * 4);
    // Remove only paper connected to the outside, preserving white eyes and internal highlights.
    const outside = new Uint8Array(w * h);
    let read = 0, write = 0;
    const visit = (at: number) => {
      if (outside[at]) return;
      const source = (Math.floor(at / w) + c.y) * width + at % w + c.x, i = source * 4;
      const paper = data[i] > 215 && data[i + 1] > 215 && data[i + 2] > 205;
      if (labels[source] === c.id && !paper) return;
      outside[at] = 1; queue[write++] = at;
    };
    for (let x = 0; x < w; x++) { visit(x); visit((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { visit(y * w); visit(y * w + w - 1); }
    while (read < write) {
      const at = queue[read++], x = at % w, y = Math.floor(at / w);
      if (x > 0) visit(at - 1);
      if (x + 1 < w) visit(at + 1);
      if (y > 0) visit(at - w);
      if (y + 1 < h) visit(at + w);
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const source = (y + c.y) * width + x + c.x, i = source * 4;
      if (labels[source] !== c.id || outside[y * w + x]) continue;
      const target = (y * w + x) * 4;
      pixels[target] = data[i]; pixels[target + 1] = data[i + 1]; pixels[target + 2] = data[i + 2]; pixels[target + 3] = 255;
    }
    result[piece] = {width: w, height: h, pixels};
  }
  return result;
}
