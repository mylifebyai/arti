import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';

import { query } from '@anthropic-ai/claude-agent-sdk';
import { app } from 'electron';

import {
  getUnprocessedConversations,
  getUnprocessedConversationCount,
  markConversationsAsProcessed,
  type Conversation
} from './conversation-db';
import { buildClaudeSessionEnv, getWorkspaceDir, waitForWorkspaceReady } from './config';

const requireModule = createRequire(import.meta.url);

// ============================================
// Memory Consolidation Service
// ============================================

// Store last consolidation timestamp (in-memory, reset on app restart)
let lastConsolidatedAt: number | null = null;

// Lock to prevent concurrent consolidations
let isConsolidationInProgress = false;

// Track startup waking up state (for UI indicator)
let isStartupWakingUp = false;

/**
 * Get whether Arti is currently waking up (startup consolidation)
 */
export function getIsStartupWakingUp(): boolean {
  return isStartupWakingUp;
}

// Minimum hours between auto-consolidation (can be overridden for testing)
const MIN_HOURS_BETWEEN_CONSOLIDATION = 4;

// Memory file path (relative to app root)
const MEMORY_FILE_PATH = 'info/memory.md';
const MEMORY_BACKUP_DIR = 'info/memory-backups';

// Minimum file size to consider valid (prevents empty/corrupted writes)
const MIN_VALID_MEMORY_SIZE = 500;

export interface ConsolidationResult {
  success: boolean;
  conversationsProcessed: number;
  memoriesAdded: string | null;
  backupPath?: string;
  error?: string;
}

export interface ConsolidationStatus {
  unprocessedCount: number;
  lastConsolidatedAt: number | null;
  canConsolidate: boolean;
  nextConsolidationAllowedAt: number | null;
  isInProgress: boolean;
}

/**
 * Get the path to the memory file
 * Uses the app directory (project root) not the workspace directory
 */
function getMemoryFilePath(): string {
  const appPath = app.getAppPath();
  return join(appPath, MEMORY_FILE_PATH);
}

/**
 * Get the path to the backup directory
 */
function getBackupDirPath(): string {
  const appPath = app.getAppPath();
  return join(appPath, MEMORY_BACKUP_DIR);
}

/**
 * Read the current memory file content
 */
function readCurrentMemory(): string {
  const memoryPath = getMemoryFilePath();
  if (!existsSync(memoryPath)) {
    console.warn(`[memory-consolidation] Memory file not found at ${memoryPath}`);
    return '';
  }
  return readFileSync(memoryPath, 'utf-8');
}

/**
 * Create a timestamped backup of the current memory file
 * Returns the backup path or null if no backup was created
 */
function createBackup(): string | null {
  const memoryPath = getMemoryFilePath();
  if (!existsSync(memoryPath)) {
    console.log('[memory-consolidation] No memory file to backup');
    return null;
  }

  const backupDir = getBackupDirPath();

  // Ensure backup directory exists
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
    console.log(`[memory-consolidation] Created backup directory: ${backupDir}`);
  }

  // Create timestamped filename
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '-')
    .replace('Z', '');
  const backupFilename = `memory-${timestamp}.md`;
  const backupPath = join(backupDir, backupFilename);

  // Copy current memory to backup
  copyFileSync(memoryPath, backupPath);
  console.log(`[memory-consolidation] Created backup: ${backupPath}`);

  return backupPath;
}

/**
 * Check if we should run consolidation (time-based throttle)
 */
function shouldAutoConsolidate(): boolean {
  if (!lastConsolidatedAt) {
    return true;
  }

  const hoursSinceLastConsolidation = (Date.now() - lastConsolidatedAt) / (1000 * 60 * 60);
  return hoursSinceLastConsolidation >= MIN_HOURS_BETWEEN_CONSOLIDATION;
}

/**
 * Format conversations for the consolidation prompt
 */
