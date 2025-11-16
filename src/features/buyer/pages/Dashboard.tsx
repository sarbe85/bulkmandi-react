// Copy from: seller/pages/Dashboard.tsx
// Change: Navigation paths /seller → /buyer

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ArrowRight, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingData } from '../hooks/useOnboardingData';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { onboarding } = useOnboardingData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Buyer Portal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your buyer dashboard</p>
        </div>

        {/* Status Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">KYC Status</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Current onboarding status and verification progress
              </p>
            </div>
            <Badge className={getStatusColor(onboarding?.kycStatus || 'DRAFT')}>
              {onboarding?.kycStatus || 'DRAFT'}
            </Badge>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <FileText className="w-10 h-10 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-semibold">Continue Onboarding</h3>
                <p className="text-sm text-gray-600">Complete your KYC verification</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => navigate('/buyer/onboarding')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Go to Onboarding →
            </button>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <Settings className="w-10 h-10 text-purple-500" />
              <div className="flex-1">
                <h3 className="font-semibold">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={() => navigate('/buyer/profile')}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              Go to Profile →
            </button>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {onboarding?.kycStatus === 'SUBMITTED' && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Onboarding submitted for verification</span>
              </div>
            )}
            {onboarding?.kycStatus === 'APPROVED' && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">KYC verification approved</span>
              </div>
            )}
            {onboarding?.kycStatus === 'REJECTED' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm">KYC verification rejected - Please review and resubmit</span>
              </div>
            )}
            {onboarding?.kycStatus === 'DRAFT' && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span className="text-sm">Onboarding in progress</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
