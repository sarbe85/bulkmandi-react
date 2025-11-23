// src/features/shared/config/onboarding-steps.ts

import BuyerPreferences from "../components/onboarding/BuyerPreferences";
import BankDetailsStep from "../components/onboarding/BankDetailsStep";
import CatalogStep from "../components/onboarding/CatalogStep";
import ComplianceDocsStep from "../components/onboarding/ComplianceDocsStep";
import OrgKYCStep from "../components/onboarding/OrgKYCStep";

export type UserRole = "SELLER" | "BUYER" | "LOGISTICS" | "ADMIN";

interface OnboardingStep {
  id: string;
  label: string;
  component: React.ComponentType<any>;
}

// Define which steps show for which roles
export const ONBOARDING_STEPS_BY_ROLE: Record<UserRole, OnboardingStep[]> = {
  SELLER: [
    { id: "org-kyc", label: "Organization KYC", component: OrgKYCStep },
    { id: "bank-details", label: "Bank Details", component: BankDetailsStep },
    { id: "compliance-docs", label: "Compliance", component: ComplianceDocsStep },
    { id: "catalog", label: "Catalog & Pricing", component: CatalogStep },
  ],
  BUYER: [
    { id: "org-kyc", label: "Organization KYC", component: OrgKYCStep },
    { id: "bank-details", label: "Bank Details", component: BankDetailsStep },
    { id: "compliance-docs", label: "Compliance", component: ComplianceDocsStep },
    { id: "buyer-preferences", label: "Buying Preferences", component: BuyerPreferences },
  ],
  LOGISTICS: [
    { id: "org-kyc", label: "Organization KYC", component: OrgKYCStep },
    { id: "bank-details", label: "Bank Details", component: BankDetailsStep },
    { id: "compliance-docs", label: "Compliance", component: ComplianceDocsStep },
  ],
  ADMIN: [],
};

export function getOnboardingSteps(role: UserRole): OnboardingStep[] {
  return ONBOARDING_STEPS_BY_ROLE[role] || [];
}

export function getStepLabel(stepId: string, role: UserRole): string {
  const step = ONBOARDING_STEPS_BY_ROLE[role]?.find((s) => s.id === stepId);
  return step?.label || "";
}
