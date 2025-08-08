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
  Send,
  EyeOff
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
  is_featured?: boolean
  published_at?: string
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
  const [postToDelete, setPostToDelete] = useState<ModernPost | null>(null)
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
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
  const [translations, setTranslations] = useState<any[]>([])
  const [loadingTranslations, setLoadingTranslations] = useState(false)

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
      id: 'authors',
      label: 'Authors',
      icon: User,
      view: 'authors',
      external: true,
      url: '/admin/authors'
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
    loadTranslations()
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
        // 1. Hero Section
        {
          post_id: post.id,
          template_id: '6f579a71-463c-43b4-b203-c2cb46c80d47',
          position: 0,
          is_active: true,
          data: {
            title: post.title || 'Rome: Where Every Cobblestone Has a Story to Tell',
            subtitle: post.excerpt || 'From gladiator selfies at the Colosseum to pasta masterclasses with nonnas - your Roman adventure starts here',
            backgroundImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
            location: 'Roma, Italia ❤️'
          }
        },
        // 2. Main Content (HTML) - for migrated WordPress content
        {
          post_id: post.id,
          template_id: 'e30d9e40-eb3a-41d3-aeac-413cfca52fe0',
          position: 1,
          is_active: true,
          data: {
            content: '<div class="prose max-w-none"><p class="text-lg font-medium text-gray-700">🏛️ <em>"Rome wasn\'t built in a day, but you can fall in love with it in one."</em></p><p>Picture this: You\'re sipping morning espresso at a sidewalk cafe when church bells chime across terracotta rooftops. A cat stretches lazily on ancient Roman stones while a nonna hangs laundry from her balcony above a 2,000-year-old ruin. This is Rome - where the extraordinary becomes beautifully ordinary.</p><h3>🎭 The Roman Experience</h3><p>Rome doesn\'t just show you history; it lets you <em>live</em> it. You\'ll eat gelato while leaning against the same marble that Caesar once touched, toss coins into fountains older than most countries, and discover that the best carbonara isn\'t in guidebooks - it\'s in that tiny trattoria where the owner\'s great-grandmother still makes the sauce.</p><blockquote class="border-l-4 border-orange-400 pl-4 bg-orange-50 p-4 rounded-r-lg"><p class="italic text-orange-800">🍝 <strong>Marco\'s Secret:</strong> The locals call it "the 15-minute rule" - if you can\'t walk to amazing pasta in 15 minutes from anywhere in Rome, you\'re probably lost!</p></blockquote></div>'
          }
        },
        // 3. Rich Text Editor - for new content creation
        {
          post_id: post.id,
          template_id: '550e8400-e29b-41d4-a716-446655440000',
          position: 2,
          is_active: true,
          data: {
            content: '<div class="prose max-w-none"><h2>🗓️ Timing Your Roman Conquest</h2><p>Rome is like a fine wine - incredible any time, but absolutely <em>magical</em> at the right moment. Here\'s how to crack the code for the perfect Roman holiday:</p><blockquote class="border-l-4 border-purple-500 pl-4 bg-purple-50 p-4 rounded-r-lg italic"><p class="text-purple-800">"When in Rome, do as the Romans do" - which mostly involves complaining about tourists while secretly being charmed by their excitement! 😉</p></blockquote><h3>🌟 The Sweet Spot Calendar</h3><ul class="space-y-3"><li><strong>🌸 Spring Magic (April-May):</strong> Wisteria cascades over ancient walls, outdoor dining returns, and Romans emerge from winter hibernation with infectious energy</li><li><strong>🍂 Golden Hour Season (September-October):</strong> Warm afternoons perfect for long walks, cooler evenings ideal for rooftop aperitivos, and that dreamy Mediterranean light photographers obsess over</li><li><strong>❄️ Insider\'s Winter (November-March):</strong> Half the crowds, double the authenticity. Romans actually have time to chat, restaurants aren\'t rushed, and you\'ll get those postcard-perfect shots without photobombers</li></ul><div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-r-lg"><p class="text-yellow-800"><strong>🎯 Marco\'s VIP Hack:</strong> Book Colosseum tickets for 8 AM on weekdays. You\'ll practically have the arena to yourself, plus morning light through the arches is pure Instagram gold!</p></div><p><strong>⏰ Time-Saving Superpowers:</strong></p><ul><li>Skip-the-line tickets = 2-3 hours saved (that\'s an extra gelato stop!)</li><li>Roma Pass = Museum access + transport (pays for itself after 2 attractions)</li><li>Early morning visits = Magical golden hour photos + smaller crowds</li></ul></div>'
          }
        },
        // 4. Why This Destination Hits Different (Starter Pack)
        {
          post_id: post.id,
          template_id: 'b87245be-1b68-47d4-83a6-fac582a0847f',
          position: 3,
          is_active: true,
          data: {
            destination: 'Roma, la Città Eterna 🏛️',
            bestTime: 'April-May & Sept-Oct (Chef\'s Kiss Season)',
            duration: '4-7 days (Trust us, you\'ll want to extend)',
            budget: '€80-200 per day (Gelato budget included)',
            currency: 'EUR (Your wallet will thank you)',
            language: 'Italian (But Romans love practicing English!)',
            timezone: 'CET (Perfect for European city-hopping)',
            highlights: [
              '🎯 Sweet Spot Duration: 4-7 days - Long enough to feel like a local, short enough to leave wanting more',
              '💰 Budget Reality Check: €80-200/day - From "student backpacker surviving on pizza al taglio" to "yes, I\'ll take the truffle pasta"',
              '🏆 UNESCO Flex: 15+ World Heritage sites - Rome literally has more than entire countries (we\'re not bragging, just stating facts)',
              '✨ The Vibe: Ancient meets Aperitivo - Where 2,000-year-old amphitheaters host modern concerts and nonnas make TikToks',
              '🍝 Foodie Paradise: 500+ trattorias within walking distance - You could eat at a different place every meal and still not scratch the surface',
              '📸 Instagram Goldmine: Every corner is a photo op - Your camera roll will thank you (your phone storage might not)'
            ]
          }
        },
        // 5. Where to Stay
        {
          post_id: post.id,
          template_id: '833666f2-e112-40c0-9d50-02f160b96f3a',
          position: 4,
          is_active: true,
          data: {
            neighborhoods: [
              {
                name: 'Centro Storico (The Heart) 🏛️',
                description: 'Sleep where emperors once walked - literally. Your morning coffee comes with a side of 2,000-year-old history',
                priceRange: '€150-400/night',
                bestFor: 'First-timers who want to pinch themselves awake, history buffs, Instagram influencers',
                highlights: [
                  'Roll out of bed into the Pantheon (seriously, some hotels are 50 meters away)',
                  'Neighborhood cats have better pedigrees than most royalty',
                  'That restaurant your nonna mentioned? It\'s probably around the corner',
                  'Your Uber driver will get lost in medieval streets (embrace the adventure!)'
                ],
                vibe: '⭐ Main Character Energy',
                hiddenGem: 'The rooftop terraces here have views that make grown adults cry happy tears'
              },
              {
                name: 'Trastevere (The Cool Kid) 🌙',
                description: 'Where Roman millennials hang out and tourists accidentally discover the best pasta of their lives',
                priceRange: '€100-250/night',
                bestFor: 'Night owls, food adventurers, anyone who thinks cobblestones are romantic',
                highlights: [
                  'Aperitivo culture at its finest (think happy hour but classier)',
                  'Street art that would make Banksy jealous',
                  'Restaurants where the menu is whatever nonna felt like making today',
                  'The kind of narrow streets that make you feel like you\'re in a movie'
                ],
                vibe: '🎨 Bohemian Dream',
                hiddenGem: 'Local secret: The best gelato is from the cart guy near Santa Maria - he only speaks Italian but his pistachio speaks universal love'
              },
              {
                name: 'Vatican Vicinity (The Pilgrimage) ⛪',
                description: 'Wake up to church bells and fall asleep to the whispers of pilgrims - it\'s more magical than it sounds',
                priceRange: '€120-300/night',
                bestFor: 'Art enthusiasts, spiritual seekers, early risers who want first dibs on the Sistine Chapel',
                highlights: [
                  'Skip the tourist hordes with a 5-minute walk to Vatican Museums',
                  'Surprisingly excellent shopping (Swiss Guard souvenirs, anyone?)',
                  'Peaceful evenings perfect for processing all that Renaissance art',
                  'The pizza al taglio joints here are criminally underrated'
                ],
                vibe: '🎭 Renaissance Revival',
                hiddenGem: 'Borgo Pio street market on weekends - locals shop here for the freshest ingredients'
              }
            ],
            tips: [
              '🚇 Metro Magic: Book near metro stops for easy escapes when your feet inevitably surrender to Roman cobblestones',
              '💡 Insider Move: Stay 10 minutes outside the center - your wallet stays happy, your Instagram still looks amazing',
              '🌅 Rooftop Rule: If your hotel doesn\'t have a terrace view, find the nearest rooftop bar - Roman sunsets are mandatory, not optional',
              '🔌 Reality Check: Many historic buildings have electrical systems older than your grandparents - pack a universal adapter and patience',
              '🛏️ Nap Like a Roman: Book places that honor the sacred siesta hour (2-4 PM) - fighting jetlag is easier when the whole city is sleeping too'
            ]
          }
        },
        // 6. Plan Your Perfect Trip (AI CTA)
        {
          post_id: post.id,
          template_id: '03d9efa8-2c31-489d-94af-d2d85f52aa9c',
          position: 5,
          is_active: true,
          data: {
            title: '🤖 Your Personal Roman Holiday Architect',
            subtitle: 'Because even Caesar had advisors - let our AI be yours',
            description: 'Tell us if you\'re a "museum marathoner" or "aperitivo enthusiast," whether you travel on ramen budgets or champagne dreams. Our AI will craft your perfect Roman story - complete with the best cacio e pepe spots your taste buds never knew they needed.',
            buttonText: '✨ Build My Roman Adventure',
            buttonUrl: '/ai-planner?destination=rome',
            features: [
              '🎯 Smart Scheduling: Day-by-day plans that actually make sense (no running across the city for lunch)',
              '🍝 Foodie Intelligence: Restaurant picks based on your cravings, dietary needs, and budget reality',
              '👟 Optimal Routes: Walking paths that save your feet and maximize your gelato stops',
              '⚡ Live Updates: Real-time alerts about closures, strikes, or surprise festivals (Romans love both)',
              '💎 Hidden Gems: Spots that don\'t appear in guidebooks but will appear in all your best stories'
            ],
            testimonial: {
              text: 'The AI found us a tiny family trattoria where the 85-year-old nonna taught me to make gnocchi while her grandson translated her life stories. I cried. It was perfect.',
              author: 'Emma Chen',
              location: 'Vancouver, Canada',
              highlight: '❤️ 47 other travelers loved this experience'
            }
          }
        },
        // 7. Frequently Asked Questions
        {
          post_id: post.id,
          template_id: '710f8880-c86d-4353-b16f-474c74debd31',
          position: 6,
          is_active: true,
          data: {
            faqs: [
              {
                question: '🕐 How many days do I need to fall in love with Rome?',
                answer: 'Honestly? You\'ll be smitten after day one, but give yourself 4-5 days minimum to move beyond the "tourist crush" phase into "serious relationship" territory. With 7 days, you\'ll start planning your return before you even leave. (Marco\'s seen this happen to thousands of visitors - the Rome effect is real!)'
              },
              {
                question: '🚇 How do I navigate Rome without losing my mind (or my feet)?',
                answer: 'The metro is great for longer distances, but Rome\'s real magic happens on foot - those surprise piazza discoveries don\'t happen underground! Grab a Roma Pass for the full transport + museum combo. Pro tip: Romans walk everywhere, so you\'ll blend in while getting the best leg workout of your life.'
              },
              {
                question: '💰 Will Rome break my bank account?',
                answer: 'Rome can play nice with any budget! Student backpacker mode: €60-80/day (pizza al taglio and hostel life). Comfortable explorer: €120-180/day (nice dinners, decent hotels). Luxury Roman holiday: €200+/day (because life\'s too short for bad wine). Remember: the best experiences (people-watching in piazzas, sunset walks) are absolutely free!'
              },
              {
                question: '🌤️ When should I book my Roman holiday?',
                answer: 'Spring (April-May) and fall (September-October) are pure magic - perfect weather, manageable crowds, and Romans in their happiest moods. Summer is hot but vibrant (think outdoor cinema and rooftop dinners until midnight). Winter is cozy and authentic (plus you\'ll have those Instagram shots all to yourself!).'
              },
              {
                question: '🎫 Do I really need to plan ahead, or can I wing it?',
                answer: 'For major hits like the Colosseum and Vatican? Definitely book ahead - those 3-hour queues in the Roman sun are nobody\'s idea of fun. Everything else? Rome rewards the spontaneous! Some of the best discoveries (that perfect trattoria, a hidden church with stunning frescoes) happen when you\'re beautifully, blissfully lost.'
              },
              {
                question: '🍝 What\'s the real secret to eating well in Rome?',
                answer: 'Follow this golden rule: If you see tourists taking photos of the menu, keep walking. If you see Italian families arguing loudly while eating, you\'ve found gold! Also, never order cappuccino after 11 AM unless you want to identify yourself as a tourist from space. 😉'
              }
            ]
          }
        },
        // 8. Related Travel Guides (Internal Links)
        {
          post_id: post.id,
          template_id: 'c2caf0b9-68b6-48c1-999c-4cc48bd12242',
          position: 7,
          is_active: true,
          data: {
            title: '🇮🇹 Continue Your Italian Love Affair',
            autoGenerate: false,
            links: [
              {
                title: 'Florence: Where Michelangelo Had His Midlife Crisis',
                description: 'Renaissance art, leather markets, and the best sunset views in Tuscany - plus why David is actually kind of small in person',
                url: '/blog/florence-italy-travel-guide',
                image: 'https://images.unsplash.com/photo-1500380804539-4dcb4d041fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                category: 'Art & Culture',
                readTime: '12 min read',
                highlight: '🎨 Includes secret Uffizi viewing spots'
              },
              {
                title: 'Venice: Floating City, Sinking Hearts',
                description: 'Master the art of gondola negotiations, find the least touristy bridges, and discover why Venetians are basically water wizards',
                url: '/blog/venice-italy-complete-guide',
                image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                category: 'Romance & Mystery',
                readTime: '15 min read',
                highlight: '🚤 Local boat routes that tourists miss'
              },
              {
                title: 'Tuscany: Rolling Hills and Rolling Wine Glasses',
                description: 'Medieval hilltop towns, world-class Chianti, and sunset drives that make you question why you live anywhere else',
                url: '/blog/tuscany-wine-region-guide',
                image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                category: 'Wine & Villages',
                readTime: '18 min read',
                highlight: '🍷 Family vineyard experiences you can\'t book online'
              },
              {
                title: 'Amalfi Coast: Curves That Make Sports Cars Jealous',
                description: 'Cliff-hugging drives, lemon-scented air, and coastal towns so pretty they seem Photoshopped (spoiler: they\'re not)',
                url: '/blog/amalfi-coast-travel-guide',
                image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca2d27?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                category: 'Coastal Paradise',
                readTime: '14 min read',
                highlight: '🍋 Secret limoncello tasting spots'
              }
            ]
          }
        },
        // 9. About the Author
        {
          post_id: post.id,
          template_id: '58e1b71c-600b-48d3-a956-f9b27bc368b2',
          position: 8,
          is_active: true,
          data: {
            authorName: 'Marco "The Roman" Rossi',
            bio: 'Born in Trastevere (literally in his nonna\'s kitchen during Sunday sauce preparation), Marco has been accidentally discovering Rome\'s secrets for 32 years and professionally sharing them for 10. He\'s the guy who knows which gelato shop changes flavors based on the owner\'s mood, which trattorias have the nonna-approved carbonara, and exactly which fountain has the coldest water for tired tourist feet. When not leading tours, he\'s either arguing with his mother about the correct way to make cacio e pepe or falling in love with hidden corners of his own city all over again.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            location: 'Trastevere, Roma (Born & Raised) 🏛️',
            experience: '10+ years guiding, 32 years living the Roman dream',
            specialty: 'Secret pasta spots & nonna-approved experiences',
            socialLinks: {
              instagram: 'https://instagram.com/marcorome',
              twitter: 'https://twitter.com/marcorossi',
              website: 'https://marcoromeguide.com'
            },
            stats: {
              articlesWritten: 47,
              countriesVisited: 28,
              yearsExperience: 10,
              happyTravelers: '2,847+',
              favoriteTreatment: 'Pistachio gelato at Giolitti',
              superpower: 'Finding parking in Rome (seriously, it\'s impossible but Marco does it)'
            },
            funFacts: [
              '🍝 Has eaten carbonara 847 times and counting (research purposes only)',
              '📸 Appears in approximately 12,000 tourist photos (usually photobombing accidentally)',
              '🐈 Personal friend of 23 different Roman street cats (they have names)',
              '⛲ Can identify any Roman fountain by the sound of its water (weird flex, but true)'
            ],
            quote: "Rome doesn\'t need me to make it magical - I just help people notice the magic that\'s already there. Also, never trust anyone who puts cream in carbonara. Just don\'t."
            
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
          updated_at,
          published_at,
          is_featured
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

  const loadTranslations = async () => {
    try {
      setLoadingTranslations(true)
      
      // Get all translations with post information
      const { data: translationsData, error: translationsError } = await supabase
        .from('post_translations')
        .select(`
          *,
          language:languages!post_translations_language_code_fkey(*),
          original_post:modern_posts!post_translations_original_post_id_fkey(
            title,
            slug
          )
        `)
        .order('updated_at', { ascending: false })

      if (translationsError) {
        console.error('Error fetching translations:', translationsError)
        return
      }

      setTranslations(translationsData || [])
    } catch (error) {
      console.error('Error loading translations:', error)
    } finally {
      setLoadingTranslations(false)
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
        <h1 className="text-2xl font-bold text-[#0e0e0e] mb-2">Dashboard</h1>
        <p className="text-[#262626]/70">Welcome to your CuddlyNest CMS dashboard</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg hover:border-[#5d2de6]/25 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#5d2de6]/15 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-[#5d2de6]" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#262626]/70 truncate">
                    Schema Types Active
                  </dt>
                  <dd className="text-lg font-medium text-[#0e0e0e]">6</dd>
                  <dd className="text-xs text-[#05381A]">✓ Organization, Website, FAQ</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg hover:border-[#05381A]/25 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#05381A]/15 rounded-lg flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-[#05381A]" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#262626]/70 truncate">
                    URL Redirects
                  </dt>
                  <dd className="text-lg font-medium text-[#0e0e0e]">45</dd>
                  <dd className="text-xs text-[#5d2de6]">• 38 permanent, 7 temporary</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg hover:border-[#fb3aa2]/25 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#fb3aa2]/15 rounded-lg flex items-center justify-center">
                  <Link className="h-6 w-6 text-[#fb3aa2]" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#262626]/70 truncate">
                    Internal Links
                  </dt>
                  <dd className="text-lg font-medium text-[#0e0e0e]">127</dd>
                  <dd className="text-xs text-[#05381A]">• 9 categories, priority-based</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg hover:border-[#5d2de6]/25 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5d2de6]/15 to-[#fb3aa2]/15 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#5d2de6]" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#262626]/70 truncate">
                    Travel Guide Posts
                  </dt>
                  <dd className="text-lg font-medium text-[#0e0e0e]">
                    {totalPostCount.toLocaleString()}
                    <div className="text-xs text-[#262626]/60 mt-1">
                      Published: {posts.filter(p => p.status === 'published').length} | 
                      Drafts: {posts.filter(p => p.status === 'draft').length}
                      {posts.length < totalPostCount && (
                        <div className="text-xs text-[#5d2de6] mt-1">
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

      {/* Translation Dashboard */}
      {translations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg hover:border-[#05381A]/25 transition-all duration-200 col-span-full">
            <CardHeader className="bg-gradient-to-r from-[#5d2de6]/5 to-[#fb3aa2]/5 border-b border-black/5">
              <CardTitle className="text-lg font-medium text-[#0e0e0e] flex items-center gap-2">
                <div className="w-6 h-6 bg-[#5d2de6]/15 rounded-md flex items-center justify-center">
                  <Languages className="w-4 h-4 text-[#5d2de6]" />
                </div>
                Translation Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#05381A]/15 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-6 h-6 bg-[#05381A] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {translations.filter(t => t.translation_status === 'completed').length}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#05381A] mb-1">
                    {translations.filter(t => t.translation_status === 'completed').length}
                  </div>
                  <div className="text-xs text-[#262626]/70 font-medium">Completed</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#5d2de6]/15 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-6 h-6 bg-[#5d2de6] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {translations.filter(t => t.translation_status === 'translating').length}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#5d2de6] mb-1">
                    {translations.filter(t => t.translation_status === 'translating').length}
                  </div>
                  <div className="text-xs text-[#262626]/70 font-medium">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {translations.filter(t => t.translation_status === 'failed').length}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-red-600 mb-1">
                    {translations.filter(t => t.translation_status === 'failed').length}
                  </div>
                  <div className="text-xs text-[#262626]/70 font-medium">Failed</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#fb3aa2]/15 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <div className="w-6 h-6 bg-[#fb3aa2] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {[...new Set(translations.map(t => t.language_code))].length}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-[#fb3aa2] mb-1">
                    {[...new Set(translations.map(t => t.language_code))].length}
                  </div>
                  <div className="text-xs text-[#262626]/70 font-medium">Languages</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <Button 
                  onClick={() => setCurrentView('translations')}
                  variant="outline"
                  className="border-[#5d2de6]/25 text-[#5d2de6] hover:bg-[#5d2de6]/8 hover:border-[#5d2de6]/50"
                >
                  <Languages className="w-4 h-4 mr-2" />
                  Manage All Translations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-[#5d2de6]/5 to-[#fb3aa2]/5 border-b border-black/5">
            <CardTitle className="text-lg font-medium text-[#0e0e0e] flex items-center gap-2">
              <div className="w-6 h-6 bg-[#5d2de6]/15 rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#5d2de6]" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Button 
              onClick={createNewPost}
              disabled={isCreating}
              className="w-full justify-start bg-gradient-to-r from-[#5d2de6] to-[#fb3aa2] hover:from-[#5d2de6]/90 hover:to-[#fb3aa2]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? 'Creating...' : 'Create New Travel Guide'}
            </Button>
            <Button 
              onClick={() => setCurrentView('travel-guide')}
              variant="outline"
              className="w-full justify-start border-[#5d2de6]/25 text-[#5d2de6] hover:bg-[#5d2de6]/8 hover:border-[#5d2de6]/50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add new travel guide article
            </Button>
            <Button 
              onClick={() => setCurrentView('homepage')}
              variant="outline"
              className="w-full justify-start border-[#fb3aa2]/25 text-[#fb3aa2] hover:bg-[#fb3aa2]/8 hover:border-[#fb3aa2]/50"
            >
              <Globe className="w-4 h-4 mr-2" />
              Update Homepage
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="bg-gradient-to-r from-[#05381A]/5 to-[#d3f8e1]/20 border-b border-black/5">
            <CardTitle className="text-lg font-medium text-[#0e0e0e] flex items-center gap-2">
              <div className="w-6 h-6 bg-[#05381A]/15 rounded-md flex items-center justify-center">
                <Settings className="w-4 h-4 text-[#05381A]" />
              </div>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#05381A] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#262626]/70">Enhanced Admin Dashboard Active</span>
                <Badge className="ml-auto text-xs bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#05381A] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#262626]/70">Advanced URL Management</span>
                <Badge className="ml-auto text-xs bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#05381A] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#262626]/70">Internal Linking System</span>
                <Badge className="ml-auto text-xs bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#05381A] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#262626]/70">Global Schema Management</span>
                <Badge className="ml-auto text-xs bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25">✓</Badge>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#5d2de6] rounded-full animate-pulse"></div>
                <span className="text-sm text-[#262626]/70">Multi-language Translation</span>
                <Badge variant="outline" className="ml-auto text-xs border-[#5d2de6]/25 text-[#5d2de6]">Ready</Badge>
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
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0e0e0e] shadow-xl border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/15">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5d2de6] to-[#fb3aa2] rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">CuddlyNest Admin</h1>
              <p className="text-sm text-white/70">Content Management</p>
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
                  if (item.external && item.url) {
                    window.open(item.url, '_blank')
                  } else {
                    setCurrentView(item.view)
                  }
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  currentView === item.view
                    ? 'bg-[#5d2de6]/15 text-[#5d2de6] border-r-2 border-[#5d2de6] shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
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
        <div className="p-4 border-t border-white/15">
          <Button 
            onClick={() => window.open('/', '_blank')}
            variant="outline" 
            className="w-full border-white/25 text-white hover:bg-white/10 hover:border-white/40"
          >
            View Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-black/8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-end">
              <Button 
                onClick={() => window.open('/admin/bulk-upload', '_blank')}
                variant="outline"
                size="sm"
                className="mr-2 border-[#5d2de6]/25 text-[#5d2de6] hover:bg-[#5d2de6]/8 hover:border-[#5d2de6]/50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#262626]/70">Authenticated</span>
                <div className="w-8 h-8 bg-gradient-to-br from-[#5d2de6] to-[#fb3aa2] rounded-full flex items-center justify-center shadow-lg">
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
                  <h1 className="text-2xl font-bold text-[#0e0e0e] mb-2">Travel Guide Management</h1>
                  <p className="text-[#262626]/70">Create and manage your travel blog content</p>
                </div>
                <Button 
                  onClick={createNewPost}
                  disabled={isCreating}
                  className="bg-gradient-to-r from-[#5d2de6] to-[#fb3aa2] hover:from-[#5d2de6]/90 hover:to-[#fb3aa2]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
              <Card className="bg-white border border-black/8 shadow-sm hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#262626]/50" />
                    <Input
                      placeholder="Search posts and translations by title or slug..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 border-black/10 focus:border-[#5d2de6]/50 focus:ring-[#5d2de6]/25"
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5d2de6]"></div>
                      </div>
                    )}
                  </div>
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="mt-4 p-3 bg-[#5d2de6]/8 border border-[#5d2de6]/25 rounded-lg">
                      <p className="text-sm text-[#5d2de6] mb-2">
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
                        className="text-[#5d2de6] border-[#5d2de6]/25 hover:bg-[#5d2de6]/8"
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
                          className="bg-gradient-to-r from-[#5d2de6] to-[#fb3aa2] hover:from-[#5d2de6]/90 hover:to-[#fb3aa2]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                      <Card key={`${post.type || 'original'}-${post.id}`} className="bg-white border border-black/8 hover:shadow-lg hover:border-[#5d2de6]/25 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-[#0e0e0e]">
                                  {isTranslation ? post.displayTitle : post.title}
                                </h3>
                                <Badge className={isTranslation ? 'border-[#fb3aa2]/25 text-[#fb3aa2] bg-[#fb3aa2]/8' : (post.status === 'published' ? 'bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25' : 'bg-[#262626]/15 text-[#262626] border-[#262626]/25')}>
                                  {isTranslation ? `${post.language.toUpperCase()} Translation` : post.status}
                                </Badge>
                                {isTranslation && (
                                  <Badge className={post.status === 'completed' ? 'bg-[#05381A]/15 text-[#05381A] border-[#05381A]/25' : post.status === 'failed' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-[#262626]/15 text-[#262626] border-[#262626]/25'}>
                                    {post.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#262626]/70 mb-2">
                                Slug: <code className="bg-[#f5f5f5] px-2 py-1 rounded text-xs text-[#262626]">
                                  {isTranslation ? post.displaySlug : post.slug}
                                </code>
                              </p>
                              {(isTranslation ? post.displayExcerpt : post.excerpt) && (
                                <p className="text-[#262626]/70 text-sm mb-3 line-clamp-2">
                                  {isTranslation ? post.displayExcerpt : post.excerpt}
                                </p>
                              )}
                              {isTranslation && post.originalPost && (
                                <p className="text-xs text-[#5d2de6] mb-2">
                                  Translation of: <span className="font-medium">{post.originalPost.title}</span>
                                </p>
                              )}
                              <div className="text-xs text-[#262626]/50">
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
                                className="border-[#262626]/25 text-[#262626] hover:bg-[#262626]/8 hover:border-[#262626]/50"
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
                                  className="bg-[#05381A] hover:bg-[#05381A]/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
                                  onClick={() => handlePublishPost(post.id)}
                                  disabled={isPublishing}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  {isPublishing ? 'Publishing...' : 'Publish'}
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                className="bg-gradient-to-r from-[#5d2de6] to-[#fb3aa2] hover:from-[#5d2de6]/90 hover:to-[#fb3aa2]/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
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
                                  className="border-[#fb3aa2]/25 text-[#fb3aa2] hover:bg-[#fb3aa2]/8 hover:border-[#fb3aa2]/50"
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
                <Card className="bg-white border border-black/8 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm text-[#262626]/70">
                      <span>Total Posts: <span className="font-medium text-[#0e0e0e]">{posts.length}</span></span>
                      <span>Published: <span className="font-medium text-[#05381A]">{posts.filter(p => p.status === 'published').length}</span></span>
                      <span>Drafts: <span className="font-medium text-[#5d2de6]">{posts.filter(p => p.status === 'draft').length}</span></span>
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
                  <h1 className="text-2xl font-bold text-[#0e0e0e] mb-2">Internal Links</h1>
                  <p className="text-[#262626]/70">Manage internal linking system for better SEO</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/internal-links', '_blank')}
                  className="bg-gradient-to-r from-[#5d2de6] to-[#fb3aa2] hover:from-[#5d2de6]/90 hover:to-[#fb3aa2]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                  <h1 className="text-2xl font-bold text-[#0e0e0e] mb-2">URL Redirects</h1>
                  <p className="text-[#262626]/70">Manage URL redirects and mappings</p>
                </div>
                <Button 
                  onClick={() => window.open('/admin/redirects', '_blank')}
                  className="bg-[#05381A] hover:bg-[#05381A]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
                  className="mb-4 border-[#5d2de6]/25 text-[#5d2de6] hover:bg-[#5d2de6]/8 hover:border-[#5d2de6]/50"
                >
                  ← Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-[#0e0e0e]">Translation Management</h1>
                  <p className="text-[#262626]/70">Manage all translations across your travel blog posts</p>
                </div>
              </div>
              
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
                  
                  {/* Featured Toggle Button */}
                  <Button
                    onClick={async () => {
                      if (!selectedPost) return
                      try {
                        setIsTogglingFeatured(true)
                        const { error } = await supabase
                          .from('modern_posts')
                          .update({ is_featured: !selectedPost.is_featured })
                          .eq('id', selectedPost.id)
                        
                        if (error) throw error
                        
                        setSelectedPost({
                          ...selectedPost,
                          is_featured: !selectedPost.is_featured
                        })
                        alert(selectedPost.is_featured ? 'Post removed from featured' : 'Post marked as featured')
                      } catch (error) {
                        console.error('Error toggling featured status:', error)
                        alert('Failed to update featured status')
                      } finally {
                        setIsTogglingFeatured(false)
                      }
                    }}
                    variant={selectedPost.is_featured ? "default" : "outline"}
                    size="sm"
                    disabled={isTogglingFeatured}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {isTogglingFeatured ? 'Updating...' : (selectedPost.is_featured ? 'Featured' : 'Mark Featured')}
                  </Button>
                  
                  {/* Unpublish Button - only show for published posts */}
                  {selectedPost.status === 'published' && (
                    <Button
                      onClick={async () => {
                        if (!selectedPost) return
                        if (!confirm('Are you sure you want to unpublish this post? It will be hidden from public view.')) return
                        
                        try {
                          setIsUnpublishing(true)
                          const { error } = await supabase
                            .from('modern_posts')
                            .update({ 
                              status: 'draft',
                              published_at: null 
                            })
                            .eq('id', selectedPost.id)
                          
                          if (error) throw error
                          
                          setSelectedPost({
                            ...selectedPost,
                            status: 'draft',
                            published_at: null
                          })
                          alert('Post has been unpublished')
                        } catch (error) {
                          console.error('Error unpublishing post:', error)
                          alert('Failed to unpublish post')
                        } finally {
                          setIsUnpublishing(false)
                        }
                      }}
                      variant="outline"
                      size="sm"
                      disabled={isUnpublishing}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      {isUnpublishing ? 'Unpublishing...' : 'Unpublish'}
                    </Button>
                  )}
                  
                  {/* Delete Button */}
                  <Button
                    onClick={() => {
                      if (!selectedPost) return
                      // Navigate to delete section with this post
                      setCurrentView('manage-articles')
                      setPostToDelete(selectedPost)
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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