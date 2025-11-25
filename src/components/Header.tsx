import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <nav className="sticky top-4 mx-4 md:mx-auto max-w-7xl z-50 glass-panel rounded-2xl mt-4">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <span className="text-xl font-bold tracking-tight">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-4">
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
