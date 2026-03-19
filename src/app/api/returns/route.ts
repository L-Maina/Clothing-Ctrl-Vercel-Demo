import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Create a return request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, customerId, reason, reasonDetails, items } = body;

    if (!orderId || !reason || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the order to verify it exists and get details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        },
        customer: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify customer owns this order (if customerId provided)
    if (customerId && order.customerId !== customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create return request
    const returnRequest = await db.orderReturn.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerEmail: order.customer?.email || order.guestEmail || '',
        customerName: order.customer?.name || null,
        reason,
        reasonDetails: reasonDetails || null,
        items: JSON.stringify(items.map((item: { productId: string; productName: string; quantity: number; price: number; color: string; size: string }) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        }))),
        status: 'PENDING',
      }
    });

    return NextResponse.json({
      success: true,
      returnId: returnRequest.id,
      message: 'Return request submitted successfully. We will review your request and get back to you shortly.'
    });
  } catch (error) {
    console.error('Return request error:', error);
    return NextResponse.json(
      { error: 'Failed to submit return request' },
      { status: 500 }
    );
  }
}

// GET - Get return requests for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const orderId = searchParams.get('orderId');

    if (!customerId && !orderId) {
      return NextResponse.json(
        { error: 'Missing customerId or orderId' },
        { status: 400 }
      );
    }

    const where: { customerId?: string; orderId?: string } = {};
    if (customerId) where.customerId = customerId;
    if (orderId) where.orderId = orderId;

    const returns = await db.orderReturn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      returns: returns.map(r => ({
        ...r,
        items: JSON.parse(r.items),
      }))
    });
  } catch (error) {
    console.error('Failed to fetch returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}
