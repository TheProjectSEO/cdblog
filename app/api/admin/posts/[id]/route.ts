import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = supabaseAdmin || supabase
    const { data: post, error } = await db
      .from('modern_posts')
      .select(`
        *,
        sections:modern_post_sections(*)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Transform the data
    const transformedPost = {
      ...post,
      categories: post.categories || [],
      tags: post.tags || [],
      sections: post.sections?.sort((a, b) => a.position - b.position) || []
    }

    return NextResponse.json(transformedPost)

  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log('Update post request body:', body)
    console.log('Post ID from params:', params.id)
    
    const {
      title,
      slug,
      excerpt,
      content,
      status,
      featured_image_url,
      author_id,
      seo_title,
      seo_description,
      categories = [],
      tags = [],
      faq_items = [],
      internal_links = [],
      template_enabled = false,
      template_type
    } = body

    // Force using admin client for updates to bypass RLS
    const db = supabaseAdmin
    
    if (!db) {
      console.error('Admin client not available - service key missing')
      return NextResponse.json(
        { error: 'Admin access required for post updates' },
        { status: 500 }
      )
    }

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Validate author_id if provided (use modern_authors table, not authors)
    if (author_id) {
      console.log('Validating author_id:', author_id)
      const { data: authorExists, error: authorError } = await db
        .from('modern_authors')
        .select('id, display_name')
        .eq('id', author_id)
        .single()
      
      if (!authorExists) {
        // Get all available authors for debugging
        const { data: allAuthors } = await db
          .from('modern_authors')
          .select('id, display_name')
        
        return NextResponse.json(
          { 
            error: 'Invalid author ID provided',
            provided_author_id: author_id,
            available_authors: allAuthors?.map(a => ({ id: a.id, name: a.display_name }))
          },
          { status: 400 }
        )
      }
    }

    // Check for duplicate slug (excluding current post)
    const { data: existingPost } = await db
      .from('modern_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', params.id)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 409 }
      )
    }

    // Validate status
    const allowedStatuses = ['draft', 'published', 'archived'] as const
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || '',
      content: content || '',
      status,
      // Note: featured_image_url maps to featured_image_id in database
      // featured_image_id: featured_image_url || null,
      seo_title: seo_title || title,
      seo_description: seo_description?.trim() || '',
      faq_items: faq_items || [],
      internal_links: internal_links || [],
      template_enabled,
      template_type: template_type || null,
      updated_at: new Date().toISOString()
    }

    // Include author_id if provided (now using correct modern_authors table)
    if (author_id) {
      updateData.author_id = author_id
    }

    // Set published_at if status is being set to published for the first time
    if (status === 'published') {
      const { data: currentPost } = await db
        .from('modern_posts')
        .select('published_at')
        .eq('id', params.id)
        .single()

      if (currentPost && !currentPost.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    console.log('Updating post with data:', updateData)
    console.log('Using database client:', db === supabaseAdmin ? 'ADMIN' : 'REGULAR')
    console.log('Service key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: updatedPosts, error } = await db
      .from('modern_posts')
      .update(updateData)
      .eq('id', params.id)
      .select('*')
    
    console.log('Update result:', { data: updatedPosts, error })
    
    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    if (!updatedPosts || updatedPosts.length === 0) {
      console.error('No rows were updated - possibly due to RLS policy or ID not found')
      return NextResponse.json(
        { error: 'Post not found or update not permitted - no rows affected' },
        { status: 404 }
      )
    }
    
    const updatedPost = updatedPosts[0]
    
    // Handle categories and tags separately since they're in junction tables
    if (categories && Array.isArray(categories)) {
      // First, remove all existing categories for this post
      await db
        .from('modern_post_categories')
        .delete()
        .eq('post_id', params.id)
      
      // Then add the new categories
      if (categories.length > 0) {
        const categoryIds = []
        
        for (const categoryName of categories) {
          // Look up category by name or slug
          let { data: existingCategory } = await db
            .from('modern_categories')
            .select('id')
            .or(`name.eq.${categoryName},slug.eq.${categoryName.toLowerCase().replace(/\s+/g, '-')}`)
            .single()
          
          let categoryId
          if (existingCategory) {
            categoryId = existingCategory.id
          } else {
            // Create new category if it doesn't exist
            const { data: newCategory, error: createError } = await db
              .from('modern_categories')
              .insert({
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                is_active: true
              })
              .select('id')
              .single()
            
            if (createError) {
              console.error('Error creating category:', createError)
              continue // Skip this category if creation fails
            }
            categoryId = newCategory.id
          }
          
          if (categoryId) {
            categoryIds.push({ post_id: params.id, category_id: categoryId })
          }
        }
        
        if (categoryIds.length > 0) {
          await db
            .from('modern_post_categories')
            .insert(categoryIds)
        }
      }
    }
    
    if (tags && Array.isArray(tags)) {
      // First, remove all existing tags for this post
      await db
        .from('modern_post_tags')
        .delete()
        .eq('post_id', params.id)
      
      // Then add the new tags
      if (tags.length > 0) {
        const tagIds = []
        
        for (const tagName of tags) {
          // Look up tag by name or slug
          let { data: existingTag } = await db
            .from('modern_tags')
            .select('id')
            .or(`name.eq.${tagName},slug.eq.${tagName.toLowerCase().replace(/\s+/g, '-')}`)
            .single()
          
          let tagId
          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Create new tag if it doesn't exist
            const { data: newTag, error: createError } = await db
              .from('modern_tags')
              .insert({
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, '-')
              })
              .select('id')
              .single()
            
            if (createError) {
              console.error('Error creating tag:', createError)
              continue // Skip this tag if creation fails
            }
            tagId = newTag.id
          }
          
          if (tagId) {
            tagIds.push({ post_id: params.id, tag_id: tagId })
          }
        }
        
        if (tagIds.length > 0) {
          await db
            .from('modern_post_tags')
            .insert(tagIds)
        }
      }
    }
    
    console.log('Successfully updated post:', updatedPost)

    return NextResponse.json(updatedPost)

  } catch (error) {
    console.error('Error updating post:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      postId: params.id
    })
    return NextResponse.json(
      { 
        error: 'Failed to update post',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        supabaseError: (error as any)?.details || (error as any)?.hint
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = supabaseAdmin || supabase
    const { error } = await db
      .from('modern_posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
