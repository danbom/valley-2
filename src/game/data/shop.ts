import { ShopItem, Season } from '@/game/types';
import { CROP_DATA } from './crops';

// 상점 아이템 데이터
export interface ShopData {
  id: string;
  name: string;
  nameKo: string;
  items: ShopItem[];
}

// 피에르 상점 (씨앗 및 일반 용품)
export function getPierreShopItems(season: Season): ShopItem[] {
  const items: ShopItem[] = [];

  // 계절별 씨앗
  for (const [cropId, cropData] of Object.entries(CROP_DATA)) {
    if (cropData.seasons.includes(season)) {
      items.push({
        itemId: `${cropId}_seeds`,
        price: cropData.seedPrice,
        stock: -1, // 무한
        season,
      });
    }
  }

  // 항상 판매하는 아이템
  items.push(
    {
      itemId: 'basic_fertilizer',
      price: 100,
      stock: -1,
    },
    {
      itemId: 'bread',
      price: 120,
      stock: -1,
    },
    {
      itemId: 'salad',
      price: 220,
      stock: -1,
    }
  );

  return items;
}

// 상점 데이터
export const SHOP_DATA: Record<string, ShopData> = {
  pierre: {
    id: 'pierre',
    name: "Pierre's General Store",
    nameKo: '피에르 잡화점',
    items: [], // 계절에 따라 동적 생성
  },
};

// 특정 상점의 아이템 목록 가져오기
export function getShopItems(shopId: string, season: Season): ShopItem[] {
  switch (shopId) {
    case 'pierre':
      return getPierreShopItems(season);
    default:
      return [];
  }
}

// 아이템 구매 가능 여부 확인
export function canPurchase(shopItem: ShopItem, playerGold: number, currentSeason: Season): boolean {
  // 골드 확인
  if (playerGold < shopItem.price) {
    return false;
  }

  // 재고 확인
  if (shopItem.stock === 0) {
    return false;
  }

  // 계절 확인
  if (shopItem.season && shopItem.season !== currentSeason) {
    return false;
  }

  return true;
}

// 구매 후 재고 감소
export function decreaseStock(shopItem: ShopItem): void {
  if (shopItem.stock > 0) {
    shopItem.stock--;
  }
}

// 판매 가격 계산 (상점에 아이템 판매 시)
export function calculateSellPrice(basePrice: number, quality: string = 'normal'): number {
  const qualityMultipliers: Record<string, number> = {
    normal: 1,
    silver: 1.25,
    gold: 1.5,
    iridium: 2,
  };

  return Math.floor(basePrice * (qualityMultipliers[quality] || 1));
}

// 배낭 업그레이드 가격
export const BACKPACK_UPGRADE_PRICES = {
  large: 2000, // 24칸
  deluxe: 10000, // 36칸
};

// 업그레이드 가능 여부
export function canUpgradeBackpack(
  currentSlots: number,
  playerGold: number
): { canUpgrade: boolean; price: number; newSlots: number } {
  if (currentSlots === 12 && playerGold >= BACKPACK_UPGRADE_PRICES.large) {
    return { canUpgrade: true, price: BACKPACK_UPGRADE_PRICES.large, newSlots: 24 };
  }
  if (currentSlots === 24 && playerGold >= BACKPACK_UPGRADE_PRICES.deluxe) {
    return { canUpgrade: true, price: BACKPACK_UPGRADE_PRICES.deluxe, newSlots: 36 };
  }
  return { canUpgrade: false, price: 0, newSlots: currentSlots };
}
