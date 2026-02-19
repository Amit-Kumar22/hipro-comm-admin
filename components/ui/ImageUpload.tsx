'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL, getAdminToken } from '@/redux/config/api.config';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  required?: boolean;
  className?: string;
}

interface ImageFile {
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  isValid: boolean;
  error?: string;
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DEFAULT_MAX_SIZE_MB = 5;

export default function ImageUpload({
  images,
  onImagesChange,
  maxFiles = 10,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  label = 'Images',
  required = false,
  className = ''
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported format. Use: ${SUPPORTED_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: `File too large. Max size: ${maxSizeMB}MB (Current: ${fileSizeMB.toFixed(1)}MB)`
      };
    }

    return { isValid: true };
  };

  const processFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length + images.length; // Include existing images

    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed. You're trying to add ${fileArray.length} more files, but only ${maxFiles - selectedFiles.length - images.length} slots are available.`);
      return;
    }

    const newFiles: ImageFile[] = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      const imageFile: ImageFile = {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        isValid: validation.isValid,
        error: validation.error
      };
      newFiles.push(imageFile);
    });

    const updatedFiles = [...selectedFiles, ...newFiles];
    setSelectedFiles(updatedFiles);

    // Upload valid files to API and push returned URLs (avoid base64)
    const validFiles = newFiles.filter(f => f.isValid);
    if (validFiles.length > 0) {
      validFiles.forEach(async (imageFile) => {
        try {
          const form = new FormData();
          form.append('image', imageFile.file);

          const token = getAdminToken();

          const resp = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: form,
          });

          if (!resp.ok) {
            console.error('Image upload failed', await resp.text());
            // fallback to local blob preview
            onImagesChange([...images, imageFile.url]);
            return;
          }

          const payload = await resp.json();
          const uploadedUrl = payload?.data?.url || payload?.url;
          if (uploadedUrl) {
            onImagesChange([...images, uploadedUrl]);
          } else {
            onImagesChange([...images, imageFile.url]);
          }
        } catch (err) {
          console.error('Upload error', err);
          onImagesChange([...images, imageFile.url]);
        }
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url);
    }
    
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    setSelectedFiles([]);
    onImagesChange([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_FORMATS.join(',')}
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum {maxFiles} files • Up to {maxSizeMB}MB each
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats Info */}
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">Supported formats:</p>
              <p className="text-green-600 font-medium">
                JPEG, JPG, PNG, GIF, WebP, SVG
              </p>
              <p className="mt-1">
                <span className="font-medium">Maximum size:</span> {maxSizeMB}MB per file
              </p>
              <p>
                <span className="font-medium">Maximum files:</span> {maxFiles} images
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Images Display */}
      {images.length > 0 && selectedFiles.length === 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">
                Current Images ({images.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onImagesChange([])}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="relative border rounded-lg p-3 border-green-200 bg-green-50"
              >
                <div className="flex items-start space-x-3">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={imageUrl}
                      alt={`Current image ${index + 1}`}
                      className="h-12 w-12 object-cover rounded border"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const container = img.parentElement;
                        if (container) {
                          container.innerHTML = '<div class="h-12 w-12 bg-gray-200 rounded border flex items-center justify-center"><span class="text-gray-400 text-xs">No Image</span></div>';
                        }
                      }}
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate" title={imageUrl}>
                      {imageUrl.split('/').pop() || 'Image'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Current Image • {imageUrl.includes('data:') ? 'Base64' : 'URL'}
                    </p>
                    
                    {/* Status */}
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">Current</span>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedImages = images.filter((_, i) => i !== index);
                      onImagesChange(updatedImages);
                    }}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                Current Images: <span className="text-green-600 font-medium">{images.length}</span>
              </span>
              <span className="text-gray-600">
                Available Slots: <span className="font-medium">{maxFiles - images.length}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-700">
                Selected Images ({selectedFiles.length}/{maxFiles})
              </h4>
            </div>
            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={clearAllFiles}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {selectedFiles.map((imageFile, index) => (
              <div
                key={index}
                className={`relative border rounded-lg p-3 ${
                  imageFile.isValid 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={imageFile.url}
                      alt={imageFile.name}
                      className="h-12 w-12 object-cover rounded border"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate" title={imageFile.name}>
                      {imageFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(imageFile.size)} • {imageFile.type.split('/')[1].toUpperCase()}
                    </p>
                    
                    {/* Status */}
                    {imageFile.isValid ? (
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Valid</span>
                        {index === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 mt-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">Invalid</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {!imageFile.isValid && imageFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {imageFile.error}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">
                  Valid: <span className="text-green-600 font-medium">{selectedFiles.filter(f => f.isValid).length}</span>
                </span>
                <span className="text-gray-600">
                  Invalid: <span className="text-red-600 font-medium">{selectedFiles.filter(f => !f.isValid).length}</span>
                </span>
                <span className="text-gray-600">
                  Total: <span className="font-medium">{selectedFiles.length}/{maxFiles}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}