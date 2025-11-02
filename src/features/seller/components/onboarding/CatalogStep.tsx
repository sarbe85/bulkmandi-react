import { Badge } from '@/shared/components/ui/badge';
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

const catalogSchema = z.object({
  catalog: z
    .array(
      z.object({
        id: z.string().optional(),
        category: z.string().min(1, 'Category name is required'),
        isSelected: z.boolean().default(true),
        grades: z.array(z.string()).default([]),
        moqPerOrder: z.number().min(1).default(100),
        stdLeadTime: z.number().min(1).default(5),
      })
    )
    .default([]),
  priceFloors: z
    .array(
      z.object({
        category: z.string().min(1),
        minPrice: z.number().min(0).default(0),
        maxPrice: z.number().min(0).default(0),
      })
    )
    .default([]),
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
  Plates: ['Mild Steel', 'High Strength', 'Stainless Steel'],
  Structural: ['IPN', 'IPE', 'ISMB', 'ISJB'],
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

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      catalog: [],
      priceFloors: [],
      usePlatform3PL: true,
      selfPickupAllowed: true,
    },
  });

  const priceFloors = watch('priceFloors');

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
      const updated = [...selectedCategories, newCategory];
      setSelectedCategories(updated);
      setValue('catalog', updated);
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

  const handleUpdateCategory = (category: string, field: keyof CatalogItem, value: any) => {
    const updated = selectedCategories.map((c) => (c.category === category ? { ...c, [field]: value } : c));
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catalog & Commercials</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select product categories, grades, pricing and logistics preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Categories Section */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Categories</h3>
          </div>

          <div className="mb-6">
            <Label className="mb-3 block text-gray-700 dark:text-gray-300">Select Categories to Offer</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.some((c) => c.category === cat);
                return (
                  <Button
                    key={cat}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => (isSelected ? handleRemoveCategory(cat) : handleAddCategory(cat))}
                    className="transition-all"
                  >
                    {cat} {isSelected && '✓'}
                  </Button>
                );
              })}
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="space-y-4">
              {selectedCategories.map((cat) => (
                <div
                  key={cat.id || cat.category}
                  className="border border-gray-200 dark:border-slate-600 rounded-lg p-5 space-y-4 bg-gray-50 dark:bg-slate-900/50"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        ✓ Selected
                      </Badge>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{cat.category}</h3>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleRemoveCategory(cat.category)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Grades */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700 dark:text-gray-300">Select Grades</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_GRADES[cat.category]?.map((grade) => {
                        const isGradeSelected = cat.grades.includes(grade);
                        return (
                          <Button
                            key={grade}
                            type="button"
                            size="sm"
                            variant={isGradeSelected ? 'default' : 'outline'}
                            onClick={() =>
                              isGradeSelected
                                ? handleRemoveGrade(cat.category, grade)
                                : handleAddGrade(cat.category, grade)
                            }
                          >
                            {grade} {isGradeSelected && '✓'}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MOQ & Lead Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">MOQ per Order (MT)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 100"
                        value={cat.moqPerOrder}
                        onChange={(e) => handleUpdateCategory(cat.category, 'moqPerOrder', parseInt(e.target.value))}
                        className="mt-2 dark:bg-slate-900 dark:border-slate-600"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Standard Lead Time (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 7"
                        value={cat.stdLeadTime}
                        onChange={(e) => handleUpdateCategory(cat.category, 'stdLeadTime', parseInt(e.target.value))}
                        className="mt-2 dark:bg-slate-900 dark:border-slate-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCategories.length === 0 && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️ Select at least one category to continue</p>
          )}
        </Card>

        {/* Price Floors Section */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Price Floors (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
            <div className="md:col-span-4">
              <Label className="text-gray-700 dark:text-gray-300">Category</Label>
              <select
                className="w-full mt-2 px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-600 dark:text-gray-200"
                value={newPrice.category}
                onChange={(e) => setNewPrice({ ...newPrice, category: e.target.value })}
              >
                <option value="">Select category</option>
                {selectedCategories.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <Label className="text-gray-700 dark:text-gray-300">Min Price (₹/MT)</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 45000"
                value={newPrice.minPrice}
                onChange={(e) => setNewPrice({ ...newPrice, minPrice: parseFloat(e.target.value) })}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div className="md:col-span-3">
              <Label className="text-gray-700 dark:text-gray-300">Max Price (₹/MT)</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 55000"
                value={newPrice.maxPrice}
                onChange={(e) => setNewPrice({ ...newPrice, maxPrice: parseFloat(e.target.value) })}
                className="mt-2 dark:bg-slate-900 dark:border-slate-600"
              />
            </div>

            <div className="md:col-span-2">
              <Button type="button" onClick={handleAddPriceFloor} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {priceFloors.length > 0 && (
            <div className="space-y-2">
              {priceFloors.map((pf, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-600 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {pf.category}: ₹{pf.minPrice.toLocaleString()} - ₹{pf.maxPrice.toLocaleString()} per MT
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleRemovePriceFloor(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Logistics Section */}
        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Logistics Preferences</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer">
              <input
                type="checkbox"
                id="usePlatform3PL"
                onChange={(e) => setValue('usePlatform3PL', e.target.checked)}
                defaultChecked={watch('usePlatform3PL')}
                className="w-4 h-4"
              />
              <Label htmlFor="usePlatform3PL" className="cursor-pointer flex-1 font-medium text-gray-900 dark:text-white">
                Use Platform 3PL Services
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                  Allow platform to arrange logistics and shipping
                </p>
              </Label>
            </div>

            <div className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-900/50 cursor-pointer">
              <input
                type="checkbox"
                id="selfPickup"
                onChange={(e) => setValue('selfPickupAllowed', e.target.checked)}
                defaultChecked={watch('selfPickupAllowed')}
                className="w-4 h-4"
              />
              <Label htmlFor="selfPickup" className="cursor-pointer flex-1 font-medium text-gray-900 dark:text-white">
                Allow Self Pickup
                <p className="text-sm text-gray-600 dark:text-gray-400 font-normal mt-1">
                  Buyers can arrange their own pickup from your location
                </p>
              </Label>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
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
  );
}
