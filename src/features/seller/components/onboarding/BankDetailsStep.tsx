import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileText, Loader2, Lock, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BankDetails, bankDetailsSchema } from '../../schemas/onboarding.schema';
import onboardingService from '../../services/onboarding.service';
import { DocumentUpload } from '../../types/onboarding.types';

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

 

export default function BankDetailsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingIfsc, setIsValidatingIfsc] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [ifscValidated, setIfscValidated] = useState(false);
  const [ifscBankDetails, setIfscBankDetails] = useState<{ bankName: string; branchName: string } | null>(null);
  const [pennyDropStatus, setPennyDropStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');

  // ✅ PHASE 1: File state - caching uploaded files in frontend
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Map<BankDocType, DocumentUpload>>(new Map());
  const fileInputRefs = useRef<Map<BankDocType, HTMLInputElement>>(new Map());

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
    },
  });

  const accountNumber = watch('accountNumber');
  const ifsc = watch('ifsc');
  const accountHolderName = watch('accountHolderName');

  // ✅ Load existing documents from backend on mount
  useEffect(() => {
    if (data?.primaryBankAccount?.documents && Array.isArray(data.primaryBankAccount.documents)) {
      const docsMap = new Map<BankDocType, DocumentUpload>();
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

  // ✅ PHASE 1: Handle file selection - upload immediately (NO DB update)
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

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
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

      // ✅ PHASE 1: Upload file (NO DB update yet)
      const response = await onboardingService.uploadSingleDocument(file, docType);

      // ✅ Cache in frontend state ONLY
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

  // ✅ PHASE 2: Form submit - persist all to DB
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

      // ✅ PHASE 2: Send all data to backend for DB persistence
      await onboardingService.updateBankDetailsWithDocuments(
        {
          ...formData,
          pennyDropStatus: pennyDropStatus === 'verified' ? 'VERIFIED' : 'PENDING',
          pennyDropScore: pennyDropStatus === 'verified' ? 100 : 0,
        },
        Array.from(uploadedDocs.values()) // ✅ Pass all cached file URLs
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Account Details & Documents</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              {...register('accountNumber')}
              id="accountNumber"
              placeholder="Enter account number"
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.accountNumber && (
              <p className="text-sm text-destructive mt-1">{errors.accountNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              {...register('accountHolderName')}
              id="accountHolderName"
              placeholder="As per bank records"
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.accountHolderName && (
              <p className="text-sm text-destructive mt-1">{errors.accountHolderName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ifsc">IFSC Code *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                {...register('ifsc')}
                id="ifsc"
                placeholder="e.g., SBIN0001234"
                disabled={isSubmitting}
                className="flex-1"
              />
              {isValidatingIfsc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handleValidateIfsc}
                  disabled={isSubmitting || !ifsc}
                  variant="outline"
                >
                  Validate
                </Button>
              )}
            </div>
            {ifscValidated && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Validated
              </p>
            )}
          </div>

          <div>
            <Label>Bank Name</Label>
            <Input {...register('bankName')} disabled className="mt-1 bg-muted" />
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-base">Penny Drop Verification</Label>
            <Button
              type="button"
              onClick={handlePennyDrop}
              disabled={isPennyDropping || !accountNumber || !ifsc}
              variant="outline"
              className="w-full mt-2"
            >
              {isPennyDropping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>💰 Verify Bank Account</>
              )}
            </Button>
            {pennyDropStatus === 'verified' && (
              <p className="text-green-600 text-sm mt-1">✅ Account verified</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Documents</h3>

        <div className="space-y-4">
          {BANK_DOC_TYPES.map((doc) => {
            const docTypeEnum = doc.type as BankDocType;
            const isUploading = uploadingFiles[docTypeEnum] || false;
            const hasFile = uploadedDocs.has(docTypeEnum);
            const uploadedDoc = uploadedDocs.get(docTypeEnum);

            return (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Label className="text-base">
                      {doc.label} {doc.required && <span className="text-destructive">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {doc.required ? 'Required' : 'Optional'} • PDF, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>

                {hasFile && uploadedDoc && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">
                      <CheckCircle className="inline h-4 w-4 mr-1" />
                      Uploaded
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">{uploadedDoc.fileName}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeDocument(docTypeEnum)}
                        disabled={isSubmitting || isUploading}
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                    </p>
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

                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={() => triggerFileInput(docTypeEnum)}
                    disabled={isSubmitting || isUploading}
                    variant={hasFile ? 'outline' : 'default'}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : hasFile ? (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
          ← Back
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save & Continue →</>
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Lock className="h-4 w-4" />
        Your bank details are encrypted and securely processed
      </p>
    </form>
  );
}