import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface NotificationItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'subscriber' | 'review' | 'community';
  message: string;
  time: string;
  read: boolean;
  link: string;
  orderId?: string;
  customerId?: string;
  productId?: string;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export async function GET() {
  try {
    const notifications: NotificationItem[] = [];

    // Get recent orders (last 7 days)
    const recentOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    recentOrders.forEach((order) => {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order #${order.orderNumber} received`,
        time: getTimeAgo(order.createdAt),
        read: false,
        link: `/admin/orders`,
        orderId: order.id,
      });
    });

    // Get recent customers (last 7 days)
    const recentCustomers = await db.customer.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    recentCustomers.forEach((customer) => {
      notifications.push({
        id: `customer-${customer.id}`,
        type: 'customer',
        message: `New customer registered: ${customer.name || customer.email}`,
        time: getTimeAgo(customer.createdAt),
        read: false,
        link: `/admin/customers`,
        customerId: customer.id,
      });
    });

    // Get low stock products (limited quantity < 5)
    const lowStockProducts = await db.product.findMany({
      where: {
        isLimited: true,
        limitedQty: { lt: 5, gt: 0 },
        inStock: true,
      },
      take: 3,
    });

    lowStockProducts.forEach((product) => {
      notifications.push({
        id: `product-low-${product.id}`,
        type: 'product',
        message: `${product.name} is low on stock (${product.limitedQty} left)`,
        time: 'Low stock alert',
        read: false,
        link: `/admin/products`,
        productId: product.id,
      });
    });

    // Get out of stock products
    const outOfStockProducts = await db.product.findMany({
      where: {
        OR: [
          { inStock: false },
          { limitedQty: 0 },
        ],
      },
      take: 3,
    });

    outOfStockProducts.forEach((product) => {
      notifications.push({
        id: `product-out-${product.id}`,
        type: 'product',
        message: `${product.name} is out of stock`,
        time: 'Out of stock',
        read: false,
        link: `/admin/products`,
        productId: product.id,
      });
    });

    // Get recent newsletter subscribers
    const recentSubscribers = await db.subscriber.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    if (recentSubscribers.length > 0) {
      notifications.push({
        id: `subscribers-${Date.now()}`,
        type: 'subscriber',
        message: `${recentSubscribers.length} new newsletter subscriber${recentSubscribers.length > 1 ? 's' : ''}`,
        time: getTimeAgo(recentSubscribers[0].createdAt),
        read: false,
        link: `/admin/subscribers`,
      });
    }

    // Get recent reviews (last 7 days)
    const recentReviews = await db.review.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        product: { select: { name: true } },
      },
    });

    recentReviews.forEach((review) => {
      notifications.push({
        id: `review-${review.id}`,
        type: 'review',
        message: `New ${review.rating}-star review on ${review.product?.name || 'product'}`,
        time: getTimeAgo(review.createdAt),
        read: false,
        link: `/admin/reviews`,
      });
    });

    // Get recent community reviews (last 7 days)
    const recentCommunityReviews = await db.communityReview.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { name: true, email: true } },
      },
    });

    recentCommunityReviews.forEach((review) => {
      notifications.push({
        id: `community-review-${review.id}`,
        type: 'review',
        message: `New community review from @${review.username} (${review.rating}-star)`,
        time: getTimeAgo(review.createdAt),
        read: false,
        link: `/admin/reviews`,
      });
    });

    // Get pending community reviews count
    const pendingCommunityReviews = await db.communityReview.count({
      where: { approved: false },
    });

    if (pendingCommunityReviews > 0) {
      notifications.push({
        id: `community-reviews-pending`,
        type: 'review',
        message: `${pendingCommunityReviews} community review${pendingCommunityReviews > 1 ? 's' : ''} pending approval`,
        time: 'Pending',
        read: false,
        link: `/admin/reviews`,
      });
    }

    // Get pending community photos
    const pendingCommunityPhotos = await db.communityPhoto.count({
      where: { approved: false },
    });

    if (pendingCommunityPhotos > 0) {
      notifications.push({
        id: `community-pending`,
        type: 'community',
        message: `${pendingCommunityPhotos} community photo${pendingCommunityPhotos > 1 ? 's' : ''} pending approval`,
        time: 'Pending',
        read: false,
        link: `/admin/community`,
      });
    }

    // Sort by time (most recent first) and limit
    const sortedNotifications = notifications
      .sort((a, b) => {
        // Put low stock and out of stock at top
        if (a.time.includes('stock')) return -1;
        if (b.time.includes('stock')) return 1;
        return 0;
      })
      .slice(0, 10);

    return NextResponse.json({ notifications: sortedNotifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ notifications: [] }, { status: 500 });
  }
}
