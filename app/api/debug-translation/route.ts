import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const lang = searchParams.get('lang')

    if (!slug || !lang) {
      return NextResponse.json({ error: 'Missing slug or lang parameter' }, { status: 400 })
    }

    // Get original post
    const { data: originalPost, error: originalError } = await supabase
      .from('modern_posts')
      .select('id, title, slug')
      .eq('slug', slug)
      .single()

    if (originalError || !originalPost) {
      return NextResponse.json({ error: 'Original post not found', details: originalError }, { status: 404 })
    }

    // Get translation
    const { data: translation, error: translationError } = await supabase
      .from('post_translations')
      .select('*')
      .eq('original_post_id', originalPost.id)
      .eq('language_code', lang)
      .single()

    if (translationError || !translation) {
      return NextResponse.json({ 
        error: `Translation not found for ${lang}`, 
        details: translationError,
        originalPost
      }, { status: 404 })
    }

    // Get translated sections
    const { data: translatedSections, error: sectionsError } = await supabase
      .from('translated_sections')
      .select('*')
      .eq('translation_id', translation.id)
      .order('position', { ascending: true })

    // Get original sections for comparison
    const { data: originalSections, error: originalSectionsError } = await supabase
      .from('modern_post_sections')
      .select(`
        id,
        template_id,
        data,
        position,
        template:modern_section_templates(name, component_name)
      `)
      .eq('post_id', originalPost.id)
      .eq('is_active', true)
      .order('position', { ascending: true })

    return NextResponse.json({
      success: true,
      originalPost,
      translation,
      translatedSections: translatedSections || [],
      originalSections: originalSections || [],
      sectionsError,
      originalSectionsError,
      summary: {
        originalSectionsCount: originalSections?.length || 0,
        translatedSectionsCount: translatedSections?.length || 0,
        translationStatus: translation.translation_status,
        translatedAt: translation.translated_at
      }
    })

  } catch (error) {
    console.error('Debug translation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}