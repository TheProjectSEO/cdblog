'use client'

interface TimelineItem {
  id: string
  title: string
  subtitle: string
  description: string
  details: string[]
  backgroundColor?: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'gray'
}

interface BudgetItem {
  id: string
  category: string
  items: string[]
}

interface BudgetTimelineSectionProps {
  data?: {
    title?: string
    subtitle?: string
    type?: 'timeline' | 'budget' | 'both'
    showTitle?: boolean
    showSubtitle?: boolean
    timelineItems?: TimelineItem[]
    budgetItems?: BudgetItem[]
    timelineColumns?: 2 | 3 | 4 | 6
    budgetColumns?: 1 | 2
  }
}

export function BudgetTimelineSection({ data }: BudgetTimelineSectionProps) {
  // Default settings
  const title = data?.title || "Planning Your Visit"
  const subtitle = data?.subtitle || "Essential information to help you plan the perfect trip"
  const type = data?.type || 'timeline'
  const showTitle = data?.showTitle !== false
  const showSubtitle = data?.showSubtitle !== false
  const timelineColumns = data?.timelineColumns || 4
  const budgetColumns = data?.budgetColumns || 2

  // Background color classes
  const backgroundClasses = {
    'blue': 'bg-blue-50',
    'green': 'bg-emerald-50', 
    'amber': 'bg-amber-50',
    'purple': 'bg-purple-50',
    'red': 'bg-red-50',
    'gray': 'bg-gray-50'
  }

  // Default timeline items (best time to visit)
  const defaultTimelineItems: TimelineItem[] = [
    {
      id: "spring",
      title: "March - May",
      subtitle: "Spring Season",
      description: "Mild weather, blooming flowers",
      details: [
        "🌸 Beautiful spring blooms",
        "🌡️ Temperature: 15-22°C",
        "💰 Moderate prices",
        "👥 Growing crowds"
      ],
      backgroundColor: "green"
    },
    {
      id: "summer",
      title: "June - August", 
      subtitle: "Peak Season",
      description: "Warmest weather, all attractions open",
      details: [
        "☀️ Best weather conditions",
        "🌡️ Temperature: 22-28°C", 
        "💰 Highest prices",
        "👥 Very busy crowds"
      ],
      backgroundColor: "amber"
    },
    {
      id: "autumn",
      title: "September - November",
      subtitle: "Autumn Season", 
      description: "Pleasant weather, beautiful colors",
      details: [
        "🍂 Stunning fall colors",
        "🌡️ Temperature: 12-20°C",
        "💰 Lower prices", 
        "👥 Moderate crowds"
      ],
      backgroundColor: "purple"
    },
    {
      id: "winter",
      title: "December - February",
      subtitle: "Low Season",
      description: "Quiet period, some closures",
      details: [
        "❄️ Peaceful atmosphere",
        "🌡️ Temperature: 0-10°C",
        "💰 Lowest prices",
        "👥 Minimal crowds"
      ],
      backgroundColor: "blue"
    }
  ]

  // Default budget items
  const defaultBudgetItems: BudgetItem[] = [
    {
      id: "savings",
      category: "Money-Saving Tips",
      items: [
        "✓ Book accommodations early for 20% savings",
        "✓ Travel during shoulder season for better deals",
        "✓ Use local transportation instead of taxis",
        "✓ Eat at local restaurants vs tourist spots",
        "✓ Look for combo tickets and city passes"
      ]
    },
    {
      id: "budget-breakdown",
      category: "Daily Budget Guide",
      items: [
        "🏨 Budget accommodation: €50-80/night",
        "🍽️ Meals: €30-50/day",
        "🚗 Transportation: €20-40/day", 
        "🎫 Attractions: €20-60/day",
        "📱 Total per person: €120-230/day"
      ]
    }
  ]

  const timelineItems = data?.timelineItems && data.timelineItems.length > 0 ? data.timelineItems : defaultTimelineItems
  const budgetItems = data?.budgetItems && data.budgetItems.length > 0 ? data.budgetItems : defaultBudgetItems

  // Grid classes for timeline
  const timelineGridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  // Grid classes for budget
  const budgetGridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2'
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 mb-12">
      {showTitle && (
        <h2 className="text-3xl font-semibold mt-12 mb-6">{title}</h2>
      )}
      
      {showSubtitle && subtitle && (
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">{subtitle}</p>
      )}

      {/* Timeline Section */}
      {(type === 'timeline' || type === 'both') && (
        <div className={`grid ${timelineGridClasses[timelineColumns]} gap-4 mb-8`}>
          {timelineItems.map((item) => {
            const bgColorClass = backgroundClasses[item.backgroundColor || 'blue']
            
            return (
              <div key={item.id} className={`text-center p-6 ${bgColorClass} rounded-xl`}>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <h4 className="font-medium text-base mb-2">{item.subtitle}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="text-xs space-y-1">
                  {item.details.map((detail, index) => (
                    <p key={index}>{detail}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Budget Section */}
      {(type === 'budget' || type === 'both') && type === 'both' && (
        <div className="bg-green-50 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-6">💰 Budget Planning</h3>
          
          <div className={`grid ${budgetGridClasses[budgetColumns]} gap-6`}>
            {budgetItems.map((budget) => (
              <div key={budget.id}>
                <h4 className="font-semibold mb-3">{budget.category}</h4>
                <ul className="space-y-2 text-gray-700">
                  {budget.items.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget only */}
      {type === 'budget' && (
        <div className="bg-green-50 rounded-xl p-8 mb-8">
          <div className={`grid ${budgetGridClasses[budgetColumns]} gap-6`}>
            {budgetItems.map((budget) => (
              <div key={budget.id}>
                <h3 className="text-xl font-semibold mb-3">{budget.category}</h3>
                <ul className="space-y-2 text-gray-700">
                  {budget.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}