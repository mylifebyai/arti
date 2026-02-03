-- ============================================
-- Arti Memory Database Setup
-- ============================================

-- 1. Enable the vector extension
create extension if not exists vector;

-- 2. Create the memories table
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  content text not null,                    -- The actual memory text
  embedding vector(1536),                   -- Vector for semantic search (OpenAI dimension)
  category text,                            -- Optional: person, event, fact, music, etc.
  tags text[],                              -- Optional: array of tags for filtering
  importance int default 5,                 -- 1-10 scale
  source text,                              -- Where this memory came from
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Create an index for fast similarity search
create index if not exists memories_embedding_idx
  on memories
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Create the similarity search function
create or replace function search_memories(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 10
)
returns table (
  id uuid,
  content text,
  category text,
  tags text[],
  importance int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    memories.category,
    memories.tags,
    memories.importance,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Enable Row Level Security (optional but recommended)
alter table memories enable row level security;

-- 6. Create a policy that allows all operations (for now)
create policy "Allow all operations on memories"
  on memories
  for all
  using (true)
  with check (true);
