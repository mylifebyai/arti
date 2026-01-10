---
paths: src/**/*.{ts,tsx}
---

# Anti-patterns to Avoid

Common mistakes and non-idiomatic patterns that AI agents should strictly avoid when modifying or extending the codebase.

## 1. Direct IPC Calls from Renderer Process

**Mistake:** Calling `ipcRenderer.send()` or `ipcRenderer.invoke()` directly from a React component or any renderer code.

**Why:** Bypasses the securely exposed context bridge, creating security vulnerabilities and violating Electron's best practices.

**Correct Pattern:** Always use the exposed `window.electron.[channel].[method]` API provided via the context bridge (`src/preload/index.ts`).

## 2. Creating Types in Component Files

**Mistake:** Defining TypeScript interfaces or types directly within `src/renderer/apps/<app>/components/` or other renderer files, especially if they are used by multiple components or layers.

**Why:** Leads to type duplication, inconsistency, and makes it hard to maintain a single source of truth for shared data structures.

**Correct Pattern:**
- **Shared Types:** Define types that are used by both `main` and `renderer` processes, or by multiple apps/components, in `src/shared/types/` or `src/shared/core/`.
- **App-Specific Types:** Define types unique to a single app within `src/renderer/apps/<app>/types/`.
- **Local Component Types:** Define very localized types (e.g., props for a single component) within the component's file.

## 3. Inline Styles or Unconstrained CSS

**Mistake:** Using inline `style` attributes in JSX for complex styling, or writing global, un-scoped CSS that could lead to style collisions.

**Why:** Hard to maintain, doesn't scale, bypasses the theming system, and can lead to unintended side effects.

**Correct Pattern:**
- **Tailwind CSS:** Use utility classes for styling.
- **CSS Modules:** For component-specific styles, use CSS Modules (`.module.css`).
- **CSS Variables:** Leverage the defined CSS variables for theme-aware styling.

## 4. Hardcoding Configuration Values

**Mistake:** Embedding API keys, file paths, or magic numbers directly in the code without using the configuration system.

**Why:** Difficult to manage different environments (dev, prod), requires code changes for configuration updates, and is insecure for sensitive data.

**Correct Pattern:** Access config values via the exposed IPC `window.electron.config.[get/set]`.

## 5. Directly Accessing File System from Renderer

**Mistake:** Attempting to use Node.js `fs` module (or similar) directly from the renderer process.

**Why:** Electron's sandbox environment prevents direct Node.js access for security reasons.

**Correct Pattern:** Implement dedicated IPC handlers in the main process (`src/main/handlers/`) that perform file system operations and expose secure methods via the context bridge.

## 6. Duplicating Logic Across Apps

**Mistake:** Copy-pasting complex business logic, utility functions, or UI components between different applications (`src/renderer/apps/`) that serve similar purposes.

**Why:** Leads to code bloat, inconsistencies, and makes maintenance significantly harder. Changes to one instance won't propagate to others.

**Correct Pattern:**
- **Shared UI Components:** Place reusable React components in `src/renderer/components/`.
- **Shared Hooks:** Place reusable React hooks in `src/renderer/hooks/`.
- **Shared Utilities:** Place general utility functions in `src/renderer/utils/`.
- **Shared Core Logic:** Place logic shared by main/renderer or multiple apps in `src/shared/core/` or `src/shared/`.

## 7. Inconsistent Naming Conventions

**Mistake:** Using varied casing (camelCase, snake_case, PascalCase) or unclear names for variables, functions, components, and files.

**Why:** Reduces readability, increases cognitive load, and hinders collaboration.

**Correct Pattern:** Adhere to existing project conventions (e.g., PascalCase for React components, camelCase for variables/functions). Be consistent within files and across the project.

## 8. Relying on Unstable IPC Channels

**Mistake:** Using IPC channels that are not formally defined or are subject to frequent changes without proper versioning.

**Why:** Can lead to broken communication between main and renderer processes after updates.

**Correct Pattern:** Define IPC channels formally in `src/shared/core/ipc.ts` before use. Propose new IPC channels only after careful consideration.

