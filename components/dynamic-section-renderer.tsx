'use client'

import React from 'react'
import { HeroSection } from './sections/hero-section'
import { AuthorBlock } from './author-block'
import { RichTextEditor } from './rich-text-editor'
import { FAQSection } from './faq-section'
import { ThingsToDoCards } from './things-to-do-cards'
import { HotelCarouselNew } from './hotel-carousel-new'
import { LocalTips } from './local-tips'
import { AttractionsCarousel } from './attractions-carousel'
import { StarterPackSection } from './starter-pack-section'
import { WhereToStay } from './where-to-stay'
import { WhyDestinationDifferent } from './why-destination-different'
import { InternalLinksSection } from './internal-links-section'
import { RelatedArticlesSection } from './related-articles-section'
import { HtmlHeroSection } from './sections/html-hero-section'
import { HtmlContentContainer } from './sections/html-content-container'
import { TableOfContentsSection } from './sections/table-of-contents-section'
import { WhyChooseSection } from './sections/why-choose-section'
import { ComparisonTableSection } from './sections/comparison-table-section'
import { TipBoxesSection } from './sections/tip-boxes-section'
import { BudgetTimelineSection } from './sections/budget-timeline-section'

interface ModernSection {
  id: string
  template_id: string
  title?: string
  data: any
  position: number
  is_active: boolean
  template?: {
    name: string
    component_name: string
    category: string
  }
}

interface DynamicSectionRendererProps {
  sections: ModernSection[]
  post?: any
  language?: string
}

// COMPLETELY REBUILT TEMPLATE MAPPING SYSTEM
function getTemplateInfo(template_id: string) {
  const templateMap: Record<string, { name: string; component_name: string; category: string }> = {
    // HTML-STYLE COMPONENTS (Priority mapping for Italian Lakes post)
    '12345678-1234-4321-8765-123456789abc': {
      name: 'html-hero-section',
      component_name: 'HtmlHeroSection',
      category: 'hero'
    },
    'd7279f1d-831f-4fd0-9bde-662d8f60b1b0': {
      name: 'skip-section',
      component_name: 'SkipSection',
      category: 'hidden'
    },
    '23456789-2345-4321-8765-123456789bcd': {
      name: 'table-of-contents',
      component_name: 'TableOfContentsSection',
      category: 'content'
    },
    '34567890-3456-4321-8765-123456789cde': {
      name: 'why-choose',
      component_name: 'WhyChooseSection',
      category: 'content'
    },
    '45678901-4567-4321-8765-123456789def': {
      name: 'tip-boxes',
      component_name: 'TipBoxesSection',
      category: 'content'
    },
    '56789012-5678-4321-8765-123456789ef0': {
      name: 'budget-timeline',
      component_name: 'BudgetTimelineSection',
      category: 'content'
    },
    '5251d41a-d7f8-44b6-bfaf-636d50c859b1': {
      name: 'comparison-table',
      component_name: 'ComparisonTableSection',
      category: 'content'
    },
    '8642ef7e-6198-4cd4-b0f9-8ba6bb868951': {
      name: 'html-content-container',
      component_name: 'HtmlContentContainer',
      category: 'content'
    },
    
    // REGULAR COMPONENTS
    '6f579a71-463c-43b4-b203-c2cb46c80d47': {
      name: 'hero-section',
      component_name: 'HeroSection',
      category: 'hero'
    },
    '58e1b71c-600b-48d3-a956-f9b27bc368b2': {
      name: 'author-section',
      component_name: 'AuthorBlock',
      category: 'content'
    },
    'b87245be-1b68-47d4-83a6-fac582a0847f': {
      name: 'starter-pack-section',
      component_name: 'StarterPackSection',
      category: 'content'
    },
    '550e8400-e29b-41d4-a716-446655440000': {
      name: 'rich-text-content',
      component_name: 'RichTextContent',
      category: 'content'
    },
    'e30d9e40-eb3a-41d3-aeac-413cfca52fe0': {
      name: 'rich-text-content',
      component_name: 'RichTextContent',
      category: 'content'
    },
    'e2036f8e-e01e-4a04-8cf7-814f77b4343b': {
      name: 'hotel-carousel',
      component_name: 'HotelCarousel',
      category: 'content'
    },
    'e596d688-31d9-4722-926d-18868f50f0cf': {
      name: 'things-to-do-cards',
      component_name: 'ThingsToDoCards',
      category: 'content'
    },
    '03d9efa8-2c31-489d-94af-d2d85f52aa9c': {
      name: 'ai-itinerary-cta',
      component_name: 'AIItineraryCTA',
      category: 'cta'
    },
    '710f8880-c86d-4353-b16f-474c74debd31': {
      name: 'faq-section',
      component_name: 'FAQSection',
      category: 'content'
    },
    'c2caf0b9-68b6-48c1-999c-4cc48bd12242': {
      name: 'internal-links-section',
      component_name: 'InternalLinksSection',
      category: 'content'
    },
    'related-articles-123-456-789': {
      name: 'related-articles-section',
      component_name: 'RelatedArticlesSection',
      category: 'content'
    },
    '833666f2-e112-40c0-9d50-02f160b96f3a': {
      name: 'where-to-stay',
      component_name: 'WhereToStay',
      category: 'content'
    },
    'b1d8062e-9fff-46d4-86b8-f198de9f3d38': {
      name: 'why-choose-section',
      component_name: 'WhyChooseSection',
      category: 'content'
    }
  }
  
  return templateMap[template_id] || null
}

