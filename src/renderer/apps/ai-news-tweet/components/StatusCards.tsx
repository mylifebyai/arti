import type { AgentId, AgentRuntime } from '../types';
import { AGENT_META, getAgentColor, STATUS_STYLES } from '../utils';

type StatusCardsProps = {
  agentStates: Record<AgentId, AgentRuntime>;
};

export function StatusCards({ agentStates }: StatusCardsProps) {
  return (
    <div className="relative z-10 grid gap-4 md:grid-cols-3">
      {AGENT_META.map((meta, idx) => {
        const state = agentStates[meta.id];
        const status = STATUS_STYLES[state.status];
        const agentColor = getAgentColor(meta.id);

        return (
          <div key={meta.id} className={`relative rounded-sm p-4 ${meta.accent.border}`}>
            {/* Top accent line */}
            <div
              className="absolute top-0 right-0 left-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${agentColor}, transparent)` }}
            />

            <div className="mb-3 flex items-center justify-between">
              <span
                className="text-[10px] tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
              >
                STAGE {String(idx + 1).padStart(2, '0')}
              </span>
              <span className={`rounded-sm px-2 py-1 ${status.badge}`}>{status.text}</span>
            </div>

            <div className="mb-2 flex items-center gap-3">
              <span className="synth-text-glow text-2xl" style={{ color: agentColor }}>
                {meta.icon}
              </span>
              <div>
                <h3 className="text-lg font-bold tracking-wider" style={{ color: agentColor }}>
                  {meta.label}
                </h3>
                <p
                  className="text-[10px] tracking-[0.15em] uppercase"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
                >
                  {meta.subtitle}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div
              className="mt-3 mb-2 h-1 rounded-full"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                style={{ width: status.progress }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
