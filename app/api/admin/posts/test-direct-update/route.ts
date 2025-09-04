import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Admin client not available'
      }, { status: 500 })
    }

    console.log('Testing direct post update...')

    // Try the simplest possible update
    const testPostId = 'c8b5e3ac-ac14-4f80-b6cb-2769608c3616'
    // First, let's test updating without changing author_id to see if basic update works
    const simpleUpdate = {
      updated_at: new Date().toISOString()
      // Don't change author_id for now - just test basic update
    }

    console.log('Attempting update with data:', simpleUpdate)

    const { data: result, error } = await supabaseAdmin
      .from('modern_posts')
      .update(simpleUpdate)
      .eq('id', testPostId)
      .select('id, title, author_id, updated_at')

    console.log('Direct update result:', { result, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error,
        message: 'Direct update failed'
      })
    }

    if (!result || result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No rows updated - likely RLS policy issue',
        hasAdminClient: !!supabaseAdmin,
        testPostId
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Direct update succeeded',
      updatedPost: result[0],
      rowsAffected: result.length
    })

  } catch (error) {
    console.error('Error in direct update test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}