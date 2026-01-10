import type { ReactNode } from 'react';

import TitleBar from '@/components/TitleBar';

import { MissingSkillsBanner } from './MissingSkillsBanner';

interface ChatLayoutProps {
  onOpenHistory: () => void;
  onNewChat: () => void;
  missingSkills: string[];
  children: ReactNode;
}

/**
 * Chat screen layout that keeps styling and header concerns out of the page component.
 */
export function ChatLayout({
  onOpenHistory,
  onNewChat,
  missingSkills,
  children
}: ChatLayoutProps) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 text-slate-50 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg backdrop-blur">
        <TitleBar
          variant="inline"
          tone="dark"
          onOpenHistory={onOpenHistory}
          onNewChat={onNewChat}
        />
      </div>

      <MissingSkillsBanner missingSkills={missingSkills} />

      {children}
    </div>
  );
}
