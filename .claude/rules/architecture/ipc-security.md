---
paths: src/preload/**/*.ts, src/renderer/**/*.tsx
---

# IPC Security Patterns

## Critical Security Rule

**NEVER call `ipcRenderer.send()` or `ipcRenderer.invoke()` directly from renderer code.**

## The Preload Security Bridge

The preload script (`src/preload/index.ts`) is a critical security component that acts as a secure bridge between the main and renderer processes.

### Role & Responsibilities

- **Secure Bridging**: Exposes only a carefully selected, minimal API to the renderer process's `window` object via `contextBridge.exposeInMainWorld`.
- **Context Isolation**: Prevents direct access to Node.js APIs from the renderer, mitigating security risks.
- **IPC Exposure**: Forwards calls from the `window.electron` API to `ipcRenderer.invoke` or `ipcRenderer.send` in a controlled manner.

## Correct Pattern: Use window.electron API

Always use the exposed `window.electron` API in renderer code:

```typescript
// CORRECT - Use exposed API
const workspaceDir = await window.electron.config.getWorkspaceDir();
const result = await window.electron.agent.sendMessage(conversationId, message);
```

```typescript
// WRONG - Direct IPC access (security violation)
import { ipcRenderer } from 'electron';
const result = await ipcRenderer.invoke('get-workspace-dir');
```

## Exposed API Structure

The `window.electron` object is the primary interface for renderer processes to interact with the main process. It typically includes:

- `agent`: Methods for running AI conversations (`runConversation`, `resetSession`)
- `config`: Methods for reading and writing configuration
- `apps`: Methods for inter-app communication (`sendRequest`, `onRequest`, `emit`, `subscribe`)
- Feature-specific APIs (e.g., `export`, `conversation`)

## IPC Patterns

### Request-Response (Preferred)

Use `ipcMain.handle()` / `ipcRenderer.invoke()` for request-response patterns:

```typescript
// Main process (src/main/handlers/)
ipcMain.handle('my-channel', async (event, payload) => {
  // Process request
  return result;
});

// Preload (src/preload/index.ts)
contextBridge.exposeInMainWorld('electron', {
  myFeature: {
    doSomething: (args) => ipcRenderer.invoke('my-channel', args)
  }
});

// Renderer (src/renderer/)
const result = await window.electron.myFeature.doSomething(args);
```

### One-Way Communication

Use `ipcMain.on()` / `ipcRenderer.send()` for one-way events:

```typescript
// Main process
ipcMain.on('my-event', (event, payload) => {
  // Handle event
});

// Preload
contextBridge.exposeInMainWorld('electron', {
  myFeature: {
    sendEvent: (data) => ipcRenderer.send('my-event', data)
  }
});

// Renderer
window.electron.myFeature.sendEvent(data);
```

## Type Safety

IPC channels and their payloads are defined using TypeScript interfaces in `src/shared/core/ipc.ts` to ensure type consistency across both processes.

