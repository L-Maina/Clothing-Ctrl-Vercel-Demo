import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitSyncEvent } from '@/lib/sync-events';
import { sendOrderStatusUpdate } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customerEmail = request.headers.get('x-customer-email');

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            loyalty: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
                price: true,
              },
            },
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

    // Check if the customer owns this order (if authenticated)
    if (customerEmail && order.customer.email !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        currency: order.currency,
        shippingAddress: JSON.parse(order.shippingAddr),
        billingAddress: order.billingAddr ? JSON.parse(order.billingAddr) : null,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        notes: order.notes,
        isGuestOrder: order.isGuestOrder,
        reviewRequested: order.reviewRequested,
        reviewed: order.reviewed,
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
          loyaltyPoints: order.customer.loyalty?.points || 0,
          loyaltyTier: order.customer.loyalty?.tier || 'BRONZE',
        },
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (admin)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, trackingNumber, trackingUrl, estimatedDelivery } = body;

    // Get current order
    const currentOrder = await db.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(trackingUrl !== undefined && { trackingUrl }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery: new Date(estimatedDelivery) }),
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Emit sync event
    await emitSyncEvent('ORDER_UPDATE', 'UPDATE', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
    });

    // Send status update notification if status changed
    if (status && status !== currentOrder.status) {
      await sendOrderStatusUpdate({
        customerName: order.customer.name || order.customer.email.split('@')[0],
        email: order.customer.email,
        phone: order.customer.phone || undefined,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber || undefined,
        trackingUrl: order.trackingUrl || undefined,
        orderId: order.id,
      });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
      },
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
