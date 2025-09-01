import { NextResponse } from 'next/server'
import { getLegacyBlogPostBySlug, getCombinedRecentPosts, searchCombinedPosts } from '@/lib/supabase'
import { convertLegacyPostToTemplate, hasSubstantialContent } from '@/lib/legacy-blog-template-generator'

export async function GET() {
  try {
    const results = {
      success: true,
      tests: {} as any
    }

    // Test 1: Get a specific legacy post
    console.log('Testing legacy post retrieval...')
    const legacyPost = await getLegacyBlogPostBySlug('rotterdam-nightlife')
    results.tests.legacyPostRetrieval = {
      success: !!legacyPost,
      post: legacyPost ? {
        id: legacyPost.id,
        title: legacyPost.title,
        slug: legacyPost.slug,
        contentLength: legacyPost.content?.length || 0,
        hasContent: hasSubstantialContent(legacyPost),
        status: legacyPost.status
      } : null
    }

    // Test 2: Convert legacy post to template
    if (legacyPost) {
      console.log('Testing legacy post template conversion...')
      const templateData = convertLegacyPostToTemplate(legacyPost)
      results.tests.templateConversion = {
        success: !!templateData,
        template: {
          id: templateData.id,
          title: templateData.title,
          contentPreview: templateData.content.substring(0, 200) + '...',
          faqCount: templateData.faqs.length,
          categoriesCount: templateData.categories.length,
          readTime: templateData.read_time,
          author: templateData.author.display_name
        }
      }
    }

    // Test 3: Get combined recent posts
    console.log('Testing combined recent posts...')
    const recentPosts = await getCombinedRecentPosts(5)
    results.tests.combinedRecentPosts = {
      success: true,
      count: recentPosts.length,
      posts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        hasImage: !!post.featured_image
      }))
    }

    // Test 4: Search combined posts
    console.log('Testing combined search...')
    const searchResults = await searchCombinedPosts('travel', 5)
    results.tests.combinedSearch = {
      success: true,
      count: searchResults.length,
      posts: searchResults.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug
      }))
    }

    console.log('All tests completed successfully!')
    return NextResponse.json(results)

  } catch (error) {
    console.error('Blog system test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test blog system',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}