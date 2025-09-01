import { NextResponse } from 'next/server'
import { searchCombinedPosts } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing searchCombinedPosts function...')
    
    const results = await searchCombinedPosts('rome', 3)
    
    console.log('Search results:', {
      count: results.length,
      results: results.map(r => ({ id: r.id, title: r.title, slug: r.slug }))
    })
    
    return NextResponse.json({
      success: true,
      count: results.length,
      results: results,
      message: 'Search test completed'
    })
    
  } catch (error) {
    console.error('Search test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    })
  }
}