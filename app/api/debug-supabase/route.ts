import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const testSlug = 'rome-nightlife'
    
    console.log('Testing direct Supabase query...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Test basic query with admin client to bypass RLS
    const client = supabaseAdmin || supabase
    const { data: testData, error: testError } = await client
      .from('blog_posts')
      .select('id, title, slug, status')
      .eq('slug', testSlug)
      .single()
    
    if (testError) {
      console.error('Supabase query error:', testError)
      return NextResponse.json({
        error: 'Database query failed',
        details: testError,
        slug: testSlug
      })
    }
    
    console.log('Direct query result:', testData)
    
    return NextResponse.json({
      success: true,
      result: testData,
      message: 'Direct Supabase query worked'
    })
    
  } catch (error) {
    console.error('Exception:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}