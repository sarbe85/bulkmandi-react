import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { AlertCircle, CheckCircle, FileText, Loader2, Lock, Upload, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";

import { BankDetails, bankDetailsSchema } from "../../schemas/onboarding.schema";
import onboardingService from "../../services/onboarding.service";

interface Props {
  data?: any;
  onNext: () => void;
  onBack: () => void;
}

const BANK_DOC_TYPES = [
  { type: "CANCELLED_CHEQUE", label: "Cancelled Cheque", required: true },
  { type: "BANK_PASSBOOK", label: "Bank Passbook", required: false },
  { type: "BANK_STATEMENT", label: "Bank Statement (3 months)", required: false },
  { type: "BANK_LETTER", label: "Bank Letter", required: false },
];

export default function BankDetailsStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingIfsc, setIsValidatingIfsc] = useState(false);
  const [isPennyDropping, setIsPennyDropping] = useState(false);

  const [ifscValidated, setIfscValidated] = useState(false);
  const [ifscBankDetails, setIfscBankDetails] = useState<{ bankName: string; branchName: string } | null>(null);

  const [pennyDropStatus, setPennyDropStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");

  // Map<string, File>
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(new Map());
  const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  const [payoutMethod, setPayoutMethod] = useState<"RTGS" | "NEFT" | "UPI">("RTGS");
  const [upiDetails, setUpiDetails] = useState("");

  const [declarations, setDeclarations] = useState({
    warrantyAssurance: false,
    termsAccepted: false,
    amlCompliance: false,
  });

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

  // Pre-fill from API data
  useEffect(() => {
    if (data?.primaryBankAccount) {
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
              branchName: "Branch", // optional if branch is not provided
            });
          }
        }
      } catch (error) {
        console.error("Invalid bank details from API:", error);
      }
    }
  }, [data, setValue]);

  // Static IFSC Validation with dummy data
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

  // Static Penny Drop with verified status
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
      setPennyDropStatus("verifying");
      setIsPennyDropping(true);

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

  const triggerFileInput = (docType: string) => {
    const inputElement = fileInputRefs.current.get(docType);
    if (inputElement) inputElement.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

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

    const newMap = new Map(selectedFiles);
    newMap.set(docType, file);
    setSelectedFiles(newMap);

    toast({
      title: "File Selected",
      description: `${file.name} ready for upload`,
    });

    e.target.value = "";
  };

  const removeDocument = (docType: string) => {
    const newMap = new Map(selectedFiles);
    newMap.delete(docType);
    setSelectedFiles(newMap);
  };

  // Button enablement gating
  const canSubmit =
    !!accountNumber &&
    !!accountHolderName &&
    !!ifsc &&
    ifscValidated &&
    selectedFiles.has("CANCELLED_CHEQUE") &&
    declarations.warrantyAssurance &&
    declarations.termsAccepted &&
    declarations.amlCompliance;

  // Submit handler
  const onSubmit = async (formData: BankDetails) => {
    try {
      setIsSubmitting(true);

      if (!ifscValidated) {
        toast({
          title: "IFSC Not Validated",
          description: "Please validate IFSC code first",
          variant: "destructive",
        });
        return;
      }

      const missingDocs = BANK_DOC_TYPES.filter((doc) => doc.required && !selectedFiles.has(doc.type));
      if (missingDocs.length > 0) {
        toast({
          title: "Missing Documents",
          description: `Please upload: ${missingDocs.map((d) => d.label).join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      if (!declarations.warrantyAssurance || !declarations.termsAccepted || !declarations.amlCompliance) {
        toast({
          title: "Missing Declarations",
          description: "Please agree to all declarations",
          variant: "destructive",
        });
        return;
      }

      const filesArray: File[] = Array.from(selectedFiles.values());

      // Call service
      await onboardingService.updateBankDetails(
        {
          ...formData,
          pennyDropStatus: pennyDropStatus === "verified" ? "VERIFIED" : "PENDING",
          pennyDropScore: pennyDropStatus === "verified" ? 100 : 0,
        },
        filesArray
      );

      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });

      onNext();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save bank details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Bank Account Details & Documents</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your primary bank account information and required documents
        </p>
      </div>

      {/* Account Details */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              placeholder="Enter bank account number"
              {...register("accountNumber")}
              disabled={isSubmitting}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.accountNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              placeholder="Enter account holder name"
              {...register("accountHolderName")}
              disabled={isSubmitting}
            />
            {errors.accountHolderName && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.accountHolderName.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <Label htmlFor="ifsc">IFSC Code *</Label>
              <Input id="ifsc" placeholder="e.g., SBIN0000001" {...register("ifsc")} disabled={isSubmitting} />
              {errors.ifsc && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.ifsc.message}
                </p>
              )}
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                onClick={handleValidateIfsc}
                disabled={isValidatingIfsc || isSubmitting || !ifsc || ifsc.length < 11}
                variant="outline"
              >
                {isValidatingIfsc ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>Validate</>
                )}
              </Button>

              {ifscValidated ? (
                <div className="text-green-600 text-sm flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Done</span>
                </div>
              ) : (
                <div className="text-xs text-gray-500">Validate IFSC to fetch bank details</div>
              )}
            </div>

            <div className="md:col-span-1">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" placeholder="Auto-filled after IFSC validation" {...register("bankName")} disabled />
            </div>
          </div>

          {ifscValidated && ifscBankDetails && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <div className="text-sm">{ifscBankDetails.bankName}</div>
              </div>
              <div>
                <Label>Branch</Label>
                <div className="text-sm">{ifscBankDetails.branchName}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Penny Drop Verification */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Penny Drop Verification</div>
            <div className="text-xs text-gray-500">
              Verifies account holder name by sending a nominal amount
            </div>
          </div>
          <Button type="button" onClick={handlePennyDrop} disabled={isPennyDropping || isSubmitting || !ifsc || !accountNumber}>
            {isPennyDropping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>💰 Verify Bank Account</>
            )}
          </Button>
        </div>

        <div className="text-xs">
          {pennyDropStatus === "verified" && (
            <div className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Account verified
            </div>
          )}
          {pennyDropStatus === "error" && (
            <div className="text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Verification failed
            </div>
          )}
          {pennyDropStatus === "idle" && <div className="text-gray-500">Pending verification</div>}
        </div>
      </Card>

      {/* Payout Preference */}
      <Card className="p-4 space-y-3">
        <div className="font-medium">Payout Preference</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payout"
              value="RTGS"
              checked={payoutMethod === "RTGS"}
              onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")}
              className="w-4 h-4"
            />
            RTGS (Real Time Gross Settlement)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payout"
              value="NEFT"
              checked={payoutMethod === "NEFT"}
              onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")}
              className="w-4 h-4"
            />
            NEFT (National Electronic Funds Transfer)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="payout"
              value="UPI"
              checked={payoutMethod === "UPI"}
              onChange={(e) => setPayoutMethod(e.target.value as "RTGS" | "NEFT" | "UPI")}
              className="w-4 h-4"
            />
            UPI (Unified Payments Interface)
          </label>

          {payoutMethod === "UPI" && (
            <div>
              <Label htmlFor="upi">UPI ID / Address *</Label>
              <Input
                id="upi"
                placeholder="e.g., name@bank"
                value={upiDetails}
                onChange={(e) => setUpiDetails(e.target.value)}
                className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Bank Documents */}
      <Card className="p-4 space-y-3">
        <div className="font-medium">Bank Documents</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BANK_DOC_TYPES.map((doc) => {
            const hasFile = selectedFiles.has(doc.type);
            return (
              <div key={doc.type} className="border rounded-md p-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div className="font-medium text-sm">
                      {doc.label} {doc.required && <span className="text-red-600">*</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{doc.required ? "Required" : "Optional"} • PDF, JPG, PNG</div>
                  {hasFile ? (
                    <div className="text-green-600 text-xs flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Added
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Pending</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current.set(doc.type, el);
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e, doc.type)}
                    style={{ display: "none" }}
                  />
                  <Button type="button" onClick={() => triggerFileInput(doc.type)} disabled={isSubmitting} variant="outline" size="sm" className="text-xs">
                    {hasFile ? "Replace" : "Upload"}
                    <Upload className="ml-1 h-3 w-3" />
                  </Button>
                  {hasFile && (
                    <Button
                      type="button"
                      onClick={() => removeDocument(doc.type)}
                      disabled={isSubmitting}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Declarations */}
      <Card className="p-4 space-y-2">
        <div className="font-medium">Declarations</div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={declarations.warrantyAssurance}
            onChange={(e) => setDeclarations({ ...declarations, warrantyAssurance: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          I confirm warranty and grade assurance compliance
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={declarations.termsAccepted}
            onChange={(e) => setDeclarations({ ...declarations, termsAccepted: e.target.checked })}
            className="w-4 h-4 rounded"
          />
        I agree to Terms & Conditions
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={declarations.amlCompliance}
            onChange={(e) => setDeclarations({ ...declarations, amlCompliance: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          I confirm AML/CFT compliance
        </label>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>

        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save & Continue</>
          )}
        </Button>
      </div>

      {/* Read-only note */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        Your bank details are securely processed.
      </div>
    </form>
  );
}
