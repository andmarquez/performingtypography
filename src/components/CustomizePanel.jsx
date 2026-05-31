import { useEffect, useState } from 'react';
import {
  DEFAULT_WORDS,
  FONT_OPTIONS,
  parseWordsText,
  wordsToText,
} from '../config/defaults.js';

const TABS = [
  { id: 'words', label: 'Text' },
  { id: 'type', label: 'Fonts' },
  { id: 'fx', label: 'Graphics' },
];

export default function CustomizePanel({ open, settings, onClose, onChange, onReset }) {
  const [tab, setTab] = useState('words');
  const [wordsDraft, setWordsDraft] = useState(wordsToText(settings.words));

  useEffect(() => {
    if (open) {
      setWordsDraft(wordsToText(settings.words));
    }
  }, [open, settings.words]);

  if (!open) {
    return null;
  }

  const { typography, graphics } = settings;
  const fixed = typography.fixedStyle;
  const selectedFontId =
    FONT_OPTIONS.find((option) => option.family === fixed.family)?.id ?? FONT_OPTIONS[0].id;

  const commitWords = () => {
    const parsed = parseWordsText(wordsDraft);
    onChange({ words: parsed.length ? parsed : DEFAULT_WORDS });
  };

  return (
    <div className="customize-backdrop" role="presentation" onClick={onClose}>
      <div
        className="customize-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Customize experience"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="customize-header">
          <h2>Customize</h2>
          <button type="button" className="customize-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="customize-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'is-active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="customize-body">
          {tab === 'words' ? (
            <section className="customize-section">
              <label className="customize-label" htmlFor="words-input">
                Words &amp; phrases
              </label>
              <p className="customize-hint">One line per tap. Shown in uppercase on screen.</p>
              <textarea
                id="words-input"
                className="customize-textarea"
                value={wordsDraft}
                onChange={(event) => setWordsDraft(event.target.value)}
                onBlur={commitWords}
                rows={8}
                placeholder={'LUX\nMOTOMAMI\nYOUR TEXT'}
              />
              <button type="button" className="customize-action" onClick={commitWords}>
                Apply text
              </button>
            </section>
          ) : null}

          {tab === 'type' ? (
            <section className="customize-section">
              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={typography.autoCycle}
                  onChange={(event) =>
                    onChange({ typography: { autoCycle: event.target.checked } })
                  }
                />
                Cycle fonts &amp; colors on beat
              </label>

              {!typography.autoCycle ? (
                <>
                  <label className="customize-label" htmlFor="font-select">
                    Font
                  </label>
                  <select
                    id="font-select"
                    className="customize-select"
                    value={selectedFontId}
                    onChange={(event) => {
                      const option = FONT_OPTIONS.find((item) => item.id === event.target.value);
                      if (option) {
                        onChange({
                          typography: {
                            fixedStyle: { family: option.family, label: option.label },
                          },
                        });
                      }
                    }}
                  >
                    {FONT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="customize-row">
                    <label className="customize-label" htmlFor="text-color">
                      Text color
                    </label>
                    <input
                      id="text-color"
                      type="color"
                      value={fixed.color}
                      onChange={(event) =>
                        onChange({ typography: { fixedStyle: { color: event.target.value } } })
                      }
                    />
                  </div>

                  <div className="customize-row">
                    <label className="customize-label" htmlFor="glow-color">
                      Glow color
                    </label>
                    <input
                      id="glow-color"
                      type="color"
                      value={fixed.glow}
                      onChange={(event) =>
                        onChange({ typography: { fixedStyle: { glow: event.target.value } } })
                      }
                    />
                  </div>

                  <label className="customize-label" htmlFor="weight-range">
                    Weight {fixed.weight}
                  </label>
                  <input
                    id="weight-range"
                    type="range"
                    min="100"
                    max="900"
                    step="100"
                    value={fixed.weight}
                    onChange={(event) =>
                      onChange({
                        typography: { fixedStyle: { weight: Number(event.target.value) } },
                      })
                    }
                  />

                  <label className="customize-label" htmlFor="size-range">
                    Size {fixed.size.toFixed(2)}×
                  </label>
                  <input
                    id="size-range"
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.02"
                    value={fixed.size}
                    onChange={(event) =>
                      onChange({
                        typography: { fixedStyle: { size: Number(event.target.value) } },
                      })
                    }
                  />

                  <label className="customize-label" htmlFor="spacing-range">
                    Letter spacing {fixed.spacing}
                  </label>
                  <input
                    id="spacing-range"
                    type="range"
                    min="-0.12"
                    max="0.2"
                    step="0.01"
                    value={parseFloat(fixed.spacing)}
                    onChange={(event) =>
                      onChange({
                        typography: {
                          fixedStyle: { spacing: `${Number(event.target.value).toFixed(2)}em` },
                        },
                      })
                    }
                  />
                </>
              ) : (
                <p className="customize-hint">
                  Beat sync rotates through 15 preset looks. Turn off cycling to lock your own font
                  and colors.
                </p>
              )}
            </section>
          ) : null}

          {tab === 'fx' ? (
            <section className="customize-section">
              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={graphics.enabled}
                  onChange={(event) =>
                    onChange({ graphics: { enabled: event.target.checked } })
                  }
                />
                Enable interactive graphics
              </label>

              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={graphics.spectrum}
                  onChange={(event) =>
                    onChange({ graphics: { spectrum: event.target.checked } })
                  }
                />
                Radial spectrum bars
              </label>

              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={graphics.rings}
                  onChange={(event) =>
                    onChange({ graphics: { rings: event.target.checked } })
                  }
                />
                Beat rings
              </label>

              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={graphics.ripples}
                  onChange={(event) =>
                    onChange({ graphics: { ripples: event.target.checked } })
                  }
                />
                Touch ripples
              </label>

              <label className="customize-toggle">
                <input
                  type="checkbox"
                  checked={graphics.shapes}
                  onChange={(event) =>
                    onChange({ graphics: { shapes: event.target.checked } })
                  }
                />
                Floating shapes
              </label>

              <label className="customize-label" htmlFor="particles-range">
                Particle intensity {Math.round(graphics.particles * 100)}%
              </label>
              <input
                id="particles-range"
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={graphics.particles}
                onChange={(event) =>
                  onChange({ graphics: { particles: Number(event.target.value) } })
                }
              />

              <div className="customize-row">
                <label className="customize-label" htmlFor="fx-glow">
                  Graphics glow override
                </label>
                <input
                  id="fx-glow"
                  type="color"
                  value={graphics.glowColor || fixed.glow}
                  onChange={(event) =>
                    onChange({ graphics: { glowColor: event.target.value } })
                  }
                />
              </div>
              <button
                type="button"
                className="customize-link"
                onClick={() => onChange({ graphics: { glowColor: '' } })}
              >
                Use typography glow
              </button>
            </section>
          ) : null}
        </div>

        <footer className="customize-footer">
          <button type="button" className="customize-link" onClick={onReset}>
            Reset all defaults
          </button>
        </footer>
      </div>
    </div>
  );
}
