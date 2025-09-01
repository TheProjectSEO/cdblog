import { LegacyBlogPost, LegacyBlogAuthor, LegacyBlogCategory } from './supabase'

interface LegacyGeneratedTemplateData {
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

// Clean and process HTML content from WordPress
function cleanHTMLContent(content: string): string {
  if (!content) return ''

  // Remove WordPress specific shortcodes and clean up HTML
  let cleanedContent = content
    // Remove common WordPress shortcodes
    .replace(/\[caption[^\]]*\](.*?)\[\/caption\]/g, '$1')
    .replace(/\[gallery[^\]]*\]/g, '')
    .replace(/\[embed[^\]]*\](.*?)\[\/embed\]/g, '$1')
    
    // Clean up excessive whitespace and line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()

  // If content is very short, pad it with introductory text
  if (cleanedContent.length < 200) {
    const titleWord = extractTitleKeywords(content || 'this topic')
    cleanedContent = `<p>This comprehensive guide covers everything you need to know about ${titleWord}. Whether you're a first-time visitor or a seasoned traveler, you'll find valuable insights and practical tips.</p>\n\n${cleanedContent}`
  }

  return cleanedContent
}

// Clean WordPress content from modern_post_sections
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

// Extract keywords from title for content generation
function extractTitleKeywords(title: string): string {
  const cleanTitle = title.toLowerCase()
    .replace(/^(the|a|an|best|top|ultimate|complete|guide|to)\s+/gi, '')
    .replace(/\s+(guide|tips|advice|information)$/gi, '')
  
  return cleanTitle || 'travel experiences'
}

// Generate reading time based on content length
function calculateReadingTime(content: string): number {
  if (!content) return 3
  
  const wordsPerMinute = 200
  const textContent = content.replace(/<[^>]*>/g, '') // Strip HTML
  const wordCount = textContent.split(/\s+/).length
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
  
  return Math.min(readingTime, 15) // Cap at 15 minutes
}

// Generate FAQs based on legacy post content and title
function generateFAQsFromLegacyPost(post: LegacyBlogPost): Array<{id: number, question: string, answer: string}> {
  const title = post.title
  const content = post.content || ''
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
    }
  ]

  // Add content-specific FAQs if we can extract useful information
  if (content.toLowerCase().includes('hotel') || content.toLowerCase().includes('accommodation')) {
    baseFAQs.push({
      id: 4,
      question: 'What are the best accommodation options?',
      answer: 'There are various accommodation options ranging from budget-friendly hostels to luxury hotels. Consider your budget, location preferences, and desired amenities when choosing.'
    })
  }

  if (content.toLowerCase().includes('food') || content.toLowerCase().includes('restaurant')) {
    baseFAQs.push({
      id: 5,
      question: 'What are the must-try local dishes?',
      answer: 'Each destination has its unique culinary offerings. We recommend trying local specialties and visiting highly-rated restaurants for an authentic dining experience.'
    })
  }
  
  return baseFAQs.slice(0, 5) // Limit to 5 FAQs
}

