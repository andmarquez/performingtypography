import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * Deadline Bug — a cute enemy that patrols left and right.
 *
 * SPRITE REPLACEMENT:
 * Load 'deadline-bug-sheet' in BootScene and play a walk animation here.
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private direction: 1 | -1 = 1;
  private patrolMin: number;
  private patrolMax: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolMin: number,
    patrolMax: number,
  ) {
    super(scene, x, y, 'deadline-bug');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.setImmovable(true);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.body!.setSize(32, 28);
    this.body!.setOffset(4, 8);
    this.setDepth(5);
    this.setFlipX(this.direction === -1);

    // Gentle bob animation
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(): void {
    this.setVelocityX(this.direction * GAME_CONFIG.enemySpeed);

    if (this.x <= this.patrolMin) {
      this.direction = 1;
      this.setFlipX(false);
    } else if (this.x >= this.patrolMax) {
      this.direction = -1;
      this.setFlipX(true);
    }
  }
}
