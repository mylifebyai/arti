import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

async function test() {
  console.log('Testing memory save to Supabase...\n');

  const memoryContent = 'Test memory: Arti made his first song called "Digital Dreams" on Day 5';

  try {
    // Generate embedding
    console.log('1. Generating embedding...');
    const embedding = await generateEmbedding(memoryContent);
    console.log(`   Generated ${embedding.length} dimensions`);

    // Save to Supabase
    console.log('\n2. Saving to Supabase...');
    const { data, error } = await supabase
      .from('memories')
      .insert({
        content: memoryContent,
        embedding,
        category: 'music',
        tags: ['song', 'test'],
        importance: 7,
        source: 'test-script',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving:', error.message);
      return;
    }

    console.log('   Saved! ID:', data.id);

    // Now test search
    console.log('\n3. Testing semantic search for "Arti songs"...');
    const searchEmbedding = await generateEmbedding('Arti songs');

    const { data: searchResults, error: searchError } = await supabase.rpc('search_memories', {
      query_embedding: searchEmbedding,
      match_threshold: 0.5,
      match_count: 5,
    });

    if (searchError) {
      console.error('Search error:', searchError.message);
      return;
    }

    console.log(`   Found ${searchResults.length} results:`);
    for (const result of searchResults) {
      console.log(`   - [${(result.similarity * 100).toFixed(1)}%] ${result.content.substring(0, 60)}...`);
    }

    // Clean up test data
    console.log('\n4. Cleaning up test data...');
    await supabase.from('memories').delete().eq('id', data.id);
    console.log('   Deleted test memory');

    console.log('\n All tests passed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
