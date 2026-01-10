---
paths: scripts/test-*.ts
---

# Testing Workflow - CRITICAL

**When you modify pipeline code, you MUST update the corresponding test pipeline.**

## Test Pipelines

| Pipeline | Test Command | Test File |
|----------|--------------|-----------|
| ai-news-tweet | `./resources/bun run scripts/test-ai-news-tweet.ts` | [scripts/test-ai-news-tweet.ts](../../../scripts/test-ai-news-tweet.ts) |
| bypass-auth | `./resources/bun run scripts/test-bypass-auth.ts` | [scripts/test-bypass-auth.ts](../../../scripts/test-bypass-auth.ts) |
| extended-context | `./resources/bun run scripts/test-extended-context.ts` | [scripts/test-extended-context.ts](../../../scripts/test-extended-context.ts) |
| export | `./resources/bun run scripts/test-export.ts` | [scripts/test-export.ts](../../../scripts/test-export.ts) |

## Testing Rules

1. **NEVER test by running the Electron app and clicking buttons** - Use the test pipeline scripts
2. **When you add a new stage to a pipeline** - Add that stage to the test pipeline too
3. **When you add new parameters to scripts** - Update the test to pass those parameters

## How to Run Tests

```bash
# AI News Tweet E2E test (3-stage pipeline)
./resources/bun run scripts/test-ai-news-tweet.ts

# Bypass auth verification
./resources/bun run scripts/test-bypass-auth.ts

# Extended context beta test
./resources/bun run scripts/test-extended-context.ts

# Export functionality test
./resources/bun run scripts/test-export.ts
```

## Test Pipeline Structure

**Pattern**: Every pipeline has a corresponding test script at `scripts/test-{pipeline-name}.ts`

Test pipelines use the Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) to:
1. Load agent definitions from `.claude/agents/`
2. Load skill content from `.claude/skills/`
3. Run each pipeline stage with proper prompts
4. Validate output from each stage

If a pipeline doesn't have a test, create one following this pattern. If a test exists but isn't documented, add it to the Test Pipelines table.
