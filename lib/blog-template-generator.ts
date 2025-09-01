import { ModernPost } from './supabase'

interface GeneratedTemplateData {
  id: string
  title: string
  excerpt: string
  slug: string
  author: {
    display_name: string
    bio: string
    avatar?: string
  }
  published_at: string
  updated_at?: string
  read_time: string
  seo_title?: string
  seo_description?: string
  meta_keywords?: string
  og_image?: { file_url: string }
  featured_image?: { file_url: string }
  content: string
  faqs: Array<{
    id: number
    question: string
    answer: string
  }>
  status: string
  categories: string[]
}

// Generate template-friendly content from post sections with real content
function generateContentFromPost(post: ModernPost): string {
  // Priority 1: Extract real content from post sections if available
  if (post.sections && post.sections.length > 0) {
    let extractedContent = ''
    
    for (const section of post.sections) {
      const sectionData = section.data || {}
      
      // Extract text content from various section types
      if (sectionData.content && typeof sectionData.content === 'string' && sectionData.content.trim().length > 50) {
        // Clean WordPress/HTML content
        const cleanContent = cleanWordPressContent(sectionData.content)
        extractedContent += cleanContent + '\n\n'
      } else if (sectionData.text && typeof sectionData.text === 'string' && sectionData.text.trim().length > 50) {
        extractedContent += `<p>${sectionData.text}</p>\n\n`
      } else if (sectionData.description && typeof sectionData.description === 'string' && sectionData.description.trim().length > 50) {
        extractedContent += `<p>${sectionData.description}</p>\n\n`
      }
      
      // Handle structured content like lists, attractions, etc.
      if (sectionData.items && Array.isArray(sectionData.items)) {
        sectionData.items.forEach((item: any) => {
          if (item.name || item.title) {
            extractedContent += `<h3>${item.name || item.title}</h3>\n`
          }
          if (item.description || item.content) {
            extractedContent += `<p>${item.description || item.content}</p>\n`
          }
          if (item.text) {
            extractedContent += `<p>${item.text}</p>\n`
          }
        })
        extractedContent += '\n'
      }
    }
    
    // If we extracted substantial content from sections, use it
    if (extractedContent.trim().length > 200) {
      return extractedContent.trim()
    }
  }
  
  // Priority 2: Use post content field if available
  if (post.content && post.content.trim().length > 100) {
    return post.content
  }
  
  // Priority 3: Fallback to generating content from title and excerpt (last resort)
  const title = post.title
  const excerpt = post.excerpt || ''
  
  const sections = [
    {
      heading: `Overview of ${title.replace(/^(The |A |An )/i, '')}`,
      content: excerpt || `This comprehensive guide covers everything you need to know about ${title.toLowerCase()}. Whether you're a first-time visitor or a seasoned traveler, you'll find valuable insights and practical tips to make the most of your experience.`
    },
    {
      heading: 'Essential Information',
      content: `Before diving into the details, here are the key points to consider when planning your visit. These insights will help you prepare and ensure you have the best possible experience during your trip.`
    },
    {
      heading: 'Top Recommendations',
      content: `Based on extensive research and traveler feedback, we've compiled the most recommended options and experiences. These selections represent the best value and most memorable aspects of your journey.`
    },
    {
      heading: 'Practical Tips and Insights',
      content: `To help you navigate successfully, here are practical tips from local experts and experienced travelers. These insider insights can save you time, money, and help you avoid common pitfalls.`
    }
  ]

  return sections
    .map(section => `<h2 id="${section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${section.heading}</h2>\n<p>${section.content}</p>`)
    .join('\n\n')
}

// Clean WordPress content from sections
function cleanWordPressContent(content: string): string {
  if (!content) return ''

  // Remove WordPress-specific elements and clean HTML
  let cleanedContent = content
    // Remove inline CSS styles that might interfere with the template
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    
    // Remove WordPress shortcodes
    .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/g, '$1')
    .replace(/\[gallery[^\]]*\]/g, '')
    .replace(/\[embed[^\]]*\](.*?)\[\/embed\]/g, '$1')
    
    // Clean up excessive whitespace and line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()

  return cleanedContent
}

