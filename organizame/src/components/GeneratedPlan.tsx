import { motion } from 'framer-motion';
import type { ScheduleResult } from '../types';
import { formatDuration } from '../store/appStore';
import { ScheduleBlock } from './ScheduleBlock';
import type { Mode } from '../types';
import { AndsiosaCharacter } from './AndsiosaCharacter';

interface GeneratedPlanProps {
  result: ScheduleResult;
  modes: Mode[];
  onAccept?: () => void;
}

const TONE_STYLES = {
  success: 'bg-lime/20 border-lime',
  warning: 'bg-orange-100 border-orange-400 animate-shake',
  error: 'bg-red-100 border-red-400 animate-shake',
  info: 'bg-lavender/40 border-lavender',
};

export function GeneratedPlan({ result, modes, onAccept }: GeneratedPlanProps) {
  const tone = TONE_STYLES[result.assistantTone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className={`rounded-2xl border-l-4 p-4 ${tone}`}>
        <div className="flex items-start gap-3">
          <AndsiosaCharacter
            state={result.fits ? 'celebrating' : result.assistantTone === 'error' ? 'judging' : 'warning'}
            size="sm"
          />
          <div>
            <p className="font-display font-bold text-navy text-lg leading-snug">{result.message}</p>
            <p className="text-sm text-navy/60 mt-2">
              {result.fits ? 'Schedule approved by math (barely).' : 'Math has spoken. Listen to it.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Available" value={formatDuration(result.totalAvailableMinutes)} color="bg-lime/30" />
        <StatCard label="Requested" value={formatDuration(result.totalRequestedMinutes)} color="bg-coral/20" />
        <StatCard
          label="Missing"
          value={result.missingMinutes > 0 ? formatDuration(result.missingMinutes) : '0m'}
          color={result.missingMinutes > 0 ? 'bg-red-100' : 'bg-lime/30'}
        />
      </div>

      {result.scheduledBlocks.length > 0 && (
        <div>
          <h4 className="font-display font-bold text-navy mb-2">
            Proposed schedule ({result.scheduledBlocks.length} blocks)
          </h4>
          <div className="space-y-2">
            {result.scheduledBlocks.map((block, i) => (
              <ScheduleBlock key={block.id} block={block} modes={modes} index={i} />
            ))}
          </div>
        </div>
      )}

      {result.unscheduledTasks.length > 0 && (
        <div className="rounded-2xl bg-red-50 p-4">
          <h4 className="font-bold text-red-700 text-sm mb-2">
            Couldn't fit ({result.unscheduledTasks.length})
          </h4>
          <ul className="space-y-1">
            {result.unscheduledTasks.map((t) => (
              <li key={t.id} className="text-sm text-red-600">
                • {t.name} ({formatDuration(t.durationMinutes)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestions.length > 0 && !result.fits && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h4 className="font-display font-bold text-navy mb-2">How to fix this</h4>
          <ul className="space-y-2">
            {result.suggestions.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-navy/80">
                <span className="text-coral">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.fits && onAccept && (
        <button
          type="button"
          onClick={onAccept}
          className="w-full rounded-2xl bg-navy py-4 font-bold text-white hover:bg-navy-light transition"
        >
          Accept this plan ✓
        </button>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-xl ${color} p-3 text-center`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-navy/50">{label}</p>
      <p className="font-display text-lg font-bold text-navy mt-0.5">{value}</p>
    </div>
  );
}
