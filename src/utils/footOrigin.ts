import type Phaser from 'phaser';

const cache = new Map<string, number>();

/** Origin Y (0–1) placing the sprite anchor on the lowest solid foot pixels. */
export function getFootOriginY(textures: Phaser.Textures.TextureManager, key: string): number {
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  const frame = textures.get(key).get();
  const source = textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement | null;
  if (!source || !('width' in source)) {
    cache.set(key, 1);
    return 1;
  }

  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    cache.set(key, 1);
    return 1;
  }

  ctx.drawImage(
    source as CanvasImageSource,
    frame.cutX,
    frame.cutY,
    frame.cutWidth,
    frame.cutHeight,
    0,
    0,
    frame.width,
    frame.height,
  );

  const data = ctx.getImageData(0, 0, frame.width, frame.height).data;
  const x0 = Math.floor(frame.width * 0.3);
  const x1 = Math.ceil(frame.width * 0.7);

  let soleRow = frame.height - 1;
  for (let y = frame.height - 1; y >= 0; y -= 1) {
    for (let x = x0; x < x1; x += 1) {
      if (data[(y * frame.width + x) * 4 + 3] > 200) {
        soleRow = y;
        cache.set(key, (soleRow + 1) / frame.height);
        return cache.get(key)!;
      }
    }
  }

  cache.set(key, 1);
  return 1;
}
