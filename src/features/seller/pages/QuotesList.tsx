/**
 * Quotes List Page
 * Displays all quotes submitted by the seller
 */

import { quoteService } from '@/api/services/quote.service';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Quote } from '@/shared/types/api.types';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuotesList = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const response = await quoteService.getMyQuotes();
      setQuotes(response.quotes);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'SUBMITTED':
        return 'default';
      case 'ACCEPTED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'EXPIRED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-muted-foreground">Loading quotes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Quotes</h1>
          <p className="text-muted-foreground">Track all your submitted quotes</p>
        </div>
        <Button onClick={() => navigate('/rfqs')}>Browse RFQs</Button>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No quotes yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start by browsing RFQs and submitting your first quote
            </p>
            <Button onClick={() => navigate('/rfqs')}>Browse RFQs</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card
              key={quote.quoteId}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => navigate(`/quotes/${quote.quoteId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">
                        RFQ {quote.rfqNumber}
                      </h3>
                      <Badge
                        variant={getStatusVariant(quote.status)}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(quote.status)}
                        {quote.status}
                      </Badge>
                      {quote.floorApplied && (
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          Floor Applied
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {quote.buyer && (
                        <div>
                          <p className="text-sm text-muted-foreground">Buyer</p>
                          <p className="font-semibold">{quote.buyer}</p>
                        </div>
                      )}
                      {quote.product && (
                        <div>
                          <p className="text-sm text-muted-foreground">Product</p>
                          <p className="font-semibold">{quote.product}</p>
                        </div>
                      )}
                      {quote.quantity && (
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-semibold">{quote.quantity} MT</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Lead Time</p>
                        <p className="font-semibold">{quote.leadDays} days</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price per MT: </span>
                        <span className="font-semibold">
                          ₹{quote.pricePerMT.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Freight per MT: </span>
                        <span className="font-semibold">
                          ₹{quote.freightPerMT.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value: </span>
                        <span className="text-lg font-bold text-primary">
                          ₹{((quote.totalValue || quote.totalPrice) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {quote.notes && (
                      <p className="mt-3 text-sm text-muted-foreground">{quote.notes}</p>
                    )}
                  </div>

                  <div className="ml-6 text-right">
                    {quote.submittedAt && (
                      <p className="text-sm text-muted-foreground">
                        Submitted {format(new Date(quote.submittedAt), 'PP')}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Expires {format(new Date(quote.expiryAt), 'PPp')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotesList;
