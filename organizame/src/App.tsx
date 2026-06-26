import { AnimatePresence } from 'framer-motion';
import { AppShell } from './components/AppShell';
import { useApp } from './store/appStore';
import { TodayScreen } from './screens/TodayScreen';
import { OrganizameScreen } from './screens/OrganizameScreen';
import { WeekScreen } from './screens/WeekScreen';
import { InboxScreen } from './screens/InboxScreen';
import { ModesScreen } from './screens/ModesScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function ScreenRouter() {
  const { activeTab } = useApp();

  return (
    <AnimatePresence mode="wait">
      <div key={activeTab}>
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'organizame' && <OrganizameScreen />}
        {activeTab === 'week' && <WeekScreen />}
        {activeTab === 'inbox' && <InboxScreen />}
        {activeTab === 'modes' && <ModesScreen />}
      </div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppShell>
      <ScreenRouter />
      <SettingsScreen />
      <SettingsButton />
    </AppShell>
  );
}

function SettingsButton() {
  const { setShowSettings } = useApp();
  return (
    <button
      type="button"
      onClick={() => setShowSettings(true)}
      className="fixed top-4 right-4 z-20 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-sm font-semibold text-navy/60 shadow-sm safe-top hover:bg-white"
      aria-label="Settings"
    >
      ⚙️
    </button>
  );
}
