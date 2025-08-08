import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search, BookOpen, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { LogoImage } from "@/components/LogoImage"
import { supabase } from '@/lib/supabase'

async function getHomepageSettings() {
  try {
    const { data, error } = await supabase
      .from('homepage_settings')
      .select('key, value')

    if (error) throw error

    const settings: any = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    return {
      hero_title: settings.hero_title || { text: "Travel like you've never traveled", highlight: "never traveled" },
      hero_subtitle: settings.hero_subtitle || { text: "Discover amazing destinations with our curated collection of 1565+ travel guides, hidden gems, and insider experiences." },
      hero_badge: settings.hero_badge || { text: "✨ Your AI-powered travel companion" },
      hero_background: settings.hero_background || { url: "/placeholder.svg?height=800&width=1200", alt: "Beautiful travel destinations" },
      logo_url: settings.logo_url || { url: "/cuddlynest-logo.png", alt: "CuddlyNest" },
      blog_logo_url: settings.blog_logo_url || { url: "/cuddlynest-logo-pink.png", alt: "CuddlyNest" },
      stats: settings.stats || { guides: "1565+", destinations: "200+", for_text: "For every traveler" },
      featured_posts: settings.featured_posts || { post_ids: [] }
    }
  } catch (error) {
    console.error('Error loading homepage settings:', error)
    // Return defaults if database fails
    return {
      hero_title: { text: "Travel like you've never traveled", highlight: "never traveled" },
      hero_subtitle: { text: "Discover amazing destinations with our curated collection of 1565+ travel guides, hidden gems, and insider experiences." },
      hero_badge: { text: "✨ Your AI-powered travel companion" },
      hero_background: { url: "/placeholder.svg?height=800&width=1200", alt: "Beautiful travel destinations" },
      logo_url: { url: "/cuddlynest-logo.png", alt: "CuddlyNest" },
      blog_logo_url: { url: "/cuddlynest-logo-pink.png", alt: "CuddlyNest" },
      stats: { guides: "1565+", destinations: "200+", for_text: "For every traveler" },
      featured_posts: { post_ids: [] }
    }
  }
}

export default async function HomePage() {
  const settings = await getHomepageSettings()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <LogoImage 
              src={settings.logo_url.url} 
              alt={settings.logo_url.alt}
              className="h-12 object-contain"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.hero_background.url}
            alt={settings.hero_background.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl text-white">
            <Badge className="mb-6 bg-brand-pink text-brand-deep-purple border-0 text-sm font-medium">
              {settings.hero_badge.text}
            </Badge>

            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight font-sans">
              {settings.hero_title.text.replace(settings.hero_title.highlight, '')}
              <span className="bg-gradient-to-r from-brand-pink to-white bg-clip-text text-transparent">{settings.hero_title.highlight}</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl font-light">
              {settings.hero_subtitle.text}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <BookOpen className="w-4 h-4" />
                <span>{settings.stats.guides} Travel Guides</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="w-4 h-4" />
                <span>{settings.stats.destinations} Destinations</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="w-4 h-4" />
                <span>{settings.stats.for_text}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/blog">
                <Button
                  size="lg"
                  className="bg-brand-purple hover:bg-brand-deep-purple text-white text-lg px-8 py-4 rounded-full font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Explore Travel Guides
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-brand-deep-purple text-lg px-8 py-4 rounded-full bg-transparent font-semibold"
              >
                How it works
              </Button>
            </div>

            <p className="text-sm text-gray-300 mt-4">🎁 Free to use • No signup required • Personalized just for you</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CuddlyNest Travel</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your smartest travel companion with AI-powered recommendations and expert-curated content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find exactly what you're looking for across {settings.stats.guides} travel guides with intelligent search.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Guides</h3>
              <p className="text-gray-600">
                Curated by travel experts and locals who know the real hidden gems and insider secrets.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your preferences and travel style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to explore the world?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Start your journey with our comprehensive travel guides and discover your next adventure.
          </p>
          <Link href="/blog">
            <Button
              size="lg"
              className="bg-white text-brand-purple hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse All Guides
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
