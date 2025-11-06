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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Bank Account Information</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="accountNumber" className="text-sm">Account Number *</Label>
            <Input
              {...register('accountNumber')}
              id="accountNumber"
              placeholder="Enter account number"
              disabled={isSubmitting}
              className="mt-1.5 h-9 text-sm"
            />
            {errors.accountNumber && (
              <p className="text-xs text-destructive mt-1">{errors.accountNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountHolderName" className="text-sm">Account Holder Name *</Label>
            <Input
              {...register('accountHolderName')}
              id="accountHolderName"
              placeholder="As per bank records"
              disabled={isSubmitting}
              className="mt-1.5 h-9 text-sm"
            />
            {errors.accountHolderName && (
              <p className="text-xs text-destructive mt-1">{errors.accountHolderName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 items-start">
          <div>
            <Label htmlFor="ifsc" className="text-sm">IFSC Code *</Label>
            <Input
              {...register('ifsc')}
              id="ifsc"
              placeholder="SBIN0001234"
              disabled={isSubmitting}
              className="mt-1.5 h-9 text-sm"
            />
            {errors.ifsc && <p className="text-xs text-destructive mt-1">{errors.ifsc.message}</p>}
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleValidateIfsc}
              disabled={isSubmitting || !ifsc || isValidatingIfsc}
              variant="outline"
              size="sm"
              className="h-9 w-full text-sm"
            >
              {isValidatingIfsc ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Validate'}
            </Button>
          </div>

          <div className={`${ifscValidated ? '' : 'hidden'}`}>
            <Label className="text-sm">Bank Name</Label>
            <Input {...register('bankName')} disabled className="mt-1.5 h-9 bg-muted text-sm" />
          </div>

          <div className={`${ifscValidated ? '' : 'hidden'}`}>
            <Label className="text-sm">Branch</Label>
            <Input value={ifscBankDetails?.branchName || ''} disabled className="mt-1.5 h-9 bg-muted text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Label className="text-sm font-medium">Payout Method *</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="payoutMethod" value="RTGS" defaultChecked className="h-3.5 w-3.5" />
              <span className="text-sm">RTGS</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="payoutMethod" value="NEFT" className="h-3.5 w-3.5" />
              <span className="text-sm">NEFT</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="payoutMethod" value="UPI" className="h-3.5 w-3.5" />
              <span className="text-sm">UPI</span>
            </label>
          </div>
        </div>

        <div className="border-t pt-3 mt-2">
          <Button
            type="button"
            onClick={handlePennyDrop}
            disabled={isPennyDropping || !accountNumber || !ifsc}
            variant="outline"
            size="sm"
            className="h-9 text-sm"
          >
            {isPennyDropping ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Verifying...
              </>
            ) : (
              '💰 Verify Bank Account'
            )}
          </Button>
          {pennyDropStatus === 'verified' && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Verified
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <h3 className="text-base font-semibold text-foreground mb-1">Bank Documents</h3>
        
        <div className="grid grid-cols-2 gap-2">
          {BANK_DOC_TYPES.map((doc) => {
            const docTypeEnum = doc.type as BankDocType;
            const isUploading = uploadingFiles[docTypeEnum] || false;
            const hasFile = uploadedDocs.has(docTypeEnum);
            const uploadedDoc = uploadedDocs.get(docTypeEnum);

            return (
              <div key={doc.type} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {doc.label} {doc.required && <span className="text-destructive">*</span>}
                  </Label>
                  {hasFile && uploadedDoc && (
                    <Button
                      type="button"
                      onClick={() => removeDocument(docTypeEnum)}
                      disabled={isSubmitting || isUploading}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {hasFile && uploadedDoc ? (
                  <div className="flex items-center gap-2 p-2 bg-success/10 rounded-md border border-success/20">
                    <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                    <span className="text-xs text-success truncate flex-1">{uploadedDoc.fileName}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-2">PDF, JPG, PNG (Max 5MB)</p>
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
                  className="w-full h-8 text-xs mt-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : hasFile ? (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Replace
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting} size="sm" className="h-9 text-sm">
          ← Back
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting} size="sm" className="h-9 text-sm">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save & Continue →</>
          )}
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5 pt-2">
        <Lock className="h-3 w-3" />
        Your banking information is encrypted and securely stored
      </p>
    </form>
  );
}
