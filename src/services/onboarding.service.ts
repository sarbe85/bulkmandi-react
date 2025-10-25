/**
 * Onboarding Service
 * Handles seller onboarding and KYC status API calls
 */

import { apiClient } from './api.client';
import { API_CONFIG } from '@/config/api.config';
import {
  OnboardingRequest,
  OnboardingResponse,
  KYCStatusResponse,
  GSTINFetchResponse,
  OnboardingData
} from '@/types/onboarding.types';

export const onboardingService = {
  /**
   * Fetch GSTIN details
   */
  fetchGSTIN: async (gstin: string): Promise<GSTINFetchResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      legalName: 'Steel Manufacturing Private Limited',
      tradeName: 'Steel Manufacturing Ltd',
      registrationDate: '2015-07-01',
      address: 'Industrial Complex, Sector 5, GIDC, Raipur, Chhattisgarh - 492001',
      status: 'Active'
    };
  },

  /**
   * Save draft onboarding data
   */
  saveDraft: async (data: Partial<OnboardingData>): Promise<{ success: boolean }> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store in localStorage as mock
    localStorage.setItem('onboarding_draft', JSON.stringify(data));
    
    return { success: true };
  },

  /**
   * Get current onboarding draft
   */
  getDraft: async (): Promise<OnboardingData | null> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const draft = localStorage.getItem('onboarding_draft');
    return draft ? JSON.parse(draft) : null;
  },

  /**
   * Submit complete onboarding
   */
  submitOnboarding: async (data: OnboardingRequest): Promise<OnboardingResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear draft after submission
    localStorage.removeItem('onboarding_draft');
    
    // Update user's onboarding status
    const userData = localStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      user.onboardingCompleted = true;
      localStorage.setItem('user_data', JSON.stringify(user));
    }
    
    return {
      success: true,
      onboardingId: 'ONB-' + Date.now(),
      status: 'submitted',
      message: 'Your onboarding has been submitted and is under review',
    };
  },

  /**
   * Upload document
   */
  uploadDocument: async (file: File, documentType: string): Promise<{ fileUrl: string }> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock URL
    const mockUrl = `https://mock-storage.example.com/documents/${documentType}/${file.name}`;
    
    return { fileUrl: mockUrl };
  },

  /**
   * Verify penny drop
   */
  verifyPennyDrop: async (accountNumber: string, ifscCode: string): Promise<{ 
    verified: boolean;
    accountName: string;
    matchScore?: number;
  }> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      verified: true,
      accountName: 'STEEL MANUFACTURING PRIVATE LIMITED',
      matchScore: 98
    };
  },

  /**
   * Get KYC status
   */
  getKYCStatus: async (): Promise<KYCStatusResponse> => {
    // Mock implementation - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      overallStatus: 'approved',
      checks: {
        gstin: {
          name: 'GSTIN Verification',
          status: 'validated',
          message: 'GSTIN verified successfully',
          verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        pan: {
          name: 'PAN Verification',
          status: 'validated',
          message: 'PAN verified successfully',
          verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        bank: {
          name: 'Bank Account Verification',
          status: 'validated',
          message: 'Bank account verified via penny drop',
          verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        watchlist: {
          name: 'Watchlist Screening',
          status: 'validated',
          message: 'No matches found in watchlist',
          verifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        factoryLicense: {
          name: 'Factory License',
          status: 'validated',
          message: 'Factory license documents verified',
          verifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      },
      nextSteps: [],
      canStartQuoting: true
    };
  },

  /**
   * Refresh KYC checks
   */
  refreshKYCStatus: async (): Promise<KYCStatusResponse> => {
    // Just call getKYCStatus for mock
    return onboardingService.getKYCStatus();
  },
};

/**
 * Usage Example:
 * 
 * import { onboardingService } from '@/services/onboarding.service';
 * 
 * // Fetch GSTIN
 * const gstData = await onboardingService.fetchGSTIN('27AAECS1234K1Z5');
 * 
 * // Submit onboarding
 * const result = await onboardingService.submitOnboarding({
 *   orgKyc: { ... },
 *   bankDocs: { ... },
 *   catalog: { ... }
 * });
 * 
 * // Get KYC status
 * const status = await onboardingService.getKYCStatus();
 */
