import { rfqService } from '@/api/services/rfq.service';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { RFQ } from '@/shared/types/api.types';
import { format } from 'date-fns';
import { Calendar, MapPin, Package, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function RFQList() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRFQs();
  }, []);

  const loadRFQs = async () => {
    try {
      const response = await rfqService.getRFQList();
      setRfqs(response.rfqs);
    } catch (error) {
      toast.error(error.message || 'Failed to load RFQs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRfqs = rfqs.filter((rfq) =>
    rfq.product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rfq.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rfq.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-status-new/10 text-status-new border-status-new/20';
      case 'CLOSED':
        return 'bg-muted text-muted-foreground border-border';
      case 'AWARDED':
        return 'bg-status-confirmed/10 text-status-confirmed border-status-confirmed/20';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading RFQs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">RFQ Inbox</h1>
            <p className="text-muted-foreground mt-1">
              {filteredRfqs.length} request{filteredRfqs.length !== 1 ? 's' : ''} for quote
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* RFQ List */}
        <div className="space-y-4">
          {filteredRfqs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No RFQs found matching your search' : 'No RFQs available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRfqs.map((rfq) => {
              console.log('RFQ ID:', rfq.rfqId);
              return(
              
              <Card
                key={rfq.rfqId}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate(`/seller/rfqs/${rfq.rfqId}`)}
              >
                <CardContent className="p-6" id="`${rfq.rfqId}`">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {rfq.rfqNumber}
                            </span>
                            {rfq.suggestedMatch && (
                              <Badge variant="default" className="text-xs">
                                Suggested Match
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-semibold">
                            {rfq.product.category} - {rfq.product.grade}
                          </h3>
                        </div>
                        <Badge className={getStatusColor(rfq.status)}>
                          {rfq.status}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-medium">
                            {rfq.product.quantity} {rfq.product.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{rfq.buyer.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Need by:</span>
                          <span className="font-medium">
                            {format(new Date(rfq.needByDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Buyer:</span>
                        <span className="font-medium">{rfq.buyer.name}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/seller/rfqs/${rfq.rfqId}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})
          )}
        </div>
    </div>
  );
}
