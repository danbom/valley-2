import { Tile, TileType } from '@/game/types';

// 기본 타일 데이터
export const TILE_DEFINITIONS: Record<TileType, Tile> = {
  grass: {
    type: 'grass',
    walkable: true,
    interactable: false,
  },
  dirt: {
    type: 'dirt',
    walkable: true,
    interactable: false,
  },
  tilled: {
    type: 'tilled',
    walkable: true,
    interactable: true,
  },
  watered: {
    type: 'watered',
    walkable: true,
    interactable: true,
  },
  water: {
    type: 'water',
    walkable: false,
    interactable: true, // 낚시 가능
  },
  sand: {
    type: 'sand',
    walkable: true,
    interactable: false,
  },
  wood_floor: {
    type: 'wood_floor',
    walkable: true,
    interactable: false,
  },
  stone_floor: {
    type: 'stone_floor',
    walkable: true,
    interactable: false,
  },
  fence: {
    type: 'fence',
    walkable: false,
    interactable: false,
  },
  tree: {
    type: 'tree',
    walkable: false,
    interactable: true, // 도끼로 벨 수 있음
  },
  rock: {
    type: 'rock',
    walkable: false,
    interactable: true, // 곡괭이로 부술 수 있음
  },
  bush: {
    type: 'bush',
    walkable: false,
    interactable: false,
  },
  house: {
    type: 'house',
    walkable: false,
    interactable: true, // 문으로 들어갈 수 있음
  },
  bed: {
    type: 'bed',
    walkable: true,
    interactable: true, // 잠자기
  },
  shipping_bin: {
    type: 'shipping_bin',
    walkable: false,
    interactable: true, // 아이템 판매
  },
  shop_counter: {
    type: 'shop_counter',
    walkable: false,
    interactable: true, // 상점 이용
  },
};

// 타일이 걸을 수 있는지 확인
export function isWalkable(tileType: TileType): boolean {
  return TILE_DEFINITIONS[tileType]?.walkable ?? false;
}

// 타일이 상호작용 가능한지 확인
export function isInteractable(tileType: TileType): boolean {
  return TILE_DEFINITIONS[tileType]?.interactable ?? false;
}

// 타일이 경작 가능한지 확인
export function isTillable(tileType: TileType): boolean {
  return tileType === 'grass' || tileType === 'dirt';
}

// 타일에 씨앗을 심을 수 있는지 확인
export function isPlantable(tileType: TileType): boolean {
  return tileType === 'tilled' || tileType === 'watered';
}

// 타일 정의 가져오기
export function getTileDefinition(tileType: TileType): Tile {
  return TILE_DEFINITIONS[tileType] || TILE_DEFINITIONS.grass;
}
