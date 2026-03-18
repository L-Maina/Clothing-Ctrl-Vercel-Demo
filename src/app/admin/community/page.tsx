'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  User,
  Calendar,
} from 'lucide-react';

interface CommunityPhoto {
  id: string;
  imageUrl: string;
  username: string;
  productId: string | null;
  approved: boolean;
  createdAt: Date;
}

export default function AdminCommunity() {
  const [photos, setPhotos] = useState<CommunityPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState<CommunityPhoto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/community');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        // Demo data
        setPhotos([
          {
            id: '1',
            imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
            username: '@fashionista_ke',
            productId: null,
            approved: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2',
            imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
            username: '@styleking_254',
            productId: null,
            approved: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: '3',
            imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400',
            username: '@nairobi_vibes',
            productId: null,
            approved: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: '4',
            imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400',
            username: '@streetwear_ke',
            productId: null,
            approved: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
          {
            id: '5',
            imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400',
            username: '@luxury_life',
            productId: null,
            approved: true,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch = photo.username.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'approved' && photo.approved) ||
      (filter === 'pending' && !photo.approved);
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalPhotos = photos.length;
  const approvedPhotos = photos.filter(p => p.approved).length;
  const pendingPhotos = photos.filter(p => !p.approved).length;

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/community/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });
      setPhotos(photos.map(p => p.id === id ? { ...p, approved: true } : p));
    } catch (error) {
      console.error('Failed to approve photo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      await fetch(`/api/admin/community/${id}`, { method: 'DELETE' });
      setPhotos(photos.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  return (
    <AdminLayout title="Community Photos">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Photos</p>
                <p className="text-xl font-bold text-white">{totalPhotos}</p>
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
                <p className="text-xl font-bold text-white">{approvedPhotos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Pending Review</p>
                <p className="text-xl font-bold text-white">{pendingPhotos}</p>
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
                placeholder="Search by username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-md text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="all">All Photos</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      {loading ? (
        <div className="p-8 text-center text-white/40">Loading photos...</div>
      ) : filteredPhotos.length === 0 ? (
        <div className="p-8 text-center text-white/40">No photos found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="bg-zinc-900 border-white/10 overflow-hidden group">
              <div className="relative aspect-square">
                <img
                  src={photo.imageUrl}
                  alt={`Photo by ${photo.username}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!photo.approved && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:bg-green-500/20"
                      onClick={() => handleApprove(photo.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  {photo.approved ? (
                    <Badge className="bg-green-500/80 text-white text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/80 text-black text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/40" />
                  <p className="text-white text-sm truncate">{photo.username}</p>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(photo.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
            <DialogDescription className="text-white/40">
              Review community photo
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={`Photo by ${selectedPhoto.username}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-white/40" />
                  <span className="text-white font-medium">{selectedPhoto.username}</span>
                </div>
                {selectedPhoto.approved ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    <XCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>

              <div className="text-sm text-white/40">
                <p>Uploaded: {new Date(selectedPhoto.createdAt).toLocaleDateString()}</p>
                {selectedPhoto.productId && (
                  <p>Linked Product: {selectedPhoto.productId}</p>
                )}
              </div>

              <div className="flex gap-2">
                {!selectedPhoto.approved && (
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      handleApprove(selectedPhoto.id);
                      setSelectedPhoto({ ...selectedPhoto, approved: true });
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    handleDelete(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
