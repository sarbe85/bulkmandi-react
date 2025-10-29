/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_CONFIG, STORAGE_KEYS } from '@/config/api.config';
import { OnboardingResponse } from '@/features/seller/types/onboarding.types';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// Make API requests
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

  if (body && method !== 'GET') {
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

// Admin KYC Service
export const kycService = {
  /**
   * Get all pending KYC submissions
   * GET /organizations/admin/kyc/pending
   */
  async getPendingKYCs(): Promise<OnboardingResponse[]> {
    try {
      const response = await apiRequest(
        'GET',
        '/organizations/admin/kyc/pending'
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch pending KYCs:', error);
      throw error;
    }
  },

  /**
   * Approve a KYC submission
   * POST /organizations/admin/kyc/:orgId/approve
   */
  async approveKYC(orgId: string, remarks: string): Promise<any> {
    try {
      const response = await apiRequest(
        'POST',
        `/organizations/admin/kyc/${orgId}/approve`,
        { remarks }
      );
      return response;
    } catch (error) {
      console.error('Failed to approve KYC:', error);
      throw error;
    }
  },

  /**
   * Reject a KYC submission
   * POST /organizations/admin/kyc/:orgId/reject
   */
  async rejectKYC(orgId: string, remarks: string): Promise<any> {
    try {
      const response = await apiRequest(
        'POST',
        `/organizations/admin/kyc/${orgId}/reject`,
        { remarks }
      );
      return response;
    } catch (error) {
      console.error('Failed to reject KYC:', error);
      throw error;
    }
  },

  /**
   * Get specific KYC detail
   * GET /organizations/admin/kyc/:orgId
   */
  async getKYCDetail(orgId: string): Promise<OnboardingResponse> {
    try {
      const response = await apiRequest(
        'GET',
        `/organizations/admin/kyc/${orgId}`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch KYC detail:', error);
      throw error;
    }
  },

  /**
   * Search KYCs by status
   * GET /organizations/admin/kyc?status=SUBMITTED
   */
  async searchKYCs(status: string): Promise<OnboardingResponse[]> {
    try {
      const response = await apiRequest(
        'GET',
        `/organizations/admin/kyc?status=${status}`
      );
      return response;
    } catch (error) {
      console.error('Failed to search KYCs:', error);
      throw error;
    }
  },
};

export default kycService;