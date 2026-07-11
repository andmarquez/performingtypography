import type { AnimationItem } from 'lottie-web';
import lottie from 'lottie-web';
import type { ScreenLayout } from './endScreenLayout';
import { GAME_CONFIG } from '../config/gameConfig';

const HOST_ID = 'game-over-lottie-host';

type LottieHost = {
  root: HTMLDivElement;
  animation: AnimationItem;
};

let activeHost: LottieHost | null = null;

function getGameContainer(): HTMLElement | null {
  return document.getElementById('game-container');
}

function removeHost(): void {
  if (!activeHost) return;
  activeHost.animation.destroy();
  activeHost.root.remove();
  activeHost = null;
}

/** Cover-fit Lottie artboard (1280×720) to the same rect as end-screen PNG backgrounds. */
export function mountGameOverLottieOverlay(
  layout: ScreenLayout,
  animationData: object,
  backdropColor: string,
): void {
  removeHost();

  const parent = getGameContainer();
  if (!parent) return;

  const contentW = GAME_CONFIG.width * layout.scale;
  const contentH = GAME_CONFIG.height * layout.scale;
  const offsetX = layout.cx - contentW / 2;
  const offsetY = layout.cy - contentH / 2;

  const root = document.createElement('div');
  root.id = HOST_ID;
  root.style.position = 'absolute';
  root.style.inset = '0';
  root.style.pointerEvents = 'none';
  root.style.zIndex = '0';
  root.style.backgroundColor = backdropColor;

  const stage = document.createElement('div');
  stage.style.position = 'absolute';
  stage.style.left = `${offsetX}px`;
  stage.style.top = `${offsetY}px`;
  stage.style.width = `${contentW}px`;
  stage.style.height = `${contentH}px`;
  stage.style.overflow = 'hidden';
  root.appendChild(stage);

  parent.insertBefore(root, parent.firstChild);

  const animation = lottie.loadAnimation({
    container: stage,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  });

  activeHost = { root, animation };
}

export function unmountGameOverLottieOverlay(): void {
  removeHost();
}
