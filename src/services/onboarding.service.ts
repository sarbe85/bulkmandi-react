/**
 * Onboarding Service
 * Handles seller onboarding and KYC status API calls
 * Mock implementation using localStorage to simulate backend
 */

import { apiClient } from './api.client';
import { API_CONFIG } from '@/config/api.config';
import {
  OnboardingRequest,
  OnboardingResponse,
  KYCStatusResponse,
  GSTINFetchResponse,
  OnboardingData,
  OrgKYCData,
  BankDocData
} from '@/types/onboarding.types';

// Helper to get current organization ID from user data
const getOrganizationId = (): string => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    const user = JSON.parse(userData);
    return user.organizationId || 'ORG_' + user.id;
  }
  return 'ORG_DEFAULT';
};

// Helper to get organization data
const getOrganization = () => {
  const orgId = getOrganizationId();
  const orgData = localStorage.getItem(`organization_${orgId}`);
  
  if (orgData) {
    return JSON.parse(orgData);
  }
  
  // Initialize new organization
  const userData = localStorage.getItem('user_data');
  const user = userData ? JSON.parse(userData) : {};
  
  const newOrg = {
    _id: orgId,
    legalName: user.companyName || 'New Organization',
    role: 'SELLER',
    kycStatus: 'DRAFT',
    completedSteps: [],
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(`organization_${orgId}`, JSON.stringify(newOrg));
  return newOrg;
};

// Helper to save organization data
const saveOrganization = (org: any) => {
  org.updatedAt = new Date().toISOString();
  localStorage.setItem(`organization_${org._id}`, JSON.stringify(org));
  return org;
};

export const onboardingService = {
  /**
   * Fetch GSTIN details
   */
  fetchGSTIN: async (gstin: string): Promise<GSTINFetchResponse> => {
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
   * Update Organization KYC Details
   * PUT /organizations/my-organization/onboarding/kyc
   */
  updateOrgKYC: async (kycData: OrgKYCData): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const org = getOrganization();
    
    // Merge KYC data
    org.orgKyc = kycData;
    
    // Add to completed steps if not present
    if (!org.completedSteps.includes('orgKyc')) {
      org.completedSteps.push('orgKyc');
    }
    
    return saveOrganization(org);
  },

  /**
   * Update Bank Details
   * PUT /organizations/my-organization/onboarding/bank
   */
  updateBankDetails: async (bankData: BankDocData): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const org = getOrganization();
    
    // Transform to match backend structure
    org.primaryBankAccount = {
      accountNumber: bankData.accountNumber,
      ifsc: bankData.ifscCode,
      bankName: 'HDFC Bank', // Would come from IFSC lookup
      accountHolderName: bankData.accountName,
      accountType: 'Current',
      pennyDropStatus: bankData.isPennyDropVerified ? 'VERIFIED' : 'PENDING',
      pennyDropScore: bankData.isPennyDropVerified ? 100 : 0,
      documents: bankData.documents.map(doc => ({
        type: doc.type,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
        status: doc.status
      }))
    };
    
    // Add to completed steps if not present
    if (!org.completedSteps.includes('bankDetails')) {
      org.completedSteps.push('bankDetails');
    }
    
    return saveOrganization(org);
  },

  /**
   * Get Onboarding Status
   * GET /organizations/my-organization/onboarding
   */
  getOnboardingStatus: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const org = getOrganization();
    
    return {
      organizationId: org._id,
      legalName: org.legalName,
      kycStatus: org.kycStatus,
      completedSteps: org.completedSteps || [],
      orgKyc: org.orgKyc || null,
      primaryBankAccount: org.primaryBankAccount || null,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    };
  },

  /**
   * Submit Onboarding for Review
   * POST /organizations/my-organization/onboarding/submit
   */
  submitOnboarding: async (): Promise<OnboardingResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const org = getOrganization();
    
    // Validate required steps
    const requiredSteps = ['orgKyc', 'bankDetails'];
    const hasAllSteps = requiredSteps.every(step => 
      org.completedSteps.includes(step)
    );
    
    if (!hasAllSteps) {
      throw new Error('Please complete all required steps before submitting');
    }
    
    // Update status to SUBMITTED
    org.kycStatus = 'SUBMITTED';
    org.submittedAt = new Date().toISOString();
    
    saveOrganization(org);
    
    // Add to pending KYC queue
    const pendingQueue = JSON.parse(localStorage.getItem('kyc_pending_queue') || '[]');
    if (!pendingQueue.find((item: any) => item._id === org._id)) {
      pendingQueue.push({
        _id: org._id,
        legalName: org.legalName,
        kycStatus: org.kycStatus,
        submittedAt: org.submittedAt
      });
      localStorage.setItem('kyc_pending_queue', JSON.stringify(pendingQueue));
    }
    
    return {
      success: true,
      onboardingId: org._id,
      status: 'submitted',
      message: 'Your onboarding has been submitted and is under review',
    };
  },

  /**
   * Upload document
   */
  uploadDocument: async (file: File, documentType: string): Promise<{ fileUrl: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const org = getOrganization();
    
    // Map kycStatus to checks
    const isApproved = org.kycStatus === 'APPROVED';
    const isSubmitted = org.kycStatus === 'SUBMITTED';
    
    return {
      overallStatus: org.kycStatus.toLowerCase() as any,
      checks: {
        gstin: {
          name: 'GSTIN Verification',
          status: isApproved ? 'validated' : isSubmitted ? 'pending' : 'not_started',
          message: isApproved ? 'GSTIN verified successfully' : 'Pending verification',
          verifiedAt: isApproved ? org.kycApprovedAt : undefined
        },
        pan: {
          name: 'PAN Verification',
          status: isApproved ? 'validated' : isSubmitted ? 'pending' : 'not_started',
          message: isApproved ? 'PAN verified successfully' : 'Pending verification',
          verifiedAt: isApproved ? org.kycApprovedAt : undefined
        },
        bank: {
          name: 'Bank Account Verification',
          status: org.primaryBankAccount?.pennyDropStatus === 'VERIFIED' ? 'validated' : 'pending',
          message: org.primaryBankAccount?.pennyDropStatus === 'VERIFIED' 
            ? 'Bank account verified via penny drop' 
            : 'Pending verification',
          verifiedAt: isApproved ? org.kycApprovedAt : undefined
        },
        watchlist: {
          name: 'Watchlist Screening',
          status: isApproved ? 'validated' : 'pending',
          message: isApproved ? 'No matches found in watchlist' : 'Pending screening',
          verifiedAt: isApproved ? org.kycApprovedAt : undefined
        },
        factoryLicense: {
          name: 'Factory License',
          status: isApproved ? 'validated' : isSubmitted ? 'pending' : 'not_started',
          message: isApproved ? 'Factory license documents verified' : 'Pending verification',
          verifiedAt: isApproved ? org.kycApprovedAt : undefined
        }
      },
      nextSteps: isApproved ? [] : ['Complete pending verifications'],
      canStartQuoting: isApproved,
      rejectionReasons: org.kycStatus === 'REJECTED' ? [org.rejectionRemarks || 'KYC rejected'] : undefined
    };
  },

  /**
   * Refresh KYC checks
   */
  refreshKYCStatus: async (): Promise<KYCStatusResponse> => {
    return onboardingService.getKYCStatus();
  },
};
