'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search,
  Plus, 
  GripVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Save,
  Layout,
  Languages,
  User,
  MapPin,
  Camera,
  Star,
  Building,
  Hotel,
  Bot,
  BookOpen,
  HelpCircle,
  Sparkles,
  FileText,
  Settings,
  ArrowRight,
  Clock,
  Upload,
  Home,
  Link,
  Globe,
  BarChart,
  MessageSquare,
  Award,
  Database,
  ImageIcon,
  AlertTriangle,
  Send
} from 'lucide-react'
import { supabase, publishPost } from '@/lib/supabase'
import { searchPostsWithTranslations } from '@/lib/supabase_translation_search'
import { SectionEditor } from '@/components/admin/section-editor'
import { TranslationManager } from '@/components/admin/TranslationManager'
import { TranslatedPostEditor } from '@/components/admin/TranslatedPostEditor'
import { BulkTranslationManager } from '@/components/admin/BulkTranslationManager'
import { SEOFormFields, SEOFormData } from '@/components/seo/SEOFormFields'
import { StructuredDataEditor } from '@/components/admin/StructuredDataEditor'
import { TravelGuideSchemaEditor } from '@/components/admin/TravelGuideSchemaEditor'
import { ImageGenerator } from '@/components/admin/ImageGenerator'

interface ModernPost {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
  excerpt?: string
  author_id?: string
  sections?: ModernSection[]
  // SEO fields
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  canonical_url?: string
  robots_index?: boolean
  robots_follow?: boolean
  robots_nosnippet?: boolean
  og_title?: string
  og_description?: string
  og_image?: string
  og_image_alt?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  twitter_image_alt?: string
  focus_keyword?: string
  // Structured data fields
  structured_data_type?: string
  custom_json_ld?: string
  structured_data_enabled?: boolean
  schema_override_priority?: number
  // Travel guide specific fields
  destination?: string
  faq_items?: Array<{
    question: string
    answer: string
  }>
  itinerary_days?: Array<{
    day: number
    title: string
    description: string
    activities?: string[]
  }>
  read_time_minutes?: number
}

interface ModernSection {
  id: string
  template_id: string
  position: number
  data: any
  is_active: boolean
  mobile_hidden?: boolean
  tablet_hidden?: boolean
  created_at: string
  updated_at: string
}

const SECTION_TYPES = [
  { 
    id: '6f579a71-463c-43b4-b203-c2cb46c80d47',
    name: 'Hero Section', 
    icon: Layout, 
    color: 'bg-blue-500',
    description: 'Stunning imagery + key blog details (title, summary)'
  },
  { 
    id: '58e1b71c-600b-48d3-a956-f9b27bc368b2',
    name: 'Author Section', 
    icon: User, 
    color: 'bg-blue-600',
    description: 'Author name, avatar, social links, bio'
  },
  { 
    id: 'b87245be-1b68-47d4-83a6-fac582a0847f',
    name: 'Starter Pack', 
    icon: Sparkles, 
    color: 'bg-blue-700',
    description: 'Destination starter pack with stats and overview section'
  },
  { 
    id: 'e30d9e40-eb3a-41d3-aeac-413cfca52fe0',
    name: 'Blog Content Section', 
    icon: FileText, 
    color: 'bg-brand-purple',
    description: 'Main blog content from WordPress'
  },
  { 
    id: 'b1d8062e-9fff-46d4-86b8-f198de9f3d38',
    name: 'Why Destination Hits Different', 
    icon: MapPin, 
    color: 'bg-blue-500',
    description: 'Insights and cultural reasons to take day trips'
  },
  { 
    id: 'e596d688-31d9-4722-926d-18868f50f0cf',
    name: 'Top Things to Do', 
    icon: Camera, 
    color: 'bg-blue-600',
    description: 'Carousel: towns, coast, scenic places'
  },
  { 
    id: '5251d41a-d7f8-44b6-bfaf-636d50c859b1',
    name: 'Places to Visit Nearby', 
    icon: Star, 
    color: 'bg-blue-700',
    description: 'Featured places with links/images'
  },
  { 
    id: '833666f2-e112-40c0-9d50-02f160b96f3a',
    name: 'Where to Stay', 
    icon: Building, 
    color: 'bg-brand-purple',
    description: 'Info on neighborhoods and stay zones'
  },
  { 
    id: 'e2036f8e-e01e-4a04-8cf7-814f77b4343b',
    name: 'Hotels You\'ll Actually Love', 
    icon: Hotel, 
    color: 'bg-blue-500',
    description: 'Curated list with descriptions and images'
  },
  { 
    id: '03d9efa8-2c31-489d-94af-d2d85f52aa9c',
    name: 'Meet Your AI', 
    icon: Bot, 
    color: 'bg-blue-600',
    description: 'CTA section prompting interaction with AI travel planner'
  },
  { 
    id: 'c2caf0b9-68b6-48c1-999c-4cc48bd12242',
    name: 'Internal Links', 
    icon: BookOpen, 
    color: 'bg-blue-700',
    description: 'Internal links, styled with purple CTA buttons'
  },
  { 
    id: '710f8880-c86d-4353-b16f-474c74debd31',
    name: 'FAQ Section', 
    icon: HelpCircle, 
    color: 'bg-brand-purple',
    description: 'Expandable Q&A section'
  }
]

