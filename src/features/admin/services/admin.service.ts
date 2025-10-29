/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_CONFIG, STORAGE_KEYS } from "@/config/api.config";

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// API request helper with AbortController for timeout
const apiRequest = async (
  method: string,
  endpoint: string,
  body?: any
): Promise<any> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // ✅ FIXED: Use AbortController instead of timeout in RequestInit
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const options: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.HEADERS,
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export interface KYCSubmission {
  _id: string;
  legalName: string;
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  completedSteps: string[];
  orgKyc?: any;
  primaryBankAccount?: any;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  /**
   * Get all pending KYC submissions
   * Endpoint: GET /organizations/admin/kyc/pending
   */
  async getPendingKYC(): Promise<KYCSubmission[]> {
    try {
      const response = await apiRequest(
        'GET',
        '/organizations/admin/kyc/pending'
      );
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Failed to fetch pending KYC submissions:', error);
      throw error;
    }
  },

  /**
   * Get KYC submission details
   * Endpoint: GET /organizations/admin/kyc/:orgId
   */
  async getKYCDetails(orgId: string): Promise<KYCSubmission> {
    try {
      const response = await apiRequest(
        'GET',
        `/organizations/admin/kyc/${orgId}`
      );
      return response;
    } catch (error) {
      console.error(`Failed to fetch KYC details for org ${orgId}:`, error);
      throw error;
    }
  },

  /**
   * Approve KYC submission
   * Endpoint: POST /organizations/admin/kyc/:orgId/approve
   */
  async approveKYC(
    orgId: string,
    remarks?: string
  ): Promise<KYCSubmission> {
    try {
      const response = await apiRequest(
        'POST',
        `/organizations/admin/kyc/${orgId}/approve`,
        { remarks: remarks || 'Approved by admin' }
      );
      return response;
    } catch (error) {
      console.error(`Failed to approve KYC for org ${orgId}:`, error);
      throw error;
    }
  },

  /**
   * Reject KYC submission
   * Endpoint: POST /organizations/admin/kyc/:orgId/reject
   */
  async rejectKYC(
    orgId: string,
    remarks: string
  ): Promise<KYCSubmission> {
    try {
      if (!remarks) {
        throw new Error('Rejection remarks are required');
      }

      const response = await apiRequest(
        'POST',
        `/organizations/admin/kyc/${orgId}/reject`,
        { remarks }
      );
      return response;
    } catch (error) {
      console.error(`Failed to reject KYC for org ${orgId}:`, error);
      throw error;
    }
  },

  /**
   * Get KYC verification statistics
   */
  async getKYCStats(): Promise<any> {
    try {
      const pending = await this.getPendingKYC();
      return {
        totalPending: pending.length,
        pendingCount: pending.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch KYC statistics:', error);
      throw error;
    }
  },
};

export default adminService;