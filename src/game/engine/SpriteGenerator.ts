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
function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// 픽셀 데이터로 스프라이트 그리기
function drawPixelArt(ctx: CanvasRenderingContext2D, pixelData: string[], palette: Record<string, string>, offsetX = 0, offsetY = 0): void {
  for (let y = 0; y < pixelData.length; y++) {
    const row = pixelData[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      if (char !== ' ' && char !== '.') {
        const color = palette[char];
        if (color) {
          setPixel(ctx, x + offsetX, y + offsetY, color);
        }
      }
    }
  }
}

// ===== 캐릭터 색상 팔레트 (고품질) =====
const CHAR_PALETTE: Record<string, string> = {
  // 머리카락 (적갈색 톤)
  'H': '#8B3A3A',  // 머리카락 기본
  'h': '#6B2A2A',  // 머리카락 그림자
  'L': '#A84848',  // 머리카락 하이라이트

  // 피부
  'S': '#FFE4C4',  // 피부 기본
  's': '#E8C8A8',  // 피부 그림자
  'W': '#FFF0DC',  // 피부 하이라이트

  // 눈
  'E': '#4A2020',  // 눈동자
  'e': '#6B3030',  // 눈 밝은 부분
  'w': '#FFFFFF',  // 눈 흰자/하이라이트

  // 옷 (흰색 상의)
  'C': '#F5F5F0',  // 옷 기본
  'c': '#D8D8D0',  // 옷 그림자
  'V': '#FFFFFF',  // 옷 하이라이트

  // 바지 (청바지)
  'P': '#4A5568',  // 바지 기본
  'p': '#2D3748',  // 바지 그림자

  // 신발
  'B': '#8B4513',  // 신발 기본
  'b': '#5D3010',  // 신발 그림자

  // 귀 (고양이/여우 귀)
  'R': '#C45050',  // 귀 외부
  'r': '#FFB6B6',  // 귀 내부

  // 꼬리
  'T': '#C45050',  // 꼬리 기본
  't': '#A03030',  // 꼬리 그림자

  // 그림자
  'X': 'rgba(0,0,0,0.2)',  // 바닥 그림자

  // 액세서리
  'A': '#FFD700',  // 액세서리 (금색)
  'a': '#B8860B',  // 액세서리 그림자
};

