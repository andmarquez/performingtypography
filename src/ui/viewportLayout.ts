/** Visible game area when the canvas uses ENVELOP (cropped edges). */
export type UiViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getUiViewport(scale: Phaser.Scale.ScaleManager): UiViewport {
  const r = scale.getViewPort();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}
