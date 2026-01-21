import { PALETTE, getSeasonalGrassColor } from '@/utils/colors';
import { Direction, Season, TileType, SpriteCache } from '@/game/types';

const TILE_SIZE = 32;

// 스프라이트 캐시
const spriteCache: SpriteCache = {};

// 캔버스 생성 헬퍼
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// 픽셀 그리기 헬퍼
function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 1): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

// 사각형 그리기 헬퍼
function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// ===== 플레이어 스프라이트 생성 =====
export function generatePlayerSprite(direction: Direction, frame: number, isMoving: boolean): HTMLCanvasElement {
  const cacheKey = `player_${direction}_${frame}_${isMoving}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  // 그림자
  fillRect(ctx, 8, 28, 16, 4, PALETTE.shadow);

  // 발 위치 (걷기 애니메이션)
  const legOffset = isMoving ? Math.sin(frame * Math.PI) * 2 : 0;

  // 신발
  const leftFootX = direction === 'left' ? 10 - legOffset : 10 + legOffset;
  const rightFootX = direction === 'right' ? 18 + legOffset : 18 - legOffset;
  fillRect(ctx, leftFootX, 26, 4, 3, PALETTE.shoes);
  fillRect(ctx, rightFootX, 26, 4, 3, PALETTE.shoes);

  // 바지 (하늘색)
  fillRect(ctx, 10, 20, 12, 7, PALETTE.pants);
  fillRect(ctx, 9, 22, 3, 5, PALETTE.pantsShadow);

  // 상의 (연핑크)
  fillRect(ctx, 9, 12, 14, 9, PALETTE.shirt);
  fillRect(ctx, 8, 14, 2, 5, PALETTE.shirtShadow);
  fillRect(ctx, 22, 14, 2, 5, PALETTE.shirtShadow);

  // 팔
  if (direction === 'left') {
    fillRect(ctx, 6, 14, 3, 6, PALETTE.shirt);
    fillRect(ctx, 22, 14, 3, 6, PALETTE.shirtShadow);
  } else if (direction === 'right') {
    fillRect(ctx, 6, 14, 3, 6, PALETTE.shirtShadow);
    fillRect(ctx, 22, 14, 3, 6, PALETTE.shirt);
  } else {
    fillRect(ctx, 6, 14, 3, 6, PALETTE.shirt);
    fillRect(ctx, 23, 14, 3, 6, PALETTE.shirt);
  }

  // 손
  if (direction !== 'up') {
    fillRect(ctx, 6, 19, 3, 3, PALETTE.skin);
    fillRect(ctx, 23, 19, 3, 3, PALETTE.skin);
  }

  // 머리 (얼굴)
  fillRect(ctx, 8, 2, 16, 12, PALETTE.skin);

  // 머리카락 (갈색, 순정만화 스타일)
  fillRect(ctx, 7, 1, 18, 4, PALETTE.hair);
  fillRect(ctx, 6, 2, 3, 6, PALETTE.hair);
  fillRect(ctx, 23, 2, 3, 6, PALETTE.hair);

  // 머리카락 하이라이트
  fillRect(ctx, 9, 2, 3, 2, PALETTE.hairHighlight);

  // 눈 (방향에 따라)
  if (direction === 'up') {
    // 뒷모습 - 눈 안 보임
  } else if (direction === 'down') {
    // 정면
    fillRect(ctx, 11, 6, 3, 3, PALETTE.white);
    fillRect(ctx, 18, 6, 3, 3, PALETTE.white);
    fillRect(ctx, 12, 7, 2, 2, PALETTE.black);
    fillRect(ctx, 19, 7, 2, 2, PALETTE.black);
    // 눈 반짝임
    setPixel(ctx, 12, 7, PALETTE.white, 1);
    setPixel(ctx, 19, 7, PALETTE.white, 1);
  } else {
    // 옆모습
    const eyeX = direction === 'left' ? 10 : 19;
    fillRect(ctx, eyeX, 6, 3, 3, PALETTE.white);
    fillRect(ctx, eyeX + 1, 7, 2, 2, PALETTE.black);
    setPixel(ctx, eyeX + 1, 7, PALETTE.white, 1);
  }

  // 볼터치 (순정만화 느낌)
  if (direction !== 'up') {
    fillRect(ctx, 9, 10, 2, 2, '#FFB6C1');
    fillRect(ctx, 21, 10, 2, 2, '#FFB6C1');
  }

  // 입
  if (direction === 'down') {
    fillRect(ctx, 14, 11, 4, 1, '#E89BA6');
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 타일 스프라이트 생성 =====
export function generateTileSprite(type: TileType, season: Season, variant: number = 0): HTMLCanvasElement {
  const cacheKey = `tile_${type}_${season}_${variant}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'grass':
      drawGrassTile(ctx, season, variant);
      break;
    case 'dirt':
      drawDirtTile(ctx, variant);
      break;
    case 'tilled':
      drawTilledTile(ctx, false);
      break;
    case 'watered':
      drawTilledTile(ctx, true);
      break;
    case 'water':
      drawWaterTile(ctx, variant);
      break;
    case 'wood_floor':
      drawWoodFloorTile(ctx);
      break;
    case 'fence':
      drawFenceTile(ctx);
      break;
    default:
      fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, '#FF00FF');
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawGrassTile(ctx: CanvasRenderingContext2D, season: Season, variant: number): void {
  const baseColor = getSeasonalGrassColor(season, 'main');
  const darkColor = getSeasonalGrassColor(season, 'dark');
  const lightColor = getSeasonalGrassColor(season, 'light');

  // 베이스 색상
  fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, baseColor);

  // 텍스처 (약간의 변화)
  for (let i = 0; i < 8; i++) {
    const x = ((variant * 7 + i * 13) % 28) + 2;
    const y = ((variant * 11 + i * 17) % 28) + 2;
    setPixel(ctx, x, y, i % 2 === 0 ? darkColor : lightColor, 2);
  }

  // 작은 풀잎 (겨울 제외)
  if (season !== 'winter') {
    for (let i = 0; i < 3; i++) {
      const x = ((variant * 5 + i * 11) % 24) + 4;
      const y = ((variant * 7 + i * 13) % 20) + 8;
      setPixel(ctx, x, y, darkColor, 1);
      setPixel(ctx, x, y - 1, darkColor, 1);
      setPixel(ctx, x, y - 2, darkColor, 1);
    }
  }
}

