"use client";
import React, { useState, useRef, useEffect } from "react";
import { ImagePreview } from "./ImageUpload";
import { FileUpload, FilePreview } from "./FileUpload";
import {
  Paperclip,
  SendHorizontal,
  CircleDashed,
  Image as ImageIcon,
  FileText,
  X,
} from "lucide-react";
import type { ProcessedFile } from "../types/files";

type Props = {
  onSend: (
    content: string,
    images?: File[],
    files?: ProcessedFile[]
  ) => Promise<void> | void;
  disabled?: boolean;
};

export default function Composer({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<ProcessedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

  // Close attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleFileUpload = (files: ProcessedFile[]) => {
    setSelectedFiles(files);
    setShowFileUpload(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  async function submit() {
    if (
      (!value.trim() &&
        selectedImages.length === 0 &&
        selectedFiles.length === 0) ||
      sending
    )
      return;
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
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
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

  const hasAttachments = selectedImages.length > 0 || selectedFiles.length > 0;

  return (
    <div className="flex-shrink-0 bg-[#212121] pb-8 pt-4">
      <div className="w-full max-w-3xl mx-auto px-4">
        {/* File Upload Modal */}
        {showFileUpload && (
          <div className="mb-4 p-4 bg-[#2a2a2a] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#f7f7f8] font-medium">
                Upload Documents
              </span>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-[#8e8ea0] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <FileUpload 
              onFilesSelected={handleFileUpload}
              maxFiles={5}
              maxSizePerFile={25 * 1024 * 1024}
            />
          </div>
        )}

        {/* Document previews */}
        {selectedFiles.length > 0 && (
          <div className="mb-4 p-4 bg-[#2a2a2a] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#f7f7f8] font-medium">
                Selected Documents ({selectedFiles.length})
              </span>
              <button
                onClick={clearAllFiles}
                disabled={disabled || sending}
                className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                Remove All
              </button>
            </div>
            <FilePreview
              files={selectedFiles}
              onRemoveFile={removeFile}
            />
          </div>
        )}

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

        <div className="relative bg-[#40414f] rounded-3xl shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3 px-4 py-2">
            {/* Attachment menu button */}
            <div className="relative" ref={attachMenuRef}>
              <button
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-[#acacbe] hover:text-white transition-colors rounded-full hover:bg-[#565869]"
                title="Attach files"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                disabled={disabled || sending}
              >
                <Paperclip size={20} />
              </button>

              {/* Attachment dropdown menu */}
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#2a2a2a] rounded-lg shadow-lg border border-[#565869] overflow-hidden z-50 min-w-[200px]">
                  <button
                    onClick={() => {
                      imageInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#ececf1] hover:bg-[#40414f] transition-colors text-left"
                  >
                    <ImageIcon size={18} className="text-blue-400" />
                    <div>
                      <div className="text-sm font-medium">Upload Images</div>
                      <div className="text-xs text-[#8e8ea0]">PNG, JPG, GIF, WebP</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowFileUpload(true);
                      setShowAttachMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#ececf1] hover:bg-[#40414f] transition-colors text-left"
                  >
                    <FileText size={18} className="text-green-400" />
                    <div>
                      <div className="text-sm font-medium">Upload Documents</div>
                      <div className="text-xs text-[#8e8ea0]">PDF, DOCX, TXT, CSV</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Image upload (hidden input) */}
            <input
              ref={imageInputRef}
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
              disabled={
                disabled ||
                sending ||
                (!value.trim() && !hasAttachments)
              }
              className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 ${
                (value.trim() || hasAttachments) && !sending
                  ? "bg-white text-black hover:bg-[#d9d9e3]"
                  : "bg-[#676767] text-[#343541] cursor-not-allowed"
              }`}
              title="Send message"
            >
              {sending ? (
                <div className="animate-spin">
                  <CircleDashed size={20} />
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
