import Phaser from 'phaser';
import { isLandscapeViewport, isMobileViewport, onViewportChange } from './viewportMetrics';

const STATIC_SCENES = new Set(['BootScene', 'MenuScene', 'GameOverScene', 'WinScene']);

/** Centered HTML overlay — does not touch Phaser scale or screen layouts. */
export function mountRotatePrompt(game: Phaser.Game): void {
  const el = document.getElementById('rotate-prompt');
  if (!el) return;

  const update = (): void => {
    const portrait = isMobileViewport() && !isLandscapeViewport();
    const onStaticScreen = game.scene
      .getScenes(true)
      .some((scene) => STATIC_SCENES.has(scene.scene.key));
    el.hidden = !(portrait && onStaticScreen);
  };

  onViewportChange(update);
  game.events.on(Phaser.Scenes.Events.CREATE, update);
  game.events.on(Phaser.Scenes.Events.START, update);
  game.events.once('ready', update);
  update();
}
