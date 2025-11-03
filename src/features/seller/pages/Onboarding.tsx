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
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-700 dark:text-gray-400" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading your onboarding...</p>
        </Card>
      </div>
    );
  }

  if (kycStatus === "SUBMITTED" || kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Onboarding In Progress</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Your onboarding process has been initiated and is pending review. You will be notified once the review is
            complete.
          </p>
          <button
            onClick={() => navigate("/seller/kyc-status")}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            View KYC Status
          </button>
        </Card>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Application Rejected</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Your application was rejected. Please review and resubmit your application with the required corrections.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-6">
            For detailed feedback, please check the KYC Status page.
          </p>
          <button
            onClick={() => {
              setKycStatus("DRAFT");
              setCurrentStep(ONBOARDING_STEPS.ORG_KYC);
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2 px-4 rounded transition-colors"
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
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ========== PAGE HEADER ========== */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Seller Onboarding</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{ONBOARDING_STEP_DESCRIPTIONS[currentStep]}</p>
          <div className="mt-3 flex items-center gap-3">
            <Badge className="bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300 font-medium text-xs">
              Step {stepNumber} of {totalSteps}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-500">{currentStep}</span>
          </div>
        </div>

        {/* ========== STEPPER INDICATOR ========== */}
        <div className="mb-8">
          <div className="flex items-center gap-1 overflow-x-auto pb-3">
            {ONBOARDING_STEP_LIST.map((step, index) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = step === currentStep;
              const isActive = isCurrent || isCompleted;

              return (
                <div key={step} className="flex items-center gap-1 flex-shrink-0">
                  {/* Step Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 transition-all ${
                      isCompleted
                        ? "bg-gray-800 text-white dark:bg-slate-600 dark:text-white"
                        : isCurrent
                        ? "bg-gray-700 text-white dark:bg-slate-500 dark:text-white ring-2 ring-gray-900 dark:ring-slate-400"
                        : "bg-gray-200 text-gray-500 dark:bg-slate-700 dark:text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>

                  {/* Connector Line */}
                  {index < ONBOARDING_STEP_LIST.length - 1 && (
                    <div
                      className={`h-0.5 w-6 flex-shrink-0 transition-all ${
                        isCompleted ? "bg-gray-800 dark:bg-slate-600" : "bg-gray-300 dark:bg-slate-700"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Labels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {ONBOARDING_STEP_LIST.map((step) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = step === currentStep;

              return (
                <div
                  key={step}
                  className={`text-xs text-center font-medium transition-colors ${
                    isCurrent
                      ? "text-gray-900 dark:text-white"
                      : isCompleted
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {ONBOARDING_STEP_LABELS[step]}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== STEP CONTENT ========== */}
        <Card className="border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="space-y-6">
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
                  isSubmitting={saving}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}