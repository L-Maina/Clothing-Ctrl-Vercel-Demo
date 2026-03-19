'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Instagram, Camera, Heart, MessageCircle, Share2,
  Star, CheckCircle, X, Upload, ChevronDown, Sparkles, User, Award, Loader2, RefreshCw, ImagePlus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Newsletter } from '@/components/sections/Newsletter';
import { useAuthStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CommunityPhoto {
  id: string;
  imageUrl: string;
  username: string;
  productId: string;
  approved: boolean;
  createdAt: string;
}

interface CommunityReview {
  id: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  username: string;
  instagramHandle: string | null;
  verified: boolean;
  productId: string | null;
  customerName: string | null;
  createdAt: string;
}

interface DeliveredOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string | null;
    quantity: number;
    color: string;
    size: string;
    price: number;
  }>;
}

export default function CommunityPage() {
  const [photos, setPhotos] = useState<CommunityPhoto[]>([]);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'reviews'>('gallery');
  
  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DeliveredOrder | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DeliveredOrder['items'][0] | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [username, setUsername] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  
  const { isLoggedIn, user, openLoginModal } = useAuthStore();
  const { toast } = useToast();

  // Fetch photos and reviews
  const fetchData = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Fetch photos
      const photosRes = await fetch('/api/community');
      const photosData = await photosRes.json();
      setPhotos(Array.isArray(photosData) ? photosData : []);
      
      // Fetch reviews
      const reviewsRes = await fetch('/api/community/reviews');
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch delivered orders when opening review modal
  const fetchDeliveredOrders = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      const res = await fetch('/api/community/reviews/can-review', {
        headers: { 'x-customer-email': user.email },
      });
      const data = await res.json();
      
      if (data.canReview) {
        setDeliveredOrders(data.orders);
      } else {
        setDeliveredOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch delivered orders:', error);
      setDeliveredOrders([]);
    }
  }, [user?.email]);

  const handleOpenReviewModal = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    
    // Pre-fill username from user data
    if (user?.name) {
      setUsername(user.name);
    }
    
    setIsReviewModalOpen(true);
    fetchDeliveredOrders();
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !selectedProduct || !rating || !comment || !username) {
      toast({
        title: 'Missing fields',
        description: 'Please select a product and fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/community/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-customer-email': user.email,
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          productId: selectedProduct.productId,
          rating,
          comment,
          imageUrl: imageUrl || null,
          username,
          instagramHandle: instagramHandle || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      toast({
        title: 'Review submitted!',
        description: data.message || 'Your review will be visible after approval.',
      });

      // Reset form and close modal
      setIsReviewModalOpen(false);
      setSelectedOrder(null);
      setSelectedProduct(null);
      setRating(5);
      setComment('');
      setImageUrl('');
      setUsername('');
      setInstagramHandle('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < value 
            ? 'text-amber-400 fill-amber-400' 
            : 'text-zinc-600'
        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Only JPEG, PNG, WebP, and GIF images are allowed.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'reviews');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.url);
      toast({
        title: 'Photo uploaded!',
        description: 'Your photo has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <>
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="w-8 h-8 text-amber-400" />
                  <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">COMMUNITY</h1>
                </div>
                <p className="text-white/50 mt-2">Style inspiration from our amazing customers</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleOpenReviewModal}
                  className="bg-amber-400 text-black hover:bg-amber-300 font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Share Your Style
                </Button>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/10 p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Join the Movement</h2>
                <p className="text-white/60">Follow us on social media and tag #ClothingCtrl to get featured</p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/clothing.ctrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@clothing.ctrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-black border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Community Members', value: '5,000+' },
              { label: 'Style Photos', value: '1,200+' },
              { label: 'Countries', value: '12' },
              { label: 'Five-Star Reviews', value: '500+' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-zinc-900 border border-white/10 p-6 text-center">
                <p className="text-3xl font-black text-amber-400">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'gallery' 
                  ? 'text-amber-400 border-b-2 border-amber-400' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Style Gallery
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'reviews' 
                  ? 'text-amber-400 border-b-2 border-amber-400' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'gallery' ? (
              <motion.section
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-16"
              >
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-zinc-900 animate-pulse" />
                    ))}
                  </div>
                ) : photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, idx) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative aspect-square bg-zinc-900 overflow-hidden group cursor-pointer"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={`Style by ${photo.username}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                          <div>
                            <p className="text-white font-medium">@{photo.username}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-white" />
                            <Share2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-white/10 p-12 text-center">
                    <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No community photos yet.</p>
                    <p className="text-white/30 text-sm mt-2">Be the first to share your style!</p>
                  </div>
                )}
              </motion.section>
            ) : (
              <motion.section
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-16"
              >
                {isLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-zinc-900 border border-white/10 p-6 animate-pulse">
                        <div className="h-4 bg-zinc-800 rounded w-1/3 mb-4" />
                        <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
                        <div className="h-4 bg-zinc-800 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-900 border border-white/10 p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white/40" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-white font-medium">@{review.username}</p>
                                {'instagramHandle' in review && review.instagramHandle && (
                                  <a 
                                    href={`https://instagram.com/${review.instagramHandle.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
                                  >
                                    <Instagram className="w-3 h-3" />
                                    {review.instagramHandle}
                                  </a>
                                )}
                                {review.verified && (
                                  <span className="flex items-center gap-1 text-xs text-green-400">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {review.imageUrl && (
                          <div className="mb-4 rounded-lg overflow-hidden">
                            <img
                              src={review.imageUrl}
                              alt="Review photo"
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <p className="text-white/70">{review.comment}</p>
                        
                        <p className="text-white/30 text-sm mt-4">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-white/10 p-12 text-center">
                    <Award className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No reviews yet.</p>
                    <p className="text-white/30 text-sm mt-2">Be the first to share your experience!</p>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* How to Get Featured */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">How to Get Featured</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Wear Your Gear',
                  description: 'Style your favorite Clothing Ctrl pieces in your unique way',
                },
                {
                  step: '2',
                  title: 'Snap a Photo',
                  description: 'Take a fire photo showing off your outfit',
                },
                {
                  step: '3',
                  title: 'Share Your Style',
                  description: 'Click "Share Your Style" button above and submit your review',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-900 border border-white/10 p-6">
                  <div className="w-10 h-10 bg-amber-400 text-black font-bold rounded-full flex items-center justify-center mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section className="bg-zinc-900 border border-white/10 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Join the Community</h2>
              <p className="text-white/60 mb-6">
                Subscribe to get style tips, exclusive drops, and community highlights delivered to your inbox.
              </p>
              <Newsletter />
            </div>
          </section>
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Style</DialogTitle>
            <DialogDescription className="text-white/50">
              Share your experience with your delivered order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-8">
                <PackageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No delivered orders available for review.</p>
                <p className="text-white/30 text-sm mt-2">
                  Complete an order to share your style!
                </p>
              </div>
            ) : (
              <>
                {/* Select Order */}
                <div className="space-y-2">
                  <Label className="text-white/60">Select Order *</Label>
                  <Select
                    value={selectedOrder?.id || ''}
                    onValueChange={(value) => {
                      const order = deliveredOrders.find(o => o.id === value) || null;
                      setSelectedOrder(order);
                      // Auto-select first product
                      if (order && order.items.length > 0) {
                        setSelectedProduct(order.items[0]);
                      } else {
                        setSelectedProduct(null);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                      <SelectValue placeholder="Choose an order to review" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-white/10">
                      {deliveredOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id} className="text-white">
                          {order.orderNumber} - {order.items.length} item(s)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Product from Order */}
                {selectedOrder && selectedOrder.items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white/60">Select Product to Review *</Label>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedProduct(item)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            selectedProduct?.productId === item.productId
                              ? 'border-amber-400 bg-amber-400/10'
                              : 'border-white/10 bg-zinc-800/50 hover:border-white/30'
                          }`}
                        >
                          {item.productImage ? (
                            <img 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-zinc-700 rounded flex items-center justify-center">
                              <Camera className="w-5 h-5 text-white/30" />
                            </div>
                          )}
                          <div className="text-left flex-1">
                            <p className="text-white text-sm font-medium">{item.productName}</p>
                            <p className="text-white/40 text-xs">{item.color} • {item.size} • Qty: {item.quantity}</p>
                          </div>
                          {selectedProduct?.productId === item.productId && (
                            <CheckCircle className="w-5 h-5 text-amber-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-white/60">Display Name *</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Instagram Integration Section */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-500/20 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Tag Us on Instagram!</h4>
                      <p className="text-white/50 text-xs">Get featured on our page</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://instagram.com/clothing.ctrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-4 h-4" />
                      @clothing.ctrl
                    </a>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-white/10 text-white text-sm font-medium rounded-lg">
                      #ClothingCtrlStyle
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      Your Instagram Handle
                    </Label>
                    <Input
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@your_instagram"
                      className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40"
                    />
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <span>📸 Post on Instagram, tag us and use the hashtag, then add your handle above!</span>
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label className="text-white/60">Rating *</Label>
                  <div className="flex items-center gap-1">
                    {renderStars(rating, true)}
                    <span className="ml-2 text-white/60">{rating}/5</span>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label className="text-white/60">Photo (optional)</Label>

                  {/* Drag & Drop Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                      dragActive
                        ? 'border-amber-400 bg-amber-400/10'
                        : imageUrl
                          ? 'border-green-500/50 bg-green-500/5'
                          : 'border-white/20 bg-zinc-800/50 hover:border-white/40'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="photo-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileInput}
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                        <p className="text-white/60 text-sm">Uploading...</p>
                      </div>
                    ) : imageUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <p className="text-green-400 text-xs text-center flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Photo uploaded successfully
                        </p>
                      </div>
                    ) : (
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center cursor-pointer py-4"
                      >
                        <ImagePlus className="w-10 h-10 text-white/40 mb-3" />
                        <p className="text-white font-medium mb-1">
                          Drag & drop a photo here
                        </p>
                        <p className="text-white/40 text-sm mb-2">
                          or click to browse
                        </p>
                        <p className="text-white/30 text-xs">
                          JPEG, PNG, WebP, GIF up to 5MB
                        </p>
                      </label>
                    )}
                  </div>

                  {/* Alternative: URL Input */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-zinc-900 px-2 text-white/40">or paste image URL</span>
                    </div>
                  </div>

                  <Input
                    value={imageUrl && !imageUrl.startsWith('/uploads/') ? imageUrl : ''}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40"
                  />

                  <div className="text-white/40 text-xs">
                    <p>💡 Tip: Take a screenshot of your Instagram photo and upload it directly above!</p>
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label className="text-white/60">Your Review *</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !selectedOrder || !selectedProduct || !username || !comment}
                  className="w-full bg-amber-400 text-black hover:bg-amber-300 font-bold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Package icon component
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
