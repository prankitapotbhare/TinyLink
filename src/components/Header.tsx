import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <nav className="border-b divider bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2 group">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 11L12 9M8 9L12 11M17 6C17 7.65685 15.6569 9 14 9C13.5 9 13 8.85 12.6 8.6L7.4 11.4C7.45 11.6 7.5 11.8 7.5 12C7.5 12.2 7.45 12.4 7.4 12.6L12.6 15.4C13 15.15 13.5 15 14 15C15.6569 15 17 16.3431 17 18C17 19.6569 15.6569 21 14 21C12.3431 21 11 19.6569 11 18C11 17.8 11.05 17.6 11.1 17.4L5.9 14.6C5.5 14.85 5 15 4.5 15C2.84315 15 1.5 13.6569 1.5 12C1.5 10.3431 2.84315 9 4.5 9C5 9 5.5 9.15 5.9 9.4L11.1 6.6C11.05 6.4 11 6.2 11 6C11 4.34315 12.3431 3 14 3C15.6569 3 17 4.34315 17 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-base sm:text-lg font-semibold tracking-tight">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="/api/healthz" 
              target="_blank"
              className="hidden sm:flex items-center text-xs font-medium px-3 py-1.5 rounded-md border divider text-muted hover:text-[var(--foreground)] transition"
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
