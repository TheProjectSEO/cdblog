'use client'

import { 
  Banknote, 
  Users, 
  Train, 
  Beer, 
  Star, 
  MapPin, 
  Shield, 
  Clock,
  Heart,
  Compass,
  Award,
  Target
} from "lucide-react"

interface WhyChooseItem {
  id: string
  title: string
  description: string
  icon: string
  iconColor?: string
}

interface WhyChooseSectionProps {
  data?: {
    title?: string
    subtitle?: string
    items?: WhyChooseItem[]
    columns?: 2 | 3 | 4
    showTitle?: boolean
    showSubtitle?: boolean
  }
}

export function WhyChooseSection({ data }: WhyChooseSectionProps) {
  // Default settings
  const title = data?.title || "Why Choose This Destination?"
  const subtitle = data?.subtitle || "Discover what makes this place special for travelers like you"
  const columns = data?.columns || 2
  const showTitle = data?.showTitle !== false
  const showSubtitle = data?.showSubtitle !== false

  // Icon mapping
  const iconMap: Record<string, any> = {
    'banknote': Banknote,
    'users': Users,
    'train': Train,
    'beer': Beer,
    'star': Star,
    'mappin': MapPin,
    'shield': Shield,
    'clock': Clock,
    'heart': Heart,
    'compass': Compass,
    'award': Award,
    'target': Target
  }

  // Default items (can be overridden from CMS)
  const defaultItems: WhyChooseItem[] = [
    {
      id: "value",
      title: "Outstanding Value",
      description: "Experience more for less with prices 30-40% lower than premium destinations. Great value without compromising on quality.",
      icon: "banknote",
      iconColor: "text-emerald-600"
    },
    {
      id: "family",
      title: "Family-Friendly",
      description: "Perfect for travelers of all ages with excellent facilities, safe environments, and activities for everyone.",
      icon: "users",
      iconColor: "text-blue-600"
    },
    {
      id: "access",
      title: "Easy Access",
      description: "Conveniently located with excellent transport connections. Most destinations are easily reachable by train or car.",
      icon: "train",
      iconColor: "text-amber-600"
    },
    {
      id: "culture",
      title: "Authentic Experience",
      description: "Immerse yourself in local culture, traditions, and authentic experiences that create lasting memories.",
      icon: "heart",
      iconColor: "text-purple-600"
    }
  ]

  const items = data?.items && data.items.length > 0 ? data.items : defaultItems

  // Grid classes based on columns - Force 2 columns for comparison section
  const gridClasses = {
    2: 'grid-cols-2',  // Always 2 columns instead of responsive
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className="mb-12">
      {showTitle && (
        <h2 className="text-3xl font-semibold mt-12 mb-6">{title}</h2>
      )}
      
      {showSubtitle && subtitle && (
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">{subtitle}</p>
      )}
      
      <div className={`not-prose !grid ${gridClasses[columns]} !gap-6 !mb-8`} style={{ display: 'grid' }}>
        {items.map((item) => {
          const IconComponent = iconMap[item.icon] || Star
          const iconColorClass = item.iconColor || "text-blue-600"
          
          return (
            <div key={item.id} className="!bg-gray-50 !rounded-xl !p-6 !block !my-0" style={{ display: 'block', margin: '0' }}>
              <h3 className="!text-lg !font-semibold !mb-3 !flex !items-center !gap-2 !my-0" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0' }}>
                <IconComponent className={`w-5 h-5 ${iconColorClass}`} />
                {item.title}
              </h3>
              <p className="!text-gray-600 !my-0" style={{ margin: '0' }}>{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}