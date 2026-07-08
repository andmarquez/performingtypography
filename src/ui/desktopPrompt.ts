import Phaser from 'phaser';
import { isMobileViewport, onViewportChange } from './viewportMetrics';

const GAME_SCENES = new Set([
  'BootScene',
  'MenuScene',
  'GameScene',
  'GameOverScene',
  'WinScene',
]);

let promptGame: Phaser.Game | null = null;

function shouldShowDesktopPrompt(): boolean {
  const el = document.getElementById('desktop-prompt');
  if (!el) return false;
  if (isMobileViewport()) return false;

  if (!promptGame?.isBooted) return true;

  for (const key of GAME_SCENES) {
    if (promptGame.scene.isActive(key)) return true;
  }
  return false;
}

function updateDesktopPrompt(): void {
  const el = document.getElementById('desktop-prompt');
  if (!el) return;
  el.hidden = !shouldShowDesktopPrompt();
}

/** Run before Phaser boots so desktop visitors see the message immediately. */
export function bootstrapDesktopPrompt(): void {
  onViewportChange(updateDesktopPrompt);
  for (const ms of [0, 50, 150, 300, 600, 1000, 2000]) {
    window.setTimeout(updateDesktopPrompt, ms);
  }
  updateDesktopPrompt();
}

/** Wire Phaser scene transitions after the game is ready. */
export function mountDesktopPrompt(game: Phaser.Game): void {
  promptGame = game;

  const bindScene = (scene: Phaser.Scene): void => {
    scene.events.on(Phaser.Scenes.Events.START, updateDesktopPrompt);
    scene.events.on(Phaser.Scenes.Events.WAKE, updateDesktopPrompt);
  };

  game.scene.getScenes(false).forEach(bindScene);
  game.events.on(Phaser.Scenes.Events.CREATE, (scene: Phaser.Scene) => {
    bindScene(scene);
    updateDesktopPrompt();
  });
  game.events.on(Phaser.Scenes.Events.START, updateDesktopPrompt);
  game.scale.on(Phaser.Scale.Events.RESIZE, updateDesktopPrompt);
  game.events.once('ready', updateDesktopPrompt);
  updateDesktopPrompt();
}
