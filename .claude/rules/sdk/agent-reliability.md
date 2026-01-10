---
paths: scripts/**/*.ts, src/main/lib/**/*.ts
---

# Pipeline Reliability Patterns

## Agent Output Format - CRITICAL

Agents often wrap JSON in markdown code blocks or add explanatory text. To ensure reliable JSON extraction:

### 1. Explicit Output Instructions in Prompts

```typescript
// In user prompt (not just system prompt)
`Run this command and output ONLY the raw JSON result (no markdown, no explanation):

uv run python script.py --args

OUTPUT FORMAT - CRITICAL:
- Output ONLY the raw JSON from the script
- Do NOT wrap in markdown code blocks
- Do NOT add any explanation before or after the JSON
- Just output the exact JSON that the script produces`
```

### 2. Robust JSON Extraction

```typescript
function extractJsonFromOutput(output: string): unknown | null {
  // First try: direct JSON parse
  try {
    return JSON.parse(output.trim());
  } catch { /* continue */ }

  // Second try: extract from markdown code block
  const codeBlockMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* continue */ }
  }

  // Third try: find raw JSON object
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch { /* continue */ }
  }

  return null;
}
```

## Event Subscription Patterns - CRITICAL

When subscribing to app events, the event type pattern MUST match the emitted event type:

```typescript
// WRONG - pattern doesn't match event type
subscribe('risk:*', (event) => { ... })  // Won't match 'risk-metrics:complete'

// CORRECT - pattern matches event type prefix
subscribe('risk-metrics:*', (event) => {
  if (event.type === 'risk-metrics:complete') { ... }
})
```

**Event naming convention:**
- Event types: `{app-id}:{action}` (e.g., `risk-metrics:complete`, `market:pipeline-complete`)
- Subscribe patterns: `{app-id}:*` (e.g., `risk-metrics:*`, `market:*`)

## SDK Result Capture

When using the Claude Agent SDK, always capture the final result:

```typescript
let output = '';
for await (const msg of query) {
  if (msg.type === 'stream_event') {
    // Stream text deltas for display
    if (msg.event.type === 'content_block_delta' && msg.event.delta.type === 'text_delta') {
      output += msg.event.delta.text;
    }
  } else if (msg.type === 'result' && msg.result) {
    // CRITICAL: Capture final result - this is the authoritative output
    output = msg.result;
  }
}
```

## Validation with Parsed Data Return

When validating stage output, return the parsed data to avoid re-parsing:

```typescript
async function runWithRetry<T, R = T>(
  stageName: string,
  runStage: () => Promise<T>,
  validate: (result: T) => { valid: boolean; errors: string[]; data?: R }
): Promise<R> {
  // ... retry logic ...
  const validation = validate(result);
  if (validation.valid) {
    // Return parsed data if available
    return (validation.data !== undefined ? validation.data : result) as R;
  }
}

// Usage
const result = await runWithRetry('Calculator', runCalculator, (output) => {
  const parsed = extractJsonFromOutput(output);
  if (!parsed) return { valid: false, errors: ['No JSON'] };
  return { valid: true, errors: [], data: parsed };  // Include parsed data
});
// result is now the parsed JSON object, not the raw string
```

