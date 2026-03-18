'use client';

import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  images: string;
  colors: string;
  sizes: string;
  isNew?: boolean;
  isLimited?: boolean;
  limitedQty?: number | null;
  brand?: string | null;
  condition?: string;
  category?: {
    name: string;
    type?: string;
  };
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 lg:gap-8`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={{
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
            colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
            sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
          }}
          index={index}
        />
      ))}
    </div>
  );
}
