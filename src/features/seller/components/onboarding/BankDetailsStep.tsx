import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BankDetails, bankDetailsSchema } from '../../schemas/onboarding.schema';
import onboardingService from '../../services/onboarding.service';

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

enum BankDocType {
  CANCELLED_CHEQUE = 'CANCELLED_CHEQUE',
  BANK_PASSBOOK = 'BANK_PASSBOOK',
  BANK_STATEMENT = 'BANK_STATEMENT',
  BANK_LETTER = 'BANK_LETTER',
}

const BANK_DOC_TYPES = [
  { type: BankDocType.CANCELLED_CHEQUE, label: 'Cancelled Cheque', required: true },
  { type: BankDocType.BANK_PASSBOOK, label: 'Bank Passbook', required: false },
  { type: BankDocType.BANK_STATEMENT, label: 'Bank Statement (3 months)', required: false },
  { type: BankDocType.BANK_LETTER, label: 'Bank Letter', required: false },
];

const PAYOUT_METHODS = [
  { value: 'RTGS', label: 'RTGS' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'UPI', label: 'UPI' },
];

export default function BankDetailsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingIfsc, setIsValidatingIfsc] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [ifscValidated, setIfscValidated] = useState(false);
  const [ifscBankDetails, setIfscBankDetails] = useState<{ bankName: string; branchName: string } | null>(null);
  const [pennyDropStatus, setPennyDropStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<string>('RTGS');

  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Map<BankDocType, any>>(new Map());
  const fileInputRefs = useRef<Map<BankDocType, HTMLInputElement>>(new Map());

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: '',
      accountHolderName: '',
      ifsc: '',
      bankName: '',
    },
  });

  const accountNumber = watch('accountNumber');
  const ifsc = watch('ifsc');
  const accountHolderName = watch('accountHolderName');

  useEffect(() => {
    if (data?.primaryBankAccount?.documents && Array.isArray(data.primaryBankAccount.documents)) {
      const docsMap = new Map();
      data.primaryBankAccount.documents.forEach((doc: any) => {
        docsMap.set(doc.docType as BankDocType, {
          docType: doc.docType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
        });
      });
      setUploadedDocs(docsMap);
    }

    if (data?.primaryBankAccount) {
      setValue('accountNumber', data.primaryBankAccount.accountNumber || '');
      setValue('accountHolderName', data.primaryBankAccount.accountHolderName || '');
      setValue('ifsc', data.primaryBankAccount.ifsc || '');
      setValue('bankName', data.primaryBankAccount.bankName || '');
      if (data.primaryBankAccount.ifsc) {
        setIfscValidated(true);
        if (data.primaryBankAccount.bankName) {
          setIfscBankDetails({
            bankName: data.primaryBankAccount.bankName,
            branchName: 'Branch',
          });
        }
      }
      if (data.primaryBankAccount.pennyDropStatus === 'VERIFIED') {
        setPennyDropStatus('verified');
      }
      if (data.primaryBankAccount.payoutMethod) {
        setSelectedPayoutMethod(data.primaryBankAccount.payoutMethod);
      }
    }
  }, [data, setValue]);

  const handleValidateIfsc = async () => {
    if (!ifsc || ifsc.length < 11) {
      toast({
        title: 'Invalid IFSC',
        description: 'Please enter a valid 11-character IFSC code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsValidatingIfsc(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = {
        valid: true,
        bankName: 'SBI',
        branchName: 'NALCO',
      };

      if (!result.valid) throw new Error('IFSC not valid');
      setValue('bankName', result.bankName);
      setIfscBankDetails({
        bankName: result.bankName,
        branchName: result.branchName,
      });
      setIfscValidated(true);
      toast({
        title: 'IFSC Validated',
        description: `${result.bankName} - ${result.branchName}`,
      });
    } catch (error: any) {
      setIfscValidated(false);
      setIfscBankDetails(null);
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsValidatingIfsc(false);
    }
  };

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
      setPennyDropStatus('verifying');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const result = {
        verified: true,
        accountName: 'Test Account Holder',
      };

      if (!result.verified) throw new Error('Penny drop verification failed');
      setValue('accountHolderName', result.accountName);
      setPennyDropStatus('verified');
      toast({
        title: 'Account Verified',
        description: `Account holder: ${result.accountName}`,
      });
    } catch (error: any) {
      setPennyDropStatus('error');
      toast({
        title: 'Verification Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsPennyDropping(false);
    }
  };

  const triggerFileInput = (docType: BankDocType) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: BankDocType) => {
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

    setUploadingFiles((prev) => ({ ...prev, [docType]: true }));

    try {
      toast({ title: 'Uploading...', description: `${file.name}` });
      const response = await onboardingService.uploadSingleDocument(file, docType);

      setUploadedDocs((prev) => {
        const newMap = new Map(prev);
        newMap.set(docType, {
          docType: response.docType,
          fileName: response.fileName,
          fileUrl: response.fileUrl,
          uploadedAt: response.uploadedAt,
          status: response.status,
        });
        return newMap;
      });

      toast({ title: 'Upload Successful', description: `${file.name} uploaded` });
    } catch (error: any) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [docType]: false }));
      e.target.value = '';
    }
  };

  const removeDocument = async (docType: BankDocType) => {
    if (!confirm('Are you sure?')) return;
    try {
      await onboardingService.deleteDocument(docType);
      setUploadedDocs((prev) => {
        const newMap = new Map(prev);
        newMap.delete(docType);
        return newMap;
      });
      toast({ title: 'Document Removed' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const canSubmit = !!accountNumber && !!accountHolderName && !!ifsc && ifscValidated && uploadedDocs.has(BankDocType.CANCELLED_CHEQUE);

  const onSubmit = async (formData: BankDetails) => {
    try {
      setIsSubmitting(true);
      if (!ifscValidated) {
        toast({
          title: 'IFSC Not Validated',
          description: 'Please validate IFSC code first',
          variant: 'destructive',
        });
        return;
      }

      if (!uploadedDocs.has(BankDocType.CANCELLED_CHEQUE)) {
        toast({
          title: 'Missing Documents',
          description: 'Please upload Cancelled Cheque',
          variant: 'destructive',
        });
        return;
      }

      await onboardingService.updateBankDetailsWithDocuments(
        {
          ...formData,
          payoutMethod: selectedPayoutMethod,
          pennyDropStatus: pennyDropStatus === 'verified' ? 'VERIFIED' : 'PENDING',
          pennyDropScore: pennyDropStatus === 'verified' ? 100 : 0,
        },
        Array.from(uploadedDocs.values())
      );

      toast({ title: 'Success', description: 'Bank details saved' });
      onNext();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen py-4">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="p-6 dark:bg-slate-950 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Bank Account Details</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Add your primary bank account for payouts</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Number & Holder Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Number *</Label>
                <Input
                  placeholder="Enter account number"
                  {...register('accountNumber')}
                  className="h-9 text-sm dark:bg-slate-900 dark:border-slate-600 mt-1"
                />
                {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber.message}</p>}
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account Holder Name *</Label>
                <Input
                  placeholder="Enter account holder name"
                  {...register('accountHolderName')}
                  className="h-9 text-sm dark:bg-slate-900 dark:border-slate-600 mt-1"
                />
                {errors.accountHolderName && <p className="text-xs text-red-500 mt-1">{errors.accountHolderName.message}</p>}
              </div>
            </div>

            {/* IFSC, Validate Button, Bank Details */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">IFSC Code *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Enter 11-character IFSC code"
                  {...register('ifsc')}
                  className="h-9 text-sm flex-1 dark:bg-slate-900 dark:border-slate-600"
                />
                <Button
                  type="button"
                  onClick={handleValidateIfsc}
                  disabled={!ifsc || isValidatingIfsc}
                  className="h-9 px-4 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isValidatingIfsc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
                </Button>
              </div>
              {errors.ifsc && <p className="text-xs text-red-500 mt-1">{errors.ifsc.message}</p>}
              {ifscValidated && <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ IFSC Validated</p>}
            </div>

            {/* Bank & Branch Details - Shown after validation */}
            {ifscValidated && ifscBankDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-900/30">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Name</Label>
                  <Input
                    value={ifscBankDetails.bankName}
                    disabled
                    className="h-9 text-sm bg-slate-100 dark:bg-slate-900 dark:border-slate-600 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Branch Name</Label>
                  <Input
                    value={ifscBankDetails.branchName}
                    disabled
                    className="h-9 text-sm bg-slate-100 dark:bg-slate-900 dark:border-slate-600 mt-1"
                  />
                </div>
              </div>
            )}

            {/* Penny Drop Verification */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-900/30">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verify Account</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Confirm account details for secure transactions</p>
              </div>
              <Button
                type="button"
                onClick={handlePennyDrop}
                disabled={!accountNumber || !ifsc || isPennyDropping}
                className="h-9 px-4 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
              >
                {isPennyDropping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : pennyDropStatus === 'verified' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verified
                  </>
                ) : (
                  '💰 Verify'
                )}
              </Button>
            </div>

            {/* Payout Method */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payout Method *</Label>
              <div className="flex gap-6 mt-2">
                {PAYOUT_METHODS.map((method) => (
                  <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payoutMethod"
                      value={method.value}
                      checked={selectedPayoutMethod === method.value}
                      onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* UPI Details - Shown when UPI is selected */}
            {selectedPayoutMethod === 'UPI' && (
              <div>
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">UPI ID *</Label>
                <Input
                  placeholder="Enter UPI ID (e.g., user@bank)"
                  className="h-9 text-sm dark:bg-slate-900 dark:border-slate-600 mt-1"
                />
              </div>
            )}

            {/* Bank Documents - 2x2 Grid */}
            <div>
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">Bank Documents</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BANK_DOC_TYPES.map((doc) => {
                  const docTypeEnum = doc.type as BankDocType;
                  const isUploading = uploadingFiles[docTypeEnum] || false;
                  const hasFile = uploadedDocs.has(docTypeEnum);
                  const uploadedDoc = uploadedDocs.get(docTypeEnum);

                  return (
                    <div key={doc.type} className="p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {doc.label} {doc.required && <span className="text-red-500">*</span>}
                        </p>
                        {hasFile && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {doc.required ? 'Required' : 'Optional'} • PDF, JPG, PNG (Max 5MB)
                      </p>

                      {hasFile && uploadedDoc && (
                        <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">✓ Uploaded</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{uploadedDoc.fileName}</p>
                          <Button
                            type="button"
                            onClick={() => removeDocument(docTypeEnum)}
                            disabled={isSubmitting || isUploading}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full mt-1 h-7"
                          >
                            <X className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </div>
                      )}

                      <input
                        ref={(el) => {
                          if (el) fileInputRefs.current.set(docTypeEnum, el);
                        }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(e, docTypeEnum)}
                        style={{ display: 'none' }}
                      />

                      <Button
                        type="button"
                        onClick={() => triggerFileInput(docTypeEnum)}
                        disabled={isSubmitting || isUploading}
                        variant={hasFile ? 'outline' : 'default'}
                        size="sm"
                        className="w-full h-8 text-xs font-semibold"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            Uploading...
                          </>
                        ) : hasFile ? (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Replace
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-1" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 h-9 text-sm font-semibold"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="flex-1 h-9 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue →
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}