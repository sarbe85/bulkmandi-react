/* eslint-disable @typescript-eslint/no-empty-object-type */
// ============================================
// UNIFIED TYPES FOR ALL USER ROLES
// ============================================

export type UserRole = "SELLER" | "BUYER" | "LOGISTICS";
export type KYCStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED" | "INFO_REQUESTED";
export type DocumentStatus = "UPLOADED" | "PENDING" | "VERIFIED" | "REJECTED";
export type PennyDropStatus = "PENDING" | "VERIFIED" | "FAILED";

// ========== CONTACT PERSON ==========
export interface ContactPerson {
  name: string;
  email: string;
  mobile: string;
  role?: string;
}

// ========== PLANT LOCATION ==========
export interface PlantLocation {
  id?: string;
  name: string;
  city: string;
  state: string;
  pincode?: string;
  country?: string;
  isActive?: boolean;
  street?: string;
  gstStateCode?: string;
}

// ========== DOCUMENT ==========
export interface DocumentUpload {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: DocumentStatus;
  comments?: string;
  documentNumber?: string;
  fileSize?: number;
}

// ========== ORG KYC (SHARED - ALL ROLES) ==========
export interface OrgKycData {
  legalName: string;
  tradeName?: string;
  gstin: string;
  pan: string;
  cin?: string;
  registeredAddress: string;
  businessType: string;
  incorporationDate?: string;
  primaryContact: ContactPerson;
  plantLocations?: PlantLocation[];
  secondaryContact?: ContactPerson;
}

export interface OrgKycFormData extends OrgKycData {}

// ========== BANK DETAILS (SHARED - ALL ROLES) ==========
export interface BankDetailsData {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  accountType: "SAVINGS" | "CURRENT" | "OVERDRAFT";
  branchName?: string;
  payoutMethod?: "RTGS" | "NEFT" | "UPI";
  upiDetails?: string;
  isPennyDropVerified?: boolean;
  pennyDropStatus?: PennyDropStatus;
  pennyDropScore?: number;
  documents?: DocumentUpload[];
}

export interface BankDetailsFormData {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  accountType: "SAVINGS" | "CURRENT" | "OVERDRAFT";
  branchName?: string;
  payoutMethod?: "RTGS" | "NEFT" | "UPI";
  upiDetails?: string;
}

// ========== COMPLIANCE (SHARED - ALL ROLES) ==========
export interface ComplianceDeclarations {
  warrantyAssurance: boolean;
  termsAccepted: boolean;
  amlCompliance: boolean;
}

export interface ComplianceData {
  documents: DocumentUpload[];
  declarations?: ComplianceDeclarations;
}

export interface ComplianceFormData {
  documents: DocumentUpload[];
  warrantyAssurance: boolean;
  termsAccepted: boolean;
  amlCompliance: boolean;
}

// ========== BUYER PREFERENCES (BUYER ONLY) ==========
export interface BuyerPreferencesData {
  categories: string[];
  typicalMonthlyVolumeMT?: number;
  incoterms: string[]; // Keep as array for future multi-select
  deliveryPins: string[];
  acceptanceWindow: "24 hours" | "48 hours" | "72 hours"; // ✅ Match UI
  qcRequirement: "Visual & Weight Check" | "Lab Testing Required"; // ✅ Match UI
  notifications: string[]; // ✅ Changed from individual booleans to array
  notes?: string;
}

export interface BuyerPreferencesFormData extends BuyerPreferencesData {}

// ========== CATALOG (SELLER ONLY) ==========
export interface CatalogProduct {
  id?: string;
  category: string;
  isSelected: boolean;
  grades: string[];
  moqPerOrder: number;
  stdLeadTime: number;
  availability: string[];
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
  catalog: CatalogProduct[];
  priceFloors: PriceFloor[];
  plantLocations: PlantLocation[];
  logisticsPreference?: LogisticsPreference;
}

export interface CatalogFormData {
  catalog: CatalogProduct[];
  priceFloors: PriceFloor[];
  plantLocations: PlantLocation[];
  logisticsPreference?: LogisticsPreference;
}

// ========== COMPLETE ONBOARDING RESPONSE (FROM API) ==========
export interface OnboardingResponse {
  organizationId: string;
  orgId: string;
  legalName: string;
  role: UserRole;
  kycStatus: KYCStatus;
  isOnboardingLocked: boolean;
  rejectionReason: string | null;
  completedSteps: string[];
  currentProgress?: number;

  // All step data (null if not completed)
  orgKyc?: OrgKycData;
  primaryBankAccount?: BankDetailsData;
  compliance?: ComplianceData;
  buyerPreferences?: BuyerPreferencesData;
  catalog?: CatalogData;
  logisticsPreference?: LogisticsPreference;

  createdAt: string;
  updatedAt: string;
}

// ========== STEP CONFIGURATION ==========
export interface OnboardingStep {
  id: string;
  label: string;
  apiEndpoint: string;
}

export const ONBOARDING_STEPS: Record<UserRole, OnboardingStep[]> = {
  SELLER: [
    { id: "org-kyc", label: "Organization KYC", apiEndpoint: "org-kyc" },
    { id: "bank-details", label: "Bank Details", apiEndpoint: "bank-details" },
    { id: "compliance-docs", label: "Compliance Documents", apiEndpoint: "compliance-docs" },
    { id: "catalog", label: "Catalog & Pricing", apiEndpoint: "catalog" },
    { id: "review", label: "Review & Submit", apiEndpoint: "submit" },
  ],
  BUYER: [
    { id: "org-kyc", label: "Organization KYC", apiEndpoint: "org-kyc" },
    { id: "bank-details", label: "Bank Details", apiEndpoint: "bank-details" },
    { id: "compliance-docs", label: "Compliance Documents", apiEndpoint: "compliance-docs" },
    { id: "buyer-preferences", label: "Buying Preferences", apiEndpoint: "buyer-preferences" },
    { id: "review", label: "Review & Submit", apiEndpoint: "submit" },
  ],
  LOGISTICS: [
    { id: "org-kyc", label: "Organization KYC", apiEndpoint: "org-kyc" },
    { id: "bank-details", label: "Bank Details", apiEndpoint: "bank-details" },
    { id: "compliance-docs", label: "Compliance Documents", apiEndpoint: "compliance-docs" },
    { id: "review", label: "Review & Submit", apiEndpoint: "submit" },
  ],
};

// ========== HELPERS ==========
export function getStepsForRole(role: UserRole): OnboardingStep[] {
  return ONBOARDING_STEPS[role] || [];
}

export function getStepLabel(stepId: string, role: UserRole): string {
  const step = ONBOARDING_STEPS[role]?.find((s) => s.id === stepId);
  return step?.label || stepId;
}

export function getStepApiEndpoint(stepId: string, role: UserRole): string {
  const step = ONBOARDING_STEPS[role]?.find((s) => s.id === stepId);
  return step?.apiEndpoint || stepId;
}
