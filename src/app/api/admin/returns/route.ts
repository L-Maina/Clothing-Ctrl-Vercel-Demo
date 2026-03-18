import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all returns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const returns = await db.orderReturn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

// POST - Create new return request
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      orderId, 
      orderNumber, 
      customerId, 
      customerEmail, 
      customerName,
      reason, 
      reasonDetails, 
      items 
    } = data;

    if (!orderId || !orderNumber || !customerEmail || !reason || !items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const returnRequest = await db.orderReturn.create({
      data: {
        orderId,
        orderNumber,
        customerId,
        customerEmail,
        customerName,
        reason,
        reasonDetails,
        items: JSON.stringify(items),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Error creating return:', error);
    return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 });
  }
}

// PUT - Update return status
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, status, refundMethod, refundAmount, adminNotes } = data;

    if (!id) {
      return NextResponse.json({ error: 'Return ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (refundMethod) updateData.refundMethod = refundMethod;
    if (refundAmount !== undefined) updateData.refundAmount = parseFloat(refundAmount);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const returnRequest = await db.orderReturn.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Error updating return:', error);
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
  }
}
