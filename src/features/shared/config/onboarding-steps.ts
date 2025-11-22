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
    { id: "ORG_KYC", label: "Organization KYC", component: OrgKYCStep },
    { id: "BANK", label: "Bank Details", component: BankDetailsStep },
    { id: "COMPLIANCE", label: "Compliance", component: ComplianceDocsStep },
    { id: "CATALOG", label: "Catalog & Pricing", component: CatalogStep },
  ],
  BUYER: [
    { id: "ORG_KYC", label: "Organization KYC", component: OrgKYCStep },
    { id: "BANK", label: "Bank Details", component: BankDetailsStep },
    { id: "COMPLIANCE", label: "Compliance", component: ComplianceDocsStep },
    { id: "PREFERENCES", label: "Buying Preferences", component: BuyerPreferences },
  ],
  LOGISTICS: [
    { id: "ORG_KYC", label: "Organization KYC", component: OrgKYCStep },
    { id: "BANK", label: "Bank Details", component: BankDetailsStep },
    { id: "COMPLIANCE", label: "Compliance", component: ComplianceDocsStep },
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
