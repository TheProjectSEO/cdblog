import { getModernPostBySlug, getModernPostBySlugWithPreview, getStarterPackForPost, supabase } from "@/lib/supabase"
import { DynamicSectionRenderer } from "@/components/dynamic-section-renderer"
import { Footer } from "@/components/footer"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { LogoImage } from "@/components/LogoImage"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    preview?: string
  }>
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const isPreview = resolvedSearchParams.preview === 'true'
  
  // Use preview function if in preview mode, otherwise use regular function
  const post = isPreview 
    ? await getModernPostBySlugWithPreview(resolvedParams.slug, true)
    : await getModernPostBySlug(resolvedParams.slug)
  
  if (!post) {
    notFound()
  }

  // Get available translations for this post
  const { data: translations } = await supabase
    .from('post_translations')
    .select('language_code, translated_slug, translation_status')
    .eq('original_post_id', post.id)
    .eq('translation_status', 'completed')

  // Get starter pack data for this post
  const starterPackData = await getStarterPackForPost(post.id)

  // Inject starter pack data into relevant sections
  if (starterPackData && post.sections) {
    post.sections = post.sections.map(section => {
      // Find starter pack or overview intro sections
      const isStarterPackSection = 
        section.template_id === 'b87245be-1b68-47d4-83a6-fac582a0847f' || // StarterPackSection
        section.template_id === '8642ef7e-6198-4cd4-b0f9-8ba6bb868951' || // OverviewIntro
        section.template_id === 'overview-intro' ||
        section.template_id === 'starter-pack-section'

      if (isStarterPackSection) {
        return {
          ...section,
          data: {
            ...section.data,
            starterPackData: starterPackData
          }
        }
      }
      
      return section
    })
  }

  const hasSections = post.sections && post.sections.length > 0
  
  console.log('BlogPostPage debug:', {
    postId: post.id,
    postTitle: post.title,
    sectionsCount: post.sections?.length || 0,
    hasSections,
    originalWpId: (post as any).original_wp_id
  })

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.og_image?.file_url || '',
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Person',
      name: post.author?.display_name || 'CuddlyNest Travel Team',
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
      '@id': `https://cuddlynest.com/blog/${post.slug}`,
    },
    articleSection: 'Travel Guide',
    keywords: post.meta_keywords || `travel, ${post.title}, travel guide`,
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header overlay on hero - Logo and Language Switcher */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-full mx-auto px-8 py-4">
          <div className="flex items-center justify-between w-full">
            {/* Left side: White Logo */}
            <div className="flex items-center">
              <Link href="/blog">
                <LogoImage 
                  src="https://wxprzwoylqjzozhezttc.supabase.co/storage/v1/object/public/blog-images/logos/cuddlynest-logo.png"
                  alt="CuddlyNest Logo"
                  className="h-10 w-auto cursor-pointer filter brightness-0 invert"
                />
              </Link>
            </div>
            
            {/* Right side: Language switcher */}
            <div className="flex items-center ml-auto pr-4">
              <LanguageSwitcher
                currentLanguage="en"
                postSlug={post.slug}
                availableTranslations={translations || []}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Draft Preview Banner */}
      {isPreview && post.status === 'draft' && (
        <div className="bg-orange-100 border-b border-orange-200">
          <div className="max-w-full mx-auto px-8 py-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-800 font-medium text-sm">
                DRAFT PREVIEW - This post is not published yet
              </span>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {hasSections ? (
        <DynamicSectionRenderer 
          sections={post.sections || []} 
          post={post}
        />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-12 text-gray-500">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <p className="text-lg mb-6">{post.excerpt}</p>
                <p>This post doesn't have any content sections yet.</p>
                <p className="text-sm mt-2">Check back later for updates!</p>
                
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-left text-sm">
                  <p className="font-bold text-red-800">Debug Info:</p>
                  <p>Post ID: {post.id}</p>
                  <p>Sections: {post.sections?.length || 0}</p>
                  <p>Original WP ID: {(post as any).original_wp_id || 'none'}</p>
                  <p>Featured Image URL: {(post as any).featured_image_url || 'none'}</p>
                  {post.sections && post.sections.length > 0 && (
                    <div className="mt-2">
                      <p className="font-bold">Sections:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(post.sections.map(s => ({
                          id: s.id,
                          template_id: s.template_id,
                          is_active: s.is_active,
                          sort_order: s.sort_order
                        })), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </>
  )
}

// Generate metadata for SEO with hreflang support
export async function generateMetadata({ params }: BlogPostPageProps) {
  const resolvedParams = await params
  
  // Get the post data
  const post = await getModernPostBySlug(resolvedParams.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.'
    }
  }

  // Get all translations for hreflang
  const { data: allTranslations } = await supabase
    .from('post_translations')
    .select('language_code, translated_slug')
    .eq('original_post_id', post.id)
    .eq('translation_status', 'completed')

  // Build comprehensive hreflang object
  const languages: Record<string, string> = {
    'en': `/blog/${post.slug}`, // Original English version
    'x-default': `/blog/${post.slug}` // Default fallback
  }
  
  // Add all completed translations
  if (allTranslations && allTranslations.length > 0) {
    allTranslations.forEach(translation => {
      languages[translation.language_code] = `/blog/${post.slug}/${translation.language_code}`
    })
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.meta_keywords || `travel, ${post.title}, travel guide`,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: languages
    },
    openGraph: {
      title: post.og_title || post.seo_title || post.title,
      description: post.og_description || post.seo_description || post.excerpt,
      type: 'article',
      locale: 'en',
      alternateLocale: allTranslations?.map(t => t.language_code) || [],
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: [post.author?.display_name || 'CuddlyNest Travel Team'],
      images: post.og_image?.file_url ? [{
        url: post.og_image.file_url,
        alt: post.og_image_alt || post.title
      }] : []
    },
    twitter: {
      card: 'summary_large_image',
      site: '@cuddlynest',
      title: post.twitter_title || post.og_title || post.seo_title || post.title,
      description: post.twitter_description || post.og_description || post.seo_description || post.excerpt,
      images: post.twitter_image || post.og_image?.file_url ? [{
        url: post.twitter_image || post.og_image?.file_url,
        alt: post.twitter_image_alt || post.og_image_alt || post.title
      }] : []
    },
    robots: {
      index: post.robots_index !== false,
      follow: post.robots_follow !== false,
      nosnippet: post.robots_nosnippet === true,
      googleBot: {
        index: post.robots_index !== false,
        follow: post.robots_follow !== false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}