// Generate URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export default function AdminPage() {
  const [posts, setPosts] = useState<ModernPost[]>([])
  const [totalPostCount, setTotalPostCount] = useState(0)
  const [selectedPost, setSelectedPost] = useState<ModernPost | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [editingSection, setEditingSection] = useState<ModernSection | null>(null)
  const [showSectionEditor, setShowSectionEditor] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [seoData, setSeoData] = useState<SEOFormData>({})
  const [showSEOTab, setShowSEOTab] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  
  // Debug: Log view changes
  useEffect(() => {
    console.log('Current view changed to:', currentView)
  }, [currentView])
  const [showPostList, setShowPostList] = useState(false)
  const [sections, setSections] = useState<ModernSection[]>([])
  const [loadingSections, setLoadingSections] = useState(false)
  const [editingTranslationId, setEditingTranslationId] = useState<string | null>(null)
  const [showTranslatedPostEditor, setShowTranslatedPostEditor] = useState(false)

  // Sidebar navigation items
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      view: 'dashboard'
    },
    {
      id: 'travel-guide',
      label: 'Travel Guide',
      icon: FileText,
      view: 'travel-guide'
    },
    {
      id: 'internal-links',
      label: 'Internal Links',
      icon: Link,
      view: 'internal-links'
    },
    {
      id: 'url-redirects',
      label: 'URL Redirects',
      icon: ArrowRight,
      view: 'url-redirects'
    },
    {
      id: 'robots-txt',
      label: 'Robots.txt',
      icon: Bot,
      view: 'robots-txt'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Database,
      view: 'categories'
    },
    {
      id: 'testimonials',
      label: 'Testimonials',
      icon: MessageSquare,
      view: 'testimonials'
    },
    {
      id: 'homepage',
      label: 'Homepage',
      icon: Globe,
      view: 'homepage'
    },
    {
      id: 'image-generator',
      label: 'AI Image Generator',
      icon: ImageIcon,
      view: 'image-generator'
    },
    {
      id: 'translations',
      label: 'Translations',
      icon: Languages,
      view: 'translations'
    },
    {
      id: 'manage-articles',
      label: 'Delete Articles',
      icon: Trash2,
      view: 'manage-articles'
    }
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) return

    setIsSearching(true)
    try {
      const results = await searchPostsWithTranslations(query, 50)
      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const loadPostDetails = async (postId: string) => {
    setLoadingSections(true)
    try {
      console.log('Loading post details for:', postId)
      
      // First, get the full post data including content fields
      const { data: postData, error: postError } = await supabase
        .from('modern_posts')
        .select('*')
        .eq('id', postId)
        .single()
      
      if (postError) {
        console.error('Error loading post:', postError)
        throw postError
      }
      
      console.log('Full post data:', postData)
      
      // Try to load sections if they exist
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('modern_post_sections')
        .select('*')
        .eq('post_id', postId)
        .order('position', { ascending: true })
      
      if (sectionsError && !sectionsError.message?.includes('does not exist')) {
        console.error('Sections error:', sectionsError)
      }
      
      console.log('Sections data:', sectionsData)
      
      // If no sections exist in database but post has content, try to create sections from existing content
      if ((!sectionsData || sectionsData.length === 0) && postData) {
        console.log('No sections found, attempting to create default sections for existing post')
        const success = await createDefaultSectionsForPost(postData)
        if (success) {
          // Reload sections after successful creation
          const { data: newSectionsData } = await supabase
            .from('modern_post_sections')
            .select('*')
            .eq('post_id', postId)
            .order('position', { ascending: true })
          setSections(newSectionsData || [])
        } else {
          // If section creation failed, just show empty sections
          setSections([])
        }
      } else {
        setSections(sectionsData || [])
      }
      
      // Update selectedPost with full data
      setSelectedPost(postData)
      
    } catch (error) {
      console.error('Error loading post details:', error)
      setSections([])
    } finally {
      setLoadingSections(false)
    }
  }

  const createDefaultSectionsForPost = async (post: any): Promise<boolean> => {
    try {
      console.log('Creating default sections for post:', post.id)
      
      // Check if modern_sections table exists by trying a simple query first
      const { data: testQuery, error: testError } = await supabase
        .from('modern_post_sections')
        .select('id')
        .limit(1)
      
      if (testError) {
        console.error('modern_post_sections table may not exist:', testError)
        // If table doesn't exist, we'll skip section creation for now
        return false
      }

      const sectionsToCreate = [
        {
          post_id: post.id,
          template_id: '6f579a71-463c-43b4-b203-c2cb46c80d47', // Hero
          position: 0,
          is_active: true,
          data: {
            title: post.title || 'Post Title',
            subtitle: post.excerpt || 'Post description',
            backgroundImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            location: 'Location'
          }
        },
        {
          post_id: post.id,
          template_id: 'e30d9e40-eb3a-41d3-aeac-413cfca52fe0', // Blog Content
          position: 1,
          is_active: true,
          data: {
            content: '<p>Add your blog content here...</p>'
          }
        }
      ]

      const { data, error } = await supabase
        .from('modern_post_sections')
        .insert(sectionsToCreate)
        .select()

      if (error) {
        console.error('Detailed error creating sections:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        return false
      } else {
        console.log('Successfully created default sections:', data)
        return true
      }
    } catch (error) {
      console.error('Unexpected error in createDefaultSectionsForPost:', error)
      return false
    }
  }

  const handleSectionReorder = async (result: any) => {
    if (!result.destination || !selectedPost) return

    const { source, destination } = result
    
    // If dropped in same position, do nothing
    if (source.index === destination.index) return

    try {
      // Create new sections array with reordered items
      const reorderedSections = Array.from(sections)
      const [movedSection] = reorderedSections.splice(source.index, 1)
      reorderedSections.splice(destination.index, 0, movedSection)

      // Update local state immediately for smooth UI
      setSections(reorderedSections)

      // Update positions in database
      const updatePromises = reorderedSections.map((section, index) => 
        supabase
          .from('modern_post_sections')
          .update({ position: index })
          .eq('id', section.id)
      )

      await Promise.all(updatePromises)
      console.log('Section order updated successfully')
      
    } catch (error) {
      console.error('Error reordering sections:', error)
      // Reload sections to restore original order on error
      if (selectedPost) {
        loadPostDetails(selectedPost.id)
      }
    }
  }

  const loadPosts = async () => {
    try {
      // First get the total count
      const { count, error: countError } = await supabase
        .from('modern_posts')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Error getting count:', countError)
      } else {
        console.log('Total posts in database:', count)
        setTotalPostCount(count || 0)
      }

      // Then get all posts (increase limit to handle large datasets)
      const { data, error } = await supabase
        .from('modern_posts')
        .select(`
          id,
          title,
          slug,
          status,
          excerpt,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(5000) // Increase limit to handle large datasets

      if (error) throw error
      console.log('Loaded posts:', data?.length)
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewPost = async () => {
    setIsCreating(true)
    try {
      const timestamp = Date.now()
      const title = `New Travel Guide ${timestamp}`
      let slug = generateSlug(title)
      
      // Ensure unique slug by checking existing slugs
      let counter = 1
      let originalSlug = slug
      while (true) {
        const { data: existingPost } = await supabase
          .from('modern_posts')
          .select('id')
          .eq('slug', slug)
          .single()
        
        if (!existingPost) break // Slug is unique
        
        slug = `${originalSlug}-${counter}`
        counter++
      }
      
      // Try to get a valid author ID, fallback to a system default
      let authorId = '6ab96e87-00db-44bd-ac5f-34a3dd8d457c'
      
      // First, try to find any existing author in the system
      const { data: authors } = await supabase
        .from('authors')
        .select('id')
        .limit(1)
      
      if (authors && authors.length > 0) {
        authorId = authors[0].id
      }

      const { data, error } = await supabase
        .from('modern_posts')
        .insert({
          title,
          slug,
          status: 'draft', // Keep as draft for editing workflow
          excerpt: 'This is a test post created to demonstrate the editing functionality.',
          seo_description: 'A test post to demonstrate the hybrid editing system for legacy and section-based posts.',
          author_id: authorId,
          content: null // Add the content field that the database trigger expects
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      const newPost = { ...data, sections: [] }
      setPosts([newPost, ...posts])
      setSelectedPost(newPost)
      
      // Initialize SEO data for new post
      setSeoData({})
    } catch (error) {
      console.error('Error creating post:', error)
      alert(`Error creating post: ${error.message || 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handlePublishPost = async (postId: string) => {
    setIsPublishing(true)
    try {
      const result = await publishPost(postId)
      if (result.success) {
        // Update the post in the local state
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, status: 'published', published_at: new Date().toISOString() }
            : post
        ))
        
        // Update selected post if it's the one being published
        if (selectedPost?.id === postId) {
          setSelectedPost({ 
            ...selectedPost, 
            status: 'published', 
            published_at: new Date().toISOString() 
          })
        }
        
        alert('Post published successfully!')
      } else {
        alert(`Error publishing post: ${result.error}`)
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post')
    } finally {
      setIsPublishing(false)
    }
  }

  const renderDashboardStats = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your CuddlyNest CMS dashboard</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Schema Types Active
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">6</dd>
                  <dd className="text-xs text-green-600">✓ Organization, Website, FAQ</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowRight className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    URL Redirects
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">45</dd>
                  <dd className="text-xs text-blue-600">• 38 permanent, 7 temporary</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Internal Links
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">127</dd>
                  <dd className="text-xs text-green-600">• 9 categories, priority-based</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Travel Guide Posts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalPostCount.toLocaleString()}
                    <div className="text-xs text-gray-500 mt-1">
                      Published: {posts.filter(p => p.status === 'published').length} | 
                      Drafts: {posts.filter(p => p.status === 'draft').length}
                      {posts.length < totalPostCount && (
                        <div className="text-xs text-blue-600 mt-1">
                          Showing {posts.length} most recent posts
                        </div>
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={createNewPost}
              disabled={isCreating}
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create New Travel Guide'}
            </Button>
            <Button 
              onClick={() => setCurrentView('travel-guide')}
              variant="outline"
              className="w-full justify-start"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add new travel guide article
            </Button>
            <Button 
              onClick={() => setCurrentView('homepage')}
              variant="outline"
              className="w-full justify-start"
            >
              <Globe className="w-4 h-4 mr-2" />
              Update Homepage
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Enhanced Admin Dashboard Active</span>
                <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Advanced URL Management</span>
                <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Internal Linking System</span>
                <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Global Schema Management</span>
                <Badge variant="secondary" className="ml-auto text-xs">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Multi-language Translation</span>
                <Badge variant="outline" className="ml-auto text-xs">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPlaceholderView = (title: string, description: string, icon: any) => {
    const Icon = icon
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-12 text-center">
            <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">This feature is currently under development.</p>
            <Button 
              onClick={() => setCurrentView('dashboard')}
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CuddlyNest Admin</h1>
              <p className="text-sm text-gray-500">Content Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log(`Clicking ${item.label} - setting view to: ${item.view}`)
                  setCurrentView(item.view)
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  currentView === item.view
                    ? 'bg-purple-100 text-purple-700 border-r-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                type="button"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* View Site Button */}
        <div className="p-4 border-t border-gray-200">
          <Button 
            onClick={() => window.open('/', '_blank')}
            variant="outline" 
            className="w-full"
          >
            View Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-end">
              <Button 
                onClick={() => window.open('/admin/bulk-upload', '_blank')}
                variant="outline"
                size="sm"
                className="mr-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">Authenticated</span>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && renderDashboardStats()}
          {currentView === 'travel-guide' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Travel Guide Management</h1>
                  <p className="text-gray-600">Create and manage your travel blog content</p>
                </div>
                <Button 
                  onClick={createNewPost}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Blog
                    </>
                  )}
                </Button>
              </div>

              {/* Search Bar */}
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts and translations by title or slug..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 mb-2">
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} including translations
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('')
                          setShowSearchResults(false)
                          setSearchResults([])
                        }}
                        className="text-blue-600 border-blue-300"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Posts List */}
              <div className="grid gap-4">
                {loading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading blog posts...</p>
                    </CardContent>
                  </Card>
                ) : (showSearchResults ? searchResults.length === 0 : posts.filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0) ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery ? 'No posts found' : 'No blog posts yet'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery ? 'Try a different search term' : 'Create your first travel blog post to get started'}
                      </p>
                      {!searchQuery && (
                        <Button 
                          onClick={createNewPost}
                          disabled={isCreating}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  (showSearchResults ? searchResults : posts.filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.slug.toLowerCase().includes(searchQuery.toLowerCase())
                  )).map((item) => {
                    const isTranslation = item.type === 'translation'
                    const post = isTranslation ? item : item
                    
                    return (
                      <Card key={`${post.type || 'original'}-${post.id}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {isTranslation ? post.displayTitle : post.title}
                                </h3>
                                <Badge variant={isTranslation ? 'outline' : (post.status === 'published' ? 'default' : 'secondary')}>
                                  {isTranslation ? `${post.language.toUpperCase()} Translation` : post.status}
                                </Badge>
                                {isTranslation && (
                                  <Badge variant={post.status === 'completed' ? 'default' : post.status === 'failed' ? 'destructive' : 'secondary'}>
                                    {post.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Slug: <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  {isTranslation ? post.displaySlug : post.slug}
                                </code>
                              </p>
                              {(isTranslation ? post.displayExcerpt : post.excerpt) && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                  {isTranslation ? post.displayExcerpt : post.excerpt}
                                </p>
                              )}
                              {isTranslation && post.originalPost && (
                                <p className="text-xs text-blue-600 mb-2">
                                  Translation of: <span className="font-medium">{post.originalPost.title}</span>
                                </p>
                              )}
                              <div className="text-xs text-gray-500">
                                Created: {new Date(post.created_at).toLocaleDateString()}
                                {!isTranslation && post.updated_at && (
                                  <> | Updated: {new Date(post.updated_at).toLocaleDateString()}</>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(
                                  isTranslation ? `/blog/${post.displaySlug}?preview=true` : `/blog/${post.slug}?preview=true`, 
                                  '_blank'
                                )}
                                disabled={isTranslation && post.status !== 'completed'}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              {!isTranslation && post.status === 'draft' && (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handlePublishPost(post.id)}
                                  disabled={isPublishing}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isPublishing ? 'Publishing...' : 'Publish'}
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  if (isTranslation) {
                                    // For translations, we now have two options:
                                    // 1. Edit the translated content directly
                                    // 2. Edit the original post
                                    // For now, let's edit the original post but we could add a dropdown for both options
                                    setCurrentView('post-editor')
                                    loadPostDetails(post.originalPostId)
                                  } else {
                                    setCurrentView('post-editor')
                                    loadPostDetails(post.id)
                                  }
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                {isTranslation ? 'Edit Original' : 'Edit'}
                              </Button>
                              {isTranslation && post.status === 'completed' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    // TODO: Open TranslatedPostEditor for this translation
                                    console.log('Edit translation:', post.id)
                                  }}
                                >
                                  <Languages className="w-4 h-4 mr-2" />
                                  Edit Translation
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>

              {/* Stats */}
              {posts.length > 0 && (
                <Card className="bg-white border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Total Posts: {posts.length}</span>
                      <span>Published: {posts.filter(p => p.status === 'published').length}</span>
                      <span>Drafts: {posts.filter(p => p.status === 'draft').length}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          {currentView === 'internal-links' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Internal Links</h1>
                  <p className="text-gray-600">Manage internal linking system for better SEO</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/internal-links', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Manage Internal Links
                </Button>
              </div>
              
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Link className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Internal Links Manager</h3>
                  <p className="text-gray-600 mb-6">Click the button above to access the internal links management interface.</p>
                </CardContent>
              </Card>
            </div>
          )}
          {currentView === 'url-redirects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">URL Redirects</h1>
                  <p className="text-gray-600">Manage URL redirects and mappings</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/redirects', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Manage Redirects
                </Button>
              </div>
              
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-12 text-center">
                  <ArrowRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">URL Redirect Manager</h3>
                  <p className="text-gray-600 mb-6">Click the button above to access the redirect management interface.</p>
                </CardContent>
              </Card>
            </div>
          )}
          {currentView === 'robots-txt' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Robots.txt</h1>
                  <p className="text-gray-600">Manage robots.txt configuration</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/robots', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Configure Robots
                </Button>
              </div>
              
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Robots.txt Configuration</h3>
                  <p className="text-gray-600 mb-6">Click the button above to access the robots.txt management interface.</p>
                </CardContent>
              </Card>
            </div>
          )}
          {currentView === 'categories' && renderPlaceholderView('Categories', 'Manage content categories', Database)}
          {currentView === 'testimonials' && renderPlaceholderView('Testimonials', 'Manage customer testimonials', MessageSquare)}
          {currentView === 'homepage' && (
            <div>
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('dashboard')}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
              </div>
              <iframe 
                src="/admin/homepage" 
                className="w-full h-[calc(100vh-200px)] border-0 rounded-lg bg-white"
                title="Homepage Management"
              />
            </div>
          )}
          {currentView === 'image-generator' && (
            <div>
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('dashboard')}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Image Generator</h1>
                  <p className="text-gray-600">Generate high-quality images for your travel blog posts using AI</p>
                </div>
              </div>
              <ImageGenerator 
                blogSlug={selectedPost?.slug || 'default'}
                onImageGenerated={(images) => {
                  console.log('Generated images:', images)
                  // You can add logic here to integrate with post editing
                }}
              />
            </div>
          )}
          {currentView === 'translations' && (
            <div className="space-y-6">
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('dashboard')}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Translation Management</h1>
                  <p className="text-gray-600">Manage all translations across your travel blog posts</p>
                </div>
              </div>
              
              {/* Test: Simple verification that this view is rendering */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Translations view is active and rendering correctly!</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* BulkTranslationManager with error boundary */}
              <div className="space-y-4">
                {(() => {
                  try {
                    return (
                      <BulkTranslationManager 
                        onTranslationEdit={(translationId) => {
                          console.log('Editing translation:', translationId)
                          setEditingTranslationId(translationId)
                          setShowTranslatedPostEditor(true)
                        }}
                      />
                    )
                  } catch (error) {
                    console.error('Error rendering BulkTranslationManager:', error)
                    return (
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Translations</h3>
                            <p className="text-red-700 mb-4">There was an error loading the translation manager component.</p>
                            <p className="text-sm text-gray-600">Check the browser console for more details.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                })()}
              </div>
            </div>
          )}
          {currentView === 'post-editor' && selectedPost && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentView('travel-guide')
                      setSelectedPost(null)
                      setSections([])
                    }}
                    className="flex items-center gap-2"
                  >
                    ← Back to Posts
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h1>
                    <p className="text-gray-600">Editing blog post sections</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedPost.status === 'published' ? 'default' : 'secondary'}>
                    {selectedPost.status}
                  </Badge>
                  <Button
                    onClick={() => window.open(`/blog/${selectedPost.slug}?preview=true`, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>

              {loadingSections ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading sections...</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Post Details Editor */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50">
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Post Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-700 font-medium">Title</Label>
                            <Input
                              value={selectedPost?.title || ''}
                              onChange={(e) => {
                                if (selectedPost) {
                                  setSelectedPost({
                                    ...selectedPost,
                                    title: e.target.value
                                  })
                                }
                              }}
                              placeholder="Post title"
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-700 font-medium">Slug</Label>
                            <Input
                              value={selectedPost?.slug || ''}
                              onChange={(e) => {
                                if (selectedPost) {
                                  setSelectedPost({
                                    ...selectedPost,
                                    slug: e.target.value
                                  })
                                }
                              }}
                              placeholder="post-slug"
                              className="mt-2"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 font-medium">Excerpt</Label>
                          <textarea
                            className="w-full h-20 mt-2 p-3 border border-gray-300 rounded-lg text-sm"
                            value={selectedPost?.excerpt || ''}
                            onChange={(e) => {
                              if (selectedPost) {
                                setSelectedPost({
                                  ...selectedPost,
                                  excerpt: e.target.value
                                })
                              }
                            }}
                            placeholder="Brief excerpt for the post..."
                          />
                        </div>
                        
                        <div>
                          <Label className="text-gray-700 font-medium">Meta Description</Label>
                          <textarea
                            className="w-full h-20 mt-2 p-3 border border-gray-300 rounded-lg text-sm"
                            value={selectedPost?.meta_description || ''}
                            onChange={(e) => {
                              if (selectedPost) {
                                setSelectedPost({
                                  ...selectedPost,
                                  meta_description: e.target.value
                                })
                              }
                            }}
                            placeholder="SEO meta description..."
                          />
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Content Management</h4>
                              <p className="text-blue-700 text-sm mt-1">
                                This post uses section-based content management. Edit your content using the sections below.
                                Each section can contain rich text, images, and interactive elements.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={async () => {
                              if (!selectedPost) return
                              try {
                                setIsSaving(true)
                                const { error } = await supabase
                                  .from('modern_posts')
                                  .update({
                                    title: selectedPost.title,
                                    slug: selectedPost.slug,
                                    excerpt: selectedPost.excerpt,
                                    meta_description: selectedPost.meta_description,
                                    updated_at: new Date().toISOString()
                                  })
                                  .eq('id', selectedPost.id)
                                
                                if (error) {
                                  console.error('Database error details:', error)
                                  throw error
                                }
                                
                                // Update the local state to reflect changes
                                const updatedPosts = posts.map(p => 
                                  p.id === selectedPost.id ? selectedPost : p
                                )
                                setPosts(updatedPosts)
                                
                                alert('Post details updated successfully!')
                              } catch (error) {
                                console.error('Error saving post:', error)
                                alert('Failed to save post details')
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Post Details'}
                          </Button>
                          
                          <Button
                            onClick={() => window.open(`/blog/${selectedPost?.slug}?preview=true`, '_blank')}
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Translation Management */}
                  {selectedPost && (
                    <TranslationManager
                      postId={selectedPost.id}
                      postTitle={selectedPost.title}
                      postSlug={selectedPost.slug}
                      onTranslationComplete={(translation) => {
                        console.log('Translation completed:', translation)
                        // Optionally refresh or update UI
                      }}
                    />
                  )}

                  {/* Sections Management */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-lg font-semibold">Post Sections ({sections.length})</h2>
                          {sections.length > 0 && (
                            <p className="text-sm text-green-600 mt-1">✓ Sections loaded from database</p>
                          )}
                        </div>
                        <Button
                          onClick={() => setShowSectionDialog(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Section
                        </Button>
                      </div>

                    {sections.length === 0 ? (
                      <div className="text-center py-12">
                        <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections found</h3>
                        <p className="text-gray-600 mb-6">This post doesn't have any sections yet. Add your first section to get started with the modern section-based editor.</p>
                        <Button
                          onClick={() => setShowSectionDialog(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Section
                        </Button>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleSectionReorder}>
                        <Droppable droppableId="sections">
                          {(provided) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className="space-y-4"
                            >
                              {sections.map((section, index) => (
                                <Draggable key={section.id} draggableId={section.id} index={index}>
                                  {(provided, snapshot) => (
                                    <Card 
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`border-l-4 border-l-blue-500 transition-all ${
                                        snapshot.isDragging ? 'shadow-lg scale-105 rotate-2' : ''
                                      }`}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div 
                                              {...provided.dragHandleProps}
                                              className="cursor-grab active:cursor-grabbing"
                                            >
                                              <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                            </div>
                                            <div>
                                              <h4 className="font-medium">
                                                {section.title || `Section ${section.position + 1}`}
                                              </h4>
                                              <p className="text-sm text-gray-600">
                                                Type: {(() => {
                                                  const templateMap = {
                                                    '6f579a71-463c-43b4-b203-c2cb46c80d47': 'Hero',
                                                    '58e1b71c-600b-48d3-a956-f9b27bc368b2': 'Author',
                                                    'b87245be-1b68-47d4-83a6-fac582a0847f': 'Starter Pack',
                                                    'e30d9e40-eb3a-41d3-aeac-413cfca52fe0': 'Blog Content (HTML)',
                                                    '550e8400-e29b-41d4-a716-446655440000': 'Rich Text Editor',
                                                    'b1d8062e-9fff-46d4-86b8-f198de9f3d38': 'Overview',
                                                    'e596d688-31d9-4722-926d-18868f50f0cf': 'Attractions',
                                                    '5251d41a-d7f8-44b6-bfaf-636d50c859b1': 'Places',
                                                    '833666f2-e112-40c0-9d50-02f160b96f3a': 'Where to Stay',
                                                    'e2036f8e-e01e-4a04-8cf7-814f77b4343b': 'Hotels',
                                                    '03d9efa8-2c31-489d-94af-d2d85f52aa9c': 'AI CTA',
                                                    'c2caf0b9-68b6-48c1-999c-4cc48bd12242': 'Internal Links',
                                                    '710f8880-c86d-4353-b16f-474c74debd31': 'FAQ',
                                                    'f2e8c9d1-4a3b-4c5d-8e7f-9a1b2c3d4e5f': 'Rich Text Editor'
                                                  }
                                                  return templateMap[section.template_id] || 'Unknown'
                                                })()}
                                              </p>
                                            </div>
                                          </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={section.is_active ? 'default' : 'secondary'}>
                                    {section.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingSection(section)
                                      setShowSectionEditor(true)
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSectionToDelete(section.id)
                                      setShowDeleteConfirm(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          

          {currentView === 'manage-articles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Delete Articles</h1>
                  <p className="text-gray-600">Permanently delete published travel guide articles</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/manage-articles', '_blank')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Manage Article Deletion
                </Button>
              </div>
              
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-2">⚠️ Danger Zone</h3>
                      <p className="text-red-800 mb-4">
                        This section allows you to permanently delete published articles. 
                        Deleted articles cannot be recovered.
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• All article content and sections will be permanently deleted</li>
                        <li>• All translations of the article will be deleted</li>
                        <li>• You must type "DELETE" to confirm each deletion</li>
                        <li>• Consider changing status to "draft" instead if you're unsure</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-12 text-center">
                  <Trash2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Deletion Management</h3>
                  <p className="text-gray-600 mb-6">Click the button above to access the article deletion interface.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Fallback for unknown views */}
          {!['dashboard', 'travel-guide', 'internal-links', 'url-redirects', 'robots-txt', 'categories', 'testimonials', 'homepage', 'image-generator', 'translations', 'post-editor', 'manage-articles'].includes(currentView) && (
            <div className="space-y-6">
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Unknown View</h3>
                  <p className="text-yellow-700 mb-4">The view "{currentView}" is not recognized.</p>
                  <Button onClick={() => setCurrentView('dashboard')} variant="outline">
                    Return to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Translated Post Editor Dialog */}
      {editingTranslationId && showTranslatedPostEditor && (
        <Dialog open={showTranslatedPostEditor} onOpenChange={setShowTranslatedPostEditor}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Translation</DialogTitle>
              <DialogDescription>
                Edit and manage this translated post content
              </DialogDescription>
            </DialogHeader>
            <TranslatedPostEditor
              translationId={editingTranslationId}
              onClose={() => {
                setShowTranslatedPostEditor(false)
                setEditingTranslationId(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Section Creation Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Choose a section template to add to your post
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {[
              { id: '6f579a71-463c-43b4-b203-c2cb46c80d47', name: 'Hero', description: 'Title, subtitle, and background image' },
              { id: '58e1b71c-600b-48d3-a956-f9b27bc368b2', name: 'Author', description: 'Author information and bio' },
              { id: 'b87245be-1b68-47d4-83a6-fac582a0847f', name: 'Starter Pack', description: 'Introduction section with badge' },
              { id: 'e30d9e40-eb3a-41d3-aeac-413cfca52fe0', name: 'Blog Content (HTML)', description: 'HTML content section for migrated WordPress posts' },
              { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Rich Text Editor', description: 'WYSIWYG editor for new content creation' },
              { id: 'e596d688-31d9-4722-926d-18868f50f0cf', name: 'Attractions', description: 'List of attractions and activities' },
              { id: '5251d41a-d7f8-44b6-bfaf-636d50c859b1', name: 'Places', description: 'Notable places and locations' },
              { id: '833666f2-e112-40c0-9d50-02f160b96f3a', name: 'Where to Stay', description: 'Accommodation recommendations' },
              { id: 'e2036f8e-e01e-4a04-8cf7-814f77b4343b', name: 'Hotels', description: 'Hotel listings and reviews' },
              { id: '03d9efa8-2c31-489d-94af-d2d85f52aa9c', name: 'AI CTA', description: 'Call-to-action with AI features' },
              { id: 'c2caf0b9-68b6-48c1-999c-4cc48bd12242', name: 'Internal Links', description: 'Related post links' },
              { id: '710f8880-c86d-4353-b16f-474c74debd31', name: 'FAQ', description: 'Frequently asked questions' }
            ].map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                onClick={async () => {
                  if (!selectedPost) return
                  try {
                    const { data: existingSections } = await supabase
                      .from('modern_post_sections')
                      .select('position')
                      .eq('post_id', selectedPost.id)
                      .order('position', { ascending: false })
                      .limit(1)
                    
                    const nextPosition = existingSections && existingSections.length > 0 
                      ? existingSections[0].position + 1 
                      : 0
                    
                    const { error } = await supabase
                      .from('modern_post_sections')
                      .insert({
                        post_id: selectedPost.id,
                        template_id: template.id,
                        title: template.name,
                        position: nextPosition,
                        is_active: true,
                        mobile_hidden: false,
                        tablet_hidden: false,
                        data: {}
                      })
                    
                    if (error) {
                      console.error('Database error creating section:', error)
                      throw error
                    }
                    
                    // Reload sections
                    await loadPostDetails(selectedPost.id)
                    setShowSectionDialog(false)
                  } catch (error) {
                    console.error('Error creating section:', error)
                    const errorMessage = error?.message || 'Unknown error'
                    alert(`Failed to create section: ${errorMessage}`)
                  }
                }}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Editor Dialog */}
      <SectionEditor
        section={editingSection}
        isOpen={showSectionEditor}
        onClose={() => {
          setShowSectionEditor(false)
          setEditingSection(null)
        }}
        onSave={async (section) => {
          try {
            console.log('🔄 Saving section:', {
              id: section.id,
              template_id: section.template_id,
              data: section.data
            })
            
            const { error } = await supabase
              .from('modern_post_sections')
              .update({
                data: section.data,
                is_active: section.is_active,
                updated_at: new Date().toISOString()
              })
              .eq('id', section.id)
            
            if (error) {
              console.error('❌ Database error:', error)
              throw error
            }
            
            console.log('✅ Section saved successfully')
            
            // Reload sections to show updated data
            if (selectedPost) {
              await loadPostDetails(selectedPost.id)
            }
            
            setShowSectionEditor(false)
            setEditingSection(null)
          } catch (error) {
            console.error('❌ Error saving section:', error)
            alert('Failed to save section. Please try again.')
          }
        }}
      />

      {/* Delete Section Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false)
                setSectionToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!sectionToDelete) return
                
                try {
                  const { error } = await supabase
                    .from('modern_post_sections')
                    .delete()
                    .eq('id', sectionToDelete)
                  
                  if (error) {
                    console.error('❌ Error deleting section:', error)
                    alert('Failed to delete section. Please try again.')
                    return
                  }
                  
                  console.log('✅ Section deleted successfully')
                  
                  // Reload sections to show updated data
                  if (selectedPost) {
                    await loadPostDetails(selectedPost.id)
                  }
                  
                  setShowDeleteConfirm(false)
                  setSectionToDelete(null)
                } catch (error) {
                  console.error('❌ Error deleting section:', error)
                  alert('Failed to delete section. Please try again.')
                }
              }}
            >
              Delete Section
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}