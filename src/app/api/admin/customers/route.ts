import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      include: {
        orders: {
          where: { status: { not: 'CANCELLED' } }, // Exclude cancelled orders
        },
        loyalty: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      orders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
      loyaltyTier: customer.loyalty?.tier || 'BRONZE',
      loyaltyPoints: customer.loyalty?.points || 0,
      isRegistered: !!customer.password, // Has password = registered user
      createdAt: customer.createdAt,
    }));

    return NextResponse.json({ customers: formattedCustomers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ customers: [] });
  }
}
