import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const db = supabaseAdmin || supabase
    let query = db
      .from('modern_posts')
      .select('*')

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(
        `title.ilike.%${search}%,slug.ilike.%${search}%,excerpt.ilike.%${search}%`
      )
    }

    // Get total count first
    const { count: totalCount } = await db
      .from('modern_posts')
      .select('*', { count: 'exact', head: true })

    // Add pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false })

    const { data: posts, error } = await query

    if (error) {
      throw error
    }

    // Transform posts data
    const transformedPosts = posts?.map(post => ({
      ...post,
      sections_count: 0,
      categories: post.categories || [],
      tags: post.tags || [],
      author: { display_name: 'Admin', email: 'admin@cuddlynest.com' }
    })) || []

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      slug,
      excerpt,
      content,
      status = 'draft',
      featured_image_url,
      author_id,
      seo_title,
      seo_description,
      categories = [],
      tags = [],
      faq_items = [],
      template_enabled = false,
      template_type
    } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }
    
    // Validate author_id if provided (use modern_authors table)
    if (author_id) {
      const { data: authorExists } = await db
        .from('modern_authors')
        .select('id')
        .eq('id', author_id)
        .single()
        
      if (!authorExists) {
        return NextResponse.json(
          { error: 'Invalid author ID provided' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate slug
    const db = supabaseAdmin || supabase
    const { data: existingPost } = await db
      .from('modern_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()

    const insertData: any = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || '',
      content: content || '',
      status,
      seo_title: seo_title || title,
      seo_description: seo_description?.trim() || '',
      faq_items: faq_items || [],
      template_enabled,
      template_type: template_type || null,
      created_at: now,
      updated_at: now,
      published_at: status === 'published' ? now : null
    }
    
    // Include author_id if provided
    if (author_id) {
      insertData.author_id = author_id
    }
    
    const { data: newPost, error } = await db
      .from('modern_posts')
      .insert(insertData)
      .select(`
        *,
        author:modern_authors(id, display_name, email)
      `)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(newPost, { status: 201 })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
