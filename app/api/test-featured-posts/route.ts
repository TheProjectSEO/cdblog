import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedPosts } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const featuredPosts = await getFeaturedPosts(6)
    
    const summary = {
      totalFeatured: featuredPosts.length,
      postsWithImages: featuredPosts.filter(p => p.featured_image?.file_url).length,
      postsWithoutImages: featuredPosts.filter(p => !p.featured_image?.file_url).length
    }

    return NextResponse.json({ 
      success: true,
      summary,
      featuredPosts: featuredPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        hasImage: !!post.featured_image?.file_url,
        imageUrl: post.featured_image?.file_url || null,
        is_featured: post.is_featured,
        published_at: post.published_at
      }))
    })

  } catch (error) {
    console.error('Test featured posts error:', error)
    return NextResponse.json({ 
      error: 'Failed to test featured posts', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}