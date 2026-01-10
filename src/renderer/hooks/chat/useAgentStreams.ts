import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import type { Message } from '@/types/chat';
import { useMessageStream } from './useMessageStream';
import { useThinkingStream } from './useThinkingStream';
import { useToolStream } from './useToolStream';

interface UseAgentStreamsProps {
  appId: string;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isStreamingRef: MutableRefObject<boolean>;
  debugMessagesRef: MutableRefObject<string[]>;
}

// Subscribes to agent streaming events (messages, thinking, tool use/results, debug) and updates chat state.
export function useAgentStreams({
  appId,
  setMessages,
  setIsLoading,
  isStreamingRef,
  debugMessagesRef
}: UseAgentStreamsProps) {
  useMessageStream({ appId, setMessages, setIsLoading, isStreamingRef, debugMessagesRef });
  useThinkingStream({ appId, setMessages, isStreamingRef, debugMessagesRef });
  useToolStream({ appId, setMessages, isStreamingRef, debugMessagesRef });
}
