/**
 * Whether to show Wild Rift–style touch controls.
 * Phones always qualify; desktop can force with ?mobile=1 in the URL.
 */
export function shouldShowMobileControls(
  game: Phaser.Game,
): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mobile') === '1') return true;
  if (game.device.input.touch) return true;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const shortSide = Math.min(w, h);

  // Phone / tablet sized viewports (landscape or portrait)
  return shortSide <= 720;
}
