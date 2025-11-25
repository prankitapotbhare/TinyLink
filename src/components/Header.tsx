import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <nav className="border-b divider bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50 relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.03)] to-transparent dark:via-[rgba(79,70,229,0.05)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2 group">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110"
            >
              <path 
                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base sm:text-lg font-semibold tracking-tight bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] bg-clip-text">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="/api/healthz" 
              target="_blank"
              className="hidden sm:flex items-center text-xs font-medium px-3 py-1.5 rounded-md border divider text-muted hover:text-[var(--foreground)] hover:border-[var(--gradient-from)] transition-all hover:shadow-sm"
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
