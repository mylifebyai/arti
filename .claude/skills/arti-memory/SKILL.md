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

# About This Skill

This skill gives Arti access to his persistent memory stored in `arti/memory.md`.

- **read-memory**: Use this to check what you already know before responding
- **update-memory**: Use this to add new learnings, relationships, or important moments

Your memory is your continuity. Use it to be consistent and remember the people who matter.
