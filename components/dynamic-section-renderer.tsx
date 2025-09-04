'use client'

import React, { useState, useEffect, useRef } from 'react'
import { HeroSection } from './sections/hero-section'
import { AuthorBlock } from './author-block'
import RichTextEditor from './rich-text-editor'
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

// Helper function to detect generic FAQ content that should be hidden
function isGenericFAQContent(faqs: any[]): boolean {
  if (!faqs || faqs.length === 0) return true
  
  // Only filter out truly generic template phrases - be very specific
  const reallyGenericPhrases = [
    'the destination is beautiful year-round',
    'budget requirements vary based on your preferences',
    'every destination has its magic',
    'experiences that change your life',
    'this is a placeholder faq'
  ]
  
  // Only hide if ALL FAQs contain generic template language
  const allGeneric = faqs.every(faq => {
    const question = (faq.question || '').toLowerCase()
    const answer = (faq.answer || '').toLowerCase()
    
    return reallyGenericPhrases.some(generic => 
      question.includes(generic) || answer.includes(generic)
    ) || (question.length < 10 && answer.length < 20) // Very short/empty content
  })
  
  console.log(`FAQ filtering debug for ${faqs.length} FAQs:`, {
    firstQuestion: faqs[0]?.question,
    firstAnswer: faqs[0]?.answer?.substring(0, 100),
    allGeneric,
    willShow: !allGeneric
  })
  
  return allGeneric
}

// Helper function to detect generic starter pack content that should be hidden
function isGenericStarterPackContent(data: any): boolean {
  if (!data) return true
  
  const description = (data.description || '').toLowerCase()
  const title = (data.title || '').toLowerCase()
  
  // Only filter out extremely generic template phrases
  const reallyGenericPhrases = [
    'every destination has its magic',
    'experiences that change your life',
    'this is a placeholder'
  ]
  
  const hasGenericDescription = reallyGenericPhrases.some(phrase => 
    description.includes(phrase)
  )
  
  // Check for generic starter pack items - only filter completely empty or template items
  const items = data.items || data.highlights || []
  const hasGenericItems = items.length === 0 || items.every((item: any) => {
    const itemTitle = (item.title || '').toLowerCase()
    const itemValue = (item.value || item.text || '').toLowerCase() 
    const itemDesc = (item.description || '').toLowerCase()
    
    return (
      (itemTitle === 'perfect duration' && itemValue === '5-7 days' && itemDesc === 'just right to fall in love') ||
      (itemTitle === 'budget range' && itemValue === '€100-300' && itemDesc === 'per day, your way') ||
      (itemTitle === 'must-see spots' && itemValue === '10+ places' && itemDesc === 'instagram-worthy moments') ||
      (itemTitle === 'vibe check' && itemValue === 'pure magic' && itemDesc === 'you\'ll never want to leave')
    )
  })
  
  console.log(`StarterPack filtering debug:`, {
    hasGenericDescription,
    hasGenericItems,
    itemsCount: items.length,
    willShow: !(hasGenericDescription && hasGenericItems)
  })
  
  return hasGenericDescription && hasGenericItems
}

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

// Helper function to extract headings from HTML content
function extractHeadingsFromHTML(content: string): Array<{id: string, title: string, level: number}> {
  const matches: Array<{id: string, title: string, level: number}> = []
  
  // Pattern for headings H2-H6 with or without IDs
  const headingRegex = /<(h[2-6])([^>]*)>([^<]+)<\/h[2-6]>/gi
  let match
  
  while ((match = headingRegex.exec(content)) !== null) {
    const [, tag, attributes, title] = match
    const level = parseInt(tag.charAt(1))
    
    // Check if heading has an ID
    const idMatch = attributes.match(/id=["']([^"']+)["']/)
    const id = idMatch ? idMatch[1] : title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    matches.push({
      id,
      title: title.trim().replace(/<[^>]*>/g, ''),
      level
    })
  }
  
  return matches
}

// Helper function to extract headings from all sections
function extractTOCFromSections(sections: ModernSection[]): Array<{id: string, title: string, level: number}> {
  const allHeadings: Array<{id: string, title: string, level: number}> = []
  
  sections.forEach(section => {
    if (!section.is_active) return
    
    // Extract from section data content
    if (section.data?.content) {
      const headings = extractHeadingsFromHTML(section.data.content)
      allHeadings.push(...headings)
    }
    
    // Extract from section title if it's a heading level
    if (section.title && section.data?.headingLevel) {
      const level = section.data.headingLevel
      if (level >= 2 && level <= 6) {
        allHeadings.push({
          id: section.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
          title: section.title,
          level: level
        })
      }
    }
  })
  
  return allHeadings.sort((a, b) => a.level - b.level)
}

