import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export type GameOverReason = 'time' | 'lives' | 'fall';

/**
 * GameOverScene — shown when the player loses.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { reason?: GameOverReason; score?: number; kisses?: number }): void {
    this.registry.set('lastReason', data.reason ?? 'lives');
    this.registry.set('lastScore', data.score ?? 0);
    this.registry.set('lastKisses', data.kisses ?? 0);
  }

  create(): void {
    const w = GAME_CONFIG.width;
    const reason = this.registry.get('lastReason') as GameOverReason;
    const score = this.registry.get('lastScore') as number;
    const kisses = this.registry.get('lastKisses') as number;

    this.cameras.main.setBackgroundColor('#fce4ec');

    this.add
      .text(w / 2, 160, 'Game Over', {
        fontSize: '64px',
        fontFamily: 'Nunito, sans-serif',
        color: '#c62828',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const messages: Record<GameOverReason, string> = {
      time: 'The deadline ran out!',
      lives: 'Too many deadline bugs got you!',
      fall: 'Andsiosa fell off the creative world!',
    };

    this.add
      .text(w / 2, 260, messages[reason], {
        fontSize: '26px',
        fontFamily: 'Nunito, sans-serif',
        color: '#880e4f',
        align: 'center',
        wordWrap: { width: w - 80 },
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, 340, `Kisses: ${kisses}  |  Score: ${score}`, {
        fontSize: '24px',
        fontFamily: 'Nunito, sans-serif',
        color: '#ad1457',
      })
      .setOrigin(0.5);

    this.add.image(w / 2, 440, 'andsiosa-hurt').setScale(2);

    const retry = this.add
      .text(w / 2, 560, 'Press Enter / Tap to Try Again', {
        fontSize: '26px',
        fontFamily: 'Nunito, sans-serif',
        color: '#ffffff',
        backgroundColor: '#e91e63',
        padding: { x: 24, y: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    retry.on('pointerover', () => retry.setStyle({ backgroundColor: '#c2185b' }));
    retry.on('pointerout', () => retry.setStyle({ backgroundColor: '#e91e63' }));

    this.tweens.add({
      targets: retry,
      scale: 1.05,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const restart = () => this.scene.start('GameScene');
    this.input.keyboard?.once('keydown-ENTER', restart);
    this.input.keyboard?.once('keydown-SPACE', restart);
    retry.on('pointerdown', restart);
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 520) return;
      restart();
    });
  }
}
