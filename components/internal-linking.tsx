'use client'

import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface RelatedLink {
  id: string | number
  title: string
  description: string
  url: string
}

interface InternalLinkingProps {
  relatedLinks?: RelatedLink[]
  category?: string
  maxLinks?: number
}

export function InternalLinking({ relatedLinks: propLinks, category, maxLinks = 12 }: InternalLinkingProps) {
  const [dynamicLinks, setDynamicLinks] = useState<RelatedLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (propLinks) {
      setLoading(false)
      return
    }
    
    fetchInternalLinks()
  }, [propLinks, category])

  const fetchInternalLinks = async () => {
    try {
      let query = supabase
        .from('internal_links')
        .select('id, title, description, url')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(maxLinks)

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching internal links:', error)
        setDynamicLinks(defaultPages.slice(0, maxLinks))
      } else {
        setDynamicLinks(data || defaultPages.slice(0, maxLinks))
      }
    } catch (error) {
      console.error('Error:', error)
      setDynamicLinks(defaultPages.slice(0, maxLinks))
    } finally {
      setLoading(false)
    }
  }

  const defaultPages = [
    {
      id: 1,
      title: "Ultimate Guide to the Louvre Museum",
      description: "Skip the lines and discover the masterpieces with our insider guide",
      url: "/louvre-guide"
    },
    {
      id: 2,
      title: "Best Cafés in Saint-Germain",
      description: "From traditional bistros to trendy specialty coffee shops",
      url: "/saint-germain-cafes"
    },
    {
      id: 3,
      title: "Hidden Gems: 10 Secret Spots",
      description: "Discover Paris's best-kept secrets locals don't want you to know",
      url: "/hidden-gems"
    },
    {
      id: 4,
      title: "Paris Night Photography Guide",
      description: "Professional tips for capturing the City of Light after dark",
      url: "/night-photography"
    },
    {
      id: 5,
      title: "Eiffel Tower Complete Guide",
      description: "Everything you need to know about visiting Paris's iconic landmark",
      url: "/eiffel-tower-guide"
    },
    {
      id: 6,
      title: "Montmartre Walking Tour",
      description: "Explore the artistic heart of Paris with our detailed walking route",
      url: "/montmartre-tour"
    },
    {
      id: 7,
      title: "Seine River Cruise Tips",
      description: "Make the most of your boat trip along Paris's famous river",
      url: "/seine-cruise-tips"
    },
    {
      id: 8,
      title: "Paris Travel Budget 2024",
      description: "Complete breakdown of costs for your Paris trip",
      url: "/paris-budget"
    },
    {
      id: 9,
      title: "Local Food Tours",
      description: "Taste authentic French cuisine with expert local guides",
      url: "/food-tours"
    },
    {
      id: 10,
      title: "Day Trip Ideas from Paris",
      description: "Amazing destinations within easy reach of the capital",
      url: "/day-trips"
    },
    {
      id: 11,
      title: "Best Photography Spots",
      description: "Instagram-worthy locations for stunning Paris photos",
      url: "/photography-spots"
    },
    {
      id: 12,
      title: "Paris Museum Pass Guide",
      description: "Save money and skip lines with our museum pass strategy",
      url: "/museum-pass"
    }
  ]

  const relatedPages = propLinks || dynamicLinks

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">Related Articles & Guides</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
            Loading recommended content...
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-20 animate-pulse"></div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">Related Articles & Guides</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light">
          {category 
            ? `Discover more ${category.toLowerCase()} content to enhance your travel experience.`
            : "Discover more amazing content to help you plan the perfect trip."
          }
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {relatedPages.slice(0, 8).map((page) => (
          <Link key={page.id} href={page.url} className="block">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group p-4 h-20 flex items-center justify-center">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-center text-sm line-clamp-2 leading-tight">
                {page.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}