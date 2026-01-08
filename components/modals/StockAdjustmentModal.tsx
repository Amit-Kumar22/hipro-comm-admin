'use client';

import { useState } from 'react';
import Modal from './Modal';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onAdjust: (adjustment: number, reason: string, notes?: string) => void;
}

export default function StockAdjustmentModal({ 
  isOpen, 
  onClose, 
  item, 
  onAdjust 
}: StockAdjustmentModalProps) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment || !reason.trim()) return;

    setLoading(true);
    try {
      await onAdjust(adjustment, reason.trim(), notes.trim() || undefined);
      // Reset form
      setAdjustment(0);
      setReason('');
      setNotes('');
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setAdjustment(0);
    setReason('');
    setNotes('');
    onClose();
  };

  if (!item) return null;

  const maxNegativeAdjustment = -item.quantityAvailable;
  const maxPositiveAdjustment = item.maxStockLevel - item.quantityAvailable;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Adjust Stock"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Adjustment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjustment Amount *
          </label>
          <div className="space-y-2">
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              min={maxNegativeAdjustment}
              max={maxPositiveAdjustment}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter positive or negative number"
              required
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Positive numbers increase stock (max: +{maxPositiveAdjustment})</p>
              <p>• Negative numbers decrease stock (min: {maxNegativeAdjustment})</p>
              {adjustment !== 0 && (
                <p className="font-medium text-gray-700">
                  New stock level will be: {item.quantityAvailable + adjustment} units
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Adjustment *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          >
            <option value="">Select reason</option>
            <option value="Received Shipment">Received Shipment</option>
            <option value="Damaged Goods">Damaged Goods</option>
            <option value="Theft/Loss">Theft/Loss</option>
            <option value="Returned Items">Returned Items</option>
            <option value="Inventory Count Correction">Inventory Count Correction</option>
            <option value="Expired Products">Expired Products</option>
            <option value="Sample/Demo Usage">Sample/Demo Usage</option>
            <option value="Transfer to Another Location">Transfer to Another Location</option>
            <option value="Quality Control Rejection">Quality Control Rejection</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Optional: Add any additional details about this adjustment"
          />
        </div>

        {/* Adjustment Preview */}
        {adjustment !== 0 && (
          <div className={`p-3 rounded-lg border ${
            adjustment > 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`text-lg ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {adjustment > 0 ? '📈' : '📉'}
              </span>
              <div>
                <p className={`font-medium ${adjustment > 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {adjustment > 0 ? 'Stock Increase' : 'Stock Decrease'}
                </p>
                <p className={`text-sm ${adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustment > 0 ? '+' : ''}{adjustment} units
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || !adjustment || !reason.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adjusting...' : 'Apply Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}