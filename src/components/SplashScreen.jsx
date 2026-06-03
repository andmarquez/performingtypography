const SLIDE_COUNT = 3;
const CYCLE_SECONDS = 9;

const SLIDES = Array.from({ length: SLIDE_COUNT }, (_, index) => ({
  id: `home-${index + 1}`,
  label: `Home-${index + 1}`,
  src: `${import.meta.env.BASE_URL}splash/home-${index + 1}.png`,
}));

export default function SplashScreen({
  status,
  error,
  onStart,
  onCustomize,
}) {
  return (
    <div className="splash-screen" aria-label="Welcome">
      <div className="splash-slides" aria-hidden="true">
        {SLIDES.map((slide) => (
          <div key={slide.id} className="splash-slide">
            <div className="splash-slide-fallback" data-frame={slide.label} />
            <img
              className="splash-slide-image"
              src={slide.src}
              alt=""
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="splash-vignette" aria-hidden="true" />

      <div className="splash-ui">
        <button className="start-button start-button--glass" type="button" onClick={onStart}>
          Start Experience
        </button>

        <button type="button" className="customize-inline customize-inline--glass" onClick={onCustomize}>
          Customize text, fonts &amp; graphics
        </button>

        <p className="status splash-status">{status}</p>
        {error ? <p className="error splash-error">{error}</p> : null}
      </div>
    </div>
  );
}
