import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'rotterdam-nightlife'
    
    // Get the post
    const { data: post, error: postError } = await supabase
      .from('modern_posts')
      .select('id, title, slug')
      .eq('slug', slug)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get the hero section
    const { data: heroSection, error: heroError } = await supabase
      .from('modern_post_sections')
      .select('*')
      .eq('post_id', post.id)
      .eq('template_id', '6f579a71-463c-43b4-b203-c2cb46c80d47')
      .eq('position', 0)
      .maybeSingle()

    // Get all sections for this post to understand the structure
    const { data: allSections, error: sectionsError } = await supabase
      .from('modern_post_sections')
      .select('id, template_id, position, data, is_active')
      .eq('post_id', post.id)
      .order('position', { ascending: true })

    return NextResponse.json({
      success: true,
      post,
      heroSection: {
        found: !!heroSection,
        data: heroSection,
        hasBackgroundImage: !!(heroSection?.data?.backgroundImage),
        backgroundImageUrl: heroSection?.data?.backgroundImage || null
      },
      allSections: allSections?.map(s => ({
        id: s.id,
        template_id: s.template_id,
        position: s.position,
        is_active: s.is_active,
        hasBackgroundImage: !!(s.data?.backgroundImage),
        backgroundImage: s.data?.backgroundImage || null
      })) || [],
      debug: {
        postId: post.id,
        heroTemplateId: '6f579a71-463c-43b4-b203-c2cb46c80d47',
        totalSections: allSections?.length || 0
      }
    })

  } catch (error) {
    console.error('Debug hero section error:', error)
    return NextResponse.json({ 
      error: 'Failed to debug hero section', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}