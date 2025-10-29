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
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">1</span>
          </div>
          Business Information
        </h3>

        {/* Legal Name and Trade Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="legalName">Legal Name *</Label>
            <Input
              id="legalName"
              {...register("legalName")}
              placeholder="e.g., ABC Steel Industries Pvt Ltd"
              className="mt-1"
            />
            {errors.legalName && (
              <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                {errors.legalName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="tradeName">Trade Name</Label>
            <Input
              id="tradeName"
              {...register("tradeName")}
              placeholder="e.g., ABC Steel (Optional)"
              className="mt-1"
            />
          </div>
        </div>

        {/* GSTIN and PAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="gstin">GSTIN *</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                id="gstin"
                {...register("gstin")} 
                placeholder="e.g., 27AABCT1234H1Z0" 
                className="flex-1 uppercase" 
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchGSTIN}
                disabled={gstinFetching}
              >
                {gstinFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
            {errors.gstin && (
              <p className="text-destructive text-sm mt-1">{errors.gstin.message}</p>
            )}
            {gstinData && (
              <Badge className="mt-2 bg-success/10 text-success border-success/20">
                <Check className="h-3 w-3 mr-1" />
                Verified: {(gstinData as any).legalName}
              </Badge>
            )}
          </div>

          <div>
            <Label htmlFor="pan">PAN *</Label>
            <Input 
              id="pan"
              {...register("pan")} 
              placeholder="e.g., AAABP1234Q" 
              className="mt-1 uppercase"
            />
            {errors.pan && (
              <p className="text-destructive text-sm mt-1">{errors.pan.message}</p>
            )}
          </div>
        </div>

        {/* CIN and Business Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="cin">CIN (Optional)</Label>
            <Input 
              id="cin"
              {...register("cin")} 
              placeholder="e.g., U27200WB2015PTC213456" 
              className="mt-1 uppercase"
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type *</Label>
            <select
              id="businessType"
              {...register("businessType")}
              className="w-full px-3 py-2 border rounded-md bg-background mt-1"
            >
              <option value="">Select business type</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Trading">Trading</option>
              <option value="Distribution">Distribution</option>
              <option value="Service">Service</option>
            </select>
            {errors.businessType && (
              <p className="text-destructive text-sm mt-1">
                {errors.businessType.message}
              </p>
            )}
          </div>
        </div>

        {/* Incorporation Date and Address */}
        <div className="mb-4">
          <Label htmlFor="incorporationDate">Incorporation Date *</Label>
          <Input
            id="incorporationDate"
            type="date"
            {...register("incorporationDate")}
            className="mt-1"
          />
          {errors.incorporationDate && (
            <p className="text-destructive text-sm mt-1">
              {errors.incorporationDate.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <Label htmlFor="registeredAddress">Registered Address *</Label>
          <Input
            id="registeredAddress"
            {...register("registeredAddress")}
            placeholder="e.g., 123 Industrial Area, Mumbai, Maharashtra 400080"
            className="mt-1"
          />
          {errors.registeredAddress && (
            <p className="text-destructive text-sm mt-1">
              {errors.registeredAddress.message}
            </p>
          )}
        </div>
      </Card>

      {/* Plant Locations */}
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">2</span>
          </div>
          Plant Locations
        </h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newPlant}
              onChange={(e) => setNewPlant(e.target.value)}
              placeholder="e.g., Plot 5 MIDC, Pune, Maharashtra - 411001"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPlant())}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddPlant}
              disabled={!newPlant.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {plants.length > 0 && (
            <div className="space-y-2 mt-4">
              {plants.map((plant, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
                  <span className="text-sm text-foreground">{plant}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePlant(index)}
                    className="hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {plants.length === 0 && (
            <p className="text-sm text-muted-foreground italic mt-2">
              Add at least one plant location
            </p>
          )}
        </div>
      </Card>

      {/* Primary Contact */}
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">3</span>
          </div>
          Primary Contact Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactName" className="text-sm font-medium">Name *</Label>
            <Input 
              id="contactName"
              {...register("primaryContact.name")} 
              placeholder="e.g., Rajesh Kumar"
              className="mt-1"
            />
            {errors.primaryContact?.name && (
              <p className="text-destructive text-sm mt-1">
                {errors.primaryContact.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="contactRole" className="text-sm font-medium">Role</Label>
            <Input 
              id="contactRole"
              {...register("primaryContact.role")} 
              placeholder="e.g., CEO, Director, Manager"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail" className="text-sm font-medium">Email *</Label>
            <Input 
              id="contactEmail"
              type="email" 
              {...register("primaryContact.email")} 
              placeholder="e.g., rajesh@company.com"
              className="mt-1"
            />
            {errors.primaryContact?.email && (
              <p className="text-destructive text-sm mt-1">
                {errors.primaryContact.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="contactMobile" className="text-sm font-medium">Mobile *</Label>
            <Input 
              id="contactMobile"
              {...register("primaryContact.mobile")} 
              placeholder="e.g., 9876543210"
              className="mt-1"
              maxLength={10}
            />
            {errors.primaryContact?.mobile && (
              <p className="text-destructive text-sm mt-1">
                {errors.primaryContact.mobile.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} size="lg">
            Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[200px]"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default OrgKYCStep;