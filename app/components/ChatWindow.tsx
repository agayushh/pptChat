"use client";
import React, { useEffect, useRef } from "react";
import MessageComponent from "./MessageComponent";
import type { Chat, Message } from "../lib/hooks/useChat";

type Props = {
  chat: Chat | null;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onToggleEditMessage?: (messageId: string) => void;
  onRegenerateFromMessage?: (messageId: string) => void;
};

export default function ChatWindow({ 
  chat, 
  sidebarOpen = true, 
  onToggleSidebar,
  onEditMessage,
  onToggleEditMessage,
  onRegenerateFromMessage
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chat && chat.messages.length > 0) {
      // Smooth scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages.length]);

  return (
    <div className="flex-1 flex flex-col bg-[#212121] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-3 px-4">
        {/* Left side - Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-8 h-8 text-[#8e8ea0] hover:text-[#f7f7f8] hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18"/>
          </svg>
        </button>

        {/* Center Title */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-[#f7f7f8]">ChatGPT</h2>
          <button className="flex items-center justify-center w-5 h-5 text-[#8e8ea0] hover:text-[#f7f7f8] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Right side - Edit button */}
        <button className="flex items-center justify-center w-8 h-8 text-[#8e8ea0] hover:text-[#f7f7f8] hover:bg-[#2a2a2a] rounded-lg transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto" 
        id="messages"
      >
        {!chat || chat.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-3xl w-full animate-fadeIn">
              <h1 className="text-5xl font-semibold text-[#f7f7f8] mb-12 tracking-tight">
                What can I help with?
              </h1>
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto flex flex-col">
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="w-full max-w-3xl mx-auto px-4 py-8">
                {chat.messages.map((m: Message, index) => (
                  <MessageComponent
                    key={m.id}
                    message={m}
                    onEdit={(messageId, newContent) => onEditMessage?.(messageId, newContent)}
                    onToggleEdit={(messageId) => onToggleEditMessage?.(messageId)}
                    onRegenerate={(messageId) => onRegenerateFromMessage?.(messageId)}
                    isLast={index === chat.messages.length - 1}
                  />
                ))}
                {/* Invisible element for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
