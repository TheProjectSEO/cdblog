'use client'

import Link from "next/link"

interface TableOfContentsItem {
  id: string
  title: string
  href: string
}

interface TableOfContentsSectionProps {
  data?: {
    title?: string
    items?: TableOfContentsItem[]
    backgroundColor?: 'blue' | 'gray' | 'green' | 'purple' | 'amber'
    showTitle?: boolean
    customTitle?: string
  }
}

export function TableOfContentsSection({ data }: TableOfContentsSectionProps) {
  // Default settings matching the HTML design
  const title = data?.customTitle || data?.title || "Quick Navigation"
  const backgroundColor = data?.backgroundColor || 'blue'
  const showTitle = data?.showTitle !== false

  // Default table of contents items matching actual blog content headings
  const defaultItems: TableOfContentsItem[] = [
    { id: "discovering-region", title: "Discovering Italy's Crown Jewel", href: "#discovering-italys-crown-jewel-the-lakes-region" },
    { id: "big-three", title: "The Big Three Lakes", href: "#the-big-three-como-garda-and-maggiore" },
    { id: "lake-como", title: "Lake Como: The Aristocrat", href: "#lake-como-the-aristocrat" },
    { id: "lake-garda", title: "Lake Garda: Adventure Paradise", href: "#lake-garda-the-adventurers-paradise" },
    { id: "lake-maggiore", title: "Lake Maggiore: Garden Paradise", href: "#lake-maggiore-the-garden-paradise" },
    { id: "planning", title: "Planning Your Lakes Adventure", href: "#planning-your-lakes-adventure" },
    { id: "best-time", title: "Best Time to Visit", href: "#best-time-to-visit" },
    { id: "getting-around", title: "Getting Around", href: "#getting-around" }
  ]

  const items = data?.items && data.items.length > 0 ? data.items : defaultItems

  // Background color classes
  const backgroundClasses = {
    'blue': 'bg-blue-50',
    'gray': 'bg-gray-50',
    'green': 'bg-green-50',
    'purple': 'bg-purple-50',
    'amber': 'bg-amber-50'
  }

  const textColorClasses = {
    'blue': 'text-blue-700',
    'gray': 'text-gray-700',
    'green': 'text-green-700',
    'purple': 'text-purple-700',
    'amber': 'text-amber-700'
  }

  const hoverColorClasses = {
    'blue': 'hover:text-blue-900',
    'gray': 'hover:text-gray-900',
    'green': 'hover:text-green-900',
    'purple': 'hover:text-purple-900',
    'amber': 'hover:text-amber-900'
  }

  return (
    <div className="bg-blue-50 p-6 mb-8 rounded-lg relative z-10">
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4 mt-0 text-gray-900">{title}</h2>
      )}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <a 
              href={item.href} 
              className="text-blue-600 hover:text-blue-800 transition hover:underline flex items-center"
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(item.href);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              → {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}