/**
 * Seller Onboarding Types
 * Types for multi-step seller registration and KYC process
 */

export type OnboardingStep = 'account' | 'org-kyc' | 'bank-docs' | 'catalog' | 'review';

export interface PlantLocation {
  id?: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
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
  plantLocations: PlantLocation[];
  primaryContact: {
    name: string;
    email: string;
    mobile: string;
    emailVerified: boolean;
    mobileVerified: boolean;
  };
}

export type DocumentType = 
  | 'GST_CERTIFICATE' 
  | 'PAN_CARD' 
  | 'CANCELLED_CHEQUE' 
  | 'FACTORY_LICENSE' 
  | 'QA_CERTIFICATE' 
  | 'AUTHORIZATION_LETTER';

export interface DocumentUpload {
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'uploaded' | 'pending' | 'verified' | 'rejected';
}

export type PayoutMethod = 'RTGS' | 'NEFT' | 'UPI';

export interface BankDocData {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  payoutMethod: PayoutMethod;
  upiVpa?: string;
  isPennyDropVerified: boolean;
  documents: DocumentUpload[];
  declarations: {
    warrantyAssurance: boolean;
    termsAccepted: boolean;
    amlCompliance: boolean;
  };
}

export interface Grade {
  code: string;
  name: string;
  description?: string;
}

export interface PriceFloor {
  category: string;
  pricePerMT: number;
  region?: string;
}

export type LogisticsType = 'PLATFORM_3PL' | 'SELF_PICKUP';

export interface CatalogData {
  categories: string[];
  grades: Grade[];
  moqPerOrder: number;
  standardLeadDays: number;
  priceFloors?: PriceFloor[];
  plantLocations: string[]; // Plant IDs
  logisticsType: LogisticsType;
  availabilityDays?: string[];
}

export interface OnboardingData {
  orgKyc?: OrgKYCData;
  bankDocs?: BankDocData;
  catalog?: CatalogData;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  submittedAt?: string;
}

export interface OnboardingRequest {
  orgKyc: OrgKYCData;
  bankDocs: BankDocData;
  catalog: CatalogData;
}

export interface OnboardingResponse {
  success: boolean;
  onboardingId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  message: string;
}

// KYC Status Types
export type KYCCheckStatus = 'validated' | 'pending' | 'failed' | 'not_started';

export interface KYCCheck {
  name: string;
  status: KYCCheckStatus;
  message?: string;
  verifiedAt?: string;
}

export interface KYCStatusResponse {
  overallStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'incomplete';
  checks: {
    gstin: KYCCheck;
    pan: KYCCheck;
    bank: KYCCheck;
    watchlist: KYCCheck;
    factoryLicense: KYCCheck;
  };
  nextSteps: string[];
  canStartQuoting: boolean;
  rejectionReasons?: string[];
}

// GSTIN Fetch Response
export interface GSTINFetchResponse {
  legalName: string;
  tradeName?: string;
  status: 'Active' | 'Inactive' | 'Cancelled';
  registrationDate: string;
  address: string;
}
