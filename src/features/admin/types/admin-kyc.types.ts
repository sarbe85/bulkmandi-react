// /**
//  * Admin KYC Types
//  * Path: src/features/admin/types/admin-kyc.types.ts
//  */

// // ===== DASHBOARD STATS =====
// export interface DashboardStats {
//   kyc: {
//     pending: number;
//     breakdown: {
//       buyers: number;
//       sellers: number;
//       threepl: number;
//     };
//   };
//   priceFlags: {
//     total: number;
//     rfqs: number;
//     quotes: number;
//   };
//   disputes: {
//     open: number;
//     new: number;
//     inReview: number;
//     escalated: number;
//   };
//   settlements: {
//     todayPayouts: number;
//     reconDiff: number;
//     pendingBatches: number;
//     exceptions: number;
//   };
// }

// // ===== KYC QUEUE =====
// export type KYCStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'INFO_REQUESTED';
// export type OrgRole = 'SELLER' | 'BUYER' | '3PL';
// export type RiskLevel = 'Low' | 'Medium' | 'High';

// export interface KYCQueueItem {
//   caseId: string;
//   submissionNumber: string;
//   organizationId: string;
//   orgName: string;
//   role: OrgRole;
//   gstin: string;
//   pan: string;
//   bankVerified: boolean;
//   bankScore: number;
//   riskLevel: RiskLevel;
//   riskRemarks: string;
//   submittedAt: string;
//   age: string; // "03:10" format
// }

// export interface KYCQueueResponse {
//   items: KYCQueueItem[];
//   pagination: {
//     page: number;
//     limit: number;
//     total: number;
//     totalPages: number;
//   };
// }

// export interface KYCQueueFilters {
//   status?: KYCStatus;
//   role?: OrgRole;
//   search?: string;
//   page?: number;
//   limit?: number;
// }

// // ===== KYC DETAIL =====
// export interface PlantLocation {
//   street: string;
//   city: string;
//   state: string;
//   pin: string;
//   country: string;
// }

// export interface ContactPerson {
//   name: string;
//   email: string;
//   mobile: string;
//   role: string;
// }

// export interface BankAccount {
//   accountNumber: string;
//   ifsc: string;
//   bankName: string;
//   accountHolderName: string;
//   accountType: 'Current' | 'Savings';
//   pennyDropStatus: 'VERIFIED' | 'PENDING' | 'FAILED';
//   pennyDropScore: number;
//   documents: DocumentUpload[];
// }

// export interface DocumentUpload {
//   docType: string;
//   fileName: string;
//   fileUrl: string;
//   uploadedAt: string;
//   status: string;
// }

// export interface CatalogItem {
//   id: string;
//   category: string;
//   isSelected: boolean;
//   grades: string[];
//   moqPerOrder: number;
//   stdLeadTime: number;
// }

// export interface PriceFloor {
//   category: string;
//   pricePerMT: number;
// }

// export interface LogisticsPreference {
//   usePlatform3PL: boolean;
//   selfPickupAllowed: boolean;
// }

// export interface AutoChecks {
//   gstinValid: boolean;
//   panValid: boolean;
//   bankAccountValid: boolean;
//   documentsComplete: boolean;
//   addressVerified: boolean;
// }

// export interface RiskAssessment {
//   level: RiskLevel;
//   score: number;
//   remarks: string;
// }

// export interface ActivityLog {
//   action: string;
//   timestamp: string;
//   performedBy: string;
//   remarks: string;
// }

// export interface KYCCaseDetail {
//   case: {
//     caseId: string;
//     submissionNumber: string;
//     status: KYCStatus;
//     submittedAt: string;
//     age: string;
//     sla: {
//       tat: string;
//       age: string;
//     };
//   };
//   organization: {
//     id: string;
//     orgId: string;
//     legalName: string;
//     tradeName?: string;
//     role: OrgRole;
//     gstin: string;
//     pan: string;
//     cin?: string;
//     registeredAddress: string;
//     businessType: string;
//     incorporationDate: string;
//   };
//   contacts: {
//     primary: ContactPerson;
//     secondary?: ContactPerson;
//   };
//   plantLocations: PlantLocation[];
//   bankAccount: BankAccount;
//   complianceDocuments: DocumentUpload[];
//   catalog: CatalogItem[];
//   priceFloors: PriceFloor[];
//   logisticsPreference: LogisticsPreference;
//   autoChecks: AutoChecks;
//   riskAssessment: RiskAssessment;
//   activityLog: ActivityLog[];
// }

// // ===== ACTION PAYLOADS =====
// export interface ApproveKYCPayload {
//   remarks: string;
// }

// export interface RejectKYCPayload {
//   rejectionReason: string;
// }

// export interface RequestInfoPayload {
//   message: string;
//   fields: string[];
// }

// export interface WatchlistPayload {
//   reason: string;
//   tags: string[];
// }

// // ===== ACTION RESPONSES =====
// export interface ApproveKYCResponse {
//   message: string;
//   kycCase: {
//     id: string;
//     status: string;
//     reviewedAt: string;
//   };
//   organization: {
//     id: string;
//     kycStatus: string;
//     isVerified: boolean;
//   };
// }

// export interface RejectKYCResponse {
//   message: string;
//   kycCase: {
//     id: string;
//     status: string;
//     rejectionReason: string;
//     reviewedAt: string;
//   };
//   organization: {
//     id: string;
//     kycStatus: string;
//     rejectionReason: string;
//   };
// }

// export interface RequestInfoResponse {
//   message: string;
//   requestedFields: string[];
//   adminMessage: string;
// }

// export interface WatchlistResponse {
//   message: string;
//   reason: string;
//   tags: string[];
// }

// // ===== HISTORY =====
// export interface KYCHistoryItem {
//   caseId: string;
//   submissionNumber: string;
//   status: KYCStatus;
//   submissionAttempt: number;
//   submittedAt: string;
//   reviewedAt?: string;
//   rejectionReason?: string;
// }
