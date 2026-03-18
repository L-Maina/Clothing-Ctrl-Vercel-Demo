import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Validate and get discount code
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const amount = searchParams.get('amount');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const discount = await db.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      return NextResponse.json({ valid: false, error: 'Invalid discount code' });
    }

    if (!discount.isActive) {
      return NextResponse.json({ valid: false, error: 'This code is no longer active' });
    }

    // Check date validity
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return NextResponse.json({ valid: false, error: 'This code is not yet active' });
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return NextResponse.json({ valid: false, error: 'This code has expired' });
    }

    // Check usage limit
    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' });
    }

    // Check minimum order amount
    if (discount.minOrderAmount && amount) {
      const orderAmount = parseFloat(amount);
      if (orderAmount < discount.minOrderAmount) {
        return NextResponse.json({ 
          valid: false, 
          error: `Minimum order amount is KES ${discount.minOrderAmount.toLocaleString()}` 
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (amount) {
      const orderAmount = parseFloat(amount);
      if (discount.type === 'PERCENTAGE') {
        discountAmount = orderAmount * (discount.value / 100);
      } else {
        discountAmount = Math.min(discount.value, orderAmount);
      }
    }

    return NextResponse.json({
      valid: true,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      minOrderAmount: discount.minOrderAmount,
      description: discount.description,
    });
  } catch (error) {
    console.error('Error validating discount:', error);
    return NextResponse.json({ error: 'Failed to validate code' }, { status: 500 });
  }
}
