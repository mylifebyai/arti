import 'dotenv/config';
import { saveMemory } from '../../../../src/main/lib/memory-database.js';

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

  if (!args.content) {
    console.error('Usage: npx tsx save-semantic-memory.ts --content "memory text" --category person --tags "tag1,tag2" --importance 5');
    process.exit(1);
  }

  try {
    const result = await saveMemory({
      content: args.content,
      category: args.category,
      tags: args.tags ? args.tags.split(',').map(t => t.trim()) : undefined,
      importance: args.importance ? parseInt(args.importance) : 5,
    });

    console.log('Memory saved successfully!');
    console.log(`ID: ${result.id}`);
    console.log(`Content: ${result.content}`);
    console.log(`Category: ${result.category || 'none'}`);
    console.log(`Tags: ${result.tags?.join(', ') || 'none'}`);
    console.log(`Importance: ${result.importance}`);
  } catch (err) {
    console.error('Save failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
