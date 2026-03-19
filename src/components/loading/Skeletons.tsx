import { Skeleton } from '@/components/ui/skeleton';

export function SectionSkeleton() {
  return (
    <section className="py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-4 w-48 mx-auto mb-4 bg-zinc-800" />
          <Skeleton className="h-10 w-64 mx-auto mb-4 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] bg-zinc-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewArrivalsSkeleton() {
  return (
    <section className="py-20 lg:py-32 bg-zinc-950 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <Skeleton className="h-4 w-32 mb-2 bg-zinc-800" />
            <Skeleton className="h-8 w-48 mb-2 bg-zinc-800" />
            <Skeleton className="h-4 w-64 bg-zinc-800" />
          </div>
          <Skeleton className="h-10 w-32 bg-zinc-800" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] bg-zinc-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LimitedDropSkeleton() {
  return (
    <section className="py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <Skeleton className="h-8 w-40 mb-6 bg-zinc-800" />
            <Skeleton className="h-12 w-64 mb-4 bg-zinc-800" />
            <Skeleton className="h-4 w-full max-w-md mb-4 bg-zinc-800" />
            <Skeleton className="h-4 w-3/4 max-w-sm mb-10 bg-zinc-800" />
            <div className="flex gap-3 lg:gap-4 mb-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-16 lg:w-20 h-16 lg:h-20 bg-zinc-800" />
                  <Skeleton className="w-8 h-3 mt-2 bg-zinc-800" />
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-40 bg-zinc-800" />
              <Skeleton className="h-12 w-32 bg-zinc-800" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton className="aspect-square lg:aspect-[4/5] bg-zinc-800" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommunityGridSkeleton() {
  return (
    <section className="py-20 lg:py-32 bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <Skeleton className="h-4 w-32 mx-auto mb-4 bg-zinc-800" />
          <Skeleton className="h-8 w-40 mx-auto mb-4 bg-zinc-800" />
          <Skeleton className="h-4 w-64 mx-auto mb-6 bg-zinc-800" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-24 bg-zinc-800" />
            <Skeleton className="h-10 w-28 bg-zinc-800" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square bg-zinc-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsletterSkeleton() {
  return (
    <section className="py-20 lg:py-28 bg-zinc-950 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6 bg-zinc-800" />
          <Skeleton className="h-8 w-48 mx-auto mb-4 bg-zinc-800" />
          <Skeleton className="h-4 w-80 mx-auto mb-8 bg-zinc-800" />
          <Skeleton className="h-12 w-full max-w-lg mx-auto bg-zinc-800" />
        </div>
      </div>
    </section>
  );
}
