'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchPaymentVerifications, 
  approvePaymentVerification, 
  rejectPaymentVerification,
  getPaymentVerificationStats
} from '@/redux/slices/paymentVerificationSlice';
import { 
  Shield, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  User, 
  CreditCard, 
  AlertTriangle,
  FileX,
  TrendingUp,
  Activity
} from 'lucide-react';

interface PaymentVerification {
  _id: string;
  orderId?: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  customerInfo?: {
    email: string;
    name: string;
    phone?: string;
  };
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  orderCancelledDueToFraud?: boolean;
  screenshotBase64?: string;
}

export default function PaymentHistoryPage() {
  const dispatch = useAppDispatch();
  const { verifications, loading, error, pagination, stats } = useAppSelector(
    (state) => state.paymentVerification
  );

  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [cancelOrder, setCancelOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getPaymentVerificationStats());
    fetchVerifications();
  }, [dispatch, currentPage, statusFilter]);

  const fetchVerifications = () => {
    const params: any = { page: currentPage, limit: 20 };
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    dispatch(fetchPaymentVerifications(params));
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    try {
      await dispatch(approvePaymentVerification({
        id: selectedVerification._id,
        adminNotes
      })).unwrap();
      
      setShowApprovalModal(false);
      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
    } catch (error) {
      console.error('Failed to approve payment:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    
    try {
      await dispatch(rejectPaymentVerification({
        id: selectedVerification._id,
        rejectionReason,
        adminNotes,
        cancelOrder
      })).unwrap();
      
      setShowRejectionModal(false);
      setSelectedVerification(null);
      setRejectionReason('');
      setAdminNotes('');
      setCancelOrder(false);
      fetchVerifications();
    } catch (error) {
      console.error('Failed to reject payment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center">
              <Shield className="mr-2" size={20} />
              Payment Verification
            </h1>
            <p className="text-slate-300 text-sm mt-1">Manage payment screenshots and fraud detection</p>
          </div>
          
          {/* Compact Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-center min-w-[60px]">
                <Activity className="mx-auto mb-1" size={16} />
                <div className="text-lg font-semibold">{stats.pending}</div>
                <div className="text-xs text-slate-300">Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-center min-w-[60px]">
                <Check className="mx-auto mb-1" size={16} />
                <div className="text-lg font-semibold">{stats.verified}</div>
                <div className="text-xs text-slate-300">Verified</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-center min-w-[60px]">
                <X className="mx-auto mb-1" size={16} />
                <div className="text-lg font-semibold">{stats.rejected}</div>
                <div className="text-xs text-slate-300">Rejected</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-center min-w-[60px]">
                <AlertTriangle className="mx-auto mb-1" size={16} />
                <div className="text-lg font-semibold">{stats.fraudCases}</div>
                <div className="text-xs text-slate-300">Fraud</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Filters */}
      <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded shadow-sm">
        <label className="text-sm font-medium text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Compact Payment Verifications Table */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Customer & Order
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Transaction Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Screenshot
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {verifications.map((verification) => (
                <tr key={verification._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="font-medium text-sm text-gray-900">
                        {verification.customerInfo?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {verification.customerInfo?.email}
                      </div>
                      {verification.orderId && (
                        <div className="text-xs text-blue-600 font-mono">
                          {verification.orderId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-gray-900">
                        ₹{verification.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {verification.transactionId}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(verification.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {verification.screenshotBase64 ? (
                      <div className="relative">
                        <img
                          src={verification.screenshotBase64}
                          alt="Payment Screenshot"
                          className="w-16 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const newWindow = window.open();
                            newWindow!.document.write(`
                              <html>
                                <head><title>Payment Screenshot</title></head>
                                <body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                                  <img src="${verification.screenshotBase64}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                                </body>
                              </html>
                            `);
                          }}
                        />
                        <Eye className="absolute top-0.5 right-0.5 w-3 h-3 text-white bg-black bg-opacity-60 rounded-full p-0.5" />
                      </div>
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <FileX className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(verification.verificationStatus)}`}>
                        {verification.verificationStatus}
                      </span>
                      {verification.orderCancelledDueToFraud && (
                        <div className="text-xs text-red-600 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Fraud
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex space-x-1">
                      {verification.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedVerification(verification);
                              setShowApprovalModal(true);
                            }}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center transition-colors"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVerification(verification);
                              setShowRejectionModal(true);
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center transition-colors"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {verification.verificationStatus !== 'pending' && (
                        <div className="text-xs text-gray-500 space-y-0.5">
                          {verification.verifiedBy && <div>By: {verification.verifiedBy}</div>}
                          {verification.verifiedAt && (
                            <div>{new Date(verification.verifiedAt).toLocaleDateString()}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, pagination.totalItems)} of {pagination.totalItems}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPrev}
                className="px-2 py-1 rounded text-xs disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Prev
              </button>
              <span className="px-2 py-1 text-xs text-gray-600">
                {currentPage}/{pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={!pagination.hasNext}
                className="px-2 py-1 rounded text-xs disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compact Approval Modal */}
      {showApprovalModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Approve Payment</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Approve payment verification for ₹{selectedVerification.amount}?
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                rows={2}
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleApprove}
                className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedVerification(null);
                  setAdminNotes('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Rejection Modal */}
      {showRejectionModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-red-600">Reject Payment</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Reject payment verification for ₹{selectedVerification.amount}?
            </p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="">Select reason...</option>
                <option value="Invalid screenshot">Invalid screenshot</option>
                <option value="Amount mismatch">Amount mismatch</option>
                <option value="Fake transaction ID">Fake transaction ID</option>
                <option value="Duplicate transaction">Duplicate transaction</option>
                <option value="Suspected fraud">Suspected fraud</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={cancelOrder}
                  onChange={(e) => setCancelOrder(e.target.checked)}
                  className="mr-2 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm text-red-600 font-medium">
                  Cancel order (fraud)
                </span>
              </label>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={2}
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedVerification(null);
                  setRejectionReason('');
                  setAdminNotes('');
                  setCancelOrder(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}