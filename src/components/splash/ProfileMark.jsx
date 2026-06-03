export default function ProfileMark({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 360"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
    >
      <title>Profile</title>
      <circle cx="140" cy="118" r="52" />
      <path d="M88 200c12-48 44-72 52-88 8 16 28 32 52 32s44-16 52-32c8 16 40 40 52 88" />
      <path d="M72 210c28 52 68 88 68 140h80c0-52 40-88 68-140" />
      <path d="M108 248c16 24 32 36 32 56M172 248c-16 24-32 36-32 56" />
      <path d="M118 168c8-6 14-8 22-8s14 2 22 8" />
      <path d="M128 188c6 4 12 6 12 6s6-2 12-6" />
    </svg>
  );
}
