import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List active FAQs for customers
export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
    });
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}
