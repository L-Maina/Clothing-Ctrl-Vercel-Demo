import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '7d';

  try {
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let days = 7;
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        days = 7;
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        days = 30;
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        days = 90;
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        days = 365;
        break;
    }

    // Get orders in range
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
        customer: true,
      },
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setTime(prevStartDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const prevOrders = await db.order.findMany({
      where: {
        createdAt: { gte: prevStartDate, lt: startDate },
        status: { not: 'CANCELLED' },
      },
    });

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.total, 0);
    const prevOrderCount = prevOrders.length;

    // Calculate changes
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;
    const orderChange = prevOrderCount > 0 
      ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 
      : 0;

    // Get new customers
    const newCustomers = await db.customer.count({
      where: { createdAt: { gte: startDate } },
    });

    const prevCustomers = await db.customer.count({
      where: { createdAt: { gte: prevStartDate, lt: startDate } },
    });

    const customerChange = prevCustomers > 0 
      ? ((newCustomers - prevCustomers) / prevCustomers) * 100 
      : 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgValue = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
    const avgValueChange = prevAvgValue > 0 
      ? ((avgOrderValue - prevAvgValue) / prevAvgValue) * 100 
      : 0;

    // Top products by sales
    const productSales: Record<string, { sales: number; revenue: number; name: string }> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            sales: 0,
            revenue: 0,
            name: item.product.name,
          };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by category
    const categorySales: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product.category?.type || 'OTHER';
        categorySales[category] = (categorySales[category] || 0) + item.price * item.quantity;
      });
    });

    const salesByCategory = Object.entries(categorySales)
      .map(([category, sales]) => ({
        category: category.charAt(0) + category.slice(1).toLowerCase(),
        sales,
        percentage: totalRevenue > 0 ? (sales / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales);

    // REAL: Calculate daily sales for the chart
    const dailySalesMap: Record<string, number> = {};
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailySalesMap[dateKey] = 0;
    }
    
    // Aggregate actual sales by day
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (dailySalesMap[dateKey] !== undefined) {
        dailySalesMap[dateKey] += order.total;
      }
    });

    // Convert to array format for chart
    const recentSales = Object.entries(dailySalesMap)
      .slice(-Math.min(days, 7)) // Show max 7 days for readability
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        amount,
      }));

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        change: parseFloat(revenueChange.toFixed(1)),
        trend: revenueChange >= 0 ? 'up' : 'down',
      },
      orders: {
        total: totalOrders,
        change: parseFloat(orderChange.toFixed(1)),
        trend: orderChange >= 0 ? 'up' : 'down',
      },
      customers: {
        total: newCustomers,
        change: parseFloat(customerChange.toFixed(1)),
        trend: customerChange >= 0 ? 'up' : 'down',
      },
      avgOrderValue: {
        total: avgOrderValue,
        change: parseFloat(avgValueChange.toFixed(1)),
        trend: avgValueChange >= 0 ? 'up' : 'down',
      },
      topProducts,
      salesByCategory,
      recentSales,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({
      revenue: { total: 0, change: 0, trend: 'up' },
      orders: { total: 0, change: 0, trend: 'up' },
      customers: { total: 0, change: 0, trend: 'up' },
      avgOrderValue: { total: 0, change: 0, trend: 'up' },
      topProducts: [],
      salesByCategory: [],
      recentSales: [],
    });
  }
}
