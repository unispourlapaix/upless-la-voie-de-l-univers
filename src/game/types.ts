export type ActionType =
  | "repairBridge"
  | "pickupRock"
  | "dropRock"
  | "enterExit"
  | "autoJump";

export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };

export type ActionZone = Rect & {
  id: string;
  type: ActionType;
  used: boolean;
};

export type GameObjectType =
  | "platform"
  | "danger"
  | "brokenBridge"
  | "repairBlock"
  | "rock"
  | "enemy"
  | "exit"
  | "checkpoint"
  | "movingPlatform"
  | "door"
  | "key"
  | "switch"
  | "spring"
  | "fallingBlock"
  | "portal";

export type BridgeDefinition = Rect & {
  id: string;
  broken: boolean;
  requiresBlocks?: number;
  unsafeUntilEnemyDefeated?: string;
};

export type LevelDefinition = {
  id: number;
  name: string;
  worldWidth: number;
  worldHeight: number;
  playerStart: Point;
  platforms: Rect[];
  dangers: Rect[];
  repairBlocks: (Point & { id: string })[];
  bridges: BridgeDefinition[];
  rocks: (Point & { id: string })[];
  enemies: (Point & { id: string; bridgeId: string })[];
  actionZones: ActionZone[];
  checkpoints: (Point & { id: string })[];
  flowers?: (Point & { id: string })[];
  secretPlatform?: Rect;
  window?: Point;
  ladderTop?: Point;
  exit: Point;
};

export type SaveData = {
  unlockedLevel: number;
  lastLevel: number;
  vibration: boolean;
  sound: boolean;
  language: Language;
};

export type Language = "fr" | "en";

export const defaultSave: SaveData = {
  unlockedLevel: 1,
  lastLevel: 1,
  vibration: true,
  sound: true,
  language: "fr",
};

export function loadSave(): SaveData {
  try {
    return { ...defaultSave, ...JSON.parse(localStorage.getItem("upless-save") ?? "{}") };
  } catch {
    return { ...defaultSave };
  }
}

export function writeSave(save: SaveData): void {
  localStorage.setItem("upless-save", JSON.stringify(save));
}
