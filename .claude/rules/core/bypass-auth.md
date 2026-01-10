---
paths: scripts/**/*.ts
---

# Bypass Authentication - CRITICAL

**This project uses Claude Code's bypass authentication mode for all agent calls.**

## What is Bypass Auth?

Bypass auth allows the Claude Agent SDK to work **without requiring `ANTHROPIC_API_KEY`** by using Claude Code CLI's built-in authentication (via Claude Pro/Max subscription).

## How It Works

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const q = query({
  prompt: 'Your prompt here',
  options: {
    model: 'haiku',  // or 'sonnet' or 'opus'
    settingSources: ['project'],
    permissionMode: 'bypassPermissions',  // KEY: This enables bypass auth
    allowedTools: ['Read'],               // REQUIRED: At least one tool (SDK hangs if empty)
    executable: resolveBunExecutable(),   // REQUIRED: Full path to bun executable
    pathToClaudeCodeExecutable: resolveClaudeCodeCli(),
    systemPrompt: { type: 'preset', preset: 'claude_code' },
    cwd: WORKSPACE_DIR
  }
});
```

## Key Requirements

1. `permissionMode: 'bypassPermissions'` - Enables no-API-key mode
2. `pathToClaudeCodeExecutable` - Points to SDK CLI
3. `settingSources: ['project']` - Uses project settings
4. `allowedTools: ['Read']` - **CRITICAL:** Must have at least one tool (empty array causes hanging)
5. `executable: resolveBunExecutable()` - **CRITICAL:** Must be full path, not just `'bun'` string
6. No `ANTHROPIC_API_KEY` in environment

## Extended Context Support

**The extended context beta parameter is accepted with bypass auth!**

```typescript
const q = query({
  prompt: 'Your prompt here',
  options: {
    model: 'sonnet',
    settingSources: ['project'],
    permissionMode: 'bypassPermissions',
    allowedTools: ['Read'],               // REQUIRED: At least one tool
    executable: resolveBunExecutable(),   // REQUIRED: Full path to bun
    pathToClaudeCodeExecutable: resolveClaudeCodeCli(),
    systemPrompt: { type: 'preset', preset: 'claude_code' },
    cwd: WORKSPACE_DIR,
    // Extended context beta parameter
    betas: ['context-1m-2025-08-07']
  }
});
```

## Tests

- Basic bypass auth: `./resources/bun run scripts/test-bypass-auth.ts`
- Extended context beta: `./resources/bun run scripts/test-extended-context.ts`

**Note:** The test verifies the `betas` parameter is accepted. To confirm the 1M context window is active, you'd need to test with >200K tokens of input or check API response metadata.

## Reference Implementation

See [scripts/test-bypass-auth.ts](../../../scripts/test-bypass-auth.ts) - Simple example showing all required options
