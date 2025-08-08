'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Star, Sparkles, ArrowLeft, User } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  title?: string
  description?: string
  location?: string
  heroImage?: string
  post?: any
  data?: {
    title?: string
    subtitle?: string
    location?: string
    backgroundImage?: string
    badge?: string
    rating?: string
    highlights?: Array<{
      icon?: string
      text?: string
    }>
    ctaPrimary?: {
      text?: string
      url?: string
    }
    ctaSecondary?: {
      text?: string
      url?: string
    }
  }
}

export function HeroSection({ 
  title,
  description,
  location,
  heroImage,
  post,
  data
}: HeroSectionProps) {
  // Use data props if available, otherwise fall back to direct props
  const finalTitle = data?.title || title || post?.title || "Amazing Destination"
  const finalDescription = data?.subtitle || description || post?.excerpt || "Discover incredible experiences"
  const finalLocation = data?.location || location || "Destination"
  
  // Enhanced customization options
  const badges = data?.badges || {
    main: { text: '🏔️ Your travel adventure starts here', show: true },
    location: { show: true },
    calendar: { text: 'Perfect year-round', show: true },
    users: { text: 'For every traveler', show: true },
    rating: { text: '4.9/5 from travelers', show: true },
    author: { show: true }
  }
  
  const textSizes = data?.textSizes || {
    title: 'responsive',
    subtitle: 'responsive',
    badges: 'sm'
  }
  
  const ctaButtons = data?.ctaButtons || {
    primary: { text: 'Start planning your trip', url: 'https://cuddlynest.com', show: true }
  }
  
  const bottomText = data?.bottomText || {
    text: '🎁 Free to use • No signup required • Personalized just for you',
    show: true
  }
  
  // Helper function to get text size classes
  const getTextSizeClass = (sizeType: string, element: 'title' | 'subtitle' | 'badges') => {
    const size = textSizes[element] || 'responsive'
    
    switch (element) {
      case 'title':
        switch (size) {
          case 'small': return 'text-3xl sm:text-4xl md:text-5xl'
          case 'medium': return 'text-4xl sm:text-5xl md:text-6xl'
          case 'large': return 'text-5xl sm:text-6xl md:text-7xl'
          case 'xl': return 'text-6xl sm:text-7xl md:text-8xl'
          default: return 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl' // responsive
        }
      case 'subtitle':
        switch (size) {
          case 'small': return 'text-base sm:text-lg'
          case 'medium': return 'text-lg sm:text-xl'
          case 'large': return 'text-xl sm:text-2xl'
          case 'xl': return 'text-2xl sm:text-3xl'
          default: return 'text-lg sm:text-xl md:text-2xl' // responsive
        }
      case 'badges':
        switch (size) {
          case 'xs': return 'text-xs'
          case 'sm': return 'text-sm'
          case 'base': return 'text-base'
          case 'lg': return 'text-lg'
          case 'xl': return 'text-xl'
          default: return 'text-sm'
        }
    }
  }
  
  // Get destination-specific hero image - prioritize database image first
  const getHeroImageForDestination = () => {
    // PRIORITY 1: Use the backgroundImage from database if available
    if (data?.backgroundImage) {
      return data.backgroundImage
    }
    
    // PRIORITY 2: Use passed heroImage prop
    if (heroImage) {
      return heroImage
    }
    
    // PRIORITY 3: Fallback to destination-specific defaults
    const postTitle = post?.title?.toLowerCase() || finalTitle.toLowerCase()
    
    if (postTitle.includes('italian') && postTitle.includes('lakes')) {
      // Beautiful Italian Lakes - Lake Como with villa and crystal clear water
      return "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('como')) {
      return "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('garda')) {
      return "https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('maggiore')) {
      return "https://images.unsplash.com/photo-1580500550469-9ad6b71bef4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('rome')) {
      // Stunning Rome Colosseum panoramic view at golden hour
      return "https://images.unsplash.com/photo-1525874684015-58379d421a52?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('venice')) {  
      // Beautiful Venice Grand Canal with gondolas and historic architecture
      return "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('florence')) {
      // Florence Duomo and city panorama at sunset
      return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    } else if (postTitle.includes('naples') || postTitle.includes('amalfi')) {
      // Stunning Amalfi Coast with vibrant turquoise waters and colorful cliffside villages - Positano view
      return "https://images.unsplash.com/photo-1594736797933-d0ca881b3011?q=80&w=2940&auto=format&fit=crop"
    } else if (postTitle.includes('rotterdam')) {
      // Rotterdam nightlife with vibrant skyline image
      return "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    }
    
    // PRIORITY 4: Final fallback
    return "/placeholder.svg?height=800&width=1200"
  }
  
  const finalImage = getHeroImageForDestination()
  
  // Legacy fallback support for old data structure
  const mainBadgeText = badges?.main?.text || data?.badge || (finalTitle.includes('Italienische') ? "🏔️ Ihr Reiseabenteuer beginnt hier" : "🏔️ Your travel adventure starts here")
  const ratingText = badges?.rating?.text || data?.rating || (finalTitle.includes('Italienische') ? "4,9/5 von Reisenden" : "4.9/5 from travelers")
  const calendarText = badges?.calendar?.text || (finalTitle.includes('Italienische') ? "Perfekt das ganze Jahr" : "Perfect year-round")
  const usersText = badges?.users?.text || (finalTitle.includes('Italienische') ? "Für jeden Reisenden" : "For every traveler")
  const authorName = post?.author?.display_name || "CuddlyNest Travel Team"

  return (
    <section 
      className="relative overflow-hidden"
      style={{
        width: '100vw',
        height: '85vh',
        minHeight: '600px',
        maxHeight: '750px',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw'
      }}
    >
      {/* Full-width hero image background */}
      <div className="absolute inset-0 z-0">
        <img
          src={finalImage}
          alt={`Beautiful ${finalLocation} landscape`}
          className="w-full h-full object-cover object-center"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
        {/* Enhanced gradient overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </div>

      {/* Back to Blog Button - Top Left */}
      {/* 
      <div className="absolute top-6 left-6 z-30">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-200 rounded-full px-4 py-2 text-sm font-medium border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
      */}

      {/* Main content container - centered with max-width constraint */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl text-white">
            {/* Main badge - conditional rendering */}
            {badges?.main?.show && (
              <div className="mb-6">
                <Badge className={`bg-brand-pink/90 backdrop-blur-md text-brand-deep-purple border-0 font-medium px-4 py-2 shadow-lg cursor-default hover:bg-brand-pink/90 hover:text-brand-deep-purple ${getTextSizeClass('', 'badges')}`}>
                  {mainBadgeText}
                </Badge>
              </div>
            )}

            {/* Hero Title - dynamic sizing */}
            <h1 className={`${getTextSizeClass('', 'title')} font-bold mb-6 leading-tight font-sans`}>
              {finalTitle.split(' ').slice(0, -2).join(' ')}
              <span className="bg-gradient-to-r from-brand-pink to-white bg-clip-text text-transparent">
                {' ' + finalTitle.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            {/* Hero Description - dynamic sizing */}
            <p className={`${getTextSizeClass('', 'subtitle')} mb-8 text-gray-200 max-w-3xl font-light leading-relaxed`}>
              {finalDescription}
            </p>

            
            {/* Badges container - aligned with CTA section */}
            <div className={`flex items-center gap-2 sm:gap-3 mb-8 overflow-x-auto scrollbar-hide ${getTextSizeClass('', 'badges')}`} style={{ scrollBehavior: 'smooth' }}>
              {badges?.location?.show && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white font-medium whitespace-nowrap">{finalLocation}</span>
                </div>
              )}
              {badges?.calendar?.show && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-white font-medium whitespace-nowrap">{calendarText}</span>
                </div>
              )}
              {badges?.users?.show && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                  <span className="text-white font-medium whitespace-nowrap">{usersText}</span>
                </div>
              )}
              {badges?.rating?.show && (
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium whitespace-nowrap">{ratingText}</span>
                </div>
              )}
              {/* Author badge - moved to top row and made clickable */}
              {badges?.author?.show && (
                <button
                  onClick={() => {
                    const authorSection = document.getElementById('author-section');
                    if (authorSection) {
                      authorSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg hover:bg-white/25 transition-all duration-200 cursor-pointer transform hover:scale-105 flex-shrink-0`}
                >
                  <User className="w-4 h-4 text-white" />
                  <span className="text-white font-medium whitespace-nowrap">{authorName}</span>
                </button>
              )}
            </div>

            {/* CTA Buttons - only primary button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              {ctaButtons?.primary?.show && (
                <Link 
                  href={ctaButtons.primary.url || 'https://cuddlynest.com'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-brand-purple hover:bg-brand-deep-purple text-white text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {ctaButtons.primary.text}
                  </Button>
                </Link>
              )}
            </div>

            {/* Bottom info text - conditional rendering */}
            {bottomText?.show && (
              <div className="mt-8">
                <p className="text-sm text-white/80 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 inline-block border border-white/10">
                  {bottomText.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator removed to eliminate pink line */}
    </section>
  )
}