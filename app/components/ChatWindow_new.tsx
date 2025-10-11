"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import type { Chat, Message } from "../lib/hooks/useChat";

type Props = {
  chat: Chat | null;
};

export default function ChatWindow({ chat }: Props) {
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#212121] text-white">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-semibold mb-6">What are you working on?</h1>
          <div className="text-[#8e8ea0] text-sm">
            Select a chat from the sidebar or start a new conversation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#212121] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-center p-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-white">ChatGPT</h2>
          <span className="text-xs bg-[#10a37f] text-white px-2 py-1 rounded">4o</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" id="messages">
        {chat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <h1 className="text-3xl font-semibold text-white mb-6">What are you working on?</h1>
              <div className="text-[#8e8ea0] text-sm">
                Ask anything to get started
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {chat.messages.map((m: Message) => (
                <div key={m.id} className="group">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {m.role === "user" ? (
                        <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center text-sm font-semibold text-white">
                          U
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#ab68ff] rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-2">
                        {m.role === "user" ? "You" : "ChatGPT"}
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-white text-[15px] leading-7">
                          {m.content === "Thinking..." ? (
                            <div className="flex items-center gap-2 text-[#8e8ea0]">
                              <div className="animate-spin">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                                  </circle>
                                </svg>
                              </div>
                              Thinking...
                            </div>
                          ) : (
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-sm">{children}</code>
                                  ) : (
                                    <pre className="bg-[#2a2a2a] p-3 rounded-lg overflow-x-auto">
                                      <code>{children}</code>
                                    </pre>
                                  );
                                },
                                ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
