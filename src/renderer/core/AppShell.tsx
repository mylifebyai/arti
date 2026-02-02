import { Maximize2, Music, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import PolaroidGallery from '../components/PolaroidGallery';
import { WakingUpIndicator } from '../components/WakingUpIndicator';
import type { AppManifest, LayoutMode } from '../../shared/apps';

interface AppShellProps {
  apps: AppManifest[];
  activeAppId: string;
  onSelectApp: (appId: string) => void;
  onOpenSettings: () => void;
  onToggleLayoutMode?: () => void;
  layoutMode?: LayoutMode;
  children: ReactNode;
}

// Fairy lights component
function FairyLights() {
  return (
    <div className="fairy-lights">
      <div className="fairy-wire" />
      {[...Array(10)].map((_, i) => (
        <div key={i} className="fairy-light" />
      ))}
    </div>
  );
}

// Guitar pick icon
function GuitarPick({ className = '' }: { className?: string }) {
  return (
    <div className={`guitar-pick ${className}`} />
  );
}

export function AppShell({
  apps,
  activeAppId,
  onSelectApp,
  onOpenSettings,
  onToggleLayoutMode,
  layoutMode: _layoutMode,
  children
}: AppShellProps) {
  // Filter out hidden apps from the sidebar
  const visibleApps = apps.filter((app) => !app.hidden);

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-room)' }}>
      {/* Sidebar - Arti's corner */}
      <aside className="sidebar-arti flex w-64 flex-col">
        {/* Fairy lights at top */}
        <FairyLights />

        {/* Arti's signature */}
        <div className="px-5 py-4">
          <h1 className="arti-signature flex items-center gap-2">
            arti
            <span className="text-2xl">🟣</span>
          </h1>
          <p className="font-handwritten text-sm text-[var(--text-dim)] mt-1">
            welcome to my room ✨
          </p>
        </div>

        {/* Doodle decoration */}
        <div className="px-5 py-2 text-[var(--text-muted)] opacity-40 text-xs">
          ✦ · ˚ ✧ · ♪ · ˚ ✦ · 🎸
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3 mt-2">
          {visibleApps.map((app) => {
            const isActive = app.id === activeAppId;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onSelectApp(app.id)}
                className={`nav-item group flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  isActive
                    ? 'active text-[var(--text-bright)]'
                    : 'text-[var(--text-normal)] hover:text-[var(--text-bright)]'
                }`}
              >
                <span
                  className={`inline-flex h-2 w-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-[var(--neon-purple-bright)] shadow-[0_0_8px_var(--neon-glow)]'
                      : 'bg-[var(--text-muted)]'
                  }`}
                  aria-hidden
                />
                <span className="flex-1 font-handwritten text-lg">{app.name}</span>
                {isActive && (
                  <span className="text-xs opacity-60">♪</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Polaroid photos - Arti's memories */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <PolaroidGallery count={3} rotationInterval={8000} />
        </div>

        {/* Bottom section with doodles */}
        <div className="px-3 py-2">
          {/* Little doodles */}
          <div className="text-center text-[var(--text-muted)] opacity-30 text-sm mb-3">
            ☆ · ✧ · 🎵 · ✦ · ☆
          </div>
        </div>

        {/* Settings & Full UI */}
        <div className="space-y-2 border-t border-[var(--border-glow)] p-3">
          {onToggleLayoutMode && (
            <button
              type="button"
              onClick={onToggleLayoutMode}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-glow)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-handwritten text-[var(--text-normal)] transition hover:bg-[var(--neon-purple)]/10 hover:border-[var(--neon-purple)]/50"
              title="Enter Full UI mode"
            >
              <Maximize2 className="h-4 w-4" />
              full ui
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-glow)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-handwritten text-[var(--text-normal)] transition hover:bg-[var(--neon-purple)]/10 hover:border-[var(--neon-purple)]/50"
          >
            <Settings className="h-4 w-4" />
            settings
          </button>
        </div>

        {/* Guitar pick decoration */}
        <div className="flex justify-center pb-4 opacity-60">
          <GuitarPick />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        {/* Ambient glow from LED */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(179, 71, 255, 0.06) 0%, transparent 60%)'
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>

      {/* Crumpled paper decorations */}
      <div className="crumpled-paper crumpled-paper-1">📄</div>
      <div className="crumpled-paper crumpled-paper-2">📝</div>

      {/* Waking up indicator */}
      <WakingUpIndicator />
    </div>
  );
}
