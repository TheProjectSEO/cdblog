'use client'

import { Footer } from "@/components/footer"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar, Clock, Share2, User } from "lucide-react"
import { useEffect, useState } from 'react'

// Types
interface Author {
  display_name: string
  bio?: string
  avatar?: string
}

interface FAQ {
  id: string | number
  question: string
  answer: string
}

interface ArticleImage {
  src: string
  alt: string
  caption?: string
}

interface TOCItem {
  id: string
  title: string
  level: number // 1 for H1, 2 for H2, etc.
}

interface BlogArticleData {
  id: string
  title: string
  excerpt?: string
  slug: string
  author: Author
  published_at: string
  updated_at?: string
  read_time: string
  seo_title?: string
  seo_description?: string
  meta_keywords?: string
  og_image: {
    file_url: string
  }
  featured_image?: {
    file_url: string
  }
  content: string // HTML or markdown content
  images?: ArticleImage[]
  faqs?: FAQ[]
  status: string
  categories?: string[]
}

interface BlogArticleTemplateProps {
  article: BlogArticleData
  availableTranslations?: any[]
}

// Table of Contents Component
function ArticleTableOfContents({ tocItems }: { tocItems: TOCItem[] }) {
  const [activeSection, setActiveSection] = useState(tocItems[0]?.id || '')

  useEffect(() => {
    const handleScroll = () => {
      const sections = tocItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }))

      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.element) {
          const sectionTop = section.element.offsetTop
          if (scrollPosition >= sectionTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  const handleClick = (id: string, event: React.MouseEvent) => {
    event.preventDefault()
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  if (tocItems.length === 0) return null

  return (
    <div className="mb-8" style={{ minHeight: '189px' }}>
      {/* TOC Title */}
      <div style={{ width: '136px', height: '29px', marginBottom: '72px' }}>
        <h3 
          className="text-[#242526]"
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: '21px',
            lineHeight: '1.4em'
          }}
        >
          On this page
        </h3>
      </div>
      
      {/* TOC Navigation Links */}
      <div>
        <div className="space-y-0">
          {tocItems.map((item, index) => (
            <div 
              key={item.id}
              style={{ 
                height: '23px', 
                marginBottom: index < tocItems.length - 1 ? '24px' : '0px' 
              }}
            >
              <button 
                onClick={(e) => handleClick(item.id, e)}
                className={`text-left w-full ${
                  activeSection === item.id 
                    ? 'text-[#242526] hover:text-[#242526]' 
                    : 'text-[#797882] hover:text-[#242526]'
                } transition-colors duration-200`}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: activeSection === item.id ? 600 : 500,
                  fontSize: '15px',
                  lineHeight: '1.5em',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  paddingLeft: item.level === 2 ? '16px' : '0px' // Indent H2s
                }}
              >
                {item.title}
              </button>
              {index < tocItems.length - 1 && (
                <div className="w-full h-[1px] bg-[#DFE2E5] mt-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BlogArticleTemplate({ article, availableTranslations = [] }: BlogArticleTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In the future, this will connect to the database
      // For now, redirect to a search results page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }
  // Extract headings from content to generate TOC
  const extractTOCFromContent = (content: string): TOCItem[] => {
    const headingRegex = /<(h[12])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h[12]>/gi
    const matches = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      const [, tag, id, title] = match
      matches.push({
        id,
        title: title.trim(),
        level: parseInt(tag.charAt(1))
      })
    }
    
    return matches
  }

  const tocItems = extractTOCFromContent(article.content)

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.seo_description,
    image: article.og_image?.file_url || article.featured_image?.file_url,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author.display_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CuddlyNest',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cuddlynest.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cuddlynest.com/article/${article.slug}`,
    },
    articleSection: 'Travel Guide',
    keywords: article.meta_keywords,
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main container with fixed 1600px width */}
      <div className="w-[1600px] mx-auto bg-white min-h-screen relative">
        
        {/* Sticky Header - Exact Figma Implementation */}
        <header 
          className="sticky top-0 z-50 bg-white"
          style={{ width: '1600px', height: '79px' }}
        >
          {/* Logo - Colored version with birds */}
          <div 
            style={{
              position: 'absolute',
              left: '100px',
              top: '18px',
              width: '200px',
              height: '43.61px'
            }}
          >
            <Link href="/blog">
              <div className="cursor-pointer w-full h-full relative">
                {/* Group 243 - Birds and icon elements */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-0.52px',
                    top: '-0.01px',
                    width: '64.07px',
                    height: '38.15px'
                  }}
                >
                  {/* Vector 1 - Pink bird */}
                  <img
                    src="/blog-images/bird-vector-1.svg"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '40.08px',
                      top: '9.17px',
                      width: '23px',
                      height: '9px'
                    }}
                  />
                  
                  {/* Vector 2 - Purple element */}
                  <img
                    src="/blog-images/bird-vector-2.svg"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '19.52px',
                      top: '21.42px',
                      width: '6px',
                      height: '7px'
                    }}
                  />
                  
                  {/* Vector 3 - Purple element */}
                  <img
                    src="/blog-images/bird-vector-3.svg"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '8.43px',
                      top: '9.67px',
                      width: '11px',
                      height: '3px'
                    }}
                  />
                  
                  {/* Vector 4 - Purple element */}
                  <img
                    src="/blog-images/bird-vector-4.svg"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '34.51px',
                      top: '4.79px',
                      width: '14px',
                      height: '7px'
                    }}
                  />
                  
                  {/* Vector 5 - Pink base element */}
                  <img
                    src="/blog-images/bird-vector-5.svg"
                    alt=""
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '0px',
                      width: '48px',
                      height: '39px'
                    }}
                  />
                </div>
                
                {/* CuddlyNest Text */}
                <div
                  style={{
                    position: 'absolute',
                    left: '75px',
                    top: '8px',
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    color: '#242526',
                    letterSpacing: '-0.02em'
                  }}
                >
                  CuddlyNest
                </div>
              </div>
            </Link>
          </div>

          {/* Search Group */}
          <div 
            style={{
              position: 'absolute',
              left: '915px',
              top: '21px',
              width: '314px',
              height: '38px'
            }}
          >
            {/* Search Field */}
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  position: 'absolute',
                  width: '314px',
                  height: '38px',
                  backgroundColor: '#F7F7F7',
                  border: '1px solid #E9E9EB',
                  borderRadius: '19px'
                }}
              >
                <input
                  type="text"
                  placeholder="Search on the blog"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-transparent outline-none"
                  style={{
                    paddingLeft: '22px',
                    paddingRight: '50px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.25em',
                    color: '#797882'
                  }}
                />
              </div>
            </form>
            
            {/* Search Icon */}
            <div
              style={{
                position: 'absolute',
                left: '277px',
                top: '7px',
                width: '24px',
                height: '24px'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '1.33px',
                  top: '1.83px',
                  width: '23.33px',
                  height: '23.33px'
                }}
              >
                <div
                  style={{
                    width: '19.8px',
                    height: '19.8px',
                    border: '2px solid #242526',
                    borderRadius: '50%',
                    position: 'absolute'
                  }}
                />
                <div
                  style={{
                    width: '6.36px',
                    height: '6.36px',
                    backgroundColor: '#242526',
                    borderRadius: '0px 0px 45% 0px',
                    position: 'absolute',
                    right: '0px',
                    bottom: '0px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'bottom right'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          {/* Categories -> Editorial Policy */}
          <Link
            href="/editorial-policy"
            style={{
              position: 'absolute',
              left: '1280px',
              top: '30px',
              width: '79px',
              height: '19px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '1.3571428571428572em',
              color: '#797882',
              textDecoration: 'none'
            }}
            className="hover:text-[#242526] transition-colors"
          >
            Editorial Policy
          </Link>

          {/* About us */}
          <Link
            href="/about-us"
            style={{
              position: 'absolute',
              left: '1386px',
              top: '30px',
              width: '64px',
              height: '19px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              lineHeight: '1.3571428571428572em',
              color: '#797882',
              textDecoration: 'none'
            }}
            className="hover:text-[#242526] transition-colors"
          >
            About us
          </Link>
        </header>

        {/* Main Content Area - Using flex layout, starting directly after header */}
        <div className="flex" style={{ marginTop: '36px', paddingLeft: '160px', paddingRight: '152px', gap: '77px' }}>
          
          {/* Article Content - 851px wide */}
          <div style={{ width: '851px', flex: 'none' }}>
            
            {/* Article Title */}
            <h1 
              className="text-[#242526] mb-8"
              style={{ 
                fontSize: '36px', 
                fontWeight: 600, 
                lineHeight: '1.4em', 
                letterSpacing: '-0.02em',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {article.title}
            </h1>

            {/* Featured Image - full container width */}
            <div 
              className="relative mb-8"
              style={{ width: '851px', height: '395px' }}
            >
              <img
                src={article.featured_image?.file_url || article.og_image?.file_url}
                alt={article.title}
                className="w-full h-full object-cover"
                style={{ borderRadius: '15px' }}
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                style={{ borderRadius: '15px' }}
              ></div>
              
              {/* Share Button */}
              <div className="absolute" style={{ top: '25px', right: '25px' }}>
                <div 
                  className="bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                  style={{ width: '48px', height: '48px' }}
                >
                  <Share2 className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>

            {/* Author Info Bar */}
            <div 
              className="flex items-center gap-2 mb-8"
              style={{ marginLeft: '0px' }}
            >
              {/* Author Avatar */}
              <div 
                className="bg-gray-300 rounded-full overflow-hidden"
                style={{ width: '20.16px', height: '18px' }}
              >
                {article.author.avatar ? (
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400"></div>
                )}
              </div>
              
              <span 
                className="text-[#242526]"
                style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.67em',
                  fontFamily: 'Poppins, sans-serif',
                  width: '87px'
                }}
              >
                {article.author.display_name}
              </span>
              
              <div 
                className="bg-[#F35597] rounded-full"
                style={{ width: '3px', height: '3px' }}
              ></div>
              
              <Calendar className="w-3 h-3 text-[#242526]" />
              
              <span 
                className="text-[#242526]"
                style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.67em',
                  fontFamily: 'Poppins, sans-serif',
                  width: '76px'
                }}
              >
                {new Date(article.published_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              
              <div 
                className="bg-[#F35597] rounded-full"
                style={{ width: '3px', height: '3px' }}
              ></div>
              
              <Clock className="w-3 h-3 text-[#242526]" />
              
              <span 
                className="text-[#242526]"
                style={{ 
                  fontSize: '12px', 
                  lineHeight: '1.67em',
                  fontFamily: 'Poppins, sans-serif',
                  width: '76px'
                }}
              >
                {article.read_time}
              </span>
              
              {/* Stays You'll Love Badge - positioned at right */}
              <div style={{ marginLeft: 'auto' }}>
                <div 
                  className="bg-white border border-black rounded-full flex items-center justify-center px-4 py-2"
                  style={{ height: '40px' }}
                >
                  <span 
                    className="text-[#242526]"
                    style={{ 
                      fontSize: '16px', 
                      fontWeight: 500,
                      lineHeight: '1.25em',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    Stays You'll Love
                  </span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="text-[#242526] mb-8 prose prose-lg max-w-none"
              style={{ 
                fontSize: '18px', 
                lineHeight: '1.5em', 
                letterSpacing: '-0.02em',
                fontFamily: 'Poppins, sans-serif',
                marginLeft: '0px',
                width: '851px'
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
          </div>
          
          {/* Sticky Sidebar - 360px wide */}
          <div style={{ width: '360px', flex: 'none' }}>
            <div className="sticky" style={{ top: '20px' }}>
              {/* Table of Contents */}
              <ArticleTableOfContents tocItems={tocItems} />

              {/* Categories Section */}
              {article.categories && article.categories.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-6 text-[#242526]">Categories</h3>
                  <div className="flex flex-wrap gap-3">
                    {article.categories.map((category, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-2 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* App Download CTA - Exact Figma Implementation */}
              <div 
                className="relative rounded-[20px] mb-6"
                style={{ 
                  width: '361px',
                  height: '317px',
                  background: 'linear-gradient(135deg, rgba(232, 237, 237, 1) 0%, rgba(244, 244, 244, 1) 100%)',
                  overflow: 'visible'
                }}
              >
                {/* Main App Description Text */}
                <div 
                  className="absolute text-[#64748B]"
                  style={{ 
                    left: '29px',
                    top: '50px',
                    width: '142px',
                    height: '136px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    fontSize: '28px',
                    lineHeight: '1.2em'
                  }}
                >
                  Millions of places to stay, one app.
                </div>
                
                {/* CTA Text */}
                <div 
                  className="absolute text-[#64748B]"
                  style={{ 
                    left: '26px',
                    top: '226px',
                    width: '77px',
                    height: '13px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '8.76px',
                    lineHeight: '1.5em',
                    letterSpacing: '0.01em'
                  }}
                >
                  Get the app now.
                </div>
                
                {/* App Store Badges - Using actual Figma images */}
                <div 
                  className="absolute flex gap-[5.76px]"
                  style={{ 
                    left: '26px',
                    top: '249.48px'
                  }}
                >
                  {/* Apple Store Badge */}
                  <a 
                    href="https://apps.apple.com/app/cuddlynest" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src="/blog-images/app-store-badge.png"
                      alt="Download on the App Store"
                      style={{ 
                        width: '82px',
                        height: '27px'
                      }}
                      className="hover:opacity-90 transition-opacity"
                    />
                  </a>
                  
                  {/* Google Play Badge */}
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.cuddlynest" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <img 
                      src="/blog-images/google-play-badge.png"
                      alt="Get it on Google Play"
                      style={{ 
                        width: '92px',
                        height: '27px'
                      }}
                      className="hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
                
                {/* iPhone Mockup - Using correct iPhone 17 image with percentage positioning */}
                <div 
                  className="absolute"
                  style={{ 
                    left: '57.52%',
                    right: '-7.37%',
                    top: '9.28%',
                    bottom: '-27.1%'
                  }}
                >
                  <img 
                    src="/blog-images/iphone-17-mockup.png"
                    alt="CuddlyNest mobile app"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>

              {/* Ad Banner */}
              <div 
                className="bg-gray-100 rounded-lg flex items-center justify-center"
                style={{ height: '300px' }}
              >
                <span className="text-gray-400">Advertisement</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* FAQ Section - Fixed Layout to Prevent Overlapping */}
        {article.faqs && article.faqs.length > 0 && (
          <section style={{ marginTop: '80px', paddingLeft: '160px', paddingRight: '160px' }}>
            <div 
              className="bg-white"
              style={{ 
                width: '1280px',
                minHeight: '420px',
                borderRadius: '15px',
                padding: '30px',
                position: 'relative'
              }}
            >
              {/* FAQ Title */}
              <h2 
                className="text-[#242526] mb-[56px]"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: '24px',
                  lineHeight: '1.0833333333333333em',
                  letterSpacing: '-1%'
                }}
              >
                Frequently asked questions about family vacations
              </h2>

              {/* FAQ Accordion */}
              <Accordion type="single" collapsible defaultValue="item-0" className="space-y-0">
                {article.faqs.slice(0, 5).map((faq, index) => (
                  <div key={faq.id || index}>
                    <AccordionItem value={`item-${index}`} className="border-none">
                      <AccordionTrigger 
                        className="text-[#242526] hover:no-underline p-0 pb-[10px]"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 600,
                          fontSize: '16px',
                          lineHeight: '1.25em',
                          textAlign: 'left',
                          minHeight: '20px'
                        }}
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent 
                        className="text-[#797882] pb-[20px]"
                        style={{
                          fontFamily: 'Fira Sans, sans-serif',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '1.25em',
                          paddingTop: '0px'
                        }}
                      >
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Divider - Only show between items, not after the last one */}
                    {index < article.faqs.slice(0, 5).length - 1 && (
                      <div 
                        style={{
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#E9E9EB',
                          margin: '20px 0'
                        }}
                      ></div>
                    )}
                  </div>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Author Section */}
        <section style={{ marginTop: '80px', paddingLeft: '160px', paddingRight: '160px' }}>
          <div 
            className="bg-white"
            style={{ 
              width: '1280px',
              minHeight: '200px',
              borderRadius: '15px',
              padding: '40px'
            }}
          >
            {/* Author Info */}
            <div className="flex items-start gap-6 mb-6">
              <div 
                className="bg-gray-300 rounded-full overflow-hidden flex-shrink-0"
                style={{ width: '80px', height: '80px' }}
              >
                {article.author.avatar ? (
                  <img 
                    src={article.author.avatar} 
                    alt={article.author.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-[#242526] mb-3"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    fontSize: '24px',
                    lineHeight: '1.2em'
                  }}
                >
                  {article.author.display_name}
                </h3>
                
                <p 
                  className="text-[#797882] mb-4"
                  style={{
                    fontFamily: 'Fira Sans, sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '1.5em'
                  }}
                >
                  {article.author.bio || `${article.author.display_name} is a passionate travel writer who specializes in creating comprehensive guides that help travelers discover authentic experiences around the world. With years of expertise in travel journalism, they provide insider tips and practical advice for memorable journeys.`}
                </p>
                
                {/* Links */}
                <div className="flex gap-6">
                  <Link 
                    href="/editorial-policy"
                    className="text-[#0066CC] hover:text-[#0052A3] transition-colors"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    Our Editorial Policy
                  </Link>
                  
                  <Link 
                    href={`/authors/${article.author.display_name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-[#0066CC] hover:text-[#0052A3] transition-colors"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      textDecoration: 'underline'
                    }}
                  >
                    More articles by {article.author.display_name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles Section */}
        <section style={{ marginTop: '80px', paddingLeft: '160px', paddingRight: '160px' }}>
          <div 
            className="bg-white"
            style={{ 
              width: '1280px',
              minHeight: '400px',
              borderRadius: '15px',
              padding: '40px'
            }}
          >
            {/* Section Title */}
            <h2 
              className="text-[#242526] mb-8"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: '28px',
                lineHeight: '1.2em',
                letterSpacing: '-0.02em'
              }}
            >
              Related Articles
            </h2>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Article 1 */}
              <div className="group cursor-pointer">
                <Link href="/blog/paris-hidden-gems">
                  <div className="relative mb-4">
                    <div 
                      className="relative overflow-hidden"
                      style={{ width: '100%', height: '200px', borderRadius: '12px' }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Paris Hidden Gems"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <h3 
                    className="text-[#242526] mb-2 group-hover:text-[#0066CC] transition-colors"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      lineHeight: '1.3em',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Hidden Gems of Paris: Local Secrets Revealed
                  </h3>
                  <p 
                    className="text-[#797882] mb-3"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '1.4em'
                    }}
                  >
                    Discover the secret spots that locals love, from hidden cafés to underground art scenes.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#797882]">
                    <span>5 min read</span>
                    <span>•</span>
                    <span>March 15, 2025</span>
                  </div>
                </Link>
              </div>

              {/* Article 2 */}
              <div className="group cursor-pointer">
                <Link href="/blog/tokyo-travel-guide">
                  <div className="relative mb-4">
                    <div 
                      className="relative overflow-hidden"
                      style={{ width: '100%', height: '200px', borderRadius: '12px' }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Tokyo Travel Guide"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <h3 
                    className="text-[#242526] mb-2 group-hover:text-[#0066CC] transition-colors"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      lineHeight: '1.3em',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Ultimate Tokyo Guide: Modern Meets Traditional
                  </h3>
                  <p 
                    className="text-[#797882] mb-3"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '1.4em'
                    }}
                  >
                    Navigate Japan's capital with insider tips on the best neighborhoods, food, and culture.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#797882]">
                    <span>8 min read</span>
                    <span>•</span>
                    <span>March 12, 2025</span>
                  </div>
                </Link>
              </div>

              {/* Article 3 */}
              <div className="group cursor-pointer">
                <Link href="/blog/rome-ancient-wonders">
                  <div className="relative mb-4">
                    <div 
                      className="relative overflow-hidden"
                      style={{ width: '100%', height: '200px', borderRadius: '12px' }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        alt="Rome Ancient Wonders"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </div>
                  <h3 
                    className="text-[#242526] mb-2 group-hover:text-[#0066CC] transition-colors"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      lineHeight: '1.3em',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Rome's Ancient Wonders: A Timeless Journey
                  </h3>
                  <p 
                    className="text-[#797882] mb-3"
                    style={{
                      fontFamily: 'Fira Sans, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '1.4em'
                    }}
                  >
                    Walk through history in the Eternal City, from the Colosseum to hidden archaeological gems.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#797882]">
                    <span>6 min read</span>
                    <span>•</span>
                    <span>March 10, 2025</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section - Exact Figma Implementation */}
        <section style={{ marginTop: '80px', position: 'relative', width: '100%', height: '134px' }}>
          {/* Breadcrumbs */}
          <div
            style={{
              position: 'absolute',
              width: '121px',
              height: '24px',
              left: '152px',
              top: '0px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0px',
              gap: '5px'
            }}
          >
            <Link 
              href="/blog"
              className="text-[#797882] hover:text-[#242526] transition-colors"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                textDecoration: 'none'
              }}
            >
              Blog
            </Link>
            <span className="text-[#797882]" style={{ fontSize: '12px' }}>/</span>
            <Link 
              href={`/blog/${article.categories?.[0]?.toLowerCase() || 'travel'}`}
              className="text-[#797882] hover:text-[#242526] transition-colors"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                textDecoration: 'none'
              }}
            >
              {article.categories?.[0] || 'Travel'}
            </Link>
          </div>

          {/* Main Footer Container */}
          <div
            style={{
              position: 'absolute',
              width: '1266px',
              height: '80px',
              left: '152px',
              top: '54px'
            }}
          >
            {/* Footer Text */}
            <div
              style={{
                position: 'absolute',
                width: '566.32px',
                height: '80px',
                left: '0px',
                top: '0px',
                fontFamily: 'Merriweather, serif',
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '40px',
                lineHeight: '1em',
                letterSpacing: '-4%',
                color: 'rgba(36, 37, 38, 0.4)'
              }}
            >
              Travel is for <br />everyone.
            </div>

            {/* Copyright */}
            <div
              style={{
                position: 'absolute',
                width: '256.35px',
                height: '18px',
                left: '1009.65px',
                top: '61px',
                fontFamily: 'Poppins, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '150%',
                textAlign: 'right',
                letterSpacing: '1%',
                color: '#797882'
              }}
            >
              © 2025 CuddlyNest. VRMA member.
            </div>
          </div>
        </section>
      </div>
    </>
  )
}