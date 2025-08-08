'use client'

import React from 'react'
import { Clock, DollarSign, Globe, Calendar, Users, MapPin, Camera, Heart, Star, Mountain } from 'lucide-react'

interface StarterPackData {
  badge?: string
  title?: string
  description?: string
  destination?: string
  bestTime?: string
  duration?: string
  budget?: string
  currency?: string
  language?: string
  timezone?: string
  highlights?: Array<{
    icon?: string
    title?: string
    value?: string
    description?: string
  }>
  features?: Array<{
    title?: string
    content?: string
  }>
}

interface StarterPackSectionProps {
  data: StarterPackData
}

export function StarterPackSection({ data }: StarterPackSectionProps) {
  
  // Debug: Log what data we're receiving
  console.log('StarterPackSection received data:', data)
  
  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'clock': return <Clock className="w-8 h-8 text-blue-600" />
      case 'dollar': return <DollarSign className="w-8 h-8 text-green-600" />
      case 'camera': return <Camera className="w-8 h-8 text-purple-600" />
      case 'heart': return <Heart className="w-8 h-8 text-red-500" />
      case 'star': return <Star className="w-8 h-8 text-yellow-500" />
      case 'map': return <MapPin className="w-8 h-8 text-indigo-600" />
      case 'plane': return <span className="text-4xl">✈️</span>
      case 'sun': return <span className="text-4xl">☀️</span>
      case 'mountain': return <Mountain className="w-8 h-8 text-gray-600" />
      case 'beach': return <span className="text-4xl">🏖️</span>
      default: return <Clock className="w-8 h-8 text-blue-600" />
    }
  }
  
  // Provide default data if data is empty or undefined
  const defaultData = {
    badge: '🌊 Your Southern Italy starter pack',
    title: 'Italian Lakes Region Travel Essentials',
    description: 'Everything you need to know at a glance',
    highlights: [
      {
        icon: 'clock',
        title: 'Perfect Duration',
        value: '6-8 days',
        description: 'Coast and culture combined'
      },
      {
        icon: 'dollar', 
        title: 'Budget Range',
        value: '€75-220',
        description: 'Per day, coastal luxury'
      },
      {
        icon: 'camera',
        title: 'Must-See Spots', 
        value: '13+ towns',
        description: 'Dramatic coastal gems'
      },
      {
        icon: 'heart',
        title: 'Vibe Check',
        value: 'Coastal perfection',
        description: 'Where Italy meets the sea'
      }
    ],
    features: [
      {
        title: 'Coastline that redefines beautiful',
        content: 'Cliffs that plunge into turquoise seas, towns that cling to mountainsides like ancient amphitheaters, and views that make your heart skip beats. The Amalfi Coast isn\'t just scenic - it\'s transcendent.'
      },
      {
        title: 'Culture with serious soul',
        content: 'Naples gave the world pizza, Pompeii preserves ancient life, and every village has stories older than nations. This is Italy at its most authentic - passionate, proud, and utterly unforgettable.'
      }
    ]
  }
  
  // Merge provided data with defaults
  const mergedData = {
    ...defaultData,
    ...data,
    highlights: data?.highlights && data.highlights.length > 0 ? data.highlights : defaultData.highlights,
    features: data?.features && data.features.length > 0 ? data.features : defaultData.features
  }

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with badge */}
          <div className="text-center mb-16">
            {mergedData.badge && (
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg transform hover:scale-105 transition-all duration-300">
                {mergedData.badge}
              </div>
            )}
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 leading-tight">
              {mergedData.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {mergedData.description}
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {mergedData.highlights.map((highlight, index) => (
              <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-out hover:bg-white">
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur-sm"></div>
                
                <div className="text-center relative z-10">
                  <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-300">
                      {getIconComponent(highlight.icon || 'clock')}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    {highlight.title || 'Title'}
                  </h3>
                  <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {highlight.value || 'Value'}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {highlight.description || 'Description'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          {mergedData.features && mergedData.features.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/50 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  Top Highlights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {mergedData.features.map((feature, index) => (
                    <div key={index} className="group">
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        {feature.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}