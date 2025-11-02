
// /**
//  * Onboarding Types - ENHANCED FOR NEW API SPECS
//  * Path: src/features/seller/types/onboarding.types.ts
//  *
//  * ✅ Now supports 5 steps (split bank & compliance)
//  * ✅ Matches new API request/response formats
//  * ✅ FormData file upload support
//  */

// // ===== STEP TYPES (5 STEPS NOW) =====

// export type OnboardingStep =
//   | 'org-kyc'
//   | 'bank-details'
//   | 'compliance-docs'
//   | 'catalog-and-price'
//   | 'review';

// // ===== ORG KYC TYPES =====

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

// export interface OrgKYCData {
//   legalName: string;
//   tradeName?: string;
//   gstin: string;
//   pan: string;
//   cin?: string;
//   registeredAddress: string;
//   businessType: string;
//   incorporationDate: string;
//   plantLocations?: PlantLocation[];
//   primaryContact: ContactPerson;
//   secondaryContact?: ContactPerson;
// }

// // ===== BANK DETAILS TYPES (STEP 2) =====

// export type DocumentType =
//   | 'CANCELLED_CHEQUE'
//   | 'BANK_LETTER'
//   | 'GST_CERTIFICATE'
//   | 'PAN_CERTIFICATE'
//   | 'BUSINESS_LICENSE'
//   | 'FACTORY_LICENSE'
//   | 'QA_CERTIFICATE'
//   | 'AUTHORIZATION_LETTER'
//   | 'MOA'
//   | 'AOA'
//   | 'MOA_AOA';

// export interface DocumentUpload {
//   type: DocumentType;
//   fileName: string;
//   fileUrl: string;
//   storagePath?: string;
//   uploadedAt: string;
//   status: 'UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
// }

// export interface BankDocData {
//   accountNumber: string;
//   accountHolderName: string;
//   ifsc: string;
//   bankName: string;
//   accountType: 'Current' | 'Savings';
//   pennyDropStatus?: 'VERIFIED' | 'PENDING' | 'FAILED';
//   pennyDropScore?: number;
//   payoutMethod?: string;
//   isPennyDropVerified?: boolean;
//   documents: DocumentUpload[];
//   declarations?: {
//     warrantyAssurance: boolean;
//     termsAccepted: boolean;
//     amlCompliance: boolean;
//   };
// }

// // ===== COMPLIANCE DOCUMENTS TYPES (STEP 3) =====

// export interface Declarations {
//   warrantyAssurance: boolean;
//   termsAccepted: boolean;
//   amlCompliance: boolean;
// }

// export interface ComplianceDocsData {
//   complianceDocuments: DocumentUpload[];
//   declarations?: Declarations;
// }

// // ===== CATALOG & PRICING TYPES (STEP 4) =====

// export interface CatalogItem {
//   id?: string;
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

// export interface CatalogData {
//   catalog: CatalogItem[];
//   priceFloors?: PriceFloor[];
//   logisticsPreference?: LogisticsPreference;
// }

// // ===== ONBOARDING STATE (FULL STATE) =====

// export interface OnboardingData {
//   currentStep: OnboardingStep;
//   completedSteps: OnboardingStep[];
//   orgKyc?: OrgKYCData;
//   bankDocs?: BankDocData;
//   complianceDocs?: DocumentUpload[];
//   catalog?: CatalogData;
// }

// // ===== API RESPONSE TYPES =====

// /**
//  * GET /organizations/my-organization/onboarding
//  * Returns full onboarding status
//  */
// export interface OnboardingStatusResponse {
//   organizationId: string;
//   legalName?: string;
//   kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
//   rejectionReason?: string | null;
//   isEditable: boolean;
//   isOnboardingLocked?: boolean;
//   completedSteps: string[];
//   orgKyc?: any;
//   primaryBankAccount?: any;
//   complianceDocuments?: DocumentUpload[];
//   catalog?: CatalogItem[];
//   priceFloors?: PriceFloor[];
//   logisticsPreference?: LogisticsPreference;
//   declarations?: Declarations;
//   latestSubmission?: {
//     submissionNumber: string;
//     status: string;
//     submissionAttempt: number;
//     rejectionReason?: string;
//     reviewedAt?: string;
//   };
// }

