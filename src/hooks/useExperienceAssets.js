import { useEffect, useState } from 'react';
import { loadExperienceAssets } from '../lib/experienceAssets.js';

export function useExperienceAssets(enabled) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      return;
    }

    let cancelled = false;

    loadExperienceAssets().then((loaded) => {
      if (!cancelled) {
        setItems(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return items;
}
