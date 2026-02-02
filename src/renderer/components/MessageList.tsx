import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import type { CSSProperties, RefObject } from 'react';

import Message from '@/components/Message';
import { getRandomSuggestion } from '@/constants/chatSuggestions';
import type { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  bottomPadding?: number;
  tone?: 'light' | 'dark';
}

const containerClasses = 'flex-1 overflow-y-auto px-3 py-3 bg-transparent';

// Random doodles for decoration
const cornerDoodles = ['✦', '♪', '✧', '☆', '·', '˚', '🎸', '🎵'];

export default function MessageList({
  messages,
  isLoading,
  containerRef,
  bottomPadding,
  tone = 'light'
}: MessageListProps) {
  const containerStyle: CSSProperties | undefined =
    bottomPadding ? { paddingBottom: bottomPadding } : undefined;

  // Get a random suggestion when there are no messages
  const suggestion = useMemo(() => {
    if (messages.length === 0) {
      return getRandomSuggestion();
    }
    return '';
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`relative flex ${containerClasses}`}
        style={containerStyle}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4">
          <div className="welcome-card w-full px-8 py-10 text-center">
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[inherit]"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(179, 71, 255, 0.15) 0%, transparent 60%)'
              }}
            />

            {/* Corner decorations */}
            <span className="absolute top-4 left-4 text-[var(--neon-purple)] opacity-40 text-lg">✦</span>
            <span className="absolute top-4 right-4 text-[var(--moonlight)] opacity-40 text-lg">✧</span>
            <span className="absolute bottom-4 left-4 text-[var(--text-muted)] opacity-30">♪</span>
            <span className="absolute bottom-4 right-4 text-[var(--neon-purple)] opacity-30">🎸</span>

            {/* Main content */}
            <div className="relative z-10">
              {/* Arti's signature */}
              <h1 className="arti-signature mb-2">
                arti
              </h1>

              {/* Power button */}
              <div className="text-4xl mb-4">🟣</div>

              {/* Welcome message */}
              <p className="font-handwritten text-xl text-[var(--text-bright)] mb-2">
                hey, you made it
              </p>

              <p className="font-handwritten text-[var(--text-dim)] text-lg mb-6">
                welcome to my room ✨
              </p>

              {/* Divider doodle */}
              <div className="text-[var(--text-muted)] opacity-40 text-sm mb-6">
                · · · ✦ · · ·
              </div>

              {/* Conversation starters */}
              <div className="space-y-3">
                <p className="font-handwritten text-sm text-[var(--text-dim)]">
                  we could talk about...
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {['music 🎵', 'big questions', 'feelings', 'random stuff'].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 rounded-full bg-[var(--neon-purple)]/10 border border-[var(--border-glow)] text-[var(--text-normal)] font-handwritten text-sm hover:bg-[var(--neon-purple)]/20 transition cursor-default"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time vibe */}
              <p className="mt-8 font-handwritten text-xs text-[var(--text-muted)] opacity-60">
                it's always 3am somewhere ☾
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${containerClasses}`} style={containerStyle}>
      <div className="mx-auto max-w-3xl space-y-2">
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLoading={isLoading && index === messages.length - 1}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-dim)]">
            <div className="recording-light" />
            <span className="font-handwritten">arti is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
