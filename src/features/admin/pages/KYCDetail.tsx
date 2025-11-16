import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Unlock,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RiskBadge from "../components/RiskBadge";
import adminKYCService from "../services/admin-kyc.service";
import { KYCCaseDetail, KYCHistoryItem } from "../types/admin-kyc.types";
import { cn } from "@/lib/utils";

export default function KYCDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [caseDetail, setCaseDetail] = useState<KYCCaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History panel state
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [kycHistory, setKycHistory] = useState<KYCHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryCaseId, setSelectedHistoryCaseId] = useState<string | null>(null);

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Form States
  const [approveRemarks, setApproveRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");
  const [unlockRemarks, setUnlockRemarks] = useState("");

  useEffect(() => {
    if (caseId) {
      loadCaseDetail(caseId);
    }
  }, [caseId]);

  const loadCaseDetail = async (targetCaseId: string) => {
    try {
      setIsLoading(true);
      const data = await adminKYCService.getKYCCaseDetail(targetCaseId);
      setCaseDetail(data);
      setSelectedHistoryCaseId(targetCaseId);
    } catch (error: any) {
      console.error("Failed to load case detail:", error);
      toast({
        title: "Error",
        description: "Failed to load case details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadKycHistory = async () => {
    if (!caseDetail?.organization.id) return;

    try {
      setIsLoadingHistory(true);
      const history = await adminKYCService.getKYCHistory(caseDetail.organization.id);
      setKycHistory(history);
    } catch (error: any) {
      console.error("Failed to load history:", error);
      toast({
        title: "Error",
        description: "Failed to load KYC history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryRecordClick = (historyCaseId: string) => {
    loadCaseDetail(historyCaseId);
  };

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await adminKYCService.approveKYC(caseId!, {
        remarks: approveRemarks || "All documents verified successfully",
      });

      toast({
        title: "KYC Approved",
        description: "Organization has been verified and activated",
      });

      await loadCaseDetail(caseId!);
      setShowApproveModal(false);
      setApproveRemarks("");
    } catch (error: any) {
      console.error("Failed to approve KYC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve KYC",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a detailed reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await adminKYCService.rejectKYC(caseId!, {
        rejectionReason: rejectionReason,
      });

      toast({
        title: "KYC Rejected",
        description: "Seller has been notified and can resubmit",
      });

      await loadCaseDetail(caseId!);
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Failed to reject KYC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject KYC",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!requestInfoMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide the information you need",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await adminKYCService.requestInfo(caseId!, {
        message: requestInfoMessage,
        fields: [],
      });

      toast({
        title: "Information Requested",
        description: "Seller has been notified and can submit updated documents",
      });

      await loadCaseDetail(caseId!);
      setShowRequestInfoModal(false);
      setRequestInfoMessage("");
    } catch (error: any) {
      console.error("Failed to request info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to request information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockForUpdate = async () => {
    try {
      setIsSubmitting(true);
      await adminKYCService.unlockForUpdate(caseId!, {
        remarks: unlockRemarks || "Unlocked for seller updates",
      });

      toast({
        title: "KYC Unlocked",
        description: "Organization can now request and make updates to their KYC",
      });

      await loadCaseDetail(caseId!);
      setShowUnlockModal(false);
      setUnlockRemarks("");
    } catch (error: any) {
      console.error("Failed to unlock KYC:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unlock KYC",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !caseDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Case not found</p>
        <Button onClick={() => navigate("/admin/kyc/queue")} className="mt-4">
          Back to Queue
        </Button>
      </div>
    );
  }

  const { case: caseInfo, organization, contacts, bankAccount, complianceDocuments, autoChecks, riskAssessment, plantLocations } = caseDetail;
  const isLatestCase = caseId === selectedHistoryCaseId;
  const canTakeAction = caseInfo.status === "SUBMITTED" && isLatestCase;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/kyc/queue")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{organization.legalName}</h1>
                <p className="text-sm text-muted-foreground">{caseInfo.submissionNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RiskBadge level={riskAssessment.level} score={riskAssessment.score} />
              <span className="text-sm text-muted-foreground">Submitted {caseInfo.age} ago</span>
              <Button
                onClick={() => {
                  setShowHistoryPanel(!showHistoryPanel);
                  if (!showHistoryPanel && kycHistory.length === 0) {
                    loadKycHistory();
                  }
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", showHistoryPanel && "rotate-180")} />
                View History
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Section - Case Details */}
          <div className={cn("transition-all duration-300", showHistoryPanel ? "flex-[0_0_65%]" : "flex-1")}>
            <div className="space-y-4">
              {/* Status Badge */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      caseInfo.status === "APPROVED" && "bg-green-500",
                      caseInfo.status === "SUBMITTED" && "bg-blue-500",
                      caseInfo.status === "REJECTED" && "bg-red-500"
                    )} />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold text-foreground">{caseInfo.status}</p>
                    </div>
                  </div>
                  <Badge variant={caseInfo.status === "APPROVED" ? "default" : caseInfo.status === "REJECTED" ? "destructive" : "secondary"}>
                    {caseInfo.status}
                  </Badge>
                </div>
              </Card>

              {/* Automated Checks */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3 text-foreground">Automated Checks</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(autoChecks).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      {value ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span className="text-foreground">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Organization Info */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Building2 className="h-4 w-4" />
                  Organization
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Legal Name</p>
                    <p className="font-medium text-foreground">{organization.legalName}</p>
                  </div>
                  {organization.tradeName && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Trade Name</p>
                      <p className="font-medium text-foreground">{organization.tradeName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">GSTIN</p>
                    <p className="font-mono text-foreground">{organization.gstin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">PAN</p>
                    <p className="font-mono text-foreground">{organization.pan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Incorporation Date</p>
                    <p className="text-foreground">{new Date(organization.incorporationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <p className="text-foreground">{organization.role}</p>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Primary Contact</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{contacts.primary.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{contacts.primary.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{contacts.primary.mobile}</span>
                      </div>
                    </div>
                  </div>
                  {contacts.secondary && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Secondary Contact</p>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{contacts.secondary.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{contacts.secondary.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{contacts.secondary.mobile}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Plant Locations */}
              {plantLocations && plantLocations.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4" />
                    Plant Locations
                  </h3>
                  <div className="space-y-2">
                    {plantLocations.map((location, idx) => (
                      <div key={idx} className="p-3 bg-muted/30 rounded text-sm">
                        <p className="font-medium text-foreground">Plant Location {idx + 1}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {location.street}, {location.city}, {location.state} - {location.pin}, {location.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Bank Account */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <CreditCard className="h-4 w-4" />
                  Bank Account
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Holder</p>
                    <p className="font-medium text-foreground">{bankAccount.accountHolderName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                    <p className="font-mono text-foreground">****{bankAccount.accountNumber.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">IFSC</p>
                    <p className="font-mono text-foreground">{bankAccount.ifsc}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                    <p className="font-medium text-foreground">{bankAccount.bankName}</p>
                  </div>
                </div>
              </Card>

              {/* Compliance Documents */}
              {complianceDocuments.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <FileText className="h-4 w-4" />
                    Compliance Documents
                  </h3>
                  <div className="space-y-2">
                    {complianceDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.docType.replace(/_/g, " ")}</p>
                            <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(doc.fileUrl, "_blank")} className="gap-2">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Risk Assessment */}
              <Card className="p-4">
                <h3 className="text-base font-semibold mb-3 text-foreground">Risk Assessment</h3>
                <div className="space-y-2">
                  <RiskBadge level={riskAssessment.level} score={riskAssessment.score} />
                  <p className="text-sm text-muted-foreground">{riskAssessment.remarks}</p>
                </div>
              </Card>

              {/* Admin Actions - Only show for latest case */}
              {isLatestCase && (
                <Card className="p-4">
                  <h3 className="text-base font-semibold mb-3 text-foreground">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseInfo.status === "SUBMITTED" && (
                      <>
                        <Button onClick={() => setShowApproveModal(true)} size="sm" className="gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button onClick={() => setShowRejectModal(true)} size="sm" variant="destructive" className="gap-2">
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button onClick={() => setShowRequestInfoModal(true)} size="sm" variant="outline" className="gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Request Info
                        </Button>
                      </>
                    )}
                    {caseInfo.status === "APPROVED" && (
                      <Button onClick={() => setShowUnlockModal(true)} size="sm" variant="outline" className="gap-2">
                        <Unlock className="h-4 w-4" />
                        Unlock for Update
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Section - History Panel (Collapsible) */}
          {showHistoryPanel && (
            <div className="flex-[0_0_35%] border-l bg-card">
              <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Submission History</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowHistoryPanel(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : kycHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No previous submissions</p>
                  ) : (
                    <div className="space-y-2">
                      {kycHistory.map((item, idx) => {
                        const isSelected = item.caseId === selectedHistoryCaseId;
                        const isLatest = idx === 0;
                        
                        return (
                          <button
                            key={item.caseId}
                            onClick={() => handleHistoryRecordClick(item.caseId)}
                            className={cn(
                              "w-full text-left p-3 rounded border transition-all",
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-card",
                              isLatest && "ring-2 ring-primary/20"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-foreground">{item.submissionNumber}</p>
                                {isLatest && (
                                  <Badge variant="default" className="text-xs">Latest</Badge>
                                )}
                              </div>
                              <Badge 
                                variant={
                                  item.status === "APPROVED" ? "default" : 
                                  item.status === "REJECTED" ? "destructive" : 
                                  "secondary"
                                }
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Attempt #{item.submissionAttempt}</p>
                              <p>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</p>
                              {item.reviewedAt && (
                                <p>Reviewed: {new Date(item.reviewedAt).toLocaleDateString()}</p>
                              )}
                              {item.rejectionReason && (
                                <p className="text-destructive mt-2">{item.rejectionReason}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Approve KYC</h2>
            <p className="text-sm text-muted-foreground mb-4">Approve this KYC submission. The organization will be verified and can start operations.</p>
            <Textarea
              placeholder="Optional remarks..."
              value={approveRemarks}
              onChange={(e) => setApproveRemarks(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowApproveModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Reject KYC</h2>
            <p className="text-sm text-muted-foreground mb-4">Provide a detailed reason for rejection. The organization will be notified.</p>
            <Textarea
              placeholder="Rejection reason (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleReject} disabled={isSubmitting || !rejectionReason.trim()} variant="destructive" className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showRequestInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Request Additional Information</h2>
            <p className="text-sm text-muted-foreground mb-4">Request additional documents or clarifications from the organization.</p>
            <Textarea
              placeholder="What information do you need?..."
              value={requestInfoMessage}
              onChange={(e) => setRequestInfoMessage(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRequestInfoModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleRequestInfo} disabled={isSubmitting || !requestInfoMessage.trim()} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Unlock for Update</h2>
            <p className="text-sm text-muted-foreground mb-4">Allow the organization to update their KYC information.</p>
            <Textarea
              placeholder="Optional remarks..."
              value={unlockRemarks}
              onChange={(e) => setUnlockRemarks(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUnlockModal(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleUnlockForUpdate} disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Unlock
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
