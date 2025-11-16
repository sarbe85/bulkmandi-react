import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  Package,
  Phone,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../hooks/useOnboarding";

interface StepInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function KYCStatus() {
  const navigate = useNavigate();
  // ✅ FIXED: Use hook properly
  const { data: onboarding, isLoading, error, fetchData } = useOnboarding();
  const { toast } = useToast();

  const [showRequestUpdateModal, setShowRequestUpdateModal] = useState(false);
  const [updateReason, setUpdateReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // ✅ FIXED: Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-bold text-red-900 dark:text-red-300">Error Loading KYC Status</h2>
                <p className="text-red-800 dark:text-red-400 text-sm mt-1">{error}</p>
              </div>
              <Button onClick={fetchData} size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading KYC status...</p>
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

  // ✅ Status Helpers
  const isKYCDraft = onboarding.kycStatus === "DRAFT";
  const isKYCSubmitted = onboarding.kycStatus === "SUBMITTED";
  const isKYCApproved = onboarding.kycStatus === "APPROVED";
  const isKYCRejected = onboarding.kycStatus === "REJECTED";
  const isRevisionRequested = onboarding.kycStatus === "REVISION_REQUESTED";
  const isInfoRequested = onboarding.kycStatus === "INFO_REQUESTED";

  const completedSteps = onboarding.completedSteps || [];

  // ✅ FIXED: Use string IDs matching your types
  const kycSteps: StepInfo[] = [
    {
      id: "ORG_KYC",
      title: "Organization KYC",
      description: "Business details and registration",
      icon: <Building2 className="w-5 h-5" />,
      completed: completedSteps.includes("ORG_KYC"),
    },
    {
      id: "BANK_DETAILS",
      title: "Bank Details",
      description: "Bank account information",
      icon: <CreditCard className="w-5 h-5" />,
      completed: completedSteps.includes("BANK_DETAILS"),
    },
    {
      id: "COMPLIANCE_DOCS",
      title: "Compliance Documents",
      description: "Required documents upload",
      icon: <FileText className="w-5 h-5" />,
      completed: completedSteps.includes("COMPLIANCE_DOCS"),
    },
    {
      id: "CATALOG_AND_PRICE",
      title: "Catalog & Pricing",
      description: "Product catalog setup",
      icon: <Package className="w-5 h-5" />,
      completed: completedSteps.includes("CATALOG_AND_PRICE"),
    },
  ];

  // ✅ Status Details
  const getStatusDetails = () => {
    if (isKYCApproved) {
      return {
        status: "APPROVED",
        title: "KYC Verified ✓",
        description: "Your account is fully verified and approved to trade on BulkMandi.",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-700",
        textColor: "text-green-900 dark:text-green-300",
        badgeColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />,
      };
    }
    if (isKYCSubmitted) {
      return {
        status: "SUBMITTED",
        title: "KYC Under Review",
        description: "Your KYC application has been submitted and is being reviewed by our team.",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-700",
        textColor: "text-blue-900 dark:text-blue-300",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        icon: <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      };
    }
    if (isRevisionRequested) {
      return {
        status: "REVISION_REQUESTED",
        title: "KYC Unlocked for Updates",
        description: "Admin has unlocked your KYC for updates. Please make necessary changes and resubmit.",
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        textColor: "text-yellow-900 dark:text-yellow-300",
        badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
      };
    }
    if (isInfoRequested) {
      return {
        status: "INFO_REQUESTED",
        title: "Admin Requested More Information",
        description: "Admin needs clarification on some details. Please review the message below and provide the requested information.",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        borderColor: "border-orange-200 dark:border-orange-700",
        textColor: "text-orange-900 dark:text-orange-300",
        badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        icon: <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />,
      };
    }
    if (isKYCRejected) {
      return {
        status: "REJECTED",
        title: "KYC Rejected",
        description: "Your KYC application was rejected. Please review the feedback and resubmit.",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-700",
        textColor: "text-red-900 dark:text-red-300",
        badgeColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />,
      };
    }
    // Default: DRAFT
    return {
      status: "DRAFT",
      title: "KYC Incomplete",
      description: "Start your KYC process to unlock all trading features.",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-700",
      textColor: "text-yellow-900 dark:text-yellow-300",
      badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      icon: <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
    };
  };

  const statusDetails = getStatusDetails();

  // ✅ Get correct navigation path based on user role
  const getOnboardingPath = () => {
    // Try to detect role from URL or use default
    const path = window.location.pathname;
    if (path.includes("seller")) return "/seller/onboarding";
    if (path.includes("buyer")) return "/buyer/onboarding";
    if (path.includes("logistics")) return "/logistics/onboarding";
    return "/seller/onboarding"; // Default
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KYC Status</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your Know Your Customer verification progress</p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            size="sm"
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Status Card */}
        <Card className={`${statusDetails.bgColor} ${statusDetails.borderColor} border-2 p-8 dark:bg-opacity-50`}>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 pt-1">{statusDetails.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-2xl font-bold ${statusDetails.textColor}`}>{statusDetails.title}</h2>
                <Badge className={statusDetails.badgeColor}>{statusDetails.status}</Badge>
              </div>
              <p className={`${statusDetails.textColor} opacity-80 mb-4`}>{statusDetails.description}</p>

              {/* Rejection Reason */}
              {isKYCRejected && onboarding.rejectionReason && (
                <div className={`mb-4 p-3 rounded-lg border ${statusDetails.bgColor}`}>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{onboarding.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {/* DRAFT - Start fresh */}
                {isKYCDraft && (
                  <Button onClick={() => navigate(getOnboardingPath())} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Start KYC
                  </Button>
                )}

                {/* SUBMITTED - Waiting for admin */}
                {isKYCSubmitted && (
                  <Button variant="outline" className="dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20" disabled>
                    📧 Check Email for Updates
                  </Button>
                )}

                {/* REJECTED - Fix and resubmit */}
                {isKYCRejected && (
                  <Button onClick={() => navigate(getOnboardingPath())} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Resubmit KYC
                  </Button>
                )}

                {/* REVISION_REQUESTED or INFO_REQUESTED - Edit and resubmit */}
                {(isRevisionRequested || isInfoRequested) && (
                  <Button onClick={() => navigate(getOnboardingPath())} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Update KYC
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completion Summary */}
          <Card className="bg-white dark:bg-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Completion Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Overall Progress</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((completedSteps.length / kycSteps.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(completedSteps.length / kycSteps.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>{completedSteps.length}</strong> of <strong>{kycSteps.length}</strong> steps completed
                </p>
              </div>
            </div>
          </Card>

          {/* Status Timeline */}
          <Card className="bg-white dark:bg-slate-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Current Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">{statusDetails.title}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {onboarding.updatedAt
                    ? new Date(onboarding.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Estimated Review Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">{isKYCSubmitted ? "3-5 Business Days" : isKYCDraft ? "-" : "0 Days"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* KYC Steps */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">KYC Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kycSteps.map((step) => (
              <Card
                key={step.id}
                className={`p-6 transition-all cursor-pointer hover:shadow-lg ${
                  step.completed ? "bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-700" : "bg-white dark:bg-slate-800"
                }`}
                onClick={() => navigate(getOnboardingPath())}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.completed
                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                          : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold ${step.completed ? "text-green-900 dark:text-green-300" : "text-gray-900 dark:text-white"}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.completed ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.completed && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✓ Done</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">How long does KYC verification take?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Our team typically completes verification within 3-5 business days. Some cases may take longer depending on document clarity and
                    completeness.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">What if my KYC is rejected?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    If rejected, you'll receive detailed feedback on what needs to be corrected. You can then edit your submission and resubmit for
                    review.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Can I update my KYC after approval?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Yes! If your documents expire or need updates, you can request an update. Admin will review and unlock your account for
                    modifications.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">What documents do I need?</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You'll need GST certificate, PAN, bank account details, and cancelled cheque. For private limited companies, CIN is also required.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Support Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            If you have any questions about the KYC process or your application status, please contact our support team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-900 dark:text-white">support@bulkmandi.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-semibold text-gray-900 dark:text-white">+91 9876543210</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
