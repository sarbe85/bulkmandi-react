import { Check } from 'lucide-react';
import { OnboardingStep } from '../types/onboarding.types';

interface Props {
  steps: OnboardingStep[];
  current: number;
}

export default function Stepper({ steps, current }: Props) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              index < current
                ? 'bg-green-500 text-white'
                : index === current
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {index < current ? <Check className="w-5 h-5" /> : index + 1}
          </div>

          <div className="ml-2 text-center">
            <p className="text-xs font-semibold">{step.label}</p>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 transition-all ${
                index < current ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
