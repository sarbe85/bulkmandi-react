import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

// ✅ IMPORT SINGLE TYPE FROM SCHEMA
import { BankDetails, bankDetailsSchema } from '../../schemas/onboarding.schema';
import onboardingService from '../../services/onboarding.service';

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

const BANK_DOC_TYPES = [
  { type: 'CANCELLED_CHEQUE', label: 'Cancelled Cheque', required: true },
  { type: 'BANK_PASSBOOK', label: 'Bank Passbook', required: false },
  { type: 'BANK_STATEMENT', label: 'Bank Statement (3 months)', required: false },
  { type: 'BANK_LETTER', label: 'Bank Letter', required: false },
];

export default function BankDetailsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ✅ USE SINGLE TYPE
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BankDetails>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: '',
      accountHolderName: '',
      ifsc: '',
      bankName: '',
      accountType: 'Current',
    },
  });

  const accountNumber = watch('accountNumber');
  const ifsc = watch('ifsc');

  // ✅ PRE-FILL from API response
  useEffect(() => {
    if (data?.primaryBankAccount) {
      console.log('📋 Pre-filling Bank Details:', data.primaryBankAccount);
      
      // ✅ Validate it matches schema
      try {
        const validated = bankDetailsSchema.parse(data.primaryBankAccount);
        
        setValue('accountNumber', validated.accountNumber || '');
        setValue('accountHolderName', validated.accountHolderName || '');
        setValue('ifsc', validated.ifsc || '');
        setValue('bankName', validated.bankName || '');
        setValue('accountType', validated.accountType || 'Current');
      } catch (error) {
        console.error('Invalid bank details from API:', error);
      }
    }
  }, [data, setValue]);

  // ========== HANDLERS ==========

  const handlePennyDrop = async () => {
    if (!accountNumber || !ifsc) {
      toast({
        title: 'Missing Information',
        description: 'Please enter account number and IFSC code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsPennyDropping(true);
      console.log('🔍 Verifying penny drop...');
      
      // ✅ Get partial BankDetails response
      const result = await onboardingService.verifyPennyDrop(accountNumber, ifsc);

      // ✅ Update form with verified data
      if (result.verified) {
        setValue('accountHolderName', result.accountName);
        setValue('isPennyDropVerified', true);
        setValue('pennyDropStatus', 'VERIFIED');
        
        toast({
          title: 'Verification Successful',
          description: 'Bank account verified successfully',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: result.message || 'Unable to verify bank account',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Penny drop error:', error);
      toast({
        title: 'Verification Error',
        description: error.message || 'Penny drop verification failed',
        variant: 'destructive',
      });
    } finally {
      setIsPennyDropping(false);
    }
  };

  const triggerFileInput = (docType: string) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF, JPG, PNG files are allowed',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    const newMap = new Map(selectedFiles);
    newMap.set(docType, file);
    setSelectedFiles(newMap);

    toast({
      title: 'File Selected',
      description: `${file.name} ready for upload`,
    });

    e.target.value = '';
  };

  const removeDocument = (docType: string) => {
    const newMap = new Map(selectedFiles);
    newMap.delete(docType);
    setSelectedFiles(newMap);
  };

  // ✅ Form Submit - SINGLE type
  const onSubmit = async (formData: BankDetails) => {
    try {
      setIsSubmitting(true);

      const missingDocs = BANK_DOC_TYPES.filter(
        (doc) => doc.required && !selectedFiles.has(doc.type)
      );

      if (missingDocs.length > 0) {
        toast({
          title: 'Missing Documents',
          description: `Please upload: ${missingDocs.map((d) => d.label).join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      const filesArray: File[] = Array.from(selectedFiles.values());

      console.log('📤 Saving bank details:', formData);

      // ✅ Send SINGLE BankDetails object
      await onboardingService.updateBankDetails(formData, filesArray);

      console.log('✅ Bank details saved');

      toast({
        title: 'Success',
        description: 'Bank details and documents saved successfully',
      });

      onNext();
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bank details',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <div>
        <h2 className="text-2xl font-bold">Bank Account Details & Documents</h2>
        <p className="text-gray-600 mt-1">
          Add your primary bank account information and required documents
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ========== ACCOUNT DETAILS SECTION ========== */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Account Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                {...register('accountNumber')}
                className="mt-2"
              />
              {errors.accountNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.accountNumber.message}</p>
              )}
            </div>

            {/* IFSC Code with Penny Drop */}
            <div>
              <Label htmlFor="ifsc">IFSC Code *</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="ifsc"
                  placeholder="Enter IFSC"
                  {...register('ifsc')}
                  maxLength={11}
                />
                <Button
                  type="button"
                  onClick={handlePennyDrop}
                  disabled={isPennyDropping}
                  variant="outline"
                  size="sm"
                >
                  {isPennyDropping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
              {errors.ifsc && (
                <p className="text-red-600 text-sm mt-1">{errors.ifsc.message}</p>
              )}
            </div>

            {/* Account Holder Name */}
            <div>
              <Label htmlFor="accountHolderName">Account Holder Name *</Label>
              <Input
                id="accountHolderName"
                placeholder="Enter account holder name"
                {...register('accountHolderName')}
                className="mt-2"
              />
              {errors.accountHolderName && (
                <p className="text-red-600 text-sm mt-1">{errors.accountHolderName.message}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                {...register('bankName')}
                className="mt-2"
              />
              {errors.bankName && (
                <p className="text-red-600 text-sm mt-1">{errors.bankName.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div className="md:col-span-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <select
                id="accountType"
                {...register('accountType')}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
          </div>
        </Card>

        {/* ========== BANK DOCUMENTS UPLOAD SECTION ========== */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Bank Documents</h3>

          <div className="space-y-4">
            {BANK_DOC_TYPES.map((doc) => (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">
                      {doc.label}
                      {doc.required && <span className="text-red-600 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {doc.required ? 'Required' : 'Optional'} • PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(doc.type, el);
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc.type)}
                    style={{ display: 'none' }}
                  />

                  {!selectedFiles.has(doc.type) ? (
                    <Button
                      type="button"
                      onClick={() => triggerFileInput(doc.type)}
                      disabled={isSubmitting}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                      <span className="text-sm text-green-800">
                        ✓ {selectedFiles.get(doc.type)?.name}
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeDocument(doc.type)}
                        disabled={isSubmitting}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ========== FORM ACTIONS ========== */}
        <div className="flex gap-4 justify-end">
          <Button type="button" onClick={onBack} variant="outline">
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
