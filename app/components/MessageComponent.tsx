"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/app/lib/hooks/useChat";
import Markdown from "react-markdown";

interface MessageComponentProps {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
  onToggleEdit: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  isLast: boolean;
}

export default function MessageComponent({
  message,
  onEdit,
  onToggleEdit,
  onRegenerate,
  isLast,
}: MessageComponentProps) {
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (message.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [message.isEditing]);

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
      onRegenerate(message.id);
    } else {
      onToggleEdit(message.id);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.originalContent || message.content);
    onToggleEdit(message.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={`group relative flex gap-4 p-6 ${
      message.role === "assistant" ? "bg-[#2f2f2f]" : "bg-transparent"
    }`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.role === "assistant" 
          ? "bg-[#10a37f] text-white" 
          : "bg-[#5436da] text-white"
      }`}>
        {message.role === "assistant" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997L9.4041 13.5V10.4976z"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-2 capitalize text-[#ececf1]">
          {message.role === "assistant" ? "ChatGPT" : "You"}
        </div>
        
        {message.isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#40414f] border border-[#565869] rounded-lg px-3 py-2 text-[#ececf1] resize-none focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent"
              rows={Math.max(3, editContent.split('\n').length)}
              placeholder="Enter your message..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-[#10a37f] text-white rounded-md text-sm font-medium hover:bg-[#0e906e] transition-colors"
              >
                Save & Submit
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 border border-[#565869] text-[#ececf1] rounded-md text-sm font-medium hover:bg-[#40414f] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-[#ececf1] leading-7">
            <div className="whitespace-pre-wrap break-words">
              {/* {message.content} */}
              <Markdown>{message.content}</Markdown>
            </div>
            
            {/* Display images if present */}
            {message.images && message.images.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 not-prose">
                {message.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden bg-[#2a2a2a] border border-[#424242] hover:border-[#565656] transition-colors"
                  >
                    <img
                      src={`data:${image.mimeType};base64,${image.base64}`}
                      alt={image.name}
                      className="w-full h-auto max-h-64 object-cover cursor-pointer"
                      onClick={() => {
                        // Open image in new tab for full view
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head><title>${image.name}</title></head>
                              <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#000;">
                                <img src="data:${image.mimeType};base64,${image.base64}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                              </body>
                            </html>
                          `);
                        }
                      }}
                    />
                    
                    {/* Image info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-xs">
                        <div className="truncate font-medium">{image.name}</div>
                        <div className="text-gray-300">
                          {image.width && image.height && `${image.width} × ${image.height}`}
                          {image.size && ` • ${(image.size / 1024 / 1024).toFixed(1)}MB`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!message.isEditing && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="p-1.5 text-[#8e8ea0] hover:text-[#ececf1] hover:bg-[#40414f] rounded-md transition-colors"
              title="Copy message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
            
            {message.role === "user" && (
              <button
                onClick={() => onToggleEdit(message.id)}
                className="p-1.5 text-[#8e8ea0] hover:text-[#ececf1] hover:bg-[#40414f] rounded-md transition-colors"
                title="Edit message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            
            {message.role === "assistant" && isLast && (
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1.5 text-[#8e8ea0] hover:text-[#ececf1] hover:bg-[#40414f] rounded-md transition-colors"
                title="Regenerate response"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
