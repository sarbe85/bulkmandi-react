// src/features/buyer/components/onboarding/ComplianceDocs.tsx

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useOnboardingData } from "../../hooks/useOnboardingData";
import { ComplianceFormData, complianceSchema } from "../../schemas/buyer-onboarding.schema";
import { buyerOnboardingService } from "../../services/onboarding.service";

// Buyer-specific compliance documents (same as seller structure)
const COMPLIANCE_DOC_TYPES = [
  { type: "GST_CERTIFICATE", label: "GST Certificate", required: true },
  { type: "PAN_CERTIFICATE", label: "PAN Certificate", required: true },
  { type: "BUSINESS_LICENSE", label: "Business License", required: false },
  { type: "FACTORY_LICENSE", label: "Factory License", required: false },
  { type: "QA_CERTIFICATE", label: "Quality Assurance Certificate", required: false },
];

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

export default function ComplianceDocs({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const { silentRefresh } = useOnboardingData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ PHASE 1: File state - caching uploaded files in frontend
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Map<string, any>>(new Map());
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

  // ✅ Load existing documents from backend on mount
  useEffect(() => {
    if (data?.documents && Array.isArray(data.documents)) {
      const docsMap = new Map();
      data.documents.forEach((doc: any) => {
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

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, JPG, PNG, DOC, DOCX allowed",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setUploadingFiles((prev) => ({ ...prev, [docType]: true }));
    try {
      toast({ title: "Uploading...", description: `${file.name}` });

      // ✅ PHASE 1: Upload file (NO DB update yet)
      const response = await buyerOnboardingService.uploadSingleDocument(file, docType);

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

      toast({ title: "Upload Successful", description: `${file.name} uploaded` });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [docType]: false }));
      e.target.value = "";
    }
  };

  const removeDocument = async (docType: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await buyerOnboardingService.deleteDocument(docType);
      setUploadedDocs((prev) => {
        const newMap = new Map(prev);
        newMap.delete(docType);
        return newMap;
      });
      toast({ title: "Document Removed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ PHASE 2: Form submit - persist all to DB
  const onSubmit = async (formData: ComplianceFormData) => {
    try {
      setIsSubmitting(true);

      // Validate required documents
      const missingDocs = COMPLIANCE_DOC_TYPES.filter((doc) => doc.required && !uploadedDocs.has(doc.type));
      if (missingDocs.length > 0) {
        toast({
          title: "Missing Documents",
          description: `Upload: ${missingDocs.map((d) => d.label).join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // ✅ PHASE 2: Send all data to backend for DB persistence
      await buyerOnboardingService.updateComplianceDocsWithDeclarations(formData, Array.from(uploadedDocs.values()));

      await silentRefresh();
      toast({ title: "Success", description: "Compliance saved" });
      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Compliance Documents</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Document Uploads */}
        <div className="space-y-4">
          {COMPLIANCE_DOC_TYPES.map((doc) => {
            const isUploading = uploadingFiles[doc.type] || false;
            const hasFile = uploadedDocs.has(doc.type);
            const uploadedDoc = uploadedDocs.get(doc.type);

            return (
              <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label className="font-semibold">
                    {doc.label} {doc.required && <span className="text-red-500">*</span>}
                  </Label>
                  {hasFile && uploadedDoc ? (
                    <p className="text-xs text-green-700 mt-1">{uploadedDoc.fileName}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC (Max 5MB)</p>
                  )}
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(doc.type, el);
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileSelect(e, doc.type)}
                    style={{ display: "none" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => triggerFileInput(doc.type)}
                    disabled={isSubmitting || isUploading}
                    variant={hasFile ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs px-3"
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
                  {hasFile && uploadedDoc && (
                    <Button
                      type="button"
                      onClick={() => removeDocument(doc.type)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Declarations */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold">Declarations</h3>

          <div className="space-y-3">
            {/* Warranty & Assurance */}
            <div className="flex items-start gap-3">
              <Controller
                name="warrantyAssurance"
                control={control}
                render={({ field }) => <Checkbox id="warranty" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />}
              />
              <div className="flex-1">
                <Label htmlFor="warranty" className="text-sm font-normal cursor-pointer">
                  Warranty & Assurance: All information provided is accurate and complete
                </Label>
                {errors.warrantyAssurance?.message && <p className="text-xs text-destructive mt-1">{errors.warrantyAssurance.message}</p>}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <Controller
                name="termsAccepted"
                control={control}
                render={({ field }) => <Checkbox id="terms" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />}
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  Terms & Conditions: I agree to the terms and conditions
                </Label>
                {errors.termsAccepted?.message && <p className="text-xs text-destructive mt-1">{errors.termsAccepted.message}</p>}
              </div>
            </div>

            {/* AML Compliance (Buyer-specific) */}
            <div className="flex items-start gap-3">
              <Controller
                name="amlCompliance"
                control={control}
                render={({ field }) => <Checkbox id="aml" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />}
              />
              <div className="flex-1">
                <Label htmlFor="aml" className="text-sm font-normal cursor-pointer">
                  AML Compliance: I comply with Anti-Money Laundering regulations
                </Label>
                {errors.amlCompliance?.message && <p className="text-xs text-destructive mt-1">{errors.amlCompliance.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-between pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            ← Back
          </Button>
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

        <p className="text-xs text-gray-500 text-center">Your compliance data is encrypted and securely processed</p>
      </form>
    </div>
  );
}
