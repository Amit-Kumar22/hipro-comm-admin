'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, Video, Play, Pause } from 'lucide-react';
import VideoErrorMessage from './VideoErrorMessage';

interface VideoUploadProps {
  video: string;
  onVideoChange: (video: string) => void;
  maxSizeMB?: number;
  label?: string;
  required?: boolean;
  className?: string;
}

interface VideoFile {
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  isValid: boolean;
  error?: string;
}

const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/ogg'];
const DEFAULT_MAX_SIZE_MB = 50;

export default function VideoUpload({
  video,
  onVideoChange,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  label = 'Product Video',
  required = false,
  className = ''
}: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported format. Use: ${SUPPORTED_VIDEO_FORMATS.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`
      };
    }

    return { isValid: true };
  };

  const processFile = async (file: File): Promise<VideoFile> => {
    const validation = validateFile(file);
    const url = URL.createObjectURL(file);

    const videoFile: VideoFile = {
      file,
      url,
      name: file.name,
      size: file.size,
      type: file.type,
      isValid: validation.isValid,
      error: validation.error
    };

    try {
      const video = document.createElement('video');
      video.src = url;
      
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', () => {
          videoFile.duration = video.duration;
          
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            videoFile.error = 'Video file appears to contain only audio. Please upload a file with video content.';
            videoFile.isValid = false;
          }
          
          resolve(void 0);
        });
        
        video.addEventListener('error', (e) => {
          videoFile.error = 'Unable to validate video file. It may be corrupted or use an unsupported codec.';
          videoFile.isValid = false;
          reject(e);
        });
        
        setTimeout(() => {
          if (video.readyState < 1) {
            videoFile.error = 'Video validation timeout. File may be corrupted.';
            videoFile.isValid = false;
            reject(new Error('Validation timeout'));
          }
        }, 5000);
      });
    } catch (error) {
      if (!videoFile.error) {
        videoFile.error = 'Could not validate video file.';
      }
    }

    return videoFile;
  };

  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading');
    
    try {
      const videoFile = await processFile(file);
      
      if (!videoFile.isValid) {
        setUploadStatus('error');
        return;
      }

      setSelectedFile(videoFile);
      
      const formData = new FormData();
      formData.append('video', file);
      
      const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const uploadUrl = `${apiBaseURL}/upload/video`;
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        throw new Error('No admin authentication token found. Please log in again.');
      }

      const testResponse = await fetch(`${apiBaseURL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        throw new Error('Authentication expired. Please log in again.');
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again and try uploading the video.');
        }
        
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.url) {
        onVideoChange(result.data.url);
        setUploadStatus('success');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
      
    } catch (error) {
      setUploadStatus('error');
      setSelectedFile(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      await handleFileSelect(files[0]);
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFileSelect(e.target.files[0]);
    }
  };

  const removeVideo = () => {
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile(null);
    onVideoChange('');
    setUploadStatus('idle');
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Display existing video if available and no new file selected */}
      {video && !selectedFile && (
        <div className="space-y-2">
          <div className="relative bg-gray-100 rounded overflow-hidden">
            <video
              src={video}
              className="w-full h-32 object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              muted
              controls
            />

            <button
              type="button"
              onClick={() => onVideoChange('')}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="bg-green-50 rounded p-2 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">Current Video</p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                  <span>{video.split('/').pop() || 'Video'}</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
              
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            </div>
          </div>
          
          {/* Add new video option */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Replace Video
            </button>
          </div>
        </div>
      )}

      {/* Upload area - show if no existing video or user is replacing */}
      {(!video || selectedFile) && (
        <>
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded p-4 transition-colors ${
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
                accept={SUPPORTED_VIDEO_FORMATS.join(',')}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={required}
              />
              
              <div className="text-center">
                <Video className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">Drop video here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Supports: MP4, WebM, OGG (max {maxSizeMB}MB)</p>
                </div>
              </div>
              
              {uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-gray-600 mt-2">Processing...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative bg-gray-100 rounded overflow-hidden">
                <video
                  ref={videoRef}
                  src={selectedFile.url}
                  className="w-full h-32 object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  muted
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center group">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-gray-800" />
                    ) : (
                      <Play className="h-4 w-4 text-gray-800 ml-0.5" />
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-gray-50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{selectedFile.name}</p>
                    <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      {selectedFile.duration && <span>{formatDuration(selectedFile.duration)}</span>}
                      <span className="uppercase">{selectedFile.type.split('/')[1]}</span>
                    </div>
                  </div>
                  
                  {uploadStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  
                  {selectedFile.error && (
                    <VideoErrorMessage 
                      error={selectedFile.error}
                      onRetry={() => {
                        setSelectedFile({ ...selectedFile, error: undefined, isValid: true });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}