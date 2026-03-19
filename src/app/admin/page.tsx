'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Eye,
  RefreshCw,
  Tag,
  HelpCircle,
  Mail,
  Download,
  Settings,
  Star,
  Bell,
  MessageSquare,
  Crown,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalSubscribers: number;
  pendingOrders: number;
  pendingReturns: number;
  activeDiscounts: number;
  unreadMessages: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    date: Date;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesTrend: 'up' | 'down';
  salesPercentage: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Set demo data
        setStats({
          totalRevenue: 1250000,
          totalOrders: 48,
          totalCustomers: 234,
          totalProducts: 45,
          totalSubscribers: 156,
          pendingOrders: 5,
          pendingReturns: 2,
          activeDiscounts: 3,
          unreadMessages: 4,
          recentOrders: [
            { id: '1', customer: 'John Doe', total: 15000, status: 'PENDING', date: new Date() },
            { id: '2', customer: 'Jane Smith', total: 28000, status: 'PROCESSING', date: new Date() },
            { id: '3', customer: 'Mike Johnson', total: 8500, status: 'DELIVERED', date: new Date() },
            { id: '4', customer: 'Sarah Wilson', total: 42000, status: 'SHIPPED', date: new Date() },
          ],
          topProducts: [
            { name: 'Vintage Gucci Jacket', sales: 12, revenue: 180000 },
            { name: 'Balenciaga Sneakers', sales: 8, revenue: 120000 },
            { name: 'Chrome Hearts Chain', sales: 6, revenue: 90000 },
            { name: 'Bape Hoodie', sales: 5, revenue: 45000 },
          ],
          salesTrend: 'up',
          salesPercentage: 12.5,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
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

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Revenue</CardTitle>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatPrice(stats?.totalRevenue || 0)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stats?.salesTrend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={stats?.salesTrend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {stats?.salesPercentage}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Orders</CardTitle>
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</div>
                <p className="text-white/40 text-sm mt-1">{stats?.pendingOrders || 0} pending</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Customers</CardTitle>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalCustomers || 0}</div>
                <p className="text-white/40 text-sm mt-1">+23 this month</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Products</CardTitle>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</div>
                <p className="text-white/40 text-sm mt-1">5 low stock</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Subscribers</CardTitle>
                <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalSubscribers || 0}</div>
                <p className="text-white/40 text-sm mt-1">Newsletter</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Conversion</CardTitle>
                <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">3.2%</div>
                <p className="text-white/40 text-sm mt-1">+0.5% this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Items Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/returns">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Returns</p>
                    <p className="text-white/40 text-sm">{stats?.pendingReturns || 0} pending</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/discounts">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Discounts</p>
                    <p className="text-white/40 text-sm">{stats?.activeDiscounts || 0} active</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/faq">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">FAQ</p>
                    <p className="text-white/40 text-sm">Manage FAQs</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/export">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Export Data</p>
                    <p className="text-white/40 text-sm">JSON / CSV</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="lg:col-span-2 bg-zinc-900 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Recent Orders</CardTitle>
                    <CardDescription className="text-white/40">
                      Latest orders from your store
                    </CardDescription>
                  </div>
                  <Link href="/admin/orders">
                    <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.customer}</p>
                          <p className="text-white/40 text-sm">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatPrice(order.total)}</p>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Top Products</CardTitle>
                    <CardDescription className="text-white/40">
                      Best selling items
                    </CardDescription>
                  </div>
                  <Link href="/admin/products">
                    <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-400/10 rounded-full flex items-center justify-center">
                        <span className="text-amber-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{product.name}</p>
                        <p className="text-white/40 text-xs">{product.sales} sold</p>
                      </div>
                      <p className="text-amber-400 text-sm font-medium">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Add New Product</p>
                    <p className="text-white/40 text-sm">Add a new item to your store</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Manage Orders</p>
                    <p className="text-white/40 text-sm">Process pending orders</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/community">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Community Photos</p>
                    <p className="text-white/40 text-sm">Review user uploads</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/settings">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Store Settings</p>
                    <p className="text-white/40 text-sm">Configure your store</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Additional Features Row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/subscribers">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Newsletter</p>
                      <p className="text-white/40 text-sm">Manage subscribers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/reviews">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Reviews</p>
                      <p className="text-white/40 text-sm">Approve customer reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/customers">
              <Card className="bg-zinc-900 border-white/10 hover:border-amber-400/50 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Crown className="w-6 h-6 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Loyalty Program</p>
                      <p className="text-white/40 text-sm">Manage customer tiers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
