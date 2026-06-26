import { format, parseISO, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import type { CalendarEvent, ScheduledBlock } from '../types';
import type { Mode } from '../types';
import { getModeById } from '../data/defaultModes';
import { formatEventTime } from '../services/calendarService';

interface TimelineItem {
  id: string;
  type: 'event' | 'task' | 'free';
  title: string;
  start: string;
  end: string;
  mode?: string;
  durationMinutes?: number;
}

interface TimelineProps {
  events: CalendarEvent[];
  scheduledBlocks: ScheduledBlock[];
  modes: Mode[];
  freeMinutes: number;
}

export function Timeline({ events, scheduledBlocks, modes, freeMinutes }: TimelineProps) {
  const items: TimelineItem[] = [
    ...events.map((e) => ({
      id: e.id,
      type: 'event' as const,
      title: e.title,
      start: e.start,
      end: e.end,
      mode: e.mode,
    })),
    ...scheduledBlocks.map((b) => ({
      id: b.id,
      type: 'task' as const,
      title: b.taskName,
      start: b.start,
      end: b.end,
      mode: b.mode,
      durationMinutes: b.durationMinutes,
    })),
  ].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg font-bold text-navy">Today's timeline</h3>
        <span className="rounded-full bg-lime/30 px-3 py-1 text-xs font-bold text-navy">
          {Math.floor(freeMinutes / 60)}h {freeMinutes % 60}m free
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-navy/50 text-sm">
          Nothing on the calendar yet. Connect Google Calendar or add tasks.
        </p>
      ) : (
        <div className="relative space-y-2 pl-4 border-l-2 border-cream-dark">
          {items.map((item, i) => {
            const mode = getModeById(modes, item.mode ?? 'work');
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative rounded-xl bg-white p-3 shadow-sm"
              >
                <div
                  className="absolute -left-[21px] top-4 h-3 w-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: mode?.color ?? '#2563eb' }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-navy">{item.title}</p>
                    <p className="text-xs text-navy/50 mt-0.5">
                      {formatEventTime(item.start)} – {formatEventTime(item.end)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-navy/40">
                    {item.type === 'event' ? 'calendar' : 'task'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function NextEventBanner({ events }: { events: CalendarEvent[] }) {
  const now = new Date();
  const upcoming = events
    .filter((e) => parseISO(e.end) > now)
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())[0];

  if (!upcoming) {
    return (
      <div className="rounded-2xl bg-lavender/40 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-navy/50">Next up</p>
        <p className="font-display text-lg font-bold text-navy mt-1">Nothing scheduled — enjoy the gap ✨</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-work/10 p-4 border border-work/20">
      <p className="text-xs font-bold uppercase tracking-wide text-work">Next up</p>
      <p className="font-display text-lg font-bold text-navy mt-1">{upcoming.title}</p>
      <p className="text-sm text-navy/60 mt-1">
        {isToday(parseISO(upcoming.start)) ? 'Today' : format(parseISO(upcoming.start), 'EEE')}{' '}
        at {formatEventTime(upcoming.start)}
      </p>
    </div>
  );
}
