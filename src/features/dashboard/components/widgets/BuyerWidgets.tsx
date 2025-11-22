import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ArrowRight, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BuyerWidgetsProps {
  user: any;
  kycStatus?: string;
}

export default function BuyerWidgets({ user, kycStatus }: BuyerWidgetsProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-success/10 text-success border-success/30';
      case 'SUBMITTED':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'REJECTED':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name || 'Buyer'}!</h1>
        <p className="text-muted-foreground mt-1">Welcome to your buyer dashboard</p>
      </div>

      {/* Status Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">KYC Status</h2>
            <p className="text-muted-foreground">
              Current onboarding status and verification progress
            </p>
          </div>
          <Badge className={getStatusColor(kycStatus || 'DRAFT')}>
            {kycStatus || 'DRAFT'}
          </Badge>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold">Continue Onboarding</h3>
              <p className="text-sm text-muted-foreground">Complete your KYC verification</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <button
            onClick={() => navigate('/user/onboarding')}
            className="mt-4 text-primary hover:text-primary/80 font-semibold text-sm"
          >
            Go to Onboarding →
          </button>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <Settings className="w-10 h-10 text-accent" />
            <div className="flex-1">
              <h3 className="font-semibold">Edit Profile</h3>
              <p className="text-sm text-muted-foreground">Update your information</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <button
            onClick={() => navigate('/user/profile')}
            className="mt-4 text-accent hover:text-accent/80 font-semibold text-sm"
          >
            Go to Profile →
          </button>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {kycStatus === 'SUBMITTED' && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-sm">Onboarding submitted for verification</span>
            </div>
          )}
          {kycStatus === 'APPROVED' && (
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-sm">KYC verification approved</span>
            </div>
          )}
          {kycStatus === 'REJECTED' && (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span className="text-sm">KYC verification rejected - Please review and resubmit</span>
            </div>
          )}
          {kycStatus === 'DRAFT' && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <span className="text-sm">Onboarding in progress</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
