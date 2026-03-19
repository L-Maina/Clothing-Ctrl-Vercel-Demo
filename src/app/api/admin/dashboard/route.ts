import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Current period (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Previous period (30-60 days ago)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get counts
    const [products, customers, subscribers] = await Promise.all([
      db.product.count(),
      db.customer.count(),
      db.subscriber.count(),
    ]);

    // Current period orders
    const currentOrders = await db.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
      include: {
        customer: { select: { name: true, email: true } },
      },
    });

    // Previous period orders
    const previousOrders = await db.order.findMany({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
    });

    // Calculate revenue
    const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate trend
    const salesPercentage = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const salesTrend = salesPercentage >= 0 ? 'up' : 'down';

    // Pending orders count
    const pendingOrders = await db.order.count({
      where: { status: 'PENDING' },
    });

    // Total orders
    const totalOrders = await db.order.count();

    // Recent orders (last 5)
    const recentOrdersData = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, email: true },
        },
      },
    });

    // Top products by sales
    const orderItems = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topProductIds = orderItems.map(item => item.productId);
    const topProductsData = await db.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true },
    });

    const topProducts = orderItems.map(item => {
      const product = topProductsData.find(p => p.id === item.productId);
      return {
        name: product?.name || 'Unknown',
        sales: item._sum.quantity || 0,
        revenue: item._sum.price || 0,
      };
    });

    // New customers this period vs previous
    const newCustomersThisPeriod = await db.customer.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    
    const newCustomersLastPeriod = await db.customer.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers: customers,
      totalProducts: products,
      totalSubscribers: subscribers,
      pendingOrders,
      newCustomers: newCustomersThisPeriod,
      recentOrders: recentOrdersData.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer.name || order.customer.email,
        total: order.total,
        status: order.status,
        date: order.createdAt,
      })),
      topProducts,
      salesTrend,
      salesPercentage: parseFloat(Math.abs(salesPercentage).toFixed(1)),
      customerGrowth: newCustomersLastPeriod > 0 
        ? parseFloat(((newCustomersThisPeriod - newCustomersLastPeriod) / newCustomersLastPeriod * 100).toFixed(1))
        : 0,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalSubscribers: 0,
      pendingOrders: 0,
      newCustomers: 0,
      recentOrders: [],
      topProducts: [],
      salesTrend: 'up' as const,
      salesPercentage: 0,
      customerGrowth: 0,
    });
  }
}
