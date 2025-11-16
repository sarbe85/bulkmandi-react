// Copy from: seller/components/onboarding/Review.tsx
// Changes:
// 1. Display buyer data (no catalog/pricing)
// 2. Change import from seller service to buyer service
// 3. Update submit call to buyer hook

// import { Button, Card, Checkbox } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useOnboardingData } from '../../hooks/useOnboardingData';
import { submitSchema, type SubmitFormData } from '../../schemas/buyer-onboarding.schema';
import { buyerOnboardingService } from '../../services/onboarding.service';

interface Props {
  onboarding?: any;
  onNext?: () => void;
  onBack?: () => void;  // ← ADD THIS
}

export default function Review({ onboarding }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { silentRefresh } = useOnboardingData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      termsAccepted: false,
      dataAccuracyConfirmed: false,
    },
  });

  const onSubmit = async (formData: SubmitFormData) => {
    try {
      setIsSubmitting(true);
      await buyerOnboardingService.submitOnboarding(formData);
      await silentRefresh();
      toast({ title: 'Success', description: 'Onboarding submitted for verification' });
      setTimeout(() => navigate('/buyer/kyc-status'), 1000);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review & Submit</h2>

      {/* Organization Summary */}
      {onboarding?.orgKyc && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Organization Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Legal Name</p>
              <p className="font-semibold">{onboarding.orgKyc.legalName}</p>
            </div>
            <div>
              <p className="text-gray-600">GSTIN</p>
              <p className="font-semibold">{onboarding.orgKyc.gstin}</p>
            </div>
            <div>
              <p className="text-gray-600">PAN</p>
              <p className="font-semibold">{onboarding.orgKyc.pan}</p>
            </div>
            <div>
              <p className="text-gray-600">Business Type</p>
              <p className="font-semibold">{onboarding.orgKyc.businessType}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Bank Summary */}
      {onboarding?.primaryBankAccount && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Bank Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Account</p>
              <p className="font-semibold">****{onboarding.primaryBankAccount.accountNumber?.slice(-4)}</p>
            </div>
            <div>
              <p className="text-gray-600">Bank Name</p>
              <p className="font-semibold">{onboarding.primaryBankAccount.bankName}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Summary */}
      {onboarding?.buyerPreferences && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Buying Preferences</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Categories</p>
              <p className="font-semibold">{onboarding.buyerPreferences.categories?.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Incoterms</p>
              <p className="font-semibold">{onboarding.buyerPreferences.incoterms?.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-600">PINs</p>
              <p className="font-semibold">{onboarding.buyerPreferences.deliveryPins?.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-600">QC Requirement</p>
              <p className="font-semibold">{onboarding.buyerPreferences.qcRequirement}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Declarations */}
      <Card className="p-5 border-red-200 bg-red-50 dark:bg-red-900/20">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register('termsAccepted')} />
              <span className="text-sm">I have verified all the information provided and accept the terms</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register('dataAccuracyConfirmed')} />
              <span className="text-sm">I confirm the data accuracy and accept responsibility</span>
            </label>
          </div>

          {(errors.termsAccepted || errors.dataAccuracyConfirmed) && (
            <p className="text-red-600 text-xs">All declarations are required</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
