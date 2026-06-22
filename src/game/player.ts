import Phaser from "phaser";

export class PlayerController {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  targetX = 0;
  targetY = 0;
  isMovingToTarget = false;
  currentAction = "idle";
  speed = 120;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "hero");
    this.sprite.setDepth(20).setCollideWorldBounds(true).setBounce(0.05);
    this.sprite.body?.setSize(22, 32);
  }

  moveTo(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.isMovingToTarget = true;
    this.currentAction = "walking";
  }

  stop(): void {
    this.isMovingToTarget = false;
    this.currentAction = "idle";
    this.sprite.setVelocityX(0);
  }

  update(canMoveTo: (fromX: number, targetX: number) => boolean): void {
    if (!this.isMovingToTarget || this.currentAction !== "walking") return;
    const distance = this.targetX - this.sprite.x;
    if (Math.abs(distance) < 7) {
      this.stop();
      return;
    }
    if (!canMoveTo(this.sprite.x, this.targetX)) {
      this.stop();
      return;
    }
    this.sprite.setFlipX(distance < 0);
    this.sprite.setVelocityX(Math.sign(distance) * this.speed);
  }
}