// ===== 플레이어 스프라이트 (정면) =====
const PLAYER_FRONT_SPRITES = [
  // 프레임 0 (기본)
  [
    '........RLLR........',
    '.......RrrrR........',
    '.......HLLLLH.......',
    '......HhHHHHhH......',
    '......HHHHHHHH......',
    '.....HhHHLLHHhH.....',
    '.....HHHHHHHHHH.....',
    '.....SSSwwSSSSS.....',
    '.....SSEeSSEeSS.....',
    '.....SSSSSsSSSS.....',
    '.....sSSSSSSSSs.....',
    '......SSSSSSSS......',
    '......sCCCCCCs......',
    '.....cCCCCCCCCc.....',
    '.....CCCCCCCCCC.....',
    '.....cCCCCCCCCc.....',
    '.....CVCCCCCCVC.....',
    '.....cCCCCCCCCc.....',
    '......CCCCCCCC......',
    '......cPPPPPPc......',
    '.......PPPPPP.......',
    '.......pPPPPp.......',
    '.......PPPPPP.......',
    '.......pPppPp.......',
    '........PP.PP.......',
    '........Pp.pP.......',
    '........BB.BB.......',
    '........Bb.bB.......',
    '........XX.XX.......',
    '........XX.XX.......',
    '........XX.XX.......',
    '.................... ',
  ],
  // 프레임 1 (왼발 앞)
  [
    '........RLLR........',
    '.......RrrrR........',
    '.......HLLLLH.......',
    '......HhHHHHhH......',
    '......HHHHHHHH......',
    '.....HhHHLLHHhH.....',
    '.....HHHHHHHHHH.....',
    '.....SSSwwSSSSS.....',
    '.....SSEeSSEeSS.....',
    '.....SSSSSsSSSS.....',
    '.....sSSSSSSSSs.....',
    '......SSSSSSSS......',
    '......sCCCCCCs......',
    '.....cCCCCCCCCc.....',
    '.....CCCCCCCCCC.....',
    '.....cCCCCCCCCc.....',
    '.....CVCCCCCCVC.....',
    '.....cCCCCCCCCc.....',
    '......CCCCCCCC......',
    '......cPPPPPPc......',
    '.......PPPPPP.......',
    '.......pPPPPp.......',
    '......PPPP.PP.......',
    '......pPp..Pp.......',
    '.......PP..PP.......',
    '.......Pp..pP.......',
    '.......BB..BB.......',
    '.......Bb..bB.......',
    '.......XX..XX.......',
    '.....................',
    '.....................',
    '.....................',
  ],
  // 프레임 2 (기본)
  [
    '........RLLR........',
    '.......RrrrR........',
    '.......HLLLLH.......',
    '......HhHHHHhH......',
    '......HHHHHHHH......',
    '.....HhHHLLHHhH.....',
    '.....HHHHHHHHHH.....',
    '.....SSSwwSSSSS.....',
    '.....SSEeSSEeSS.....',
    '.....SSSSSsSSSS.....',
    '.....sSSSSSSSSs.....',
    '......SSSSSSSS......',
    '......sCCCCCCs......',
    '.....cCCCCCCCCc.....',
    '.....CCCCCCCCCC.....',
    '.....cCCCCCCCCc.....',
    '.....CVCCCCCCVC.....',
    '.....cCCCCCCCCc.....',
    '......CCCCCCCC......',
    '......cPPPPPPc......',
    '.......PPPPPP.......',
    '.......pPPPPp.......',
    '.......PPPPPP.......',
    '.......pPppPp.......',
    '........PP.PP.......',
    '........Pp.pP.......',
    '........BB.BB.......',
    '........Bb.bB.......',
    '........XX.XX.......',
    '.....................',
    '.....................',
    '.....................',
  ],
  // 프레임 3 (오른발 앞)
  [
    '........RLLR........',
    '.......RrrrR........',
    '.......HLLLLH.......',
    '......HhHHHHhH......',
    '......HHHHHHHH......',
    '.....HhHHLLHHhH.....',
    '.....HHHHHHHHHH.....',
    '.....SSSwwSSSSS.....',
    '.....SSEeSSEeSS.....',
    '.....SSSSSsSSSS.....',
    '.....sSSSSSSSSs.....',
    '......SSSSSSSS......',
    '......sCCCCCCs......',
    '.....cCCCCCCCCc.....',
    '.....CCCCCCCCCC.....',
    '.....cCCCCCCCCc.....',
    '.....CVCCCCCCVC.....',
    '.....cCCCCCCCCc.....',
    '......CCCCCCCC......',
    '......cPPPPPPc......',
    '.......PPPPPP.......',
    '.......pPPPPp.......',
    '.......PP.PPPP......',
    '.......pP..pPp......',
    '.......PP..PP.......',
    '.......Pp..pP.......',
    '.......BB..BB.......',
    '.......Bb..bB.......',
    '.......XX..XX.......',
    '.....................',
    '.....................',
    '.....................',
  ],
];

// ===== 플레이어 스프라이트 (뒷면) =====
const PLAYER_BACK_SPRITES = [
  [
    '........RLLR........',
    '.......RrrrR........',
    '.......HLLLLH.......',
    '......HhHHHHhH......',
    '......HHHHHHHH......',
    '.....HhHHHHHHhH.....',
    '.....HHHHHHHHHH.....',
    '.....hHHHHHHHHh.....',
    '.....HHHHHHHHHH.....',
    '.....hHHHHHHHHh.....',
    '.....HHHHHHHHHHh....',
    '......HHHHHHHH......',
    '......sCCCCCCs......',
    '.....cCCCCCCCCc.....',
    '.....CCCCCCCCCC.....',
    '.....cCCCCCCCCc.....',
    '.....CVCCCCCCVC.....',
    '.....cCCCCCCCCc.....',
    '......CCCCCCCC......',
    '......cPPPPPPc......',
    '.......PPPPPP.......',
    '.......pPPPPp.......',
    '.......PPPPPP.......',
    '.......pPppPp.......',
    '........PP.PP.......',
    '........Pp.pP.......',
    '........BB.BB.......',
    '........Bb.bB.......',
    '........XX.XX.......',
    '.....................',
    '.....................',
    '.....................',
  ],
];

