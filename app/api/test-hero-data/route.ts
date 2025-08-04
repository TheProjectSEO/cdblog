import { NextRequest, NextResponse } from 'next/server'
import { getModernPostBySlug } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'rotterdam-nightlife'
    
    // Get the complete post data as the page would
    const post = await getModernPostBySlug(slug)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get the hero section data
    const heroSection = post.sections?.find(section => 
      section.template_id === '6f579a71-463c-43b4-b203-c2cb46c80d47' && 
      section.position === 0
    )

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug
      },
      heroSection: {
        found: !!heroSection,
        data: heroSection?.data,
        backgroundImage: heroSection?.data?.backgroundImage,
        hasBackgroundImage: !!(heroSection?.data?.backgroundImage)
      },
      passedToComponent: {
        title: post.title,
        heroImage: null,
        data: heroSection?.data || null
      },
      finalImagePriority: {
        priority1_dataBackgroundImage: heroSection?.data?.backgroundImage || null,
        priority2_heroImageProp: null,
        priority3_titleBasedFallback: post.title?.toLowerCase().includes('rotterdam') ? 
          "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" : 
          "other fallback",
        expectedFinalImage: heroSection?.data?.backgroundImage || 
          (post.title?.toLowerCase().includes('rotterdam') ? 
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" : 
            "other fallback")
      }
    })

  } catch (error) {
    console.error('Test hero data error:', error)
    return NextResponse.json({ 
      error: 'Failed to test hero data', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}