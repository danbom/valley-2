import { Camera } from './Camera';
import {
  generateTileSprite,
  generatePlayerSprite,
  generateCropSprite,
  generateNPCSprite,
  generateBuildingSprite,
  generateToolSprite,
  generateItemSprite,
  generateUISprite
} from './SpriteGenerator';
import {
  Season,
  Direction,
  FarmTile,
  CropInstance,
  PlayerState,
  NPCState,
  InventorySlot,
  GameTime,
  TileType
} from '@/game/types';
import { PALETTE, getTimeOverlay, getQualityColor } from '@/utils/colors';
import { formatTime, formatGold, getSeasonName, getWeekday } from '@/utils/helpers';
import { CROP_DATA } from '@/game/data/crops';

const TILE_SIZE = 32;

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = camera;
    this.width = canvas.width;
    this.height = canvas.height;

    // 픽셀 아트용 설정
    this.ctx.imageSmoothingEnabled = false;
  }

  // 캔버스 클리어
  clear(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // 배경색으로 클리어
  clearWithColor(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // === 타일맵 렌더링 ===
  renderTileMap(
    tiles: TileType[][],
    farmTiles: FarmTile[][] | null,
    season: Season
  ): void {
    const range = this.camera.getVisibleTileRange(TILE_SIZE);

    for (let y = range.startY; y <= range.endY; y++) {
      for (let x = range.startX; x <= range.endX; x++) {
        if (y >= 0 && y < tiles.length && x >= 0 && x < tiles[0].length) {
          const tileType = tiles[y][x];
          const screenPos = this.camera.tileToScreen(x, y, TILE_SIZE);

          // 기본 타일 렌더링
          let tileToDraw = tileType;

          // 농장 타일이 있으면 해당 타일로 대체
          if (farmTiles && farmTiles[y] && farmTiles[y][x]) {
            const farmTile = farmTiles[y][x];
            if (farmTile.type !== 'grass') {
              tileToDraw = farmTile.isWatered ? 'watered' : farmTile.type;
            }
          }

          const sprite = generateTileSprite(tileToDraw as TileType, season, (x + y) % 4);
          this.ctx.drawImage(
            sprite,
            Math.round(screenPos.x),
            Math.round(screenPos.y),
            TILE_SIZE * this.camera.getZoom(),
            TILE_SIZE * this.camera.getZoom()
          );
        }
      }
    }
  }

  // === 작물 렌더링 ===
  renderCrops(farmTiles: FarmTile[][]): void {
    const range = this.camera.getVisibleTileRange(TILE_SIZE);

    for (let y = range.startY; y <= range.endY; y++) {
      for (let x = range.startX; x <= range.endX; x++) {
        if (farmTiles[y] && farmTiles[y][x]) {
          const farmTile = farmTiles[y][x];
          if (farmTile.crop) {
            this.renderCrop(x, y, farmTile.crop);
          }
        }
      }
    }
  }

  private renderCrop(tileX: number, tileY: number, crop: CropInstance): void {
    const cropData = CROP_DATA[crop.cropId];
    if (!cropData) return;

    const screenPos = this.camera.tileToScreen(tileX, tileY, TILE_SIZE);
    const sprite = generateCropSprite(
      crop.cropId,
      crop.currentStage,
      cropData.growthStages.length
    );

    this.ctx.drawImage(
      sprite,
      Math.round(screenPos.x),
      Math.round(screenPos.y),
      TILE_SIZE * this.camera.getZoom(),
      TILE_SIZE * this.camera.getZoom()
    );
  }

  // === 플레이어 렌더링 ===
  renderPlayer(player: PlayerState): void {
    const screenPos = this.camera.worldToScreen(player.position.x, player.position.y);
    const sprite = generatePlayerSprite(
      player.direction,
      player.animationFrame,
      player.isMoving
    );

    this.ctx.drawImage(
      sprite,
      Math.round(screenPos.x - TILE_SIZE / 2),
      Math.round(screenPos.y - TILE_SIZE / 2),
      TILE_SIZE * this.camera.getZoom(),
      TILE_SIZE * this.camera.getZoom()
    );
  }

  // === NPC 렌더링 ===
  renderNPC(npc: NPCState): void {
    const screenPos = this.camera.worldToScreen(
      npc.position.x * TILE_SIZE + TILE_SIZE / 2,
      npc.position.y * TILE_SIZE + TILE_SIZE / 2
    );
    const sprite = generateNPCSprite(npc.id, npc.direction);

    this.ctx.drawImage(
      sprite,
      Math.round(screenPos.x - TILE_SIZE / 2),
      Math.round(screenPos.y - TILE_SIZE / 2),
      TILE_SIZE * this.camera.getZoom(),
      TILE_SIZE * this.camera.getZoom()
    );
  }

  // === 건물 렌더링 ===
  renderBuilding(type: string, tileX: number, tileY: number): void {
    const sprite = generateBuildingSprite(type);
    const screenPos = this.camera.tileToScreen(tileX, tileY, TILE_SIZE);

    this.ctx.drawImage(
      sprite,
      Math.round(screenPos.x),
      Math.round(screenPos.y - sprite.height + TILE_SIZE),
      sprite.width * this.camera.getZoom(),
      sprite.height * this.camera.getZoom()
    );
  }

  // === 시간대 오버레이 ===
  renderTimeOverlay(hour: number): void {
    const overlay = getTimeOverlay(hour);
    this.ctx.fillStyle = overlay;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // === 날씨 효과 ===
  renderWeather(weather: string, frame: number): void {
    if (weather === 'rainy') {
      this.ctx.fillStyle = PALETTE.rain;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 빗방울
      this.ctx.fillStyle = PALETTE.rainDrop;
      for (let i = 0; i < 100; i++) {
        const x = (i * 37 + frame * 3) % this.width;
        const y = (i * 23 + frame * 8) % this.height;
        this.ctx.fillRect(x, y, 2, 8);
      }
    }
  }

  // === HUD 렌더링 ===
  renderHUD(time: GameTime, energy: number, maxEnergy: number, gold: number): void {
    // 시간/날짜 패널 (우측 상단)
    this.renderTimePanel(time);

    // 에너지 바 (우측)
    this.renderEnergyBar(energy, maxEnergy);

    // 골드 (시간 패널 아래)
    this.renderGold(gold);
  }

  private renderTimePanel(time: GameTime): void {
    const panelWidth = 160;
    const panelHeight = 80;
    const x = this.width - panelWidth - 10;
    const y = 10;

    // 패널 배경
    this.drawPanel(x, y, panelWidth, panelHeight);

    // 시간
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(formatTime(time.hour, time.minute), x + panelWidth / 2, y + 28);

    // 날짜
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      `${getSeasonName(time.season)} ${time.day}일`,
      x + panelWidth / 2,
      y + 50
    );

    // 요일
    this.ctx.fillText(
      `${getWeekday(time.day)}요일`,
      x + panelWidth / 2,
      y + 68
    );

    // 날씨 아이콘 (간단한 표시)
    this.ctx.font = '16px monospace';
    const weatherIcon = time.weather === 'sunny' ? '☀️' : time.weather === 'rainy' ? '🌧️' : '⛈️';
    this.ctx.fillText(weatherIcon, x + panelWidth - 20, y + 28);
  }

  private renderEnergyBar(energy: number, maxEnergy: number): void {
    const barWidth = 24;
    const barHeight = 150;
    const x = this.width - barWidth - 20;
    const y = 110;

    // 배경
    this.ctx.fillStyle = PALETTE.energyBg;
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // 테두리
    this.ctx.strokeStyle = PALETTE.uiBorder;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, barWidth, barHeight);

    // 에너지 양
    const ratio = Math.max(0, energy / maxEnergy);
    const fillHeight = barHeight * ratio;

    // 색상 결정
    let color: string = PALETTE.energyFull;
    if (ratio < 0.25) color = PALETTE.energyLow;
    else if (ratio < 0.5) color = PALETTE.energyMid;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 2, y + barHeight - fillHeight + 2, barWidth - 4, fillHeight - 4);

    // 숫자 표시
    this.ctx.fillStyle = PALETTE.white;
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.floor(energy)}`, x + barWidth / 2, y + barHeight + 15);
  }

  private renderGold(gold: number): void {
    const x = this.width - 170;
    const y = 95;

    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`💰 ${formatGold(gold)}g`, x, y);
  }

  // === 핫바 렌더링 ===
  renderHotbar(inventory: InventorySlot[], selectedIndex: number): void {
    const slotSize = 48;
    const padding = 4;
    const totalSlots = 12;
    const totalWidth = totalSlots * (slotSize + padding) - padding;
    const startX = (this.width - totalWidth) / 2;
    const y = this.height - slotSize - 20;

    for (let i = 0; i < totalSlots; i++) {
      const x = startX + i * (slotSize + padding);
      const isSelected = i === selectedIndex;

      // 슬롯 배경
      const slotSprite = generateUISprite(
        isSelected ? 'slot_selected' : 'slot',
        slotSize,
        slotSize
      );
      this.ctx.drawImage(slotSprite, x, y);

      // 아이템
      const slot = inventory[i];
      if (slot && slot.itemId) {
        this.renderItemInSlot(slot, x + 8, y + 8, slotSize - 16);
      }

      // 단축키 숫자
      this.ctx.fillStyle = PALETTE.uiTextLight;
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${(i + 1) % 10}`, x + slotSize / 2, y + slotSize - 4);
    }
  }

  private renderItemInSlot(slot: InventorySlot, x: number, y: number, size: number): void {
    if (!slot.itemId) return;

    // 아이템 스프라이트
    let sprite: HTMLCanvasElement;
    if (slot.itemId.startsWith('tool_')) {
      sprite = generateToolSprite(slot.itemId.replace('tool_', ''));
    } else {
      sprite = generateItemSprite(slot.itemId);
    }

    this.ctx.drawImage(sprite, x, y, size, size);

    // 수량 표시 (1 초과시)
    if (slot.quantity > 1) {
      this.ctx.fillStyle = PALETTE.white;
      this.ctx.strokeStyle = PALETTE.black;
      this.ctx.lineWidth = 2;
      this.ctx.font = 'bold 12px monospace';
      this.ctx.textAlign = 'right';
      const text = slot.quantity.toString();
      this.ctx.strokeText(text, x + size, y + size);
      this.ctx.fillText(text, x + size, y + size);
    }

    // 품질 표시
    if (slot.quality && slot.quality !== 'normal') {
      const qualityColor = getQualityColor(slot.quality);
      this.ctx.fillStyle = qualityColor;
      this.ctx.beginPath();
      this.ctx.arc(x + size - 4, y + 4, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // === 인벤토리 UI 렌더링 ===
  renderInventory(inventory: InventorySlot[], selectedIndex: number): void {
    const panelWidth = 400;
    const panelHeight = 300;
    const x = (this.width - panelWidth) / 2;
    const y = (this.height - panelHeight) / 2;

    // 반투명 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 패널
    this.drawPanel(x, y, panelWidth, panelHeight);

    // 제목
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('인벤토리', x + panelWidth / 2, y + 30);

    // 슬롯들 (3행 12열)
    const slotSize = 40;
    const padding = 4;
    const cols = 12;
    const rows = 3;
    const gridWidth = cols * (slotSize + padding) - padding;
    const startX = x + (panelWidth - gridWidth) / 2;
    const startY = y + 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const slotIndex = row * cols + col;
        const slotX = startX + col * (slotSize + padding);
        const slotY = startY + row * (slotSize + padding);
        const isSelected = slotIndex === selectedIndex;

        // 슬롯
        const slotSprite = generateUISprite(
          isSelected ? 'slot_selected' : 'slot',
          slotSize,
          slotSize
        );
        this.ctx.drawImage(slotSprite, slotX, slotY);

        // 아이템
        if (inventory[slotIndex] && inventory[slotIndex].itemId) {
          this.renderItemInSlot(inventory[slotIndex], slotX + 4, slotY + 4, slotSize - 8);
        }
      }
    }

    // 선택된 아이템 정보
    const selectedSlot = inventory[selectedIndex];
    if (selectedSlot && selectedSlot.itemId) {
      this.ctx.fillStyle = PALETTE.uiText;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(selectedSlot.itemId, x + panelWidth / 2, y + panelHeight - 40);
    }

    // 닫기 안내
    this.ctx.fillStyle = PALETTE.uiTextLight;
    this.ctx.font = '12px monospace';
    this.ctx.fillText('E 또는 ESC로 닫기', x + panelWidth / 2, y + panelHeight - 15);
  }

  // === 대화창 렌더링 ===
  renderDialogue(npcName: string, text: string): void {
    const panelWidth = 600;
    const panelHeight = 150;
    const x = (this.width - panelWidth) / 2;
    const y = this.height - panelHeight - 80;

    // 패널
    this.drawPanel(x, y, panelWidth, panelHeight);

    // NPC 이름
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(npcName, x + 20, y + 25);

    // 대화 내용
    this.ctx.font = '14px monospace';
    this.wrapText(text, x + 20, y + 50, panelWidth - 40, 20);

    // 진행 안내
    this.ctx.fillStyle = PALETTE.uiTextLight;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Space 또는 Enter로 계속', x + panelWidth - 20, y + panelHeight - 15);
  }

  // === 상점 UI 렌더링 ===
  renderShop(
    shopName: string,
    items: Array<{ itemId: string; price: number; stock: number }>,
    selectedIndex: number,
    playerGold: number
  ): void {
    const panelWidth = 500;
    const panelHeight = 400;
    const x = (this.width - panelWidth) / 2;
    const y = (this.height - panelHeight) / 2;

    // 반투명 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 패널
    this.drawPanel(x, y, panelWidth, panelHeight);

    // 제목
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(shopName, x + panelWidth / 2, y + 30);

    // 소지금
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`소지금: ${formatGold(playerGold)}g`, x + panelWidth - 20, y + 30);

    // 아이템 목록
    const itemHeight = 50;
    const listStartY = y + 60;
    const listHeight = panelHeight - 120;
    const visibleItems = Math.floor(listHeight / itemHeight);

    items.slice(0, visibleItems).forEach((item, i) => {
      const itemY = listStartY + i * itemHeight;
      const isSelected = i === selectedIndex;

      // 선택 하이라이트
      if (isSelected) {
        this.ctx.fillStyle = PALETTE.uiSelectedGlow;
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillRect(x + 10, itemY, panelWidth - 20, itemHeight - 4);
        this.ctx.globalAlpha = 1;
      }

      // 아이템 스프라이트
      const sprite = generateItemSprite(item.itemId);
      this.ctx.drawImage(sprite, x + 20, itemY + 8, 32, 32);

      // 아이템 이름
      this.ctx.fillStyle = PALETTE.uiText;
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(item.itemId, x + 60, itemY + 28);

      // 가격
      const canAfford = playerGold >= item.price;
      this.ctx.fillStyle = canAfford ? PALETTE.uiText : PALETTE.energyLow;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`${item.price}g`, x + panelWidth - 20, itemY + 28);

      // 재고
      if (item.stock !== -1) {
        this.ctx.fillStyle = PALETTE.uiTextLight;
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`재고: ${item.stock}`, x + panelWidth - 20, itemY + 42);
      }
    });

    // 안내
    this.ctx.fillStyle = PALETTE.uiTextLight;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('↑↓: 선택, Enter: 구매, ESC: 닫기', x + panelWidth / 2, y + panelHeight - 15);
  }

  // === 수면/하루 정산 화면 ===
  renderSleepScreen(earnings: number, date: string): void {
    // 페이드 효과
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const panelWidth = 400;
    const panelHeight = 250;
    const x = (this.width - panelWidth) / 2;
    const y = (this.height - panelHeight) / 2;

    // 패널
    this.drawPanel(x, y, panelWidth, panelHeight);

    // 제목
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('하루 정산', x + panelWidth / 2, y + 40);

    // 날짜
    this.ctx.font = '16px monospace';
    this.ctx.fillText(date, x + panelWidth / 2, y + 70);

    // 수익
    this.ctx.font = 'bold 20px monospace';
    this.ctx.fillStyle = earnings > 0 ? PALETTE.energyFull : PALETTE.uiText;
    this.ctx.fillText(`오늘의 수익: ${formatGold(earnings)}g`, x + panelWidth / 2, y + 120);

    // 계속 안내
    this.ctx.fillStyle = PALETTE.uiTextLight;
    this.ctx.font = '14px monospace';
    this.ctx.fillText('클릭하여 계속...', x + panelWidth / 2, y + panelHeight - 30);
  }

  // === 메뉴 화면 ===
  renderMenu(): void {
    // 반투명 배경
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const panelWidth = 300;
    const panelHeight = 250;
    const x = (this.width - panelWidth) / 2;
    const y = (this.height - panelHeight) / 2;

    // 패널
    this.drawPanel(x, y, panelWidth, panelHeight);

    // 제목
    this.ctx.fillStyle = PALETTE.uiText;
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('메뉴', x + panelWidth / 2, y + 40);

    // 메뉴 항목
    const menuItems = ['계속하기', '저장하기', '설정', '타이틀로'];
    menuItems.forEach((item, i) => {
      this.ctx.font = '18px monospace';
      this.ctx.fillStyle = PALETTE.uiText;
      this.ctx.fillText(item, x + panelWidth / 2, y + 90 + i * 35);
    });

    // ESC 안내
    this.ctx.fillStyle = PALETTE.uiTextLight;
    this.ctx.font = '12px monospace';
    this.ctx.fillText('ESC: 닫기', x + panelWidth / 2, y + panelHeight - 15);
  }

  // === 유틸리티 ===
  private drawPanel(x: number, y: number, width: number, height: number): void {
    // 배경
    this.ctx.fillStyle = PALETTE.uiBg;
    this.ctx.fillRect(x, y, width, height);

    // 테두리
    this.ctx.strokeStyle = PALETTE.uiBorder;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(x, y, width, height);

    // 내부 테두리
    this.ctx.strokeStyle = PALETTE.uiBorderDark;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 4, y + 4, width - 8, height - 8);
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = this.ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        this.ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, currentY);
  }

  // 캔버스 크기 변경
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  // 컨텍스트 가져오기
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  // 현재 타일 하이라이트 (도구 사용 시)
  renderTileHighlight(tileX: number, tileY: number, color: string = 'rgba(255, 255, 255, 0.3)'): void {
    const screenPos = this.camera.tileToScreen(tileX, tileY, TILE_SIZE);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.round(screenPos.x),
      Math.round(screenPos.y),
      TILE_SIZE * this.camera.getZoom(),
      TILE_SIZE * this.camera.getZoom()
    );
  }
}
