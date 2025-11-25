export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-600/20 dark:mix-blend-normal"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-600/20 dark:mix-blend-normal"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600/10 dark:mix-blend-normal"></div>
    </div>
  );
}
