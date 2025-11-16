import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOnboarding } from '../../hooks/useOnboarding';
import { buyerPreferencesSchema, type BuyerPreferencesFormData } from '../../schemas/onboarding.schema';

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

export default function BuyerPreferences({ onNext, onBack }: Props) {
  const { data, isSaving, submitStep } = useOnboarding();
  const [deliveryPins, setDeliveryPins] = useState<string[]>(data?.buyerPreferences?.deliveryPins || []);
  const [categories, setCategories] = useState<string[]>(data?.buyerPreferences?.categories || []);
  const [incoterms, setIncoterms] = useState<string[]>(data?.buyerPreferences?.incoterms || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerPreferencesFormData>({
    resolver: zodResolver(buyerPreferencesSchema),
    defaultValues: data?.buyerPreferences || {},
  });

  const onSubmit = async (formData: BuyerPreferencesFormData) => {
    try {
      await submitStep('buyer-preferences', {
        ...formData,
        deliveryPins,
        categories,
        incoterms,
      });
      onNext();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Buying Preferences</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Categories */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Categories of Interest *</h3>
          <Input
            placeholder="Add category (e.g., Electronics)"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                setCategories([...categories, e.currentTarget.value]);
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded">
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                  className="text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Volume */}
        <div>
          <Label>Typical Monthly Volume (MT)</Label>
          <Input type="number" {...register('typicalMonthlyVolumeMT')} placeholder="0" className="mt-1" />
        </div>

        {/* Incoterms */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Incoterms *</h3>
          {['DAP', 'EXW', 'FCA', 'CPT', 'CIP', 'DDP'].map(term => (
            <div key={term} className="flex items-center gap-2 mb-2">
              <Checkbox
                checked={incoterms.includes(term)}
                onCheckedChange={checked => {
                  if (checked) {
                    setIncoterms([...incoterms, term]);
                  } else {
                    setIncoterms(incoterms.filter(t => t !== term));
                  }
                }}
              />
              <Label className="cursor-pointer">{term}</Label>
            </div>
          ))}
        </Card>

        {/* Delivery PINs */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Delivery PINs *</h3>
          <Input
            placeholder="Add 6-digit PIN"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                setDeliveryPins([...deliveryPins, e.currentTarget.value]);
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {deliveryPins.map((pin, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded">
                <span>{pin}</span>
                <button
                  type="button"
                  onClick={() => setDeliveryPins(deliveryPins.filter((_, i) => i !== idx))}
                  className="text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Acceptance Window */}
        <div>
          <Label>Acceptance Window *</Label>
          <select {...register('acceptanceWindow')} className="w-full mt-1 px-3 py-2 border rounded-md">
            <option value="">Select</option>
            <option value="24h">24 hours</option>
            <option value="48h">48 hours</option>
            <option value="72h">72 hours</option>
          </select>
        </div>

        {/* QC Requirement */}
        <div>
          <Label>QC Requirement *</Label>
          <select {...register('qcRequirement')} className="w-full mt-1 px-3 py-2 border rounded-md">
            <option value="">Select</option>
            <option value="VISUAL_WEIGHT">Visual & Weight Check</option>
            <option value="LAB_REQUIRED">Lab Testing Required</option>
          </select>
        </div>

        {/* Notifications */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Notifications</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox {...register('notifyEmail')} />
              <Label className="cursor-pointer">Email</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox {...register('notifySMS')} />
              <Label className="cursor-pointer">SMS</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox {...register('notifyWhatsApp')} />
              <Label className="cursor-pointer">WhatsApp</Label>
            </div>
          </div>
        </Card>

        {/* Notes */}
        <div>
          <Label>Additional Notes</Label>
          <textarea {...register('notes')} placeholder="Any special requirements?" className="w-full mt-1 p-3 border rounded-md" rows={3} />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
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
