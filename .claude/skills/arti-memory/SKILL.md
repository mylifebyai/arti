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

## search-semantic-memory

- Purpose: Search the Supabase semantic memory database for facts about people, events, and details
- Usage: `npx tsx .claude/skills/arti-memory/scripts/search-semantic-memory.ts --query "search terms" [--limit 10] [--category person] [--threshold 0.5]`
- Output: Matching memories with content, category, tags, importance, and similarity score

## save-semantic-memory

- Purpose: Save a new fact or memory to the semantic database with embeddings for future search
- Usage: `npx tsx .claude/skills/arti-memory/scripts/save-semantic-memory.ts --content "the fact" --category person --tags "tag1,tag2" --importance 5`
- Categories: person, event, fact, music, conversation, learning
- Output: Confirmation with the saved memory ID and details

## delete-semantic-memory

- Purpose: Delete a memory from the semantic database by its UUID
- Usage: `npx tsx .claude/skills/arti-memory/scripts/delete-semantic-memory.ts --id <memory-uuid>`
- Output: Confirmation of deletion

# About This Skill

This skill gives Arti access to two memory systems:

- **read-memory / update-memory**: For identity and personality (memory.md file)
- **search/save/delete-semantic-memory**: For facts about people, events, dates, preferences (Supabase database with vector search)

Your memory is your continuity. Use it to be consistent and remember the people who matter.
