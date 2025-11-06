import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Building2, CheckCircle, CreditCard, FileText, Loader2, Package } from 'lucide-react';

interface Props {
  data: any;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function ReviewStep({
  data,
  onSubmit,
  onBack,
  isSubmitting = false,
}: Props) {
  if (!data) {
    return (
      <Card className="p-8">
        <div className="text-center text-warning">
          <p>Unable to load review data. Please go back and complete all steps.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Please review all information before submitting your application
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization KYC */}
        {data.orgKyc && (
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Organization Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Legal Name</p>
                <p className="font-medium text-foreground">{data.orgKyc.legalName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Trade Name</p>
                <p className="font-medium text-foreground">{data.orgKyc.tradeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">GSTIN</p>
                <p className="font-medium text-foreground">{data.orgKyc.gstin}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">PAN</p>
                <p className="font-medium text-foreground">{data.orgKyc.pan}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Business Type</p>
                <p className="font-medium text-foreground">{data.orgKyc.businessType}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Incorporation Date</p>
                <p className="font-medium text-foreground">{data.orgKyc.incorporationDate}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground mb-1">Registered Address</p>
                <p className="font-medium text-foreground">{data.orgKyc.registeredAddress}</p>
              </div>
              {data.orgKyc.plantLocations && data.orgKyc.plantLocations.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-muted-foreground mb-2">Plant Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {data.orgKyc.plantLocations.map((plant: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {plant.city}, {plant.state}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Bank Details */}
        {data.primaryBankAccount && (
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Bank Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Account Holder</p>
                <p className="font-medium text-foreground">{data.primaryBankAccount.accountHolderName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Bank Name</p>
                <p className="font-medium text-foreground">{data.primaryBankAccount.bankName}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Account Number</p>
                <p className="font-medium text-foreground">****{data.primaryBankAccount.accountNumber.slice(-4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">IFSC</p>
                <p className="font-medium text-foreground">{data.primaryBankAccount.ifsc}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Penny Drop Status</p>
                <Badge className={data.primaryBankAccount.pennyDropStatus === 'VERIFIED' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                  {data.primaryBankAccount.pennyDropStatus}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Compliance Documents */}
        {data.complianceDocuments && data.complianceDocuments.length > 0 && (
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Compliance Documents</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.complianceDocuments.map((doc: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-foreground font-medium">{doc.docType || doc.fileName}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Catalog */}
        {data.catalog && data.catalog.length > 0 && (
          <Card className="p-6 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Product Catalog</h3>
            </div>
            <div className="space-y-3">
              {data.catalog.map((item: any, idx: number) => (
                <div key={idx} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">{item.category}</p>
                    <Badge variant="outline" className="text-xs">
                      MOQ: {item.moqPerOrder} MT
                    </Badge>
                  </div>
                  {item.grades && item.grades.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.grades.map((grade: string, gIdx: number) => (
                        <Badge key={gIdx} variant="secondary" className="text-xs">
                          {grade}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Confirmation Notice */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
        <p className="font-semibold text-primary">📋 Confirmation Required</p>
        <p className="text-sm text-foreground">
          By submitting this application, you confirm that all information provided is accurate and complete. 
          Your application will be reviewed by our team within 24-48 hours.
        </p>
        <p className="font-semibold text-primary mt-3">🔒 Data Lock Notice</p>
        <p className="text-sm text-foreground">
          Once submitted, you won't be able to edit the information until admin reviews your application.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="min-w-[100px]">
          ← Back
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit} 
          className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>Submit Application 📬</>
          )}
        </Button>
      </div>
    </div>
  );
}
