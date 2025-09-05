import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId') || '2efc693e-5e94-4aca-9846-49936b65f483'
    
    // Get the original post with full sections data
    const { data: originalPost, error } = await supabaseAdmin
      .from('modern_posts')
      .select(`
        *,
        sections:modern_post_sections(
          id, template_id, title, data, position, is_active
        )
      `)
      .eq('id', postId)
      .single()
    
    if (error || !originalPost) {
      return NextResponse.json({
        error: 'Post not found',
        details: error
      })
    }
    
    // Find main content section
    const contentSection = originalPost.sections.find(s => 
      s.template_id === 'e30d9e40-eb3a-41d3-aeac-413cfca52fe0' || 
      s.data?.content
    )
    
    const contentToTranslate = contentSection?.data?.content || ''
    
    // Use the same chunking logic as the translation API
    let chunks: string[] = []
    
    if (contentToTranslate.includes('<h2') || contentToTranslate.includes('<h3')) {
      chunks = contentToTranslate.split(/(?=<h[23][^>]*>)/).filter(chunk => chunk.trim())
    } else if (contentToTranslate.includes('<p>')) {
      chunks = contentToTranslate.split(/(?=<p>)/).filter(chunk => chunk.trim() && chunk.length > 100)
    } else {
      chunks = contentToTranslate.split(/\n\s*\n/).filter(chunk => chunk.trim())
    }
    
    // If still one big chunk, force split by character count
    if (chunks.length === 1 && chunks[0].length > 3000) {
      const bigChunk = chunks[0]
      chunks = []
      
      const sentences = bigChunk.split(/\.(?=\s+[A-Z<])/).filter(s => s.trim())
      let currentChunk = ''
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > 2000 && currentChunk.length > 0) {
          chunks.push(currentChunk.trim() + '.')
          currentChunk = sentence
        } else {
          currentChunk += sentence + '.'
        }
      }
      
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
    }
    
    return NextResponse.json({
      success: true,
      post: {
        title: originalPost.title,
        sectionsCount: originalPost.sections.length,
        contentSection: {
          id: contentSection?.id,
          template_id: contentSection?.template_id,
          hasContent: !!contentSection?.data?.content,
          contentLength: contentToTranslate.length,
          chunksCount: chunks.length,
          firstChunkPreview: chunks[0]?.substring(0, 200) + '...',
          lastChunkPreview: chunks[chunks.length - 1]?.substring(0, 200) + '...'
        }
      }
    })
    
  } catch (error) {
    console.error('Debug full content error:', error)
    return NextResponse.json({
      error: 'Failed to debug content',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}