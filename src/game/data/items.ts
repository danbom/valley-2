import { ItemData, ItemCategory } from '@/game/types';
import { CROP_DATA } from './crops';

// 기본 아이템 데이터
export const ITEM_DATA: Record<string, ItemData> = {
  // === 도구 ===
  tool_hoe: {
    id: 'tool_hoe',
    name: 'Hoe',
    nameKo: '괭이',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    sellPrice: 0,
    description: '땅을 경작할 수 있습니다.',
  },
  tool_wateringCan: {
    id: 'tool_wateringCan',
    name: 'Watering Can',
    nameKo: '물뿌리개',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    sellPrice: 0,
    description: '작물에 물을 줄 수 있습니다.',
  },
  tool_axe: {
    id: 'tool_axe',
    name: 'Axe',
    nameKo: '도끼',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    sellPrice: 0,
    description: '나무를 벨 수 있습니다.',
  },
  tool_pickaxe: {
    id: 'tool_pickaxe',
    name: 'Pickaxe',
    nameKo: '곡괭이',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    sellPrice: 0,
    description: '돌을 부술 수 있습니다.',
  },
  tool_scythe: {
    id: 'tool_scythe',
    name: 'Scythe',
    nameKo: '낫',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    sellPrice: 0,
    description: '풀을 베고 작물을 수확할 수 있습니다.',
  },

  // === 자원 ===
  wood: {
    id: 'wood',
    name: 'Wood',
    nameKo: '나무',
    category: 'resource',
    stackable: true,
    maxStack: 999,
    sellPrice: 2,
    description: '나무를 베서 얻은 목재입니다.',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    nameKo: '돌',
    category: 'resource',
    stackable: true,
    maxStack: 999,
    sellPrice: 2,
    description: '돌을 부숴서 얻은 자원입니다.',
  },
  fiber: {
    id: 'fiber',
    name: 'Fiber',
    nameKo: '섬유',
    category: 'resource',
    stackable: true,
    maxStack: 999,
    sellPrice: 1,
    description: '풀을 베서 얻은 섬유입니다.',
  },

  // === 비료 ===
  basic_fertilizer: {
    id: 'basic_fertilizer',
    name: 'Basic Fertilizer',
    nameKo: '기본 비료',
    category: 'fertilizer',
    stackable: true,
    maxStack: 999,
    sellPrice: 2,
    description: '품질 좋은 작물이 자랄 확률이 증가합니다.',
  },

  // === 음식 ===
  bread: {
    id: 'bread',
    name: 'Bread',
    nameKo: '빵',
    category: 'food',
    stackable: true,
    maxStack: 999,
    sellPrice: 60,
    description: '간단하지만 영양가 있는 음식입니다.',
    edible: true,
    energyRestore: 50,
  },
  salad: {
    id: 'salad',
    name: 'Salad',
    nameKo: '샐러드',
    category: 'food',
    stackable: true,
    maxStack: 999,
    sellPrice: 110,
    description: '신선한 채소로 만든 샐러드입니다.',
    edible: true,
    energyRestore: 113,
  },
};

// 작물과 씨앗 아이템 자동 생성
function generateCropItems(): Record<string, ItemData> {
  const items: Record<string, ItemData> = {};

  for (const [cropId, cropData] of Object.entries(CROP_DATA)) {
    // 작물 아이템
    items[cropId] = {
      id: cropId,
      name: cropData.name,
      nameKo: cropData.nameKo,
      category: 'crop',
      stackable: true,
      maxStack: 999,
      sellPrice: cropData.sellPrice,
      description: `${cropData.nameKo}입니다.`,
      edible: true,
      energyRestore: Math.floor(cropData.sellPrice / 5),
    };

    // 씨앗 아이템
    const seedId = `${cropId}_seeds`;
    items[seedId] = {
      id: seedId,
      name: `${cropData.name} Seeds`,
      nameKo: `${cropData.nameKo} 씨앗`,
      category: 'seed',
      stackable: true,
      maxStack: 999,
      sellPrice: Math.floor(cropData.seedPrice / 2),
      description: `${cropData.nameKo}를 키울 수 있는 씨앗입니다. ${cropData.seasons.map(s => {
        const seasonNames: Record<string, string> = { spring: '봄', summer: '여름', fall: '가을', winter: '겨울' };
        return seasonNames[s];
      }).join(', ')}에 심을 수 있습니다.`,
    };
  }

  return items;
}

// 모든 아이템 데이터 (기본 + 작물/씨앗)
export const ALL_ITEMS: Record<string, ItemData> = {
  ...ITEM_DATA,
  ...generateCropItems(),
};

// 아이템 데이터 가져오기
export function getItemData(itemId: string): ItemData | undefined {
  return ALL_ITEMS[itemId];
}

// 카테고리별 아이템 가져오기
export function getItemsByCategory(category: ItemCategory): ItemData[] {
  return Object.values(ALL_ITEMS).filter((item) => item.category === category);
}

// 아이템이 도구인지 확인
export function isTool(itemId: string): boolean {
  return itemId.startsWith('tool_');
}

// 아이템이 씨앗인지 확인
export function isSeed(itemId: string): boolean {
  return itemId.endsWith('_seeds');
}

// 아이템이 먹을 수 있는지 확인
export function isEdible(itemId: string): boolean {
  const item = ALL_ITEMS[itemId];
  return item?.edible === true;
}

// 아이템의 에너지 회복량 가져오기
export function getEnergyRestore(itemId: string): number {
  const item = ALL_ITEMS[itemId];
  return item?.energyRestore || 0;
}

// 판매 가격 가져오기 (품질 보너스 포함)
export function getSellPrice(itemId: string, quality: string = 'normal'): number {
  const item = ALL_ITEMS[itemId];
  if (!item) return 0;

  const qualityMultipliers: Record<string, number> = {
    normal: 1,
    silver: 1.25,
    gold: 1.5,
    iridium: 2,
  };

  return Math.floor(item.sellPrice * (qualityMultipliers[quality] || 1));
}

// 최대 스택 수 가져오기
export function getMaxStack(itemId: string): number {
  const item = ALL_ITEMS[itemId];
  return item?.maxStack || 1;
}
