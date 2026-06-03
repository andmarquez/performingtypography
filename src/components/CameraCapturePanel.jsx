import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildPhotoFilename,
  buildVideoFilename,
  captureCompositePhoto,
  saveBlobToDevice,
  startCompositeRecording,
} from '../lib/compositeCapture.js';

export default function CameraCapturePanel({
  open,
  frameRef,
  videoRef,
  streamRef,
  graphicsRef,
  onClose,
}) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const recordingRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef('');

  useEffect(() => {
    if (!open) {
      setMessage('');
      setIsBusy(false);
    }
  }, [open]);

  const stopRecording = useCallback(() => {
    recordingRef.current?.stop();
    recordingRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      stopRecording();
      setIsRecording(false);
    }

    return () => {
      stopRecording();
    };
  }, [open, stopRecording]);

  const getGraphicsCanvas = () => graphicsRef.current?.getCanvas?.() ?? null;

  const handlePhoto = async () => {
    const frame = frameRef.current;
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!frame || !video || !stream) {
      setMessage('Start the experience first to use the camera.');
      return;
    }

    setIsBusy(true);
    setMessage('Capturing screen with artwork…');

    try {
      const blob = await captureCompositePhoto({
        frameEl: frame,
        videoEl: video,
        graphicsCanvas: getGraphicsCanvas(),
      });
      const result = await saveBlobToDevice(blob, buildPhotoFilename());

      if (result.method === 'cancelled') {
        setMessage('Photo capture cancelled.');
      } else if (result.method === 'share') {
        setMessage('Choose Save Image in the share sheet to store on your phone.');
      } else {
        setMessage('Photo saved with camera + artwork.');
      }
    } catch (captureError) {
      setMessage(captureError?.message || 'Could not save photo.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggleRecord = async () => {
    const frame = frameRef.current;
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!frame || !video || !stream) {
      setMessage('Start the experience first to use the camera.');
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    setIsBusy(true);
    setMessage('Starting recording…');

    try {
      chunksRef.current = [];

      const session = await startCompositeRecording({
        frameEl: frame,
        videoEl: video,
        graphicsCanvas: getGraphicsCanvas(),
        audioStream: stream,
        onData: (chunk) => {
          chunksRef.current.push(chunk);
        },
      });

      mimeTypeRef.current = session.mimeType;
      recordingRef.current = session;

      session.recorder.addEventListener(
        'stop',
        async () => {
          setIsRecording(false);
          setIsBusy(true);
          setMessage('Saving video…');

          try {
            const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
            chunksRef.current = [];

            if (!blob.size) {
              throw new Error('Recording was empty. Try again.');
            }

            const result = await saveBlobToDevice(
              blob,
              buildVideoFilename(mimeTypeRef.current),
            );

            if (result.method === 'cancelled') {
              setMessage('Video save cancelled.');
            } else if (result.method === 'share') {
              setMessage('Choose Save Video in the share sheet to store on your phone.');
            } else {
              setMessage('Video saved with camera, beats, and artwork.');
            }
          } catch (saveError) {
            setMessage(saveError?.message || 'Could not save video.');
          } finally {
            setIsBusy(false);
            recordingRef.current = null;
          }
        },
        { once: true },
      );

      session.recorder.start(1000);
      setIsRecording(true);
      setMessage('Recording screen + artwork… Tap Stop when finished.');
    } catch (recordError) {
      setMessage(recordError?.message || 'Could not start recording.');
      setIsRecording(false);
      recordingRef.current = null;
    } finally {
      setIsBusy(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="capture-backdrop" role="presentation" onClick={onClose}>
      <div
        className="capture-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Camera capture"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="capture-header">
          <h2>Camera</h2>
          <button type="button" className="capture-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <p className="capture-hint">
          Saves what you see: live camera, beat graphics, and SVG artwork together. On iPhone, use
          the share sheet and tap Save Photo or Save Video.
        </p>

        <div className="capture-actions">
          <button
            type="button"
            className="capture-action"
            disabled={isBusy || isRecording}
            onClick={handlePhoto}
          >
            Take photo
          </button>
          <button
            type="button"
            className={`capture-action ${isRecording ? 'is-recording' : ''}`}
            disabled={isBusy && !isRecording}
            onClick={handleToggleRecord}
          >
            {isRecording ? 'Stop recording' : 'Record video'}
          </button>
        </div>

        {isRecording ? <p className="capture-recording-badge" aria-live="polite">● REC</p> : null}
        {message ? (
          <p className="capture-status" aria-live="polite">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
