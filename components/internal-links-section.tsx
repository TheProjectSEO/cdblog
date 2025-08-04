'use client'

import { ExternalLink, ArrowRight, MapPin, Globe } from 'lucide-react'
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

  const CompactCard = ({ link, icon: Icon }: { link: InternalLink; icon: any }) => (
    <Link 
      href={link.url}
      className="group block bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5 h-20 flex items-center justify-center"
    >
      <div className="text-center">
        <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
          {link.title}
        </h3>
      </div>
    </Link>
  )

  return (
    <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-sans">
              More from our travel library
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
              Discover more amazing content to help you plan the perfect trip.
            </p>
          </div>

          {/* Clean, simple grid layout like InternalLinking component */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {linksToShow.slice(0, 8).map((link, index) => (
              <CompactCard key={`link-${index}`} link={link} icon={MapPin} />
            ))}
          </div>

          {/* Simplified Call to Action */}
          <div className="mt-10 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Discover More Travel Inspiration
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Browse our complete collection of destination guides and travel tips
              </p>
              <Link 
                href="/blog"
                className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                Explore All Guides
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}