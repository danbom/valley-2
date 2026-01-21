import { Position, Direction, Season, CropQuality, GameTime, TimeOfDay } from '@/game/types';

// ===== 위치/거리 계산 =====
export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function positionEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

// ===== 방향 계산 =====
export function getDirectionVector(direction: Direction): Position {
  const vectors: Record<Direction, Position> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  return vectors[direction];
}

export function getFacingTile(position: Position, direction: Direction): Position {
  const vector = getDirectionVector(direction);
  return {
    x: Math.floor(position.x / 32) + vector.x,
    y: Math.floor(position.y / 32) + vector.y,
  };
}

export function getDirectionFromKey(key: string): Direction | null {
  const keyMap: Record<string, Direction> = {
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'w': 'up',
    's': 'down',
    'a': 'left',
    'd': 'right',
    'W': 'up',
    'S': 'down',
    'A': 'left',
    'D': 'right',
  };
  return keyMap[key] || null;
}

// ===== 시간 관련 =====
export function formatTime(hour: number, minute: number): string {
  const displayHour = hour > 24 ? hour - 24 : hour;
  const ampm = hour >= 12 && hour < 24 ? 'PM' : 'AM';
  const formattedHour = displayHour > 12 ? displayHour - 12 : displayHour;
  const displayHourFinal = formattedHour === 0 ? 12 : formattedHour;
  return `${displayHourFinal}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export function getSeasonName(season: Season): string {
  const names: Record<Season, string> = {
    spring: '봄',
    summer: '여름',
    fall: '가을',
    winter: '겨울',
  };
  return names[season];
}

export function getWeekday(day: number): string {
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
  return weekdays[(day - 1) % 7];
}

export function formatDate(time: GameTime): string {
  return `${getSeasonName(time.season)} ${time.day}일 (${getWeekday(time.day)})`;
}

// ===== 품질 관련 =====
export function getQualityMultiplier(quality: CropQuality): number {
  const multipliers: Record<CropQuality, number> = {
    normal: 1.0,
    silver: 1.25,
    gold: 1.5,
    iridium: 2.0,
  };
  return multipliers[quality];
}

export function calculateCropQuality(farmingLevel: number, hasFertilizer: boolean): CropQuality {
  const rand = Math.random();
  const bonus = hasFertilizer ? 0.1 : 0;
  const levelBonus = farmingLevel * 0.02;
  const totalBonus = bonus + levelBonus;

  if (rand < 0.01 + totalBonus * 0.5) return 'iridium';
  if (rand < 0.1 + totalBonus) return 'gold';
  if (rand < 0.25 + totalBonus * 2) return 'silver';
  return 'normal';
}

// ===== 랜덤 =====
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ===== 골드 포맷 =====
export function formatGold(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
}

// ===== 타일 좌표 변환 =====
export function worldToTile(worldX: number, worldY: number, tileSize: number = 32): Position {
  return {
    x: Math.floor(worldX / tileSize),
    y: Math.floor(worldY / tileSize),
  };
}

export function tileToWorld(tileX: number, tileY: number, tileSize: number = 32): Position {
  return {
    x: tileX * tileSize,
    y: tileY * tileSize,
  };
}

export function tileToWorldCenter(tileX: number, tileY: number, tileSize: number = 32): Position {
  return {
    x: tileX * tileSize + tileSize / 2,
    y: tileY * tileSize + tileSize / 2,
  };
}

// ===== 범위 체크 =====
export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// ===== 키 입력 체크 =====
export function isMovementKey(key: string): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(key);
}

export function isActionKey(key: string): boolean {
  return key === ' ' || key === 'Enter' || key === 'e' || key === 'E';
}

export function isNumberKey(key: string): number | null {
  const num = parseInt(key);
  if (num >= 1 && num <= 9) return num - 1;
  if (key === '0') return 9;
  return null;
}

// ===== 계절 체크 =====
export function canGrowInSeason(cropSeasons: Season[], currentSeason: Season): boolean {
  return cropSeasons.includes(currentSeason);
}

export function getNextSeason(season: Season): Season {
  const order: Season[] = ['spring', 'summer', 'fall', 'winter'];
  const index = order.indexOf(season);
  return order[(index + 1) % 4];
}

// ===== 날씨 확률 =====
export function getRandomWeather(season: Season): 'sunny' | 'rainy' {
  const rainChance: Record<Season, number> = {
    spring: 0.25,
    summer: 0.15,
    fall: 0.25,
    winter: 0.05,  // 겨울엔 눈이 오지만 간단히 rainy로 처리
  };
  return Math.random() < rainChance[season] ? 'rainy' : 'sunny';
}

// ===== 로컬 스토리지 =====
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.error('Failed to save to localStorage');
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    console.error('Failed to load from localStorage');
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.error('Failed to remove from localStorage');
  }
}
