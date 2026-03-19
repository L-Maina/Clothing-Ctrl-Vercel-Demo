'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, MapPin, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useSettingsStore, useRealtime } from '@/hooks/useRealtime';

// Fashion icons for floating elements
const fashionIcons = ['🧥', '👟', '⛓️', '🧢', '💍', '🕶️', '👜', '⌚', '👗', '👕', '👖', '👠', '🧣', '手套', '🎽', '🩳', '👛', '🎀'];

// Generate random floating fashion items spread across the entire page
// Y starts from 15% to avoid the fixed navbar at the top
function generateFloatingItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    icon: fashionIcons[i % fashionIcons.length],
    size: Math.random() > 0.6 ? 'text-3xl' : Math.random() > 0.3 ? 'text-4xl' : 'text-2xl',
    x: Math.random() * 100, // Random x position (0-100%)
    y: 15 + Math.random() * 75, // Random y position (15-90%) - avoids navbar
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 8,
    opacity: 0.15 + Math.random() * 0.35,
  }));
}

// Floating fashion item that twinkles and floats like a star
function FloatingFashionItem({ item }: { item: ReturnType<typeof generateFloatingItems>[0] }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, item.opacity, item.opacity * 1.5, item.opacity, 0],
        scale: [0.5, 1, 1.2, 1, 0.5],
        rotate: [0, 10, -10, 5, 0],
        y: [0, -20, 10, -15, 0],
        x: [0, 10, -5, 8, 0],
      }}
      transition={{
        duration: item.duration,
        repeat: Infinity,
        delay: item.delay,
        ease: "easeInOut",
      }}
    >
      <span className={item.size} style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.4))' }}>
        {item.icon}
      </span>
    </motion.div>
  );
}

// Animated letter component
function AnimatedLetter({ letter, index }: { letter: string; index: number }) {
  return (
    <motion.span
      className="inline-block"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {letter}
    </motion.span>
  );
}

// Floating item component - more visible
function FloatingItem({ item }: { item: typeof fashionItems[0] }) {
  return (
    <motion.div
      className={`absolute ${item.x} ${item.y} ${item.size} select-none pointer-events-none z-[1]`}
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.15, 1],
        y: [0, -25, 0],
        rotate: [0, 8, -8, 0],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        repeat: Infinity,
        delay: item.delay,
        ease: "easeInOut",
      }}
    >
      <span className="drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
        {item.icon}
      </span>
    </motion.div>
  );
}

