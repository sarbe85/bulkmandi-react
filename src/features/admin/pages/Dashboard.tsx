/**
 * Admin Dashboard Page
 * Path: src/features/admin/pages/Dashboard.tsx
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { useToast } from '@/shared/hooks/use-toast';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  FileCheck,
  Loader2,
  Scale,
  TrendingUp,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import adminKYCService from '../services/admin-kyc.service';
import { DashboardStats } from '../types/admin-kyc.types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminKYCService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Unable to load dashboard data</p>
        <Button onClick={loadDashboardStats} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/kyc/queue')}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              View KYC Queue
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KYC Stats Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            KYC Verification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Pending KYC"
              value={stats.kyc.pending}
              icon={Clock}
              color="yellow"
              subtitle="Awaiting review"
            />
            <StatsCard
              title="Sellers"
              value={stats.kyc.breakdown.sellers}
              icon={Users}
              color="blue"
              subtitle="Pending seller KYC"
            />
            <StatsCard
              title="Buyers"
              value={stats.kyc.breakdown.buyers}
              icon={Users}
              color="purple"
              subtitle="Pending buyer KYC"
            />
            <StatsCard
              title="3PL Partners"
              value={stats.kyc.breakdown.threepl}
              icon={Users}
              color="red"
              subtitle="Pending 3PL KYC"
            />
          </div>
        </div>

        {/* Price Flags & Disputes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Operations Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Price Flags"
              value={stats.priceFlags.total}
              icon={AlertTriangle}
              color="yellow"
              subtitle={`${stats.priceFlags.rfqs} RFQs, ${stats.priceFlags.quotes} Quotes`}
            />
            <StatsCard
              title="Open Disputes"
              value={stats.disputes.open}
              icon={Scale}
              color="red"
              subtitle={`${stats.disputes.new} new, ${stats.disputes.escalated} escalated`}
            />
            <StatsCard
              title="Today's Payouts"
              value={`₹${(stats.settlements.todayPayouts / 100000).toFixed(1)}L`}
              icon={DollarSign}
              color="green"
              subtitle={`${stats.settlements.pendingBatches} batches pending`}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/admin/kyc/queue?status=SUBMITTED')}
            >
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">Review Pending KYC</span>
              <span className="text-xs text-gray-600">{stats.kyc.pending} waiting</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/admin/disputes')}
            >
              <Scale className="h-5 w-5 text-red-600" />
              <span className="font-semibold">Resolve Disputes</span>
              <span className="text-xs text-gray-600">{stats.disputes.new} new cases</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/admin/settlements')}
            >
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Settlement Recon</span>
              <span className="text-xs text-gray-600">
                {stats.settlements.exceptions} exception(s)
              </span>
            </Button>
          </div>
        </Card>

        {/* Recent Activity - Placeholder */}
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-600">
            Activity log coming soon...
          </p>
        </Card>

      </div>
    </div>
  );
}
