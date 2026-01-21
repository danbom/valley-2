import { CropData, Season } from '@/game/types';

export const CROP_DATA: Record<string, CropData> = {
  parsnip: {
    id: 'parsnip',
    name: 'Parsnip',
    nameKo: '파스닙',
    seasons: ['spring'],
    growthStages: [1, 1, 1, 1], // 4일
    totalDays: 4,
    sellPrice: 35,
    seedPrice: 20,
    regrows: false,
    harvestMin: 1,
    harvestMax: 1,
  },
  cauliflower: {
    id: 'cauliflower',
    name: 'Cauliflower',
    nameKo: '콜리플라워',
    seasons: ['spring'],
    growthStages: [1, 2, 4, 4, 1], // 12일
    totalDays: 12,
    sellPrice: 175,
    seedPrice: 80,
    regrows: false,
    harvestMin: 1,
    harvestMax: 1,
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    nameKo: '감자',
    seasons: ['spring'],
    growthStages: [1, 1, 1, 2, 1], // 6일
    totalDays: 6,
    sellPrice: 80,
    seedPrice: 50,
    regrows: false,
    harvestMin: 1,
    harvestMax: 3,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    nameKo: '딸기',
    seasons: ['spring'],
    growthStages: [1, 1, 2, 2, 2], // 8일
    totalDays: 8,
    sellPrice: 120,
    seedPrice: 100,
    regrows: true,
    regrowDays: 4,
    harvestMin: 1,
    harvestMax: 1,
  },
  melon: {
    id: 'melon',
    name: 'Melon',
    nameKo: '멜론',
    seasons: ['summer'],
    growthStages: [1, 2, 3, 3, 3], // 12일
    totalDays: 12,
    sellPrice: 250,
    seedPrice: 80,
    regrows: false,
    harvestMin: 1,
    harvestMax: 1,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    nameKo: '토마토',
    seasons: ['summer'],
    growthStages: [2, 2, 2, 2, 3], // 11일
    totalDays: 11,
    sellPrice: 60,
    seedPrice: 50,
    regrows: true,
    regrowDays: 4,
    harvestMin: 1,
    harvestMax: 1,
  },
  corn: {
    id: 'corn',
    name: 'Corn',
    nameKo: '옥수수',
    seasons: ['summer', 'fall'],
    growthStages: [2, 3, 3, 3, 3], // 14일
    totalDays: 14,
    sellPrice: 50,
    seedPrice: 150,
    regrows: true,
    regrowDays: 4,
    harvestMin: 1,
    harvestMax: 1,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    nameKo: '호박',
    seasons: ['fall'],
    growthStages: [1, 2, 3, 4, 3], // 13일
    totalDays: 13,
    sellPrice: 320,
    seedPrice: 100,
    regrows: false,
    harvestMin: 1,
    harvestMax: 1,
  },
  eggplant: {
    id: 'eggplant',
    name: 'Eggplant',
    nameKo: '가지',
    seasons: ['fall'],
    growthStages: [1, 1, 1, 1, 1], // 5일
    totalDays: 5,
    sellPrice: 60,
    seedPrice: 20,
    regrows: true,
    regrowDays: 5,
    harvestMin: 1,
    harvestMax: 1,
  },
  cranberry: {
    id: 'cranberry',
    name: 'Cranberry',
    nameKo: '크랜베리',
    seasons: ['fall'],
    growthStages: [1, 2, 1, 1, 2], // 7일
    totalDays: 7,
    sellPrice: 75,
    seedPrice: 240,
    regrows: true,
    regrowDays: 5,
    harvestMin: 2,
    harvestMax: 2,
  },
};

// 계절별 작물 가져오기
export function getCropsBySeason(season: Season): CropData[] {
  return Object.values(CROP_DATA).filter((crop) =>
    crop.seasons.includes(season)
  );
}

// 작물 데이터 가져오기
export function getCropData(cropId: string): CropData | undefined {
  return CROP_DATA[cropId];
}

// 씨앗 ID로 작물 ID 가져오기
export function getCropIdFromSeedId(seedId: string): string | null {
  const cropId = seedId.replace('_seeds', '');
  return CROP_DATA[cropId] ? cropId : null;
}

// 작물 ID로 씨앗 ID 가져오기
export function getSeedIdFromCropId(cropId: string): string {
  return `${cropId}_seeds`;
}

// 성장 단계 총 개수
export function getTotalGrowthStages(cropId: string): number {
  const crop = CROP_DATA[cropId];
  return crop ? crop.growthStages.length : 0;
}

// 특정 일수에 해당하는 성장 단계 계산
export function getGrowthStageForDay(cropId: string, daysGrown: number): number {
  const crop = CROP_DATA[cropId];
  if (!crop) return 0;

  let accumulatedDays = 0;
  for (let stage = 0; stage < crop.growthStages.length; stage++) {
    accumulatedDays += crop.growthStages[stage];
    if (daysGrown < accumulatedDays) {
      return stage;
    }
  }
  return crop.growthStages.length; // 완전 성장
}
