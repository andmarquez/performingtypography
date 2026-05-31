import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlyphVector, useBeatAudio } from './hooks/useBeatAudio.js';
import {
  getLyricAtTime,
  identifySongFromStream,
  loadLyricsForSong,
  searchLyrics,
} from './lib/lyricsService.js';
import { clamp } from './lib/audioAnalysis.js';

const MODES = [
  { id: 'pulse', label: 'Pulse with audio' },
  { id: 'stretch', label: 'Stretch' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'wave', label: 'Wave' },
  { id: 'explosion', label: 'Explosion' },
];

const SWIPE_DISTANCE = 44;
const AUTO_IDENTIFY_MS = 22000;

export default function LyricsApp() {
  const frameRef = useRef(null);
  const songAnchorRef = useRef(null);
  const identifyLockRef = useRef(false);
  const beatLineBumpRef = useRef(0);

  const [modeIndex, setModeIndex] = useState(0);
  const [songMeta, setSongMeta] = useState(null);
  const [lyricLines, setLyricLines] = useState([]);
  const [lyricsSynced, setLyricsSynced] = useState(false);
  const [lyricIndex, setLyricIndex] = useState(0);
  const [displayText, setDisplayText] = useState('LISTENING…');
  const [searchQuery, setSearchQuery] = useState('');
  const [identifyStatus, setIdentifyStatus] = useState('');
  const [autoIdentify, setAutoIdentify] = useState(false);
  const [explosionKey, setExplosionKey] = useState(0);
  const [isExploding, setIsExploding] = useState(false);

  const {
    hasStarted,
    status,
    error,
    setStatus,
    setError,
    audioLevel,
    currentStyle,
    videoRef,
    streamRef,
    startExperience,
    updateFrameVariable,
    setOnBeat,
  } = useBeatAudio(frameRef);

  const currentMode = MODES[modeIndex];
  const glyphs = useMemo(() => Array.from(displayText), [displayText]);
  const auddToken = import.meta.env.VITE_AUDD_API_TOKEN ?? '';

  const setSongClock = useCallback((songTimeNow) => {
    songAnchorRef.current = {
      wallTime: performance.now(),
      songTime: songTimeNow,
    };
  }, []);

  const getSongTime = useCallback(() => {
    if (!songAnchorRef.current) {
      return 0;
    }

    return (
      songAnchorRef.current.songTime +
      (performance.now() - songAnchorRef.current.wallTime) / 1000
    );
  }, []);

  const applyLyricLine = useCallback((index, lines) => {
    if (!lines.length) {
      setDisplayText('NO LYRICS FOUND');
      return;
    }

    const safeIndex = ((index % lines.length) + lines.length) % lines.length;
    setLyricIndex(safeIndex);
    setDisplayText(lines[safeIndex].text.toUpperCase());
  }, []);

  const handleLyricsLoaded = useCallback(
    (song, lyricsResult, songTimeNow = 0) => {
      setSongMeta(song);
      setLyricLines(lyricsResult.lines);
      setLyricsSynced(lyricsResult.synced);
      setSongClock(songTimeNow);

      if (lyricsResult.lines.length) {
        const { index, text } = getLyricAtTime(lyricsResult.lines, songTimeNow);
        setLyricIndex(index);
        setDisplayText(text.toUpperCase());
        setIdentifyStatus(lyricsResult.synced ? 'Synced lyrics loaded.' : 'Lyrics loaded (beat-advance).');
      } else {
        setDisplayText('NO LYRICS FOUND');
        setIdentifyStatus('Song found but no lyrics in LRCLIB.');
      }
    },
    [setSongClock],
  );

  const runIdentify = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream || identifyLockRef.current) {
      return;
    }

    identifyLockRef.current = true;
    setIdentifyStatus('Listening 6s to identify song…');

    try {
      let song = null;

      if (auddToken) {
        song = await identifySongFromStream(stream, auddToken);
      }

      if (!song && searchQuery.trim()) {
        const results = await searchLyrics(searchQuery.trim());
        if (results[0]) {
          song = {
            artist: results[0].artistName,
            title: results[0].trackName,
            album: results[0].albumName,
            songTimeNow: 0,
          };
        }
      }

      if (!song) {
        setIdentifyStatus(
          auddToken
            ? 'No match. Try louder music or search manually below.'
            : 'Add VITE_AUDD_API_TOKEN for auto-detect, or search manually.',
        );
        return;
      }

      setIdentifyStatus(`Found: ${song.artist} — ${song.title}. Loading lyrics…`);
      const lyricsResult = await loadLyricsForSong(song);
      handleLyricsLoaded(
        { artist: song.artist, title: song.title, album: song.album },
        lyricsResult,
        song.songTimeNow ?? 0,
      );
    } catch (identifyError) {
      setIdentifyStatus(identifyError?.message || 'Identification failed.');
    } finally {
      identifyLockRef.current = false;
    }
  }, [auddToken, handleLyricsLoaded, searchQuery, streamRef]);

  const runManualSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIdentifyStatus('Searching lyrics…');

    try {
      const results = await searchLyrics(searchQuery.trim());
      if (!results[0]) {
        setIdentifyStatus('No lyrics found for that search.');
        return;
      }

      const song = {
        artist: results[0].artistName,
        title: results[0].trackName,
        album: results[0].albumName,
      };

      const lyricsResult = await loadLyricsForSong(song);
      handleLyricsLoaded(song, lyricsResult, 0);
    } catch (searchError) {
      setIdentifyStatus(searchError?.message || 'Search failed.');
    }
  }, [handleLyricsLoaded, searchQuery]);

  const triggerExplosion = useCallback(() => {
    setExplosionKey((key) => key + 1);
    setIsExploding(true);
    window.setTimeout(() => setIsExploding(false), 780);
  }, []);

  const changeMode = useCallback((direction = 1) => {
    setModeIndex((index) => (index + direction + MODES.length) % MODES.length);
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      const touch = { x: event.clientX, y: event.clientY, timer: null, fired: false };
      touch.timer = window.setTimeout(() => {
        touch.fired = true;
        triggerExplosion();
      }, 560);
      frameRef.current._touch = touch;
    },
    [triggerExplosion],
  );

  const handlePointerUp = useCallback(
    (event) => {
      const touch = frameRef.current._touch;
      if (!touch) {
        return;
      }

      window.clearTimeout(touch.timer);
      if (touch.fired) {
        return;
      }

      const deltaX = event.clientX - touch.x;
      const deltaY = event.clientY - touch.y;

      if (Math.abs(deltaX) > SWIPE_DISTANCE && Math.abs(deltaX) > Math.abs(deltaY)) {
        changeMode(deltaX > 0 ? 1 : -1);
        return;
      }

      if (lyricLines.length) {
        applyLyricLine(lyricIndex + 1, lyricLines);
        if (!lyricsSynced) {
          setSongClock(lyricLines[lyricIndex + 1]?.time ?? 0);
        }
      } else {
        runIdentify();
      }
    },
    [applyLyricLine, changeMode, lyricIndex, lyricLines, lyricsSynced, runIdentify, setSongClock],
  );

  useEffect(() => {
    setOnBeat(() => {
      if (!lyricLines.length) {
        return;
      }

      if (lyricsSynced) {
        beatLineBumpRef.current += 1;
        return;
      }

      beatLineBumpRef.current += 1;
      if (beatLineBumpRef.current >= 2) {
        beatLineBumpRef.current = 0;
        applyLyricLine(lyricIndex + 1, lyricLines);
      }
    });
  }, [applyLyricLine, lyricIndex, lyricLines, lyricsSynced, setOnBeat]);

  useEffect(() => {
    if (!hasStarted || !lyricLines.length || !lyricsSynced) {
      return undefined;
    }

    const tick = () => {
      const { index, text } = getLyricAtTime(lyricLines, getSongTime());
      if (index !== lyricIndex) {
        setLyricIndex(index);
        setDisplayText(text.toUpperCase());
      }
    };

    const interval = window.setInterval(tick, 120);
    return () => window.clearInterval(interval);
  }, [getSongTime, hasStarted, lyricIndex, lyricLines, lyricsSynced]);

  useEffect(() => {
    if (!hasStarted || !autoIdentify) {
      return undefined;
    }

    const interval = window.setInterval(runIdentify, AUTO_IDENTIFY_MS);
    return () => window.clearInterval(interval);
  }, [autoIdentify, hasStarted, runIdentify]);

  useEffect(() => {
    const handleOrientation = (event) => {
      const gamma = Number.isFinite(event.gamma) ? event.gamma : 0;
      const beta = Number.isFinite(event.beta) ? event.beta : 0;

      updateFrameVariable('--tilt-x', clamp(gamma / 35, -1, 1).toFixed(3));
      updateFrameVariable('--tilt-y', clamp(beta / 45, -1, 1).toFixed(3));
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [updateFrameVariable]);

  const handleStart = useCallback(async () => {
    const stream = await startExperience();
    if (stream) {
      setStatus('Live. Tap Identify or search for a song.');
    }
  }, [startExperience, setStatus]);

  return (
    <main className="app lyrics-app">
      <section
        ref={frameRef}
        className={`phone-frame mode-${currentMode.id} ${isExploding ? 'is-exploding' : ''}`}
        onPointerDown={hasStarted ? handlePointerDown : undefined}
        onPointerUp={hasStarted ? handlePointerUp : undefined}
        onPointerCancel={hasStarted ? () => window.clearTimeout(frameRef.current?._touch?.timer) : undefined}
        style={{
          '--audio': audioLevel,
          '--bass': 0,
          '--mid': 0,
          '--high': 0,
          '--beat-flash': 0,
          '--beat-font': currentStyle.family,
          '--beat-color': currentStyle.color,
          '--beat-glow': currentStyle.glow,
          '--beat-weight': currentStyle.weight,
          '--beat-size': currentStyle.size,
          '--beat-spacing': currentStyle.spacing,
          '--tilt-x': 0,
          '--tilt-y': 0,
          '--motion': 0,
        }}
        aria-label="Lyrics kinetic typography experience"
      >
        <video ref={videoRef} className="camera-feed" autoPlay muted playsInline />
        <div className="camera-fallback" />
        <div className="shade" />
        <div className="grain" />

        {!hasStarted ? (
          <div className="start-panel">
            <p className="eyebrow">Lyrics Mode · Experimental</p>
            <h1>Lyrics that move with the beat.</h1>
            <p>
              Identifies songs from the mic and displays lyrics with the same kinetic
              typography. The classic experience is unchanged at the home link.
            </p>
            <button className="start-button" type="button" onClick={handleStart}>
              Start Lyrics Mode
            </button>
            <Link className="ghost-link" to="/">
              ← Back to classic mode
            </Link>
            <p className="status">{status}</p>
            {error ? <p className="error">{error}</p> : null}
          </div>
        ) : (
          <>
            <div className="hud top">
              <span>{songMeta ? `${songMeta.artist}` : currentMode.label}</span>
              <span className="hud-meta">
                <span className="style-tag" style={{ '--tag-color': currentStyle.color }}>
                  {currentStyle.label}
                </span>
              </span>
            </div>

            {songMeta ? (
              <p className="song-title">{songMeta.title}</p>
            ) : null}

            <div className="type-stage lyrics-stage" key={`${displayText}-${explosionKey}`}>
              <div className="kinetic-word lyrics-word" aria-live="polite" aria-label={displayText}>
                {glyphs.map((glyph, index) => {
                  const vector = getGlyphVector(index, glyphs.length);
                  return (
                    <span
                      className={glyph === ' ' ? 'glyph space' : 'glyph'}
                      key={`${glyph}-${index}-${displayText}`}
                      style={{
                        '--i': index,
                        '--blast-x': vector.x,
                        '--blast-y': vector.y,
                        '--blast-r': vector.r,
                        '--orbit-r': vector.orbitR,
                        '--alt': index % 2 === 0 ? -1 : 1,
                        '--glitch-x': (index % 3) - 1,
                        '--wave': Math.sin(index * 0.82).toFixed(3),
                        '--wave-r': `${((index % 5) - 2) * 2.5}deg`,
                      }}
                    >
                      {glyph === ' ' ? '\u00a0' : glyph}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="lyrics-controls">
              <button className="chip-button" type="button" onClick={runIdentify}>
                Identify song
              </button>
              <label className="chip-toggle">
                <input
                  type="checkbox"
                  checked={autoIdentify}
                  onChange={(event) => setAutoIdentify(event.target.checked)}
                />
                Auto
              </label>
              <button
                className="chip-button"
                type="button"
                onClick={() => setSongClock(getSongTime())}
              >
                Sync time
              </button>
            </div>

            <form
              className="lyrics-search"
              onSubmit={(event) => {
                event.preventDefault();
                runManualSearch();
              }}
            >
              <input
                type="search"
                placeholder="Search artist or song…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            {identifyStatus ? <p className="identify-status">{identifyStatus}</p> : null}

            <div className="instruction-card">
              {lyricsSynced
                ? 'Synced lyrics follow song time. Tap Sync time if lines drift.'
                : 'Tap to skip lines. Beats flip font, color, weight & size.'}
            </div>

            <div className="hud bottom" aria-hidden="true">
              <span className="meter meter-bass">
                <span />
              </span>
              <span className="meter meter-mid">
                <span />
              </span>
              <Link className="bottom-link" to="/">
                Classic mode
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
