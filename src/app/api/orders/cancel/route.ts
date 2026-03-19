import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitSyncEvent } from '@/lib/sync-events';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customerEmail } = body;

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the customer
    const customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Find the order
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        customerId: customer.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending orders can be cancelled' },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: `Cancelled by customer (${customer.email}) on ${new Date().toISOString()}`,
      },
    });

    // Restore inventory for limited quantity products
    for (const item of order.items) {
      if (item.product.isLimited && item.product.limitedQty !== null) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            limitedQty: { increment: item.quantity },
            inStock: true,
          },
        });
      }
    }

    // Emit sync event
    await emitSyncEvent('ORDER_UPDATE', 'UPDATE', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: 'CANCELLED',
      customerEmail: customer.email,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: order.orderNumber,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    console.error('Order cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