// ===== 플레이어 스프라이트 (좌측) =====
const PLAYER_LEFT_SPRITES = [
  [
    '.........RLR........',
    '........RrrR........',
    '........HLLLH.......',
    '.......HhHHHhH......',
    '.......HHHHHHH......',
    '......HhHHLHHh......',
    '......HHHHHHHH......',
    '......SSwSSSS.......',
    '......SEeSSSSS......',
    '......SSSSSSSS......',
    '......sSSSSSSs......',
    '.......SSSSSS.......',
    '.......sCCCCCs......',
    '......SSCCCCCCc.....',
    '......SCCCCCCCC.....',
    '......sCCCCCCCc.....',
    '......SCVCCCCVC.....',
    '......SCCCCCCCc.....',
    '.......CCCCCCC......',
    '.......cPPPPPc......',
    '........PPPPP.......',
    '........pPPPp.......',
    '........PPPPP.......',
    '........pPpPp.......',
    '.........PPPP.......',
    '.........PppP.......',
    '.........BBBB.......',
    '.........BbbB.......',
    '.........XXXX.......',
    '.....................',
    '.....................',
    '.....................',
  ],
];

// ===== 플레이어 스프라이트 (우측) =====
const PLAYER_RIGHT_SPRITES = [
  [
    '........RLR.........',
    '........RrrR........',
    '.......HLLLH........',
    '......HhHHHhH.......',
    '......HHHHHHH.......',
    '......hHHLHHhH......',
    '......HHHHHHHH......',
    '.......SSSSwSS......',
    '.......SSSSSeES.....',
    '......SSSSSSSS......',
    '......sSSSSSSs......',
    '.......SSSSSS.......',
    '......sCCCCCs.......',
    '.....cCCCCCCSS......',
    '.....CCCCCCCCS......',
    '.....cCCCCCCCs......',
    '.....CVCCCCVCS......',
    '.....cCCCCCCCS......',
    '......CCCCCCC.......',
    '......cPPPPPc.......',
    '.......PPPPP........',
    '.......pPPPp........',
    '.......PPPPP........',
    '.......pPpPp........',
    '.......PPPP.........',
    '.......PppP.........',
    '.......BBBB.........',
    '.......BbbB.........',
    '.......XXXX.........',
    '.....................',
    '.....................',
    '.....................',
  ],
];