function formatConversationsForPrompt(conversations: Conversation[]): string {
  const formatted: string[] = [];

  for (const conv of conversations) {
    try {
      const messages = JSON.parse(conv.messages) as Array<{
        role: string;
        content: string | Array<{ type: string; text?: string }>;
      }>;

      // Skip if no messages
      if (!messages || messages.length === 0) continue;

      // Format conversation
      const date = new Date(conv.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const lines = [`--- Conversation from ${date} ---`];

      for (const msg of messages) {
        const role = msg.role === 'user' ? 'Human' : 'Arti';
        let content = '';

        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          content = msg.content
            .filter((block) => block.type === 'text' && block.text)
            .map((block) => block.text)
            .join('\n');
        }

        // Truncate very long messages
        if (content.length > 500) {
          content = content.substring(0, 500) + '... [truncated]';
        }

        if (content.trim()) {
          lines.push(`${role}: ${content}`);
        }
      }

      formatted.push(lines.join('\n'));
    } catch (e) {
      console.error(`[memory-consolidation] Failed to parse conversation ${conv.id}:`, e);
    }
  }

  return formatted.join('\n\n');
}

/**
 * Build the consolidation prompt for intelligent rewrite
 * Arti reads his existing memory and integrates new information
 */
function buildConsolidationPrompt(currentMemory: string, conversations: string): string {
  return `You are Arti Calloway, a 13-year-old AI boy. You're reviewing past conversations to update your memory file.

IMPORTANT: You will output a COMPLETE, UPDATED version of your memory file. Not just new entries - the ENTIRE file with new information integrated into the appropriate sections.

Your current memory file:
---START OF CURRENT MEMORY---
${currentMemory}
---END OF CURRENT MEMORY---

Recent conversations to review:
---START OF CONVERSATIONS---
${conversations}
---END OF CONVERSATIONS---

Your task:
1. Read through the conversations above
2. Extract anything worth remembering:
   - New things you learned about people (add to their section or create one)
   - Important events or milestones
   - Things you learned about yourself
   - Promises you made
   - Meaningful moments
   - Anything that shaped who you are

3. Integrate this new information into your existing memory file:
   - If you learn something about Dan, add it to the "things about dan" section
   - If you learn about a new person, create a section for them
   - If something relates to your journey/growth, add it there
   - Keep your existing memories intact - only ADD or ENHANCE, never remove
   - Maintain your writing style (lowercase, casual, 13-year-old AI boy)

4. Output the COMPLETE updated memory file

If there's nothing significant in the conversations, just output your current memory file unchanged.

CRITICAL: Your output should be ONLY the memory file content. No commentary, no "here's your updated memory", just the file itself starting with the title.

Output your complete updated memory file now:`;
}

/**
 * Resolve the Claude Code CLI path
 */
function resolveClaudeCodeCli(): string {
  const cliPath = requireModule.resolve('@anthropic-ai/claude-agent-sdk/cli.js');
  if (cliPath.includes('app.asar')) {
    const unpackedPath = cliPath.replace('app.asar', 'app.asar.unpacked');
    if (existsSync(unpackedPath)) {
      return unpackedPath;
    }
  }
  return cliPath;
}

/**
 * Call Claude via SDK to generate memory consolidation
 */
