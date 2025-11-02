import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowRight, Building2, CheckCircle2, ShoppingCart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GetStarted() {
  const roles = [
    {
      id: 'seller',
      title: 'Seller',
      icon: Building2,
      desc: 'Sell your steel products to thousands of buyers',
      features: [
        'Reach pan-India buyers',
        'Competitive pricing',
        'Secure transactions',
      ],
      href: '/auth/register?role=seller',
    },
    {
      id: 'buyer',
      title: 'Buyer',
      icon: ShoppingCart,
      desc: 'Find the best steel products at competitive prices',
      features: [
        'Thousands of sellers',
        'Verified quality',
        'Direct quotes',
      ],
      href: '/auth/register?role=buyer',
    },
    {
      id: 'logistics',
      title: 'Logistics',
      icon: Truck,
      desc: 'Provide logistics services on our platform',
      features: [
        'High volume opportunities',
        'Regular shipments',
        'Easy integration',
      ],
      href: '/auth/register?role=logistics',
    },
  ];

  const benefits = [
    { icon: CheckCircle2, text: 'Instant verification' },
    { icon: CheckCircle2, text: 'Pan-India reach' },
    { icon: CheckCircle2, text: 'Secure payments' },
    { icon: CheckCircle2, text: '24/7 support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BulkMandi</h1>
          <Link to="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Choose your role and join India's leading B2B steel trading platform
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of buyers and sellers on BulkMandi. Complete your registration and start trading within minutes.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Icon className="h-10 w-10 mb-4 text-blue-600" />
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to={role.href}>
                    <Button className="w-full">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Why join BulkMandi?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 text-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                    <p className="text-sm font-medium">{benefit.text}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Already have an account?</p>
          <Link to="/auth/login">
            <Button variant="outline" size="lg">
              Login Here
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
