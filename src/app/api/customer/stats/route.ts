import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find customer by email
    const customer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } },
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
        loyalty: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
    const loyaltyPoints = customer.loyalty?.points || 0;
    const loyaltyTier = customer.loyalty?.tier || 'BRONZE';

    return NextResponse.json({
      totalOrders,
      totalSpent,
      loyaltyPoints,
      loyaltyTier,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
