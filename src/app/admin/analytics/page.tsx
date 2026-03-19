'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  customers: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  avgOrderValue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
  recentSales: Array<{
    date: string;
    amount: number;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
        const analytics = await response.json();
        setData(analytics);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Demo data
        setData({
          revenue: { total: 485000, change: 12.5, trend: 'up' },
          orders: { total: 32, change: 8, trend: 'up' },
          customers: { total: 45, change: -3, trend: 'down' },
          avgOrderValue: { total: 15156, change: 4.2, trend: 'up' },
          topProducts: [
            { name: 'Vintage Gucci Jacket', sales: 12, revenue: 180000 },
            { name: 'Balenciaga Sneakers', sales: 8, revenue: 120000 },
            { name: 'Chrome Hearts Chain', sales: 6, revenue: 90000 },
            { name: 'Bape Hoodie', sales: 5, revenue: 45000 },
            { name: 'Prada Sunglasses', sales: 4, revenue: 32000 },
          ],
          salesByCategory: [
            { category: 'Clothes', sales: 280000, percentage: 57.7 },
            { category: 'Shoes', sales: 145000, percentage: 29.9 },
            { category: 'Accessories', sales: 60000, percentage: 12.4 },
          ],
          recentSales: [
            { date: 'Mon', amount: 45000 },
            { date: 'Tue', amount: 72000 },
            { date: 'Wed', amount: 38000 },
            { date: 'Thu', amount: 85000 },
            { date: 'Fri', amount: 52000 },
            { date: 'Sat', amount: 95000 },
            { date: 'Sun', amount: 98000 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const maxSales = data?.recentSales ? Math.max(...data.recentSales.map(s => s.amount)) : 0;

  return (
    <AdminLayout title="Analytics">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Store Analytics</h2>
          <p className="text-white/40">Track your store&apos;s performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-zinc-800 border-white/10 text-white">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-white/10">
            <SelectItem value="7d" className="text-white hover:bg-white/5">Last 7 days</SelectItem>
            <SelectItem value="30d" className="text-white hover:bg-white/5">Last 30 days</SelectItem>
            <SelectItem value="90d" className="text-white hover:bg-white/5">Last 90 days</SelectItem>
            <SelectItem value="1y" className="text-white hover:bg-white/5">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : data && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Total Revenue</CardTitle>
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatPrice(data.revenue.total)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {data.revenue.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={data.revenue.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {data.revenue.change}% from last period
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
                <div className="text-2xl font-bold text-white">{data.orders.total}</div>
                <div className="flex items-center gap-1 mt-1">
                  {data.orders.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={data.orders.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {data.orders.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">New Customers</CardTitle>
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{data.customers.total}</div>
                <div className="flex items-center gap-1 mt-1">
                  {data.customers.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={data.customers.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {Math.abs(data.customers.change)}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">Avg Order Value</CardTitle>
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatPrice(data.avgOrderValue.total)}</div>
                <div className="flex items-center gap-1 mt-1">
                  {data.avgOrderValue.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={data.avgOrderValue.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {data.avgOrderValue.change}% from last period
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2 bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Sales Overview</CardTitle>
                <CardDescription className="text-white/40">Daily sales for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end gap-2">
                  {data.recentSales.map((sale, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-amber-500/80 to-amber-400/40 rounded-t-sm transition-all hover:from-amber-500 hover:to-amber-400"
                        style={{ height: `${(sale.amount / maxSales) * 100}%` }}
                      />
                      <span className="text-white/40 text-xs">{sale.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card className="bg-zinc-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Sales by Category</CardTitle>
                <CardDescription className="text-white/40">Revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.salesByCategory.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{cat.category}</span>
                        <span className="text-white/40 text-sm">{cat.percentage}%</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <p className="text-white/60 text-xs mt-1">{formatPrice(cat.sales)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card className="bg-zinc-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Top Selling Products</CardTitle>
              <CardDescription className="text-white/40">Best performers for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-400/10 rounded-full flex items-center justify-center">
                      <span className="text-amber-400 font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{product.name}</p>
                      <p className="text-white/40 text-sm">{product.sales} sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
