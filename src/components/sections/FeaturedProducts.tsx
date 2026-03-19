'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="featured" className="py-16 lg:py-24 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-amber-400 font-medium tracking-wider text-sm uppercase mb-2">
              Designer Picks
            </p>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              BEST SELLERS
            </h2>
          </div>
          <Button
            asChild
            className="border border-white/30 !bg-transparent text-white hover:!bg-white hover:!text-black rounded-none group self-start md:self-auto transition-colors"
          >
            <Link href="#featured">
              View All
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} columns={3} />
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No products available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
