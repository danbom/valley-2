import { InventorySlot, CropQuality } from '@/game/types';
import { getItemData, getMaxStack, isTool } from '@/game/data/items';

// 인벤토리 크기
export const HOTBAR_SIZE = 12;
export const INITIAL_INVENTORY_SIZE = 12;
export const MEDIUM_INVENTORY_SIZE = 24;
export const MAX_INVENTORY_SIZE = 36;

// 초기 인벤토리 생성
export function createInitialInventory(): InventorySlot[] {
  const inventory: InventorySlot[] = [];

  // 빈 슬롯들
  for (let i = 0; i < INITIAL_INVENTORY_SIZE; i++) {
    inventory.push({ itemId: null, quantity: 0 });
  }

  // 기본 도구 지급
  inventory[0] = { itemId: 'tool_hoe', quantity: 1 };
  inventory[1] = { itemId: 'tool_wateringCan', quantity: 1 };
  inventory[2] = { itemId: 'tool_axe', quantity: 1 };
  inventory[3] = { itemId: 'tool_pickaxe', quantity: 1 };
  inventory[4] = { itemId: 'tool_scythe', quantity: 1 };

  // 시작 씨앗
  inventory[5] = { itemId: 'parsnip_seeds', quantity: 15 };

  return inventory;
}

// 아이템 추가
export function addItem(
  inventory: InventorySlot[],
  itemId: string,
  quantity: number,
  quality?: CropQuality
): { success: boolean; inventory: InventorySlot[]; remaining: number } {
  const newInventory = [...inventory];
  let remaining = quantity;
  const maxStack = getMaxStack(itemId);
  const isToolItem = isTool(itemId);

  // 도구는 스택 불가
  if (isToolItem) {
    // 빈 슬롯 찾기
    const emptyIndex = newInventory.findIndex((slot) => !slot.itemId);
    if (emptyIndex !== -1) {
      newInventory[emptyIndex] = { itemId, quantity: 1 };
      return { success: true, inventory: newInventory, remaining: 0 };
    }
    return { success: false, inventory, remaining: quantity };
  }

  // 스택 가능한 아이템
  // 1. 기존 스택에 추가 시도 (같은 아이템 + 같은 품질)
  for (let i = 0; i < newInventory.length && remaining > 0; i++) {
    const slot = newInventory[i];
    if (slot.itemId === itemId && slot.quality === quality && slot.quantity < maxStack) {
      const spaceAvailable = maxStack - slot.quantity;
      const toAdd = Math.min(spaceAvailable, remaining);
      newInventory[i] = {
        ...slot,
        quantity: slot.quantity + toAdd,
      };
      remaining -= toAdd;
    }
  }

  // 2. 빈 슬롯에 새 스택 생성
  for (let i = 0; i < newInventory.length && remaining > 0; i++) {
    if (!newInventory[i].itemId) {
      const toAdd = Math.min(maxStack, remaining);
      newInventory[i] = {
        itemId,
        quantity: toAdd,
        quality,
      };
      remaining -= toAdd;
    }
  }

  return {
    success: remaining < quantity,
    inventory: newInventory,
    remaining,
  };
}

// 아이템 제거
export function removeItem(
  inventory: InventorySlot[],
  slotIndex: number,
  quantity: number
): { success: boolean; inventory: InventorySlot[]; removed: number } {
  if (slotIndex < 0 || slotIndex >= inventory.length) {
    return { success: false, inventory, removed: 0 };
  }

  const slot = inventory[slotIndex];
  if (!slot.itemId || slot.quantity < quantity) {
    return { success: false, inventory, removed: 0 };
  }

  const newInventory = [...inventory];
  const newQuantity = slot.quantity - quantity;

  if (newQuantity <= 0) {
    newInventory[slotIndex] = { itemId: null, quantity: 0 };
  } else {
    newInventory[slotIndex] = {
      ...slot,
      quantity: newQuantity,
    };
  }

  return { success: true, inventory: newInventory, removed: quantity };
}

// 특정 아이템 ID로 제거
export function removeItemById(
  inventory: InventorySlot[],
  itemId: string,
  quantity: number
): { success: boolean; inventory: InventorySlot[]; removed: number } {
  let remaining = quantity;
  let newInventory = [...inventory];

  // 해당 아이템이 있는 슬롯 찾아서 제거
  for (let i = 0; i < newInventory.length && remaining > 0; i++) {
    if (newInventory[i].itemId === itemId) {
      const toRemove = Math.min(newInventory[i].quantity, remaining);
      const result = removeItem(newInventory, i, toRemove);
      newInventory = result.inventory;
      remaining -= result.removed;
    }
  }

  return {
    success: remaining === 0,
    inventory: newInventory,
    removed: quantity - remaining,
  };
}

