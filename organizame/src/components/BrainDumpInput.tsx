interface BrainDumpInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EXAMPLE = `Edit Flashforge video
Record 2 reels
Go to the gym 4 times
Cook 3 days
Work on my art toy collection for 6 hours
Prepare Adobe presentation
Keep one night free`;

export function BrainDumpInput({ value, onChange, placeholder }: BrainDumpInputProps) {
  return (
    <div className="space-y-2">
      <label className="font-display text-xl font-bold text-navy">
        Brain dump everything 🧠
      </label>
      <p className="text-sm text-navy/60">
        One task per line. I'll figure out durations, categories, and whether you're delusional.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? EXAMPLE}
        rows={8}
        className="w-full resize-none rounded-2xl border-2 border-cream-dark bg-white p-4 text-sm text-navy placeholder:text-navy/30 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
      />
      {!value && (
        <button
          type="button"
          onClick={() => onChange(EXAMPLE)}
          className="text-xs font-semibold text-coral hover:underline"
        >
          Try example list →
        </button>
      )}
    </div>
  );
}
