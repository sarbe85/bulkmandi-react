import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';
import { CatalogData, CatalogItem, PriceFloor } from '../../types/onboarding.types';

const catalogSchema = z.object({
  catalog: z.array(
    z.object({
      category: z.string().min(1, 'Category name is required'),
      isSelected: z.boolean(),
      grades: z.array(z.string()).optional(),
      moqPerOrder: z.number().min(1, 'MOQ must be at least 1'),
      stdLeadTime: z.number().min(1, 'Lead time must be at least 1 day'),
    })
  ),
  priceFloors: z.array(
    z.object({
      category: z.string().min(1, 'Category is required'),
      pricePerMT: z.number().min(0, 'Price must be greater than 0'),
    })
  ),
  usePlatform3PL: z.boolean(),
  selfPickupAllowed: z.boolean(),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

interface Props {
  data?: CatalogData;
  onNext: (data: any) => void;
  onBack: () => void;
}

// ✅ DEFAULT CATEGORIES - Can be customized
const DEFAULT_CATEGORIES = [
  'Hot Rolled Coils',
  'Cold Rolled Coils',
  'Galvanized Sheets',
  'Stainless Steel Plates',
  'Aluminum Sheets',
];

export default function CatalogStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CatalogItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      catalog: [],
      priceFloors: [],
      usePlatform3PL: true,
      selfPickupAllowed: false,
    },
  });

  const usePlatform3PL = watch('usePlatform3PL');
  const selfPickupAllowed = watch('selfPickupAllowed');

  // ✅ Pre-populate data if available
  useEffect(() => {
    if (data) {
      console.log('🎯 CatalogStep received data:', data);
      if (data.catalog && data.catalog.length > 0) {
        setSelectedCategories(data.catalog.filter((c) => c.isSelected));
        setValue('catalog', data.catalog);
      }
      if (data.priceFloors && data.priceFloors.length > 0) {
        setValue('priceFloors', data.priceFloors);
      }
      if (data.logisticsPreference) {
        setValue('usePlatform3PL', data.logisticsPreference.usePlatform3PL);
        setValue('selfPickupAllowed', data.logisticsPreference.selfPickupAllowed);
      }
    }
  }, [data, setValue]);

  // ✅ ADD CATEGORY
  const addCategory = (categoryName: string) => {
    const exists = selectedCategories.some((c) => c.category === categoryName);
    if (exists) {
      toast({
        title: 'Already Added',
        description: `${categoryName} is already in your catalog`,
        variant: 'destructive',
      });
      return;
    }

    const newCategory: CatalogItem = {
      category: categoryName,
      isSelected: true,
      grades: [],
      moqPerOrder: 1,
      stdLeadTime: 7,
    };

    const updated = [...selectedCategories, newCategory];
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  // ✅ UPDATE CATEGORY FIELD
  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...selectedCategories];
    if (field === 'grades') {
      updated[index].grades = value.split(',').map((g: string) => g.trim());
    } else {
      (updated[index] as any)[field] = value;
    }
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  // ✅ REMOVE CATEGORY
  const removeCategory = (index: number) => {
    const updated = selectedCategories.filter((_, i) => i !== index);
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  // ✅ FORM SUBMIT
  const onSubmit = async (formData: CatalogFormData) => {
    try {
      if (selectedCategories.length === 0) {
        toast({
          title: 'No Categories',
          description: 'Please add at least one product category',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);

      // ✅ BUILD PRICE FLOORS - Filter to only include valid entries with required fields
      const validPriceFloors: PriceFloor[] = formData.priceFloors
        .filter(
          (pf) => pf.category && typeof pf.pricePerMT === 'number' && pf.pricePerMT >= 0
        )
        .map((pf) => ({
          category: pf.category,
          pricePerMT: pf.pricePerMT,
        }));

      // ✅ BUILD CATALOG DATA
      const catalogData: CatalogData = {
        catalog: selectedCategories,
        priceFloors: validPriceFloors.length > 0 ? validPriceFloors : undefined,
        logisticsPreference: {
          usePlatform3PL: usePlatform3PL,
          selfPickupAllowed: selfPickupAllowed,
        },
      };

      // ✅ API CALL: PUT /organizations/my-organization/onboarding/catalog
      const response = await onboardingService.updateCatalog(catalogData);

      toast({
        title: 'Success',
        description: 'Catalog and pricing saved successfully',
      });

      onNext(response);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save catalog',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Catalog & Pricing Configuration
        </h2>
        <p className="text-gray-600">
          Select the product categories you offer, specify grades, set pricing,
          and configure MOQ and lead times
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ========== CATEGORIES SECTION ========== */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Product Categories</h3>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {DEFAULT_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                type="button"
                onClick={() => addCategory(cat)}
                variant="outline"
                size="sm"
                disabled={
                  isSubmitting ||
                  selectedCategories.some((c) => c.category === cat)
                }
              >
                <Plus className="w-4 h-4 mr-1" />
                {cat}
              </Button>
            ))}
          </div>

          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="space-y-4">
              {selectedCategories.map((category, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">
                      {category.category}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => removeCategory(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Grades */}
                  <div>
                    <Label className="text-sm font-medium">
                      Grades/Variants (comma-separated)
                    </Label>
                    <Input
                      placeholder="e.g., Grade A, Grade B, Grade C"
                      value={category.grades?.join(', ') || ''}
                      onChange={(e) =>
                        updateCategory(index, 'grades', e.target.value)
                      }
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                  </div>

                  {/* MOQ and Lead Time in a row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">
                        MOQ Per Order (units)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={category.moqPerOrder || 1}
                        onChange={(e) =>
                          updateCategory(
                            index,
                            'moqPerOrder',
                            parseInt(e.target.value)
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Std Lead Time (days)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={category.stdLeadTime || 7}
                        onChange={(e) =>
                          updateCategory(
                            index,
                            'stdLeadTime',
                            parseInt(e.target.value)
                          )
                        }
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCategories.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                ℹ️ Click on a category above to add it to your catalog, or you
                can manually enter a custom category
              </p>
            </div>
          )}
        </div>

        {/* ========== PRICING SECTION ========== */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Price Floors</h3>
          <p className="text-gray-600 text-sm">
            Set minimum price per metric ton for each category
          </p>

          {selectedCategories.map((category, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Label className="text-sm font-medium">{category.category}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price per MT"
                  defaultValue={
                    data?.priceFloors?.find((p) => p.category === category.category)
                      ?.pricePerMT || 0
                  }
                  {...register(`priceFloors.${index}.pricePerMT`, {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <input
                type="hidden"
                {...register(`priceFloors.${index}.category`)}
                value={category.category}
              />
            </div>
          ))}
        </div>

        {/* ========== LOGISTICS PREFERENCE SECTION ========== */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900">Logistics Preference</h3>

          {/* Platform 3PL */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="usePlatform3PL"
              checked={usePlatform3PL}
              onChange={(e) => setValue('usePlatform3PL', e.target.checked)}
              disabled={isSubmitting}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="usePlatform3PL" className="font-medium">
                Use Platform 3PL Partners
              </Label>
              <p className="text-gray-600 text-sm mt-1">
                Let our verified logistics partners handle delivery with
                real-time tracking
              </p>
            </div>
          </div>

          {/* Self Pickup */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="selfPickupAllowed"
              checked={selfPickupAllowed}
              onChange={(e) => setValue('selfPickupAllowed', e.target.checked)}
              disabled={isSubmitting}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="selfPickupAllowed" className="font-medium">
                Allow Self Pickup
              </Label>
              <p className="text-gray-600 text-sm mt-1">
                Buyers can arrange their own transportation and pickup from your
                location
              </p>
            </div>
          </div>
        </div>

        {/* ========== FORM ACTIONS ========== */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>

          <Button type="submit" disabled={isSubmitting || selectedCategories.length === 0}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}