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
import { useOnboardingData } from "../../hooks/useOnboardingData";
import { OrgKycData, orgKycSchema } from "../../schemas/onboarding.schema";
import onboardingService from "../../services/onboarding.service";

interface Props {
  data?: OrgKycData;
  onNext: () => void;
  onBack?: () => void;
}

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrgKycData>({
    resolver: zodResolver(orgKycSchema),
    defaultValues: {
      primaryContact: {
        role: "CEO",
      },
    },
  });

  // Pre-fill form with data
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.organizationName) {
      setValue("legalName", user.organizationName);
    }
    
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
  }, [data, getCurrentUser, setValue]);

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "OTP Sent",
        description: `OTP sent to your ${type}`,
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

      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save organization KYC.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization KYC</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Provide your organization details and business information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Information */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="legalName" className="text-gray-700 dark:text-gray-300">
                Legal Name *
              </Label>
              <Input
                id="legalName"
                placeholder="e.g., Steel Corp India Pvt Ltd"
                {...register("legalName")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.legalName && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.legalName.message}</p>}
            </div>

            <div>
              <Label htmlFor="tradeName" className="text-gray-700 dark:text-gray-300">
                Trade Name
              </Label>
              <Input
                id="tradeName"
                placeholder="e.g., SteelCorp"
                {...register("tradeName")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="gstin" className="text-gray-700 dark:text-gray-300">
                GSTIN *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="gstin"
                  placeholder="e.g., 27AABCT1234H1Z0"
                  {...register("gstin")}
                  className="dark:bg-slate-900 dark:border-slate-600"
                />
                <Button type="button" onClick={handleFetchGSTIN} disabled={gstinFetching} variant="outline" size="sm">
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
              {errors.gstin && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.gstin.message}</p>}
              {gstinData && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Verified: {(gstinData as any).legalName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="pan" className="text-gray-700 dark:text-gray-300">
                PAN *
              </Label>
              <Input
                id="pan"
                placeholder="e.g., AAABP1234Q"
                {...register("pan")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.pan && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.pan.message}</p>}
            </div>

            <div>
              <Label htmlFor="cin" className="text-gray-700 dark:text-gray-300">
                CIN (Optional)
              </Label>
              <Input
                id="cin"
                placeholder="e.g., U27200WB2015PTC213456"
                {...register("cin")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="businessType" className="text-gray-700 dark:text-gray-300">
                Business Type *
              </Label>
              <select
                id="businessType"
                {...register("businessType")}
                className="w-full mt-2 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-600 dark:text-gray-200"
              >
                <option value="">Select business type</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Trading">Trading</option>
                <option value="Distribution">Distribution</option>
                <option value="Service">Service</option>
              </select>
              {errors.businessType && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.businessType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="incorporationDate" className="text-gray-700 dark:text-gray-300">
                Incorporation Date *
              </Label>
              <Input
                id="incorporationDate"
                type="date"
                placeholder="Select date"
                {...register("incorporationDate")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.incorporationDate && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.incorporationDate.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="registeredAddress" className="text-gray-700 dark:text-gray-300">
                Registered Address *
              </Label>
              <Input
                id="registeredAddress"
                placeholder="e.g., 123 Industrial Area, Mumbai, Maharashtra 400080"
                {...register("registeredAddress")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.registeredAddress && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.registeredAddress.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Plant Locations */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plant Locations</h3>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Plot 5, MIDC, Pune, Maharashtra - 411001"
                value={newPlant}
                onChange={(e) => setNewPlant(e.target.value)}
                className="flex-1 dark:bg-slate-900 dark:border-slate-600"
              />
              <Button type="button" onClick={handleAddPlant} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {plants.length > 0 && (
              <div className="space-y-2">
                {plants.map((plant, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                  >
                    <span className="text-sm text-green-800 dark:text-green-300">{plant}</span>
                    <Button
                      type="button"
                      onClick={() => handleRemovePlant(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {plants.length === 0 && (
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️ Add at least one plant location</p>
            )}
          </div>
        </Card>

        {/* Primary Contact */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Primary Contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primaryContactName" className="text-gray-700 dark:text-gray-300">
                Name *
              </Label>
              <Input
                id="primaryContactName"
                placeholder="e.g., Rajesh Kumar"
                {...register("primaryContact.name")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.primaryContact?.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.primaryContact.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="primaryContactRole" className="text-gray-700 dark:text-gray-300">
                Role *
              </Label>
              <Input
                id="primaryContactRole"
                placeholder="e.g., CEO"
                {...register("primaryContact.role")}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="primaryContactEmail" className="text-gray-700 dark:text-gray-300">
                Email *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="primaryContactEmail"
                  type="email"
                  placeholder="e.g., rajesh@steelcorp.com"
                  {...register("primaryContact.email")}
                  className="flex-1 dark:bg-slate-900 dark:border-slate-600"
                />
                {verificationStatus.email === "verified" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Check className="w-4 h-4 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSendOTP("email")}
                    disabled={verificationStatus.email === "sending"}
                    variant="outline"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    {verificationStatus.email === "sending" ? "Sending..." : "Verify"}
                  </Button>
                )}
              </div>
              {errors.primaryContact?.email && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.primaryContact.email.message}</p>
              )}

              {verificationStatus.email === "pending" && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Enter OTP"
                    value={otpValues.email}
                    onChange={(e) => setOtpValues({ ...otpValues, email: e.target.value })}
                    className="flex-1 dark:bg-slate-900 dark:border-slate-600"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("email")} size="sm">
                    Verify OTP
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="primaryContactMobile" className="text-gray-700 dark:text-gray-300">
                Mobile *
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="primaryContactMobile"
                  placeholder="e.g., 9876543210"
                  {...register("primaryContact.mobile")}
                  className="flex-1 dark:bg-slate-900 dark:border-slate-600"
                />
                {verificationStatus.phone === "verified" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <Check className="w-4 h-4 mr-1" /> Verified
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSendOTP("phone")}
                    disabled={verificationStatus.phone === "sending"}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    {verificationStatus.phone === "sending" ? "Sending..." : "Verify"}
                  </Button>
                )}
              </div>
              {errors.primaryContact?.mobile && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.primaryContact.mobile.message}</p>
              )}

              {verificationStatus.phone === "pending" && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Enter OTP"
                    value={otpValues.phone}
                    onChange={(e) => setOtpValues({ ...otpValues, phone: e.target.value })}
                    className="flex-1 dark:bg-slate-900 dark:border-slate-600"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("phone")} size="sm">
                    Verify OTP
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          {onBack && (
            <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting}>
              Back
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
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
