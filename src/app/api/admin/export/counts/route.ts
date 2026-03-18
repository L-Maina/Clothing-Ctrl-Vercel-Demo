import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch counts for each data type
export async function GET(request: NextRequest) {
  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      products,
      customers,
      orders,
      subscribers,
      reviews,
      discounts,
      returns,
    ] = await Promise.all([
      db.product.count(),
      db.customer.count(),
      db.order.count(),
      db.subscriber.count(),
      db.review.count(),
      db.discount.count(),
      db.orderReturn.count(),
    ]);

    return NextResponse.json({
      products,
      customers,
      orders,
      subscribers,
      reviews,
      discounts,
      returns,
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}
