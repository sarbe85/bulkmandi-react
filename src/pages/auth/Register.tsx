import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/api.types';
import {
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
import { toast } from 'sonner';


export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.mobile || !formData.organizationName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register(formData);
      toast.success('Registration successful! Please complete your onboarding.');
      navigate(formData.role === 'SELLER' ? '/seller/onboarding' : '/seller/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          {/* Left: Form */}
          <Card className="shadow-2xl border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                {isRolePreselected ? (
                  <span className="flex items-center gap-2 mt-1">
                    Registering as
                    <Badge variant="secondary">{getRoleLabel(formData.role)}</Badge>
                  </span>
                ) : (
                  'Join the platform and start trading'
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Organization Name */}
                <div className="space-y-1">
                  <Label htmlFor="organizationName" className="text-xs font-medium">
                    Organization Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Steel Manufacturing Ltd"
                      value={formData.organizationName}
                      onChange={handleChange('organizationName')}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange('email')}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <Label htmlFor="mobile" className="text-xs font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+919876543210"
                      value={formData.mobile}
                      onChange={handleChange('mobile')}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange('password')}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Min 6 characters</p>
                </div>

                {/* Account Type - Compact Tabs */}
                {!isRolePreselected && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-medium">Account Type</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                      className="grid grid-cols-3 gap-2"
                    >
                      {(['SELLER', 'BUYER', '3PL'] as const).map((role) => (
                        <div key={role}>
                          <RadioGroupItem value={role} id={role} className="sr-only" />
                          <Label
                            htmlFor={role}
                            className={`block p-2 text-center cursor-pointer border rounded-lg text-xs font-medium transition-colors ${
                              formData.role === role
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            {getRoleLabel(role)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-9 text-sm font-medium mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-3 w-3 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Have an account?{' '}
                    <Link to="/auth/login" className="text-primary hover:underline font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Benefits / Info */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Role Benefits */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <RoleIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {getRoleLabel(formData.role)} Benefits
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Trust & Security */}
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">Verified partners only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">Secure & encrypted</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">No hidden fees</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div>
                <div className="font-bold text-primary text-lg">500+</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="font-bold text-primary text-lg">₹200Cr+</div>
                <div className="text-xs text-muted-foreground">Monthly GMV</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
