// NEW COMPONENT - BUYER-SPECIFIC
// This is the only step that doesn't exist in seller flow

// import { Button, Card, Checkbox, Input, Label } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOnboardingData } from '../../hooks/useOnboardingData';
import { buyerPreferencesSchema, type BuyerPreferencesFormData } from '../../schemas/buyer-onboarding.schema';
import { buyerOnboardingService } from '../../services/onboarding.service';

const CATEGORIES = ['HR Coils', 'TMT Bars', 'Plates', 'Sheets', 'Coal G10–G12', 'Scrap', 'Aggregates'];
const INCOTERMS = ['DAP', 'EXW', 'FCA', 'CPT', 'CIP', 'DDP'];

interface Props {
  data?: BuyerPreferencesFormData;
  onNext?: () => void;
}

export default function UserPreferences({ data, onNext }: Props) {
  const { toast } = useToast();
  const { silentRefresh } = useOnboardingData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>(data?.categories || []);
  const [incoterms, setIncoterms] = useState<string[]>(data?.incoterms || []);
  const [pins, setPins] = useState<string[]>(data?.deliveryPins || []);
  const [newPin, setNewPin] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuyerPreferencesFormData>({
    resolver: zodResolver(buyerPreferencesSchema),
    defaultValues: data || {
      categories: [],
      incoterms: [],
      deliveryPins: [],
      acceptanceWindow: '24h',
      qcRequirement: 'VISUAL_WEIGHT',
      notifyEmail: true,
      notifySMS: true,
      notifyWhatsApp: false,
    },
  });

  useEffect(() => {
    setValue('categories', categories);
    setValue('incoterms', incoterms);
    setValue('deliveryPins', pins);
  }, [categories, incoterms, pins, setValue]);

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleIncoterm = (term: string) => {
    setIncoterms(prev =>
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const addPin = () => {
    if (/^[0-9]{6}$/.test(newPin)) {
      if (!pins.includes(newPin)) {
        setPins([...pins, newPin]);
        setNewPin('');
      } else {
        toast({ title: 'Error', description: 'PIN already added', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Error', description: 'Enter valid 6-digit PIN', variant: 'destructive' });
    }
  };

  const removePin = (pin: string) => {
    setPins(pins.filter(p => p !== pin));
  };

  const onSubmit = async (formData: BuyerPreferencesFormData) => {
    try {
      setIsSubmitting(true);
      await buyerOnboardingService.updatePreferences(formData);
      await silentRefresh();
      toast({ title: 'Success', description: 'Preferences saved' });
      onNext?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Buying Preferences</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Categories */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Product Categories *</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={categories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
          {categories.length === 0 && errors.categories && (
            <p className="text-red-600 text-xs mt-2">{errors.categories.message}</p>
          )}
        </Card>

        {/* Monthly Volume */}
        <div>
          <Label>Typical Monthly Volume (MT)</Label>
          <Input
            type="number"
            placeholder="Enter volume in metric tons"
            {...register('typicalMonthlyVolumeMT', { valueAsNumber: true })}
            className="mt-1"
          />
        </div>

        {/* Incoterms */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Incoterms *</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INCOTERMS.map(term => (
              <label key={term} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={incoterms.includes(term)}
                  onCheckedChange={() => toggleIncoterm(term)}
                />
                <span className="text-sm">{term}</span>
              </label>
            ))}
          </div>
          {incoterms.length === 0 && errors.incoterms && (
            <p className="text-red-600 text-xs mt-2">{errors.incoterms.message}</p>
          )}
        </Card>

        {/* Delivery PINs */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Delivery PINs (Primary Markets) *</h3>
          <div className="flex gap-2 mb-3">
            <Input
              type="text"
              placeholder="6-digit PIN code"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.slice(0, 6))}
              maxLength={6}
            />
            <Button type="button" onClick={addPin} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pins.map(pin => (
              <div key={pin} className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 text-sm">
                {pin}
                <X size={14} className="cursor-pointer" onClick={() => removePin(pin)} />
              </div>
            ))}
          </div>
          {pins.length === 0 && errors.deliveryPins && (
            <p className="text-red-600 text-xs mt-2">{errors.deliveryPins.message}</p>
          )}
        </Card>

        {/* Acceptance Window */}
        <div>
          <Label>Acceptance Window *</Label>
          <select
            {...register('acceptanceWindow')}
            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-900"
          >
            <option value="24h">24 hours</option>
            <option value="48h">48 hours</option>
            <option value="72h">72 hours</option>
          </select>
        </div>

        {/* QC Requirement */}
        <div>
          <Label>QC Requirement *</Label>
          <select
            {...register('qcRequirement')}
            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-900"
          >
            <option value="VISUAL_WEIGHT">Visual + Weight Check</option>
            <option value="LAB_REQUIRED">Lab Testing Required</option>
          </select>
        </div>

        {/* Notifications */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register('notifyEmail')} />
              <span className="text-sm">Email Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register('notifySMS')} />
              <span className="text-sm">SMS Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox {...register('notifyWhatsApp')} />
              <span className="text-sm">WhatsApp Notifications</span>
            </label>
          </div>
        </Card>

        {/* Notes */}
        <div>
          <Label>Additional Notes</Label>
          <textarea
            {...register('notes')}
            placeholder="Any special requirements"
            className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-900 min-h-24"
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
