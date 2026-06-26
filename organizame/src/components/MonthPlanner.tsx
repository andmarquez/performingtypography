import { motion } from 'framer-motion';
import type { MonthWeekPlan } from '../services/schedulingEngine';

interface MonthPlannerProps {
  plan: MonthWeekPlan[];
  onWeekClick?: (weekNumber: number) => void;
}

const WEEK_COLORS = ['#dbeafe', '#ecfccb', '#ffedd5', '#ede9fe'];

export function MonthPlanner({ plan, onWeekClick }: MonthPlannerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Monthly strategy</h2>
        <p className="text-sm text-navy/60 mt-1">
          Big picture, not hourly chaos. Tap a week to drill down.
        </p>
      </div>

      <div className="space-y-3">
        {plan.map((week, i) => (
          <motion.button
            key={week.weekNumber}
            type="button"
            onClick={() => onWeekClick?.(week.weekNumber)}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="w-full rounded-2xl p-5 text-left shadow-sm"
            style={{ backgroundColor: WEEK_COLORS[i % WEEK_COLORS.length] }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-navy/50">{week.label}</p>
            <p className="font-display text-xl font-bold text-navy mt-1">{week.theme}</p>
            <p className="text-sm text-navy/70 mt-2">{week.focus}</p>
            <div className="flex gap-3 mt-3 text-xs font-semibold text-navy/60">
              <span>{week.taskCount} tasks</span>
              <span>~{Math.round(week.totalMinutes / 60)}h planned</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
