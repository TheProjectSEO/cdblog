import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'
import Link from 'next/link'
import { Globe, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DynamicSectionRenderer } from '@/components/dynamic-section-renderer'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Footer } from '@/components/footer'
import { LogoImage } from '@/components/LogoImage'
import { inferTemplateFromData } from '@/lib/utils/templateInference'

interface PageProps {
  params: Promise<{
    slug: string
    lang: string
  }>
}

interface TranslatedPost {
  id: string
  original_post_id: string
  language_code: string
  translated_title: string
  translated_slug: string
  translated_excerpt?: string
  translated_content?: string
  translated_seo_title?: string
  translated_seo_description?: string
  translated_faq_items?: Array<{
    question: string
    answer: string
  }>
  translated_itinerary_days?: Array<{
    day: number
    title: string
    description: string
    activities?: string[]
  }>
  translated_at: string
  translated_sections?: Array<{
    id: string
    translation_id: string
    original_section_id: string
    translated_data: any
    original_section: {
      id: string
      template_id: string
      sort_order: number
      is_active: boolean
      data: any
    }
  }>
  language: {
    code: string
    name: string
    native_name: string
    flag_emoji: string
  }
  original_post: {
    title: string
    slug: string
    created_at: string
    author_id?: string
  }
}

async function getTranslatedPost(lang: string, slug: string): Promise<TranslatedPost | null> {
  try {
    console.log('getTranslatedPost called with:', { lang, slug })
    
    // First, find the original post by slug
    console.log('Looking for original post with slug:', slug)
    const { data: originalPost, error: originalError } = await supabase
      .from('modern_posts')
      .select('id, title, slug, created_at, author_id')
      .eq('slug', slug)
      .single()

    if (originalError || !originalPost) {
      console.error('Error fetching original post:', originalError)
      return null
    }

    console.log('Found original post:', originalPost.id, originalPost.title)

    // Then find the translation for this post and language
    console.log('Looking for translation with original_post_id:', originalPost.id, 'language:', lang)
    
    // First, try a simple query without joins
    const { data: translationData, error: translationError } = await supabase
      .from('post_translations')
      .select('*')
      .eq('original_post_id', originalPost.id)
      .eq('language_code', lang)
      .eq('translation_status', 'completed')
      .single()

    if (translationError) {
      console.error('Error fetching translated post:', translationError)
      console.error('Translation query details:', {
        original_post_id: originalPost.id,
        language_code: lang,
        translation_status: 'completed'
      })
      return null
    }

    console.log('Found translation:', translationData.id, translationData.translated_title)
    
    // Now get the language data separately
    const { data: languageData } = await supabase
      .from('languages')
      .select('*')
      .eq('code', lang)
      .single()

    const data = {
      ...translationData,
      language: languageData
    }

    // Fetch translated sections ordered by position
    console.log('Looking for translated sections with translation_id:', data.id)
    const { data: translatedSections, error: sectionsError } = await supabase
      .from('translated_sections')
      .select('*')
      .eq('translation_id', data.id)
      .order('position', { ascending: true })

    console.log('Translated sections found:', translatedSections?.length || 0)
    if (sectionsError) {
      console.error('Error fetching translated sections:', sectionsError)
    }

    // If we have translated sections, get the original section data
    let enrichedTranslatedSections = []
    if (translatedSections && translatedSections.length > 0) {
      for (const ts of translatedSections) {
        const { data: originalSection } = await supabase
          .from('modern_post_sections')
          .select('*')
          .eq('id', ts.original_section_id)
          .single()
        
        if (originalSection) {
          enrichedTranslatedSections.push({
            ...ts,
            original_section: originalSection
          })
        }
      }
    }

    // Add translated sections to the response
    const result = {
      ...data,
      original_post: {
        title: originalPost.title,
        slug: originalPost.slug,
        created_at: originalPost.created_at,
        author_id: originalPost.author_id
      },
      translated_sections: enrichedTranslatedSections || []
    } as TranslatedPost

    return result
  } catch (err) {
    console.error('Exception in getTranslatedPost:', err)
    return null
  }
}

