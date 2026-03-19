import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitSyncEvent } from '@/lib/sync-events';
import { sendOrderConfirmation } from '@/lib/notifications';
import { sendNewOrderNotification } from '@/lib/email';
import { getAdminsForNotifications } from '@/lib/admin-auth-server';
import { v4 as uuidv4 } from 'uuid';

// Generate unique order number: CC-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CC-${dateStr}-${random}`;
}

// Calculate loyalty points (1 point per 100 KES spent)
function calculateLoyaltyPoints(total: number): number {
  return Math.floor(total / 100);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      customerPhone,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      isGuestOrder,
      discountCode,
      pointsUsed = 0,
    } = body;

    // Validate required fields
    if (!customerEmail || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
      include: { loyalty: true },
    });

    if (!customer) {
      // Create guest customer (will appear in admin customers tab)
      customer = await db.customer.create({
        data: {
          email: customerEmail.toLowerCase(),
          name: customerName || null,
          phone: customerPhone || null,
          password: null, // Guest - no password
          isVerified: false,
          isActive: true,
          emailNotifications: true,
          smsNotifications: true,
        },
        include: { loyalty: true },
      });
    } else {
      // Update customer info if provided and missing
      if (customerName && !customer.name) {
        await db.customer.update({
          where: { id: customer.id },
          data: { name: customerName },
        });
      }
      if (customerPhone && !customer.phone) {
        await db.customer.update({
          where: { id: customer.id },
          data: { phone: customerPhone },
        });
      }
    }

    // Ensure customer has loyalty record
    if (!customer.loyalty) {
      await db.loyalty.create({
        data: {
          customerId: customer.id,
          points: 0,
          tier: 'BRONZE',
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        color: item.color,
        size: item.size,
      });
    }

    // Get shipping settings
    const storeSettings = await db.storeSettings.findFirst();
    const shippingNairobi = storeSettings?.shippingNairobi ?? 200;
    const shippingKenya = storeSettings?.shippingKenya ?? 500;
    const shippingInternational = storeSettings?.shippingInternational ?? 2000;
    const shippingFreeThreshold = storeSettings?.shippingFreeThreshold;

    // Calculate shipping based on location and settings
    let shipping: number;
    
    // Free shipping threshold check
    if (shippingFreeThreshold && subtotal >= shippingFreeThreshold) {
      shipping = 0;
    } else {
      const cityLower = (shippingAddress.city || '').toLowerCase().trim();
      const countryLower = (shippingAddress.country || 'Kenya').toLowerCase().trim();
      
      // International shipping
      if (countryLower !== 'kenya') {
        shipping = shippingInternational;
      } else {
        // Check if Nairobi (exact match or contains nairobi)
        const nairobiAreas = ['nairobi', 'westlands', 'kilimani', 'karen', 'lavington', 'kileleshwa', 'parklands', 'embakasi', 'kasarani'];
        const isNairobi = nairobiAreas.some(area => cityLower.includes(area)) || cityLower === 'nairobi';
        
        if (isNairobi) {
          shipping = shippingNairobi;
        } else {
          // Other areas in Kenya
          shipping = shippingKenya;
        }
      }
    }

    // Calculate tax (16% VAT in Kenya)
    let discountAmount = 0;
    let appliedDiscount = null;
    
    // Validate and apply discount code if provided
    if (discountCode) {
      const discount = await db.discount.findUnique({
        where: { code: discountCode.toUpperCase() },
      });
      
      if (discount && discount.isActive) {
        const now = new Date();
        const isValidDate = (!discount.startDate || new Date(discount.startDate) <= now) &&
                            (!discount.endDate || new Date(discount.endDate) >= now);
        const isValidUsage = !discount.maxUses || discount.currentUses < discount.maxUses;
        const isValidAmount = !discount.minOrderAmount || subtotal >= discount.minOrderAmount;
        
        if (isValidDate && isValidUsage && isValidAmount) {
          if (discount.type === 'PERCENTAGE') {
            discountAmount = subtotal * (discount.value / 100);
          } else {
            discountAmount = Math.min(discount.value, subtotal);
          }
          appliedDiscount = discount;
          
          // Increment usage count
          await db.discount.update({
            where: { id: discount.id },
            data: { currentUses: { increment: 1 } },
          });
        }
      }
    }
    
    // Calculate points discount
    let pointsDiscount = 0;
    if (pointsUsed > 0 && customer.loyalty && customer.loyalty.points >= pointsUsed) {
      pointsDiscount = pointsUsed; // 1 point = 1 KES
    }
    
    const taxableAmount = Math.max(0, subtotal - discountAmount - pointsDiscount);
    const tax = taxableAmount * 0.16;

    // Total
    const total = subtotal - discountAmount - pointsDiscount + shipping + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: 'PENDING',
        subtotal,
        shipping,
        tax,
        total,
        currency: 'KES',
        shippingAddr: JSON.stringify(shippingAddress),
        billingAddr: billingAddress ? JSON.stringify(billingAddress) : null,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'PENDING',
        notes: notes || null,
        isGuestOrder: isGuestOrder || false,
        guestEmail: isGuestOrder ? customerEmail : null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: { loyalty: true },
        },
      },
    });

    // Deduct inventory for each item
    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        // Handle limited quantity products
        if (product.isLimited && product.limitedQty !== null) {
          const newQty = Math.max(0, product.limitedQty - item.quantity);
          await db.product.update({
            where: { id: item.productId },
            data: {
              limitedQty: newQty,
              // Mark as out of stock if quantity reaches 0
              inStock: newQty > 0,
            },
          });
        }
        // For regular products, we could track stock quantity if needed
        // Currently we just have inStock boolean, so we leave it as is
      }
    }

    // Add loyalty points (and deduct if points were used)
    const points = calculateLoyaltyPoints(total);
    if (customer.loyalty) {
      // Deduct points if used
      if (pointsDiscount > 0) {
        await db.loyalty.update({
          where: { customerId: customer.id },
          data: {
            points: { decrement: pointsDiscount },
          },
        });
      }
      
      // Add earned points
      if (points > 0) {
        await db.loyalty.update({
          where: { customerId: customer.id },
          data: {
            points: { increment: points },
          },
        });
      }

      // Update tier based on new total points
      const updatedLoyalty = await db.loyalty.findUnique({
        where: { customerId: customer.id },
      });
      if (updatedLoyalty) {
        let tier = 'BRONZE';
        if (updatedLoyalty.points >= 1000) tier = 'PLATINUM';
        else if (updatedLoyalty.points >= 500) tier = 'GOLD';
        else if (updatedLoyalty.points >= 200) tier = 'SILVER';

        await db.loyalty.update({
          where: { customerId: customer.id },
          data: { tier },
        });
      }
    }

    // Clear cart items for this customer
    await db.cartItem.deleteMany({
      where: { customerId: customer.id },
    });

    // Emit sync event
    await emitSyncEvent('ORDER_UPDATE', 'CREATE', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      customerEmail: customer.email,
    });

    // Send confirmation notification
    await sendOrderConfirmation({
      customerName: customer.name || customer.email.split('@')[0],
      email: customer.email,
      phone: customer.phone || undefined,
      orderNumber: order.orderNumber,
      total: order.total,
      currency: order.currency,
      orderId: order.id,
    });

    // Send notification to all admins with verified notification emails
    const admins = await getAdminsForNotifications();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Send admin notifications (non-blocking to not delay response)
    Promise.all(
      admins.map(admin => 
        sendNewOrderNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: customer.name || customer.email.split('@')[0],
          customerEmail: customer.email,
          total: `${order.currency} ${order.total.toLocaleString()}`,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: `${order.currency} ${item.price.toLocaleString()}`,
          })),
          adminEmail: admin.notificationEmail,
          adminUserId: admin.id,
          adminUrl: `${appUrl}/admin/orders`,
        }).catch(err => console.error(`Failed to notify admin ${admin.email}:`, err))
      )
    );

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal,
        discount: discountAmount > 0 ? {
          code: appliedDiscount?.code,
          amount: discountAmount,
        } : null,
        pointsRedeemed: pointsDiscount,
        shipping,
        tax,
        total,
        currency: order.currency,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        shippingAddress: JSON.parse(order.shippingAddr),
        createdAt: order.createdAt,
        loyaltyPointsEarned: points,
      },
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - Get orders for customer (by email in header)
export async function GET(request: Request) {
  try {
    const customerEmail = request.headers.get('x-customer-email');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const orders = await db.order.findMany({
      where: { customerId: customer.id },
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
      take: limit,
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        createdAt: order.createdAt,
        reviewRequested: order.reviewRequested,
        reviewed: order.reviewed,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
