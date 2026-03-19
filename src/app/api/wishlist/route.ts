import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch user's wishlist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const wishlistItems = await db.wishlistItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend format
    const items = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      compareAt: item.product.compareAt,
      image: JSON.parse(item.product.images)[0],
      slug: item.product.slug,
      category: item.product.category.name,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add item to wishlist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'Customer ID and Product ID required' }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        customerId_productId: { customerId, productId },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist', item: existing });
    }

    const wishlistItem = await db.wishlistItem.create({
      data: { customerId, productId },
    });

    return NextResponse.json({ message: 'Added to wishlist', item: wishlistItem });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'Customer ID and Product ID required' }, { status: 400 });
    }

    await db.wishlistItem.delete({
      where: {
        customerId_productId: { customerId, productId },
      },
    });

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
