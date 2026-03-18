'use client';

import { Hero } from '@/components/layout/Hero';
import { ShopSection } from '@/components/sections/ShopSection';
import dynamic from 'next/dynamic';

// Lazy load below-the-fold sections with dynamic imports
const NewArrivals = dynamic(
  () => import('@/components/sections/NewArrivals').then((mod) => mod.NewArrivals),
  { ssr: false }
);

const LimitedDrop = dynamic(
  () => import('@/components/sections/LimitedDrop').then((mod) => mod.LimitedDrop),
  { ssr: false }
);

const CommunityGrid = dynamic(
  () => import('@/components/sections/CommunityGrid').then((mod) => mod.CommunityGrid),
  { ssr: false }
);

const Newsletter = dynamic(
  () => import('@/components/sections/Newsletter').then((mod) => mod.Newsletter),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      {/* Hero Section - Critical, load immediately */}
      <Hero />
      
      {/* Shop Section - Above the fold, load immediately */}
      <section id="shop">
        <ShopSection />
      </section>
      
      {/* Below the fold sections - Lazy loaded */}
      <section id="new">
        <NewArrivals />
      </section>
      
      <section id="drop">
        <LimitedDrop />
      </section>
      
      <section id="community">
        <CommunityGrid />
      </section>
      
      <Newsletter />
    </>
  );
}
