import { FarmTile, CropInstance, Season, CropQuality, TileType } from '@/game/types';
import { CROP_DATA, getCropData, getGrowthStageForDay } from '@/game/data/crops';
import { calculateCropQuality, randomInt } from '@/utils/helpers';
import { isTillable } from '@/game/data/maps/tiles';

// 땅 경작 (괭이 사용)
export function tillSoil(
  farmTiles: FarmTile[][],
  baseTiles: TileType[][],
  x: number,
  y: number
): { success: boolean; farmTiles: FarmTile[][] } {
  // 범위 체크
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles };
  }

  const tile = farmTiles[y][x];
  const baseTile = baseTiles[y]?.[x];

  // 이미 경작된 땅이거나 경작 불가능한 타일
  if (tile.type !== 'grass' && tile.type !== 'dirt') {
    return { success: false, farmTiles };
  }

  // 기본 타일이 경작 불가능
  if (baseTile && !isTillable(baseTile)) {
    return { success: false, farmTiles };
  }

  // 작물이 이미 있으면 경작 불가
  if (tile.crop) {
    return { success: false, farmTiles };
  }

  // 경작
  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];
  newFarmTiles[y][x] = {
    ...tile,
    type: 'tilled',
    isWatered: false,
  };

  return { success: true, farmTiles: newFarmTiles };
}

// 물주기 (물뿌리개 사용)
export function waterTile(
  farmTiles: FarmTile[][],
  x: number,
  y: number
): { success: boolean; farmTiles: FarmTile[][] } {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles };
  }

  const tile = farmTiles[y][x];

  // 경작된 땅만 물 줄 수 있음
  if (tile.type !== 'tilled' && tile.type !== 'watered') {
    return { success: false, farmTiles };
  }

  // 이미 물 줌
  if (tile.isWatered) {
    return { success: false, farmTiles };
  }

  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];
  newFarmTiles[y][x] = {
    ...tile,
    type: 'watered',
    isWatered: true,
  };

  return { success: true, farmTiles: newFarmTiles };
}

// 씨앗 심기
export function plantSeed(
  farmTiles: FarmTile[][],
  x: number,
  y: number,
  seedId: string,
  currentSeason: Season
): { success: boolean; farmTiles: FarmTile[][]; message?: string } {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles, message: '유효하지 않은 위치입니다.' };
  }

  const tile = farmTiles[y][x];

  // 경작된 땅만
  if (tile.type !== 'tilled' && tile.type !== 'watered') {
    return { success: false, farmTiles, message: '먼저 땅을 경작해야 합니다.' };
  }

  // 이미 작물이 있음
  if (tile.crop) {
    return { success: false, farmTiles, message: '이미 작물이 심어져 있습니다.' };
  }

  // 씨앗에서 작물 ID 추출
  const cropId = seedId.replace('_seeds', '');
  const cropData = getCropData(cropId);

  if (!cropData) {
    return { success: false, farmTiles, message: '알 수 없는 씨앗입니다.' };
  }

  // 계절 체크
  if (!cropData.seasons.includes(currentSeason)) {
    return { success: false, farmTiles, message: `이 작물은 ${currentSeason}에 자랄 수 없습니다.` };
  }

  // 작물 인스턴스 생성
  const newCrop: CropInstance = {
    cropId,
    currentStage: 0,
    daysSinceLastWater: 0,
    daysInCurrentStage: 0,
    quality: 'normal',
    fullyGrown: false,
  };

  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];
  newFarmTiles[y][x] = {
    ...tile,
    crop: newCrop,
  };

  return { success: true, farmTiles: newFarmTiles };
}

// 하루가 지났을 때 작물 성장 처리
export function processDailyGrowth(
  farmTiles: FarmTile[][],
  currentSeason: Season,
  isRainy: boolean,
  farmingLevel: number = 0
): FarmTile[][] {
  const newFarmTiles: FarmTile[][] = [];

  for (let y = 0; y < farmTiles.length; y++) {
    newFarmTiles[y] = [];
    for (let x = 0; x < farmTiles[y].length; x++) {
      const tile = farmTiles[y][x];
      let newTile = { ...tile };

      // 비 오는 날 자동 물주기
      if (isRainy && (tile.type === 'tilled' || tile.type === 'watered')) {
        newTile.isWatered = true;
        newTile.type = 'watered';
      }

      // 작물이 있는 경우
      if (tile.crop) {
        const cropData = getCropData(tile.crop.cropId);

        if (cropData) {
          // 계절이 맞지 않으면 죽음
          if (!cropData.seasons.includes(currentSeason)) {
            newTile.crop = null;
          } else if (tile.isWatered && !tile.crop.fullyGrown) {
            // 물을 줬고 아직 성장 중이면 성장
            const newCrop = { ...tile.crop };
            newCrop.daysInCurrentStage += 1;

            // 성장 단계 확인
            const totalDays = newCrop.daysInCurrentStage;
            const newStage = getGrowthStageForDay(newCrop.cropId, totalDays);

            if (newStage > newCrop.currentStage) {
              newCrop.currentStage = newStage;
            }

            // 완전 성장 확인
            if (newCrop.currentStage >= cropData.growthStages.length) {
              newCrop.fullyGrown = true;
              newCrop.quality = calculateCropQuality(farmingLevel, tile.fertilizer !== null);
            }

            newTile.crop = newCrop;
          }
        }
      }

      // 물 상태 리셋 (다음 날)
      if (!isRainy) {
        newTile.isWatered = false;
        if (newTile.type === 'watered') {
          newTile.type = 'tilled';
        }
      }

      newFarmTiles[y][x] = newTile;
    }
  }

  return newFarmTiles;
}

