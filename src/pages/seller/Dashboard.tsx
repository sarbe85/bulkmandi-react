/**
 * Seller Dashboard Page
 * Comprehensive dashboard for seller users
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardData } from '@/types/api.types';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const dashboardData = await dashboardService.getDashboard();
      setData(dashboardData);
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Open RFQs',
      value: data.kpis.openRfqs,
      icon: FileText,
      description: 'New opportunities waiting',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/seller/rfqs'),
    },
    {
      title: 'Pending Quotes',
      value: data.kpis.quotesPendingAction,
      icon: Package,
      description: 'Awaiting response',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      action: () => navigate('/quotes'),
    },
    {
      title: 'Orders to Dispatch',
      value: data.kpis.ordersToDispatch,
      icon: Truck,
      description: 'Ready for fulfillment',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => navigate('/orders'),
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Demo Banner */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-sm text-center">
          <strong className="text-primary">Demo Mode:</strong> All data shown is mocked for demonstration purposes
        </p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your business overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((kpi) => (
          <Card 
            key={kpi.title} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            onClick={kpi.action}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardDescription className="text-xs">{kpi.description}</CardDescription>
                <CardTitle className="text-2xl font-bold">{kpi.value}</CardTitle>
                <p className="text-sm font-medium">{kpi.title}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Action Items
              </CardTitle>
              <Badge variant="secondary">{data.tasks.filter(t => !t.completed).length} pending</Badge>
            </div>
            <CardDescription>Important tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              data.tasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">
                        {task.title || task.type.replace(/_/g, ' ')}
                      </p>
                      <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Stats
            </CardTitle>
            <CardDescription>Performance overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Avg. Response Time</p>
                  <p className="text-xs text-muted-foreground">Time to submit quotes</p>
                </div>
              </div>
              <p className="text-2xl font-bold">2.4h</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Quote Win Rate</p>
                  <p className="text-xs text-muted-foreground">Accepted vs submitted</p>
                </div>
              </div>
              <p className="text-2xl font-bold">68%</p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">This Month GMV</p>
                  <p className="text-xs text-muted-foreground">Total order value</p>
                </div>
              </div>
              <p className="text-2xl font-bold">₹42L</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent RFQs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent RFQs</CardTitle>
            <CardDescription className="mt-1">Latest buyer requests matched to your catalog</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/rfqs')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {data.recentRfqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No RFQs available</p>
              <p className="text-sm mt-1">New opportunities will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentRfqs.map((rfq) => (
                <div
                  key={rfq.rfqId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 cursor-pointer transition-colors gap-3"
                  onClick={() => navigate(`/rfqs/${rfq.rfqId}`)}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">
                        {rfq.rfqId}
                      </Badge>
                      <Badge variant={rfq.status === 'OPEN' ? 'default' : 'secondary'}>
                        {rfq.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-base">{rfq.product}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {rfq.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {rfq.incoterms}
                      </span>
                      <span>PIN: {rfq.targetPin}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
