'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ExternalLink,
  Download,
  Star,
  ArrowLeft,
  RefreshCw,
  X,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  createdAt: string;
  reviewRequested: boolean;
  reviewed: boolean;
}

interface ReturnRequest {
  id: string;
  orderNumber: string;
  status: string;
  reason: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Package },
};

const returnReasons = [
  { value: 'WRONG_SIZE', label: 'Wrong Size' },
  { value: 'DEFECTIVE', label: 'Defective Product' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as Described' },
  { value: 'CHANGED_MIND', label: 'Changed My Mind' },
  { value: 'OTHER', label: 'Other' },
];

const returnStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-400' },
  APPROVED: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-500/20 text-purple-400' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // Fetch orders
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersRes = await fetch('/api/orders', {
          headers: {
            'x-customer-email': user.email,
          },
        });
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders);
        }

        // Fetch return requests
        const returnsRes = await fetch(`/api/returns?customerId=${user.id}`);
        if (returnsRes.ok) {
          const data = await returnsRes.json();
          setReturnRequests(data.returns);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn, user?.id, user?.email]);

  const handlePrintReceipt = (orderId: string) => {
    window.open(`/api/orders/receipt/${orderId}?print=1`, '_blank');
  };

  const handleRequestReview = async (orderId: string) => {
    toast({
      title: 'Coming Soon',
      description: 'Review feature will be available soon!',
    });
  };

  const openReturnDialog = (order: Order) => {
    setSelectedOrder(order);
    setSelectedItems([]);
    setReturnReason('');
    setReturnDetails('');
    setShowReturnDialog(true);
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder || selectedItems.length === 0 || !returnReason) {
      toast({
        title: 'Error',
        description: 'Please select items and a reason for return.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const items = selectedOrder.items
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        }));

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          customerId: user?.id,
          reason: returnReason,
          reasonDetails: returnDetails,
          items,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Return Request Submitted',
          description: data.message,
        });
        setShowReturnDialog(false);
        // Refresh return requests
        const returnsRes = await fetch(`/api/returns?customerId=${user?.id}`);
        if (returnsRes.ok) {
          const data = await returnsRes.json();
          setReturnRequests(data.returns);
        }
      } else {
        throw new Error('Failed to submit return request');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit return request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelDialog(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancelling(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderToCancel.id,
          customerEmail: user?.email,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Order Cancelled',
          description: `Order ${orderToCancel.orderNumber} has been cancelled successfully.`,
        });
        setShowCancelDialog(false);
        // Refresh orders
        const ordersRes = await fetch('/api/orders', {
          headers: {
            'x-customer-email': user?.email || '',
          },
        });
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders);
        }
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel order. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your orders</h2>
              <p className="text-white/60 mb-6">
                Please sign in to your account to view your order history.
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black">
                <Link href="/">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.push('/account')}
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-white/60 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
          </div>
          <p className="text-white/60">
            Track your orders, view history, and request returns
          </p>
        </div>

        {/* Loyalty Card */}
        {user.loyaltyPoints > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Loyalty Points</p>
                  <p className="text-3xl font-bold">{user.loyaltyPoints}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Member Tier</p>
                  <Badge className="bg-yellow-500 text-black text-lg px-4 py-1">
                    {user.loyaltyTier}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Return Requests */}
        {returnRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Active Return Requests
            </h2>
            <div className="space-y-3">
              {returnRequests.map((ret) => {
                const status = returnStatusConfig[ret.status] || returnStatusConfig.PENDING;
                return (
                  <Card key={ret.id} className="bg-zinc-900 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Order {ret.orderNumber}</p>
                          <p className="text-white/40 text-sm">
                            {ret.items.length} item{ret.items.length > 1 ? 's' : ''} • {ret.reason.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full bg-zinc-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
              <p className="text-white/60 mb-6">
                You have not placed any orders yet. Start shopping!
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black">
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const hasReturnRequest = returnRequests.some(r => r.orderNumber === order.orderNumber);

              return (
                <Card key={order.id} className="overflow-hidden bg-zinc-900 border-white/10">
                  <CardHeader className="bg-zinc-800/50 border-b border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle className="text-lg text-white">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge className={`${status.color} border`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-white/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-white/60">
                              {item.color} / {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium text-white">
                            {order.currency} {item.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded mb-4">
                        <p className="text-sm text-blue-400 mb-1">
                          <Truck className="w-4 h-4 inline mr-1" />
                          Tracking Number: <strong>{order.trackingNumber}</strong>
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
                          >
                            Track your package <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-sm text-white/60">Total</p>
                        <p className="text-xl font-bold text-white">
                          {order.currency} {order.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReceipt(order.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                        {/* Cancel Order Button - only for pending orders */}
                        {order.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelDialog(order)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Ban className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        {/* Return Request Button */}
                        {order.status === 'DELIVERED' && !hasReturnRequest && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReturnDialog(order)}
                            className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Return
                          </Button>
                        )}
                        {hasReturnRequest && (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Return Requested
                          </Badge>
                        )}
                        {order.status === 'DELIVERED' && !order.reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestReview(order.id)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Request Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription className="text-white/40">
              Select items to return and tell us why
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Items Selection */}
              <div>
                <Label className="text-white/60 mb-3 block">Select items to return</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                        selectedItems.includes(item.id)
                          ? "border-amber-400 bg-amber-400/5"
                          : "border-white/10 bg-zinc-800/50 hover:border-white/30"
                      )}
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.productName}</p>
                        <p className="text-white/40 text-xs">{item.color} / {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-white/60 text-sm">
                        {selectedOrder.currency} {item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <Label className="text-white/60 mb-3 block">Reason for return</Label>
                <div className="grid grid-cols-2 gap-2">
                  {returnReasons.map((reason) => (
                    <button
                      key={reason.value}
                      onClick={() => setReturnReason(reason.value)}
                      className={cn(
                        "p-3 border rounded-lg text-sm transition-all",
                        returnReason === reason.value
                          ? "border-amber-400 bg-amber-400/5 text-white"
                          : "border-white/10 bg-zinc-800/50 text-white/60 hover:text-white hover:border-white/30"
                      )}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <Label className="text-white/60 mb-2 block">Additional details (optional)</Label>
                <Textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Tell us more about why you're returning these items..."
                  rows={3}
                  className="bg-zinc-800 border-white/10 text-white placeholder:text-white/30 focus:border-amber-400"
                />
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-300">
                  <p className="font-medium">Return Policy</p>
                  <p className="mt-1">Returns must be requested within 14 days of delivery. Items must be unworn with original tags.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReturnDialog(false)}
                  className="flex-1 border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReturn}
                  disabled={submitting || selectedItems.length === 0 || !returnReason}
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Cancel Order</DialogTitle>
            <DialogDescription className="text-white/40">
              Are you sure you want to cancel this order?
            </DialogDescription>
          </DialogHeader>

          {orderToCancel && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-zinc-800 border border-white/10 rounded-lg">
                <p className="text-white font-medium">{orderToCancel.orderNumber}</p>
                <p className="text-white/60 text-sm">
                  {orderToCancel.items.length} item{orderToCancel.items.length > 1 ? 's' : ''} • Total: {orderToCancel.currency} {orderToCancel.total.toLocaleString()}
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-300">
                  <p className="font-medium">Warning</p>
                  <p className="mt-1">This action cannot be undone. Your order will be permanently cancelled.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={cancelling}
                  className="flex-1 border-white/10 text-white/60 hover:text-white"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
