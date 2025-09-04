import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Admin access required'
      }, { status: 500 })
    }

    console.log('Starting author ID fix...')

    // Get all posts with invalid author IDs
    const { data: allPosts, error: fetchError } = await supabaseAdmin
      .from('modern_posts')
      .select('id, title, author_id')

    if (fetchError) {
      throw fetchError
    }

    // Get valid author IDs
    const { data: authors, error: authorsError } = await supabaseAdmin
      .from('authors')
      .select('id, name')

    if (authorsError) {
      throw authorsError
    }

    const validAuthorIds = authors.map(a => a.id)
    const defaultAuthorId = 'sarah-johnson' // The primary author
    
    // Find posts with invalid author IDs
    const postsToFix = allPosts.filter(p => 
      p.author_id && !validAuthorIds.includes(p.author_id)
    )

    console.log(`Found ${postsToFix.length} posts with invalid author IDs`)
    console.log(`Will update them to use default author: ${defaultAuthorId}`)

    if (postsToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts need fixing',
        totalChecked: allPosts.length
      })
    }

    // Update all posts with invalid author IDs to use the default author
    const { data: updatedPosts, error: updateError } = await supabaseAdmin
      .from('modern_posts')
      .update({ 
        author_id: defaultAuthorId,
        updated_at: new Date().toISOString()
      })
      .in('id', postsToFix.map(p => p.id))
      .select('id, title, author_id')

    if (updateError) {
      throw updateError
    }

    console.log(`Successfully updated ${updatedPosts.length} posts`)

    return NextResponse.json({
      success: true,
      message: `Fixed author IDs for ${updatedPosts.length} posts`,
      details: {
        totalChecked: allPosts.length,
        postsFixed: updatedPosts.length,
        newAuthorId: defaultAuthorId,
        validAuthors: authors,
        sampleFixedPosts: updatedPosts.slice(0, 5)
      }
    })

  } catch (error) {
    console.error('Error fixing author IDs:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: 'Failed to fix author IDs',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: typeof error,
      hasAdminClient: !!supabaseAdmin,
      envCheck: {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    }, { status: 500 })
  }
}