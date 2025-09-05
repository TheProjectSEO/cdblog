import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || 'bangkok'
    
    console.log(`Debugging translations for: ${searchTerm}`)
    
    // Find Bangkok posts
    const { data: bangkokPosts, error: postError } = await supabaseAdmin
      .from('modern_posts')
      .select('id, title, slug')
      .ilike('slug', `%${searchTerm}%`)
    
    if (postError || !bangkokPosts || bangkokPosts.length === 0) {
      return NextResponse.json({
        error: 'Posts not found',
        searchTerm,
        details: postError
      })
    }
    
    const results = []
    
    // Check translations for each Bangkok post
    for (const post of bangkokPosts) {
      const { data: translations } = await supabaseAdmin
        .from('post_translations')
        .select('*')
        .eq('original_post_id', post.id)
      
      results.push({
        originalPost: post,
        translations: translations || [],
        translationsCount: translations?.length || 0,
        analysis: {
          languages: translations?.map(t => t.language_code) || [],
          titleIssues: translations?.filter(t => t.translated_title?.includes('```') || t.translated_title?.includes('html')) || [],
          contentLengths: translations?.map(t => ({
            language: t.language_code,
            contentLength: t.translated_content?.length || 0,
            titleLength: t.translated_title?.length || 0,
            title: t.translated_title?.substring(0, 100) + '...'
          })) || []
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      postsFound: bangkokPosts.length,
      results
    })
    
  } catch (error) {
    console.error('Debug translations error:', error)
    return NextResponse.json({
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}