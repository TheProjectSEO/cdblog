import { getRecentPosts, getPostsCount, getPopularCategories, getFeaturedPosts, getCombinedRecentPosts } from "@/lib/supabase"
import { BlogHomepage } from "@/components/blog-homepage"

// Default categories if database is empty
const defaultCategories = [
  "Nightlife", "Food", "Adventure", "Beaches", "Culture", "Hiking", "City Guides", "Hidden Gems"
]

// Metadata for blog homepage
export const metadata = {
  title: 'Travel Blog | CuddlyNest - Articles, Tips and Tricks',
  description: 'Articles, tips and tricks for travelers & property owners. Discover amazing destinations and travel guides.',
  keywords: 'travel blog, travel guides, destination guides, travel tips, vacation planning, travel inspiration',
  openGraph: {
    title: 'Travel Blog | CuddlyNest - Articles, Tips and Tricks',
    description: 'Articles, tips and tricks for travelers & property owners. Discover amazing destinations and travel guides.',
    type: 'website',
    siteName: 'CuddlyNest',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cuddlynest',
    title: 'Travel Blog | CuddlyNest - Articles, Tips and Tricks',
    description: 'Articles, tips and tricks for travelers & property owners.',
  },
  alternates: {
    canonical: 'https://cuddlynest.com/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function BlogPage() {
  // Fetch real data from database - now includes both modern and legacy posts
  const [recentPosts, featuredPosts, totalPosts, categories] = await Promise.all([
    getCombinedRecentPosts(12), // Use combined posts instead of just modern posts
    getFeaturedPosts(6),
    getPostsCount(),
    getPopularCategories(8)
  ])

  const displayCategories = categories.length > 0 
    ? categories.map(cat => cat.name) 
    : defaultCategories

  return (
    <BlogHomepage 
      recentPosts={recentPosts}
      featuredPosts={featuredPosts || recentPosts.slice(0, 6)}
      totalPosts={totalPosts}
      categories={displayCategories}
    />
  )
}