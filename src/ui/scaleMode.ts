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
  controlsLift: number;
  hudTopInset: number;
  joystickBottomInset: number;
  joystickXRatio: number;
  attackInsetX: number;
  attackInsetY: number;
  controlScale: number;
};

/** Touch HUD/control spacing tuned for landscape vs portrait. */
export function getMobileLayoutInsets(): MobileLayoutInsets {
  if (isLandscapeViewport()) {
    if (isIphone16Class()) {
      return {
        controlsLift: 22,
        hudTopInset: 4,
        joystickBottomInset: 14,
        joystickXRatio: 0.17,
        attackInsetX: 48,
        attackInsetY: 22,
        controlScale: 0.8,
      };
    }

    return {
      controlsLift: 36,
      hudTopInset: 6,
      joystickBottomInset: 20,
      joystickXRatio: 0.13,
      attackInsetX: 52,
      attackInsetY: 28,
      controlScale: 0.88,
    };
  }

  return {
    controlsLift: GAME_CONFIG.mobileControlsLift,
    hudTopInset: GAME_CONFIG.mobileHudTopInset,
    joystickBottomInset: GAME_CONFIG.mobileWildRift.joystick.bottomInset,
    joystickXRatio: GAME_CONFIG.mobileWildRift.joystick.xRatio,
    attackInsetX: GAME_CONFIG.mobileWildRift.attackInsetX,
    attackInsetY: GAME_CONFIG.mobileWildRift.attackInsetY,
    controlScale: 1,
  };
}
