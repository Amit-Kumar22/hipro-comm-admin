'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createAdminCategory, updateAdminCategory } from '@/redux/slices/adminCategoriesSlice';
import { useToast } from '@/components/providers/ToastProvider';
import Modal from './Modal';
import ImageUpload from '../ui/ImageUpload';

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
  images: string[];
  isActive: boolean;
  sortOrder: string;
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const { loading } = useAppSelector((state) => state.adminCategories);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    images: [],
    isActive: true,
    sortOrder: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        images: category.image ? [category.image] : [],
        isActive: category.isActive ?? true,
        sortOrder: category.sortOrder?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        images: [],
        isActive: true,
        sortOrder: ''
      });
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
  // Handle image upload changes
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Enhanced validation with better messaging
      if (!formData.name.trim()) {
        showError('Category name is required and cannot be empty.');
        setIsSubmitting(false);
        return;
      }

      if (formData.name.trim().length < 3) {
        showError('Category name must be at least 3 characters long.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        showError('Category description is required and cannot be empty.');
        setIsSubmitting(false);
        return;
      }

      if (formData.description.trim().length < 10) {
        showError('Category description must be at least 10 characters long.');
        setIsSubmitting(false);
        return;
      }

      if (formData.description.trim().length > 500) {
        showError('Category description cannot exceed 500 characters.');
        setIsSubmitting(false);
        return;
      }

      // Validate images if provided
      if (formData.images && formData.images.length > 0) {
        const validImages = formData.images.filter(img => img.trim() !== '');
        
        if (validImages.length > 5) {
          showError('Maximum 5 images are allowed per category.');
          setIsSubmitting(false);
          return;
        }

        for (let i = 0; i < validImages.length; i++) {
          const imageUrl = validImages[i].trim();
          
          // Allow various URL formats:
          // - Server uploads: /uploads/ or full URLs with uploads
          // - External URLs: http:// or https://
          // - Local preview: data: (base64) or blob: URLs
          const isValidUrl = 
            imageUrl.startsWith('/uploads/') ||           // Server relative path
            imageUrl.startsWith('http://') ||             // HTTP URL
            imageUrl.startsWith('https://') ||            // HTTPS URL
            imageUrl.startsWith('data:image/') ||         // Base64 data URL
            imageUrl.startsWith('blob:') ||               // Blob URL (local preview)
            imageUrl.includes('/uploads/images/') ||      // Full server URL with uploads path
            imageUrl.includes('/uploads/videos/');        // Video uploads path
          
          if (!isValidUrl) {
            showError(`Image ${i + 1} has an invalid URL format. Expected formats: server uploads, HTTP/HTTPS URLs, or data URLs.`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Validate slug if provided
      if (formData.slug && formData.slug.trim() !== '') {
        const slug = formData.slug.trim();
        if (!/^[a-z0-9-]+$/.test(slug)) {
          showError('Category slug can only contain lowercase letters, numbers, and hyphens.');
          return;
        }
        if (slug.length < 3) {
          showError('Category slug must be at least 3 characters long.');
          return;
        }
      }

      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : 0,
        ...(formData.images.length > 0 && { image: formData.images[0] })
      };

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
      console.log('✅ Category save successful, closing modal');
      console.log('🚀 Calling onClose now...');
      onClose();
      console.log('✅ Modal close called successfully');
    } catch (error: any) {
      console.error('❌ Error saving category:', error);
      console.log('🚪 Modal should stay open - NOT calling onClose()');
      console.log('🔒 Confirming: onClose will NOT be called in error block');
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to save category. Please check all fields and try again.';
      
      if (error && typeof error === 'object') {
        if ('details' in error && Array.isArray(error.details)) {
          // Handle validation errors from backend
          const validationErrors = error.details.map((d: any) => 
            `${d.field ? d.field.charAt(0).toUpperCase() + d.field.slice(1) : 'Field'}: ${d.message}`
          ).join('\n• ');
          errorMessage = `Validation errors:\n• ${validationErrors}`;
        } else if ('message' in error) {
          // Handle general error message
          errorMessage = error.message;
          
          // Provide specific guidance for common errors
          if (error.message.includes('duplicate') || error.message.includes('already exists')) {
            errorMessage += '\n\nTip: Please use a different category name or slug.';
          } else if (error.message.includes('validation')) {
            errorMessage += '\n\nTip: Please check all required fields are filled correctly.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += '\n\nTip: Please check your internet connection and try again.';
          } else if (error.message.includes('413') || error.message.includes('too large')) {
            errorMessage = 'Image file is too large. Please reduce image size to under 5MB.';
          }
        } else if ('code' in error) {
          // Handle specific error codes
          switch (error.code) {
            case 11000:
              errorMessage = 'A category with this name already exists. Please use a unique name.';
              break;
            case 413:
              errorMessage = 'Image file is too large. Please reduce image size to under 5MB.';
              break;
            case 400:
              errorMessage = 'Invalid data provided. Please check all fields and try again.';
              break;
            case 401:
              errorMessage = 'Authentication failed. Please refresh the page and log in again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case 500:
              errorMessage = 'Server error occurred. Please try again in a few moments.';
              break;
            default:
              errorMessage = `Error ${error.code}: ${error.message || 'Unknown error occurred'}`;
          }
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show error without closing modal - user can fix issues and retry
      showError(errorMessage);
      
      // Important: Don't call onClose() here - keep modal open for user to fix issues
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      size="md"
      preventBackdropClose={isSubmitting}
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

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
            maxFiles={1}
            maxSizeMB={5} // 5MB
            label="Drop category image here or click to browse"
            className="border border-gray-300 rounded-lg"
          />
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