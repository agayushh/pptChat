"use client";
import React, { useState, useRef, useEffect } from "react";
import { ImagePreview } from "./ImageUpload";
import { FileUpload, FilePreview } from "./FileUpload";

type Props = {
  onSend: (
    content: string,
    images?: File[],
    files?: ProcessedFile[]
  ) => Promise<void> | void;
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
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [value]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    setValue("");
    setSelectedImages([]);
    setSelectedFiles([]);
    setShowFileUpload(false);
    try {
      await onSend(
        value.trim(),
        selectedImages.length > 0 ? selectedImages : undefined,
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      // console.log(value);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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

        <div className="relative bg-[#40414f] rounded-[26px] shadow-lg border border-[#565869] hover:border-[#8e8ea0] focus-within:border-[#565869] transition-all duration-200">
          <div className="flex items-center gap-3 px-5 py-4">
            {/* Plus button */}
            <div className="flex-shrink-0">
              <button
                className="w-10 h-10 flex items-center justify-center text-[#acacbe] hover:text-white transition-colors rounded-lg hover:bg-[#565869]"
                title="Add"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Tools button */}
            <div className="flex-shrink-0">
              <button
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#acacbe] hover:text-white transition-colors rounded-lg hover:bg-[#565869]"
                title="Tools"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
                </svg>
                <span className="text-sm font-medium">Tools</span>
              </button>
            </div>

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
              className="flex-1 resize-none bg-transparent text-[#ececf1] placeholder-[#8e8ea0] border-none outline-none min-h-[32px] max-h-[200px] leading-7 text-base py-2 text-center"
              placeholder="Ask anything"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || sending}
              rows={1}
            />

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Microphone button */}
              <button
                className="w-10 h-10 flex items-center justify-center text-[#acacbe] hover:text-white transition-colors rounded-lg hover:bg-[#565869]"
                title="Voice input"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </button>

              {/* Voice mode button */}
              <button
                className="w-10 h-10 flex items-center justify-center text-[#acacbe] hover:text-white transition-colors rounded-lg hover:bg-[#565869]"
                title="Voice mode"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M2 12l10 10M22 12l-10 10" />
                </svg>
              </button>

              {/* Send button */}
              <button
                onClick={submit}
                disabled={
                  disabled ||
                  sending ||
                  (!value.trim() && selectedImages.length === 0)
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  (value.trim() || selectedImages.length > 0) && !sending
                    ? "bg-white text-black hover:bg-[#d9d9e3]"
                    : "bg-[#676767] text-[#343541] cursor-not-allowed"
                }`}
                title="Send message"
              >
                {sending ? (
                  <div className="animate-spin">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 7-7 7 7M12 5v14" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
