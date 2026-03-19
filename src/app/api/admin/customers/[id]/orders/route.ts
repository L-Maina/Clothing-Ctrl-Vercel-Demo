import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const orders = await db.order.findMany({
      where: {
        customerId: id,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product.name,
        productId: item.productId,
        productImage: item.product.images?.[0] || null,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        size: item.size,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    return NextResponse.json({ orders: [], error: 'Failed to fetch orders' }, { status: 500 });
  }
}
