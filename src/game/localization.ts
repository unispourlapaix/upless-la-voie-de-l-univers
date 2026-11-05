import Phaser from "phaser";
import { getLanguage, translateText } from "./language";

/** Localize Phaser text at its shared entry point, including dynamic dialogue. */
export function installLocalization():void {
  const original=Phaser.GameObjects.Text.prototype.setText;
  Phaser.GameObjects.Text.prototype.setText=function(value:string|string[]){
    const language=getLanguage();
    const translate=(text:string)=>translateText(text);
    const result=original.call(this,Array.isArray(value)?value.map(translate):translate(String(value??"")));
    if(["ar","zh","ja","ko","hi"].includes(language)&&this.style){
      this.setFontFamily("Arial, 'Noto Sans', sans-serif");
      if(language==="ar"&&!this.style.rtl)this.setRTL(true);
    }
    return result;
  };
  document.documentElement.lang=getLanguage();
}
