export const LONG_PRESS_MS = 560;
export const SWIPE_DISTANCE = 44;
export const TAP_SLOP = 14;
export const MULTI_TAP_WINDOW_MS = 280;

export function isInteractiveOverlayTarget(target) {
  if (!target?.closest) {
    return false;
  }

  return Boolean(
    target.closest(
      '.customize-fab, .experience-art-tabs, .customize-backdrop, .customize-panel, button, a, [role="tab"]',
    ),
  );
}

export function classifyPointerRelease({
  deltaX,
  deltaY,
  swipeDistance = SWIPE_DISTANCE,
  tapSlop = TAP_SLOP,
}) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX > swipeDistance && absX > absY) {
    return { type: 'swipe-horizontal', direction: deltaX > 0 ? 1 : -1 };
  }

  if (absY > swipeDistance && absY > absX) {
    return { type: 'swipe-vertical', direction: deltaY > 0 ? 1 : -1 };
  }

  if (absX <= tapSlop && absY <= tapSlop) {
    return { type: 'tap' };
  }

  return { type: 'cancel' };
}

export function scheduleMultiTap(handler, touchState, windowMs = MULTI_TAP_WINDOW_MS) {
  touchState.tapCount += 1;
  window.clearTimeout(touchState.tapTimer);

  touchState.tapTimer = window.setTimeout(() => {
    const count = touchState.tapCount;
    touchState.tapCount = 0;
    touchState.tapTimer = null;

    if (count === 1) {
      handler('single');
    } else if (count === 2) {
      handler('double');
    } else if (count >= 3) {
      handler('triple');
    }
  }, windowMs);
}
