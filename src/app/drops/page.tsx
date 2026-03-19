'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Bell, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Newsletter } from '@/components/sections/Newsletter';

interface Drop {
  id: string;
  name: string;
  description: string;
  date: string;
  image: string;
  active: boolean;
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
  category?: {
    name: string;
    type: string;
  };
}

export default function DropsPage() {
  const [upcomingDrops, setUpcomingDrops] = useState<Drop[]>([]);
  const [limitedProducts, setLimitedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dropRes, productsRes] = await Promise.all([
          fetch('/api/drop'),
          fetch('/api/products'),
        ]);
        
        const dropData = await dropRes.json();
        const productsData = await productsRes.json();
        
        setUpcomingDrops(Array.isArray(dropData) ? dropData : []);
        
        // Filter limited products
        const allProducts = Array.isArray(productsData) ? productsData : [];
        setLimitedProducts(allProducts.filter((p: Product) => p.isLimited));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCountdown = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Dropping now!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

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
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">DROPS</h1>
            </div>
            <p className="text-white/50 mt-2">Limited edition releases and upcoming drops</p>
          </div>

          {/* Upcoming Drops */}
          {upcomingDrops.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Upcoming Drops
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingDrops.map((drop) => (
                  <motion.div
                    key={drop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-zinc-900 border border-white/10 overflow-hidden group"
                  >
                    <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                      <img
                        src={drop.image}
                        alt={drop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      
                      {/* Countdown Badge */}
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 text-sm font-bold flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getCountdown(drop.date)}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{drop.name}</h3>
                      <p className="text-white/60 text-sm mb-4">{drop.description}</p>
                      <p className="text-amber-400 text-sm font-medium">
                        📅 {formatDate(drop.date)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Limited Edition Products */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Limited Edition
            </h2>
            <p className="text-white/50 mb-6">These pieces are in extremely limited quantities. Don't miss out!</p>
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : limitedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {limitedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900 border border-white/10 p-12 text-center">
                <p className="text-white/50">No limited edition items available at the moment.</p>
                <p className="text-white/30 text-sm mt-2">Check back soon for exclusive drops!</p>
              </div>
            )}
          </section>

          {/* Notify Me Section */}
          <section className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/10 p-8 lg:p-12 mb-16">
            <div className="max-w-2xl mx-auto text-center">
              <Bell className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Never Miss a Drop</h2>
              <p className="text-white/60 mb-6">
                Subscribe to get notified about upcoming drops and exclusive early access to limited releases.
              </p>
              <Newsletter />
            </div>
          </section>

          {/* Drop Schedule */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Drop Schedule</h2>
            <div className="bg-zinc-900 border border-white/10 p-6">
              <p className="text-white/70 mb-4">
                We typically drop new collections and limited pieces on:
              </p>
              <ul className="space-y-2 text-white/60">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  <strong className="text-white">Fridays</strong> - New arrivals and weekly drops
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  <strong className="text-white">First Saturday of each month</strong> - Limited edition releases
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  <strong className="text-white">Special occasions</strong> - Holiday drops, collabs, and surprise releases
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
  );
}