// ===== 플레이어 스프라이트 생성 =====
export function generatePlayerSprite(direction: Direction, frame: number, isMoving: boolean): HTMLCanvasElement {
  const frameIndex = isMoving ? Math.floor(frame) % 4 : 0;
  const cacheKey = `player_${direction}_${frameIndex}_${isMoving}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  let sprites: string[][];
  switch (direction) {
    case 'up':
      sprites = PLAYER_BACK_SPRITES;
      break;
    case 'down':
      sprites = PLAYER_FRONT_SPRITES;
      break;
    case 'left':
      sprites = PLAYER_LEFT_SPRITES;
      break;
    case 'right':
      sprites = PLAYER_RIGHT_SPRITES;
      break;
  }

  const spriteData = sprites[frameIndex % sprites.length];

  // 스프라이트 데이터를 20x32에서 32x32로 센터링
  const offsetX = 6;
  const offsetY = 0;

  drawPixelArt(ctx, spriteData, CHAR_PALETTE, offsetX, offsetY);

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 타일 팔레트 =====
const TILE_PALETTE: Record<string, string> = {
  // 잔디
  'G': '#7CCD7C',  // 잔디 기본
  'g': '#6BB86B',  // 잔디 그림자
  'D': '#8FD88F',  // 잔디 하이라이트

  // 흙
  'E': '#C4A574',  // 흙 기본
  'e': '#A08050',  // 흙 그림자
  'F': '#D4B584',  // 흙 하이라이트

  // 돌
  'S': '#9898A0',  // 돌 기본
  's': '#787880',  // 돌 그림자
  'W': '#B8B8C0',  // 돌 하이라이트

  // 꽃
  'R': '#FF6B6B',  // 빨간 꽃
  'Y': '#FFD93D',  // 노란 꽃
  'P': '#C9A0DC',  // 보라 꽃
  'O': '#FFA07A',  // 주황 꽃

  // 줄기/잎
  'L': '#228B22',  // 줄기
  'l': '#1E7A1E',  // 줄기 그림자

  // 물
  'B': '#6CA6CD',  // 물 기본
  'b': '#5A8FB5',  // 물 그림자
  'w': '#87CEEB',  // 물 하이라이트
};

// ===== 잔디 타일 =====
const GRASS_TILE = [
  'GGDGGgGGGDGGgGGGDGGGgGGGDGGGgGGG',
  'GgGGGGDGGGGGGDGgGGGGGGDGGGGGGDGg',
  'GGGGgGGGGGgGGGGGGGgGGGGGGgGGGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGDGGGGGGGDGGGGGGGDGGGGGGGDGG',
  'gGGGGGGgGGGGGGGgGGGGGGGgGGGGGGGg',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGG',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGGGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGGGGGGGgGGGGGGG',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGG',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGGGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGGGGGGGgGGGGGGG',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGG',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGGGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGGGGGGGgGGGGGGG',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGG',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
];

// ===== 꽃이 있는 잔디 타일 =====
const GRASS_FLOWER_TILE = [
  'GGDGGgGGGDGGgGGGDGGGgGGGDGGGgGGG',
  'GgGGGGDGGGGGGDGgGGGGGGDGGGGGGDGg',
  'GGGGgGGGGGgGGGGGGGgGGGGGGgGGGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGDGGGGGGGDGGGGGGGDGGGGGGGDGG',
  'gGGGGGGgGGLGGGGgGGGGGGGgGGGGGGGg',
  'GGGDGGGGGLRLGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGLGGGDGGGGGGGGGGGGGGDGg',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGLGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGLYLGGGgGGGGGGG',
  'GGGDGGGGGGDGGGGGGGLGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGg',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGGGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGGGGGGGgGGLGGGG',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDLPLGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGLGDGg',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
  'GGGGGGDGGGGGGGDGGGGGGGDGGGGGGGDG',
  'gGGGGGGGgGGGGGGGgGGGGGGGgGGGGGGG',
  'GGGDGGGGGGDGGGGGGGDGGGGGGDGGGGGG',
  'GGGGGGGGGGGGGGDGGGGGGGGGGGGGGDGg',
  'GgGGGGDGgGGGGGGGgGGGGDGgGGGGGGGg',
  'GGGGgGGGGGGGgGGGGGGgGGGGGGGgGGGG',
  'GDGGGGGGDGGGGGGGDGGGGGGGDGGGGGGG',
];

// ===== 흙 타일 =====
const DIRT_TILE = [
  'EEFEEeEEEFEEeEEEFEEEeEEEFEEEeEEE',
  'EeEEEEFEEEEEEFEeEEEEEEFEEEEEEFEe',
  'EEEEeEEEEEeEEEEEEEeEEEEEEeEEEEEE',
  'EFEEEEEEFEEEEEEEFEEEEEEEFEEEEEEE',
  'EEEEEFEEEEEEEFEEEEEEEFEEEEEEEFEe',
  'eEEEEEEeEEEEEEEeEEEEEEEeEEEEEEEe',
  'EEEFEEEEEEFEEEEEEEFEEEEEEFEEEEEe',
  'EEEEEEEEEEEEEEFEEEEEEEEEEEEEEFEe',
  'EeEEEEFEeEEEEEEEeEEEEFEeEEEEEEEe',
  'EEEEeEEEEEEEeEEEEEEeEEEEEEEeEEEE',
  'EFEEEEEEFEEEEEEEFEEEEEEEFEEEEEEe',
  'EEEEEEFEEEEEEEFEEEEEEEFEEEEEEEFe',
  'eEEEEEEEeEEEEEEEeEEEEEEEeEEEEEEe',
  'EEEFEEEEEEFEEEEEEEFEEEEEEFEEEEEe',
  'EEEEEEEEEEEEEEFEEEEEEEEEEEEEEFEe',
  'EeEEEEFEeEEEEEEEeEEEEFEeEEEEEEEe',
  'EEEEeEEEEEEEeEEEEEEeEEEEEEEeEEEE',
  'EFEEEEEEFEEEEEEEFEEEEEEEFEEEEEEe',
  'EEEEEEFEEEEEEEFEEEEEEEFEEEEEEEFe',
  'eEEEEEEEeEEEEEEEeEEEEEEEeEEEEEEe',
  'EEEFEEEEEEFEEEEEEEFEEEEEEFEEEEEe',
  'EEEEEEEEEEEEEEFEEEEEEEEEEEEEEFEe',
  'EeEEEEFEeEEEEEEEeEEEEFEeEEEEEEEe',
  'EEEEeEEEEEEEeEEEEEEeEEEEEEEeEEEE',
  'EFEEEEEEFEEEEEEEFEEEEEEEFEEEEEEe',
  'EEEEEEFEEEEEEEFEEEEEEEFEEEEEEEFe',
  'eEEEEEEEeEEEEEEEeEEEEEEEeEEEEEEe',
  'EEEFEEEEEEFEEEEEEEFEEEEEEFEEEEEe',
  'EEEEEEEEEEEEEEFEEEEEEEEEEEEEEFEe',
  'EeEEEEFEeEEEEEEEeEEEEFEeEEEEEEEe',
  'EEEEeEEEEEEEeEEEEEEeEEEEEEEeEEEE',
  'EFEEEEEEFEEEEEEEFEEEEEEEFEEEEEEe',
];

// ===== 타일 스프라이트 생성 =====
export function generateTileSprite(tileType: TileType, season: Season, variant: number = 0): HTMLCanvasElement {
  const cacheKey = `tile_${tileType}_${season}_${variant}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  // 계절별 색상 조정
  const seasonalPalette = { ...TILE_PALETTE };
  const grassColor = getSeasonalGrassColor(season);
  seasonalPalette['G'] = grassColor;
  seasonalPalette['g'] = adjustColor(grassColor, -20);
  seasonalPalette['D'] = adjustColor(grassColor, 20);

  switch (tileType) {
    case 'grass':
      if (variant % 3 === 0) {
        drawPixelArt(ctx, GRASS_FLOWER_TILE, seasonalPalette, 0, 0);
      } else {
        drawPixelArt(ctx, GRASS_TILE, seasonalPalette, 0, 0);
      }
      break;
    case 'dirt':
    case 'tilled':
      drawPixelArt(ctx, DIRT_TILE, seasonalPalette, 0, 0);
      if (tileType === 'tilled') {
        // 경작된 흙 무늬 추가
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = '#8B6914';
          ctx.fillRect(4 + i * 7, 8, 5, 2);
          ctx.fillRect(4 + i * 7, 16, 5, 2);
          ctx.fillRect(4 + i * 7, 24, 5, 2);
        }
      }
      break;
    case 'watered':
      drawPixelArt(ctx, DIRT_TILE, seasonalPalette, 0, 0);
      // 물을 준 흙 (더 어둡게)
      ctx.fillStyle = 'rgba(70, 50, 30, 0.4)';
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#5A4010';
        ctx.fillRect(4 + i * 7, 8, 5, 2);
        ctx.fillRect(4 + i * 7, 16, 5, 2);
        ctx.fillRect(4 + i * 7, 24, 5, 2);
      }
      break;
    case 'water':
      ctx.fillStyle = TILE_PALETTE['B'];
      ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      // 물결 무늬
      ctx.fillStyle = TILE_PALETTE['w'];
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(2 + i * 8, 6 + (variant % 2) * 4, 4, 2);
        ctx.fillRect(6 + i * 8, 18 + (variant % 2) * 4, 4, 2);
      }
      ctx.fillStyle = TILE_PALETTE['b'];
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(4 + i * 10, 12, 3, 2);
        ctx.fillRect(8 + i * 10, 26, 3, 2);
      }
      break;
    default:
      // 기본 잔디
      drawPixelArt(ctx, GRASS_TILE, seasonalPalette, 0, 0);
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// 색상 밝기 조정 헬퍼
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ===== 돌/바위 스프라이트 =====
const ROCK_SMALL = [
  '......SSSSS.....',
  '.....SWWWSSs....',
  '....SWWSSSSs....',
  '....SSSSSSSs....',
  '....sSSSSSss....',
  '.....sssss......',
];

