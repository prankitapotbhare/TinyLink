'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 sm:p-2.5 rounded-lg glass-subtle hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 active:bg-zinc-300/50 dark:active:bg-zinc-600/50 transition touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <span className="text-lg sm:text-xl">{theme === 'dark' ? '🌞' : '🌙'}</span>
    </button>
  );
}
