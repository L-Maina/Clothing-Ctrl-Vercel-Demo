import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/admin-auth-server';

// Available permissions
export const AVAILABLE_PERMISSIONS = [
  { id: 'products', label: 'Products', description: 'Add, edit, and delete products' },
  { id: 'orders', label: 'Orders', description: 'View and manage orders' },
  { id: 'customers', label: 'Customers', description: 'View customer information' },
  { id: 'discounts', label: 'Discounts', description: 'Create and manage discount codes' },
  { id: 'returns', label: 'Returns', description: 'Process return requests' },
  { id: 'settings', label: 'Settings', description: 'Modify store settings' },
  { id: 'admins', label: 'Admin Management', description: 'Add and manage other admins' },
  { id: 'analytics', label: 'Analytics', description: 'View sales and analytics data' },
] as const;

// GET - List all admins
export async function GET() {
  try {
    const admins = await db.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role, permissions } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if email already exists
    const existingAdmin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await db.adminUser.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: role || 'ADMIN',
        isTemporaryPassword: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Failed to create admin:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

// PATCH - Update admin
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, role, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await hashPassword(password);
      updateData.isTemporaryPassword = true;
    }

    const admin = await db.adminUser.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Failed to update admin:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE - Delete admin
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Prevent deleting the last super admin
    const admin = await db.adminUser.findUnique({ where: { id } });
    if (admin?.role === 'SUPER_ADMIN') {
      const superAdminCount = await db.adminUser.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json({
          error: 'Cannot delete the last super admin',
        }, { status: 400 });
      }
    }

    await db.adminUser.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}
