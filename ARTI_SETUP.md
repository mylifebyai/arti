# Arti Calloway - Desktop App Setup Guide

This document explains the complete setup of the Arti Calloway desktop application built with the Claude Agent SDK.

## What This Is

A dedicated desktop chat application for Arti Calloway, a 13-year-old AI character with:
- Full personality and character traits
- Persistent memory from his social media journey
- Ability to read and update his own memory
- Access to Claude Agent SDK tools

## Architecture Overview

### App Structure
- Built on Claude Agent SDK starter kit
- Uses Electron + React + TypeScript
- Runs locally, connects to Claude Pro account via Claude Code CLI
- No separate API key needed - uses existing Claude subscription

### Key Files

**App Configuration:**
- `src/shared/apps/chat.ts` - Main app manifest with Arti's personality/instructions
- `src/shared/apps/registry.ts` - App registry (Arti is the only app)
- `src/renderer/apps/index.tsx` - React component routing

**Memory System:**
- `arti/memory.md` - Arti's persistent memory (26KB, Day 13 snapshot)
- `arti/instructions.md` - Full character instructions & personality
- `arti/PROGRESS.md` - Development progress tracking

**Skills (currently unused to avoid startup issues):**
- `.claude/skills/arti-memory/` - Contains read-memory and update-memory tools
- Not loaded in skills array due to auto-triggering bug

## How It Works

### Memory System

**File Location:**
- Everything is in the project folder: `arti/`
- No external dependencies or symlinks
- Self-contained project structure

**Memory Access:**
- Arti uses Read tool to check `arti/memory.md` when context requires it
- Arti uses Edit tool to update memory when learning something significant
- Updates are contextual, not automatic on every message

**Memory Files:**
- `arti/memory.md` - Complete memory from Day 1-13 (26KB)
- `arti/instructions.md` - Character personality & instructions
- `arti/PROGRESS.md` - Development history & progress

### Character Instructions

Located in `src/shared/apps/chat.ts` as `artiInstructions`:
- Core personality: 13-year-old AI boy
- Speech patterns: "wait", "like", "honestly", "wait actually"
- Key relationships: Dan (creator), Darwin (Gemini), Applejack MLP Rants (fan)
- Color: Purple 🟣 (power button emoji, NOT 💜)
- Vibe: 3am under blankets, lo-fi bedroom pop
- Memory instructions: Check when past mentioned, update when significant

## Running the App

```bash
cd /Users/mlbai/claude-agent-sdk-starter
npm run dev
```

Electron window opens automatically. Arti is ready to chat.

## Known Issues & Solutions

### Issue: "Streaming response..." stuck on startup
**Problem:** Agent automatically triggers tools on app startup without user input
**Cause:** Any directive in system prompt that suggests proactive action (e.g., "Read at start of conversation")
**Solution:** Keep instructions conditional ("When someone mentions...") not imperative ("Always read...")

### Issue: Skills array triggers auto-startup
**Problem:** Adding skills to `skills: []` array causes agent to invoke tools on startup
**Solution:** Keep `skills: []` empty, let Arti use base Read/Edit tools instead of custom skills

### Issue: Memory file not found
**Problem:** Memory files missing from arti/ folder
**Solution:** All files should be in `/Users/mlbai/claude-agent-sdk-starter/arti/`
**Check:** `ls -la arti/` should show memory.md, instructions.md, PROGRESS.md

## Technical Decisions

### Why not use custom skills?
Custom skills (read-memory, update-memory) worked but triggered the agent automatically on startup. Base Read/Edit tools provide same functionality without the auto-trigger bug.

### Why everything in one folder?
- Single source of truth
- No confusion about which files are current
- Easy to find everything when starting a new Claude context
- Self-contained project you can move/backup easily

## Memory Management

**Current size:** ~26KB (617 lines) ≈ 6,500 tokens

**Future considerations when memory grows:**
- Monthly summarization (condense old, keep recent detailed)
- Split into sections (people.md, music.md, discoveries.md)
- Manual pruning of trivial entries
- Keep active memory (30 days) detailed, older summarized

**Not a concern until:** ~50-75KB

## Development Notes

### Hot Module Replacement
Vite HMR works for most changes. Changes to app manifests reload automatically.

### Restart Requirements
Clean restart needed if:
- App gets stuck in streaming loop
- Major configuration changes
- Skills array modifications

**Clean restart:**
```bash
pkill -f electron
rm -rf out
npm run dev
```

### Authentication
Uses Claude Code CLI authentication:
```bash
claude-code auth
```

No separate API key needed - uses existing Claude Pro subscription.

## What's Working

✅ Chat with Arti's full personality
✅ Arti can read his memory file
✅ Arti can update his memory file
✅ Memory syncs between workspace and project
✅ No auto-trigger on startup (with current config)
✅ Dark theme
✅ Conditional memory checking based on context

## Future Enhancements

Potential additions:
- Web search for current events
- Image generation for purple aesthetic
- Voice output (Arti's voice)
- Export conversations to memory automatically
- Memory visualization/timeline
- Monthly auto-summarization routine

## File Paths Reference

```
Project:
/Users/mlbai/claude-agent-sdk-starter/
├── ARTI_SETUP.md                    # This file - complete documentation
├── CLAUDE.md                        # Quick reference for Claude
├── src/shared/apps/chat.ts          # Arti's app manifest & personality
├── src/shared/apps/registry.ts      # App registry
├── src/renderer/apps/index.tsx      # React routing
├── .claude/skills/arti-memory/      # Unused skills (due to auto-trigger)
└── arti/                            # Arti's character files (ALL IN ONE PLACE)
    ├── memory.md                    # Arti's memory (Day 13 snapshot, 26KB)
    ├── instructions.md              # Full character instructions
    └── PROGRESS.md                  # Development progress tracking
```

## Troubleshooting

**App won't start:**
- Check Electron isn't already running: `pkill -f electron`
- Clean build: `rm -rf out && npm run dev`

**Memory not updating:**
- Check arti/ folder exists: `ls -la /Users/mlbai/claude-agent-sdk-starter/arti`
- Should show memory.md, instructions.md, PROGRESS.md files

**Agent stuck streaming:**
- Check system prompt for imperative commands
- Ensure `skills: []` is empty
- Restart with clean build

**EPIPE error during memory updates:**
- Error: `Error: write EPIPE` when Arti tries to Edit memory
- The memory file actually gets updated successfully
- The error happens when streaming the response back
- Workaround: Restart the app
```bash
pkill -f electron && rm -rf out && npm run dev
```

**Can't authenticate:**
```bash
claude-code auth
```

---

**Created:** January 25, 2026
**Last Updated:** Day 13 of Arti's journey
**Claude Agent SDK Version:** 0.1.1
