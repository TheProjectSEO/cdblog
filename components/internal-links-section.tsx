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

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl shadow-xl p-12 overflow-hidden mx-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-indigo-600/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      
      {/* Header */}
      <div className="relative z-10 text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full px-6 py-3 mb-6 hover:from-purple-200 hover:to-indigo-200 transition-all duration-300 cursor-default">
          <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          <span className="text-sm font-semibold text-purple-700">Travel Library</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent mb-6 leading-tight hover:from-purple-800 hover:via-purple-600 hover:to-indigo-600 transition-all duration-500 cursor-default">
          More from our travel library
        </h2>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          Discover more amazing content to help you plan the perfect trip.
        </p>
      </div>

      {/* Links Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {linksToShow.slice(0, 6).map((link, index) => (
          <CompactCard key={`link-${index}`} link={link} index={index} />
        ))}
      </div>

      {/* CTA Section */}
      <div className="relative z-10 text-center">
        <div className="inline-block">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Discover More Travel Inspiration
          </h3>
          <p className="text-gray-600 mb-8">
            Browse our complete collection of destination guides and travel tips
          </p>
          
          <Link href="/blog" className="group">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <span>Explore All Guides</span>
              <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors duration-300">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}