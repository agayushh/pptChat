import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImagesSelected: (images: File[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in bytes
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  onImagesSelected, 
  maxImages = 10, 
  maxSizePerImage = 10 * 1024 * 1024, // 10MB default
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return;
    
    // Filter and validate files
    const validImages = acceptedFiles.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image`);
        return false;
      }
      
      // Check file size
      if (file.size > maxSizePerImage) {
        console.warn(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        return false;
      }
      
      return true;
    });

    // Limit number of images
    const imagesToAdd = validImages.slice(0, maxImages - selectedImages.length);
    
    if (imagesToAdd.length > 0) {
      const newImages = [...selectedImages, ...imagesToAdd];
      setSelectedImages(newImages);
      
      // Generate previews
      const newPreviews = [...previews];
      imagesToAdd.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[selectedImages.length + index] = e.target?.result as string;
          setPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });
      
      onImagesSelected(newImages);
    }
  }, [selectedImages, previews, maxImages, maxSizePerImage, onImagesSelected, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    disabled,
    noClick: false,
    noKeyboard: false
  });

  const removeImage = (index: number) => {
    if (disabled) return;
    
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setPreviews(newPreviews);
    onImagesSelected(newImages);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAllImages = () => {
    if (disabled) return;
    
    setSelectedImages([]);
    setPreviews([]);
    onImagesSelected([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled 
            ? 'cursor-not-allowed opacity-50' 
            : 'hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="space-y-2">
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
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {isDragActive 
                ? 'Drop images here...' 
                : 'Click to upload images or drag and drop'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP up to {Math.round(maxSizePerImage / 1024 / 1024)}MB each
              {maxImages > 1 && ` (max ${maxImages} images)`}
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Images ({selectedImages.length})
            </h4>
            {selectedImages.length > 1 && (
              <button
                onClick={clearAllImages}
                disabled={disabled}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedImages.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  ×
                </button>
                
                {/* File info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{file.name}</div>
                  <div className="text-gray-300">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Image preview component for displaying uploaded images in chat
interface ImagePreviewProps {
  images: File[];
  className?: string;
  onRemoveImage?: (index: number) => void;
  readonly?: boolean;
}

export function ImagePreview({ 
  images, 
  className = '', 
  onRemoveImage,
  readonly = false 
}: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  React.useEffect(() => {
    const newPreviews: string[] = [];
    
    images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        if (newPreviews.filter(Boolean).length === images.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {images.map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative group">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
            {previews[index] ? (
              <img
                src={previews[index]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-blue-600"></div>
              </div>
            )}
          </div>
          
          {!readonly && onRemoveImage && (
            <button
              onClick={() => onRemoveImage(index)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="truncate text-xs">{file.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
