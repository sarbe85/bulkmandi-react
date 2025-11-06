import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, FileText, Loader2, Lock, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BankDetails, bankDetailsSchema } from "../../schemas/onboarding.schema";
import onboardingService from "../../services/onboarding.service";

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

// ✅ Document type enum matching backend
enum BankDocType {
  CANCELLED_CHEQUE = "CANCELLED_CHEQUE",
  BANK_PASSBOOK = "BANK_PASSBOOK",
  BANK_STATEMENT = "BANK_STATEMENT",
  BANK_LETTER = "BANK_LETTER",
}

const BANK_DOC_TYPES = [
  { type: BankDocType.CANCELLED_CHEQUE, label: "Cancelled Cheque", required: true },
  { type: BankDocType.BANK_PASSBOOK, label: "Bank Passbook", required: false },
  { type: BankDocType.BANK_STATEMENT, label: "Bank Statement (3 months)", required: false },
  { type: BankDocType.BANK_LETTER, label: "Bank Letter", required: false },
];

// ✅ Interface for existing documents from backend
interface ExistingBankDocument {
  docType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: string;
}

export default function BankDetailsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingIfsc, setIsValidatingIfsc] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);
  const [ifscValidated, setIfscValidated] = useState(false);
  const [ifscBankDetails, setIfscBankDetails] = useState<{
    bankName: string;
    branchName: string;
  } | null>(null);
  const [pennyDropStatus, setPennyDropStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");

  // ✅ Store uploading state per docType
  const [uploadingFiles, setUploadingFiles] = useState<Map<BankDocType, boolean>>(new Map());
  const fileInputRefs = useRef<Map<BankDocType, HTMLInputElement>>(new Map());

  // ✅ Store existing documents from backend
  const [existingDocuments, setExistingDocuments] = useState<Map<BankDocType, ExistingBankDocument>>(new Map());

  const [payoutMethod, setPayoutMethod] = useState<"RTGS" | "NEFT" | "UPI">("RTGS");
  const [upiDetails, setUpiDetails] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BankDetails>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: "",
      accountHolderName: "",
      ifsc: "",
      bankName: "",
    },
  });

  const accountNumber = watch("accountNumber");
  const ifsc = watch("ifsc");
  const accountHolderName = watch("accountHolderName");

  // ✅ Pre-fill from API data - handle existing documents
  useEffect(() => {
    if (data?.primaryBankAccount) {
      const validated = data?.primaryBankAccount;
      try {
       const validated = bankDetailsSchema.parse(data.primaryBankAccount);
        setValue("accountNumber", validated.accountNumber || "");
        setValue("accountHolderName", validated.accountHolderName || "");
        setValue("ifsc", validated.ifsc || "");
        setValue("bankName", validated.bankName || "");

        if (validated.ifsc) {
          setIfscValidated(true);
          if (validated.bankName) {
            setIfscBankDetails({
              bankName: validated.bankName,
              branchName: "Branch",
            });
          }
        }

        if (validated.pennyDropStatus === "VERIFIED") {
          setPennyDropStatus("verified");
        }

        // ✅ Pre-fill existing bank documents with proper structure
        if (data?.primaryBankAccount?.documents && Array.isArray(data.primaryBankAccount.documents)) {
          const docsMap = new Map<BankDocType, ExistingBankDocument>();
          data.primaryBankAccount.documents.forEach((doc: any) => {
            if (doc.docType && doc.fileName && doc.fileUrl) {
              docsMap.set(doc.docType as BankDocType, {
                docType: doc.docType,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                uploadedAt: doc.uploadedAt || new Date().toISOString(),
                status: doc.status || "UPLOADED",
              });
            }
          });
          setExistingDocuments(docsMap);
        }
      } catch (error) {
        console.error("Invalid bank details from API:", error);
      }
    }
  }, [data, setValue]);

  // Static IFSC Validation
  const handleValidateIfsc = async () => {
    if (!ifsc || ifsc.length < 11) {
      toast({
        title: "Invalid IFSC",
        description: "Please enter a valid 11-character IFSC code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsValidatingIfsc(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = {
        valid: true,
        bankName: "SBI",
        branchName: "NALCO",
      };

      if (!result.valid) {
        throw new Error("IFSC not valid");
      }

      setValue("bankName", result.bankName);
      setIfscBankDetails({
        bankName: result.bankName,
        branchName: result.branchName,
      });
      setIfscValidated(true);
      toast({
        title: "IFSC Validated",
        description: `${result.bankName} - ${result.branchName}`,
      });
    } catch (error: any) {
      setIfscValidated(false);
      setIfscBankDetails(null);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate IFSC",
        variant: "destructive",
      });
    } finally {
      setIsValidatingIfsc(false);
    }
  };

  // Static Penny Drop
  const handlePennyDrop = async () => {
    if (!accountNumber || !ifsc) {
      toast({
        title: "Missing Information",
        description: "Please enter account number and IFSC code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPennyDropping(true);
      setPennyDropStatus("verifying");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = {
        verified: true,
        accountName: "Test Account Holder",
      };

      if (!result.verified) {
        throw new Error("Penny drop verification failed");
      }

      setValue("accountHolderName", result.accountName);
      setPennyDropStatus("verified");
      toast({
        title: "Account Verified",
        description: `Account holder: ${result.accountName}`,
      });
    } catch (error: any) {
      setPennyDropStatus("error");
      toast({
        title: "Verification Error",
        description: error.message || "Penny drop verification failed",
        variant: "destructive",
      });
    } finally {
      setIsPennyDropping(false);
    }
  };

  // ✅ Trigger file input for specific docType
  const triggerFileInput = (docType: BankDocType) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  // ✅ NEW: Handle immediate file upload on selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: BankDocType) => {
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
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, JPG, PNG files are allowed",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    // ✅ Upload file immediately
    try {
      // Set uploading state
      const newUploadingMap = new Map(uploadingFiles);
      newUploadingMap.set(docType, true);
      setUploadingFiles(newUploadingMap);

      toast({
        title: "Uploading...",
        description: `Uploading ${file.name}`,
      });

      // Call API to upload single file
      const response = await onboardingService.uploadSingleDocument(file, docType);

      // Update existing documents map with newly uploaded file
      const newDocsMap = new Map(existingDocuments);
      newDocsMap.set(docType, {
        docType: docType,
        fileName: response.fileName,
        fileUrl: response.fileUrl,
        uploadedAt: new Date().toISOString(),
        status: "UPLOADED",
      });
      setExistingDocuments(newDocsMap);

      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      // Clear uploading state
      const newUploadingMap = new Map(uploadingFiles);
      newUploadingMap.delete(docType);
      setUploadingFiles(newUploadingMap);
      e.target.value = "";
    }
  };

  // ✅ Remove uploaded document
  const removeDocument = async (docType: BankDocType) => {
    try {
      // Call API to delete document
      await onboardingService.deleteDocument(docType);

      // Remove from local state
      const newMap = new Map(existingDocuments);
      newMap.delete(docType);
      setExistingDocuments(newMap);

      toast({
        title: "Document Removed",
        description: "Document removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  // Button enablement gating
  const canSubmit = !!accountNumber && !!accountHolderName && !!ifsc && ifscValidated && existingDocuments.has(BankDocType.CANCELLED_CHEQUE);

  // ✅ Submit handler - only saves bank account details (files already uploaded)
  const onSubmit = async (formData: BankDetails) => {
    try {
      setIsSubmitting(true);

      if (!ifscValidated) {
        toast({ title: "IFSC Not Validated", description: "Please validate IFSC code first", variant: "destructive" });
        return;
      }

      // Check if required documents are uploaded
      if (!existingDocuments.has(BankDocType.CANCELLED_CHEQUE)) {
        toast({ title: "Missing Documents", description: "Please upload Cancelled Cheque", variant: "destructive" });
        return;
      }

      // Call service to update only bank account details (no files)
      await onboardingService.updateBankDetailsOnly({
        ...formData,
        pennyDropStatus: pennyDropStatus === "verified" ? "VERIFIED" : "PENDING",
        pennyDropScore: pennyDropStatus === "verified" ? 100 : 0,
      });

      toast({ title: "Success", description: "Bank details saved successfully" });
      onNext();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: error.message || "Failed to save bank details", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Account Details & Documents</h3>
        <p className="text-sm text-muted-foreground mb-6">Add your primary bank account information and required documents</p>

        <div className="space-y-4">
          {/* Account Number */}
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input {...register("accountNumber")} id="accountNumber" placeholder="Enter account number" disabled={isSubmitting} className="mt-1" />
            {errors.accountNumber && <p className="text-sm text-destructive mt-1">{errors.accountNumber.message}</p>}
          </div>

          {/* Account Holder Name */}
          <div>
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input {...register("accountHolderName")} id="accountHolderName" placeholder="As per bank records" disabled={isSubmitting} className="mt-1" />
            {errors.accountHolderName && <p className="text-sm text-destructive mt-1">{errors.accountHolderName.message}</p>}
          </div>

          {/* IFSC */}
          <div>
            <Label htmlFor="ifsc">IFSC Code *</Label>
            <div className="flex gap-2 mt-1">
              <Input {...register("ifsc")} id="ifsc" placeholder="e.g., SBIN0001234" disabled={isSubmitting} className="flex-1" />
              {isValidatingIfsc ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <Button type="button" onClick={handleValidateIfsc} disabled={isSubmitting || !ifsc} variant="outline">
                  Validate
                </Button>
              )}
            </div>
            {errors.ifsc && <p className="text-sm text-destructive mt-1">{errors.ifsc.message}</p>}
            {ifscValidated ? (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Done
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">Validate IFSC to fetch bank details</p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <Label>Bank Name</Label>
            <Input {...register("bankName")} disabled className="mt-1 bg-muted" />
            {ifscValidated && ifscBankDetails && (
              <div className="text-sm text-muted-foreground mt-1">
                <p>Bank Name: {ifscBankDetails.bankName}</p>
                <p>Branch: {ifscBankDetails.branchName}</p>
              </div>
            )}
          </div>

          {/* Penny Drop Verification */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-base">Penny Drop Verification</Label>
            <p className="text-sm text-muted-foreground mb-3">Verifies account holder name by sending a nominal amount</p>
            <Button type="button" onClick={handlePennyDrop} disabled={isPennyDropping || !accountNumber || !ifsc} variant="outline" className="w-full">
              {isPennyDropping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>💰 Verify Bank Account</>
              )}
            </Button>
            <div className="mt-2 text-sm">
              {pennyDropStatus === "verified" && (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Account verified
                </p>
              )}
              {pennyDropStatus === "error" && (
                <p className="text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Verification failed
                </p>
              )}
              {pennyDropStatus === "idle" && <p className="text-muted-foreground">Pending verification</p>}
            </div>
          </div>

          {/* Payout Preference */}
          <div>
            <Label className="text-base mb-2 block">Payout Preference</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" value="RTGS" checked={payoutMethod === "RTGS"} onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")} className="w-4 h-4" />
                RTGS (Real Time Gross Settlement)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="NEFT" checked={payoutMethod === "NEFT"} onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")} className="w-4 h-4" />
                NEFT (National Electronic Funds Transfer)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="UPI" checked={payoutMethod === "UPI"} onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")} className="w-4 h-4" />
                UPI (Unified Payments Interface)
              </label>
            </div>
            {payoutMethod === "UPI" && (
              <div className="mt-3">
                <Label htmlFor="upiId">UPI ID / Address *</Label>
                <Input id="upiId" placeholder="yourname@upi" value={upiDetails} onChange={(e) => setUpiDetails(e.target.value)} className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600" disabled={isSubmitting} />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bank Documents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bank Documents</h3>
        <div className="space-y-4">
          {BANK_DOC_TYPES.map((doc) => {
            const docTypeEnum = doc.type as BankDocType;
            const hasExistingFile = existingDocuments.has(docTypeEnum);
            const isUploading = uploadingFiles.get(docTypeEnum) || false;
            const existingFile = existingDocuments.get(docTypeEnum);

            return (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Label className="text-base">
                      {doc.label} {doc.required && <span className="text-destructive">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">{doc.required ? "Required" : "Optional"} • PDF, JPG, PNG (Max 5MB)</p>
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
                        <span className="text-sm text-green-700 dark:text-green-400">{existingFile?.fileName}</span>
                      </div>
                      <Button type="button" onClick={() => removeDocument(docTypeEnum)} disabled={isSubmitting || isUploading} variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Status: {existingFile?.status} • Uploaded: {new Date(existingFile?.uploadedAt || "").toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* File Input */}
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current.set(docTypeEnum, el);
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e, docTypeEnum)}
                  style={{ display: "none" }}
                />

                {/* Upload/Replace Button */}
                <div className="mt-3 flex gap-2">
                  <Button type="button" onClick={() => triggerFileInput(docTypeEnum)} disabled={isSubmitting || isUploading} variant={hasExistingFile ? "outline" : "default"} size="sm" className="whitespace-nowrap">
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

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
          ← Back
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
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
        Your bank details are encrypted and securely processed
      </p>
    </form>
  );
}
