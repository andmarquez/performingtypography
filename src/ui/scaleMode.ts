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

/** Figma M02 control anchors scaled to visible viewport. */
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
