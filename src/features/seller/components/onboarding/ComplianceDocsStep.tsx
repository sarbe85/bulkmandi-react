import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, FileText, Loader2, Lock, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';

// ✅ Zod schema for declarations validation
const complianceSchema = z.object({
  warrantyAssurance: z.boolean().refine((val) => val === true, {
    message: 'You must accept warranty assurance',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms and conditions',
  }),
  amlCompliance: z.boolean().refine((val) => val === true, {
    message: 'You must comply with AML regulations',
  }),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

// ✅ Compliance document types matching backend
const COMPLIANCE_DOC_TYPES = [
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { type: 'PAN_CERTIFICATE', label: 'PAN Certificate', required: true },
  { type: 'BUSINESS_LICENSE', label: 'Business License', required: false },
  { type: 'FACTORY_LICENSE', label: 'Factory License', required: false },
  { type: 'QA_CERTIFICATE', label: 'Quality Assurance Certificate', required: false },
];

// ✅ Interface for uploaded documents
interface UploadedDoc {
  name: string;
  url: string;
  uploadedAt?: string;
  status?: string;
}

export default function ComplianceDocsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [existingFiles, setExistingFiles] = useState<Map<string, UploadedDoc>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      warrantyAssurance: false,
      termsAccepted: false,
      amlCompliance: false,
    },
  });

  // ✅ Load existing uploaded documents from backend on mount
  useEffect(() => {
    if (data?.complianceDocuments && Array.isArray(data.complianceDocuments)) {
      const docsMap = new Map<string, UploadedDoc>();
      data.complianceDocuments.forEach((doc: any) => {
        // Extract docType from fileName or use provided docType field
        const docType = doc.docType || extractDocTypeFromFileName(doc.fileName);
        docsMap.set(docType, {
          name: doc.fileName || doc.documentName || 'Uploaded Document',
          url: doc.fileUrl || doc.documentUrl || '',
          uploadedAt: doc.uploadedAt,
          status: doc.status || 'UPLOADED',
        });
      });
      setExistingFiles(docsMap);
      console.log('✅ Loaded existing compliance documents:', Array.from(docsMap.keys()));
    }
  }, [data]);

  // ✅ Helper: Extract doc type from file name
  const extractDocTypeFromFileName = (fileName: string): string => {
    const match = fileName.match(/^([A-Z_]+)_\d+_/);
    return match ? match[1] : 'COMPLIANCE_DOCUMENT';
  };

  // ✅ Trigger file input for specific docType
  const triggerFileInput = (docType: string) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  // ✅ Handle immediate file upload on selection
  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Only PDF, JPG, PNG, DOC, DOCX files are allowed',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    // ✅ Set uploading state
    setUploadingFiles((prev) => ({ ...prev, [docType]: true }));

    try {
      toast({
        title: 'Uploading...',
        description: `Uploading ${file.name}`,
      });

      // ✅ Call unified upload function (generic for all doc types)
      const response = await onboardingService.uploadSingleDocument(file, docType);

      // ✅ Update state with newly uploaded file
      setExistingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(docType, {
          name: response.fileName,
          url: response.fileUrl,
          uploadedAt: new Date().toISOString(),
          status: 'UPLOADED',
        });
        return newMap;
      });

      toast({
        title: 'Upload Successful',
        description: `${file.name} uploaded successfully`,
      });

      console.log(`✅ Document uploaded: ${docType} - ${file.name}`);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      // Clear uploading state
      setUploadingFiles((prev) => ({ ...prev, [docType]: false }));
      e.target.value = '';
    }
  };

  // ✅ Remove uploaded document
  const removeDocument = async (docType: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;

    try {
      // ✅ Call unified delete function
      await onboardingService.deleteDocument(docType);

      // ✅ Remove from state
      setExistingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(docType);
        return newMap;
      });

      toast({
        title: 'Document Removed',
        description: 'Document removed successfully',
      });

      console.log(`✅ Document deleted: ${docType}`);
    } catch (error: any) {
      console.error('❌ Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove document',
        variant: 'destructive',
      });
    }
  };

  // ✅ Form submit: Only submit declarations (files already uploaded)
  const onSubmit = async (formData: ComplianceFormData) => {
    try {
      setIsSubmitting(true);

      // ✅ Validate all required documents are uploaded
      const missingDocs = COMPLIANCE_DOC_TYPES.filter(
        (doc) => doc.required && !existingFiles.has(doc.type)
      );

      if (missingDocs.length > 0) {
        toast({
          title: 'Missing Documents',
          description: `Please upload required documents: ${missingDocs.map((d) => d.label).join(', ')}`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // ✅ Submit only declarations (files already in backend)
      await onboardingService.updateComplianceDeclarations({
        warrantyAssurance: formData.warrantyAssurance,
        termsAccepted: formData.termsAccepted,
        amlCompliance: formData.amlCompliance,
      });

      toast({
        title: 'Success',
        description: 'Compliance declarations saved successfully',
      });

      console.log('✅ Compliance step completed');
      onNext();
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save declarations',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Compliance Documents Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Documents</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload required compliance documents. Each file uploads immediately when selected.
        </p>

        <div className="space-y-4">
          {COMPLIANCE_DOC_TYPES.map((doc) => {
            const docType = doc.type;
            const isUploading = uploadingFiles[docType] || false;
            const hasExistingFile = existingFiles.has(docType);
            const existingFile = existingFiles.get(docType);

            return (
              <div key={docType} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Label className="text-base">
                      {doc.label} {doc.required && <span className="text-destructive">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {doc.required ? 'Required' : 'Optional'} • PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Show existing file info */}
                {hasExistingFile && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                      <CheckCircle className="inline h-4 w-4 mr-1" />
                      Previously uploaded
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400">{existingFile?.name}</span>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeDocument(docType)}
                        disabled={isSubmitting || isUploading}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Status: {existingFile?.status} • Uploaded:{' '}
                      {existingFile?.uploadedAt
                        ? new Date(existingFile.uploadedAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                )}

                {/* File Input */}
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current.set(docType, el);
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileSelect(e, docType)}
                  style={{ display: 'none' }}
                />

                {/* Upload/Replace Button */}
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    onClick={() => triggerFileInput(docType)}
                    disabled={isSubmitting || isUploading}
                    variant={hasExistingFile ? 'outline' : 'default'}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : hasExistingFile ? (
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

      {/* Declarations Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Declarations</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please review and accept all declarations to proceed
        </p>

        <div className="space-y-4">
          {/* Warranty Assurance */}
          <Controller
            control={control}
            name="warrantyAssurance"
            render={({ field }) => (
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                  <span className="text-sm leading-relaxed">
                    <span className="font-semibold">Warranty & Assurance:</span> I confirm that all
                    information provided in this onboarding is accurate, complete, and truthful to the
                    best of my knowledge.
                  </span>
                </label>
                {errors.warrantyAssurance && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1 ml-7">
                    <AlertCircle className="h-3 w-3" />
                    {errors.warrantyAssurance.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Terms & Conditions */}
          <Controller
            control={control}
            name="termsAccepted"
            render={({ field }) => (
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                  <span className="text-sm leading-relaxed">
                    <span className="font-semibold">Terms & Conditions:</span> I have read and agree
                    to the terms and conditions of this platform, including privacy policy and service
                    agreement.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1 ml-7">
                    <AlertCircle className="h-3 w-3" />
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* AML Compliance */}
          <Controller
            control={control}
            name="amlCompliance"
            render={({ field }) => (
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                  <span className="text-sm leading-relaxed">
                    <span className="font-semibold">AML Compliance:</span> I confirm that I comply
                    with all Anti-Money Laundering (AML), Know Your Customer (KYC), and other
                    applicable regulatory requirements.
                  </span>
                </label>
                {errors.amlCompliance && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1 ml-7">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amlCompliance.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
          ← Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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

      {/* Security Note */}
      <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Lock className="h-4 w-4" />
        Your compliance documents are encrypted and securely processed
      </p>
    </form>
  );
}