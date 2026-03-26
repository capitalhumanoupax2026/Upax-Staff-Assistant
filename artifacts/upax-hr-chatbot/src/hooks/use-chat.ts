import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetChatHistory, 
  useSendChatMessage,
  getGetChatHistoryQueryKey
} from "@workspace/api-client-react";
import type { ChatMessage } from "@workspace/api-client-react";

export function useChat() {
  const queryClient = useQueryClient();
  // We use local state to append messages optimistically before re-fetching
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const { data: history, isLoading: isHistoryLoading } = useGetChatHistory({
    query: {
      staleTime: 1000 * 60 * 5, // 5 mins
      // Sync local state when history loads
      meta: {
        onSuccess: (data: any) => {
          if (data?.messages) {
             setLocalMessages(data.messages);
          }
        }
      }
    }
  });

  const sendMutation = useSendChatMessage({
    mutation: {
      onMutate: async (newMsg) => {
        // Optimistic update for the user message
        const optimisticUserMsg: ChatMessage = {
          id: Date.now(),
          role: 'user',
          content: newMsg.data.message,
          timestamp: new Date().toISOString(),
          category: newMsg.data.category
        };
        
        setLocalMessages(prev => [...prev, optimisticUserMsg]);
        return { optimisticUserMsg };
      },
      onSuccess: (data) => {
        // Replace optimistic user msg and append bot response
        setLocalMessages(prev => {
          // Remove the optimistic one (usually last)
          const filtered = prev.filter(m => m.id !== prev[prev.length - 1]?.id || m.role !== 'user');
          return [...filtered, data.message, data.response];
        });
        
        // Invalidate to keep server state fresh in background
        queryClient.invalidateQueries({ queryKey: getGetChatHistoryQueryKey() });
      },
      onError: () => {
        // Revert on error
        queryClient.invalidateQueries({ queryKey: getGetChatHistoryQueryKey() });
      }
    }
  });

  // Merge history with local if history just loaded
  const displayMessages = localMessages.length > 0 
    ? localMessages 
    : (history?.messages || []);

  return {
    messages: displayMessages,
    isLoadingHistory: isHistoryLoading,
    isSending: sendMutation.isPending,
    sendMessage: (content: string, category?: string) => {
      sendMutation.mutate({ data: { message: content, category } });
    }
  };
}
