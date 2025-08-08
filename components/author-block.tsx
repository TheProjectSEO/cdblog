import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Clock } from "lucide-react"

interface AuthorBlockProps {
  name?: string
  title?: string
  bio?: string
  avatar?: string
  countriesExplored?: string
  expertSince?: string
  followers?: string
  badges?: string[]
  publishedDate?: string
  updatedDate?: string
}

export function AuthorBlock({ 
  name = "Sarah Johnson",
  title = "Travel Expert",
  bio = "Your friendly neighborhood travel obsessive who's been exploring the world for 10+ years. I'm all about finding those hidden gems and sharing the real tea on destinations - no sugar-coating, just honest vibes.",
  avatar = "/placeholder.svg",
  countriesExplored = "50+ countries explored",
  expertSince = "Expert since 2014",
  followers = "1M+ fellow travelers",
  badges = ["Adventure seeker", "Food lover", "Culture enthusiast"],
  publishedDate = "March 15, 2025",
  updatedDate = "March 20, 2025"
}: AuthorBlockProps) {
  return (
    <section id="author-section" className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <Avatar className="w-24 h-24 ring-4 ring-brand-lavender">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-brand-purple text-white text-2xl font-bold">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{name}</h3>
            <Badge className="bg-brand-pink text-brand-deep-purple border-0">✨ {title}</Badge>
          </div>

          <p className="text-gray-600 mb-4 font-light">
            {bio}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2 bg-brand-lavender rounded-full px-3 py-1">
              <MapPin className="w-4 h-4" />
              <span>{countriesExplored}</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-lavender rounded-full px-3 py-1">
              <Calendar className="w-4 h-4" />
              <span>{expertSince}</span>
            </div>
            <div className="flex items-center gap-2 bg-brand-lavender rounded-full px-3 py-1">
              <Users className="w-4 h-4" />
              <span>{followers}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Published: {new Date(publishedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Updated: {new Date(updatedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {badges.map((badge, index) => (
              <Badge key={index} variant="outline" className="border-brand-purple text-brand-purple">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
