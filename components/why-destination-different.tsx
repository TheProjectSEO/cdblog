'use client'

import { Sparkles, Star } from 'lucide-react'

interface Reason {
  title: string
  description: string
}

interface WhyDestinationDifferentData {
  title: string
  subtitle: string
  reasons: Reason[]
}

interface WhyDestinationDifferentProps {
  data: WhyDestinationDifferentData
}

export function WhyDestinationDifferent({ data }: WhyDestinationDifferentProps) {
  const { title, subtitle, reasons } = data

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-purple-600 rounded-full p-3">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(reasons || []).map((reason, index) => (
              <div 
                key={index}
                className="group bg-white rounded-xl p-8 shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-purple-100 rounded-lg p-2 mr-4 group-hover:bg-purple-200 transition-colors duration-300">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative Element */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-md border border-purple-100">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-gray-700 font-medium">A truly unique destination</span>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}