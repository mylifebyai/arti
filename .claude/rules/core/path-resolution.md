# Path Resolution - CRITICAL

**NEVER hardcode absolute paths. ALWAYS use dynamic path resolution.**

## Git Bash Path for Windows - REQUIRED PATTERN

ALL test scripts using the Claude Agent SDK on Windows MUST include this at the top:

```typescript
const WORKSPACE_DIR = process.cwd();

// Set git-bash path for Windows
if (process.platform === 'win32' && !process.env.CLAUDE_CODE_GIT_BASH_PATH) {
  const resourceBash = path.join(WORKSPACE_DIR, 'resources', 'msys2', 'usr', 'bin', 'bash.exe');
  const commonPaths = [
    resourceBash,  // ALWAYS check resources directory FIRST
    'D:\\Program Files\\Git\\bin\\bash.exe',
    'D:\\Program Files\\Git\\usr\\bin\\bash.exe',
    'C:\\Program Files\\Git\\bin\\bash.exe',
    'C:\\Program Files\\Git\\usr\\bin\\bash.exe'
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      process.env.CLAUDE_CODE_GIT_BASH_PATH = p;
      break;
    }
  }
  if (!process.env.CLAUDE_CODE_GIT_BASH_PATH) {
    console.error('[ERROR] Could not find git-bash! Checked:');
    commonPaths.forEach((p) => console.error(`  - ${p}`));
  }
}
```

**Key principle**: Check `resources/` directory FIRST before system paths.

## Core Rule

❌ **WRONG**: Hardcoding paths
```typescript
const bashPath = 'H:\\Active\\claude-agent-sdk-starter-kit\\resources\\msys2\\usr\\bin\\bash.exe';
const bashPath = '/home/user/project/resources/bash';
```

✅ **CORRECT**: Dynamic path resolution
```typescript
const bashPath = path.join(process.cwd(), 'resources', 'msys2', 'usr', 'bin', 'bash.exe');
const bashPath = path.join(WORKSPACE_DIR, 'resources', 'msys2', 'usr', 'bin', 'bash.exe');
```

## Platform-Specific Paths

When paths differ by platform, use conditional logic:

```typescript
function resolveBashExecutable(): string {
  const basePath = path.join(process.cwd(), 'resources');

  if (process.platform === 'win32') {
    return path.join(basePath, 'msys2', 'usr', 'bin', 'bash.exe');
  } else {
    return path.join(basePath, 'bash');
  }
}
```

## Existing Patterns

Follow existing path resolution patterns in the codebase:

```typescript
// From test scripts
const WORKSPACE_DIR = process.cwd();

function resolveBunExecutable(): string {
  const resourceBun = path.join(
    WORKSPACE_DIR,
    'resources',
    process.platform === 'win32' ? 'bun.exe' : 'bun'
  );
  if (fs.existsSync(resourceBun)) return resourceBun;
  return 'bun';
}
```

## Why This Matters

- Projects move between directories
- Users have different folder structures
- Code runs in different environments (dev, CI, production)
- Hardcoded paths break portability
- Absolute paths cause merge conflicts

## Exception

The ONLY acceptable hardcoded path is when referencing system-installed tools as fallbacks:

```typescript
// OK as fallback only
if (fs.existsSync(resourceBun)) return resourceBun;
return 'bun';  // System-installed fallback
```
