import {
  SaveData,
  PlayerState,
  GameTime,
  InventorySlot,
  FarmTile,
  NPCState,
  GameStatistics
} from '@/game/types';
import { saveToStorage, loadFromStorage, removeFromStorage } from '@/utils/helpers';

// 저장 키
const SAVE_KEY = 'valley_save';
const SAVE_VERSION = '1.0.0';

// 기본 통계
export function createInitialStatistics(): GameStatistics {
  return {
    totalEarnings: 0,
    cropsHarvested: 0,
    daysFarmed: 0,
    stepsWalked: 0,
  };
}

// 저장 데이터 생성
export function createSaveData(
  playerName: string,
  player: PlayerState,
  time: GameTime,
  inventory: InventorySlot[],
  hotbarSelection: number,
  farmTiles: FarmTile[][],
  shippingBin: InventorySlot[],
  npcs: NPCState[],
  flags: Record<string, boolean>,
  statistics: GameStatistics
): SaveData {
  return {
    version: SAVE_VERSION,
    playerName,
    player,
    time,
    inventory,
    hotbarSelection,
    farmTiles,
    shippingBin,
    npcs,
    flags,
    statistics,
  };
}

// 게임 저장
export function saveGame(saveData: SaveData): boolean {
  try {
    // 데이터 유효성 검사
    if (!validateSaveData(saveData)) {
      console.error('Invalid save data');
      return false;
    }

    saveToStorage(SAVE_KEY, saveData);
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// 게임 불러오기
export function loadGame(): SaveData | null {
  try {
    const data = loadFromStorage<SaveData>(SAVE_KEY);

    if (!data) {
      console.log('No save data found');
      return null;
    }

    // 버전 체크 및 마이그레이션
    if (data.version !== SAVE_VERSION) {
      const migrated = migrateSaveData(data);
      if (!migrated) {
        console.error('Failed to migrate save data');
        return null;
      }
      return migrated;
    }

    // 유효성 검사
    if (!validateSaveData(data)) {
      console.error('Corrupted save data');
      return null;
    }

    console.log('Game loaded successfully');
    return data;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

// 저장 데이터 삭제
export function deleteSave(): boolean {
  try {
    removeFromStorage(SAVE_KEY);
    console.log('Save data deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// 저장 데이터 존재 여부 확인
export function hasSaveData(): boolean {
  const data = loadFromStorage<SaveData>(SAVE_KEY);
  return data !== null;
}

// 저장 데이터 유효성 검사
function validateSaveData(data: SaveData): boolean {
  if (!data) return false;
  if (typeof data.version !== 'string') return false;
  if (typeof data.playerName !== 'string') return false;
  if (!data.player) return false;
  if (!data.time) return false;
  if (!Array.isArray(data.inventory)) return false;
  if (!Array.isArray(data.farmTiles)) return false;

  // 플레이어 상태 검증
  if (typeof data.player.position?.x !== 'number') return false;
  if (typeof data.player.position?.y !== 'number') return false;
  if (typeof data.player.energy !== 'number') return false;
  if (typeof data.player.gold !== 'number') return false;

  // 시간 검증
  if (typeof data.time.hour !== 'number') return false;
  if (typeof data.time.day !== 'number') return false;
  if (typeof data.time.season !== 'string') return false;

  return true;
}

// 버전 마이그레이션
function migrateSaveData(data: SaveData): SaveData | null {
  // 향후 버전 업데이트 시 마이그레이션 로직 추가
  // 현재는 단순히 버전만 업데이트

  const migrated = {
    ...data,
    version: SAVE_VERSION,
  };

  // 누락된 필드 기본값 설정
  if (!migrated.statistics) {
    migrated.statistics = createInitialStatistics();
  }

  if (!migrated.flags) {
    migrated.flags = {};
  }

  if (!migrated.shippingBin) {
    migrated.shippingBin = [];
  }

  return migrated;
}

// 자동 저장 (선택적)
let autoSaveInterval: NodeJS.Timeout | null = null;

export function startAutoSave(getSaveData: () => SaveData, intervalMs: number = 300000): void {
  // 기본 5분마다 자동 저장
  stopAutoSave();

  autoSaveInterval = setInterval(() => {
    const data = getSaveData();
    saveGame(data);
  }, intervalMs);
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// 저장 슬롯 관련 (멀티 슬롯 지원 시)
export function getSaveSlotKey(slot: number): string {
  return `${SAVE_KEY}_slot_${slot}`;
}

export function saveToSlot(slot: number, saveData: SaveData): boolean {
  try {
    saveToStorage(getSaveSlotKey(slot), saveData);
    return true;
  } catch {
    return false;
  }
}

export function loadFromSlot(slot: number): SaveData | null {
  return loadFromStorage<SaveData>(getSaveSlotKey(slot));
}

export function deleteSlot(slot: number): boolean {
  try {
    removeFromStorage(getSaveSlotKey(slot));
    return true;
  } catch {
    return false;
  }
}

// 저장 슬롯 목록 (간단한 메타데이터)
export interface SaveSlotMeta {
  slot: number;
  playerName: string;
  day: number;
  season: string;
  year: number;
  lastSaved: number; // timestamp
}

export function getSaveSlotMeta(slot: number): SaveSlotMeta | null {
  const data = loadFromSlot(slot);
  if (!data) return null;

  return {
    slot,
    playerName: data.playerName,
    day: data.time.day,
    season: data.time.season,
    year: data.time.year,
    lastSaved: Date.now(), // 실제 구현 시 저장 시간 기록 필요
  };
}

// 모든 저장 슬롯 메타데이터 가져오기
export function getAllSaveSlotMeta(maxSlots: number = 3): (SaveSlotMeta | null)[] {
  const metas: (SaveSlotMeta | null)[] = [];
  for (let i = 0; i < maxSlots; i++) {
    metas.push(getSaveSlotMeta(i));
  }
  return metas;
}
