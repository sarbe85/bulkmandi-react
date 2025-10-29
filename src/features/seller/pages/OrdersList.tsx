 

import { orderService } from '@/services/order.service';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Order, OrderStatus } from '@/shared/types/api.types';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Package, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'DISPATCHED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <Package className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'CONFIRMED':
        return 'default';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'DISPATCHED':
        return 'outline';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-muted-foreground">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage your confirmed orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">No orders yet</h3>
            <p className="mb-4 text-muted-foreground">
              Your confirmed orders will appear here
            </p>
            <Button onClick={() => navigate('/rfqs')}>Browse RFQs</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card
              key={order.orderId}
              className="cursor-pointer transition-colors hover:border-primary"
              onClick={() => navigate(`/orders/${order.orderId}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <h3 className="text-xl font-semibold">
                        Order {order.orderNumber}
                      </h3>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Buyer</p>
                        <p className="font-semibold">{order.buyer.name}</p>
                        <p className="text-sm text-muted-foreground">{order.buyer.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Product</p>
                        <p className="font-semibold">{order.product.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-semibold">
                          {order.product.quantity} {order.product.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Date</p>
                        <p className="font-semibold">
                          {format(new Date(order.deliveryDate), 'PP')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price per MT: </span>
                        <span className="font-semibold">
                          ₹{order.pricing.pricePerMT.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Freight per MT: </span>
                        <span className="font-semibold">
                          ₹{order.pricing.freightPerMT.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value: </span>
                        <span className="text-lg font-bold text-primary">
                          ₹{order.pricing.totalValue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <p className="text-sm text-muted-foreground">
                      Created {format(new Date(order.createdAt), 'PP')}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      RFQ {order.rfqNumber}
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

export default OrdersList;
