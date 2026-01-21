import { ToolType } from '@/game/types';
import { getToolEnergyCost } from '@/game/data/tools';
import { getEnergyRestore, isEdible } from '@/game/data/items';

// 에너지 상수
export const INITIAL_MAX_ENERGY = 270;
export const STARDROP_ENERGY_BONUS = 34; // 스타드롭 하나당 +34
export const MAX_POSSIBLE_ENERGY = 508; // 모든 스타드롭 획득 시
export const EXHAUSTION_THRESHOLD = 0;
export const PASS_OUT_THRESHOLD = -15;

// 에너지 상태
export interface EnergyState {
  current: number;
  max: number;
  isExhausted: boolean; // 0 이하
  passedOut: boolean; // 기절
}

// 초기 에너지 상태 생성
export function createInitialEnergyState(): EnergyState {
  return {
    current: INITIAL_MAX_ENERGY,
    max: INITIAL_MAX_ENERGY,
    isExhausted: false,
    passedOut: false,
  };
}

// 도구 사용 에너지 소모
export function consumeToolEnergy(
  state: EnergyState,
  toolType: ToolType,
  toolLevel: string = 'basic'
): EnergyState {
  const cost = getToolEnergyCost(toolType, toolLevel as any);

  // 낫은 에너지 소모 없음
  if (toolType === 'scythe') {
    return state;
  }

  const newCurrent = state.current - cost;

  return {
    ...state,
    current: newCurrent,
    isExhausted: newCurrent <= EXHAUSTION_THRESHOLD,
    passedOut: newCurrent <= PASS_OUT_THRESHOLD,
  };
}

// 음식 섭취로 에너지 회복
export function consumeFood(state: EnergyState, itemId: string): EnergyState {
  if (!isEdible(itemId)) {
    return state;
  }

  const restore = getEnergyRestore(itemId);
  const newCurrent = Math.min(state.max, state.current + restore);

  return {
    ...state,
    current: newCurrent,
    isExhausted: newCurrent <= EXHAUSTION_THRESHOLD,
    passedOut: false,
  };
}

// 수면으로 에너지 완전 회복
export function restoreFromSleep(state: EnergyState, recoveryMultiplier: number = 1): EnergyState {
  const newCurrent = Math.floor(state.max * recoveryMultiplier);

  return {
    ...state,
    current: newCurrent,
    isExhausted: false,
    passedOut: false,
  };
}

// 기절 후 회복 (부분 회복)
export function restoreFromPassOut(state: EnergyState): EnergyState {
  // 기절하면 에너지 절반만 회복
  const newCurrent = Math.floor(state.max * 0.5);

  return {
    ...state,
    current: newCurrent,
    isExhausted: false,
    passedOut: false,
  };
}

// 최대 에너지 증가 (스타드롭)
export function increaseMaxEnergy(state: EnergyState): EnergyState {
  const newMax = Math.min(MAX_POSSIBLE_ENERGY, state.max + STARDROP_ENERGY_BONUS);
  const newCurrent = state.current + STARDROP_ENERGY_BONUS;

  return {
    ...state,
    max: newMax,
    current: Math.min(newMax, newCurrent),
  };
}

// 에너지가 충분한지 확인
export function hasEnoughEnergy(state: EnergyState, cost: number): boolean {
  // 지침 상태에서도 행동은 가능하지만 기절할 수 있음
  return state.current > PASS_OUT_THRESHOLD + cost;
}

// 에너지 퍼센트
export function getEnergyPercent(state: EnergyState): number {
  return Math.max(0, state.current / state.max);
}

// 에너지 상태 텍스트
export function getEnergyStatusText(state: EnergyState): string {
  if (state.passedOut) {
    return '기절';
  }
  if (state.isExhausted) {
    return '지침';
  }

  const percent = getEnergyPercent(state);
  if (percent > 0.75) {
    return '활력';
  }
  if (percent > 0.5) {
    return '보통';
  }
  if (percent > 0.25) {
    return '피곤';
  }
  return '녹초';
}

// 에너지 색상 (UI용)
export function getEnergyColor(state: EnergyState): string {
  const percent = getEnergyPercent(state);
  if (percent > 0.5) {
    return '#7CFC00'; // 녹색
  }
  if (percent > 0.25) {
    return '#FFD700'; // 노란색
  }
  return '#FF6347'; // 빨간색
}

// 행동별 에너지 소모량
export const ENERGY_COSTS: Record<string, number> = {
  hoe: 2,
  wateringCan: 2,
  axe: 4,
  pickaxe: 4,
  scythe: 0,
  fishing_cast: 8,
  mining_swing: 4,
  running: 0.1, // 초당
};

// 스프린트 (달리기) 에너지 소모
export function consumeSprintEnergy(state: EnergyState, deltaTime: number): EnergyState {
  const cost = ENERGY_COSTS.running * deltaTime;
  const newCurrent = state.current - cost;

  return {
    ...state,
    current: newCurrent,
    isExhausted: newCurrent <= EXHAUSTION_THRESHOLD,
    passedOut: newCurrent <= PASS_OUT_THRESHOLD,
  };
}

// 도구 사용 가능 여부 확인
export function canUseTool(state: EnergyState, toolType: ToolType): boolean {
  const cost = getToolEnergyCost(toolType, 'basic');
  return hasEnoughEnergy(state, cost);
}
