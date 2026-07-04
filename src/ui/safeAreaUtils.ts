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
  const parentW = scale.parentSize?.width || window.innerWidth;
  const parentH = scale.parentSize?.height || window.innerHeight;
  const ratioX = gameW / Math.max(parentW, 1);
  const ratioY = gameH / Math.max(parentH, 1);

  return {
    top: screen.top * ratioY,
    right: screen.right * ratioX,
    bottom: screen.bottom * ratioY,
    left: screen.left * ratioX,
  };
}
