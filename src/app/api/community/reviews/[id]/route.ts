import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Approve/reject review (admin only - skipping auth for now)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'approved field is required (boolean)' },
        { status: 400 }
      );
    }

    const review = await db.communityReview.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = await db.communityReview.update({
      where: { id },
      data: { approved },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        imageUrl: updatedReview.imageUrl,
        username: updatedReview.username,
        verified: updatedReview.verified,
        approved: updatedReview.approved,
        productId: updatedReview.productId,
        customerName: updatedReview.customer.name,
        createdAt: updatedReview.createdAt,
      },
      message: approved ? 'Review approved' : 'Review rejected',
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE - Remove review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await db.communityReview.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    await db.communityReview.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// GET - Get single review details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const review = await db.communityReview.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Get order details
    const order = await db.order.findUnique({
      where: { id: review.orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
        username: review.username,
        verified: review.verified,
        approved: review.approved,
        productId: review.productId,
        customer: review.customer,
        orderId: review.orderId,
        order: order ? {
          orderNumber: order.orderNumber,
          items: order.items.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
            quantity: item.quantity,
            price: item.price,
          })),
        } : null,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}