async function getOtherTranslations(originalPostId: string, currentLang: string, originalSlug: string) {
  const { data } = await supabase
    .from('post_translations')
    .select(`
      language_code,
      translated_slug,
      translated_title,
      translation_status,
      language:languages!post_translations_language_code_fkey(*)
    `)
    .eq('original_post_id', originalPostId)
    .eq('translation_status', 'completed')
    .neq('language_code', currentLang)

  return data?.map(t => ({
    ...t,
    url: `/blog/${originalSlug}/${t.language_code}`
  })) || []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  console.log('generateMetadata called with params:', resolvedParams)
  const post = await getTranslatedPost(resolvedParams.lang, resolvedParams.slug)

  if (!post) {
    console.log('generateMetadata: No post found')
    return {
      title: 'Post Not Found',
      description: 'The requested translated post could not be found.'
    }
  }

  // Get all translations for hreflang
  const { data: allTranslations } = await supabase
    .from('post_translations')
    .select('language_code, translated_slug')
    .eq('original_post_id', post.original_post_id)
    .eq('translation_status', 'completed')

  // Build comprehensive hreflang object
  const languages: Record<string, string> = {
    'en': `/blog/${post.original_post.slug}`, // Original English version
    'x-default': `/blog/${post.original_post.slug}` // Default fallback
  }
  
  // Add all completed translations
  if (allTranslations && allTranslations.length > 0) {
    allTranslations.forEach(translation => {
      languages[translation.language_code] = `/blog/${resolvedParams.slug}/${translation.language_code}`
    })
  }

  return {
    title: post.translated_seo_title || post.translated_title,
    description: post.translated_seo_description || post.translated_excerpt,
    alternates: {
      canonical: `/blog/${resolvedParams.slug}/${resolvedParams.lang}`,
      languages: languages
    },
    openGraph: {
      title: post.translated_seo_title || post.translated_title,
      description: post.translated_seo_description || post.translated_excerpt,
      type: 'article',
      locale: resolvedParams.lang,
      alternateLocale: ['en']
    }
  }
}

