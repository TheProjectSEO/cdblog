// Utility functions for the blog template

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  author: {
    display_name: string
    bio?: string
    avatar?: string
  }
  published_at: string
  updated_at?: string
  read_time?: string
  featured_image_url?: string
  featured_image?: { file_url: string }
  seo_title?: string
  seo_description?: string
  meta_keywords?: string
  categories?: string[]
  faqs?: Array<{
    id: string | number
    question: string
    answer: string
  }>
  status?: string
}

export function convertBlogPostToTemplate(post: BlogPost) {
  // Convert read_time to proper format
  const readTime = post.read_time || calculateReadTime(post.content)
  
  // Extract categories if they exist
  const categories = post.categories || ['Travel']
  
  // Get the featured image
  const featuredImageUrl = post.featured_image?.file_url || post.featured_image_url
  
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    author: {
      display_name: post.author.display_name,
      bio: post.author.bio,
      avatar: post.author.avatar
    },
    published_at: post.published_at,
    updated_at: post.updated_at,
    read_time: readTime,
    seo_title: post.seo_title || post.title,
    seo_description: post.seo_description || post.excerpt,
    meta_keywords: post.meta_keywords,
    og_image: {
      file_url: featuredImageUrl || '/blog-images/default-og.png'
    },
    featured_image: featuredImageUrl ? {
      file_url: featuredImageUrl
    } : undefined,
    content: processContentForTemplate(post.content),
    faqs: post.faqs || [],
    status: post.status || 'published',
    categories: categories
  }
}

function calculateReadTime(content: string): string {
  // Average reading speed is 200 words per minute
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min${minutes !== 1 ? 's' : ''} read`
}

function processContentForTemplate(content: string): string {
  // Process the content to add proper IDs to headings for TOC
  let processedContent = content
  
  // Add IDs to H1 and H2 tags if they don't have them
  processedContent = processedContent.replace(
    /<(h[12])([^>]*)>([^<]+)<\/h[12]>/gi,
    (match, tag, attributes, text) => {
      // Check if ID already exists
      if (attributes.includes('id=')) {
        return match
      }
      
      // Generate ID from text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      return `<${tag}${attributes} id="${id}">${text}</${tag}>`
    }
  )
  
  // Wrap images in proper divs with spacing
  processedContent = processedContent.replace(
    /<img([^>]+)>/gi,
    (match, attributes) => {
      return `<div className="relative mb-8" style={{ width: '851px', height: '395px', marginTop: '48px' }}>
        <img${attributes} className="w-full h-full object-cover" style={{ borderRadius: '15px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" style={{ borderRadius: '15px' }}></div>
      </div>`
    }
  )
  
  return processedContent
}

// Sample FAQs for different types of articles
export const defaultFAQs = {
  travel: [
    {
      id: 1,
      question: "What's the best time to visit this destination?",
      answer: "The best time to visit depends on your preferences for weather, crowds, and activities. Generally, shoulder seasons offer the best balance of good weather and fewer tourists."
    },
    {
      id: 2,
      question: "How many days should I plan for this trip?",
      answer: "We recommend at least 4-5 days to see the major attractions, though a week allows for a more relaxed pace and deeper exploration."
    },
    {
      id: 3,
      question: "What's the average budget for this destination?",
      answer: "Budgets vary greatly depending on accommodation choices, dining preferences, and activities. Budget travelers can expect to spend $50-100 per day, while luxury travelers might spend $300+ per day."
    },
    {
      id: 4,
      question: "Do I need any special documents or visas?",
      answer: "Visa requirements depend on your nationality and the destination. Check with the embassy or consulate of your destination country for the most current requirements."
    },
    {
      id: 5,
      question: "What should I pack for this trip?",
      answer: "Packing essentials vary by destination and season. Generally include comfortable walking shoes, weather-appropriate clothing, travel adapters, and any necessary medications."
    }
  ],
  accommodation: [
    {
      id: 1,
      question: "What types of accommodations are available?",
      answer: "Options range from budget hostels and guesthouses to luxury hotels and unique stays like vacation rentals, boutique hotels, and local homestays."
    },
    {
      id: 2,
      question: "How far in advance should I book?",
      answer: "For popular destinations and peak seasons, book 2-3 months in advance. For budget options or last-minute deals, you might find good options 1-2 weeks ahead."
    },
    {
      id: 3,
      question: "What amenities should I look for?",
      answer: "Consider your priorities: Wi-Fi, breakfast included, location relative to attractions, parking, pool, gym, or kitchen facilities for longer stays."
    }
  ]
}

// Helper function to generate metadata for Next.js
export function generateArticleMetadata(article: any) {
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    keywords: article.meta_keywords,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      type: 'article',
      locale: 'en',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
      authors: [article.author.display_name],
      images: [{
        url: article.og_image?.file_url || article.featured_image?.file_url,
        alt: article.title
      }]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@cuddlynest',
      title: article.seo_title || article.title,
      description: article.seo_description || article.excerpt,
      images: [{
        url: article.og_image?.file_url || article.featured_image?.file_url,
        alt: article.title
      }]
    }
  }
}