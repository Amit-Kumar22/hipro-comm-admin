'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getAdminCategories } from '@/redux/slices/adminCategoriesSlice';
import { createAdminProduct } from '@/redux/slices/adminProductsSlice';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
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
  sku: string;
  inventory: {
    availableForSale: number | string;
    isOutOfStock: boolean;
  };
  specifications: { [key: string]: string };
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.adminCategories);
  const { loading: productLoading } = useAppSelector((state) => state.adminProducts);

  const [step, setStep] = useState<'category' | 'product'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    category: '',
    price: {
      original: '',
      selling: '',
      discount: 0,
    },
    images: [],
    sku: '',
    inventory: {
      availableForSale: '',
      isOutOfStock: false,
    },
    specifications: {},
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    dispatch(getAdminCategories({ includeInactive: false }));
  }, [dispatch]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setProductData(prev => ({
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
    const newPrice = { ...productData.price, [field]: value };
    const originalNum = typeof newPrice.original === 'string' ? parseFloat(newPrice.original) || 0 : newPrice.original;
    const sellingNum = typeof newPrice.selling === 'string' ? parseFloat(newPrice.selling) || 0 : newPrice.selling;
    newPrice.discount = calculateDiscount(originalNum, sellingNum);
    
    setProductData(prev => ({
      ...prev,
      price: newPrice
    }));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
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
    if (tagInput.trim() && !productData.tags.includes(tagInput.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setProductData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim()
        }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    const newSpecs = { ...productData.specifications };
    delete newSpecs[keyToRemove];
    setProductData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setProductData(prev => ({ ...prev, category: categoryId }));
    setStep('product');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare images array
    const validImages = imageUrls
      .filter(url => url.trim() !== '')
      .map((url, index) => ({
        url: url.trim(),
        alt: productData.name,
        isPrimary: index === 0
      }));

    const categoryData = categories.find(cat => cat._id === selectedCategory);
    const stockQuantity = typeof productData.inventory.availableForSale === 'string' 
      ? parseInt(productData.inventory.availableForSale) || 0 
      : productData.inventory.availableForSale;
    
    const finalProductData = {
      ...productData,
      category: categoryData ? { _id: categoryData._id, name: categoryData.name, slug: categoryData.slug } : { _id: '', name: '', slug: '' },
      images: validImages,
      inventory: {
        quantity: stockQuantity,
        reserved: 0,
        available: stockQuantity,
        threshold: 0,
        isOutOfStock: stockQuantity <= 0,
        availableForSale: stockQuantity
      },
      inStock: stockQuantity > 0
    };

    try {

        router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-600">Loading categories...</div>
      </div>
    );
  }

  if (step === 'category') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">Step 1: Select a Category</p>
          </div>
          <Link
            href="/products"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Product Category</h2>
          <p className="text-gray-600 mb-6">Select the category that best describes your product. This will help customers find your product more easily.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategorySelect(category._id)}
                className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left group"
              >
                <div className="flex-shrink-0 mr-4">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 text-xl">📂</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-orange-600">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.description || 'Category description'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <div className="flex items-center mt-1 text-sm text-gray-600">
            <span>Step 2: Product Details</span>
            <span className="mx-2">•</span>
            <span className="text-orange-600 font-medium">{selectedCategoryData?.name}</span>
            <button
              onClick={() => setStep('category')}
              className="ml-2 text-orange-600 hover:text-orange-700"
            >
              (Change Category)
            </button>
          </div>
        </div>
        <Link
          href="/products"
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                value={productData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={productData.slug}
                onChange={(e) => setProductData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                id="sku"
                value={productData.sku}
                onChange={(e) => setProductData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Available Stock *
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={productData.inventory.availableForSale}
                onChange={(e) => setProductData(prev => ({
                  ...prev,
                  inventory: {
                    ...prev.inventory,
                    availableForSale: parseInt(e.target.value) || 0
                  }
                }))}
                placeholder="Enter stock quantity"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              id="shortDescription"
              rows={2}
              value={productData.shortDescription}
              onChange={(e) => setProductData(prev => ({ ...prev, shortDescription: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Brief product summary..."
            />
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Full Description *
            </label>
            <textarea
              id="description"
              rows={4}
              value={productData.description}
              onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹) *
              </label>
              <input
                type="number"
                id="originalPrice"
                min="0"
                step="0.01"
                value={productData.price.original}
                onChange={(e) => handlePriceChange('original', parseFloat(e.target.value) || 0)}
                placeholder="Enter original price"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                id="sellingPrice"
                min="0"
                step="0.01"
                value={productData.price.selling}
                onChange={(e) => handlePriceChange('selling', parseFloat(e.target.value) || 0)}
                placeholder="Enter selling price"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <div className="flex items-center h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <span className="text-sm font-medium text-gray-900">
                  {productData.price.discount}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          
          {imageUrls.map((url, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileSelect(index, e.target.files?.[0] || null)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {index === 0 && (
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">PRIMARY</span>
                )}
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded border border-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {url && (
                <div className="mt-3">
                  <img 
                    src={url} 
                    alt={`Product image ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md border border-gray-200 shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {index === 0 ? 'Primary product image' : `Additional image ${index}`}
                  </p>
                </div>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addImageUrl}
            className="mt-2 px-4 py-2 text-sm text-orange-600 border border-orange-300 rounded-md hover:bg-orange-50 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Another Image
          </button>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {productData.tags.map((tag) => (
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
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
          
          <div className="space-y-2 mb-4">
            {Object.entries(productData.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="font-medium text-sm">{key}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              placeholder="Specification name"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Specification value"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={productData.isActive}
                onChange={(e) => setProductData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Product is active</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={productData.isFeatured}
                onChange={(e) => setProductData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Featured product</span>
            </label>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex justify-end gap-4">
          <Link
            href="/products"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={productLoading}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {productLoading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}