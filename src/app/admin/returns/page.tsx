'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeftRight,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  RefreshCw,
  Mail,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

interface OrderReturn {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string | null;
  customerEmail: string;
  customerName: string | null;
  reason: string;
  reasonDetails: string | null;
  items: string;
  status: string;
  refundMethod: string | null;
  refundAmount: number | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-blue-500/20 text-blue-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  PROCESSING: 'bg-purple-500/20 text-purple-400',
  COMPLETED: 'bg-green-500/20 text-green-400',
};

const reasonLabels: Record<string, string> = {
  WRONG_SIZE: 'Wrong Size',
  DEFECTIVE: 'Defective Product',
  NOT_AS_DESCRIBED: 'Not as Described',
  CHANGED_MIND: 'Changed Mind',
  OTHER: 'Other',
};

export default function AdminReturns() {
  const [returns, setReturns] = useState<OrderReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReturn, setSelectedReturn] = useState<OrderReturn | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    refundMethod: '',
    refundAmount: '',
    adminNotes: '',
  });

  useEffect(() => {
    fetchReturns();
  }, [statusFilter]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const url = statusFilter !== 'ALL' 
        ? `/api/admin/returns?status=${statusFilter}`
        : '/api/admin/returns';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReturns(data.returns);
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailDialog = (returnItem: OrderReturn) => {
    setSelectedReturn(returnItem);
    setStatusUpdate({
      status: returnItem.status,
      refundMethod: returnItem.refundMethod || '',
      refundAmount: returnItem.refundAmount?.toString() || '',
      adminNotes: returnItem.adminNotes || '',
    });
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReturn) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReturn.id,
          status: statusUpdate.status,
          refundMethod: statusUpdate.refundMethod || null,
          refundAmount: statusUpdate.refundAmount || null,
          adminNotes: statusUpdate.adminNotes || null,
        }),
      });

      if (response.ok) {
        fetchReturns();
        setDetailDialogOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update return');
      }
    } catch (error) {
      console.error('Failed to update return:', error);
      alert('Failed to update return');
    } finally {
      setSaving(false);
    }
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      ALL: returns.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      PROCESSING: 0,
      COMPLETED: 0,
    };
    returns.forEach(r => {
      if (counts[r.status] !== undefined) {
        counts[r.status]++;
      }
    });
    return counts;
  };

  const counts = getStatusCounts();

  if (loading && returns.length === 0) {
    return (
      <AdminLayout title="Returns">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Returns">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Return Requests</h2>
          <p className="text-white/40">Manage product returns and refunds</p>
        </div>
        <Button
          onClick={fetchReturns}
          variant="outline"
          className="border-white/10 text-white/60 hover:text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList className="bg-zinc-900 border border-white/10">
          <TabsTrigger value="ALL" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
            All ({counts.ALL})
          </TabsTrigger>
          <TabsTrigger value="PENDING" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
            Pending ({counts.PENDING})
          </TabsTrigger>
          <TabsTrigger value="APPROVED" className="data-[state=active]:bg-blue-500 data-[state=active]:text-black">
            Approved ({counts.APPROVED})
          </TabsTrigger>
          <TabsTrigger value="PROCESSING" className="data-[state=active]:bg-purple-500 data-[state=active]:text-black">
            Processing ({counts.PROCESSING})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Completed ({counts.COMPLETED})
          </TabsTrigger>
          <TabsTrigger value="REJECTED" className="data-[state=active]:bg-red-500 data-[state=active]:text-black">
            Rejected ({counts.REJECTED})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Returns List */}
      <div className="space-y-4">
        {returns.map((returnItem) => (
          <Card 
            key={returnItem.id} 
            className="bg-zinc-900 border-white/10 cursor-pointer hover:border-white/20 transition-colors"
            onClick={() => openDetailDialog(returnItem)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">#{returnItem.orderNumber}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[returnItem.status]}`}>
                        {returnItem.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {returnItem.customerName || returnItem.customerEmail}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3" />
                        {reasonLabels[returnItem.reason] || returnItem.reason}
                      </span>
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(returnItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {returnItem.refundAmount && (
                    <p className="text-amber-400 font-bold">
                      KES {returnItem.refundAmount.toLocaleString()}
                    </p>
                  )}
                  {returnItem.refundMethod && (
                    <p className="text-white/40 text-xs">{returnItem.refundMethod.replace('_', ' ')}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {returns.length === 0 && (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowLeftRight className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/40">No return requests found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
            <DialogDescription className="text-white/40">
              #{selectedReturn?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <Label className="text-white/40 text-xs">Customer</Label>
                  <p className="text-white font-medium">{selectedReturn.customerName || 'N/A'}</p>
                  <p className="text-white/60 text-sm flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {selectedReturn.customerEmail}
                  </p>
                </div>
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <Label className="text-white/40 text-xs">Reason</Label>
                  <p className="text-white font-medium">
                    {reasonLabels[selectedReturn.reason] || selectedReturn.reason}
                  </p>
                  {selectedReturn.reasonDetails && (
                    <p className="text-white/60 text-sm mt-1">{selectedReturn.reasonDetails}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <Label className="text-white/60 mb-2 block">Items Being Returned</Label>
                <div className="bg-zinc-800 rounded-lg divide-y divide-white/5">
                  {(() => {
                    try {
                      const items: ReturnItem[] = JSON.parse(selectedReturn.items);
                      return items.map((item, i) => (
                        <div key={i} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{item.productName}</p>
                            <p className="text-white/40 text-xs">
                              {item.color} • {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-white/60 text-sm">
                            KES {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ));
                    } catch {
                      return <p className="p-3 text-white/40">Error loading items</p>;
                    }
                  })()}
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t border-white/10 pt-4">
                <Label className="text-white/60 mb-3 block">Update Status</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/40 text-xs">Status</Label>
                    <Select
                      value={statusUpdate.status}
                      onValueChange={(value) => setStatusUpdate({ ...statusUpdate, status: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-white/10 text-white mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-white/10">
                        <SelectItem value="PENDING" className="text-white">Pending</SelectItem>
                        <SelectItem value="APPROVED" className="text-white">Approved</SelectItem>
                        <SelectItem value="PROCESSING" className="text-white">Processing</SelectItem>
                        <SelectItem value="COMPLETED" className="text-white">Completed</SelectItem>
                        <SelectItem value="REJECTED" className="text-white">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/40 text-xs">Refund Method</Label>
                    <Select
                      value={statusUpdate.refundMethod}
                      onValueChange={(value) => setStatusUpdate({ ...statusUpdate, refundMethod: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-white/10 text-white mt-1.5">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-white/10">
                        <SelectItem value="ORIGINAL_PAYMENT" className="text-white">Original Payment</SelectItem>
                        <SelectItem value="STORE_CREDIT" className="text-white">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-white/40 text-xs">Refund Amount (KES)</Label>
                  <Input
                    type="number"
                    value={statusUpdate.refundAmount}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, refundAmount: e.target.value })}
                    placeholder="0"
                    className="bg-zinc-800 border-white/10 text-white mt-1.5"
                  />
                </div>

                <div className="mt-4">
                  <Label className="text-white/40 text-xs">Admin Notes</Label>
                  <Textarea
                    value={statusUpdate.adminNotes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, adminNotes: e.target.value })}
                    placeholder="Add notes about this return..."
                    rows={3}
                    className="bg-zinc-800 border-white/10 text-white mt-1.5"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailDialogOpen(false)}
                  className="border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={saving}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Update
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
