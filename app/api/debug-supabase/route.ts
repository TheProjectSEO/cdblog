import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection and authors table...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log('Admin Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    // Test basic query with admin client to bypass RLS
    const client = supabaseAdmin || supabase
    
    // Check authors table
    const { data: authorsData, error: authorsError } = await client
      .from('authors')
      .select('id, name, title')
      .order('name')
    
    if (authorsError) {
      console.error('Authors query error:', authorsError)
      return NextResponse.json({
        error: 'Authors table query failed',
        details: authorsError
      })
    }
    
    // Check ALL modern posts to see author_id pattern
    const { data: allPosts, error: postError } = await client
      .from('modern_posts')
      .select('id, title, author_id')
    
    // Check what author IDs are actually in use
    const uniqueAuthorIds = [...new Set(allPosts?.map(p => p.author_id).filter(Boolean))]
    
    // Count posts with invalid author IDs
    const validAuthorIds = authorsData?.map(a => a.id) || []
    const postsWithInvalidAuthorIds = allPosts?.filter(p => p.author_id && !validAuthorIds.includes(p.author_id)) || []
    
    console.log('Authors data:', authorsData)
    console.log('All posts count:', allPosts?.length)
    console.log('Posts with invalid author IDs:', postsWithInvalidAuthorIds.length)
    console.log('Unique author IDs in posts:', uniqueAuthorIds)
    
    return NextResponse.json({
      success: true,
      authors: authorsData,
      totalPosts: allPosts?.length || 0,
      postsWithInvalidAuthorIds: postsWithInvalidAuthorIds.length,
      invalidAuthorIdPosts: postsWithInvalidAuthorIds.slice(0, 3), // Show first 3 as examples
      uniqueAuthorIds: uniqueAuthorIds,
      authorsError: authorsError,
      postError: postError,
      authorIdMismatch: {
        authorsTableFormat: authorsData?.map(a => a.id),
        postsTableFormat: uniqueAuthorIds,
        validAuthorIds: validAuthorIds,
        issueSummary: `${postsWithInvalidAuthorIds.length} posts have invalid author IDs that don't exist in authors table`
      },
      message: 'Authors table debug complete - found ID format mismatch!'
    })
    
  } catch (error) {
    console.error('Exception:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}