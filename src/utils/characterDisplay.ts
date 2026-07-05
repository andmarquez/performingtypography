import type Phaser from 'phaser';
import { GAME_CONFIG } from '../config/gameConfig';

/** Scale trimmed Figma character art to a target on-screen height. */
export function getCharacterDisplayScale(
  textures: Phaser.Textures.TextureManager,
  textureKey: string,
  heightMultiplier = 1,
): number {
  const frame = textures.get(textureKey).get();
  const targetH = 64 * GAME_CONFIG.playerDisplayScale * heightMultiplier;
  return targetH / (frame.height || 64);
}
