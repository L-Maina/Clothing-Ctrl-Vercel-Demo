import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clear existing data in correct order (respecting foreign keys)
    // Delete child records first
    await db.notificationLog.deleteMany();
    await db.emailLog.deleteMany();
    await db.syncEvent.deleteMany();
    await db.orderReturn.deleteMany();
    await db.notification.deleteMany();
    await db.cookieConsent.deleteMany();
    await db.contactMessage.deleteMany();
    await db.fAQ.deleteMany();
    await db.discount.deleteMany();
    await db.kenyaLocation.deleteMany();
    await db.communityReview.deleteMany();
    await db.exchangeRate.deleteMany();
    await db.communityPhoto.deleteMany();
    await db.nextDrop.deleteMany();
    await db.subscriber.deleteMany();
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.cartItem.deleteMany();
    await db.loyalty.deleteMany();
    await db.review.deleteMany();
    await db.customer.deleteMany();
    await db.product.deleteMany();
    await db.category.deleteMany();
    await db.storeSettings.deleteMany();
    await db.socialHandle.deleteMany();
    await db.adminUser.deleteMany();

    // Create store settings
    await db.storeSettings.create({
      data: {
        storeName: 'Clothing Ctrl',
        storeDescription: 'Premium multi-brand fashion store in Nairobi CBD. Authentic designer wear, streetwear & thrifted gems.',
        storeEmail: 'info@clothingctrl.co.ke',
        storePhone: '+254 700 123 456',
        addressLine1: 'Moi Avenue',
        addressLine2: 'Nairobi CBD',
        city: 'Nairobi',
        country: 'Kenya',
        openHour: '09:00',
        closeHour: '21:00',
        openDays: 'Mon-Sat',
        bannerEnabled: true,
        bannerText: '🎉 FREE SHIPPING on orders over KSh 5,000! Use code: WELCOME10',
      },
    });

    // Create social handles
    await db.socialHandle.createMany({
      data: [
        { platform: 'instagram', handle: '@clothingctrl', url: 'https://instagram.com/clothingctrl', isActive: true },
        { platform: 'tiktok', handle: '@clothingctrl', url: 'https://tiktok.com/@clothingctrl', isActive: true },
        { platform: 'twitter', handle: '@clothingctrl', url: 'https://twitter.com/clothingctrl', isActive: true },
        { platform: 'facebook', handle: 'ClothingCtrl', url: 'https://facebook.com/clothingctrl', isActive: true },
      ],
    });

    // Create categories
    const tshirts = await db.category.create({
      data: { name: 'T-Shirts', slug: 't-shirts', type: 'CLOTHES', description: 'Premium tees and tops' },
    });
    const hoodies = await db.category.create({
      data: { name: 'Hoodies', slug: 'hoodies', type: 'CLOTHES', description: 'Comfortable hoodies and sweatshirts' },
    });
    const jackets = await db.category.create({
      data: { name: 'Jackets', slug: 'jackets', type: 'CLOTHES', description: 'Statement jackets and coats' },
    });
    const pants = await db.category.create({
      data: { name: 'Pants', slug: 'pants', type: 'CLOTHES', description: 'Street-ready pants and jeans' },
    });
    const accessories = await db.category.create({
      data: { name: 'Accessories', slug: 'accessories', type: 'ACCESSORIES', description: 'Complete your look' },
    });

    // Create products using available local images
    const productsData = [
      { 
        name: 'Heritage Print Tee', 
        slug: 'heritage-print-tee', 
        price: 4500, 
        compareAt: 6000, 
        categoryId: tshirts.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        featured: true, 
        isNew: true, 
        images: '["/images/products/tee-1-1.jpg"]', 
        colors: '["Black","White","Olive"]', 
        sizes: '["S","M","L","XL"]',
        description: 'Premium cotton tee featuring traditional African patterns reimagined for modern streetwear. Made from 100% cotton for ultimate comfort.'
      },
      { 
        name: 'Urban Legacy Tee', 
        slug: 'urban-legacy-tee', 
        price: 3500, 
        categoryId: tshirts.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        isNew: true, 
        images: '["/images/products/tee-1-1.jpg"]', 
        colors: '["Black","Cream"]', 
        sizes: '["S","M","L","XL"]',
        description: 'Minimalist design meets cultural heritage. This tee features subtle detailing and a relaxed fit perfect for everyday wear.'
      },
      { 
        name: 'Empire Hoodie', 
        slug: 'empire-hoodie', 
        price: 8500, 
        compareAt: 10000, 
        categoryId: hoodies.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        featured: true, 
        isLimited: true, 
        limitedQty: 50, 
        images: '["/images/products/hoodie-1-1.jpg"]', 
        colors: '["Black","Grey","Cream"]', 
        sizes: '["S","M","L","XL","XXL"]',
        description: 'The flagship hoodie of our collection. Heavy-weight premium cotton blend with embroidered logo detail. Built for those who lead.'
      },
      { 
        name: 'Warrior Bomber Jacket', 
        slug: 'warrior-bomber-jacket', 
        price: 15000, 
        compareAt: 18000, 
        categoryId: jackets.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        featured: true, 
        isLimited: true, 
        limitedQty: 25, 
        images: '["/images/products/jacket-1-1.jpg"]', 
        colors: '["Black","Olive"]', 
        sizes: '["S","M","L","XL"]',
        description: 'Premium bomber jacket with intricate embroidery inspired by African warrior traditions. Statement piece for the bold.'
      },
      { 
        name: 'Heritage Cargo Pants', 
        slug: 'heritage-cargo-pants', 
        price: 7500, 
        compareAt: 9000, 
        categoryId: pants.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        featured: true, 
        images: '["/images/products/pants-1-1.jpg"]', 
        colors: '["Black","Olive","Khaki"]', 
        sizes: '["28","30","32","34","36"]',
        description: 'Relaxed fit cargo pants with African-inspired pocket detailing. Functional meets fashionable.'
      },
      { 
        name: 'Crown Cap', 
        slug: 'crown-cap', 
        price: 2500, 
        categoryId: accessories.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        featured: true, 
        images: '["/images/products/cap-1-1.jpg"]', 
        colors: '["Black","White","Olive"]', 
        sizes: '["One Size"]',
        description: 'Structured cap with embroidered crown detail. Adjustable strap for perfect fit.'
      },
      { 
        name: 'Legacy Chain', 
        slug: 'legacy-chain', 
        price: 4500, 
        categoryId: accessories.id, 
        brand: 'Clothing Ctrl', 
        condition: 'NEW', 
        images: '["/images/products/chain-1-1.jpg"]', 
        colors: '["Gold","Silver"]', 
        sizes: '["One Size"]',
        description: 'Premium stainless steel chain with pendant inspired by traditional African jewelry. A statement of heritage.'
      },
    ];

    for (const product of productsData) {
      await db.product.create({ data: product });
    }

    // Create reviews
    const allProducts = await db.product.findMany();
    const reviewsData = [
      { name: 'Marcus J.', rating: 5, comment: 'The Heritage Tee is fire! Quality is unmatched and the fit is perfect.', productSlug: 'heritage-print-tee' },
      { name: 'Tanya K.', rating: 5, comment: 'Empire Hoodie is my new favorite. Heavy, comfortable, and looks amazing.', productSlug: 'empire-hoodie' },
      { name: 'David O.', rating: 4, comment: 'Love the Warrior Bomber. The embroidery details are incredible.', productSlug: 'warrior-bomber-jacket' },
      { name: 'Zara M.', rating: 5, comment: 'Best streetwear brand in Nairobi. Quality and style in one.', productSlug: 'urban-legacy-tee' },
      { name: 'James T.', rating: 5, comment: 'The cargos fit perfectly. Will be ordering more colors.', productSlug: 'heritage-cargo-pants' },
    ];
    
    for (const review of reviewsData) {
      const product = allProducts.find(p => p.slug === review.productSlug);
      if (product) {
        await db.review.create({
          data: {
            productId: product.id,
            name: review.name,
            rating: review.rating,
            comment: review.comment,
            verified: true,
          },
        });
      }
    }

    // Create community photos
    await db.communityPhoto.createMany({
      data: [
        { imageUrl: '/images/community/community-1.jpg', username: '@nairobi_style', approved: true },
        { imageUrl: '/images/community/community-2.jpg', username: '@kenya_fits', approved: true },
      ],
    });

    // Create next drop
    const dropDate = new Date();
    dropDate.setDate(dropDate.getDate() + 7);
    dropDate.setHours(12, 0, 0, 0);

    await db.nextDrop.create({
      data: {
        name: 'AFROFUTURE COLLECTION',
        description: 'A bold new collection fusing traditional African aesthetics with futuristic streetwear design.',
        date: dropDate,
        image: '/images/hero/next-drop.jpg',
        active: true,
      },
    });

    // Create FAQ items
    await db.fAQ.createMany({
      data: [
        { question: 'How long does shipping take?', answer: 'Nairobi: 1-2 business days. Kenya: 2-5 business days. International: 7-14 business days.', category: 'SHIPPING', order: 1 },
        { question: 'Do you offer returns?', answer: 'Yes! We accept returns within 14 days of delivery. Items must be unworn with original tags.', category: 'RETURNS', order: 1 },
        { question: 'How can I track my order?', answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS.', category: 'SHIPPING', order: 2 },
        { question: 'Do you ship internationally?', answer: 'Yes! We ship to Uganda, Tanzania, Nigeria, South Africa, UAE, UK, USA and more.', category: 'SHIPPING', order: 3 },
        { question: 'Are your products authentic?', answer: '100% authentic. We source directly from brands and authorized dealers.', category: 'PRODUCTS', order: 1 },
      ],
    });

    // Create a discount code
    await db.discount.create({
      data: {
        code: 'WELCOME10',
        description: '10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 1000,
        isActive: true,
      },
    });

    // Create exchange rates
    await db.exchangeRate.createMany({
      data: [
        { currency: 'USD', rate: 153.5 },
        { currency: 'EUR', rate: 167.2 },
        { currency: 'GBP', rate: 194.8 },
        { currency: 'KES', rate: 1 },
      ],
    });

    // Create Kenya locations
    await db.kenyaLocation.createMany({
      data: [
        { name: 'Nairobi', county: 'Nairobi', type: 'CITY' },
        { name: 'Mombasa', county: 'Mombasa', type: 'CITY' },
        { name: 'Kisumu', county: 'Kisumu', type: 'CITY' },
        { name: 'Nakuru', county: 'Nakuru', type: 'CITY' },
        { name: 'Eldoret', county: 'Uasin Gishu', type: 'TOWN' },
        { name: 'Thika', county: 'Kiambu', type: 'TOWN' },
        { name: 'Malindi', county: 'Kilifi', type: 'TOWN' },
        { name: 'Kitale', county: 'Trans Nzoia', type: 'TOWN' },
        { name: 'Garissa', county: 'Garissa', type: 'TOWN' },
        { name: 'Kakamega', county: 'Kakamega', type: 'TOWN' },
      ],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      products: productsData.length,
      reviews: reviewsData.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
