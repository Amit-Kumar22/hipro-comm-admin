import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL, getAdminAuthHeaders } from '@/redux/config/api.config';

export interface PaymentVerification {
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

export interface PaymentVerificationStats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
  fraudCases: number;
  recentVerifications: number;
  verificationRate: string;
  rejectionRate: string;
}

interface PaymentVerificationState {
  verifications: PaymentVerification[];
  loading: boolean;
  error: string | null;
  stats: PaymentVerificationStats | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

const initialState: PaymentVerificationState = {
  verifications: [],
  loading: false,
  error: null,
  stats: null,
  pagination: null,
};

// Fetch payment verifications
export const fetchPaymentVerifications = createAsyncThunk(
  'paymentVerification/fetchPaymentVerifications',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${API_BASE_URL}/admin/payment-verifications?${queryParams.toString()}`,
        { headers: getAdminAuthHeaders() }
      );
      
      return response.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.message || 'Failed to fetch payment verifications',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Get payment verification statistics
export const getPaymentVerificationStats = createAsyncThunk(
  'paymentVerification/getPaymentVerificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/payment-verifications/stats`,
        { headers: getAdminAuthHeaders() }
      );
      
      return response.data.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.message || 'Failed to fetch payment verification stats',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Approve payment verification
export const approvePaymentVerification = createAsyncThunk(
  'paymentVerification/approvePaymentVerification',
  async (params: { id: string; adminNotes?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/payment-verifications/${params.id}/approve`,
        { adminNotes: params.adminNotes },
        { headers: getAdminAuthHeaders() }
      );
      
      return response.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.message || 'Failed to approve payment verification',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

// Reject payment verification
export const rejectPaymentVerification = createAsyncThunk(
  'paymentVerification/rejectPaymentVerification',
  async (params: { 
    id: string; 
    rejectionReason: string; 
    adminNotes?: string; 
    cancelOrder?: boolean 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/payment-verifications/${params.id}/reject`,
        {
          rejectionReason: params.rejectionReason,
          adminNotes: params.adminNotes,
          cancelOrder: params.cancelOrder
        },
        { headers: getAdminAuthHeaders() }
      );
      
      return response.data;
    } catch (error: any) {
      const errorResponse = {
        message: error.response?.data?.message || 'Failed to reject payment verification',
        details: error.response?.data?.details || null
      };
      return rejectWithValue(errorResponse);
    }
  }
);

const paymentVerificationSlice = createSlice({
  name: 'paymentVerification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPaymentVerifications: (state) => {
      state.verifications = [];
      state.pagination = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch payment verifications
      .addCase(fetchPaymentVerifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentVerifications.fulfilled, (state, action) => {
        state.loading = false;
        state.verifications = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPaymentVerifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get stats
      .addCase(getPaymentVerificationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentVerificationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getPaymentVerificationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve verification
      .addCase(approvePaymentVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePaymentVerification.fulfilled, (state, action) => {
        state.loading = false;
        // Update the verification in the list
        const index = state.verifications.findIndex(v => v._id === action.meta.arg.id);
        if (index !== -1) {
          state.verifications[index].verificationStatus = 'verified';
          state.verifications[index].verifiedAt = new Date().toISOString();
          state.verifications[index].verifiedBy = action.payload.data.verifiedBy;
          if (action.meta.arg.adminNotes) {
            state.verifications[index].adminNotes = action.meta.arg.adminNotes;
          }
        }
      })
      .addCase(approvePaymentVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reject verification
      .addCase(rejectPaymentVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPaymentVerification.fulfilled, (state, action) => {
        state.loading = false;
        // Update the verification in the list
        const index = state.verifications.findIndex(v => v._id === action.meta.arg.id);
        if (index !== -1) {
          state.verifications[index].verificationStatus = 'rejected';
          state.verifications[index].verifiedAt = new Date().toISOString();
          state.verifications[index].verifiedBy = action.payload.data.verifiedBy;
          state.verifications[index].rejectionReason = action.meta.arg.rejectionReason;
          if (action.meta.arg.adminNotes) {
            state.verifications[index].adminNotes = action.meta.arg.adminNotes;
          }
          if (action.meta.arg.cancelOrder) {
            state.verifications[index].orderCancelledDueToFraud = true;
          }
        }
      })
      .addCase(rejectPaymentVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPaymentVerifications } = paymentVerificationSlice.actions;
export default paymentVerificationSlice.reducer;