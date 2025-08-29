'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface HotelCarouselNewProps {
  title?: string
  description?: string
  destination?: string
  hotels?: Array<{
    name: string
    image: string
    rating: number
    reviews: number
    category?: string
    location?: string
    amenities?: string[]
    description?: string
    originalPrice?: number
    pricePerNight: number
  }>
}

export function HotelCarouselNew({ 
  title = "Luxe lifestyle hotspots according to your zodiac",
  description = "Top hotels offering luxury amenities",
  destination = "the area",
  hotels: providedHotels
}: HotelCarouselNewProps) {
  
  const [currentIndex, setCurrentIndex] = useState(0)

  // Debug: Log what data we're receiving
  console.log('HotelCarouselNew received data:', {
    title,
    description,
    destination,
    providedHotels: providedHotels?.length || 0,
    firstHotel: providedHotels?.[0]
  })

  // Create 6-7 dummy hotels for CMS management
  const defaultHotels = [
    {
      id: 1,
      name: "Palm Mountain Resort and Spa",
      description: "Luxury mountain resort with world-class spa facilities and panoramic views",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3",
      rating: 7.0,
      reviews: 90,
      price: "€320-480",
      amenities: ["Swimming Pool", "Gym", "Sunbathing"],
      location: "Mountain Resort Area",
      category: "Resort"
    },
    {
      id: 2,
      name: "Ubud Nyuh Bali Resort & Spa",
      description: "Traditional Balinese resort nestled in tropical gardens with infinity pool",
      image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3",
      rating: 7.0,
      reviews: 90,
      price: "€180-280",
      amenities: ["Swimming Pool", "Gym", "Sunbathing"],
      location: "Ubud, Bali",
      category: "Resort"
    },
    {
      id: 3,
      name: "Terma Linca Resort & Spa",
      description: "Luxury thermal spa resort in the heart of pristine nature",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 7.0,
      reviews: 90,
      price: "€250-380",
      amenities: ["Swimming Pool", "Gym", "Sunbathing"],
      location: "Thermal Springs",
      category: "Resort"
    },
    {
      id: 4,
      name: "Ocean Vista Beach Hotel",
      description: "Beachfront luxury hotel with private beach access and sunset views",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 7.2,
      reviews: 124,
      price: "€400-650",
      amenities: ["Private Beach", "Water Sports", "Spa"],
      location: "Beachfront",
      category: "Beach Resort"
    },
    {
      id: 5,
      name: "Alpine Wellness Retreat",
      description: "Mountain retreat focused on wellness and sustainable luxury",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 6.8,
      reviews: 76,
      price: "€290-420",
      amenities: ["Wellness Center", "Hiking", "Organic Food"],
      location: "Alpine Region",
      category: "Wellness Resort"
    },
    {
      id: 6,
      name: "City Garden Boutique Hotel",
      description: "Urban oasis with rooftop garden and contemporary design in city center",
      image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      rating: 7.5,
      reviews: 156,
      price: "€160-240",
      amenities: ["Rooftop Garden", "City Views", "Business Center"],
      location: "City Center",
      category: "Boutique Hotel"
    }
  ]

  // Use provided hotels data if available, otherwise fallback to defaults
  const hotels = providedHotels && providedHotels.length > 0 
    ? providedHotels.map((hotel, index) => ({
        id: index + 1,
        name: hotel.name,
        description: hotel.description || "Beautiful accommodation",
        image: hotel.image,
        rating: hotel.rating,
        reviews: hotel.reviews || 90,
        price: hotel.pricePerNight ? `€${hotel.pricePerNight}` : '€200',
        amenities: hotel.amenities || ["Swimming Pool", "Gym", "Sunbathing"],
        location: hotel.location || "City Center",
        category: hotel.category || "Resort"
      }))
    : defaultHotels

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, hotels.length - 2))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, hotels.length - 2)) % Math.max(1, hotels.length - 2))
  }

  return (
    <section className="w-full max-w-[861px] mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="mb-8 relative">
        <h2 className="text-[22px] font-bold text-black mb-2 leading-tight font-[Poppins] tracking-[-0.22px]">
          {title}
        </h2>
        <p className="text-[18px] text-[#797882] font-normal font-[Poppins]">
          {description}
        </p>
        
        {/* Navigation arrows */}
        <div className="absolute top-[30px] right-0 flex gap-2">
          <button
            onClick={prevSlide}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Hotel Cards - Show 2.5 cards with scroll */}
      <div className="relative">
        <div className="overflow-hidden w-[754px]"> {/* Width to show exactly 2.5 cards: 367 + 20 + 367 = 754px */}
          <div 
            className="flex gap-5 transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (367 + 20)}px)` // 367px card width + 20px gap
            }}
          >
            {hotels.map((hotel, index) => (
              <div key={hotel.id} className="w-[367px] flex-shrink-0">
                <Card className="overflow-hidden bg-white rounded-[20px] shadow-[0px_10px_32px_-4px_rgba(24,39,75,0.1),0px_6px_14px_-6px_rgba(24,39,75,0.12)] h-[394px]">
                  {/* Image Section with rounded top corners */}
                  <div className="relative h-[210px] overflow-hidden rounded-t-[20px]">
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Top badges - Purple and Green */}
                    <div className="absolute top-[20px] right-[20px] flex flex-col gap-[5px]">
                      <div className="bg-[#4C35BC] text-white text-[10px] px-2 py-1 rounded-[18px] font-medium flex items-center gap-1 leading-[15px]">
                        <span>🍳</span>
                        <span>Breakfast included</span>
                      </div>
                      <div className="bg-[#2B8A4B] text-white text-[10px] px-2 py-1 rounded-[18px] font-medium flex items-center gap-1 leading-[15px]">
                        <span>✓</span>
                        <span>Free Cancellation</span>
                      </div>
                    </div>

                    {/* Amenity icons - bottom right with glassmorphism background */}
                    <div className="absolute bottom-[20px] right-[20px]">
                      <div className="flex gap-[5px] bg-[rgba(196,196,196,0.1)] backdrop-blur-[15px] rounded-[30px] p-[5px] shadow-[inset_-7.7px_7.7px_7.7px_0px_rgba(255,255,255,0.1),inset_7.7px_-7.7px_7.7px_0px_rgba(149,149,149,0.1)]">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-gray-700 text-xs">🏔️</span>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-gray-700 text-xs">🏠</span>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-gray-700 text-xs">🅿️</span>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-gray-700 text-xs">🐕</span>
                        </div>
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                          <span className="text-gray-700 text-xs">♿</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating badge - bottom left */}
                    <div className="absolute bottom-[20px] left-[20px] bg-white rounded-[10px] px-[10px] py-[10px] shadow-md min-w-[127px] h-[45px] flex items-center gap-[10px]">
                      <div className="bg-white rounded-[10px] px-[10px] py-[10px] flex items-center justify-center min-w-[46px]">
                        <span className="text-[#242526] font-[Poppins] font-semibold text-base leading-6">
                          {hotel.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[#242526] font-[Poppins] font-semibold text-base leading-6">
                          Good
                        </div>
                        <div className="text-[#242526] font-[Poppins] font-normal text-sm leading-[21px]">
                          {hotel.reviews} reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-[20px]">
                    {/* Hotel Name */}
                    <h3 className="text-[#242526] font-[Poppins] font-semibold text-[18px] leading-[21.6px] mb-[10px]">
                      {hotel.name}
                    </h3>

                    {/* Category and Stars */}
                    <div className="flex items-center gap-[10px] mb-[10px]">
                      <div className="border border-[#64748B] border-opacity-30 rounded-[5px] px-[10px] py-[1px] flex items-center gap-[5px]">
                        <span className="text-[#000] font-[Poppins] font-normal text-sm leading-[21px]">
                          {hotel.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-[5px] rounded-[5px]">
                        <span className="text-[#FFD700]">⭐⭐⭐⭐</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 mb-[10px] text-[#000] font-[Poppins] font-normal text-sm leading-[21px]">
                      <MapPin className="w-[8.59px] h-[12.5px] text-black" />
                      <span>1.2 km from center</span>
                      <span className="w-[0.62px] h-[12.64px] text-black">|</span>
                      <span className="font-semibold">Neighborhood</span>
                    </div>

                    {/* Amenity tags */}
                    <div className="flex flex-wrap gap-[5px] mb-[32px]">
                      {hotel.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                        <div key={amenityIndex} className="bg-[#FDE9E0] rounded-[18px] px-2 py-1 flex items-center justify-center gap-[5px]">
                          <span className="text-[#242526] font-[Poppins] font-normal text-[10px] leading-[15px] text-center">
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Check availability button - always show on first 2 cards */}
                    {(index === currentIndex || index === currentIndex + 1) && (
                      <div className="flex justify-center">
                        <Link href="https://cuddlynest.com" target="_blank" rel="noopener noreferrer">
                          <div className="bg-gradient-to-r from-[#F35597] to-[#7868C7] hover:opacity-90 rounded-[30px] px-[30px] py-[10px] flex items-center justify-center gap-[10px] min-w-[161px] h-[30px]">
                            <span className="text-white font-[Poppins] font-semibold text-xs leading-[18px] text-center">
                              Check availability
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlay on partial third card to show it's cut off */}
        <div className="absolute top-0 right-0 w-[100px] h-full bg-gradient-to-l from-white via-white/60 to-transparent pointer-events-none z-10" />
      </div>
    </section>
  )
}