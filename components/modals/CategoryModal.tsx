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
      // Basic validation
      if (!formData.name.trim()) {
        showError('Category name is required.');
        return;
      }

      if (!formData.description.trim()) {
        showError('Category description is required.');
        return;
      }

      if (formData.description.trim().length < 10) {
        showError('Description must be at least 10 characters long.');
        return;
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
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving category:', error);
      
      let errorMessage = 'Failed to save category. Please try again.';
      
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showError(errorMessage);
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