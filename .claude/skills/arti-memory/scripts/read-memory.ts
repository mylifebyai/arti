#!/usr/bin/env bun
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

type ReadMemoryResult = {
  success: boolean;
  content?: string;
  error?: string;
};

function readMemory(): ReadMemoryResult {
  // Memory file is at arti/memory.md in the project root
  const memoryPath = resolve(join(process.cwd(), 'arti', 'memory.md'));

  if (!existsSync(memoryPath)) {
    return {
      success: false,
      error: 'Memory file not found at: ' + memoryPath
    };
  }

  try {
    const content = readFileSync(memoryPath, 'utf-8');
    return {
      success: true,
      content: content
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to read memory file: ' + (error as Error).message
    };
  }
}

function main() {
  const result = readMemory();
  console.log(JSON.stringify(result, null, 2));
}

main();
