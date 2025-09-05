import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const debugSlug = searchParams.get('slug') || 'new-travel-guide-1756996117860'
    
    console.log(`Debugging sections for post slug: ${debugSlug}`)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('Admin Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase
    
    // First, get the post by slug
    const { data: postData, error: postError } = await client
      .from('modern_posts')
      .select('*')
      .eq('slug', debugSlug)
      .single()
    
    if (postError) {
      console.error('Post query error:', postError)
      return NextResponse.json({
        error: 'Post not found',
        slug: debugSlug,
        details: postError
      })
    }
    
    // Get sections for this post
    const { data: sectionsData, error: sectionsError } = await client
      .from('modern_post_sections')
      .select('*')
      .eq('post_id', postData.id)
      .order('position', { ascending: true })
    
    // Get only active sections
    const { data: activeSectionsData, error: activeSectionsError } = await client
      .from('modern_post_sections')
      .select('*')
      .eq('post_id', postData.id)
      .eq('is_active', true)
      .order('position', { ascending: true })
    
    console.log('Post found:', {
      id: postData.id,
      title: postData.title,
      slug: postData.slug,
      status: postData.status
    })
    
    console.log('Sections data:', sectionsData?.length || 0, 'total sections')
    console.log('Active sections:', activeSectionsData?.length || 0, 'active sections')
    
    return NextResponse.json({
      success: true,
      slug: debugSlug,
      post: {
        id: postData.id,
        title: postData.title,
        slug: postData.slug,
        status: postData.status,
        published_at: postData.published_at,
        created_at: postData.created_at,
        updated_at: postData.updated_at
      },
      sectionsAnalysis: {
        totalSections: sectionsData?.length || 0,
        activeSections: activeSectionsData?.length || 0,
        inactiveSections: (sectionsData?.length || 0) - (activeSectionsData?.length || 0),
        hasSections: (activeSectionsData?.length || 0) > 0
      },
      allSections: sectionsData || [],
      activeSectionsOnly: activeSectionsData || [],
      sectionsError: sectionsError,
      activeSectionsError: activeSectionsError,
      postError: postError,
      message: `Debug complete for slug: ${debugSlug}`
    })
    
  } catch (error) {
    console.error('Exception:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}