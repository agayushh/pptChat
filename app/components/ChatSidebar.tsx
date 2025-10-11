"use client";
import React, { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string | number;
};

type Props = {
  chats: Chat[];
  activeChatId: string | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen?: boolean;
  user?: {
    imageUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    emailAddresses?: { emailAddress: string }[] | null;
  } | null;
};

export default function Sidebar({
  chats,
  activeChatId,
  onNew,
  onSelect,
  onDelete,
  onRename,
  isOpen = true,
  user,
}: Props) {
  return (
    <div className={`w-[260px] flex-shrink-0 bg-gradient-to-b from-[#171717] to-[#1a1a1a] h-full flex flex-col transition-all duration-300 ease-in-out border-r border-[#2a2a2a] ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Top Navigation */}
      <div className="flex-shrink-0 px-3 py-3 space-y-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#f7f7f8] hover:bg-gradient-to-r hover:from-[#2a2a2a] hover:to-[#2f2f2f] rounded-xl transition-all duration-200 hover:shadow-lg group"
        >
          <div className="p-1 bg-[#10a37f] rounded-lg group-hover:bg-[#0e906e] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          New chat
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#8e8ea0] hover:bg-gradient-to-r hover:from-[#2a2a2a] hover:to-[#2f2f2f] hover:text-[#f7f7f8] rounded-xl transition-all duration-200 group">
          <div className="p-1 bg-[#3a3a3a] rounded-lg group-hover:bg-[#4a4a4a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          Search chats
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#8e8ea0] hover:bg-gradient-to-r hover:from-[#2a2a2a] hover:to-[#2f2f2f] hover:text-[#f7f7f8] rounded-xl transition-all duration-200 group">
          <div className="p-1 bg-[#3a3a3a] rounded-lg group-hover:bg-[#4a4a4a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          Library
        </button>
      </div>

      {/* GPTs Section */}
      <div className="flex-shrink-0 px-3 pb-2 border-b border-[#2a2a2a]">
        <div className="px-1 py-2 text-xs text-[#6b7280] font-semibold tracking-wider uppercase">GPTs</div>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#8e8ea0] hover:bg-gradient-to-r hover:from-[#2a2a2a] hover:to-[#2f2f2f] hover:text-[#f7f7f8] rounded-xl transition-all duration-200 group">
          <div className="p-1 bg-[#3a3a3a] rounded-lg group-hover:bg-[#4a4a4a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
            </svg>
          </div>
          Explore GPTs
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="px-1 py-2 text-xs text-[#6b7280] font-semibold tracking-wider uppercase">Recent Chats</div>
        {chats.map((c) => (
          <ChatListItem
            key={c.id}
            chat={c}
            active={c.id === activeChatId}
            onSelect={() => onSelect(c.id)}
            onDelete={() => onDelete(c.id)}
            onRename={(title: string) => onRename(c.id, title)}
          />
        ))}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="flex-shrink-0 p-3 border-t border-[#2a2a2a] bg-gradient-to-r from-[#1a1a1a] to-[#1f1f1f] mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 text-sm hover:bg-gradient-to-r hover:from-[#2a2a2a] hover:to-[#2f2f2f] rounded-xl transition-all duration-200 group">
            <div className="relative">
              <Image 
                src={user.imageUrl || '/default-avatar.png'} 
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full ring-2 ring-[#3a3a3a] group-hover:ring-[#10a37f] transition-all duration-200 object-cover"
                unoptimized
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10a37f] rounded-full border-2 border-[#171717]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#f7f7f8] truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-[#8e8ea0] truncate">
                {user.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
            <SignOutButton>
              <button 
                className="p-2 text-[#8e8ea0] hover:text-[#f7f7f8] hover:bg-[#3a3a3a] rounded-lg transition-all duration-200 hover:shadow-lg"
                title="Sign out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}

type ChatListItemProps = {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
};

function ChatListItem({
  chat,
  active,
  onSelect,
  onDelete,
  onRename,
}: ChatListItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-pointer transition-colors ${
        active 
          ? "bg-[#2a2a2a] text-[#f7f7f8]" 
          : "text-[#8e8ea0] hover:bg-[#2a2a2a] hover:text-[#f7f7f8]"
      }`}
    >
      {/* Chat Icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-white/60">
        <path 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>

      {/* Chat Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            className="w-full bg-transparent border-none outline-none text-sm text-[#f7f7f8] font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setEditing(false);
              onRename(title);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTitle(chat.title);
                setEditing(false);
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm font-medium truncate">{chat.title || "New chat"}</div>
        )}
      </div>

      {/* Action Buttons */}
      {(showActions || active) && !editing && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1 rounded hover:bg-[#3a3a3a] transition-colors"
            title="Rename"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path 
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this chat?")) onDelete();
            }}
            className="p-1 rounded hover:bg-red-500/20 transition-colors text-red-400"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path 
                d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
