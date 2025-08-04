import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Star, Sparkles } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  title?: string
  description?: string
  location?: string
  heroImage?: string
}

export function HeroSection({ 
  title = "Paris like you've never seen",
  description = "Your smartest AI-powered travel companion finds stays, flights, and attractions you'd love - all in just 2 clicks.",
  location = "Paris, France",
  heroImage = "/placeholder.svg?height=800&width=1200"
}: HeroSectionProps) {
  return (
    <section className="relative h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={`Beautiful ${location} cityscape`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl text-white">
          <Badge className="mb-6 bg-brand-pink text-brand-deep-purple border-0 text-sm font-medium">
            ✨ Meet your AI travel planner
          </Badge>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight font-sans">
            {title.split(' ').slice(0, -2).join(' ')}
            <span className="bg-gradient-to-r from-brand-pink to-white bg-clip-text text-transparent"> {title.split(' ').slice(-2).join(' ')}</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl font-light">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Calendar className="w-4 h-4" />
              <span>Perfect year-round</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-4 h-4" />
              <span>For every traveler</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>4.9/5 from travelers</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="https://cuddlynest.com" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-brand-purple hover:bg-brand-deep-purple text-white text-lg px-8 py-4 rounded-full font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start planning your trip
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-brand-deep-purple text-lg px-8 py-4 rounded-full bg-transparent font-semibold"
            >
              Explore Paris guide
            </Button>
          </div>

          <p className="text-sm text-gray-300 mt-4">🎁 Free to use • No signup required • Personalized just for you</p>
        </div>
      </div>
    </section>
  )
}
