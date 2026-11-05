import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
let save={language:"fr",unlockedLevel:1};
let writes=0;
const exports={};
const code=ts.transpileModule(fs.readFileSync("src/game/trophies.ts","utf8"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText;
new Function("require","exports",code)(()=>({
 loadSave:()=>save,writeSave:value=>{save=value;writes++;},
}),exports);
assert.deepEqual(exports.collectedTrophies(),[],"old saves must start with an empty gallery");
exports.collectTrophy("cross");
exports.collectTrophy("cross");
assert.equal(writes,1,"repeated collection must not duplicate trophies");
assert.equal(save.language,"fr");
assert.deepEqual(exports.collectedTrophies(),["cross"]);
exports.collectTrophy("headset");
assert.deepEqual(exports.collectedTrophies(),["cross","headset"]);
assert.equal(exports.trophyReflections[0].id,"cross");
assert.equal(new Set(exports.trophyReflections.map(item=>item.id)).size,exports.trophyReflections.length);
for(const trophy of exports.trophyReflections)assert.ok(trophy.pages.every(page=>page.length>0));
console.log("Trophies: legacy saves, persistent collection, idempotency and reflection pages passed.");
