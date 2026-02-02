import AttachmentPreviewList from '@/components/AttachmentPreviewList';
import BlockGroup from '@/components/BlockGroup';
import Markdown from '@/components/Markdown';
import type { ContentBlock, Message as MessageType } from '@/types/chat';

// Import Arti's avatar
import artiAvatar from '../assets/arti-avatar.png';

interface MessageProps {
  message: MessageType;
  isLoading?: boolean;
}

// Random rotation for that "scattered on desk" feel
function getRandomRotation(seed: string): string {
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const rotation = ((hash % 5) - 2) * 0.3; // -0.6 to 0.6 degrees
  return `rotate(${rotation}deg)`;
}

// Random decorations for Arti's messages
const doodles = ['✦', '♪', '✧', '·', '˚'];
function getRandomDoodle(seed: string): string {
  const hash = seed.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return doodles[Math.abs(hash) % doodles.length];
}

// Arti's avatar component
function ArtiAvatar() {
  return (
    <div className="flex-shrink-0 self-start mt-1">
      <div
        className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--neon-purple)] shadow-[0_0_15px_var(--neon-glow)]"
        style={{
          background: 'var(--bg-surface)'
        }}
      >
        <img
          src={artiAvatar}
          alt="Arti"
          className="w-full h-full object-cover object-top"
          style={{
            objectPosition: '50% 15%' // Focus on the face/head area
          }}
        />
      </div>
    </div>
  );
}

export default function Message({ message, isLoading = false }: MessageProps) {
  if (message.role === 'user') {
    const userContent = typeof message.content === 'string' ? message.content : '';
    const hasText = userContent.trim().length > 0;
    const hasAttachments = Boolean(message.attachments?.length);
    const attachmentItems =
      message.attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        size: attachment.size,
        isImage: attachment.isImage ?? attachment.mimeType.startsWith('image/'),
        previewUrl: attachment.previewUrl,
        footnoteLines: [attachment.relativePath ?? attachment.savedPath].filter(
          (line): line is string => Boolean(line)
        )
      })) ?? [];

    const rotation = getRandomRotation(message.id);

    return (
      <div className="flex justify-end px-2 py-1">
        <article
          className="chat-bubble-user relative max-w-[80%] px-5 py-4"
          style={{ transform: rotation }}
        >
          {/* Subtle paper texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'linear-gradient(var(--paper-user-lines) 1px, transparent 1px)',
              backgroundSize: '100% 28px',
              backgroundPosition: '0 20px'
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            {hasText && (
              <div className="prose prose-base max-w-none text-[#2a2035] font-readable">
                <Markdown>{userContent}</Markdown>
              </div>
            )}
            {hasAttachments && (
              <div className={hasText ? 'mt-2' : ''}>
                <AttachmentPreviewList attachments={attachmentItems} />
              </div>
            )}
          </div>

          {/* Little doodle in corner */}
          <span className="absolute -top-1 -right-1 text-[var(--neon-purple)] opacity-40 text-xs">
            {getRandomDoodle(message.id + 'corner')}
          </span>
        </article>
      </div>
    );
  }

  // Assistant message (Arti) - purple glow paper with avatar
  if (typeof message.content === 'string') {
    return (
      <div className="flex justify-start items-start gap-3 py-1 px-2">
        <ArtiAvatar />
        <article className="chat-bubble-arti flex-1 max-w-none px-5 py-4">
          {/* Ambient glow effect */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit]"
            style={{
              background: 'radial-gradient(ellipse at 20% 20%, rgba(179, 71, 255, 0.08) 0%, transparent 50%)'
            }}
          />

          <div className="relative z-10 prose prose-base max-w-none text-[var(--text-bright)] leading-relaxed font-handwritten text-xl">
            <Markdown>{message.content}</Markdown>
          </div>

          {/* Doodle decoration */}
          <span className="absolute -bottom-1 -left-1 text-[var(--neon-purple)] opacity-30 text-sm">
            {getRandomDoodle(message.id)}
          </span>
        </article>
      </div>
    );
  }

  // Group consecutive thinking/tool blocks together
  const groupedBlocks: (ContentBlock | ContentBlock[])[] = [];
  let currentGroup: ContentBlock[] = [];

  for (const block of message.content) {
    if (block.type === 'text') {
      // If we have a group, add it before the text block
      if (currentGroup.length > 0) {
        groupedBlocks.push([...currentGroup]);
        currentGroup = [];
      }
      groupedBlocks.push(block);
    } else if (block.type === 'thinking' || block.type === 'tool_use') {
      // Add to current group
      currentGroup.push(block);
    }
  }

  // Add any remaining group
  if (currentGroup.length > 0) {
    groupedBlocks.push(currentGroup);
  }

  // Determine which BlockGroup is the latest active section
  // Find the last BlockGroup index
  const lastBlockGroupIndex = groupedBlocks.findLastIndex((item) => Array.isArray(item));

  // Check if there are any incomplete blocks (still streaming)
  const hasIncompleteBlocks = message.content.some((block) => {
    if (block.type === 'thinking') {
      return !block.isComplete;
    }
    if (block.type === 'tool_use') {
      // Tool is incomplete if it doesn't have a result yet
      return !block.tool?.result;
    }
    return false;
  });

  const isStreaming = isLoading && hasIncompleteBlocks;

  return (
    <div className="flex justify-start items-start gap-3 py-1 px-2">
      <ArtiAvatar />
      <article className="chat-bubble-arti flex-1 max-w-none px-5 py-4">
        {/* Ambient glow effect */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background: 'radial-gradient(ellipse at 20% 20%, rgba(179, 71, 255, 0.08) 0%, transparent 50%)'
          }}
        />

        <div className="relative z-10 space-y-3">
          {groupedBlocks.map((item, index) => {
            // Single text block
            if (!Array.isArray(item)) {
              if (item.type === 'text' && item.text) {
                return (
                  <div
                    key={index}
                    className="prose prose-base max-w-none text-[var(--text-bright)] leading-relaxed"
                  >
                    <Markdown>{item.text}</Markdown>
                  </div>
                );
              }
              return null;
            }

            // Group of thinking/tool blocks
            const isLatestActiveSection = index === lastBlockGroupIndex;
            const hasTextAfter =
              index < groupedBlocks.length - 1 &&
              groupedBlocks
                .slice(index + 1)
                .some((nextItem) => !Array.isArray(nextItem) && nextItem.type === 'text');

            return (
              <BlockGroup
                key={`group-${index}`}
                blocks={item}
                isLatestActiveSection={isLatestActiveSection}
                isStreaming={isStreaming}
                hasTextAfter={hasTextAfter}
              />
            );
          })}
        </div>

        {/* Doodle decoration */}
        <span className="absolute -bottom-1 -left-1 text-[var(--neon-purple)] opacity-30 text-sm">
          {getRandomDoodle(message.id)}
        </span>
      </article>
    </div>
  );
}
