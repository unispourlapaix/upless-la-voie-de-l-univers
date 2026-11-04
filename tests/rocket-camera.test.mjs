import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Pan = require('../node_modules/phaser/src/cameras/2d/effects/Pan.js');
const Sine = require('../node_modules/phaser/src/math/easing/sine');
const source = fs.readFileSync(new URL('../src/game/DesertScene.ts', import.meta.url), 'utf8');
const match = source.match(/\.pan\(item\.x, 320, 650, ([^;]+)\);/);
assert.ok(match, 'Rocket camera pan must be present');
const easing = new Function('Phaser', `return ${match[1]};`)({Math:{Easing:{Sine}}});
assert.equal(typeof easing, 'function', 'Camera pans need a supported easing function');
const camera = {
  scrollX: 480, scrollY: 0, width: 360, height: 640, zoom: 1,
  getScroll(x,y,out) { return out.set(x-180,y-320); },
  setScroll(x,y) { this.scrollX=x; this.scrollY=y; return this; },
  centerOn(x,y) { this.setScroll(x-180,y-320); },
  emit() {},
};
const pan = new Pan(camera);
pan.start(770,320,650,easing);
for(let time=0;time<700;time+=16) {
  pan.update(time,16);
  assert.ok(Number.isFinite(camera.scrollX));
  assert.ok(Number.isFinite(camera.scrollY));
}
assert.equal(pan.isRunning,false);
assert.equal(camera.scrollX,590);
assert.equal(camera.scrollY,0);
console.log('Rocket camera pan: completed through the real Phaser effect without errors.');
