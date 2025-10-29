import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import onboardingService from "../../services/onboarding.service";
import { OrgKYCData } from "../../types/onboarding.types";

const schema = z.object({
  legalName: z.string().min(2, "Legal name is required"),
  tradeName: z.string().optional(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z0-9D]{1}$/,
      "Invalid GSTIN format"
    ),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  cin: z.string().optional(),
  registeredAddress: z.string().min(10, "Address is required"),
  businessType: z.string().min(2, "Business type is required"),
  incorporationDate: z.string().min(1, "Incorporation date is required"),
  primaryContact: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    mobile: z.string().regex(/^[0-9]{10}$/, "Invalid mobile number"),
    role: z.string().optional(),
  }),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data?: OrgKYCData;
  onNext: (data: any) => void;
  onBack?: () => void;
}

export const OrgKYCStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [gstinFetching, setGstinFetching] = useState(false);
  const [gstinData, setGstinData] = useState(null);
  const [plants, setPlants] = useState(
    data?.plantLocations?.map(
      (p) => `${p.street}, ${p.city}, ${p.state} - ${p.pin}`
    ) || []
  );
  const [newPlant, setNewPlant] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          legalName: data.legalName,
          tradeName: data.tradeName,
          gstin: data.gstin,
          pan: data.pan,
          cin: data.cin,
          registeredAddress: data.registeredAddress,
          businessType: data.businessType,
          incorporationDate: data.incorporationDate,
          primaryContact: data.primaryContact,
        }
      : undefined,
  });

  // ✅ NEW: Pre-fill form when data prop changes
  useEffect(() => {
    if (data) {
      setValue("legalName", data.legalName);
      setValue("tradeName", data.tradeName || "");
      setValue("gstin", data.gstin);
      setValue("pan", data.pan);
      setValue("cin", data.cin || "");
      setValue("registeredAddress", data.registeredAddress);
      setValue("businessType", data.businessType);
      setValue("incorporationDate", data.incorporationDate);
      setValue("primaryContact", data.primaryContact);

      if (data.plantLocations) {
        setPlants(
          data.plantLocations.map(
            (p) => `${p.street}, ${p.city}, ${p.state} - ${p.pin}`
          )
        );
      }
    }
  }, [data, setValue]);

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

  // ✅ MODIFIED: Now calls API service instead of just calling onNext
  const onSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);

      // Parse plant locations
      const plantLocations = plants.map((p) => {
        const parts = p.split(",").map((part) => part.trim());
        return {
          street: parts[0] || "",
          city: parts[1] || "",
          state: parts[2]?.split("-")[0]?.trim() || "",
          pin: parts[2]?.split("-")[1]?.trim() || "",
        };
      });

      const orgKycData: OrgKYCData = {
        legalName: formData.legalName,
        tradeName: formData.tradeName,
        gstin: formData.gstin,
        pan: formData.pan,
        cin: formData.cin,
        registeredAddress: formData.registeredAddress,
        businessType: formData.businessType,
        incorporationDate: formData.incorporationDate,
        plantLocations,
        primaryContact: {
          name: formData.primaryContact.name,
          email: formData.primaryContact.email,
          mobile: formData.primaryContact.mobile,
          role: formData.primaryContact.role || "CEO",
        },
      };

      // ✅ NEW: Call API service to save to backend
      const response = await onboardingService.updateOrgKYC(orgKycData);

      toast({
        title: "Success",
        description: "Organization KYC saved successfully",
      });

      // ✅ NEW: Pass API response to parent (contains completedSteps, etc)
      onNext(response);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Legal Name and Trade Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Legal Name *</Label>
            <Input
              {...register("legalName")}
              placeholder="Legal company name"
            />
            {errors.legalName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.legalName.message}
              </p>
            )}
          </div>
          <div>
            <Label>Trade Name</Label>
            <Input
              {...register("tradeName")}
              placeholder="Trade name (optional)"
            />
          </div>
        </div>

        {/* GSTIN and PAN */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>GSTIN *</Label>
            <div className="flex gap-2">
              <Input {...register("gstin")} placeholder="GSTIN" className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchGSTIN}
                disabled={gstinFetching}
              >
                {gstinFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
              </Button>
            </div>
            {errors.gstin && (
              <p className="text-red-500 text-sm mt-1">{errors.gstin.message}</p>
            )}
            {gstinData && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                {(gstinData as any).legalName}
              </Badge>
            )}
          </div>

          <div>
            <Label>PAN *</Label>
            <Input {...register("pan")} placeholder="PAN" />
            {errors.pan && (
              <p className="text-red-500 text-sm mt-1">{errors.pan.message}</p>
            )}
          </div>
        </div>

        {/* CIN and Business Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>CIN (Optional)</Label>
            <Input {...register("cin")} placeholder="CIN" />
          </div>

          <div>
            <Label>Business Type *</Label>
            <select
              {...register("businessType")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select business type</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trading">Trading</option>
              <option value="Distribution">Distribution</option>
              <option value="Service">Service</option>
            </select>
            {errors.businessType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.businessType.message}
              </p>
            )}
          </div>
        </div>

        {/* Incorporation Date and Address */}
        <div>
          <Label>Incorporation Date *</Label>
          <Input
            type="date"
            {...register("incorporationDate")}
          />
          {errors.incorporationDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.incorporationDate.message}
            </p>
          )}
        </div>

        <div>
          <Label>Registered Address *</Label>
          <Input
            {...register("registeredAddress")}
            placeholder="Full registered address"
          />
          {errors.registeredAddress && (
            <p className="text-red-500 text-sm mt-1">
              {errors.registeredAddress.message}
            </p>
          )}
        </div>

        {/* Plant Locations */}
        <Card className="p-4 bg-gray-50">
          <Label>Plant Locations</Label>
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={newPlant}
                onChange={(e) => setNewPlant(e.target.value)}
                placeholder="Street, City, State - Pincode"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddPlant}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {plants.map((plant, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-sm">{plant}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePlant(index)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Primary Contact */}
        <Card className="p-4 bg-gray-50">
          <Label className="font-semibold">Primary Contact</Label>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Name *</Label>
              <Input {...register("primaryContact.name")} />
              {errors.primaryContact?.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.primaryContact.name.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm">Role</Label>
              <Input {...register("primaryContact.role")} placeholder="CEO, Director, etc." />
            </div>
            <div>
              <Label className="text-sm">Email *</Label>
              <Input type="email" {...register("primaryContact.email")} />
              {errors.primaryContact?.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.primaryContact.email.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm">Mobile *</Label>
              <Input {...register("primaryContact.mobile")} placeholder="10-digit number" />
              {errors.primaryContact?.mobile && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.primaryContact.mobile.message}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </Button>
      </div>
    </form>
  );
};

export default OrgKYCStep;