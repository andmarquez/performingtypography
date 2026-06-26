import { useApp } from '../store/appStore';
import { ModeSettings } from '../components/ModeSettings';

export function ModesScreen() {
  const { modes, updateMode, addMode } = useApp();

  return <ModeSettings modes={modes} onUpdate={updateMode} onAdd={addMode} />;
}
