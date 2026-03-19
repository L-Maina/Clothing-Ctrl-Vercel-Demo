'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, Footprints, Gem, Filter, X, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';

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

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandFromUrl = searchParams.get('brand');
  const quickViewId = searchParams.get('quickview');
  const { openQuickView } = useUIStore();
  
  const [activeTab, setActiveTab] = useState<ProductType>('CLOTHES');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState(brandFromUrl || 'All');
  const [activeCondition, setActiveCondition] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(16);

  // Update brand when URL changes
  useEffect(() => {
    if (brandFromUrl) {
      setActiveBrand(brandFromUrl);
      setIsFilterOpen(true); // Open filter drawer to show the brand is selected
    }
  }, [brandFromUrl]);

  // Handle QuickView from URL parameter
  useEffect(() => {
    if (quickViewId && !isLoading) {
      // Open QuickView modal for the product
      openQuickView(quickViewId);
      // Clear the URL parameter without navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('quickview');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [quickViewId, isLoading, openQuickView, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
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

  useEffect(() => {
    setVisibleCount(16);
  }, [activeTab, activeSubcategory, activeBrand, activeCondition]);

  const filteredProducts = products.filter(product => {
    if (product.category?.type !== activeTab) return false;
    
    if (activeSubcategory !== 'All') {
      const catName = product.category?.name?.toLowerCase() || '';
      if (!catName.includes(activeSubcategory.toLowerCase())) return false;
    }
    
    if (activeBrand !== 'All') {
      if (activeBrand === 'Other') {
        const knownBrands = ['Gucci', 'Prada', 'Balenciaga', 'Bape', 'Diesel', 'Chrome Hearts', 'Carhartt', 'Nike', 'Custom'];
        if (product.brand && knownBrands.includes(product.brand)) return false;
      } else if (product.brand !== activeBrand) {
        return false;
      }
    }
    
    if (activeCondition !== 'All') {
      if (activeCondition === 'New' && product.condition !== 'NEW') return false;
      if (activeCondition === 'Thrifting' && product.condition !== 'THRIFTED') return false;
    }
    
    return true;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    setActiveSubcategory('All');
  }, [activeTab]);

  return (
    <>
    <main className="flex-1 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">SHOP</h1>
          <p className="text-white/50 mt-2">Explore our full collection of premium fashion</p>
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

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
            
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-zinc-900 text-white/70 hover:text-white hover:bg-zinc-800"
            >
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Results Count */}
          <p className="text-white/50 text-sm mb-6">
            Showing {displayedProducts.length} of {filteredProducts.length} products
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
              <p className="text-white/50 text-lg">No products found matching your filters.</p>
              <Button
                onClick={() => {
                  setActiveSubcategory('All');
                  setActiveBrand('All');
                  setActiveCondition('All');
                }}
                className="mt-4 border border-amber-400/50 !bg-transparent text-amber-400 hover:!bg-amber-400 hover:!text-black transition-colors"
              >
                Clear Filters
              </Button>
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
                LOAD MORE PRODUCTS
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Filter Drawer */}
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

              <div className="sticky bottom-0 p-4 bg-zinc-950 border-t border-white/10">
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-4 rounded-none transition-colors"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ShopPageFallback() {
  return (
    <main className="flex-1 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-white/60 mt-4">Loading shop...</p>
        </div>
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageContent />
    </Suspense>
  );
}
