import Phaser from 'phaser';
import {
  END_SCREEN,
  addCtaHitZone,
  addStatsPill,
  layoutCoverScreenBackground,
  scalePx,
} from '../ui/endScreenLayout';

export type GameOverReason = 'time' | 'lives' | 'fall';

const REASON_COPY: Record<GameOverReason, string> = {
  time: 'The deadline ran out!',
  lives: 'Too many deadline bugs got you!',
  fall: 'Andsiosa fell off the creative world!',
};

/**
 * GameOverScene — full-frame Figma M03 art + dynamic reason and stats; CTA baked in.
 */
export class GameOverScene extends Phaser.Scene {
  private reason: GameOverReason = 'lives';
  private score = 0;
  private kisses = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { reason?: GameOverReason; score?: number; kisses?: number }): void {
    this.reason = data.reason ?? 'lives';
    this.score = data.score ?? 0;
    this.kisses = data.kisses ?? 0;
  }

  create(): void {
    this.buildUi();
    this.setupRestart();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.buildUi, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.buildUi, this);
    });
  }

  private buildUi = (): void => {
    this.children.removeAll(true);

    const base = END_SCREEN.gameOver;
    const layout = layoutCoverScreenBackground(this, 'screen-game-over-screen');
    const { cx, mapY } = layout;
    const px = (n: number) => scalePx(layout, n);

    this.cameras.main.setBackgroundColor('#fce4ec');

    this.add
      .text(cx, mapY(base.reasonY), REASON_COPY[this.reason], {
        fontSize: `${px(base.reasonSize)}px`,
        fontFamily: 'Inter, Nunito, system-ui, sans-serif',
        color: base.reasonColor,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20);

    addStatsPill(
      this,
      cx,
      mapY(base.statsY),
      `Kisses: ${this.kisses}  |  Score: ${this.score}`,
      {
        statsW: px(base.statsW),
        statsH: px(base.statsH),
        statsBg: base.statsBg,
        statsTextColor: base.statsTextColor,
        statsTextSize: px(base.statsTextSize),
      },
    );

    const restart = () => this.scene.start('GameScene');
    addCtaHitZone(this, cx, mapY(base.ctaY), px(base.ctaW), px(base.ctaH), restart);
  };

  private setupRestart(): void {
    const restart = () => this.scene.start('GameScene');
    this.input.keyboard?.on('keydown-ENTER', restart);
    this.input.keyboard?.on('keydown-SPACE', restart);
  }
}
