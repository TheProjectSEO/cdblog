import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations (bypasses RLS)
// Only create if service key is available (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  meta_description?: string
  featured_image?: string
  published_at: string
  updated_at: string
  status: 'published' | 'draft'
  author_id?: string
  categories?: string[]
  tags?: string[]
}

export interface FAQ {
  id: string
  question: string
  answer: string
  post_id: string
  order_index?: number
}

export interface InternalLink {
  id: string
  title: string
  description: string
  url: string
  post_id: string
  order_index?: number
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('modern_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }

  return data
}

export async function getFAQs(postId: string): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('modern_faqs')
    .select('*')
    .eq('post_id', postId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching FAQs:', error)
    return []
  }

  return data || []
}

export async function getInternalLinks(postId: string): Promise<InternalLink[]> {
  const { data, error } = await supabase
    .from('modern_internal_links')
    .select('*')
    .eq('post_id', postId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching internal links:', error)
    return []
  }

  return data || []
}

// Modern blog interfaces and functions
export interface ModernPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  published_at?: string
  author_id: string
  author?: ModernAuthor
  sections?: ModernSection[]
  categories?: ModernCategory[]
  // SEO fields
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: {
    file_url: string
  }
  // Settings
  allow_comments?: boolean
  is_featured?: boolean
  view_count?: number
  reading_time?: number
}

export interface ModernCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export interface ModernAuthor {
  id: string
  display_name: string
  email: string
  avatar_url?: string
  bio?: string
  social_links?: any
  created_at: string
  updated_at: string
}

export interface ModernSection {
  id: string
  template_id: string
  title?: string
  position: number
  data: any
  is_active: boolean
  mobile_hidden?: boolean
  tablet_hidden?: boolean
  created_at: string
  updated_at: string
  template?: {
    name: string
    component_name: string
    category: string
  }
}

// Fetch a single modern blog post by slug with sections (published only)
export async function getModernPostBySlug(slug: string): Promise<ModernPost | null> {
  try {
    const { data: postData, error: postError } = await supabase
      .from('modern_posts')
      .select(`
        *,
        modern_authors(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (postError) {
      if (postError.code === 'PGRST116') {
        console.log(`Modern post not found for slug: ${slug}`)
        return null
      }
      console.error('Error fetching modern blog post:', postError.message)
      return null
    }

    if (!postData) {
      return null
    }

    // Get sections for this post with template information
    const { data: sectionsData } = await supabase
      .from('modern_post_sections')
      .select(`
        *
      `)
      .eq('post_id', postData.id)
      .eq('is_active', true)
      .order('position', { ascending: true })

    // Transform sections to match expected interface
    const transformedSections = (sectionsData || []).map(section => ({
      ...section
    }))

    console.log('Debug info:', {
      postId: postData.id,
      sectionsCount: transformedSections.length,
      sections: transformedSections.map(s => ({ id: s.id, template_id: s.template_id, position: s.position }))
    })

    // Transform data to match expected structure
    const transformedPost = {
      ...postData,
      author: postData.modern_authors,
      blog_authors: postData.modern_authors, // Keep for backward compatibility
      categories: [],
      sections: transformedSections,
      featured_image_url: postData.og_image || null,
      og_image: postData.og_image ? { file_url: postData.og_image } : null,
      published_at: postData.published_at || postData.created_at
    }

    return transformedPost
  } catch (err) {
    console.error('Exception fetching modern blog post:', err)
    return null
  }
}

// Fetch a single modern blog post by slug with sections (includes draft for preview)
export async function getModernPostBySlugWithPreview(slug: string, allowDraft: boolean = false): Promise<ModernPost | null> {
  try {
    // Use admin client for preview functionality to bypass RLS policies
    // Fall back to regular client if admin client is not available (client-side)
    const client = (allowDraft && supabaseAdmin) ? supabaseAdmin : supabase
    
    let query = client
      .from('modern_posts')
      .select(`
        *,
        modern_authors(*)
      `)
      .eq('slug', slug)

    // Only filter by published status if not allowing drafts
    if (!allowDraft) {
      query = query.eq('status', 'published')
    }

    const { data: postData, error: postError } = await query.single()

    if (postError) {
      if (postError.code === 'PGRST116') {
        console.log(`Modern post not found for slug: ${slug}`)
        return null
      }
      console.error('Error fetching modern post:', postError)
      return null
    }

    // Get sections for the post (use same client for consistency)
    const { data: sectionsData, error: sectionsError } = await client
      .from('modern_post_sections')
      .select('*')
      .eq('post_id', postData.id)
      .eq('is_active', true)
      .order('position', { ascending: true })

    if (sectionsError) {
      console.error('Error fetching post sections:', sectionsError)
      // Continue with empty sections array instead of failing
    }

    const transformedPost: ModernPost = {
      ...postData,
      sections: sectionsData || [],
      author: postData.modern_authors || null,
      og_image: postData.og_image ? { file_url: postData.og_image } : null
    }

    return transformedPost
  } catch (error) {
    console.error('Exception in getModernPostBySlugWithPreview:', error)
    return null
  }
}

// Publish a draft post
export async function publishPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('modern_posts')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Error publishing post:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception publishing post:', error)
    return { success: false, error: 'Failed to publish post' }
  }
}

// Get recent posts for blog homepage
export async function getRecentPosts(limit: number = 8) {
  const { data: posts, error } = await supabase
    .from('modern_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      reading_time,
      created_at,
      og_image
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent posts:', error)
    return []
  }

  // Transform posts to use og_image as featured_image, with fallback to hero images
  const postsWithImages = await Promise.all(
    (posts || []).map(async (post) => {
      // If post has og_image, use it
      if (post.og_image) {
        return {
          ...post,
          featured_image: { file_url: post.og_image }
        }
      }
      
      // Fallback: try to get image from hero section for posts without og_image
      try {
        const { data: heroSection } = await supabase
          .from('modern_post_sections')
          .select('data')
          .eq('post_id', post.id)
          .eq('template_id', '6f579a71-463c-43b4-b203-c2cb46c80d47') // Hero section template ID
          .eq('position', 0)
          .maybeSingle()

        const heroImage = heroSection?.data?.backgroundImage
        
        return {
          ...post,
          featured_image: heroImage ? { file_url: heroImage } : null
        }
      } catch (err) {
        // If no hero section found, return post without image
        return {
          ...post,
          featured_image: null
        }
      }
    })
  )

  console.log('getRecentPosts debug:', {
    totalPosts: postsWithImages.length,
    first3Posts: postsWithImages.slice(0, 3).map(post => ({
      id: post.id,
      title: post.title,
      og_image: post.og_image,
      featured_image: post.featured_image
    }))
  })

  return postsWithImages
}

// Get featured posts for blog homepage
export async function getFeaturedPosts(limit: number = 6) {
  const { data: posts, error } = await supabase
    .from('modern_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      reading_time,
      is_featured,
      created_at,
      og_image
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching featured posts:', error)
    return []
  }
  
  // Transform posts to use og_image as featured_image, with fallback to hero images
  const postsWithImages = await Promise.all(
    (posts || []).map(async (post) => {
      // If post has og_image, use it
      if (post.og_image) {
        return {
          ...post,
          featured_image: { file_url: post.og_image }
        }
      }
      
      // Fallback: try to get image from hero section for posts without og_image
      try {
        const { data: heroSection } = await supabase
          .from('modern_post_sections')
          .select('data')
          .eq('post_id', post.id)
          .eq('template_id', '6f579a71-463c-43b4-b203-c2cb46c80d47') // Hero section template ID
          .eq('position', 0)
          .maybeSingle()

        const heroImage = heroSection?.data?.backgroundImage
        
        return {
          ...post,
          featured_image: heroImage ? { file_url: heroImage } : null
        }
      } catch (err) {
        // If no hero section found, return post without image
        return {
          ...post,
          featured_image: null
        }
      }
    })
  )
  
  return postsWithImages
}

// Search posts by category
export async function searchPostsByCategory(category: string, limit: number = 20) {
  // For now, we'll use a simple approach since we don't have a categories table yet
  // This searches for category terms in title and content
  const { data: posts, error } = await supabase
    .from('modern_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      reading_time,
      created_at,
      og_image
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${category}%,excerpt.ilike.%${category}%`)
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error searching posts by category:', error)
    return []
  }
  
  // Transform posts to use og_image as featured_image
  const postsWithImages = (posts || []).map((post) => ({
    ...post,
    featured_image: post.og_image ? { file_url: post.og_image } : null
  }))
  
  return postsWithImages
}

