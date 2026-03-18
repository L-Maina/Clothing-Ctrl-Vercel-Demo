import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List approved reviews (public)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const reviews = await db.communityReview.findMany({
      where: { approved: true },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.communityReview.count({
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
        productId: review.productId,
        customerName: review.customer.name,
        createdAt: review.createdAt,
      })),
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching community reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST - Create review (requires customer authentication)
export async function POST(request: Request) {
  try {
    const customerEmail = request.headers.get('x-customer-email');
    
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find customer
    const customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { orderId, productId, rating, comment, imageUrl, username } = body;

    // Validate required fields
    if (!orderId || !rating || !comment || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, rating, comment, username' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to customer
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        customerId: customer.id,
        status: 'DELIVERED',
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not eligible for review. Only delivered orders can be reviewed.' },
        { status: 400 }
      );
    }

    // Check if order has already been reviewed
    const existingReview = await db.communityReview.findFirst({
      where: { orderId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'This order has already been reviewed' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.communityReview.create({
      data: {
        customerId: customer.id,
        orderId,
        productId: productId || null,
        rating,
        comment,
        imageUrl: imageUrl || null,
        username,
        verified: true, // Verified because it's linked to a delivered order
        approved: false, // Requires admin approval
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Mark order as reviewed
    await db.order.update({
      where: { id: orderId },
      data: { reviewed: true },
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
        customerName: review.customer.name,
        createdAt: review.createdAt,
      },
      message: 'Review submitted successfully. It will be visible after approval.',
    });
  } catch (error) {
    console.error('Error creating community review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
