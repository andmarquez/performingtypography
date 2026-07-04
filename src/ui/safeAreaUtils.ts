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

  const gameH = scale.height;
  const displayH = scale.displaySize.height || gameH;
  const ratio = gameH / Math.max(displayH, 1);

  return {
    top: screen.top * ratio,
    right: screen.right * ratio,
    bottom: screen.bottom * ratio,
    left: screen.left * ratio,
  };
}
