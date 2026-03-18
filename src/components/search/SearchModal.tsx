'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight, TrendingUp, Sparkles, Shirt, Footprints, Gem } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, useCurrencyStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  images: string | string[];
  brand?: string | null;
  condition?: string;
  category?: {
    name: string;
    type: string;
  };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Popular/trending searches
const POPULAR_SEARCHES = [
  'Vintage Jacket',
  'Designer Jeans',
  'Limited Drop',
  'New Arrivals',
  'Thrifting',
];

// Category suggestions with icons
const CATEGORY_SUGGESTIONS = [
  { name: 'Clothes', type: 'CLOTHES', icon: Shirt, color: 'text-amber-400' },
  { name: 'Shoes', type: 'SHOES', icon: Footprints, color: 'text-purple-400' },
  { name: 'Accessories', type: 'ACCESSORIES', icon: Gem, color: 'text-blue-400' },
];

// Popular brands for suggestions
const POPULAR_BRANDS = [
  'Gucci',
  'Balenciaga',
  'Bape',
  'Off-White',
  'Supreme',
  'Nike',
  'Adidas',
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('clothing-ctrl-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('clothing-ctrl-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Generate suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const newSuggestions: string[] = [];

    // Add matching popular searches
    POPULAR_SEARCHES.forEach(search => {
      if (search.toLowerCase().includes(queryLower) && !newSuggestions.includes(search)) {
        newSuggestions.push(search);
      }
    });

    // Add matching brands
    POPULAR_BRANDS.forEach(brand => {
      if (brand.toLowerCase().includes(queryLower) && !newSuggestions.includes(brand)) {
        newSuggestions.push(brand);
      }
    });

    // Add category suggestions
    CATEGORY_SUGGESTIONS.forEach(cat => {
      if (cat.name.toLowerCase().includes(queryLower) && !newSuggestions.includes(cat.name)) {
        newSuggestions.push(cat.name);
      }
    });

    setSuggestions(newSuggestions.slice(0, 5));
  }, [query]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      const totalItems = suggestions.length > 0 ? suggestions.length + results.length : results.length;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        if (selectedIndex < suggestions.length && suggestions[selectedIndex]) {
          setQuery(suggestions[selectedIndex]);
          setSelectedIndex(-1);
        } else if (results[selectedIndex - suggestions.length]) {
          handleProductClick(results[selectedIndex - suggestions.length]);
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape, true);
      document.addEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, suggestions, results, selectedIndex]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleProductClick = (product: Product) => {
    saveRecentSearch(query);
    onClose();
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '',
      color: 'Default',
      size: 'One Size',
      quantity: 1,
    });
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
  };

  const getFallbackImage = (productName: string) => {
    const seed = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://images.unsplash.com/photo-${1558618666 + seed % 1000000}?w=200&h=250&fit=crop&auto=format`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl mx-auto mt-20 px-4"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                autoFocus
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-12 pr-24 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 text-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-white/50 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-full transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : query.trim() ? (
                <div className="space-y-4">
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div>
                      <p className="text-white/50 text-sm px-2 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Suggestions
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                              selectedIndex === idx 
                                ? "bg-amber-400/20 text-amber-400" 
                                : "hover:bg-zinc-800 text-white"
                            )}
                          >
                            <Search className="w-4 h-4 text-white/40" />
                            <span>{suggestion}</span>
                            <ArrowRight className="w-4 h-4 ml-auto text-white/30" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Results */}
                  {results.length > 0 && (
                    <div>
                      <p className="text-white/50 text-sm px-2 mb-2">
                        {results.length} product{results.length !== 1 ? 's' : ''} found
                      </p>
                      <div className="space-y-2">
                        {results.map((product, idx) => {
                          const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                          const globalIdx = suggestions.length + idx;
                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => handleProductClick(product)}
                              className={cn(
                                "flex items-center gap-4 p-3 rounded-lg cursor-pointer group transition-colors",
                                selectedIndex === globalIdx 
                                  ? "bg-amber-400/20" 
                                  : "bg-zinc-900/50 hover:bg-zinc-800"
                              )}
                            >
                              {/* Image */}
                              <div className="w-16 h-20 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={images[0] || getFallbackImage(product.name)}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getFallbackImage(product.name);
                                  }}
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                {product.brand && (
                                  <p className="text-amber-400/80 text-xs font-medium">{product.brand}</p>
                                )}
                                <h3 className="text-white font-medium truncate">{product.name}</h3>
                                <p className="text-white/50 text-sm">{product.category?.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-white font-bold">{formatPrice(product.price)}</span>
                                  {product.compareAt && (
                                    <span className="text-white/40 text-sm line-through">
                                      {formatPrice(product.compareAt)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Add */}
                              <button
                                onClick={(e) => handleQuickAdd(product, e)}
                                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                              >
                                Add <ArrowRight className="w-4 h-4" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {results.length === 0 && suggestions.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <p className="text-white/50 text-lg">No results for "{query}"</p>
                      <p className="text-white/30 text-sm mt-2">Try a different search term</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Initial State - Suggestions & Recent */
                <div className="space-y-6 px-2">
                  {/* Trending Searches */}
                  <div>
                    <p className="text-white/50 text-sm mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Trending Now
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(search)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-amber-400 hover:text-black text-white/70 hover:text-black rounded-full text-sm transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category Suggestions */}
                  <div>
                    <p className="text-white/50 text-sm mb-3">Browse by Category</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <Link
                          key={cat.type}
                          href={`/shop?category=${cat.type.toLowerCase()}`}
                          onClick={onClose}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm transition-colors"
                        >
                          <cat.icon className={cn("w-4 h-4", cat.color)} />
                          <span className="text-white/70">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Popular Brands */}
                  <div>
                    <p className="text-white/50 text-sm mb-3">Popular Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_BRANDS.slice(0, 6).map((brand, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(brand)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white rounded-full text-sm transition-colors"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="text-white/50 text-sm mb-3">Recent searches</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleRecentSearch(search)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white rounded-full text-sm transition-colors flex items-center gap-2"
                          >
                            <Search className="w-3 h-3 text-white/40" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close hint - Desktop only */}
            <p className="hidden md:block text-center text-white/30 text-sm mt-6">
              Press <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">ESC</kbd> to close • Use <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">↑↓</kbd> to navigate
            </p>
            
            {/* Mobile close hint */}
            <p className="md:hidden text-center text-white/30 text-sm mt-6">
              Tap outside or click Done to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
