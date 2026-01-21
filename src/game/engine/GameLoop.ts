export type UpdateFunction = (deltaTime: number) => void;
export type RenderFunction = () => void;

export class GameLoop {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private lastTime: number = 0;
  private accumulatedTime: number = 0;
  private readonly fixedTimeStep: number = 1000 / 60; // 60 FPS
  private readonly maxDeltaTime: number = 100; // 최대 델타 타임 (프레임 드랍 방지)

  private updateFn: UpdateFunction;
  private renderFn: RenderFunction;
  private animationFrameId: number | null = null;

  // 성능 모니터링
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private currentFPS: number = 60;

  constructor(updateFn: UpdateFunction, renderFn: RenderFunction) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.fpsUpdateTime = this.lastTime;
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
    }
  }

  toggle(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 너무 큰 델타 타임 제한 (탭 전환 등)
    if (deltaTime > this.maxDeltaTime) {
      deltaTime = this.maxDeltaTime;
    }

    // FPS 계산
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    if (!this.isPaused) {
      // 고정 시간 단계로 업데이트 (물리 등 일관성 유지)
      this.accumulatedTime += deltaTime;

      while (this.accumulatedTime >= this.fixedTimeStep) {
        this.updateFn(this.fixedTimeStep / 1000); // 초 단위로 변환
        this.accumulatedTime -= this.fixedTimeStep;
      }
    }

    // 렌더링은 항상 실행 (일시 정지 중에도)
    this.renderFn();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // 상태 조회
  getIsRunning(): boolean {
    return this.isRunning;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  getFPS(): number {
    return this.currentFPS;
  }

  // 업데이트/렌더 함수 변경
  setUpdateFunction(fn: UpdateFunction): void {
    this.updateFn = fn;
  }

  setRenderFunction(fn: RenderFunction): void {
    this.renderFn = fn;
  }
}

// 싱글턴 인스턴스 (옵션)
let gameLoopInstance: GameLoop | null = null;

export function createGameLoop(updateFn: UpdateFunction, renderFn: RenderFunction): GameLoop {
  if (gameLoopInstance) {
    gameLoopInstance.stop();
  }
  gameLoopInstance = new GameLoop(updateFn, renderFn);
  return gameLoopInstance;
}

export function getGameLoop(): GameLoop | null {
  return gameLoopInstance;
}

export function destroyGameLoop(): void {
  if (gameLoopInstance) {
    gameLoopInstance.stop();
    gameLoopInstance = null;
  }
}
