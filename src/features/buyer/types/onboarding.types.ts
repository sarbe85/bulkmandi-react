// Copy from: seller/types/onboarding.types.ts
// Changes:
// 1. Remove CATALOGANDPRICE step
// 2. Add USER_PREFERENCES step  
// 3. Add BuyerPreferencesData interface
// 4. Add secondaryContact to org types

export const ONBOARDING_STEPS = {
  ORG_KYC: 'org-kyc',
  BANK_DETAILS: 'bank-details',
  COMPLIANCE_DOCS: 'compliance-docs',
  USER_PREFERENCES: 'user-preferences',  // ← NEW
  REVIEW: 'review',
} as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

export const ONBOARDING_STEP_LIST = Object.values(ONBOARDING_STEPS) as OnboardingStep[];

export const ONBOARDING_STEP_LABELS: Record<OnboardingStep, string> = {
  [ONBOARDING_STEPS.ORG_KYC]: 'Organization Details',
  [ONBOARDING_STEPS.BANK_DETAILS]: 'Bank Details',
  [ONBOARDING_STEPS.COMPLIANCE_DOCS]: 'Compliance Documents',
  [ONBOARDING_STEPS.USER_PREFERENCES]: 'Buying Preferences',
  [ONBOARDING_STEPS.REVIEW]: 'Review & Submit',
};

// Types (from DTOs)
export interface ContactPerson {
  name: string;
  email: string;
  mobile: string;
  role?: string;
}

export interface PlantLocation {
  name?: string;
  address?: string;
  state?: string;
  pin?: string;
  pincode?: string;
  country?: string;
}

export interface DocumentUpload {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Buyer-specific
export interface BuyerPreferencesData {
  categories: string[];
  typicalMonthlyVolumeMT?: number;
  incoterms: string[];
  deliveryPins: string[];
  acceptanceWindow: '24h' | '48h' | '72h';
  qcRequirement: 'VISUAL_WEIGHT' | 'LAB_REQUIRED';
  notifyEmail?: boolean;
  notifySMS?: boolean;
  notifyWhatsApp?: boolean;
  notes?: string;
}

export interface OnboardingResponse {
  organizationId: string;
  legalName?: string;
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  isEditable: boolean;
  isOnboardingLocked?: boolean;
  completedSteps: string[];
  orgKyc?: any;
  primaryBankAccount?: any;
  complianceDocuments?: any;
  buyerPreferences?: BuyerPreferencesData;
  latestSubmission?: {
    submissionNumber: string;
    status: string;
    submissionAttempt: number;
  };
}

export type KYCStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
