---
paths: src/shared/apps/**/*.ts, src/renderer/apps/*/index.tsx
---

# Adding New Apps - CRITICAL

**When creating a new app, you MUST register it in FIVE locations.**

## 1. Create App Manifest

Create `src/shared/apps/{app-name}.ts` with the app definition:

```typescript
import type { AppManifest } from './types';

export const myAppApp: AppManifest = {
  id: 'my-app',
  name: 'My App',
  icon: 'rocket',
  skills: [],
  rootRoute: '/apps/my-app',
  description: 'Description of the app',
  layout: {
    preferredMode: 'standard',
    theme: 'light'
  },
  category: 'demo',
  systemPrompt: 'Agent prompt here',
  features: ['chat']
};
```

## 2. Register in App Index

Add export to `src/shared/apps/index.ts`:

```typescript
export * from './my-app';
```

## 3. Register in App Registry

Update `src/shared/apps/registry.ts`:

```typescript
// Add import
import { myAppApp } from './my-app';

// Add to apps array
const apps: AppManifest[] = [
  // ... other apps
  myAppApp,
  // ... rest of apps
];
```

## 4. Create Renderer Component

Create `src/renderer/apps/{app-name}/index.tsx` with your React component.

## 5. Register Renderer Route - CRITICAL

**This is the step that is most commonly forgotten!**

Update `src/renderer/apps/index.tsx`:

```typescript
// 1. Add import at top
import MyAppApp from './my-app';

// 2. Add case to getAppComponent()
export function getAppComponent(appId: string) {
  switch (appId) {
    // ... other cases
    case 'my-app':
      return MyAppApp;
    // ... rest of cases
  }
}

// 3. Add case to AppRenderer()
export function AppRenderer({ appId, isPopout }: { appId: string; isPopout?: boolean }) {
  switch (appId) {
    // ... other cases
    case 'my-app':
      return <MyAppApp />;
    // ... rest of cases
  }
}
```

## Common Mistakes

❌ **WRONG**: Creating all files but forgetting to add renderer route
✅ **CORRECT**: Follow all 5 steps, especially step 5 (renderer route registration)

**If the app screen is blank, you likely forgot step 5!**

