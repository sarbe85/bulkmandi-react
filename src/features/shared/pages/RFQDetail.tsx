import { quoteService } from '@/api/services/quote.service';
import { mockRFQs } from '@/data/mockData';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Package,
  TrendingUp,
  Truck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function RFQDetail() {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quote form state
  const [formData, setFormData] = useState({
    pricePerMT: '',
    freightPerMT: '',
    leadDays: '7',
    validityHours: '48',
    notes: '',
  });

  useEffect(() => {
    loadRFQDetail();
  }, [rfqId]);

  const loadRFQDetail = async () => {
    try {
      setIsLoading(true);
      // Use mock data
      const mockRfq = mockRFQs.find(r => r.rfqId === rfqId);
      if (mockRfq) {
        setRfq(mockRfq);
      } else {
        toast.error('RFQ not found');
        navigate('/seller/rfqs');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load RFQ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pricePerMT || !formData.freightPerMT) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Submit quote
      await quoteService.createQuote({
        rfqId: rfqId!,
        pricePerMT: parseFloat(formData.pricePerMT),
        freightPerMT: parseFloat(formData.freightPerMT),
        leadDays: parseInt(formData.leadDays),
        validityHours: parseInt(formData.validityHours),
        notes: formData.notes,
      });

      toast.success('Quote submitted successfully!');
      navigate('/seller/quotes');
    } catch (error) {
      toast.error(error.message || 'Failed to submit quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.pricePerMT) || 0;
    const freight = parseFloat(formData.freightPerMT) || 0;
    const quantity = rfq?.product.quantity || 0;
    return ((price + freight) * quantity).toLocaleString('en-IN');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading RFQ details...</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">RFQ not found</p>
          <Button onClick={() => navigate('/seller/rfqs')}>
            Back to RFQs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/seller/rfqs')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">RFQ {rfq.rfqNumber}</h1>
            <Badge className="bg-green-100 text-green-700">
              {rfq.status}
            </Badge>
            {rfq.suggestedMatch && (
              <Badge variant="outline" className="border-primary text-primary">
                Suggested Match
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Submit your best quote for this opportunity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFQ Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Product Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{rfq.product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grade</p>
                  <p className="font-semibold">{rfq.product.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold text-lg text-primary">
                    {rfq.product.quantity} {rfq.product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Incoterms</p>
                  <p className="font-semibold">{rfq.incoterms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {rfq.buyer.name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{rfq.buyer.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {rfq.buyer.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Buyer Rating: </span>
                <Badge variant="secondary">{rfq.buyer.rating} ⭐</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Destination PIN</p>
                <p className="font-semibold">{rfq.targetPin}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Required by</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="font-semibold">
                    {new Date(rfq.needByDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Submission Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Submit Quote</CardTitle>
              <CardDescription>
                Provide your best pricing and terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <div>
                  <Label htmlFor="pricePerMT">
                    Price per MT (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pricePerMT"
                    type="number"
                    placeholder="45000"
                    value={formData.pricePerMT}
                    onChange={(e) => setFormData({ ...formData, pricePerMT: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="freightPerMT">
                    Freight per MT (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="freightPerMT"
                    type="number"
                    placeholder="2000"
                    value={formData.freightPerMT}
                    onChange={(e) => setFormData({ ...formData, freightPerMT: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="leadDays">Lead Time (days)</Label>
                    <Input
                      id="leadDays"
                      type="number"
                      value={formData.leadDays}
                      onChange={(e) => setFormData({ ...formData, leadDays: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="validityHours">Valid (hours)</Label>
                    <Input
                      id="validityHours"
                      type="number"
                      value={formData.validityHours}
                      onChange={(e) => setFormData({ ...formData, validityHours: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special terms or conditions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Total Calculation */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Value</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{calculateTotal()}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                </Button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expires in {Math.round((new Date(rfq.expiryAt).getTime() - Date.now()) / (1000 * 60 * 60))} hours
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}