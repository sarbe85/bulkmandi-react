import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingStep } from '@/types/onboarding.types';

interface OnboardingStepperProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

const STEPS: { id: OnboardingStep; label: string; number: number }[] = [
  { id: 'account', label: 'Account', number: 1 },
  { id: 'org-kyc', label: 'Org KYC', number: 2 },
  { id: 'bank-docs', label: 'Bank & Docs', number: 3 },
  { id: 'catalog', label: 'Catalog', number: 4 },
  { id: 'review', label: 'Review', number: 5 },
];

export const OnboardingStepper = ({ currentStep, completedSteps }: OnboardingStepperProps) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  const getStepStatus = (step: typeof STEPS[0]) => {
    if (completedSteps.includes(step.id)) return 'done';
    if (step.id === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max p-3 border border-border rounded-xl bg-card/50">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step);
          
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    status === 'done' && "bg-success border-success text-success-foreground",
                    status === 'active' && "bg-primary border-primary text-primary-foreground",
                    status === 'pending' && "bg-background border border-border text-muted-foreground"
                  )}
                >
                  {status === 'done' ? <Check className="h-3 w-3" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    status === 'active' && "text-foreground",
                    status === 'done' && "text-muted-foreground",
                    status === 'pending' && "text-muted-foreground/60"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 rounded-full transition-all",
                  index < currentIndex ? "bg-success" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
