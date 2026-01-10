---
paths: src/renderer/apps/*/index.tsx
---

# Renderer Route Registration - CRITICAL

**This is the most commonly forgotten step when creating new apps!**

## The Problem

After creating an app manifest and renderer component, the app screen appears blank because you forgot to register the route in `src/renderer/apps/index.tsx`.

## Required Registration Steps

Update `src/renderer/apps/index.tsx` with THREE changes:

### 1. Add Import at Top

```typescript
import MyAppApp from './my-app';
```

### 2. Add Case to getAppComponent()

```typescript
export function getAppComponent(appId: string) {
  switch (appId) {
    // ... other cases
    case 'my-app':
      return MyAppApp;
    // ... rest of cases
  }
}
```

### 3. Add Case to AppRenderer()

```typescript
export function AppRenderer({ appId, isPopout }: { appId: string; isPopout?: boolean }) {
  switch (appId) {
    // ... other cases
    case 'my-app':
      return <MyAppApp />;
    // ... rest of cases
  }
}
```

## Common Mistake

❌ **WRONG**: Creating app manifest, renderer component, and registry entry, but forgetting `src/renderer/apps/index.tsx`

✅ **CORRECT**: Follow ALL registration steps, including the three changes above

## Debugging Tip

**If the app screen is blank, you likely forgot this step!**

Check `src/renderer/apps/index.tsx` to ensure your app has entries in both `getAppComponent()` and `AppRenderer()`.
