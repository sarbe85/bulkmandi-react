import { useToast } from '@/hooks/use-toast';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Check, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import onboardingService from '../../services/onboarding.service';
import {
  ComplianceDocsData,
  DocumentUpload,
} from '../../types/onboarding.types';

interface Props {
  data?: ComplianceDocsData;
  onNext: (data: any) => void;
  onBack: () => void;
}

const DOCUMENT_TYPES = [
  { type: 'GST_CERTIFICATE', label: 'GST Certificate', required: true },
  { type: 'PAN_CERTIFICATE', label: 'PAN Certificate', required: true },
  { type: 'BUSINESS_LICENSE', label: 'Business License', required: true },
  { type: 'FACTORY_LICENSE', label: 'Factory License', required: false },
  { type: 'QA_CERTIFICATE', label: 'QA/QC Certificate', required: false },
  {
    type: 'AUTHORIZATION_LETTER',
    label: 'Authorization Letter',
    required: false,
  },
];

export const ComplianceDocsStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Map<string, File>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill documents from data prop
  useEffect(() => {
    if (data?.complianceDocuments) {
      const docsMap = new Map<string, File>();
      data.complianceDocuments.forEach((doc) => {
        docsMap.set(doc.type, new File([], doc.fileName));
      });
      setDocuments(docsMap);
    }
  }, [data]);

  const handleFileChange = (docType: string, file: File | null) => {
    const newDocs = new Map(documents);
    if (file) {
      newDocs.set(docType, file);
    } else {
      newDocs.delete(docType);
    }
    setDocuments(newDocs);
  };

  const handleSubmit = async () => {
    console.log('🚀 ComplianceDocsStep - handleSubmit started');
    
    try {
      setIsSubmitting(true);

      // Check required documents
      const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required);
      const missingDocs = requiredDocs.filter((d) => !documents.has(d.type));

      if (missingDocs.length > 0) {
        console.log('❌ Missing required documents:', missingDocs);
        toast({
          title: 'Missing Required Documents',
          description: `Please upload: ${missingDocs
            .map((d) => d.label)
            .join(', ')}`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare compliance documents
      const complianceDocuments: DocumentUpload[] = Array.from(
        documents.entries()
      ).map(([type, file]) => ({
        type: type as any,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file), // ✅ Proper URL
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED' as const,
      }));

      const complianceData: ComplianceDocsData = {
        complianceDocuments,
      };

      console.log('📤 Sending compliance data to API:', complianceData);

      // ✅ FIXED: Store the API response
      const response = await onboardingService.uploadComplianceDocs(complianceData);
      
      console.log('✅ API Response received:', response);

      toast({
        title: 'Success',
        description: 'Compliance documents saved successfully',
      });

      // ✅ FIXED: Pass API response to onNext
      console.log('📨 Calling onNext with response');
      onNext(response);
      
    } catch (error: any) {
      console.error('❌ ComplianceDocsStep error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save documents',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      console.log('🏁 ComplianceDocsStep - handleSubmit completed');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Documents</h3>

        <div className="space-y-4">
          {DOCUMENT_TYPES.map((doc) => (
            <div key={doc.type}>
              <Label className="text-sm font-medium mb-2 block">
                {doc.label}
                {doc.required && <span className="text-red-600 ml-1">*</span>}
              </Label>

              <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
                <input
                  type="file"
                  id={`file-${doc.type}`}
                  onChange={(e) =>
                    handleFileChange(doc.type, e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />

                <label htmlFor={`file-${doc.type}`} className="cursor-pointer">
                  {documents.has(doc.type) ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-5 w-5" />
                      <span>{documents.get(doc.type)?.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, JPEG, PNG
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ComplianceDocsStep;
