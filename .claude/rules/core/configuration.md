---
paths: src/main/lib/config.ts, src/renderer/**/*.tsx
---

# Configuration System

## Overview

This project uses a layered configuration system with defaults, project-level, and environment-specific settings.

## Quick Reference

- **Configuration management**: `src/main/lib/config.ts`
- **Renderer access**: `window.electron.config.*` API
- **Project config**: `{workspace}/.claude-sdk/config.json`
- **API keys**: `{workspace}/.env` (ANTHROPIC_API_KEY)

## Key Patterns

### Access Config in Renderer

```typescript
// Get config value
const workspaceDir = await window.electron.config.getWorkspaceDir();
const apiKeyStatus = await window.electron.config.getApiKeyStatus();

// Set config value
await window.electron.config.setWorkspaceDir('/path/to/workspace');
```

### Per-App Settings

App-specific settings use the `appSettings.<appId>` structure:

```typescript
// Get app settings
const settings = await window.electron.config.getAppSettings('my-app');

// Set app settings
await window.electron.config.setAppSettings('my-app', {
  promptAppend: 'Custom instructions here'
});
```

