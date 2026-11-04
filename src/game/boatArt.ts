import Phaser from "phaser";
import {createEntityImage} from "./entityArt";

/** Lunar yacht with a beach-specific palette and separate fouled marine drive. */
export function createOriginalBeachBoat(scene:Phaser.Scene,x:number,y:number):{boat:Phaser.GameObjects.Container;algae:Phaser.GameObjects.Container}{
  const art=createEntityImage(scene,"moonBoat",0,18)
    .setOrigin(0.5,1)
    .setFlipX(true);
  const paletteKey="upless-beach-yacht-beige-sail";
  if(!scene.textures.exists(paletteKey)&&scene.textures.exists("upless-boat-galactic-futuristic-v1")){
    const source=art.texture.getSourceImage();
    const palette=scene.textures.createCanvas(paletteKey,art.width,art.height);
    if(palette&&source instanceof HTMLCanvasElement){
      const ctx=palette.context;
      ctx.drawImage(source,0,0);
      const pixels=ctx.getImageData(0,0,art.width,art.height);
      // Map the fitted sprite back to the original artwork's coordinates.
      const fit=Math.min(art.width/1472,art.height/1068)*0.98;
      for(let row=0;row<art.height;row++)for(let column=0;column<art.width;column++){
        const i=(row*art.width+column)*4;
        const [r,g,b,a]=pixels.data.subarray(i,i+4);
        if(!a||b<=r+14)continue;
        const px=(column-art.width/2)/fit+736;
        const py=(row-art.height/2)/fit+534;
        const light=Math.max(r,g,b);
        if(px>500&&px<890&&py<440&&py<460-(px-500)*0.24){
          pixels.data.set([light,Math.round(light*0.89),Math.round(light*0.71)],i);
        }else if(px>410&&px<1055&&py>440&&py<682&&px>880-(py-440)*2.1){
          const shade=Math.round(light*0.55);
          pixels.data.set([shade,shade,shade],i);
        }else if((px>1055&&py>355&&py<695)||(px>1040&&py>789&&py<864)||(px>540&&px<767&&py>840&&py<979)){
          pixels.data.set([light,Math.round(light*0.91),Math.round(r*0.38)],i);
        }else{
          const shade=Math.round(light*0.34);
          pixels.data.set([shade,shade,shade+3],i);
        }
      }
      ctx.putImageData(pixels,0,0);
      palette.refresh();
      palette.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
  if(scene.textures.exists(paletteKey))art.setTexture(paletteKey);
  art.setScale(320/art.width);
  const weed=scene.add.graphics();
  for(let i=0;i<5;i++)for(let j=0;j<22;j++){
    const px=116+i*6+Math.round(Math.sin(j*0.48+i*1.4)*9);
    const py=-29+j*2+(i%2)*3;
    weed.fillStyle(0x612538).fillRect(px-1,py,6,4);
    weed.fillStyle(i%2?0xb73e50:0xce5260).fillRect(px,py,4,3);
    if(j%5===0)weed.fillStyle(0xef8a80).fillRect(px+1,py,2,2);
  }
  const algae=scene.add.container(0,0,[weed]);
  // The mirrored lunar sprite has its stern on the left.

  algae.setPosition(-230,-75);
  return{boat:scene.add.container(x,y,[art,algae]).setDepth(13).setScale(1.12).setAngle(0)
    .setData("design","black-lunar-yacht"),algae};
}