// 수확
export function harvestCrop(
  farmTiles: FarmTile[][],
  x: number,
  y: number
): {
  success: boolean;
  farmTiles: FarmTile[][];
  harvest?: { itemId: string; quantity: number; quality: CropQuality };
} {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles };
  }

  const tile = farmTiles[y][x];

  if (!tile.crop || !tile.crop.fullyGrown) {
    return { success: false, farmTiles };
  }

  const cropData = getCropData(tile.crop.cropId);
  if (!cropData) {
    return { success: false, farmTiles };
  }

  // 수확량 계산
  const quantity = randomInt(cropData.harvestMin, cropData.harvestMax);
  const harvest = {
    itemId: tile.crop.cropId,
    quantity,
    quality: tile.crop.quality,
  };

  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];

  // 재수확 작물인지 확인
  if (cropData.regrows) {
    // 재수확 단계로 리셋
    const regrowStage = Math.max(0, cropData.growthStages.length - 2);
    newFarmTiles[y][x] = {
      ...tile,
      crop: {
        ...tile.crop,
        currentStage: regrowStage,
        fullyGrown: false,
        daysSinceHarvest: 0,
      },
    };
  } else {
    // 작물 제거
    newFarmTiles[y][x] = {
      ...tile,
      crop: null,
    };
  }

  return { success: true, farmTiles: newFarmTiles, harvest };
}

// 비료 사용
export function applyFertilizer(
  farmTiles: FarmTile[][],
  x: number,
  y: number,
  fertilizerType: 'basic' | 'quality' | 'speed'
): { success: boolean; farmTiles: FarmTile[][] } {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles };
  }

  const tile = farmTiles[y][x];

  // 경작된 땅에만 비료 사용 가능
  if (tile.type !== 'tilled' && tile.type !== 'watered') {
    return { success: false, farmTiles };
  }

  // 이미 비료가 있거나 작물이 있으면 불가
  if (tile.fertilizer || tile.crop) {
    return { success: false, farmTiles };
  }

  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];
  newFarmTiles[y][x] = {
    ...tile,
    fertilizer: fertilizerType,
  };

  return { success: true, farmTiles: newFarmTiles };
}

// 경작지 초기화 (낫 사용 등)
export function clearTile(
  farmTiles: FarmTile[][],
  x: number,
  y: number
): { success: boolean; farmTiles: FarmTile[][] } {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return { success: false, farmTiles };
  }

  const tile = farmTiles[y][x];

  // 작물이 있는 경우만 제거 가능
  if (!tile.crop) {
    return { success: false, farmTiles };
  }

  const newFarmTiles = [...farmTiles];
  newFarmTiles[y] = [...newFarmTiles[y]];
  newFarmTiles[y][x] = {
    ...tile,
    crop: null,
  };

  return { success: true, farmTiles: newFarmTiles };
}

// 타일 정보 가져오기
export function getFarmTileInfo(farmTiles: FarmTile[][], x: number, y: number): FarmTile | null {
  if (!farmTiles[y] || !farmTiles[y][x]) {
    return null;
  }
  return farmTiles[y][x];
}

// 경작 가능한지 확인
export function canTill(farmTiles: FarmTile[][], baseTiles: TileType[][], x: number, y: number): boolean {
  const tile = farmTiles[y]?.[x];
  const baseTile = baseTiles[y]?.[x];

  if (!tile || !baseTile) return false;
  if (tile.type !== 'grass' && tile.type !== 'dirt') return false;
  if (!isTillable(baseTile)) return false;
  if (tile.crop) return false;

  return true;
}

// 물 줄 수 있는지 확인
export function canWater(farmTiles: FarmTile[][], x: number, y: number): boolean {
  const tile = farmTiles[y]?.[x];
  if (!tile) return false;
  if (tile.type !== 'tilled' && tile.type !== 'watered') return false;
  if (tile.isWatered) return false;
  return true;
}

// 씨앗 심을 수 있는지 확인
export function canPlant(farmTiles: FarmTile[][], x: number, y: number): boolean {
  const tile = farmTiles[y]?.[x];
  if (!tile) return false;
  if (tile.type !== 'tilled' && tile.type !== 'watered') return false;
  if (tile.crop) return false;
  return true;
}

// 수확 가능한지 확인
export function canHarvest(farmTiles: FarmTile[][], x: number, y: number): boolean {
  const tile = farmTiles[y]?.[x];
  if (!tile) return false;
  if (!tile.crop) return false;
  if (!tile.crop.fullyGrown) return false;
  return true;
}
