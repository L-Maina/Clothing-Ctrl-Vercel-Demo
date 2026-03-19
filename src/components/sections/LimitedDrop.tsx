'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DropData {
  id: string;
  name: string;
  description: string;
  date: string;
  image: string;
}

// Countdown Timer Component
function CountdownTimer({ targetDate, onExpired }: { targetDate: Date; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setExpired(true);
        onExpired();
        return;
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onExpired]);

  if (expired) {
    return (
      <div className="text-red-400 font-bold text-lg">
        Drop has ended
      </div>
    );
  }

  const timeBlocks = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINS', value: timeLeft.minutes },
    { label: 'SECS', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 lg:gap-4">
      {timeBlocks.map((block, index) => (
        <div key={block.label} className="flex flex-col items-center">
          <div className="w-16 lg:w-20 h-16 lg:h-20 bg-zinc-900 border border-white/10 flex items-center justify-center">
            <span className="text-2xl lg:text-3xl font-black text-white">
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] lg:text-xs text-white/40 mt-2 tracking-wider">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LimitedDrop() {
  const [drop, setDrop] = useState<DropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetch('/api/drop')
      .then(res => res.json())
      .then(data => {
        if (data && data.date) {
          // Check if drop has already expired
          const dropDate = new Date(data.date);
          if (dropDate.getTime() <= new Date().getTime()) {
            setIsExpired(true);
          }
        }
        setDrop(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Don't render if loading, no drop, or expired
  if (loading) {
    return (
      <section id="drop" className="py-20 lg:py-32 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="h-96 bg-zinc-900 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!drop || isExpired) return null;

  return (
    <section id="drop" className="py-20 lg:py-32 bg-zinc-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Animated Glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 text-sm font-medium mb-6 border border-red-500/20">
              <Bell className="w-4 h-4" />
              EXCLUSIVE DROP
            </div>

            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight mb-4">
              {drop.name}
            </h2>

            <p className="text-white/60 text-lg leading-relaxed mb-10">
              {drop.description}
            </p>

            {/* Countdown */}
            <div className="mb-10">
              <div className="flex items-center gap-2 text-white/40 text-sm uppercase tracking-wider mb-4">
                <Clock className="w-4 h-4" />
                Drops in
              </div>
              <CountdownTimer 
                targetDate={new Date(drop.date)} 
                onExpired={() => setIsExpired(true)}
              />
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/drops">
                <Button className="bg-white hover:!bg-white/90 text-black font-bold py-4 px-8 rounded-none group transition-colors">
                  VIEW ALL DROPS
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                onClick={() => {
                  document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/30 !bg-transparent text-white hover:!bg-white/10 py-4 px-8 rounded-none transition-colors"
              >
                GET NOTIFIED
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="aspect-square lg:aspect-[4/5] relative overflow-hidden">
              <img
                src={drop.image || 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1000&fit=crop'}
                alt={drop.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-amber-400 text-black text-xs font-bold px-4 py-2 tracking-wider">
                EXCLUSIVE ACCESS
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-2 border-amber-400/30" />
            <div className="absolute -top-4 -right-4 w-32 h-32 border-2 border-amber-400/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
