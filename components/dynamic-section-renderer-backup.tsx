'use client'

import React from 'react'
import { HeroSection } from './sections/hero-section'
import { AuthorBlock } from './author-block'
import RichTextEditor from './rich-text-editor'
import { FAQSection } from './faq-section'
// Removed old InternalLinking - now using InternalLinksSection
import { ThingsToDoCards } from './things-to-do-cards'
import { HotelCarousel } from './hotel-carousel'
import { LocalTips } from './local-tips'
import { AttractionsCarousel } from './attractions-carousel'
import { StarterPackSection } from './starter-pack-section'
import { WhereToStay } from './where-to-stay'
import { WhyDestinationDifferent } from './why-destination-different'
import { InternalLinksSection } from './internal-links-section'
import { HtmlHeroSection } from './sections/html-hero-section'
import { HtmlContentContainer } from './sections/html-content-container'
import { TableOfContentsSection } from './sections/table-of-contents-section'
import { WhyChooseSection } from './sections/why-choose-section'
import { ComparisonTableSection } from './sections/comparison-table-section'
import { TipBoxesSection } from './sections/tip-boxes-section'
import { BudgetTimelineSection } from './sections/budget-timeline-section'
import { Clock, DollarSign, Camera, Heart } from 'lucide-react'
import { useTranslations, getDestinationKey } from '@/lib/hooks/useTranslations'

interface ModernSection {
  id: string
  template_id: string
  title?: string
  data: any
  position: number
  is_active: boolean
  template: {
    name: string
    component_name: string
    category: string
  }
}

interface DynamicSectionRendererProps {
  sections: ModernSection[]
  post?: any
  language?: string // Add language prop
}

// Default internal links for auto-generation based on destination
function getDefaultInternalLinks(destination?: string) {
  const postTitle = destination?.toLowerCase() || ''
  
  // Italian travel posts
  if (postTitle.includes('italian') || postTitle.includes('italy') || postTitle.includes('lakes') || 
      postTitle.includes('como') || postTitle.includes('rome') || postTitle.includes('venice') || 
      postTitle.includes('florence') || postTitle.includes('naples') || postTitle.includes('amalfi')) {
    return [
      {
        id: 1,
        title: "Rome Ultimate 7-Day Italy Travel Guide",
        url: "/blog/rome-ultimate-7-day-italy-travel-guide"
      },
      {
        id: 2,
        title: "Venice Travel Guide Ultimate 5-Day Italian Adventure",
        url: "/blog/venice-travel-guide-ultimate-5-day-italian-adventure"
      },
      {
        id: 3,
        title: "Florence Travel Guide Renaissance Art Tuscan Delights",
        url: "/blog/florence-travel-guide-renaissance-art-tuscan-delights"
      },
      {
        id: 4,
        title: "Naples & Amalfi Coast Ultimate Southern Italy Guide",
        url: "/blog/naples-amalfi-coast-ultimate-southern-italy-guide"
      },
      {
        id: 5,
        title: "Italian Lakes Region Complete Guide",
        url: "/blog/italian-lakes-region-como-garda-maggiore-complete-guide"
      },
      {
        id: 6,
        title: "Paris Complete Travel Guide",
        url: "/blog/paris-complete-travel-guide"
      }
    ]
  }
  
  // Rotterdam posts
  if (postTitle.includes('rotterdam')) {
    return [
      {
        id: 1,
        title: "Best Rooftop Bars in Rotterdam",
        url: "/blog/rotterdam-rooftop-bars"
      },
      {
        id: 2,
        title: "Rotterdam Electronic Music Scene Guide",
        url: "/blog/rotterdam-electronic-music"
      },
      {
        id: 3,
        title: "Weekend in Rotterdam Complete Itinerary",
        url: "/blog/rotterdam-weekend-guide"
      },
      {
        id: 4,
        title: "Rotterdam Food & Drink Scene",
        url: "/blog/rotterdam-food-guide"
      }
    ]
  }
  
  // Default fallback for other destinations
  return [
    {
      id: 1,
      title: "Rome Ultimate 7-Day Italy Travel Guide",
      url: "/blog/rome-ultimate-7-day-italy-travel-guide"
    },
    {
      id: 2,
      title: "Venice Travel Guide Ultimate 5-Day Italian Adventure",
      url: "/blog/venice-travel-guide-ultimate-5-day-italian-adventure"
    },
    {
      id: 3,
      title: "Florence Travel Guide Renaissance Art Tuscan Delights",
      url: "/blog/florence-travel-guide-renaissance-art-tuscan-delights"
    },
    {
      id: 4,
      title: "Paris Complete Travel Guide",
      url: "/blog/paris-complete-travel-guide"
    }
  ]
}

