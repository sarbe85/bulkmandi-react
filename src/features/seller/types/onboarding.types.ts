/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Onboarding Types - UPDATED FOR NEW STRUCTURE
 * Path: src/features/seller/types/onboarding.types.ts
 */

// Step types
export type OnboardingStep =
  | 'org-kyc'
  | 'bank-details'
  | 'compliance-docs'
  | 'catalog'
  | 'review';

// ===== ORG KYC TYPES =====
export interface PlantLocation {
  id?: string;
  street?: string;
  name?: string;
  city: string;
  state: string;
  pincode?: string;
  pin?: string;
  isActive?: boolean;
}

export interface OrgKYCData {
  legalName: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  cin?: string;
  registeredAddress: string;
  businessType: string;
  incorporationDate: string;
  plantLocations?: PlantLocation[];
  primaryContact: {
    name: string;
    email: string;
    mobile: string;
    role?: string;
  };
}

// ===== BANK DETAILS TYPES =====
export type DocumentType =
  | 'CANCELLED_CHEQUE'
  | 'GST_CERTIFICATE'
  | 'PAN_CERTIFICATE'
  | 'BUSINESS_LICENSE'
  | 'FACTORY_LICENSE'
  | 'QA_CERTIFICATE'
  | 'AUTHORIZATION_LETTER';

export interface DocumentUpload {
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'PENDING';
}

export interface BankDocData {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
  accountType?: string;
  payoutMethod?: string;
  isPennyDropVerified: boolean;
  documents: DocumentUpload[];
  declarations: {
    warrantyAssurance: boolean;
    termsAccepted: boolean;
    amlCompliance: boolean;
  };
}

// ===== COMPLIANCE DOCS TYPES =====
export interface ComplianceDocsData {
  complianceDocuments: DocumentUpload[];
}

// ===== CATALOG TYPES =====
export interface CatalogItem {
  category: string;
  isSelected: boolean;
  grades: string[];
  moqPerOrder: number;
  stdLeadTime: number;
}

export interface PriceFloor {
  category: string;
  pricePerMT: number;
}

export interface LogisticsPreference {
  usePlatform3PL: boolean;
  selfPickupAllowed: boolean;
}

export interface CatalogData {
  catalog: CatalogItem[];
  priceFloors?: PriceFloor[];
  logisticsPreference?: LogisticsPreference;
}

// ===== ONBOARDING DATA =====
export interface OnboardingData {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  orgKyc?: OrgKYCData;
  bankDocs?: BankDocData;
  complianceDocs?: ComplianceDocsData;
  catalog?: CatalogData;
}

// ===== API RESPONSE TYPES =====
export interface OnboardingResponse {
  _id?: string;
  organizationId?: string;
  legalName: string;
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  completedSteps: string[];
  rejectionReason?: string; // ADDED THIS FIELD
  orgKyc?: OrgKYCData;
  primaryBankAccount?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    accountHolderName: string;
    accountType: string;
    pennyDropStatus: string;
    pennyDropScore?: number;
    documents: DocumentUpload[];
  };
  complianceDocuments?: DocumentUpload[];
  catalog?: CatalogItem[];
  priceFloors?: PriceFloor[];
  logisticsPreference?: LogisticsPreference;
  createdAt?: string;
  updatedAt?: string;
}

export interface KYCStatusResponse {
  overallStatus: string;
  completionPercentage?: number;
  checks: Record<string, any>;
  lastUpdated?: string;
}

export interface GSTINFetchResponse {
  legalName: string;
  tradeName?: string;
  status: string;
  registrationDate: string;
  address: string;
}

export interface SubmitResponse {
  kycStatus: string;
  completedSteps: string[];
  message: string;
  isVerified?: boolean;
}

export interface OnboardingReviewResponse {
  organizationId: string;
  legalName: string;
  completedSteps: string[];
  stepStatus: Record<string, any>;
  orgKyc?: OrgKYCData;
  primaryBankAccount?: any;
  complianceDocuments?: DocumentUpload[];
  catalog?: CatalogItem[];
  priceFloors?: PriceFloor[];
  logisticsPreference?: LogisticsPreference;
}