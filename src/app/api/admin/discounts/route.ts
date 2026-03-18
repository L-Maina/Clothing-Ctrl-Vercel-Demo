import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all discounts
export async function GET() {
  try {
    const discounts = await db.discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ discounts });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

// POST - Create new discount
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      code, 
      description, 
      type, 
      value, 
      minOrderAmount, 
      maxUses, 
      startDate, 
      endDate, 
      isActive,
      appliesTo,
      productIds,
      categoryIds 
    } = data;

    if (!code || !value) {
      return NextResponse.json({ error: 'Code and value are required' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await db.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
    }

    const discount = await db.discount.create({
      data: {
        code: code.toUpperCase(),
        description,
        type: type || 'PERCENTAGE',
        value: parseFloat(value),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        appliesTo: appliesTo || 'ALL',
        productIds: productIds ? JSON.stringify(productIds) : null,
        categoryIds: categoryIds ? JSON.stringify(categoryIds) : null,
      },
    });

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}

// PUT - Update discount
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    // If code is being updated, check for duplicates
    if (updateData.code) {
      const existing = await db.discount.findFirst({
        where: { 
          code: updateData.code.toUpperCase(),
          NOT: { id }
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Handle JSON fields
    if (updateData.productIds && Array.isArray(updateData.productIds)) {
      updateData.productIds = JSON.stringify(updateData.productIds);
    }
    if (updateData.categoryIds && Array.isArray(updateData.categoryIds)) {
      updateData.categoryIds = JSON.stringify(updateData.categoryIds);
    }

    // Handle numeric fields
    if (updateData.value !== undefined) {
      updateData.value = parseFloat(updateData.value);
    }
    if (updateData.minOrderAmount !== undefined) {
      updateData.minOrderAmount = updateData.minOrderAmount ? parseFloat(updateData.minOrderAmount) : null;
    }
    if (updateData.maxUses !== undefined) {
      updateData.maxUses = updateData.maxUses ? parseInt(updateData.maxUses) : null;
    }

    const discount = await db.discount.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ discount });
  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 });
  }
}

// DELETE - Delete discount
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 });
    }

    await db.discount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 });
  }
}
