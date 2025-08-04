import { NextRequest, NextResponse } from 'next/server'
import { searchPosts, searchPostsByCategory } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : 20

  try {
    let posts
    let searchType = ''
    
    if (category) {
      posts = await searchPostsByCategory(category, limit)
      searchType = 'category'
    } else {
      posts = await searchPosts(query, limit)
      searchType = 'text'
    }
    
    return NextResponse.json({
      success: true,
      posts,
      query: category || query,
      searchType,
      count: posts.length
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search posts',
        posts: [],
        query: category || query,
        searchType: 'error',
        count: 0
      },
      { status: 500 }
    )
  }
}