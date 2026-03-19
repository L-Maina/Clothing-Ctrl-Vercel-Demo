'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Download,
  Search,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  compareAt: number | null;
  category: {
    name: string;
    type: string;
  } | null;
  condition: string;
  inStock: boolean;
  isNew: boolean;
  isLimited: boolean;
  limitedQty: number | null;
  images: string;
  createdAt: Date;
}

// Product image with hover effect for admin - shows back image on hover
function ProductImage({ images, name }: { images: string[]; name: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const hasMultipleImages = images.length > 1;
  
  return (
    <div 
      className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Front Image */}
      <motion.img
        src={images[0] || '/placeholder.jpg'}
        alt={name}
        className="w-full h-full object-cover"
        animate={{ opacity: isHovered && hasMultipleImages ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Back Image - shows on hover */}
      {hasMultipleImages && (
        <motion.img
          src={images[1] || images[0]}
          alt={`${name} back`}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Hover indicator */}
      <AnimatePresence>
        {isHovered && hasMultipleImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 right-0 bg-black/50 p-0.5 rounded-tl"
          >
            <RotateCw className="w-3 h-3 text-white/80" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminProducts() {
  const router = useRouter();
  const { openQuickView } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">New</Badge>;
      case 'THRIFTED':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Thrifting</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.brand?.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || product.category?.type === categoryFilter;
    const matchesCondition = conditionFilter === 'all' || product.condition === conditionFilter;
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'instock' && product.inStock) ||
      (stockFilter === 'outofstock' && !product.inStock) ||
      (stockFilter === 'low' && product.limitedQty !== null && product.limitedQty < 5);
    return matchesSearch && matchesCategory && matchesCondition && matchesStock;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <AdminLayout title="Products">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-white/40">Manage your store inventory</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/admin/products/new">
            <Button className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="CLOTHES">Clothes</SelectItem>
                <SelectItem value="SHOES">Shoes</SelectItem>
                <SelectItem value="ACCESSORIES">Accessories</SelectItem>
              </SelectContent>
            </Select>
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="THRIFTED">Thrifting</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-40 bg-zinc-800 border-white/10 text-white">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-white/10">
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="outofstock">Out of Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-white/40">No products found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Product</TableHead>
                    <TableHead className="text-white/60">Category</TableHead>
                    <TableHead className="text-white/60">Price</TableHead>
                    <TableHead className="text-white/60">Condition</TableHead>
                    <TableHead className="text-white/60">Stock</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                    return (
                      <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProductImage images={images} name={product.name} />
                            <div>
                              <p className="text-white font-medium line-clamp-1">{product.name}</p>
                              {product.brand && (
                                <p className="text-amber-400 text-xs">{product.brand}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/60">
                          {product.category?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{formatPrice(product.price)}</p>
                            {product.compareAt && (
                              <p className="text-white/40 text-xs line-through">
                                {formatPrice(product.compareAt)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getConditionBadge(product.condition)}</TableCell>
                        <TableCell className="text-white">
                          {product.limitedQty !== null ? (
                            <span className={product.limitedQty < 5 ? 'text-red-400' : ''}>
                              {product.limitedQty} left
                            </span>
                          ) : product.inStock ? (
                            <span className="text-green-400">In Stock</span>
                          ) : (
                            <span className="text-red-400">Out of Stock</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.isNew && (
                              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                                New
                              </Badge>
                            )}
                            {product.isLimited && (
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                                Limited
                              </Badge>
                            )}
                          </div>
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
                                className="text-white/60 hover:text-white focus:text-white cursor-pointer"
                                onClick={() => openQuickView(product.id)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Quick View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-white/60 hover:text-white focus:text-white cursor-pointer"
                                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-white/60 hover:text-white focus:text-white cursor-pointer"
                                onClick={() => window.open(`/shop?quickview=${product.id}`, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on Store
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-400 focus:text-red-400 cursor-pointer"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-white/40 text-sm">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:text-white hover:bg-white/5">
            Next
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
