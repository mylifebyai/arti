import { useRef, useState, type Dispatch, type SetStateAction } from 'react';

import type { Message } from '@/types/chat';

import { useAgentStreams } from './chat/useAgentStreams';

export function useClaudeChat(appId = 'chat'): {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
} {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isStreamingRef = useRef(false);
  const debugMessagesRef = useRef<string[]>([]);

  useAgentStreams({
    appId,
    setMessages,
    setIsLoading,
    isStreamingRef,
    debugMessagesRef
  });

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading
  };
}
