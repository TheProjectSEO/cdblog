'use client'

import { Clock, DollarSign, Globe, Calendar, Users, MapPin } from 'lucide-react'

interface StarterPackData {
  destination: string
  bestTime: string
  duration: string
  budget: string
  currency: string
  language: string
  timezone: string
  highlights: string[]
}

interface StarterPackSectionProps {
  data: StarterPackData
}

export function StarterPackSection({ data }: StarterPackSectionProps) {
  const {
    destination,
    bestTime,
    duration,
    budget,
    currency,
    language,
    timezone,
    highlights
  } = data

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {destination} Travel Essentials
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know at a glance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Best Time to Visit */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Best Time</h3>
              </div>
              <p className="text-gray-700 font-medium">{bestTime}</p>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Duration</h3>
              </div>
              <p className="text-gray-700 font-medium">{duration}</p>
            </div>

            {/* Budget */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
              </div>
              <p className="text-gray-700 font-medium">{budget}</p>
              <p className="text-sm text-gray-500">Currency: {currency}</p>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Language</h3>
              </div>
              <p className="text-gray-700 font-medium">{language}</p>
            </div>

            {/* Timezone */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Timezone</h3>
              </div>
              <p className="text-gray-700 font-medium">{timezone}</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Destination</h3>
              </div>
              <p className="text-gray-700 font-medium">{destination}</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-xl p-8 shadow-lg border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Top Highlights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-800 font-medium">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}