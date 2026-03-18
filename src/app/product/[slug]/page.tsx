'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Minus, Plus, Heart, Share2, Check, ShoppingCart, Truck, 
  Shield, RotateCcw, ChevronRight, Star, X, Ruler, Package
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { useCartStore, useCurrencyStore, useWishlistStore, useAuthStore } from '@/lib/store';
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
  };
  
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || '#888888';
}

function isLightColor(color: string): boolean {
  const lightColors = ['white', 'cream', 'beige', 'sand', 'tan', 'khaki', 'silver', 'yellow', 'gold'];
  return lightColors.includes(color.toLowerCase());
}

// Size Guide Component
function SizeGuideModal({ 
  isOpen, 
  onClose, 
  type 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  type: 'clothes' | 'shoes' | 'accessories';
}) {
  const sizeCharts = {
    clothes: {
      headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)'],
      rows: [
        ['XS', '32-34', '26-28', '34-36'],
        ['S', '35-37', '29-31', '37-39'],
        ['M', '38-40', '32-34', '40-42'],
        ['L', '41-43', '35-37', '43-45'],
        ['XL', '44-46', '38-40', '46-48'],
        ['XXL', '47-49', '41-43', '49-51'],
      ],
    },
    shoes: {
      headers: ['US', 'UK', 'EU', 'CM'],
      rows: [
        ['6', '5', '38.5', '24'],
        ['7', '6', '39.5', '25'],
        ['8', '7', '41', '26'],
        ['9', '8', '42', '27'],
        ['10', '9', '43', '28'],
        ['11', '10', '44', '29'],
        ['12', '11', '45', '30'],
      ],
    },
    accessories: {
      headers: ['Type', 'Size', 'Details'],
      rows: [
        ['Belts', 'S', '28-32 inches'],
        ['Belts', 'M', '32-36 inches'],
        ['Belts', 'L', '36-40 inches'],
        ['Chains', '16"', 'Choker length'],
        ['Chains', '18"', 'Collar length'],
        ['Chains', '20"', 'Collarbone length'],
        ['Chains', '22"', 'Below collarbone'],
        ['Hats', 'One Size', 'Adjustable strap'],
      ],
    },
  };

  const chart = sizeCharts[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-amber-400" />
              Size Guide
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {chart.headers.map((header) => (
                      <th key={header} className="py-3 px-4 text-left text-amber-400 font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="py-3 px-4 text-white/80">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-white/40 text-xs mt-4">
              * Measurements are approximate. For best fit, compare with a similar item you own.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt?: number | null;
  images: string;
  colors: string;
  sizes: string;
  brand?: string | null;
  condition?: string;
  category?: {
    id: string;
    name: string;
    type: string;
  };
  inStock?: boolean;
  isNew?: boolean;
  isLimited?: boolean;
  limitedQty?: number | null;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    name: string;
    verified: boolean;
    createdAt: string;
  }>;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem, openCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?slug=${slug}`);
        const data = await response.json();
        
        if (data) {
          setProduct(data);
          
          // Fetch related products (same category)
          if (data.category?.id) {
            const relatedRes = await fetch(`/api/products?categoryId=${data.category.id}&limit=8&exclude=${data.id}`);
            const relatedData = await relatedRes.json();
            setRelatedProducts(Array.isArray(relatedData) ? relatedData : []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug]);
  
  const images = product ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images || []) : [];
  const colors = product ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || []) : [];
  const sizes = product ? (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes || []) : [];
  const isLiked = product ? isInWishlist(product.id) : false;
  
  // Calculate average rating
  const avgRating = product?.reviews?.length 
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
    : 0;
  
  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '',
      color: colors[selectedColor] || 'Default',
      size: sizes[selectedSize] || 'One Size',
      quantity,
    });
    
    setAddedToCart(true);
    setIsAddingToCart(false);
    
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 800);
  };
  
  const handleShare = async () => {
    if (!product) return;
    
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Clothing Ctrl!`,
          url: productUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
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
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0] || '',
        brand: product.brand,
      });
    }
  };
  
  const getCategoryType = (): 'clothes' | 'shoes' | 'accessories' => {
    const type = product?.category?.type;
    if (type === 'SHOES') return 'shoes';
    if (type === 'ACCESSORIES') return 'accessories';
    return 'clothes';
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Package className="w-16 h-16 text-white/20 mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
            <p className="text-white/60 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/shop">
              <Button className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/shop" className="hover:text-amber-400 transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.type}`} className="hover:text-amber-400 transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-white truncate max-w-[200px]">{product.name}</span>
        </nav>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[selectedImage] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-amber-400 text-black text-xs font-bold px-3 py-1">NEW</span>
                )}
                {product.isLimited && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1">LIMITED</span>
                )}
                {product.condition === 'THRIFTED' && (
                  <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1">THRIFTED</span>
                )}
              </div>
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "flex-shrink-0 w-20 h-20 border-2 overflow-hidden transition-all",
                      selectedImage === idx ? "border-amber-400" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Brand */}
            {product.brand && (
              <p className="text-amber-400 font-medium tracking-wide text-sm mb-2">
                {product.brand}
              </p>
            )}
            
            {/* Name */}
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">
              {product.name}
            </h1>
            
            {/* Rating */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-none text-white/30"
                      )}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm">
                  {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
              {product.compareAt && (
                <>
                  <span className="text-xl text-white/40 line-through">{formatPrice(product.compareAt)}</span>
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1">
                    {Math.round((1 - product.price / product.compareAt) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            
            {/* Description */}
            <p className="text-white/60 leading-relaxed mb-6">
              {product.description}
            </p>
            
            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-3">
                  Color: <span className="text-amber-400">{colors[selectedColor]}</span>
                </label>
                <div className="flex gap-3">
                  {colors.map((color: string, idx: number) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(idx)}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center",
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
                          "w-3 h-3 rounded-full",
                          isLightColor(color) ? "bg-black" : "bg-white"
                        )} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white text-sm font-medium">
                    Size: <span className="text-amber-400">{sizes[selectedSize]}</span>
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-amber-400 text-sm hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-4 h-4" />
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: string, idx: number) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(idx)}
                      className={cn(
                        "min-w-14 h-12 px-4 border text-sm font-medium transition-all",
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
              <div className="flex items-center border border-white/30 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center text-white font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Add to Cart */}
            <div className="space-y-4 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || addedToCart || !product.inStock}
                className={cn(
                  "w-full font-bold py-6 text-lg transition-all duration-300 flex items-center justify-center gap-2",
                  addedToCart 
                    ? "bg-green-500 text-white" 
                    : !product.inStock
                    ? "bg-zinc-700 text-white/40 cursor-not-allowed"
                    : "bg-amber-400 hover:!bg-amber-300 text-black"
                )}
              >
                {!product.inStock ? (
                  'OUT OF STOCK'
                ) : isAddingToCart ? (
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
                    ADD TO CART — {formatPrice(product.price * quantity)}
                  </>
                )}
              </Button>
              
              {/* Secondary Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleToggleWishlist}
                  className={cn(
                    "flex-1 h-14 flex items-center justify-center gap-2 border transition-all",
                    isLiked 
                      ? "bg-red-500/20 border-red-500 text-red-400" 
                      : "border-white/30 text-white/60 hover:border-amber-400 hover:text-amber-400"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                  <span className="font-medium">{isLiked ? 'Saved' : 'Save'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className={cn(
                    "flex-1 h-14 flex items-center justify-center gap-2 border transition-all",
                    copied 
                      ? "bg-green-500/20 border-green-500 text-green-400" 
                      : "border-white/30 text-white/60 hover:border-amber-400 hover:text-amber-400"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Limited Stock Warning */}
            {product.isLimited && product.limitedQty && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6">
                <p className="text-red-400 font-medium flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Only {product.limitedQty} left — Limited Edition
                </p>
              </div>
            )}
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-white/10 mb-6">
              <div className="text-center">
                <Truck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-white text-xs font-medium">Free Shipping</p>
                <p className="text-white/40 text-xs">Over KSh 5,000</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-white text-xs font-medium">Easy Returns</p>
                <p className="text-white/40 text-xs">7 days return</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-white text-xs font-medium">Secure Payment</p>
                <p className="text-white/40 text-xs">SSL encrypted</p>
              </div>
            </div>
            
            {/* Loyalty Points */}
            {isLoggedIn && (
              <div className="bg-amber-400/10 border border-amber-400/20 p-4">
                <p className="text-amber-400 font-medium flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Earn {Math.floor((product.price * quantity) / 100)} loyalty points with this purchase!
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-zinc-900 border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4",
                            star <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-none text-white/30"
                          )}
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 text-sm mb-3">{review.comment}</p>
                  <p className="text-white/40 text-xs">— {review.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">You Might Also Like</h2>
              <Link href="/shop" className="text-amber-400 hover:underline text-sm">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.slice(0, 4).map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Size Guide Modal */}
      <SizeGuideModal 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)} 
        type={getCategoryType()}
      />
    </div>
  );
}
