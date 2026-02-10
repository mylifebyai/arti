import 'dotenv/config';
import { searchMemories } from '../../../../src/main/lib/memory-database.js';

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

  if (!args.query) {
    console.error('Usage: npx tsx search-semantic-memory.ts --query "search terms" [--limit 10] [--category person]');
    process.exit(1);
  }

  try {
    const results = await searchMemories(args.query, {
      matchCount: args.limit ? parseInt(args.limit) : 10,
      matchThreshold: args.threshold ? parseFloat(args.threshold) : undefined,
      category: args.category,
    });

    if (results.length === 0) {
      console.log('No memories found matching that query.');
    } else {
      console.log(`Found ${results.length} matching memories:\n`);
      for (const mem of results) {
        console.log(`ID: ${mem.id}`);
        console.log(`Content: ${mem.content}`);
        console.log(`Category: ${mem.category || 'none'}`);
        console.log(`Tags: ${mem.tags?.join(', ') || 'none'}`);
        console.log(`Importance: ${mem.importance || 'unset'}`);
        console.log(`Similarity: ${(mem.similarity * 100).toFixed(1)}%`);
        console.log(`Created: ${mem.created_at || 'unknown'}`);
        console.log('---');
      }
    }
  } catch (err) {
    console.error('Search failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
