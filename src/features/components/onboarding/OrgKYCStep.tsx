import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Mail, MapPin, Phone, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { OrgKycFormData, orgKycSchema, PlantLocation } from "../../shared/schemas/onboarding.schema";
import onboardingService from "../../shared/services/onboarding.service";
import { useOnboarding } from "../../shared/hooks/useOnboarding";

interface Props {
  data?: OrgKycFormData;
  onNext: () => void;
  onBack?: () => void;
}

export default function OrgKYCStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const { getCurrentUser } = useAuth();
  const { fetchData } = useOnboarding();

  const [gstinFetching, setGstinFetching] = useState(false);
  const [gstinData, setGstinData] = useState<any>(null);
  // const [plants, setPlants] = useState<any>([]);
  const [plants, setPlants] = useState<PlantLocation[]>([]);
  const [newPlant, setNewPlant] = useState<PlantLocation>({
    name: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isActive: true,
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrgKycFormData>({
    resolver: zodResolver(orgKycSchema),
    defaultValues: {
      primaryContact: { role: "CEO" },
    },
  });

  // Pre-fill form when data changes
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
        // const formattedLocations = data.plantLocations.map((loc: any) => `${loc.Street}, ${loc.City}, ${loc.State} - ${loc.Pincode}`);
        setPlants(data.plantLocations);
      }
    }
  }, [data]);

  // GSTIN fetch handler to load business info
  const handleFetchGSTIN = async () => {
    const gstin = watch("gstin");
    if (!gstin) return;
    setGstinFetching(true);
    try {
      // TODO: Implement fetchGSTIN in shared service
      toast({ title: "Info", description: "GSTIN fetch not yet implemented", variant: "default" });
      // const response = await onboardingService.fetchGSTIN(gstin);
      // setGstinData(response);
      // setValue("legalName", response.legalName);
      // if (response.tradeName) setValue("tradeName", response.tradeName);
      // toast({
      //   title: "GSTIN Verified",
      //   description: "Business details fetched successfully.",
      // });
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

  const fetchSuggestions = (query: string) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      // TODO: Implement fetchPostOfficeDetails in shared service
      setSuggestions([]);
      // const results = await onboardingService.fetchPostOfficeDetails(query);
      // setSuggestions(results);
      setLoadingSuggestions(false);
    }, 400);
  };

  const handleInputChange = (value: string) => {
    setNewPlant({
      ...newPlant,
      name: value, // plant name search input
    });
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = (sug: any) => {
    setNewPlant({
      ...newPlant,
      name: sug.Name,
      city: sug.District,
      state: sug.State,
      pincode: sug.Pincode,
    });
    setSuggestions([]);
  };

  const handleAddPlant = () => {
    if (newPlant && newPlant.name && newPlant.city && newPlant.state) {
      setPlants([...plants, newPlant]);
      setNewPlant({
        name: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isActive: true,
      });
      setSuggestions([]);
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
    setVerificationStatus((prev) => ({ ...prev, [type]: "sending" }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "OTP Sent",
        description: `OTP sent to your ${type}`,
      });
      setVerificationStatus((prev) => ({ ...prev, [type]: "pending" }));
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
      setVerificationStatus((prev) => ({ ...prev, [type]: "verified" }));
      toast({
        title: "Verified",
        description: `${type} verified successfully`,
      });
      setOtpValues((prev) => ({ ...prev, [type]: "" }));
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || `Could not verify OTP`,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (formData: OrgKycFormData) => {
    try {
      if (!data) {
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
      }
      setIsSubmitting(true);

      const plantLocations = plants.map((plant) => ({
        street: plant.name || "", // ✅ Access object property
        city: plant.city || "", // ✅ Access object property
        state: plant.state || "", // ✅ Access object property
        pincode: plant.pincode || "", // ✅ Access object property
        country: plant.country || "India",
      }));

      const orgKycData = {
        legalName: formData.legalName || '',
        tradeName: formData.tradeName,
        gstin: formData.gstin || '',
        pan: formData.pan || '',
        cin: formData.cin,
        registeredAddress: formData.registeredAddress || '',
        businessType: formData.businessType || '',
        incorporationDate: formData.incorporationDate || '',
        plantLocations: plantLocations as any,
        primaryContact: {
          name: formData.primaryContact?.name || '',
          email: formData.primaryContact?.email || '',
          mobile: formData.primaryContact?.mobile || '',
          role: formData.primaryContact?.role || "CEO",
        },
      } as OrgKycFormData;
      await onboardingService.updateOrgKyc(orgKycData as any);
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Organization KYC</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Provide your organization details and business information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Legal Name & Trade Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="legalName" className="text-sm text-gray-700 dark:text-gray-300">
              Legal Name *
            </Label>
            <Input
              id="legalName"
              placeholder="Enter legal name"
              {...register("legalName")}
              className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
            />
            {errors.legalName && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.legalName.message}</p>}
          </div>
          <div>
            <Label htmlFor="tradeName" className="text-sm text-gray-700 dark:text-gray-300">
              Trade Name
            </Label>
            <Input
              id="tradeName"
              placeholder="Enter trade name"
              {...register("tradeName")}
              className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
            />
          </div>
        </div>

        {/* GSTIN, PAN, CIN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="gstin" className="text-sm text-gray-700 dark:text-gray-300">
              GSTIN *
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="gstin"
                placeholder="Enter GSTIN"
                {...register("gstin", {
                  onChange: (e) => {
                    const val = e.target.value.toUpperCase();
                    setValue("gstin", val, { shouldValidate: true });
                  },
                })}
                className="text-sm dark:bg-slate-900 dark:border-slate-600 flex-1"
              />
              <Button
                type="button"
                onClick={handleFetchGSTIN}
                disabled={gstinFetching}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap"
              >
                {gstinFetching ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            {errors.gstin && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.gstin.message}</p>}
            {gstinData && (
              <Badge className="mt-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Verified: {gstinData?.legalName || ""}
              </Badge>
            )}
          </div>
          <div>
            <Label htmlFor="pan" className="text-sm text-gray-700 dark:text-gray-300">
              PAN *
            </Label>
            <Input
              id="pan"
              placeholder="Enter PAN"
              {...register("pan", {
                onChange: (e) => {
                  const val = e.target.value.toUpperCase();
                  setValue("pan", val, { shouldValidate: true });
                },
              })}
              className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
            />
            {errors.pan && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.pan.message}</p>}
          </div>
          <div>
            <Label htmlFor="cin" className="text-sm text-gray-700 dark:text-gray-300">
              CIN (Optional)
            </Label>
            <Input
              id="cin"
              placeholder="Enter CIN"
              {...register("cin", {
                onChange: (e) => {
                  const val = e.target.value.toUpperCase();
                  setValue("cin", val, { shouldValidate: true });
                },
              })}
              className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
            />
          </div>
        </div>

        {/* Registered Address */}
        <div>
          <Label htmlFor="registeredAddress" className="text-sm text-gray-700 dark:text-gray-300">
            Registered Address *
          </Label>
          <Input
            id="registeredAddress"
            placeholder="Enter complete registered address"
            {...register("registeredAddress")}
            className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
          />
          {errors.registeredAddress && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.registeredAddress.message}</p>}
        </div>

        {/* Business Type & Incorporation Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessType" className="text-sm text-gray-700 dark:text-gray-300">
              Business Type *
            </Label>
            <select
              id="businessType"
              {...register("businessType")}
              className="w-full mt-1 px-3 py-2 text-sm border rounded-md dark:bg-slate-900 dark:border-slate-600 dark:text-gray-200"
            >
              <option value="">Select business type</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trading">Trading</option>
              <option value="Distribution">Distribution</option>
              <option value="Service">Service</option>
            </select>
            {errors.businessType && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.businessType.message}</p>}
          </div>
          <div>
            <Label htmlFor="incorporationDate" className="text-sm text-gray-700 dark:text-gray-300">
              Incorporation Date *
            </Label>
            <Input
              id="incorporationDate"
              type="date"
              {...register("incorporationDate")}
              className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
            />
            {errors.incorporationDate && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.incorporationDate.message}</p>}
          </div>
        </div>

        {/* Plant Locations */}
        <Card className="p-5 border border-gray-200 dark:border-slate-700 shadow-sm relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Plant Locations</h3>
          </div>

          {/* Full width flex container for input and button */}
          <div className="relative flex w-full gap-2">
            {/* Input wrapper flex-grow to fill space */}
            <div className="relative flex-grow">
              <Input
                placeholder="e.g., Plot 5, MIDC, Pune, Maharashtra - 411001"
                value={newPlant.name}
                onChange={(e) => handleInputChange(e.target.value)}
                className="pr-10 text-sm dark:bg-slate-900 dark:border-slate-600 w-full"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                aria-haspopup="listbox"
                role="combobox"
              />
              {loadingSuggestions && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>

            <Button type="button" onClick={handleAddPlant} disabled={!newPlant.name?.trim()} variant="outline" size="sm">
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          {/* Suggestion menu - width same as input box only */}
          {suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 mt-1 max-h-48 overflow-auto rounded-md w-[calc(100%-4rem)] left-0"
              style={{ maxWidth: "100%" }}
            >
              {suggestions.map((sug, index) => (
                <li
                  key={index}
                  role="option"
                  tabIndex={-1}
                  className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-slate-700"
                  onClick={() => handleSelectSuggestion(sug)}
                >
                  {sug.Name}, {sug.District}, {sug.State} - {sug.Pincode}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {plants.map((plant, i) => (
              <Badge key={i} variant="outline" className="flex items-center gap-1 cursor-default">
                <MapPin className="w-4 h-4" />
                {plant.name}, {plant.city}, {plant.state} - {plant.pincode}
                <X className="cursor-pointer" size={16} onClick={() => handleRemovePlant(i)} />
              </Badge>
            ))}
          </div>
        </Card>

        {/* Primary Contact */}
        <Card className="p-5 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Primary Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryContactName" className="text-sm text-gray-700 dark:text-gray-300">
                Name *
              </Label>
              <Input
                id="primaryContactName"
                placeholder="Enter full name"
                {...register("primaryContact.name")}
                className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
              {errors.primaryContact?.name && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.primaryContact.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="primaryContactRole" className="text-sm text-gray-700 dark:text-gray-300">
                Role *
              </Label>
              <Input
                id="primaryContactRole"
                placeholder="Enter role"
                {...register("primaryContact.role")}
                className="mt-1 text-sm dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="primaryContactEmail" className="text-sm text-gray-700 dark:text-gray-300">
                Email Address *
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryContactEmail"
                  type="email"
                  placeholder="Enter email"
                  {...register("primaryContact.email")}
                  className="flex-1 text-sm dark:bg-slate-900 dark:border-slate-600"
                />
                {verificationStatus.email === "verified" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs h-fit whitespace-nowrap flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSendOTP("email")}
                    disabled={verificationStatus.email === "sending"}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    {verificationStatus.email === "sending" ? "Sending..." : "Verify"}
                  </Button>
                )}
              </div>
              {verificationStatus.email === "pending" && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Enter OTP"
                    value={otpValues.email}
                    onChange={(e) => setOtpValues({ ...otpValues, email: e.target.value })}
                    className="flex-1 text-sm dark:bg-slate-900 dark:border-slate-600"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("email")} size="sm" className="text-xs">
                    Verify OTP
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="primaryContactMobile" className="text-sm text-gray-700 dark:text-gray-300">
                Mobile Number *
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primaryContactMobile"
                  placeholder="Enter mobile number"
                  {...register("primaryContact.mobile")}
                  className="flex-1 text-sm dark:bg-slate-900 dark:border-slate-600"
                />
                {verificationStatus.phone === "verified" ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs h-fit whitespace-nowrap flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSendOTP("phone")}
                    disabled={verificationStatus.phone === "sending"}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    {verificationStatus.phone === "sending" ? "Sending..." : "Verify"}
                  </Button>
                )}
              </div>
              {verificationStatus.phone === "pending" && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Enter OTP"
                    value={otpValues.phone}
                    onChange={(e) => setOtpValues({ ...otpValues, phone: e.target.value })}
                    className="flex-1 text-sm dark:bg-slate-900 dark:border-slate-600"
                  />
                  <Button type="button" onClick={() => handleVerifyOTP("phone")} size="sm" className="text-xs">
                    Verify OTP
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end mt-6">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
