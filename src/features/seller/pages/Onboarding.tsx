import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankDetailsStep from '../components/steps/BankDetailsStep';
import BankDocsStep from '../components/steps/BankDocsStep';
import CatalogStep from '../components/steps/CatalogStep';
import ComplianceDocsStep from '../components/steps/ComplianceDocsStep';
import OrgKYCStep from '../components/steps/OrgKYCStep';
import ReviewStep from '../components/steps/ReviewStep';
import onboardingService from '../services/onboarding.service';
import {
  BankDocData,
  CatalogData,
  ComplianceDocsData,
  OnboardingData,
  OnboardingStep,
  OrgKYCData,
} from '../types/onboarding.types';

// Map backend bank response to BankDocData
const mapBankAccountToBankDocData = (account: any): BankDocData => ({
  accountName: account.accountHolderName || '',
  accountNumber: account.accountNumber || '',
  ifscCode: account.ifsc || '',
  bankName: account.bankName || '',
  accountType: account.accountType || 'Current',
  payoutMethod: 'RTGS',
  isPennyDropVerified: account.pennyDropStatus === 'VERIFIED',
  documents: account.documents || [],
  declarations: {
    warrantyAssurance: true,
    termsAccepted: true,
    amlCompliance: true,
  },
});

// Map backend catalog response to CatalogData
const mapCatalogResponseToCatalogData = (catalogArray: any): CatalogData => ({
  catalog: catalogArray || [],
  priceFloors: [],
  logisticsPreference: {
    usePlatform3PL: true,
    selfPickupAllowed: true,
  },
});

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState('org-kyc');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    currentStep: 'org-kyc',
    completedSteps: [],
  });

  const steps: OnboardingStep[] = [
    'org-kyc',
    'bank-details',
    'compliance-docs',
    'catalog',
    'review',
  ];

  const stepLabels: Record<OnboardingStep, string> = {
    'org-kyc': 'Organization KYC',
    'bank-details': 'Bank Details',
    'compliance-docs': 'Compliance Documents',
    'catalog': 'Catalog',
    'review': 'Review & Submit',
  };

  const stepDescriptions: Record<OnboardingStep, string> = {
    'org-kyc': 'Enter your business and organization details',
    'bank-details': 'Add your bank account information',
    'compliance-docs': 'Upload required compliance documents',
    'catalog': 'Configure your products and pricing',
    'review': 'Review all information before submission',
  };

  // Load initial onboarding status from backend
  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      setIsLoading(true);
      const status = await onboardingService.getOnboardingStatus();

      // Map backend step names to frontend step names
      const backendStepMap: Record<string, OnboardingStep | undefined> = {
        orgKyc: 'org-kyc',
        bankDetails: 'bank-details',
        'bank-details': 'bank-details',
        docs: 'compliance-docs',
        'compliance-docs': 'compliance-docs',
        catalog: 'catalog',
      };

      const completed = (status.completedSteps || [])
        .map((step: string) => backendStepMap[step])
        .filter((s): s is OnboardingStep => s !== undefined);

      // Determine next step based on completed steps
      let nextStep: OnboardingStep = 'org-kyc';
      if (completed.includes('catalog')) {
        nextStep = 'review';
      } else if (completed.includes('compliance-docs')) {
        nextStep = 'catalog';
      } else if (completed.includes('bank-details')) {
        nextStep = 'compliance-docs';
      } else if (completed.includes('org-kyc')) {
        nextStep = 'bank-details';
      }

      // Build onboarding data object
      const data: OnboardingData = {
        currentStep: nextStep,
        completedSteps: completed,
        orgKyc: status.orgKyc,
        bankDocs: status.primaryBankAccount
          ? mapBankAccountToBankDocData(status.primaryBankAccount)
          : undefined,
        complianceDocs: status.complianceDocuments
          ? { complianceDocuments: status.complianceDocuments }
          : undefined,
        catalog: status.catalog
          ? mapCatalogResponseToCatalogData(status.catalog)
          : undefined,
      };

      setOnboardingData(data);
      setCurrentStep(nextStep);
      setCompletedSteps(completed);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your onboarding progress.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MODIFIED: Handle next step - receive API response
  const handleNext = async (
  data: OrgKYCData | BankDocData | ComplianceDocsData | CatalogData | any
) => {
  console.log('🎯 Onboarding.handleNext received data:', data);
  
  try {
    setIsLoading(true);

    // ✅ Extract completedSteps from API response
    const newCompletedSteps = data.completedSteps || completedSteps;
    console.log('📋 New completed steps from API:', newCompletedSteps);
    
    const newCompleted = (newCompletedSteps || [])
      .map((step: string) => {
        const mapping: Record<string, OnboardingStep> = {
          orgKyc: 'org-kyc',
          bankDetails: 'bank-details',
          'bank-details': 'bank-details',
          complianceDocs: 'compliance-docs',
          docs: 'compliance-docs',  // ✅ ADDED: Backend uses 'docs'
          'compliance-docs': 'compliance-docs',
          catalog: 'catalog',
        };
        return mapping[step];
      })
      .filter((s): s is OnboardingStep => s !== undefined);

    console.log('✅ Mapped completed steps:', newCompleted);

    // Find next step
    let nextStep: OnboardingStep = 'org-kyc';
    if (newCompleted.includes('catalog')) {
      nextStep = 'review';
    } else if (newCompleted.includes('compliance-docs')) {
      nextStep = 'catalog';
    } else if (newCompleted.includes('bank-details')) {
      nextStep = 'compliance-docs';
    } else if (newCompleted.includes('org-kyc')) {
      nextStep = 'bank-details';
    }

    console.log('➡️ Next step determined:', nextStep);

    // Update state with API response data
    const updatedData: OnboardingData = {
      ...onboardingData,
      currentStep: nextStep,
      completedSteps: newCompleted,
    };

    // ✅ FIXED: Better detection of response type
    if (data.orgKyc) {
      console.log('📝 Updating orgKyc data');
      updatedData.orgKyc = data.orgKyc;
    } else if (data.accountNumber) {
      console.log('🏦 Updating bank details');
      updatedData.bankDocs = data;
    } else if (data.complianceDocuments && Array.isArray(data.complianceDocuments)) {
      console.log('📄 Updating compliance docs');
      updatedData.complianceDocs = { complianceDocuments: data.complianceDocuments };
    } else if (data.catalog && Array.isArray(data.catalog)) {
      console.log('📦 Updating catalog');
      updatedData.catalog = mapCatalogResponseToCatalogData(data.catalog);
    }

    console.log('💾 Setting onboarding data:', updatedData);
    setOnboardingData(updatedData);
    setCurrentStep(nextStep);
    setCompletedSteps(newCompleted);

    toast({
      title: 'Success',
      description: 'Step completed successfully.',
    });
  } catch (error: any) {
    console.error('❌ handleNext error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to save step.',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};


  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep as OnboardingStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else if (currentIndex === 0) {
      navigate('/seller/dashboard');
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onboardingService.submitOnboarding();
      toast({
        title: 'Success!',
        description: 'Onboarding submitted for review.',
      });
      navigate('/seller/kyc-status');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.indexOf(currentStep as OnboardingStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Seller Onboarding</h1>
          <p className="text-gray-600 mt-2">Complete all steps to activate your account</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-5 gap-2 mb-12">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step as any);
            const isCurrent = currentStep === step;
            return (
              <div
                key={step}
                className={`p-4 rounded-lg text-center transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="text-2xl font-bold mb-2">
                  {isCompleted ? <Check className="h-6 w-6 mx-auto" /> : index + 1}
                </div>
                <div className="text-xs font-semibold">{stepLabels[step]}</div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{stepLabels[currentStep as OnboardingStep]}</h2>
          <p className="text-gray-600 mb-8">{stepDescriptions[currentStep as OnboardingStep]}</p>

          {currentStep === 'org-kyc' && (
            <OrgKYCStep
              data={onboardingData.orgKyc}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'bank-details' && (
            <BankDetailsStep
              data={onboardingData.bankDocs}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'bank-details' && (
            <BankDocsStep
              data={onboardingData.bankDocs}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'compliance-docs' && (
            <ComplianceDocsStep
              data={onboardingData.complianceDocs}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'catalog' && (
            <CatalogStep
              data={onboardingData.catalog}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              data={onboardingData}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}