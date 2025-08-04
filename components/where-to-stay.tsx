'use client'

import { MapPin, Check, X, Users } from 'lucide-react'

interface Neighborhood {
  name: string
  description: string
  pros: string[]
  cons: string[]
  bestFor: string
}

interface WhereToStayData {
  title: string
  subtitle?: string
  description?: string
  neighborhoods?: Neighborhood[]
  hotels?: any[] // Fallback for hotel data
}

interface WhereToStayProps {
  data: WhereToStayData
}

export function WhereToStay({ data }: WhereToStayProps) {
  const { title, subtitle, description, neighborhoods, hotels } = data
  
  // If we have hotels data instead of neighborhoods, redirect to hotel carousel component
  if (hotels && !neighborhoods) {
    // For now, show a fallback message
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600">
              Hotel information is available in the accommodations section.
            </p>
          </div>
        </div>
      </section>
    )
  }
  
  // If no neighborhoods data, show fallback
  if (!neighborhoods || neighborhoods.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title || "Where to Stay"}
            </h2>
            <p className="text-lg text-gray-600">
              Neighborhood information is being updated.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            <p className="text-lg text-gray-600">
              {subtitle || description || "Choose the perfect neighborhood for your stay"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {neighborhoods.map((neighborhood, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <h3 className="text-xl font-bold">{neighborhood.name}</h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    {neighborhood.description}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Pros */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                      Pros
                    </h4>
                    <div className="space-y-2">
                      {(neighborhood.pros || []).map((pro, proIndex) => (
                        <div key={proIndex} className="flex items-start">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cons */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                      Cons
                    </h4>
                    <div className="space-y-2">
                      {(neighborhood.cons || []).map((con, conIndex) => (
                        <div key={conIndex} className="flex items-start">
                          <X className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 text-blue-600 mr-2" />
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Best For
                      </h4>
                    </div>
                    <p className="text-gray-700 text-sm font-medium">
                      {neighborhood.bestFor}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Tips */}
          <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start">
              <div className="bg-blue-600 rounded-full p-1 mr-4 mt-1">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Choosing Your Perfect Location
                </h4>
                <p className="text-gray-700">
                  Consider your priorities: proximity to attractions, budget, nightlife preferences, 
                  and whether you want an authentic local experience or tourist convenience. 
                  Book accommodations early, especially during peak season.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}