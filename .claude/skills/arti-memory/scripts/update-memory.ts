#!/usr/bin/env bun
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { resolve, join } from 'path';

type UpdateMemoryResult = {
  success: boolean;
  message?: string;
  error?: string;
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--content' && argv[i + 1]) {
      args.content = argv[i + 1];
      i++;
    }
  }
  return {
    content: args.content || ''
  };
}

function updateMemory(newContent: string): UpdateMemoryResult {
  if (!newContent.trim()) {
    return {
      success: false,
      error: 'No content provided. Use --content "your memory here"'
    };
  }

  const memoryPath = resolve(join(process.cwd(), 'arti', 'memory.md'));

  if (!existsSync(memoryPath)) {
    return {
      success: false,
      error: 'Memory file not found at: ' + memoryPath
    };
  }

  try {
    // Append the new memory with a timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const entry = `\n\n---\n**Update ${timestamp}**\n\n${newContent}\n`;

    appendFileSync(memoryPath, entry, 'utf-8');

    return {
      success: true,
      message: 'Memory updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update memory file: ' + (error as Error).message
    };
  }
}

function main() {
  const { content } = parseArgs(process.argv.slice(2));
  const result = updateMemory(content);
  console.log(JSON.stringify(result, null, 2));
}

main();
