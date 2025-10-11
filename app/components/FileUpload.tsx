import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import type { ProcessedFile } from '../types/files';

interface FileUploadProps {
  onFilesSelected: (files: ProcessedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'text/plain',
  'text/csv',
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/json',
  'text/markdown',
  'text/rtf',
];

const FILE_TYPE_EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/json': '.json',
  'text/markdown': '.md',
  'text/rtf': '.rtf',
};

export function FileUpload({ 
  onFilesSelected, 
  maxFiles = 5, 
  maxSizePerFile = 25 * 1024 * 1024, // 25MB default
  className = '',
  disabled = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process files');
      }

      const result = await response.json();
      const processed = result.files as ProcessedFile[];
      
      setProcessedFiles(prev => [...prev, ...processed]);
      onFilesSelected([...processedFiles, ...processed]);
      
    } catch (error) {
      console.error('File processing error:', error);
      alert(`Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || isProcessing) return;
    
    // Filter and validate files
    const validFiles = acceptedFiles.filter(file => {
      // Check file type
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        console.warn(`File ${file.name} is not a supported type: ${file.type}`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSizePerFile) {
        console.warn(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        return false;
      }
      
      return true;
    });

    // Limit number of files
    const filesToAdd = validFiles.slice(0, maxFiles - selectedFiles.length);
    
    if (filesToAdd.length > 0) {
      const newFiles = [...selectedFiles, ...filesToAdd];
      setSelectedFiles(newFiles);
      await processFiles(filesToAdd);
    }
  }, [selectedFiles, maxFiles, maxSizePerFile, disabled, isProcessing, processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(
      SUPPORTED_FILE_TYPES.map(type => [
        type, 
        [FILE_TYPE_EXTENSIONS[type as keyof typeof FILE_TYPE_EXTENSIONS] || '']
      ])
    ),
    multiple: true,
    disabled: disabled || isProcessing,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (index: number) => {
    if (disabled || isProcessing) return;
    
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newProcessedFiles = processedFiles.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setProcessedFiles(newProcessedFiles);
    onFilesSelected(newProcessedFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllFiles = () => {
    if (disabled || isProcessing) return;
    
    setSelectedFiles([]);
    setProcessedFiles([]);
    onFilesSelected([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
          }
          ${disabled || isProcessing
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-2">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          ) : (
            <svg 
              className="mx-auto w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 48 48"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              />
            </svg>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isProcessing 
                ? 'Processing files...' 
                : isDragActive 
                  ? 'Drop files here...' 
                  : 'Click to upload files or drag and drop'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              PDF, DOCX, TXT, CSV, JSON, MD up to {Math.round(maxSizePerFile / 1024 / 1024)}MB each
              {maxFiles > 1 && ` (max ${maxFiles} files)`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Selected Files ({selectedFiles.length})
            </h4>
            {selectedFiles.length > 1 && (
              <button
                onClick={clearAllFiles}
                disabled={disabled || isProcessing}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const processed = processedFiles[index];
              return (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl">{getFileIcon(file.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                      {processed && (
                        <> • {processed.contentLength.toLocaleString()} characters extracted</>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {processed ? (
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : isProcessing ? (
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    ) : null}
                    
                    <button
                      onClick={() => removeFile(index)}
                      disabled={disabled || isProcessing}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Preview component for showing processed files in messages
interface FilePreviewProps {
  files: ProcessedFile[];
  className?: string;
  onRemoveFile?: (index: number) => void;
  readonly?: boolean;
}

export function FilePreview({ 
  files, 
  className = '', 
  onRemoveFile,
  readonly = false 
}: FilePreviewProps) {
  if (files.length === 0) return null;

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
    <div className={`space-y-2 ${className}`}>
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm">
          <div className="text-lg">{getFileIcon(file.type)}</div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{file.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {(file.originalSize / 1024 / 1024).toFixed(1)}MB • {file.contentLength.toLocaleString()} chars
            </div>
          </div>
          
          {!readonly && onRemoveFile && (
            <button
              onClick={() => onRemoveFile(index)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
