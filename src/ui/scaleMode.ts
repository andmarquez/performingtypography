import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/** True for phone-sized or forced mobile preview (`?mobile=1`). */
export function isMobileViewport(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mobile') === '1') return true;

  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const touch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return touch && shortSide <= 900;
}

/** Letterboxed fit keeps the full frame visible and aligned on phones. */
export function resolveScaleMode(): number {
  return Phaser.Scale.FIT;
}

/** Game-space rectangle used for HUD and touch UI (always 1280×720 design coords). */
export function getUiLayoutRect(scale: Phaser.Scale.ScaleManager) {
  return {
    x: 0,
    y: 0,
    width: scale.width || GAME_CONFIG.width,
    height: scale.height || GAME_CONFIG.height,
  };
}
