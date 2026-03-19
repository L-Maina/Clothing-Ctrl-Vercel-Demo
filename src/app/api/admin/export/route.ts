import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Export data based on selection
export async function POST(request: NextRequest) {
  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { types, startDate, endDate, format } = body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };

    // Fetch each selected data type
    if (types.includes('products')) {
      const products = await db.product.findMany({
        include: {
          category: true,
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      exportData.products = products.map(p => ({
        ...p,
        images: JSON.parse(p.images),
        colors: JSON.parse(p.colors),
        sizes: JSON.parse(p.sizes),
        tags: p.tags ? JSON.parse(p.tags) : null,
        category: p.category?.name,
      }));
    }

    if (types.includes('customers')) {
      const customers = await db.customer.findMany({
        include: {
          orders: true,
          loyalty: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      exportData.customers = customers.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        phone: c.phone,
        addresses: c.addresses ? JSON.parse(c.addresses) : null,
        currency: c.currency,
        isVerified: c.isVerified,
        loyaltyPoints: c.loyalty?.points || 0,
        loyaltyTier: c.loyalty?.tier || 'BRONZE',
        totalOrders: c.orders.length,
        createdAt: c.createdAt,
      }));
    }

    if (types.includes('orders')) {
      const orders = await db.order.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      exportData.orders = orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        subtotal: o.subtotal,
        shipping: o.shipping,
        tax: o.tax,
        total: o.total,
        currency: o.currency,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        customer: o.customer ? {
          email: o.customer.email,
          name: o.customer.name,
          phone: o.customer.phone,
        } : { email: o.guestEmail, name: null, phone: null },
        isGuestOrder: o.isGuestOrder,
        shippingAddress: JSON.parse(o.shippingAddr),
        items: o.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        trackingNumber: o.trackingNumber,
        createdAt: o.createdAt,
      }));
    }

    if (types.includes('subscribers')) {
      const subscribers = await db.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
      });
      exportData.subscribers = subscribers;
    }

    if (types.includes('reviews')) {
      const reviews = await db.review.findMany({
        include: {
          product: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      exportData.reviews = reviews.map(r => ({
        id: r.id,
        product: r.product.name,
        rating: r.rating,
        comment: r.comment,
        name: r.name,
        verified: r.verified,
        createdAt: r.createdAt,
      }));
    }

    if (types.includes('discounts')) {
      const discounts = await db.discount.findMany({
        orderBy: { createdAt: 'desc' },
      });
      exportData.discounts = discounts.map(d => ({
        ...d,
        productIds: d.productIds ? JSON.parse(d.productIds) : null,
        categoryIds: d.categoryIds ? JSON.parse(d.categoryIds) : null,
      }));
    }

    if (types.includes('returns')) {
      const returns = await db.orderReturn.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      exportData.returns = returns.map(r => ({
        ...r,
        items: JSON.parse(r.items),
      }));
    }

    // Return as downloadable file
    const content = format === 'csv' 
      ? convertToCSV(exportData, types)
      : JSON.stringify(exportData, null, 2);

    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const extension = format === 'csv' ? 'csv' : 'json';

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="clothingctrl-export-${new Date().toISOString().split('T')[0]}.${extension}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

// Simple CSV converter for basic data structures
function convertToCSV(data: Record<string, unknown>, types: string[]): string {
  const lines: string[] = [];
  
  for (const type of types) {
    const items = data[type];
    if (!items || !Array.isArray(items)) continue;
    
    lines.push(`\n=== ${type.toUpperCase()} ===\n`);
    
    if (items.length === 0) {
      lines.push('No data\n');
      continue;
    }

    // Get headers from first item
    const headers = Object.keys(items[0]);
    lines.push(headers.join(','));
    
    // Add rows
    for (const item of items) {
      const values = headers.map(h => {
        const val = item[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val);
      });
      lines.push(values.join(','));
    }
  }
  
  return lines.join('\n');
}
