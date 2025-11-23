
export type KYCStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'INFOREQUESTED' 
  | 'UPDATE_IN_PROGRESS';

export type OrgRole = 'SELLER' | 'BUYER' | '3PL';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ComplianceDocumentType = 
  | 'GSTIN_CERTIFICATE'
  | 'PAN_CERTIFICATE'
  | 'CANCELLEDCHEQUE'
  | 'BANKLETTER'
  | 'BUSINESS_LICENSE'
  | 'INCORPORATION_CERT'
  | 'COMPANY_PAN'
  | string;

// ===== LOCATION & CONTACT TYPES =====

export interface PlantLocation {
  street: string;
  city: string;
  state: string;
  pin: string;
  country: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  mobile: string;
  role: string;
}

// ===== DOCUMENT & FILE TYPES =====

export interface DocumentUpload {
  docType: ComplianceDocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'UPLOADED' | 'VERIFIED' | 'REJECTED';
}

export interface BankAccount {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  accountType?: 'Current' | 'Savings';
  pennyDropStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
  pennyDropScore: number;
  documents: DocumentUpload[];
}

// ===== PRODUCT & PRICING TYPES =====

export interface CatalogItem {
  id?: string;
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

// ===== COMPLIANCE & AUDIT TYPES =====

export interface ComplianceDeclaration {
  warrantyAssurance: boolean;
  termsAccepted: boolean;
  amlCompliance: boolean;
}

export interface ActivityLog {
  action: string;
  timestamp: string;
  performedBy: string;
  remarks?: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  remarks?: string;
}

// ===== ORGANIZATION TYPES =====

export interface Organization {
  id: string;
  orgId: string;
  legalName: string;
  tradeName?: string;
  role: OrgRole;
  gstin: string;
  pan: string;
  cin?: string;
  registeredAddress: string;
  businessType: string;
  incorporationDate: string;
  kycStatus: KYCStatus;
  isVerified: boolean;
  isOnboardingLocked: boolean;
  rejectionReason?: string;
  kycApprovedAt?: string;
  kycApprovedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== REQUEST/RESPONSE PAYLOAD TYPES =====

export interface KycUpdateRequest {
  fields: string[];
  reason: string;
}

export interface KycApprovalRequest {
  remarks?: string;
}

export interface KycRejectionRequest {
  rejectionReason: string;
}

export interface KycUnlockRequest {
  remarks?: string;
}

export interface KycInfoRequest {
  message: string;
  fields: string[];
}

export interface KycWatchlistRequest {
  reason: string;
  tags: string[];
}