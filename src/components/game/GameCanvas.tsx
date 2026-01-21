'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { GameLoop, createGameLoop, destroyGameLoop } from '@/game/engine/GameLoop';
import { InputManager, getInputManager, destroyInputManager } from '@/game/engine/InputManager';
import { Camera } from '@/game/engine/Camera';
import { Renderer } from '@/game/engine/Renderer';
import { preloadSprites } from '@/game/engine/SpriteGenerator';
import { TILE_SIZE, FARM_WIDTH, FARM_HEIGHT } from '@/game/data/maps/farm';
import { getNPCPositionAtTime, getNPCData } from '@/game/data/npcs';
import { formatGold } from '@/utils/helpers';

// 캔버스 크기
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [playerNameInput, setPlayerNameInput] = useState('');
  const animationFrameRef = useRef<number>(0);

  // Zustand 스토어
  const {
    isRunning,
    isPaused,
    isLoaded,
    activeUI,
    playerName,
    player,
    energy,
    time,
    inventory,
    hotbarSelection,
    baseTiles,
    farmTiles,
    npcs,
    dialogue,
    shopItems,
    shopSelection,
    todayEarnings,
    startGame,
    loadSavedGame,
    saveCurrentGame,
    pauseGame,
    resumeGame,
    setActiveUI,
    closeUI,
    movePlayer,
    setPlayerDirection,
    updatePlayerAnimation,
    updateGameTime,
    sleep,
    setHotbarSelection,
    cycleHotbarSelection,
    useTool,
    interactWithTile,
    talkToNPC,
    openShop,
    setShopSelection,
    purchaseItem,
    closeDialogue,
  } = useGameStore();

  // 게임 업데이트 함수
  const update = useCallback((deltaTime: number) => {
    if (!isRunning || !inputManagerRef.current) return;

    const input = inputManagerRef.current;

    // UI가 열려있으면 게임 업데이트 스킵
    if (activeUI !== 'none') {
      // UI 관련 입력 처리
      if (input.isEscapePressed()) {
        closeUI();
      }

      if (activeUI === 'dialogue' && input.isActionPressed()) {
        closeDialogue();
      }

      if (activeUI === 'shop') {
        if (input.isKeyPressed('ArrowUp')) {
          setShopSelection(Math.max(0, shopSelection - 1));
        }
        if (input.isKeyPressed('ArrowDown')) {
          setShopSelection(Math.min(shopItems.length - 1, shopSelection + 1));
        }
        if (input.isActionPressed()) {
          purchaseItem();
        }
      }

      if (activeUI === 'sleep' && input.isMouseJustClicked()) {
        closeUI();
      }

      input.endFrame();
      return;
    }

    // ESC 메뉴
    if (input.isEscapePressed()) {
      setActiveUI('menu');
      return;
    }

    // 인벤토리 열기
    if (input.isInventoryKeyPressed()) {
      setActiveUI('inventory');
      return;
    }

    // 핫바 선택
    const hotbarNum = input.getHotbarSelection();
    if (hotbarNum !== null) {
      setHotbarSelection(hotbarNum);
    }

    // 플레이어 이동 (대각선 지원)
    const directions = input.getAllMovementDirections();
    if (directions.length > 0) {
      movePlayer(directions, deltaTime);
    } else {
      setPlayerDirection(player.direction);
    }

    // 플레이어 애니메이션 업데이트
    updatePlayerAnimation(deltaTime);

    // 도구/아이템 사용
    if (input.isMouseJustClicked() || input.isActionPressed()) {
      useTool();
    }

    // 시간 업데이트
    updateGameTime(deltaTime);

    // 카메라 업데이트
    if (cameraRef.current) {
      cameraRef.current.setTarget(player.position.x, player.position.y);
      cameraRef.current.update(deltaTime);

      // 입력 매니저에 카메라 위치 전달
      const camPos = cameraRef.current.getPosition();
      input.updateCamera(camPos.x, camPos.y);
    }

    input.endFrame();
  }, [
    isRunning,
    activeUI,
    player,
    shopItems,
    shopSelection,
    closeUI,
    closeDialogue,
    setShopSelection,
    purchaseItem,
    setActiveUI,
    setHotbarSelection,
    movePlayer,
    setPlayerDirection,
    updatePlayerAnimation,
    useTool,
    updateGameTime,
  ]);

  // 렌더링 함수
  const render = useCallback(() => {
    if (!rendererRef.current || !cameraRef.current) return;

    const renderer = rendererRef.current;

    // 화면 클리어
    renderer.clearWithColor('#1a1a2e');

    // 타일맵 렌더링
    renderer.renderTileMap(baseTiles, farmTiles, time.season);

    // 작물 렌더링
    renderer.renderCrops(farmTiles);

    // NPC 렌더링
    npcs.forEach((npc) => {
      const targetPos = getNPCPositionAtTime(npc.id, time.hour);
      // 간단히 현재 위치에 렌더링
      renderer.renderNPC({
        ...npc,
        position: targetPos,
      });
    });

    // 플레이어 렌더링
    renderer.renderPlayer(player);

    // 시간대 오버레이
    renderer.renderTimeOverlay(time.hour);

    // 날씨 효과
    renderer.renderWeather(time.weather, animationFrameRef.current++);

    // HUD
    renderer.renderHUD(time, energy.current, energy.max, player.gold);

    // 핫바
    renderer.renderHotbar(inventory, hotbarSelection);

    // UI 렌더링
    if (activeUI === 'inventory') {
      renderer.renderInventory(inventory, hotbarSelection);
    }

    if (activeUI === 'dialogue' && dialogue) {
      const npcData = getNPCData(dialogue.npcId);
      renderer.renderDialogue(npcData?.nameKo || dialogue.npcId, dialogue.text);
    }

    if (activeUI === 'shop') {
      renderer.renderShop('피에르 잡화점', shopItems, shopSelection, player.gold);
    }

    if (activeUI === 'sleep') {
      const dateStr = `${time.year}년 ${time.season} ${time.day}일`;
      renderer.renderSleepScreen(todayEarnings, dateStr);
    }

    if (activeUI === 'menu') {
      renderer.renderMenu();
    }
  }, [
    baseTiles,
    farmTiles,
    npcs,
    player,
    time,
    energy,
    inventory,
    hotbarSelection,
    activeUI,
    dialogue,
    shopItems,
    shopSelection,
    todayEarnings,
  ]);

  // 게임 초기화 (한 번만 실행)
  useEffect(() => {
    if (!canvasRef.current || !isLoaded) return;

    const canvas = canvasRef.current;

    // 스프라이트 프리로드
    preloadSprites(time.season);

    // 카메라 초기화
    cameraRef.current = new Camera(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      FARM_WIDTH * TILE_SIZE,
      FARM_HEIGHT * TILE_SIZE
    );
    cameraRef.current.setPosition(player.position.x, player.position.y);

    // 렌더러 초기화
    rendererRef.current = new Renderer(canvas, cameraRef.current);

    // 입력 매니저 초기화
    inputManagerRef.current = getInputManager();
    inputManagerRef.current.init(canvas);

    // 게임 루프 생성 및 시작
    gameLoopRef.current = createGameLoop(update, render);
    gameLoopRef.current.start();

    return () => {
      destroyGameLoop();
      destroyInputManager();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // update/render 함수가 변경되면 게임 루프에 반영
  useEffect(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.setUpdateFunction(update);
      gameLoopRef.current.setRenderFunction(render);
    }
  }, [update, render]);

  // 게임 시작 핸들러
  const handleStartNewGame = () => {
    if (playerNameInput.trim()) {
      startGame(playerNameInput.trim());
      setShowStartScreen(false);
    }
  };

  // 저장된 게임 불러오기
  const handleLoadGame = () => {
    if (loadSavedGame()) {
      setShowStartScreen(false);
    }
  };

  // 시작 화면
  if (showStartScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-400 to-green-600">
        <div className="bg-amber-50 p-8 rounded-lg shadow-xl border-4 border-amber-700 max-w-md w-full">
          <h1 className="text-4xl font-bold text-center text-amber-800 mb-8" style={{ fontFamily: 'serif' }}>
            🌻 Valley 🌻
          </h1>
          <p className="text-center text-amber-700 mb-6">
            당신만의 농장을 가꾸세요!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-amber-800 mb-2">농부 이름:</label>
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                className="w-full px-4 py-2 border-2 border-amber-400 rounded-lg focus:outline-none focus:border-amber-600 bg-white text-amber-900"
                placeholder="이름을 입력하세요"
                maxLength={12}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartNewGame();
                }}
              />
            </div>

            <button
              onClick={handleStartNewGame}
              disabled={!playerNameInput.trim()}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors"
            >
              새 게임 시작
            </button>

            <button
              onClick={handleLoadGame}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
            >
              이어하기
            </button>
          </div>

          <div className="mt-8 text-center text-amber-600 text-sm">
            <p>조작법:</p>
            <p>WASD/방향키: 이동</p>
            <p>클릭/Space: 도구 사용</p>
            <p>E: 인벤토리</p>
            <p>1-9,0: 핫바 선택</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-amber-700 rounded-lg shadow-2xl"
          style={{
            imageRendering: 'pixelated',
            cursor: 'crosshair',
          }}
        />

        {/* 저장 버튼 */}
        <button
          onClick={saveCurrentGame}
          className="absolute top-2 left-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded shadow"
        >
          💾 저장
        </button>
      </div>

      <div className="mt-4 text-white text-center">
        <p className="text-amber-400">
          {playerName}의 농장 | {time.year}년차 {time.season} {time.day}일
        </p>
        <p className="text-green-400">
          💰 {formatGold(player.gold)}g | ⚡ {Math.floor(energy.current)}/{energy.max}
        </p>
      </div>
    </div>
  );
}
