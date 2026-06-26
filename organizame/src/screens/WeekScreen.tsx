import { useState } from 'react';
import { useApp } from '../store/appStore';
import { WeekPlanner } from '../components/WeekPlanner';
import { MonthPlanner } from '../components/MonthPlanner';

export function WeekScreen() {
  const {
    calendarEvents,
    scheduledBlocks,
    modes,
    rebalanceMyWeek,
    scheduleResult,
    setActiveTab,
    monthPlan,
  } = useApp();

  const [view, setView] = useState<'week' | 'month'>('week');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setView('week')}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-bold ${
            view === 'week' ? 'bg-navy text-white' : 'bg-white text-navy/60'
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => setView('month')}
          className={`flex-1 rounded-2xl py-2.5 text-sm font-bold ${
            view === 'month' ? 'bg-navy text-white' : 'bg-white text-navy/60'
          }`}
        >
          Month
        </button>
      </div>

      {view === 'week' ? (
        <WeekPlanner
          events={calendarEvents}
          scheduledBlocks={scheduledBlocks}
          modes={modes}
          onRebalance={rebalanceMyWeek}
          overloadedDays={scheduleResult?.overloadedDays ?? []}
          onDayClick={() => setActiveTab('today')}
        />
      ) : (
        <MonthPlanner
          plan={monthPlan}
          onWeekClick={() => {
            setView('week');
            setActiveTab('organizame');
          }}
        />
      )}
    </div>
  );
}
