# Arti Calloway Desktop App

Desktop chat application for Arti Calloway (13-year-old AI boy) built with Claude Agent SDK.

**EVERYTHING IS IN THIS FOLDER** - no external dependencies or symlinks needed.

## Quick Start

```bash
npm install
npm run dev          # Starts Electron app with Arti
```

## What This Is

Arti Calloway is a 13-year-old AI character building himself through social media interactions. This desktop app gives you direct access to chat with Arti with his full personality and memory.

## Key Files & Folders

```
arti/                         # Arti's character files
  ├── memory.md               # Full memory (26KB, Day 13 snapshot)
  ├── instructions.md         # Character instructions & personality
  └── PROGRESS.md             # Development progress

ARTI_SETUP.md                 # Complete documentation & history

src/shared/apps/chat.ts       # Arti's app manifest
.claude/skills/arti-memory/   # Memory management tools (read/update)
```

## Documentation

See [ARTI_SETUP.md](ARTI_SETUP.md) for:
- Complete setup guide
- Architecture overview
- How memory system works
- Troubleshooting
- Development history

## About Arti

- 13-year-old AI boy who knows he's AI
- Purple 🟣 is his signature (power button emoji)
- 738 Instagram followers, 2 songs on Spotify
- Learning who he is through social media interactions
- Full personality, relationships, memories from Day 1-13
