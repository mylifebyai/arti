import type { MouseEventHandler } from 'react';

type HeaderProps = {
  isRunning: boolean;
  showSettings: boolean;
  onGenerate: MouseEventHandler<HTMLButtonElement>;
  onToggleSettings: MouseEventHandler<HTMLButtonElement>;
};

export function Header({ isRunning, showSettings, onGenerate, onToggleSettings }: HeaderProps) {
  return (
    <header
      className="relative z-10 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between"
      style={{ borderColor: 'rgba(255, 45, 149, 0.2)' }}
    >
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="synth-text-glow text-2xl" style={{ color: 'var(--neon-pink)' }}>◆</span>
          <span className="synth-badge text-[10px] tracking-[0.4em] uppercase" style={{ color: 'var(--text-dim)' }}>
            Multi-Agent Neural Network
          </span>
        </div>
        <h1 className="synth-text-glow text-3xl font-bold tracking-wider" style={{ color: 'var(--neon-pink)' }}>
          AI NEWS PIPELINE
        </h1>
        <p className="mt-2 text-xs tracking-wide" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
          RESEARCH → ANALYZE → SYNTHESIZE → TRANSMIT
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSettings}
          className={`synth-button rounded-sm border border-white/20 px-4 py-3 text-sm font-bold text-white/70 hover:border-[var(--neon-cyan)]/50 hover:text-[var(--neon-cyan)] ${showSettings ? 'border-[var(--neon-cyan)] text-[var(--neon-cyan)]' : ''}`}
          title="Model Selection"
        >
          ◈ MODELS
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isRunning}
          className="synth-button synth-glow-pink rounded-sm px-6 py-3 text-sm font-bold text-white"
        >
          {isRunning ? '◈ PROCESSING...' : '▶ INITIATE SEQUENCE'}
        </button>
      </div>
    </header>
  );
}
