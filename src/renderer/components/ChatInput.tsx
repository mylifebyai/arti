import { Loader2, Paperclip, Square } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import AttachmentPreviewList from '@/components/AttachmentPreviewList';

import { THINKING_PRESETS, type ThinkingLevel } from '../../shared/core';
import type { ChatModelPreference, ModelProvider } from '../../shared/core';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStopStreaming?: () => void;
  autoFocus?: boolean;
  onHeightChange?: (height: number) => void;
  attachments?: {
    id: string;
    file: File;
    previewUrl?: string;
    previewIsBlobUrl?: boolean;
    isImage: boolean;
  }[];
  onFilesSelected?: (files: FileList | File[]) => void;
  onRemoveAttachment?: (id: string) => void;
  canSend?: boolean;
  attachmentError?: string | null;
  modelPreference: ChatModelPreference;
  onModelPreferenceChange: (preference: ChatModelPreference) => void;
  isModelPreferenceUpdating?: boolean;
  thinkingLevel: ThinkingLevel;
  onThinkingLevelChange: (level: ThinkingLevel) => void;
  isThinkingLevelUpdating?: boolean;
  provider: ModelProvider;
  onProviderChange: (provider: ModelProvider) => void;
  isProviderUpdating?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  onStopStreaming,
  autoFocus = false,
  onHeightChange,
  attachments = [],
  onFilesSelected,
  onRemoveAttachment,
  canSend,
  attachmentError,
  modelPreference,
  onModelPreferenceChange,
  isModelPreferenceUpdating = false,
  thinkingLevel,
  onThinkingLevelChange,
  isThinkingLevelUpdating = false,
  provider,
  onProviderChange,
  isProviderUpdating = false
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MIN_TEXTAREA_HEIGHT = 44;
  const MAX_TEXTAREA_HEIGHT = 200;
  const lastReportedHeightRef = useRef<number | null>(null);
  const dragCounterRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const computedCanSend = canSend ?? Boolean(value.trim());

  const reportHeight = useCallback(
    (height: number) => {
      if (!onHeightChange) return;
      const roundedHeight = Math.round(height);
      if (lastReportedHeightRef.current === roundedHeight) return;
      lastReportedHeightRef.current = roundedHeight;
      onHeightChange(roundedHeight);
    },
    [onHeightChange]
  );

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const measuredHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${Math.max(measuredHeight, MIN_TEXTAREA_HEIGHT)}px`;
  };

  // Auto-focus when autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && computedCanSend) {
        onSend();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items);
    const fileItems = items.filter((item) => item.kind === 'file');

    if (fileItems.length > 0) {
      e.preventDefault();
      const files: File[] = [];

      for (const item of fileItems) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }

      if (files.length > 0) {
        onFilesSelected?.(files);
      }
    }
  };

  const handleInputContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only focus if clicking on the container itself, not on interactive elements
    const target = e.target as HTMLElement;
    if (target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON' && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTextareaInput = () => {
    adjustTextareaHeight();
  };

  const handleRemoveAttachmentClick = (attachmentId: string) => {
    onRemoveAttachment?.(attachmentId);
  };

  const handleAttachmentButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      onFilesSelected?.(event.target.files);
    }
    event.target.value = '';
  };

  const isFileDrag = (event: React.DragEvent) =>
    Array.from(event.dataTransfer?.types ?? []).includes('Files');

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    if (event.dataTransfer?.files?.length) {
      onFilesSelected?.(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    reportHeight(element.getBoundingClientRect().height);

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      reportHeight(entry.contentRect.height);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [reportHeight]);

  const handleModelToggle = (preference: ChatModelPreference) => {
    if (preference === modelPreference) return;
    if (isModelPreferenceUpdating) return;
    onModelPreferenceChange(preference);
  };

  const handleThinkingLevelChange = (level: ThinkingLevel) => {
    if (level === thinkingLevel) return;
    if (isThinkingLevelUpdating) return;
    onThinkingLevelChange(level);
  };

  const handleProviderToggle = (newProvider: ModelProvider) => {
    if (newProvider === provider) return;
    if (isProviderUpdating) return;
    onProviderChange(newProvider);
  };

  const [isThinkingDropdownOpen, setIsThinkingDropdownOpen] = useState(false);
  const thinkingDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        thinkingDropdownRef.current &&
        !thinkingDropdownRef.current.contains(event.target as Node)
      ) {
        setIsThinkingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="sticky inset-x-0 bottom-0 z-10 px-4 pt-6 pb-5 [-webkit-app-region:no-drag]"
    >
      <div className="mx-auto max-w-3xl">
        <div
          className={`chat-input-container p-5 pb-3 ${
            isDragActive ? 'ring-2 ring-[var(--neon-purple)]/50' : ''
          }`}
          onClick={handleInputContainerClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          {attachments.length > 0 && (
            <AttachmentPreviewList
              attachments={attachments.map((attachment) => ({
                id: attachment.id,
                name: attachment.file.name,
                size: attachment.file.size,
                isImage: attachment.isImage,
                previewUrl: attachment.previewUrl
              }))}
              onRemove={handleRemoveAttachmentClick}
              className="mb-2 px-2"
            />
          )}

          {attachmentError && (
            <p className="px-3 pb-2 text-xs text-red-400">{attachmentError}</p>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="what's on your mind? ✨"
            rows={1}
            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-[var(--text-bright)] placeholder-[var(--text-muted)] focus:outline-none font-readable text-base"
            style={{
              minHeight: `${MIN_TEXTAREA_HEIGHT}px`,
              maxHeight: `${MAX_TEXTAREA_HEIGHT}px`
            }}
            onInput={handleTextareaInput}
          />
          <div className="flex items-center justify-between gap-3 px-2 pt-2">
            {/* Left side - Attachment button + recording light when loading */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAttachmentButtonClick}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-dark)] text-[var(--text-dim)] transition hover:bg-[var(--neon-purple)]/20 hover:text-[var(--neon-purple)] focus:ring-2 focus:ring-[var(--neon-purple)]/50 focus:outline-none"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Recording light when Arti is thinking */}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="recording-light" />
                  <span className="text-xs text-[var(--text-dim)] font-handwritten">thinking...</span>
                </div>
              )}
            </div>

            {/* Right side - Send button (🟣 power button!) */}
            <button
              onClick={isLoading && onStopStreaming ? onStopStreaming : onSend}
              disabled={isLoading && onStopStreaming ? false : !computedCanSend || isLoading}
              className={`send-button flex h-11 w-11 items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                isLoading && onStopStreaming
                  ? '!bg-[var(--bg-dark)] hover:!bg-[var(--neon-purple)]/20'
                  : ''
              }`}
              title={isLoading && onStopStreaming ? 'Stop' : 'Send message'}
            >
              {isLoading ? (
                onStopStreaming ? (
                  <Square className="h-5 w-5 text-[var(--text-bright)]" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--text-bright)]" />
                )
              ) : (
                <span className="text-xl">🟣</span>
              )}
            </button>
          </div>
        </div>

        {/* Little hint text */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-2 font-handwritten opacity-60">
          press enter to send · shift+enter for new line
        </p>
      </div>
    </div>
  );
}
