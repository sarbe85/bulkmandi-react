import { useToast } from '@/hooks/use-toast';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Check, FileText, Loader2, Shield, Upload, X } from 'lucide-react';
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
    try {
      setIsSubmitting(true);

      const requiredDocs = DOCUMENT_TYPES.filter((d) => d.required);
      const missingDocs = requiredDocs.filter((d) => !documents.has(d.type));

      if (missingDocs.length > 0) {
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

      const complianceDocuments: DocumentUpload[] = Array.from(
        documents.entries()
      ).map(([type, file]) => ({
        type: type as any,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED' as const,
      }));

      const complianceData: ComplianceDocsData = {
        complianceDocuments,
      };

      const response = await onboardingService.uploadComplianceDocs(complianceData);

      toast({
        title: 'Success',
        description: 'Compliance documents uploaded successfully',
      });

      onNext(response);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload documents.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Upload Instructions */}
      <Card className="p-6 bg-primary/5 border-2 border-primary/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Required Compliance Documents
        </h3>
        <p className="text-sm text-muted-foreground">
          Please upload the following documents to complete your compliance verification.
          All documents marked with * are mandatory.
        </p>
      </Card>

      {/* Document Upload Cards */}
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          Upload Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_TYPES.map((docType) => {
            const uploaded = documents.has(docType.type);
            const file = documents.get(docType.type);

            return (
              <div key={docType.type} className="relative">
                <Card className={`p-4 border-2 transition-all ${
                  uploaded 
                    ? 'bg-success/5 border-success/20 hover:shadow-md' 
                    : docType.required 
                      ? 'border-border hover:border-primary/50' 
                      : 'border-border hover:border-muted-foreground/30'
                }`}>
                  <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {docType.label}
                    {docType.required && <span className="text-destructive">*</span>}
                  </Label>

                  <div className="relative border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-all">
                    <input
                      type="file"
                      id={docType.type}
                      onChange={(e) =>
                        handleFileChange(docType.type, e.target.files?.[0] || null)
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />

                    {uploaded && file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
                          <Check className="h-5 w-5 text-success-foreground" />
                        </div>
                        <p className="text-sm font-medium text-success">{file.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileChange(docType.type, null);
                          }}
                          className="mt-1"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor={docType.type} className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, JPEG, PNG (Max 5MB)
                        </p>
                      </label>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} size="lg">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-w-[200px]"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Save & Continue
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ComplianceDocsStep;
