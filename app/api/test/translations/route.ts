import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if post_translations table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('post_translations')
      .select('*')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'post_translations table does not exist',
        details: tableError.message,
        solution: 'Run the fix_translations_table.sql file in your Supabase SQL editor'
      }, { status: 400 })
    }

    // Test 2: Get sample post to test with
    const { data: samplePost, error: postError } = await supabaseAdmin
      .from('modern_posts')
      .select('id, title, slug')
      .limit(1)
      .single()

    if (postError || !samplePost) {
      return NextResponse.json({
        success: false,
        error: 'No posts found in modern_posts table',
        details: postError?.message || 'No posts available'
      }, { status: 400 })
    }

    // Test 3: Check existing translations
    const { data: existingTranslations, error: translationError } = await supabaseAdmin
      .from('post_translations')
      .select('*')
      .order('created_at', { ascending: false })

    if (translationError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to query translations',
        details: translationError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Translation system is working correctly!',
      data: {
        tableExists: true,
        totalTranslations: existingTranslations?.length || 0,
        existingTranslations: existingTranslations || [],
        samplePost: {
          id: samplePost.id,
          title: samplePost.title,
          slug: samplePost.slug
        }
      }
    })

  } catch (error) {
    console.error('Translation test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during translation test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { postId, languages } = await request.json()

    if (!postId || !languages || languages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'postId and languages array are required'
      }, { status: 400 })
    }

    // Test the translation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/admin/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        languages,
        background: true
      })
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Translation API failed',
        details: result
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Translation test completed successfully!',
      result
    })

  } catch (error) {
    console.error('Translation POST test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Translation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}