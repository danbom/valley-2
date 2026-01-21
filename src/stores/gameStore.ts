import { create } from 'zustand';
import {
  PlayerState,
  GameTime,
  InventorySlot,
  FarmTile,
  NPCState,
  UIScreen,
  DialogueState,
  Direction,
  TileType,
  CropQuality,
  GameStatistics,
  Position
} from '@/game/types';
import { createInitialGameTime, updateTime, advanceDay, isPastMidnight, calculateSleepEnergyPenalty, isNewWeek } from '@/game/systems/TimeSystem';
import { createInitialInventory, addItem, removeItem, removeItemById, getSlot, HOTBAR_SIZE } from '@/game/systems/InventorySystem';
import { createInitialEnergyState, consumeToolEnergy, consumeFood, restoreFromSleep, restoreFromPassOut, EnergyState } from '@/game/systems/EnergySystem';
import { tillSoil, waterTile, plantSeed, harvestCrop, processDailyGrowth, canTill, canWater, canPlant, canHarvest } from '@/game/systems/FarmingSystem';
import { createFarmTileMap, createFarmTiles, PLAYER_START_POSITION, FARM_WIDTH, FARM_HEIGHT, TILE_SIZE, isTileWalkable } from '@/game/data/maps/farm';
import { createInitialNPCStates, getRandomDialogue, getRandomGreeting, getGiftReaction, TALK_BONUS, WEEKLY_GIFT_LIMIT } from '@/game/data/npcs';
import { saveGame, loadGame, createSaveData, createInitialStatistics, hasSaveData } from '@/game/systems/SaveSystem';
import { getToolTypeFromItemId } from '@/game/data/tools';
import { isSeed, isEdible, getSellPrice, getItemData } from '@/game/data/items';
import { getCropIdFromSeedId } from '@/game/data/crops';
import { getShopItems, canPurchase } from '@/game/data/shop';
import { getFacingTile } from '@/utils/helpers';

// 게임 상태 인터페이스
interface GameStore {
  // === 게임 상태 ===
  isRunning: boolean;
  isPaused: boolean;
  isLoaded: boolean;
  activeUI: UIScreen;

  // === 플레이어 ===
  playerName: string;
  player: PlayerState;
  energy: EnergyState;

  // === 시간 ===
  time: GameTime;

  // === 인벤토리 ===
  inventory: InventorySlot[];
  hotbarSelection: number;
  shippingBin: InventorySlot[];
  todayEarnings: number;

  // === 맵/농장 ===
  baseTiles: TileType[][];
  farmTiles: FarmTile[][];

  // === NPC ===
  npcs: NPCState[];
  dialogue: DialogueState | null;

  // === 상점 ===
  shopItems: Array<{ itemId: string; price: number; stock: number }>;
  shopSelection: number;

  // === 통계/플래그 ===
  statistics: GameStatistics;
  flags: Record<string, boolean>;

  // === 액션: 게임 제어 ===
  startGame: (playerName: string) => void;
  loadSavedGame: () => boolean;
  saveCurrentGame: () => boolean;
  pauseGame: () => void;
  resumeGame: () => void;
  setActiveUI: (ui: UIScreen) => void;
  closeUI: () => void;

  // === 액션: 플레이어 ===
  movePlayer: (direction: Direction | Direction[], deltaTime: number) => void;
  setPlayerDirection: (direction: Direction) => void;
  updatePlayerAnimation: (deltaTime: number) => void;

  // === 액션: 시간 ===
  updateGameTime: (deltaTime: number) => void;
  sleep: () => void;

  // === 액션: 인벤토리 ===
  setHotbarSelection: (index: number) => void;
  cycleHotbarSelection: (direction: 'next' | 'prev') => void;
  addItemToInventory: (itemId: string, quantity: number, quality?: CropQuality) => boolean;
  removeItemFromSlot: (slotIndex: number, quantity: number) => boolean;
  useSelectedItem: () => void;

  // === 액션: 도구 ===
  useTool: () => void;

  // === 액션: 농사 ===
  interactWithTile: () => void;

  // === 액션: 판매 ===
  addToShippingBin: (slotIndex: number, quantity: number) => void;
  processShippingBin: () => number;

