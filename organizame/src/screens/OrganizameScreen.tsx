import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/appStore';
import { BrainDumpInput } from '../components/BrainDumpInput';
import { TaskCard } from '../components/TaskCard';
import { GeneratedPlan } from '../components/GeneratedPlan';
import { parseBrainDump } from '../services/taskParser';
import type { Period, Task } from '../types';
import { AndsiosaCharacter } from '../components/AndsiosaCharacter';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'custom', label: 'Custom' },
];

export function OrganizameScreen() {
  const {
    brainDumpText,
    setBrainDumpText,
    modes,
    generatePlan,
    scheduleResult,
    andsiosaState,
    fixMyChaos,
    addTask,
  } = useApp();

  const [period, setPeriod] = useState<Period>('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [parsedTasks, setParsedTasks] = useState<Task[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleParse = () => {
    const result = parseBrainDump(brainDumpText);
    const newTasks: Task[] = result.tasks.map((t, i) => ({
      id: `parsed-${Date.now()}-${i}`,
      name: t.name,
      durationMinutes: t.durationMinutes,
      category: t.category,
      priority: t.priority,
      canSplit: t.canSplit,
      preferredTimeOfDay: t.preferredTimeOfDay,
      flexibility: t.flexibility,
      deadline: t.deadline,
      createdAt: new Date().toISOString(),
    }));
    setParsedTasks(newTasks);
    setHasParsed(true);
  };

  const handleMakeItPossible = () => {
    const taskList = hasParsed ? parsedTasks : [];
    if (taskList.length === 0) {
      handleParse();
      return;
    }
    generatePlan(
      taskList,
      period,
      customStart ? new Date(customStart) : undefined,
      customEnd ? new Date(customEnd) : undefined,
    );
  };

  const totalRequested = useMemo(
    () => parsedTasks.reduce((s, t) => s + t.durationMinutes, 0),
    [parsedTasks],
  );

  const saveToInbox = () => {
    parsedTasks.forEach((t) => {
      addTask({
        name: t.name,
        durationMinutes: t.durationMinutes,
        category: t.category,
        priority: t.priority,
        canSplit: t.canSplit,
        preferredTimeOfDay: t.preferredTimeOfDay,
        flexibility: t.flexibility,
        deadline: t.deadline,
      });
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-navy">Organízame</h1>
          <p className="text-sm text-navy/60 mt-1">
            Dump everything. I'll tell you the truth about your ambitions.
          </p>
        </div>
        <AndsiosaCharacter state={andsiosaState} size="md" />
      </header>

      <BrainDumpInput value={brainDumpText} onChange={setBrainDumpText} />

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-navy/50 mb-2">Organize by</p>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                period === p.id
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy/70 hover:bg-cream-dark'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="rounded-xl bg-white px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="rounded-xl bg-white px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={() => {
            if (!hasParsed) handleParse();
            handleMakeItPossible();
          }}
          className="flex-1 rounded-2xl bg-navy py-4 font-bold text-white shadow-lg"
          whileTap={{ scale: 0.97 }}
        >
          {andsiosaState === 'thinking' ? 'Thinking...' : 'Make it possible'}
        </motion.button>
        <button
          type="button"
          onClick={fixMyChaos}
          className="rounded-2xl bg-coral/20 px-4 py-4 font-bold text-coral text-sm"
        >
          Fix chaos
        </button>
      </div>

      {hasParsed && parsedTasks.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-navy">
              Parsed tasks ({parsedTasks.length})
            </h3>
            <span className="text-sm font-semibold text-navy/50">
              {Math.floor(totalRequested / 60)}h {totalRequested % 60}m total
            </span>
          </div>
          {parsedTasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              modes={modes}
              onUpdate={(id, updates) =>
                setParsedTasks((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                )
              }
              onDelete={(id) => setParsedTasks((prev) => prev.filter((t) => t.id !== id))}
              index={i}
            />
          ))}
          <button
            type="button"
            onClick={saveToInbox}
            className="w-full rounded-xl border-2 border-dashed border-navy/20 py-3 text-sm font-semibold text-navy/60"
          >
            Save all to Inbox
          </button>
        </motion.div>
      )}

      {scheduleResult && <GeneratedPlan result={scheduleResult} modes={modes} />}
    </div>
  );
}
