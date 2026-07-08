import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { coverFitImage, getScreenLayout } from '../ui/endScreenLayout';

/**
 * MenuScene — Figma M01 start screen (TEPUY / LEVEL 1).
 */
export class MenuScene extends Phaser.Scene {
  private canStart = false;
  private onWindowKeydown?: (event: KeyboardEvent) => void;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.layoutScreen();
    this.canStart = true;
    this.setupKeyboard();
    this.setupPointer();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutScreen, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.game.canvas.setAttribute('tabindex', '0');
    this.game.canvas.focus({ preventScroll: true });
  }

  private layoutScreen = (): void => {
    this.children.removeAll(true);

    const layout = getScreenLayout(this);
    const w = GAME_CONFIG.width * layout.scale;
    const h = GAME_CONFIG.height * layout.scale;
    const bg = this.add
      .image(layout.cx, layout.cy, 'screen-menu-start')
      .setScrollFactor(0);
    coverFitImage(bg, w, h);
  };

  private setupKeyboard(): void {
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());

    this.onWindowKeydown = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        this.startGame();
      }
    };
    window.addEventListener('keydown', this.onWindowKeydown);
  }

  private setupPointer(): void {
    const tryStart = () => this.startGame();
    this.input.on('pointerdown', tryStart);
    this.input.on('pointerup', tryStart);
  }

  private cleanup = (): void => {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutScreen, this);
    if (this.onWindowKeydown) {
      window.removeEventListener('keydown', this.onWindowKeydown);
      this.onWindowKeydown = undefined;
    }
  };

  private startGame(): void {
    if (!this.canStart) return;
    this.canStart = false;
    this.scene.start('GameScene');
  }
}
