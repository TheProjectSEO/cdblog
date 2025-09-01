import { getLegacyBlogPostBySlug } from '@/lib/supabase'
import { convertLegacyPostToTemplate } from '@/lib/legacy-blog-template-generator'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test with a post that exists in the legacy blog_posts table with substantial content
    const testSlug = 'rome-nightlife'
    
    console.log(`Testing legacy post with sections: ${testSlug}`)
    
    // Fetch the legacy post with sections
    const legacyPost = await getLegacyBlogPostBySlug(testSlug)
    
    console.log('getLegacyBlogPostBySlug result:', {
      found: !!legacyPost,
      id: legacyPost?.id,
      title: legacyPost?.title,
      contentLength: legacyPost?.content?.length,
      sectionsCount: legacyPost?.blog_sections?.length,
      modernContentCount: legacyPost?.modern_wordpress_content?.length
    })
    
    if (!legacyPost) {
      return NextResponse.json({ 
        error: 'Legacy post not found',
        testSlug,
        debug: 'Check server console for getLegacyBlogPostBySlug debug output'
      })
    }

    console.log('Legacy post found:', {
      id: legacyPost.id,
      title: legacyPost.title,
      sectionsCount: legacyPost.blog_sections?.length || 0,
      contentLength: legacyPost.content?.length || 0,
      modernWordPressContentCount: legacyPost.modern_wordpress_content?.length || 0,
      modernWordPressContentPreview: legacyPost.modern_wordpress_content?.[0]?.data?.content?.substring(0, 200)
    })

    // Convert to template format
    const templateData = convertLegacyPostToTemplate(legacyPost)
    
    return NextResponse.json({
      success: true,
      testSlug,
      originalPost: {
        id: legacyPost.id,
        title: legacyPost.title,
        slug: legacyPost.slug,
        originalContentLength: legacyPost.content?.length || 0,
        sectionsCount: legacyPost.blog_sections?.length || 0,
        modernWordPressContentCount: legacyPost.modern_wordpress_content?.length || 0,
        sections: legacyPost.blog_sections?.map(s => ({
          type: s.section_type,
          title: s.title,
          hasContent: !!s.content
        })) || [],
        modernWordPressContent: legacyPost.modern_wordpress_content?.map(mwc => ({
          position: mwc.position,
          hasContent: !!(mwc.data?.content),
          contentLength: mwc.data?.content?.length || 0,
          contentPreview: mwc.data?.content?.substring(0, 150) + '...'
        })) || []
      },
      templateData: {
        id: templateData.id,
        title: templateData.title,
        generatedContentLength: templateData.content.length,
        faqsCount: templateData.faqs.length,
        categories: templateData.categories,
        readTime: templateData.read_time
      },
      generatedContentPreview: templateData.content.substring(0, 500) + '...',
      faqs: templateData.faqs,
      comparison: {
        originalContentBrief: legacyPost.content?.substring(0, 200) || 'No content',
        generatedContentRich: templateData.content.substring(0, 500) + '...',
        improvement: `Generated ${templateData.content.length} characters from ${legacyPost.blog_sections?.length || 0} sections vs ${legacyPost.content?.length || 0} original characters`
      }
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}