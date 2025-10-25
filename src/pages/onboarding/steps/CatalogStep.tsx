import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CatalogData, LogisticsType } from '@/types/onboarding.types';
import { Plus, X } from 'lucide-react';

const schema = z.object({
  moqPerOrder: z.number().min(1, 'MOQ is required'),
  standardLeadDays: z.number().min(1, 'Lead time is required'),
  logisticsType: z.enum(['PLATFORM_3PL', 'SELF_PICKUP']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data?: CatalogData;
  onNext: (data: CatalogData) => void;
  onBack: () => void;
}

const AVAILABLE_CATEGORIES = ['HR Coils', 'TMT Bars', 'Plates', 'Structural', 'Wire Rods', 'Billets'];

export const CatalogStep = ({ data, onNext, onBack }: Props) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(data?.categories || []);
  const [grades, setGrades] = useState<string[]>(data?.grades.map(g => g.name) || []);
  const [newGrade, setNewGrade] = useState('');
  const [plants, setPlants] = useState<string[]>(data?.plantLocations || []);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data ? {
      moqPerOrder: data.moqPerOrder,
      standardLeadDays: data.standardLeadDays,
      logisticsType: data.logisticsType,
    } : {
      moqPerOrder: 50,
      standardLeadDays: 7,
      logisticsType: 'PLATFORM_3PL',
    },
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddGrade = () => {
    if (newGrade.trim() && !grades.includes(newGrade.trim())) {
      setGrades([...grades, newGrade.trim()]);
      setNewGrade('');
    }
  };

  const handleRemoveGrade = (grade: string) => {
    setGrades(grades.filter(g => g !== grade));
  };

  const onSubmit = (formData: FormData) => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (grades.length === 0) {
      alert('Please add at least one grade');
      return;
    }

    const catalogData: CatalogData = {
      categories: selectedCategories,
      grades: grades.map(g => ({
        code: g.toUpperCase().replace(/\s+/g, '_'),
        name: g,
        description: '',
      })),
      moqPerOrder: formData.moqPerOrder,
      standardLeadDays: formData.standardLeadDays,
      plantLocations: plants,
      logisticsType: formData.logisticsType,
    };

    onNext(catalogData);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Catalog & Commercials</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="mb-3 block">Product Categories</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CATEGORIES.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Badge
                  key={category}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => toggleCategory(category)}
                >
                  {category} {isSelected && '✓'}
                </Badge>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Grades</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {grades.map(grade => (
              <Badge key={grade} variant="secondary" className="gap-2">
                {grade}
                <button type="button" onClick={() => handleRemoveGrade(grade)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              placeholder="Add grade (e.g., IS2062 E250, Fe500)"
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={handleAddGrade}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="moq">MOQ per Order (MT)</Label>
            <Input
              id="moq"
              type="number"
              {...register('moqPerOrder', { valueAsNumber: true })}
              placeholder="e.g., 50"
              className="font-mono"
            />
            {errors.moqPerOrder && <p className="text-sm text-destructive mt-1">{errors.moqPerOrder.message}</p>}
          </div>

          <div>
            <Label htmlFor="leadDays">Standard Lead Time (days)</Label>
            <Input
              id="leadDays"
              type="number"
              {...register('standardLeadDays', { valueAsNumber: true })}
              placeholder="e.g., 7"
              className="font-mono"
            />
            {errors.standardLeadDays && <p className="text-sm text-destructive mt-1">{errors.standardLeadDays.message}</p>}
          </div>
        </div>

        <div>
          <Label>Logistics Readiness</Label>
          <RadioGroup defaultValue={watch('logisticsType')} onValueChange={(value) => setValue('logisticsType', value as LogisticsType)}>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PLATFORM_3PL" id="platform" />
                <Label htmlFor="platform" className="font-normal">Platform 3PL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SELF_PICKUP" id="pickup" />
                <Label htmlFor="pickup" className="font-normal">Self Pickup Allowed</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Save & Continue →</Button>
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        </div>
      </form>
    </Card>
  );
};
