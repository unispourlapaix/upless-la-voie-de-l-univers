import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const dictionaries={};
const expected=Object.keys(JSON.parse(fs.readFileSync("src/game/locales/en.json","utf8")));
for(const lang of ["en","es","pt","de","it","ru","ar","zh","ja","ko","hi"]){
 const data=JSON.parse(fs.readFileSync("src/game/locales/"+lang+".json","utf8"));
 for(const key of expected){
  assert.equal(typeof data[key],"string",lang+": missing "+key);
  assert.ok(data[key].length>0,lang+": empty translation");
  assert.ok(!/\[\[\[\d+\]\]\]/.test(data[key]),lang+": batch marker leaked");
 }
 dictionaries[lang]=data;
}
let saved={language:"fr"};
global.window={location:{search:"?lang=ar"}};
global.document={documentElement:{}};
function module(){
 const exports={};
 const code=ts.transpileModule(fs.readFileSync("src/game/language.ts","utf8"),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
 }).outputText;
 new Function("require","exports",code)(name=>name==="./types"?{
  loadSave:()=>saved,writeSave:value=>{saved=value;},
 }:dictionaries[name.match(/locales\/(.+)\.json/)[1]],exports);
 return exports;
}
let language=module();
assert.equal(language.getLanguage(),"ar");
language.setLanguage("ja");
assert.equal(language.getLanguage(),"ja","URL override must not reset explicit selection");
assert.equal(saved.language,"ja");
for(const code of language.languages){
 language.setLanguage(code);
 assert.equal(language.getLanguage(),code);
 const result=language.translateText("EXPLORER LA PLAGE");
 assert.ok(result);
 if(code!=="fr")assert.equal(result,dictionaries[code]["EXPLORER LA PLAGE"]);
}
language.setLanguage("hi");
assert.equal(language.toggleLanguage(),"fr");
window.location.search="?lang=invalid";
saved.language="invalid";
language=module();
assert.equal(language.getLanguage(),"fr");
console.log("12 languages: complete catalogues, no leaked markers, saved selection, URL override, cycling and invalid-language fallback passed.");
