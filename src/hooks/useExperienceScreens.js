import { useEffect, useState } from 'react';
import { fetchExperienceManifest } from '../lib/experienceManifest.js';

export function useExperienceScreens(enabled = true) {
  const [screens, setScreens] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setScreens([]);
      return;
    }

    let cancelled = false;

    fetchExperienceManifest().then((manifest) => {
      if (!cancelled) {
        setScreens(manifest.screens ?? []);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return screens;
}
