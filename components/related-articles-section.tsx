'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface RelatedArticle {
  id?: string | number
  title: string
  description: string
  url: string
  imageUrl?: string
  category?: string
  heroImageUrl?: string // Auto-fetched hero image from blog post
}

interface RelatedArticlesSectionData {
  title?: string
  articles?: RelatedArticle[]
  links?: RelatedArticle[] // Support both articles and links for backward compatibility
}

interface RelatedArticlesSectionProps {
  data: RelatedArticlesSectionData
}

export function RelatedArticlesSection({ data }: RelatedArticlesSectionProps) {
  const { title = "Related Articles", articles, links } = data
  // Support both articles and links for backward compatibility
  const articlesArray = articles || links || []
  const [enhancedArticles, setEnhancedArticles] = useState<RelatedArticle[]>([])
  const [loading, setLoading] = useState(true)

  // Default articles if none provided
  const defaultArticles = [
    {
      id: 1,
      title: "Best European City Breaks",
      description: "Charming weekend getaways",
      url: "/blog/best-european-city-breaks",
      imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop",
      category: "Travel Guide"
    },
    {
      id: 2,
      title: "Italian Food & Wine Guide",
      description: "Authentic cuisine & wine regions",
      url: "/blog/italian-food-wine-guide",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop",
      category: "Travel Guide"
    },
    {
      id: 3,
      title: "Mediterranean Travel Tips",
      description: "Essential coastal travel advice",
      url: "/blog/mediterranean-travel-tips",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2020&auto=format&fit=crop",
      category: "Travel Guide"
    }
  ]

  const articlesToShow = articlesArray && articlesArray.length > 0 ? articlesArray.slice(0, 3) : defaultArticles

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

  // Enhance articles with hero images on component mount
  useEffect(() => {
    const enhanceArticlesWithHeroImages = async () => {
      setLoading(true)
      const enhanced = await Promise.all(
        articlesToShow.map(async (article) => {
          const slug = extractSlugFromUrl(article.url)
          if (slug) {
            const heroImageUrl = await fetchBlogHeroImage(slug)
            return {
              ...article,
              heroImageUrl: heroImageUrl || article.imageUrl
            }
          }
          return {
            ...article,
            heroImageUrl: article.imageUrl
          }
        })
      )
      setEnhancedArticles(enhanced)
      setLoading(false)
    }

    enhanceArticlesWithHeroImages()
  }, [articlesArray])

  const ArticleCard = ({ article }: { article: RelatedArticle }) => {
    const imageUrl = article.heroImageUrl || article.imageUrl
    
    return (
      <Link href={article.url} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-gray-100">
          {/* Hero Image */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Travel Guide</div>
              </div>
            )}
            
            {/* Category Badge */}
            {article.category && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                  {article.category}
                </span>
              </div>
            )}
            
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
              {article.description}
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
            {enhancedArticles.map((article, index) => (
              <ArticleCard key={article.id || index} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}