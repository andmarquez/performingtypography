import { motion } from 'framer-motion';
import type { TabId } from '../types';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'organizame', label: 'Organízame', icon: '🧠' },
  { id: 'week', label: 'Week', icon: '📅' },
  { id: 'inbox', label: 'Inbox', icon: '📥' },
  { id: 'modes', label: 'Modes', icon: '🎨' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-cream-dark bg-white/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-2 pb-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 px-1 py-1"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 inset-y-0 rounded-2xl bg-navy/8"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative text-lg">{tab.icon}</span>
              <span
                className={`relative text-[10px] font-semibold leading-tight ${
                  active ? 'text-navy' : 'text-navy/50'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
