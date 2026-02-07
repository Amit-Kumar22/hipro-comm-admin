'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PaymentVerification {
  id: string;
  orderId: string;
  transactionId: string;
  amount: number;
  screenshotPath: string;
  screenshotFilename: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function PaymentVerificationPage() {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      // Fetch actual data from your API
      const response = await fetch('/api/v1/admin/payment-verifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched payment verifications:', data);
      
      if (data.success && data.data) {
        setVerifications(data.data);
      } else {
        console.error('API returned unsuccessful response:', data);
        setVerifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
      // Show empty state instead of mock data on error
      setVerifications([]);
      alert('Failed to load payment verifications. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (verificationId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      // Send to actual backend API
      const response = await fetch(`/api/v1/admin/payment-verifications/${verificationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...(reason && { rejectionReason: reason })
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} verification: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setVerifications(prev => prev.map(v => 
          v.id === verificationId 
            ? { 
                ...v, 
                verificationStatus: action === 'approve' ? 'verified' : 'rejected',
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'admin',
                rejectionReason: reason
              }
            : v
        ));
        
        setSelectedVerification(null);
        alert(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        throw new Error(result.message || `Failed to ${action} verification`);
      }
    } catch (error) {
      console.error(`Failed to ${action} verification:`, error);
      alert(`Failed to ${action} verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading payment verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Payment Verification Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Review and verify customer payment screenshots
              </p>
            </div>
            <button
              onClick={() => fetchVerifications()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          {verifications.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No payment verifications found</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Payment verification requests will appear here when customers submit payment screenshots.
              </p>
            </div>
          ) : (
            // Table with data
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {verifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {verification.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {verification.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ₹{verification.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(verification.verificationStatus)}`}>
                        {verification.verificationStatus.charAt(0).toUpperCase() + verification.verificationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {new Date(verification.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        View Screenshot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Screenshot Modal */}
        {selectedVerification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Payment Verification - {selectedVerification.orderId}
                  </h3>
                  <button
                    onClick={() => setSelectedVerification(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Payment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Order ID:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100">{selectedVerification.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Transaction ID:</span>
                          <span className="font-mono text-slate-900 dark:text-slate-100">{selectedVerification.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">₹{selectedVerification.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Status:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedVerification.verificationStatus)}`}>
                            {selectedVerification.verificationStatus.charAt(0).toUpperCase() + selectedVerification.verificationStatus.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Submitted:</span>
                          <span className="text-slate-900 dark:text-slate-100">{new Date(selectedVerification.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {selectedVerification.verificationStatus === 'pending' && (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleVerificationAction(selectedVerification.id, 'approve')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                        >
                          Approve Payment
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              handleVerificationAction(selectedVerification.id, 'reject', reason);
                            }
                          }}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                        >
                          Reject Payment
                        </button>
                      </div>
                    )}

                    {selectedVerification.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2">Rejection Reason:</h5>
                        <p className="text-sm text-red-700 dark:text-red-400">{selectedVerification.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Screenshot */}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Payment Screenshot</h4>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
                      <div className="relative w-full h-96">
                        <img
                          src={`/api/v1/uploads/payment-proofs/${selectedVerification.screenshotFilename}`}
                          alt="Payment Screenshot"
                          className="w-full h-full object-contain rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2Njc2YiI+U2NyZWVuc2hvdCBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+";
                          }}
                        />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
                        {selectedVerification.screenshotFilename}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}