import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-full mx-auto px-8 py-2">
          <div className="flex items-center justify-between w-full">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative w-screen h-[75vh] min-h-[600px] bg-gray-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl text-white space-y-6">
            <Skeleton className="h-6 w-32 bg-white/20" />
            <Skeleton className="h-16 md:h-24 w-full max-w-3xl bg-white/20" />
            <Skeleton className="h-6 w-2/3 bg-white/20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 bg-white/20 rounded-full" />
              <Skeleton className="h-8 w-32 bg-white/20 rounded-full" />
              <Skeleton className="h-8 w-28 bg-white/20 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-12 w-48 bg-white/20 rounded-full" />
              <Skeleton className="h-12 w-32 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8 relative -mt-20 z-10 bg-white rounded-t-3xl shadow-lg">
        <div className="space-y-8">
          {/* First content section */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>

          {/* More content sections */}
          {[1, 2, 3].map((section) => (
            <div key={section} className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}