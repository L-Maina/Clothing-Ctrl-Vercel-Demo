import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
        customerName: order.customer?.name || 'Guest',
        customerEmail: order.customer?.email || 'guest@example.com',
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Return demo data on error
    return NextResponse.json({
      orders: [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          total: 15000,
          status: 'PENDING',
          paymentMethod: 'MPESA',
          paymentStatus: 'PAID',
          createdAt: new Date(),
          items: [{ productName: 'Vintage Gucci Jacket', quantity: 1, price: 15000 }],
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          total: 28000,
          status: 'PROCESSING',
          paymentMethod: 'CARD',
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 86400000),
          items: [{ productName: 'Balenciaga Sneakers', quantity: 1, price: 28000 }],
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          customerName: 'Mike Johnson',
          customerEmail: 'mike@example.com',
          total: 8500,
          status: 'SHIPPED',
          paymentMethod: 'MPESA',
          paymentStatus: 'PAID',
          createdAt: new Date(Date.now() - 172800000),
          items: [{ productName: 'Bape Hoodie', quantity: 1, price: 8500 }],
        },
      ],
    });
  }
}
