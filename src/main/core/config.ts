import { buildClaudeSessionEnv, getSystemPromptAppend } from '../lib/config';

export function buildSessionEnv() {
  return buildClaudeSessionEnv();
}

export function getGlobalSystemAppend(): string {
  return getSystemPromptAppend();
}
