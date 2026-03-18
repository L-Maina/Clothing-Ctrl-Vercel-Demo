'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore, useCurrencyStore } from '@/lib/store';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const { formatPrice, currency } = useCurrencyStore();
  const subtotal = getSubtotal();

  // Fetch shipping settings from API
  const [shippingSettings, setShippingSettings] = useState<{
    shippingNairobi: number;
    shippingKenya: number;
    shippingInternational: number;
    shippingFreeThreshold: number | null;
  }>({
    shippingNairobi: 200,
    shippingKenya: 500,
    shippingInternational: 2000,
    shippingFreeThreshold: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setShippingSettings({
            shippingNairobi: data.settings.shippingNairobi ?? 200,
            shippingKenya: data.settings.shippingKenya ?? 500,
            shippingInternational: data.settings.shippingInternational ?? 2000,
            shippingFreeThreshold: data.settings.shippingFreeThreshold ?? null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Free shipping threshold from admin settings (null means no free shipping)
  const freeShippingThreshold = shippingSettings.shippingFreeThreshold;
  const shippingCost = shippingSettings.shippingKenya; // Default to Kenya shipping
  const shipping = (freeShippingThreshold !== null && subtotal >= freeShippingThreshold) ? 0 : shippingCost;
  const total = subtotal + shipping;

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
            onClick={closeCart}
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
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span className="text-white font-bold">Your Cart</span>
                <span className="text-white/40 text-sm">({items.length} items)</span>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/60 mb-4">Your cart is empty</p>
                  <Button
                    onClick={closeCart}
                    className="border border-white/30 !bg-transparent text-white hover:!bg-white hover:!text-black rounded-none transition-colors"
                  >
                    Continue Shopping
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
                      <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-white/40 text-xs mt-1">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-amber-400 font-bold mt-1">{formatPrice(item.price)}</p>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-white/30 text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="self-start text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-4">
                {/* Shipping Notice */}
                <div className="bg-amber-400/10 border border-amber-400/20 p-3 flex items-start gap-3">
                  <Truck className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-400 text-xs">
                    🌍 We ship worldwide from Nairobi, Kenya
                  </p>
                </div>

                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && freeShippingThreshold !== null && (
                    <p className="text-xs text-amber-400">
                      Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping
                    </p>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-amber-400">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-white/40 text-right">
                    Prices shown in {currency}
                  </p>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-4 rounded-none transition-colors">
                    PROCEED TO CHECKOUT
                  </Button>
                </Link>

                <Button
                  onClick={closeCart}
                  className="w-full border border-white/30 !bg-transparent text-white hover:!bg-white hover:!text-black rounded-none transition-colors"
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
