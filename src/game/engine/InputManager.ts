import { InputState, Direction } from '@/game/types';
import { getDirectionFromKey, isMovementKey, isActionKey, isNumberKey } from '@/utils/helpers';

export class InputManager {
  private state: InputState;
  private canvas: HTMLCanvasElement | null = null;
  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;
  private mouseDownHandler: (e: MouseEvent) => void;
  private mouseUpHandler: (e: MouseEvent) => void;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private contextMenuHandler: (e: Event) => void;
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor() {
    this.state = {
      keys: new Set(),
      mouse: {
        x: 0,
        y: 0,
        worldX: 0,
        worldY: 0,
        pressed: false,
        justClicked: false,
      },
    };

    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.mouseMoveHandler = this.handleMouseMove.bind(this);
    this.contextMenuHandler = (e: Event) => e.preventDefault();
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    canvas.addEventListener('mousedown', this.mouseDownHandler);
    canvas.addEventListener('mouseup', this.mouseUpHandler);
    canvas.addEventListener('mousemove', this.mouseMoveHandler);
    canvas.addEventListener('contextmenu', this.contextMenuHandler);

    // 포커스 설정
    canvas.tabIndex = 1;
    canvas.focus();
  }

  destroy(): void {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);

    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
      this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
      this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
      this.canvas.removeEventListener('contextmenu', this.contextMenuHandler);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // 기본 브라우저 동작 방지 (방향키 스크롤 등)
    if (isMovementKey(e.key) || isActionKey(e.key) || e.key === 'Escape') {
      e.preventDefault();
    }
    // repeat 이벤트도 무시하지 않음 - Set이 중복을 자동 처리
    this.state.keys.add(e.key);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.state.keys.delete(e.key);
  }

  private handleMouseDown(e: MouseEvent): void {
    this.updateMousePosition(e);
    this.state.mouse.pressed = true;
    this.state.mouse.justClicked = true;
  }

  private handleMouseUp(e: MouseEvent): void {
    this.updateMousePosition(e);
    this.state.mouse.pressed = false;
  }

  private handleMouseMove(e: MouseEvent): void {
    this.updateMousePosition(e);
  }

  private updateMousePosition(e: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.state.mouse.x = (e.clientX - rect.left) * scaleX;
    this.state.mouse.y = (e.clientY - rect.top) * scaleY;

    // 월드 좌표 계산 (카메라 오프셋 적용)
    this.state.mouse.worldX = this.state.mouse.x + this.cameraX;
    this.state.mouse.worldY = this.state.mouse.y + this.cameraY;
  }

  updateCamera(x: number, y: number): void {
    this.cameraX = x;
    this.cameraY = y;
    // 월드 좌표 업데이트
    this.state.mouse.worldX = this.state.mouse.x + this.cameraX;
    this.state.mouse.worldY = this.state.mouse.y + this.cameraY;
  }

  // 매 프레임 끝에 호출하여 일회성 상태 리셋
  endFrame(): void {
    this.state.mouse.justClicked = false;
  }

  // === 쿼리 메서드 ===

  isKeyPressed(key: string): boolean {
    return this.state.keys.has(key);
  }

  isKeyJustPressed(key: string): boolean {
    // 참고: 실제 구현시에는 이전 프레임 상태와 비교 필요
    return this.state.keys.has(key);
  }

  isAnyMovementKeyPressed(): boolean {
    return Array.from(this.state.keys).some(isMovementKey);
  }

  getMovementDirection(): Direction | null {
    for (const key of this.state.keys) {
      const dir = getDirectionFromKey(key);
      if (dir) return dir;
    }
    return null;
  }

  getAllMovementDirections(): Direction[] {
    const directions: Direction[] = [];
    for (const key of this.state.keys) {
      const dir = getDirectionFromKey(key);
      if (dir && !directions.includes(dir)) {
        directions.push(dir);
      }
    }
    return directions;
  }

  isActionPressed(): boolean {
    return Array.from(this.state.keys).some(isActionKey);
  }

  isMousePressed(): boolean {
    return this.state.mouse.pressed;
  }

  isMouseJustClicked(): boolean {
    return this.state.mouse.justClicked;
  }

  getMousePosition(): { x: number; y: number } {
    return { x: this.state.mouse.x, y: this.state.mouse.y };
  }

  getMouseWorldPosition(): { x: number; y: number } {
    return { x: this.state.mouse.worldX, y: this.state.mouse.worldY };
  }

  getHotbarSelection(): number | null {
    for (const key of this.state.keys) {
      const num = isNumberKey(key);
      if (num !== null) return num;
    }
    return null;
  }

  isEscapePressed(): boolean {
    return this.state.keys.has('Escape');
  }

  isInventoryKeyPressed(): boolean {
    return this.state.keys.has('e') || this.state.keys.has('E') || this.state.keys.has('Tab');
  }

  getState(): InputState {
    return { ...this.state };
  }
}

// 싱글턴 인스턴스
let inputManagerInstance: InputManager | null = null;

export function getInputManager(): InputManager {
  if (!inputManagerInstance) {
    inputManagerInstance = new InputManager();
  }
  return inputManagerInstance;
}

export function destroyInputManager(): void {
  if (inputManagerInstance) {
    inputManagerInstance.destroy();
    inputManagerInstance = null;
  }
}
