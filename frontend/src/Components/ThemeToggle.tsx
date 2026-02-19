import { useAppDispatch, useAppSelector } from '../app/hooks';
// import { toggleMode } from '../features/theme/themeSlice';
import { toggleMode } from '../features/theme/themeSlice';
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const mode = useAppSelector(s => s.theme.mode);
  const dispatch = useAppDispatch();

  return (
    <button
      onClick={() => dispatch(toggleMode())}
      className="p-2 rounded-full bg-white dark:bg-gray-900 border dark:border-gray-700"
    >
      {mode === 'dark' ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-500" />}
    </button>
  );
}
