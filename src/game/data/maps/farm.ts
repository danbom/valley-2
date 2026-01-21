import { TileType, FarmTile, MapObject, Position } from '@/game/types';

// 농장 맵 크기 (스타듀밸리 표준 농장 기준으로 축소)
export const FARM_WIDTH = 40;
export const FARM_HEIGHT = 30;
export const TILE_SIZE = 32;

// 농장 기본 타일맵 생성
export function createFarmTileMap(): TileType[][] {
  const tiles: TileType[][] = [];

  for (let y = 0; y < FARM_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < FARM_WIDTH; x++) {
      tiles[y][x] = getTileTypeForPosition(x, y);
    }
  }

  return tiles;
}

// 위치에 따른 타일 타입 결정
function getTileTypeForPosition(x: number, y: number): TileType {
  // 경계 (물/연못)
  if (x === 0 || x === FARM_WIDTH - 1 || y === 0 || y === FARM_HEIGHT - 1) {
    return 'water';
  }

  // 집 영역 (좌측 상단)
  if (x >= 2 && x <= 7 && y >= 2 && y <= 6) {
    if (x >= 3 && x <= 6 && y >= 3 && y <= 5) {
      return 'wood_floor'; // 집 내부
    }
    return 'house'; // 집 외벽
  }

  // 집 앞 길
  if (y === 7 && x >= 2 && x <= 10) {
    return 'dirt';
  }

  // 판매함 위치
  if (x >= 9 && x <= 10 && y >= 5 && y <= 6) {
    return 'shipping_bin';
  }

  // 연못 (우측 하단)
  if (x >= FARM_WIDTH - 8 && y >= FARM_HEIGHT - 8) {
    const distX = x - (FARM_WIDTH - 5);
    const distY = y - (FARM_HEIGHT - 5);
    if (distX * distX + distY * distY <= 9) {
      return 'water';
    }
  }

  // 울타리 (농장 중앙 경작지 주변)
  if ((x === 5 || x === 25) && y >= 10 && y <= 25) {
    return 'fence';
  }
  if ((y === 10 || y === 25) && x >= 5 && x <= 25) {
    return 'fence';
  }

  // 나무들 (랜덤하게 배치된 것처럼)
  const treePositions = [
    [30, 5], [32, 8], [35, 4], [33, 12], [36, 15],
    [28, 20], [31, 22], [34, 24], [3, 20], [2, 24],
  ];
  for (const [tx, ty] of treePositions) {
    if (x === tx && y === ty) {
      return 'tree';
    }
  }

  // 바위들
  const rockPositions = [
    [15, 8], [20, 9], [12, 20], [22, 18],
  ];
  for (const [rx, ry] of rockPositions) {
    if (x === rx && y === ry) {
      return 'rock';
    }
  }

  // 나머지는 풀밭
  return 'grass';
}

// 농장 타일 (작물 심을 수 있는) 생성
export function createFarmTiles(): FarmTile[][] {
  const farmTiles: FarmTile[][] = [];

  for (let y = 0; y < FARM_HEIGHT; y++) {
    farmTiles[y] = [];
    for (let x = 0; x < FARM_WIDTH; x++) {
      farmTiles[y][x] = {
        x,
        y,
        type: 'grass',
        crop: null,
        isWatered: false,
        fertilizer: null,
      };
    }
  }

  return farmTiles;
}

// 플레이어 시작 위치
export const PLAYER_START_POSITION: Position = {
  x: 5 * TILE_SIZE + TILE_SIZE / 2,
  y: 8 * TILE_SIZE + TILE_SIZE / 2,
};

// 침대 위치
export const BED_POSITION: Position = {
  x: 4,
  y: 4,
};

// 판매함 위치
export const SHIPPING_BIN_POSITION: Position = {
  x: 9,
  y: 5,
};

// 상점 NPC 위치 (농장 입구 근처)
export const SHOP_POSITION: Position = {
  x: 12,
  y: 3,
};

// 맵 오브젝트 생성
export function createMapObjects(): MapObject[] {
  return [
    {
      id: 'house',
      type: 'building',
      position: { x: 2, y: 2 },
      size: { width: 6, height: 5 },
      interactable: true,
      data: { buildingType: 'house' },
    },
    {
      id: 'shipping_bin',
      type: 'shipping_bin',
      position: SHIPPING_BIN_POSITION,
      size: { width: 2, height: 2 },
      interactable: true,
    },
    {
      id: 'shop_sign',
      type: 'sign',
      position: SHOP_POSITION,
      size: { width: 1, height: 1 },
      interactable: true,
      data: { text: '피에르 상점' },
    },
  ];
}

// 경작 가능 영역 확인
export function isInFarmableArea(x: number, y: number): boolean {
  // 울타리 내부 영역
  if (x > 5 && x < 25 && y > 10 && y < 25) {
    return true;
  }
  // 집 앞 공터
  if (x >= 2 && x <= 25 && y >= 8 && y <= 9) {
    return true;
  }
  return false;
}

// 타일이 걸을 수 있는지 확인
export function isTileWalkable(tiles: TileType[][], x: number, y: number): boolean {
  if (x < 0 || x >= FARM_WIDTH || y < 0 || y >= FARM_HEIGHT) {
    return false;
  }

  const tileType = tiles[y][x];
  const nonWalkable: TileType[] = ['water', 'tree', 'rock', 'fence', 'house', 'shipping_bin'];

  return !nonWalkable.includes(tileType);
}

// 특정 위치의 상호작용 가능한 오브젝트 타입 가져오기
export function getInteractableAt(tiles: TileType[][], x: number, y: number): TileType | null {
  if (x < 0 || x >= FARM_WIDTH || y < 0 || y >= FARM_HEIGHT) {
    return null;
  }

  const tileType = tiles[y][x];
  const interactable: TileType[] = ['bed', 'shipping_bin', 'shop_counter', 'tree', 'rock'];

  return interactable.includes(tileType) ? tileType : null;
}
