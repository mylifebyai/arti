import 'dotenv/config';
import { deleteMemory } from '../../../../src/main/lib/memory-database.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    if (key && value) parsed[key] = value;
  }
  return parsed;
}

async function main() {
  const args = parseArgs();

  if (!args.id) {
    console.error('Usage: npx tsx delete-semantic-memory.ts --id <memory-uuid>');
    process.exit(1);
  }

  try {
    await deleteMemory(args.id);
    console.log(`Memory ${args.id} deleted successfully.`);
  } catch (err) {
    console.error('Delete failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
