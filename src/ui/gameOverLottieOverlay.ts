import type { AnimationItem } from 'lottie-web';
import lottie from 'lottie-web';
import { GAME_CONFIG } from '../config/gameConfig';
import type { ResolvedGameOverLayout } from './gameOverScreenConfig';

const HOST_ID = 'game-over-lottie-host';

type CoverRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  scale: number;
};

type GameOverTestOverlay = {
  root: HTMLDivElement;
  animation: AnimationItem;
  onRestart: () => void;
};

let activeOverlay: GameOverTestOverlay | null = null;

function getGameContainer(): HTMLElement | null {
  return document.getElementById('game-container');
}

function getCanvasRect(parent: HTMLElement): CoverRect | null {
  const canvas = parent.querySelector('canvas');
  if (!canvas) return null;

  const parentRect = parent.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const scale = Math.max(
    canvasRect.width / GAME_CONFIG.width,
    canvasRect.height / GAME_CONFIG.height,
  );
  const width = GAME_CONFIG.width * scale;
  const height = GAME_CONFIG.height * scale;
  const left = canvasRect.left - parentRect.left + (canvasRect.width - width) / 2;
  const top = canvasRect.top - parentRect.top + (canvasRect.height - height) / 2;

  return { left, top, width, height, scale };
}

function colorHex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

function removeOverlay(): void {
  if (!activeOverlay) return;
  activeOverlay.animation.destroy();
  activeOverlay.root.remove();
  activeOverlay = null;

  const parent = getGameContainer();
  const canvas = parent?.querySelector('canvas');
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.opacity = '';
    canvas.style.pointerEvents = '';
  }
}

function mapDesignY(rect: CoverRect, designY: number): number {
  return rect.top + designY * rect.scale;
}

/** Official game-over Lottie overlay + invisible CTA tap target. */
export function mountGameOverLottieOverlay(
  animationData: object,
  layout: ResolvedGameOverLayout,
  onRestart: () => void,
): void {
  removeOverlay();

  const parent = getGameContainer();
  if (!parent) return;

  const rect = getCanvasRect(parent);
  if (!rect) return;

  const canvas = parent.querySelector('canvas');
  if (canvas instanceof HTMLCanvasElement) {
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
  }

  const root = document.createElement('div');
  root.id = HOST_ID;
  root.style.position = 'absolute';
  root.style.inset = '0';
  root.style.pointerEvents = 'none';
  root.style.zIndex = '5';

  const backdrop = document.createElement('div');
  backdrop.style.position = 'absolute';
  backdrop.style.inset = '0';
  backdrop.style.backgroundColor = colorHex(layout.bg);
  root.appendChild(backdrop);

  const stage = document.createElement('div');
  stage.style.position = 'absolute';
  stage.style.left = `${rect.left}px`;
  stage.style.top = `${rect.top}px`;
  stage.style.width = `${rect.width}px`;
  stage.style.height = `${rect.height}px`;
  stage.style.overflow = 'hidden';
  root.appendChild(stage);

  const ctaW = layout.ctaW * rect.scale;
  const ctaH = layout.ctaH * rect.scale;
  const ctaY = mapDesignY(rect, layout.ctaY);
  const ctaLeft = rect.left + rect.width / 2 - ctaW / 2;

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.setAttribute('aria-label', layout.ctaLabel);
  cta.style.position = 'absolute';
  cta.style.left = `${ctaLeft - 16}px`;
  cta.style.top = `${ctaY - ctaH / 2 - 14}px`;
  cta.style.width = `${ctaW + 32}px`;
  cta.style.height = `${ctaH + 28}px`;
  cta.style.border = '0';
  cta.style.padding = '0';
  cta.style.margin = '0';
  cta.style.background = 'transparent';
  cta.style.cursor = 'pointer';
  cta.style.pointerEvents = 'auto';
  cta.style.zIndex = '7';
  cta.addEventListener('click', onRestart);
  root.appendChild(cta);

  parent.appendChild(root);

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

  activeOverlay = { root, animation, onRestart };
}

export function unmountGameOverLottieOverlay(): void {
  removeOverlay();
}
