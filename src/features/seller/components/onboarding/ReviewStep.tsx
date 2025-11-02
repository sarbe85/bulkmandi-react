import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

interface Props {
  data: any;
  onSubmit: () => Promise<void>;
  onBack: () => void;
}

export default function ReviewStep({
  data,
  onSubmit,
  onBack,
}: Props) {
  if (!data || !data.orgKyc) {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-yellow-600">
          <p>Unable to load review data. Please go back and complete all steps.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl -z-10"></div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Review Your Information
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">Please review all information before submitting your application</p>
      </div>

      <Card className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/50">
        <div className="space-y-8">

          <div className="space-y-8">
            {/* Organization KYC */}
            {data.orgKyc && (
              <div className="border-b pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Organization Details</h3>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Legal Name</p>
                  <p className="font-medium">{data.orgKyc.legalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trade Name</p>
                  <p className="font-medium">{data.orgKyc.tradeName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GSTIN</p>
                  <p className="font-medium">{data.orgKyc.gstin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PAN</p>
                  <p className="font-medium">{data.orgKyc.pan}</p>
                </div>
              </div>
            </div>
          )}

            {/* Bank Details */}
            {data.primaryBankAccount && (
              <div className="border-b pb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Bank Details</h3>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Account Holder</p>
                  <p className="font-medium">{data.primaryBankAccount.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-medium">{data.primaryBankAccount.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">****{data.primaryBankAccount.accountNumber.slice(-4)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IFSC</p>
                  <p className="font-medium">{data.primaryBankAccount.ifsc}</p>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Confirmation Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 space-y-3">
            <p className="font-bold text-blue-900 dark:text-blue-300 text-lg flex items-center gap-2">
              <span className="text-2xl">📋</span> Confirmation Required
            </p>
          <p className="text-blue-800 text-sm">
            By submitting this application, you confirm that all information provided is accurate and complete. Your application will be reviewed by our team within 24-48 hours.
          </p>
          <p className="font-semibold text-blue-900 mt-2">🔒 Data Lock Notice:</p>
          <p className="text-blue-800 text-sm">
            Once submitted, you won't be able to edit the information until admin reviews your application.
          </p>
        </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack} size="lg" className="min-w-32">
              Back
            </Button>
            <Button type="button" onClick={onSubmit} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" size="lg">
              Submit Application 📬
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
