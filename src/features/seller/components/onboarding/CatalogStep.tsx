import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import onboardingService from '../../services/onboarding.service';
import { CatalogData, CatalogItem, PriceFloor } from '../../types/onboarding.types';
// import { CatalogData,} from '../types/onboarding.types';

// ✅ Schema
const catalogSchema = z.object({
  catalog: z.array(
    z.object({
      id: z.string().optional(),
      category: z.string().min(1, 'Category name is required'),
      isSelected: z.boolean().default(true),
      grades: z.array(z.string()).default([]),
      moqPerOrder: z.number().min(1).default(100),
      stdLeadTime: z.number().min(1).default(5),
    })
  ).default([]),
  priceFloors: z.array(
    z.object({
      category: z.string().min(1),
      minPrice: z.number().min(0).default(0),
      maxPrice: z.number().min(0).default(0),
    })
  ).default([]),
  usePlatform3PL: z.boolean().default(true),
  selfPickupAllowed: z.boolean().default(true),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

interface Props {
  data?: CatalogData;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_GRADES: Record<string, string[]> = {
  'HR Coils': ['IS 2062 E250', 'IS 2062 E350', 'IS 2062 E500'],
  'TMT Bars': ['Fe500', 'Fe500D', 'Fe550'],
  'Plates': ['Mild Steel', 'High Strength', 'Stainless Steel'],
  'Structural': ['IPN', 'IPE', 'ISMB', 'ISJB'],
};

const CATEGORIES = Object.keys(CATEGORY_GRADES);

export default function CatalogStep({ data, onNext, onBack }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CatalogItem[]>([]);
  const [newPrice, setNewPrice] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 0,
  });

  // ✅ FIXED: Changed zodSchema to catalogSchema
  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      catalog: [],
      priceFloors: [],
      usePlatform3PL: true,
      selfPickupAllowed: true,
    },
  });

  const priceFloors = watch('priceFloors');

  // ✅ PRE-FILL DATA
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

  const handleAddCategory = (category: string) => {
    if (!selectedCategories.find((c) => c.category === category)) {
      const newCategory: CatalogItem = {
        id: Date.now().toString(),
        category,
        isSelected: true,
        moqPerOrder: 100,
        stdLeadTime: 5,
        grades: [],
      };
      setSelectedCategories([...selectedCategories, newCategory]);
      setValue('catalog', [...selectedCategories, newCategory]);
      toast({
        title: 'Category Added',
        description: `${category} added to your catalog`,
      });
    }
  };

  const handleRemoveCategory = (category: string) => {
    const updated = selectedCategories.filter((c) => c.category !== category);
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  const handleUpdateCategory = (
    category: string,
    field: keyof CatalogItem,
    value: any
  ) => {
    const updated = selectedCategories.map((c) =>
      c.category === category ? { ...c, [field]: value } : c
    );
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  const handleAddGrade = (category: string, grade: string) => {
    const updated = selectedCategories.map((c) => {
      if (c.category === category && !c.grades.includes(grade)) {
        return { ...c, grades: [...c.grades, grade] };
      }
      return c;
    });
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  const handleRemoveGrade = (category: string, grade: string) => {
    const updated = selectedCategories.map((c) => {
      if (c.category === category) {
        return { ...c, grades: c.grades.filter((g) => g !== grade) };
      }
      return c;
    });
    setSelectedCategories(updated);
    setValue('catalog', updated);
  };

  const handleAddPriceFloor = () => {
    if (!newPrice.category || newPrice.minPrice >= newPrice.maxPrice) {
      toast({
        title: 'Invalid Price Floor',
        description: 'Please fill all fields and ensure min < max',
        variant: 'destructive',
      });
      return;
    }

    const updated = [...priceFloors, newPrice];
    setValue('priceFloors', updated);
    setNewPrice({ category: '', minPrice: 0, maxPrice: 0 });
    toast({
      title: 'Price Floor Added',
      description: `Price floor for ${newPrice.category} added`,
    });
  };

  const handleRemovePriceFloor = (index: number) => {
    const updated = priceFloors.filter((_, i) => i !== index);
    setValue('priceFloors', updated);
  };

  const onSubmit = async (formData: CatalogFormData) => {
    try {
      setIsSubmitting(true);

      if (selectedCategories.length === 0) {
        toast({
          title: 'No Categories Selected',
          description: 'Please select at least one category',
          variant: 'destructive',
        });
        return;
      }

      const catalogData: CatalogData = {
        catalog: formData.catalog as CatalogItem[],
        priceFloors: formData.priceFloors as PriceFloor[],
        logisticsPreference: {
          usePlatform3PL: formData.usePlatform3PL,
          selfPickupAllowed: formData.selfPickupAllowed,
        },
      };

      console.log('📤 Saving catalog data:', catalogData);
      await onboardingService.updateCatalog(catalogData);

      toast({
        title: 'Success',
        description: 'Catalog and pricing updated successfully',
      });

      onNext();

    } catch (error: any) {
      console.error('❌ Submit error:', error);
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
    <Card className="p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Catalog & Commercials</h1>
          <p className="text-gray-600">Select categories, grades, pricing and logistics</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: Categories */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold mb-6">Categories</h2>

            <div className="mb-6">
              <Label className="mb-3 block">Select Categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={selectedCategories.some((c) => c.category === cat) ? 'default' : 'outline'}
                    onClick={() => handleAddCategory(cat)}
                  >
                    {cat} {selectedCategories.some((c) => c.category === cat) && '✓'}
                  </Button>
                ))}
              </div>
            </div>

            {selectedCategories.length > 0 && (
              <div className="space-y-6">
                {selectedCategories.map((cat) => (
                  <div key={cat.id || cat.category} className="border rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{cat.category} ✓</h3>
                      <Button
                        type="button"
                        onClick={() => handleRemoveCategory(cat.category)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Grades */}
                    <div className="bg-gray-50 p-4 rounded space-y-3">
                      <Label className="font-semibold">Grades</Label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_GRADES[cat.category]?.map((grade) => (
                          <Button
                            key={grade}
                            type="button"
                            size="sm"
                            variant={cat.grades.includes(grade) ? 'default' : 'outline'}
                            onClick={() =>
                              cat.grades.includes(grade)
                                ? handleRemoveGrade(cat.category, grade)
                                : handleAddGrade(cat.category, grade)
                            }
                          >
                            {grade} {cat.grades.includes(grade) && '✓'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* MOQ & Lead Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>MOQ per Order (MT)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={cat.moqPerOrder}
                          onChange={(e) =>
                            handleUpdateCategory(cat.category, 'moqPerOrder', parseInt(e.target.value))
                          }
                        />
                      </div>

                      <div>
                        <Label>Std Lead Time (days)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={cat.stdLeadTime}
                          onChange={(e) =>
                            handleUpdateCategory(cat.category, 'stdLeadTime', parseInt(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedCategories.length === 0 && (
              <p className="text-sm text-yellow-600">⚠️ Select at least one category</p>
            )}
          </div>

          {/* SECTION 2: Price Floors */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold mb-6">Price Floors (optional)</h2>

            <div className="grid grid-cols-4 gap-4 mb-6 items-end">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newPrice.category}
                  onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })}
                >
                  <option value="">Select</option>
                  {selectedCategories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Min (₹/MT)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newPrice.minPrice}
                  onChange={(e) => setNewPrice({ ...newPrice, minPrice: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Max (₹/MT)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newPrice.maxPrice}
                  onChange={(e) => setNewPrice({ ...newPrice, maxPrice: parseFloat(e.target.value) })}
                />
              </div>

              <Button type="button" onClick={handleAddPriceFloor} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add +
              </Button>
            </div>

            {priceFloors.length > 0 && (
              <div className="space-y-2">
                {priceFloors.map((pf, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">
                      {pf.category} (₹/MT): {pf.minPrice} - {pf.maxPrice}
                    </p>
                    <Button
                      type="button"
                      onClick={() => handleRemovePriceFloor(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Logistics */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold mb-6">Logistics readiness</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="usePlatform3PL"
                  onChange={(e) => setValue('usePlatform3PL', e.target.checked)}
                  defaultChecked={watch('usePlatform3PL')}
                />
                <Label htmlFor="usePlatform3PL" className="cursor-pointer flex-1 font-medium">
                  Platform 3PL
                </Label>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="selfPickup"
                  onChange={(e) => setValue('selfPickupAllowed', e.target.checked)}
                  defaultChecked={watch('selfPickupAllowed')}
                />
                <Label htmlFor="selfPickup" className="cursor-pointer flex-1 font-medium">
                  Self pickup allowed
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
