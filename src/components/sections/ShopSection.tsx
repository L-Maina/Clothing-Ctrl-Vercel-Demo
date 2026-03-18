'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Footprints, Gem, ChevronDown, Filter, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

type ProductType = 'CLOTHES' | 'SHOES' | 'ACCESSORIES';

const typeTabs = [
  { id: 'CLOTHES' as ProductType, label: 'Clothes', icon: Shirt },
  { id: 'SHOES' as ProductType, label: 'Shoes', icon: Footprints },
  { id: 'ACCESSORIES' as ProductType, label: 'Accessories', icon: Gem },
];

const subcategories = {
  CLOTHES: ['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts'],
  SHOES: ['All', 'Sneakers', 'Boots', 'Loafers'],
  ACCESSORIES: ['All', 'Bags', 'Belts', 'Wallets', 'Chains', 'Hats'],
};

const brandFilters = [
  'All', 'Gucci', 'Prada', 'Balenciaga', 'Bape', 'Diesel', 
  'Chrome Hearts', 'Carhartt', 'Nike', 'Custom', 'Other'
];

const conditionFilters = ['All', 'New', 'Thrifting'];

export function ShopSection() {
  const [activeTab, setActiveTab] = useState<ProductType>('CLOTHES');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [activeCondition, setActiveCondition] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        // API returns array directly
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(8);
  }, [activeTab, activeSubcategory, activeBrand, activeCondition]);

  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by type
    if (product.category?.type !== activeTab) return false;
    
    // Filter by subcategory
    if (activeSubcategory !== 'All') {
      const catName = product.category?.name?.toLowerCase() || '';
      if (!catName.includes(activeSubcategory.toLowerCase())) return false;
    }
    
    // Filter by brand
    if (activeBrand !== 'All') {
      if (activeBrand === 'Other') {
        const knownBrands = ['Gucci', 'Prada', 'Balenciaga', 'Bape', 'Diesel', 'Chrome Hearts', 'Carhartt', 'Nike', 'Adidas', 'Custom'];
        if (product.brand && knownBrands.includes(product.brand)) return false;
      } else if (product.brand !== activeBrand) {
        return false;
      }
    }
    
    // Filter by condition
    if (activeCondition !== 'All') {
      if (activeCondition === 'New' && product.condition !== 'NEW') return false;
      if (activeCondition === 'Thrifting' && product.condition !== 'THRIFTED') return false;
    }
    
    return true;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // Reset subcategory when tab changes
  useEffect(() => {
    setActiveSubcategory('All');
  }, [activeTab]);

  return (
    <section className="py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-amber-400 font-medium tracking-[0.2em] text-sm mb-4">
            EXPLORE OUR COLLECTION
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            SHOP THE LOOK
          </h2>
          <Link href="/shop">
            <Button
              className="border-amber-400 !bg-transparent text-amber-400 hover:!bg-amber-400 hover:!text-black rounded-none group transition-colors"
            >
              VIEW FULL SHOP
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-zinc-900 rounded-lg p-1">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-amber-400 text-black"
                    : "text-white/70 hover:text-white"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Pills & Filter Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {subcategories[activeTab].map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubcategory(sub)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeSubcategory === sub
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-white/70 hover:text-white hover:bg-zinc-800"
              )}
            >
              {sub}
            </button>
          ))}
          
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-zinc-900 text-white/70 hover:text-white hover:bg-zinc-800"
          >
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

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
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/50 text-lg">No products found matching your filters.</p>
            <Button
              onClick={() => {
                setActiveSubcategory('All');
                setActiveBrand('All');
                setActiveCondition('All');
              }}
              variant="outline"
              className="mt-4 border-amber-400/50 text-amber-400 hover:bg-amber-400 hover:text-black"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={() => setVisibleCount(prev => prev + 8)}
              variant="outline"
              className="!border-white !bg-transparent text-white hover:!bg-white hover:!text-black px-8 py-6 rounded-none transition-colors"
            >
              LOAD MORE PRODUCTS
            </Button>
          </div>
        )}

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 right-0 w-full max-w-md h-full bg-zinc-950 border-l border-white/10 overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-zinc-950 border-b border-white/10 p-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Filters</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Subcategory */}
                  <div>
                    <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                      {activeTab === 'CLOTHES' ? 'Clothing Type' : activeTab === 'SHOES' ? 'Shoe Type' : 'Accessory Type'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subcategories[activeTab].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setActiveSubcategory(sub)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeSubcategory === sub
                              ? "bg-amber-400 text-black"
                              : "bg-zinc-800 text-white/70 hover:text-white"
                          )}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Brand</h4>
                    <div className="flex flex-wrap gap-2">
                      {brandFilters.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setActiveBrand(brand)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeBrand === brand
                              ? "bg-amber-400 text-black"
                              : "bg-zinc-800 text-white/70 hover:text-white"
                          )}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Condition</h4>
                    <div className="flex flex-wrap gap-2">
                      {conditionFilters.map((condition) => (
                        <button
                          key={condition}
                          onClick={() => setActiveCondition(condition)}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeCondition === condition
                              ? "bg-amber-400 text-black"
                              : "bg-zinc-800 text-white/70 hover:text-white"
                          )}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="sticky bottom-0 p-4 bg-zinc-950 border-t border-white/10">
                  <Button
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-black font-bold py-4 rounded-none"
                  >
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
