import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('new') || searchParams.get('isNew');
    const limited = searchParams.get('limited');
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const limit = searchParams.get('limit');
    const exclude = searchParams.get('exclude');

    // Get single product by ID or slug
    if (id || slug) {
      const product = await db.product.findFirst({
        where: id ? { id } : { slug: slug as string },
        include: {
          category: true,
          reviews: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return NextResponse.json(product);
    }

    const where: Record<string, unknown> = {};
    
    // Exclude specific product
    if (exclude) {
      where.NOT = { id: exclude };
    }
    
    // Filter by category (by slug)
    if (category) {
      const categoryRecord = await db.category.findFirst({
        where: { slug: category },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }
    
    // Filter by categoryId directly
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // Filter by featured
    if (featured === 'true') {
      where.featured = true;
    }
    
    // Filter by new
    if (isNew === 'true') {
      where.isNew = true;
    }
    
    // Filter by limited
    if (limited === 'true') {
      where.isLimited = true;
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
