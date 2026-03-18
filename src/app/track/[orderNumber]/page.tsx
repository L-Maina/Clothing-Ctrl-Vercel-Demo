'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Package, Truck, CheckCircle, Clock, XCircle, 
  MapPin, Mail, Phone, ChevronRight, ArrowLeft, Copy, Check,
  ShoppingBag, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TrackedOrder {
  orderNumber: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  currency: string;
  total: number;
  items: Array<{
    productName: string;
    productSlug: string;
    productImage: string | null;
    quantity: number;
    color: string;
    size: string;
    price: number;
  }>;
  customer: {
    name: string | null;
    email: string;
  };
  shippingAddr: {
    firstName: string;
    lastName: string;
    city: string;
    country: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusSteps = [
  { key: 'PENDING', label: 'Pending', icon: Clock, description: 'Order placed' },
  { key: 'PROCESSING', label: 'Processing', icon: Package, description: 'Order being prepared' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'On the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle, description: 'Delivered successfully' },
];

export default function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/track?orderNumber=${resolvedParams.orderNumber}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to track order');
        }

        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to track order');
      } finally {
        setIsLoading(false);
      }
    };

    if (resolvedParams.orderNumber) {
      fetchOrder();
    }
  }, [resolvedParams.orderNumber]);

  const getStatusIndex = (status: string) => {
    const index = statusSteps.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = order ? getStatusIndex(order.status) : 0;

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Order number copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-400" />
              Track Your Order
            </h1>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-white/60">Loading order details...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
                <p className="text-white/60 mb-6">{error}</p>
                <Link href="/">
                  <Button className="bg-amber-400 text-black hover:bg-amber-300">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && !isLoading && (
            <div className="space-y-6">
              {/* Order Info Card */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-white/40 text-sm">Order Number</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-white">{order.orderNumber}</p>
                        <button 
                          onClick={copyOrderNumber}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-sm">Total</p>
                      <p className="text-xl font-bold text-amber-400">
                        {formatPrice(order.total, order.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-6">Order Status</h2>
                  
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-700" />
                    <div 
                      className="absolute left-5 top-0 w-0.5 bg-amber-400 transition-all duration-500"
                      style={{ height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                    />

                    {/* Steps */}
                    <div className="space-y-6">
                      {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                          <motion.div
                            key={step.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-4"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors",
                              isCompleted 
                                ? "bg-amber-400 text-black" 
                                : "bg-zinc-800 text-white/40"
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 pt-1">
                              <p className={cn(
                                "font-medium",
                                isCompleted ? "text-white" : "text-white/40"
                              )}>
                                {step.label}
                              </p>
                              <p className={cn(
                                "text-sm",
                                isCurrent ? "text-amber-400" : "text-white/30"
                              )}>
                                {step.description}
                              </p>
                              {isCurrent && order.status === 'DELIVERED' && (
                                <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Delivered successfully
                                </p>
                              )}
                              {isCurrent && order.status === 'CANCELLED' && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                  <XCircle className="w-4 h-4" />
                                  Order cancelled
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <Card className="bg-zinc-900 border-white/10">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Tracking Information</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/40 text-sm">Tracking Number</p>
                        <p className="text-white font-mono">{order.trackingNumber}</p>
                      </div>
                      {order.trackingUrl && (
                        <a 
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400/10">
                            Track Package
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </a>
                      )}
                    </div>
                    {order.estimatedDelivery && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/40 text-sm">Estimated Delivery</p>
                        <p className="text-white">
                          {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Shipping Address */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    Shipping Address
                  </h2>
                  <div className="text-white/70">
                    <p>{order.shippingAddr.firstName} {order.shippingAddr.lastName}</p>
                    {order.shippingAddr.address && <p>{order.shippingAddr.address}</p>}
                    <p>{order.shippingAddr.city}, {order.shippingAddr.country}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg">
                        {item.productImage ? (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-zinc-700 rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/20" />
                          </div>
                        )}
                        <div className="flex-1">
                          <Link 
                            href={`/shop/${item.productSlug}`}
                            className="text-white font-medium hover:text-amber-400 transition-colors"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-white/40 text-sm">
                            {item.color} • {item.size} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-amber-400 font-medium">
                          {formatPrice(item.price, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Dates */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-white/40 text-sm">Order Placed</p>
                      <p className="text-white">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-sm">Last Updated</p>
                      <p className="text-white">
                        {new Date(order.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Need Help */}
              <Card className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Need Help?</h2>
                  <p className="text-white/60 mb-4">
                    If you have any questions about your order, please don&apos;t hesitate to contact us.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="mailto:support@clothingctrl.com"
                      className="flex items-center gap-2 text-amber-400 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      support@clothingctrl.com
                    </a>
                    <a 
                      href="tel:+254700000000"
                      className="flex items-center gap-2 text-amber-400 hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      +254 700 000 000
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/account/orders" className="flex-1">
                  <Button className="w-full bg-amber-400 text-black hover:bg-amber-300">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
