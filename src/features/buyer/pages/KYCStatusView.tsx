// Copy from: seller/pages/KYCStatusView.tsx
// Change: Navigation paths /seller → /buyer

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingData } from '../hooks/useOnboardingData';

export default function KYCStatusView() {
  const navigate = useNavigate();
  const { onboarding, silentRefresh } = useOnboardingData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'REJECTED':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'SUBMITTED':
        return <Clock className="w-12 h-12 text-blue-500" />;
      default:
        return <Clock className="w-12 h-12 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Your KYC has been approved. You can now start using the platform.';
      case 'REJECTED':
        return 'Your KYC was rejected. Please review the feedback and resubmit.';
      case 'SUBMITTED':
        return 'Your KYC is under review. This usually takes 24-48 hours.';
      default:
        return 'Complete your onboarding to submit for KYC verification.';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* Status Card */}
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            {getStatusIcon(onboarding?.kycStatus || 'DRAFT')}
          </div>
          <h1 className="text-2xl font-bold">
            KYC Status: <Badge className="ml-2">{onboarding?.kycStatus || 'DRAFT'}</Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getStatusMessage(onboarding?.kycStatus || 'DRAFT')}
          </p>
        </Card>

        {/* Details */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Verification Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-semibold">Verified</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Mobile</p>
              <p className="font-semibold">Verified</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">GSTIN</p>
              <p className="font-semibold">
                {onboarding?.orgKyc?.gstin ? 'Validated' : 'Pending'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Bank</p>
              <p className="font-semibold">
                {onboarding?.primaryBankAccount ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </Card>

        {/* Rejection Reason */}
        {onboarding?.rejectionReason && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200">
            <h2 className="font-semibold text-red-800 dark:text-red-400 mb-2">Rejection Reason</h2>
            <p className="text-red-700 dark:text-red-300">{onboarding.rejectionReason}</p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {onboarding?.kycStatus === 'REJECTED' && (
            <Button onClick={() => navigate('/buyer/onboarding')}>
              Resubmit Onboarding
            </Button>
          )}
          {onboarding?.kycStatus === 'DRAFT' && (
            <Button onClick={() => navigate('/buyer/onboarding')}>
              Continue Onboarding
            </Button>
          )}
          <Button variant="outline" onClick={() => silentRefresh()}>
            Refresh Status
          </Button>
          <Button variant="outline" onClick={() => navigate('/buyer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
