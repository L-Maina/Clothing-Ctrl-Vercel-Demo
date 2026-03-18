import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true,
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate sales stats
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = product.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return NextResponse.json({
      ...product,
      stats: {
        totalSold,
        totalRevenue,
        reviewCount: product.reviews.length,
        avgRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// UPDATE product (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) {
      updateData.name = body.name;
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.compareAt !== undefined) updateData.compareAt = body.compareAt ? parseFloat(body.compareAt) : null;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.brand !== undefined) updateData.brand = body.brand || null;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.inStock !== undefined) updateData.inStock = body.inStock;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.isNew !== undefined) updateData.isNew = body.isNew;
    if (body.isLimited !== undefined) updateData.isLimited = body.isLimited;
    if (body.limitedQty !== undefined) updateData.limitedQty = body.limitedQty ? parseInt(body.limitedQty) : null;
    if (body.dropDate !== undefined) updateData.dropDate = body.dropDate ? new Date(body.dropDate) : null;
    if (body.tags !== undefined) updateData.tags = body.tags || null;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// UPDATE product (PUT) - same as PATCH
export const PUT = PATCH;

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete related records first (only models that exist in schema)
    await db.cartItem.deleteMany({
      where: { productId: id },
    });
    
    await db.orderItem.deleteMany({
      where: { productId: id },
    });
    
    await db.review.deleteMany({
      where: { productId: id },
    });
    
    // Delete the product
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
