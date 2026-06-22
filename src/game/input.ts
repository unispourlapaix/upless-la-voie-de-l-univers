import Phaser from "phaser";

type TapCallbacks = {
  onTap: (screenX: number, screenY: number) => void;
  onDoubleTap: (screenX: number, screenY: number) => void;
  isUiHit?: (x: number, y: number) => boolean;
};

export class TouchInput {
  private lastTapAt = 0;
  private lastTapX = 0;
  private lastTapY = 0;
  private downAt = 0;
  private downX = 0;
  private downY = 0;
  private tapTimer?: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly callbacks: TapCallbacks,
  ) {
    scene.input.on("pointerdown", this.onPointerDown, this);
    scene.input.on("pointerup", this.onPointerUp, this);
    scene.input.on("pointercancel", this.cancel, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    this.downAt = performance.now();
    this.downX = pointer.x;
    this.downY = pointer.y;
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.callbacks.isUiHit?.(pointer.x, pointer.y)) return;
    const duration = performance.now() - this.downAt;
    const travel = Phaser.Math.Distance.Between(this.downX, this.downY, pointer.x, pointer.y);
    if (duration > 360 || travel > 18) return;

    const now = performance.now();
    const nearLastTap = Phaser.Math.Distance.Between(this.lastTapX, this.lastTapY, pointer.x, pointer.y) < 44;
    if (now - this.lastTapAt < 310 && nearLastTap) {
      if (this.tapTimer) window.clearTimeout(this.tapTimer);
      this.tapTimer = undefined;
      this.lastTapAt = 0;
      this.callbacks.onDoubleTap(pointer.x, pointer.y);
      return;
    }

    this.lastTapAt = now;
    this.lastTapX = pointer.x;
    this.lastTapY = pointer.y;
    this.tapTimer = window.setTimeout(() => {
      this.callbacks.onTap(pointer.x, pointer.y);
      this.tapTimer = undefined;
    }, 315);
  }

  private cancel(): void {
    this.downAt = 0;
  }

  destroy(): void {
    if (this.tapTimer) window.clearTimeout(this.tapTimer);
    this.scene.input.off("pointerdown", this.onPointerDown, this);
    this.scene.input.off("pointerup", this.onPointerUp, this);
    this.scene.input.off("pointercancel", this.cancel, this);
  }
}
