import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Load cart from server for logged in customer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ items: [] });
    }

    const cartItems = await db.cartItem.findMany({
      where: { customerId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            inStock: true,
          },
        },
      },
    });

    const formattedItems = cartItems.map(item => ({
      id: `${item.productId}-${item.color}-${item.size}`,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images ? JSON.parse(item.product.images)[0] : null,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      inStock: item.product.inStock,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('Failed to load cart:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

// POST - Sync cart item to server
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId, color, size, quantity } = body;

    if (!customerId || !productId || !color || !size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if item already exists in cart
    const existing = await db.cartItem.findFirst({
      where: {
        customerId,
        productId,
        color,
        size,
      },
    });

    if (existing) {
      // Update quantity
      const updated = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: quantity ?? existing.quantity + 1 },
      });
      return NextResponse.json({ success: true, item: updated });
    } else {
      // Create new cart item
      const newItem = await db.cartItem.create({
        data: {
          customerId,
          productId,
          color,
          size,
          quantity: quantity ?? 1,
        },
      });
      return NextResponse.json({ success: true, item: newItem });
    }
  } catch (error) {
    console.error('Failed to sync cart item:', error);
    return NextResponse.json({ error: 'Failed to sync cart item' }, { status: 500 });
  }
}

// DELETE - Remove item from cart or clear entire cart
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const color = searchParams.get('color');
    const size = searchParams.get('size');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    if (productId && color && size) {
      // Remove specific item
      await db.cartItem.deleteMany({
        where: {
          customerId,
          productId,
          color,
          size,
        },
      });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { customerId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}

// PUT - Update quantity
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId, color, size, quantity } = body;

    if (!customerId || !productId || !color || !size || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0
      await db.cartItem.deleteMany({
        where: {
          customerId,
          productId,
          color,
          size,
        },
      });
      return NextResponse.json({ success: true, removed: true });
    }

    const updated = await db.cartItem.updateMany({
      where: {
        customerId,
        productId,
        color,
        size,
      },
      data: { quantity },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Failed to update cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}