// Extract destination from title using common patterns
function extractDestinationFromTitle(title: string): string | null {
  // Common patterns: "Best places in Paris", "Things to do in London", "3 days in Rome"
  const patterns = [
    /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*(?:Travel|Guide|Trip|Visit)/i
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

// Generate categories from legacy post title and content
function generateCategoriesFromLegacyPost(post: LegacyBlogPost, legacyCategories?: any[]): string[] {
  const title = post.title.toLowerCase()
  const content = (post.content || '').toLowerCase()
  const categories: string[] = ['Travel']
  
  // Add categories based on keywords in title and content
  const combinedText = `${title} ${content}`.toLowerCase()
  
  if (combinedText.includes('food') || combinedText.includes('restaurant') || combinedText.includes('dining') || combinedText.includes('cuisine')) {
    categories.push('Food & Dining')
  }
  if (combinedText.includes('hotel') || combinedText.includes('accommodation') || combinedText.includes('stay') || combinedText.includes('resort')) {
    categories.push('Accommodation')
  }
  if (combinedText.includes('shopping') || combinedText.includes('market') || combinedText.includes('souvenir')) {
    categories.push('Shopping')
  }
  if (combinedText.includes('nightlife') || combinedText.includes('bar') || combinedText.includes('club') || combinedText.includes('entertainment')) {
    categories.push('Nightlife')
  }
  if (combinedText.includes('museum') || combinedText.includes('art') || combinedText.includes('culture') || combinedText.includes('history')) {
    categories.push('Culture & Arts')
  }
  if (combinedText.includes('beach') || combinedText.includes('nature') || combinedText.includes('outdoor') || combinedText.includes('hiking')) {
    categories.push('Nature & Outdoors')
  }
  if (combinedText.includes('castle') || combinedText.includes('palace') || combinedText.includes('historic') || combinedText.includes('monument')) {
    categories.push('History & Architecture')
  }
  if (combinedText.includes('flight') || combinedText.includes('airport') || combinedText.includes('airline') || combinedText.includes('booking')) {
    categories.push('Travel Tips')
  }
  
  // Add destination-based categories
  const destination = extractDestinationFromTitle(post.title)
  if (destination) {
    categories.push(destination)
  }

  // Add legacy categories if available
  if (legacyCategories && legacyCategories.length > 0) {
    legacyCategories.forEach((cat: any) => {
      if (cat.blog_categories && cat.blog_categories.name) {
        categories.push(cat.blog_categories.name)
      }
    })
  }
  
  return [...new Set(categories)] // Remove duplicates
}

// Generate comprehensive content from blog sections
function generateContentFromSections(blogSections?: Array<any>, modernWordPressContent?: Array<any>): string {
  // Prioritize modern WordPress content if available
  if (modernWordPressContent && modernWordPressContent.length > 0) {
    let wordpressContent = ''
    
    modernWordPressContent.forEach((section) => {
      const sectionData = section.data || {}
      
      // Extract the actual WordPress content from the data field
      if (sectionData.content && typeof sectionData.content === 'string' && sectionData.content.length > 100) {
        // Clean up the WordPress content
        const cleanContent = cleanWordPressContent(sectionData.content)
        wordpressContent += cleanContent + '\n\n'
      }
    })
    
    if (wordpressContent.trim().length > 100) {
      return wordpressContent.trim()
    }
  }

  // Fallback to legacy blog sections if no modern content available
  if (!blogSections || blogSections.length === 0) {
    return 'This comprehensive travel guide provides detailed information to help you plan your perfect trip.'
  }

  let content = ''
  
  blogSections.forEach((section, index) => {
    const sectionContent = section.content || {}
    
    // Handle different section types
    switch (section.section_type) {
      case 'heroSection':
        if (sectionContent.description) {
          content += `<p>${sectionContent.description}</p>\n\n`
        }
        if (sectionContent.subtitle) {
          content += `<p>${sectionContent.subtitle}</p>\n\n`
        }
        break

      case 'attractions':
        content += `<h2>${section.title || 'Must-Visit Attractions'}</h2>\n`
        if (sectionContent.description) {
          content += `<p>${sectionContent.description}</p>\n`
        }
        if (sectionContent.items && sectionContent.items.length > 0) {
          sectionContent.items.forEach((item: any, itemIndex: number) => {
            content += `<h3>${item.name || `Attraction ${itemIndex + 1}`}</h3>\n`
            if (item.description) {
              content += `<p>${item.description}</p>\n`
            }
            if (item.rating) {
              content += `<p><strong>Rating:</strong> ${item.rating}/5</p>\n`
            }
            if (item.location) {
              content += `<p><strong>Location:</strong> ${item.location}</p>\n`
            }
            content += '\n'
          })
        }
        content += '\n'
        break

      case 'localTips':
        content += `<h2>${section.title || 'Local Tips & Recommendations'}</h2>\n`
        if (sectionContent.description) {
          content += `<p>${sectionContent.description}</p>\n`
        }
        if (sectionContent.tips && sectionContent.tips.length > 0) {
          content += '<ul>\n'
          sectionContent.tips.forEach((tip: any) => {
            content += `<li>${tip.description || tip.title || tip.text}</li>\n`
          })
          content += '</ul>\n\n'
        }
        break

      case 'accommodation':
        content += `<h2>${section.title || 'Where to Stay'}</h2>\n`
        if (sectionContent.description) {
          content += `<p>${sectionContent.description}</p>\n`
        }
        if (sectionContent.items && sectionContent.items.length > 0) {
          sectionContent.items.forEach((hotel: any) => {
            content += `<h3>${hotel.name}</h3>\n`
            if (hotel.description) {
              content += `<p>${hotel.description}</p>\n`
            }
            if (hotel.price_range) {
              content += `<p><strong>Price Range:</strong> ${hotel.price_range}</p>\n`
            }
            if (hotel.rating) {
              content += `<p><strong>Rating:</strong> ${hotel.rating}/5</p>\n`
            }
            content += '\n'
          })
        }
        content += '\n'
        break

      case 'food':
      case 'dining':
        content += `<h2>${section.title || 'Food & Dining'}</h2>\n`
        if (sectionContent.description) {
          content += `<p>${sectionContent.description}</p>\n`
        }
        if (sectionContent.items && sectionContent.items.length > 0) {
          sectionContent.items.forEach((restaurant: any) => {
            content += `<h3>${restaurant.name}</h3>\n`
            if (restaurant.description) {
              content += `<p>${restaurant.description}</p>\n`
            }
            if (restaurant.cuisine_type) {
              content += `<p><strong>Cuisine:</strong> ${restaurant.cuisine_type}</p>\n`
            }
            if (restaurant.price_range) {
              content += `<p><strong>Price Range:</strong> ${restaurant.price_range}</p>\n`
            }
            content += '\n'
          })
        }
        content += '\n'
        break

      default:
        // Handle generic sections
        if (section.title) {
          content += `<h2>${section.title}</h2>\n`
        }
        
        // Try to extract any textual content from the section
        if (typeof sectionContent === 'object') {
          if (sectionContent.description) {
            content += `<p>${sectionContent.description}</p>\n\n`
          } else if (sectionContent.content) {
            content += `<p>${sectionContent.content}</p>\n\n`
          } else if (sectionContent.text) {
            content += `<p>${sectionContent.text}</p>\n\n`
          }
          
          // Handle arrays of items
          if (sectionContent.items && Array.isArray(sectionContent.items)) {
            sectionContent.items.forEach((item: any) => {
              if (typeof item === 'string') {
                content += `<p>${item}</p>\n`
              } else if (item && typeof item === 'object') {
                if (item.name || item.title) {
                  content += `<h3>${item.name || item.title}</h3>\n`
                }
                if (item.description || item.content) {
                  content += `<p>${item.description || item.content}</p>\n`
                }
              }
            })
            content += '\n'
          }
        } else if (typeof sectionContent === 'string') {
          content += `<p>${sectionContent}</p>\n\n`
        }
        break
    }
  })

  // If we still don't have much content, add a fallback
  if (content.length < 200) {
    content += '<p>This destination offers unique experiences and attractions that make it a perfect travel destination. Plan your visit to discover local culture, cuisine, and hidden gems that await you.</p>\n\n'
  }

  return content.trim()
}

// Generate FAQs from blog sections data
function generateFAQsFromSections(post: LegacyBlogPost): Array<{id: number, question: string, answer: string}> {
  const destination = extractDestinationFromTitle(post.title)
  const sections = post.blog_sections || []
  const faqs: Array<{id: number, question: string, answer: string}> = []
  
  // Base FAQs
  faqs.push({
    id: 1,
    question: `What is the best time to visit ${destination || 'this destination'}?`,
    answer: `The best time to visit depends on your preferences for weather, crowds, and activities. Generally, shoulder seasons offer the best balance of good weather and fewer crowds.`
  })

  // Generate FAQs based on sections content
  let faqId = 2
  
  sections.forEach((section) => {
    const sectionContent = section.content || {}
    
    switch (section.section_type) {
      case 'attractions':
        if (sectionContent.items && sectionContent.items.length > 0) {
          faqs.push({
            id: faqId++,
            question: `What are the must-see attractions ${destination ? `in ${destination}` : 'here'}?`,
            answer: `Some of the top attractions include ${sectionContent.items.slice(0, 3).map((item: any) => item.name).join(', ')}. Each offers unique experiences and is worth visiting during your trip.`
          })
        }
        break
        
      case 'accommodation':
        if (sectionContent.items && sectionContent.items.length > 0) {
          faqs.push({
            id: faqId++,
            question: 'What are the best accommodation options?',
            answer: `There are various accommodation options available, ranging from budget-friendly to luxury stays. Popular choices include hotels with great amenities and locations that provide easy access to major attractions.`
          })
        }
        break
        
      case 'localTips':
        if (sectionContent.tips && sectionContent.tips.length > 0) {
          faqs.push({
            id: faqId++,
            question: 'What are some insider tips for visiting?',
            answer: `Local tips include: ${sectionContent.tips.slice(0, 2).map((tip: any) => tip.title || tip.description || tip.text).join(', ')}. These insider recommendations will help you make the most of your visit.`
          })
        }
        break
        
      case 'food':
      case 'dining':
        if (sectionContent.items && sectionContent.items.length > 0) {
          faqs.push({
            id: faqId++,
            question: 'What are the must-try local dishes?',
            answer: `The local cuisine offers amazing dining experiences. Popular restaurants and dishes provide authentic flavors that reflect the region's culinary heritage.`
          })
        }
        break
    }
  })

  // Budget FAQ
  faqs.push({
    id: faqId++,
    question: `What should I budget for this trip?`,
    answer: `Budget depends on your travel style, but expect to spend on accommodation, meals, transportation, and activities. We recommend researching current prices and booking in advance for better deals.`
  })
  
  return faqs.slice(0, 5) // Limit to 5 FAQs
}

// Convert a LegacyBlogPost to template-compatible data
export function convertLegacyPostToTemplate(
  post: LegacyBlogPost, 
  author?: LegacyBlogAuthor | any,
  categories?: LegacyBlogCategory[] | any[]
): LegacyGeneratedTemplateData {
  // Generate content from modern WordPress content first, then fallback to blog sections
  const richContent = generateContentFromSections(post.blog_sections, post.modern_wordpress_content)
  const readingTime = calculateReadingTime(richContent)
  
  // Handle author data - it might be nested in the post object
  const authorData = author || (post as any).blog_authors || null
  const authorName = authorData?.display_name || 
                    `${authorData?.first_name || ''} ${authorData?.last_name || ''}`.trim() || 
                    'CuddlyNest Travel Team'
  
  const authorBio = `${authorName} is a passionate travel writer who specializes in creating comprehensive guides that help travelers discover authentic experiences around the world. With years of expertise in travel journalism, they provide insider tips and practical advice for memorable journeys.`

  return {
    id: post.id.toString(),
    title: post.title,
    excerpt: post.excerpt || post.title,
    slug: post.slug,
    author: {
      display_name: authorName,
      bio: authorBio,
      avatar: post.featured_image_url // Use featured image as author avatar fallback
    },
    published_at: post.published_at || post.created_at,
    updated_at: post.modified_at || post.updated_at,
    read_time: `${readingTime} mins read`,
    seo_title: post.seo_title || post.title,
    seo_description: post.meta_description || post.excerpt,
    meta_keywords: `travel, ${post.title}, travel guide`,
    og_image: post.featured_image_url ? { file_url: post.featured_image_url } : undefined,
    featured_image: post.featured_image_url ? { file_url: post.featured_image_url } : undefined,
    content: richContent, // Use the rich content generated from sections
    faqs: generateFAQsFromSections(post), // Generate FAQs from sections
    status: post.status === 'publish' ? 'published' : post.status,
    categories: generateCategoriesFromLegacyPost(post, categories)
  }
}

// Function to check if a post has substantial content
export function hasSubstantialContent(post: LegacyBlogPost): boolean {
  // Check if post has blog sections with content
  if (post.blog_sections && post.blog_sections.length > 0) {
    return true // Posts with sections are considered substantial
  }
  
  // Fallback to checking the content field
  const content = post.content || ''
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  
  // Consider it substantial if it has more than 100 characters of text content
  return textContent.length > 100
}