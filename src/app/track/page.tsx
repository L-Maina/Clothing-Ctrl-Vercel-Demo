'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Package, Truck, ArrowLeft, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function TrackOrderIndexPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast({
        title: 'Enter Order Number',
        description: 'Please enter your order number to track your order.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Check if order exists first
    try {
      const response = await fetch(`/api/track?orderNumber=${orderNumber.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Order Not Found',
          description: data.error || 'Please check your order number and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Redirect to tracking page
      router.push(`/track/${orderNumber.trim().toUpperCase()}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to track order. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Truck className="w-10 h-10 text-amber-400" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
            <p className="text-white/60">
              Enter your order number to see the status of your delivery
            </p>
          </div>

          {/* Track Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <form onSubmit={handleTrack} className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Order Number</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <Input
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                        placeholder="e.g., CC-20240101-1234"
                        className="pl-10 h-12 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 text-lg font-mono"
                      />
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      You can find your order number in your confirmation email or receipt
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading || !orderNumber.trim()}
                    className="w-full h-12 bg-amber-400 text-black hover:bg-amber-300 font-bold text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Track Order
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-zinc-900/50 border-white/5">
              <CardContent className="p-6">
                <h3 className="text-white font-medium mb-4">Can&apos;t find your order?</h3>
                <ul className="space-y-3 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5" />
                    Make sure you entered the correct order number
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5" />
                    Check your email for the order confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5" />
                    Contact support if you&apos;re still having trouble
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 text-white/60 hover:text-white">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <a href="mailto:support@clothingctrl.com" className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 text-white/60 hover:text-white">
                      Contact Support
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
  );
}
