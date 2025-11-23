import { Check } from 'lucide-react';
import { OnboardingStep } from '../types/onboarding.types';

interface Props {
  steps: OnboardingStep[];
  current: number;
}

export default function Stepper({ steps, current }: Props) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm ${
                index < current
                  ? 'bg-success text-success-foreground'
                  : index === current
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < current ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <p className="text-xs font-semibold text-foreground whitespace-nowrap">{step.label}</p>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-4 transition-all rounded-full ${
                index < current ? 'bg-success' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