const ROCK_LARGE = [
  '......SSSSSS........',
  '.....SWWWWSSs.......',
  '....SWWSSSSS s......',
  '....SSSSSSSSSs......',
  '....SSSSSSSSSs......',
  '....sSSSSSSSss......',
  '.....ssssssss.......',
];

// ===== 나무 스프라이트 =====
const TREE_PALETTE: Record<string, string> = {
  'T': '#228B22',  // 잎 기본
  't': '#1B6B1B',  // 잎 그림자
  'L': '#32CD32',  // 잎 하이라이트
  'B': '#8B4513',  // 나무껍질
  'b': '#5D3510',  // 나무껍질 그림자
  'W': '#A0522D',  // 나무껍질 하이라이트
};

const TREE_SPRITE = [
  '.........TTTTT..........',
  '........TTLLTTT.........',
  '.......TTTTTTTTTT.......',
  '......TTTLLTTTTTT.......',
  '.....TTTTTTTtTTTTT......',
  '....TTTTLTTTtTTTTTT.....',
  '...TTTTTTTTTtTTLTTTT....',
  '..TTTLTTTTTTtTTTTTTTT...',
  '..TTTTTTTTTTtTTTTTTTT...',
  '.TTTTTTTLTTTtTTTTTTTTT..',
  '.tTTTTTTTTTTtTTTLTTTTt..',
  '..tTTTTTTTTTtTTTTTTTt...',
  '...tTTTTTTTTtTTTTTTt....',
  '....ttTTTTTTtTTTTtt.....',
  '.......tTTTTTTTt........',
  '..........BB............',
  '.........BWBb...........',
  '.........BBBb...........',
  '..........Bb............',
  '..........Bb............',
];

