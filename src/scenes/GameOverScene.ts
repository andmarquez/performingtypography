import Phaser from 'phaser';
import {
  END_SCREEN,
  addCtaButton,
  addEndScreenBackground,
  addStatsPill,
  fitImageToSize,
  getScreenLayout,
  scalePx,
} from '../ui/endScreenLayout';
import { PortraitGate } from '../ui/PortraitGate';

export type GameOverReason = 'time' | 'lives' | 'fall';

const REASON_COPY: Record<GameOverReason, string> = {
  time: 'The deadline ran out!',
  lives: 'Too many deadline bugs got you!',
  fall: 'Andsiosa fell off the creative world!',
};

/**
 * GameOverScene — Figma M03; portrait gate + responsive layout.
 */
export class GameOverScene extends Phaser.Scene {
  private reason: GameOverReason = 'lives';
  private score = 0;
  private kisses = 0;
  private portraitGate?: PortraitGate;
  private content?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { reason?: GameOverReason; score?: number; kisses?: number }): void {
    this.reason = data.reason ?? 'lives';
    this.score = data.score ?? 0;
    this.kisses = data.kisses ?? 0;
  }

  create(): void {
    this.content = this.add.container(0, 0).setDepth(0);
    this.portraitGate = new PortraitGate(this, () => this.buildUi());
    this.buildUi();
    this.setupRestart();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.buildUi, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.buildUi, this);
      this.portraitGate?.destroy();
    });
  }

  private buildUi = (): void => {
    this.content?.removeAll(true);

    const allowed = this.portraitGate?.isContentAllowed() ?? true;
    this.content?.setVisible(allowed);
    if (!allowed) return;

    const base = END_SCREEN.gameOver;
    const layout = getScreenLayout(this);
    const { cx, mapY, mapX } = layout;
    const px = (n: number) => scalePx(layout, n);

    this.cameras.main.setBackgroundColor('#fce4ec');
    this.content?.add(addEndScreenBackground(this, base.bg, layout));

    const reason = this.add
      .text(cx, mapY(base.reasonY), REASON_COPY[this.reason], {
        fontSize: `${px(base.reasonSize)}px`,
        fontFamily: 'Inter, Nunito, system-ui, sans-serif',
        color: base.reasonColor,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);
    this.content?.add(reason);

    const title = this.add
      .image(cx, mapY(base.titleY), 'screen-game-over-title')
      .setScrollFactor(0)
      .setDepth(11);
    fitImageToSize(title, px(base.titleMaxW), px(338));
    this.content?.add(title);

    const stats = addStatsPill(
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
    this.content?.add([stats.bg, stats.label]);

    const character = this.add
      .image(cx, mapY(base.characterY), 'screen-game-over-character')
      .setScrollFactor(0)
      .setDepth(12);
    fitImageToSize(character, px(base.characterW), px(base.characterH));
    this.content?.add(character);

    const platform = this.add
      .image(mapX(627), mapY(base.platformY), 'screen-game-over-platform')
      .setScrollFactor(0)
      .setDepth(11);
    fitImageToSize(platform, px(base.platformW), px(base.platformH));
    this.content?.add(platform);

    const ctaY = mapY(base.ctaY);
    const restart = () => {
      if (!this.portraitGate?.isContentAllowed()) return;
      this.scene.start('GameScene');
    };
    const cta = addCtaButton(this, cx, ctaY, base.ctaLabel, {
      ctaW: px(base.ctaW),
      ctaH: px(base.ctaH),
      ctaColor: base.ctaColor,
      ctaHover: base.ctaHover,
      ctaTextSize: px(base.ctaTextSize),
      ctaRadius: px(base.ctaRadius),
    }, restart);
    this.content?.add([cta.bg, cta.label, cta.hit]);
  };

  private setupRestart(): void {
    const restart = () => {
      if (!this.portraitGate?.isContentAllowed()) return;
      this.scene.start('GameScene');
    };
    this.input.keyboard?.on('keydown-ENTER', restart);
    this.input.keyboard?.on('keydown-SPACE', restart);
  }
}