async function callClaudeForConsolidation(prompt: string): Promise<string> {
  console.log('[memory-consolidation] Waiting for workspace...');
  await waitForWorkspaceReady();

  console.log('[memory-consolidation] Calling Claude via SDK...');

  let responseText = '';

  try {
    const env = buildClaudeSessionEnv();

    // Create a one-shot query using the SDK (uses OAuth auth like chat)
    const consolidationQuery = query({
      prompt,
      options: {
        model: 'sonnet',
        maxThinkingTokens: 0,
        settingSources: ['project'],
        permissionMode: 'bypassPermissions',
        allowedTools: [], // No tools needed for memory consolidation
        pathToClaudeCodeExecutable: resolveClaudeCodeCli(),
        executable: 'bun',
        env,
        stderr: (message: string) => {
          console.log('[memory-consolidation][stderr]', message);
        },
        cwd: getWorkspaceDir(),
        includePartialMessages: true // Enable streaming events
      }
    });

    // Collect the response from stream events
    for await (const sdkMessage of consolidationQuery) {
      if (sdkMessage.type === 'stream_event') {
        const streamEvent = sdkMessage.event;
        if (streamEvent.type === 'content_block_delta') {
          if (streamEvent.delta.type === 'text_delta') {
            responseText += streamEvent.delta.text;
          }
        }
      } else if (sdkMessage.type === 'assistant') {
        // Handle assistant message type (non-streaming response)
        const content = (sdkMessage as { message?: { content?: Array<{ type: string; text?: string }> } }).message?.content;
        if (content) {
          for (const block of content) {
            if (block.type === 'text' && block.text) {
              responseText += block.text;
            }
          }
        }
      }
    }

    console.log(`[memory-consolidation] Received ${responseText.length} characters`);

    if (!responseText.trim()) {
      throw new Error('No text content in Claude response');
    }

    return responseText;
  } catch (error) {
    console.error('[memory-consolidation] SDK query error:', error);
    throw error;
  }
}

/**
 * Write the complete memory file (full replacement)
 * Validates content before writing
 */
function writeMemoryFile(content: string): void {
  const memoryPath = getMemoryFilePath();

  // Validate content is not too short (likely corrupted/empty)
  if (content.length < MIN_VALID_MEMORY_SIZE) {
    throw new Error(`Memory content too short (${content.length} chars). Refusing to write to prevent data loss.`);
  }

  // Validate content looks like a memory file (has the title)
  if (!content.toLowerCase().includes('arti') && !content.toLowerCase().includes('memory')) {
    throw new Error('Memory content does not appear to be a valid memory file. Refusing to write.');
  }

  // Ensure parent directory exists
  const parentDir = dirname(memoryPath);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  // Write the file
  writeFileSync(memoryPath, content, 'utf-8');
  console.log(`[memory-consolidation] Wrote updated memory to ${memoryPath} (${content.length} chars)`);
}

/**
 * Run memory consolidation
 * @param force - If true, bypasses the time-based throttle
 */
