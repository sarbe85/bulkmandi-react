// src/features/shared/services/onboarding.service.ts

import apiClient from '@/api/api.client';
import type {
  BankDetailsFormData,
  BuyerPreferencesFormData,
  CatalogFormData,
  ComplianceFormData,
  OnboardingResponse,
  OrgKycFormData,
} from '../types/onboarding.types';

const API_BASE = '/user/onboarding';

class OnboardingService {
  // ========== GET METHODS ==========

  /**
   * Get all onboarding data for current user
   */
  async getData(): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get(`${API_BASE}/data`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch onboarding data');
    }
  }

  /**
   * Get onboarding progress
   */
  async getProgress(): Promise<any> {
    try {
      const response = await apiClient.get(`${API_BASE}/progress`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch progress');
    }
  }

  // ========== ORG KYC (ALL ROLES) ==========

  /**
   * Update Organization KYC details
   * Endpoint: PUT /user/onboarding/org-kyc
   */
  async updateOrgKyc(data: OrgKycFormData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${API_BASE}/org-kyc`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update organization KYC'
      );
    }
  }

  // ========== BANK DETAILS (ALL ROLES) ==========

  /**
   * Update Bank Details
   * Endpoint: PUT /user/onboarding/bank-details
   */
  async updateBankDetails(data: BankDetailsFormData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${API_BASE}/bank-details`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update bank details');
    }
  }

  /**
   * Verify Penny Drop (bank account verification)
   * Endpoint: POST /user/onboarding/verify-penny-drop
   */
  async verifyPennyDrop(
    accountNumber: string,
    ifsc: string
  ): Promise<{ score: number; status: string; accountHolderName?: string }> {
    try {
      const response = await apiClient.post(`${API_BASE}/verify-penny-drop`, {
        accountNumber,
        ifsc,
      });
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Penny drop verification failed'
      );
    }
  }

  // ========== DOCUMENTS (ALL ROLES) ==========

  /**
   * Upload a document
   * Endpoint: POST /user/onboarding/documents/upload
   */
  async uploadDocument(
    file: File,
    docType: string
  ): Promise<{
    docType: string;
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
    status: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);

      const response = await apiClient.post(
        `${API_BASE}/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Document upload failed');
    }
  }

  /**
   * Delete a document
   * Endpoint: DELETE /user/onboarding/documents/{docType}
   */
  async deleteDocument(docType: string): Promise<any> {
    try {
      const response = await apiClient.delete(
        `${API_BASE}/documents/${docType}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  }

  // ========== COMPLIANCE (ALL ROLES) ==========

  /**
   * Update Compliance Documents & Declarations
   * Endpoint: PUT /user/onboarding/compliance-docs
   */
  async updateCompliance(data: ComplianceFormData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${API_BASE}/compliance-docs`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update compliance documents'
      );
    }
  }

  // ========== BUYER PREFERENCES (BUYER ONLY) ==========

  /**
   * Update Buyer Preferences
   * Endpoint: PUT /user/onboarding/buyer-preferences
   * Note: 403 Forbidden if user is not BUYER role
   */
  async updateBuyerPreferences(
    data: BuyerPreferencesFormData
  ): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${API_BASE}/buyer-preferences`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          'Buyer preferences are only available for BUYER role users'
        );
      }
      throw new Error(
        error.response?.data?.message || 'Failed to update buyer preferences'
      );
    }
  }

  // ========== CATALOG (SELLER ONLY) ==========

  /**
   * Update Catalog & Pricing
   * Endpoint: PUT /user/onboarding/catalog
   * Note: 403 Forbidden if user is not SELLER role
   */
  async updateCatalog(data: CatalogFormData): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.put(`${API_BASE}/catalog`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('Catalog is only available for SELLER role users');
      }
      throw new Error(
        error.response?.data?.message || 'Failed to update catalog'
      );
    }
  }

  // ========== SUBMIT FOR KYC ==========

  /**
   * Submit onboarding for KYC verification
   * Endpoint: POST /user/onboarding/submit
   * This locks the onboarding and sends for admin review
   */
  async submit(): Promise<OnboardingResponse> {
    try {
      const response = await apiClient.get(`${API_BASE}/submit`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to submit onboarding'
      );
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Check if onboarding is completed for current step
   */
  async isStepCompleted(stepId: string): Promise<boolean> {
    try {
      const data = await this.getData();
      return data.completedSteps?.includes(stepId) || false;
    } catch {
      return false;
    }
  }

  /**
   * Get current progress percentage
   */
  async getProgressPercentage(): Promise<number> {
    try {
      const data = await this.getData();
      return data.currentProgress || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if user can proceed with onboarding
   */
  isOnboardingAvailable(data: OnboardingResponse | null): boolean {
    if (!data) return false;
    return (
      !data.isOnboardingLocked &&
      data.kycStatus !== 'SUBMITTED' &&
      data.kycStatus !== 'APPROVED'
    );
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();
export default onboardingService;
