'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, DollarSign, Users } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"

interface ThingsToDoCardsProps {
  destination?: string
  title?: string
  description?: string
  activities?: Array<{
    id?: number | string
    title: string
    description: string
    image: string
    category?: string
    rating?: number
    reviews?: number
    duration?: string
    price?: string
    difficulty?: string
    highlights?: string[]
  }>
}

export function ThingsToDoCards({ destination = '', title: customTitle, description: customDescription, activities: providedActivities }: ThingsToDoCardsProps) {
  
  // Get activities based on destination 
  const getActivitiesForDestination = (dest: string) => {
    const postTitle = dest.toLowerCase()
    
    if (postTitle.includes('italian') && postTitle.includes('lakes')) {
      return [
        {
          id: 1,
          title: "Lake Como Villa Tours",
          description: "Explore George Clooney's neighborhood and stunning lakeside villas with expert guides",
          image: "https://images.unsplash.com/photo-1530841344095-7b1d18c64bae?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Villa Tours",
          rating: 4.9,
          reviews: 1890,
          duration: "3-4 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Villa del Balbianello", "Bellagio gardens", "Expert guide"],
        },
        {
          id: 2,
          title: "Lake Garda Wine Tasting",
          description: "Discover local wines at family vineyards with stunning Alpine lake views",
          image: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=2987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Wine Tasting",
          rating: 4.8,
          reviews: 1450,
          duration: "4-5 hours",
          price: "€75",
          difficulty: "Easy",
          highlights: ["5 local wines", "Vineyard tour", "Lake views"],
        },
        {
          id: 3,
          title: "Boat Tour Three Lakes",
          description: "Full day boat experience across Como, Garda, and Maggiore with lunch",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Boat Tour",
          rating: 4.7,
          reviews: 2100,
          duration: "8 hours",
          price: "€95",
          difficulty: "Easy",
          highlights: ["Three lakes", "Lunch included", "Small groups"],
        },
        {
          id: 4,
          title: "Alpine Hiking Experience",
          description: "Guided hikes around the lakes with breathtaking mountain and water views",
          image: "https://images.unsplash.com/photo-1464822759844-d150ba87d0e8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Hiking",
          rating: 4.6,
          reviews: 980,
          duration: "5-6 hours",
          price: "€55",
          difficulty: "Moderate",
          highlights: ["Alpine trails", "Photo stops", "Local guide"],
        },
        {
          id: 5,
          title: "Luxury Spa & Wellness",
          description: "Rejuvenate at world-class lakeside spas with treatments and lake views",
          image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Wellness",
          rating: 4.8,
          reviews: 1320,
          duration: "3-4 hours",
          price: "€120",
          difficulty: "Easy",
          highlights: ["Lake view spa", "Luxury treatments", "Relaxation"],
        },
        {
          id: 6,
          title: "Italian Cooking Class",
          description: "Learn to cook authentic Italian dishes with lake fish and local ingredients",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=2981&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          category: "Culinary",
          rating: 4.9,
          reviews: 750,
          duration: "4 hours",
          price: "€85",
          difficulty: "Easy",
          highlights: ["Local ingredients", "Professional chef", "Take recipes home"],
        }
      ]
    } else if (postTitle.includes('rome')) {
      return [
        {
          id: 1,
          title: "Colosseum Underground Tour",
          description: "Exclusive access to the underground chambers where gladiators once prepared",
          image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Historical",
          rating: 4.9,
          reviews: 3450,
          duration: "3 hours",
          price: "€85",
          difficulty: "Easy",
          highlights: ["Underground access", "Skip the lines", "Expert guide"],
        },
        {
          id: 2,
          title: "Vatican Museums & Sistine Chapel",
          description: "Small group tour of Vatican treasures with early morning access",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Art & Culture",
          rating: 4.8,
          reviews: 2890,
          duration: "4 hours",
          price: "€95",
          difficulty: "Easy",
          highlights: ["Sistine Chapel", "Small groups", "Early access"],
        },
        {
          id: 3,
          title: "Food Tour in Trastevere",
          description: "Authentic Roman cuisine tour through the charming Trastevere district",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.7,
          reviews: 1650,
          duration: "3.5 hours",
          price: "€75",
          difficulty: "Easy",
          highlights: ["Carbonara & Cacio e Pepe", "Local trattorias", "Wine tasting"],
        },
        {
          id: 4,
          title: "Roman Forum & Palatine Hill",
          description: "Walk where emperors lived and discover the heart of ancient Rome",
          image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Historical",
          rating: 4.6,
          reviews: 2100,
          duration: "2.5 hours",
          price: "€55",
          difficulty: "Moderate",
          highlights: ["Ancient ruins", "Imperial palaces", "City views"],
        },
        {
          id: 5,
          title: "Evening Rome Photography",
          description: "Capture Rome's golden hour beauty at iconic landmarks with a pro photographer",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Photography",
          rating: 4.8,
          reviews: 890,
          duration: "3 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Golden hour", "Pro photographer", "Iconic spots"],
        },
        {
          id: 6,
          title: "Catacombs & Underground Rome",
          description: "Explore the mysterious underground world beneath the Eternal City",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Historical",
          rating: 4.5,
          reviews: 1320,
          duration: "2.5 hours",
          price: "€45",
          difficulty: "Easy",
          highlights: ["Ancient catacombs", "Underground chambers", "Christian history"],
        }
      ]
    } else if (postTitle.includes('venice')) {
      return [
        {
          id: 1,
          title: "Gondola Ride at Sunset",
          description: "Romantic gondola experience through Venice's most picturesque canals",
          image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Romance",
          rating: 4.8,
          reviews: 2450,
          duration: "30 minutes",
          price: "€80",
          difficulty: "Easy",
          highlights: ["Sunset views", "Private gondola", "Serenade option"],
        },
        {
          id: 2,
          title: "Doge's Palace Secret Tour",
          description: "Exclusive access to hidden chambers and the famous Bridge of Sighs",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Historical",
          rating: 4.9,
          reviews: 1890,
          duration: "1.5 hours",
          price: "€70",
          difficulty: "Easy",
          highlights: ["Secret passages", "Bridge of Sighs", "Skip the lines"],
        },
        {
          id: 3,
          title: "Murano Glass Making",
          description: "Watch master craftsmen create beautiful glass art on the island of Murano",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Artisan",
          rating: 4.7,
          reviews: 1650,
          duration: "3 hours",
          price: "€55",
          difficulty: "Easy",
          highlights: ["Live demonstrations", "Island visit", "Take piece home"],
        },
        {
          id: 4,
          title: "St. Mark's Basilica Tour",
          description: "Skip-the-line tour of Venice's most stunning Byzantine cathedral",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Religious",
          rating: 4.6,
          reviews: 2100,
          duration: "1 hour",
          price: "€35",
          difficulty: "Easy",
          highlights: ["Golden mosaics", "Skip the lines", "Audio guide"],
        },
        {
          id: 5,
          title: "Venetian Spritz & Cicchetti",
          description: "Authentic Venetian aperitivo experience with local wines and small plates",
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.8,
          reviews: 1320,
          duration: "2.5 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Spritz cocktails", "Cicchetti tasting", "Local bars"],
        },
        {
          id: 6,
          title: "Venice Photography Walk",
          description: "Discover Venice's most photogenic spots with a professional photographer",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Photography",
          rating: 4.5,
          reviews: 890,
          duration: "3 hours",
          price: "€75",
          difficulty: "Easy",
          highlights: ["Hidden gems", "Photo tips", "Small groups"],
        }
      ]
    } else if (postTitle.includes('florence')) {
      return [
        {
          id: 1,
          title: "Uffizi Gallery Masterpiece Tour",
          description: "Skip-the-line access to see Botticelli, Michelangelo, and Renaissance masters",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Art",
          rating: 4.9,
          reviews: 3200,
          duration: "2.5 hours",
          price: "€85",
          difficulty: "Easy",
          highlights: ["Birth of Venus", "Skip the lines", "Expert guide"],
        },
        {
          id: 2,
          title: "Michelangelo's David & Accademia",
          description: "See the world's most famous sculpture and other Renaissance treasures",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Art",
          rating: 4.8,
          reviews: 2890,
          duration: "1.5 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Michelangelo's David", "Renaissance art", "Audio guide"],
        },
        {
          id: 3,
          title: "Tuscan Cooking Class",
          description: "Learn to make fresh pasta and traditional Tuscan dishes with local chefs",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.7,
          reviews: 1650,
          duration: "4 hours",
          price: "€95",
          difficulty: "Easy",
          highlights: ["Fresh pasta making", "Local market visit", "Wine pairing"],
        },
        {
          id: 4,
          title: "Duomo Dome Climb",
          description: "Climb Brunelleschi's famous dome for breathtaking panoramic city views",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Architecture",
          rating: 4.6,
          reviews: 2100,
          duration: "1.5 hours",
          price: "€55",
          difficulty: "Moderate",
          highlights: ["463 steps", "City panorama", "Renaissance dome"],
        },
        {
          id: 5,
          title: "Chianti Wine Tour",
          description: "Full day in Tuscany's wine country with tastings at family vineyards",
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Wine",
          rating: 4.8,
          reviews: 1320,
          duration: "8 hours",
          price: "€125",
          difficulty: "Easy",
          highlights: ["3 wineries", "Lunch included", "Scenic drive"],
        },
        {
          id: 6,
          title: "Artisan Workshop Tour",
          description: "Meet local craftspeople creating leather goods, jewelry, and traditional crafts",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Artisan",
          rating: 4.5,
          reviews: 890,
          duration: "3 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Meet artisans", "Live demonstrations", "Shopping opportunity"],
        }
      ]
    } else if (postTitle.includes('naples') || postTitle.includes('amalfi')) {
      return [
        {
          id: 1,
          title: "Pompeii Archaeological Tour",
          description: "Walk through the perfectly preserved ancient Roman city with expert guide",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Archaeological",
          rating: 4.9,
          reviews: 4200,
          duration: "3 hours",
          price: "€75",
          difficulty: "Easy",
          highlights: ["Ancient ruins", "Preserved frescoes", "Expert guide"],
        },
        {
          id: 2,
          title: "Amalfi Coast Boat Tour",
          description: "Stunning coastal views from the sea with stops in Positano and Amalfi",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Boat Tour",
          rating: 4.8,
          reviews: 2890,
          duration: "6 hours",
          price: "€95",
          difficulty: "Easy",
          highlights: ["Coastal views", "Positano stop", "Swimming breaks"],
        },
        {
          id: 3,
          title: "Pizza Making in Naples",
          description: "Learn to make authentic Neapolitan pizza from certified pizzaioli masters",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.7,
          reviews: 1650,
          duration: "3 hours",
          price: "€65",
          difficulty: "Easy",
          highlights: ["Wood-fired oven", "Traditional techniques", "Eat your creations"],
        },
        {
          id: 4,
          title: "Mount Vesuvius Hike",
          description: "Hike to the crater of the famous volcano that buried Pompeii",
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Adventure",
          rating: 4.6,
          reviews: 2100,
          duration: "4 hours",
          price: "€55",
          difficulty: "Moderate",
          highlights: ["Crater views", "Volcanic activity", "Bay of Naples panorama"],
        },
        {
          id: 5,
          title: "Limoncello Tasting in Sorrento",
          description: "Visit lemon groves and learn how Italy's favorite liqueur is made",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.8,
          reviews: 1320,
          duration: "2.5 hours",
          price: "€45",
          difficulty: "Easy",
          highlights: ["Lemon grove visit", "Limoncello tasting", "Traditional process"],
        },
        {
          id: 6,
          title: "Ravello Gardens & Music",
          description: "Explore stunning clifftop gardens and enjoy classical music performances",
          image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culture",
          rating: 4.5,
          reviews: 890,
          duration: "3 hours",
          price: "€55",
          difficulty: "Easy",
          highlights: ["Villa Cimbrone", "Music performance", "Infinity terrace"],
        }
      ]
    }
    
    // Rotterdam fallback (only for Rotterdam posts)
    if (postTitle.includes('rotterdam')) {
      return [
        {
          id: 1,
          title: "Rooftop Bar Crawl",
          description: "Experience Rotterdam's best rooftop bars with panoramic city views and craft cocktails",
          image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Rooftop Bars",
          rating: 4.8,
          reviews: 2340,
          duration: "4-5 hours",
          price: "€45",
          difficulty: "Easy",
          highlights: ["5 premium rooftop venues", "Welcome drinks", "Local expert guide"],
        },
        {
          id: 2,
          title: "Underground Club Experience",
          description: "Dive into Rotterdam's legendary techno scene at exclusive underground venues",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Nightclub",
          rating: 4.9,
          reviews: 1890,
          duration: "6-8 hours",
          price: "€35",
          difficulty: "Moderate",
          highlights: ["VIP club access", "Skip-the-line entry", "Meet local DJs"],
        },
        {
          id: 3,
          title: "Canal Night Cruise",
          description: "Romantic evening cruise through Rotterdam's illuminated harbor and canals",
          image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Experience",
          rating: 4.7,
          reviews: 3120,
          duration: "2 hours",
          price: "€28",
          difficulty: "Easy",
          highlights: ["Harbor views", "Welcome drink", "Live commentary"],
        },
        {
          id: 4,
          title: "Craft Beer & Gin Tasting",
          description: "Discover Rotterdam's thriving craft beer scene and artisanal gin distilleries",
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Culinary",
          rating: 4.6,
          reviews: 1650,
          duration: "3 hours",
          price: "€55",
          difficulty: "Easy",
          highlights: ["6 local breweries", "Gin masterclass", "Food pairings"],
        },
        {
          id: 5,
          title: "Live Music Venue Tour",
          description: "Experience Rotterdam's diverse music scene from jazz clubs to indie venues",
          image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Live Music",
          rating: 4.8,
          reviews: 980,
          duration: "4 hours",
          price: "€38",
          difficulty: "Easy",
          highlights: ["3 iconic venues", "Meet local musicians", "Backstage access"],
        },
        {
          id: 6,
          title: "Late Night Food Tour",
          description: "Satisfy midnight cravings with Rotterdam's best late-night eats and street food",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          category: "Food Tour",
          rating: 4.7,
          reviews: 2240,
          duration: "3 hours",
          price: "€42",
          difficulty: "Easy",
          highlights: ["5 food stops", "Local specialties", "Hidden gems"],
        },
      ]
    }
    
    // Generic fallback for unknown destinations
    return [
      {
        id: 1,
        title: "City Walking Tour",
        description: "Discover the highlights and hidden gems of this amazing destination",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Walking Tour",
        rating: 4.7,
        reviews: 1500,
        duration: "3 hours",
        price: "€35",
        difficulty: "Easy",
        highlights: ["Expert local guide", "Historic landmarks", "Photo opportunities"],
      },
      {
        id: 2,
        title: "Cultural Heritage Experience",
        description: "Immerse yourself in the local culture and traditions of this unique destination",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Culture",
        rating: 4.6,
        reviews: 1200,
        duration: "4 hours",
        price: "€55",
        difficulty: "Easy",
        highlights: ["Cultural sites", "Local traditions", "Interactive experience"],
      },
      {
        id: 3,
        title: "Food & Culinary Tour",
        description: "Taste the authentic flavors and culinary specialties of the region",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Culinary",
        rating: 4.8,
        reviews: 1800,
        duration: "3.5 hours",
        price: "€65",
        difficulty: "Easy",
        highlights: ["Local specialties", "Multiple tastings", "Food expert guide"],
      }
    ]
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      // Italian Lakes
      "Villa Tours": "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
      "Wine Tasting": "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
      "Boat Tour": "bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
      "Hiking": "bg-gradient-to-r from-green-600 to-teal-600 text-white",
      "Wellness": "bg-gradient-to-r from-pink-600 to-rose-600 text-white",
      
      // Rome
      "Historical": "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
      "Art & Culture": "bg-gradient-to-r from-purple-600 to-violet-600 text-white",
      "Photography": "bg-gradient-to-r from-slate-600 to-gray-600 text-white",
      
      // Venice
      "Romance": "bg-gradient-to-r from-pink-600 to-red-600 text-white",
      "Artisan": "bg-gradient-to-r from-orange-600 to-amber-600 text-white",
      "Religious": "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
      
      // Florence
      "Art": "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
      "Architecture": "bg-gradient-to-r from-stone-600 to-gray-600 text-white",
      "Wine": "bg-gradient-to-r from-red-600 to-rose-600 text-white",
      
      // Naples & Amalfi
      "Archaeological": "bg-gradient-to-r from-yellow-600 to-orange-600 text-white",
      "Adventure": "bg-gradient-to-r from-emerald-600 to-green-600 text-white",
      "Culture": "bg-gradient-to-r from-violet-600 to-purple-600 text-white",
      
      // Common categories
      "Culinary": "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
      "Experience": "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
      
      // Rotterdam (fallback)
      "Rooftop Bars": "bg-gradient-to-r from-purple-600 to-purple-800 text-white",
      "Nightclub": "bg-gradient-to-r from-pink-600 to-red-600 text-white",
      "Live Music": "bg-gradient-to-r from-orange-600 to-red-600 text-white",
      "Food Tour": "bg-gradient-to-r from-yellow-600 to-orange-600 text-white",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700"
  }

  // Use provided activities data if available, otherwise fallback to generated data
  const activities = providedActivities && providedActivities.length > 0 
    ? providedActivities.map((activity, index) => ({
        id: activity.id || index + 1,
        title: activity.title,
        description: activity.description,
        image: activity.image,
        category: activity.category || "Experience",
        rating: activity.rating || 4.5,
        reviews: activity.reviews || 1000,
        duration: activity.duration || "2-3 hours",
        price: activity.price || "€45",
        difficulty: activity.difficulty || "Easy",
        highlights: activity.highlights || [activity.title.split(' ').slice(0, 2).join(' '), "Professional guide", "Great experience"]
      }))
    : getActivitiesForDestination(destination)
  
  // Get title and description based on destination
  const getTitleAndDescription = () => {
    const postTitle = destination.toLowerCase()
    
    if (postTitle.includes('italian') && postTitle.includes('lakes')) {
      return {
        title: "Italian Lakes Experiences",
        description: "From luxury villa tours to Alpine adventures, discover the magic of Italy's most beautiful lake region"
      }
    } else if (postTitle.includes('rome')) {
      return {
        title: "Rome Must-Do Experiences",
        description: "From ancient wonders to culinary delights, immerse yourself in the Eternal City's timeless magic"
      }
    } else if (postTitle.includes('venice')) {
      return {
        title: "Venice Unique Experiences",
        description: "From romantic gondola rides to artisan workshops, discover the floating city's enchanting secrets"
      }
    } else if (postTitle.includes('florence')) {
      return {
        title: "Florence Renaissance Experiences",
        description: "From world-class art to Tuscan cuisine, explore the cradle of the Renaissance with expert guides"
      }
    } else if (postTitle.includes('naples') || postTitle.includes('amalfi')) {
      return {
        title: "Naples & Amalfi Coast Experiences",
        description: "From ancient Pompeii to dramatic coastlines, discover Southern Italy's most spectacular treasures"
      }
    }
    
    // Rotterdam specific
    if (postTitle.includes('rotterdam')) {
      return {
        title: "Rotterdam Nightlife Experiences",
        description: "From legendary rooftop bars to underground techno clubs, discover Rotterdam's vibrant after-dark scene with our curated experiences"
      }
    }
    
    // Generic fallback for other destinations
    return {
      title: "Things to Do & Experiences",
      description: "Discover the best activities and unique experiences this destination has to offer"
    }
  }
  
  const { title: defaultTitle, description: defaultDescription } = getTitleAndDescription()
  const title = customTitle || defaultTitle
  const description = customDescription || defaultDescription

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">{title}</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
          {description}
        </p>
      </div>

      <Carousel 
        className="w-full"
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {activities.map((activity) => (
            <CarouselItem key={activity.id} className="pl-2 md:pl-4 basis-1/4">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-2xl h-full">
                <div className="relative">
                  <img
                    src={activity.image || "/placeholder.svg"}
                    alt={activity.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-4 left-4 ${getCategoryColor(activity.category)} border-0`}>
                    {activity.category}
                  </Badge>
                </div>

                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">{activity.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 font-light">{activity.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-brand-purple fill-current" />
                      <span className="font-semibold">{activity.rating}</span>
                      <span className="font-light">({activity.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-light">{activity.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-light">{activity.price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 font-light">{activity.difficulty}</span>
                    </div>
                  </div>

                  <div className="mb-4 flex-grow">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {(activity.highlights || []).map((highlight, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-brand-purple rounded-full"></div>
                          <span className="font-light">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="https://cuddlynest.com" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-brand-purple hover:bg-brand-deep-purple text-white rounded-full font-semibold mt-auto">
                      Book experience
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  )
}
