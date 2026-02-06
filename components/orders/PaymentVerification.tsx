'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface PaymentVerificationProps {
  payment: {
    _id: string;
    paymentId: string;
    status: string;
    amount: number;
    gateway: {
      transactionId?: string;
    };
    metadata: {
      proofSubmitted?: {
        screenshotPath?: string;
        transactionId?: string;
        submittedAt: string;
        status: string;
      };
    };
  };
  order: {
    _id: string;
    orderNumber: string;
    totals: {
      total: number;
    };
    customer?: {
      name: string;
      email: string;
    };
  };
  onPaymentAction: (paymentId: string, action: 'approve' | 'reject', message?: string) => Promise<void>;
  isProcessing: boolean;
}

export default function PaymentVerification({ 
  payment, 
  order, 
  onPaymentAction, 
  isProcessing 
}: PaymentVerificationProps) {
  const [adminMessage, setAdminMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const proofData = payment.metadata?.proofSubmitted;
  const hasScreenshot = proofData?.screenshotPath;
  const transactionId = proofData?.transactionId || payment.gateway?.transactionId;

  const handleApprove = async () => {
    await onPaymentAction(payment._id, 'approve', adminMessage || 'Payment verified and approved successfully.');
  };

  const handleReject = async () => {
    if (!adminMessage.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    await onPaymentAction(payment._id, 'reject', adminMessage);
    setShowRejectForm(false);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SUCCESS': 'bg-green-100 text-green-800 border-green-200',
      'FAILED': 'bg-red-100 text-red-800 border-red-200',
      'UNDER_REVIEW': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Payment Verification</h2>
              <p className="text-blue-100 text-sm">Order: {order.orderNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{payment.amount.toFixed(2)}</div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                {payment.status}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">💳</span>
                  Payment Information
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-gray-900">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">₹{payment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Amount:</span>
                    <span className="font-bold text-gray-900">₹{order.totals.total.toFixed(2)}</span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-gray-900">{transactionId}</span>
                    </div>
                  )}
                  {proofData?.submittedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="text-gray-900">
                        {new Date(proofData.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Customer Information
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-gray-900">{order.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{order.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-mono text-gray-900">{order.orderNumber}</span>
                  </div>
                </div>
              </div>

              {/* Verification Notes */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Verification Checklist
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>✓ Check transaction ID matches the screenshot</li>
                  <li>✓ Verify amount matches order total (₹{order.totals.total.toFixed(2)})</li>
                  <li>✓ Confirm payment gateway/UPI details</li>
                  <li>✓ Check timestamp is reasonable</li>
                </ul>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="space-y-4">
              {hasScreenshot ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📸</span>
                    Payment Screenshot
                  </h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="bg-white rounded-lg shadow-sm p-4 inline-block">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${proofData?.screenshotPath}`}
                        alt="Payment Screenshot"
                        width={300}
                        height={400}
                        className="rounded-lg shadow-sm max-w-full h-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="text-red-500 p-8">
                              <div class="text-4xl mb-2">❌</div>
                              <div>Failed to load screenshot</div>
                              <div class="text-sm text-gray-500 mt-1">Path: ${proofData?.screenshotPath}</div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📸</span>
                    Payment Screenshot
                  </h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <div>No screenshot provided</div>
                    <div className="text-sm mt-1">Only transaction ID submitted</div>
                  </div>
                </div>
              )}

              {/* Admin Message */}
              <div className="bg-white border rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message to Customer (Optional)
                </label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Add a message for the customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Close
            </button>

            <div className="flex space-x-3">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    disabled={isProcessing || payment.status === 'SUCCESS'}
                  >
                    <span className="mr-2">❌</span>
                    Reject Payment
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={isProcessing || payment.status === 'SUCCESS'}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">✅</span>
                        Approve Payment
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleReject}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={isProcessing || !adminMessage.trim()}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}