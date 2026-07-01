import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/**
 * MenuScene — title screen with keyboard and tap to start.
 */
export class MenuScene extends Phaser.Scene {
  private canStart = false;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.drawBackground();
    this.createTitle();
    this.createStartPrompt();
    this.createPortraitHint();

    this.canStart = false;
    this.time.delayedCall(400, () => {
      this.canStart = true;
    });

    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    this.input.on('pointerdown', () => this.startGame());
  }

  private drawBackground(): void {
    const w = GAME_CONFIG.width;
    const h = GAME_CONFIG.height;
    const sky = this.add.graphics();
    sky.fillGradientStyle(
      GAME_CONFIG.colors.skyTop,
      GAME_CONFIG.colors.skyTop,
      GAME_CONFIG.colors.skyBottom,
      GAME_CONFIG.colors.skyBottom,
      1,
    );
    sky.fillRect(0, 0, w, h);

    for (let i = 0; i < 6; i++) {
      const cloud = this.add.ellipse(
        100 + i * 200,
        80 + (i % 3) * 40,
        120 + (i % 2) * 40,
        50,
        GAME_CONFIG.colors.cloud,
        0.85,
      );
      this.tweens.add({
        targets: cloud,
        x: cloud.x + 30,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const hill = this.add.ellipse(w / 2, h + 40, w * 1.2, 200, GAME_CONFIG.colors.hillNear, 0.6);
    hill.setDepth(-1);
  }

  private createTitle(): void {
    const w = GAME_CONFIG.width;
    const title = this.add.text(w / 2, 200, "Andsiosa's", {
      fontSize: '64px',
      fontFamily: 'Nunito, sans-serif',
      color: '#e91e63',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const subtitle = this.add.text(w / 2, 280, 'Creative Quest', {
      fontSize: '72px',
      fontFamily: 'Nunito, sans-serif',
      color: '#880e4f',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [title, subtitle],
      y: '-=8',
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Mini Andsiosa preview
    const preview = this.add.image(w / 2, 420, 'andsiosa-idle').setScale(2);
    this.tweens.add({
      targets: preview,
      y: preview.y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  private createStartPrompt(): void {
    const prompt = this.add
      .text(GAME_CONFIG.width / 2, 560, 'Press Enter / Tap to Start', {
        fontSize: '28px',
        fontFamily: 'Nunito, sans-serif',
        color: '#ad1457',
        backgroundColor: '#ffffffaa',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
  }

  private createPortraitHint(): void {
    const hint = this.add
      .text(GAME_CONFIG.width / 2, GAME_CONFIG.height - 40, '', {
        fontSize: '18px',
        fontFamily: 'Nunito, sans-serif',
        color: '#880e4f',
        align: 'center',
        wordWrap: { width: GAME_CONFIG.width - 40 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    const updateHint = () => {
      const isPortrait = this.scale.height > this.scale.width;
      hint.setText(
        isPortrait
          ? 'Turn your phone sideways for the best experience.'
          : '',
      );
    };
    updateHint();
    this.scale.on('resize', updateHint);
  }

  private startGame(): void {
    if (!this.canStart) return;
    this.scene.start('GameScene');
  }
}
