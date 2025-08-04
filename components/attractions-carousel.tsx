import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Heart } from "lucide-react"

export function AttractionsCarousel() {
  const attractions = [
    {
      id: 1,
      name: "Eiffel Tower Skip-the-Line Tour",
      subtitle: "Instant confirmation",
      rating: 4.7,
      reviews: 5432,
      bookings: "100K+",
      price: 89.99,
      originalPrice: 120.0,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Colosseum Underground Experience",
      subtitle: "Instant confirmation",
      rating: 4.8,
      reviews: 3876,
      bookings: "75K+",
      price: 125.5,
      originalPrice: 150.0,
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Machu Picchu Sunrise Adventure",
      subtitle: "Instant confirmation",
      rating: 4.9,
      reviews: 2341,
      bookings: "25K+",
      price: 280.0,
      originalPrice: 320.0,
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <section className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 font-sans">Experiences worth your time</h2>
          <p className="text-gray-600 font-light">Skip the tourist traps, find the real gems</p>
        </div>
        <Button
          variant="outline"
          className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white rounded-full px-6 font-semibold bg-transparent"
        >
          Explore all tours
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {attractions.map((attraction) => (
          <Card
            key={attraction.id}
            className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 rounded-2xl"
          >
            <div className="relative">
              <img
                src={attraction.image || "/placeholder.svg"}
                alt={attraction.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm">
                <Heart className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">{attraction.name}</h3>
              <p className="text-gray-500 mb-4 font-light">{attraction.subtitle}</p>
              <div className="flex items-center mb-6">
                <Star className="w-4 h-4 text-brand-purple fill-current" />
                <span className="ml-2 font-semibold">{attraction.rating}</span>
                <span className="text-gray-500 ml-1 text-sm font-light">
                  ({attraction.reviews.toLocaleString()}) • {attraction.bookings} booked
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600 font-light">From</span>
                    <span className="text-xl font-bold text-gray-900">US$ {attraction.price}</span>
                    <span className="text-sm text-gray-400 line-through">US$ {attraction.originalPrice}</span>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-brand-purple hover:bg-brand-deep-purple text-white rounded-full font-semibold">
                Book now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
