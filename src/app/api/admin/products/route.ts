import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all products for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const stock = searchParams.get('stock') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
      ];
    }
    
    if (category) {
      where.category = { type: category };
    }
    
    if (condition) {
      where.condition = condition;
    }
    
    if (stock === 'instock') {
      where.inStock = true;
    } else if (stock === 'outofstock') {
      where.inStock = false;
    } else if (stock === 'low') {
      where.limitedQty = { lt: 5, gt: 0 };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          orderItems: {
            select: { quantity: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Add sales count to each product
    const productsWithSales = products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json({
      products: productsWithSales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, price, categoryId' },
        { status: 400 }
      );
    }

    // Validate price
    const price = parseFloat(body.price);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: 'Invalid price value' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    // Prepare JSON fields
    const images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []);
    const colors = typeof body.colors === 'string' ? body.colors : JSON.stringify(body.colors || []);
    const sizes = typeof body.sizes === 'string' ? body.sizes : JSON.stringify(body.sizes || []);
    const tags = body.tags ? (typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags)) : null;

    const product = await db.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price,
        compareAt: body.compareAt ? parseFloat(body.compareAt) : null,
        images,
        colors,
        sizes,
        brand: body.brand || null,
        condition: body.condition || 'NEW',
        categoryId: body.categoryId,
        inStock: body.inStock ?? true,
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        isLimited: body.isLimited ?? false,
        limitedQty: body.limitedQty ? parseInt(body.limitedQty) : null,
        dropDate: body.dropDate ? new Date(body.dropDate) : null,
        tags,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
