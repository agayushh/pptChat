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
  const [isMobile, setIsMobile] = useState(false);
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

  function handleToggleSidebar() {
    setSidebarOpen(prev => {
      localStorage.setItem('sidebarOpen', (!prev).toString());
      return !prev;
    });
  }

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, restore saved preference; on mobile, default to closed
      if (!mobile) {
        const savedSidebarOpen = localStorage.getItem('sidebarOpen');
        setSidebarOpen(savedSidebarOpen !== 'false');
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const savedSidebarOpen = localStorage.getItem('sidebarOpen');
    if (savedSidebarOpen) {
      setSidebarOpen(savedSidebarOpen === 'true');
    }
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        handleToggleSidebar();
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
      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNew={() => {
          newChat();
          if (isMobile) setSidebarOpen(false);
        }}
        onSelect={(id) => {
          setActiveChatId(id);
          if (isMobile) setSidebarOpen(false);
        }}
        onDelete={(id) => deleteChat(id)}
        onRename={(id, title) => renameChat(id, title)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatWindow 
          chat={getActiveChat} 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
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
