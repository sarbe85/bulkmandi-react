import { useOnboarding } from "@/features/shared/hooks/useOnboarding";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { AlertCircle, ArrowUp, CheckCircle2, Clock, Package, Star, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SharedHeader from "@/features/shared/components/layout/SharedHeader";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { data: onboarding, isLoading, error, fetchData } = useOnboarding();

  // ✅ FIXED: Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <h2 className="font-bold text-red-900 dark:text-red-300">Error Loading Dashboard</h2>
                <p className="text-red-800 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
              <Button 
                onClick={fetchData} 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // ========== HELPERS ==========
  const isKYCApproved = onboarding.kycStatus === "APPROVED";
  const isKYCSubmitted = onboarding.kycStatus === "SUBMITTED";
  const isKYCDraft = onboarding.kycStatus === "DRAFT";
  const isKYCRejected = onboarding.kycStatus === "REJECTED";

  // KYC Status Details
  const getKYCDetails = () => {
    if (isKYCApproved) {
      return {
        title: "KYC Verified ✓",
        description: "Your account is fully verified and ready to trade",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-700",
        textColor: "text-green-900 dark:text-green-300",
        icon: <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />,
        actionButton: null,
      };
    }
    if (isKYCSubmitted) {
      return {
        title: "KYC Under Review",
        description: "Your application is being reviewed. Please wait for approval.",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-700",
        textColor: "text-blue-900 dark:text-blue-300",
        icon: <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        actionButton: null,
      };
    }
    if (isKYCRejected) {
      return {
        title: "KYC Rejected",
        description: "Your KYC was rejected. Please resubmit with correct information.",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
        textColor: "text-red-900 dark:text-red-300",
        icon: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
        actionButton: "Resubmit KYC",
      };
    }
    // DRAFT or INCOMPLETE
    return {
      title: "KYC Incomplete",
      description: "Complete your KYC to unlock all features",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-700",
      textColor: "text-yellow-900 dark:text-yellow-300",
      icon: <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      actionButton: "Complete KYC",
    };
  };

  const kycDetails = getKYCDetails();

  return (
    <>
      <SharedHeader kycStatus={onboarding?.kycStatus} userType="SELLER" />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* ========== PAGE HEADER ========== */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your business today.</p>
          </div>
          <Button 
            onClick={fetchData} 
            variant="outline" 
            size="sm" 
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        {/* ========== KYC STATUS SECTION ========== */}
        <Card className={`${kycDetails.bgColor} ${kycDetails.borderColor} border-2 p-6 dark:bg-opacity-50`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1">{kycDetails.icon}</div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${kycDetails.textColor} mb-2`}>{kycDetails.title}</h2>
                <p className={`${kycDetails.textColor} opacity-80`}>{kycDetails.description}</p>
              </div>
            </div>

            {/* Action Button */}
            {kycDetails.actionButton && !isKYCApproved && (
              <Button 
                onClick={() => navigate("/seller/onboarding")} 
                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
              >
                {kycDetails.actionButton}
              </Button>
            )}
          </div>
        </Card>

        {/* ========== KYC PROGRESS SECTION ========== */}
        {onboarding.completedSteps && onboarding.completedSteps.length > 0 && (
          <Card className="bg-white dark:bg-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Onboarding Progress</h3>
            <div className="flex flex-wrap gap-2">
              {onboarding.completedSteps.map((step) => (
                <Badge
                  key={step}
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700"
                >
                  ✓ {step}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* ========== STATS GRID ========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active RFQs Card */}
          <Card className="bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                +2
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Active RFQs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
          </Card>

          {/* Total Orders Card */}
          <Card className="bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                +1
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
          </Card>

          {/* Seller Rating Card */}
          <Card className="bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                +5
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Rating</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">4.8★</p>
          </Card>

          {/* Revenue Card */}
          <Card className="bg-white dark:bg-slate-800 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                <ArrowUp className="w-4 h-4" />
                +12%
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">This Month Revenue</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹45.2K</p>
          </Card>
        </div>

        {/* ========== RECENT ACTIVITY SECTION ========== */}
        <Card className="bg-white dark:bg-slate-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>

          <div className="space-y-4">
            {/* Activity Item 1 */}
            <div className="flex items-start gap-4 pb-4 border-b dark:border-slate-700 last:border-b-0 last:pb-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">New RFQ Received</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You received a new RFQ for industrial components</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">2 hours ago</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start gap-4 pb-4 border-b dark:border-slate-700 last:border-b-0 last:pb-0">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">Order Confirmed</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your quote was accepted by Acme Corp</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">1 day ago</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start gap-4 pb-4 border-b dark:border-slate-700 last:border-b-0 last:pb-0">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">New Rating Received</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">SteelCorp Industries gave you a 5-star rating</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">3 days ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => navigate("/seller/onboarding")} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Complete KYC
          </Button>
          <Button
            onClick={() => navigate("/seller/rfqs")}
            variant="outline"
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            View RFQs
          </Button>
          <Button
            onClick={() => navigate("/seller/kyc-status")}
            variant="outline"
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            KYC Status
          </Button>
        </div>
        </div>
      </div>
    </>
  );
}