function drawDirtTile(ctx: CanvasRenderingContext2D, variant: number): void {
  fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, PALETTE.dirt);

  // 텍스처
  for (let i = 0; i < 6; i++) {
    const x = ((variant * 7 + i * 11) % 28) + 2;
    const y = ((variant * 13 + i * 17) % 28) + 2;
    setPixel(ctx, x, y, i % 2 === 0 ? PALETTE.dirtDark : PALETTE.dirtLight, 2);
  }
}

function drawTilledTile(ctx: CanvasRenderingContext2D, isWatered: boolean): void {
  const baseColor = isWatered ? PALETTE.watered : PALETTE.tilled;
  const darkColor = isWatered ? PALETTE.wateredDark : PALETTE.tilledDark;

  fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, baseColor);

  // 밭고랑 패턴
  for (let y = 4; y < TILE_SIZE; y += 6) {
    fillRect(ctx, 2, y, TILE_SIZE - 4, 2, darkColor);
  }

  // 테두리
  ctx.strokeStyle = darkColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
}

function drawWaterTile(ctx: CanvasRenderingContext2D, variant: number): void {
  fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, PALETTE.water);

  // 물결 패턴
  const offset = (variant % 4) * 4;
  for (let y = offset; y < TILE_SIZE; y += 8) {
    for (let x = 0; x < TILE_SIZE; x += 8) {
      fillRect(ctx, x, y, 4, 2, PALETTE.waterShine);
    }
  }

  // 깊은 부분
  fillRect(ctx, 4, 4, 8, 8, PALETTE.waterDeep);
}

function drawWoodFloorTile(ctx: CanvasRenderingContext2D): void {
  fillRect(ctx, 0, 0, TILE_SIZE, TILE_SIZE, PALETTE.woodMedium);

  // 나무 판자 패턴
  for (let y = 0; y < TILE_SIZE; y += 8) {
    ctx.strokeStyle = PALETTE.woodDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TILE_SIZE, y);
    ctx.stroke();
  }

  // 세로 이음새
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(16, TILE_SIZE);
  ctx.stroke();
}

function drawFenceTile(ctx: CanvasRenderingContext2D): void {
  // 배경 (투명)
  ctx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);

  // 울타리 기둥
  fillRect(ctx, 13, 4, 6, 24, PALETTE.woodMedium);
  fillRect(ctx, 13, 4, 6, 2, PALETTE.woodLight);
  fillRect(ctx, 13, 4, 2, 24, PALETTE.woodDark);
}

