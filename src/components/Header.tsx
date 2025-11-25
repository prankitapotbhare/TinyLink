import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <nav className="sticky top-2 sm:top-4 mx-2 sm:mx-4 md:mx-auto max-w-7xl z-50 glass-panel rounded-xl sm:rounded-2xl mt-2 sm:mt-4">
      <div className="px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-2xl flex-shrink-0">🔗</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight truncate">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <a 
              href="/api/healthz" 
              target="_blank"
              className="hidden sm:block text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
              Status
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
