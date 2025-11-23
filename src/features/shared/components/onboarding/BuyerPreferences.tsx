import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOnboarding } from '../../hooks/useOnboarding';
import { buyerPreferencesSchema, type BuyerPreferencesFormData } from '../../schemas/onboarding.schema';

interface Props {
  onNext: () => void;
  onBack?: () => void;
}

// ✅ Steel categories matching seller's catalog
const STEEL_CATEGORIES = ['HR Coils', 'TMT Bars', 'Plates', 'Structural'];

// ✅ Incoterms options
const INCOTERMS_OPTIONS = ['DAP', 'EXW', 'FCA', 'CPT', 'CIP', 'DDP'];

// ✅ Notification channels
const NOTIFICATION_CHANNELS = ['Email', 'SMS', 'WhatsApp'];

// ✅ QC options
const QC_OPTIONS = [
  { value: 'Visual & Weight Check', label: 'Visual & Weight' },
  { value: 'Lab Testing Required', label: 'Lab Testing' },
];

export default function BuyerPreferences({ onNext, onBack }: Props) {
  const { toast } = useToast();
  const { data, isSaving, submitStep } = useOnboarding();

  // ✅ State management
  const [categories, setCategories] = useState<string[]>(
    data?.buyerPreferences?.categories || []
  );
  const [incoterm, setIncoterm] = useState<string>(
    data?.buyerPreferences?.incoterms?.[0] || 'DAP'
  );
  const [deliveryPins, setDeliveryPins] = useState<string[]>(
    data?.buyerPreferences?.deliveryPins || []
  );
  const [notifications, setNotifications] = useState<string[]>(
    data?.buyerPreferences?.notifications || ['Email']
  );
  const [qcRequirement, setQcRequirement] = useState<string>(
    data?.buyerPreferences?.qcRequirement || 'Visual & Weight Check'
  );
  const [newPin, setNewPin] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerPreferencesFormData>({
    resolver: zodResolver(buyerPreferencesSchema),
    defaultValues: {
      typicalMonthlyVolumeMT: data?.buyerPreferences?.typicalMonthlyVolumeMT || 0,
      acceptanceWindow: data?.buyerPreferences?.acceptanceWindow || '24 hours',
      notes: data?.buyerPreferences?.notes || '',
    },
  });

  // ✅ Category handlers
  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  // ✅ Delivery PIN handlers
  const handleAddPin = () => {
    const trimmedPin = newPin.trim();
    
    if (!trimmedPin) {
      toast({
        title: 'Invalid PIN',
        description: 'Please enter a valid PIN code',
        variant: 'destructive',
      });
      return;
    }

    if (deliveryPins.includes(trimmedPin)) {
      toast({
        title: 'Duplicate PIN',
        description: 'This PIN is already added',
        variant: 'destructive',
      });
      return;
    }

    setDeliveryPins([...deliveryPins, trimmedPin]);
    setNewPin('');
    toast({
      title: 'PIN Added',
      description: `Delivery PIN ${trimmedPin} added successfully`,
    });
  };

  const handleRemovePin = (pin: string) => {
    setDeliveryPins(deliveryPins.filter((p) => p !== pin));
    toast({
      title: 'PIN Removed',
      description: `Delivery PIN ${pin} removed`,
    });
  };

  // ✅ Notification handlers
  const toggleNotification = (channel: string) => {
    if (notifications.includes(channel)) {
      // Don't allow removing all notifications
      if (notifications.length === 1) {
        toast({
          title: 'Cannot Remove',
          description: 'At least one notification channel is required',
          variant: 'destructive',
        });
        return;
      }
      setNotifications(notifications.filter((n) => n !== channel));
    } else {
      setNotifications([...notifications, channel]);
    }
  };

  // ✅ Form submission
  const onSubmit = async (formData: BuyerPreferencesFormData) => {
    try {
      // Validate categories
      if (categories.length === 0) {
        toast({
          title: 'Missing Categories',
          description: 'Please select at least one category of interest',
          variant: 'destructive',
        });
        return;
      }

      // Validate delivery PINs
      if (deliveryPins.length === 0) {
        toast({
          title: 'Missing Delivery PINs',
          description: 'Please add at least one delivery PIN code',
          variant: 'destructive',
        });
        return;
      }

      // Validate notifications
      if (notifications.length === 0) {
        toast({
          title: 'Missing Notifications',
          description: 'Please select at least one notification channel',
          variant: 'destructive',
        });
        return;
      }

      // ✅ Prepare payload matching BuyerPreferencesData interface
      const payload = {
        categories,
        typicalMonthlyVolumeMT: formData.typicalMonthlyVolumeMT,
        incoterms: [incoterm],
        deliveryPins,
        acceptanceWindow: formData.acceptanceWindow,
        qcRequirement,
        notifications, // ✅ Array of strings
        notes: formData.notes,
      };

      await submitStep('buyer-preferences', payload);

      toast({
        title: 'Success',
        description: 'Buying preferences saved successfully',
      });

      onNext();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save preferences',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Buying Preferences</h2>

      {/* ✅ 1. Categories of Interest - Button style */}
      <Card className="p-4">
        <Label className="text-sm font-semibold mb-2 block">
          Categories of Interest <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {STEEL_CATEGORIES.map((cat) => {
            const isSelected = categories.includes(cat);
            return (
              <Button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
              >
                {cat}
                {isSelected && <Check className="ml-1 w-3 h-3" />}
              </Button>
            );
          })}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Select at least one category
          </p>
        )}
        {categories.length > 0 && (
          <p className="text-xs text-primary mt-2">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} selected
          </p>
        )}
      </Card>

      {/* ✅ 2. Monthly Volume & Incoterms - ONE LINE */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="monthlyVolume" className="text-sm font-medium">
            Typical Monthly Volume (MT)
          </Label>
          <Input
            id="monthlyVolume"
            type="number"
            {...register('typicalMonthlyVolumeMT', { valueAsNumber: true })}
            placeholder="e.g., 500"
            className="mt-1 h-9 text-sm"
            min="0"
          />
          {errors.typicalMonthlyVolumeMT && (
            <p className="text-xs text-destructive mt-1">
              {errors.typicalMonthlyVolumeMT.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="incoterm" className="text-sm font-medium">
            Incoterms <span className="text-destructive">*</span>
          </Label>
          <select
            id="incoterm"
            value={incoterm}
            onChange={(e) => setIncoterm(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {INCOTERMS_OPTIONS.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ 3. Delivery PINs - WITH ADD BUTTON */}
      <Card className="p-4">
        <Label className="text-sm font-semibold mb-2 block">
          Delivery PINs <span className="text-destructive">*</span>
        </Label>

        <div className="flex gap-2 mb-3">
          <Input
            type="text"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddPin();
              }
            }}
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            className="h-9 text-sm flex-1"
          />
          <Button
            type="button"
            onClick={handleAddPin}
            size="sm"
            className="h-9 px-3"
            disabled={!newPin.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {deliveryPins.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {deliveryPins.map((pin) => (
              <div
                key={pin}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20"
              >
                <span>{pin}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePin(pin)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Remove PIN ${pin}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No delivery PINs added yet
          </p>
        )}
      </Card>

      {/* ✅ 4. Acceptance Window & QC Requirement - ONE LINE */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="acceptanceWindow" className="text-sm font-medium">
            Acceptance Window <span className="text-destructive">*</span>
          </Label>
          <select
            id="acceptanceWindow"
            {...register('acceptanceWindow')}
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="24 hours">24 hours</option>
            <option value="48 hours">48 hours</option>
            <option value="72 hours">72 hours</option>
          </select>
          {errors.acceptanceWindow && (
            <p className="text-xs text-destructive mt-1">
              {errors.acceptanceWindow.message}
            </p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-1 block">
            QC Requirement <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3 mt-1.5">
            {QC_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="qc"
                  value={option.value}
                  checked={qcRequirement === option.value}
                  onChange={(e) => setQcRequirement(e.target.value)}
                  className="w-4 h-4 text-primary cursor-pointer"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 5. Notifications - Button style */}
      <Card className="p-4">
        <Label className="text-sm font-semibold mb-2 block">
          Notifications <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_CHANNELS.map((channel) => {
            const isSelected = notifications.includes(channel);
            return (
              <Button
                key={channel}
                type="button"
                onClick={() => toggleNotification(channel)}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
              >
                {channel}
                {isSelected && <Check className="ml-1 w-3 h-3" />}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Select how you want to receive notifications
        </p>
      </Card>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Additional Notes
        </Label>
        <textarea
          id="notes"
          {...register('notes')}
          placeholder="Any specific requirements or preferences..."
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
        {errors.notes && (
          <p className="text-xs text-destructive mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-between pt-3 border-t">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSaving}
            size="sm"
            className="h-9"
          >
            ← Back
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSaving}
          size="sm"
          className="h-9 ml-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save & Continue →
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
