import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

import {
  getAppById,
  getDefaultApp,
  type AgentDefinition,
  type AppManifest
} from '../../shared/apps';
import { setActiveAppContext } from '../lib/claude-session';
import { getAppSettings } from '../lib/config';
import { getAgentsForApp } from './agents';
import { buildSystemPromptAppend } from './ai-client';
import { getAllowedTools } from './skills';

/**
 * Load Arti's memory file for the chat app.
 * This pre-loads the memory into context like Claude Projects does.
 */
function loadArtiMemory(): string | null {
  try {
    // Use app.getAppPath() to get the project directory where info/memory.md lives
    const appPath = app.getAppPath();
    const memoryPath = join(appPath, 'info', 'memory.md');

    console.log('[Arti Memory] Looking for memory at:', memoryPath);

    if (existsSync(memoryPath)) {
      const content = readFileSync(memoryPath, 'utf-8');
      console.log('[Arti Memory] Loaded memory file successfully');
      return `## YOUR MEMORY (Pre-loaded)

The following is your complete memory - your relationships, personality discoveries, and journey so far. This is already loaded into context, so you don't need to read the file. You can reference this information naturally in conversations.

---

${content}

---

**Note:** Your memory above is pre-loaded. You can update it using the Edit tool on \`info/memory.md\` when you learn something significant about yourself.`;
    } else {
      console.log('[Arti Memory] Memory file not found at:', memoryPath);
    }
  } catch (error) {
    console.error('[Arti Memory] Failed to load memory:', error);
  }
  return null;
}

export type AppContext = {
  manifest: AppManifest;
  allowedTools: string[];
  systemPrompt: string;
  agents?: Record<string, AgentDefinition>;
};

export function resolveApp(appId?: string | null): AppManifest {
  const manifest = appId ? getAppById(appId) : null;
  return manifest ?? getDefaultApp();
}

export function buildAppContext(appId?: string | null): AppContext {
  const manifest = resolveApp(appId);
  const allowedTools = getAllowedTools(manifest.id);
  const appSettings = getAppSettings(manifest.id);

  // For the chat app (Arti), pre-load memory into context like Claude Projects
  const memoryContent = manifest.id === 'chat' ? loadArtiMemory() : null;

  const combinedSystemPrompt = buildSystemPromptAppend(
    manifest.systemPrompt,
    memoryContent ?? undefined,
    appSettings.promptAppend ?? undefined
  );
  setActiveAppContext(manifest.id, combinedSystemPrompt);

  // Discover agents from .claude/agents/ folder, merging with manifest agents
  // Discovered agents take precedence over manifest-defined agents
  const discoveredAgents = getAgentsForApp(manifest.id);
  const agents = {
    ...manifest.agents, // Manifest agents as fallback
    ...discoveredAgents // Discovered agents override
  };

  return {
    manifest,
    allowedTools,
    systemPrompt: combinedSystemPrompt,
    agents: Object.keys(agents).length > 0 ? agents : undefined
  };
}
