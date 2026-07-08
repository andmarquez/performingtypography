import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import { shouldShowMobileControls } from './mobileControlUtils';
import { isLandscapeViewport, onViewportChange } from './viewportMetrics';

const GATE_DEPTH = 2000;
const FONT = 'Inter, Nunito, system-ui, sans-serif';

/**
 * Blocks portrait mobile view with a rotate prompt; content stays hidden until landscape.
 */
export class PortraitGate {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private icon: Phaser.GameObjects.Text;
  private message: Phaser.GameObjects.Text;
  private offViewportChange?: () => void;
  private wasAllowed = true;

  constructor(
    private scene: Phaser.Scene,
    private onGateChange?: () => void,
  ) {
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(GATE_DEPTH);

    this.bg = scene.add.rectangle(0, 0, 100, 100, 0xfce4ec, 1).setOrigin(0.5);
    this.icon = scene.add
      .text(0, 0, '↻', { fontSize: '72px', fontFamily: FONT, color: '#880e4f' })
      .setOrigin(0.5);
    this.message = scene.add
      .text(0, 0, 'Rotate your phone\nto play', {
        fontSize: '28px',
        fontFamily: FONT,
        fontStyle: '700',
        color: '#880e4f',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.container.add([this.bg, this.icon, this.message]);

    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.offViewportChange = onViewportChange(() => this.layout());
    this.layout();
  }

  /** True when splash / end-screen content should be visible. */
  isContentAllowed(): boolean {
    return !shouldShowMobileControls(this.scene.game) || isLandscapeViewport();
  }

  private layout = (): void => {
    const w = this.scene.scale.width || GAME_CONFIG.width;
    const h = this.scene.scale.height || GAME_CONFIG.height;
    const cx = w / 2;
    const cy = h / 2;
    const showGate = shouldShowMobileControls(this.scene.game) && !isLandscapeViewport();
    const fontScale = Math.min(w / GAME_CONFIG.width, h / GAME_CONFIG.height);

    this.container.setVisible(showGate);
    this.bg.setPosition(cx, cy);
    this.bg.setSize(w, h);
    this.icon.setPosition(cx, cy - 52 * fontScale);
    this.message.setPosition(cx, cy + 40 * fontScale);
    this.message.setFontSize(`${Math.round(28 * fontScale)}px`);
    this.icon.setFontSize(`${Math.round(72 * fontScale)}px`);

    const allowed = this.isContentAllowed();
    if (allowed !== this.wasAllowed) {
      this.wasAllowed = allowed;
      this.onGateChange?.();
    }
  };

  destroy(): void {
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.offViewportChange?.();
    this.container.destroy();
  }
}
