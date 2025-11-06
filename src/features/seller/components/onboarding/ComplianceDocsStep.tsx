import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, FileText, Loader2, Lock, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';
import { DocumentUpload } from '../../types/onboarding.types';

const complianceSchema = z.object({
  warrantyAssurance: z.boolean().refine((val) => val === true, { message: 'Accept warranty assurance' }),
  termsAccepted: z.boolean().refine((val) => val === true, { message: 'Accept terms & conditions' }),
  amlCompliance: z.boolean().refine((val) => val === true, { message: 'Accept AML compliance' }),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

const COMPLIANCE_DOC_TYPES = [
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { type: 'PAN_CERTIFICATE', label: 'PAN Certificate', required: true },
  { type: 'BUSINESS_LICENSE', label: 'Business License', required: false },
  { type: 'FACTORY_LICENSE', label: 'Factory License', required: false },
  { type: 'QA_CERTIFICATE', label: 'Quality Assurance Certificate', required: false },
];

 
 

export default function ComplianceDocsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ PHASE 1: File state - caching uploaded files in frontend
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Map<string, DocumentUpload>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const { handleSubmit, formState: { errors }, control } = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      warrantyAssurance: false,
      termsAccepted: false,
      amlCompliance: false,
    },
  });

  // ✅ Load existing documents from backend on mount
  useEffect(() => {
    if (data?.compliance?.documents && Array.isArray(data.compliance.documents)) {
      const docsMap = new Map<string, DocumentUpload>();
      data.compliance.documents.forEach((doc: any) => {
        docsMap.set(doc.docType, {
          docType: doc.docType,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
        });
      });
      setUploadedDocs(docsMap);
    }
  }, [data]);

  const triggerFileInput = (docType: string) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  // ✅ PHASE 1: Handle file selection - upload immediately (NO DB update)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
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
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF, JPG, PNG, DOC, DOCX allowed',
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

  const removeDocument = async (docType: string) => {
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

  // ✅ PHASE 2: Form submit - persist all to DB
  const onSubmit = async (formData: ComplianceFormData) => {
    try {
      setIsSubmitting(true);

      // Validate required documents
      const missingDocs = COMPLIANCE_DOC_TYPES.filter(
        (doc) => doc.required && !uploadedDocs.has(doc.type)
      );

      if (missingDocs.length > 0) {
        toast({
          title: 'Missing Documents',
          description: `Upload: ${missingDocs.map((d) => d.label).join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      // ✅ PHASE 2: Send all data to backend for DB persistence
      await onboardingService.updateComplianceDocsWithDeclarations(
        formData,
        Array.from(uploadedDocs.values()) // ✅ Pass all cached file URLs
      );

      toast({ title: 'Success', description: 'Compliance saved' });
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
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">Compliance Documents</h3>
        
        <div className="space-y-1.5">
          {COMPLIANCE_DOC_TYPES.map((doc) => {
            const isUploading = uploadingFiles[doc.type] || false;
            const hasFile = uploadedDocs.has(doc.type);
            const uploadedDoc = uploadedDocs.get(doc.type);

            return (
              <div key={doc.type} className="flex items-center gap-2 border rounded-md p-2">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm font-medium">
                    {doc.label} {doc.required && <span className="text-destructive">*</span>}
                  </Label>
                  {hasFile && uploadedDoc ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                      <span className="text-xs text-success truncate">{uploadedDoc.fileName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC (Max 5MB)</p>
                  )}
                </div>

                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current.set(doc.type, el);
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileSelect(e, doc.type)}
                  style={{ display: 'none' }}
                />

                <div className="flex items-center gap-1">
                  {hasFile && uploadedDoc && (
                    <Button
                      type="button"
                      onClick={() => removeDocument(doc.type)}
                      disabled={isSubmitting || isUploading}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => triggerFileInput(doc.type)}
                    disabled={isSubmitting || isUploading}
                    variant={hasFile ? 'outline' : 'default'}
                    size="sm"
                    className="h-8 text-xs px-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Uploading
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
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-3 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Declarations</h3>

        <div className="space-y-2">
          <Controller
            control={control}
            name="warrantyAssurance"
            render={({ field }) => (
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                <span className="text-xs">
                  <strong className="font-medium">Warranty & Assurance:</strong> All information provided is accurate and complete
                </span>
                {errors.warrantyAssurance && (
                  <p className="text-xs text-destructive">{errors.warrantyAssurance.message}</p>
                )}
              </label>
            )}
          />

          <Controller
            control={control}
            name="termsAccepted"
            render={({ field }) => (
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                <span className="text-xs">
                  <strong className="font-medium">Terms & Conditions:</strong> I agree to the terms and conditions
                </span>
                {errors.termsAccepted && (
                  <p className="text-xs text-destructive">{errors.termsAccepted.message}</p>
                )}
              </label>
            )}
          />

          <Controller
            control={control}
            name="amlCompliance"
            render={({ field }) => (
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                <span className="text-xs">
                  <strong className="font-medium">AML Compliance:</strong> I comply with Anti-Money Laundering regulations
                </span>
                {errors.amlCompliance && (
                  <p className="text-xs text-destructive">{errors.amlCompliance.message}</p>
                )}
              </label>
            )}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting} size="sm" className="h-9 text-sm">
          ← Back
        </Button>
        <Button type="submit" disabled={isSubmitting} size="sm" className="h-9 text-sm">
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
        Your compliance data is encrypted and securely processed
      </p>
    </form>
  );
}