import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Export all data as JSON backup
export async function GET(request: NextRequest) {
  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all data
    const [
      products,
      categories,
      customers,
      orders,
      orderItems,
      subscribers,
      reviews,
      communityPhotos,
      communityReviews,
      socialHandles,
      storeSettings,
      adminUsers,
      nextDrops,
      discounts,
      faqs,
      contactMessages,
      notifications,
      loyaltyPoints,
      exchangeRates,
    ] = await Promise.all([
      db.product.findMany(),
      db.category.findMany(),
      db.customer.findMany(),
      db.order.findMany(),
      db.orderItem.findMany(),
      db.subscriber.findMany(),
      db.review.findMany(),
      db.communityPhoto.findMany(),
      db.communityReview.findMany(),
      db.socialHandle.findMany(),
      db.storeSettings.findFirst(),
      db.adminUser.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isTemporaryPassword: true,
          onboardingComplete: true,
          notificationEmail: true,
          emailVerified: true,
          lastLoginAt: true,
          passwordChangedAt: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        },
      }),
      db.nextDrop.findMany(),
      db.discount.findMany(),
      db.fAQ.findMany(),
      db.contactMessage.findMany(),
      db.notification.findMany(),
      db.loyalty.findMany(),
      db.exchangeRate.findMany(),
    ]);

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        products,
        categories,
        customers,
        orders,
        orderItems,
        subscribers,
        reviews,
        communityPhotos,
        communityReviews,
        socialHandles,
        storeSettings,
        adminUsers,
        nextDrops,
        discounts,
        faqs,
        contactMessages,
        notifications,
        loyaltyPoints,
        exchangeRates,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="clothingctrl-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

// POST - Import data from backup (restore)
export async function POST(request: NextRequest) {
  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('admin_session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, overwrite } = body;

    if (!data) {
      return NextResponse.json({ error: 'No backup data provided' }, { status: 400 });
    }

    // This is a simplified restore - in production you'd want more careful handling
    // and probably selective restore options
    
    const results = {
      products: 0,
      categories: 0,
      customers: 0,
      orders: 0,
      errors: [] as string[],
    };

    // Restore categories first (products depend on them)
    if (data.categories && overwrite) {
      for (const category of data.categories) {
        try {
          await db.category.upsert({
            where: { id: category.id },
            update: category,
            create: category,
          });
          results.categories++;
        } catch (e) {
          results.errors.push(`Category ${category.id}: ${e}`);
        }
      }
    }

    // Restore products
    if (data.products && overwrite) {
      for (const product of data.products) {
        try {
          await db.product.upsert({
            where: { id: product.id },
            update: product,
            create: product,
          });
          results.products++;
        } catch (e) {
          results.errors.push(`Product ${product.id}: ${e}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      results,
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}