// Template ID to component mapping
function getTemplateInfo(template_id: string) {
  const templateMap: Record<string, { name: string; component_name: string; category: string }> = {
    // Hero Section
    '6f579a71-463c-43b4-b203-c2cb46c80d47': {
      name: 'hero-section',
      component_name: 'HeroSection',
      category: 'hero'
    },
    // Author Section
    '58e1b71c-600b-48d3-a956-f9b27bc368b2': {
      name: 'author-section',
      component_name: 'AuthorBlock',
      category: 'content'
    },
    // Starter Pack Section
    'b87245be-1b68-47d4-83a6-fac582a0847f': {
      name: 'starter-pack-section',
      component_name: 'StarterPackSection',
      category: 'overview'
    },
    // Starter Pack Section
    '8642ef7e-6198-4cd4-b0f9-8ba6bb868951': {
      name: 'starter-pack-section',
      component_name: 'StarterPackSection',
      category: 'content'
    },
    // Things To Do Cards
    'e596d688-31d9-4722-926d-18868f50f0cf': {
      name: 'things-to-do-cards',
      component_name: 'ThingsToDoCards',
      category: 'content'
    },
    // Where To Stay
    '833666f2-e112-40c0-9d50-02f160b96f3a': {
      name: 'where-to-stay',
      component_name: 'WhereToStay',
      category: 'content'
    },
    // Hotel Carousel
    'e2036f8e-e01e-4a04-8cf7-814f77b4343b': {
      name: 'hotel-carousel',
      component_name: 'HotelCarousel',
      category: 'gallery'
    },
    // Attractions Carousel
    '5251d41a-d7f8-44b6-bfaf-636d50c859b1': {
      name: 'attractions-carousel',
      component_name: 'AttractionsCarousel',
      category: 'content'
    },
    // Local Tips
    '9d56d088-6aff-4e2c-b263-6e830d8d332c': {
      name: 'local-tips',
      component_name: 'LocalTips',
      category: 'content'
    },
    // FAQ Section
    '710f8880-c86d-4353-b16f-474c74debd31': {
      name: 'faq-section',
      component_name: 'FAQSection',
      category: 'content'
    },
    // Internal Links Section
    'c2caf0b9-68b6-48c1-999c-4cc48bd12242': {
      name: 'internal-links-section',
      component_name: 'InternalLinksSection',
      category: 'content'
    },
    // Why Destination Different
    'b1d8062e-9fff-46d4-86b8-f198de9f3d38': {
      name: 'why-destination-different',
      component_name: 'WhyDestinationDifferent',
      category: 'content'
    },
    // Rich Text Content
    '550e8400-e29b-41d4-a716-446655440000': {
      name: 'rich-text-content',
      component_name: 'RichTextContent',
      category: 'content'
    },
    // Backward compatibility aliases
    'rich-text-editor': {
      name: 'rich-text-editor',
      component_name: 'RichTextEditor',
      category: 'content'
    },
    'RichTextEditor': {
      name: 'rich-text-editor',
      component_name: 'RichTextEditor',
      category: 'content'
    },
    'faq-section': {
      name: 'faq-section',
      component_name: 'FAQSection',
      category: 'content'
    },
    'internal-linking': {
      name: 'internal-linking',
      component_name: 'InternalLinking',
      category: 'meta'
    },
    'things-to-do-cards': {
      name: 'things-to-do-cards',
      component_name: 'ThingsToDoCards',
      category: 'content'
    },
    'hotel-carousel': {
      name: 'hotel-carousel',
      component_name: 'HotelCarousel',
      category: 'content'
    },
    'overview-intro': {
      name: 'starter-pack-section',
      component_name: 'StarterPackSection',
      category: 'content'
    },
    'blog-content': {
      name: 'blog-content',
      component_name: 'blog-content-section',
      category: 'content'
    },
    'e30d9e40-eb3a-41d3-aeac-413cfca52fe0': {
      name: 'rich-text-content',
      component_name: 'rich-text-content',
      category: 'content'
    },
    'e2036f8e-e01e-4a04-8cf7-814f77b4343b': {
      name: 'hotel-carousel',
      component_name: 'hotel-carousel',
      category: 'content'
    },
    '710f8880-c86d-4353-b16f-474c74debd31': {
      name: 'faq-section',
      component_name: 'faq-section',
      category: 'content'
    },
    'e596d688-31d9-4722-926d-18868f50f0cf': {
      name: 'things-to-do-cards',
      component_name: 'things-to-do-cards',
      category: 'content'
    },
    'c2caf0b9-68b6-48c1-999c-4cc48bd12242': {
      name: 'internal-linking',
      component_name: 'internal-links-section',
      category: 'meta'
    },
    'b1d8062e-9fff-46d4-86b8-f198de9f3d38': {
      name: 'overview-intro',
      component_name: 'overview-intro',
      category: 'content'
    },
    '833666f2-e112-40c0-9d50-02f160b96f3a': {
      name: 'travel-tips',
      component_name: 'travel-tips',
      category: 'content'
    },
    '03d9efa8-2c31-489d-94af-d2d85f52aa9c': {
      name: 'ai-itinerary-cta',
      component_name: 'ai-itinerary-cta',
      category: 'cta'
    },
    // New HTML-style components
    'html-hero-section': {
      name: 'html-hero-section',
      component_name: 'HtmlHeroSection',
      category: 'hero'
    },
    'html-content-container': {
      name: 'html-content-container',
      component_name: 'HtmlContentContainer',
      category: 'layout'
    },
    'table-of-contents': {
      name: 'table-of-contents',
      component_name: 'TableOfContentsSection',
      category: 'content'
    },
    'why-choose-section': {
      name: 'why-choose-section',
      component_name: 'WhyChooseSection',
      category: 'content'
    },
    'comparison-table': {
      name: 'comparison-table',
      component_name: 'ComparisonTableSection',
      category: 'content'
    },
    'tip-boxes': {
      name: 'tip-boxes',
      component_name: 'TipBoxesSection',
      category: 'content'
    },
    'budget-timeline': {
      name: 'budget-timeline',
      component_name: 'BudgetTimelineSection',
      category: 'content'
    },
    // Basic HTML-style template UUIDs for new components
    '12345678-1234-4321-8765-123456789abc': {
      name: 'html-hero-section',
      component_name: 'HtmlHeroSection',
      category: 'hero'
    },
    'd7279f1d-831f-4fd0-9bde-662d8f60b1b0': {
      name: 'table-of-contents',
      component_name: 'TableOfContentsSection',
      category: 'content'
    },
    '23456789-2345-4321-8765-123456789bcd': {
      name: 'table-of-contents',
      component_name: 'TableOfContentsSection',
      category: 'content'
    },
    '34567890-3456-5432-9876-234567890def': {
      name: 'why-choose-section',
      component_name: 'WhyChooseSection',
      category: 'content'
    },
    '34567890-3456-4321-8765-123456789cde': {
      name: 'comparison-table',
      component_name: 'ComparisonTableSection',
      category: 'content'
    },
    '45678901-4567-4321-8765-123456789def': {
      name: 'tip-boxes',
      component_name: 'TipBoxesSection',
      category: 'content'
    },
    '56789012-5678-7654-0987-456789012abc': {
      name: 'tip-boxes',
      component_name: 'TipBoxesSection',
      category: 'content'
    },
    '67890123-6789-8765-1098-567890123bcd': {
      name: 'budget-timeline',
      component_name: 'BudgetTimelineSection',
      category: 'content'
    },
    '56789012-5678-4321-8765-123456789ef0': {
      name: 'budget-timeline',
      component_name: 'BudgetTimelineSection',
      category: 'content'
    },
    // Additional template ID found in error message
    '123456789cde': {
      name: 'why-choose-section',
      component_name: 'WhyChooseSection',
      category: 'content'
    }
  }
  
  return templateMap[template_id] || null
}

