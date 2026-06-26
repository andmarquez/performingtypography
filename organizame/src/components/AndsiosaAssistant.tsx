import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/appStore';
import { AndsiosaCharacter } from './AndsiosaCharacter';
import { QuickActionMenu } from './QuickActionMenu';

export function AndsiosaAssistant() {
  const { andsiosaState, showQuickMenu, setShowQuickMenu } = useApp();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setShowQuickMenu(!showQuickMenu)}
        className="fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-coral/30 safe-bottom"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Open Andsiosa quick actions"
      >
        <AndsiosaCharacter state={andsiosaState} size="md" />
      </motion.button>

      <AnimatePresence>
        {showQuickMenu && <QuickActionMenu onClose={() => setShowQuickMenu(false)} />}
      </AnimatePresence>
    </>
  );
}
