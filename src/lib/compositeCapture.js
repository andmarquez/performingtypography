import {
  buildPhotoFilename,
  buildVideoFilename,
  createVideoRecorder,
  extensionForMime,
  saveBlobToDevice,
} from './mediaCapture.js';

const MAX_CAPTURE_HEIGHT = 1280;
const RECORD_FPS = 30;

function loadImageFromSvgElement(svgElement, pixelWidth, pixelHeight) {
  const clone = svgElement.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  if (!clone.getAttribute('viewBox')) {
    const widthAttr = clone.getAttribute('width');
    const heightAttr = clone.getAttribute('height');
    if (widthAttr && heightAttr) {
      clone.setAttribute('viewBox', `0 0 ${widthAttr} ${heightAttr}`);
    }
  }

  clone.setAttribute('width', String(pixelWidth));
  clone.setAttribute('height', String(pixelHeight));

  const serialized = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(
    new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' }),
  );

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not render SVG artwork for capture.'));
    };
    image.src = url;
  });
}

export function getCaptureDimensions(frameEl) {
  const rect = frameEl.getBoundingClientRect();
  let width = rect.width;
  let height = rect.height;

  if (height > MAX_CAPTURE_HEIGHT) {
    const scale = MAX_CAPTURE_HEIGHT / height;
    width *= scale;
    height *= scale;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  return {
    width: Math.max(1, Math.round(width * dpr)),
    height: Math.max(1, Math.round(height * dpr)),
    frameRect: rect,
  };
}

function drawVideoCover(context, video, width, height) {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (!videoWidth || !videoHeight) {
    return false;
  }

  const scale = Math.max(width / videoWidth, height / videoHeight);
  const drawWidth = videoWidth * scale;
  const drawHeight = videoHeight * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;

  context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
  return true;
}

function drawShadeOverlay(context, width, height) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
  gradient.addColorStop(0.42, 'rgba(0, 0, 0, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function getArtworkPlacement(frameEl, canvasWidth, canvasHeight) {
  const item = frameEl.querySelector('.imported-svg-layer .imported-svg-item.is-experience');

  if (!item) {
    return null;
  }

  const frameRect = frameEl.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  return {
    x: ((itemRect.left - frameRect.left) / frameRect.width) * canvasWidth,
    y: ((itemRect.top - frameRect.top) / frameRect.height) * canvasHeight,
    w: (itemRect.width / frameRect.width) * canvasWidth,
    h: (itemRect.height / frameRect.height) * canvasHeight,
  };
}

export async function prepareArtworkImage(frameEl, canvasWidth, canvasHeight) {
  const item = frameEl.querySelector('.imported-svg-layer .imported-svg-item.is-experience');

  if (!item) {
    return null;
  }

  const svg = item.querySelector('svg');

  if (!svg) {
    return null;
  }

  const placement = getArtworkPlacement(frameEl, canvasWidth, canvasHeight);

  if (!placement) {
    return null;
  }

  const image = await loadImageFromSvgElement(
    svg,
    Math.max(1, Math.round(placement.w)),
    Math.max(1, Math.round(placement.h)),
  );

  return image;
}

export function drawExperienceFrame(context, width, height, sources) {
  const { video, graphicsCanvas, artworkOverlay } = sources;

  context.fillStyle = '#000000';
  context.fillRect(0, 0, width, height);

  if (!video || !drawVideoCover(context, video, width, height)) {
    return false;
  }

  drawShadeOverlay(context, width, height);

  if (graphicsCanvas && graphicsCanvas.width > 0 && graphicsCanvas.height > 0) {
    context.drawImage(graphicsCanvas, 0, 0, width, height);
  }

  if (artworkOverlay?.image) {
    context.save();
    context.globalCompositeOperation = 'screen';
    context.drawImage(
      artworkOverlay.image,
      artworkOverlay.x,
      artworkOverlay.y,
      artworkOverlay.w,
      artworkOverlay.h,
    );
    context.restore();
  }

  return true;
}

export async function captureCompositePhoto({ frameEl, videoEl, graphicsCanvas }) {
  if (!frameEl || !videoEl) {
    throw new Error('Experience is not ready for capture.');
  }

  if (videoEl.readyState < 2) {
    throw new Error('Camera is not ready yet. Wait a moment and try again.');
  }

  const { width, height } = getCaptureDimensions(frameEl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not capture the experience.');
  }

  const artworkImage = await prepareArtworkImage(frameEl, width, height);
  const drew = drawExperienceFrame(context, width, height, {
    video: videoEl,
    graphicsCanvas,
    frameEl,
    artworkImage,
  });

  if (!drew) {
    throw new Error('Could not capture the experience frame.');
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create photo file.'));
        }
      },
      'image/jpeg',
      0.92,
    );
  });
}

export async function startCompositeRecording({
  frameEl,
  videoEl,
  graphicsCanvas,
  audioStream,
  onData,
}) {
  if (!frameEl || !videoEl || !audioStream) {
    throw new Error('Experience is not ready for recording.');
  }

  if (typeof MediaRecorder === 'undefined') {
    throw new Error('Video recording is not supported in this browser.');
  }

  const { width, height } = getCaptureDimensions(frameEl);
  const recordCanvas = document.createElement('canvas');
  recordCanvas.width = width;
  recordCanvas.height = height;
  const context = recordCanvas.getContext('2d');

  if (!context) {
    throw new Error('Could not start composite recording.');
  }

  const artworkOverlay = await prepareArtworkOverlay(frameEl, width, height);
  const canvasStream = recordCanvas.captureStream(RECORD_FPS);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);

  const { recorder, mimeType } = createVideoRecorder(combinedStream, onData);

  let stopped = false;

  const renderFrame = () => {
    if (stopped) {
      return;
    }

    drawExperienceFrame(context, width, height, {
      video: videoEl,
      graphicsCanvas,
      artworkOverlay,
    });
    window.requestAnimationFrame(renderFrame);
  };

  renderFrame();

  return {
    recorder,
    mimeType,
    stop() {
      stopped = true;
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      canvasStream.getVideoTracks().forEach((track) => track.stop());
    },
  };
}

export { buildPhotoFilename, buildVideoFilename, saveBlobToDevice, extensionForMime };