// HTML LAYOUT DETECTION SYSTEM
function isHtmlStylePost(sections: ModernSection[]): boolean {
  console.log('🔍 HTML Layout Detection Starting...')
  
  // Check if we have the specific HTML-style template IDs
  const htmlTemplateIds = [
    '12345678-1234-4321-8765-123456789abc', // HTML Hero
    'd7279f1d-831f-4fd0-9bde-662d8f60b1b0', // HTML Hero (alternate)
    '23456789-2345-4321-8765-123456789bcd', // Table of Contents
    '34567890-3456-4321-8765-123456789cde', // Why Choose
    '45678901-4567-4321-8765-123456789def', // Tip Boxes
    '56789012-5678-4321-8765-123456789ef0', // Budget Timeline
    '5251d41a-d7f8-44b6-bfaf-636d50c859b1', // Comparison Table
    '8642ef7e-6198-4cd4-b0f9-8ba6bb868951'  // HTML Content Container
  ]
  
  const hasHtmlComponents = sections.some(section => {
    const isHtmlComponent = htmlTemplateIds.includes(section.template_id)
    if (isHtmlComponent) {
      console.log(`✅ Found HTML component: ${section.template_id} at position ${section.position}`)
    }
    return isHtmlComponent
  })
  
  console.log(`🎨 HTML Layout Decision: ${hasHtmlComponents ? 'ENABLED' : 'DISABLED'}`)
  return hasHtmlComponents
}

