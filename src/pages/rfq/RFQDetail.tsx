/**
 * RFQ Detail Page
 * Displays detailed RFQ information and allows sellers to submit quotes
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { quoteService } from '@/services/quote.service';
import { rfqService } from '@/services/rfq.service';
import { RFQ } from '@/types/api.types';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, Building2, Calendar, MapPin, Package, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const RFQDetail = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Quote form state
  const [pricePerMT, setPricePerMT] = useState('');
  const [freightPerMT, setFreightPerMT] = useState('');
  const [leadDays, setLeadDays] = useState('');
  const [validityHours, setValidityHours] = useState('24');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadRFQDetail();
  }, [rfqId]);

  const loadRFQDetail = async () => {
    if (!rfqId) return;
    
    try {
      setLoading(true);
      const response = await rfqService.getRFQDetail(rfqId);
      setRfq(response.rfq);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load RFQ details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!rfqId) return;

    if (!pricePerMT || !freightPerMT || !leadDays || !validityHours) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await quoteService.createQuote({
        rfqId,
        pricePerMT: parseFloat(pricePerMT),
        freightPerMT: parseFloat(freightPerMT),
        leadDays: parseInt(leadDays),
        validityHours: parseInt(validityHours),
        notes,
      });

      toast({
        title: 'Quote Submitted',
        description: 'Your quote has been submitted successfully',
      });

      navigate('/quotes');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit quote',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-muted-foreground">Loading RFQ details...</div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">RFQ not found</p>
          <Button className="mt-4" onClick={() => navigate('/rfqs')}>
            Back to RFQs
          </Button>
        </div>
      </div>
    );
  }

  const timeRemaining = rfq.expiryAt ? new Date(rfq.expiryAt).getTime() - Date.now() : 0;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/rfqs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">RFQ {rfq.rfqNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(rfq.createdAt), 'PPp')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={rfq.status === 'OPEN' ? 'default' : 'secondary'}>
            {rfq.status}
          </Badge>
          {rfq.suggestedMatch && (
            <Badge variant="outline" className="border-green-500 text-green-500">
              Suggested Match
            </Badge>
          )}
        </div>
      </div>

      {/* Expiry Warning */}
      {rfq.status === 'OPEN' && hoursRemaining < 24 && (
        <Card className="border-orange-500/50 bg-orange-500/10">
          <CardContent className="flex items-center gap-3 py-4">
            <Timer className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">
              Expires in {hoursRemaining}h - Submit your quote soon!
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Buyer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Company</Label>
                <p className="text-lg font-semibold">{rfq.buyer.name}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {rfq.buyer.location}
                  </p>
                </div>
                {rfq.buyer.rating && (
                  <div>
                    <Label className="text-muted-foreground">Rating</Label>
                    <p className="font-semibold">{rfq.buyer.rating}/5.0</p>
                  </div>
                )}
              </div>
              {rfq.buyer.gstin && (
                <div>
                  <Label className="text-muted-foreground">GSTIN</Label>
                  <p className="font-mono text-sm">{rfq.buyer.gstin}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Specification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="text-lg font-semibold">{rfq.product.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grade</Label>
                  <p className="text-lg font-semibold">{rfq.product.grade}</p>
                </div>
              </div>
              {rfq.product.size && (
                <div>
                  <Label className="text-muted-foreground">Size/Dimension</Label>
                  <p>{rfq.product.size}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Quantity</Label>
                <p className="text-2xl font-bold">
                  {rfq.product.quantity} {rfq.product.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label className="text-muted-foreground">Incoterms</Label>
                  <Badge variant="outline">{rfq.incoterms}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Target PIN</Label>
                  <p className="font-mono">{rfq.targetPin}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Need By Date</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(rfq.needByDate), 'PP')}
                  </p>
                </div>
              </div>
              {rfq.notes && (
                <div>
                  <Label className="text-muted-foreground">Special Notes</Label>
                  <p className="text-sm">{rfq.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote Submission Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Submit Your Quote</CardTitle>
              <CardDescription>
                Provide competitive pricing to win this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showQuoteForm ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setShowQuoteForm(true)}
                  disabled={rfq.status !== 'OPEN'}
                >
                  Create Quote
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pricePerMT">Price per MT (₹) *</Label>
                    <Input
                      id="pricePerMT"
                      type="number"
                      placeholder="45000"
                      value={pricePerMT}
                      onChange={(e) => setPricePerMT(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="freightPerMT">Freight per MT (₹) *</Label>
                    <Input
                      id="freightPerMT"
                      type="number"
                      placeholder="2000"
                      value={freightPerMT}
                      onChange={(e) => setFreightPerMT(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadDays">Lead Time (days) *</Label>
                    <Input
                      id="leadDays"
                      type="number"
                      placeholder="7"
                      value={leadDays}
                      onChange={(e) => setLeadDays(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityHours">Quote Validity (hours) *</Label>
                    <Input
                      id="validityHours"
                      type="number"
                      placeholder="24"
                      value={validityHours}
                      onChange={(e) => setValidityHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special terms or conditions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {pricePerMT && freightPerMT && (
                    <div className="rounded-lg bg-muted p-4">
                      <Label className="text-muted-foreground">Total Value</Label>
                      <p className="text-2xl font-bold">
                        ₹
                        {(
                          (parseFloat(pricePerMT) + parseFloat(freightPerMT)) *
                          rfq.product.quantity
                        ).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ({parseFloat(pricePerMT) + parseFloat(freightPerMT)} per MT × {rfq.product.quantity} MT)
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowQuoteForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmitQuote}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Quote'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RFQDetail;
