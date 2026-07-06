import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';
import {
  getViewportSize,
  isIphone16Class,
  isLandscapeViewport,
  isMobileViewport,
  onViewportChange,
  resolveScaleMode,
} from './viewportMetrics';
import { safeAreaInsetsInGame } from './safeAreaUtils';
import { type UiViewport } from './viewportLayout';

export {
  getViewportSize,
  isIphone16Class,
  isLandscapeViewport,
  isMobileViewport,
  onViewportChange,
  resolveScaleMode,
};

/** Full design canvas in game coordinates. */
export function getUiLayoutRect(scale: Phaser.Scale.ScaleManager) {
  return {
    x: 0,
    y: 0,
    width: scale.width || GAME_CONFIG.width,
    height: scale.height || GAME_CONFIG.height,
  };
}

export type MobileLayoutInsets = {
  hudTopInset: number;
  joystickXRatio: number;
  joystickYRatio: number;
  jumpXRatio: number;
  jumpYRatio: number;
  kissXRatio: number;
  kissYRatio: number;
  controlScale: number;
};

const CFG = GAME_CONFIG.mobileWildRift;

/** Y center for a bottom-anchored circular control (joystick, jump, kiss). */
export function bottomAnchoredControlY(
  viewport: UiViewport,
  scale: Phaser.Scale.ScaleManager,
  radius: number,
  controlScale: number,
): number {
  const safe = safeAreaInsetsInGame(scale);
  const bottomPad = GAME_CONFIG.mobileControlsLift + safe.bottom;
  return viewport.y + viewport.height - bottomPad - radius * controlScale;
}

/** Figma M02 control anchors — X from Figma, Y bottom-anchored at runtime. */
export function getMobileLayoutInsets(): MobileLayoutInsets {
  const scale = isLandscapeViewport() ? (isIphone16Class() ? 0.8 : 0.88) : 1;

  return {
    hudTopInset: isLandscapeViewport()
      ? (isIphone16Class() ? 4 : 6)
      : Math.round(GAME_CONFIG.height * GAME_CONFIG.mobileHudTopRatio),
    joystickXRatio: CFG.joystick.xRatio,
    joystickYRatio: CFG.joystick.yRatio,
    jumpXRatio: CFG.jumpXRatio,
    jumpYRatio: CFG.jumpYRatio,
    kissXRatio: CFG.kissXRatio,
    kissYRatio: CFG.kissYRatio,
    controlScale: scale,
  };
}
