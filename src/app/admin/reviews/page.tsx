'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  Clock,
  CheckSquare,
  XSquare,
  User,
  ExternalLink,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  username: string;
  verified: boolean;
  approved: boolean;
  productId: string | null;
  orderId: string;
  customer: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewDetails extends Review {
  order?: {
    orderNumber: string;
    items: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      price: number;
    }>;
  } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<ReviewDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pendingCount: 0, approvedCount: 0 });
  const { toast } = useToast();

  const fetchReviews = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setIsRefreshing(true);
      
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
      setStats({
        total: data.total || 0,
        pendingCount: data.pendingCount || 0,
        approvedCount: data.approvedCount || 0,
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Demo data fallback
      setReviews([
        {
          id: '1',
          rating: 5,
          comment: 'Amazing quality! The jacket fits perfectly and looks even better in person.',
          imageUrl: null,
          username: 'styleking',
          verified: true,
          approved: true,
          productId: null,
          orderId: 'order-1',
          customer: { id: 'c1', name: 'John Doe', email: 'john@example.com' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          rating: 4,
          comment: 'Great product, shipping was fast. Would recommend!',
          imageUrl: 'https://example.com/photo.jpg',
          username: 'fashionista',
          verified: true,
          approved: false,
          productId: null,
          orderId: 'order-2',
          customer: { id: 'c2', name: 'Jane Smith', email: 'jane@example.com' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '3',
          rating: 5,
          comment: 'Love the unique design. Got so many compliments!',
          imageUrl: null,
          username: 'trendsetter',
          verified: true,
          approved: false,
          productId: null,
          orderId: 'order-3',
          customer: { id: 'c3', name: 'Mike Johnson', email: 'mike@example.com' },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setStats({ total: 3, pendingCount: 2, approvedCount: 1 });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const fetchReviewDetails = async (reviewId: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`/api/community/reviews/${reviewId}`);
      const data = await response.json();
      setSelectedReview(data.review);
    } catch (error) {
      console.error('Failed to fetch review details:', error);
      // Find the review from the list as fallback
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        setSelectedReview(review as ReviewDetails);
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/community/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      setReviews(reviews.map(r => 
        r.id === reviewId ? { ...r, approved } : r
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingCount: approved ? prev.pendingCount - 1 : prev.pendingCount + 1,
        approvedCount: approved ? prev.approvedCount + 1 : prev.approvedCount - 1,
      }));

      toast({
        title: approved ? 'Review Approved' : 'Review Rejected',
        description: `The review has been ${approved ? 'approved' : 'rejected'}.`,
      });
    } catch (error) {
      console.error('Failed to update review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review status',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/community/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(r => r.id !== reviewId));
      setSelectedReview(null);
      
      toast({
        title: 'Review Deleted',
        description: 'The review has been permanently deleted.',
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
        }`}
      />
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      review.username.toLowerCase().includes(search.toLowerCase()) ||
      review.comment.toLowerCase().includes(search.toLowerCase()) ||
      review.customer.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && !review.approved) ||
      (statusFilter === 'approved' && review.approved);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Reviews">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Reviews</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Pending</p>
                <p className="text-xl font-bold text-white">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Approved</p>
                <p className="text-xl font-bold text-white">{stats.approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Avg Rating</p>
                <p className="text-xl font-bold text-white">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => fetchReviews(true)}
              disabled={isRefreshing}
              className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-8 text-center text-white/40">No reviews found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Reviewer</TableHead>
                    <TableHead className="text-white/60">Rating</TableHead>
                    <TableHead className="text-white/60">Comment</TableHead>
                    <TableHead className="text-white/60">Photo</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Date</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-zinc-700 text-white text-xs">
                              {review.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white text-sm">@{review.username}</p>
                            <p className="text-white/40 text-xs">{review.customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-white/70 text-sm truncate">
                          {review.comment}
                        </p>
                      </TableCell>
                      <TableCell>
                        {review.imageUrl ? (
                          <div className="w-10 h-10 bg-zinc-800 rounded overflow-hidden">
                            <img 
                              src={review.imageUrl} 
                              alt="Review" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/20 text-xs">X</div>';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-white/30 text-sm">No photo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          review.approved 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        )}>
                          {review.approved ? 'Approved' : 'Pending'}
                        </Badge>
                        {review.verified && (
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 text-xs">Verified</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/5">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-white/10">
                            <DropdownMenuItem 
                              className="text-white/60 hover:text-white focus:text-white"
                              onClick={() => fetchReviewDetails(review.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {!review.approved ? (
                              <DropdownMenuItem 
                                className="text-green-400 focus:text-green-400"
                                onClick={() => updateReviewStatus(review.id, true)}
                              >
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-yellow-400 focus:text-yellow-400"
                                onClick={() => updateReviewStatus(review.id, false)}
                              >
                                <XSquare className="w-4 h-4 mr-2" />
                                Unapprove
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem 
                              className="text-red-400 focus:text-red-400"
                              onClick={() => deleteReview(review.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-white/40 text-sm">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </p>
      </div>

      {/* Review Details Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription className="text-white/40">
              Review by @{selectedReview?.username}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="py-8 text-center text-white/40">Loading...</div>
          ) : selectedReview && (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 -mr-2">
              {/* Reviewer Info */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-zinc-700 text-white">
                      {selectedReview.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">@{selectedReview.username}</p>
                    <p className="text-white/40 text-sm truncate max-w-[200px]">{selectedReview.customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn(
                  selectedReview.approved 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                )}>
                  {selectedReview.approved ? 'Approved' : 'Pending'}
                </Badge>
                {selectedReview.verified && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>

              {/* Photo */}
              {selectedReview.imageUrl ? (
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden bg-zinc-800">
                    <img 
                      src={selectedReview.imageUrl} 
                      alt="Review photo" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-48 flex items-center justify-center text-white/40 text-sm p-4 text-center"><span>Image failed to load. Click link below to view.</span></div>';
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3 text-white/40 flex-shrink-0" />
                    <a 
                      href={selectedReview.imageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-400 text-xs hover:underline break-all"
                    >
                      View Original Image
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-white/40 text-sm">No photo attached</p>
                </div>
              )}

              {/* Comment */}
              <div>
                <p className="text-white/40 text-sm mb-1">Comment</p>
                <p className="text-white break-words">{selectedReview.comment}</p>
              </div>

              {/* Order Info */}
              {selectedReview.order && (
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <p className="text-white/40 text-sm">Order</p>
                    <a 
                      href={`/admin/orders`}
                      className="text-amber-400 text-sm flex items-center gap-1 hover:underline"
                    >
                      {selectedReview.order.orderNumber}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="space-y-2">
                    {selectedReview.order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">{item.productName}</p>
                          <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Created</p>
                  <p className="text-white">
                    {new Date(selectedReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/40">Last Updated</p>
                  <p className="text-white">
                    {new Date(selectedReview.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions - Fixed at bottom */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/10 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => selectedReview && deleteReview(selectedReview.id)}
              className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            {selectedReview?.approved ? (
              <Button
                onClick={() => {
                  updateReviewStatus(selectedReview.id, false);
                  setSelectedReview(null);
                }}
                className="flex-1 bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Unapprove
              </Button>
            ) : (
              selectedReview && (
                <Button
                  onClick={() => {
                    updateReviewStatus(selectedReview.id, true);
                    setSelectedReview(null);
                  }}
                  className="flex-1 bg-green-500 text-black hover:bg-green-400"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
