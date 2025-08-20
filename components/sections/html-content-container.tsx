'use client'

import { ReactNode } from 'react'

// Function to convert heading text to ID (same as in rich-text-editor.tsx)
function addIdsToHeadings(html: string): string {
  // Function to convert heading text to ID
  const textToId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim()
  }

  // Add IDs to h2 and h3 headings
  return html
    .replace(/<h2>([^<]+)<\/h2>/g, (match, text) => {
      const id = textToId(text)
      return `<h2 id="${id}">${text}</h2>`
    })
    .replace(/<h3>([^<]+)<\/h3>/g, (match, text) => {
      const id = textToId(text)
      return `<h3 id="${id}">${text}</h3>`
    })
}

interface HtmlContentContainerProps {
  children?: ReactNode
  data?: {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl'
    padding?: 'sm' | 'md' | 'lg' | 'xl'
    marginTop?: 'sm' | 'md' | 'lg' | 'xl'
    background?: 'white' | 'gray' | 'blue' | 'transparent'
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    content?: string // HTML content to process with heading IDs
  }
}

export function HtmlContentContainer({ children, data }: HtmlContentContainerProps) {
  // Default settings matching the HTML design - increased to 6xl for wider container
  const maxWidth = data?.maxWidth || '6xl'
  const padding = data?.padding || 'xl'
  const marginTop = data?.marginTop || 'lg'
  const background = data?.background || 'white'
  const shadow = data?.shadow || 'none'
  const rounded = data?.rounded || '2xl'

  // Process HTML content with heading IDs if provided
  const processedHtmlContent = data?.content ? addIdsToHeadings(data.content) : null
  
  // Debug logging
  if (data?.content && typeof window !== 'undefined') {
    console.log('HtmlContentContainer processing content with headings:', {
      hasContent: !!data.content,
      contentLength: data.content.length,
      hasH2: data.content.includes('<h2'),
      hasH3: data.content.includes('<h3'),
      processedLength: processedHtmlContent?.length
    })
  }

  // Class mappings
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }

  const paddingClasses = {
    'sm': 'p-6',
    'md': 'p-8',
    'lg': 'p-10',
    'xl': 'p-8 md:p-12'
  }

  const marginTopClasses = {
    'sm': 'py-8',
    'md': 'py-12',
    'lg': 'py-6',
    'xl': 'py-8'
  }

  const backgroundClasses = {
    'white': 'bg-white',
    'gray': 'bg-gray-50',
    'blue': 'bg-blue-50',
    'transparent': 'bg-transparent'
  }

  const shadowClasses = {
    'none': '',
    'sm': 'shadow-sm',
    'md': 'shadow-md',
    'lg': 'shadow-lg',
    'xl': 'shadow-xl'
  }

  const roundedClasses = {
    'none': '',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl'
  }

  return (
    <>
      {/* Add fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      
      <article className={`${maxWidthClasses[maxWidth]} mx-auto px-4 lg:px-8 ${marginTopClasses[marginTop]}`}>
        <div className={`
          ${backgroundClasses[background]} 
          ${roundedClasses[rounded]} 
          ${shadowClasses[shadow]} 
          ${paddingClasses[padding]}
        `} style={{ fontFamily: 'Inter, sans-serif' }}>
          {/* Content sections go here */}
          <div className="prose prose-lg max-w-none prose-headings:font-semibold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed [&_.not-prose]:not-prose">
            {processedHtmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: processedHtmlContent }} />
            ) : (
              children
            )}
          </div>
        </div>
      </article>
    </>
  )
}