// 아이템 개수 확인
export function countItem(inventory: InventorySlot[], itemId: string): number {
  return inventory.reduce((total, slot) => {
    if (slot.itemId === itemId) {
      return total + slot.quantity;
    }
    return total;
  }, 0);
}

// 아이템 보유 확인
export function hasItem(inventory: InventorySlot[], itemId: string, quantity: number = 1): boolean {
  return countItem(inventory, itemId) >= quantity;
}

// 슬롯 교환
export function swapSlots(
  inventory: InventorySlot[],
  fromIndex: number,
  toIndex: number
): InventorySlot[] {
  if (fromIndex < 0 || fromIndex >= inventory.length ||
    toIndex < 0 || toIndex >= inventory.length) {
    return inventory;
  }

  const newInventory = [...inventory];
  const temp = newInventory[fromIndex];
  newInventory[fromIndex] = newInventory[toIndex];
  newInventory[toIndex] = temp;

  return newInventory;
}

// 슬롯 가져오기
export function getSlot(inventory: InventorySlot[], index: number): InventorySlot | null {
  if (index < 0 || index >= inventory.length) {
    return null;
  }
  return inventory[index];
}

// 선택된 아이템 가져오기
export function getSelectedItem(inventory: InventorySlot[], selectedIndex: number): InventorySlot | null {
  return getSlot(inventory, selectedIndex);
}

// 빈 슬롯 개수
export function countEmptySlots(inventory: InventorySlot[]): number {
  return inventory.filter((slot) => !slot.itemId).length;
}

// 인벤토리가 가득 찼는지 확인
export function isInventoryFull(inventory: InventorySlot[]): boolean {
  return countEmptySlots(inventory) === 0;
}

// 인벤토리 크기 업그레이드
export function upgradeInventory(inventory: InventorySlot[], newSize: number): InventorySlot[] {
  if (newSize <= inventory.length) {
    return inventory;
  }

  const newInventory = [...inventory];
  while (newInventory.length < newSize) {
    newInventory.push({ itemId: null, quantity: 0 });
  }

  return newInventory;
}

// 인벤토리 정렬 (카테고리별)
export function sortInventory(inventory: InventorySlot[]): InventorySlot[] {
  const newInventory = [...inventory];

  // 비어있지 않은 슬롯만 정렬
  const nonEmptySlots = newInventory.filter((slot) => slot.itemId);
  const emptyCount = newInventory.length - nonEmptySlots.length;

  // 카테고리 순서
  const categoryOrder: Record<string, number> = {
    tool: 0,
    seed: 1,
    crop: 2,
    resource: 3,
    food: 4,
    fertilizer: 5,
    crafted: 6,
    misc: 7,
  };

  nonEmptySlots.sort((a, b) => {
    const itemA = getItemData(a.itemId!);
    const itemB = getItemData(b.itemId!);

    if (!itemA || !itemB) return 0;

    const categoryDiff = (categoryOrder[itemA.category] || 99) - (categoryOrder[itemB.category] || 99);
    if (categoryDiff !== 0) return categoryDiff;

    return (a.itemId || '').localeCompare(b.itemId || '');
  });

  // 정렬된 슬롯 + 빈 슬롯
  const result: InventorySlot[] = nonEmptySlots;
  for (let i = 0; i < emptyCount; i++) {
    result.push({ itemId: null, quantity: 0 });
  }

  return result;
}

// 핫바에서 선택 인덱스 변경
export function cycleHotbarSelection(currentIndex: number, direction: 'next' | 'prev'): number {
  if (direction === 'next') {
    return (currentIndex + 1) % HOTBAR_SIZE;
  } else {
    return (currentIndex - 1 + HOTBAR_SIZE) % HOTBAR_SIZE;
  }
}

// 아이템 사용 (음식 등)
export function useItem(
  inventory: InventorySlot[],
  slotIndex: number
): { success: boolean; inventory: InventorySlot[]; itemId: string | null } {
  const slot = getSlot(inventory, slotIndex);
  if (!slot || !slot.itemId) {
    return { success: false, inventory, itemId: null };
  }

  const itemData = getItemData(slot.itemId);
  if (!itemData) {
    return { success: false, inventory, itemId: null };
  }

  // 도구는 사용으로 소모되지 않음
  if (isTool(slot.itemId)) {
    return { success: true, inventory, itemId: slot.itemId };
  }

  // 소모품 사용
  const result = removeItem(inventory, slotIndex, 1);
  return {
    success: result.success,
    inventory: result.inventory,
    itemId: slot.itemId,
  };
}
