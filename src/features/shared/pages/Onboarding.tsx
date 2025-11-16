// ============================================
// UNIFIED ONBOARDING PAGE (ALL ROLES)
// ============================================

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankDetailsStep from '../components/onboarding/BankDetailsStep';
import CatalogStep from '../components/onboarding/CatalogStep';
import ComplianceDocsStep from '../components/onboarding/ComplianceDocsStep';
import OrgKYCStep from '../components/onboarding/OrgKYCStep';
import ReviewStep from '../components/onboarding/ReviewStep';
import Stepper from '../components/Stepper';
import { useOnboarding } from '../hooks/useOnboarding';
import { getStepsForRole, UserRole } from '../types/onboarding.types';
 

// Component map
const STEP_COMPONENTS: Record<string, any> = {
  'org-kyc': OrgKYCStep,
  'bank-details': BankDetailsStep,
  'compliance-docs': ComplianceDocsStep,
  // 'buyer-preferences': BuyerPreferences,
  'catalog': CatalogStep,
  'review': ReviewStep
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const userRole = user?.role;

  const { data, isLoading, fetchData } = useOnboarding();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Get steps for this user's role
  const steps = userRole ? getStepsForRole(userRole as UserRole) : [];

  useEffect(() => {
    fetchData();
  }, []);

  // Redirect if onboarding is locked
  useEffect(() => {
    if (data?.isOnboardingLocked || data?.kycStatus === 'SUBMITTED') {
      navigate('/onboarding/kyc-status', { replace: true });
    }
  }, [data?.isOnboardingLocked, data?.kycStatus, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return <div className="text-center py-10">Unable to determine user role</div>;
  }

  if (!steps.length) {
    return <div className="text-center py-10">No onboarding steps available for your role</div>;
  }

  const currentStep = steps[currentStepIndex];
  const StepComponent = STEP_COMPONENTS[currentStep.id];

  if (!StepComponent) {
    return <div className="text-center py-10">Step component not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Stepper steps={steps} current={currentStepIndex} />

      <div className="mt-8 bg-white rounded-lg p-8 shadow">
        <StepComponent
          onNext={() => {
            if (currentStepIndex < steps.length - 1) {
              setCurrentStepIndex(currentStepIndex + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onBack={
            currentStepIndex > 0
              ? () => {
                  setCurrentStepIndex(currentStepIndex - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
