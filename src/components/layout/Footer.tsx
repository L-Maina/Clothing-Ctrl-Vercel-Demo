'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Instagram, MapPin, Clock, Mail, Globe, Phone } from 'lucide-react';
import { useLiveSettings, useRealtime } from '@/hooks/useRealtime';

// Map platform names to icons
const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  tiktok: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  website: <Globe className="w-5 h-5" />,
};

export function Footer() {
  const { settings, socials, isLoading, getActiveSocials } = useLiveSettings();
  // useRealtime now handles initialization internally
  useRealtime();

  const activeSocials = getActiveSocials();

  // Format hours
  const formatHours = () => {
    if (settings.openHour && settings.closeHour) {
      const openHour = parseInt(settings.openHour.split(':')[0]);
      const closeHour = parseInt(settings.closeHour.split(':')[0]);
      const ampm = (h: number) => h >= 12 ? 'pm' : 'am';
      const formatHour = (h: number) => h > 12 ? h - 12 : h;
      return `${formatHour(openHour)}${ampm(openHour)} - ${formatHour(closeHour)}${ampm(closeHour)}`;
    }
    return '12pm - 6pm';
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-white">
                {settings.storeName?.replace('Ctrl', '') || 'CLOTHING'}
                <span className="text-amber-400">{settings.storeName?.includes('Ctrl') ? 'CTRL' : ''}</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {settings.storeDescription || 'Your one-stop fashion destination in Nairobi. From luxury designer pieces to streetwear essentials, thrifted gems to custom creations.'}
            </p>
            {/* Dynamic Social Links */}
            <div className="flex gap-4">
              {isLoading ? (
                // Loading skeleton
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
                  ))}
                </>
              ) : activeSocials.length > 0 ? (
                activeSocials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 hover:bg-amber-400 rounded-full flex items-center justify-center text-white/60 hover:text-black transition-all"
                    title={link.handle}
                  >
                    {platformIcons[link.platform] || <Globe className="w-5 h-5" />}
                  </a>
                ))
              ) : (
                // Fallback socials
                <>
                  <a
                    href="https://www.instagram.com/clothing.ctrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 hover:bg-amber-400 rounded-full flex items-center justify-center text-white/60 hover:text-black transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@clothing.ctrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 hover:bg-amber-400 rounded-full flex items-center justify-center text-white/60 hover:text-black transition-all"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                { name: 'Clothes', href: '/shop' },
                { name: 'Shoes', href: '/shop' },
                { name: 'Accessories', href: '/shop' },
                { name: 'New Arrivals', href: '/new-arrivals' },
                { name: 'Limited Drops', href: '/drops' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-amber-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Brands</h4>
            <ul className="space-y-3">
              {['Gucci', 'Prada', 'Balenciaga', 'Bape', 'Diesel', 'Chrome Hearts', 'Carhartt', 'Thrifted', 'Custom'].map((item) => (
                <li key={item}>
                  <span className="text-white/60 text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Visit Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  {settings.addressLine1 || 'Cargen House, Harambee Ave'}
                  {settings.addressLine2 && <><br />{settings.addressLine2}</>}
                  <br />
                  {settings.city || 'Nairobi CBD'}, {settings.country || 'Kenya'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-white/60 text-sm">
                  {settings.openDays || 'Mon - Sat'}: {formatHours()}
                </span>
              </li>
              {settings.storeEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href={`mailto:${settings.storeEmail}`} className="text-white/60 hover:text-amber-400 text-sm transition-colors">
                    {settings.storeEmail}
                  </a>
                </li>
              )}
              {settings.storePhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <a href={`tel:${settings.storePhone}`} className="text-white/60 hover:text-amber-400 text-sm transition-colors">
                    {settings.storePhone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} {settings.storeName || 'Clothing Ctrl'}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/privacy" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/returns-policy" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Returns Policy
            </Link>
            <Link href="/faq" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="text-white/40 hover:text-white/60 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Worldwide Shipping Banner */}
        <div className="mt-8 text-center pb-20 md:pb-4">
          <p className="text-white/30 text-xs">
            🌍 Worldwide Shipping Available • Authentic Guaranteed • {settings.city || 'Nairobi'}, {settings.country || 'Kenya'}
          </p>
        </div>
      </div>
    </footer>
  );
}
