'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createAdminProduct, updateAdminProduct } from '@/redux/slices/adminProductsSlice';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import { getInventory } from '@/redux/slices/inventorySlice';
import { useToast } from '@/components/providers/ToastProvider';
import Modal from './Modal';
import ImageUpload from '../ui/ImageUpload';
import VideoUpload from '../ui/VideoUpload';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  onSuccess?: () => void;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // Store as string for form, convert to object on submit
  price: {
    original: number | string;
    selling: number | string;
    discount: number;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  video: string; // Video URL
  sku: string;
  inventory: {
    quantity: number | string;
    reserved: number;
    available: number | string;
    threshold: number;
    isOutOfStock: boolean;
    availableForSale: number | string;
  };
  inStock: boolean;
  specifications: Array<{
    key: string;
    value: string;
  }>;
  dimensions: {
    length: number | string;
    width: number | string;
    height: number | string;
    weight: number | string;
    unit: 'cm' | 'inch';
    weightUnit: 'kg' | 'lbs';
  };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export default function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const dispatch = useAppDispatch();
  const { showSuccess, showError } = useToast();
  const { loading: productLoading } = useAppSelector((state) => state.adminProducts);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.adminCategories);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    price: { original: '', selling: '', discount: 0 },
    images: [],
    video: '',
    sku: '',
    inventory: { quantity: '', reserved: 0, available: '', threshold: 5, isOutOfStock: true, availableForSale: '' },
    inStock: true,
    specifications: [],
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
      unit: 'cm',
      weightUnit: 'kg'
    },
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle video change
  const handleVideoChange = (videoUrl: string) => {
    setFormData(prev => ({ ...prev, video: videoUrl }));
  };

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Admin ProductModal opened, loading categories...');
      dispatch(getAdminCategories({ includeInactive: false }));
    }
  }, [isOpen, dispatch]);

  // Debug categories loading
  useEffect(() => {
    console.log('📊 Admin Categories state update:', {
      categoriesCount: categories?.length || 0,
      loading: categoriesLoading,
      categories: categories?.slice(0, 3) // Show first 3 for debugging
    });
  }, [categories, categoriesLoading]);

  useEffect(() => {
    if (product) {
      // Convert specifications from object to array if needed
      const specsArray = Array.isArray(product.specifications) 
        ? product.specifications 
        : Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
      
      // Handle inventory structure
      const inventory = product.inventory || {};
      const inventoryData = {
        quantity: inventory.quantity || inventory.availableForSale || 0,
        reserved: inventory.reserved || 0,
        available: inventory.available || inventory.quantity || inventory.availableForSale || 0,
        threshold: inventory.threshold || 5,
        isOutOfStock: inventory.isOutOfStock ?? ((inventory.quantity || inventory.availableForSale || 0) <= 0),
        availableForSale: inventory.availableForSale || inventory.quantity || 0
      };
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        category: product.category?._id || product.category || '',
        price: product.price || { original: 0, selling: 0, discount: 0 },
        images: product.images || [],
        video: product.video?.url || '', // Extract URL from video object
        sku: product.sku || '',
        inventory: inventoryData,
        inStock: product.inStock ?? (inventoryData.available > 0),
        specifications: specsArray,
        dimensions: product.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
          unit: 'cm',
          weightUnit: 'kg'
        },
        tags: product.tags || [],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
      setImageUrls(product.images?.map((img: any) => img.url) || []);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: '',
        price: { original: 0, selling: 0, discount: 0 },
        images: [],
        video: '',
        sku: '',
        inventory: { quantity: 0, reserved: 0, available: 0, threshold: 5, isOutOfStock: true, availableForSale: 0 },
        inStock: true,
        specifications: [],
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
          unit: 'cm',
          weightUnit: 'kg'
        },
        tags: [],
        isActive: true,
        isFeatured: false,
      });
      setImageUrls([]);
    }
  }, [product, isOpen]);

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

  const calculateDiscount = (original: number, selling: number) => {
    if (original > 0 && selling > 0 && original > selling) {
      return Math.round(((original - selling) / original) * 100);
    }
    return 0;
  };

  const handlePriceChange = (field: 'original' | 'selling', value: number) => {
    const newPrice = { ...formData.price, [field]: value };
    const originalNum = typeof newPrice.original === 'string' ? parseFloat(newPrice.original) || 0 : newPrice.original;
    const sellingNum = typeof newPrice.selling === 'string' ? parseFloat(newPrice.selling) || 0 : newPrice.selling;
    newPrice.discount = calculateDiscount(originalNum, sellingNum);
    setFormData(prev => ({ ...prev, price: newPrice }));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const handleImageFileSelect = (index: number, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateImageUrl(index, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [
          ...prev.specifications,
          { key: specKey.trim(), value: specValue.trim() }
        ]
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Client-side validation with improved messaging
      if (!formData.name.trim()) {
        showError('Product name is required and cannot be empty');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.name.trim().length < 3) {
        showError('Product name must be at least 3 characters long');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.shortDescription.trim()) {
        showError('Short description is required');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.shortDescription.trim().length < 10) {
        showError('Short description must be at least 10 characters long');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.description.trim()) {
        showError('Product description is required and cannot be empty');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.description.trim().length < 20) {
        showError('Product description must be at least 20 characters long');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.category) {
        showError('Please select a category for this product');
        setIsSubmitting(false);
        return;
      }
      
      const originalPrice = typeof formData.price.original === 'string' ? parseFloat(formData.price.original) || 0 : formData.price.original;
      const sellingPrice = typeof formData.price.selling === 'string' ? parseFloat(formData.price.selling) || 0 : formData.price.selling;
      
      if (originalPrice <= 0) {
        showError('Original price must be greater than 0');
        setIsSubmitting(false);
        return;
      }
      
      if (sellingPrice <= 0) {
        showError('Selling price must be greater than 0');
        setIsSubmitting(false);
        return;
      }
      
      if (sellingPrice > originalPrice) {
        showError('Selling price cannot be greater than original price');
        setIsSubmitting(false);
        return;
      }

      // Enhanced image validation
      const validImages = imageUrls.filter(url => url.trim() !== '');
      
      if (validImages.length === 0) {
        showError('At least one product image is required');
        setIsSubmitting(false);
        return;
      }
      
      if (validImages.length > 10) {
        showError('Maximum 10 images are allowed per product');
        setIsSubmitting(false);
        return;
      }

      // Validate image URLs
      for (let i = 0; i < validImages.length; i++) {
        const url = validImages[i].trim();
        if (!url.startsWith('/uploads/') && !url.startsWith('http://') && !url.startsWith('https://')) {
          showError(`Image ${i + 1} has an invalid URL format`);
          setIsSubmitting(false);
          return;
        }
      }

      const processedImages = validImages.map((url, index) => ({
        url: url.trim(),
        alt: formData.name,
        isPrimary: index === 0
      }));

      // Enhanced SKU validation
      if (!formData.sku.trim()) {
        showError('SKU (Stock Keeping Unit) is required');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.sku.trim().length < 3) {
        showError('SKU must be at least 3 characters long');
        setIsSubmitting(false);
        return;
      }

      // Enhanced inventory validation
      const quantity = typeof formData.inventory.quantity === 'string' ? parseInt(formData.inventory.quantity) || 0 : formData.inventory.quantity;
      const threshold = formData.inventory.threshold;
      
      if (quantity < 0) {
        showError('Inventory quantity cannot be negative');
        setIsSubmitting(false);
        return;
      }
      
      if (threshold < 0) {
        showError('Stock threshold cannot be negative');
        setIsSubmitting(false);
        return;
      }
      
      if (threshold > quantity) {
        showError('Stock threshold cannot be greater than available quantity');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for API
      const finalProductData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        categoryId: formData.category, // Send as categoryId, not category object
        price: formData.price,
        images: validImages,
        ...(formData.video && { video: { url: formData.video } }), // Include video if provided
        specifications: formData.specifications,
        dimensions: formData.dimensions,
        tags: formData.tags,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        // For both new products and updates, send stock quantity
        ...(product ? {
          stockQuantity: formData.inventory.quantity // For updates, use stockQuantity
        } : {
          initialStock: formData.inventory.quantity, // For new products, use initialStock
          reorderLevel: formData.inventory.threshold,
          maxStockLevel: Math.max(
            (typeof formData.inventory.quantity === 'string' ? parseInt(formData.inventory.quantity) || 0 : formData.inventory.quantity) + 1000,
            (typeof formData.inventory.quantity === 'string' ? parseInt(formData.inventory.quantity) || 0 : formData.inventory.quantity) * 2
          )
        })
      };

      console.log('🎬 Product submission data:', finalProductData);
      console.log('🎥 Video data being sent:', formData.video ? { url: formData.video } : 'No video');

      let result;
      if (product) {
        result = await dispatch(updateAdminProduct({ 
          productId: product._id, 
          productData: finalProductData 
        })).unwrap();
        showSuccess('Product updated successfully! Stock and inventory updated automatically.');
      } else {
        result = await dispatch(createAdminProduct(finalProductData)).unwrap();
        const stockQuantity = typeof formData.inventory.quantity === 'string' ? parseInt(formData.inventory.quantity) || 0 : formData.inventory.quantity;
        if (stockQuantity === 0) {
          showSuccess('Product created successfully! Product is marked as "Out of Stock" in inventory.');
        } else {
          showSuccess('Product created successfully! Inventory record created with initial stock.');
        }
      }
      
      // Refresh inventory data to show updated stock levels
      dispatch(getInventory({}));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to save product. Please check all fields and try again.';
      
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
            errorMessage += '\n\nTip: Please use a different product name or SKU.';
          } else if (error.message.includes('validation')) {
            errorMessage += '\n\nTip: Please check all required fields are filled correctly.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += '\n\nTip: Please check your internet connection and try again.';
          } else if (error.message.includes('413') || error.message.includes('too large')) {
            errorMessage = 'Files are too large. Please reduce image/video sizes to under 5MB for images and 50MB for videos.';
          }
        } else if ('code' in error) {
          // Handle specific error codes
          switch (error.code) {
            case 11000:
              errorMessage = 'A product with this name or SKU already exists. Please use unique values.';
              break;
            case 413:
              errorMessage = 'Files are too large. Please reduce image sizes (max 5MB) and video sizes (max 50MB).';
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
      title={product ? 'Edit Product' : 'Add New Product'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select Category'}
              </option>
              {!categoriesLoading && categories?.length === 0 && (
                <option value="" disabled>No categories available</option>
              )}
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
            )}
            {!categoriesLoading && categories?.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No categories found. Please create categories first.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock Quantity *</label>
            <input
              type="number"
              min="0"
              value={formData.inventory.quantity}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                inventory: {
                  ...prev.inventory,
                  quantity: parseInt(e.target.value) || 0,
                  available: parseInt(e.target.value) || 0,
                  availableForSale: parseInt(e.target.value) || 0,
                  isOutOfStock: (parseInt(e.target.value) || 0) <= 0
                },
                inStock: parseInt(e.target.value) > 0
              }))}
              placeholder="Stock quantity"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {product ? 'Update stock quantity (will sync with inventory system)' : 'Initial stock when creating product (will create inventory record)'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Short Description</label>
          <textarea
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="Brief product summary..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Original Price (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price.original}
              onChange={(e) => handlePriceChange('original', parseFloat(e.target.value) || 0)}
              placeholder="Original price"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price.selling}
              onChange={(e) => handlePriceChange('selling', parseFloat(e.target.value) || 0)}
              placeholder="Selling price"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
            <div className="px-2 py-1 bg-gray-50 border border-gray-300 rounded text-sm">
              {formData.price.discount}%
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Dimensions *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Length</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.length}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Length"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.width}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Width"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.dimensions.height}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Height"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.dimensions.weight}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, weight: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="Weight"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Size Unit</label>
              <select
                value={formData.dimensions.unit}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, unit: e.target.value as 'cm' | 'inch' }
                }))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="inch">Inches (inch)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight Unit</label>
              <select
                value={formData.dimensions.weightUnit}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, weightUnit: e.target.value as 'kg' | 'lbs' }
                }))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <ImageUpload
          images={imageUrls}
          onImagesChange={setImageUrls}
          maxFiles={10}
          maxSizeMB={5}
          label="Product Images"
          required={false}
        />

        {/* Video Upload */}
        <VideoUpload
          video={formData.video}
          onVideoChange={handleVideoChange}
          maxSizeMB={50}
          label="Product Video (Optional)"
          required={false}
          className="border border-gray-300 rounded-lg p-4"
        />

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Enter tag"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
          <div className="space-y-2 mb-2">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="flex-1 text-sm">
                  <strong>{spec.key}:</strong> {spec.value}
                </span>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="px-2 py-1 text-red-600 hover:bg-red-100 rounded text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="Specification name"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              placeholder="Value"
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={addSpecification}
              className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-1"
            />
            <span className="text-xs font-medium text-gray-700">Active</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-1"
            />
            <span className="text-xs font-medium text-gray-700">Featured</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={productLoading || isSubmitting}
            className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {(productLoading || isSubmitting) && (
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>
              {(productLoading || isSubmitting) ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}