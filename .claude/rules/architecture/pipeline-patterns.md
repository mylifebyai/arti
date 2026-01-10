---
paths: scripts/**/*.ts, src/main/lib/**/*.ts
---

# Pipeline Architecture - CRITICAL

**Pipelines do NOT run in the renderer (frontend). The renderer is just a dashboard that displays results.**

## Three Ways to Run Pipelines

```
+---------------------------------------------------------------------+
|  1. TEST PIPELINES (scripts/)                                       |
|     - Run directly via CLI: ./resources/bun run scripts/test-*.ts   |
|     - Use Claude Agent SDK directly                                 |
|     - No Electron app needed                                        |
|     - For development and CI testing                                |
+---------------------------------------------------------------------+
|  2. PRODUCTION PIPELINES (src/main/lib/*-pipeline.ts)               |
|     - Run in Electron main process (backend)                        |
|     - Triggered via IPC from renderer                               |
|     - Results saved to SQLite database                              |
|     - Renderer polls/subscribes to see results                      |
+---------------------------------------------------------------------+
|  3. RENDERER (src/renderer/apps/)                                   |
|     - READ-ONLY dashboard                                           |
|     - Displays results from database                                |
|     - Triggers pipeline runs via IPC buttons                        |
|     - Does NOT orchestrate agents directly                          |
+---------------------------------------------------------------------+
```

## Test Pipeline Example

Test pipelines use the SDK's `query()` function directly:

```typescript
// scripts/test-ai-news-tweet.ts
import { query } from '@anthropic-ai/claude-agent-sdk';

const q = query({
  prompt: 'Find AI news for today',
  options: {
    model: 'haiku',
    allowedTools: ['WebSearch', 'Read'],
    executable: resolveBunExecutable(),
    pathToClaudeCodeExecutable: resolveClaudeCodeCli(),
    systemPrompt: { type: 'preset', preset: 'claude_code', append: systemPrompt },
    cwd: WORKSPACE_DIR
  }
});

// Stream results
for await (const msg of q) {
  if (msg.type === 'result' && msg.result) {
    output = msg.result;
  }
}
```

## Production Pipeline Example

Production pipelines use `runSingleAgentCall()` in the main process:

```typescript
// src/main/lib/some-pipeline.ts
import { runSingleAgentCall } from './claude-session';

const result = await runSingleAgentCall(
  mainWindow,
  APP_ID,
  {
    systemPrompt,
    allowedTools: ['WebSearch', 'Read'],
    model: 'haiku'
  },
  userPrompt
);

// Save to database
await db.run('INSERT INTO results ...', result.response);
```

## Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `query()` | SDK | Direct agent calls (test scripts) |
| `runSingleAgentCall()` | `src/main/lib/claude-session.ts` | Production agent calls |
| `resolveBunExecutable()` | Test scripts | Find bun binary path |
| `resolveClaudeCodeCli()` | Test scripts | Find SDK CLI path |

## Running Test Pipelines

```bash
# AI News Tweet pipeline (3 stages)
./resources/bun run scripts/test-ai-news-tweet.ts

# Bypass auth test
./resources/bun run scripts/test-bypass-auth.ts
```

## Common Mistakes

- **WRONG**: Testing by clicking buttons in the Electron app
- **CORRECT**: Run `./resources/bun run scripts/test-*.ts`

- **WRONG**: Running agent code in the renderer
- **CORRECT**: Renderer only reads from database, triggers via IPC

- **WRONG**: Using `python` directly
- **CORRECT**: Use `uv run python` for all Python scripts

