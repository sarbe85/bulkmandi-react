import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { useAuth } from '@/shared/hooks/useAuth';
import { UserRole } from '@/shared/types/api.types';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Package,
  Phone,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ✅ Helper to extract error message
const extractErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    if (Array.isArray(msg)) {
      return msg.join('. ');
    }
    return String(msg);
  }
  if (error?.response?.data?.error) {
    return String(error.response.data.error);
  }
  if (error?.message) {
    return String(error.message);
  }
  return 'An unexpected error occurred. Please try again.';
};

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const roleFromUrl = (searchParams.get('role') as UserRole) || null;
  const isRolePreselected = !!roleFromUrl;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    organizationName: '',
    role: (roleFromUrl || 'SELLER') as UserRole,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    mobile: '',
    organizationName: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      mobile: '',
      organizationName: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit mobile number';
    }

    if (!formData.organizationName) {
      newErrors.organizationName = 'Organization name is required';
    } else if (formData.organizationName.length < 3) {
      newErrors.organizationName = 'Must be at least 3 characters';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      await register(formData);

      toast({
        title: 'Success',
        description: 'Registration successful! Redirecting...',
      });

      setTimeout(() => {
        navigate(
          formData.role === 'SELLER' ? '/seller/onboarding' : '/seller/dashboard'
        );
      }, 500);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error?.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage = Array.isArray(msg) ? msg.join('. ') : String(msg);
      } else if (error?.response?.data?.error) {
        errorMessage = String(error.response.data.error);
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (field !== 'role') {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return ShoppingCart;
      case 'SELLER':
        return Package;
      case '3PL':
        return Truck;
      default:
        return Package;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'BUYER':
        return 'Buyer';
      case 'SELLER':
        return 'Seller';
      case '3PL':
        return 'Logistics';
      default:
        return 'Seller';
    }
  };

  const getRoleFeatures = (role: UserRole) => {
    const features = {
      SELLER: ['Post inventory', 'Respond to RFQs', 'Multi-location', 'Analytics'],
      BUYER: ['Create RFQs', 'Compare quotes', 'Track orders', 'Verified sellers'],
      '3PL': ['Bid on lanes', 'Live tracking', 'Upload POD', 'Get paid fast'],
    };
    return features[role];
  };

  const RoleIcon = getRoleIcon(formData.role);
  const features = getRoleFeatures(formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base">
              {isRolePreselected ? (
                <span className="flex items-center gap-2">
                  Registering as{' '}
                  <Badge variant="secondary">{getRoleLabel(formData.role)}</Badge>
                </span>
              ) : (
                'Join the platform and start trading'
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="organizationName"
                    placeholder="Your Company Pvt Ltd"
                    value={formData.organizationName}
                    onChange={handleChange('organizationName')}
                    className={`pl-10 ${
                      errors.organizationName ? 'border-red-500' : ''
                    }`}
                    autoComplete="organization"
                  />
                </div>
                {errors.organizationName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.organizationName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={handleChange('mobile')}
                    maxLength={10}
                    className={`pl-10 ${errors.mobile ? 'border-red-500' : ''}`}
                    autoComplete="tel"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {!isRolePreselected && (
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as UserRole })
                    }
                    className="grid grid-cols-3 gap-2"
                  >
                    {(['SELLER', 'BUYER', '3PL'] as const).map((role) => (
                      <Label
                        key={role}
                        htmlFor={role}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                          formData.role === role
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RadioGroupItem value={role} id={role} className="sr-only" />
                        {getRoleLabel(role)}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="animate-pulse">Creating account...</span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="hidden md:block space-y-6">
          <Card className="border-2 border-blue-100">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RoleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">
                  {getRoleLabel(formData.role)} Benefits
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-3">
            {[
              { icon: CheckCircle2, text: 'Verified partners only' },
              { icon: Lock, text: 'Secure & encrypted' },
              { icon: CheckCircle2, text: 'No hidden fees' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">500+</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">₹200Cr+</p>
              <p className="text-sm text-gray-600">Monthly GMV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