export function DynamicSectionRenderer({ sections, post, language = 'en' }: DynamicSectionRendererProps) {
  console.log('🚀 DynamicSectionRenderer Starting:', {
    sectionsCount: sections.length,
    postTitle: post?.title
  })

  const renderSection = (section: ModernSection) => {
    try {
      if (!section.is_active) return null

      const template = getTemplateInfo(section.template_id) || section.template
      if (!template?.component_name) {
        console.error(`❌ No template found for: ${section.template_id}`)
        return null
      }

      // Skip Related Articles and Internal Links sections - removed per user request
      if (template.component_name === 'RelatedArticlesSection' || 
          template.component_name === 'InternalLinksSection' ||
          template.name?.includes('related-articles') ||
          template.name?.includes('internal-links') ||
          section.template_id === 'related-articles-123-456-789' ||
          section.template_id === 'c2caf0b9-68b6-48c1-999c-4cc48bd12242') {
        console.log(`🚫 Skipping section: ${template.component_name} (${section.template_id})`)
        return null
      }

      const sectionData = section.title ? { ...section.data, title: section.title } : (section.data || {})

      console.log(`📦 Rendering: ${template.component_name} (${section.template_id})`)

    switch (template.component_name) {
      case 'SkipSection':
        console.log(`🚫 Skipping section: ${sectionData.title || 'Untitled'} (duplicate navigation)`)
        return null

      case 'HtmlHeroSection':
        return (
          <HtmlHeroSection 
            key={section.id}
            title={sectionData.title || post?.title}
            description={sectionData.subtitle || post?.excerpt}
            location={sectionData.location}
            heroImage={sectionData.backgroundImage}
            post={post}
            data={sectionData}
          />
        )

      case 'TableOfContentsSection':
        return <TableOfContentsSection key={section.id} data={sectionData} />

      case 'WhyChooseSection':
        return <WhyChooseSection key={section.id} data={sectionData} />

      case 'ComparisonTableSection':
        return <ComparisonTableSection key={section.id} data={sectionData} />

      case 'TipBoxesSection':
        return <TipBoxesSection key={section.id} data={sectionData} />

      case 'BudgetTimelineSection':
        return <BudgetTimelineSection key={section.id} data={sectionData} />

      case 'HtmlContentContainer':
        return (
          <HtmlContentContainer key={section.id} data={sectionData}>
            {/* Children are now optional since content can be passed via data prop */}
          </HtmlContentContainer>
        )

      case 'HeroSection':
        return (
          <HeroSection 
            key={section.id}
            title={sectionData.title || post?.title}
            description={sectionData.subtitle || post?.excerpt}
            location={sectionData.location}
            heroImage={sectionData.backgroundImage}
            post={post}
            data={sectionData}
          />
        )

      case 'RichTextContent':
        return (
          <RichTextEditor 
            key={section.id}
            content={sectionData.content || '<p>Content loading...</p>'}
          />
        )

      case 'StarterPackSection':
        return <StarterPackSection key={section.id} data={sectionData} />

      case 'HotelCarousel':
        return (
          <HotelCarouselNew 
            key={section.id}
            title={sectionData.title || 'Luxe lifestyle hotspots according to your zodiac'}
            description={sectionData.description || 'Top hotels offering luxury amenities'}
            destination={sectionData.destination || "the area"}
            hotels={sectionData.hotels || []}
          />
        )

      case 'ThingsToDoCards':
        return (
          <ThingsToDoCards 
            key={section.id} 
            destination={post?.title || ''} 
            title={sectionData.title || 'Things To Do'}
            description={sectionData.description || 'Discover amazing experiences'}
            activities={sectionData.activities || []}
          />
        )

      case 'AIItineraryCTA':
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

      case 'FAQSection':
        const faqs = sectionData.faqs?.map((faq: any, index: number) => ({
          id: faq.id || index,
          question: faq.question || faq.title,
          answer: faq.answer || faq.content
        })) || []
        return <FAQSection key={section.id} faqs={faqs} />

      case 'InternalLinksSection':
        return <InternalLinksSection key={section.id} data={sectionData} />

      case 'RelatedArticlesSection':
        // Skip Related Articles section - removed per user request
        return null

      case 'AuthorBlock':
        return (
          <AuthorBlock 
            key={section.id}
            name={sectionData.authorName || 'CuddlyNest Travel Team'}
            publishedDate={sectionData.publishedDate}
            updatedDate={sectionData.updatedDate}
          />
        )

      case 'WhereToStay':
        return <WhereToStay key={section.id} data={sectionData} />

      default:
        console.warn(`⚠️ Unknown component: ${template.component_name}`)
        return null
    }
    } catch (error) {
      console.error(`💥 Error rendering section ${section.template_id}:`, error)
      return (
        <div key={section.id} className="bg-red-50 border border-red-200 rounded p-4 m-4">
          <p className="text-red-800">Error rendering section: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      )
    }
  }

  // Sort sections by position
  const sortedSections = [...sections].sort((a, b) => a.position - b.position)
  
  // Determine layout type
  const useHtmlLayout = isHtmlStylePost(sortedSections)

  if (useHtmlLayout) {
    console.log('🎨 Using HTML-style layout')
    
    // Separate hero and content sections
    const heroSections = sortedSections.filter(section => {
      const template = getTemplateInfo(section.template_id)
      return template?.component_name === 'HtmlHeroSection'
    })

    const contentSections = sortedSections.filter(section => {
      const template = getTemplateInfo(section.template_id)
      return template?.component_name !== 'HtmlHeroSection' && section.is_active
    })

    console.log(`📄 Hero sections: ${heroSections.length}, Content sections: ${contentSections.length}`)

    return (
      <>
        {/* Hero sections - full width, no container */}
        {heroSections.map(section => {
          const renderedSection = renderSection(section)
          return renderedSection ? (
            <div key={section.id}>
              {renderedSection}
            </div>
          ) : null
        })}

        {/* White background container for all content */}
        <div className="bg-white min-h-screen">
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
      </>
    )
  }

  // Regular layout for non-HTML posts  
  console.log('📱 Using regular layout')
  
  // Pre-calculate the first content section index to avoid O(n²) complexity
  let firstContentSectionIndex = -1
  for (let i = 0; i < sortedSections.length; i++) {
    const section = sortedSections[i]
    const template = getTemplateInfo(section.template_id)
    const isHeroSection = template?.component_name === 'HeroSection'
    if (!isHeroSection) {
      firstContentSectionIndex = i
      break
    }
  }
  
  // Separate hero sections from content sections
  const heroSections = []
  const contentSections = []
  
  for (const section of sortedSections) {
    const template = getTemplateInfo(section.template_id)
    const isHeroSection = template?.component_name === 'HeroSection'
    
    if (isHeroSection) {
      heroSections.push(section)
    } else {
      contentSections.push(section)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Render hero sections */}
      {heroSections.map((section) => {
        const renderedSection = renderSection(section)
        if (!renderedSection) return null
        
        return (
          <div key={section.id} className="w-full">
            {renderedSection}
          </div>
        )
      })}
      
      {/* Unified container for all content sections */}
      {contentSections.length > 0 && (
        <div className="container mx-auto px-4 py-8 relative -mt-16 z-30 bg-white rounded-t-3xl shadow-xl">
          {contentSections.map((section, index) => {
            const renderedSection = renderSection(section)
            if (!renderedSection) return null
            
            return (
              <div key={section.id} className={index === contentSections.length - 1 ? "" : "mb-12"}>
                {renderedSection}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}