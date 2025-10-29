/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Package,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerHeader from '../components/SellerHeader';
import { onboardingService } from '../services/onboarding.service';

interface Stats {
  pendingRFQs: number;
  activeQuotes: number;
  totalOrders: number;
  revenue: number;
  kycStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  completedSteps: string[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'rfq' | 'quote' | 'order' | 'kyc';
}

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    pendingRFQs: 0,
    activeQuotes: 0,
    totalOrders: 0,
    revenue: 0,
    kycStatus: 'DRAFT',
    completedSteps: [],
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const status = await onboardingService.getOnboardingStatus();
      
      setStats({
        pendingRFQs: 5,
        activeQuotes: 8,
        totalOrders: 23,
        revenue: 450000,
        kycStatus: status.kycStatus as any,
        completedSteps: status.completedSteps || [],
      });

      setRecentActivity([
        {
          id: '1',
          title: 'New RFQ Received',
          description: 'Wheat Grade A - 1000 MT',
          time: '2 hours ago',
          type: 'rfq',
        },
        {
          id: '2',
          title: 'Quote Accepted',
          description: 'Rice Grade B - 500 MT',
          time: '1 day ago',
          type: 'quote',
        },
        {
          id: '3',
          title: 'Order Completed',
          description: 'Pulses Mixed - 200 MT',
          time: '3 days ago',
          type: 'order',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getKYCStatusDetails = () => {
    switch (stats.kycStatus) {
      case 'APPROVED':
        return {
          color: 'bg-green-50 border-green-200',
          icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
          title: 'KYC Approved ✅',
          description: 'Your account is fully verified. You can access all features.',
          showAction: false,
        };
      case 'SUBMITTED':
        return {
          color: 'bg-blue-50 border-blue-200',
          icon: <Clock className="h-5 w-5 text-blue-600" />,
          title: 'KYC Under Review',
          description: 'Your application is being reviewed. You can still use basic features.',
          showAction: true,
          actionText: 'View Status',
        };
      case 'REJECTED':
        return {
          color: 'bg-red-50 border-red-200',
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          title: 'KYC Rejected',
          description: 'Your application was rejected. Please update and resubmit.',
          showAction: true,
          actionText: 'Update KYC',
        };
      default:
        return {
          color: 'bg-yellow-50 border-yellow-200',
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          title: 'Complete Your KYC',
          description: 'Complete your onboarding to start receiving RFQs and orders.',
          showAction: true,
          actionText: 'Start KYC',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SellerHeader kycStatus={stats.kycStatus} />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  const kycDetails = getKYCStatusDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader kycStatus={stats.kycStatus} showKYCBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* KYC Status Alert */}
        {stats.kycStatus !== 'APPROVED' && (
          <Card className={`mb-8 border-2 ${kycDetails.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {kycDetails.icon}
                  <div>
                    <h3 className="font-semibold text-lg">{kycDetails.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {kycDetails.description}
                    </p>
                  </div>
                </div>
                {kycDetails.showAction && (
                  <Button
                    onClick={() =>
                      navigate(
                        stats.kycStatus === 'SUBMITTED'
                          ? '/seller/kyc-status'
                          : '/seller/onboarding'
                      )
                    }
                  >
                    {kycDetails.actionText}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending RFQs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRFQs}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeQuotes}</div>
              <p className="text-xs text-muted-foreground">+1 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">+5 this month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue (₹)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(stats.revenue / 100000).toFixed(1)}L
              </div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Activity
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'rfq'
                            ? 'bg-blue-100 text-blue-600'
                            : activity.type === 'quote'
                            ? 'bg-green-100 text-green-600'
                            : activity.type === 'order'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {activity.type === 'rfq' && <Package className="h-4 w-4" />}
                        {activity.type === 'quote' && <FileText className="h-4 w-4" />}
                        {activity.type === 'order' && <CheckCircle2 className="h-4 w-4" />}
                        {activity.type === 'kyc' && <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/seller/rfqs')}
              >
                <Package className="h-4 w-4 mr-2" />
                View RFQs
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/seller/quotes')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Quotes
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/seller/orders')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Track Orders
              </Button>
              {stats.kycStatus !== 'APPROVED' && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/seller/kyc-status')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Complete KYC
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}