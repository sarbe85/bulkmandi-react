import {
  ActivityLog,
  BankAccount,
  CatalogItem,
  ContactPerson,
  DocumentUpload,
  KycApprovalRequest,
  KycInfoRequest,
  KycRejectionRequest,
  KYCStatus,
  KycUnlockRequest,
  KycWatchlistRequest,
  LogisticsPreference,
  Organization,
  OrgRole,
  PlantLocation,
  PriceFloor,
  RiskAssessment,
  RiskLevel,
} from "@/shared/types/common.types";

// ===== DASHBOARD STATS (Admin Only) =====

export interface DashboardStats {
  kyc: {
    pending: number;
    breakdown: {
      buyers: number;
      sellers: number;
      threepl: number;
    };
  };
  priceFlags: {
    total: number;
    rfqs: number;
    quotes: number;
  };
  disputes: {
    open: number;
    new: number;
    inReview: number;
    escalated: number;
  };
  settlements: {
    todayPayouts: number;
    reconDiff: number;
    pendingBatches: number;
    exceptions: number;
  };
}

// ===== KYC QUEUE (Admin Only) =====

export interface KYCQueueItem {
  caseId: string;
  submissionNumber: string;
  organizationId: string;
  orgName: string;
  role: OrgRole;
  gstin: string;
  pan: string;
  bankVerified: boolean;
  bankScore: number;
  riskLevel: RiskLevel;
  riskRemarks: string;
  submittedAt: string;
  age: string; // Format: "03:10" (HH:MM)
}

export interface KYCQueueResponse {
  items: KYCQueueItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface KYCQueueFilters {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ===== KYC CASE DETAIL (Admin Only) =====

export interface AutoChecks {
  gstinValid: boolean;
  panValid: boolean;
  bankAccountValid: boolean;
  documentsComplete: boolean;
  addressVerified: boolean;
}

export interface KYCCaseInfo {
  caseId: string;
  submissionNumber: string;
  status: KYCStatus;
  submittedAt: string;
  age: string; // Format: "03:10"
  sla: {
    tat: string; // e.g., "24h"
    age: string; // Format: "03:10"
  };
}

export interface KYCCaseDetail {
  case: KYCCaseInfo;
  organization: Omit<
    Organization,
    "kycStatus" | "isVerified" | "isOnboardingLocked" | "rejectionReason" | "kycApprovedAt" | "kycApprovedBy" | "createdAt" | "updatedAt"
  >;
  contacts: {
    primary: ContactPerson;
    secondary?: ContactPerson;
  };
  plantLocations: PlantLocation[];
  bankAccount: BankAccount;
  complianceDocuments: DocumentUpload[];
  catalog: CatalogItem[];
  priceFloors: PriceFloor[];
  logisticsPreference: LogisticsPreference;
  autoChecks: AutoChecks;
  riskAssessment: RiskAssessment;
  activityLog: ActivityLog[];
}

// ===== ACTION RESPONSES (Admin Only) =====

export interface ApproveKYCResponse {
  message: string;
  kycCase: {
    id: string;
    status: KYCStatus;
    reviewedAt: string;
  };
  organization: {
    id: string;
    kycStatus: KYCStatus;
    isVerified: boolean;
    kycApprovedAt: string;
  };
}

export interface RejectKYCResponse {
  message: string;
  kycCase: {
    id: string;
    status: KYCStatus;
    rejectionReason: string;
    reviewedAt: string;
  };
  organization: {
    id: string;
    kycStatus: KYCStatus;
    rejectionReason: string;
  };
}

export interface RequestInfoResponse {
  message: string;
  requestedFields: string[];
  adminMessage: string;
}

export interface WatchlistResponse {
  message: string;
  reason: string;
  tags: string[];
}

export interface UnlockForUpdateResponse {
  message: string;
  organizationId: string;
  kycStatus: KYCStatus;
}

// ===== HISTORY (Admin Only) =====

export interface KYCHistoryItem {
  caseId: string;
  submissionNumber: string;
  status: KYCStatus;
  submissionAttempt: number;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// ===== EXPORT ALIASES FOR EASIER IMPORTS =====

export type ApproveKYCPayload = KycApprovalRequest;
export type RejectKYCPayload = KycRejectionRequest;
export type RequestInfoPayload = KycInfoRequest;
export type WatchlistPayload = KycWatchlistRequest;
export type UnlockForUpdatePayload = KycUnlockRequest;

// ===== RE-EXPORT COMMON TYPES =====
export type { RiskLevel } from "@/shared/types/common.types";
