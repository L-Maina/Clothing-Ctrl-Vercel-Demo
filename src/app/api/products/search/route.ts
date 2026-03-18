import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim().toLowerCase();

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { brand: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { name: { contains: searchTerm } } },
        ],
      },
      include: {
        category: {
          select: { name: true, type: true },
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
