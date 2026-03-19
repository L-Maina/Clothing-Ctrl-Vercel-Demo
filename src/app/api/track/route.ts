import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Track order by order number (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: { 
        orderNumber: orderNumber.toUpperCase(),
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
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found. Please check your order number.' },
        { status: 404 }
      );
    }

    // Return limited public information
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        currency: order.currency,
        total: order.total,
        items: order.items.map((item) => ({
          productName: item.product.name,
          productSlug: item.product.slug,
          productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
        })),
        customer: {
          name: order.customer.name,
          // Mask email for privacy
          email: order.customer.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        },
        shippingAddr: JSON.parse(order.shippingAddr),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    );
  }
}
