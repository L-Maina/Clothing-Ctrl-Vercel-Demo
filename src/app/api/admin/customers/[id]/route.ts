import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        loyalty: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if customer exists
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Delete related records first (due to foreign key constraints)
    // Delete cart items
    await db.cartItem.deleteMany({
      where: { customerId: id },
    });

    // Delete wishlist items
    await db.wishlistItem.deleteMany({
      where: { customerId: id },
    });

    // Delete notifications
    await db.notification.deleteMany({
      where: { customerId: id },
    });

    // Delete loyalty
    await db.loyalty.deleteMany({
      where: { customerId: id },
    });

    // Delete community reviews
    await db.communityReview.deleteMany({
      where: { customerId: id },
    });

    // Delete order items and orders
    const orders = await db.order.findMany({
      where: { customerId: id },
      select: { id: true },
    });

    for (const order of orders) {
      await db.orderItem.deleteMany({
        where: { orderId: order.id },
      });
    }

    await db.order.deleteMany({
      where: { customerId: id },
    });

    // Finally delete the customer
    await db.customer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json({ 
      error: 'Failed to delete customer', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
