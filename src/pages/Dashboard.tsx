import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { DashboardData } from '@/types/api.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Package, Truck, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Open RFQs',
      value: data.kpis.openRfqs,
      icon: FileText,
      color: 'text-primary',
      action: () => navigate('/rfqs'),
    },
    {
      title: 'Quotes Pending',
      value: data.kpis.quotesPendingAction,
      icon: Package,
      color: 'text-warning',
      action: () => navigate('/quotes'),
    },
    {
      title: 'Orders to Dispatch',
      value: data.kpis.ordersToDispatch,
      icon: Truck,
      color: 'text-success',
      action: () => navigate('/orders'),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your business overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <Card 
              key={kpi.title} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={kpi.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">
                      {task.type.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    task.priority === 'HIGH'
                      ? 'destructive'
                      : task.priority === 'MEDIUM'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent RFQs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent RFQs</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/rfqs')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentRfqs.map((rfq) => (
                <div
                  key={rfq.rfqId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/rfqs/${rfq.rfqId}`)}
                >
                  <div className="space-y-1">
                    <div className="font-medium">{rfq.product}</div>
                    <div className="text-sm text-muted-foreground">
                      {rfq.quantity} • {rfq.incoterms} • {rfq.targetPin}
                    </div>
                  </div>
                  <Badge variant="secondary">{rfq.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
