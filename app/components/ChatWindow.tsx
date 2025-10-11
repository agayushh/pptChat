"use client";
import React from "react";
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
  return (
    <div className="flex-1 flex flex-col bg-[#212121] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-3 px-4 border-b border-[#2a2a2a] border-opacity-30">
        {/* Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-8 h-8 text-[#8e8ea0] hover:text-[#f7f7f8] hover:bg-[#2a2a2a] rounded-lg transition-colors"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <path d="m9 3 6 9-6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <path d="m15 3-6 9 6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Center Title */}
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-medium text-[#f7f7f8]">ChatGPT</h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#8e8ea0]">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Placeholder for right side */}
        <div className="w-8 h-8"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" id="messages">
        {!chat ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center max-w-xl animate-fadeIn">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#10a37f] to-[#0e906e] rounded-3xl mb-6 shadow-2xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-[#f7f7f8] mb-6 tracking-tight">What can I help with?</h1>
              <p className="text-[#8e8ea0] text-lg mb-8 leading-relaxed">
                Select a chat from the sidebar or start a new conversation to begin chatting with AI
              </p>
              <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                <div className="p-4 bg-[#2a2a2a] hover:bg-[#2f2f2f] rounded-xl transition-colors cursor-pointer border border-[#3a3a3a] hover:border-[#4a4a4a]">
                  <div className="text-sm font-medium text-[#f7f7f8] mb-1">💡 Ask a question</div>
                  <div className="text-xs text-[#8e8ea0]">Get help with any topic</div>
                </div>
                <div className="p-4 bg-[#2a2a2a] hover:bg-[#2f2f2f] rounded-xl transition-colors cursor-pointer border border-[#3a3a3a] hover:border-[#4a4a4a]">
                  <div className="text-sm font-medium text-[#f7f7f8] mb-1">📝 Write something</div>
                  <div className="text-xs text-[#8e8ea0]">Create content or documentation</div>
                </div>
                <div className="p-4 bg-[#2a2a2a] hover:bg-[#2f2f2f] rounded-xl transition-colors cursor-pointer border border-[#3a3a3a] hover:border-[#4a4a4a]">
                  <div className="text-sm font-medium text-[#f7f7f8] mb-1">🔍 Analyze data</div>
                  <div className="text-xs text-[#8e8ea0]">Get insights and explanations</div>
                </div>
              </div>
            </div>
          </div>
        ) : chat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center max-w-xl animate-slideIn">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#10a37f] to-[#0e906e] rounded-2xl mb-4 shadow-lg">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#f7f7f8] mb-4 tracking-tight">Ready to chat!</h1>
              <p className="text-[#8e8ea0] text-lg leading-relaxed">
                Type your message below to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="max-w-4xl mx-auto">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
