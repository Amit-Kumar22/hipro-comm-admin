'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';

interface InventoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSave: (itemData: any) => void;
}

export default function InventoryEditModal({ 
  isOpen, 
  onClose, 
  item, 
  onSave 
}: InventoryEditModalProps) {
  const [formData, setFormData] = useState({
    reorderLevel: 0,
    maxStockLevel: 0,
    location: {
      warehouse: '',
      section: '',
      shelf: ''
    },
    supplier: {
      name: '',
      contact: '',
      leadTime: 7
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        reorderLevel: item.reorderLevel || 0,
        maxStockLevel: item.maxStockLevel || 0,
        location: {
          warehouse: item.location?.warehouse || '',
          section: item.location?.section || '',
          shelf: item.location?.shelf || ''
        },
        supplier: {
          name: item.supplier?.name || '',
          contact: item.supplier?.contact || '',
          leadTime: item.supplier?.leadTime || 7
        }
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.maxStockLevel <= formData.reorderLevel) {
      alert('Max stock level must be greater than reorder level');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Inventory Settings"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            {item.product.images?.[0] && (
              <img
                src={item.product.images[0].url}
                alt={item.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{item.product.name}</h3>
              <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              <p className="text-sm text-gray-500">Current Stock: {item.quantityAvailable} units</p>
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Stock Level Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level *
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reorderLevel: parseInt(e.target.value) || 0
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum stock before reordering</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Stock Level *
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxStockLevel: parseInt(e.target.value) || 0
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum allowed stock quantity</p>
            </div>
          </div>

          {/* Validation Warning */}
          {formData.maxStockLevel > 0 && formData.reorderLevel >= formData.maxStockLevel && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              ⚠️ Max stock level must be greater than reorder level
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Storage Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse *
              </label>
              <input
                type="text"
                value={formData.location.warehouse}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, warehouse: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Main Warehouse"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <input
                type="text"
                value={formData.location.section}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, section: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., A, B, C"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shelf *
              </label>
              <input
                type="text"
                value={formData.location.shelf}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, shelf: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 1, 2, 3"
                required
              />
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Supplier Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                value={formData.supplier.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, name: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Supplier company name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information *
              </label>
              <input
                type="text"
                value={formData.supplier.contact}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, contact: e.target.value }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Phone or email"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Time (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.supplier.leadTime}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  supplier: { ...prev.supplier, leadTime: parseInt(e.target.value) || 1 }
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Current Status Summary */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600">Available</p>
              <p className="font-medium text-blue-900">{item.quantityAvailable}</p>
            </div>
            <div>
              <p className="text-blue-600">Reserved</p>
              <p className="font-medium text-blue-900">{item.quantityReserved}</p>
            </div>
            <div>
              <p className="text-blue-600">Total Stock</p>
              <p className="font-medium text-blue-900">{item.totalStock}</p>
            </div>
            <div>
              <p className="text-blue-600">Last Restocked</p>
              <p className="font-medium text-blue-900">
                {new Date(item.lastRestocked).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              loading || 
              formData.maxStockLevel <= formData.reorderLevel ||
              !formData.location.warehouse ||
              !formData.location.section ||
              !formData.location.shelf ||
              !formData.supplier.name ||
              !formData.supplier.contact
            }
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}