import { CameraState, Position } from '@/game/types';
import { clamp, lerp } from '@/utils/helpers';

export class Camera {
  private state: CameraState;
  private viewportWidth: number;
  private viewportHeight: number;
  private mapWidth: number;
  private mapHeight: number;
  private smoothing: number;

  constructor(
    viewportWidth: number,
    viewportHeight: number,
    mapWidth: number = 2560,  // 80 tiles * 32
    mapHeight: number = 2080, // 65 tiles * 32
    smoothing: number = 0.1
  ) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.smoothing = smoothing;

    this.state = {
      x: 0,
      y: 0,
      zoom: 1,
      targetX: 0,
      targetY: 0,
    };
  }

  // 타겟 위치 설정 (보통 플레이어 위치)
  setTarget(x: number, y: number): void {
    // 타겟을 화면 중앙에 오도록 오프셋 계산
    this.state.targetX = x - this.viewportWidth / 2;
    this.state.targetY = y - this.viewportHeight / 2;
  }

  // 즉시 위치 설정 (텔레포트 등)
  setPosition(x: number, y: number): void {
    this.state.targetX = x - this.viewportWidth / 2;
    this.state.targetY = y - this.viewportHeight / 2;
    this.state.x = this.state.targetX;
    this.state.y = this.state.targetY;
    this.clampPosition();
  }

  // 업데이트 (부드러운 추적)
  update(deltaTime: number): void {
    // 부드러운 보간
    const factor = 1 - Math.pow(1 - this.smoothing, deltaTime * 60);
    this.state.x = lerp(this.state.x, this.state.targetX, factor);
    this.state.y = lerp(this.state.y, this.state.targetY, factor);

    this.clampPosition();
  }

  // 맵 경계 내로 제한
  private clampPosition(): void {
    const scaledViewportWidth = this.viewportWidth / this.state.zoom;
    const scaledViewportHeight = this.viewportHeight / this.state.zoom;

    const maxX = Math.max(0, this.mapWidth - scaledViewportWidth);
    const maxY = Math.max(0, this.mapHeight - scaledViewportHeight);

    this.state.x = clamp(this.state.x, 0, maxX);
    this.state.y = clamp(this.state.y, 0, maxY);
    this.state.targetX = clamp(this.state.targetX, 0, maxX);
    this.state.targetY = clamp(this.state.targetY, 0, maxY);
  }

  // 줌 설정
  setZoom(zoom: number): void {
    this.state.zoom = clamp(zoom, 0.5, 2);
    this.clampPosition();
  }

  // 뷰포트 크기 변경
  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.clampPosition();
  }

  // 맵 크기 변경
  setMapSize(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
    this.clampPosition();
  }

  // 현재 위치 가져오기
  getPosition(): Position {
    return {
      x: Math.round(this.state.x),
      y: Math.round(this.state.y),
    };
  }

  // 화면 좌표를 월드 좌표로 변환
  screenToWorld(screenX: number, screenY: number): Position {
    return {
      x: screenX / this.state.zoom + this.state.x,
      y: screenY / this.state.zoom + this.state.y,
    };
  }

  // 월드 좌표를 화면 좌표로 변환
  worldToScreen(worldX: number, worldY: number): Position {
    return {
      x: (worldX - this.state.x) * this.state.zoom,
      y: (worldY - this.state.y) * this.state.zoom,
    };
  }

  // 타일 좌표를 화면 좌표로 변환
  tileToScreen(tileX: number, tileY: number, tileSize: number = 32): Position {
    return this.worldToScreen(tileX * tileSize, tileY * tileSize);
  }

  // 해당 위치가 화면에 보이는지 확인
  isVisible(worldX: number, worldY: number, width: number = 0, height: number = 0): boolean {
    const screenPos = this.worldToScreen(worldX, worldY);
    return (
      screenPos.x + width >= 0 &&
      screenPos.y + height >= 0 &&
      screenPos.x < this.viewportWidth &&
      screenPos.y < this.viewportHeight
    );
  }

  // 보이는 타일 범위 계산
  getVisibleTileRange(tileSize: number = 32): {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } {
    const scaledTileSize = tileSize * this.state.zoom;
    const tilesX = Math.ceil(this.viewportWidth / scaledTileSize) + 2;
    const tilesY = Math.ceil(this.viewportHeight / scaledTileSize) + 2;

    const startX = Math.floor(this.state.x / tileSize);
    const startY = Math.floor(this.state.y / tileSize);

    return {
      startX: Math.max(0, startX - 1),
      startY: Math.max(0, startY - 1),
      endX: startX + tilesX,
      endY: startY + tilesY,
    };
  }

  // 상태 가져오기
  getState(): CameraState {
    return { ...this.state };
  }

  // 줌 레벨 가져오기
  getZoom(): number {
    return this.state.zoom;
  }

  // 스무딩 설정
  setSmoothing(smoothing: number): void {
    this.smoothing = clamp(smoothing, 0, 1);
  }

  // 흔들림 효과 (옵션)
  shake(intensity: number = 5, duration: number = 200): void {
    const originalX = this.state.x;
    const originalY = this.state.y;
    const startTime = Date.now();

    const shakeLoop = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress);
        this.state.x = originalX + (Math.random() - 0.5) * currentIntensity * 2;
        this.state.y = originalY + (Math.random() - 0.5) * currentIntensity * 2;
        requestAnimationFrame(shakeLoop);
      } else {
        this.state.x = originalX;
        this.state.y = originalY;
      }
    };

    shakeLoop();
  }
}
