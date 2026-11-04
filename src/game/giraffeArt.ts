import Phaser from "phaser";
import {createEntityImage} from "./entityArt";

/** Keep the original long-necked giraffe, white T-shirt, jeans and friendly face. */
export function createOriginalGiraffe(scene:Phaser.Scene,x:number,y:number):Phaser.GameObjects.Container {
  const key="upless-original-giraffe-detailed-pixel";
  const sourceKey="upless-giraffe-biped-tshirt-jeans-v1";
  if(!scene.textures.exists(key)&&scene.textures.exists(sourceKey)){
    const image=scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
    const cutout=document.createElement("canvas");cutout.width=image.width;cutout.height=image.height;
    const ctx=cutout.getContext("2d",{willReadFrequently:true});
    if(ctx){
      ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,cutout.width,cutout.height),data=pixels.data;
      let left=cutout.width,right=0,top=cutout.height,bottom=0;
      for(let py=0;py<cutout.height;py++)for(let px=0;px<cutout.width;px++){
        const i=(py*cutout.width+px)*4;
        if(data[i]>150&&data[i+2]>130&&data[i]-data[i+1]>25&&data[i+2]-data[i+1]>25){data[i+3]=0;continue;}
        if(data[i+3]<128)continue;
        left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
      }
      ctx.putImageData(pixels,0,0);
      const low=document.createElement("canvas");low.width=84;low.height=188;
      const small=low.getContext("2d");
      const texture=scene.textures.createCanvas(key,84,188);
      if(small&&texture&&right>left&&bottom>top){
        const width=right-left+1,height=bottom-top+1;
        const scale=Math.min(80/width,184/height);
        small.imageSmoothingQuality="high";
        small.drawImage(cutout,left,top,width,height,(84-width*scale)/2,(188-height*scale)/2,width*scale,height*scale);
        const grid=small.getImageData(0,0,84,188);
        for(let i=0;i<grid.data.length;i+=4){
          grid.data[i+3]=grid.data[i+3]>=130?255:0;
          for(let channel=0;channel<3;channel++)grid.data[i+channel]=Math.min(255,Math.round(grid.data[i+channel]/6)*6);
        }
        small.putImageData(grid,0,0);
        texture.context.imageSmoothingEnabled=false;texture.context.drawImage(low,0,0,84,188);texture.refresh();
      }
    }
  }
  const drawing=scene.textures.exists(key)
    ? scene.add.image(0,44,key).setOrigin(0.5,1)
    : createEntityImage(scene,"beachGiraffe",0,-48).setScale(0.8);
  return scene.add.container(x,y,[drawing]).setDepth(18).setData("character","original-giraffe-tshirt-jeans");
}
