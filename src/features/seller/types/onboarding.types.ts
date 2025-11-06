
// ===== STEP TYPES (5 STEPS) =====


 

// First step - used for initialization

export const ONBOARDING_STEPS = {
  ORG_KYC: "org-kyc",
  BANK_DETAILS: "bank-details",
  COMPLIANCE_DOCS: "compliance-docs",
  CATALOG_AND_PRICE: "catalog-and-price",
  REVIEW: "review",
} as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

export const ONBOARDING_STEP_LIST = Object.values(ONBOARDING_STEPS)as OnboardingStep[];

export const ONBOARDING_STEP_LABELS: Record<(typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS], string> = {
  [ONBOARDING_STEPS.ORG_KYC]: "Organization Details",
  [ONBOARDING_STEPS.BANK_DETAILS]: "Bank Details",
  [ONBOARDING_STEPS.COMPLIANCE_DOCS]: "Compliance Documents",
  [ONBOARDING_STEPS.CATALOG_AND_PRICE]: "Catalog & Pricing",
  [ONBOARDING_STEPS.REVIEW]: "Review & Submit",
};

export const ONBOARDING_STEP_DESCRIPTIONS: Record<(typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS], string> = {
  [ONBOARDING_STEPS.ORG_KYC]: "Enter your organization and business details",
  [ONBOARDING_STEPS.BANK_DETAILS]: "Add your primary bank account information",
  [ONBOARDING_STEPS.COMPLIANCE_DOCS]: "Upload compliance and bank documents",
  [ONBOARDING_STEPS.CATALOG_AND_PRICE]: "Configure your products and pricing",
  [ONBOARDING_STEPS.REVIEW]: "Review all information and submit",
};
 


// ===== ORG KYC TYPES =====

// export interface OrgKYCResponse {
//   legalName: string;
//   tradeName?: string;
//   gstin: string;
//   pan: string;
//   cin?: string;
//   registeredAddress: string;
//   businessType: string;
//   incorporationDate: string;
//   plantLocations?: PlantLocation[];
//   primaryContactPerson?: ContactPerson;
//   accountsContactPerson?: ContactPerson;
//   techContactPerson?: ContactPerson;
//   documents?: Record<string, string>;
// }

// export interface PlantLocation {
//   id?: string;
//   street?: string;
//   name?: string;
//   city: string;
//   state: string;
//   pincode?: string;
//   pin?: string;
//   country?: string;
//   isActive?: boolean;
// }

// export interface ContactPerson {
//   name: string;
//   email: string;
//   mobile: string;
//   role?: string;
// }



// ===== BANK DETAILS TYPES =====

// export interface BankDetailsResponse {
//   accountHolderName: string;
//   accountNumber: string;
//   ifscCode: string;
//   bankName: string;
//   accountType: string;
//   branch: string;
//   benificiaryName?: string;
//   cancelledCheque?: string;
//   bankStatements?: string[];
// }

// export interface DocumentUpload {
//   type: string;
//   fileName: string;
//   fileUrl: string;
//   uploadedAt: string;
//   status: 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
//   comments?: string;
// }
export interface Declarations {
  warrantyAssurance: boolean;
  termsAccepted: boolean;
  amlCompliance: boolean;
}

// ===== COMPLIANCE DOCS TYPES =====

// export interface ComplianceDocument {
//   documentName: string;
//   documentType: string;
//   documentUrl: string;
//   uploadedDate?: string;
// }

// export interface ComplianceDocsResponse {
//   documents: ComplianceDocument[];
//   bankStatements?: string[];
//   gstinCertificate?: string;
//   panCertificate?: string;
//   cancellationCheque?: string;
//   businessRegistration?: string;
// }

// ===== CATALOG TYPES =====
export interface CatalogData {
  catalog: CatalogItem[];
  priceFloors?: PriceFloor[];
  logisticsPreference?: LogisticsPreference;
}
export interface PriceFloor {
  category: string;
  pricePerMT: number;
}

export interface LogisticsPreference {
  usePlatform3PL: boolean;
  selfPickupAllowed: boolean;
}
export interface CatalogItem {
  id?: string;
  category: string;
  isSelected: boolean;
  grades: string[];
  moqPerOrder: number;
  stdLeadTime: number;
}
// export interface CatalogProduct {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   markup?: number;
//   category?: string;
// }

// export interface CatalogResponse {
//   products: CatalogProduct[];
//   totalProducts: number;
//   defaultMarkup?: number;
//   currency?: string;
// }

// ===== ONBOARDING STATUS TYPES =====

// export type KYCStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

 

// export interface OnboardingRequest {
//   orgKyc?: OrgKycData;
//   bankDetails?: BankDetails;
//   complianceDocs?: FormData;
//   catalog?: CatalogProduct[];
// }



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
  complianceDocuments?: [];
  catalog?: CatalogItem[];
  priceFloors?: PriceFloor[];
  logisticsPreference?: LogisticsPreference;
  declarations?: Declarations;
  latestSubmission?: {
    submissionNumber: string;
    status: string;
    submissionAttempt: number;
    rejectionReason?: string;
    reviewedAt?: string;
  };
}

export interface SubmitOnboardingResponse {
  _id?: string;
  orgId?: string;
  organizationId?: string;
  legalName?: string;
  kycStatus: 'SUBMITTED' | 'DRAFT';
  isOnboardingLocked: boolean;
  completedSteps: string[];
  message: string;
  submittedAt?: string;
  organization?: {
    _id: string;
    kycStatus: string;
    isOnboardingLocked: boolean;
    completedSteps: string[];
    updatedAt: string;
  };
  kycCase?: {
    _id: string;
    submissionNumber: string;
    status: string;
    organizationId: string;
    submittedData: any;
    createdAt: string;
  };
}

// export interface OnboardingStepError {
//   step: OnboardingStep;
//   message: string;
//   timestamp: string;
// }

// ===== API RESPONSE TYPES =====

// export interface ApiResponse<T> {
//   success: boolean;
//   data?: T;
//   error?: string;
//   message?: string;
//   timestamp?: string;
// }

// export interface PaginatedResponse<T> {
//   items: T[];
//   total: number;
//   page: number;
//   pageSize: number;
//   hasMore: boolean;
// }
