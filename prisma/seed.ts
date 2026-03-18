import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.communityPhoto.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.loyalty.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.subscriber.deleteMany();
  await prisma.nextDrop.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Premium streetwear tees with bold African-inspired designs',
        image: '/images/categories/tshirts.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Comfortable hoodies for the ultimate streetwear look',
        image: '/images/categories/hoodies.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Jackets',
        slug: 'jackets',
        description: 'Statement jackets that command attention',
        image: '/images/categories/jackets.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pants',
        slug: 'pants',
        description: 'Street-ready pants with perfect fit',
        image: '/images/categories/pants.jpg',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Complete your look with our accessories',
        image: '/images/categories/accessories.jpg',
      },
    }),
  ]);

  // Create products
  const products = [
    // T-Shirts
    {
      name: 'Heritage Print Tee',
      slug: 'heritage-print-tee',
      description: 'A bold statement piece featuring traditional African patterns reimagined for the modern streetwear aesthetic. Made from 100% premium cotton for ultimate comfort and durability.',
      price: 65,
      compareAt: 85,
      images: JSON.stringify(['/images/products/tee-1-1.jpg', '/images/products/tee-1-2.jpg']),
      colors: JSON.stringify(['Black', 'Cream', 'Olive']),
      sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
      categoryId: categories[0].id,
      featured: true,
      isNew: true,
    },
    {
      name: 'Urban Legacy Tee',
      slug: 'urban-legacy-tee',
      description: 'Minimalist design meets cultural heritage. This tee features subtle embossed detailing and a relaxed fit perfect for everyday wear.',
      price: 55,
      images: JSON.stringify(['/images/products/tee-2-1.jpg', '/images/products/tee-2-2.jpg']),
      colors: JSON.stringify(['White', 'Black', 'Sand']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: categories[0].id,
      featured: true,
    },
    {
      name: 'Ancestral Graphic Tee',
      slug: 'ancestral-graphic-tee',
      description: 'Eye-catching graphic tee featuring powerful ancestral imagery. Each piece tells a story of heritage and pride.',
      price: 70,
      compareAt: 90,
      images: JSON.stringify(['/images/products/tee-3-1.jpg', '/images/products/tee-3-2.jpg']),
      colors: JSON.stringify(['Black', 'Burgundy']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      categoryId: categories[0].id,
      isNew: true,
    },
    // Hoodies
    {
      name: 'Empire Hoodie',
      slug: 'empire-hoodie',
      description: 'The flagship hoodie of our collection. Heavy-weight premium cotton blend with embroidered logo detail. Built for those who lead.',
      price: 145,
      compareAt: 180,
      images: JSON.stringify(['/images/products/hoodie-1-1.jpg', '/images/products/hoodie-1-2.jpg']),
      colors: JSON.stringify(['Black', 'Charcoal', 'Cream']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      categoryId: categories[1].id,
      featured: true,
      isLimited: true,
      limitedQty: 50,
    },
    {
      name: 'Street Prophet Hoodie',
      slug: 'street-prophet-hoodie',
      description: 'Oversized hoodie with bold back print featuring prophetic African motifs. The perfect blend of comfort and statement.',
      price: 165,
      images: JSON.stringify(['/images/products/hoodie-2-1.jpg', '/images/products/hoodie-2-2.jpg']),
      colors: JSON.stringify(['Black', 'Olive', 'Sand']),
      sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
      categoryId: categories[1].id,
      isNew: true,
    },
    {
      name: 'Minimal Logo Hoodie',
      slug: 'minimal-logo-hoodie',
      description: 'Clean lines, premium fabric, subtle branding. For those who let quality speak louder than logos.',
      price: 125,
      images: JSON.stringify(['/images/products/hoodie-3-1.jpg', '/images/products/hoodie-3-2.jpg']),
      colors: JSON.stringify(['Black', 'White', 'Grey']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: categories[1].id,
    },
    // Jackets
    {
      name: 'Warrior Bomber Jacket',
      slug: 'warrior-bomber-jacket',
      description: 'Premium bomber jacket with intricate embroidery inspired by African warrior traditions. Statement piece for the bold.',
      price: 245,
      compareAt: 300,
      images: JSON.stringify(['/images/products/jacket-1-1.jpg', '/images/products/jacket-1-2.jpg']),
      colors: JSON.stringify(['Black', 'Olive']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: categories[2].id,
      featured: true,
      isLimited: true,
      limitedQty: 25,
    },
    {
      name: 'Tech Windbreaker',
      slug: 'tech-windbreaker',
      description: 'Lightweight, water-resistant windbreaker with modern tech details. Built for urban exploration.',
      price: 175,
      images: JSON.stringify(['/images/products/jacket-2-1.jpg', '/images/products/jacket-2-2.jpg']),
      colors: JSON.stringify(['Black', 'Navy', 'Tan']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: categories[2].id,
      isNew: true,
    },
    // Pants
    {
      name: 'Heritage Cargo Pants',
      slug: 'heritage-cargo-pants',
      description: 'Relaxed fit cargo pants with African-inspired pocket detailing. Functional meets fashionable.',
      price: 135,
      compareAt: 165,
      images: JSON.stringify(['/images/products/pants-1-1.jpg', '/images/products/pants-1-2.jpg']),
      colors: JSON.stringify(['Black', 'Olive', 'Khaki']),
      sizes: JSON.stringify(['28', '30', '32', '34', '36']),
      categoryId: categories[3].id,
      featured: true,
    },
    {
      name: 'Urban Joggers',
      slug: 'urban-joggers',
      description: 'Premium joggers with tapered fit. Perfect for street-to-casual transitions.',
      price: 95,
      images: JSON.stringify(['/images/products/pants-2-1.jpg', '/images/products/pants-2-2.jpg']),
      colors: JSON.stringify(['Black', 'Grey', 'Navy']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      categoryId: categories[3].id,
      isNew: true,
    },
    // Accessories
    {
      name: 'Crown Cap',
      slug: 'crown-cap',
      description: 'Structured cap with embroidered crown detail. Adjustable strap for perfect fit.',
      price: 45,
      images: JSON.stringify(['/images/products/cap-1-1.jpg', '/images/products/cap-1-2.jpg']),
      colors: JSON.stringify(['Black', 'White', 'Olive']),
      sizes: JSON.stringify(['One Size']),
      categoryId: categories[4].id,
      featured: true,
    },
    {
      name: 'Legacy Chain',
      slug: 'legacy-chain',
      description: 'Premium stainless steel chain with pendant inspired by traditional African jewelry. A statement of heritage.',
      price: 85,
      images: JSON.stringify(['/images/products/chain-1-1.jpg', '/images/products/chain-1-2.jpg']),
      colors: JSON.stringify(['Gold', 'Silver']),
      sizes: JSON.stringify(['One Size']),
      categoryId: categories[4].id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Create reviews
  const reviewData = [
    { name: 'Marcus J.', rating: 5, comment: 'The Heritage Print Tee is fire! Quality is unmatched and the fit is perfect.', productId: products[0].slug },
    { name: 'Tanya K.', rating: 5, comment: 'Empire Hoodie is my new favorite. Heavy, comfortable, and looks amazing.', productId: products[3].slug },
    { name: 'David O.', rating: 4, comment: 'Love the Warrior Bomber. The embroidery details are incredible.', productId: products[6].slug },
    { name: 'Zara M.', rating: 5, comment: 'Best streetwear brand out there. Quality and style in one.', productId: products[1].slug },
    { name: 'James T.', rating: 5, comment: 'The cargos fit perfectly. Will be ordering more colors.', productId: products[8].slug },
  ];

  const allProducts = await prisma.product.findMany();
  
  for (const review of reviewData) {
    const product = allProducts.find(p => p.slug === review.productId);
    if (product) {
      await prisma.review.create({
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
  const communityPhotos = [
    { imageUrl: '/images/community/community-1.jpg', username: '@styleking', approved: true },
    { imageUrl: '/images/community/community-2.jpg', username: '@urbanqueen', approved: true },
    { imageUrl: '/images/community/community-3.jpg', username: '@streetprophet', approved: true },
    { imageUrl: '/images/community/community-4.jpg', username: '@fashionforward', approved: true },
    { imageUrl: '/images/community/community-5.jpg', username: '@afrovibes', approved: true },
    { imageUrl: '/images/community/community-6.jpg', username: '@cultureking', approved: true },
  ];

  for (const photo of communityPhotos) {
    await prisma.communityPhoto.create({ data: photo });
  }

  // Create next drop
  const dropDate = new Date();
  dropDate.setDate(dropDate.getDate() + 7);
  dropDate.setHours(12, 0, 0, 0);

  await prisma.nextDrop.create({
    data: {
      name: 'AFROFUTURE COLLECTION',
      description: 'A bold new collection fusing traditional African aesthetics with futuristic streetwear design.',
      date: dropDate,
      image: '/images/hero/next-drop.jpg',
      active: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${products.length} products`);
  console.log(`Created ${reviewData.length} reviews`);
  console.log(`Created ${communityPhotos.length} community photos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
