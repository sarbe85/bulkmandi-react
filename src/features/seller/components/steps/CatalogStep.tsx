import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Check, CheckCircle2, Loader2, Package } from 'lucide-react';
import { useState } from 'react';
import onboardingService from '../../services/onboarding.service';
import { CatalogData } from '../../types/onboarding.types';

interface Props {
  data?: CatalogData;
  onNext: (data: any) => void;  // ✅ Changed from CatalogData to any
  onBack: () => void;
}


// Mock catalog data - in production, fetch from API
const AVAILABLE_CATEGORIES = [
  {
    id: 'hr-coils',
    name: 'HR Coils',
    availableGrades: ['IS2062 E250', 'Fe500', 'E350'],
  },
  {
    id: 'tmt-bars',
    name: 'TMT Bars',
    availableGrades: ['Fe500', 'Fe550', 'Fe600'],
  },
  {
    id: 'plates',
    name: 'Plates',
    availableGrades: ['MS Plates', 'SS Plates', 'Mild Steel'],
  },
  {
    id: 'structural',
    name: 'Structural',
    availableGrades: ['ISMB', 'ISWB', 'ISMC'],
  },
];

export const CatalogStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for selected categories
  const [selectedCategories, setSelectedCategories] = useState<
    Map<string, {
      name: string;
      grades: string[];
      moq: number;
      leadTime: number;
      pricePerMT: number;
    }>
  >(
    data?.catalog
      ? new Map(
          data.catalog.map((item) => [
            item.category,
            {
              name: item.category,
              grades: item.grades,
              moq: item.moqPerOrder,
              leadTime: item.stdLeadTime,
              pricePerMT:
                data.priceFloors?.find((pf) => pf.category === item.category)
                  ?.pricePerMT || 0,
            },
          ])
        )
      : new Map()
  );

  // State for logistics preference
  const [logisticsPreference, setLogisticsPreference] = useState({
    usePlatform3PL: data?.logisticsPreference?.usePlatform3PL ?? true,
    selfPickupAllowed: data?.logisticsPreference?.selfPickupAllowed ?? false,
  });

  const toggleCategory = (categoryName: string) => {
    const newSelected = new Map(selectedCategories);

    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
    } else {
      // Add with default values
      newSelected.set(categoryName, {
        name: categoryName,
        grades: [],
        moq: 5,
        leadTime: 7,
        pricePerMT: 0,
      });
    }

    setSelectedCategories(newSelected);
  };

  const toggleGrade = (categoryName: string, grade: string) => {
    const newSelected = new Map(selectedCategories);
    const category = newSelected.get(categoryName);

    if (category) {
      const grades = category.grades;
      const index = grades.indexOf(grade);

      if (index > -1) {
        grades.splice(index, 1);
      } else {
        grades.push(grade);
      }

      newSelected.set(categoryName, { ...category, grades });
      setSelectedCategories(newSelected);
    }
  };

  const updateCategoryField = (
    categoryName: string,
    field: 'moq' | 'leadTime' | 'pricePerMT',
    value: number
  ) => {
    const newSelected = new Map(selectedCategories);
    const category = newSelected.get(categoryName);

    if (category) {
      newSelected.set(categoryName, { ...category, [field]: value });
      setSelectedCategories(newSelected);
    }
  };

 const handleSubmit = async () => {
  console.log('🚀 CatalogStep - handleSubmit started');
  
  try {
    setIsSubmitting(true);

    // Validate
    if (selectedCategories.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one category.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Check if all selected categories have grades
    let hasEmptyGrades = false;
    selectedCategories.forEach((cat) => {
      if (cat.grades.length === 0) {
        hasEmptyGrades = true;
      }
    });

    if (hasEmptyGrades) {
      toast({
        title: 'Error',
        description: 'Please select grades for all selected categories.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // ✅ CORRECT FORMAT: Per-category structure matching backend API
    const catalogData: CatalogData = {
      catalog: Array.from(selectedCategories.entries()).map(
        ([categoryName, details]) => ({
          category: categoryName,
          isSelected: true,
          grades: details.grades,
          moqPerOrder: details.moq,
          stdLeadTime: details.leadTime,
        })
      ),
      priceFloors: Array.from(selectedCategories.entries()).map(
        ([categoryName, details]) => ({
          category: categoryName,
          pricePerMT: details.pricePerMT,
        })
      ),
      logisticsPreference,
    };

    console.log('📤 Sending catalog data to API:', catalogData);

    // ✅ FIXED: Store API response
    const response = await onboardingService.updateCatalog(catalogData);
    
    console.log('✅ API Response received:', response);

    toast({
      title: 'Success',
      description: 'Catalog saved successfully.',
    });

    // ✅ FIXED: Pass API response to onNext
    console.log('📨 Calling onNext with response');
    onNext(response);
    
  } catch (error: any) {
    console.error('❌ CatalogStep error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to save catalog.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
    console.log('🏁 CatalogStep - handleSubmit completed');
  }
};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Instructions Card */}
      <Card className="p-6 bg-primary/5 border-2 border-primary/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5 text-primary" />
          Product Catalog Configuration
        </h3>
        <p className="text-sm text-muted-foreground">
          Select the product categories you offer, specify grades, set pricing, and configure MOQ and lead times.
        </p>
      </Card>

      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">1</span>
          </div>
          Select Categories & Configure Details
        </h3>

        {/* Categories Selection */}
        <div className="space-y-4 mb-6">

          {AVAILABLE_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.has(category.name);
            const categoryData = selectedCategories.get(category.name);

            return (
              <div key={category.id} className={`border-2 rounded-lg p-5 space-y-4 transition-all ${
                isSelected 
                  ? 'bg-primary/5 border-primary/30 shadow-md' 
                  : 'bg-background border-border hover:border-primary/20'
              }`}>
                {/* Category Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={category.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleCategory(category.name)}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor={category.id}
                    className="font-semibold text-lg cursor-pointer flex-1"
                  >
                    {category.name}
                  </Label>
                  {isSelected && (
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  )}
                </div>

                {/* If selected, show grades and details */}
                {isSelected && categoryData && (
                  <div className="ml-6 space-y-5 border-l-2 border-primary/20 pl-5 bg-muted/30 p-4 rounded-r-lg">
                    {/* Grades Selection */}
                    <div>
                      <Label className="block mb-3 font-semibold text-base">
                        Select Grades *
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {category.availableGrades.map((grade) => (
                          <div key={grade} className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                            categoryData.grades.includes(grade)
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-background border-border'
                          }`}>
                            <Checkbox
                              id={`${category.id}-${grade}`}
                              checked={categoryData.grades.includes(grade)}
                              onCheckedChange={() =>
                                toggleGrade(category.name, grade)
                              }
                            />
                            <Label
                              htmlFor={`${category.id}-${grade}`}
                              className="font-normal cursor-pointer text-sm"
                            >
                              {grade}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* MOQ */}
                      <div>
                        <Label htmlFor={`moq-${category.id}`} className="font-medium">
                          MOQ (MT) *
                        </Label>
                        <Input
                          id={`moq-${category.id}`}
                          type="number"
                          min="1"
                          value={categoryData.moq}
                          onChange={(e) =>
                            updateCategoryField(
                              category.name,
                              'moq',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="e.g., 5"
                          className="mt-1"
                        />
                      </div>

                      {/* Lead Time */}
                      <div>
                        <Label htmlFor={`leadtime-${category.id}`} className="font-medium">
                          Lead Time (Days) *
                        </Label>
                        <Input
                          id={`leadtime-${category.id}`}
                          type="number"
                          min="1"
                          value={categoryData.leadTime}
                          onChange={(e) =>
                            updateCategoryField(
                              category.name,
                              'leadTime',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="e.g., 7"
                          className="mt-1"
                        />
                      </div>

                      {/* Price Per MT */}
                      <div>
                        <Label htmlFor={`price-${category.id}`} className="font-medium">
                          Price per MT (₹) *
                        </Label>
                        <Input
                          id={`price-${category.id}`}
                          type="number"
                          min="0"
                          step="1000"
                          value={categoryData.pricePerMT}
                          onChange={(e) =>
                            updateCategoryField(
                              category.name,
                              'pricePerMT',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="e.g., 45000"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Summary */}
        {selectedCategories.size > 0 && (
          <div className="mt-6 p-5 bg-success/5 border-2 border-success/20 rounded-lg">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              Selected Categories ({selectedCategories.size}):
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedCategories.keys()).map((cat) => (
                <Badge key={cat} variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Check className="h-3 w-3 mr-1" />
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Logistics Preference */}
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">2</span>
          </div>
          Logistics Preference
        </h3>

        <div className="space-y-4">
          <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
            logisticsPreference.usePlatform3PL 
              ? 'bg-primary/5 border-primary/30' 
              : 'bg-background border-border'
          }`}>
            <Checkbox
              id="platform-3pl"
              checked={logisticsPreference.usePlatform3PL}
              onCheckedChange={(checked) =>
                setLogisticsPreference({
                  ...logisticsPreference,
                  usePlatform3PL: checked as boolean,
                })
              }
              className="mt-1"
            />
            <div>
              <Label
                htmlFor="platform-3pl"
                className="font-semibold cursor-pointer text-base"
              >
                Use Platform 3PL (Third-Party Logistics)
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Let our verified logistics partners handle delivery with real-time tracking
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
            logisticsPreference.selfPickupAllowed 
              ? 'bg-primary/5 border-primary/30' 
              : 'bg-background border-border'
          }`}>
            <Checkbox
              id="self-pickup"
              checked={logisticsPreference.selfPickupAllowed}
              onCheckedChange={(checked) =>
                setLogisticsPreference({
                  ...logisticsPreference,
                  selfPickupAllowed: checked as boolean,
                })
              }
              className="mt-1"
            />
            <div>
              <Label
                htmlFor="self-pickup"
                className="font-semibold cursor-pointer text-base"
              >
                Allow Self Pickup
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Buyers can arrange their own transportation and pickup from your location
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          type="button"
          disabled={isSubmitting || selectedCategories.size === 0}
          onClick={handleSubmit}
          className="min-w-[200px]"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
    </div>
  );
};

export default CatalogStep;