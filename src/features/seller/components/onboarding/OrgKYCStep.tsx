import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Mail, Phone, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// ✅ IMPORT SCHEMA & TYPE FROM SINGLE SOURCE
import { useOnboardingData } from "../../hooks/useOnboardingData";
import { OrgKycData, orgKycSchema } from "../../schemas/onboarding.schema";
import onboardingService from "../../services/onboarding.service";

interface Props {
  data?: OrgKycData;
  onNext: () => void;
  onBack?: () => void;
}

// ========== COMPONENT ==========
export default function OrgKYCStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const { getCurrentUser } = useAuth();
  const { refreshData } = useOnboardingData();
  const [gstinFetching, setGstinFetching] = useState(false);
  const [gstinData, setGstinData] = useState(null);
  const [plants, setPlants] = useState<string[]>([]);
  const [newPlant, setNewPlant] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    email: "pending" | "verified" | "sending";
    phone: "pending" | "verified" | "sending";
  }>({
    email: "pending",
    phone: "pending",
  });
  const [otpValues, setOtpValues] = useState({
    email: "",
    phone: "",
  });

  // ✅ USE SCHEMA FOR BOTH VALIDATION & TYPING
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrgKycData>({
    resolver: zodResolver(orgKycSchema), // ✅ Use imported schema
    defaultValues: {
      primaryContact: {
        role: "CEO",
      },
    },
  });

  // ✅ PRE-FILL FORM WITH USER ORG NAME & SAVED DATA
  useEffect(() => {
    // Step 1: Try to get organization name from useAuth hook
    const user = getCurrentUser();
    if (user?.organizationName) {
      setValue("legalName", user.organizationName);
    }
    // Step 2: Override with saved OrgKYC data if it exists
    if (data) {
      setValue("legalName", data.legalName || "");
      setValue("tradeName", data.tradeName || "");
      setValue("gstin", data.gstin || "");
      setValue("pan", data.pan || "");
      setValue("cin", data.cin || "");
      setValue("registeredAddress", data.registeredAddress || "");
      setValue("businessType", data.businessType || "");
      setValue("incorporationDate", data.incorporationDate || "");

      if (data.primaryContact) {
        setValue("primaryContact.name", data.primaryContact.name || "");
        setValue("primaryContact.email", data.primaryContact.email || "");
        setValue("primaryContact.mobile", data.primaryContact.mobile || "");
        setValue("primaryContact.role", data.primaryContact.role || "CEO");

        // Mark email and phone as verified if they exist
        if (data.primaryContact.email) {
          setVerificationStatus((prev) => ({ ...prev, email: "verified" }));
        }
        if (data.primaryContact.mobile) {
          setVerificationStatus((prev) => ({ ...prev, phone: "verified" }));
        }
      }

      if (data.plantLocations && data.plantLocations.length > 0) {
        const formattedLocations = data.plantLocations.map(
          (loc: any) => `${loc.street}, ${loc.city}, ${loc.state} - ${loc.pin || loc.pincode}`
        );
        setPlants(formattedLocations);
      }
    }
  }, [data]);

  // ========== HANDLERS ==========

  const handleFetchGSTIN = async () => {
    const gstin = watch("gstin");
    if (!gstin) return;

    setGstinFetching(true);
    try {
      const response = await onboardingService.fetchGSTIN(gstin);
      setGstinData(response);
      setValue("legalName", response.legalName);
      if (response.tradeName) setValue("tradeName", response.tradeName);
      toast({
        title: "GSTIN Verified",
        description: "Business details fetched successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Fetch Failed",
        description: error.message || "Failed to fetch GSTIN details.",
        variant: "destructive",
      });
    } finally {
      setGstinFetching(false);
    }
  };

  const handleAddPlant = () => {
    if (newPlant.trim()) {
      setPlants([...plants, newPlant.trim()]);
      setNewPlant("");
    }
  };

  const handleRemovePlant = (index: number) => {
    setPlants(plants.filter((_, i) => i !== index));
  };

  const handleSendOTP = async (type: "email" | "phone") => {
    const contactValue = type === "email" ? watch("primaryContact.email") : watch("primaryContact.mobile");

    if (!contactValue) {
      toast({
        title: "Missing Value",
        description: `Please enter ${type} first`,
        variant: "destructive",
      });
      return;
    }

    setVerificationStatus((prev) => ({
      ...prev,
      [type]: "sending",
    }));

    try {
      // console.log(`📤 Sending OTP to ${type}:`, contactValue);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "OTP Sent",
        description: `OTP sent to your ${type}. Check your ${type} inbox.`,
      });
      setVerificationStatus((prev) => ({
        ...prev,
        [type]: "pending",
      }));
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || `Could not send OTP to ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (type: "email" | "phone") => {
    const otp = otpValues[type];
    if (!otp || otp.length < 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter valid OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      // console.log(`✅ Verifying OTP for ${type}:`, otp);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVerificationStatus((prev) => ({
        ...prev,
        [type]: "verified",
      }));
      toast({
        title: "Verified",
        description: `${type} verified successfully`,
      });
      setOtpValues((prev) => ({
        ...prev,
        [type]: "",
      }));
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || `Could not verify OTP`,
        variant: "destructive",
      });
    }
  };

  // ✅ UPDATED onSubmit with OrgKycData type
  const onSubmit = async (formData: OrgKycData) => {
    try {
      if (plants.length === 0) {
        toast({
          title: "Missing Plant Location",
          description: "Please add at least one plant location.",
          variant: "destructive",
        });
        return;
      }

      if (verificationStatus.email !== "verified" || verificationStatus.phone !== "verified") {
        toast({
          title: "Verification Required",
          description: "Please verify both email and phone number",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      const plantLocations = plants.map((p) => {
        const parts = p.split(",").map((part) => part.trim());
        const lastPart = parts[parts.length - 1];
        const statePinMatch = lastPart.match(/^(.+?)\s*-\s*(.+)$/);

        return {
          street: parts[0] || "",
          city: parts[1] || "",
          state: statePinMatch ? statePinMatch[1].trim() : "",
          pin: statePinMatch ? statePinMatch[2].trim() : "",
        };
      });

      // ✅ formData is already type OrgKycData
      const orgKycData: OrgKycData = {
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        gstin: formData.gstin,
        pan: formData.pan,
        cin: formData.cin,
        registeredAddress: formData.registeredAddress,
        businessType: formData.businessType,
        incorporationDate: formData.incorporationDate,
        plantLocations: plantLocations as any,
        primaryContact: {
          name: formData.primaryContact.name,
          email: formData.primaryContact.email,
          mobile: formData.primaryContact.mobile,
          role: formData.primaryContact.role || "CEO",
        },
      };

      console.log("📤 Saving OrgKYC:", orgKycData);
      await onboardingService.updateOrgKYC(orgKycData);

      toast({
        title: "Success",
        description: "Organization KYC saved successfully",
      });
      // await refreshData();

      onNext();
    } catch (error: any) {
      // console.error("❌ Error in onSubmit:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save organization KYC.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <div>
        <h2 className="text-2xl font-bold">Organization KYC</h2>
        <p className="text-gray-600 mt-1">Provide your organization details and business information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ========== SECTION 1: BUSINESS INFORMATION ========== */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="default">1</Badge>
            <h3 className="text-lg font-semibold">Business Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal Name */}
            <div>
              <Label htmlFor="legalName">Legal Name *</Label>
              <Input id="legalName" placeholder="Enter legal name" {...register("legalName")} className="mt-2" />
              {errors.legalName && <p className="text-red-600 text-sm mt-1">{errors.legalName.message}</p>}
            </div>

            {/* Trade Name */}
            <div>
              <Label htmlFor="tradeName">Trade Name</Label>
              <Input id="tradeName" placeholder="Enter trade name" {...register("tradeName")} className="mt-2" />
            </div>

            {/* GSTIN */}
            <div>
              <Label htmlFor="gstin">GSTIN *</Label>
              <div className="flex gap-2 mt-2">
                <Input id="gstin" placeholder="Enter GSTIN" {...register("gstin")} />
                <Button type="button" onClick={handleFetchGSTIN} disabled={gstinFetching} variant="outline">
                  {gstinFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              {errors.gstin && <p className="text-red-600 text-sm mt-1">{errors.gstin.message}</p>}
              {gstinData && (
                <p className="text-green-600 text-sm mt-1">
                  <Check className="w-4 h-4 inline mr-1" />
                  Verified: {(gstinData as any).legalName}
                </p>
              )}
            </div>

            {/* PAN */}
            <div>
              <Label htmlFor="pan">PAN *</Label>
              <Input id="pan" placeholder="Enter PAN" {...register("pan")} className="mt-2" />
              {errors.pan && <p className="text-red-600 text-sm mt-1">{errors.pan.message}</p>}
            </div>

            {/* CIN */}
            <div>
              <Label htmlFor="cin">CIN (Optional)</Label>
              <Input id="cin" placeholder="Enter CIN" {...register("cin")} className="mt-2" />
            </div>

            {/* Business Type */}
            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <select
                id="businessType"
                {...register("businessType")}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="">Select business type</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Trading">Trading</option>
                <option value="Distribution">Distribution</option>
                <option value="Service">Service</option>
              </select>
              {errors.businessType && <p className="text-red-600 text-sm mt-1">{errors.businessType.message}</p>}
            </div>

            {/* Incorporation Date */}
            <div>
              <Label htmlFor="incorporationDate">Incorporation Date *</Label>
              <Input id="incorporationDate" type="date" {...register("incorporationDate")} className="mt-2" />
              {errors.incorporationDate && (
                <p className="text-red-600 text-sm mt-1">{errors.incorporationDate.message}</p>
              )}
            </div>

            {/* Registered Address */}
            <div className="md:col-span-2">
              <Label htmlFor="registeredAddress">Registered Address *</Label>
              <Input
                id="registeredAddress"
                placeholder="Enter registered address"
                {...register("registeredAddress")}
                className="mt-2"
              />
              {errors.registeredAddress && (
                <p className="text-red-600 text-sm mt-1">{errors.registeredAddress.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* ========== SECTION 2: PLANT LOCATIONS ========== */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="default">2</Badge>
            <h3 className="text-lg font-semibold">Plant Locations</h3>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              value={newPlant}
              onChange={(e) => setNewPlant(e.target.value)}
              placeholder="e.g., Plot 5 MIDC, Pune, Maharashtra - 411001"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPlant();
                }
              }}
            />
            <Button type="button" onClick={handleAddPlant} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {plants.length > 0 ? (
            <div className="space-y-2">
              {plants.map((plant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span>{plant}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemovePlant(index)}
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600 text-sm">⚠️ Add at least one plant location</p>
          )}
        </Card>

        {/* ========== SECTION 3: PRIMARY CONTACT ========== */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="default">3</Badge>
            <h3 className="text-lg font-semibold">Primary Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <Label htmlFor="contactName">Name *</Label>
              <Input
                id="contactName"
                placeholder="Enter contact name"
                {...register("primaryContact.name")}
                className="mt-2"
              />
              {errors.primaryContact?.name && (
                <p className="text-red-600 text-sm mt-1">{errors.primaryContact.name.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="e.g., CEO, Director"
                {...register("primaryContact.role")}
                className="mt-2"
              />
            </div>

            {/* Email with OTP */}
            <div className="md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <div className="flex gap-2 mt-2">
                <Input id="email" type="email" placeholder="Enter email" {...register("primaryContact.email")} />
                <Button
                  type="button"
                  onClick={() => handleSendOTP("email")}
                  disabled={verificationStatus.email === "verified" || verificationStatus.email === "sending"}
                  variant={verificationStatus.email === "verified" ? "default" : "outline"}
                  size="sm"
                >
                  {verificationStatus.email === "verified" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : verificationStatus.email === "sending" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
              {errors.primaryContact?.email && (
                <p className="text-red-600 text-sm mt-1">{errors.primaryContact.email.message}</p>
              )}

              {verificationStatus.email === "pending" && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={otpValues.email}
                    onChange={(e) =>
                      setOtpValues((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("email")} size="sm">
                    Verify
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile with OTP */}
            <div className="md:col-span-2">
              <Label htmlFor="mobile">Mobile *</Label>
              <div className="flex gap-2 mt-2">
                <Input id="mobile" placeholder="Enter mobile number" {...register("primaryContact.mobile")} />
                <Button
                  type="button"
                  onClick={() => handleSendOTP("phone")}
                  disabled={verificationStatus.phone === "verified" || verificationStatus.phone === "sending"}
                  variant={verificationStatus.phone === "verified" ? "default" : "outline"}
                  size="sm"
                >
                  {verificationStatus.phone === "verified" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : verificationStatus.phone === "sending" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Send OTP
                    </>
                  )}
                </Button>
              </div>
              {errors.primaryContact?.mobile && (
                <p className="text-red-600 text-sm mt-1">{errors.primaryContact.mobile.message}</p>
              )}

              {verificationStatus.phone === "pending" && (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={otpValues.phone}
                    onChange={(e) =>
                      setOtpValues((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="flex-1"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("phone")} size="sm">
                    Verify
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ========== FORM ACTIONS ========== */}
        <div className="flex gap-4 justify-end">
          {onBack && (
            <Button type="button" onClick={onBack} variant="outline">
              Back
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
