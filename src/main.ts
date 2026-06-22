import Phaser from "phaser";
import "./style.css";
import { GameScene } from "./game/GameScene";
import { LevelCompleteScene } from "./game/LevelCompleteScene";
import { MenuScene } from "./game/MenuScene";
import { OfficeScene } from "./game/OfficeScene";
import { PreloadScene } from "./game/PreloadScene";

const bootScreen = document.querySelector<HTMLDivElement>("#boot-screen");

try {
  const game = new Phaser.Game({
    // Canvas is deliberately used for wider compatibility on mobile browsers.
    type: Phaser.CANVAS,
    parent: "game",
    width: 360,
    height: 640,
    backgroundColor: "#10162f",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 950 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 360,
      height: 640,
    },
    scene: [PreloadScene, MenuScene, GameScene, OfficeScene, LevelCompleteScene],
    render: {
      antialias: true,
      pixelArt: false,
    },
    callbacks: {
      postBoot: () => {
        bootScreen?.remove();
      },
    },
  });

  window.addEventListener("pagehide", () => game.loop.sleep());
  window.addEventListener("pageshow", () => game.loop.wake());
} catch (error) {
  if (bootScreen) {
    bootScreen.classList.add("boot-error");
    bootScreen.textContent =
      "Le jeu n’a pas pu démarrer. Recharge la page ou essaie avec Chrome, Safari ou Firefox à jour.";
  }
  console.error("Upless boot error", error);
}
