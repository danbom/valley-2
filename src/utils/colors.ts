// 순정만화 느낌의 파스텔톤 색상 팔레트
export const PALETTE = {
  // ===== 캐릭터 =====
  skin: '#FFE4C4',
  skinShadow: '#DEB896',
  skinHighlight: '#FFF0DC',
  hair: '#8B4513',
  hairHighlight: '#A0522D',
  hairShadow: '#5D2E0C',
  shirt: '#FFB6C1',      // 연핑크
  shirtShadow: '#E89BA6',
  pants: '#87CEEB',      // 하늘색
  pantsShadow: '#6CA6CD',
  shoes: '#654321',

  // ===== 자연 - 봄 =====
  grassSpring: '#90EE90',
  grassSpringDark: '#7CCD7C',
  grassSpringLight: '#98FB98',

  // ===== 자연 - 여름 =====
  grassSummer: '#32CD32',
  grassSummerDark: '#228B22',
  grassSummerLight: '#7CFC00',

  // ===== 자연 - 가을 =====
  grassFall: '#DAA520',
  grassFallDark: '#B8860B',
  grassFallLight: '#F0C040',

  // ===== 자연 - 겨울 =====
  grassWinter: '#F0F8FF',
  grassWinterDark: '#E0E8EF',
  grassWinterLight: '#FFFFFF',

  // ===== 땅 =====
  dirt: '#DEB887',
  dirtDark: '#D2B48C',
  dirtLight: '#F5DEB3',
  tilled: '#8B4513',
  tilledDark: '#654321',
  watered: '#5C3317',
  wateredDark: '#3D2212',

  // ===== 물 =====
  water: '#87CEEB',
  waterDark: '#6CA6CD',
  waterDeep: '#4682B4',
  waterShine: '#B0E0E6',

  // ===== 작물 색상 =====
  sprout: '#98FB98',
  sproutDark: '#7CCD7C',
  leaf: '#32CD32',
  leafDark: '#228B22',
  stem: '#6B8E23',

  // 파스닙
  parsnip: '#FFFACD',
  parsnipDark: '#EEE8AA',

  // 콜리플라워
  cauliflower: '#FFF8DC',
  cauliflowerLeaf: '#228B22',

  // 감자
  potato: '#DEB887',
  potatoDark: '#D2B48C',

  // 딸기
  strawberry: '#FF6B6B',
  strawberryDark: '#CD5C5C',
  strawberrySeed: '#FFD700',

  // 멜론
  melon: '#ADFF2F',
  melonDark: '#9ACD32',
  melonStripe: '#556B2F',

  // 토마토
  tomato: '#FF6347',
  tomatoDark: '#CD5C5C',
  tomatoHighlight: '#FF7F7F',

  // 옥수수
  corn: '#FFD700',
  cornDark: '#DAA520',
  cornHusk: '#9ACD32',

  // 호박
  pumpkin: '#FF8C00',
  pumpkinDark: '#D2691E',
  pumpkinStem: '#6B8E23',

  // 가지
  eggplant: '#9932CC',
  eggplantDark: '#8B008B',
  eggplantHighlight: '#BA55D3',

  // 크랜베리
  cranberry: '#DC143C',
  cranberryDark: '#B22222',

  // ===== 나무 =====
  treeTrunk: '#8B4513',
  treeTrunkDark: '#654321',
  treeLeaves: '#228B22',
  treeLeavesDark: '#006400',
  treeLeavesLight: '#32CD32',

  // ===== 돌/바위 =====
  rock: '#A9A9A9',
  rockDark: '#808080',
  rockLight: '#C0C0C0',

  // ===== 건물 =====
  woodLight: '#DEB887',
  woodMedium: '#CD853F',
  woodDark: '#8B4513',
  roof: '#B22222',
  roofDark: '#8B0000',
  window: '#87CEEB',
  windowFrame: '#654321',

  // ===== UI =====
  uiBg: '#FFF8DC',
  uiBgDark: '#F5DEB3',
  uiBorder: '#DEB887',
  uiBorderDark: '#CD853F',
  uiText: '#4A3728',
  uiTextLight: '#8B7355',
  uiSelected: '#FFD700',
  uiSelectedGlow: '#FFA500',
  uiButton: '#FFB6C1',
  uiButtonHover: '#FFC0CB',
  uiButtonPress: '#E89BA6',

  // ===== 품질 색상 =====
  qualityNormal: 'transparent',
  qualitySilver: '#C0C0C0',
  qualityGold: '#FFD700',
  qualityIridium: '#9400D3',

  // ===== 시간대 오버레이 =====
  dawn: 'rgba(255, 200, 150, 0.2)',
  morning: 'rgba(255, 255, 255, 0)',
  afternoon: 'rgba(255, 230, 180, 0.1)',
  evening: 'rgba(255, 150, 100, 0.3)',
  night: 'rgba(30, 30, 80, 0.5)',

  // ===== 날씨 =====
  rain: 'rgba(100, 149, 237, 0.3)',
  rainDrop: '#6495ED',

  // ===== 에너지/체력 바 =====
  energyFull: '#7CFC00',
  energyMid: '#FFD700',
  energyLow: '#FF6347',
  energyBg: '#2F4F4F',

  // ===== 기타 =====
  shadow: 'rgba(0, 0, 0, 0.3)',
  highlight: 'rgba(255, 255, 255, 0.5)',
  black: '#000000',
  white: '#FFFFFF',
} as const;

// 계절별 잔디 색상 가져오기
export function getSeasonalGrassColor(season: string, variant: 'main' | 'dark' | 'light' = 'main'): string {
  const seasonMap = {
    spring: { main: PALETTE.grassSpring, dark: PALETTE.grassSpringDark, light: PALETTE.grassSpringLight },
    summer: { main: PALETTE.grassSummer, dark: PALETTE.grassSummerDark, light: PALETTE.grassSummerLight },
    fall: { main: PALETTE.grassFall, dark: PALETTE.grassFallDark, light: PALETTE.grassFallLight },
    winter: { main: PALETTE.grassWinter, dark: PALETTE.grassWinterDark, light: PALETTE.grassWinterLight },
  };
  return seasonMap[season as keyof typeof seasonMap]?.[variant] || PALETTE.grassSpring;
}

// 시간대 오버레이 색상 가져오기
export function getTimeOverlay(hour: number): string {
  if (hour >= 5 && hour < 7) return PALETTE.dawn;
  if (hour >= 7 && hour < 12) return PALETTE.morning;
  if (hour >= 12 && hour < 17) return PALETTE.afternoon;
  if (hour >= 17 && hour < 20) return PALETTE.evening;
  return PALETTE.night;
}

// 품질 색상 가져오기
export function getQualityColor(quality: string): string {
  const qualityMap = {
    normal: PALETTE.qualityNormal,
    silver: PALETTE.qualitySilver,
    gold: PALETTE.qualityGold,
    iridium: PALETTE.qualityIridium,
  };
  return qualityMap[quality as keyof typeof qualityMap] || PALETTE.qualityNormal;
}
