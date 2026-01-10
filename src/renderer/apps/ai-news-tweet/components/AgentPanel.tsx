import type { AgentMeta, AgentRuntime } from '../types';
import { formatSnippet, STATUS_STYLES } from '../utils';

type AgentPanelProps = {
  meta: AgentMeta;
  state: AgentRuntime;
  isActive: boolean;
  agentColor: string;
};

export function AgentPanel({ meta, state, isActive, agentColor }: AgentPanelProps) {
  const status = STATUS_STYLES[state.status];

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-sm ${meta.accent.border}`}
      style={{
        boxShadow: isActive ? `0 0 30px ${agentColor}40, 0 0 60px ${agentColor}20` : undefined
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-1"
        style={{ background: `linear-gradient(90deg, ${agentColor}, ${agentColor}00)` }}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="mb-1 text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              {meta.subtitle}
            </p>
            <div className="flex items-center gap-2">
              <span className="synth-text-glow text-xl" style={{ color: agentColor }}>
                {meta.icon}
              </span>
              <span className="text-lg font-bold tracking-wider" style={{ color: agentColor }}>
                {meta.label}
              </span>
            </div>
            <p
              className="mt-1 text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              {meta.mission}
            </p>
          </div>
          <span className={`rounded-sm px-2 py-1 ${status.badge}`}>{status.text}</span>
        </div>

        {/* Incoming Brief */}
        <div
          className="rounded-sm p-3"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <p
            className="mb-2 text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
          >
            ◇ INPUT STREAM
          </p>
          {state.incomingContext ?
            <pre
              className="max-h-20 overflow-y-auto text-xs whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
            >
              {formatSnippet(state.incomingContext)}
            </pre>
          : <p
              className="text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
            >
              Awaiting data feed...
            </p>
          }
        </div>

        {/* Live Feed / Output */}
        <div
          className="flex-1 rounded-sm p-3"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: `1px solid ${state.status === 'running' ? agentColor + '50' : 'rgba(255, 255, 255, 0.1)'}`
          }}
        >
          <p
            className="mb-2 text-[10px] tracking-[0.15em] uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              color: state.status === 'complete' ? agentColor : 'var(--text-dim)'
            }}
          >
            {state.status === 'complete' ? '◉ OUTPUT READY' : '◈ LIVE FEED'}
          </p>
          {state.error ?
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#ff4466' }}>
              ERROR: {state.error}
            </p>
          : state.status === 'running' ?
            <div className="max-h-28 overflow-y-auto rounded-sm p-2" style={{ background: 'rgba(0, 0, 0, 0.3)' }}>
               <p className="text-xs animate-pulse mb-2" style={{ fontFamily: 'var(--font-mono)', color: agentColor }}>
                 PROCESSING DATA STREAM...
               </p>
               {state.lastLog && (
                 <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                   &gt; {state.lastLog}
                 </p>
               )}
            </div>
          : state.status === 'complete' && state.result ?
            <pre
              className="max-h-60 overflow-y-auto text-xs whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}
            >
              {formatSnippet(state.result, 1000)}
            </pre>
          : <div className="h-8" />
          }
        </div>
      </div>
    </div>
  );
}
