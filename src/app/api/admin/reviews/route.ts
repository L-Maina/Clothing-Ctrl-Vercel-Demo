import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all reviews (admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: { approved?: boolean | null } = {};
    
    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }
    // For 'all' or 'rejected', we don't filter

    const reviews = await db.communityReview.findMany({
      where: status === 'rejected' ? { approved: false } : where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.communityReview.count({
      where: status === 'rejected' ? { approved: false } : where,
    });

    const pendingCount = await db.communityReview.count({
      where: { approved: false },
    });

    const approvedCount = await db.communityReview.count({
      where: { approved: true },
    });

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
        username: review.username,
        verified: review.verified,
        approved: review.approved,
        productId: review.productId,
        orderId: review.orderId,
        customer: {
          id: review.customer.id,
          name: review.customer.name,
          email: review.customer.email,
        },
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      })),
      total,
      pendingCount,
      approvedCount,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