  // === 액션: NPC ===
  talkToNPC: (npcId: string) => void;
  giveGiftToNPC: (npcId: string) => void;
  closeDialogue: () => void;

  // === 액션: 상점 ===
  openShop: (npcId: string) => void;
  setShopSelection: (index: number) => void;
  purchaseItem: () => boolean;
}

// 플레이어 이동 설정
const PLAYER_SPEED = 280; // 최대 속도 (픽셀/초)
const ACCELERATION = 2000; // 가속도 (픽셀/초²)
const DECELERATION = 1500; // 감속도 (픽셀/초²)
const ANIMATION_SPEED = 0.15;

export const useGameStore = create<GameStore>((set, get) => ({
  // === 초기 상태 ===
  isRunning: false,
  isPaused: false,
  isLoaded: false,
  activeUI: 'none',
  playerName: '',
  player: {
    position: { ...PLAYER_START_POSITION },
    velocity: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    animationFrame: 0,
    energy: 270,
    maxEnergy: 270,
    gold: 500,
    name: '',
  },
  energy: createInitialEnergyState(),
  time: createInitialGameTime(),
  inventory: createInitialInventory(),
  hotbarSelection: 0,
  shippingBin: [],
  todayEarnings: 0,
  baseTiles: createFarmTileMap(),
  farmTiles: createFarmTiles(),
  npcs: createInitialNPCStates(),
  dialogue: null,
  shopItems: [],
  shopSelection: 0,
  statistics: createInitialStatistics(),
  flags: {},

  // === 게임 제어 ===
  startGame: (playerName: string) => {
    set({
      isRunning: true,
      isPaused: false,
      isLoaded: true,
      playerName,
      player: {
        position: { ...PLAYER_START_POSITION },
        velocity: { x: 0, y: 0 },
        direction: 'down',
        isMoving: false,
        animationFrame: 0,
        energy: 270,
        maxEnergy: 270,
        gold: 500,
        name: playerName,
      },
      energy: createInitialEnergyState(),
      time: createInitialGameTime(),
      inventory: createInitialInventory(),
      hotbarSelection: 0,
      shippingBin: [],
      todayEarnings: 0,
      baseTiles: createFarmTileMap(),
      farmTiles: createFarmTiles(),
      npcs: createInitialNPCStates(),
      statistics: createInitialStatistics(),
      flags: {},
      activeUI: 'none',
    });
  },

  loadSavedGame: () => {
    const saveData = loadGame();
    if (!saveData) return false;

    set({
      isRunning: true,
      isPaused: false,
      isLoaded: true,
      playerName: saveData.playerName,
      player: {
        ...saveData.player,
        velocity: saveData.player.velocity || { x: 0, y: 0 },
      },
      energy: {
        current: saveData.player.energy,
        max: saveData.player.maxEnergy,
        isExhausted: saveData.player.energy <= 0,
        passedOut: false,
      },
      time: saveData.time,
      inventory: saveData.inventory,
      hotbarSelection: saveData.hotbarSelection,
      shippingBin: saveData.shippingBin || [],
      farmTiles: saveData.farmTiles,
      npcs: saveData.npcs,
      statistics: saveData.statistics,
      flags: saveData.flags,
      activeUI: 'none',
    });

    return true;
  },

  saveCurrentGame: () => {
    const state = get();
    const saveData = createSaveData(
      state.playerName,
      { ...state.player, energy: state.energy.current, maxEnergy: state.energy.max },
      state.time,
      state.inventory,
      state.hotbarSelection,
      state.farmTiles,
      state.shippingBin,
      state.npcs,
      state.flags,
      state.statistics
    );
    return saveGame(saveData);
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),

  setActiveUI: (ui: UIScreen) => set({ activeUI: ui, isPaused: ui !== 'none' }),

  closeUI: () => set({ activeUI: 'none', isPaused: false, dialogue: null }),

  // === 플레이어 이동 ===
  movePlayer: (direction: Direction | Direction[], deltaTime: number) => {
    const { player, baseTiles, activeUI, isPaused } = get();

    if (isPaused || activeUI !== 'none') return;

    // 단일 방향이면 배열로 변환
    const directions = Array.isArray(direction) ? direction : [direction];

    // 목표 속도 계산
    let targetVelX = 0;
    let targetVelY = 0;

    for (const dir of directions) {
      switch (dir) {
        case 'up':
          targetVelY -= PLAYER_SPEED;
          break;
        case 'down':
          targetVelY += PLAYER_SPEED;
          break;
        case 'left':
          targetVelX -= PLAYER_SPEED;
          break;
        case 'right':
          targetVelX += PLAYER_SPEED;
          break;
      }
    }

    // 대각선 이동시 속도 정규화
    if (targetVelX !== 0 && targetVelY !== 0) {
      const normalizer = 1 / Math.SQRT2;
      targetVelX *= normalizer;
      targetVelY *= normalizer;
    }

    // 현재 속도에서 목표 속도로 부드럽게 보간 (가속)
    let newVelX = player.velocity.x;
    let newVelY = player.velocity.y;

    const accel = ACCELERATION * deltaTime;

    // X 속도 보간
    if (targetVelX > newVelX) {
      newVelX = Math.min(targetVelX, newVelX + accel);
    } else if (targetVelX < newVelX) {
      newVelX = Math.max(targetVelX, newVelX - accel);
    }

    // Y 속도 보간
    if (targetVelY > newVelY) {
      newVelY = Math.min(targetVelY, newVelY + accel);
    } else if (targetVelY < newVelY) {
      newVelY = Math.max(targetVelY, newVelY - accel);
    }

    // 새 위치 계산
    let newX = player.position.x + newVelX * deltaTime;
    let newY = player.position.y + newVelY * deltaTime;

    // 맵 경계 제한
    newX = Math.max(TILE_SIZE, Math.min(newX, (FARM_WIDTH - 1) * TILE_SIZE));
    newY = Math.max(TILE_SIZE, Math.min(newY, (FARM_HEIGHT - 1) * TILE_SIZE));

    // 충돌 체크
    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);

    // 마지막 방향을 플레이어가 바라보는 방향으로 설정
    const facingDirection = directions[directions.length - 1];

    if (isTileWalkable(baseTiles, tileX, tileY)) {
      const isActuallyMoving = Math.abs(newVelX) > 1 || Math.abs(newVelY) > 1;

      set({
        player: {
          ...player,
          position: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY },
          direction: facingDirection,
          isMoving: isActuallyMoving,
        },
      });

      // 걸음 수 통계 (실제 이동시에만)
      if (isActuallyMoving) {
        set((state) => ({
          statistics: {
            ...state.statistics,
            stepsWalked: state.statistics.stepsWalked + 1,
          },
        }));
      }
    } else {
      // 벽에 부딪히면 해당 방향 속도를 0으로
      set({
        player: {
          ...player,
          velocity: { x: 0, y: 0 },
          direction: facingDirection,
          isMoving: false,
        },
      });
    }
  },

  setPlayerDirection: (direction: Direction) => {
    const { player } = get();
    // 감속 처리 - 키를 떼면 서서히 멈춤
    const decel = DECELERATION * 0.016; // 대략 60fps 기준
    let newVelX = player.velocity.x;
    let newVelY = player.velocity.y;

    // X 감속
    if (newVelX > 0) {
      newVelX = Math.max(0, newVelX - decel);
    } else if (newVelX < 0) {
      newVelX = Math.min(0, newVelX + decel);
    }

    // Y 감속
    if (newVelY > 0) {
      newVelY = Math.max(0, newVelY - decel);
    } else if (newVelY < 0) {
      newVelY = Math.min(0, newVelY + decel);
    }

    const isMoving = Math.abs(newVelX) > 1 || Math.abs(newVelY) > 1;

    // 감속 중에도 위치 업데이트
    const { baseTiles } = get();
    let newX = player.position.x + newVelX * 0.016;
    let newY = player.position.y + newVelY * 0.016;

    // 맵 경계 제한
    newX = Math.max(TILE_SIZE, Math.min(newX, (FARM_WIDTH - 1) * TILE_SIZE));
    newY = Math.max(TILE_SIZE, Math.min(newY, (FARM_HEIGHT - 1) * TILE_SIZE));

    const tileX = Math.floor(newX / TILE_SIZE);
    const tileY = Math.floor(newY / TILE_SIZE);

    if (isTileWalkable(baseTiles, tileX, tileY)) {
      set({
        player: {
          ...player,
          position: { x: newX, y: newY },
          velocity: { x: newVelX, y: newVelY },
          direction,
          isMoving,
        },
      });
    } else {
      set({
        player: {
          ...player,
          velocity: { x: 0, y: 0 },
          direction,
          isMoving: false,
        },
      });
    }
  },

  updatePlayerAnimation: (deltaTime: number) => {
    const { player } = get();
    if (player.isMoving) {
      const newFrame = (player.animationFrame + ANIMATION_SPEED * deltaTime * 60) % 4;
      set({
        player: { ...player, animationFrame: newFrame },
      });
    }
  },

  // === 시간 ===
  updateGameTime: (deltaTime: number) => {
    const { time, activeUI, isPaused } = get();

    if (isPaused || activeUI !== 'none') return;

    const newTime = updateTime(time, deltaTime);

    // 자정 체크 (기절)
    if (isPastMidnight(newTime)) {
      const { energy } = get();
      const newEnergy = restoreFromPassOut(energy);
      set({
        energy: newEnergy,
        player: { ...get().player, energy: newEnergy.current },
      });
      get().sleep();
      return;
    }

    set({ time: newTime });
  },

  sleep: () => {
    const state = get();
    const { time, energy, farmTiles, shippingBin, npcs } = state;

    // 판매함 정산
    const earnings = get().processShippingBin();

    // 에너지 회복
    const recoveryMultiplier = calculateSleepEnergyPenalty(time);
    const newEnergy = restoreFromSleep(energy, recoveryMultiplier);

    // 다음 날로
    const newTime = advanceDay(time);

    // 작물 성장 처리
    const isRainy = newTime.weather === 'rainy';
    const newFarmTiles = processDailyGrowth(farmTiles, newTime.season, isRainy);

    // NPC 일일 리셋
    const newNPCs = npcs.map((npc) => ({
      ...npc,
      talkedToday: false,
      giftedToday: false,
      giftsThisWeek: isNewWeek(newTime.day) ? 0 : npc.giftsThisWeek,
    }));

    // 통계 업데이트
    set((state) => ({
      statistics: {
        ...state.statistics,
        totalEarnings: state.statistics.totalEarnings + earnings,
        daysFarmed: state.statistics.daysFarmed + 1,
      },
    }));

    set({
      time: newTime,
      energy: newEnergy,
      player: { ...state.player, energy: newEnergy.current },
      farmTiles: newFarmTiles,
      shippingBin: [],
      todayEarnings: earnings,
      npcs: newNPCs,
      activeUI: 'sleep',
    });
  },

  // === 인벤토리 ===
  setHotbarSelection: (index: number) => {
    if (index >= 0 && index < HOTBAR_SIZE) {
      set({ hotbarSelection: index });
    }
  },

  cycleHotbarSelection: (direction: 'next' | 'prev') => {
    const { hotbarSelection } = get();
    const newIndex =
      direction === 'next'
        ? (hotbarSelection + 1) % HOTBAR_SIZE
        : (hotbarSelection - 1 + HOTBAR_SIZE) % HOTBAR_SIZE;
    set({ hotbarSelection: newIndex });
  },

  addItemToInventory: (itemId: string, quantity: number, quality?: CropQuality) => {
    const { inventory } = get();
    const result = addItem(inventory, itemId, quantity, quality);
    set({ inventory: result.inventory });
    return result.success;
  },

  removeItemFromSlot: (slotIndex: number, quantity: number) => {
    const { inventory } = get();
    const result = removeItem(inventory, slotIndex, quantity);
    set({ inventory: result.inventory });
    return result.success;
  },

  useSelectedItem: () => {
    const { inventory, hotbarSelection, energy, player } = get();
    const slot = getSlot(inventory, hotbarSelection);

    if (!slot || !slot.itemId) return;

    // 음식 먹기
    if (isEdible(slot.itemId)) {
      const newEnergy = consumeFood(energy, slot.itemId);
      const result = removeItem(inventory, hotbarSelection, 1);

      set({
        inventory: result.inventory,
        energy: newEnergy,
        player: { ...player, energy: newEnergy.current },
      });
    }
  },

  // === 도구 사용 ===
  useTool: () => {
    const { inventory, hotbarSelection, player, energy, farmTiles, baseTiles, time } = get();
    const slot = getSlot(inventory, hotbarSelection);

    if (!slot || !slot.itemId) return;

    const toolType = getToolTypeFromItemId(slot.itemId);
    if (!toolType) {
      // 도구가 아니면 다른 아이템 사용 시도
      get().interactWithTile();
      return;
    }

    // 플레이어가 바라보는 타일 좌표
    const facingTile = getFacingTile(player.position, player.direction);
    const { x, y } = facingTile;

    // 범위 체크
    if (x < 0 || x >= FARM_WIDTH || y < 0 || y >= FARM_HEIGHT) return;

    let success = false;
    let newFarmTiles = farmTiles;

    switch (toolType) {
      case 'hoe':
        if (canTill(farmTiles, baseTiles, x, y)) {
          const result = tillSoil(farmTiles, baseTiles, x, y);
          success = result.success;
          newFarmTiles = result.farmTiles;
        }
        break;

      case 'wateringCan':
        if (canWater(farmTiles, x, y)) {
          const result = waterTile(farmTiles, x, y);
          success = result.success;
          newFarmTiles = result.farmTiles;
        }
        break;

      case 'scythe':
        if (canHarvest(farmTiles, x, y)) {
          const result = harvestCrop(farmTiles, x, y);
          if (result.success && result.harvest) {
            get().addItemToInventory(result.harvest.itemId, result.harvest.quantity, result.harvest.quality);
            set((state) => ({
              statistics: {
                ...state.statistics,
                cropsHarvested: state.statistics.cropsHarvested + result.harvest!.quantity,
              },
            }));
          }
          success = result.success;
          newFarmTiles = result.farmTiles;
        }
        break;

      case 'axe':
      case 'pickaxe':
        // 나무/돌 파괴 (간단 구현)
        success = false;
        break;
    }

    if (success) {
      // 에너지 소모
      const newEnergy = consumeToolEnergy(energy, toolType);
      set({
        farmTiles: newFarmTiles,
        energy: newEnergy,
        player: { ...player, energy: newEnergy.current },
      });
    }
  },

  // === 타일 상호작용 ===
  interactWithTile: () => {
    const { inventory, hotbarSelection, player, farmTiles, time } = get();
    const slot = getSlot(inventory, hotbarSelection);

    if (!slot || !slot.itemId) return;

    const facingTile = getFacingTile(player.position, player.direction);
    const { x, y } = facingTile;

    // 씨앗 심기
    if (isSeed(slot.itemId) && canPlant(farmTiles, x, y)) {
      const result = plantSeed(farmTiles, x, y, slot.itemId, time.season);
      if (result.success) {
        const removeResult = removeItem(inventory, hotbarSelection, 1);
        set({
          farmTiles: result.farmTiles,
          inventory: removeResult.inventory,
        });
      }
      return;
    }

    // 수확 (맨손 또는 다른 아이템)
    if (canHarvest(farmTiles, x, y)) {
      const result = harvestCrop(farmTiles, x, y);
      if (result.success && result.harvest) {
        get().addItemToInventory(result.harvest.itemId, result.harvest.quantity, result.harvest.quality);
        set((state) => ({
          farmTiles: result.farmTiles,
          statistics: {
            ...state.statistics,
            cropsHarvested: state.statistics.cropsHarvested + result.harvest!.quantity,
          },
        }));
      }
    }
  },

  // === 판매 ===
  addToShippingBin: (slotIndex: number, quantity: number) => {
    const { inventory, shippingBin } = get();
    const slot = getSlot(inventory, slotIndex);

    if (!slot || !slot.itemId || slot.quantity < quantity) return;

    const itemData = getItemData(slot.itemId);
    if (!itemData || itemData.sellPrice <= 0) return;

    // 인벤토리에서 제거
    const removeResult = removeItem(inventory, slotIndex, quantity);

    // 판매함에 추가
    const newShippingBin = [...shippingBin];
    newShippingBin.push({
      itemId: slot.itemId,
      quantity,
      quality: slot.quality,
    });

    set({
      inventory: removeResult.inventory,
      shippingBin: newShippingBin,
    });
  },

  processShippingBin: () => {
    const { shippingBin, player } = get();

    let totalEarnings = 0;

    for (const slot of shippingBin) {
      if (slot.itemId) {
        const price = getSellPrice(slot.itemId, slot.quality || 'normal');
        totalEarnings += price * slot.quantity;
      }
    }

    set({
      player: { ...player, gold: player.gold + totalEarnings },
      shippingBin: [],
    });

    return totalEarnings;
  },

  // === NPC ===
  talkToNPC: (npcId: string) => {
    const { npcs } = get();
    const npcIndex = npcs.findIndex((n) => n.id === npcId);

    if (npcIndex === -1) return;

    const npc = npcs[npcIndex];
    let text: string;
    let pointsGained = 0;

    if (npc.talkedToday) {
      text = getRandomDialogue(npcId, npc.hearts);
    } else {
      text = getRandomGreeting(npcId);
      pointsGained = TALK_BONUS;
    }

    // NPC 상태 업데이트
    const newNPCs = [...npcs];
    newNPCs[npcIndex] = {
      ...npc,
      talkedToday: true,
      hearts: npc.hearts + pointsGained,
    };

    set({
      npcs: newNPCs,
      dialogue: {
        npcId,
        text,
      },
      activeUI: 'dialogue',
    });
  },

  giveGiftToNPC: (npcId: string) => {
    const { npcs, inventory, hotbarSelection } = get();
    const npcIndex = npcs.findIndex((n) => n.id === npcId);

    if (npcIndex === -1) return;

    const npc = npcs[npcIndex];
    const slot = getSlot(inventory, hotbarSelection);

    if (!slot || !slot.itemId) return;

    // 오늘 이미 선물했거나 주간 한도 초과
    if (npc.giftedToday || npc.giftsThisWeek >= WEEKLY_GIFT_LIMIT) {
      set({
        dialogue: {
          npcId,
          text: npc.giftedToday ? '오늘은 더 받을 수 없어요.' : '이번 주는 충분히 받았어요.',
        },
        activeUI: 'dialogue',
      });
      return;
    }

    // 선물 반응
    const reaction = getGiftReaction(npcId, slot.itemId);

    // 아이템 제거
    const removeResult = removeItem(inventory, hotbarSelection, 1);

    // NPC 상태 업데이트
    const newNPCs = [...npcs];
    newNPCs[npcIndex] = {
      ...npc,
      hearts: Math.max(0, npc.hearts + reaction.points),
      giftedToday: true,
      giftsThisWeek: npc.giftsThisWeek + 1,
    };

    set({
      inventory: removeResult.inventory,
      npcs: newNPCs,
      dialogue: {
        npcId,
        text: reaction.message,
      },
      activeUI: 'dialogue',
    });
  },

  closeDialogue: () => {
    set({ dialogue: null, activeUI: 'none', isPaused: false });
  },

  // === 상점 ===
  openShop: (npcId: string) => {
    const { time } = get();
    const items = getShopItems(npcId, time.season);

    set({
      shopItems: items,
      shopSelection: 0,
      activeUI: 'shop',
    });
  },

  setShopSelection: (index: number) => {
    const { shopItems } = get();
    if (index >= 0 && index < shopItems.length) {
      set({ shopSelection: index });
    }
  },

  purchaseItem: () => {
    const { shopItems, shopSelection, player, inventory, time } = get();

    if (shopSelection < 0 || shopSelection >= shopItems.length) {
      return false;
    }

    const item = shopItems[shopSelection];

    if (!canPurchase(item, player.gold, time.season)) {
      return false;
    }

    // 인벤토리에 추가
    const addResult = addItem(inventory, item.itemId, 1);
    if (!addResult.success) {
      return false;
    }

    // 골드 차감
    set({
      inventory: addResult.inventory,
      player: { ...player, gold: player.gold - item.price },
    });

    // 재고 감소
    if (item.stock > 0) {
      const newShopItems = [...shopItems];
      newShopItems[shopSelection] = { ...item, stock: item.stock - 1 };
      set({ shopItems: newShopItems });
    }

    return true;
  },
}));

// 저장 데이터 존재 여부 확인 (외부에서 사용)
export { hasSaveData };
