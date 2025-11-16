// Main onboarding container
// Copy from: seller/pages/OnboardingPage.tsx
// Changes:
// 1. Update step components (remove CatalogPricing, add UserPreferences)
// 2. Update step count to 5
// 3. Change imports to buyer components

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingData } from '../hooks/useOnboardingData';

// Step components
import BankDetails from '../components/onboarding/BankDetails';
import ComplianceDocs from '../components/onboarding/ComplianceDocs';
import OrgKYC from '../components/onboarding/OrgKYC';
import Review from '../components/onboarding/Review';
import UserPreferences from '../components/onboarding/UserPreferences';

const STEPS = [
  { step: 1, label: 'Org KYC', component: OrgKYC },
  { step: 2, label: 'Bank Details', component: BankDetails },
  { step: 3, label: 'Compliance Docs', component: ComplianceDocs },
  { step: 4, label: 'Preferences', component: UserPreferences },
  { step: 5, label: 'Review', component: Review },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { onboarding, isLoading } = useOnboardingData();
  const [currentStep, setCurrentStep] = useState(1);

  // Check if onboarding is locked
  useEffect(() => {
    if (onboarding?.isOnboardingLocked || onboarding?.kycStatus === 'SUBMITTED') {
      navigate('/buyer/kyc-status', { replace: true });
    }
  }, [onboarding, navigate]);

  if (isLoading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  // Get current step data
  const stepData = {
    1: onboarding?.orgKyc,
    2: onboarding?.primaryBankAccount,
    3: onboarding?.complianceDocuments,
    4: onboarding?.buyerPreferences,
    5: onboarding,
  }[currentStep];

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Stepper */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => (
            <div key={s.step} className="flex items-center flex-1">
              <button
                onClick={() => setCurrentStep(s.step)}
                disabled={s.step > currentStep}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                  ${s.step < currentStep ? 'bg-green-500 text-white' : s.step === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}
                  ${s.step > currentStep ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {s.step < currentStep ? '✓' : s.step}
              </button>
              <p className="text-xs font-semibold text-center ml-2">{s.label}</p>

              {/* Line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    s.step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Component */}
        {CurrentStepComponent && (
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow">
            <CurrentStepComponent data={stepData} onNext={handleNext} onBack={currentStep > 1 ? handleBack : undefined} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
}
