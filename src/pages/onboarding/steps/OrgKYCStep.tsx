import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrgKYCData } from '@/types/onboarding.types';
import { onboardingService } from '@/services/onboarding.service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Plus } from 'lucide-react';

const schema = z.object({
  legalName: z.string().min(2, 'Legal name is required'),
  tradeName: z.string().optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  cin: z.string().optional(),
  registeredAddress: z.string().min(10, 'Address is required'),
  businessType: z.string().min(2, 'Business type is required'),
  incorporationDate: z.string().min(1, 'Incorporation date is required'),
  primaryContact: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    mobile: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'),
  }),
});

type FormData = z.infer<typeof schema>;

interface Props {
  data?: OrgKYCData;
  onNext: (data: OrgKYCData) => void;
  onBack: () => void;
}

export const OrgKYCStep = ({ data, onNext, onBack }: Props) => {
  const { toast } = useToast();
  const [gstinFetching, setGstinFetching] = useState(false);
  const [gstinData, setGstinData] = useState<any>(null);
  const [plants, setPlants] = useState<string[]>(data?.plantLocations?.map(p => `${p.city} • ${p.pincode}`) || []);
  const [newPlant, setNewPlant] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data ? {
      legalName: data.legalName,
      tradeName: data.tradeName,
      gstin: data.gstin,
      pan: data.pan,
      cin: data.cin,
      registeredAddress: data.registeredAddress,
      businessType: data.businessType,
      incorporationDate: data.incorporationDate,
      primaryContact: data.primaryContact,
    } : undefined,
  });

  const handleFetchGSTIN = async () => {
    const gstin = watch('gstin');
    if (!gstin) return;

    setGstinFetching(true);
    try {
      const response = await onboardingService.fetchGSTIN(gstin);
      setGstinData(response);
      setValue('legalName', response.legalName);
      if (response.tradeName) setValue('tradeName', response.tradeName);
      toast({
        title: 'GSTIN Verified',
        description: 'Business details fetched successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Fetch Failed',
        description: error.message || 'Failed to fetch GSTIN details.',
        variant: 'destructive',
      });
    } finally {
      setGstinFetching(false);
    }
  };

  const handleAddPlant = () => {
    if (newPlant.trim()) {
      setPlants([...plants, newPlant.trim()]);
      setNewPlant('');
    }
  };

  const handleRemovePlant = (index: number) => {
    setPlants(plants.filter((_, i) => i !== index));
  };

  const onSubmit = (formData: FormData) => {
    const orgKycData: OrgKYCData = {
      legalName: formData.legalName,
      tradeName: formData.tradeName,
      gstin: formData.gstin,
      pan: formData.pan,
      cin: formData.cin,
      registeredAddress: formData.registeredAddress,
      businessType: formData.businessType,
      incorporationDate: formData.incorporationDate,
      plantLocations: plants.map(p => {
        const [city, pincode] = p.split('•').map(s => s.trim());
        return {
          name: `${city} Plant`,
          city,
          state: '',
          pincode,
          isActive: true,
        };
      }),
      primaryContact: {
        name: formData.primaryContact.name,
        email: formData.primaryContact.email,
        mobile: formData.primaryContact.mobile,
        emailVerified: false,
        mobileVerified: false,
      },
    };
    onNext(orgKycData);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Organization KYC</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input id="legalName" {...register('legalName')} placeholder="Registered legal name" />
            {errors.legalName && <p className="text-sm text-destructive mt-1">{errors.legalName.message}</p>}
          </div>

          <div>
            <Label htmlFor="tradeName">Trade Name</Label>
            <Input id="tradeName" {...register('tradeName')} placeholder="Brand name" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gstin">GSTIN</Label>
            <div className="flex gap-2">
              <Input id="gstin" {...register('gstin')} placeholder="27AAECS1234K1Z5" className="font-mono" />
              <Button type="button" variant="secondary" size="sm" onClick={handleFetchGSTIN} disabled={gstinFetching}>
                {gstinFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
              </Button>
            </div>
            {errors.gstin && <p className="text-sm text-destructive mt-1">{errors.gstin.message}</p>}
            {gstinData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="font-mono text-xs">{gstinData.legalName}</Badge>
                <Badge className="bg-success/10 text-success border-success/20">
                  <Check className="h-3 w-3 mr-1" /> Active
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="pan">PAN</Label>
            <Input id="pan" {...register('pan')} placeholder="AAECS1234K" className="font-mono" />
            {errors.pan && <p className="text-sm text-destructive mt-1">{errors.pan.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cin">CIN (Optional)</Label>
            <Input id="cin" {...register('cin')} placeholder="U12345MH2020PTC123456" className="font-mono" />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" {...register('businessType')} placeholder="e.g., Private Limited, Partnership" />
            {errors.businessType && <p className="text-sm text-destructive mt-1">{errors.businessType.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="incorporationDate">Incorporation Date</Label>
            <Input id="incorporationDate" type="date" {...register('incorporationDate')} />
            {errors.incorporationDate && <p className="text-sm text-destructive mt-1">{errors.incorporationDate.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="registeredAddress">Registered Address</Label>
          <Input id="registeredAddress" {...register('registeredAddress')} placeholder="Street, City, PIN, State" />
          {errors.registeredAddress && <p className="text-sm text-destructive mt-1">{errors.registeredAddress.message}</p>}
        </div>

        <div>
          <Label>Factory / Plant Locations</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {plants.map((plant, index) => (
              <Badge key={index} variant="secondary" className="gap-2">
                {plant}
                <button type="button" onClick={() => handleRemovePlant(index)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newPlant}
              onChange={(e) => setNewPlant(e.target.value)}
              placeholder="Add plant address (e.g., Raipur • 492001)"
              className="flex-1"
            />
            <Button type="button" size="sm" onClick={handleAddPlant}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Primary Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contactName">Name</Label>
              <Input id="contactName" {...register('primaryContact.name')} placeholder="Full name" />
              {errors.primaryContact?.name && <p className="text-sm text-destructive mt-1">{errors.primaryContact.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" {...register('primaryContact.email')} type="email" placeholder="name@company.com" />
              {errors.primaryContact?.email && <p className="text-sm text-destructive mt-1">{errors.primaryContact.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="contactMobile">Mobile</Label>
              <Input id="contactMobile" {...register('primaryContact.mobile')} placeholder="+919876543210" />
              {errors.primaryContact?.mobile && <p className="text-sm text-destructive mt-1">{errors.primaryContact.mobile.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Save & Continue →</Button>
          <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        </div>
      </form>
    </Card>
  );
};
