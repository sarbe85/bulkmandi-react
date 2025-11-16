// Copy from: seller/services/onboarding.service.ts
// Changes:
// 1. Base URL: /buyer/onboarding instead of /seller/onboarding
// 2. Remove catalogAPI methods
// 3. Add buyerPreferencesUpdate()

import apiClient from '@/api/api.client';
import type { BankDetailsFormData, BuyerPreferencesFormData, OrgKycFormData } from '../schemas/buyer-onboarding.schema';
import { DocumentUpload } from '../types/onboarding.types';

const BASE_URL = '/buyer/onboarding';

class BuyerOnboardingService {
  async getOnboardingStatus(): Promise<any> {
    try {
      const response = await apiClient.get(`${BASE_URL}/status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get status');
    }
  }

  async updateOrgKYC(data: OrgKycFormData): Promise<any> {
    try {
      const response = await apiClient.put(`${BASE_URL}/org-kyc`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update org KYC');
    }
  }

  async uploadSingleDocument(file: File, docType: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('docType', docType);
      const response = await apiClient.post(`${BASE_URL}/documents/upload`, formData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload');
    }
  }

  async deleteDocument(docType: string): Promise<any> {
    try {
      const response = await apiClient.delete(`${BASE_URL}/documents/${docType}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete');
    }
  }

  async updateBankDetails(data: BankDetailsFormData): Promise<any> {
    try {
      const response = await apiClient.put(`${BASE_URL}/bank`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update bank');
    }
  }

  async updateComplianceDocsWithDeclarations( declarations: {
        warrantyAssurance?: boolean;
        termsAccepted?: boolean;
        amlCompliance?: boolean;
      },
      documents: DocumentUpload[]): Promise<any> {
    try {
      const payload = {
        warrantyAssurance: declarations.warrantyAssurance,
        termsAccepted: declarations.termsAccepted,
        amlCompliance: declarations.amlCompliance,
        documents, // ✅ Pass file URLs from frontend
      };
      const response = await apiClient.put(`${BASE_URL}/docs`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update compliance');
    }
  }

  // ← NEW: Buyer preferences
  async updatePreferences(data: BuyerPreferencesFormData): Promise<any> {
    try {
      const response = await apiClient.put(`${BASE_URL}/preferences`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  }

  async submitOnboarding(payload: any): Promise<any> {
    try {
      const response = await apiClient.post(`${BASE_URL}/submit`, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit');
    }
  }

  async getOnboardingData(): Promise<any> {
    try {
      const response = await apiClient.get(`${BASE_URL}/data`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get data');
    }
  }

  // Helpers
  async verifyPennyDrop(accountNumber: string, ifsc: string): Promise<any> {
    try {
      const response = await apiClient.post('/organizations/verify-penny-drop', { accountNumber, ifsc });
      return response.data;
    } catch (error: any) {
      throw new Error('Verification failed');
    }
  }

  async fetchGSTIN(gstin: string): Promise<any> {
    try {
      const response = await apiClient.get(`/organizations/gstin-fetch?gstin=${gstin}`);
      return response.data;
    } catch (error: any) {
      throw new Error('Failed to fetch GSTIN');
    }
  }
}

export const buyerOnboardingService = new BuyerOnboardingService();
export default buyerOnboardingService;
