import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Create contact message
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, phone, subject, message } = data;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'NEW',
      },
    });

    // TODO: Send notification email to admin

    return NextResponse.json({ success: true, id: contactMessage.id });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// GET - List contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const messages = await db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
