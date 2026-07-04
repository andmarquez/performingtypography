import Phaser from 'phaser';

/** Map CSS safe-area insets (px) into Phaser game coordinates. */
export function safeAreaInsetsInGame(scale: Phaser.Scale.ScaleManager): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:fixed',
    'visibility:hidden',
    'pointer-events:none',
    'padding-top:env(safe-area-inset-top)',
    'padding-right:env(safe-area-inset-right)',
    'padding-bottom:env(safe-area-inset-bottom)',
    'padding-left:env(safe-area-inset-left)',
  ].join(';');
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const screen = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
  document.body.removeChild(probe);

  const gameW = scale.width;
  const gameH = scale.height;
  const displayW = scale.displaySize?.width || scale.parentSize?.width || window.innerWidth;
  const displayH = scale.displaySize?.height || scale.parentSize?.height || window.innerHeight;

  return {
    top: screen.top * (gameH / Math.max(displayH, 1)),
    right: screen.right * (gameW / Math.max(displayW, 1)),
    bottom: screen.bottom * (gameH / Math.max(displayH, 1)),
    left: screen.left * (gameW / Math.max(displayW, 1)),
  };
}
