import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
const [email, setEmail] = useState('user@test.com');
const [password, setPassword] = useState('password123');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          {/* Left: Form */}
          <Card className="shadow-2xl border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email Field */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium">
                      Password
                    </Label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-9 text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-9 text-sm font-medium mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-3 w-3 border-2 border-background/30 border-t-background rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>

                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    New to platform?{' '}
                    <Link
                      to="/get-started"
                      className="text-primary hover:underline font-medium"
                    >
                      Get Started
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Right: Benefits / Info */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Quick Benefits */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Why Login?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Access your dashboard</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Manage RFQs & Orders</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Track shipments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Security & Trust */}
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">Secure & encrypted</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">24/7 support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">Real-time updates</span>
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
