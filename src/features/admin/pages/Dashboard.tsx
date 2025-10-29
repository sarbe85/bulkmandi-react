// import { AdminDashboardData, adminService } from '@/services/admin.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Clock, FileText, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import adminService from '../services/admin.service';

interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalOrders: number;
    totalRfqs: number;
    platformRevenue: number;
  };
  userStats: {
    sellers: number;
    buyers: number;
    threepl: number;
    admins: number;
  };
  pendingApprovals: {
    kycPending: number;
    catalogPending: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    user: string;
    details: string;
    timestamp: string;
  }>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Mock dashboard data for now
      const dashboardData: AdminDashboardData = {
        kpis: {
          totalUsers: 150,
          totalOrders: 342,
          totalRfqs: 89,
          platformRevenue: 12500000,
        },
        userStats: {
          sellers: 67,
          buyers: 78,
          threepl: 3,
          admins: 2,
        },
        pendingApprovals: {
          kycPending: 5,
          catalogPending: 3,
        },
        recentActivity: [
          {
            id: '1',
            type: 'USER_REGISTERED',
            user: 'ABC Steel Industries',
            details: 'New seller registration',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          },
          {
            id: '2',
            type: 'ORDER_PLACED',
            user: 'XYZ Manufacturing',
            details: 'Placed order for 50MT TMT Bars',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          },
          {
            id: '3',
            type: 'KYC_APPROVED',
            user: 'Steel Corp India',
            details: 'KYC verification completed',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
        ],
      };
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return <Users className="h-4 w-4" />;
      case 'ORDER_PLACED':
        return <ShoppingCart className="h-4 w-4" />;
      case 'RFQ_CREATED':
        return <FileText className="h-4 w-4" />;
      case 'KYC_APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return 'bg-blue-500/10 text-blue-500';
      case 'ORDER_PLACED':
        return 'bg-green-500/10 text-green-500';
      case 'RFQ_CREATED':
        return 'bg-purple-500/10 text-purple-500';
      case 'KYC_APPROVED':
        return 'bg-emerald-500/10 text-emerald-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading || !data) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.userStats.sellers} sellers, {data.userStats.buyers} buyers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpis.totalRfqs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.kpis.platformRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total transaction value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">KYC Verifications</p>
                  <p className="text-sm text-muted-foreground">Pending review</p>
                </div>
              </div>
              <Badge variant="secondary">{data.pendingApprovals.kycPending}</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Catalog Approvals</p>
                  <p className="text-sm text-muted-foreground">Pending review</p>
                </div>
              </div>
              <Badge variant="secondary">{data.pendingApprovals.catalogPending}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
          <CardDescription>Breakdown by user type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.userStats.sellers}</p>
              <p className="text-sm text-muted-foreground mt-1">Sellers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.userStats.buyers}</p>
              <p className="text-sm text-muted-foreground mt-1">Buyers</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.userStats.threepl}</p>
              <p className="text-sm text-muted-foreground mt-1">3PL Partners</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.userStats.admins}</p>
              <p className="text-sm text-muted-foreground mt-1">Admins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
