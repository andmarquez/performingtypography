import { motion } from 'framer-motion';
import { useApp } from '../store/appStore';

interface QuickActionMenuProps {
  onClose: () => void;
}

const ACTIONS = [
  { id: 'add-task', label: 'Add task', icon: '✏️', tab: 'inbox' as const },
  { id: 'organizame', label: 'Organízame', icon: '🧠', tab: 'organizame' as const },
  { id: 'voice', label: 'Add by voice', icon: '🎤', special: 'voice' as const },
  { id: 'reorganize', label: 'Reorganize my day', icon: '🔄', special: 'reorganize' as const },
  { id: 'realistic', label: 'What can I realistically do now?', icon: '⏱️', special: 'realistic' as const },
  { id: 'gif', label: 'Upload reaction GIF', icon: '🎬', special: 'gif' as const },
];

export function QuickActionMenu({ onClose }: QuickActionMenuProps) {
  const {
    setActiveTab,
    setShowSettings,
    setAndsiosaState,
    setAssistantMessage,
    whatCanIDoNow,
    generatePlan,
    tasks,
    fixMyChaos,
  } = useApp();

  const handleAction = (action: (typeof ACTIONS)[number]) => {
    onClose();
    if (action.tab) {
      setActiveTab(action.tab);
      return;
    }
    switch (action.special) {
      case 'voice':
        setAndsiosaState('listening');
        setAssistantMessage('Voice input coming soon. For now, dump it in Organízame.');
        setActiveTab('organizame');
        setTimeout(() => setAndsiosaState('idle'), 3000);
        break;
      case 'reorganize':
        fixMyChaos();
        generatePlan(tasks.filter((t) => !t.completed), 'today');
        break;
      case 'realistic': {
        const result = whatCanIDoNow();
        setAssistantMessage(result.message);
        setAndsiosaState(result.task ? 'focused' : 'tired');
        setTimeout(() => setAndsiosaState('idle'), 4000);
        break;
      }
      case 'gif':
        setShowSettings(true);
        break;
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-40 right-4 left-4 z-50 mx-auto max-w-sm rounded-3xl bg-white p-4 shadow-2xl safe-bottom"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <p className="font-display mb-3 text-lg font-bold text-navy">Andsiosa says hi 👋</p>
        <div className="flex flex-col gap-2">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => handleAction(action)}
              className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-left font-medium text-navy transition hover:bg-cream-dark"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-xl">{action.icon}</span>
              <span>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
