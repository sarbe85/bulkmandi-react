import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOnboardingData } from '../../hooks/useOnboardingData';
import { BankDetailsFormData, bankDetailsSchema } from '../../schemas/buyer-onboarding.schema';
import { buyerOnboardingService } from '../../services/onboarding.service';

// Example: replace with actual doc types required by backend
const BANK_DOC_TYPES = [
  { type: 'CANCELLED_CHEQUE', label: 'Cancelled Cheque', required: true },
  { type: 'BANK_STATEMENT', label: 'Latest Bank Statement', required: false },
];

export default function BankDetails({ data, onNext, onBack }) {
  const { toast } = useToast();
  const { silentRefresh } = useOnboardingData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingIfsc, setIsValidatingIfsc] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [ifscValidated, setIfscValidated] = useState(false);
  const [ifscBankDetails, setIfscBankDetails] = useState(null);
  const [pennyDropStatus, setPennyDropStatus] = useState('idle');
  const [pennyDropScore, setPennyDropScore] = useState();

  // File upload state
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState(new Map());
  const fileInputRefs = useRef(new Map());

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: data || {
      accountNumber: "",
      accountType: 'CURRENT',
      payoutMethod: 'RTGS',
    },
  });

  // Watch fields
  const accountNumber = watch('accountNumber');
  const ifsc = watch('ifsc');
  const accountHolderName = watch('accountHolderName');
  const payoutMethod = watch('payoutMethod');
  const upiDetails = watch('upiDetails');

  // Load doc state & bank details on mount
  useEffect(() => {
    if (data?.documents && Array.isArray(data.documents)) {
      const docsMap = new Map();
      data.documents.forEach((doc) => {
        docsMap.set(doc.docType, doc);
      });
      setUploadedDocs(docsMap);
    }
    if (data?.accountNumber) setValue('accountNumber', data.accountNumber);
    if (data?.accountHolderName) setValue('accountHolderName', data.accountHolderName);
    if (data?.ifsc) {
      setValue('ifsc', data.ifsc);
      setIfscValidated(true);
      if (data.bankName) {
        setValue('bankName', data.bankName);
        setIfscBankDetails({ bankName: data.bankName, branchName: data.branchName || '' });
      }
    }
    if (data?.pennyDropScore) setPennyDropScore(data.pennyDropScore);
    if (data?.pennyDropStatus) setPennyDropStatus(data.pennyDropStatus);
  }, [data, setValue]);

  // Validate IFSC handler
  const handleValidateIfsc = async () => {
    if (!ifsc || ifsc.length < 11) {
      toast({
        title: 'Invalid IFSC',
        description: 'Please enter a valid 11-character IFSC code',
        variant: 'destructive',
      });
      return;
    }
    setValue('ifsc', ifsc.toUpperCase());
    try {
      setIsValidatingIfsc(true);
      // Replace with API call to validate IFSC (fake here)
      const result = { valid: true, bankName: 'SBI', branchName: 'NALCO' };
      if (!result.valid) throw new Error('IFSC not valid');
      setValue('bankName', result.bankName);
      setIfscBankDetails({ bankName: result.bankName, branchName: result.branchName });
      setIfscValidated(true);
      toast({ title: 'IFSC Validated', description: `${result.bankName} - ${result.branchName}` });
    } catch (error) {
      setIfscValidated(false);
      setIfscBankDetails(null);
      toast({ title: 'Validation Error', description: error?.message, variant: 'destructive' });
    } finally {
      setIsValidatingIfsc(false);
    }
  };

  // Penny drop verification
  const handlePennyDrop = async () => {
    if (!accountNumber || !ifsc) {
      toast({ title: 'Missing Information', description: 'Please enter account number and IFSC code', variant: 'destructive' });
      return;
    }
    try {
      setIsPennyDropping(true);
      setPennyDropStatus('verifying');
      // Replace with backend API
     // const response = await buyerOnboardingService.verifyPennyDrop(accountNumber, ifsc);
     await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = {
        verified: true,
        accountName: "Test Account Holder",
      };
     
      setValue('accountHolderName', response.accountName || accountHolderName);
      setPennyDropStatus('verified');
     // setPennyDropScore(response.score || 100);
      toast({ title: 'Account Verified', description: ` ` });
    } catch (error) {
      setPennyDropStatus('error');
      setPennyDropScore(undefined);
      toast({ title: 'Verification Error', description: error?.message, variant: 'destructive' });
    } finally {
      setIsPennyDropping(false);
    }
  };

  // File upload
  const triggerFileInput = (docType) => {
    const input = fileInputRefs.current.get(docType);
    if (input) input.click();
  };

  const handleFileSelect = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'File must be < 5MB', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid File', description: 'Only PDF, JPG, PNG allowed', variant: 'destructive' });
      e.target.value = '';
      return;
    }
    setUploadingFiles((u) => ({ ...u, [docType]: true }));
    try {
      const res = await buyerOnboardingService.uploadSingleDocument(file, docType);
      setUploadedDocs((docs) => new Map(docs.set(docType, { docType, fileName: file.name, fileUrl: res.fileUrl, uploadedAt: new Date().toISOString() })));
      // Update value in form for submission
      setValue('documents', Array.from(uploadedDocs.values()));
      toast({ title: 'Upload Successful', description: `${file.name}` });
    } catch (error) {
      toast({ title: 'Upload Failed', description: error?.message, variant: 'destructive' });
    } finally {
      setUploadingFiles((u) => ({ ...u, [docType]: false }));
      e.target.value = '';
    }
  };

  const removeDocument = async (docType) => {
    if (!confirm('Are you sure?')) return;
    try {
      await buyerOnboardingService.deleteDocument(docType);
      setUploadedDocs((docs) => {
        const newMap = new Map(docs);
        newMap.delete(docType);
        return newMap;
      });
      setValue('documents', Array.from(uploadedDocs.values()));
      toast({ title: 'Document removed' });
    } catch (error) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
    }
  };

  // Submission
  const onSubmit = async (formData) => {
    try {
      console.log('Submitting bank details:', formData);
      setIsSubmitting(true);
      if (!ifscValidated) {
        toast({ title: 'IFSC Not Validated', description: 'Validate IFSC before submitting', variant: 'destructive' });
        return;
      }
      // Require all required docs
      for (const doc of BANK_DOC_TYPES) {
        if (doc.required && !uploadedDocs.has(doc.type)) {
          toast({ title: 'Missing Documents', description: `Please upload ${doc.label}`, variant: 'destructive' });
          return;
        }
      }
      // Submit all data (including documents array)
      await buyerOnboardingService.updateBankDetails({
        ...formData,
        pennyDropStatus: pennyDropStatus === 'verified' ? 'VERIFIED' : 'PENDING',
        pennyDropScore: pennyDropStatus === 'verified' ? pennyDropScore : 0,
        documents: Array.from(uploadedDocs.values()),
      });
      await silentRefresh();
      toast({ title: 'Success', description: 'Bank details saved' });
      onNext();
    } catch (error) {
      toast({ title: 'Error', description: error?.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bank Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Number, Holder Name, IFSC */}
     
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Account Number *</Label>
            <Input placeholder="Enter account number" {...register('accountNumber')} className="mt-1.5" />
            {errors.accountNumber && <p className="text-red-600 text-xs">
              {errors.accountNumber.message}</p>}
          </div>
          <div>
            <Label>Account Holder Name *</Label>
            <Input placeholder="Account holder name" {...register('accountHolderName')} className="mt-1.5" />
           {errors.accountHolderName && <p className="text-xs text-destructive mt-1">
              {errors.accountHolderName.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>IFSC Code *</Label>
            <div className="flex gap-2">
              <Input
                placeholder="SBIN0001234"
                {...register('ifsc')}
                className="mt-1.5"
                onBlur={handleValidateIfsc}
              />
              <Button
                type="button"
                onClick={handleValidateIfsc}
                variant="outline"
                size="sm"
                disabled={isValidatingIfsc || isSubmitting}
              >
                {isValidatingIfsc ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
              </Button>
            </div>
            {errors.ifsc && <p className="text-red-600 text-xs">{errors.ifsc.message}</p>}
            {ifscValidated && ifscBankDetails && (
              <span className="block text-xs text-green-600 mt-1">
                {ifscBankDetails.bankName} {ifscBankDetails.branchName && `- ${ifscBankDetails.branchName}`}
              </span>
            )}
          </div>
          <div>
            <Label>Bank Name *</Label>
            <Input placeholder="Enter bank name" {...register('bankName')} className="mt-1.5" disabled />
            {errors.bankName && <p className="text-red-600 text-xs">{errors.bankName.message}</p>}
          </div>
          <div>
            <Label>Branch Name</Label>
            <Input placeholder="Branch name" {...register('branchName')} className="mt-1.5" />
          </div>
        </div>

        {/* Account Type & Payout Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Account Type *</Label>
            <select {...register('accountType')} className="w-full mt-1 px-3 py-2 border rounded-md">
              <option value="">Select</option>
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
              <option value="OD">OverDraft</option>
            </select>
            {errors.accountType && <p className="text-red-600 text-xs">{errors.accountType.message}</p>}
          </div>
          <div>
            <Label>Payout Method *</Label>
            <select {...register('payoutMethod')} className="w-full mt-1 px-3 py-2 border rounded-md">
              <option value="RTGS">RTGS</option>
              <option value="NEFT">NEFT</option>
              <option value="UPI">UPI</option>
            </select>
            {errors.payoutMethod && <p className="text-red-600 text-xs">{errors.payoutMethod.message}</p>}
          </div>
        </div>
        {payoutMethod === 'UPI' && (
          <div>
            <Label>UPI ID *</Label>
            <Input placeholder="UPI ID" {...register('upiDetails')} className="mt-1.5" />
            {errors.upiDetails && <p className="text-red-600 text-xs">{errors.upiDetails.message}</p>}
          </div>
        )}

        {/* Penny Drop Verification */}
        <div>
          <Button
            type="button"
            onClick={handlePennyDrop}
            className="w-full mb-2"
            disabled={isPennyDropping || isSubmitting}
            variant="outline"
          >
            {isPennyDropping ? <Loader2 className="w-4 h-4 animate-spin" /> : '💰 Verify Bank Account'}
          </Button>
          {pennyDropStatus === 'verified' && (
            <Card className="p-5 bg-green-50 dark:bg-green-900/20 border-green-200 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Name Match Score</span>
                <Badge className="bg-green-100 text-green-800">{pennyDropScore || 100}%</Badge>
              </div>
              <Progress value={pennyDropScore || 100} className="h-2 mt-2" />
              <p className="text-xs text-green-700">Penny drop verification successful</p>
            </Card>
          )}
        </div>

        {/* Document Uploads */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Bank Documents</h3>
          {BANK_DOC_TYPES.map((doc) => {
            const isUploading = uploadingFiles[doc.type] || false;
            const hasFile = uploadedDocs.has(doc.type);
            const uploadedDoc = uploadedDocs.get(doc.type);
            return (
              <div key={doc.type} className="mb-3 pb-3 border-b last:border-0 flex items-center gap-4">
                <div className="flex-1">
                  <Label>
                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                  </Label>
                  {hasFile && uploadedDoc ? (
                    <div className="text-xs text-green-700 mt-1">{uploadedDoc.fileName}</div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</div>
                  )}
                  <input
                    ref={(el) => { if (el) fileInputRefs.current.set(doc.type, el); }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc.type)}
                    style={{ display: 'none' }}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => triggerFileInput(doc.type)}
                  disabled={isSubmitting || isUploading}
                  variant={hasFile ? 'outline' : 'default'}
                  size="sm"
                  className="h-8"
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : hasFile ? (
                    <>Replace</>
                  ) : (
                    <>Upload</>
                  )}
                </Button>
                {hasFile && uploadedDoc && (
                  <Button
                    type="button"
                    onClick={() => removeDocument(doc.type)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    disabled={isSubmitting || isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </Card>

        <div className="flex gap-4 justify-end">
          {onBack && <Button type="button" variant="outline" onClick={onBack}>← Back</Button>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save & Continue →
              </>
            )}
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2">Your banking information is encrypted and securely stored.</div>
      </form>
    </div>
  );
}
