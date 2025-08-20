'use client'

import { Button } from "@/components/ui/button"
import { Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

interface HtmlHeroSectionProps {
  title?: string
  description?: string
  location?: string
  heroImage?: string
  post?: any
  data?: {
    title?: string
    subtitle?: string
    location?: string
    backgroundImage?: string
    breadcrumbs?: Array<{
      text: string
      href?: string
    }>
    meta?: {
      publishDate?: string
      readTime?: string
      author?: string
      lastUpdated?: string
    }
    showBreadcrumbs?: boolean
    showMeta?: boolean
  }
}

export function HtmlHeroSection({ 
  title,
  description,
  location,
  heroImage,
  post,
  data
}: HtmlHeroSectionProps) {
  // Use data props if available, otherwise fall back to direct props or post data
  const finalTitle = data?.title || title || post?.title || "Amazing Destination Guide"
  const finalDescription = data?.subtitle || description || post?.excerpt || "Discover incredible experiences and expert insights"
  const finalLocation = data?.location || location || "Destination"
  
  // Detect if this is a secondary navigation section
  const isNavigationSection = finalTitle.toLowerCase().includes('navigation') || 
                              finalTitle.toLowerCase().includes('quick') ||
                              finalTitle.toLowerCase().includes('contents')
  
  // Meta information
  const publishDate = data?.meta?.publishDate || post?.published_at || new Date().toISOString()
  const readTime = data?.meta?.readTime || "12 min read"
  const author = data?.meta?.author || post?.author?.display_name || "Travel Expert"
  const lastUpdated = data?.meta?.lastUpdated || post?.updated_at || publishDate

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  // Breadcrumbs
  const defaultBreadcrumbs = [
    { text: 'Home', href: '/' },
    { text: 'Blog', href: '/blog' },
    { text: finalTitle.split(':')[0] || 'Travel Guide', href: '' }
  ]
  const breadcrumbs = data?.breadcrumbs || defaultBreadcrumbs

  // Get hero image with fallback
  const getHeroImage = () => {
    // Priority 1: Use provided backgroundImage
    if (data?.backgroundImage) return data.backgroundImage
    if (heroImage) return heroImage
    
    // Priority 2: Use post image if available
    if (post?.og_image?.file_url) return post.og_image.file_url
    
    // Priority 3: Default to vibrant Lake Como image
    return "https://images.unsplash.com/photo-1539650116574-75c0c6d73e5e?w=1200&q=80"
  }

  const finalImage = getHeroImage()

  return (
    <section className={`relative w-full ${
      isNavigationSection 
        ? "bg-white text-gray-900 border-b border-gray-200 py-4" 
        : "bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white py-16"
    }`} style={{
      minHeight: isNavigationSection ? 'auto' : '60vh',
      maxHeight: isNavigationSection ? 'auto' : '70vh'
    }}>
      {/* Background image overlay for main hero sections */}
      {!isNavigationSection && (
        <div className="absolute inset-0 z-0">
          <img
            src={finalImage}
            alt={`${finalLocation} background`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-800/70 to-blue-700/60"></div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        {(data?.showBreadcrumbs !== false) && (
          <nav className="text-sm mb-6">
            {breadcrumbs.map((crumb, index) => (
              <span key={index}>
                {crumb.href ? (
                  <Link href={crumb.href} className={`${
                    isNavigationSection 
                      ? "text-gray-600 hover:text-gray-900" 
                      : "text-white/70 hover:text-white"
                  } transition`}>
                    {crumb.text}
                  </Link>
                ) : (
                  <span className={isNavigationSection ? "text-gray-900" : "text-white"}>{crumb.text}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <span className={`mx-2 ${isNavigationSection ? "text-gray-400" : "text-white/50"}`}>/</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
          {finalTitle}
        </h1>

        {/* Meta Information */}
        {(data?.showMeta !== false) && (
          <div className="flex items-center gap-6 text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Updated: {formatDate(lastUpdated)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              By {author}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}