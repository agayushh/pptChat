"use client";
import React, { useState, useRef, useEffect } from "react";
import { ImagePreview } from "./ImageUpload";
import { FileUpload, FilePreview } from "./FileUpload";

type Props = {
  onSend: (content: string, images?: File[], files?: ProcessedFile[]) => Promise<void> | void;
  disabled?: boolean;
};

interface ProcessedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  contentLength: number;
  originalSize: number;
  lastModified?: number;
  [key: string]: any;
}



export default function Composer({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  async function submit() {
    if ((!value.trim() && selectedImages.length === 0 && selectedFiles.length === 0) || sending) return;
    setSending(true);
    try {
      await onSend(
        value.trim(), 
        selectedImages.length > 0 ? selectedImages : undefined,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      setValue("");
      setSelectedImages([]);
      setSelectedFiles([]);
      setShowFileUpload(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setSending(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex-shrink-0 bg-gradient-to-t from-[#212121] via-[#1f1f1f] to-[#1a1a1a] p-6 border-t border-[#2a2a2a]">
      <div className="w-full max-w-4xl mx-auto">
        {/* Image previews */}
        {selectedImages.length > 0 && (
          <div className="mb-4 p-4 bg-[#2a2a2a] rounded-2xl border border-[#424242]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#f7f7f8] font-medium">
                Selected Images ({selectedImages.length})
              </span>
              <button
                onClick={clearAllImages}
                disabled={disabled || sending}
                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Remove All
              </button>
            </div>
            <ImagePreview 
              images={selectedImages} 
              onRemoveImage={removeImage}
              className="gap-3"
            />
          </div>
        )}

        <div className="relative bg-gradient-to-r from-[#2f2f2f] to-[#323232] rounded-3xl border border-[#424242] focus-within:border-[#10a37f] focus-within:shadow-lg focus-within:shadow-[#10a37f]/20 transition-all duration-300 shadow-2xl">
          <div className="flex items-end gap-4 px-6 py-4">
            {/* Image upload button */}
            <div className="flex-shrink-0 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || sending}
                className="w-10 h-10 flex items-center justify-center text-[#8e8ea0] hover:text-white transition-all duration-200 rounded-xl hover:bg-gradient-to-r hover:from-[#404040] hover:to-[#454545] group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:scale-110 transition-transform">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none bg-transparent text-[#f7f7f8] placeholder-[#8e8ea0] border-none outline-none min-h-[28px] max-h-[200px] leading-7 font-normal text-base"
              placeholder="Message ChatGPT..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || sending}
              rows={1}
            />

            {/* Send button */}
            <button
              onClick={submit}
              disabled={disabled || sending || (!value.trim() && selectedImages.length === 0)}
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                (value.trim() || selectedImages.length > 0) && !sending
                  ? "bg-gradient-to-r from-[#10a37f] to-[#0e906e] text-white hover:from-[#0e906e] hover:to-[#0c7d5c] hover:shadow-xl hover:scale-105 active:scale-95"
                  : "bg-[#424242] text-[#8e8ea0] cursor-not-allowed"
              }`}
            >
              {sending ? (
                <div className="animate-spin">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="18.85" strokeDashoffset="18.85">
                      <animate attributeName="stroke-dasharray" dur="1.5s" values="0 18.85;9.425 9.425;0 18.85" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="1.5s" values="0;-9.425;-18.85" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                </div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="m5 12 7-7 7 7M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            {/* Microphone button */}
            <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#8e8ea0] hover:text-white transition-colors rounded-lg hover:bg-[#3f3f3f]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center text-xs text-[#8e8ea0] mt-2">
          ChatGPT can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
}
