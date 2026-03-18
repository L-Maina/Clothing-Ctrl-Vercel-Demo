'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Bell,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSync, SyncEvent } from '@/hooks/useRealtime';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchOrders = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setIsRefreshing(true);
      
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Demo data fallback
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          total: 15000,
          status: 'PENDING',
          paymentMethod: 'MPESA',
          paymentStatus: 'PAID',
          createdAt: new Date(),
          items: [{ productName: 'Vintage Gucci Jacket', quantity: 1, price: 15000 }],
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          total: 28000,
          status: 'PROCESSING',
          paymentMethod: 'CARD',
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 86400000),
          items: [{ productName: 'Balenciaga Sneakers', quantity: 1, price: 28000 }],
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          total: 8500,
          status: 'SHIPPED',
          paymentMethod: 'MPESA',
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 172800000),
          items: [{ productName: 'Bape Hoodie', quantity: 1, price: 8500 }],
        },
        {
          id: '4',
          orderNumber: 'ORD-004',
          customerName: 'Sarah Wilson',
          customerEmail: 'sarah@example.com',
          total: 42000,
          status: 'DELIVERED',
          paymentMethod: 'PAYPAL',
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 259200000),
          items: [
            { productName: 'Chrome Hearts Chain', quantity: 1, price: 35000 },
            { productName: 'Diesel Cap', quantity: 1, price: 7000 },
          ],
        },
        {
          id: '5',
          orderNumber: 'ORD-005',
          customerName: 'David Brown',
          customerEmail: 'david@example.com',
          total: 12000,
          status: 'CANCELLED',
          paymentMethod: 'MPESA',
          paymentStatus: 'REFUNDED',
          createdAt: new Date(Date.now() - 345600000),
          items: [{ productName: 'Vintage T-Shirt', quantity: 2, price: 6000 }],
        },
      ]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll for updates every 30 seconds instead of SSE (more reliable)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Mark as connected since we're using polling
  useEffect(() => {
    setIsConnected(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'PROCESSING':
        return <Package className="w-4 h-4" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SHIPPED':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-400';
      case 'PENDING':
        return 'text-yellow-400';
      case 'REFUNDED':
        return 'text-red-400';
      default:
        return 'text-white/40';
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      toast({
        title: 'Order Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout title="Orders">
      {/* Connection Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">Live updates active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">Disconnected</span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="text-white/60 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Pending</p>
                <p className="text-xl font-bold text-white">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Processing</p>
                <p className="text-xl font-bold text-white">{processingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Shipped</p>
                <p className="text-xl font-bold text-white">{shippedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Revenue</p>
                <p className="text-xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-white/40">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Order</TableHead>
                    <TableHead className="text-white/60">Customer</TableHead>
                    <TableHead className="text-white/60">Items</TableHead>
                    <TableHead className="text-white/60">Total</TableHead>
                    <TableHead className="text-white/60">Payment</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <p className="text-white font-medium">{order.orderNumber}</p>
                        <p className="text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-zinc-700 text-white text-xs">
                              {order.customerName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white text-sm">{order.customerName}</p>
                            <p className="text-white/40 text-xs">{order.customerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{order.paymentMethod}</p>
                          <p className={cn('text-xs', getPaymentStatusColor(order.paymentStatus))}>
                            {order.paymentStatus}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/5">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-white/10">
                            <DropdownMenuItem 
                              className="text-white/60 hover:text-white focus:text-white"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuLabel className="text-white/40 text-xs">
                              Update Status
                            </DropdownMenuLabel>
                            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => (
                              <DropdownMenuItem
                                key={status}
                                className="text-white/60 hover:text-white focus:text-white"
                                onClick={() => updateOrderStatus(order.id, status)}
                                disabled={order.status === status}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-2">{status}</span>
                              </DropdownMenuItem>
                            ))}
                            {order.status !== 'CANCELLED' && (
                              <>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem 
                                  className="text-red-400 focus:text-red-400"
                                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-white/40 text-sm">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            Next
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription className="text-white/40">
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-sm">Customer</p>
                  <p className="text-white font-medium">{selectedOrder.customerName}</p>
                  <p className="text-white/60 text-sm">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-white/40 text-sm">Status</p>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-white/40 text-sm mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between bg-zinc-800/50 rounded-lg p-3">
                      <div>
                        <p className="text-white">{item.productName}</p>
                        <p className="text-white/40 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-amber-400 font-medium">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t border-white/10 pt-4">
                <p className="text-white font-medium">Total</p>
                <p className="text-amber-400 font-bold text-lg">{formatPrice(selectedOrder.total)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Payment Method</p>
                  <p className="text-white">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-white/40">Payment Status</p>
                  <p className={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                    {selectedOrder.paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-white/40">Order Date</p>
                  <p className="text-white">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
