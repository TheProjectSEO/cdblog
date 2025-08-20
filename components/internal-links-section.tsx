'use client'

import { ExternalLink, ArrowRight, MapPin, Globe, Sparkles, Clock, Star } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

interface InternalLink {
  title: string
  description: string
  url: string
  category?: 'related' | 'external'
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

  // Default links if none provided
  const defaultLinks = [
    {
      title: "Best European City Breaks",
      description: "Charming weekend getaways",
      url: "/blog/best-european-city-breaks",
      category: 'related' as const
    },
    {
      title: "Italian Food & Wine Guide", 
      description: "Authentic cuisine & wine regions",
      url: "/blog/italian-food-wine-guide",
      category: 'related' as const
    },
    {
      title: "Mediterranean Travel Tips",
      description: "Essential coastal travel advice",
      url: "/blog/mediterranean-travel-tips",
      category: 'related' as const
    },
    {
      title: "Tokyo Street Food Guide",
      description: "Best local eats in Japan",
      url: "/blog/tokyo-street-food",
      category: 'external' as const
    },
    {
      title: "Bali Hidden Beaches",
      description: "Secret coastal paradises",
      url: "/blog/bali-hidden-beaches",
      category: 'external' as const
    },
    {
      title: "New York Art Scene",
      description: "Museums & galleries guide",
      url: "/blog/nyc-art-scene",
      category: 'external' as const
    }
  ]

  const linksToShow = links && links.length > 0 ? links : defaultLinks
  
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

  // Convert internal links to related articles format
  const relatedArticles = linksToShow.slice(0, 3).map((link, index) => ({
    id: index.toString(),
    title: link.title,
    description: link.description,
    url: link.url,
    imageUrl: '', // You can add default images later
    category: link.category === 'related' ? 'Travel Guide' : 'Destination Guide'
  }))

  const relatedArticlesData = {
    title: title,
    articles: relatedArticles
  }

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedArticles.map((article, index) => (
            <Link key={article.id} href={article.url} className="block group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Travel Guide</div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}