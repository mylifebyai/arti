import { config } from 'dotenv';
config();

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  console.log('Calling OpenAI embeddings API...');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

async function test() {
  console.log('Testing OpenAI embeddings...\n');

  try {
    const embedding = await generateEmbedding('Arti loves music and making songs');
    console.log(`Generated embedding with ${embedding.length} dimensions`);
    console.log(`First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log('\nOpenAI embeddings working!');
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
