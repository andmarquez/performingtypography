import LuxMark from './splash/LuxMark.jsx';
import ProfileMark from './splash/ProfileMark.jsx';

const SLIDES = [
  { id: 'home-1', theme: 'home-1', label: 'Home-1' },
  { id: 'home-2', theme: 'home-2', label: 'Home-2' },
  { id: 'home-3', theme: 'home-3', label: 'Home-3' },
];

function SplashFrame({ theme }) {
  return (
    <div className={`splash-frame splash-frame--${theme}`}>
      <header className="splash-header">
        <span className="splash-pill">ANDSIOSA</span>
        <p className="splash-tagline">Concert Kinetic Typography</p>
      </header>

      <div className="splash-hero">
        <LuxMark className="splash-lux" />
        <div className="splash-meta">
          <span>MIAMI</span>
          <span>2026</span>
        </div>
        <ProfileMark className="splash-profile" />
      </div>
    </div>
  );
}

export default function SplashScreen({
  status,
  error,
  onStart,
}) {
  const showStatus = status && !status.startsWith('Ready');

  return (
    <div className="splash-screen" aria-label="Welcome">
      <div className="splash-slides" aria-hidden="true">
        {SLIDES.map((slide) => (
          <div key={slide.id} className={`splash-slide splash-slide--${slide.theme}`}>
            <SplashFrame theme={slide.theme} />
          </div>
        ))}
      </div>

      <div className="splash-ui">
        <button className="start-button start-button--glass" type="button" onClick={onStart}>
          <span className="start-button-shine start-button-shine--left" aria-hidden="true" />
          <span className="start-button-label">Start Experience</span>
          <span className="start-button-shine start-button-shine--right" aria-hidden="true" />
        </button>

        <p className="splash-permissions">Camera, Mic, Motion.</p>

        {showStatus ? <p className="status splash-status">{status}</p> : null}
        {error ? <p className="error splash-error">{error}</p> : null}
      </div>
    </div>
  );
}
