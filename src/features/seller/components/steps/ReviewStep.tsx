import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Building, Check, CheckCircle2, CreditCard, FileText, Loader2, Package, Shield } from 'lucide-react';
import { OnboardingData } from '../../types/onboarding.types';

interface Props {
  data: OnboardingData;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ReviewStep = ({ data, onSubmit, onBack, isLoading }: Props) => {
  const { orgKyc, bankDocs, complianceDocs, catalog } = data;

  const checks = [
    { label: 'Organization KYC', completed: !!orgKyc, icon: Building },
    { label: 'GSTIN Verified', completed: !!orgKyc?.gstin, icon: CheckCircle2 },
    { label: 'PAN Details', completed: !!orgKyc?.pan, icon: FileText },
    { label: 'Bank Account', completed: !!bankDocs?.accountNumber, icon: CreditCard },
    { label: 'Bank Documents', completed: !!bankDocs?.documents?.length, icon: FileText },
    { label: 'Compliance Documents', completed: !!complianceDocs?.complianceDocuments?.length, icon: Shield },
    { label: 'Catalog Setup', completed: !!catalog?.catalog?.length, icon: Package },
  ];

  const allCompleted = checks.every((c) => c.completed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Completion Status */}
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h3>
            <p className="text-muted-foreground">Please verify all information before submitting</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {checks.filter(c => c.completed).length}/{checks.length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
      </Card>

      {/* Checklist */}
      <Card className="p-6 border-2 hover:shadow-lg transition-all">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          Onboarding Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((check) => {
            const Icon = check.icon;
            return (
              <div
                key={check.label}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  check.completed
                    ? 'bg-success/5 border-success/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    check.completed
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {check.completed ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    check.completed
                      ? 'text-success'
                      : 'text-muted-foreground'
                  }`}
                >
                  {check.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Organization Details */}
      {orgKyc && (
        <Card className="p-6 border-2 hover:shadow-lg transition-all">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Organization Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Legal Name</p>
              <p className="font-semibold text-foreground">{orgKyc.legalName}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">GSTIN</p>
              <p className="font-mono font-semibold text-foreground">{orgKyc.gstin}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">PAN</p>
              <p className="font-mono font-semibold text-foreground">{orgKyc.pan}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Plant Locations</p>
              <p className="font-semibold text-foreground">{orgKyc.plantLocations?.length || 0} locations</p>
            </div>
          </div>
        </Card>
      )}

      {/* Bank Details */}
      {bankDocs && (
        <Card className="p-6 border-2 hover:shadow-lg transition-all">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Bank Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Account Holder</p>
              <p className="font-semibold text-foreground">{bankDocs.accountName}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Account Number</p>
              <p className="font-mono font-semibold text-foreground">****{bankDocs.accountNumber.slice(-4)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">IFSC Code</p>
              <p className="font-mono font-semibold text-foreground">{bankDocs.ifscCode}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Documents</p>
              <p className="font-semibold text-foreground">{bankDocs.documents?.length || 0} uploaded</p>
            </div>
          </div>
        </Card>
      )}

      {/* Compliance Documents */}
      {complianceDocs && complianceDocs.complianceDocuments && complianceDocs.complianceDocuments.length > 0 && (
        <Card className="p-6 border-2 hover:shadow-lg transition-all">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Compliance Documents
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {complianceDocs.complianceDocuments.map((doc) => (
              <div key={doc.type} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {doc.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  <Check className="h-3 w-3 mr-1" />
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Catalog */}
      {catalog && catalog.catalog && catalog.catalog.length > 0 && (
        <Card className="p-6 border-2 hover:shadow-lg transition-all">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Catalog
          </h4>
          <div className="space-y-3">
            {catalog.catalog
              .filter((c) => c.isSelected)
              .map((c) => (
                <div key={c.category} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{c.category}</span>
                    <Badge variant="secondary">{c.grades.length} grades</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Grades: {c.grades.join(', ')}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="p-6 bg-primary/5 border-2 border-primary/20">
        <div className="flex gap-4">
          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-foreground mb-2">Ready to Submit?</p>
            <p className="text-sm text-muted-foreground">
              By submitting, you confirm all information is accurate and complete.
              Your application will be reviewed within 24-48 hours. You'll receive an email notification once the review is complete.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onBack} disabled={isLoading} size="lg">
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!allCompleted || isLoading}
          className="min-w-[200px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              Submit for Verification
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
