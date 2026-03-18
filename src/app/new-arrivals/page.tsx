'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  images: string | string[];
  colors: string | string[];
  sizes: string | string[];
  isNew?: boolean;
  isLimited?: boolean;
  limitedQty?: number | null;
  brand?: string | null;
  condition?: string;
  category?: {
    name: string;
    type: string;
  };
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?new=true');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">NEW ARRIVALS</h1>
            </div>
            <p className="text-white/50 mt-2">The latest additions to our collection</p>
          </div>

          {/* Featured Banner */}
          <div className="bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-400/30 rounded-lg p-8 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">Fresh Drops Weekly</h2>
              <p className="text-white/70">
                We update our collection every week with the latest trends. Be the first to grab these pieces 
                before they're gone. Follow us on Instagram and TikTok for early access notifications.
              </p>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-white/50 text-sm mb-6">
            {products.length} new items just dropped
          </p>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : displayedProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {displayedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">No new arrivals at the moment.</p>
              <p className="text-white/30 text-sm mt-2">Check back soon for fresh drops!</p>
              <Link href="/">
                <Button className="mt-6 bg-amber-400 hover:bg-amber-300 text-black font-bold">
                  Browse Full Collection
                </Button>
              </Link>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={() => setVisibleCount(prev => prev + 16)}
                variant="outline"
                className="!border-white !bg-transparent text-white hover:!bg-white hover:!text-black px-8 py-6 rounded-none transition-colors"
              >
                LOAD MORE
              </Button>
            </div>
          )}
        </div>
      </main>
  );
}
