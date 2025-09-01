import { NextResponse } from 'next/server'
import { getLegacyBlogPostBySlug } from '@/lib/supabase'
import { convertLegacyPostToTemplate } from '@/lib/legacy-blog-template-generator'

export async function GET() {
  try {
    // Test with the Rotterdam nightlife post
    const legacyPost = await getLegacyBlogPostBySlug('rotterdam-nightlife')
    
    if (!legacyPost) {
      return NextResponse.json({ 
        success: false, 
        error: 'Legacy post not found' 
      })
    }

    // Convert to template data
    const templateData = convertLegacyPostToTemplate(legacyPost)

    return NextResponse.json({
      success: true,
      legacyPost: {
        id: legacyPost.id,
        title: legacyPost.title,
        slug: legacyPost.slug,
        contentLength: legacyPost.content?.length || 0,
        status: legacyPost.status
      },
      templateData: {
        id: templateData.id,
        title: templateData.title,
        excerpt: templateData.excerpt,
        readTime: templateData.read_time,
        contentPreview: templateData.content.substring(0, 200) + '...',
        faqsCount: templateData.faqs.length,
        categories: templateData.categories,
        author: templateData.author
      }
    })

  } catch (error) {
    console.error('Test legacy post error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test legacy post',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}