'use client';

import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Mail,
  ShoppingBag,
  Trash2,
  UserCheck,
  UserX,
  ArrowLeft,
  Package,
  X,
  Users,
  Crown,
  Sparkles,
  Trophy,
  UserPlus,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  orders: number;
  totalSpent: number;
  loyaltyTier: string;
  loyaltyPoints: number;
  isRegistered: boolean; // Has password = registered user
  createdAt: Date;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shipping: number;
  currency: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    productId: string;
    productImage: string | null;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
  }[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showOrdersView, setShowOrdersView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCustomers().finally(() => setLoading(false));
  }, []);

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PLATINUM':
        return <Badge className="bg-gradient-to-r from-slate-300 to-slate-100 text-slate-900">Platinum</Badge>;
      case 'GOLD':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black">Gold</Badge>;
      case 'SILVER':
        return <Badge className="bg-gradient-to-r from-zinc-300 to-zinc-400 text-black">Silver</Badge>;
      case 'BRONZE':
        return <Badge className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">Bronze</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return (
      <Badge variant="outline" className={statusStyles[status] || 'bg-zinc-500/10 text-zinc-400'}>
        {status}
      </Badge>
    );
  };

  const fetchCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/orders`);
      const data = await response.json();
      setCustomerOrders(data.orders || []);
      setShowOrdersView(true);
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      (customer.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesTier = tierFilter === 'all' || customer.loyaltyTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const platinumMembers = customers.filter(c => c.loyaltyTier === 'PLATINUM').length;
  const newThisMonth = customers.filter(c => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return new Date(c.createdAt) > monthAgo;
  }).length;

  return (
    <AdminLayout title="Customers">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Customers</p>
                <p className="text-xl font-bold text-white">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Revenue</p>
                <p className="text-xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Platinum Members</p>
                <p className="text-xl font-bold text-white">{platinumMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">New This Month</p>
                <p className="text-xl font-bold text-white">{newThisMonth}</p>
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
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-md text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="PLATINUM">Platinum</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="BRONZE">Bronze</option>
            </select>
            <Button variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-white/40">No customers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Customer</TableHead>
                    <TableHead className="text-white/60">Contact</TableHead>
                    <TableHead className="text-white/60">Orders</TableHead>
                    <TableHead className="text-white/60">Total Spent</TableHead>
                    <TableHead className="text-white/60">Loyalty</TableHead>
                    <TableHead className="text-white/60">Joined</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-amber-400 text-black font-bold">
                              {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{customer.name || 'N/A'}</p>
                              {customer.isRegistered ? (
                                <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Registered
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
                                  <UserX className="w-3 h-3 mr-1" />
                                  Guest
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/40 text-xs">{customer.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-white/40 text-xs">{customer.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        {customer.orders} orders
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {formatPrice(customer.totalSpent)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getTierBadge(customer.loyaltyTier)}
                          <p className="text-white/40 text-xs">{customer.loyaltyPoints} pts</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {new Date(customer.createdAt).toLocaleDateString()}
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
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white/60 hover:text-white focus:text-white">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 focus:text-red-400"
                              onClick={() => {
                                setCustomerToDelete(customer);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
          Showing {filteredCustomers.length} of {customers.length} customers
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

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => {
        setSelectedCustomer(null);
        setShowOrdersView(false);
        setCustomerOrders([]);
      }}>
        <DialogContent className={`bg-zinc-900 border-white/10 text-white ${showOrdersView ? 'max-w-3xl' : 'max-w-lg'}`}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              {showOrdersView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => setShowOrdersView(false)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <DialogTitle>{showOrdersView ? 'Customer Orders' : 'Customer Details'}</DialogTitle>
            </div>
            <DialogDescription className="text-white/40">
              {selectedCustomer?.name || selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && !showOrdersView && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-amber-400 text-black font-bold text-2xl">
                    {selectedCustomer.name?.charAt(0) || selectedCustomer.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-xl font-bold">{selectedCustomer.name || 'N/A'}</p>
                  <p className="text-white/60">{selectedCustomer.email}</p>
                  {selectedCustomer.phone && (
                    <p className="text-white/40 text-sm">{selectedCustomer.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-white/40 text-sm">Total Orders</p>
                  <p className="text-white text-2xl font-bold">{selectedCustomer.orders}</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-white/40 text-sm">Total Spent</p>
                  <p className="text-amber-400 text-2xl font-bold">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/40 text-sm">Loyalty Status</p>
                  {getTierBadge(selectedCustomer.loyaltyTier)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${Math.min((selectedCustomer.loyaltyPoints / 1000) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-white/60 text-sm">{selectedCustomer.loyaltyPoints} pts</span>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  {1000 - selectedCustomer.loyaltyPoints} points until Platinum
                </p>
              </div>

              <div className="text-sm">
                <p className="text-white/40">Customer since</p>
                <p className="text-white">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                  onClick={() => fetchCustomerOrders(selectedCustomer.id)}
                  disabled={loadingOrders}
                >
                  {loadingOrders ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      View Orders
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Orders View */}
          {selectedCustomer && showOrdersView && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40">No orders found for this customer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <Card key={order.id} className="bg-zinc-800/50 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <p className="text-white font-medium">{order.orderNumber}</p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-white/40 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="space-y-2 mb-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-zinc-700/30 rounded-lg p-2">
                              <div className="w-12 h-12 bg-zinc-700 rounded-md overflow-hidden flex-shrink-0">
                                {item.productImage ? (
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                                <p className="text-white/40 text-xs">
                                  {item.color && <span>{item.color}</span>}
                                  {item.color && item.size && <span> / </span>}
                                  {item.size && <span>{item.size}</span>}
                                  <span className="mx-2">x</span>
                                  {item.quantity}
                                </p>
                              </div>
                              <p className="text-amber-400 text-sm font-medium">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>{order.paymentMethod}</span>
                            <Badge variant="outline" className={order.paymentStatus === 'PAID' ? 'border-green-500/30 text-green-400' : 'border-yellow-500/30 text-yellow-400'}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-xs">Total</p>
                            <p className="text-amber-400 font-bold">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Customer</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete <span className="text-white font-medium">{customerToDelete?.name || customerToDelete?.email}</span>? 
              This will also delete all their orders, cart items, wishlist, and loyalty data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Customer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
