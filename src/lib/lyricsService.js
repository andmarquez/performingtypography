const IDENTIFY_SAMPLE_MS = 6500;

export function parseLrc(syncedLyrics) {
  if (!syncedLyrics) {
    return [];
  }

  const lines = [];
  const pattern = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/g;
  let match = pattern.exec(syncedLyrics);

  while (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const fraction = match[3] ? Number(`0.${match[3].padEnd(3, '0')}`) : 0;
    const text = match[4]?.trim();

    if (text) {
      lines.push({
        time: minutes * 60 + seconds + fraction,
        text,
      });
    }

    match = pattern.exec(syncedLyrics);
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function plainLyricsToLines(plainLyrics) {
  if (!plainLyrics) {
    return [];
  }

  return plainLyrics
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ time: index * 4, text }));
}

export function getLyricAtTime(lines, songTimeSeconds) {
  if (!lines.length) {
    return { index: 0, text: '' };
  }

  let index = 0;

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= songTimeSeconds) {
      index = i;
    } else {
      break;
    }
  }

  return { index, text: lines[index]?.text ?? '' };
}

export async function searchLyrics(query) {
  const response = await fetch(`/api/lrclib/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Lyrics search failed.');
  }

  const results = await response.json();
  return Array.isArray(results) ? results : [];
}

export async function fetchLyricsForTrack({ trackName, artistName, albumName, duration }) {
  const params = new URLSearchParams({
    track_name: trackName,
    artist_name: artistName,
  });

  if (albumName) {
    params.set('album_name', albumName);
  }

  if (duration) {
    params.set('duration', String(Math.round(duration)));
  }

  const response = await fetch(`/api/lrclib/get?${params.toString()}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Could not load lyrics for this track.');
  }

  return response.json();
}

export async function identifySongFromStream(stream, apiToken) {
  if (!apiToken) {
    return null;
  }

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  const mediaRecorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  const startedAt = performance.now();

  return new Promise((resolve, reject) => {
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onerror = () => {
      reject(new Error('Could not record audio sample.'));
    };

    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: mimeType });
        const formData = new FormData();
        formData.append('file', blob, 'sample.webm');
        formData.append('api_token', apiToken);
        formData.append('return', 'timecode,apple_music,spotify');

        const response = await fetch('/api/audd/', {
          method: 'POST',
          body: formData,
        });

        const payload = await response.json();
        const result = payload?.result;

        if (!result) {
          resolve(null);
          return;
        }

        const sampleDuration = (performance.now() - startedAt) / 1000;
        const timecode = Number(result.timecode) || 0;

        resolve({
          artist: result.artist,
          title: result.title,
          album: result.album,
          timecode,
          songTimeNow: timecode + sampleDuration * 0.85,
        });
      } catch (error) {
        reject(error);
      }
    };

    mediaRecorder.start();
    window.setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, IDENTIFY_SAMPLE_MS);
  });
}

export async function loadLyricsForSong(song) {
  const record =
    (await fetchLyricsForTrack({
      trackName: song.title,
      artistName: song.artist,
      albumName: song.album,
    })) ??
    (await searchLyrics(`${song.artist} ${song.title}`).then((results) => results[0] ?? null));

  if (!record) {
    return { lines: [], synced: false, record: null };
  }

  const syncedLines = parseLrc(record.syncedLyrics);
  const lines = syncedLines.length
    ? syncedLines
    : plainLyricsToLines(record.plainLyrics);

  return {
    lines,
    synced: syncedLines.length > 0,
    record,
  };
}
