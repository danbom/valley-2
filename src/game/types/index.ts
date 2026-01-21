// ===== 기본 타입 =====
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type Weather = 'sunny' | 'rainy' | 'stormy';
export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ===== 시간 시스템 =====
export interface GameTime {
  hour: number;        // 6-26 (26 = 새벽 2시)
  minute: number;      // 0-59
  day: number;         // 1-28
  season: Season;
  year: number;
  weather: Weather;
}

// ===== 플레이어 =====
export interface PlayerState {
  position: Position;
  velocity: Position;  // 현재 속도 (부드러운 움직임용)
  direction: Direction;
  isMoving: boolean;
  animationFrame: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  name: string;
}

// ===== 타일 시스템 =====
export type TileType =
  | 'grass'
  | 'dirt'
  | 'tilled'
  | 'watered'
  | 'water'
  | 'sand'
  | 'wood_floor'
  | 'stone_floor'
  | 'fence'
  | 'tree'
  | 'rock'
  | 'bush'
  | 'house'
  | 'bed'
  | 'shipping_bin'
  | 'shop_counter';

export interface Tile {
  type: TileType;
  walkable: boolean;
  interactable: boolean;
  variant?: number;
}

export interface FarmTile {
  x: number;
  y: number;
  type: 'grass' | 'dirt' | 'tilled' | 'watered';
  crop: CropInstance | null;
  isWatered: boolean;
  fertilizer: FertilizerType | null;
}

// ===== 작물 시스템 =====
export type FertilizerType = 'basic' | 'quality' | 'speed';
export type CropQuality = 'normal' | 'silver' | 'gold' | 'iridium';

export interface CropData {
  id: string;
  name: string;
  nameKo: string;
  seasons: Season[];
  growthStages: number[];  // 각 단계별 일수
  totalDays: number;
  sellPrice: number;
  seedPrice: number;
  regrows: boolean;
  regrowDays?: number;
  harvestMin: number;
  harvestMax: number;
}

export interface CropInstance {
  cropId: string;
  currentStage: number;
  daysSinceLastWater: number;
  daysInCurrentStage: number;
  quality: CropQuality;
  fullyGrown: boolean;
  daysSinceHarvest?: number;
}

// ===== 아이템 시스템 =====
export type ItemCategory =
  | 'tool'
  | 'seed'
  | 'crop'
  | 'resource'
  | 'crafted'
  | 'food'
  | 'fertilizer'
  | 'misc';

export interface ItemData {
  id: string;
  name: string;
  nameKo: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  description: string;
  edible?: boolean;
  energyRestore?: number;
}

export interface InventorySlot {
  itemId: string | null;
  quantity: number;
  quality?: CropQuality;
}

// ===== 도구 시스템 =====
export type ToolType = 'hoe' | 'wateringCan' | 'axe' | 'pickaxe' | 'scythe';
export type ToolLevel = 'basic' | 'copper' | 'iron' | 'gold' | 'iridium';

export interface ToolData {
  id: string;
  name: string;
  nameKo: string;
  type: ToolType;
  level: ToolLevel;
  energyCost: number;
  range: number;
}

// ===== NPC 시스템 =====
export type GiftReaction = 'love' | 'like' | 'neutral' | 'dislike' | 'hate';

export interface NPCData {
  id: string;
  name: string;
  nameKo: string;
  defaultPosition: Position;
  isShopkeeper: boolean;
  dialogues: {
    greeting: string[];
    random: string[];
    heartLevel: { [key: number]: string[] };
  };
  giftPreferences: {
    love: string[];
    like: string[];
    dislike: string[];
    hate: string[];
  };
  schedule: ScheduleEntry[];
}

export interface ScheduleEntry {
  time: number;       // 시간 (6-26)
  position: Position;
  day?: number;       // 특정 요일 (1-7)
  season?: Season;    // 특정 계절
}

export interface NPCState {
  id: string;
  position: Position;
  direction: Direction;
  hearts: number;     // 0-1000 (100 = 1 heart)
  talkedToday: boolean;
  giftedToday: boolean;
  giftsThisWeek: number;
}

// ===== 상점 시스템 =====
export interface ShopItem {
  itemId: string;
  price: number;
  stock: number;      // -1 = 무한
  season?: Season;
}

// ===== 맵 시스템 =====
export interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: Tile[][];
  farmTiles?: FarmTile[][];
  objects: MapObject[];
  npcs: string[];
  connections: MapConnection[];
}

export interface MapObject {
  id: string;
  type: string;
  position: Position;
  size: Size;
  interactable: boolean;
  data?: Record<string, unknown>;
}

export interface MapConnection {
  fromPosition: Position;
  toMap: string;
  toPosition: Position;
}

// ===== 저장 시스템 =====
export interface SaveData {
  version: string;
  playerName: string;
  player: PlayerState;
  time: GameTime;
  inventory: InventorySlot[];
  hotbarSelection: number;
  farmTiles: FarmTile[][];
  shippingBin: InventorySlot[];
  npcs: NPCState[];
  flags: Record<string, boolean>;
  statistics: GameStatistics;
}

export interface GameStatistics {
  totalEarnings: number;
  cropsHarvested: number;
  daysFarmed: number;
  stepsWalked: number;
}

// ===== UI 상태 =====
export type UIScreen =
  | 'none'
  | 'inventory'
  | 'shop'
  | 'dialogue'
  | 'menu'
  | 'sleep'
  | 'shipping';

export interface DialogueState {
  npcId: string;
  text: string;
  options?: DialogueOption[];
}

export interface DialogueOption {
  text: string;
  action: () => void;
}

// ===== 게임 상태 =====
export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  currentMap: string;
  activeUI: UIScreen;
  dialogue: DialogueState | null;
}

// ===== 입력 시스템 =====
export interface InputState {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    worldX: number;
    worldY: number;
    pressed: boolean;
    justClicked: boolean;
  };
}

// ===== 카메라 =====
export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
}

// ===== 스프라이트 캐시 =====
export interface SpriteCache {
  [key: string]: HTMLCanvasElement;
}
