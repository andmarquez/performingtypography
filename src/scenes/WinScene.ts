import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * WinScene — shown when Andsiosa completes all projects and reaches the portal.
 */
export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WinScene' });
  }

  init(data: { score?: number; kisses?: number; projects?: number }): void {
    this.registry.set('winScore', data.score ?? 0);
    this.registry.set('winKisses', data.kisses ?? 0);
    this.registry.set('winProjects', data.projects ?? 0);
  }

  create(): void {
    const w = GAME_CONFIG.width;
    const kisses = this.registry.get('winKisses') as number;
    const score = this.registry.get('winScore') as number;
    const projects = this.registry.get('winProjects') as number;

    this.cameras.main.setBackgroundColor('#f8bbd0');

    // Confetti particles
    const emitter = this.add.particles(w / 2, 0, 'particle', {
      x: { min: -w / 2, max: w / 2 },
      speed: { min: 80, max: 200 },
      angle: { min: 60, max: 120 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      frequency: 80,
      tint: [0xe91e63, 0xf48fb1, 0xffeb3b, 0xffffff],
    });

    this.add
      .text(w / 2, 140, 'You Did It!', {
        fontSize: '64px',
        fontFamily: 'Nunito, sans-serif',
        color: '#880e4f',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, 230, 'All creative projects finished\nbefore the deadline!', {
        fontSize: '26px',
        fontFamily: 'Nunito, sans-serif',
        color: '#ad1457',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(
        w / 2,
        330,
        `Projects: ${projects}/${GAME_CONFIG.requiredProjects}\nKisses: ${kisses}  |  Score: ${score}`,
        {
          fontSize: '24px',
          fontFamily: 'Nunito, sans-serif',
          color: '#c2185b',
          align: 'center',
        },
      )
      .setOrigin(0.5);

    const hero = this.add.image(w / 2, 450, 'andsiosa-victory').setScale(2.2);
    this.tweens.add({
      targets: hero,
      y: hero.y - 15,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    const portal = this.add.image(w / 2 + 120, 450, 'portal').setScale(1.2).setAlpha(0.8);
    this.tweens.add({
      targets: portal,
      scale: 1.4,
      alpha: 1,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    const again = this.add
      .text(w / 2, 580, 'Press Enter / Tap to Play Again', {
        fontSize: '26px',
        fontFamily: 'Nunito, sans-serif',
        color: '#ffffff',
        backgroundColor: '#e91e63',
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.time.delayedCall(8000, () => emitter.stop());

    const restart = () => this.scene.start('GameScene');
    this.input.keyboard?.once('keydown-ENTER', restart);
    this.input.keyboard?.once('keydown-SPACE', restart);
    again.on('pointerdown', restart);
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 540) return;
      restart();
    });
  }
}
