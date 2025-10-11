"use client";

import React, { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs'
import Sidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import Composer from "../components/Composer";
import MemoryPanel from "../components/MemoryPanel";
import useChats from "../lib/hooks/useChat";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoaded } = useUser()
  
  const {
    chats,
    activeChatId,
    getActiveChat,
    setActiveChatId,
    newChat,
    deleteChat,
    renameChat,
    sendMessage,
    editMessage,
    toggleEditMessage,
    regenerateFromMessage,
    isLoading: chatsLoading,
  } = useChats();

  // Sync user data when user loads
  useEffect(() => {
    if (isLoaded && user) {
      // Sync user with backend
      fetch('/api/user/sync', {
        method: 'POST',
      }).catch(console.error);
    }
  }, [isLoaded, user]);

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async (content: string, images?: File[]) => {
    if (!activeChatId) return;
    await sendMessage(activeChatId, content, images);
  };

  // Show loading spinner while user data is loading
  if (!isLoaded || chatsLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#212121]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10a37f]"></div>
          <div className="text-[#8e8ea0] text-sm">
            {!isLoaded ? "Loading user..." : "Loading chats..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-[#212121] text-white overflow-hidden">
      {/* Sidebar with toggle */}
      <div className={`${sidebarOpen ? 'w-[260px]' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNew={() => newChat()}
          onSelect={(id) => setActiveChatId(id)}
          onDelete={(id) => deleteChat(id)}
          onRename={(id, title) => renameChat(id, title)}
          isOpen={sidebarOpen}
          user={user}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        <ChatWindow 
          chat={getActiveChat} 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onEditMessage={(messageId, newContent) => {
            if (activeChatId) {
              editMessage(activeChatId, messageId, newContent);
            }
          }}
          onToggleEditMessage={(messageId) => {
            if (activeChatId) {
              toggleEditMessage(activeChatId, messageId);
            }
          }}
          onRegenerateFromMessage={(messageId) => {
            if (activeChatId) {
              regenerateFromMessage(activeChatId, messageId);
            }
          }}
        />
                <Composer onSend={handleSend} />
      </div>
      
      {/* Memory Panel */}
      <MemoryPanel />
    </div>
  );
}
