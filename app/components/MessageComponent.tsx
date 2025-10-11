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
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (message.isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message.isEditing]);

  // Update edit content when message changes
  useEffect(() => {
    if (!message.isEditing) {
      setEditContent(message.content);
    }
  }, [message.content, message.isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    const trimmedContent = editContent.trim();
    
    if (!trimmedContent) {
      // Don't allow empty messages
      return;
    }
    
    if (trimmedContent !== message.content) {
      // Show confirmation if content changed
      setShowConfirm(true);
    } else {
      // No change, just exit edit mode
      onToggleEdit(message.id);
    }
  };

  const handleConfirmEdit = () => {
    onEdit(message.id, editContent.trim());
    onRegenerate(message.id);
    setShowConfirm(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.originalContent || message.content);
    onToggleEdit(message.id);
    setShowConfirm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      if (showConfirm) {
        setShowConfirm(false);
      } else {
        handleCancelEdit();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className={`group relative flex gap-4 p-6 ${
      message.role === "assistant" ? "bg-[#2f2f2f]" : "bg-transparent"
    } ${message.isEditing ? "ring-2 ring-[#10a37f] ring-opacity-50" : ""} transition-all duration-200`}>
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
        <div className="flex items-center gap-2 mb-2">
          <div className="font-semibold text-sm capitalize text-[#ececf1]">
            {message.role === "assistant" ? "ChatGPT" : "You"}
          </div>
          {message.originalContent && !message.isEditing && (
            <span className="text-xs text-[#8e8ea0] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
              Edited
            </span>
          )}
        </div>
        
        {message.isEditing ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-[#40414f] border border-[#565869] rounded-lg px-3 py-2 text-[#ececf1] resize-none focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent min-h-[80px]"
                placeholder="Enter your message..."
                disabled={showConfirm}
              />
              {/* Character count */}
              <div className="absolute bottom-2 right-2 text-xs text-[#8e8ea0]">
                {editContent.length} chars
              </div>
            </div>
            
            {/* Display original images if any */}
            {message.images && message.images.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#8e8ea0] bg-[#2a2a2a] rounded-lg p-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>{message.images.length} image{message.images.length > 1 ? 's' : ''} attached</span>
              </div>
            )}
            
            {showConfirm ? (
              <div className="bg-[#2a2a2a] border border-[#565869] rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2 text-[#ececf1]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5 text-yellow-500">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <div className="font-medium mb-1">Regenerate response?</div>
                    <div className="text-sm text-[#8e8ea0]">
                      This will update your message and regenerate all responses after it.
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmEdit}
                    className="flex-1 px-3 py-2 bg-[#10a37f] text-white rounded-md text-sm font-medium hover:bg-[#0e906e] transition-colors"
                  >
                    Confirm & Regenerate
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-3 py-2 border border-[#565869] text-[#ececf1] rounded-md text-sm font-medium hover:bg-[#40414f] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="px-3 py-1.5 bg-[#10a37f] text-white rounded-md text-sm font-medium hover:bg-[#0e906e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save & Submit
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 border border-[#565869] text-[#ececf1] rounded-md text-sm font-medium hover:bg-[#40414f] transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cancel
                </button>
                <div className="flex-1"></div>
                <div className="text-xs text-[#8e8ea0] flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-[#2a2a2a] border border-[#565869] rounded text-xs">Enter</kbd>
                  <span>to save</span>
                  <kbd className="px-1.5 py-0.5 bg-[#2a2a2a] border border-[#565869] rounded text-xs">Esc</kbd>
                  <span>to cancel</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-[#ececf1] leading-7">
            {/* Show loading indicator if content is empty (streaming) */}
            {!message.content && message.role === "assistant" ? (
              <div className="flex items-center gap-2 text-[#8e8ea0] py-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Thinking...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {/* {message.content} */}
                <Markdown>{message.content}</Markdown>
              </div>
            )}
            
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
            
            {/* Display files if present */}
            {message.files && message.files.length > 0 && (
              <div className="mt-4 space-y-2 not-prose">
                {message.files.map((file, index) => {
                  const getFileIcon = (type: string) => {
                    if (type.includes('pdf')) return '📄';
                    if (type.includes('word') || type.includes('document')) return '📝';
                    if (type.includes('csv') || type.includes('excel') || type.includes('sheet')) return '📊';
                    if (type.includes('text')) return '📃';
                    if (type.includes('json')) return '🔧';
                    if (type.includes('markdown')) return '📋';
                    return '📁';
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-[#2a2a2a] border border-[#424242] rounded-lg hover:border-[#565656] transition-colors"
                    >
                      <div className="text-2xl">{getFileIcon(file.type)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-[#ececf1] truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-[#8e8ea0]">
                          {(file.originalSize / 1024 / 1024).toFixed(1)}MB
                          {' • '}
                          {file.contentLength.toLocaleString()} characters
                        </div>
                      </div>
                      
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!message.isEditing && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-md transition-colors ${
                copied 
                  ? 'text-[#10a37f] bg-[#10a37f]/10' 
                  : 'text-[#8e8ea0] hover:text-[#ececf1] hover:bg-[#40414f]'
              }`}
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                  <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              )}
            </button>
            
            {message.role === "user" && (
              <button
                onClick={() => onToggleEdit(message.id)}
                className="p-1.5 text-[#8e8ea0] hover:text-[#ececf1] hover:bg-[#40414f] rounded-md transition-colors"
                title="Edit message and regenerate response"
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
                title="Regenerate this response"
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