// Dynamic TOC Component for section-based pages
function DynamicTOC({ headings }: { headings: Array<{id: string, title: string, level: number}> }) {
  console.log('🎯 DynamicTOC received headings:', headings)
  
  if (headings.length === 0) {
    console.log('🚫 No headings provided to DynamicTOC')
    return null
  }

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    console.log('📍 Attempting to scroll to:', id)
    const element = document.getElementById(id)
    if (element) {
      console.log('✅ Found element, scrolling to:', element)
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      console.log('❌ Element not found in DOM:', id)
    }
  }

  return (
    <div className="mb-8 bg-blue-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 mt-0 text-gray-900">On this page</h3>
      <ul className="space-y-2">
        {headings.map((heading, index) => {
          console.log(`🔗 Rendering TOC item ${index + 1}:`, heading)
          return (
            <li 
              key={`${heading.id}-${heading.level}-${index}`}
              style={{ marginLeft: `${(heading.level - 2) * 16}px` }}
            >
              <a 
                href={`#${heading.id}`}
                onClick={(e) => scrollToHeading(heading.id, e)}
                className="text-blue-600 hover:text-blue-800 transition hover:underline flex items-center"
              >
                → {heading.title} (H{heading.level})
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DynamicSectionRenderer({ sections, post, language = 'en' }: DynamicSectionRendererProps) {
  console.log('🚀 DynamicSectionRenderer Starting:', {
    sectionsCount: sections.length,
    postTitle: post?.title
  })
  
  // State to hold dynamically extracted headings
  const [tocHeadings, setTocHeadings] = useState<Array<{id: string, title: string, level: number}>>(() => extractTOCFromSections(sections))
  const contentContainerRef = useRef<HTMLDivElement | null>(null)
  
  // Extract headings from rendered DOM content
  useEffect(() => {
    console.log('🔍 Starting client-side heading extraction...')
    
    const extractHeadingsFromDOM = () => {
      const headings: Array<{id: string, title: string, level: number}> = []
      
      // Find all H2-H6 headings in the page content (scope to content container if available)
      const scope: ParentNode = contentContainerRef.current || document
      const headingElements = scope.querySelectorAll('h2, h3, h4, h5, h6')
      
      headingElements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase()
        const level = parseInt(tagName.charAt(1))
        const title = element.textContent?.trim() || ''
        
        // Get existing ID or generate one
        let id = element.id
        if (!id && title) {
          id = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)
          
          // Add index to avoid duplicates
          if (index > 0) {
            id += `-${index}`
          }
          
          // Set the ID on the element so links work
          element.id = id
        }
        
        if (title && id) {
          headings.push({ id, title, level })
        }
      })
      
      console.log('🎯 Extracted headings from DOM:', headings)
      return headings
    }
    
    // Small delay to ensure all sections are rendered
    const timer = setTimeout(() => {
      const domHeadings = extractHeadingsFromDOM()
      const merged = [...extractTOCFromSections(sections), ...domHeadings]
      const seen = new Set<string>()
      const unique = merged.filter(h => {
        const key = `${h.id}|${h.title}|${h.level}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setTocHeadings(unique)
    }, 300)
    
    // Observe mutations so late-rendered headings are captured
    let observer: MutationObserver | null = null
    if (contentContainerRef.current) {
      observer = new MutationObserver(() => {
        const domHeadings = extractHeadingsFromDOM()
        const merged = [...extractTOCFromSections(sections), ...domHeadings]
        const seen = new Set<string>()
        const unique = merged.filter(h => {
          const key = `${h.id}|${h.title}|${h.level}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setTocHeadings(unique)
      })
      observer.observe(contentContainerRef.current, { childList: true, subtree: true })
    }

    return () => {
      clearTimeout(timer)
      if (observer) observer.disconnect()
    }
  }, [sections]) // Re-run when sections change

  const renderSection = (section: ModernSection) => {
    try {
      if (!section.is_active) return null

      const template = getTemplateInfo(section.template_id) || section.template
      if (!template?.component_name) {
        console.error(`❌ No template found for: ${section.template_id}`)
        return null
      }

      // Skip Related Articles section - removed per user request  
      if (template.component_name === 'RelatedArticlesSection' || 
          template.name?.includes('related-articles') ||
          section.template_id === 'related-articles-123-456-789') {
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
        // Don't render starter pack section if it contains generic template content
        if (isGenericStarterPackContent(sectionData)) {
          console.log(`🚫 Skipping StarterPackSection for post: ${post?.slug} - Generic template content detected`)
          return null
        }
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
        
        // Don't render FAQ section if no FAQs or only generic template FAQs
        const hasLegitimateContent = faqs.length > 0 && !isGenericFAQContent(faqs)
        if (!hasLegitimateContent) {
          console.log(`🚫 Skipping FAQ section for post: ${post?.slug} - Generic or empty content detected`)
          return null
        }
        
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
            {/* Auto-generated TOC for pages with headings */}
            {tocHeadings.length > 0 && (
              <DynamicTOC headings={tocHeadings} />
            )}
            
            <div ref={contentContainerRef}>
            {contentSections.map(section => {
              const renderedSection = renderSection(section)
              return renderedSection ? (
                <div key={section.id} className="mb-8 last:mb-0">
                  {renderedSection}
                </div>
              ) : null
            })}
            </div>
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
        <div ref={contentContainerRef} className="container mx-auto px-4 py-8 relative -mt-16 z-30 bg-white rounded-t-3xl shadow-xl">
          {/* Auto-generated TOC for pages with headings */}
          {tocHeadings.length > 0 && (
            <DynamicTOC headings={tocHeadings} />
          )}
          
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
