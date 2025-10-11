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
    <div className={`w-[260px] flex-shrink-0 bg-[#171717] h-full flex flex-col transition-all duration-300 ease-in-out border-r border-[#2f2f2f] ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Top Navigation */}
      <div className="flex-shrink-0 px-2 py-3 space-y-1">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-transparent border border-[#4a4a4a] hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New chat
        </button>
      </div>

      {/* Chat History */}
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-[#3a3a3a] scrollbar-track-transparent hover:scrollbar-thumb-[#4a4a4a]">
        {chats.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="text-[#6b7280] text-sm mb-2">No chats yet</div>
            <div className="text-[#4a4a4a] text-xs">Start a new conversation</div>
          </div>
        ) : (
          <>
            <div className="px-2 pb-2 text-xs text-[#6b7280] font-medium">Today</div>
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
          </>
        )}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="flex-shrink-0 p-2 border-t border-[#2f2f2f] mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#2a2a2a] rounded-lg transition-all duration-200 cursor-pointer group">
            <div className="relative flex-shrink-0">
              <Image 
                src={user.imageUrl || '/default-avatar.png'} 
                alt="Profile"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
                unoptimized
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#10a37f] rounded-full border-2 border-[#171717]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-[#8e8ea0] truncate">
                {user.emailAddresses?.[0]?.emailAddress}
              </div>
            </div>
            <SignOutButton>
              <button 
                className="p-1.5 text-[#8e8ea0] hover:text-white hover:bg-[#3a3a3a] rounded-md transition-all duration-200"
                title="Sign out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <path d="M16 17l5-5-5-5"/>
                  <path d="M21 12H9"/>
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
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        active 
          ? "bg-[#2a2a2a] text-white" 
          : "text-[#acacbe] hover:bg-[#212121]"
      }`}
    >
      {/* Chat Icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-70">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>

      {/* Chat Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            className="w-full bg-[#3a3a3a] px-2 py-1 rounded border border-[#4a4a4a] outline-none text-sm text-white font-medium focus:border-[#565869]"
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
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="p-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors"
            title="Rename"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this chat?")) onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
