import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOnboarding } from "../../hooks/useOnboarding";
import { CatalogFormData, CatalogProductFormData, catalogSchema, daysEnum } from "../../schemas/onboarding.schema";

interface Props {
  data?: CatalogFormData;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_GRADES: Record<string, string[]> = {
  "HR Coils": ["IS 2062 E250", "IS 2062 E350", "IS 2062 E500"],
  "TMT Bars": ["Fe500", "Fe500D", "Fe550"],
  Plates: ["Mild Steel", "High Strength", "Stainless Steel"],
  Structural: ["IPN", "IPE", "ISMB", "ISJB"],
};

const CATEGORIES = Object.keys(CATEGORY_GRADES);

export default function CatalogStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  // ✅ FIXED: Use hook instead of service
  const { data: onboardingData, isSaving, submitStep } = useOnboarding();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CatalogProductFormData[]>([]);
  const [newPrice, setNewPrice] = useState({ category: "", pricePerMT: 0 });

  const {
    handleSubmit,
    formState: { errors },
    register,
    setValue,
    watch,
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      catalog: [],
      priceFloors: [],
      logisticsPreference: {
        usePlatform3PL: true,
        selfPickupAllowed: true,
      },
    },
  });

  const priceFloors = watch("priceFloors");

  // ✅ FIXED: Load from hook data
  useEffect(() => {
    const catalogData = onboardingData?.catalog || data;

    if (catalogData) {
      console.log("🎯 CatalogStep received data:", catalogData);

      if (catalogData.catalog && catalogData.catalog.length > 0) {
        setSelectedCategories(catalogData.catalog.filter((c) => c.isSelected));
        setValue("catalog", catalogData.catalog);
      }

      if (catalogData.priceFloors && catalogData.priceFloors.length > 0) {
        setValue("priceFloors", catalogData.priceFloors);
      }

      if (catalogData.logisticsPreference) {
        setValue("logisticsPreference.usePlatform3PL", catalogData.logisticsPreference.usePlatform3PL);
        setValue("logisticsPreference.selfPickupAllowed", catalogData.logisticsPreference.selfPickupAllowed);
      }

      if (catalogData.plantLocations && catalogData.plantLocations.length > 0) {
        setValue("plantLocations", catalogData.plantLocations);
      }
    }
  }, [onboardingData?.catalog, data, setValue]);

  const handleAddCategory = (category: string) => {
    if (!selectedCategories.find((c) => c.category === category)) {
      const newCategory: CatalogProductFormData = {
        id: Date.now().toString(),
        category,
        isSelected: true,
        moqPerOrder: 100,
        stdLeadTime: 5,
        grades: [],
      };
      const updated = [...selectedCategories, newCategory];
      setSelectedCategories(updated);
      setValue("catalog", updated);
      toast({
        title: "Category Added",
        description: `${category} added to your catalog`,
      });
    }
  };

  const handleRemoveCategory = (category: string) => {
    const updated = selectedCategories.filter((c) => c.category !== category);
    setSelectedCategories(updated);
    setValue("catalog", updated);
  };

  const handleUpdateCategory = (category: string, field: keyof CatalogProductFormData, value: any) => {
    const updated = selectedCategories.map((c) => (c.category === category ? { ...c, [field]: value } : c));
    setSelectedCategories(updated);
    setValue("catalog", updated);
  };

  const handleAddGrade = (category: string, grade: string) => {
    const updated = selectedCategories.map((c) => {
      if (c.category === category && !c.grades.includes(grade)) {
        return { ...c, grades: [...c.grades, grade] };
      }
      return c;
    });
    setSelectedCategories(updated);
    setValue("catalog", updated);
  };

  const handleRemoveGrade = (category: string, grade: string) => {
    const updated = selectedCategories.map((c) => {
      if (c.category === category) {
        return { ...c, grades: c.grades.filter((g) => g !== grade) };
      }
      return c;
    });
    setSelectedCategories(updated);
    setValue("catalog", updated);
  };

  const handleAddPriceFloor = () => {
    if (!newPrice.category || newPrice.pricePerMT <= 0) {
      toast({
        title: "Invalid Price Floor",
        description: "Please fill all fields and ensure min < max",
        variant: "destructive",
      });
      return;
    }

    const updated = [...priceFloors, newPrice];
    setValue("priceFloors", updated);
    setNewPrice({ category: "", pricePerMT: 0 });
    toast({
      title: "Price Floor Added",
      description: `Price floor for ${newPrice.category} added`,
    });
  };

  const handleRemovePriceFloor = (index: number) => {
    const updated = priceFloors.filter((_, i) => i !== index);
    setValue("priceFloors", updated);
  };

  // ✅ FIXED: Use hook's submitStep instead of service
  const onSubmit = async (formData: CatalogFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedCategories.length === 0) {
        toast({
          title: "No Categories Selected",
          description: "Please select at least one category",
          variant: "destructive",
        });
        return;
      }

      const catalogData: CatalogFormData = {
        catalog: selectedCategories,
        priceFloors: formData.priceFloors,
        plantLocations: formData.plantLocations,
        logisticsPreference: formData.logisticsPreference,
      };

      console.log("📤 Saving catalog data:", catalogData);
      // ✅ Use hook instead of service
      await submitStep("catalog", catalogData);

      toast({
        title: "Success",
        description: "Catalog and pricing updated successfully",
      });

      onNext();
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save catalog",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Categories Section */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">Product Categories</h3>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.some((c) => c.category === cat);
              return (
                <Button
                  key={cat}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => (isSelected ? handleRemoveCategory(cat) : handleAddCategory(cat))}
                  size="sm"
                  className="h-8 text-xs"
                  disabled={isSubmitting || isSaving}
                >
                  {cat} {isSelected && "✓"}
                </Button>
              );
            })}
          </div>

          {selectedCategories.length > 0 && (
            <div className="space-y-2">
              {selectedCategories.map((cat) => (
                <div key={cat.id || cat.category} className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm text-foreground">{cat.category}</h3>
                    <Button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.category)}
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      disabled={isSubmitting || isSaving}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORY_GRADES[cat.category]?.map((grade) => {
                      const isGradeSelected = cat.grades.includes(grade);
                      return (
                        <Button
                          key={grade}
                          type="button"
                          size="sm"
                          variant={isGradeSelected ? "default" : "outline"}
                          onClick={() => (isGradeSelected ? handleRemoveGrade(cat.category, grade) : handleAddGrade(cat.category, grade))}
                          className="h-7 text-xs px-2"
                          disabled={isSubmitting || isSaving}
                        >
                          {grade} {isGradeSelected && "✓"}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">MOQ (MT)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="100"
                        value={cat.moqPerOrder}
                        onChange={(e) => handleUpdateCategory(cat.category, "moqPerOrder", parseInt(e.target.value))}
                        className="mt-1 h-8 text-sm"
                        disabled={isSubmitting || isSaving}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Lead Time (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="7"
                        value={cat.stdLeadTime}
                        onChange={(e) => handleUpdateCategory(cat.category, "stdLeadTime", parseInt(e.target.value))}
                        className="mt-1 h-8 text-sm"
                        disabled={isSubmitting || isSaving}
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Availability</Label>

                    <div className="flex flex-wrap gap-1.5">
                      {daysEnum.options.map((day) => {
                        const isSelected = cat.availability?.includes(day);

                        return (
                          <Button
                            key={day}
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => {
                              const updated = isSelected ? cat.availability.filter((d) => d !== day) : [...(cat.availability || []), day];
                              handleUpdateCategory(cat.category, "availability", updated);
                            }}
                            className="h-7 text-xs px-2"
                            disabled={isSubmitting || isSaving}
                          >
                            {day} {isSelected && "✓"}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCategories.length === 0 && <p className="text-xs text-warning">⚠️ Select at least one category to continue</p>}
        </div>

        {/* Plant Locations Section */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="text-base font-semibold text-foreground">Plant Locations</h3>

          <div className="flex gap-2 items-center">
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs"
              disabled={isSubmitting || isSaving}
              onClick={() => {
                const curr = watch("plantLocations") || [];
                const dummy = {
                  id: Date.now().toString(),
                  name: `Plant ${curr.length + 1}`,
                  city: "Mumbai",
                  state: "MH",
                  pincode: "400001",
                  country: "India",
                  isActive: true,
                };
                setValue("plantLocations", [...curr, dummy], { shouldValidate: true, shouldDirty: true });
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Dummy Plant
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              disabled={isSubmitting || isSaving}
              onClick={() => {
                setValue("plantLocations", [], { shouldValidate: true, shouldDirty: true });
              }}
            >
              Clear Plants
            </Button>
          </div>

          {/* visual list */}
          {watch("plantLocations")?.length > 0 ? (
            <div className="space-y-1 pt-2">
              {watch("plantLocations").map((p: any, index: number) => (
                <div key={p.id ?? index} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="text-xs">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground">
                      {p.city}, {p.state} {p.country ? `• ${p.country}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive"
                      disabled={isSubmitting || isSaving}
                      onClick={() => {
                        const updated = (watch("plantLocations") || []).filter((_: any, i: number) => i !== index);
                        setValue("plantLocations", updated, { shouldValidate: true, shouldDirty: true });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pt-2">No plant locations added yet.</p>
          )}

          {/* raw debug JSON (useful while testing) */}
          <pre className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-md overflow-auto">
            {JSON.stringify(watch("plantLocations") || [], null, 2)}
          </pre>
        </div>

        {/* Price Floors Section */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="text-base font-semibold text-foreground">Price Floors (Optional)</h3>

          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <Label className="text-xs">Category</Label>
              <select
                className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md h-8"
                value={newPrice.category}
                onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })}
                disabled={isSubmitting || isSaving}
              >
                <option value="">Select</option>
                {selectedCategories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <Label className="text-xs">Price (₹/MT)</Label>
              <Input
                type="number"
                min="0"
                placeholder="45000"
                value={newPrice.pricePerMT}
                onChange={(e) => setNewPrice({ ...newPrice, pricePerMT: parseFloat(e.target.value) })}
                className="mt-1 h-8 text-sm"
                disabled={isSubmitting || isSaving}
              />
            </div>

            <div className="col-span-2">
              <Button type="button" onClick={handleAddPriceFloor} size="sm" className="w-full h-8 text-xs" disabled={isSubmitting || isSaving}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {priceFloors.length > 0 && (
            <div className="space-y-1">
              {priceFloors.map((pf, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                  <p className="text-xs font-medium">
                    {pf.category}: ₹{pf.pricePerMT} per MT
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleRemovePriceFloor(index)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-destructive"
                    disabled={isSubmitting || isSaving}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logistics Section */}
        <div className="space-y-2 border-t pt-3">
          <h3 className="text-base font-semibold text-foreground">Logistics Preferences</h3>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer">
              <input
                type="checkbox"
                id="usePlatform3PL"
                {...register("logisticsPreference.usePlatform3PL")}
                className="w-4 h-4"
                disabled={isSubmitting || isSaving}
              />
              <Label htmlFor="usePlatform3PL" className="cursor-pointer flex-1 font-medium text-gray-900 dark:text-white">
                Use Platform 3PL Services
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">Allow platform to arrange logistics and shipping</p>
              </Label>
            </div>

            <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer">
              <input
                type="checkbox"
                id="selfPickup"
                {...register("logisticsPreference.selfPickupAllowed")}
                className="w-4 h-4"
                disabled={isSubmitting || isSaving}
              />
              <Label htmlFor="selfPickup" className="cursor-pointer flex-1 font-medium text-gray-900 dark:text-white">
                Allow Self Pickup
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">Buyers can arrange their own pickup from your location</p>
              </Label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Button type="button" onClick={onBack} variant="outline" disabled={isSubmitting || isSaving} size="sm" className="h-9 text-sm">
            ← Back
          </Button>
          <Button type="submit" disabled={isSubmitting || isSaving} size="sm" className="h-9 text-sm">
            {isSubmitting || isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save & Continue →</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
