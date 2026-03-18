import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Check if customer can leave review (has delivered orders not yet reviewed)
export async function GET(request: Request) {
  try {
    const customerEmail = request.headers.get('x-customer-email');
    
    if (!customerEmail) {
      return NextResponse.json({
        canReview: false,
        orders: [],
        message: 'Authentication required',
      });
    }

    // Find customer
    const customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json({
        canReview: false,
        orders: [],
        message: 'Customer not found',
      });
    }

    // Find delivered orders that haven't been reviewed
    const deliveredOrders = await db.order.findMany({
      where: {
        customerId: customer.id,
        status: 'DELIVERED',
        reviewed: false,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (deliveredOrders.length === 0) {
      return NextResponse.json({
        canReview: false,
        orders: [],
        message: 'No delivered orders available for review. Complete an order to leave a review.',
      });
    }

    return NextResponse.json({
      canReview: true,
      orders: deliveredOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productSlug: item.product.slug,
          productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
        })),
      })),
      message: `${deliveredOrders.length} delivered order(s) available for review`,
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