// ===== 작물 스프라이트 생성 =====
export function generateCropSprite(cropId: string, stage: number, maxStage: number): HTMLCanvasElement {
  const cacheKey = `crop_${cropId}_${stage}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  const progress = stage / maxStage;

  switch (cropId) {
    case 'parsnip':
      drawParsnip(ctx, progress);
      break;
    case 'cauliflower':
      drawCauliflower(ctx, progress);
      break;
    case 'potato':
      drawPotato(ctx, progress);
      break;
    case 'strawberry':
      drawStrawberry(ctx, progress);
      break;
    case 'melon':
      drawMelon(ctx, progress);
      break;
    case 'tomato':
      drawTomato(ctx, progress);
      break;
    case 'corn':
      drawCorn(ctx, progress);
      break;
    case 'pumpkin':
      drawPumpkin(ctx, progress);
      break;
    case 'eggplant':
      drawEggplant(ctx, progress);
      break;
    case 'cranberry':
      drawCranberry(ctx, progress);
      break;
    default:
      drawGenericCrop(ctx, progress);
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawSprout(ctx: CanvasRenderingContext2D, height: number): void {
  const baseY = 28;
  fillRect(ctx, 15, baseY - height, 2, height, PALETTE.stem);
  // 작은 잎
  if (height > 4) {
    fillRect(ctx, 13, baseY - height + 2, 3, 2, PALETTE.sprout);
    fillRect(ctx, 16, baseY - height + 4, 3, 2, PALETTE.sprout);
  }
}

function drawParsnip(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.5) {
    drawSprout(ctx, 4 + progress * 8);
  } else {
    // 잎
    const leafHeight = 12 + (progress - 0.5) * 8;
    fillRect(ctx, 14, 28 - leafHeight, 4, leafHeight - 4, PALETTE.leaf);
    fillRect(ctx, 10, 28 - leafHeight + 4, 4, 6, PALETTE.leaf);
    fillRect(ctx, 18, 28 - leafHeight + 6, 4, 4, PALETTE.leaf);

    if (progress >= 1) {
      // 파스닙 뿌리 (살짝 보이게)
      fillRect(ctx, 14, 26, 4, 4, PALETTE.parsnip);
    }
  }
}

function drawCauliflower(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.3) {
    drawSprout(ctx, 4 + progress * 10);
  } else if (progress < 0.7) {
    // 잎 성장
    const size = (progress - 0.3) * 25;
    fillRect(ctx, 16 - size / 2, 26 - size, size, size, PALETTE.cauliflowerLeaf);
  } else {
    // 큰 잎
    fillRect(ctx, 8, 16, 16, 12, PALETTE.cauliflowerLeaf);
    fillRect(ctx, 6, 20, 4, 6, PALETTE.cauliflowerLeaf);
    fillRect(ctx, 22, 20, 4, 6, PALETTE.cauliflowerLeaf);

    if (progress >= 1) {
      // 콜리플라워 꽃
      fillRect(ctx, 10, 10, 12, 8, PALETTE.cauliflower);
      fillRect(ctx, 12, 8, 8, 4, PALETTE.cauliflower);
    }
  }
}

function drawPotato(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.5) {
    drawSprout(ctx, 4 + progress * 12);
  } else {
    // 잎
    fillRect(ctx, 12, 18, 8, 10, PALETTE.leaf);
    fillRect(ctx, 10, 20, 4, 6, PALETTE.leafDark);
    fillRect(ctx, 18, 22, 4, 4, PALETTE.leafDark);

    if (progress >= 1) {
      // 감자 (땅에서 살짝)
      fillRect(ctx, 8, 26, 5, 4, PALETTE.potato);
      fillRect(ctx, 19, 27, 4, 3, PALETTE.potato);
    }
  }
}

function drawStrawberry(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.4) {
    drawSprout(ctx, 4 + progress * 10);
  } else {
    // 덤불
    fillRect(ctx, 10, 18, 12, 10, PALETTE.leaf);
    fillRect(ctx, 8, 22, 4, 4, PALETTE.leafDark);
    fillRect(ctx, 20, 22, 4, 4, PALETTE.leafDark);

    if (progress >= 1) {
      // 딸기 열매
      fillRect(ctx, 12, 14, 4, 5, PALETTE.strawberry);
      fillRect(ctx, 11, 15, 1, 3, PALETTE.strawberryDark);
      fillRect(ctx, 18, 16, 3, 4, PALETTE.strawberry);
      // 씨앗 점
      setPixel(ctx, 13, 16, PALETTE.strawberrySeed, 1);
      setPixel(ctx, 14, 17, PALETTE.strawberrySeed, 1);
    }
  }
}

function drawMelon(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.3) {
    drawSprout(ctx, 4 + progress * 10);
  } else if (progress < 0.7) {
    // 덩굴
    fillRect(ctx, 8, 24, 16, 4, PALETTE.leaf);
    fillRect(ctx, 14, 20, 4, 6, PALETTE.stem);
  } else {
    // 덩굴 + 멜론
    fillRect(ctx, 6, 24, 20, 4, PALETTE.leaf);
    fillRect(ctx, 4, 22, 4, 4, PALETTE.leafDark);
    fillRect(ctx, 24, 22, 4, 4, PALETTE.leafDark);

    if (progress >= 1) {
      // 멜론
      fillRect(ctx, 10, 14, 12, 10, PALETTE.melon);
      fillRect(ctx, 12, 12, 8, 4, PALETTE.melon);
      // 줄무늬
      fillRect(ctx, 14, 14, 2, 10, PALETTE.melonStripe);
      fillRect(ctx, 18, 14, 2, 10, PALETTE.melonStripe);
    }
  }
}

function drawTomato(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.3) {
    drawSprout(ctx, 4 + progress * 12);
  } else {
    // 줄기
    fillRect(ctx, 15, 8, 2, 20, PALETTE.stem);

    // 잎
    fillRect(ctx, 10, 16, 6, 4, PALETTE.leaf);
    fillRect(ctx, 16, 12, 6, 4, PALETTE.leaf);
    fillRect(ctx, 8, 22, 6, 4, PALETTE.leaf);
    fillRect(ctx, 18, 20, 6, 4, PALETTE.leaf);

    if (progress >= 1) {
      // 토마토 열매
      fillRect(ctx, 10, 8, 5, 5, PALETTE.tomato);
      fillRect(ctx, 11, 7, 3, 2, PALETTE.tomatoHighlight);
      fillRect(ctx, 18, 12, 4, 4, PALETTE.tomato);
      fillRect(ctx, 8, 18, 4, 4, PALETTE.tomato);
    }
  }
}

function drawCorn(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.3) {
    drawSprout(ctx, 4 + progress * 14);
  } else {
    // 줄기 (키가 큼)
    const height = 20 + (progress - 0.3) * 10;
    fillRect(ctx, 14, 28 - height, 4, height, PALETTE.stem);

    // 잎
    fillRect(ctx, 8, 28 - height + 6, 8, 3, PALETTE.cornHusk);
    fillRect(ctx, 16, 28 - height + 10, 8, 3, PALETTE.cornHusk);
    fillRect(ctx, 6, 28 - height + 16, 10, 3, PALETTE.cornHusk);

    if (progress >= 1) {
      // 옥수수
      fillRect(ctx, 18, 10, 5, 10, PALETTE.corn);
      fillRect(ctx, 17, 8, 7, 3, PALETTE.cornHusk);
    }
  }
}

function drawPumpkin(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.3) {
    drawSprout(ctx, 4 + progress * 10);
  } else if (progress < 0.7) {
    // 덩굴
    fillRect(ctx, 6, 22, 20, 6, PALETTE.leaf);
    fillRect(ctx, 14, 18, 4, 6, PALETTE.stem);
  } else {
    // 덩굴
    fillRect(ctx, 4, 24, 24, 4, PALETTE.leaf);

    if (progress >= 1) {
      // 호박
      fillRect(ctx, 8, 12, 16, 14, PALETTE.pumpkin);
      fillRect(ctx, 10, 10, 12, 4, PALETTE.pumpkin);
      // 줄
      fillRect(ctx, 14, 12, 2, 12, PALETTE.pumpkinDark);
      fillRect(ctx, 18, 14, 2, 10, PALETTE.pumpkinDark);
      fillRect(ctx, 10, 14, 2, 10, PALETTE.pumpkinDark);
      // 꼭지
      fillRect(ctx, 14, 8, 4, 4, PALETTE.pumpkinStem);
    }
  }
}

function drawEggplant(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.4) {
    drawSprout(ctx, 4 + progress * 10);
  } else {
    // 줄기
    fillRect(ctx, 15, 12, 2, 16, PALETTE.stem);
    // 잎
    fillRect(ctx, 10, 18, 6, 4, PALETTE.leaf);
    fillRect(ctx, 16, 14, 6, 4, PALETTE.leaf);

    if (progress >= 1) {
      // 가지
      fillRect(ctx, 8, 8, 6, 10, PALETTE.eggplant);
      fillRect(ctx, 9, 6, 4, 3, PALETTE.eggplantHighlight);
      fillRect(ctx, 18, 12, 5, 8, PALETTE.eggplant);
    }
  }
}

function drawCranberry(ctx: CanvasRenderingContext2D, progress: number): void {
  if (progress < 0.4) {
    drawSprout(ctx, 4 + progress * 10);
  } else {
    // 덤불
    fillRect(ctx, 8, 20, 16, 8, PALETTE.leaf);
    fillRect(ctx, 6, 22, 4, 4, PALETTE.leafDark);
    fillRect(ctx, 22, 22, 4, 4, PALETTE.leafDark);

    if (progress >= 1) {
      // 크랜베리 열매
      fillRect(ctx, 10, 16, 3, 3, PALETTE.cranberry);
      fillRect(ctx, 15, 14, 3, 3, PALETTE.cranberry);
      fillRect(ctx, 20, 16, 3, 3, PALETTE.cranberry);
      fillRect(ctx, 12, 18, 3, 3, PALETTE.cranberryDark);
      fillRect(ctx, 18, 19, 3, 3, PALETTE.cranberryDark);
    }
  }
}

function drawGenericCrop(ctx: CanvasRenderingContext2D, progress: number): void {
  const height = 4 + progress * 20;
  fillRect(ctx, 15, 28 - height, 2, height, PALETTE.stem);
  if (progress > 0.3) {
    fillRect(ctx, 12, 28 - height + 4, 4, 3, PALETTE.leaf);
    fillRect(ctx, 16, 28 - height + 6, 4, 3, PALETTE.leaf);
  }
}

// ===== 도구 스프라이트 생성 =====
export function generateToolSprite(toolType: string): HTMLCanvasElement {
  const cacheKey = `tool_${toolType}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d')!;

  switch (toolType) {
    case 'hoe':
      drawHoe(ctx);
      break;
    case 'wateringCan':
      drawWateringCan(ctx);
      break;
    case 'axe':
      drawAxe(ctx);
      break;
    case 'pickaxe':
      drawPickaxe(ctx);
      break;
    case 'scythe':
      drawScythe(ctx);
      break;
    default:
      fillRect(ctx, 8, 8, 16, 16, '#888');
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawHoe(ctx: CanvasRenderingContext2D): void {
  // 손잡이
  fillRect(ctx, 14, 6, 4, 20, PALETTE.woodMedium);
  fillRect(ctx, 14, 6, 1, 20, PALETTE.woodLight);
  // 머리
  fillRect(ctx, 8, 24, 16, 4, '#A0A0A0');
  fillRect(ctx, 8, 24, 16, 1, '#C0C0C0');
}

function drawWateringCan(ctx: CanvasRenderingContext2D): void {
  // 몸체
  fillRect(ctx, 8, 12, 14, 14, '#6B7B8C');
  fillRect(ctx, 8, 12, 14, 2, '#8B9BAC');
  // 주둥이
  fillRect(ctx, 20, 8, 8, 4, '#6B7B8C');
  fillRect(ctx, 26, 6, 4, 4, '#6B7B8C');
  // 손잡이
  fillRect(ctx, 4, 10, 6, 3, '#6B7B8C');
  fillRect(ctx, 2, 12, 4, 8, '#6B7B8C');
}

function drawAxe(ctx: CanvasRenderingContext2D): void {
  // 손잡이
  fillRect(ctx, 14, 8, 4, 18, PALETTE.woodMedium);
  fillRect(ctx, 14, 8, 1, 18, PALETTE.woodLight);
  // 도끼날
  fillRect(ctx, 18, 6, 8, 10, '#A0A0A0');
  fillRect(ctx, 22, 4, 6, 4, '#A0A0A0');
  fillRect(ctx, 18, 6, 8, 2, '#C0C0C0');
}

function drawPickaxe(ctx: CanvasRenderingContext2D): void {
  // 손잡이
  fillRect(ctx, 14, 10, 4, 16, PALETTE.woodMedium);
  fillRect(ctx, 14, 10, 1, 16, PALETTE.woodLight);
  // 곡괭이 머리
  fillRect(ctx, 6, 6, 20, 6, '#A0A0A0');
  fillRect(ctx, 4, 8, 4, 3, '#A0A0A0');
  fillRect(ctx, 24, 8, 4, 3, '#A0A0A0');
  fillRect(ctx, 6, 6, 20, 2, '#C0C0C0');
}

function drawScythe(ctx: CanvasRenderingContext2D): void {
  // 손잡이
  fillRect(ctx, 6, 8, 4, 18, PALETTE.woodMedium);
  fillRect(ctx, 6, 8, 1, 18, PALETTE.woodLight);
  // 날
  fillRect(ctx, 8, 4, 18, 4, '#A0A0A0');
  fillRect(ctx, 22, 6, 6, 8, '#A0A0A0');
  fillRect(ctx, 8, 4, 18, 1, '#C0C0C0');
}

// ===== 아이템 스프라이트 생성 =====
export function generateItemSprite(itemId: string): HTMLCanvasElement {
  const cacheKey = `item_${itemId}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d')!;

  // 씨앗인 경우
  if (itemId.endsWith('_seeds')) {
    drawSeedPacket(ctx, itemId.replace('_seeds', ''));
  } else {
    // 작물 아이템
    drawCropItem(ctx, itemId);
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawSeedPacket(ctx: CanvasRenderingContext2D, cropId: string): void {
  // 봉투
  fillRect(ctx, 6, 4, 20, 24, PALETTE.uiBg);
  fillRect(ctx, 6, 4, 20, 2, PALETTE.uiBorder);
  fillRect(ctx, 6, 4, 2, 24, PALETTE.uiBorder);
  fillRect(ctx, 24, 4, 2, 24, PALETTE.uiBorder);
  fillRect(ctx, 6, 26, 20, 2, PALETTE.uiBorder);

  // 작물 색상으로 꾸미기
  const cropColors: Record<string, string> = {
    parsnip: PALETTE.parsnip,
    cauliflower: PALETTE.cauliflower,
    potato: PALETTE.potato,
    strawberry: PALETTE.strawberry,
    melon: PALETTE.melon,
    tomato: PALETTE.tomato,
    corn: PALETTE.corn,
    pumpkin: PALETTE.pumpkin,
    eggplant: PALETTE.eggplant,
    cranberry: PALETTE.cranberry,
  };

  const color = cropColors[cropId] || PALETTE.leaf;
  fillRect(ctx, 10, 10, 12, 12, color);

  // 씨앗 점
  fillRect(ctx, 13, 14, 2, 2, PALETTE.woodDark);
  fillRect(ctx, 17, 16, 2, 2, PALETTE.woodDark);
  fillRect(ctx, 15, 18, 2, 2, PALETTE.woodDark);
}

function drawCropItem(ctx: CanvasRenderingContext2D, cropId: string): void {
  switch (cropId) {
    case 'parsnip':
      fillRect(ctx, 12, 4, 8, 24, PALETTE.parsnip);
      fillRect(ctx, 10, 8, 4, 16, PALETTE.parsnipDark);
      fillRect(ctx, 14, 2, 4, 4, PALETTE.leaf);
      break;
    case 'cauliflower':
      fillRect(ctx, 8, 12, 16, 12, PALETTE.cauliflower);
      fillRect(ctx, 10, 8, 12, 6, PALETTE.cauliflower);
      fillRect(ctx, 6, 20, 6, 8, PALETTE.cauliflowerLeaf);
      fillRect(ctx, 20, 20, 6, 8, PALETTE.cauliflowerLeaf);
      break;
    case 'potato':
      fillRect(ctx, 8, 10, 16, 14, PALETTE.potato);
      fillRect(ctx, 10, 8, 12, 4, PALETTE.potato);
      setPixel(ctx, 12, 14, PALETTE.potatoDark, 2);
      setPixel(ctx, 18, 16, PALETTE.potatoDark, 2);
      break;
    case 'strawberry':
      fillRect(ctx, 10, 8, 12, 16, PALETTE.strawberry);
      fillRect(ctx, 12, 6, 8, 4, PALETTE.strawberry);
      fillRect(ctx, 14, 4, 4, 4, PALETTE.leaf);
      setPixel(ctx, 12, 12, PALETTE.strawberrySeed, 2);
      setPixel(ctx, 16, 14, PALETTE.strawberrySeed, 2);
      setPixel(ctx, 14, 18, PALETTE.strawberrySeed, 2);
      break;
    case 'melon':
      fillRect(ctx, 6, 8, 20, 18, PALETTE.melon);
      fillRect(ctx, 8, 6, 16, 4, PALETTE.melon);
      fillRect(ctx, 12, 8, 2, 16, PALETTE.melonStripe);
      fillRect(ctx, 18, 8, 2, 16, PALETTE.melonStripe);
      break;
    case 'tomato':
      fillRect(ctx, 8, 8, 16, 16, PALETTE.tomato);
      fillRect(ctx, 10, 6, 12, 4, PALETTE.tomato);
      fillRect(ctx, 10, 6, 4, 2, PALETTE.tomatoHighlight);
      fillRect(ctx, 14, 4, 4, 4, PALETTE.leaf);
      break;
    case 'corn':
      fillRect(ctx, 10, 4, 12, 22, PALETTE.corn);
      fillRect(ctx, 8, 8, 4, 14, PALETTE.cornHusk);
      fillRect(ctx, 20, 6, 4, 16, PALETTE.cornHusk);
      // 알갱이
      for (let y = 8; y < 22; y += 3) {
        for (let x = 12; x < 20; x += 3) {
          setPixel(ctx, x, y, PALETTE.cornDark, 2);
        }
      }
      break;
    case 'pumpkin':
      fillRect(ctx, 4, 10, 24, 18, PALETTE.pumpkin);
      fillRect(ctx, 6, 8, 20, 4, PALETTE.pumpkin);
      fillRect(ctx, 12, 10, 2, 16, PALETTE.pumpkinDark);
      fillRect(ctx, 18, 10, 2, 16, PALETTE.pumpkinDark);
      fillRect(ctx, 14, 4, 4, 6, PALETTE.pumpkinStem);
      break;
    case 'eggplant':
      fillRect(ctx, 10, 8, 12, 20, PALETTE.eggplant);
      fillRect(ctx, 12, 6, 8, 4, PALETTE.eggplant);
      fillRect(ctx, 10, 8, 4, 6, PALETTE.eggplantHighlight);
      fillRect(ctx, 14, 4, 4, 4, PALETTE.leaf);
      break;
    case 'cranberry':
      // 여러 개의 작은 열매
      fillRect(ctx, 6, 12, 6, 6, PALETTE.cranberry);
      fillRect(ctx, 14, 8, 6, 6, PALETTE.cranberry);
      fillRect(ctx, 20, 14, 6, 6, PALETTE.cranberry);
      fillRect(ctx, 10, 18, 6, 6, PALETTE.cranberryDark);
      fillRect(ctx, 18, 20, 6, 6, PALETTE.cranberryDark);
      break;
    default:
      fillRect(ctx, 8, 8, 16, 16, PALETTE.leaf);
  }
}

// ===== 건물 스프라이트 생성 =====
export function generateBuildingSprite(buildingType: string): HTMLCanvasElement {
  const cacheKey = `building_${buildingType}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  let width = TILE_SIZE * 3;
  let height = TILE_SIZE * 3;

  if (buildingType === 'house') {
    width = TILE_SIZE * 5;
    height = TILE_SIZE * 4;
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  switch (buildingType) {
    case 'house':
      drawHouse(ctx);
      break;
    case 'shipping_bin':
      drawShippingBin(ctx);
      break;
    case 'shop':
      drawShop(ctx);
      break;
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawHouse(ctx: CanvasRenderingContext2D): void {
  const w = TILE_SIZE * 5;
  const h = TILE_SIZE * 4;

  // 벽
  fillRect(ctx, 16, 48, w - 32, h - 48, PALETTE.woodLight);
  fillRect(ctx, 16, 48, 4, h - 48, PALETTE.woodDark);

  // 지붕
  ctx.fillStyle = PALETTE.roof;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(w / 2, 8);
  ctx.lineTo(w, 56);
  ctx.closePath();
  ctx.fill();

  // 지붕 그림자
  ctx.fillStyle = PALETTE.roofDark;
  ctx.beginPath();
  ctx.moveTo(0, 56);
  ctx.lineTo(w / 2, 8);
  ctx.lineTo(w / 2, 16);
  ctx.lineTo(8, 56);
  ctx.closePath();
  ctx.fill();

  // 문
  fillRect(ctx, w / 2 - 12, h - 40, 24, 38, PALETTE.woodDark);
  fillRect(ctx, w / 2 - 10, h - 38, 20, 34, PALETTE.woodMedium);
  // 손잡이
  fillRect(ctx, w / 2 + 4, h - 22, 4, 4, PALETTE.corn);

  // 창문
  fillRect(ctx, 32, 64, 24, 24, PALETTE.windowFrame);
  fillRect(ctx, 34, 66, 20, 20, PALETTE.window);
  fillRect(ctx, 43, 66, 2, 20, PALETTE.windowFrame);
  fillRect(ctx, 34, 75, 20, 2, PALETTE.windowFrame);

  fillRect(ctx, w - 56, 64, 24, 24, PALETTE.windowFrame);
  fillRect(ctx, w - 54, 66, 20, 20, PALETTE.window);
  fillRect(ctx, w - 45, 66, 2, 20, PALETTE.windowFrame);
  fillRect(ctx, w - 54, 75, 20, 2, PALETTE.windowFrame);
}

function drawShippingBin(ctx: CanvasRenderingContext2D): void {
  // 박스 본체
  fillRect(ctx, 8, 24, 80, 56, PALETTE.woodMedium);
  fillRect(ctx, 8, 24, 80, 8, PALETTE.woodLight);
  fillRect(ctx, 8, 24, 8, 56, PALETTE.woodDark);

  // 뚜껑
  fillRect(ctx, 4, 16, 88, 12, PALETTE.woodDark);
  fillRect(ctx, 4, 16, 88, 4, PALETTE.woodMedium);

  // 금속 장식
  fillRect(ctx, 20, 40, 8, 24, '#A0A0A0');
  fillRect(ctx, 68, 40, 8, 24, '#A0A0A0');
}

function drawShop(ctx: CanvasRenderingContext2D): void {
  const w = TILE_SIZE * 3;
  const h = TILE_SIZE * 3;

  // 벽
  fillRect(ctx, 0, 24, w, h - 24, PALETTE.woodLight);

  // 지붕
  fillRect(ctx, -8, 16, w + 16, 16, PALETTE.roof);
  fillRect(ctx, -8, 16, w + 16, 4, PALETTE.roofDark);

  // 카운터
  fillRect(ctx, 8, h - 24, w - 16, 8, PALETTE.woodMedium);

  // 간판
  fillRect(ctx, w / 2 - 20, 24, 40, 20, PALETTE.uiBg);
  fillRect(ctx, w / 2 - 20, 24, 40, 2, PALETTE.uiBorder);
}

// ===== UI 스프라이트 생성 =====
export function generateUISprite(uiType: string, width: number = 32, height: number = 32): HTMLCanvasElement {
  const cacheKey = `ui_${uiType}_${width}_${height}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  switch (uiType) {
    case 'slot':
      drawSlot(ctx, width, height, false);
      break;
    case 'slot_selected':
      drawSlot(ctx, width, height, true);
      break;
    case 'panel':
      drawPanel(ctx, width, height);
      break;
    case 'button':
      drawButton(ctx, width, height);
      break;
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

function drawSlot(ctx: CanvasRenderingContext2D, w: number, h: number, selected: boolean): void {
  // 배경
  fillRect(ctx, 0, 0, w, h, PALETTE.uiBg);

  // 테두리
  ctx.strokeStyle = selected ? PALETTE.uiSelected : PALETTE.uiBorder;
  ctx.lineWidth = selected ? 3 : 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  // 내부 그림자
  fillRect(ctx, 2, 2, w - 4, 2, PALETTE.uiBgDark);
  fillRect(ctx, 2, 2, 2, h - 4, PALETTE.uiBgDark);
}

function drawPanel(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 배경
  fillRect(ctx, 0, 0, w, h, PALETTE.uiBg);

  // 테두리
  fillRect(ctx, 0, 0, w, 4, PALETTE.uiBorder);
  fillRect(ctx, 0, h - 4, w, 4, PALETTE.uiBorder);
  fillRect(ctx, 0, 0, 4, h, PALETTE.uiBorder);
  fillRect(ctx, w - 4, 0, 4, h, PALETTE.uiBorder);

  // 코너 장식
  fillRect(ctx, 0, 0, 8, 8, PALETTE.uiBorderDark);
  fillRect(ctx, w - 8, 0, 8, 8, PALETTE.uiBorderDark);
  fillRect(ctx, 0, h - 8, 8, 8, PALETTE.uiBorderDark);
  fillRect(ctx, w - 8, h - 8, 8, 8, PALETTE.uiBorderDark);
}

function drawButton(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // 배경
  fillRect(ctx, 0, 0, w, h, PALETTE.uiButton);
  fillRect(ctx, 0, 0, w, 4, PALETTE.uiButtonHover);
  fillRect(ctx, 0, h - 4, w, 4, PALETTE.uiButtonPress);

  // 테두리
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

// ===== NPC 스프라이트 생성 =====
export function generateNPCSprite(npcId: string, direction: Direction): HTMLCanvasElement {
  const cacheKey = `npc_${npcId}_${direction}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  // NPC별 색상
  const npcColors: Record<string, { hair: string; shirt: string }> = {
    pierre: { hair: '#4A3728', shirt: '#2E7D32' },
    robin: { hair: '#D2691E', shirt: '#8B4513' },
  };

  const colors = npcColors[npcId] || { hair: '#333', shirt: '#666' };

  // 그림자
  fillRect(ctx, 8, 28, 16, 4, PALETTE.shadow);

  // 신발
  fillRect(ctx, 10, 26, 4, 3, PALETTE.shoes);
  fillRect(ctx, 18, 26, 4, 3, PALETTE.shoes);

  // 바지
  fillRect(ctx, 10, 20, 12, 7, '#4A4A4A');

  // 상의
  fillRect(ctx, 9, 12, 14, 9, colors.shirt);
  fillRect(ctx, 6, 14, 3, 6, colors.shirt);
  fillRect(ctx, 23, 14, 3, 6, colors.shirt);

  // 손
  if (direction !== 'up') {
    fillRect(ctx, 6, 19, 3, 3, PALETTE.skin);
    fillRect(ctx, 23, 19, 3, 3, PALETTE.skin);
  }

  // 머리 (얼굴)
  fillRect(ctx, 8, 2, 16, 12, PALETTE.skin);

  // 머리카락
  fillRect(ctx, 7, 1, 18, 4, colors.hair);
  fillRect(ctx, 6, 2, 3, 6, colors.hair);
  fillRect(ctx, 23, 2, 3, 6, colors.hair);

  // 눈
  if (direction !== 'up') {
    if (direction === 'down') {
      fillRect(ctx, 11, 6, 3, 3, PALETTE.white);
      fillRect(ctx, 18, 6, 3, 3, PALETTE.white);
      fillRect(ctx, 12, 7, 2, 2, PALETTE.black);
      fillRect(ctx, 19, 7, 2, 2, PALETTE.black);
    } else {
      const eyeX = direction === 'left' ? 10 : 19;
      fillRect(ctx, eyeX, 6, 3, 3, PALETTE.white);
      fillRect(ctx, eyeX + 1, 7, 2, 2, PALETTE.black);
    }
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 캐시 관리 =====
export function clearSpriteCache(): void {
  Object.keys(spriteCache).forEach((key) => delete spriteCache[key]);
}

export function preloadSprites(season: Season): void {
  // 타일 미리 로드
  const tileTypes: TileType[] = ['grass', 'dirt', 'tilled', 'watered', 'water', 'wood_floor'];
  tileTypes.forEach((type) => {
    for (let v = 0; v < 4; v++) {
      generateTileSprite(type, season, v);
    }
  });

  // 플레이어 미리 로드
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  directions.forEach((dir) => {
    for (let f = 0; f < 4; f++) {
      generatePlayerSprite(dir, f, true);
      generatePlayerSprite(dir, f, false);
    }
  });

  // 도구 미리 로드
  const tools = ['hoe', 'wateringCan', 'axe', 'pickaxe', 'scythe'];
  tools.forEach((tool) => generateToolSprite(tool));

  // 작물 미리 로드
  const crops = ['parsnip', 'cauliflower', 'potato', 'strawberry', 'melon', 'tomato', 'corn', 'pumpkin', 'eggplant', 'cranberry'];
  crops.forEach((crop) => {
    for (let s = 0; s <= 5; s++) {
      generateCropSprite(crop, s, 5);
    }
    generateItemSprite(crop);
    generateItemSprite(`${crop}_seeds`);
  });
}
