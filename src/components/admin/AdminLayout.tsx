'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Image as ImageIcon,
  Mail,
  Share2,
  TrendingUp,
  ShoppingCart,
  User,
  Loader2,
  Clock,
  AlertTriangle,
  MessageSquare,
  MessageCircle,
  ArrowLeftRight,
  Tag,
  HelpCircle,
  Download,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminOnboarding } from './AdminOnboarding';

// Lazy load QuickView for admin pages
const QuickView = dynamic(
  () => import('@/components/products/QuickView').then((mod) => mod.QuickView),
  { ssr: false }
);

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Returns', href: '/admin/returns', icon: ArrowLeftRight },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Discounts', href: '/admin/discounts', icon: Tag },
  { name: 'Drops', href: '/admin/drops', icon: Clock },
  { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Community', href: '/admin/community', icon: ImageIcon },
  { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
  { name: 'Social', href: '/admin/social', icon: Share2 },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Export', href: '/admin/export', icon: Download },
  { name: 'Admins', href: '/admin/admins', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface Notification {
  id: string;
  type: 'order' | 'customer' | 'product' | 'subscriber' | 'review' | 'community';
  message: string;
  time: string;
  read: boolean;
  link: string;
  orderId?: string;
  productId?: string;
  customerId?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { isAdminAuthenticated, adminUser, logout } = useAdminAuth();
  const hasCheckedAuth = useRef(false);

  // Check authentication - only once
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // Skip auth check on login page
    if (pathname === '/admin/login') return;

    if (!isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, pathname, router]);

  // Fetch real notifications with auto-refresh
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        if (response.ok) {
          const data = await response.json();
          // Get read notification IDs from localStorage
          const readIds = JSON.parse(localStorage.getItem('admin-read-notifications') || '[]');
          // Mark notifications as read if they were previously read
          const notificationsWithReadState = (data.notifications || []).map((n: Notification) => ({
            ...n,
            read: readIds.includes(n.id)
          }));
          setNotifications(notificationsWithReadState);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    if (pathname !== '/admin/login' && isAdminAuthenticated) {
      fetchNotifications();
      
      // Auto-refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [pathname, isAdminAuthenticated]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    // Update local state
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    // Save to localStorage
    const readIds = JSON.parse(localStorage.getItem('admin-read-notifications') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('admin-read-notifications', JSON.stringify(readIds));
    }
  };

  const markAllAsRead = () => {
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Save all IDs to localStorage
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('admin-read-notifications', JSON.stringify(allIds));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    router.push(notification.link);
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      case 'customer':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'product':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'subscriber':
        return <Mail className="w-4 h-4 text-green-400" />;
      case 'review':
        return <MessageSquare className="w-4 h-4 text-yellow-400" />;
      case 'community':
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      default:
        return <Bell className="w-4 h-4 text-white/40" />;
    }
  };

  // Show loading while checking auth (except on login page)
  if (pathname !== '/admin/login' && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Don't render layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">CC</span>
            </div>
            <span className="text-white font-bold">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-amber-400 text-black font-bold">
                {adminUser?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminUser?.name || 'Admin'}</p>
              <p className="text-white/40 text-xs truncate">{adminUser?.email || 'admin@clothingctrl.com'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Store
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-white/60 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{unreadCount}</span>
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-white/10">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="max-h-80 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-4 flex justify-center">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-white/40 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={cn(
                            'flex items-start gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors',
                            !notification.read && 'bg-white/5'
                          )}
                        >
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm truncate',
                              notification.read ? 'text-white/60' : 'text-white font-medium'
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-white/40 text-xs">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="p-2">
                    <Link href="/admin/orders" className="block">
                      <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5 text-sm">
                        View all activity
                      </Button>
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-400 text-black font-bold text-sm">
                        {adminUser?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-white/60 hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="text-white/60 hover:text-white focus:text-white cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/analytics" className="text-white/60 hover:text-white focus:text-white cursor-pointer">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/" className="text-white/60 hover:text-white focus:text-white cursor-pointer">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View Store
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-400 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* QuickView Modal - for admin product preview */}
      <QuickView />
      
      {/* Onboarding Modal - shows when admin needs to complete setup */}
      <AdminOnboarding />
    </div>
  );
}
