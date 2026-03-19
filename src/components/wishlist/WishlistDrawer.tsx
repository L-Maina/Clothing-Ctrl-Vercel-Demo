'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useWishlistStore, useCartStore, useCurrencyStore } from '@/lib/store';

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      color: 'Default',
      size: 'One Size',
      quantity: 1,
    });
    removeFromWishlist(item.productId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={closeWishlist}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-zinc-950 border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                <span className="text-white font-bold">Wishlist</span>
                <span className="text-white/40 text-sm">({items.length} items)</span>
              </div>
              <button
                onClick={closeWishlist}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/60 mb-4">Your wishlist is empty</p>
                  <p className="text-white/40 text-sm mb-4">
                    Save items you love by clicking the heart icon on products
                  </p>
                  <Button
                    onClick={closeWishlist}
                    className="bg-amber-400 hover:!bg-amber-300 text-black font-bold rounded-none"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 p-3 bg-white/5 border border-white/10"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-zinc-800 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {item.brand && (
                        <p className="text-amber-400/80 text-xs font-medium">{item.brand}</p>
                      )}
                      <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-amber-400 font-bold mt-1">{formatPrice(item.price)}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-1 text-xs bg-amber-400 hover:bg-amber-300 text-black px-3 py-1.5 font-medium transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.productId)}
                          className="flex items-center gap-1 text-xs text-white/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-4">
                <Link href="/shop" onClick={closeWishlist}>
                  <Button
                    className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-3 rounded-none group transition-colors"
                  >
                    CONTINUE SHOPPING
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <p className="text-center text-white/40 text-xs">
                  💡 Items in your wishlist are not reserved
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
