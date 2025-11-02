import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BankDetailsStep from "../components/onboarding/BankDetailsStep";
import CatalogStep from "../components/onboarding/CatalogStep";
import ComplianceDocsStep from "../components/onboarding/ComplianceDocsStep";
import OrgKYCStep from "../components/onboarding/OrgKYCStep";
import ReviewStep from "../components/onboarding/ReviewStep";
import { useOnboardingData } from "../hooks/useOnboardingData";
import onboardingService from "../services/onboarding.service";
import {
  ONBOARDING_STEP_DESCRIPTIONS,
  ONBOARDING_STEP_LABELS,
  ONBOARDING_STEP_LIST,
  ONBOARDING_STEPS,
  OnboardingStep,
} from "../types/onboarding.types";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { onboarding: contextData, isLoading: contextLoading, refreshData } = useOnboardingData();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(ONBOARDING_STEPS.ORG_KYC);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState("DRAFT");
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);

  useEffect(() => {
    if (contextData) {
      console.log("📋 Onboarding data from context:", contextData);
      setKycStatus(contextData.kycStatus || "DRAFT");

      setCompletedSteps((contextData.completedSteps ?? []) as OnboardingStep[]);
      console.log("✅ Completed steps:", completedSteps);
      console.log("✅ Completed steps1:", contextData.completedSteps);
      const nextStep =
        ONBOARDING_STEP_LIST.find((step) => !contextData.completedSteps?.includes(step)) || ONBOARDING_STEPS.REVIEW;
      console.log("📍 Current step:", nextStep);
      setCurrentStep(nextStep);
    }
  }, [contextData]);

  const handleStepNext = async (nextStepName: OnboardingStep) => {
    console.log(`➡️ Moving from ${currentStep} to ${nextStepName}...`);
    
    // Mark current step as completed
    const currentStepIndex = ONBOARDING_STEP_LIST.findIndex((step) => step === currentStep);
    if (currentStepIndex !== -1) {
      const newCompleted = [...completedSteps];
      if (!newCompleted.includes(currentStep)) {
        newCompleted.push(currentStep);
        setCompletedSteps(newCompleted);
      }
    }

    // Move to next step
    setCurrentStep(nextStepName);
    
    // Refresh data from server
    await refreshData();
  };

  const handleReviewSubmit = async () => {
    try {
      setSaving(true);
      console.log("📤 Submitting onboarding for review...");

      const response = await onboardingService.submitOnboarding();
      console.log("✅ Submitted successfully");

      toast({
        title: "Success",
        description: "Your onboarding has been submitted for review",
      });

      navigate("/seller/kyc-status");
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit onboarding",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading your onboarding...</p>
        </Card>
      </div>
    );
  }

  if (kycStatus === "SUBMITTED" || kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Onboarding In Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your onboarding process has been initiated and is pending review. You will be notified once the review is
            complete.
          </p>
          <button
            onClick={() => navigate("/seller/kyc-status")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            View KYC Status
          </button>
        </Card>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Application Rejected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your application was rejected. Please review and resubmit your application with the required corrections.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            For detailed feedback, please check the KYC Status page.
          </p>
          <button
            onClick={() => {
              setKycStatus("DRAFT");
              setCurrentStep(ONBOARDING_STEPS.ORG_KYC);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Restart Onboarding
          </button>
        </Card>
      </div>
    );
  }

  const stepNumber = ONBOARDING_STEP_LIST.indexOf(currentStep) + 1;
  const totalSteps = ONBOARDING_STEP_LIST.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ========== PAGE HEADER ========== */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3">
            Seller Onboarding
          </h1>
          <p className="text-muted-foreground text-lg mb-4">{ONBOARDING_STEP_DESCRIPTIONS[currentStep]}</p>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg">
            Step {stepNumber} of {totalSteps}
          </Badge>
        </div>

        {/* ========== STEPPER INDICATOR ========== */}
        <Card className="p-8 mb-8 border-2 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {ONBOARDING_STEP_LIST.map((step, index) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = step === currentStep;
              const isActive = isCurrent || isCompleted;

              return (
                <div key={step} className="flex items-center gap-2">
                  {/* Step Circle */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-all duration-300 shadow-lg ${
                      isCompleted
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                        : isCurrent
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ring-4 ring-blue-400/30 dark:ring-blue-600/30 scale-110"
                        : "bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : index + 1}
                  </div>

                  {/* Step Label - Hidden on mobile */}
                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-semibold whitespace-nowrap ${
                        isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {ONBOARDING_STEP_LABELS[step]}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < ONBOARDING_STEP_LIST.length - 1 && (
                    <div
                      className={`h-2 w-12 rounded-full transition-all duration-300 ${
                        isCompleted ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ========== STEP CONTENT ========== */}
        <div className="space-y-8">
          {currentStep === ONBOARDING_STEPS.ORG_KYC && (
            <OrgKYCStep
              data={contextData?.orgKyc}
              onNext={() => handleStepNext(ONBOARDING_STEPS.BANK_DETAILS)}
              onBack={() => {}}
            />
          )}

          {currentStep === ONBOARDING_STEPS.BANK_DETAILS && (
            <BankDetailsStep
              data={contextData?.primaryBankAccount}
              onNext={() => handleStepNext(ONBOARDING_STEPS.COMPLIANCE_DOCS)}
              onBack={() => setCurrentStep(ONBOARDING_STEPS.ORG_KYC)}
            />
          )}

          {currentStep === ONBOARDING_STEPS.COMPLIANCE_DOCS && (
            <ComplianceDocsStep
              onNext={() => handleStepNext(ONBOARDING_STEPS.CATALOG_AND_PRICE)}
              onBack={() => setCurrentStep(ONBOARDING_STEPS.BANK_DETAILS)}
            />
          )}

          {currentStep === ONBOARDING_STEPS.CATALOG_AND_PRICE && (
            <CatalogStep
              onNext={() => handleStepNext(ONBOARDING_STEPS.REVIEW)}
              onBack={() => setCurrentStep(ONBOARDING_STEPS.COMPLIANCE_DOCS)}
            />
          )}

          {currentStep === ONBOARDING_STEPS.REVIEW && (
            <ReviewStep
              data={contextData}
              onSubmit={handleReviewSubmit}
              onBack={() => setCurrentStep(ONBOARDING_STEPS.CATALOG_AND_PRICE)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
