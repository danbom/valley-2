import { ToolData, ToolType, ToolLevel } from '@/game/types';

export const TOOL_DATA: Record<string, ToolData> = {
  // === 괭이 (Hoe) ===
  hoe_basic: {
    id: 'hoe_basic',
    name: 'Hoe',
    nameKo: '괭이',
    type: 'hoe',
    level: 'basic',
    energyCost: 2,
    range: 1,
  },
  hoe_copper: {
    id: 'hoe_copper',
    name: 'Copper Hoe',
    nameKo: '구리 괭이',
    type: 'hoe',
    level: 'copper',
    energyCost: 2,
    range: 3, // 충전 시 3칸
  },
  hoe_iron: {
    id: 'hoe_iron',
    name: 'Iron Hoe',
    nameKo: '철 괭이',
    type: 'hoe',
    level: 'iron',
    energyCost: 2,
    range: 5,
  },
  hoe_gold: {
    id: 'hoe_gold',
    name: 'Gold Hoe',
    nameKo: '금 괭이',
    type: 'hoe',
    level: 'gold',
    energyCost: 2,
    range: 9,
  },
  hoe_iridium: {
    id: 'hoe_iridium',
    name: 'Iridium Hoe',
    nameKo: '이리듐 괭이',
    type: 'hoe',
    level: 'iridium',
    energyCost: 2,
    range: 18,
  },

  // === 물뿌리개 (Watering Can) ===
  wateringCan_basic: {
    id: 'wateringCan_basic',
    name: 'Watering Can',
    nameKo: '물뿌리개',
    type: 'wateringCan',
    level: 'basic',
    energyCost: 2,
    range: 1,
  },
  wateringCan_copper: {
    id: 'wateringCan_copper',
    name: 'Copper Watering Can',
    nameKo: '구리 물뿌리개',
    type: 'wateringCan',
    level: 'copper',
    energyCost: 2,
    range: 3,
  },
  wateringCan_iron: {
    id: 'wateringCan_iron',
    name: 'Iron Watering Can',
    nameKo: '철 물뿌리개',
    type: 'wateringCan',
    level: 'iron',
    energyCost: 2,
    range: 5,
  },
  wateringCan_gold: {
    id: 'wateringCan_gold',
    name: 'Gold Watering Can',
    nameKo: '금 물뿌리개',
    type: 'wateringCan',
    level: 'gold',
    energyCost: 2,
    range: 9,
  },
  wateringCan_iridium: {
    id: 'wateringCan_iridium',
    name: 'Iridium Watering Can',
    nameKo: '이리듐 물뿌리개',
    type: 'wateringCan',
    level: 'iridium',
    energyCost: 2,
    range: 18,
  },

  // === 도끼 (Axe) ===
  axe_basic: {
    id: 'axe_basic',
    name: 'Axe',
    nameKo: '도끼',
    type: 'axe',
    level: 'basic',
    energyCost: 4,
    range: 1,
  },
  axe_copper: {
    id: 'axe_copper',
    name: 'Copper Axe',
    nameKo: '구리 도끼',
    type: 'axe',
    level: 'copper',
    energyCost: 4,
    range: 1,
  },
  axe_iron: {
    id: 'axe_iron',
    name: 'Iron Axe',
    nameKo: '철 도끼',
    type: 'axe',
    level: 'iron',
    energyCost: 3,
    range: 1,
  },
  axe_gold: {
    id: 'axe_gold',
    name: 'Gold Axe',
    nameKo: '금 도끼',
    type: 'axe',
    level: 'gold',
    energyCost: 3,
    range: 1,
  },
  axe_iridium: {
    id: 'axe_iridium',
    name: 'Iridium Axe',
    nameKo: '이리듐 도끼',
    type: 'axe',
    level: 'iridium',
    energyCost: 2,
    range: 1,
  },

  // === 곡괭이 (Pickaxe) ===
  pickaxe_basic: {
    id: 'pickaxe_basic',
    name: 'Pickaxe',
    nameKo: '곡괭이',
    type: 'pickaxe',
    level: 'basic',
    energyCost: 4,
    range: 1,
  },
  pickaxe_copper: {
    id: 'pickaxe_copper',
    name: 'Copper Pickaxe',
    nameKo: '구리 곡괭이',
    type: 'pickaxe',
    level: 'copper',
    energyCost: 4,
    range: 1,
  },
  pickaxe_iron: {
    id: 'pickaxe_iron',
    name: 'Iron Pickaxe',
    nameKo: '철 곡괭이',
    type: 'pickaxe',
    level: 'iron',
    energyCost: 3,
    range: 1,
  },
  pickaxe_gold: {
    id: 'pickaxe_gold',
    name: 'Gold Pickaxe',
    nameKo: '금 곡괭이',
    type: 'pickaxe',
    level: 'gold',
    energyCost: 3,
    range: 1,
  },
  pickaxe_iridium: {
    id: 'pickaxe_iridium',
    name: 'Iridium Pickaxe',
    nameKo: '이리듐 곡괭이',
    type: 'pickaxe',
    level: 'iridium',
    energyCost: 2,
    range: 1,
  },

  // === 낫 (Scythe) ===
  scythe_basic: {
    id: 'scythe_basic',
    name: 'Scythe',
    nameKo: '낫',
    type: 'scythe',
    level: 'basic',
    energyCost: 0, // 낫은 에너지 소모 없음
    range: 1,
  },
};

// 도구 타입별 기본 도구 ID 가져오기
export function getDefaultToolId(type: ToolType): string {
  return `${type}_basic`;
}

// 도구 데이터 가져오기
export function getToolData(toolId: string): ToolData | undefined {
  return TOOL_DATA[toolId];
}

// 도구 타입으로 도구 목록 가져오기
export function getToolsByType(type: ToolType): ToolData[] {
  return Object.values(TOOL_DATA).filter((tool) => tool.type === type);
}

// 다음 업그레이드 레벨 가져오기
export function getNextToolLevel(currentLevel: ToolLevel): ToolLevel | null {
  const levelOrder: ToolLevel[] = ['basic', 'copper', 'iron', 'gold', 'iridium'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  if (currentIndex === -1 || currentIndex === levelOrder.length - 1) {
    return null;
  }
  return levelOrder[currentIndex + 1];
}

// 도구 업그레이드 비용
export function getToolUpgradeCost(toLevel: ToolLevel): { gold: number; bars: number } {
  const costs: Record<ToolLevel, { gold: number; bars: number }> = {
    basic: { gold: 0, bars: 0 },
    copper: { gold: 2000, bars: 5 },
    iron: { gold: 5000, bars: 5 },
    gold: { gold: 10000, bars: 5 },
    iridium: { gold: 25000, bars: 5 },
  };
  return costs[toLevel];
}

// 인벤토리 아이템 ID에서 도구 타입 추출
export function getToolTypeFromItemId(itemId: string): ToolType | null {
  if (!itemId.startsWith('tool_')) return null;
  const type = itemId.replace('tool_', '') as ToolType;
  const validTypes: ToolType[] = ['hoe', 'wateringCan', 'axe', 'pickaxe', 'scythe'];
  return validTypes.includes(type) ? type : null;
}

// 도구 에너지 비용 가져오기
export function getToolEnergyCost(toolType: ToolType, level: ToolLevel = 'basic'): number {
  const toolId = `${toolType}_${level}`;
  const tool = TOOL_DATA[toolId];
  return tool?.energyCost || 2;
}
