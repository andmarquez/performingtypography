import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { WORLD_LAYERS } from '../world/layerConfig';

export type CollectibleType = 'kiss' | 'timer' | 'spark';

const COLLECTIBLE_TEXTURE: Record<CollectibleType, string> = {
  kiss: 'collectible-kiss',
  timer: 'collectible-timer',
  spark: 'collectible-spark',
};

const COLLECTIBLE_ANIM: Record<CollectibleType, string> = {
  kiss: 'collectible-kiss-idle',
  timer: 'collectible-timer-idle',
  spark: 'collectible-spark-idle',
};

/** Display size in world pixels — marker (x,y) is the icon center on the map. */
const COLLECTIBLE_SIZE: Record<CollectibleType, number> = {
  kiss: 48,
  timer: 48,
  spark: 48,
};

/**
 * Map collectible — animated Phaser sprite centered on Figma marker coordinates.
 */
export class Collectible extends Phaser.Physics.Arcade.Sprite {
  readonly collectibleType: CollectibleType;
  private collected = false;
  private readonly displaySize: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: CollectibleType,
  ) {
    const textureKey = COLLECTIBLE_TEXTURE[type];
    super(scene, x, y, textureKey);
    this.collectibleType = type;
    this.displaySize = COLLECTIBLE_SIZE[type];

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setDisplaySize(this.displaySize, this.displaySize);
    this.setDepth(WORLD_LAYERS.collectibles);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    const hit = this.displaySize * 0.72;
    body.setSize(hit, hit);
    body.setOffset((this.displaySize - hit) / 2, (this.displaySize - hit) / 2);

    const animKey = COLLECTIBLE_ANIM[type];
    if (scene.anims.exists(animKey)) {
      this.play(animKey);
    }

    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 900 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  isCollected(): boolean {
    return this.collected;
  }

  override destroy(fromScene?: boolean): void {
    this.scene.tweens.killTweensOf(this);
    super.destroy(fromScene);
  }

  collectEffect(): void {
    if (this.collected) return;
    this.collected = true;

    this.scene.tweens.killTweensOf(this);
    this.disableBody(true, true);
    this.setActive(false);

    if (this.collectibleType === 'kiss') {
      this.spawnKissParticles();
    } else if (this.collectibleType === 'timer') {
      this.spawnTimerGlow();
    } else {
      this.spawnSparkBurst();
    }

    this.scene.tweens.add({
      targets: this,
      scale: 1.4,
      alpha: 0,
      duration: 180,
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

  private spawnSparkBurst(): void {
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 140 },
      scale: { start: 0.9, end: 0 },
      lifespan: 550,
      quantity: 12,
      tint: [GAME_CONFIG.colors.bossSpark, GAME_CONFIG.colors.bossSparkGlow, 0xffffff],
      emitting: false,
    });
    emitter.explode(14);
    this.scene.time.delayedCall(600, () => emitter.destroy());

    const star = this.scene.add.text(this.x, this.y - 10, '✦', {
      fontSize: '28px',
      color: '#ffd54f',
    });
    star.setOrigin(0.5);
    this.scene.tweens.add({
      targets: star,
      y: star.y - 45,
      alpha: 0,
      scale: 1.8,
      duration: 650,
      onComplete: () => star.destroy(),
    });
  }
}
