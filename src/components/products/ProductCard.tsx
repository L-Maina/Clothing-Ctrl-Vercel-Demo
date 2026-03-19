'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Heart, RotateCw, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore, useUIStore, useCurrencyStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  name: string;
  verified?: boolean;
}

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
  reviews?: Review[];
  category?: {
    name: string;
    type?: string;
  };
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

// Fallback images for different product types
const getFallbackImage = (productName: string, index: number) => {
  const seed = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://images.unsplash.com/photo-${1558618666 + seed % 1000000}?w=600&h=800&fit=crop&auto=format`;
};

// Helper function to get color hex codes - defined before use
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'cream': '#f5f5dc',
    'olive': '#708238',
    'charcoal': '#36454f',
    'sand': '#c2b280',
    'burgundy': '#800020',
    'navy': '#1e3a5f',
    'tan': '#d2b48c',
    'khaki': '#c3b091',
    'grey': '#808080',
    'gray': '#808080',
    'gold': '#ffd700',
    'silver': '#c0c0c0',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'brown': '#78350f',
    'beige': '#d4a574',
    'pink': '#ec4899',
    'purple': '#a855f7',
    'green camo': '#4a5d23',
    'blue camo': '#3d5a80',
    'white/green': '#f0f5f0',
    'red/black': '#8b0000',
    'white/black': '#e8e8e8',
    'various': '#808080',
    'one size': '#808080',
    'multicolor': '#808080',
  };
  
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || '#888888';
}

// Check if a color is light (needs dark border)
function isLightColor(color: string): boolean {
  const lightColors = ['white', 'cream', 'beige', 'sand', 'tan', 'khaki', 'silver', 'yellow', 'gold', 'multicolor', 'white/green', 'white/black'];
  return lightColors.includes(color.toLowerCase());
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { addItem } = useCartStore();
  const { openQuickView } = useUIStore();
  const { formatPrice } = useCurrencyStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();

  // Detect mobile for touch-friendly interactions
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
  const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
  const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes;
  
  const frontImage = images[0] || getFallbackImage(product.name, 0);
  const backImage = images[1] || images[0] || getFallbackImage(product.name, 1);
  
  const isLiked = isInWishlist(product.id);

  // Check if product has multiple images (for back view)
  const hasMultipleImages = images.length > 1;

  // Show actions on mobile or when hovered
  const showActions = isMobile || isHovered;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: frontImage,
      color: colors[selectedColor] || 'Default',
      size: sizes[selectedSize] || 'One Size',
      quantity: 1,
    });
  };

  const handleToggleWishlist = () => {
    if (isLiked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: frontImage,
        brand: product.brand,
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const displayFrontImage = imageError ? getFallbackImage(product.name, index) : frontImage;
  const displayBackImage = imageError ? getFallbackImage(product.name, index + 1) : backImage;

  // Calculate discount percentage
  const discountPercentage = product.compareAt 
    ? Math.round((1 - product.price / product.compareAt) * 100) 
    : null;

  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className="relative aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
        {/* Back Image - Shows on hover (rendered first, underneath) */}
        {hasMultipleImages && (
          <motion.img
            src={displayBackImage}
            alt={`${product.name} back view`}
            onError={handleImageError}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Front Image - Default view (rendered on top) */}
        <motion.img
          src={displayFrontImage}
          alt={product.name}
          onError={handleImageError}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 relative z-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: isHovered && hasMultipleImages ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Back view indicator - shows when hovering and has multiple images */}
        <AnimatePresence>
          {isHovered && hasMultipleImages && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white/80 text-xs flex items-center gap-1 z-10"
            >
              <RotateCw className="w-3 h-3" />
              BACK VIEW
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay - only on desktop hover */}
        <motion.div 
          className="absolute inset-0 bg-black/20 pointer-events-none hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Badges - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {product.isNew && (
            <span className="bg-amber-400 text-black text-xs font-bold px-3 py-1 tracking-wider">
              NEW
            </span>
          )}
          {product.isLimited && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 tracking-wider">
              LIMITED
            </span>
          )}
          {discountPercentage && (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 tracking-wider">
              -{discountPercentage}%
            </span>
          )}
          {product.condition === 'THRIFTED' && (
            <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 tracking-wider">
              THRIFTED
            </span>
          )}
        </div>

        {/* Quick Actions - Top Left - Always visible on mobile, hover on desktop */}
        <motion.div
          className="absolute top-3 left-3 flex flex-col gap-2 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: showActions ? 1 : 0, x: showActions ? 0 : -20 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: showActions ? 'auto' : 'none' }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleToggleWishlist();
            }}
            className={cn(
              "w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center transition-all",
              isLiked 
                ? "bg-red-500 text-white" 
                : "bg-white/10 hover:bg-amber-400 hover:text-black text-white"
            )}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openQuickView(product.id);
            }}
            className="w-9 h-9 bg-white/10 backdrop-blur-sm hover:bg-amber-400 hover:text-black text-white rounded-full flex items-center justify-center transition-all"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Quick Add */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-3 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: showActions ? 'auto' : 'none' }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleAddToCart();
            }}
            className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-3 rounded-none group/btn transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
            ADD TO CART
          </Button>
        </motion.div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 px-1">
        {/* Brand */}
        {product.brand && (
          <p className="text-amber-400/80 text-xs font-medium tracking-wide mb-1 text-center">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <h3 className="text-white font-medium text-sm text-center group-hover:text-amber-400 transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating Display */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const avgRating = product.reviews!.reduce((sum, r) => sum + r.rating, 0) / product.reviews!.length;
                return (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5",
                      star <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-white/30"
                    )}
                  />
                );
              })}
            </div>
            <span className="text-white/50 text-xs">
              ({product.reviews.length})
            </span>
          </div>
        )}

        {/* Color Options - Interactive */}
        {colors && colors.length > 0 && (
          <div className="flex flex-col items-center mt-3">
            <p className="text-white/50 text-xs mb-2 h-4">
              {colors[selectedColor] || 'Select color'}
            </p>
            <div className="flex justify-center gap-2">
              {colors.slice(0, 6).map((color: string, idx: number) => (
                <button
                  key={`${color}-${idx}`}
                  onClick={() => setSelectedColor(idx)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center",
                    selectedColor === idx 
                      ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-110" 
                      : "hover:scale-110"
                  )}
                  style={{
                    backgroundColor: getColorHex(color),
                    border: isLightColor(color) ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  }}
                  title={color}
                >
                  {selectedColor === idx && (
                    <motion.div
                      layoutId="colorCheck"
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isLightColor(color) ? "bg-black" : "bg-white"
                      )}
                    />
                  )}
                </button>
              ))}
              {colors.length > 6 && (
                <span className="text-white/40 text-xs flex items-center ml-1">
                  +{colors.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-white font-bold text-base">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-white/40 text-sm line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
