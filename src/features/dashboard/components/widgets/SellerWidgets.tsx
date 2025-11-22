import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { AlertCircle, ArrowUp, CheckCircle2, Clock, Package, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SellerWidgetsProps {
  user: any;
  kycStatus?: string;
}

export default function SellerWidgets({ user, kycStatus }: SellerWidgetsProps) {
  const navigate = useNavigate();

  const isKYCApproved = kycStatus === "APPROVED";
  const isKYCSubmitted = kycStatus === "SUBMITTED";
  const isKYCDraft = kycStatus === "DRAFT";
  const isKYCRejected = kycStatus === "REJECTED";

  const getKYCDetails = () => {
    if (isKYCApproved) {
      return {
        title: "KYC Verified ✓",
        description: "Your account is fully verified and ready to trade",
        bgColor: "bg-success/10",
        borderColor: "border-success/30",
        textColor: "text-success-foreground",
        icon: <CheckCircle2 className="w-6 h-6 text-success" />,
        actionButton: null,
      };
    }
    if (isKYCSubmitted) {
      return {
        title: "KYC Under Review",
        description: "Your application is being reviewed. Please wait for approval.",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
        textColor: "text-primary-foreground",
        icon: <Clock className="w-6 h-6 text-primary" />,
        actionButton: null,
      };
    }
    if (isKYCRejected) {
      return {
        title: "KYC Rejected",
        description: "Your KYC was rejected. Please resubmit with correct information.",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        textColor: "text-destructive-foreground",
        icon: <AlertCircle className="w-6 h-6 text-destructive" />,
        actionButton: "Resubmit KYC",
      };
    }
    return {
      title: "KYC Incomplete",
      description: "Complete your KYC to unlock all features",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      textColor: "text-warning-foreground",
      icon: <AlertCircle className="w-6 h-6 text-warning" />,
      actionButton: "Complete KYC",
    };
  };

  const kycDetails = getKYCDetails();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'Seller'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your business today.</p>
      </div>

      {/* KYC Status */}
      <Card className={`${kycDetails.bgColor} ${kycDetails.borderColor} border-2 p-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="mt-1">{kycDetails.icon}</div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-2`}>{kycDetails.title}</h2>
              <p className="text-muted-foreground">{kycDetails.description}</p>
            </div>
          </div>
          {kycDetails.actionButton && !isKYCApproved && (
            <Button onClick={() => navigate("/user/onboarding")}>
              {kycDetails.actionButton}
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              +2
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-2">Active RFQs</p>
          <p className="text-3xl font-bold">24</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              +1
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-2">Total Orders</p>
          <p className="text-3xl font-bold">156</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-warning" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              +5
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-2">Your Rating</p>
          <p className="text-3xl font-bold">4.8★</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div className="flex items-center gap-1 text-success text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              +12%
            </div>
          </div>
          <p className="text-muted-foreground text-sm mb-2">This Month Revenue</p>
          <p className="text-3xl font-bold">₹45.2K</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">New RFQ Received</p>
              <p className="text-sm text-muted-foreground mt-1">You received a new RFQ for industrial components</p>
              <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Order Confirmed</p>
              <p className="text-sm text-muted-foreground mt-1">Your quote was accepted by Acme Corp</p>
              <p className="text-xs text-muted-foreground mt-2">1 day ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0">
            <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">New Rating Received</p>
              <p className="text-sm text-muted-foreground mt-1">SteelCorp Industries gave you a 5-star rating</p>
              <p className="text-xs text-muted-foreground mt-2">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => navigate("/user/onboarding")}>
          Complete KYC
        </Button>
        <Button onClick={() => navigate("/user/rfqs")} variant="outline">
          View RFQs
        </Button>
        <Button onClick={() => navigate("/user/kyc-status")} variant="outline">
          KYC Status
        </Button>
      </div>
    </div>
  );
}