export function DynamicSectionRenderer({ sections, post, language = 'en' }: DynamicSectionRendererProps) {
  // Initialize translation hook
  const { t } = useTranslations(language)
  // Basic component initialization

  const renderSection = (section: ModernSection) => {
    let { template, data, title, is_active } = section
    
    if (!is_active) return null

    // If template is missing, try to get it from template_id
    if (!template || !template.component_name) {
      template = getTemplateInfo(section.template_id)
    }

    // Check if template exists and has required properties
    if (!template || !template.component_name) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Section missing template information:', section)
        return (
          <div key={section.id} className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-red-800">
              Section missing template information. Template ID: {section.template_id}
            </p>
            <p className="text-red-600 text-sm">
              Check the getTemplateInfo function for supported template IDs
            </p>
            <pre className="text-xs text-red-600 mt-2">
              {JSON.stringify(section, null, 2)}
            </pre>
          </div>
        )
      }
      // Graceful degradation in production
      return null
    }

    // Add title to data if provided
    const sectionData = title ? { ...data, title } : data

    switch (template.component_name) {
      // Hero Section
      case 'HeroSection':
      case 'hero-section':
        // Debug log for hero section
        console.log('Rendering Hero Section with data:', {
          title: sectionData.title,
          subtitle: sectionData.subtitle,
          location: sectionData.location,
          allKeys: Object.keys(sectionData || {})
        })
        return (
          <HeroSection 
            key={section.id}
            title={sectionData.title || post?.title || 'Amazing Destination'}
            description={sectionData.subtitle || sectionData.description || post?.excerpt || 'Discover the best experiences'}
            location={sectionData.location || 'Destination'}
            heroImage={sectionData.backgroundImage || sectionData.image || '/placeholder.svg'}
            post={post}
            data={sectionData}
          />
        )

      // HTML-style Hero Section
      case 'HtmlHeroSection':
      case 'html-hero-section':
        return (
          <HtmlHeroSection 
            key={section.id}
            title={sectionData.title || post?.title || 'Amazing Destination'}
            description={sectionData.subtitle || sectionData.description || post?.excerpt || 'Discover the best experiences'}
            location={sectionData.location || 'Destination'}
            heroImage={sectionData.backgroundImage || sectionData.image}
            post={post}
            data={sectionData}
          />
        )
      
      // Author Block
      case 'AuthorBlock':
      case 'author-section':
      case 'author-block':
        return (
          <AuthorBlock 
            key={section.id}
            name={sectionData.name}
            title={sectionData.title}
            bio={sectionData.bio}
            avatar={sectionData.avatar}
            countriesExplored={sectionData.countriesExplored}
            expertSince={sectionData.expertSince}
            followers={sectionData.followers}
            badges={sectionData.badges}
            publishedDate={post?.published_date}
            updatedDate={post?.updated_date}
          />
        )
      
      // Starter Pack Section
      case 'StarterPackSection':
      case 'starter-pack-section':
      case 'overview-intro':
        console.log('🎯 Rendering StarterPackSection with data:', sectionData)
        
        // PRIORITY 1: Use admin interface data directly if available
        if (sectionData.highlights || sectionData.badge || sectionData.title) {
          console.log('Using admin interface data directly')
          return (
            <StarterPackSection 
              key={section.id}
              data={sectionData}
            />
          )
        }
        
        // PRIORITY 2: Check if this is translated content with direct starter pack data
        if (sectionData.destination) {
          console.log('Using translated starter pack data:', sectionData)
          return (
            <StarterPackSection 
              key={section.id}
              data={sectionData}
            />
          )
        }
        
        // PRIORITY 3: Check if we have database starter pack data in the section data
        if (sectionData.starterPackData) {
          // Use database data if available - convert to StarterPackSection format
          const starterPackData = sectionData.starterPackData
          const starterPackFormatData = {
            destination: post?.title?.split(':')[0] || 'destination',
            bestTime: 'Best season to visit',
            duration: '5-7 days recommended',
            budget: '€100-200 per day',
            currency: 'EUR',
            language: 'Local language',
            timezone: 'Local timezone',
            highlights: starterPackData.highlights.map((h: any) => h.title || h.value || 'Highlight')
          }

          return (
            <StarterPackSection 
              key={section.id}
              data={starterPackFormatData}
            />
          )
        }
        
        // Fallback to hardcoded content logic (existing code)
        // Determine destination from post title or fallback to generic
        const postTitle = post?.title || ''
        let destination = 'this destination'
        let customHighlights = null
        let customSections = null
        let customBadge = null

        // Use translations for destination-specific content
        const destinationKey = getDestinationKey(postTitle)
        
        if (destinationKey !== 'default') {
          destination = t(`destinations.${destinationKey}.name`, destination)
          customBadge = t(`destinations.${destinationKey}.starterPackBadge`, customBadge)
          
          // Get translated highlights
          customHighlights = [
            {
              icon: Clock,
              title: t('components.starterPackSection.highlights.perfectDuration', "Perfect Duration"),
              value: "5-7 days",
              description: "Just right to explore all three lakes",
            },
            {
              icon: DollarSign,
              title: t('components.starterPackSection.highlights.budgetRange', "Budget Range"), 
              value: "€80-250",
              description: t('components.starterPackSection.budgetUnits.perDay', 'per day') + ", luxury optional",
            },
            {
              icon: Camera,
              title: t('components.starterPackSection.highlights.mustSeeSpots', "Must-See Spots"),
              value: "15+ spots",
              description: "From Como to Garda",
            },
            {
              icon: Heart,
              title: t('components.starterPackSection.highlights.vibeCheck', "Vibe Check"),
              value: "Pure elegance",
              description: "Alpine beauty meets Italian charm",
            },
          ]
          
          // Get translated section content 
          customSections = [
            {
              title: t(`destinations.${destinationKey}.whyDifferent.title1`, "Natural beauty that steals your breath"),
              content: t(`destinations.${destinationKey}.whyDifferent.content1`, "Crystal-clear waters reflecting snow-capped Alps, charming lakeside villages, and villa gardens straight from a fairytale. The Italian Lakes aren't just scenic - they're soul-stirring.")
            },
            {
              title: t(`destinations.${destinationKey}.whyDifferent.title2`, "Luxury that feels effortless"),
              content: t(`destinations.${destinationKey}.whyDifferent.content2`, "From George Clooney's Lake Como to exclusive villa stays, this region does luxury with Italian flair. It's sophisticated without being stuffy, elegant without being pretentious.")
            }
          ]
        }
        
        // Italian Lakes specific content (fallback for backward compatibility)
        else if (postTitle.toLowerCase().includes('italian') && postTitle.toLowerCase().includes('lakes')) {
          destination = 'Italian Lakes Region'
          customBadge = '🏔️ Your Italian Lakes starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "5-7 days",
              description: "Just right to explore all three lakes",
            },
            {
              icon: DollarSign,
              title: "Budget Range", 
              value: "€80-250",
              description: "Per day, luxury optional",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "15+ villas",
              description: "From Como to Garda",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Pure elegance",
              description: "Alpine beauty meets Italian charm",
            },
          ]
          customSections = [
            {
              title: "Natural beauty that steals your breath",
              content: "Crystal-clear waters reflecting snow-capped Alps, charming lakeside villages, and villa gardens straight from a fairytale. The Italian Lakes aren't just scenic - they're soul-stirring."
            },
            {
              title: "Luxury that feels effortless",
              content: "From George Clooney's Lake Como to exclusive villa stays, this region does luxury with Italian flair. It's sophisticated without being stuffy, elegant without being pretentious."
            }
          ]
        }
        // Rome specific content
        else if (postTitle.toLowerCase().includes('rome')) {
          destination = 'Rome'
          customBadge = '🏛️ Your Rome starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "5-7 days",
              description: "Just right for the eternal city",
            },
            {
              icon: DollarSign,
              title: "Budget Range", 
              value: "€60-180",
              description: "Per day, from budget to luxury",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "20+ sites",
              description: "Ancient wonders everywhere",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Epic history",
              description: "Where legends come alive",
            },
          ]
          customSections = [
            {
              title: "History that literally surrounds you",
              content: "Walk where gladiators fought, emperors ruled, and saints prayed. Rome isn't a museum - it's a living, breathing chronicle of human civilization that hits different than anywhere else."
            },
            {
              title: "Food culture that changes everything",
              content: "From perfect carbonara in hidden trattorias to gelato that ruins you for all other ice cream, Rome's food scene is about passion, tradition, and ingredients that taste like they were blessed by the gods."
            }
          ]
        }
        // Venice specific content
        else if (postTitle.toLowerCase().includes('venice')) {
          destination = 'Venice'
          customBadge = '🚤 Your Venice starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "3-5 days",
              description: "Enough to lose yourself in magic",
            },
            {
              icon: DollarSign,
              title: "Budget Range", 
              value: "€90-300",
              description: "Per day, splurge worthy",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "12+ islands",
              description: "Each one unique",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Pure romance",
              description: "Floating fairy tale",
            },
          ]
          customSections = [
            {
              title: "A city that defies reality",
              content: "Built on water, carved from dreams, and painted with light that changes every hour. Venice isn't just unique - it's impossible, yet here it is, floating before you like magic made manifest."
            },
            {
              title: "Art and architecture that inspire",
              content: "From Byzantine mosaics to Baroque palaces, every building tells a story of merchants, doges, and artists who created beauty on an impossible scale. It's an open-air museum where you're the main character."
            }
          ]
        }
        // Florence specific content
        else if (postTitle.toLowerCase().includes('florence')) {
          destination = 'Florence'
          customBadge = '🎨 Your Florence starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "4-6 days",
              description: "Renaissance deserves time",
            },
            {
              icon: DollarSign,
              title: "Budget Range", 
              value: "€70-200",
              description: "Per day, art included",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "15+ museums",
              description: "Masterpieces everywhere",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Renaissance magic",
              description: "Where art was reborn",
            },
          ]
          customSections = [
            {
              title: "Art that changes how you see the world",
              content: "Stand before Michelangelo's David, walk through the Uffizi, and witness frescoes that defined Western art. Florence isn't just about seeing masterpieces - it's about understanding why beauty matters."
            },
            {
              title: "A city built for wandering",
              content: "Medieval streets lead to Renaissance piazzas, artisan workshops hide behind ancient doors, and every corner reveals another architectural gem. Florence rewards the curious with discoveries around every turn."
            }
          ]
        }
        // Naples & Amalfi specific content - but use translated data if available
        else if (postTitle.toLowerCase().includes('naples') || postTitle.toLowerCase().includes('amalfi')) {
          destination = sectionData.destination || 'Naples & Amalfi Coast'
          customBadge = sectionData.badge || '🌊 Your Southern Italy starter pack'
          
          // Use translated sections if available, otherwise fallback to English
          if (sectionData.sections && sectionData.sections.length > 0) {
            customSections = sectionData.sections
          } else {
            customSections = [
              {
                title: "Coastline that redefines beautiful",
                content: "Cliffs that plunge into turquoise seas, towns that cling to mountainsides like ancient amphitheaters, and views that make your heart skip beats. The Amalfi Coast isn't just scenic - it's transcendent."
              },
              {
                title: "Culture with serious soul",
                content: "Naples gave the world pizza, Pompeii preserves ancient life, and every village has stories older than nations. This is Italy at its most authentic - passionate, proud, and utterly unforgettable."
              }
            ]
          }
          
          // Use translated highlights if available
          if (sectionData.highlights && sectionData.highlights.length > 0) {
            customHighlights = sectionData.highlights.map((h: any) => ({
              icon: Clock, // You could map icons based on h.icon property
              title: h.title || h.name,
              value: h.value,
              description: h.description
            }))
          } else {
            customHighlights = [
              {
                icon: Clock,
                title: "Perfect Duration",
                value: "6-8 days",
                description: "Coast and culture combined",
              },
              {
                icon: DollarSign,
                title: "Budget Range", 
                value: "€75-220",
                description: "Per day, coastal luxury",
              },
              {
                icon: Camera,
                title: "Must-See Spots",
                value: "13+ towns",
                description: "Dramatic coastal gems",
              },
              {
                icon: Heart,
                title: "Vibe Check",
                value: "Coastal perfection",
                description: "Where Italy meets the sea",
              },
            ]
          }
        }
        // Rotterdam-specific content
        else if (postTitle.toLowerCase().includes('rotterdam')) {
          destination = 'Rotterdam'
          customBadge = '🌃 Your Rotterdam nightlife starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "2-3 nights",
              description: "Just right to experience the nightlife",
            },
            {
              icon: DollarSign,
              title: "Budget Range", 
              value: "€50-150",
              description: "Per night, your way",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "10+ venues",
              description: "From rooftops to underground",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Raw energy",
              description: "Industrial meets sophisticated",
            },
          ]
          customSections = [
            {
              title: "Nightlife that hits different",
              content: "From cutting-edge rooftop bars to legendary underground techno clubs, Rotterdam's after-dark scene is pure fire. The city's industrial edge creates a unique party atmosphere you won't find anywhere else."
            },
            {
              title: "Culture that never sleeps",
              content: "Rotterdam doesn't just party - it creates. Late-night art galleries, 24-hour creative spaces, and venues that blur the line between club and cultural experience. This is nightlife with substance."
            }
          ]
        }
        // Paris-specific content  
        else if (postTitle.toLowerCase().includes('paris')) {
          destination = 'Paris'
          customBadge = '📍 Your Paris starter pack'
          customHighlights = [
            {
              icon: Clock,
              title: "Perfect Duration",
              value: "5-7 days",
              description: "Just right to fall in love",
            },
            {
              icon: DollarSign,
              title: "Budget Range",
              value: "€100-300", 
              description: "Per day, your way",
            },
            {
              icon: Camera,
              title: "Must-See Spots",
              value: "15+ places",
              description: "Instagram-worthy moments",
            },
            {
              icon: Heart,
              title: "Vibe Check",
              value: "Pure magic",
              description: "You'll never want to leave",
            },
          ]
          customSections = [
            {
              title: "Culture that actually slaps",
              content: "The Louvre, Musée d'Orsay, street art in Belleville - Paris serves culture on every corner. It's giving main character energy, and you're here for it."
            },
            {
              title: "Food that changes your life",
              content: "From hole-in-the-wall bistros to Michelin stars, Paris doesn't miss. That first bite of a real French croissant? Life-changing doesn't even cover it."
            }
          ]
        }

        // If the section has database data structure, use that
        let highlights = customHighlights
        let badge = customBadge || sectionData.badge
        
        // Map database items to highlights if available
        if (sectionData.items && Array.isArray(sectionData.items)) {
          const iconMap: Record<string, any> = {
            'clock': Clock,
            'dollar': DollarSign,
            'camera': Camera,
            'heart': Heart
          }
          
          highlights = sectionData.items.map((item: any) => ({
            icon: iconMap[item.icon] || Clock,
            title: item.title,
            value: item.value,
            description: item.description
          }))
        }

        // Generate destination-specific title
        const destinationTitle = sectionData.title || 
          (destination && destination !== 'this destination' 
            ? `Why ${destination} ${destination.toLowerCase().includes('region') || destination.toLowerCase().includes('coast') ? 'Hits' : 'Hit'} Different`
            : 'Why This Destination Hits Different')

        // Convert the hardcoded content to new StarterPackSection format
        const starterPackData = {
          badge: customBadge || `🏔️ Your ${destination} starter pack`,
          title: `${destination} Travel Essentials`,
          description: 'Everything you need to know at a glance',
          highlights: customHighlights || [],
          features: customSections || []
        }

        return (
          <StarterPackSection 
            key={section.id}
            data={starterPackData}
          />
        )
      

      // Why Destination Different - Handle as separate content
      case 'WhyDestinationDifferent':
      case 'why-destination-different':
        return (
          <WhyDestinationDifferent 
            key={section.id}
            data={sectionData}
          />
        )
      
      // Blog Content Section (main content)
      case 'BlogContentSection':
      case 'blog-content-section':
        return (
          <RichTextEditor 
            key={section.id}
            content={sectionData.content || ''}
          />
        )
      
      // Rich Text Content Section (WYSIWYG editor content)
      case 'RichTextContent':
      case 'RichTextEditor':
      case 'rich-text-content':
      case 'rich-text-editor':
      case 'RichTextEditor': // Handle duplicate case explicitly
        // Debug log to see what content we're getting
        console.log('Rendering RichTextEditor with content length:', sectionData.content?.length || 0)
        console.log('Content preview:', sectionData.content?.substring(0, 100) + '...')
        return (
          <RichTextEditor 
            key={section.id}
            content={sectionData.content || '<p>Content not available in this language yet.</p>'}
          />
        )
      
      // Things to Do Cards
      case 'ThingsToDoCards':
      case 'things-to-do-cards':
        return (
          <ThingsToDoCards 
            key={section.id} 
            destination={post?.title || ''} 
            title={sectionData.title || t('components.thingsToDoCards.defaultTitle', 'Things To Do')}
            description={sectionData.description || t('components.thingsToDoCards.defaultDescription', 'Discover the best activities and experiences')}
            activities={sectionData.activities || []}
            language={language}
          />
        )
      
      // Attractions Carousel - Skip to avoid duplication with ThingsToDoCards
      case 'AttractionsCarousel':
      case 'attractions-carousel':
        // Skip this to avoid duplication with ThingsToDoCards section
        return null
      
      // Where to Stay - New component
      case 'WhereToStay':
      case 'where-to-stay':
        return <WhereToStay key={section.id} data={sectionData} />

      // Hotel Carousel - Separate component
      case 'HotelCarousel':
      case 'hotel-carousel':
        const hotelPostTitle = post?.title || ''
        let hotelDestination = 'the area'
        
        if (hotelPostTitle.toLowerCase().includes('italian') && hotelPostTitle.toLowerCase().includes('lakes')) {
          hotelDestination = 'Italian Lakes'
        } else if (hotelPostTitle.toLowerCase().includes('rotterdam')) {
          hotelDestination = 'Rotterdam'
        } else if (hotelPostTitle.toLowerCase().includes('paris')) {
          hotelDestination = 'Paris'
        } else if (hotelPostTitle.toLowerCase().includes('rome')) {
          hotelDestination = 'Rome'
        } else if (hotelPostTitle.toLowerCase().includes('venice')) {
          hotelDestination = 'Venice'
        } else if (hotelPostTitle.toLowerCase().includes('florence')) {
          hotelDestination = 'Florence'
        } else if (hotelPostTitle.toLowerCase().includes('naples') || hotelPostTitle.toLowerCase().includes('amalfi')) {
          hotelDestination = 'Naples & Amalfi Coast'
        }
        
        console.log('🏨 Rendering HotelCarousel with data:', {
          title: sectionData.title,
          description: sectionData.description,
          destination: hotelDestination,
          hotels: sectionData.hotels?.length || 0,
          hotelsData: sectionData.hotels,
          allSectionData: Object.keys(sectionData || {})
        })
        
        return (
          <HotelCarousel 
            key={section.id}
            title={sectionData.title || t('components.hotelCarousel.defaultTitle', 'Where to Stay')}
            description={sectionData.description || t('components.hotelCarousel.defaultDescription', 'Find the perfect accommodation for your trip')}
            destination={hotelDestination}
            hotels={sectionData.hotels || []}
            language={language}
          />
        )
      
      // AI Itinerary CTA
      case 'AIItineraryCTA':
      case 'ai-itinerary-cta':
        return (
          <section key={section.id} className="bg-brand-gradient rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                {sectionData.title || 'Plan Your Perfect Trip'}
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                {sectionData.description || 'Let our AI help you create the perfect itinerary'}
              </p>
              <a 
                href={sectionData.buttonUrl || 'https://cuddlynest.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-brand-purple px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                {sectionData.buttonText || 'Start Planning'}
              </a>
            </div>
          </section>
        )
      
      // Local Tips - New component
      case 'LocalTips':
      case 'local-tips':
        return <LocalTips key={section.id} data={sectionData} />

      // Internal Links Section - New component
      case 'InternalLinksSection':
      case 'internal-links-section':
        return <InternalLinksSection key={section.id} data={sectionData} />

      // Internal Linking (legacy - redirected to new component)
      case 'InternalLinking':
      case 'internal-linking':
        // Convert legacy format to new format and use InternalLinksSection
        let legacyLinks = sectionData.links || []
        
        if (legacyLinks.length === 0 || sectionData.autoGenerate) {
          legacyLinks = getDefaultInternalLinks(post?.title)
        }
        
        // Convert to new format
        const convertedData = {
          title: sectionData.title || "More from our travel library",
          links: legacyLinks.map((link: any) => ({
            title: link.title,
            description: link.description,
            url: link.url,
            category: 'related'
          }))
        }
        
        return <InternalLinksSection key={section.id} data={convertedData} />
      
      // FAQ Section
      case 'FAQSection':
      case 'faq-section':
        const faqs = sectionData.faqs?.map((faq: any, index: number) => ({
          id: faq.id || index,
          question: faq.question || faq.title,
          answer: faq.answer || faq.content
        })) || []
        
        return <FAQSection key={section.id} faqs={faqs} />
      
      // Travel Tips Section - simple fallback
      case 'travel-tips':
        return (
          <section key={section.id} className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {sectionData.title || 'Travel Tips'}
            </h2>
            {sectionData.tips && (
              <ul className="space-y-4">
                {sectionData.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )

      // HTML Content Container
      case 'HtmlContentContainer':
      case 'html-content-container':
        return (
          <HtmlContentContainer key={section.id} data={sectionData}>
            {/* Container content will be handled by child sections */}
            <div dangerouslySetInnerHTML={{ __html: sectionData.content || '' }} />
          </HtmlContentContainer>
        )

      // Table of Contents Section
      case 'TableOfContentsSection':
      case 'table-of-contents':
        return <TableOfContentsSection key={section.id} data={sectionData} />

      // Why Choose Section
      case 'WhyChooseSection':
      case 'why-choose-section':
        return <WhyChooseSection key={section.id} data={sectionData} />

      // Comparison Table Section
      case 'ComparisonTableSection':
      case 'comparison-table':
        return <ComparisonTableSection key={section.id} data={sectionData} />

      // Tip Boxes Section
      case 'TipBoxesSection':
      case 'tip-boxes':
        return <TipBoxesSection key={section.id} data={sectionData} />

      // Budget Timeline Section
      case 'BudgetTimelineSection':
      case 'budget-timeline':
        return <BudgetTimelineSection key={section.id} data={sectionData} />
      
      // Fallback for other section types
      default:
        // Handle unknown RichTextEditor case specifically
        if (template.component_name === 'RichTextEditor' || template.name === 'RichTextEditor') {
          return (
            <RichTextEditor 
              key={section.id}
              content={sectionData.content || '<p>Content coming soon...</p>'}
            />
          )
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Unknown section type: ${template.component_name}`)
          return (
            <div key={section.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
              <p className="text-yellow-800">
                Section type "{template.component_name}" not implemented yet.
              </p>
              <pre className="text-xs text-yellow-600 mt-2">
                {JSON.stringify(sectionData, null, 2)}
              </pre>
            </div>
          )
        }
        // Graceful degradation in production
        return null
    }
  }

  // Use database position order since we've fixed the ordering there
  const sortedSections = [...sections].sort((a, b) => a.position - b.position)
  
  // Track rendered section types to avoid duplicates
  const renderedSectionTypes = new Set()

  // Pre-calculate the first content section index to avoid O(n²) complexity
  let firstContentSectionIndex = -1
  for (let i = 0; i < sortedSections.length; i++) {
    const section = sortedSections[i]
    const template = getTemplateInfo(section.template_id) || section.template
    const isHeroSection = template?.component_name === 'HeroSection' || 
                         template?.component_name === 'hero-section' ||
                         template?.name === 'hero-section' ||
                         section.template_id === '6f579a71-463c-43b4-b203-c2cb46c80d47'
    
    if (!isHeroSection && section.is_active) {
      firstContentSectionIndex = i
      break
    }
  }

  // Track first content section for layout positioning

  // Check if we have any HTML-style sections
  const hasHtmlSections = sortedSections.some(section => {
    const template = getTemplateInfo(section.template_id) || section.template
    console.log('🔍 Checking section for HTML layout:', {
      template_id: section.template_id,
      component_name: template?.component_name,
      name: template?.name
    })
    return template?.component_name === 'HtmlHeroSection' || 
           template?.component_name === 'TableOfContentsSection' ||
           template?.component_name === 'WhyChooseSection' ||
           template?.component_name === 'ComparisonTableSection' ||
           template?.component_name === 'TipBoxesSection' ||
           template?.component_name === 'BudgetTimelineSection' ||
           section.template_id === '12345678-1234-4321-8765-123456789abc'
  })

  const useHtmlLayout = hasHtmlSections
  
  console.log('🎨 HTML Layout Decision:', {
    hasHtmlSections,
    useHtmlLayout,
    totalSections: sortedSections.length
  })

  // HTML layout decision made

  if (useHtmlLayout) { // Enable HTML layout when HTML sections are detected
    // HTML-style layout: Hero + single white container with all content
    const heroSections = sortedSections.filter(section => {
      const template = getTemplateInfo(section.template_id) || section.template
      return template?.component_name === 'HtmlHeroSection' || 
             template?.component_name === 'HeroSection' ||
             template?.name === 'html-hero-section' ||
             template?.name === 'hero-section' ||
             section.template_id === '12345678-1234-4321-8765-123456789abc' || // HTML Hero
             section.template_id === '6f579a71-463c-43b4-b203-c2cb46c80d47'    // Regular Hero
    })

    const contentSections = sortedSections.filter(section => {
      const template = getTemplateInfo(section.template_id) || section.template
      return template?.component_name !== 'HtmlHeroSection' && 
             template?.component_name !== 'HeroSection' &&
             template?.name !== 'html-hero-section' &&
             template?.name !== 'hero-section' &&
             section.template_id !== '12345678-1234-4321-8765-123456789abc' && // HTML Hero
             section.template_id !== '6f579a71-463c-43b4-b203-c2cb46c80d47' && // Regular Hero
             section.is_active
    })

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero sections */}
        {heroSections.map(section => {
          const renderedSection = renderSection(section)
          return renderedSection ? (
            <div key={section.id} className="w-full">
              {renderedSection}
            </div>
          ) : null
        })}

        {/* Single content container */}
        <HtmlContentContainer>
          {contentSections.map(section => {
            const renderedSection = renderSection(section)
            return renderedSection ? (
              <div key={section.id} className="mb-8 last:mb-0">
                {renderedSection}
              </div>
            ) : null
          })}
        </HtmlContentContainer>
      </div>
    )
  }

  // Original layout for non-HTML style sections
  return (
    <div className="min-h-screen bg-gray-50">
      {sortedSections.map((section, index) => {
        const sectionType = section.template?.component_name || section.template_id
        
        console.log(`🔄 Processing section ${index}:`, {
          id: section.id,
          sectionType,
          is_active: section.is_active,
          isFirstContent: index === firstContentSectionIndex
        })
        
        // Identify why-different sections
        const isWhySection = sectionType === 'WhyDestinationDifferent' || 
                           sectionType === 'why-destination-different' ||
                           (section.title && section.title.toLowerCase().includes('why') && 
                            section.title.toLowerCase().includes('different'))
        
        // Skip duplicate why-different sections (all variations)
        if (isWhySection && renderedSectionTypes.has('why-different')) {
          console.log(`⏭️ Skipping duplicate why-different section ${index}`)
          return null
        }
        
        // Mark why-different sections as rendered
        if (isWhySection) {
          renderedSectionTypes.add('why-different')
        }
        
        const renderedSection = renderSection(section)
        
        // Skip if section was filtered out
        if (!renderedSection) {
          console.log(`⏭️ Skipping section ${index} - no rendered content`)
          return null
        }
        
        // Hero section should be full width without any containers
        const template = getTemplateInfo(section.template_id) || section.template
        const isHeroSection = template?.component_name === 'HeroSection' || 
                             template?.component_name === 'hero-section' ||
                             template?.name === 'hero-section' ||
                             section.template_id === '6f579a71-463c-43b4-b203-c2cb46c80d47'
        
        if (isHeroSection) {
          return (
            <div key={section.id} className="w-full">
              {renderedSection}
            </div>
          )
        }
        
        // Position first content section to peek above hero with smooth transition
        const isFirstContentSection = index === firstContentSectionIndex
        
        if (isFirstContentSection) {
          return (
            <div key={section.id} className="relative z-30">
              <div className="container mx-auto px-4 relative pt-8 pb-8"> {/* Removed -mt-16 to stop overlapping */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Full content - no height restriction, no fade effect */}
                  <div className="px-8 pt-8 pb-8">
                    {renderedSection}
                  </div>
                </div>
              </div>
            </div>
          )
        }
        
        // All other sections render normally
        console.log(`✅ Rendering normal section ${index}:`, section.template?.component_name)
        return (
          <div key={section.id} className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {renderedSection}
            </div>
          </div>
        )
      })}
    </div>
  )
}