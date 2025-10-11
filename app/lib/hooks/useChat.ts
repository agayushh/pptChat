"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { uid } from "@/app/utils/id";
import { getContextInfo, type ModelType } from "@/app/lib/contextWindow";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isEditing?: boolean;
  originalContent?: string;
  images?: ProcessedImage[];
};

interface ProcessedImage {
  name: string;
  size: number;
  originalSize: number;
  mimeType: string;
  base64: string;
  width?: number;
  height?: number;
  format?: string;
}

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

// Helper function to generate chat title from first message
const generateChatTitle = (content: string): string => {
  const words = content.split(' ').slice(0, 5);
  return words.join(' ') + (content.split(' ').length > 5 ? '...' : '');
};

export default function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { user, isLoaded } = useUser();

  // Load chats from backend when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      loadChatsFromBackend();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [isLoaded, user]);

  const loadChatsFromBackend = async () => {
    try {
      const response = await fetch('/api/user/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
        if (data.chats && data.chats.length > 0) {
          setActiveChatId(data.chats[0].id);
        }
      } else {
        // If backend fails, start with empty chats
        console.warn("Failed to load chats from backend, starting fresh");
        setChats([]);
      }
    } catch (error) {
      console.error("Failed to load chats from backend:", error);
      // Fallback to empty state on error
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChatsToBackend = useCallback(async (updatedChats: Chat[]) => {
    if (!user) return;
    
    try {
      await fetch('/api/user/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chats: updatedChats }),
      });
    } catch (error) {
      console.error("Failed to save chats to backend:", error);
    }
  }, [user]);

  // Auto-save chats to backend when they change
  useEffect(() => {
    if (chats.length > 0 && !isLoading && user) {
      saveChatsToBackend(chats);
    }
  }, [chats, isLoading, user, saveChatsToBackend]);

  const newChat = useCallback(() => {
    const c: Chat = {
      id: uid(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChats((prev) => [c, ...prev]);
    setActiveChatId(c.id);
    return c.id;
  }, []);
  const deleteChat = useCallback(
    (id: string) => {
      //remove chat with id
      setChats((prev) => prev.filter((c) => c.id !== id));
      //if active chat is deleted, set active chat to first chat
      setActiveChatId((curr) => (curr === id ? chats[0]?.id ?? null : curr));
    },
    [chats]
  );
  const renameChat = useCallback((id: string, title: string) => {
    setChats((s) =>
      s.map((c) =>
        c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const editMessage = useCallback((chatId: string, messageId: string, newContent: string) => {
    setChats((s) =>
      s.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content: newContent, isEditing: false } : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  const toggleEditMessage = useCallback((chatId: string, messageId: string) => {
    setChats((s) =>
      s.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      isEditing: !m.isEditing,
                      originalContent: m.isEditing ? m.originalContent : m.content,
                    }
                  : m
              ),
            }
          : c
      )
    );
  }, []);

  // Placeholder for regenerateFromMessage - will be defined after sendMessage
  const addMessage = useCallback(
    (chatId: string, role: Message["role"], content: string, images?: ProcessedImage[]) => {
      const m: Message = {
        id: uid(),
        role,
        content,
        createdAt: new Date().toISOString(),
        ...(images && images.length > 0 && { images }),
      };
      setChats((s) =>
        s.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [...c.messages, m],
                updatedAt: new Date().toISOString(),
                title: c.messages.length === 0 && role === 'user' ? generateChatTitle(content) : c.title,
              }
            : c
        )
      );
      return m;
    },
    []
  );

  const sendMessage = useCallback(
    async (chatId: string, content: string, images?: File[], model: ModelType = 'gemini-2.5-flash') => {
      if (!content.trim() && (!images || images.length === 0)) return;
      if (isChatLoading) return;

      setIsChatLoading(true);

      // Process images if provided
      let processedImages: ProcessedImage[] = [];
      if (images && images.length > 0) {
        try {
          const formData = new FormData();
          images.forEach(image => {
            formData.append('images', image);
          });

          const uploadResponse = await fetch('/api/upload/images', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload images');
          }

          const uploadResult = await uploadResponse.json();
          processedImages = uploadResult.images;
        } catch (error) {
          console.error('Image upload error:', error);
          setIsChatLoading(false);
          return;
        }
      }

      // Add user message with images
      const userMessage = addMessage(chatId, "user", content, processedImages.length > 0 ? processedImages : undefined);
      
      // Get current chat messages to send to AI
      const currentChat = chats.find(c => c.id === chatId);
      const messages = currentChat ? [...currentChat.messages, userMessage] : [userMessage];

      try {
        // Create assistant message placeholder
        const assistantMessageId = uid();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
        };

        // Add empty assistant message to show loading
        setChats((s) =>
          s.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [...c.messages, assistantMessage],
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );

        // Call AI API with user context for memory
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              ...(msg.images && { images: msg.images }),
            })),
            userId: user?.id, // Pass user ID for memory context
            model, // Pass selected model
            ...(processedImages.length > 0 && { images: processedImages }),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              // Try to parse the line directly as JSON first
              let data;
              
              if (line.startsWith('0:')) {
                // Handle Vercel AI SDK format
                const jsonStr = line.substring(2);
                data = JSON.parse(jsonStr);
              } else if (line.startsWith('data: ')) {
                // Handle SSE format
                const jsonStr = line.substring(6);
                if (jsonStr === '[DONE]') break;
                data = JSON.parse(jsonStr);
              } else {
                // Try direct JSON parse
                data = JSON.parse(line);
              }
              
              if (data && (data.content || data.text || data.delta?.content)) {
                const content = data.content || data.text || data.delta?.content;
                accumulatedContent += content;
                
                // Update the assistant message with accumulated content
                setChats((s) =>
                  s.map((c) =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map(m =>
                            m.id === assistantMessageId
                              ? { ...m, content: accumulatedContent }
                              : m
                          ),
                          updatedAt: new Date().toISOString(),
                        }
                      : c
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.log('Skipping line:', line);
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Add error message
        addMessage(chatId, "assistant", "Sorry, I encountered an error. Please try again.");
      } finally {
        setIsChatLoading(false);
      }
    },
    [chats, addMessage, isChatLoading, user?.id]
  );

  const regenerateFromMessage = useCallback(
    async (chatId: string, messageId: string) => {
      if (!user?.id) return;

      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const messageIndex = chat.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Remove all messages after the edited message
      const messagesUpToEdit = chat.messages.slice(0, messageIndex + 1);
      
      // Update chat with trimmed messages
      setChats((s) =>
        s.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: messagesUpToEdit,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      // If the edited message is from user, regenerate AI response
      const editedMessage = messagesUpToEdit[messageIndex];
      if (editedMessage.role === 'user') {
        await sendMessage(chatId, editedMessage.content);
      }
    },
    [chats, user?.id, sendMessage]
  );
  const getActiveChat = chats.find((c) => c.id === activeChatId) ?? null;

  // Get context information for a chat
  const getChatContextInfo = useCallback((chatId: string, modelType: ModelType = 'gemini-2.5-flash') => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;
    
    return getContextInfo(chat.messages, modelType);
  }, [chats]);

  return {
    chats,
    activeChatId,
    getActiveChat,
    setActiveChatId,
    newChat,
    deleteChat,
    renameChat,
    addMessage,
    sendMessage,
    editMessage,
    toggleEditMessage,
    regenerateFromMessage,
    getChatContextInfo,
    setChats,
    isLoading,
    isChatLoading,
  };
}
