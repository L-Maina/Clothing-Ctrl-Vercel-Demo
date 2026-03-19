'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Image as ImageIcon,
  Loader2,
  Upload,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAt: '',
    brand: '',
    categoryId: '',
    condition: 'NEW',
    inStock: true,
    isNew: false,
    isLimited: false,
    limitedQty: '',
    tags: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<string[]>(['']);
  const [sizes, setSizes] = useState<string[]>(['']);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${productId}`);
        const data = await response.json();
        
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            compareAt: data.compareAt?.toString() || '',
            brand: data.brand || '',
            categoryId: data.categoryId || '',
            condition: data.condition || 'NEW',
            inStock: data.inStock ?? true,
            isNew: data.isNew ?? false,
            isLimited: data.isLimited ?? false,
            limitedQty: data.limitedQty?.toString() || '',
            tags: data.tags ? JSON.parse(data.tags).join(', ') : '',
          });
          
          // Parse images
          const parsedImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images || [];
          setImages(parsedImages);
          
          // Parse colors
          const parsedColors = typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors || [];
          setColors(parsedColors.length > 0 ? parsedColors : ['']);
          
          // Parse sizes
          const parsedSizes = typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes || [];
          setSizes(parsedSizes.length > 0 ? parsedSizes : ['']);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data.categories || data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAt: formData.compareAt ? parseFloat(formData.compareAt) : null,
          limitedQty: formData.isLimited ? parseInt(formData.limitedQty) : null,
          images: JSON.stringify(images),
          colors: JSON.stringify(colors.filter(c => c)),
          sizes: JSON.stringify(sizes.filter(s => s)),
          tags: formData.tags ? JSON.stringify(formData.tags.split(',').map(t => t.trim())) : null,
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.url) {
        setImages([...images, data.url]);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleImageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage();
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addColor = () => setColors([...colors, '']);
  const updateColor = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };
  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const addSize = () => setSizes([...sizes, '']);
  const updateSize = (index: number, value: string) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };
  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  if (fetching) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-white/60">Loading product...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Product">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="text-white/60 hover:text-white mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/60">Product Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Vintage Gucci Jacket"
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/60">Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product..."
                      rows={4}
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/60">Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., Gucci, Balenciaga, Bape"
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>
                
                {/* Image Grid - Show at top */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-amber-400 text-black text-xs font-bold px-2 py-1 rounded">Main</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div className="space-y-4">
                  {/* File Upload - Styled Button */}
                  <div>
                    <Label className="text-white/60 mb-2 block">Upload from Device</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="file-upload"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all ${
                          uploading 
                            ? 'bg-zinc-700 text-white/40 cursor-not-allowed' 
                            : 'bg-amber-400 hover:bg-amber-300 text-black'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Choose File
                          </>
                        )}
                      </label>
                      <span className="text-white/40 text-sm">JPG, PNG, WebP, GIF • Max 10MB</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-white/40 text-sm">OR</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <Label className="text-white/60 mb-2 block">Add via URL</Label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyPress={handleImageKeyPress}
                        placeholder="Paste image URL and press Enter or click Add"
                        className="flex-1 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                      />
                      <Button
                        type="button"
                        onClick={addImage}
                        disabled={!imageUrl.trim()}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-bold shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                {images.length === 0 && (
                  <div className="mt-6 p-8 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/20 mb-3" />
                    <span className="text-white/40 text-sm mb-1">No images added yet</span>
                    <span className="text-white/30 text-xs">Upload files or paste URLs above</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Variants */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Variants</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colors */}
                  <div>
                    <Label className="text-white/60 mb-2 block">Colors</Label>
                    <div className="space-y-2">
                      {colors.map((color, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={color}
                            onChange={(e) => updateColor(index, e.target.value)}
                            placeholder="e.g., Black, White"
                            className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                          />
                          {colors.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/10"
                              onClick={() => removeColor(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                        onClick={addColor}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Color
                      </Button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <Label className="text-white/60 mb-2 block">Sizes</Label>
                    <div className="space-y-2">
                      {sizes.map((size, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={size}
                            onChange={(e) => updateSize(index, e.target.value)}
                            placeholder="e.g., S, M, L, XL"
                            className="bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                          />
                          {sizes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:bg-red-500/10"
                              onClick={() => removeSize(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                        onClick={addSize}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Size
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/60">Price (KES) *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white/60">Compare at Price (KES)</Label>
                    <Input
                      type="number"
                      value={formData.compareAt}
                      onChange={(e) => setFormData({ ...formData, compareAt: e.target.value })}
                      placeholder="Original price for sales"
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                    />
                    <p className="text-white/40 text-xs mt-1">Used to show discounted price</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category & Condition */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Organization</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/60">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className="mt-1.5 bg-zinc-800 border-white/10 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-white/10">
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white hover:bg-white/5">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/60">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger className="mt-1.5 bg-zinc-800 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-white/10">
                        <SelectItem value="NEW" className="text-white hover:bg-white/5">New</SelectItem>
                        <SelectItem value="THRIFTED" className="text-white hover:bg-white/5">Thrifting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/60">Tags</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="luxury, streetwear, vintage"
                      className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                    />
                    <p className="text-white/40 text-xs mt-1">Comma-separated tags</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="bg-zinc-900 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-zinc-800 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-white">In Stock</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-zinc-800 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-white">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isLimited}
                      onChange={(e) => setFormData({ ...formData, isLimited: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 bg-zinc-800 text-amber-400 focus:ring-amber-400"
                    />
                    <span className="text-white">Limited Drop</span>
                  </label>

                  {formData.isLimited && (
                    <div>
                      <Label className="text-white/60">Limited Quantity</Label>
                      <Input
                        type="number"
                        value={formData.limitedQty}
                        onChange={(e) => setFormData({ ...formData, limitedQty: e.target.value })}
                        placeholder="Number of items"
                        className="mt-1.5 bg-zinc-800 border-white/10 text-white placeholder:text-white/40 focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-400 hover:!bg-amber-300 text-black font-bold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
