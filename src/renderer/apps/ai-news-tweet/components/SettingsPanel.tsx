import type { AgentId, StageModel, StageModels } from '../types';
import { AGENT_META } from '../utils';

type SettingsPanelProps = {
  stageModels: StageModels;
  onUpdateStageModel: (stage: AgentId, model: StageModel) => void;
  onClose: () => void;
};

const MODEL_OPTIONS: { value: StageModel; label: string; desc: string }[] = [
  { value: 'haiku', label: 'Haiku', desc: 'Fast & reliable' },
  { value: 'sonnet', label: 'Sonnet', desc: 'Balanced' },
  { value: 'opus', label: 'Opus', desc: 'Most capable' }
];

export function SettingsPanel({ stageModels, onUpdateStageModel, onClose }: SettingsPanelProps) {
  return (
    <div
      className="synth-card relative z-10 rounded-sm p-4"
      style={{ border: '1px solid rgba(0, 240, 255, 0.3)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="synth-text-glow" style={{ color: 'var(--neon-cyan)' }}>
            ◈
          </span>
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}
          >
            Model Selection
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>
      <p
        className="mb-4 text-xs"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
      >
        Select the AI model for each pipeline stage. Haiku is fastest and most reliable for
        structured output.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {AGENT_META.map((meta) => {
          const agentColor =
            meta.id === 'research' ? 'var(--neon-cyan)'
            : meta.id === 'analysis' ? 'var(--neon-purple)'
            : 'var(--neon-pink)';
          return (
            <div key={meta.id} className="flex flex-col gap-2">
              <label
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: 'var(--font-mono)', color: agentColor }}
              >
                {meta.icon} {meta.label}
              </label>
              <select
                value={stageModels[meta.id]}
                onChange={(e) => onUpdateStageModel(meta.id, e.target.value as StageModel)}
                className="rounded-sm border bg-black/50 px-3 py-2 text-sm"
                style={{
                  fontFamily: 'var(--font-mono)',
                  borderColor: `${agentColor}50`,
                  color: 'var(--text)'
                }}
              >
                {MODEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} - {opt.desc}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
