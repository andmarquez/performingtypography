import { isSameDay, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp, getGreeting, todayLabel } from '../store/appStore';
import { getModeById } from '../data/defaultModes';
import { getFreeTimeToday } from '../services/schedulingEngine';
import { Timeline, NextEventBanner } from '../components/Timeline';
import { ScheduleBlock } from '../components/ScheduleBlock';
import { pickMessage } from '../data/assistantMessages';

export function TodayScreen() {
  const {
    settings,
    modes,
    calendarEvents,
    calendarConnected,
    scheduledBlocks,
    fixMyChaos,
    setActiveTab,
    assistantMessage,
    connectCalendar,
  } = useApp();

  const today = new Date();
  const todayEvents = calendarEvents.filter((e) => isSameDay(parseISO(e.start), today));
  const todayBlocks = scheduledBlocks.filter((b) => isSameDay(parseISO(b.start), today));
  const freeMinutes = calendarConnected ? getFreeTimeToday(calendarEvents) : 480;
  const currentMode = getModeById(modes, settings.currentModeId);

  return (
    <div className="space-y-5">
      <header>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-navy/50"
        >
          {getGreeting()}, {settings.userName}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-3xl font-bold text-navy mt-1"
        >
          {todayLabel()}
        </motion.h1>
      </header>

      {assistantMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-coral/15 border border-coral/30 p-4"
        >
          <p className="text-sm font-medium text-navy italic">"{assistantMessage}"</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-4"
        style={{ backgroundColor: currentMode?.bgColor ?? '#dbeafe' }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-navy/50">Current mode</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xl">{currentMode?.icon ?? '💼'}</span>
          <p className="font-display text-xl font-bold text-navy">{currentMode?.name ?? 'Work Mode'}</p>
        </div>
      </motion.div>

      {!calendarConnected ? (
        <motion.button
          type="button"
          onClick={connectCalendar}
          className="w-full rounded-2xl bg-work/10 border border-work/30 p-4 text-left"
          whileTap={{ scale: 0.98 }}
        >
          <p className="text-sm font-semibold text-work">Connect calendar to see your real schedule →</p>
        </motion.button>
      ) : (
        <NextEventBanner events={todayEvents} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('organizame')}
          className="rounded-2xl bg-navy p-4 text-left text-white shadow-lg"
        >
          <span className="text-2xl">🧠</span>
          <p className="font-display font-bold mt-2">Organízame</p>
          <p className="text-xs text-white/70 mt-1">Dump & schedule</p>
        </button>
        <button
          type="button"
          onClick={fixMyChaos}
          className="rounded-2xl bg-coral p-4 text-left text-white shadow-lg"
        >
          <span className="text-2xl">🔥</span>
          <p className="font-display font-bold mt-2">Fix my chaos</p>
          <p className="text-xs text-white/70 mt-1">Emergency mode</p>
        </button>
      </div>

      <Timeline
        events={todayEvents}
        scheduledBlocks={todayBlocks}
        modes={modes}
        freeMinutes={freeMinutes}
      />

      {todayBlocks.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-navy mb-2">Scheduled tasks</h3>
          <div className="space-y-2">
            {todayBlocks.map((block, i) => (
              <ScheduleBlock key={block.id} block={block} modes={modes} index={i} />
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-navy/40 pb-2">
        {pickMessage('greeting', settings.userName)}
      </p>
    </div>
  );
}
