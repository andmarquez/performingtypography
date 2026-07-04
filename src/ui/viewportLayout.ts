import type Phaser from 'phaser';
import { getUiLayoutRect } from './scaleMode';

export type UiViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Fixed UI layout rect in game coordinates (FIT shows the full rect). */
export function getUiViewport(scale: Phaser.Scale.ScaleManager): UiViewport {
  return getUiLayoutRect(scale);
}

/** Map screen pointers to UI space (scrollFactor 0 objects ignore camera scroll). */
export function pointerToUiSpace(
  pointer: Phaser.Input.Pointer,
  camera: Phaser.Cameras.Scene2D.Camera,
): { x: number; y: number } {
  return {
    x: pointer.x - camera.scrollX,
    y: pointer.y - camera.scrollY,
  };
}