// Generate FAQs based on post content
function generateFAQsFromPost(post: ModernPost): Array<{id: number, question: string, answer: string}> {
  const title = post.title
  const destination = extractDestinationFromTitle(title)
  
  const baseFAQs = [
    {
      id: 1,
      question: `What is the best time to visit ${destination || 'this destination'}?`,
      answer: `The best time to visit depends on your preferences for weather, crowds, and activities. Generally, shoulder seasons offer the best balance of good weather and fewer crowds.`
    },
    {
      id: 2,
      question: `How much time should I spend ${destination ? `in ${destination}` : 'here'}?`,
      answer: `We recommend spending at least 2-3 days to properly experience the highlights, though a longer stay allows for a more relaxed pace and deeper exploration.`
    },
    {
      id: 3,
      question: `What should I budget for this trip?`,
      answer: `Budget depends on your travel style, but expect to spend on accommodation, meals, transportation, and activities. We recommend researching current prices and booking in advance for better deals.`
    },
    {
      id: 4,
      question: `Are there any cultural considerations I should be aware of?`,
      answer: `It's always good to research local customs, dress codes, tipping practices, and basic etiquette to show respect for the local culture and enhance your experience.`
    },
    {
      id: 5,
      question: `What are the must-see attractions?`,
      answer: `The top attractions vary by destination, but generally include historical sites, cultural landmarks, natural wonders, and unique local experiences that define the character of the place.`
    }
  ]
  
  return baseFAQs
}

// Extract destination from title using common patterns
function extractDestinationFromTitle(title: string): string | null {
  // Common patterns: "Best places in Paris", "Things to do in London", "3 days in Rome"
  const patterns = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:Travel|Guide|Trip)/i
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

// Generate categories from post title and content
function generateCategoriesFromPost(post: ModernPost): string[] {
  const title = post.title.toLowerCase()
  const categories: string[] = ['Travel']
  
  // Add categories based on keywords in title
  if (title.includes('food') || title.includes('restaurant') || title.includes('dining')) {
    categories.push('Food & Dining')
  }
  if (title.includes('hotel') || title.includes('accommodation') || title.includes('stay')) {
    categories.push('Accommodation')
  }
  if (title.includes('shopping') || title.includes('market')) {
    categories.push('Shopping')
  }
  if (title.includes('nightlife') || title.includes('bar') || title.includes('club')) {
    categories.push('Nightlife')
  }
  if (title.includes('museum') || title.includes('art') || title.includes('culture')) {
    categories.push('Culture & Arts')
  }
  if (title.includes('beach') || title.includes('nature') || title.includes('outdoor')) {
    categories.push('Nature & Outdoors')
  }
  if (title.includes('castle') || title.includes('palace') || title.includes('historic')) {
    categories.push('History & Architecture')
  }
  
  // Add destination-based categories
  const destination = extractDestinationFromTitle(post.title)
  if (destination) {
    categories.push(destination)
  }
  
  return categories
}

// Convert a ModernPost to template-compatible data
export function convertPostToTemplate(post: ModernPost): GeneratedTemplateData {
  const readingTime = post.reading_time || 5
  
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || post.title,
    slug: post.slug,
    author: {
      display_name: post.author?.display_name || 'CuddlyNest Travel Team',
      bio: post.author?.bio || `${post.author?.display_name || 'Our travel expert'} is a passionate writer who specializes in creating comprehensive guides that help travelers discover authentic experiences around the world. With years of expertise in travel journalism, they provide insider tips and practical advice for memorable journeys.`,
      avatar: post.author?.avatar_url
    },
    published_at: post.published_at || post.created_at,
    updated_at: post.updated_at,
    read_time: `${readingTime} mins read`,
    seo_title: post.meta_title || post.title,
    seo_description: post.meta_description || post.excerpt,
    meta_keywords: `travel, ${post.title}, travel guide`,
    og_image: post.og_image,
    featured_image: post.og_image,
    content: generateContentFromPost(post),
    faqs: generateFAQsFromPost(post),
    status: post.status,
    categories: generateCategoriesFromPost(post)
  }
}