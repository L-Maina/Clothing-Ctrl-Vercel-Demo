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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Download,
  MoreHorizontal,
  Mail,
  Trash2,
  Send,
  Tag,
  CheckCircle,
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  discountUsed: boolean;
  createdAt: Date;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch('/api/admin/subscribers');
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      } catch (error) {
        console.error('Failed to fetch subscribers:', error);
        // Demo data
        setSubscribers([
          {
            id: '1',
            email: 'john.doe@example.com',
            discountUsed: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            id: '2',
            email: 'jane.smith@example.com',
            discountUsed: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: '3',
            email: 'mike.johnson@example.com',
            discountUsed: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: '4',
            email: 'sarah.wilson@example.com',
            discountUsed: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: '5',
            email: 'david.brown@example.com',
            discountUsed: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'used' && sub.discountUsed) ||
      (filter === 'notused' && !sub.discountUsed);
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalSubscribers = subscribers.length;
  const discountUsed = subscribers.filter(s => s.discountUsed).length;
  const newThisWeek = subscribers.filter(s => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(s.createdAt) > weekAgo;
  }).length;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    
    try {
      await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      setSubscribers(subscribers.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
    }
  };

  return (
    <AdminLayout title="Newsletter Subscribers">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Total Subscribers</p>
                <p className="text-xl font-bold text-white">{totalSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Discount Used</p>
                <p className="text-xl font-bold text-white">{discountUsed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-white/40 text-xs">New This Week</p>
                <p className="text-xl font-bold text-white">{newThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="bg-zinc-900 border-white/10 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search subscribers..."
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
                <option value="all">All Subscribers</option>
                <option value="used">Discount Used</option>
                <option value="notused">Discount Not Used</option>
              </select>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button className="flex-1 md:flex-none bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Send className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card className="bg-zinc-900 border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-white/40">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-white/40">No subscribers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Email</TableHead>
                    <TableHead className="text-white/60">Discount Status</TableHead>
                    <TableHead className="text-white/60">Subscribed</TableHead>
                    <TableHead className="text-white/60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-400/10 rounded-full flex items-center justify-center">
                            <Mail className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-white">{subscriber.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {subscriber.discountUsed ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Used
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            Not Used
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-white/60">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/5">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-white/10">
                            <DropdownMenuItem className="text-white/60 hover:text-white focus:text-white">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 focus:text-red-400"
                              onClick={() => handleDelete(subscriber.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
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
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
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
