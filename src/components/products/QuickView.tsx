'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Heart, Share2, Check, ShoppingCart, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useUIStore, useCurrencyStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Helper function to get color hex codes
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

function isLightColor(color: string): boolean {
  const lightColors = ['white', 'cream', 'beige', 'sand', 'tan', 'khaki', 'silver', 'yellow', 'gold', 'multicolor', 'white/green', 'white/black'];
  return lightColors.includes(color.toLowerCase());
}

export function QuickView() {
  const { isQuickViewOpen, quickViewProductId, closeQuickView } = useUIStore();
  const { addItem, openCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch product when modal opens with a new productId
  useEffect(() => {
    let isCancelled = false;
    
    if (quickViewProductId && isQuickViewOpen) {
      // Start loading after the effect, not synchronously
      const loadProduct = async () => {
        if (isCancelled) return;
        
        setIsLoading(true);
        setProduct(null);
        
        try {
          const res = await fetch(`/api/products?id=${quickViewProductId}`);
          const data = await res.json();
          if (!isCancelled) {
            setProduct(data);
            setIsLoading(false);
          }
        } catch {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };
      
      // Use requestAnimationFrame to defer state updates
      requestAnimationFrame(loadProduct);
    }
    
    return () => {
      isCancelled = true;
    };
  }, [quickViewProductId, isQuickViewOpen]);

  // Reset state when modal closes - use a separate ref to avoid cascading
  const prevIsOpen = useRef(isQuickViewOpen);
  useEffect(() => {
    if (prevIsOpen.current && !isQuickViewOpen) {
      // Modal just closed, reset state asynchronously
      requestAnimationFrame(() => {
        setSelectedImage(0);
        setSelectedColor(0);
        setSelectedSize(0);
        setQuantity(1);
        setProduct(null);
      });
    }
    prevIsOpen.current = isQuickViewOpen;
  }, [isQuickViewOpen]);

  const handleClose = () => {
    closeQuickView();
  };

  const images = product ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images || []) : [];
  const colors = product ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || []) : [];
  const sizes = product ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes || []) : [];

  const isLiked = product ? isInWishlist(product.id as string) : false;

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      productId: product.id as string,
      name: product.name as string,
      price: product.price as number,
      image: images[0] || '',
      color: colors[selectedColor] || 'Default',
      size: sizes[selectedSize] || 'One Size',
      quantity,
    });
    
    setAddedToCart(true);
    setIsAddingToCart(false);
    
    // Reset after 2 seconds and close
    setTimeout(() => {
      setAddedToCart(false);
      openCart(); // Open cart drawer instead of closing
      handleClose();
    }, 800);
  };

  const handleShare = async () => {
    if (!product) return;
    
    const productUrl = `${window.location.origin}/product/${product.slug || product.id}`;
    const shareData = {
      title: product.name as string,
      text: `Check out ${product.name} on Clothing Ctrl!`,
      url: productUrl,
    };
    
    // Try native share (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = productUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    if (isLiked) {
      removeFromWishlist(product.id as string);
    } else {
      addToWishlist({
        productId: product.id as string,
        name: product.name as string,
        price: product.price as number,
        image: images[0] || '',
        brand: product.brand as string,
      });
    }
  };

  return (
    <AnimatePresence>
      {isQuickViewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-zinc-950 border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button - More Visible */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-full flex items-center gap-2 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Loading State */}
            {(isLoading || !product) && (
              <div className="flex items-center justify-center min-h-[400px] p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/60">Loading product...</p>
                </div>
              </div>
            )}

            {/* Product Content */}
            {!isLoading && product && (
              <div className="grid md:grid-cols-2">
                {/* Images */}
                <div className="relative aspect-square bg-zinc-900">
                  <img
                    src={images[selectedImage] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'}
                    alt={product.name as string}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      {images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={cn(
                            "w-16 h-16 border-2 overflow-hidden transition-all",
                            selectedImage === idx ? "border-amber-400" : "border-transparent opacity-60"
                          )}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6 lg:p-8">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-amber-400 font-medium tracking-wide text-sm mb-2">
                      {product.brand as string}
                    </p>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {product.name as string}
                  </h2>

                  {/* Condition Badge */}
                  {product.condition && product.condition !== 'NEW' && (
                    <span className={cn(
                      "inline-block text-xs font-bold px-3 py-1 tracking-wider mb-4",
                      product.condition === 'THRIFTED' ? "bg-purple-500 text-white" :
                      "bg-zinc-600 text-white"
                    )}>
                      {product.condition as string}
                    </span>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-bold text-white">{formatPrice(product.price as number)}</span>
                    {product.compareAt && (
                      <span className="text-lg text-white/40 line-through">{formatPrice(product.compareAt as number)}</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    {product.description as string}
                  </p>

                  {/* Color */}
                  {colors.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-white text-sm font-medium mb-3">
                        Color: <span className="text-amber-400">{colors[selectedColor]}</span>
                      </label>
                      <div className="flex gap-2">
                        {colors.map((color: string, idx: number) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(idx)}
                            className={cn(
                              "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                              selectedColor === idx 
                                ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black" 
                                : "hover:scale-110"
                            )}
                            style={{
                              backgroundColor: getColorHex(color),
                              border: isLightColor(color) ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            }}
                            title={color}
                          >
                            {selectedColor === idx && (
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                isLightColor(color) ? "bg-black" : "bg-white"
                              )} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size */}
                  {sizes.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-white text-sm font-medium mb-3">
                        Size: <span className="text-amber-400">{sizes[selectedSize]}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string, idx: number) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(idx)}
                            className={cn(
                              "min-w-12 h-10 px-3 border text-sm font-medium transition-all",
                              selectedSize === idx 
                                ? "bg-amber-400 text-black border-amber-400" 
                                : "bg-transparent text-white border-white/30 hover:border-white"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-3">Quantity</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/30">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-white font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {/* Add to Cart Button */}
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addedToCart}
                      className={cn(
                        "w-full font-bold py-4 text-lg transition-all duration-300 flex items-center justify-center gap-2",
                        addedToCart 
                          ? "bg-green-500 text-white" 
                          : "bg-amber-400 hover:!bg-amber-300 text-black"
                      )}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : addedToCart ? (
                        <>
                          <Check className="w-5 h-5" />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          ADD TO CART — {formatPrice((product.price as number) * quantity)}
                        </>
                      )}
                    </Button>
                    
                    {/* Secondary Actions */}
                    <div className="flex gap-3">
                      <button 
                        onClick={handleToggleWishlist}
                        className={cn(
                          "flex-1 h-12 flex items-center justify-center gap-2 border transition-all",
                          isLiked 
                            ? "bg-red-500/20 border-red-500 text-red-400" 
                            : "border-white/30 text-white/60 hover:border-amber-400 hover:text-amber-400"
                        )}
                      >
                        <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                        <span className="text-sm font-medium">{isLiked ? 'Saved' : 'Save'}</span>
                      </button>
                      <button 
                        onClick={handleShare}
                        className={cn(
                          "flex-1 h-12 flex items-center justify-center gap-2 border transition-all",
                          copied 
                            ? "bg-green-500/20 border-green-500 text-green-400" 
                            : "border-white/30 text-white/60 hover:border-amber-400 hover:text-amber-400"
                        )}
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Share</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Limited Badge */}
                  {product.isLimited && (
                    <p className="text-center text-red-400 text-sm mt-4">
                      🔥 Only {product.limitedQty as number} left — Limited Edition
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
