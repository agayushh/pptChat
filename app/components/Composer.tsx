"use client";
import React, { useState, useRef, useEffect } from "react";
import { ImagePreview } from "./ImageUpload";
import { FileUpload, FilePreview } from "./FileUpload";
import { Plus, Paperclip, SendHorizontal, CircleDashed, Mic, Headphones } from 'lucide-react';


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
    <div className="flex-shrink-0 bg-[#212121] pb-8 pt-4">
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Image previews */}
        {selectedImages.length > 0 && (
          <div className="mb-4 p-4 bg-[#2a2a2a] rounded-2xl">
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

        <div className="relative bg-[#40414f] rounded-full shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3 px-4 py-2">
            
          <button 
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-[#acacbe] hover:text-white transition-colors rounded-full hover:bg-[#565869]"
              title="Add files"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>


            {/* Image upload button (hidden input) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none bg-transparent text-[#ececf1] placeholder-[#8e8ea0] border-none outline-none min-h-[24px] max-h-[200px] leading-6 text-base"
              placeholder="Ask anything"
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
              className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 ${
                (value.trim() || selectedImages.length > 0) && !sending
                  ? "bg-white text-black hover:bg-[#d9d9e3]"
                  : "bg-[#676767] text-[#343541] cursor-not-allowed"
              }`}
              title="Send message"
            >
              {sending ? (
                <div className="animate-spin">
                 <CircleDashed size={20}/>
                </div>
              ) : (
                <SendHorizontal size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
