import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
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
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse addresses
    const shippingAddress = JSON.parse(order.shippingAddr);
    const billingAddress = order.billingAddr ? JSON.parse(order.billingAddr) : null;

    // Generate HTML receipt
    const html = generateReceiptHTML({
      order,
      customer: order.customer,
      items: order.items,
      shippingAddress,
      billingAddress,
    });

    // Return HTML for printing
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}

interface ReceiptData {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
    paymentMethod: string | null;
    paymentStatus: string;
    createdAt: Date;
  };
  customer: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown> | null;
}

function generateReceiptHTML(data: ReceiptData): string {
  const { order, customer, items, shippingAddress, billingAddress } = data;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${order.currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${order.orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #1a1a1a;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    .tagline {
      color: #666;
      font-size: 14px;
    }
    .order-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .order-info div {
      flex: 1;
    }
    .order-info h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 5px;
    }
    .order-info p {
      font-size: 14px;
    }
    .order-number {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      text-align: left;
      padding: 12px;
      background: #f9f9f9;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .items-table .item-name {
      font-weight: 500;
    }
    .items-table .item-variant {
      color: #666;
      font-size: 12px;
    }
    .items-table .text-right {
      text-align: right;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      gap: 40px;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-row.total {
      border-top: 2px solid #1a1a1a;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
    }
    .address-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .address-box {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
    }
    .address-box p {
      font-size: 14px;
      line-height: 1.6;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-processing { background: #cce5ff; color: #004085; }
    .status-shipped { background: #d4edda; color: #155724; }
    .status-delivered { background: #d4edda; color: #155724; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin-bottom: 5px;
    }
    .payment-info {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .payment-info p {
      font-size: 14px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .receipt {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo">CLOTHING CTRL</div>
      <div class="tagline">Your one-stop fashion destination in Nairobi</div>
    </div>

    <div class="order-info">
      <div>
        <h3>Order Number</h3>
        <p class="order-number">${order.orderNumber}</p>
      </div>
      <div>
        <h3>Order Date</h3>
        <p>${formatDate(order.createdAt)}</p>
      </div>
      <div>
        <h3>Status</h3>
        <p><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></p>
      </div>
    </div>

    <div class="section">
      <h2>Customer</h2>
      <p><strong>${customer.name || 'Guest Customer'}</strong></p>
      <p>${customer.email}</p>
      ${customer.phone ? `<p>${customer.phone}</p>` : ''}
    </div>

    <div class="section address-grid">
      <div class="address-box">
        <h3 style="font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 10px;">Shipping Address</h3>
        <p>
          ${shippingAddress.addressLine1 || ''}<br>
          ${shippingAddress.addressLine2 ? shippingAddress.addressLine2 + '<br>' : ''}
          ${shippingAddress.city || ''}, ${shippingAddress.county || ''}<br>
          ${shippingAddress.country || 'Kenya'}
          ${shippingAddress.phone ? '<br>Phone: ' + shippingAddress.phone : ''}
        </p>
      </div>
      ${billingAddress ? `
      <div class="address-box">
        <h3 style="font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 10px;">Billing Address</h3>
        <p>
          ${billingAddress.addressLine1 || ''}<br>
          ${billingAddress.addressLine2 ? billingAddress.addressLine2 + '<br>' : ''}
          ${billingAddress.city || ''}, ${billingAddress.county || ''}<br>
          ${billingAddress.country || 'Kenya'}
        </p>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>Order Items</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
          <tr>
            <td>
              <div class="item-name">${item.product.name}</div>
              <div class="item-variant">${item.color} / ${item.size}</div>
            </td>
            <td>${item.quantity}</td>
            <td class="text-right">${formatCurrency(item.price)}</td>
            <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(order.subtotal)}</span>
        </div>
        <div class="totals-row">
          <span>Shipping:</span>
          <span>${formatCurrency(order.shipping)}</span>
        </div>
        <div class="totals-row">
          <span>VAT (16%):</span>
          <span>${formatCurrency(order.tax)}</span>
        </div>
        <div class="totals-row total">
          <span>Total:</span>
          <span>${formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>

    <div class="payment-info">
      <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Pending'}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
    </div>

    <div class="footer">
      <p><strong>Clothing Ctrl</strong></p>
      <p>Cargen House, Harambee Ave, 3rd Floor, Room 310</p>
      <p>Nairobi, Kenya</p>
      <p>Email: info@clothingctrl.com | Phone: +254 700 000 000</p>
      <p style="margin-top: 15px;">Thank you for shopping with us!</p>
    </div>
  </div>

  <script>
    // Auto-print when loaded in a new window
    if (window.location.search.includes('print=1')) {
      window.onload = function() {
        window.print();
      }
    }
  </script>
</body>
</html>
  `;
}
