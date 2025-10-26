import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { onboardingService } from "@/services/onboarding.service";
import { KYCCheck, KYCStatusResponse } from "@/types/onboarding.types";
import { AlertCircle, Check, Clock, Edit, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function KYCStatus() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<KYCStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const data = await onboardingService.getKYCStatus();
      setStatus(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch KYC status.";
      toast({
        title: "Failed to load status",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await onboardingService.refreshKYCStatus();
      setStatus(data);
      toast({
        title: "Status Refreshed",
        description: "KYC status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh status.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to edit specific section
  const handleEdit = (checkName: string) => {
    // Map check names to onboarding steps
    const stepMapping: Record<string, string> = {
      GSTIN: "org-kyc",
      PAN: "org-kyc",
      "Bank Account": "bank-docs",
      "Watchlist Check": "org-kyc",
      "Factory License": "bank-docs",
    };

    const step = stepMapping[checkName];
    if (step) {
      // Navigate to seller-onboarding with step parameter
      navigate(`/seller-onboarding?step=${step}`);
    }
  };

  const getStatusIcon = (checkStatus: KYCCheck["status"]) => {
    switch (checkStatus) {
      case "validated":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (checkStatus: KYCCheck["status"]) => {
    switch (checkStatus) {
      case "validated":
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            Validated
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  // Show edit button for validated, pending, or failed statuses
  const canEdit = (checkStatus: KYCCheck["status"]) => {
    return ["validated", "pending", "failed"].includes(checkStatus);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <p className="text-muted-foreground">Unable to load KYC status.</p>
          <Button onClick={loadStatus} className="mt-4">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const checks = [
    { name: "GSTIN", check: status.checks.gstin },
    { name: "PAN", check: status.checks.pan },
    { name: "Bank Account", check: status.checks.bank },
    { name: "Watchlist Check", check: status.checks.watchlist },
    { name: "Factory License", check: status.checks.factoryLicense },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Demo Mode Banner */}
        <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-primary">Demo Mode:</strong> Showing mock
            KYC verification data
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">KYC Status</h2>
              <p className="text-muted-foreground mt-1">Seller Verification</p>
            </div>
            <Badge
              variant="outline"
              className={
                status.overallStatus === "approved"
                  ? "bg-success/10 text-success border-success/20"
                  : status.overallStatus === "rejected"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-warning/10 text-warning border-warning/20"
              }
            >
              {status.overallStatus.replace(/_/g, " ").toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-3 mb-6">
            {checks.map(({ name, check }) => (
              <div
                key={name}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      check.status === "validated"
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <p className="font-medium">{name}</p>
                    {check.message && (
                      <p className="text-xs text-muted-foreground">
                        {check.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(check.status)}
                  {canEdit(check.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(name)}
                      className="h-8"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {status.nextSteps.length > 0 && (
            <Card className="p-4 border-dashed bg-muted/20 mb-6">
              <p className="text-sm font-medium mb-2">Next Steps</p>
              <ul className="space-y-1">
                {status.nextSteps.map((step, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {status.rejectionReasons && status.rejectionReasons.length > 0 && (
            <Card className="p-4 border-destructive/20 bg-destructive/5 mb-6">
              <p className="text-sm font-medium text-destructive mb-2">
                Issues Found
              </p>
              <ul className="space-y-1">
                {status.rejectionReasons.map((reason, index) => (
                  <li
                    key={index}
                    className="text-sm text-destructive/80 flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Status
            </Button>

            {status.canStartQuoting ? (
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/seller-onboarding")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Complete Onboarding
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
