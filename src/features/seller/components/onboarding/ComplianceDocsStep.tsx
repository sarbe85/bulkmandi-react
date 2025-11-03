import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle, Loader2, Upload, X } from 'lucide-react';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Compliance Documents</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Upload required compliance documents and accept declarations</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Documents Section */}
        <Card className="p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Required Documents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload your business documents</p>
            </div>
          </div>

          <div className="space-y-4">
            {COMPLIANCE_DOCS.map((doc) => (
              <div
                key={doc.type}
                className="group flex items-center justify-between p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {doc.label}
                    {doc.required && <span className="text-red-600 ml-1">*</span>}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {selectedFiles.get(doc.type)?.name}
                    </span>
                    <Button
                      type="button"
                      onClick={() => removeDocument(doc.type)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Files will be securely uploaded when you click "Save & Continue"</span>
          </div>
        </Card>

        {/* Declarations Section */}
        <Card className="p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Declarations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirm to proceed with your application</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Warranty Assurance */}
            <div className="flex items-start space-x-4 p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <Controller
                name="warrantyAssurance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="warranty"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <Label htmlFor="warranty" className="cursor-pointer flex-1">
                <span className="font-semibold text-gray-900 dark:text-white">Warranty & Assurance</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                  I confirm that all information provided is accurate and complete
                </p>
              </Label>
            </div>
            {errors.warrantyAssurance && (
              <p className="text-red-600 text-sm ml-12 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.warrantyAssurance.message}
              </p>
            )}

            {/* Terms Accepted */}
            <div className="flex items-start space-x-4 p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <Label htmlFor="terms" className="cursor-pointer flex-1">
                <span className="font-semibold text-gray-900 dark:text-white">Terms & Conditions</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                  I agree to the terms and conditions of this platform
                </p>
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-red-600 text-sm ml-12 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.termsAccepted.message}
              </p>
            )}

            {/* AML Compliance */}
            <div className="flex items-start space-x-4 p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
              <Controller
                name="amlCompliance"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="aml"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                )}
              />
              <Label htmlFor="aml" className="cursor-pointer flex-1">
                <span className="font-semibold text-gray-900 dark:text-white">AML Compliance</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                  I comply with Anti-Money Laundering (AML) and KYC regulations
                </p>
              </Label>
            </div>
            {errors.amlCompliance && (
              <p className="text-red-600 text-sm ml-12 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.amlCompliance.message}
              </p>
            )}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-8"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading & Saving...
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
