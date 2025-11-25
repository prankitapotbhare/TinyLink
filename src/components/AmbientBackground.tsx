export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(79,70,229,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(217,70,239,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_80%,rgba(192,38,211,0.06),transparent_50%)]"></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
    </div>
  );
}
