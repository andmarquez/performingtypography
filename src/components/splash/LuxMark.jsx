export default function LuxMark({ className = '' }) {
  return (
    <div className={`splash-lux-word ${className}`.trim()} aria-hidden="true">
      <span className="splash-lux-bar splash-lux-bar--top" />
      <span className="splash-lux-letters">LUX</span>
      <span className="splash-lux-bar splash-lux-bar--mid" />
    </div>
  );
}
