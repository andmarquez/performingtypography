import Phaser from 'phaser';
import { getSoundManager } from '../audio/SoundManager';
import {
  getCachedGameOverLayout,
  getGameOverLottieCacheKey,
  getGameOverTextureKey,
  usesGameOverLottieTest,
} from '../ui/gameOverScreenConfig';
import {
  addCtaHitZone,
  addStatsPill,
  getCoverScreenLayout,
  layoutCoverScreenBackground,
  scalePx,
} from '../ui/endScreenLayout';
import {
  mountGameOverLottieOverlay,
  unmountGameOverLottieOverlay,
} from '../ui/gameOverLottieOverlay';

export type GameOverReason = 'time' | 'lives' | 'fall';

/**
 * GameOverScene — full-frame Figma M03 art + dynamic stats; CTA baked in.
 * Test layout: ?gameOverTest=1 (playful Lottie)  |  Preview: ?gameOver=1
 */
export class GameOverScene extends Phaser.Scene {
  private score = 0;
  private kisses = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { reason?: GameOverReason; score?: number; kisses?: number }): void {
    this.score = data.score ?? 0;
    this.kisses = data.kisses ?? 0;
  }

  create(): void {
    getSoundManager(this.game)?.play('sfx-game-over', this);
    this.buildUi();
    this.setupRestart();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.buildUi, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.buildUi, this);
      unmountGameOverLottieOverlay();
    });
  }

  private buildUi = (): void => {
    this.children.removeAll(true);

    const base = getCachedGameOverLayout(this.game);
    const useLottie = usesGameOverLottieTest();
    const layout = useLottie
      ? getCoverScreenLayout(this)
      : layoutCoverScreenBackground(this, getGameOverTextureKey());
    const { cx, mapY } = layout;
    const px = (n: number) => scalePx(layout, n);

    this.cameras.main.setBackgroundColor(useLottie ? 'rgba(0,0,0,0)' : base.bg);

    if (useLottie) {
      const lottieData = this.cache.json.get(getGameOverLottieCacheKey()) as object | null;
      if (lottieData) {
        mountGameOverLottieOverlay(layout, lottieData, `#${base.bg.toString(16).padStart(6, '0')}`);
      } else {
        unmountGameOverLottieOverlay();
      }
    } else {
      unmountGameOverLottieOverlay();
    }

    addStatsPill(
      this,
      cx,
      mapY(base.statsY),
      `Empanadas: ${this.kisses}  |  Score: ${this.score}`,
      {
        statsW: px(base.statsW),
        statsH: px(base.statsH),
        statsBg: base.statsBg,
        statsTextColor: base.statsTextColor,
        statsTextSize: px(base.statsTextSize),
      },
    );

    const restart = () => {
      unmountGameOverLottieOverlay();
      const sound = getSoundManager(this.game);
      sound?.unlock(this);
      sound?.playMusic('music-game', this);
      this.scene.start('GameScene');
    };
    addCtaHitZone(this, cx, mapY(base.ctaY), px(base.ctaW), px(base.ctaH), restart);
  };

  private setupRestart(): void {
    const restart = () => {
      unmountGameOverLottieOverlay();
      const sound = getSoundManager(this.game);
      sound?.unlock(this);
      sound?.playMusic('music-game', this);
      this.scene.start('GameScene');
    };
    this.input.keyboard?.on('keydown-ENTER', restart);
    this.input.keyboard?.on('keydown-SPACE', restart);
  }
}
