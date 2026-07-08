import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { WinScene } from './scenes/WinScene';
import { GAME_CONFIG } from './config/gameConfig';
import {
  getViewportSize,
  isIphone16Class,
  isLandscapeViewport,
  isMobileViewport,
  onViewportChange,
  resolveActiveScaleMode,
} from './ui/viewportMetrics';

const applyViewportClasses = () => {
  const mobile = isMobileViewport();
  const landscape = isLandscapeViewport();
  const { width, height } = getViewportSize();

  document.documentElement.classList.toggle('is-mobile-view', mobile);
  document.documentElement.classList.toggle('is-desktop-view', !mobile);
  document.documentElement.classList.toggle('is-landscape-view', landscape);
  document.documentElement.classList.toggle('is-portrait-view', !landscape);
  document.documentElement.dataset.viewport = `${width}x${height}`;
  document.documentElement.dataset.orientation = landscape ? 'landscape' : 'portrait';
  document.documentElement.classList.toggle('is-iphone16-class', isIphone16Class());

  const theme = mobile && !landscape ? '#fce4ec' : '#b8e0f5';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme);
};

const applyScaleMode = () => {
  applyViewportClasses();
  if (!game.isBooted) return;
  const next = resolveActiveScaleMode(game);
  if (game.scale.scaleMode !== next) {
    game.scale.scaleMode = next;
  }
  game.scale.refresh();
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: '#b8e0f5',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME_CONFIG.gravity },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, WinScene],
  input: {
    activePointers: 4,
  },
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
});

applyViewportClasses();
onViewportChange(applyScaleMode);

game.events.once('ready', () => {
  applyScaleMode();
  if (game.input.touch) {
    game.input.touch.capture = false;
  }
});

game.events.on(Phaser.Scenes.Events.CREATE, () => {
  applyScaleMode();
});

document.addEventListener(
  'touchmove',
  (e) => {
    if (game.scene.isActive('GameScene') || game.scene.isActive('MenuScene')) {
      e.preventDefault();
    }
  },
  { passive: false },
);

if (typeof window !== 'undefined') {
  (window as Window & { __PHASER_GAME__?: Phaser.Game }).__PHASER_GAME__ = game;
}

export default game;
