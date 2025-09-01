import { NextResponse } from 'next/server'
import { getModernPostBySlug } from '@/lib/supabase'
import { convertPostToTemplate } from '@/lib/blog-template-generator'

export async function GET() {
  try {
    const testSlug = 'rome-ultimate-7-day-italy-travel-guide'
    
    console.log(`Testing modern post template generation: ${testSlug}`)
    
    // Fetch the modern post with sections
    const modernPost = await getModernPostBySlug(testSlug)
    
    if (!modernPost) {
      return NextResponse.json({ 
        error: 'Modern post not found',
        testSlug 
      })
    }

    console.log('Modern post found:', {
      id: modernPost.id,
      title: modernPost.title,
      sectionsCount: modernPost.sections?.length || 0,
      sectionPreview: modernPost.sections?.slice(0, 2).map(s => ({
        id: s.id,
        template_id: s.template_id,
        hasContent: !!(s.data?.content),
        contentLength: s.data?.content?.length || 0,
        contentPreview: s.data?.content?.substring(0, 150) || 'No content'
      }))
    })

    // Convert to template format
    const templateData = convertPostToTemplate(modernPost)
    
    return NextResponse.json({
      success: true,
      testSlug,
      originalPost: {
        id: modernPost.id,
        title: modernPost.title,
        slug: modernPost.slug,
        sectionsCount: modernPost.sections?.length || 0,
        sections: modernPost.sections?.map(s => ({
          id: s.id,
          template_id: s.template_id,
          hasContent: !!(s.data?.content),
          contentLength: s.data?.content?.length || 0,
          contentPreview: s.data?.content?.substring(0, 100) || 'No content'
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
      realContentExtracted: templateData.content.includes('Welcome to the Eternal City') || 
                          templateData.content.includes('Decoding Rome') ||
                          templateData.content.includes('Rome isn\'t just a city')
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}