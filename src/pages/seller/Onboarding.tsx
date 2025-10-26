import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';
import { useToast } from '@/hooks/use-toast';
import { BankDocsStep } from '@/pages/onboarding/steps/BankDocsStep';
import { CatalogStep } from '@/pages/onboarding/steps/CatalogStep';
import { OrgKYCStep } from '@/pages/onboarding/steps/OrgKYCStep';
import { ReviewStep } from '@/pages/onboarding/steps/ReviewStep';
import { onboardingService } from '@/services/onboarding.service';
import { BankDocData, CatalogData, OnboardingData, OnboardingStep, OrgKYCData } from '@/types/onboarding.types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('org-kyc');
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    currentStep: 'org-kyc',
    completedSteps: [],
  });

  // Load onboarding status from backend
  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const status = await onboardingService.getOnboardingStatus();
      
      // Map backend data to frontend state
      const backendStepMap: Record<string, OnboardingStep> = {
        'orgKyc': 'org-kyc',
        'bankDetails': 'bank-docs',
        'catalog': 'catalog',
      };
      
      const completed = status.completedSteps
        .map((step: string) => backendStepMap[step])
        .filter(Boolean) as OnboardingStep[];
      
      // Determine current step based on completed steps
      let nextStep: OnboardingStep = 'org-kyc';
      if (completed.includes('catalog')) {
        nextStep = 'review';
      } else if (completed.includes('bank-docs')) {
        nextStep = 'catalog';
      } else if (completed.includes('org-kyc')) {
        nextStep = 'bank-docs';
      }
      
      setCompletedSteps(completed);
      setCurrentStep(nextStep);
      setOnboardingData({
        orgKyc: status.orgKyc,
        bankDocs: status.primaryBankAccount ? mapBankAccountToBankDocs(status.primaryBankAccount) : undefined,
        currentStep: nextStep,
        completedSteps: completed,
      });
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to map backend bank account to frontend structure
  const mapBankAccountToBankDocs = (bankAccount): BankDocData => {
    return {
      accountName: bankAccount.accountHolderName,
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifsc,
      payoutMethod: 'RTGS',
      isPennyDropVerified: bankAccount.pennyDropStatus === 'VERIFIED',
      documents: bankAccount.documents || [],
      declarations: {
        warrantyAssurance: true,
        termsAccepted: true,
        amlCompliance: true,
      },
    };
  };

  const handleNext = (data: OrgKYCData | BankDocData | CatalogData) => {
    const updatedData = { ...onboardingData };

    if (currentStep === 'org-kyc') {
      updatedData.orgKyc = data as OrgKYCData;
      if (!completedSteps.includes('org-kyc')) {
        setCompletedSteps([...completedSteps, 'org-kyc']);
      }
      setCurrentStep('bank-docs');
    } else if (currentStep === 'bank-docs') {
      updatedData.bankDocs = data as BankDocData;
      if (!completedSteps.includes('bank-docs')) {
        setCompletedSteps([...completedSteps, 'bank-docs']);
      }
      setCurrentStep('catalog');
    } else if (currentStep === 'catalog') {
      updatedData.catalog = data as CatalogData;
      if (!completedSteps.includes('catalog')) {
        setCompletedSteps([...completedSteps, 'catalog']);
      }
      setCurrentStep('review');
    }

    setOnboardingData(updatedData);
  };

  const handleBack = () => {
    if (currentStep === 'bank-docs') {
      setCurrentStep('org-kyc');
    } else if (currentStep === 'catalog') {
      setCurrentStep('bank-docs');
    } else if (currentStep === 'review') {
      setCurrentStep('catalog');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await onboardingService.submitOnboarding();
      
      toast({
        title: 'Success!',
        description: response.message,
      });

      // Redirect to KYC status page
      navigate('/seller/kyc-status');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit onboarding',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Onboarding</h1>
        <p className="text-muted-foreground">
          Complete your profile to start receiving RFQs
        </p>
      </div>

      <OnboardingStepper currentStep={currentStep} completedSteps={completedSteps} />

      <div className="mt-8 bg-card border rounded-lg p-6">
        {currentStep === 'org-kyc' && (
          <OrgKYCStep
            data={onboardingData.orgKyc}
            onNext={handleNext}
            onBack={undefined}
          />
        )}
        
        {currentStep === 'bank-docs' && (
          <BankDocsStep
            data={onboardingData.bankDocs}
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
            onBack={handleBack}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
