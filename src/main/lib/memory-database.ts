import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Memory {
  id?: string;
  content: string;
  category?: string;
  tags?: string[];
  importance?: number;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

interface SearchResult extends Memory {
  similarity: number;
}

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }

    supabase = createClient(url, key);
  }
  return supabase;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

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

export async function saveMemory(memory: Memory): Promise<Memory> {
  const client = getSupabaseClient();

  // Generate embedding for the content
  const embedding = await generateEmbedding(memory.content);

  const { data, error } = await client
    .from('memories')
    .insert({
      content: memory.content,
      embedding,
      category: memory.category,
      tags: memory.tags,
      importance: memory.importance ?? 5,
      source: memory.source ?? 'arti',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save memory: ${error.message}`);
  }

  return data;
}

export async function searchMemories(
  query: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
    category?: string;
    tags?: string[];
  } = {}
): Promise<SearchResult[]> {
  const client = getSupabaseClient();

  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await client.rpc('search_memories', {
    query_embedding: queryEmbedding,
    match_threshold: options.matchThreshold ?? 0.7,
    match_count: options.matchCount ?? 10,
  });

  if (error) {
    throw new Error(`Failed to search memories: ${error.message}`);
  }

  // Filter by category/tags if specified
  let results = data as SearchResult[];

  if (options.category) {
    results = results.filter(m => m.category === options.category);
  }

  if (options.tags && options.tags.length > 0) {
    results = results.filter(m =>
      m.tags && options.tags!.some(tag => m.tags!.includes(tag))
    );
  }

  return results;
}

export async function updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
  const client = getSupabaseClient();

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // If content changed, regenerate embedding
  if (updates.content) {
    updateData.embedding = await generateEmbedding(updates.content);
  }

  const { data, error } = await client
    .from('memories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update memory: ${error.message}`);
  }

  return data;
}

export async function deleteMemory(id: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client
    .from('memories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete memory: ${error.message}`);
  }
}

export async function getMemoryById(id: string): Promise<Memory | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('memories')
    .select('id, content, category, tags, importance, source, created_at, updated_at')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get memory: ${error.message}`);
  }

  return data;
}

export async function listMemories(options: {
  category?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<Memory[]> {
  const client = getSupabaseClient();

  let query = client
    .from('memories')
    .select('id, content, category, tags, importance, source, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 50);

  if (options.category) {
    query = query.eq('category', options.category);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list memories: ${error.message}`);
  }

  return data;
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from('memories').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
