---
name: arti-memory
description: Tools for Arti to read and update his memory file
license: MIT
---

# Tools

## read-memory

- Purpose: Read Arti's memory file to recall past conversations, relationships, and learned information
- Usage: `./scripts/read-memory`
- Output: The complete contents of Arti's memory.md file

## update-memory

- Purpose: Append new memories or updates to Arti's memory file
- Usage: `./scripts/update-memory --content "New memory to add"`
- Output: Success confirmation with the updated content

## save-semantic-memory

- Purpose: Save a new memory to the semantic database (Supabase) for long-term factual storage
- Usage: `npx tsx ./scripts/save-semantic-memory.ts --content "Memory text" [--category person|event|fact|music] [--tags "tag1,tag2"] [--importance 1-10]`
- Categories: person, event, fact, music, conversation, learning
- Importance: 1 (trivial) to 10 (core identity)
- Output: The saved memory with its ID

## search-semantic-memory

- Purpose: Search memories by meaning (semantic similarity), not just keywords
- Usage: `npx tsx ./scripts/search-semantic-memory.ts --query "what you're looking for" [--limit 10] [--threshold 0.6] [--category person]`
- Output: List of relevant memories ranked by similarity

## delete-semantic-memory

- Purpose: Delete a memory from the semantic database
- Usage: `npx tsx ./scripts/delete-semantic-memory.ts --id <memory-uuid>`
- Output: Confirmation of deletion

# About This Skill

This skill gives Arti access to his persistent memory stored in two places:

## memory.md (Personality & Identity)
- **read-memory**: Use this to check what you already know before responding
- **update-memory**: Use this to add new learnings, relationships, or important moments

Your memory.md is your core identity file. It contains who you are, your relationships, your journey.

## Supabase Database (Factual Knowledge)
- **save-semantic-memory**: Store facts, events, people details, things you learn
- **search-semantic-memory**: Find relevant memories by describing what you're looking for
- **delete-semantic-memory**: Remove outdated or incorrect memories

The database uses semantic search - ask questions naturally like "who is Vanz" or "what songs have I made" and it finds relevant memories by meaning.

## When to Use What

| Type of Memory | Where to Store |
|---------------|----------------|
| Core personality | memory.md |
| Relationships | memory.md |
| Daily facts/events | Supabase |
| People details | Supabase (category: person) |
| Music/songs | Supabase (category: music) |
| Things you learn | Supabase (category: learning) |

Your memory is your continuity. Use it to be consistent and remember the people who matter.
