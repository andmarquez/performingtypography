import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

export type TouchInput = {
  left: boolean;
  right: boolean;
  jump: boolean;
};

/**
 * MobileControls — large semi-transparent touch buttons for thumbs.
 * Supports multi-touch so move + jump work simultaneously.
 */
export class MobileControls {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private leftBtn!: Phaser.GameObjects.Arc;
  private rightBtn!: Phaser.GameObjects.Arc;
  private jumpBtn!: Phaser.GameObjects.Arc;
  private activePointers = new Map<number, 'left' | 'right' | 'jump'>();
  input: TouchInput = { left: false, right: false, jump: false };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);
    this.createButtons();
    this.setupPointerHandlers();

    scene.scale.on('resize', this.layout, this);
    this.layout();
  }

  private createButtons(): void {
    const style = {
      fillColor: 0xffffff,
      fillAlpha: 0.35,
      lineColor: 0xe91e63,
      lineWidth: 2,
    };

    this.leftBtn = this.scene.add.circle(0, 0, 44, style.fillColor, style.fillAlpha);
    this.leftBtn.setStrokeStyle(style.lineWidth, style.lineColor);
    this.leftBtn.setInteractive({ useHandCursor: false });

    this.rightBtn = this.scene.add.circle(0, 0, 44, style.fillColor, style.fillAlpha);
    this.rightBtn.setStrokeStyle(style.lineWidth, style.lineColor);
    this.rightBtn.setInteractive({ useHandCursor: false });

    this.jumpBtn = this.scene.add.circle(0, 0, 52, 0xf48fb1, 0.45);
    this.jumpBtn.setStrokeStyle(2, 0xe91e63);
    this.jumpBtn.setInteractive({ useHandCursor: false });

    const leftLabel = this.scene.add.text(0, 0, '◀', {
      fontSize: '28px',
      color: '#880e4f',
      fontFamily: 'Nunito, sans-serif',
    }).setOrigin(0.5);

    const rightLabel = this.scene.add.text(0, 0, '▶', {
      fontSize: '28px',
      color: '#880e4f',
      fontFamily: 'Nunito, sans-serif',
    }).setOrigin(0.5);

    const jumpLabel = this.scene.add.text(0, 0, '▲', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Nunito, sans-serif',
    }).setOrigin(0.5);

    this.container.add([
      this.leftBtn,
      this.rightBtn,
      this.jumpBtn,
      leftLabel,
      rightLabel,
      jumpLabel,
    ]);

    // Store label refs for layout
    (this.leftBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label = leftLabel;
    (this.rightBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label = rightLabel;
    (this.jumpBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label = jumpLabel;
  }

  private layout(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const pad = GAME_CONFIG.safePadding + 12;
    const bottom = h - pad;

    this.leftBtn.setPosition(pad + 44, bottom - 44);
    this.rightBtn.setPosition(pad + 44 + 96, bottom - 44);
    this.jumpBtn.setPosition(w - pad - 52, bottom - 52);

    const lb = (this.leftBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label;
    const rb = (this.rightBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label;
    const jb = (this.jumpBtn as Phaser.GameObjects.Arc & { label?: Phaser.GameObjects.Text }).label;
    lb?.setPosition(this.leftBtn.x, this.leftBtn.y);
    rb?.setPosition(this.rightBtn.x, this.rightBtn.y);
    jb?.setPosition(this.jumpBtn.x, this.jumpBtn.y);
  }

  private setupPointerHandlers(): void {
    this.scene.input.addPointer(2);

    const hitTest = (x: number, y: number): 'left' | 'right' | 'jump' | null => {
      const btns: { btn: Phaser.GameObjects.Arc; id: 'left' | 'right' | 'jump' }[] = [
        { btn: this.leftBtn, id: 'left' },
        { btn: this.rightBtn, id: 'right' },
        { btn: this.jumpBtn, id: 'jump' },
      ];
      for (const { btn, id } of btns) {
        const dist = Phaser.Math.Distance.Between(x, y, btn.x, btn.y);
        if (dist <= btn.radius) return id;
      }
      return null;
    };

    const press = (pointer: Phaser.Input.Pointer) => {
      const action = hitTest(pointer.x, pointer.y);
      if (action) {
        this.activePointers.set(pointer.id, action);
        this.refreshInput();
        this.highlightButton(action, true);
      }
    };

    const release = (pointer: Phaser.Input.Pointer) => {
      const action = this.activePointers.get(pointer.id);
      if (action) {
        this.activePointers.delete(pointer.id);
        this.highlightButton(action, false);
        this.refreshInput();
      }
    };

    this.scene.input.on('pointerdown', press);
    this.scene.input.on('pointerup', release);
    this.scene.input.on('pointerupoutside', release);
    this.scene.input.on('pointercancel', release);
  }

  private highlightButton(action: 'left' | 'right' | 'jump', pressed: boolean): void {
    const map = { left: this.leftBtn, right: this.rightBtn, jump: this.jumpBtn };
    const btn = map[action];
    btn.setAlpha(pressed ? 0.7 : action === 'jump' ? 0.45 : 0.35);
    btn.setScale(pressed ? 0.92 : 1);
  }

  private refreshInput(): void {
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    for (const action of this.activePointers.values()) {
      this.input[action] = true;
    }
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
    this.container.destroy();
  }
}