// Animated border box
function AnimatedBorder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '200% 0%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div className="relative m-[2px] bg-black rounded-md">
        {children}
      </div>
    </div>
  );
}

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Track client-side mount state
  const [mounted, setMounted] = useState(false);
  
  // Initialize real-time sync for settings
  useRealtime();
  
  // Get settings from store
  const settings = useSettingsStore((state) => state.settings);
  
  // Format hours
  const formatHours = () => {
    if (settings.openHour && settings.closeHour) {
      const openHour = parseInt(settings.openHour.split(':')[0]);
      const closeHour = parseInt(settings.closeHour.split(':')[0]);
      const ampm = (h: number) => h >= 12 ? 'pm' : 'am';
      const formatHour = (h: number) => h > 12 ? h - 12 : h;
      return `${formatHour(openHour)}${ampm(openHour)} - ${formatHour(closeHour)}${ampm(closeHour)}`;
    }
    return '12pm - 6pm';
  };
  
  // Format location
  const formatLocation = () => {
    const parts = [];
    if (settings.city) parts.push(settings.city);
    if (settings.addressLine1) parts.push(settings.addressLine1);
    if (settings.addressLine2) parts.push(settings.addressLine2);
    return parts.length > 0 ? parts.join(' • ') : 'Nairobi CBD • Cargen House, Harambee Ave • Rm 310';
  };
  
  // Generate floating items only once on client side to avoid hydration mismatch
  const floatingItems = useMemo(() => generateFloatingItems(25), []);
  
  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    const raf = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const clothingText = "CLOTHING".split('');

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Gradient Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        animate={{
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
            'radial-gradient(ellipse at 50% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
            'radial-gradient(ellipse at 20% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Floating Fashion Items - Spread across entire page like stars */}
      {mounted && floatingItems.map((item) => (
        <FloatingFashionItem key={item.id} item={item} />
      ))}

      {/* Animated Lines */}
      <motion.div
        className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
        animate={{
          scaleX: [0, 1, 0],
          x: ['-100%', '0%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
        animate={{
          scaleX: [0, 1, 0],
          x: ['100%', '0%', '-100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Main Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 lg:px-8 text-center"
        style={{ y, opacity }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Store Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-white/50 text-sm mb-8"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{formatLocation()}</span>
          </motion.div>

          {/* Main Logo */}
          <div className="relative mb-8">
            <div className="inline-block">
              {/* CLOTHING Text with Animation */}
              <motion.h1 
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight"
              >
                <span className="block text-white relative overflow-hidden">
                  {mounted && clothingText.map((letter, i) => (
                    <AnimatedLetter key={i} letter={letter} index={i} />
                  ))}
                  {/* Animated underline */}
                  <motion.div 
                    className="absolute -bottom-2 left-0 right-0 h-1 overflow-hidden"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  </motion.div>
                </span>
                
                {/* CTRL Text with Gradient */}
                <motion.span 
                  className="block text-transparent bg-clip-text mt-2 relative"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
                    backgroundSize: '200% 100%',
                  }}
                >
                  <motion.span
                    animate={{
                      backgroundPosition: ['0% 0%', '200% 0%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="inline-block"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24, #f59e0b)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    CTRL
                  </motion.span>
                  
                  {/* Glowing effect */}
                  <motion.span
                    className="absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    CTRL
                  </motion.span>
                </motion.span>
              </motion.h1>

              {/* Decorative elements */}
              <motion.div 
                className="flex items-center justify-center gap-4 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.div 
                  className="h-px w-16 bg-gradient-to-r from-transparent to-white/30"
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 0.6, delay: 1 }}
                />
                <AnimatedBorder>
                  <span className="px-4 py-1 text-amber-400 text-xs tracking-[0.4em] font-medium block">
                    EST. 2020 • NAIROBI
                  </span>
                </AnimatedBorder>
                <motion.div 
                  className="h-px w-16 bg-gradient-to-l from-transparent to-white/30"
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 0.6, delay: 1 }}
                />
              </motion.div>
            </div>
          </div>

          {/* Tagline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-white/60 text-lg lg:text-xl max-w-2xl mx-auto mb-4"
          >
            Your One-Stop Fashion Destination
          </motion.p>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-white/40 text-base lg:text-lg max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            From luxury designer pieces to streetwear essentials, thrifted gems to custom creations.
            We bring you the best of global fashion — all in one place.
          </motion.p>

          {/* Animated Brand Pills */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {['Gucci', 'Prada', 'Balenciaga', 'Bape', 'Diesel', 'Chrome Hearts', 'Carhartt', 'Thrifted', 'Custom'].map((brand, i) => (
              <Link 
                key={brand} 
                href={`/shop?brand=${encodeURIComponent(brand)}`}
              >
                <motion.span 
                  className="px-3 py-1.5 border border-white/10 rounded-full text-white/50 text-xs lg:text-sm hover:border-amber-400/50 hover:text-amber-400 hover:bg-amber-400/5 transition-all cursor-pointer inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {brand}
                </motion.span>
              </Link>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:!bg-white/90 font-bold px-8 py-6 text-lg rounded-none group transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20"
            >
              <Link href="#shop">
                SHOP NOW
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border-2 border-amber-400 !bg-transparent text-amber-400 hover:!bg-amber-400 hover:!text-black font-bold px-8 py-6 text-lg rounded-none transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-400/20"
            >
              <Link href="/new-arrivals">
                NEW ARRIVALS
              </Link>
            </Button>
          </motion.div>

          {/* Store Info */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 lg:gap-10 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="flex items-center gap-2 text-white/50">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-4 h-4 text-amber-400" />
              </motion.div>
              <span>{settings.openDays || 'Mon - Sat'}: {formatHours()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Truck className="w-4 h-4 text-amber-400" />
              </motion.div>
              <span>Worldwide Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-white/50">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MapPin className="w-4 h-4 text-amber-400" />
              </motion.div>
              <span>{settings.city || 'Nairobi'}, {settings.country || 'Kenya'}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Corner Decorations */}
      <motion.div
        className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-amber-400/30"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-amber-400/30"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-amber-400/30"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-amber-400/30"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-3 bg-amber-400 rounded-full mt-2"
            animate={{ opacity: [1, 0], y: [0, 10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
