import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export type CollectibleType = 'kiss' | 'timer';

/**
 * Collectible — kisses (score) or timers (time + projects).
 *
 * SPRITE REPLACEMENT:
 * Swap texture keys 'kiss' / 'timer' with your own images in BootScene.
 */
export class Collectible extends Phaser.Physics.Arcade.Sprite {
  readonly collectibleType: CollectibleType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CollectibleType,
  ) {
    const texture = type === 'kiss' ? 'kiss' : 'timer';
    super(scene, x, y, texture);
    this.collectibleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.setDepth(4);

    // Gentle float
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Sparkle rotation for timers
    if (type === 'timer') {
      scene.tweens.add({
        targets: this,
        angle: 360,
        duration: 4000,
        repeat: -1,
      });
    }
  }

  collectEffect(): void {
    const scene = this.scene;

    if (this.collectibleType === 'kiss') {
      this.spawnKissParticles();
    } else {
      this.spawnTimerGlow();
    }

    scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }

  private spawnKissParticles(): void {
    const emitter = this.scene.add.particles(
      this.x,
      this.y,
      'particle',
      {
        speed: { min: 40, max: 120 },
        scale: { start: 0.8, end: 0 },
        lifespan: 500,
        quantity: 8,
        tint: [GAME_CONFIG.colors.kiss, GAME_CONFIG.colors.kissGlow, 0xffffff],
        emitting: false,
      },
    );
    emitter.explode(10);
    this.scene.time.delayedCall(600, () => emitter.destroy());

    // Heart burst
    const heart = this.scene.add.text(this.x, this.y - 10, '♥', {
      fontSize: '24px',
      color: '#e91e63',
    });
    heart.setOrigin(0.5);
    this.scene.tweens.add({
      targets: heart,
      y: heart.y - 40,
      alpha: 0,
      scale: 1.5,
      duration: 600,
      onComplete: () => heart.destroy(),
    });
  }

  private spawnTimerGlow(): void {
    const ring = this.scene.add.circle(
      this.x,
      this.y,
      20,
      GAME_CONFIG.colors.timerGlow,
      0.6,
    );
    this.scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
  }
}
