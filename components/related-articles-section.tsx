'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface RelatedArticle {
  id?: string | number
  title: string
  description: string
  url: string
  imageUrl?: string
  category?: string
}

interface RelatedArticlesSectionData {
  title?: string
  articles: RelatedArticle[]
}

interface RelatedArticlesSectionProps {
  data: RelatedArticlesSectionData
}

export function RelatedArticlesSection({ data }: RelatedArticlesSectionProps) {
  const { title = "Related Articles", articles } = data

  // Default articles if none provided
  const defaultArticles = [
    {
      id: 1,
      title: "Austria vs Germany: Which Offers Better Value Skiing?",
      description: "A detailed comparison of costs, ski areas, and experiences...",
      url: "/blog/austria-vs-germany-skiing",
      imageUrl: "/images/skiing-austria.jpg",
      category: "Skiing"
    },
    {
      id: 2,
      title: "Top 10 Family Ski Resorts in Europe Under €100/Day",
      description: "Budget-friendly destinations perfect for families with kids...",
      url: "/blog/family-ski-resorts-europe",
      imageUrl: "/images/family-skiing.jpg",
      category: "Family Travel"
    },
    {
      id: 3,
      title: "Ski Equipment in Germany: Rent vs Buy Guide 2024",
      description: "Complete cost analysis and where to find the best deals...",
      url: "/blog/ski-equipment-germany-guide",
      imageUrl: "/images/ski-equipment.jpg",
      category: "Equipment"
    }
  ]

  const articlesToShow = articles && articles.length > 0 ? articles.slice(0, 3) : defaultArticles

  const ArticleCard = ({ article }: { article: RelatedArticle }) => {
    return (
      <Link href={article.url} className="block group">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-gray-400 text-sm">No image</div>
              </div>
            )}
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
    )
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
          {articlesToShow.map((article, index) => (
            <ArticleCard key={article.id || index} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}