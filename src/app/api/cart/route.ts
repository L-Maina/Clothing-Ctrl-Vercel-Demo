import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get cart items for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json([])
    }

    const cartItems = await db.cartItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    const formattedItems = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: JSON.parse(item.product.images)[0],
      color: item.color,
      size: item.size,
      quantity: item.quantity,
    }))

    return NextResponse.json(formattedItems)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, productId, color, size, quantity = 1 } = body

    if (!customerId || !productId || !color || !size) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: {
        customerId,
        productId,
        color,
        size,
      },
    })

    if (existingItem) {
      // Update quantity
      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      })

      return NextResponse.json(updatedItem)
    }

    // Create new cart item
    const cartItem = await db.cartItem.create({
      data: {
        customerId,
        productId,
        color,
        size,
        quantity,
      },
      include: { product: true },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}
