// Copy from: seller/components/onboarding/OrgKYCStep.tsx
// Changes:
// 1. Add secondaryContact (optional) field
// 2. Change import from seller service to buyer service
// 3. Update submit call to buyer hook

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useOnboardingData } from '../../hooks/useOnboardingData';
import { orgKycSchema, type OrgKycFormData } from '../../schemas/buyer-onboarding.schema';
import { buyerOnboardingService } from '../../services/onboarding.service';

interface Props {
  data?: OrgKycFormData;
  onNext?: () => void;
}

export default function OrgKYC({ data, onNext }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { silentRefresh } = useOnboardingData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gstinFetching, setGstinFetching] = useState(false);
  const [gstinData, setGstinData] = useState<any>(null);
  const [plants, setPlants] = useState<any[]>(data?.plantLocations || []);
  const [newPlant, setNewPlant] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OrgKycFormData>({
    resolver: zodResolver(orgKycSchema),
    defaultValues: data || {
      businessType: 'Manufacturing',
      primaryContact: { role: 'CEO' },
    },
  });

  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as any, value);
      });
      if (data.plantLocations) setPlants(data.plantLocations);
    }
  }, [data, setValue]);

  const handleFetchGSTIN = async () => {
    const gstin = watch('gstin');
    if (!gstin) return;

    setGstinFetching(true);
    try {
      const response = await buyerOnboardingService.fetchGSTIN(gstin);
      setGstinData(response);
      setValue('legalName', response.legalName);
      if (response.tradeName) setValue('tradeName', response.tradeName);
      toast({ title: 'Success', description: 'GSTIN verified' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'GSTIN verification failed',
        variant: 'destructive',
      });
    } finally {
      setGstinFetching(false);
    }
  };

  const handleAddPlant = () => {
    if (newPlant.trim()) {
      const updatedPlants = [...plants, { name: newPlant }];
      setPlants(updatedPlants);
      setValue('plantLocations', updatedPlants);
      setNewPlant('');
    }
  };

  const handleRemovePlant = (index: number) => {
    const updatedPlants = plants.filter((_, i) => i !== index);
    setPlants(updatedPlants);
    setValue('plantLocations', updatedPlants);
  };

  const onSubmit = async (formData: OrgKycFormData) => {
    try {
      setIsSubmitting(true);
      await buyerOnboardingService.updateOrgKYC(formData);
      await silentRefresh();
      toast({ title: 'Success', description: 'Organization KYC saved' });
      onNext?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organization KYC</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Legal Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Legal Name *</Label>
            <Input
              placeholder="Enter legal name"
              {...register('legalName')}
              className="mt-1"
            />
            {errors.legalName && <p className="text-red-600 text-xs mt-1">{errors.legalName.message}</p>}
          </div>
          <div>
            <Label>Trade Name</Label>
            <Input
              placeholder="Enter trade name"
              {...register('tradeName')}
              className="mt-1"
            />
          </div>
        </div>

        {/* GSTIN & PAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>GSTIN *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="15-digit GSTIN"
                {...register('gstin')}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleFetchGSTIN}
                disabled={gstinFetching}
                variant="outline"
                size="sm"
              >
                {gstinFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
            {errors.gstin && <p className="text-red-600 text-xs mt-1">{errors.gstin.message}</p>}
            {gstinData && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Verified: {gstinData.legalName}
              </Badge>
            )}
          </div>
          <div>
            <Label>PAN *</Label>
            <Input
              placeholder="10-digit PAN"
              {...register('pan')}
              className="mt-1"
            />
            {errors.pan && <p className="text-red-600 text-xs mt-1">{errors.pan.message}</p>}
          </div>
          <div>
            <Label>CIN (Optional)</Label>
            <Input
              placeholder="CIN"
              {...register('cin')}
              className="mt-1"
            />
          </div>
        </div>

        {/* Registered Address */}
        <div>
          <Label>Registered Address *</Label>
          <Input
            placeholder="Complete address"
            {...register('registeredAddress')}
            className="mt-1"
          />
          {errors.registeredAddress && <p className="text-red-600 text-xs mt-1">{errors.registeredAddress.message}</p>}
        </div>

        {/* Business Type & Incorporation Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Business Type *</Label>
            <select
              {...register('businessType')}
              className="w-full mt-1 px-3 py-2 border rounded-md dark:bg-slate-900"
            >
              <option value="">Select</option>
              <option value=" PVT_LTD">Private Limited Company (Pvt Ltd)</option>
              <option value="LLP">Limited Liability Partnership (LLP)</option>
              <option value="PARTNERSHIP">Partnership Firm</option>
              <option value="PROPRIETOR">Sole Proprietorship</option>
            </select>
            {errors.businessType && <p className="text-red-600 text-xs mt-1">{errors.businessType.message}</p>}
          </div>
          <div>
            <Label>Incorporation Date</Label>
            <Input
              type="date"
              {...register('incorporationDate')}
              className="mt-1"
            />
          </div>
        </div>

        {/* Primary Contact */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              {...register('primaryContact.name')}
              className="col-span-1"
            />
            <Input
              placeholder="Email"
              {...register('primaryContact.email')}
              className="col-span-1"
            />
            <Input
              placeholder="Mobile"
              {...register('primaryContact.mobile')}
              className="col-span-1"
            />
            <Input
              placeholder="Role"
              {...register('primaryContact.role')}
              className="col-span-1"
            />
          </div>
        </Card>

       

        {/* Plant Locations (Optional) */}
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Plant Locations (Optional)</h3>
          <div className="flex gap-2 mb-3">
            <Input
              value={newPlant}
              onChange={(e) => setNewPlant(e.target.value)}
              placeholder="Plant name or address"
            />
            <Button type="button" onClick={handleAddPlant}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {plants.map((plant, i) => (
              <Badge key={i} className="flex items-center gap-1">
                {plant.name}
                <X size={14} className="cursor-pointer" onClick={() => handleRemovePlant(i)} />
              </Badge>
            ))}
          </div>
        </Card>

        {/* Submit */}
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