// ===== 건물/구조물 스프라이트 =====
export function generateBuildingSprite(buildingType: string): HTMLCanvasElement {
  const cacheKey = `building_${buildingType}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  // 건물은 여러 타일에 걸쳐 그려지므로 더 큰 캔버스 사용
  const size = buildingType === 'house' ? 96 : 64;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d')!;

  switch (buildingType) {
    case 'house':
      // 집 지붕
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.moveTo(48, 8);
      ctx.lineTo(8, 40);
      ctx.lineTo(88, 40);
      ctx.closePath();
      ctx.fill();

      // 지붕 하이라이트
      ctx.fillStyle = '#A52A2A';
      ctx.beginPath();
      ctx.moveTo(48, 8);
      ctx.lineTo(48, 40);
      ctx.lineTo(88, 40);
      ctx.closePath();
      ctx.fill();

      // 집 본체
      ctx.fillStyle = '#F5DEB3';
      ctx.fillRect(16, 40, 64, 48);

      // 문
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(40, 56, 16, 32);
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(42, 58, 12, 28);

      // 창문
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(22, 50, 12, 12);
      ctx.fillRect(62, 50, 12, 12);
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(27, 50, 2, 12);
      ctx.fillRect(22, 55, 12, 2);
      ctx.fillRect(67, 50, 2, 12);
      ctx.fillRect(62, 55, 12, 2);
      break;

    case 'shipping_bin':
      // 출하함
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(8, 16, 48, 40);
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(10, 18, 44, 4);
      ctx.fillStyle = '#5D3510';
      ctx.fillRect(8, 52, 48, 4);
      // 뚜껑
      ctx.fillStyle = '#654321';
      ctx.fillRect(4, 8, 56, 10);
      break;

    case 'shop_counter':
      ctx.fillStyle = '#DEB887';
      ctx.fillRect(0, 16, 64, 32);
      ctx.fillStyle = '#D2691E';
      ctx.fillRect(0, 44, 64, 4);
      break;
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 작물 스프라이트 =====
const CROP_COLORS: Record<string, { stem: string; fruit: string; highlight: string }> = {
  parsnip: { stem: '#228B22', fruit: '#F5DEB3', highlight: '#FFFACD' },
  cauliflower: { stem: '#228B22', fruit: '#F5F5F5', highlight: '#FFFFFF' },
  potato: { stem: '#228B22', fruit: '#D2691E', highlight: '#DEB887' },
  strawberry: { stem: '#228B22', fruit: '#FF4444', highlight: '#FF6666' },
  melon: { stem: '#228B22', fruit: '#90EE90', highlight: '#98FB98' },
  tomato: { stem: '#228B22', fruit: '#FF6347', highlight: '#FF7F50' },
  corn: { stem: '#228B22', fruit: '#FFD700', highlight: '#FFEC8B' },
  pumpkin: { stem: '#228B22', fruit: '#FF8C00', highlight: '#FFA500' },
  eggplant: { stem: '#228B22', fruit: '#8B008B', highlight: '#9932CC' },
  cranberry: { stem: '#228B22', fruit: '#DC143C', highlight: '#FF1493' },
};

export function generateCropSprite(cropId: string, stage: number, maxStage: number): HTMLCanvasElement {
  const cacheKey = `crop_${cropId}_${stage}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  const colors = CROP_COLORS[cropId] || CROP_COLORS.parsnip;
  const growthPercent = stage / maxStage;

  if (growthPercent < 0.25) {
    // 씨앗/새싹 단계
    ctx.fillStyle = colors.stem;
    ctx.fillRect(14, 26, 4, 6);
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(12, 22, 8, 4);
  } else if (growthPercent < 0.5) {
    // 성장 중
    ctx.fillStyle = colors.stem;
    ctx.fillRect(14, 20, 4, 12);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(10, 16, 12, 6);
    ctx.fillRect(8, 18, 4, 4);
    ctx.fillRect(20, 18, 4, 4);
  } else if (growthPercent < 0.75) {
    // 거의 다 자람
    ctx.fillStyle = colors.stem;
    ctx.fillRect(14, 14, 4, 18);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(8, 10, 16, 8);
    ctx.fillRect(6, 12, 4, 6);
    ctx.fillRect(22, 12, 4, 6);
  } else {
    // 완전히 자람 (수확 가능)
    ctx.fillStyle = colors.stem;
    ctx.fillRect(14, 16, 4, 16);
    ctx.fillStyle = '#228B22';
    ctx.fillRect(8, 8, 16, 10);
    ctx.fillRect(4, 12, 6, 6);
    ctx.fillRect(22, 12, 6, 6);

    // 열매
    ctx.fillStyle = colors.fruit;
    ctx.beginPath();
    ctx.arc(16, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.highlight;
    ctx.beginPath();
    ctx.arc(14, 8, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== NPC 스프라이트 =====
const NPC_PALETTE: Record<string, Record<string, string>> = {
  pierre: {
    'H': '#4A3728',  // 머리카락
    'h': '#362818',
    'L': '#5A4738',
    'S': '#FFE4C4',
    's': '#E8C8A8',
    'W': '#FFF0DC',
    'E': '#2F4F4F',
    'e': '#3F5F5F',
    'w': '#FFFFFF',
    'C': '#228B22',  // 초록 앞치마
    'c': '#1B6B1B',
    'V': '#32CD32',
    'P': '#4A5568',
    'p': '#2D3748',
    'B': '#2F1810',
    'b': '#1F1008',
    'X': 'rgba(0,0,0,0.2)',
  },
  robin: {
    'H': '#FF6B35',  // 주황 머리카락
    'h': '#E55525',
    'L': '#FF8B55',
    'S': '#FFE4C4',
    's': '#E8C8A8',
    'W': '#FFF0DC',
    'E': '#4169E1',
    'e': '#5179F1',
    'w': '#FFFFFF',
    'C': '#4682B4',  // 파란 옷
    'c': '#36728A',
    'V': '#5692C4',
    'P': '#8B4513',
    'p': '#6B3503',
    'B': '#2F1810',
    'b': '#1F1008',
    'X': 'rgba(0,0,0,0.2)',
  },
};

export function generateNPCSprite(npcId: string, direction: Direction, frame: number): HTMLCanvasElement {
  const cacheKey = `npc_${npcId}_${direction}_${frame}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  const palette = NPC_PALETTE[npcId] || NPC_PALETTE.pierre;

  // NPC도 플레이어와 비슷한 형태로 그림 (귀 없음)
  const npcSprite = [
    '.....................',
    '.......HLLLLH........',
    '......HhHHHHhH.......',
    '......HHHHHHHH.......',
    '.....HhHHLLHHhH......',
    '.....HHHHHHHHHH......',
    '.....SSSwwSSSSS......',
    '.....SSEeSSEeSS......',
    '.....SSSSSsSSSS......',
    '.....sSSSSSSSSs......',
    '......SSSSSSSS.......',
    '......sCCCCCCs.......',
    '.....cCCCCCCCCc......',
    '.....CCCCCCCCCC......',
    '.....cCCCCCCCCc......',
    '.....CVCCCCCCVC......',
    '.....cCCCCCCCCc......',
    '......CCCCCCCC.......',
    '......cPPPPPPc.......',
    '.......PPPPPP........',
    '.......pPPPPp........',
    '.......PPPPPP........',
    '.......pPppPp........',
    '........PP.PP........',
    '........Pp.pP........',
    '........BB.BB........',
    '........Bb.bB........',
    '........XX.XX........',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
  ];

  drawPixelArt(ctx, npcSprite, palette, 5, 0);

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 도구 스프라이트 =====
export function generateToolSprite(toolType: string): HTMLCanvasElement {
  const cacheKey = `tool_${toolType}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  switch (toolType) {
    case 'hoe':
      // 괭이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(14, 8, 4, 20);
      ctx.fillStyle = '#A9A9A9';
      ctx.fillRect(8, 4, 16, 6);
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(10, 5, 12, 3);
      break;
    case 'wateringCan':
      // 물뿌리개
      ctx.fillStyle = '#4682B4';
      ctx.fillRect(8, 12, 16, 14);
      ctx.fillRect(22, 16, 6, 4);
      ctx.fillStyle = '#5F9EA0';
      ctx.fillRect(10, 14, 12, 10);
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(12, 8, 8, 6);
      break;
    case 'axe':
      // 도끼
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(14, 10, 4, 18);
      ctx.fillStyle = '#A9A9A9';
      ctx.fillRect(6, 4, 14, 10);
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(8, 6, 10, 6);
      break;
    case 'pickaxe':
      // 곡괭이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(14, 10, 4, 18);
      ctx.fillStyle = '#A9A9A9';
      ctx.fillRect(4, 4, 24, 6);
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(6, 5, 20, 3);
      break;
    case 'scythe':
      // 낫
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(18, 8, 4, 20);
      ctx.fillStyle = '#A9A9A9';
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.quadraticCurveTo(6, 16, 18, 12);
      ctx.lineTo(18, 8);
      ctx.quadraticCurveTo(8, 10, 8, 4);
      ctx.fill();
      break;
    default:
      ctx.fillStyle = '#808080';
      ctx.fillRect(8, 8, 16, 16);
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 아이템 스프라이트 =====
export function generateItemSprite(itemId: string): HTMLCanvasElement {
  const cacheKey = `item_${itemId}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(TILE_SIZE, TILE_SIZE);
  const ctx = canvas.getContext('2d')!;

  // 씨앗류
  if (itemId.includes('_seeds')) {
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(10, 10, 12, 14);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(12, 12, 8, 10);
    // 씨앗 그림
    ctx.fillStyle = '#556B2F';
    ctx.beginPath();
    ctx.arc(16, 17, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // 작물류
  else if (CROP_COLORS[itemId]) {
    const colors = CROP_COLORS[itemId];
    ctx.fillStyle = colors.fruit;
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.highlight;
    ctx.beginPath();
    ctx.arc(12, 12, 4, 0, Math.PI * 2);
    ctx.fill();
    // 꼭지
    ctx.fillStyle = '#228B22';
    ctx.fillRect(14, 4, 4, 4);
  }
  // 기본 아이템
  else {
    ctx.fillStyle = '#808080';
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = '#A0A0A0';
    ctx.fillRect(10, 10, 12, 12);
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== UI 스프라이트 =====
export function generateUISprite(uiType: string, width: number, height: number): HTMLCanvasElement {
  const cacheKey = `ui_${uiType}_${width}_${height}`;
  if (spriteCache[cacheKey]) return spriteCache[cacheKey];

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  switch (uiType) {
    case 'panel':
      // 패널 배경
      ctx.fillStyle = '#2D2D44';
      ctx.fillRect(0, 0, width, height);
      // 테두리
      ctx.strokeStyle = '#5D5D8A';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      // 내부 테두리
      ctx.strokeStyle = '#3D3D5A';
      ctx.strokeRect(3, 3, width - 6, height - 6);
      break;
    case 'slot':
      // 슬롯 배경
      ctx.fillStyle = '#1A1A2E';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#4A4A6A';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, height);
      break;
    case 'slot_selected':
      // 선택된 슬롯
      ctx.fillStyle = '#2A2A4E';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      break;
    case 'button':
      // 버튼
      ctx.fillStyle = '#4A4A6A';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#5A5A7A';
      ctx.fillRect(2, 2, width - 4, height / 2 - 2);
      ctx.strokeStyle = '#6A6A8A';
      ctx.strokeRect(0, 0, width, height);
      break;
  }

  spriteCache[cacheKey] = canvas;
  return canvas;
}

// ===== 캐시 관리 =====
export function clearSpriteCache(): void {
  Object.keys(spriteCache).forEach(key => delete spriteCache[key]);
}

export function preloadSprites(season: Season): void {
  // 타일 프리로드
  const tileTypes: TileType[] = ['grass', 'dirt', 'tilled', 'watered', 'water'];
  tileTypes.forEach(type => {
    for (let v = 0; v < 4; v++) {
      generateTileSprite(type, season, v);
    }
  });

  // 플레이어 프리로드
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  directions.forEach(dir => {
    for (let f = 0; f < 4; f++) {
      generatePlayerSprite(dir, f, true);
      generatePlayerSprite(dir, f, false);
    }
  });
}
