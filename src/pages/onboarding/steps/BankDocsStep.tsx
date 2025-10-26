import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { onboardingService } from '@/services/onboarding.service';
import { BankDocData, DocumentType, PayoutMethod } from '@/types/onboarding.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(8, 'Account number is required'),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
  payoutMethod: z.enum(['RTGS', 'NEFT', 'UPI']),
  upiVpa: z.string().optional(),
  warrantyAssurance: z.boolean(),
  termsAccepted: z.boolean(),
  amlCompliance: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data?: BankDocData;
  onNext: (data: BankDocData) => void;
  onBack: () => void;
}

const REQUIRED_DOCUMENTS: { type: DocumentType; label: string; required: boolean }[] = [
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { type: 'PAN_CARD', label: 'PAN Card', required: true },
  { type: 'CANCELLED_CHEQUE', label: 'Cancelled Cheque / Passbook', required: true },
  { type: 'FACTORY_LICENSE', label: 'Factory License', required: true },
  { type: 'QA_CERTIFICATE', label: 'QA/QC Certificate', required: false },
  { type: 'AUTHORIZATION_LETTER', label: 'Authorization Letter', required: false },
];

export const BankDocsStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [pennyDropping, setPennyDropping] = useState(false);
  const [pennyDropResult, setPennyDropResult] = useState(null);
  const [documents, setDocuments] = useState<Map<DocumentType, File>>(new Map());
  const [uploadedDocs, setUploadedDocs] = useState<DocumentType[]>(data?.documents.map(d => d.type) || []);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data ? {
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      payoutMethod: data.payoutMethod,
      upiVpa: data.upiVpa,
      warrantyAssurance: data.declarations.warrantyAssurance,
      termsAccepted: data.declarations.termsAccepted,
      amlCompliance: data.declarations.amlCompliance,
    } : {
      payoutMethod: 'RTGS',
      warrantyAssurance: false,
      termsAccepted: false,
      amlCompliance: false,
    },
  });

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
      const result = await onboardingService.verifyPennyDrop(accountNumber, ifscCode);
      setPennyDropResult(result);
      if (result.verified) {
        toast({
          title: 'Verification Successful',
          description: `Account matched: ${result.accountName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify account.',
        variant: 'destructive',
      });
    } finally {
      setPennyDropping(false);
    }
  };

  const handleFileChange = (type: DocumentType, file: File | null) => {
    if (file) {
      const newDocs = new Map(documents);
      newDocs.set(type, file);
      setDocuments(newDocs);
    }
  };

  const onSubmit = async (formData: FormData) => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(d => d.required);
    const missingDocs = requiredDocs.filter(d => !uploadedDocs.includes(d.type) && !documents.has(d.type));

    if (missingDocs.length > 0) {
      toast({
        title: 'Missing Documents',
        description: `Please upload: ${missingDocs.map(d => d.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.warrantyAssurance || !formData.termsAccepted || !formData.amlCompliance) {
      toast({
        title: 'Declarations Required',
        description: 'Please accept all declarations to continue.',
        variant: 'destructive',
      });
      return;
    }

    // Upload new documents
    const uploadedDocuments = data?.documents || [];
    for (const [type, file] of documents.entries()) {
      try {
        const result = await onboardingService.uploadDocument(file, type);
        uploadedDocuments.push({
          type,
          fileName: file.name,
          fileUrl: result.fileUrl,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
        });
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: `Failed to upload ${type}`,
          variant: 'destructive',
        });
        return;
      }
    }

    const bankDocData: BankDocData = {
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      payoutMethod: formData.payoutMethod,
      upiVpa: formData.upiVpa,
      isPennyDropVerified: pennyDropResult?.verified || false,
      documents: uploadedDocuments,
      declarations: {
        warrantyAssurance: formData.warrantyAssurance,
        termsAccepted: formData.termsAccepted,
        amlCompliance: formData.amlCompliance,
      },
    };

    // Save to backend
    try {
      await onboardingService.updateBankDetails(bankDocData);
      toast({
        title: 'Success',
        description: 'Bank details saved successfully',
      });
      onNext(bankDocData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save bank details',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Bank & Documents</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input id="accountName" {...register('accountName')} placeholder="As per bank records" />
            {errors.accountName && <p className="text-sm text-destructive mt-1">{errors.accountName.message}</p>}
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" {...register('accountNumber')} placeholder="XXXXXXXXXXXX" className="font-mono" />
            {errors.accountNumber && <p className="text-sm text-destructive mt-1">{errors.accountNumber.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input id="ifscCode" {...register('ifscCode')} placeholder="ABCD0123456" className="font-mono" />
            {errors.ifscCode && <p className="text-sm text-destructive mt-1">{errors.ifscCode.message}</p>}
          </div>

          <div className="flex items-end gap-2">
            <Button type="button" size="sm" onClick={handlePennyDrop} disabled={pennyDropping}>
              {pennyDropping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Penny Drop
            </Button>
            {pennyDropResult?.verified && (
              <Badge className="bg-success/10 text-success border-success/20">
                <Check className="h-3 w-3 mr-1" /> Matched
              </Badge>
            )}
          </div>
        </div>

        <div>
          <Label>Payout Preference</Label>
          <RadioGroup defaultValue={watch('payoutMethod')} onValueChange={(value) => setValue('payoutMethod', value as PayoutMethod)}>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RTGS" id="rtgs" />
                <Label htmlFor="rtgs" className="font-normal">RTGS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEFT" id="neft" />
                <Label htmlFor="neft" className="font-normal">NEFT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UPI" id="upi" />
                <Label htmlFor="upi" className="font-normal">UPI VPA</Label>
              </div>
            </div>
          </RadioGroup>
          {watch('payoutMethod') === 'UPI' && (
            <Input {...register('upiVpa')} placeholder="user@upi" className="mt-2 font-mono" />
          )}
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">KYC Documents</h4>
          <div className="space-y-3">
            {REQUIRED_DOCUMENTS.map(doc => {
              const isUploaded = uploadedDocs.includes(doc.type);
              const hasFile = documents.has(doc.type);
              
              return (
                <div key={doc.type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      {!doc.required && <span className="text-xs text-muted-foreground">(Optional)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <Check className="h-3 w-3 mr-1" /> Uploaded
                      </Badge>
                    ) : hasFile ? (
                      <Badge variant="secondary">{documents.get(doc.type)?.name}</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploaded ? 'Replace' : 'Upload'}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(doc.type, e.target.files?.[0] || null)}
                        />
                      </label>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          <Label className="mb-3 block">Declarations</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="warranty" {...register('warrantyAssurance')} />
              <Label htmlFor="warranty" className="font-normal cursor-pointer">
                Warranty / Grade assurance
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" {...register('termsAccepted')} />
              <Label htmlFor="terms" className="font-normal cursor-pointer">
                Terms & Conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="aml" {...register('amlCompliance')} />
              <Label htmlFor="aml" className="font-normal cursor-pointer">
                AML/CFT Compliance
              </Label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Save & Continue →</Button>
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        </div>
      </form>
    </Card>
  );
};
