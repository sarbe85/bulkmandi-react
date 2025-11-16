import { useAuth } from '@/features/auth/hooks/useAuth';
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
import { useToast } from '@/shared/components/ui/use-toast';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: 'xxx@bulkmandi.com',
    password: 'qwerty123',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
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
    // Call login API
    const response = await login(formData);

    // Guard: Check if response/user is valid
    if (!response || !response.user) {
      throw new Error('User not registered.');
    }

    console.log('✅ Login successful:', {
      role: response.user.role,
      email: response.user.email,
    });

    toast({
      title: 'Success',
      description: 'Login successful! Redirecting...',
    });

    setTimeout(() => {
      if (response.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (response.user.role === 'SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else if (response.user.role === 'BUYER') {
        navigate('/buyer/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }, 500);
  } catch (error: any) {
    console.error('❌ Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.response?.data?.message) {
      const msg = error.response.data.message;
      errorMessage = Array.isArray(msg) ? msg.join(', ') : String(msg);
    }
    toast({
      title: 'Login Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};


  const handleChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Form */}
        <Card className="h-full flex flex-col shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to BulkMandi Admin/Seller Portal</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@test.com"
                    value={formData.email}
                    onChange={handleChange('email')}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange('password')}
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              India's Leading B2B Steel Marketplace
            </h2>
            <p className="text-lg text-gray-600">
              Connect with verified buyers and sellers across the country
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Real-time pricing & inventory',
              'Secure payment & logistics',
              'Verified business partners',
              '24/7 customer support',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-4xl font-bold text-blue-600">500+</p>
              <p className="text-gray-600 text-sm mt-1">Active Partners</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-4xl font-bold text-green-600">₹200Cr+</p>
              <p className="text-gray-600 text-sm mt-1">Monthly GMV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
