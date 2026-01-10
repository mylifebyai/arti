import { getProvider, getSystemPromptAppend } from '../lib/config';

export type ModelTier = 'haiku' | 'sonnet' | 'opus';

export function resolveModelForTier(tier: ModelTier): string {
  // Map tier to model id; keep in sync with provider config
  const map: Record<ModelTier, string> = {
    haiku: 'haiku',
    sonnet: 'sonnet',
    opus: 'opus'
  };
  return map[tier];
}

export function buildSystemPromptAppend(...appends: (string | null | undefined)[]): string {
  const baseAppend = getSystemPromptAppend();
  const pieces = [baseAppend, ...appends].filter(
    (text) => typeof text === 'string' && text.trim().length > 0
  );
  return pieces.join('\n\n');
}

export function getCurrentProvider() {
  return getProvider();
}
