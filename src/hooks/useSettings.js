import { useCallback, useState } from 'react';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../config/defaults.js';

function normalizeSettings(raw) {
  return {
    words: Array.isArray(raw?.words) && raw.words.length ? raw.words : DEFAULT_SETTINGS.words,
    beatStyles:
      Array.isArray(raw?.beatStyles) && raw.beatStyles.length
        ? raw.beatStyles
        : DEFAULT_SETTINGS.beatStyles,
    typography: {
      ...DEFAULT_SETTINGS.typography,
      ...raw?.typography,
      fixedStyle: {
        ...DEFAULT_SETTINGS.typography.fixedStyle,
        ...raw?.typography?.fixedStyle,
      },
    },
    graphics: {
      ...DEFAULT_SETTINGS.graphics,
      ...raw?.graphics,
    },
  };
}

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return DEFAULT_SETTINGS;
    }
    return normalizeSettings(JSON.parse(saved));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => loadSettings());

  const updateSettings = useCallback((patch) => {
    setSettings((previous) => {
      const next = normalizeSettings({
        ...previous,
        ...patch,
        typography: { ...previous.typography, ...patch.typography },
        graphics: { ...previous.graphics, ...patch.graphics },
      });

      if (patch.typography?.fixedStyle) {
        next.typography.fixedStyle = {
          ...previous.typography.fixedStyle,
          ...patch.typography.fixedStyle,
        };
      }

      persistSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