// Get posts count
export async function getPostsCount() {
  const { count, error } = await supabase
    .from('modern_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching posts count:', error)
    return 0
  }

  return count || 0
}

// Get popular categories
export async function getPopularCategories(limit: number = 8) {
  const { data: categories, error } = await supabase
    .from('modern_categories')
    .select(`
      name,
      slug,
      description
    `)
    .order('name')
    .limit(limit)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

// Starter Pack interfaces and functions
export interface StarterPackHighlight {
  id: string
  icon: string
  title: string
  value: string
  description: string
  order_index: number
}

export interface StarterPackFeature {
  id: string
  title: string
  content: string
  order_index: number
}

export interface StarterPackSection {
  section_id: string
  section_badge: string
  section_title: string
  section_description: string
  section_position: number
  highlights: StarterPackHighlight[]
  features: StarterPackFeature[]
}

// Get starter pack data for a specific post
export async function getStarterPackForPost(postId: string): Promise<StarterPackSection | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_starter_pack_for_post', { post_id_param: postId })

    if (error) {
      console.error('Error fetching starter pack:', error)
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    return data[0] as StarterPackSection
  } catch (err) {
    console.error('Exception fetching starter pack:', err)
    return null
  }
}

// Create or update starter pack for a post
export async function createStarterPackSection(
  postId: string,
  badge: string,
  title: string,
  description: string,
  position: number = 3,
  highlights: Array<{
    icon: string
    title: string
    value: string
    description: string
    order_index: number
  }> = [],
  features: Array<{
    title: string
    content: string
    order_index: number
  }> = []
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('insert_starter_pack_section', {
        post_id_param: postId,
        badge_param: badge,
        title_param: title,
        description_param: description,
        position_param: position,
        highlights_param: JSON.stringify(highlights),
        features_param: JSON.stringify(features)
      })

    if (error) {
      console.error('Error creating starter pack:', error)
      return null
    }

    return data as string
  } catch (err) {
    console.error('Exception creating starter pack:', err)
    return null
  }
}

// Search posts by title, excerpt, or content
export async function searchPosts(query: string, limit: number = 20) {
  if (!query.trim()) {
    return getRecentPosts(limit)
  }

  const { data: posts, error } = await supabase
    .from('modern_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      published_at,
      reading_time,
      created_at,
      meta_title,
      meta_description,
      og_image
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,meta_title.ilike.%${query}%,meta_description.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching posts:', error)
    return []
  }

  // Transform posts to use og_image as featured_image
  const postsWithImages = (posts || []).map((post) => ({
    ...post,
    featured_image: post.og_image ? { file_url: post.og_image } : null
  }))

  return postsWithImages
}