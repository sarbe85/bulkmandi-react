import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';

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

// ✅ Props interface
interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

const COMPLIANCE_DOCS = [
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { type: 'PAN_CERTIFICATE', label: 'PAN Certificate', required: true },
  { type: 'BUSINESS_LICENSE', label: 'Business License', required: false },
  { type: 'FACTORY_LICENSE', label: 'Factory License', required: false },
  { type: 'QA_CERTIFICATE', label: 'Quality Assurance Certificate', required: false },
];

export default function ComplianceDocsStep({
  data,
  onNext,
  onBack,
}: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(
    new Map()
  );
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const { handleSubmit, formState: { errors }, control } = useForm<
    ComplianceFormData
  >({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      warrantyAssurance: false,
      termsAccepted: false,
      amlCompliance: false,
    },
  });

  // ✅ COMPLETE: Pre-fill form with saved data
  useEffect(() => {
    if (data?.complianceDocs?.uploadedFiles) {
      console.log('📋 Previously uploaded compliance docs:', data.complianceDocs.uploadedFiles);
      // You can use this to show already uploaded files
    }
  }, [data]);

  const triggerFileInput = (docType: string) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
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

    const newMap = new Map(selectedFiles);
    newMap.set(docType, file);
    setSelectedFiles(newMap);

    toast({
      title: 'File Selected',
      description: `${file.name} - will be uploaded on save`,
    });

    e.target.value = '';
  };

  const removeDocument = (docType: string) => {
    const newMap = new Map(selectedFiles);
    newMap.delete(docType);
    setSelectedFiles(newMap);
  };

  // ✅ FORM SUBMIT
  const onSubmit = async (formData: ComplianceFormData) => {
    try {
      const missingDocs = COMPLIANCE_DOCS.filter(
        (doc) => doc.required && !selectedFiles.has(doc.type)
      );

      if (missingDocs.length > 0) {
        toast({
          title: 'Missing Documents',
          description: `Please select required documents: ${missingDocs
            .map((d) => d.label)
            .join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      const filesArray: File[] = Array.from(selectedFiles.values());

      console.log('📤 Uploading compliance docs...');

      // ✅ API CALL
      await onboardingService.updateComplianceDocs(
        {
          warrantyAssurance: formData.warrantyAssurance,
          termsAccepted: formData.termsAccepted,
          amlCompliance: formData.amlCompliance,
        },
        filesArray
      );

      console.log('✅ Compliance docs saved');

      toast({
        title: 'Success',
        description: 'Compliance documents saved successfully',
      });

      // ✅ Call onNext() with NO params
      onNext();

    } catch (error: any) {
      console.error('❌ Submit error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save compliance documents',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 blur-3xl -z-10"></div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
          Compliance Documents
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">Upload required compliance documents</p>
      </div>

      <Card className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/50">
        <div className="space-y-6">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Documents Section */}
            <div className="pb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold">Required Documents</h3>
                  <p className="text-sm text-muted-foreground">Upload all necessary compliance documents</p>
                </div>
              </div>
              <div className="space-y-4">
                {COMPLIANCE_DOCS.map((doc) => (
                  <div
                    key={doc.type}
                    className="flex items-center justify-between p-5 border-2 rounded-xl hover:border-primary/30 transition-all bg-gradient-to-r from-background to-muted/20"
                  >
                  <div className="flex-1">
                    <p className="font-medium">
                      {doc.label}
                      {doc.required && <span className="text-red-600 ml-1">*</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      {doc.required ? 'Required' : 'Optional'} • PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                    </p>
                  </div>

                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(doc.type, el);
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileSelect(e, doc.type)}
                    className="hidden"
                  />

                  {!selectedFiles.has(doc.type) ? (
                    <Button
                      type="button"
                      onClick={() => triggerFileInput(doc.type)}
                      variant="outline"
                      size="sm"
                      disabled={isSubmitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">
                        ✓ {selectedFiles.get(doc.type)?.name}
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeDocument(doc.type)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              ℹ️ Files will be uploaded to server when you click "Save & Continue"
            </div>
          </div>

            {/* Declarations Section */}
            <div className="pt-6 border-t">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold">Declarations</h3>
                  <p className="text-sm text-muted-foreground">Please confirm to proceed with your application</p>
                </div>
              </div>

            <div className="space-y-4">
              {/* Warranty Assurance */}
              <div className="flex items-start space-x-3">
                <Controller
                  name="warrantyAssurance"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="warranty"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="warranty" className="cursor-pointer flex-1">
                  <span className="font-medium">Warranty & Assurance</span>
                  <p className="text-sm text-gray-600 font-normal">
                    I confirm that all information provided is accurate and complete
                  </p>
                </Label>
              </div>
              {errors.warrantyAssurance && (
                <p className="text-red-600 text-sm ml-8">{errors.warrantyAssurance.message}</p>
              )}

              {/* Terms Accepted */}
              <div className="flex items-start space-x-3">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="terms" className="cursor-pointer flex-1">
                  <span className="font-medium">Terms & Conditions</span>
                  <p className="text-sm text-gray-600 font-normal">
                    I agree to the terms and conditions of this platform
                  </p>
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-600 text-sm ml-8">{errors.termsAccepted.message}</p>
              )}

              {/* AML Compliance */}
              <div className="flex items-start space-x-3">
                <Controller
                  name="amlCompliance"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="aml"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="aml" className="cursor-pointer flex-1">
                  <span className="font-medium">AML Compliance</span>
                  <p className="text-sm text-gray-600 font-normal">
                    I comply with Anti-Money Laundering (AML) and KYC regulations
                  </p>
                </Label>
              </div>
              {errors.amlCompliance && (
                <p className="text-red-600 text-sm ml-8">{errors.amlCompliance.message}</p>
              )}
            </div>
          </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                size="lg"
                className="min-w-32"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Uploading & Saving...
                  </>
                ) : (
                  'Save & Continue →'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
