import { loadSave, writeSave, type Language } from "./types";
import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import ru from "./locales/ru.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import hi from "./locales/hi.json";

export const languages:Language[]=["fr","en","es","pt","de","it","ru","ar","zh","ja","ko","hi"];
const dictionaries:Record<string,Record<string,string>>={en,es,pt,de,it,ru,ar,zh,ja,ko,hi};
let current:Language|undefined;

export function getLanguage():Language {
  if(current)return current;
  const requested=new URLSearchParams(window.location.search).get("lang");
  const saved=loadSave().language;
  current=languages.includes(requested as Language)?requested as Language:languages.includes(saved)?saved:"fr";
  writeSave({...loadSave(),language:current});
  return current;
}

export function setLanguage(language:Language):void {
  current=language;
  writeSave({...loadSave(),language});
  document.documentElement.lang=language;
}

export function toggleLanguage():Language {
  const next=languages[(languages.indexOf(getLanguage())+1)%languages.length];
  setLanguage(next);
  return next;
}

export function translateText(text:string):string {
  const dictionary=dictionaries[getLanguage()];
  if(!dictionary||!text)return text;
  if(dictionary[text])return dictionary[text];
  // Dynamic labels can contain a fixed translated phrase followed by a counter.
  return text.split("\n").map(line=>{
    if(dictionary[line])return dictionary[line];
    const counter=line.match(/^(.*?)(\s*\d+(?:\/\d+)?)$/);
    if(counter&&dictionary[counter[1].trim()])return dictionary[counter[1].trim()]+counter[2];
    return line;
  }).join("\n");
}

export function t(fr:string,enFallback:string):string {
  if(getLanguage()==="fr")return fr;
  return dictionaries[getLanguage()]?.[fr]??(getLanguage()==="en"?enFallback:fr);
}

export function icon(symbol:string,fr:string,enFallback:string):string {
  return symbol+" "+t(fr,enFallback);
}