export default async function TranslatedPostPage({ params }: PageProps) {
  try {
    const resolvedParams = await params
    console.log('TranslatedPostPage called with params:', resolvedParams)
    const post = await getTranslatedPost(resolvedParams.lang, resolvedParams.slug)

  if (!post) {
    console.log('❌ No translated post found, checking if original post exists')
    
    // Check if the original post exists before showing 404
    const { data: originalPost } = await supabase
      .from('modern_posts')
      .select('id, title, slug, status')
      .eq('slug', resolvedParams.slug)
      .eq('status', 'published')
      .single()

    if (originalPost) {
      console.log('Original post exists but translation not found - this is a translation issue')
      // The original post exists, but the translation doesn't
      // The not-found.tsx will handle this gracefully
    } else {
      console.log('Original post does not exist - this is a genuine 404')
    }
    
    notFound()
  }
  
  console.log('✅ German translation found successfully:', {
    id: post.id,
    title: post.translated_title,
    sectionsCount: post.translated_sections?.length || 0
  })

  const otherTranslations = await getOtherTranslations(post.original_post_id, resolvedParams.lang, resolvedParams.slug)

  // Prepare translated sections for DynamicSectionRenderer
  let sectionsToRender = []
  console.log('Preparing sections for rendering...')
  
  // Fetch translated sections directly from database - they exist!
  const { data: directTranslatedSections } = await supabase
    .from('translated_sections')
    .select('*')
    .eq('translation_id', post.id)
    .order('position', { ascending: true })
    
  console.log('Direct translated sections found:', directTranslatedSections?.length || 0)
  
  if (directTranslatedSections && directTranslatedSections.length > 0) {
    // Map translated sections with proper template information
    sectionsToRender = directTranslatedSections.map(ts => {
      // Safety check for translated_data
      let translatedData = ts.translated_data
      try {
        // If translated_data is a string, try to parse it
        if (typeof translatedData === 'string') {
          translatedData = JSON.parse(translatedData)
        }
        // Ensure it's an object
        if (!translatedData || typeof translatedData !== 'object') {
          console.warn(`Invalid translated_data for section ${ts.id}`)
          translatedData = { content: 'Content unavailable' }
        }
      } catch (error) {
        console.error(`Error parsing translated_data for section ${ts.id}:`, error)
        translatedData = { content: 'Content unavailable' }
      }
      
      // Map template names based on position and content type
      let templateName = 'rich-text-editor'
      let componentName = 'RichTextEditor'
      
      if (ts.position === 0) {
        templateName = 'hero-section'
        componentName = 'HeroSection'
      } else if (translatedData.faqs) {
        templateName = 'faq-section'
        componentName = 'FAQSection'
      } else if (translatedData.hotels) {
        templateName = 'hotel-carousel'
        componentName = 'HotelCarousel'
      } else if (translatedData.neighborhoods || translatedData.tips) {
        templateName = 'where-to-stay'
        componentName = 'WhereToStay'
      } else if (translatedData.categories || translatedData.activities || translatedData.title?.includes('Aktivitäten') || translatedData.title?.includes('Erlebnisse')) {
        templateName = 'things-to-do-cards'
        componentName = 'ThingsToDoCards'
      } else if (translatedData.highlights && translatedData.destination) {
        templateName = 'starter-pack-section'
        componentName = 'StarterPackSection'
      } else if (translatedData.buttonUrl || translatedData.title?.includes('KI') || translatedData.title?.includes('AI') || translatedData.title?.includes('Plan')) {
        templateName = 'ai-itinerary-cta'
        componentName = 'AIItineraryCTA'
      } else if (translatedData.autoGenerate || translatedData.links) {
        templateName = 'internal-links-section'
        componentName = 'InternalLinksSection'
      } else if (translatedData.authorName || translatedData.name || translatedData.bio) {
        templateName = 'author-section'
        componentName = 'AuthorBlock'
      } else if (translatedData.content && translatedData.content.length > 100) {
        templateName = 'rich-text-editor'
        componentName = 'RichTextEditor'
      }
      
      return {
        id: ts.id,
        template_id: templateName,
        sort_order: ts.position,
        is_active: true,
        data: translatedData,
        position: ts.position,
        template: {
          name: templateName,
          component_name: componentName,
          category: 'content'
        }
      }
    })
    
    console.log('✅ Using translated sections:', sectionsToRender.length)
    console.log('Sample translated section data:', sectionsToRender[0]?.data ? Object.keys(sectionsToRender[0].data) : 'No data')
    
    // Debug: Log each section's translated content
    sectionsToRender.forEach((section, index) => {
      console.log(`Section ${index + 1}:`, {
        id: section.id,
        template: section.template?.component_name,
        position: section.position,
        hasContent: !!section.data?.content,
        contentLength: section.data?.content?.length || 0,
        contentPreview: section.data?.content?.substring(0, 100) + '...' || 'No content',
        allDataKeys: Object.keys(section.data || {})
      })
    })
  } else {
    console.log('❌ No translated sections found for translation_id:', post.id)
    sectionsToRender = []
  }

  // Create a translated post object for the renderer
  const translatedPostForRenderer = {
    id: post.original_post_id,
    title: post.translated_title,
    slug: post.translated_slug,
    excerpt: post.translated_excerpt,
    meta_title: post.translated_seo_title,
    meta_description: post.translated_seo_description,
    published_at: post.translated_at,
    sections: sectionsToRender
  }

  // Prepare translations data for LanguageSwitcher
  const allTranslations = [
    // Include English (original)
    {
      language_code: 'en',
      translated_slug: post.original_post.slug,
      translation_status: 'completed'
    },
    // Include other translations
    ...otherTranslations.map(t => ({
      language_code: t.language_code,
      translated_slug: t.translated_slug,
      translation_status: t.translation_status
    }))
  ]

  return (
    <>
      {/* Header with Logo and Language Switcher */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-full mx-auto px-8 py-2">
          <div className="flex items-center justify-between w-full">
            {/* Left side: Logo */}
            <div className="flex items-center">
              <LogoImage 
                src="https://www.cuddlynest.com/images/logo/cn_logo_hpv2_whit_en.png"
                alt="CuddlyNest Logo"
                className="h-10 w-auto"
              />
            </div>
            
            {/* Right side: Language switcher */}
            <div className="flex items-center ml-auto pr-4">
              <LanguageSwitcher
                currentLanguage={post.language_code}
                postSlug={post.original_post.slug}
                availableTranslations={allTranslations}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sections - Use fully translated content */}
      {sectionsToRender.length > 0 ? (
        <DynamicSectionRenderer 
          sections={sectionsToRender} 
          post={translatedPostForRenderer}
        />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.translated_title}</h1>
                <p className="text-lg mb-6 text-gray-600">{post.translated_excerpt}</p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-orange-100 rounded-full p-3">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Translation In Progress</h3>
                  <p className="text-orange-700 text-sm mb-4">
                    The content sections for this language are currently being translated. This usually happens within a few minutes of the translation being requested.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors"
                    >
                      Refresh Page
                    </button>
                    <Link 
                      href={`/blog/${post.original_post.slug}`} 
                      className="bg-white text-orange-600 border border-orange-600 px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors"
                    >
                      View Original English
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Translation Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">
                This is an automatic translation from English.
              </p>
              <p className="text-yellow-700 mt-1">
                While we strive for accuracy, some nuances may be lost in translation. 
                For the most accurate information, please refer to the{' '}
                <Link 
                  href={`/blog/${post.original_post.slug}`}
                  className="underline hover:no-underline"
                >
                  original English version
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  )
  } catch (error) {
    console.error('Error in TranslatedPostPage:', error)
    
    // Return a safe error page
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Translation Error</h3>
                <p className="text-red-700 text-sm mb-4">
                  There was an error loading this translated page. This may be due to corrupted translation data.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <Link 
                    href={`/blog`} 
                    className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors"
                  >
                    Back to Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}