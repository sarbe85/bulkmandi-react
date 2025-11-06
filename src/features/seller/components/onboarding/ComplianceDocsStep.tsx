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
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Map<string, any>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      warrantyAssurance: false,
      termsAccepted: false,
      amlCompliance: false,
    },
  });

  useEffect(() => {
    if (data?.compliance?.documents && Array.isArray(data.compliance.documents)) {
      const docsMap = new Map();
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

  const onSubmit = async (formData: ComplianceFormData) => {
    try {
      setIsSubmitting(true);

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

      await onboardingService.updateComplianceDocsWithDeclarations(
        formData,
        Array.from(uploadedDocs.values())
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
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <Card className="p-6 md:p-8 dark:bg-slate-950 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Compliance Documents</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Upload required compliance documents</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Document Upload Section - Compact Single Row */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Required Documents</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {COMPLIANCE_DOC_TYPES.map((doc) => {
                const isUploading = uploadingFiles[doc.type] || false;
                const hasFile = uploadedDocs.has(doc.type);
                const uploadedDoc = uploadedDocs.get(doc.type);

                return (
                  <div
                    key={doc.type}
                    className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                        {doc.label}
                      </p>
                      {hasFile && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-1" />}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {doc.required ? 'Required' : 'Optional'}
                    </p>

                    {hasFile && uploadedDoc && (
                      <div className="mb-2 p-2 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-900/20">
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium truncate mb-1">
                          ✓ {uploadedDoc.fileName}
                        </p>
                        <Button
                          type="button"
                          onClick={() => removeDocument(doc.type)}
                          disabled={isSubmitting || isUploading}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full h-7 p-0"
                        >
                          <X className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      </div>
                    )}

                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(doc.type, el);
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileSelect(e, doc.type)}
                      style={{ display: 'none' }}
                    />

                    <Button
                      type="button"
                      onClick={() => triggerFileInput(doc.type)}
                      disabled={isSubmitting || isUploading}
                      variant={hasFile ? 'outline' : 'default'}
                      size="sm"
                      className="w-full h-8 text-xs font-semibold"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Uploading
                        </>
                      ) : hasFile ? (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          Replace
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Declarations Section */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Declarations</h3>

            <div className="space-y-3">
              <Controller
                name="warrantyAssurance"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                      id="warranty"
                    />
                    <div>
                      <label
                        htmlFor="warranty"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Warranty & Assurance
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        All information provided is accurate and complete
                      </p>
                      {errors.warrantyAssurance && (
                        <p className="text-xs text-red-500 mt-1">{errors.warrantyAssurance.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                      id="terms"
                    />
                    <div>
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Terms & Conditions
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        I agree to the terms and conditions of this platform
                      </p>
                      {errors.termsAccepted && (
                        <p className="text-xs text-red-500 mt-1">{errors.termsAccepted.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />

              <Controller
                name="amlCompliance"
                control={control}
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                      id="aml"
                    />
                    <div>
                      <label
                        htmlFor="aml"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        AML Compliance
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        I comply with Anti-Money Laundering and KYC regulations
                      </p>
                      {errors.amlCompliance && (
                        <p className="text-xs text-red-500 mt-1">{errors.amlCompliance.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex-1 h-10 text-sm font-semibold"
            >
              ← Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
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

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Your compliance data is encrypted and securely processed
          </p>
        </form>
      </Card>
    </div>
  );
}