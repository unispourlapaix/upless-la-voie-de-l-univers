import type { LevelDefinition } from "./types";

export const levels: LevelDefinition[] = [
  {
    id: 1,
    name: "Niveau 1 — Le chemin en 8",
    worldWidth: 1640,
    playerStart: { x: 55, y: 530 },
    platforms: [
      { x: 0, y: 565, width: 250, height: 36 },
      { x: 360, y: 565, width: 270, height: 36 },
      { x: 640, y: 565, width: 170, height: 28 },
      { x: 810, y: 565, width: 180, height: 28 },
      { x: 990, y: 565, width: 180, height: 28 },
      { x: 1170, y: 565, width: 180, height: 28 },
      { x: 1350, y: 565, width: 290, height: 36 },
    ],
    dangers: [
      { x: 285, y: 603, width: 28, height: 20 },
      { x: 930, y: 603, width: 28, height: 20 },
      { x: 1450, y: 603, width: 28, height: 20 },
    ],
    repairBlocks: [
      { id: "block-1", x: 92, y: 520 },
      { id: "block-2", x: 128, y: 520 },
      { id: "block-3", x: 218, y: 520 },
    ],
    bridges: [
      { id: "bridge-1", x: 250, y: 565, width: 110, height: 28, broken: true, requiresBlocks: 3 },
      {
        id: "bridge-2",
        x: 630,
        y: 565,
        width: 160,
        height: 24,
        broken: false,
        unsafeUntilEnemyDefeated: "ogre-1",
      },
    ],
    rocks: [{ id: "rock-1", x: 540, y: 530 }],
    enemies: [{ id: "ogre-1", bridgeId: "bridge-2", x: 710, y: 606 }],
    actionZones: [
      { id: "repair-zone", type: "repairBridge", x: 218, y: 490, width: 72, height: 75, used: false },
      { id: "rock-zone", type: "pickupRock", x: 505, y: 485, width: 75, height: 80, used: false },
      { id: "drop-zone", type: "dropRock", x: 660, y: 490, width: 105, height: 85, used: false },
      { id: "exit-zone", type: "enterExit", x: 1540, y: 465, width: 90, height: 100, used: false },
    ],
    checkpoints: [
      { id: "start", x: 55, y: 530 },
      { id: "after-bridge-1", x: 400, y: 530 },
      { id: "before-bridge-2", x: 600, y: 530 },
    ],
    exit: { x: 1585, y: 525 },
  },
];