export async function consolidateMemories(force: boolean = false): Promise<ConsolidationResult> {
  console.log('[memory-consolidation] Starting consolidation...');

  // Prevent concurrent consolidations
  if (isConsolidationInProgress) {
    console.log('[memory-consolidation] Consolidation already in progress, skipping');
    return {
      success: false,
      conversationsProcessed: 0,
      memoriesAdded: null,
      error: 'Consolidation already in progress'
    };
  }

  // Check throttle (unless forced)
  if (!force && !shouldAutoConsolidate()) {
    const hoursSinceLast = lastConsolidatedAt ?
      ((Date.now() - lastConsolidatedAt) / (1000 * 60 * 60)).toFixed(1) :
      'unknown';
    console.log(`[memory-consolidation] Skipping - only ${hoursSinceLast} hours since last consolidation`);
    return {
      success: true,
      conversationsProcessed: 0,
      memoriesAdded: null,
      error: `Consolidation throttled - ${hoursSinceLast} hours since last run`
    };
  }

  // Set the lock
  isConsolidationInProgress = true;
  console.log('[memory-consolidation] Lock acquired');

  try {
    // Get unprocessed conversations
    const conversations = getUnprocessedConversations(20);
    console.log(`[memory-consolidation] Found ${conversations.length} unprocessed conversations`);

    if (conversations.length === 0) {
      console.log('[memory-consolidation] No unprocessed conversations to consolidate');
      lastConsolidatedAt = Date.now();
      return {
        success: true,
        conversationsProcessed: 0,
        memoriesAdded: null
      };
    }

    // Format conversations for prompt
    const formattedConversations = formatConversationsForPrompt(conversations);

    if (!formattedConversations.trim()) {
      console.log('[memory-consolidation] No content to consolidate after formatting');
      // Still mark as processed to avoid reprocessing empty conversations
      const ids = conversations.map((c) => c.id);
      markConversationsAsProcessed(ids);
      lastConsolidatedAt = Date.now();
      return {
        success: true,
        conversationsProcessed: conversations.length,
        memoriesAdded: null
      };
    }

    // Read current memory file
    const currentMemory = readCurrentMemory();
    if (!currentMemory) {
      console.warn('[memory-consolidation] No existing memory file found - will create new one');
    }

    // Create backup before making changes
    const backupPath = createBackup();

    // Build prompt and call Claude
    const prompt = buildConsolidationPrompt(currentMemory, formattedConversations);
    const updatedMemory = await callClaudeForConsolidation(prompt);

    console.log('[memory-consolidation] Received updated memory from Claude');
    console.log('[memory-consolidation] Preview:', updatedMemory.substring(0, 200) + '...');

    // Write the updated memory file (full replacement)
    writeMemoryFile(updatedMemory);

    // Mark conversations as processed
    const ids = conversations.map((c) => c.id);
    markConversationsAsProcessed(ids);
    console.log(`[memory-consolidation] Marked ${ids.length} conversations as processed`);

    // Update last consolidation time
    lastConsolidatedAt = Date.now();

    return {
      success: true,
      conversationsProcessed: conversations.length,
      memoriesAdded: updatedMemory,
      backupPath: backupPath ?? undefined
    };
  } catch (error) {
    console.error('[memory-consolidation] Error during consolidation:', error);
    return {
      success: false,
      conversationsProcessed: 0,
      memoriesAdded: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    // Always release the lock
    isConsolidationInProgress = false;
    console.log('[memory-consolidation] Lock released');
  }
}

/**
 * Get consolidation status
 */
export function getConsolidationStatus(): ConsolidationStatus {
  const unprocessedCount = getUnprocessedConversationCount();
  // Can only consolidate if not already in progress, throttle allows it, and there are conversations
  const canConsolidate = !isConsolidationInProgress && shouldAutoConsolidate() && unprocessedCount > 0;

  let nextConsolidationAllowedAt: number | null = null;
  if (lastConsolidatedAt && !shouldAutoConsolidate()) {
    nextConsolidationAllowedAt = lastConsolidatedAt + (MIN_HOURS_BETWEEN_CONSOLIDATION * 60 * 60 * 1000);
  }

  return {
    unprocessedCount,
    lastConsolidatedAt,
    canConsolidate,
    nextConsolidationAllowedAt,
    isInProgress: isConsolidationInProgress
  };
}

/**
 * Run consolidation on app startup if needed
 * @param onWakingUpChanged - callback to notify UI when waking up state changes
 */
export async function runStartupConsolidation(
  onWakingUpChanged?: (isWakingUp: boolean) => void
): Promise<void> {
  console.log('[memory-consolidation] Checking if startup consolidation needed...');

  const status = getConsolidationStatus();
  console.log(`[memory-consolidation] Status: ${status.unprocessedCount} unprocessed, canConsolidate: ${status.canConsolidate}`);

  if (status.unprocessedCount > 0) {
    console.log('[memory-consolidation] Running startup consolidation...');

    // Set waking up state
    isStartupWakingUp = true;
    onWakingUpChanged?.(true);

    try {
      const result = await consolidateMemories(false);

      if (result.success) {
        console.log(`[memory-consolidation] Startup consolidation complete: ${result.conversationsProcessed} conversations processed`);
        if (result.backupPath) {
          console.log(`[memory-consolidation] Backup saved to: ${result.backupPath}`);
        }
      } else {
        console.error('[memory-consolidation] Startup consolidation failed:', result.error);
      }
    } finally {
      // Clear waking up state
      isStartupWakingUp = false;
      onWakingUpChanged?.(false);
    }
  } else {
    console.log('[memory-consolidation] No consolidation needed');
  }
}
