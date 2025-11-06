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
  const { onboarding, silentRefresh } = useOnboardingData();

  // Navigation state - completely independent from data state
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [saving, setSaving] = useState(false);

  // ========== INITIALIZE STEP ONLY ONCE ==========
  useEffect(() => {
    // Only set initial step if not already set
    if (currentStep === null && onboarding) {
      const completedSteps = onboarding.completedSteps || [];
      
      // Find first incomplete step, or go to REVIEW if all complete
      const firstIncompleteStep = ONBOARDING_STEP_LIST.find(
        step => !completedSteps.includes(step)
      );
      
      const initialStep = firstIncompleteStep || ONBOARDING_STEPS.REVIEW;
      console.log(`[Onboarding] Setting initial step to: ${initialStep}`);
      setCurrentStep(initialStep);
    }
  }, [onboarding, currentStep]);

  // ========== STEP NAVIGATION - PURELY SEQUENTIAL ==========
  const handleStepNext = async (targetStep: OnboardingStep) => {
    console.log(`[Onboarding] Moving to next step: ${targetStep}`);
    
    // Update step immediately
    setCurrentStep(targetStep);
    
    // Refresh data silently in background (won't affect navigation)
    await silentRefresh();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepBack = (targetStep: OnboardingStep) => {
    console.log(`[Onboarding] Moving back to: ${targetStep}`);
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== FINAL SUBMISSION ==========
  const handleReviewSubmit = async () => {
    try {
      setSaving(true);
      console.log("📤 Submitting onboarding for review...");

      await onboardingService.submitOnboarding();
      
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

  // ========== LOADING STATE ==========
  if (currentStep === null || !onboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground font-medium">Loading your onboarding...</p>
        </Card>
      </div>
    );
  }

  // ========== STATUS GUARDS ==========
  const kycStatus = onboarding?.kycStatus || "DRAFT";

  if (kycStatus === "SUBMITTED" || kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Onboarding In Progress</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your onboarding process has been initiated and is pending review.
          </p>
          <button
            onClick={() => navigate("/seller/kyc-status")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded transition-colors"
          >
            View KYC Status
          </button>
        </Card>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Application Rejected</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your application was rejected. Please review and resubmit with corrections.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded transition-colors"
          >
            Restart Onboarding
          </button>
        </Card>
      </div>
    );
  }

  const stepNumber = ONBOARDING_STEP_LIST.indexOf(currentStep) + 1;
  const totalSteps = ONBOARDING_STEP_LIST.length;
  const completedSteps = onboarding?.completedSteps || [];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ========== PAGE HEADER ========== */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Seller Onboarding</h1>
          <p className="text-sm text-muted-foreground">{ONBOARDING_STEP_DESCRIPTIONS[currentStep]}</p>
          <div className="mt-3 flex items-center gap-3">
            <Badge className="bg-primary text-primary-foreground font-medium text-xs">
              Step {stepNumber} of {totalSteps}
            </Badge>
            <span className="text-xs text-muted-foreground">{currentStep}</span>
          </div>
        </div>

        {/* ========== STEPPER INDICATOR ========== */}
        <div className="mb-6 bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
            {ONBOARDING_STEP_LIST.map((step, index) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = step === currentStep;

              return (
                <div key={step} className="flex items-center flex-shrink-0 min-w-0">
                  <div className="flex flex-col items-center gap-2 min-w-[100px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isCompleted
                          ? "bg-success text-success-foreground shadow-md"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/30 shadow-lg scale-105"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-semibold text-center leading-tight px-1 ${
                        isCurrent
                          ? "text-foreground"
                          : isCompleted
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ONBOARDING_STEP_LABELS[step]}
                    </div>
                  </div>

                  {index < ONBOARDING_STEP_LIST.length - 1 && (
                    <div
                      className={`h-1 w-6 sm:w-10 mx-1 rounded-full flex-shrink-0 transition-all ${
                        isCompleted ? "bg-success" : "bg-border"
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== STEP CONTENT ========== */}
        <Card className="border shadow-sm">
          <div className="p-6">
            {currentStep === ONBOARDING_STEPS.ORG_KYC && (
              <OrgKYCStep
                data={onboarding?.orgKyc}
                onNext={() => handleStepNext(ONBOARDING_STEPS.BANK_DETAILS)}
              />
            )}

            {currentStep === ONBOARDING_STEPS.BANK_DETAILS && (
              <BankDetailsStep
                data={onboarding}
                onNext={() => handleStepNext(ONBOARDING_STEPS.COMPLIANCE_DOCS)}
                onBack={() => handleStepBack(ONBOARDING_STEPS.ORG_KYC)}
              />
            )}

            {currentStep === ONBOARDING_STEPS.COMPLIANCE_DOCS && (
              <ComplianceDocsStep
                data={onboarding}
                onNext={() => handleStepNext(ONBOARDING_STEPS.CATALOG_AND_PRICE)}
                onBack={() => handleStepBack(ONBOARDING_STEPS.BANK_DETAILS)}
              />
            )}

            {currentStep === ONBOARDING_STEPS.CATALOG_AND_PRICE && (
              <CatalogStep
                data={onboarding?.catalog ? {
                  catalog: onboarding.catalog,
                  priceFloors: onboarding.priceFloors || []
                } : undefined}
                onNext={() => handleStepNext(ONBOARDING_STEPS.REVIEW)}
                onBack={() => handleStepBack(ONBOARDING_STEPS.COMPLIANCE_DOCS)}
              />
            )}

            {currentStep === ONBOARDING_STEPS.REVIEW && (
              <ReviewStep
                data={onboarding}
                onSubmit={handleReviewSubmit}
                onBack={() => handleStepBack(ONBOARDING_STEPS.CATALOG_AND_PRICE)}
                isSubmitting={saving}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
