'use client'

import { ExternalLink, ArrowRight, MapPin, Globe, Sparkles, Clock, Star } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface InternalLink {
  title: string
  description: string
  url: string
  category?: 'related' | 'external'
  imageUrl?: string
  heroImageUrl?: string // Auto-fetched hero image from blog post
}

interface InternalLinksSectionData {
  title?: string
  links: InternalLink[]
}

interface InternalLinksSectionProps {
  data: InternalLinksSectionData
}

export function InternalLinksSection({ data }: InternalLinksSectionProps) {
  const { title = "Related Travel Guides", links } = data
  const [enhancedLinks, setEnhancedLinks] = useState<InternalLink[]>([])
  const [loading, setLoading] = useState(true)

  // Default links if none provided - now with default images
  const defaultLinks = [
    {
      title: "Italian Lakes Region: Como, Garda & Maggiore Complete Guide",
      description: "Explore the stunning Italian Lakes region with our complete guide to Lake Como, Lake Garda, and Lake Maggiore.",
      url: "/blog/italian-lakes-region-como-garda-maggiore-complete-guide",
      category: 'related' as const,
      imageUrl: "https://images.unsplash.com/photo-1527004760525-1e19e2bc8f9c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
    },
    {
      title: "Santorini Secrets: Beyond the Instagram Photos", 
      description: "Discover the authentic side of Santorini beyond the typical tourist spots and Instagram-worthy locations.",
      url: "/blog/santorini-secrets-authentic-guide",
      category: 'related' as const,
      imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
    },
    {
      title: "Tokyo: The Ultimate Modern Metropolis Guide",
      description: "Navigate Tokyo like a local with our comprehensive guide to Japan's bustling capital city.",
      url: "/blog/tokyo-ultimate-guide",
      category: 'related' as const,
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3"
    },
    {
      title: "Mediterranean Coast Adventures",
      description: "Best local eats and coastal experiences",
      url: "/blog/mediterranean-coast-adventures",
      category: 'external' as const,
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3"
    },
    {
      title: "European Hidden Gems",
      description: "Secret destinations off the beaten path",
      url: "/blog/european-hidden-gems",
      category: 'external' as const,
      imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3"
    },
    {
      title: "Authentic Italian Experiences",
      description: "Local culture and culinary adventures",
      url: "/blog/authentic-italian-experiences",
      category: 'external' as const,
      imageUrl: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=2083&auto=format&fit=crop&ixlib=rb-4.0.3"
    }
  ]

  // Use defaultLinks if no links provided, or merge with defaultLinks to ensure imageUrl properties
  const linksToShow = (links && links.length > 0) 
    ? links.map((link, index) => ({
        ...link,
        // If the incoming link doesn't have imageUrl, use corresponding defaultLink imageUrl
        imageUrl: link.imageUrl || defaultLinks[index % defaultLinks.length]?.imageUrl
      }))
    : defaultLinks

  // Function to extract slug from URL
  const extractSlugFromUrl = (url: string): string | null => {
    if (url.startsWith('/blog/')) {
      return url.replace('/blog/', '')
    }
    return null
  }

  // Function to fetch hero image from a blog post
  const fetchBlogHeroImage = async (slug: string): Promise<string | null> => {
    try {
      // Try modern_posts first
      const { data: modernPost, error: modernError } = await supabase
        .from('modern_posts')
        .select(`
          id,
          modern_post_sections!inner(
            template_id,
            data
          )
        `)
        .eq('slug', slug)
        .eq('modern_post_sections.template_id', '6f579a71-463c-43b4-b203-c2cb46c80d47') // Hero section template
        .single()

      if (!modernError && modernPost?.modern_post_sections?.[0]?.data?.backgroundImage) {
        return modernPost.modern_post_sections[0].data.backgroundImage
      }

      // Fallback to legacy posts table
      const { data: legacyPost, error: legacyError } = await supabase
        .from('posts')
        .select('featured_image')
        .eq('slug', slug)
        .single()

      if (!legacyError && legacyPost?.featured_image) {
        return legacyPost.featured_image
      }

      return null
    } catch (error) {
      console.error(`Error fetching hero image for ${slug}:`, error)
      return null
    }
  }

  // Enhance links with hero images on component mount
  useEffect(() => {
    const enhanceLinksWithHeroImages = async () => {
      setLoading(true)
      const enhanced = await Promise.all(
        linksToShow.slice(0, 3).map(async (link) => {
          const slug = extractSlugFromUrl(link.url)
          if (slug) {
            const heroImageUrl = await fetchBlogHeroImage(slug)
            return {
              ...link,
              heroImageUrl: heroImageUrl || link.imageUrl
            }
          }
          return {
            ...link,
            heroImageUrl: link.imageUrl
          }
        })
      )
      setEnhancedLinks(enhanced)
      setLoading(false)
    }

    enhanceLinksWithHeroImages()
  }, [linksToShow])
  
  // Categorize links
  const relatedLinks = linksToShow.filter(link => link.category === 'related' || !link.category).slice(0, 4)
  const externalLinks = linksToShow.filter(link => link.category === 'external').slice(0, 4)

  const getRandomIcon = (index: number) => {
    const icons = [MapPin, Clock, Star, Sparkles, ExternalLink, Globe]
    return icons[index % icons.length]
  }

  const CompactCard = ({ link, index }: { link: InternalLink; index: number }) => {
    const IconComponent = getRandomIcon(index)
    return (
      <Link href={link.url} className="block group">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white group h-full">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300 group-hover:scale-110">
                  <IconComponent className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-indigo-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 text-lg mb-2 leading-tight">
                  {link.title}
                </h3>
                
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                  {link.description}
                </p>
                
                <div className="mt-4 flex items-center text-purple-600 group-hover:text-purple-700 transition-colors duration-300">
                  <span className="text-sm font-semibold">Read more</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <section className="bg-gray-50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto"></div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enhancedLinks.map((link, index) => {
              const imageUrl = link.heroImageUrl || link.imageUrl
              return (
                <Link key={`${link.title}-${index}`} href={link.url} className="block group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    {/* Hero Image */}
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={link.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          <div className="text-gray-400 text-sm">Travel Guide</div>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                          Travel Guide
                        </span>
                      </div>
                      
                      {/* Gradient Overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {link.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {link.description}
                      </p>

                      {/* Read more indicator */}
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors">
                        <span>Read more</span>
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}