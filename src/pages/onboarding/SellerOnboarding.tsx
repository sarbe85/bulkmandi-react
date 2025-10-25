import DashboardLayout from "@/components/layout/DashboardLayout";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { onboardingService } from "@/services/onboarding.service";
import {
  BankDocData,
  CatalogData,
  OnboardingData,
  OnboardingStep,
  OrgKYCData,
} from "@/types/onboarding.types";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BankDocsStep } from "./steps/BankDocsStep";
import { CatalogStep } from "./steps/CatalogStep";
import { OrgKYCStep } from "./steps/OrgKYCStep";
import { ReviewStep } from "./steps/ReviewStep";

// Dummy data matching exact type structure
const DUMMY_ORG_KYC: OrgKYCData = {
  legalName: "ABC Steel Manufacturing Private Limited",
  tradeName: "ABC Steel Works",
  gstin: "21AABCS1234H1ZP",
  pan: "AAAAP1234K",
  cin: "U27200WB2015PTC213456",
  registeredAddress: "123 Industrial Area, Steel Street, Kolkata - 700001",
  businessType: "Manufacturer",
  incorporationDate: "2015-06-15",
  plantLocations: [
    {
      name: "Kolkata Main Plant",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
      isActive: true,
    },
    {
      name: "Mumbai Plant",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isActive: true,
    },
  ],
  primaryContact: {
    name: "Rajesh Kumar",
    email: "rajesh@abcsteel.com",
    mobile: "+919876543210",
    emailVerified: true,
    mobileVerified: true,
  },
};

const DUMMY_BANK_DOCS: BankDocData = {
  accountName: "ABC Steel Manufacturing Pvt Ltd",
  accountNumber: "1234567890123456",
  ifscCode: "SBIN0001234",
  payoutMethod: "RTGS",
  isPennyDropVerified: true,
  documents: [
    {
      type: "CANCELLED_CHEQUE",
      fileName: "cancelled-cheque.pdf",
      fileUrl: "/dummy/cheque.pdf",
      uploadedAt: "2025-01-15T10:30:00Z",
      status: "verified",
    },
    {
      type: "GST_CERTIFICATE",
      fileName: "gst-certificate.pdf",
      fileUrl: "/dummy/gst-certificate.pdf",
      uploadedAt: "2025-01-15T10:30:00Z",
      status: "verified",
    },
    {
      type: "FACTORY_LICENSE",
      fileName: "factory-license.pdf",
      fileUrl: "/dummy/factory-license.pdf",
      uploadedAt: "2025-01-15T10:30:00Z",
      status: "verified",
    },
  ],
  declarations: {
    warrantyAssurance: true,
    termsAccepted: true,
    amlCompliance: true,
  },
};

const DUMMY_CATALOG: CatalogData = {
  categories: ["Steel Coils", "Steel Sheets", "Steel Pipes"],
  grades: [
    {
      code: "HR-E250",
      name: "HR Coil - IS2062 E250",
      description: "High tensile strength hot rolled coils",
    },
    {
      code: "CR-MS",
      name: "CR Sheet - Mild Steel",
      description: "Cold rolled mild steel sheets",
    },
    {
      code: "GI-PIPE",
      name: "Galvanized Iron Pipe",
      description: "Standard GI pipes for construction",
    },
  ],
  moqPerOrder: 5,
  standardLeadDays: 7,
  priceFloors: [
    {
      category: "Steel Coils",
      pricePerMT: 45000,
      region: "North India",
    },
    {
      category: "Steel Sheets",
      pricePerMT: 52000,
      region: "North India",
    },
  ],
  plantLocations: ["Kolkata Main Plant", "Mumbai Plant"],
  logisticsType: "PLATFORM_3PL",
  availabilityDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
};

const DUMMY_ONBOARDING_DATA: OnboardingData = {
  currentStep: "org-kyc",
  completedSteps: ["account"],
  orgKyc: DUMMY_ORG_KYC,
  bankDocs: DUMMY_BANK_DOCS,
  catalog: DUMMY_CATALOG,
};

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, updateUser, checkAuth } = useAuth();

  const stepParam = searchParams.get("step") as OnboardingStep | null;
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    stepParam || "org-kyc"
  );
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([
    "account",
  ]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(
    DUMMY_ONBOARDING_DATA
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const draft = await onboardingService.getDraft();
      if (draft) {
        setOnboardingData(draft);
        setCurrentStep(draft.currentStep);
        setCompletedSteps(draft.completedSteps);
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
      // Keep dummy data as fallback
    }
  };

  const saveDraft = async (data: Partial<OnboardingData>) => {
    try {
      await onboardingService.saveDraft({
        ...onboardingData,
        ...data,
        currentStep,
        completedSteps,
      });
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handleNext = async (stepData) => {
    const updatedData = {
      ...onboardingData,
      ...(currentStep === "org-kyc" && { orgKyc: stepData }),
      ...(currentStep === "bank-docs" && { bankDocs: stepData }),
      ...(currentStep === "catalog" && { catalog: stepData }),
    };

    setOnboardingData(updatedData);

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    await saveDraft(updatedData);

    // Move to next step
    const steps: OnboardingStep[] = [
      "org-kyc",
      "bank-docs",
      "catalog",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: OnboardingStep[] = [
      "org-kyc",
      "bank-docs",
      "catalog",
      "review",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (
      !onboardingData.orgKyc ||
      !onboardingData.bankDocs ||
      !onboardingData.catalog
    ) {
      toast({
        title: "Incomplete Data",
        description: "Please complete all steps before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await onboardingService.submitOnboarding({
        orgKyc: onboardingData.orgKyc,
        bankDocs: onboardingData.bankDocs,
        catalog: onboardingData.catalog,
      });

      // Update users onboarding status in store
      if (user) {
        const updatedUser = {
          ...user,
          onboardingCompleted: true,
        };
        updateUser(updatedUser);
      }

      // Refresh auth state
      checkAuth();

      toast({
        title: "Success!",
        description: "Your onboarding has been submitted for review.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error.message || "Failed to submit onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndex = ["org-kyc", "bank-docs", "catalog", "review"].indexOf(
    currentStep
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              Complete Your Onboarding
            </h1>
            <p className="text-muted-foreground mt-2">
              Set up your seller account in just a few steps
            </p>
          </div>

          {/* Demo Mode Banner */}
          <Card className="mb-8 p-4 bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">Demo Mode Active:</strong>{" "}
              Pre-filled with dummy data for easy testing. Modify any field and
              click "Next" to proceed.
            </p>
          </Card>

          {/* Stepper */}
          <div className="mb-12">
            <OnboardingStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-lg border p-8">
            {currentStep === "org-kyc" && (
              <OrgKYCStep
                data={onboardingData.orgKyc}
                onNext={handleNext}
                onBack={() => navigate("/dashboard")}
              />
            )}

            {currentStep === "bank-docs" && (
              <BankDocsStep
                data={onboardingData.bankDocs}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === "catalog" && (
              <CatalogStep
                data={onboardingData.catalog}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {currentStep === "review" && (
              <ReviewStep
                data={onboardingData}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Progress Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Step {stepIndex + 1} of 4</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
