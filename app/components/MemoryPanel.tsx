"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface Memory {
  id: string;
  text: string;
  metadata?: {
    timestamp?: string;
    category?: string;
    type?: string;
  };
}

export default function MemoryPanel() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const fetchMemories = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/memory', {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteMemory = async (memoryId: string) => {
    try {
      const response = await fetch('/api/memory', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memoryId }),
      });
      
      if (response.ok) {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      }
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchMemories();
    }
  }, [isOpen, user, fetchMemories]);

  if (!user) return null;

  return (
    <>
      {/* Memory Panel Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-[#10a37f] to-[#0e906e] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        title="Manage Memory Context"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      {/* Memory Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-[#2f2f2f] rounded-2xl border border-[#424242] w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#424242]">
              <div>
                <h2 className="text-xl font-semibold text-white">Memory Context</h2>
                <p className="text-sm text-[#8e8ea0] mt-1">
                  Manage your AI conversation memories
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#8e8ea0] hover:text-white transition-colors p-2 hover:bg-[#404040] rounded-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10a37f]"></div>
                </div>
              ) : memories.length === 0 ? (
                <div className="text-center py-8 text-[#8e8ea0]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4 opacity-50">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  <p>No memories stored yet</p>
                  <p className="text-sm mt-1">Start chatting to build your AI memory context</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memories.map((memory) => (
                    <div key={memory.id} className="bg-[#404040] rounded-xl p-4 border border-[#525252]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white text-sm leading-relaxed">{memory.text}</p>
                          {memory.metadata?.timestamp && (
                            <p className="text-[#8e8ea0] text-xs mt-2">
                              {new Date(memory.metadata.timestamp).toLocaleString()}
                            </p>
                          )}
                          {memory.metadata?.type && (
                            <span className="inline-block bg-[#10a37f] bg-opacity-20 text-[#10a37f] text-xs px-2 py-1 rounded-full mt-2">
                              {memory.metadata.type}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteMemory(memory.id)}
                          className="ml-3 text-[#8e8ea0] hover:text-red-400 transition-colors p-1 hover:bg-red-500 hover:bg-opacity-20 rounded"
                          title="Delete memory"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#424242]">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#8e8ea0]">
                  Memories help provide personalized AI responses
                </p>
                <button
                  onClick={fetchMemories}
                  disabled={isLoading}
                  className="text-[#10a37f] hover:text-[#0e906e] text-sm transition-colors disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
