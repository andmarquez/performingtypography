import type Phaser from 'phaser';
import { isMobileViewport } from './scaleMode';

/**
 * Whether to show Wild Rift–style touch controls.
 * Phones always qualify; desktop can force with ?mobile=1 in the URL.
 */
export function shouldShowMobileControls(game?: Phaser.Game): boolean {
  if (isMobileViewport()) return true;

  if (game?.device.input.touch) {
    const shortSide = Math.min(window.innerWidth, window.innerHeight);
    return shortSide <= 900;
  }

  return false;
}