// /**
//  * Response from PUT endpoints (updateOrgKYC, updateBankDetails, etc.)
//  */
// export interface OnboardingResponse {
//   _id?: string;
//   organizationId?: string;
//   orgId?: string;
//   legalName?: string;
//   kycStatus?: string;
//   isOnboardingLocked?: boolean;
//   completedSteps?: string[];
//   createdAt?: string;
//   updatedAt?: string;
//   orgKyc?: OrgKYCData;
//   primaryBankAccount?: BankDocData;
//   complianceDocuments?: DocumentUpload[];
//   catalog?: CatalogItem[];
//   priceFloors?: PriceFloor[];
//   logisticsPreference?: LogisticsPreference;
//   declarations?: Declarations;
// }

// /**
//  * POST /organizations/my-organization/onboarding/submit
//  * Response when submitting for review
//  */
// export interface SubmitOnboardingResponse {
//   _id?: string;
//   orgId?: string;
//   organizationId?: string;
//   legalName?: string;
//   kycStatus: 'SUBMITTED' | 'DRAFT';
//   isOnboardingLocked: boolean;
//   completedSteps: string[];
//   message: string;
//   submittedAt?: string;
//   organization?: {
//     _id: string;
//     kycStatus: string;
//     isOnboardingLocked: boolean;
//     completedSteps: string[];
//     updatedAt: string;
//   };
//   kycCase?: {
//     _id: string;
//     submissionNumber: string;
//     status: string;
//     organizationId: string;
//     submittedData: any;
//     createdAt: string;
//   };
// }

// // ===== FORM STATE TYPES =====

// export interface FormError {
//   field: string;
//   message: string;
// }

// export interface FormValidation {
//   isValid: boolean;
//   errors: FormError[];
// }

// // ===== STEP PROGRESS TRACKING =====

// export interface OnboardingStepProgress {
//   step: OnboardingStep;
//   completed: boolean;
//   hasError: boolean;
//   errorMessage?: string;
//   validationErrors?: FormError[];
// }

// // ===== UTILITY HELPERS =====

// export const STEP_ORDER: OnboardingStep[] = [
//   'org-kyc',
//   'bank-details',
//   'compliance-docs',
//   'catalog-and-price',
//   'review',
// ];

// export const STEP_LABELS: Record<OnboardingStep, string> = {
//   'org-kyc': 'Organization Details',
//   'bank-details': 'Bank Details',
//   'compliance-docs': 'Compliance Documents',
//   'catalog-and-price': 'Catalog & Pricing',
//   'review': 'Review & Submit',
// };

// export const STEP_DESCRIPTIONS: Record<OnboardingStep, string> = {
//   'org-kyc': 'Enter your organization and business details',
//   'bank-details': 'Add your primary bank account information',
//   'compliance-docs': 'Upload compliance and bank documents',
//   'catalog-and-price': 'Configure your products and pricing',
//   'review': 'Review all information and submit',
// };

// /**
//  * Get the next step
//  */
// export const getNextStep = (currentStep: OnboardingStep): OnboardingStep | null => {
//   const index = STEP_ORDER.indexOf(currentStep);
//   if (index === -1 || index === STEP_ORDER.length - 1) {
//     return null;
//   }
//   return STEP_ORDER[index + 1];
// };

// /**
//  * Get the previous step
//  */
// export const getPreviousStep = (
//   currentStep: OnboardingStep
// ): OnboardingStep | null => {
//   const index = STEP_ORDER.indexOf(currentStep);
//   if (index <= 0) {
//     return null;
//   }
//   return STEP_ORDER[index - 1];
// };

// /**
//  * Get step number (1-based)
//  */
// export const getStepNumber = (step: OnboardingStep): number => {
//   return STEP_ORDER.indexOf(step) + 1;
// };

// /**
//  * Get total steps count
//  */
// export const getTotalSteps = (): number => {
//   return STEP_ORDER.length;
// };

// /**
//  * Get completion percentage
//  */
// export const getCompletionPercentage = (completedSteps: string[]): number => {
//   const validSteps = completedSteps.filter((step) =>
//     STEP_ORDER.includes(step as OnboardingStep)
//   ).length;
//   return Math.round((validSteps / STEP_ORDER.length) * 100);
// };

// /**
//  * Check if step is completed
//  */
// export const isStepCompleted = (
//   step: OnboardingStep,
//   completedSteps: string[]
// ): boolean => {
//   return completedSteps.includes(step);
// };

// /**
//  * Get all completed steps
//  */
// export const getCompletedSteps = (completedSteps: string[]): OnboardingStep[] => {
//   return completedSteps.filter((step) =>
//     STEP_ORDER.includes(step as OnboardingStep)
//   ) as OnboardingStep[];
// };

// // export type KYCStatusType = OnboardingStatusResponse;