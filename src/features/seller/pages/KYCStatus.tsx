import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Package,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOnboardingData } from "../hooks/useOnboardingData";
import { ONBOARDING_STEP_DESCRIPTIONS, ONBOARDING_STEP_LABELS, ONBOARDING_STEPS } from "../types/onboarding.types";

interface StepInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function KYCStatus() {
  const navigate = useNavigate();
  // ✅ Get data from hook - no useEffect needed!
  const { onboarding, silentRefresh, error } = useOnboardingData();

  if (error) {
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
              <Button onClick={silentRefresh} size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0">
                Retry
              </Button>
            </div>
          </div>
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
  const completedSteps = onboarding.completedSteps || [];

  // Define KYC steps
  const kycSteps: StepInfo[] = [
    {
      id: ONBOARDING_STEPS.ORG_KYC,
      title: ONBOARDING_STEP_LABELS[ONBOARDING_STEPS.ORG_KYC],
      description: ONBOARDING_STEP_DESCRIPTIONS[ONBOARDING_STEPS.ORG_KYC],
      icon: <Building2 className="w-5 h-5" />,
      completed: completedSteps.includes(ONBOARDING_STEPS.ORG_KYC),
    },
    {
      id: ONBOARDING_STEPS.BANK_DETAILS,
      title: ONBOARDING_STEP_LABELS[ONBOARDING_STEPS.BANK_DETAILS],
      description: ONBOARDING_STEP_DESCRIPTIONS[ONBOARDING_STEPS.BANK_DETAILS],
      icon: <CreditCard className="w-5 h-5" />,
      completed: completedSteps.includes(ONBOARDING_STEPS.BANK_DETAILS),
    },
    {
      id: ONBOARDING_STEPS.COMPLIANCE_DOCS,
      title: ONBOARDING_STEP_LABELS[ONBOARDING_STEPS.COMPLIANCE_DOCS],
      description: ONBOARDING_STEP_DESCRIPTIONS[ONBOARDING_STEPS.COMPLIANCE_DOCS],
      icon: <FileText className="w-5 h-5" />,
      completed: completedSteps.includes(ONBOARDING_STEPS.COMPLIANCE_DOCS),
    },
    {
      id: ONBOARDING_STEPS.CATALOG_AND_PRICE,
      title: ONBOARDING_STEP_LABELS[ONBOARDING_STEPS.CATALOG_AND_PRICE],
      description: ONBOARDING_STEP_DESCRIPTIONS[ONBOARDING_STEPS.CATALOG_AND_PRICE],
      icon: <Package className="w-5 h-5" />,
      completed: completedSteps.includes(ONBOARDING_STEPS.CATALOG_AND_PRICE),
    },
  ];

  // Get status badge details
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
    // DRAFT or INCOMPLETE
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ========== PAGE HEADER ========== */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">KYC Status</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your Know Your Customer verification progress</p>
          </div>
          <Button
            onClick={silentRefresh}
            variant="outline"
            size="sm"
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* ========== STATUS CARD ========== */}
        <Card className={`${statusDetails.bgColor} ${statusDetails.borderColor} border-2 p-8 dark:bg-opacity-50`}>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 pt-1">{statusDetails.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-2xl font-bold ${statusDetails.textColor}`}>{statusDetails.title}</h2>
                <Badge className={statusDetails.badgeColor}>{statusDetails.status}</Badge>
              </div>
              <p className={`${statusDetails.textColor} opacity-80 mb-4`}>{statusDetails.description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isKYCApproved && (
                  <Button
                    onClick={() => navigate("/seller/onboarding")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isKYCDraft ? "Start KYC" : isKYCRejected ? "Resubmit KYC" : "View KYC"}
                  </Button>
                )}
                {isKYCSubmitted && (
                  <Button
                    variant="outline"
                    className="dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                  >
                    📧 Check Email for Updates
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* ========== PROGRESS INFORMATION ========== */}
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
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Estimated Review Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {isKYCSubmitted ? "3-5 Business Days" : isKYCDraft ? "-" : "0 Days"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ========== KYC STEPS ========== */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">KYC Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kycSteps.map((step, index) => (
              <Card
                key={step.id}
                className={`p-6 transition-all cursor-pointer hover:shadow-lg ${
                  step.completed
                    ? "bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-700"
                    : "bg-white dark:bg-slate-800"
                }`}
                onClick={() => navigate("/seller/onboarding")}
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
                      <h3
                        className={`font-bold ${
                          step.completed ? "text-green-900 dark:text-green-300" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          step.completed ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.completed && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      ✓ Done
                    </Badge>
                  )}
                </div>

                {!step.completed && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    Complete Step
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* ========== HELPFUL INFO ========== */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Need Help?</h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                If you have any questions about the KYC process or your application status, please contact our support
                team.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  📧 Email:{" "}
                  <a href="mailto:support@bulkmandi.com" className="font-semibold hover:underline">
                    support@bulkmandi.com
                  </a>
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  📞 Phone:{" "}
                  <a href="tel:+919876543210" className="font-semibold hover:underline">
                    +91 9876543210
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ========== QUICK ACTIONS ========== */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigate("/seller/onboarding")} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isKYCApproved ? "View Onboarding" : "Complete KYC"}
          </Button>
          <Button
            onClick={() => navigate("/seller/dashboard")}
            variant="outline"
            className="dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-800"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
