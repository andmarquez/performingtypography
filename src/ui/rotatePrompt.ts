import Phaser from 'phaser';
import { isLandscapeViewport, isMobileViewport, onViewportChange } from './viewportMetrics';

const ROTATE_PROMPT_SCENES = new Set([
  'BootScene',
  'MenuScene',
  'GameScene',
  'GameOverScene',
  'WinScene',
]);

/** Centered HTML overlay — does not touch Phaser scale or screen layouts. */
export function mountRotatePrompt(game: Phaser.Game): void {
  const el = document.getElementById('rotate-prompt');
  if (!el) return;

  const update = (): void => {
    const portrait = isMobileViewport() && !isLandscapeViewport();
    const onRotatePromptScene = game.scene
      .getScenes(true)
      .some((scene) => ROTATE_PROMPT_SCENES.has(scene.scene.key));
    el.hidden = !(portrait && onRotatePromptScene);
  };

  onViewportChange(update);
  const bindScene = (scene: Phaser.Scene): void => {
    scene.events.on(Phaser.Scenes.Events.START, update);
    scene.events.on(Phaser.Scenes.Events.WAKE, update);
  };
  game.scene.getScenes(false).forEach(bindScene);
  game.events.on(Phaser.Scenes.Events.CREATE, (scene: Phaser.Scene) => {
    bindScene(scene);
    update();
  });
  game.events.on(Phaser.Scenes.Events.START, update);
  game.events.once('ready', update);
  update();
}
