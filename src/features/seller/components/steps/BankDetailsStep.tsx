
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';
import { BankDocData, DocumentUpload } from '../../types/onboarding.types';

const schema = z.object({
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(8, 'Account number is required'),
  ifscCode: z
    .string()
    .regex(/^[A-Z0-9]{11}$/, 'Invalid IFSC code'),
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  warrantyAssurance: z.boolean().refine((val) => val === true, {
    message: 'You must confirm bank details are correct',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions',
  }),
  amlCompliance: z.boolean().refine((val) => val === true, {
    message: 'You must confirm AML/KYC compliance',
  }),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data?: BankDocData;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const BankDetailsStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [pennyDropping, setPennyDropping] = useState(false);
  const [pennyDropResult, setPennyDropResult] = useState<any>(null);
  const [cancelledChequeFile, setCancelledChequeFile] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          ifscCode: data.ifscCode,
          bankName: data.bankName,
          accountType: data.accountType,
          warrantyAssurance: data.declarations?.warrantyAssurance ?? false,
          termsAccepted: data.declarations?.termsAccepted ?? false,
          amlCompliance: data.declarations?.amlCompliance ?? false,
        }
      : {
          warrantyAssurance: false,
          termsAccepted: false,
          amlCompliance: false,
        },
  });

  // ✅ NEW: Pre-fill form when data prop changes
  useEffect(() => {
    if (data) {
      setValue('accountName', data.accountName);
      setValue('accountNumber', data.accountNumber);
      setValue('ifscCode', data.ifscCode);
      setValue('bankName', data.bankName || '');
      setValue('accountType', data.accountType || '');
      setValue(
        'warrantyAssurance',
        data.declarations?.warrantyAssurance ?? false
      );
      setValue('termsAccepted', data.declarations?.termsAccepted ?? false);
      setValue('amlCompliance', data.declarations?.amlCompliance ?? false);

      if (data.documents && data.documents.length > 0) {
        const cheque = data.documents.find(
          (d) => d.type === 'CANCELLED_CHEQUE'
        );
        if (cheque) {
          setCancelledChequeFile({
            file: new File([], cheque.fileName),
            url: cheque.fileUrl,
          });
        }
      }
    }
  }, [data, setValue]);

  const handlePennyDrop = async () => {
    const accountNumber = watch('accountNumber');
    const ifscCode = watch('ifscCode');

    if (!accountNumber || !ifscCode) {
      toast({
        title: 'Missing Information',
        description: 'Please enter account number and IFSC code.',
        variant: 'destructive',
      });
      return;
    }

    setPennyDropping(true);
    try {
      const result = await onboardingService.verifyPennyDrop(
        accountNumber,
        ifscCode
      );
      setPennyDropResult(result);

      if (result.verified) {
        toast({
          title: 'Verification Successful',
          description: `Account matched: ${result.accountName}`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Account verification failed.',
        variant: 'destructive',
      });
    } finally {
      setPennyDropping(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setCancelledChequeFile({ file, url });
    }
  };

  // ✅ MODIFIED: Changed to call API and pass API response to onNext
  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      // Check for cancelled cheque
      if (!cancelledChequeFile) {
        toast({
          title: 'Missing Document',
          description: 'Please upload cancelled cheque or passbook',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare documents array with only cancelled cheque
      const uploadedDocuments: DocumentUpload[] = [
        {
          type: 'CANCELLED_CHEQUE',
          fileName: cancelledChequeFile.file.name,
          fileUrl: cancelledChequeFile.url,
          uploadedAt: new Date().toISOString(),
          status: 'UPLOADED' as const,
        },
      ];

      const bankData: BankDocData = {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName || 'Bank',
        accountType: formData.accountType || 'Current',
        payoutMethod: 'RTGS',
        isPennyDropVerified: pennyDropResult?.verified || false,
        documents: uploadedDocuments,
        declarations: {
          warrantyAssurance: formData.warrantyAssurance,
          termsAccepted: formData.termsAccepted,
          amlCompliance: formData.amlCompliance,
        },
      };

      // ✅ NEW: Call API service to save
      const response = await onboardingService.updateBankDetails(bankData);

      toast({
        title: 'Success',
        description: 'Bank details saved successfully',
      });

      // ✅ CHANGED: Pass API response (contains completedSteps) to onNext
      onNext(response);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bank details.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Bank Account Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Account Information</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="accountName">Account Holder Name *</Label>
            <Input
              id="accountName"
              {...register('accountName')}
              placeholder="Name as per bank account"
            />
            {errors.accountName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              {...register('bankName')}
              placeholder="e.g., HDFC Bank, ICICI Bank"
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              {...register('accountNumber')}
              placeholder="12345678901234"
            />
            {errors.accountNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ifscCode">IFSC Code *</Label>
            <Input
              id="ifscCode"
              {...register('ifscCode')}
              placeholder="e.g., HDFC0001234"
            />
            {errors.ifscCode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.ifscCode.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType">Account Type</Label>
            <select
              id="accountType"
              {...register('accountType')}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Type</option>
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Account Verification */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Verification</h3>

        <Button
          type="button"
          variant="outline"
          onClick={handlePennyDrop}
          disabled={pennyDropping}
          className="mb-4"
        >
          {pennyDropping ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Account'
          )}
        </Button>

        {pennyDropResult && pennyDropResult.verified && (
          <Badge className="bg-green-100 text-green-800 gap-2">
            <Check className="h-4 w-4" />
            Verification Successful: {pennyDropResult.accountName}
          </Badge>
        )}
      </Card>

      {/* Supporting Document */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Supporting Document</h3>

        <Label className="text-sm font-medium mb-3 block">
          Cancelled Cheque / Passbook *
        </Label>

        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            id="chequeFile"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <label htmlFor="chequeFile" className="cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {cancelledChequeFile ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  {cancelledChequeFile.file.name}
                </span>
              ) : (
                'Click to upload or drag and drop'
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, JPEG, PNG</p>
          </label>
        </div>
      </Card>

      {/* Declarations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Declarations</h3>

        <div className="space-y-4">
          {/* Warranty Assurance */}
          <div className="flex items-start gap-3">
            <Controller
              name="warrantyAssurance"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="warrantyAssurance"
                />
              )}
            />
            <Label
              htmlFor="warrantyAssurance"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I confirm the bank details are correct and active
            </Label>
          </div>
          {errors.warrantyAssurance && (
            <p className="text-red-500 text-sm ml-7">
              {errors.warrantyAssurance.message}
            </p>
          )}

          {/* Terms Accepted */}
          <div className="flex items-start gap-3">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="termsAccepted"
                />
              )}
            />
            <Label
              htmlFor="termsAccepted"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I accept the terms and conditions
            </Label>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-500 text-sm ml-7">
              {errors.termsAccepted.message}
            </p>
          )}

          {/* AML Compliance */}
          <div className="flex items-start gap-3">
            <Controller
              name="amlCompliance"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="amlCompliance"
                />
              )}
            />
            <Label
              htmlFor="amlCompliance"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I confirm AML/KYC compliance
            </Label>
          </div>
          {errors.amlCompliance && (
            <p className="text-red-500 text-sm ml-7">
              {errors.amlCompliance.message}
            </p>
          )}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </div>
    </form>
  );
};

export default BankDetailsStep;