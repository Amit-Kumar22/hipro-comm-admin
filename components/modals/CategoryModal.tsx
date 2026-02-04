'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createAdminCategory, updateAdminCategory } from '@/redux/slices/adminCategoriesSlice';
import { useToast } from '@/components/providers/ToastProvider';
import Modal from './Modal';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Eye, 
  Link, 
  FolderOpen,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
  onSuccess?: () => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  images: File[];
  isActive: boolean;
  sortOrder: string;
}

interface SelectedImage {
  url: string;
  name: string;
  type: 'upload';
  file: File;
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const { loading } = useAppSelector((state) => state.adminCategories);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    images: [],
    isActive: true,
    sortOrder: ''
  });

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);  
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        images: [],
        isActive: category.isActive ?? true,
        sortOrder: category.sortOrder?.toString() || ''
      });
      
      // For existing categories with images, show current image
      if (category.image) {
        setImagePreviewUrls([category.image]);
      }
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        images: [],
        isActive: true,
        sortOrder: ''
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
    }
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Handle file upload (multiple files)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    try {
      // Validate max 10 files
      if (files.length > 10) {
        showError('Maximum 10 images allowed.');
        return;
      }
      
      const validFiles: File[] = [];
      const newSelectedImages: SelectedImage[] = [];
      const newPreviewUrls: string[] = [];
      
      files.forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showError(`"${file.name}" is not a valid image file.`);
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showError(`"${file.name}" size must be less than 5MB.`);
          return;
        }
        
        validFiles.push(file);
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviewUrls.push(previewUrl);
        
        newSelectedImages.push({
          url: previewUrl,
          name: file.name,
          type: 'upload',
          file
        });
      });
      
      if (validFiles.length > 0) {
        setSelectedImages(newSelectedImages);
        setImagePreviewUrls(newPreviewUrls);
        setFormData(prev => ({ ...prev, images: validFiles }));
        
        showSuccess(`${validFiles.length} image(s) selected successfully!`);
      }
    } catch (uploadError: any) {
      console.error('File upload error:', uploadError);
      const errorMsg = typeof uploadError === 'string' ? uploadError : 
                      (uploadError && typeof uploadError === 'object' && 'message' in uploadError ? (uploadError as any).message : null) || 'Failed to process selected files.';
      showError(String(errorMsg));
    }
  };

  // Remove selected images
  const handleRemoveImages = () => {
    try {
      // Clean up object URLs to prevent memory leaks
      imagePreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setFormData(prev => ({ ...prev, images: [] }));
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (cleanupError: any) {
      console.error('Cleanup error:', cleanupError);
      // Still reset the state even if cleanup fails
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setFormData(prev => ({ ...prev, images: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      showError('Category name is required.');
      return;
    }
    
    if (!formData.slug.trim()) {
      showError('URL slug is required.');
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        // Make image optional - only include if files are selected
        ...(formData.images.length > 0 && { image: 'FILES_UPLOAD_PENDING' }),
        isActive: formData.isActive,
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 0
      };

      // In real implementation:
      // 1. Upload all files to server if formData.images has files
      // 2. Get back the uploaded file URLs
      // 3. Then submit the category data with the file URLs
      
      if (formData.images.length > 0) {
        console.log(`📤 Uploading ${formData.images.length} files:`);
        formData.images.forEach(file => {
          console.log(`- ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        });
        showSuccess(`${formData.images.length} file(s) ready for upload!`);
        
        // Mock: Set first image URL
        submitData.image = URL.createObjectURL(formData.images[0]);
      }
      
      if (category) {
        await dispatch(updateAdminCategory({ 
          categoryId: category._id, 
          categoryData: submitData 
        })).unwrap();
        showSuccess('Category updated successfully!');
      } else {
        await dispatch(createAdminCategory(submitData)).unwrap();
        showSuccess('Category created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      try {
        let errorMessage = 'Failed to save category. Please try again.';
        
        // Redux Toolkit RTK Query error structure handling
        if (error && typeof error === 'object') {
          // Check for Redux RTK rejected action payload
          if (error.message && typeof error.message === 'object') {
            const payload = error.message;
            console.log('Redux payload:', payload);
            
            // Handle validation errors from payload
            if (payload.details && Array.isArray(payload.details)) {
              const fieldErrors = payload.details.map((detail: any) => {
                if (typeof detail === 'object' && detail.field && detail.message) {
                  // Convert field names to user-friendly labels
                  const fieldLabel = detail.field === 'image' ? 'Image' :
                                   detail.field === 'name' ? 'Category Name' :
                                   detail.field === 'slug' ? 'URL Slug' :
                                   detail.field;
                  return `${fieldLabel}: ${detail.message}`;
                }
                return typeof detail === 'string' ? detail : 'Invalid field';
              });
              errorMessage = fieldErrors.join(', ');
            } else if (payload.message && typeof payload.message === 'string') {
              errorMessage = payload.message;
            }
          }
          // Direct error object handling
          else if (error.details && Array.isArray(error.details)) {
            const fieldErrors = error.details.map((detail: any) => {
              if (typeof detail === 'object' && detail.field && detail.message) {
                const fieldLabel = detail.field === 'image' ? 'Image' :
                                 detail.field === 'name' ? 'Category Name' :
                                 detail.field === 'slug' ? 'URL Slug' :
                                 detail.field;
                return `${fieldLabel}: ${detail.message}`;
              }
              return typeof detail === 'string' ? detail : 'Invalid field';
            });
            errorMessage = fieldErrors.join(', ');
          }
          // Standard error message handling
          else if (error.message && typeof error.message === 'string') {
            errorMessage = error.message;
          }
          // Axios error response handling
          else if (error && typeof error === 'object' && 'response' in error && 
                   error.response && typeof error.response === 'object' && 'data' in error.response &&
                   (error.response as any).data && typeof (error.response as any).data === 'object' && 'message' in (error.response as any).data &&
                   typeof ((error.response as any).data as any).message === 'string') {
            errorMessage = ((error.response as any).data as any).message;
          }
          // Error string property
          else if (error && typeof error === 'object' && 'error' in error && typeof (error as any).error === 'string') {
            errorMessage = (error as any).error;
          }
        }
        // Handle string errors
        else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Log the final error message
        console.log('Final error message:', errorMessage);
        
        showError(errorMessage);
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
        showError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="Brief description..."
          />
        </div>

        {/* Simple Image Upload Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Image Files (Optional - Select multiple images)
          </label>
          
          <div className="space-y-3">
            {/* Simple File Input */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer border border-gray-300 rounded-lg p-1"
                id="imageUpload"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple images (max 10) • <span className="text-blue-600 font-medium">Optional field</span>
              </p>
            </div>
          </div>
          
          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="mt-3 border border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Selected Images ({selectedImages.length})</h4>
                    <p className="text-xs text-gray-500">Ready to upload</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRemoveImages}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                  title="Remove All Images"
                >
                  Clear All
                </button>
              </div>
              
              {/* Images Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={image.url}
                        alt={`Selected ${index + 1}`}
                        className="w-full h-24 object-contain bg-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY3NzQ4RiIgZm9udC1zaXplPSIxMCI+RXJyb3I8L3RleHQ+Cjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    
                    <div className="mt-1 text-center">
                      <p className="text-xs text-gray-600 truncate" title={image.name}>
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Enter sort order"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-1"
              />
              <span className="text-xs font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (category ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
}