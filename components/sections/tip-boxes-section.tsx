'use client'

import { 
  Lightbulb, 
  DollarSign, 
  MapPin, 
  Clock, 
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  Camera,
  Utensils
} from "lucide-react"

interface TipItem {
  id: string
  text: string
  isHighlighted?: boolean
}

interface TipBox {
  id: string
  title: string
  items: TipItem[]
  icon?: string
  backgroundColor?: 'purple' | 'blue' | 'green' | 'amber' | 'red' | 'gray'
  showIcon?: boolean
}

interface TipBoxesSectionProps {
  data?: {
    title?: string
    subtitle?: string
    tipBoxes?: TipBox[]
    showTitle?: boolean
    showSubtitle?: boolean
    layout?: 'single' | 'grid'
  }
}

export function TipBoxesSection({ data }: TipBoxesSectionProps) {
  // Default settings
  const title = data?.title || "Insider Tips & Recommendations"
  const subtitle = data?.subtitle || "Expert advice to make the most of your visit"
  const showTitle = data?.showTitle !== false
  const showSubtitle = data?.showSubtitle !== false
  const layout = data?.layout || 'single'

  // Icon mapping
  const iconMap: Record<string, any> = {
    'lightbulb': Lightbulb,
    'dollarsign': DollarSign,
    'mappin': MapPin,
    'clock': Clock,
    'star': Star,
    'alerttriangle': AlertTriangle,
    'info': Info,
    'checkcircle': CheckCircle,
    'camera': Camera,
    'utensils': Utensils
  }

  // Color classes for different backgrounds
  const backgroundClasses = {
    'purple': 'bg-purple-50',
    'blue': 'bg-blue-50',
    'green': 'bg-green-50',
    'amber': 'bg-amber-50',
    'red': 'bg-red-50',
    'gray': 'bg-gray-50'
  }

  const iconColorClasses = {
    'purple': 'text-purple-600',
    'blue': 'text-blue-600',
    'green': 'text-green-600',
    'amber': 'text-amber-600',
    'red': 'text-red-600',
    'gray': 'text-gray-600'
  }

  // Default tip boxes (can be overridden from CMS)
  const defaultTipBoxes: TipBox[] = [
    {
      id: "insider-tips",
      title: "Insider Tips",
      icon: "lightbulb",
      backgroundColor: "purple",
      showIcon: true,
      items: [
        { 
          id: "tip1", 
          text: "Visit early morning or late afternoon for the best lighting and fewer crowds",
          isHighlighted: false 
        },
        { 
          id: "tip2", 
          text: "Book accommodations at least 3 months in advance during peak season",
          isHighlighted: true 
        },
        { 
          id: "tip3", 
          text: "Try the local specialty dishes - they're often the best value and most authentic experience",
          isHighlighted: false 
        },
        { 
          id: "tip4", 
          text: "Download offline maps before you go - cell service can be spotty in some areas",
          isHighlighted: false 
        },
        { 
          id: "tip5", 
          text: "Pack layers - weather can change quickly, especially in mountainous regions",
          isHighlighted: false 
        }
      ]
    }
  ]

  const tipBoxes = data?.tipBoxes && data.tipBoxes.length > 0 ? data.tipBoxes : defaultTipBoxes

  return (
    <div className="mb-12">
      {showTitle && (
        <h2 className="text-3xl font-semibold mt-12 mb-6">{title}</h2>
      )}
      
      {showSubtitle && subtitle && (
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">{subtitle}</p>
      )}

      <div className={layout === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-6'}>
        {tipBoxes.map((tipBox) => {
          const IconComponent = iconMap[tipBox.icon || 'lightbulb'] || Lightbulb
          const bgColorClass = backgroundClasses[tipBox.backgroundColor || 'purple']
          const iconColorClass = iconColorClasses[tipBox.backgroundColor || 'purple']
          
          return (
            <div key={tipBox.id} className={`${bgColorClass} rounded-xl p-6 mb-8`}>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {tipBox.showIcon !== false && (
                  <IconComponent className={`w-6 h-6 ${iconColorClass}`} />
                )}
                {tipBox.title}
              </h3>
              <ul className="space-y-2 text-gray-700">
                {tipBox.items.map((item) => (
                  <li key={item.id}>
                    {item.isHighlighted ? (
                      <span>• <strong>{item.text}</strong></span>
                    ) : (
                      <span>• {item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}