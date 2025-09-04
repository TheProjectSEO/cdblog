'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Plus, Trash2, Save, X, Upload, Loader2 } from 'lucide-react'
import { uploadBlogImage, validateImageFile } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

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

interface SectionEditorProps {
  section: ModernSection | null
  isOpen: boolean
  onClose: () => void
  onSave: (section: ModernSection) => void
}

// Template ID mappings
const TEMPLATE_ID_TO_TYPE: Record<string, string> = {
  '6f579a71-463c-43b4-b203-c2cb46c80d47': 'hero',
  '58e1b71c-600b-48d3-a956-f9b27bc368b2': 'author',
  'b87245be-1b68-47d4-83a6-fac582a0847f': 'starter-pack',
  'e30d9e40-eb3a-41d3-aeac-413cfca52fe0': 'blog-content',
  '550e8400-e29b-41d4-a716-446655440000': 'rich-text-editor',
  'e596d688-31d9-4722-926d-18868f50f0cf': 'attractions',
  '5251d41a-d7f8-44b6-bfaf-636d50c859b1': 'places',
  '833666f2-e112-40c0-9d50-02f160b96f3a': 'where-to-stay',
  'e2036f8e-e01e-4a04-8cf7-814f77b4343b': 'hotels',
  '03d9efa8-2c31-489d-94af-d2d85f52aa9c': 'ai-cta',
  'c2caf0b9-68b6-48c1-999c-4cc48bd12242': 'internal-links',
  '710f8880-c86d-4353-b16f-474c74debd31': 'faq',
  // Modern HTML-style templates
  '12345678-1234-4321-8765-123456789abc': 'html-hero-section',
  '23456789-2345-4321-8765-123456789bcd': 'table-of-contents',
  '34567890-3456-4321-8765-123456789cde': 'why-choose',
  '45678901-4567-4321-8765-123456789def': 'tip-boxes',
  '56789012-5678-4321-8765-123456789ef0': 'budget-timeline',
  '5251d41a-d7f8-44b6-bfaf-636d50c859b1': 'comparison-table',
  '8642ef7e-6198-4cd4-b0f9-8ba6bb868951': 'html-content-container'
}

const getSectionType = (templateId: string): string => {
  return TEMPLATE_ID_TO_TYPE[templateId] || 'unknown'
}

export function SectionEditor({ section, isOpen, onClose, onSave }: SectionEditorProps) {
  const [editedData, setEditedData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [sectionIsActive, setSectionIsActive] = useState(true)
  
  // Move these hooks to component level so they're always called
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [editorContent, setEditorContent] = React.useState('')

  useEffect(() => {
    if (section) {
      console.log('🔍 Loading section data:', {
        sectionId: section.id,
        templateId: section.template_id,
        sectionType: getSectionType(section.template_id),
        sectionData: section.data,
        hasContent: !!section.data?.content,
        contentLength: section.data?.content?.length || 0
      })
      
      setEditedData({ ...section.data })
      setSectionIsActive(section.is_active)
      const content = section.data?.content || '<p>Start writing your content here...</p>'
      setEditorContent(content)
      
      console.log('📝 Setting editor content:', content)
      
      // Update the editor DOM directly to avoid cursor issues
      if (getSectionType(section.template_id) === 'rich-text-editor') {
        // Wait for the dialog to be fully rendered
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = content
            console.log('🎯 Editor DOM updated with content length:', content.length)
          }
        }, 300)
      }
    } else {
      setEditedData({})
      setSectionIsActive(true)
      setEditorContent('<p>Start writing your content here...</p>')
    }
  }, [section])

  // Additional effect to ensure content is loaded when dialog opens
  useEffect(() => {
    if (isOpen && section && getSectionType(section.template_id) === 'rich-text-editor') {
      const content = section.data?.content || editorContent
      console.log('🚀 Dialog opened, ensuring content is loaded:', content)
      
      setTimeout(() => {
        if (editorRef.current && content) {
          editorRef.current.innerHTML = content
          console.log('🎯 Dialog open: Editor DOM updated with content')
        }
      }, 500)
    }
  }, [isOpen, section])

  if (!section) return null

  const sectionType = getSectionType(section.template_id)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // For starter pack sections, we need to also save to the database
      if (sectionType === 'starter-pack' && editedData.highlights && editedData.features) {
        // Import supabase functions for starter pack management
        const { createStarterPackSection, getStarterPackForPost } = await import('@/lib/supabase')
        
        // Get the post ID from the parent component (we'll need to pass this down)
        // For now, we'll just save to the section data and let the parent handle database sync
        console.log('Saving starter pack data:', {
          badge: editedData.badge,
          title: editedData.title,
          description: editedData.description,
          highlights: editedData.highlights,
          features: editedData.features
        })
      }
      
      await onSave({
        ...section,
        data: editedData,
        is_active: sectionIsActive
      })
    } catch (error) {
      console.error('Error saving section:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (key: string, value: any) => {
    console.log('📝 Updating field:', key, 'with value:', value)
    setEditedData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const addArrayItem = (key: string, defaultItem: any) => {
    const currentArray = editedData[key] || []
    updateField(key, [...currentArray, defaultItem])
  }

  const removeArrayItem = (key: string, index: number) => {
    const currentArray = editedData[key] || []
    updateField(key, currentArray.filter((_, i) => i !== index))
  }

  const updateArrayItem = (key: string, index: number, itemKey: string, value: any) => {
    const currentArray = editedData[key] || []
    const updatedArray = currentArray.map((item, i) => 
      i === index ? { ...item, [itemKey]: value } : item
    )
    updateField(key, updatedArray)
  }

  const renderHeroEditor = () => {
    // Initialize default data structure if not present
    if (!editedData.badges) {
      updateField('badges', {
        main: { text: '🏔️ Your travel adventure starts here', show: true },
        location: { show: true },
        calendar: { text: 'Perfect year-round', show: true },
        users: { text: 'For every traveler', show: true },
        rating: { text: '4.9/5 from travelers', show: true },
        author: { show: true }
      })
    }
    
    if (!editedData.textSizes) {
      updateField('textSizes', {
        title: 'responsive', // responsive, small, medium, large, xl
        subtitle: 'responsive',
        badges: 'sm'
      })
    }
    
    if (!editedData.ctaButtons) {
      updateField('ctaButtons', {
        primary: { text: 'Start planning your trip', url: 'https://cuddlynest.com', show: true }
      })
    }
    
    if (!editedData.bottomText) {
      updateField('bottomText', {
        text: '🎁 Free to use • No signup required • Personalized just for you',
        show: true
      })
    }

    const textSizeOptions = [
      { value: 'responsive', label: 'Responsive (Recommended)' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xl', label: 'Extra Large' }
    ]

    return (
      <div className="space-y-8">
        {/* Basic Info Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-900 font-medium">Title</Label>
              <Input
                value={editedData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Italian Lakes Region: Como, Garda & Maggiore Complete Guide"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-blue-900 font-medium">Location</Label>
              <Input
                value={editedData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Italian Lakes, Italy"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Subtitle</Label>
            <Textarea
              value={editedData.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Discover the breathtaking beauty of Northern Italy's most stunning lakes"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Background Image URL</Label>
            <Input
              value={editedData.backgroundImage || ''}
              onChange={(e) => updateField('backgroundImage', e.target.value)}
              placeholder="https://images.unsplash.com/photo-1527004013197-933c4bb611b3"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>


        {/* CTA Button Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Call-to-Action Button</h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Primary CTA */}
            <Card className="p-4 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-blue-900 font-medium">Primary Button</Label>
                <Switch
                  checked={editedData.ctaButtons?.primary?.show !== false}
                  onCheckedChange={(checked) => 
                    updateField('ctaButtons', { 
                      ...editedData.ctaButtons, 
                      primary: { ...editedData.ctaButtons?.primary, show: checked } 
                    })
                  }
                />
              </div>
              <div className="space-y-3">
                <Input
                  value={editedData.ctaButtons?.primary?.text || ''}
                  onChange={(e) => updateField('ctaButtons', { 
                    ...editedData.ctaButtons, 
                    primary: { ...editedData.ctaButtons?.primary, text: e.target.value } 
                  })}
                  placeholder="Start planning your trip"
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={editedData.ctaButtons?.primary?.show === false}
                />
                <Input
                  value={editedData.ctaButtons?.primary?.url || ''}
                  onChange={(e) => updateField('ctaButtons', { 
                    ...editedData.ctaButtons, 
                    primary: { ...editedData.ctaButtons?.primary, url: e.target.value } 
                  })}
                  placeholder="https://cuddlynest.com"
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={editedData.ctaButtons?.primary?.show === false}
                />
              </div>
            </Card>
          </div>
          
        </div>

        {/* Bottom Text Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Bottom Info Text</h3>
          
          <Card className="p-4 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-blue-900 font-medium">Show Bottom Text</Label>
              <Switch
                checked={editedData.bottomText?.show !== false}
                onCheckedChange={(checked) => 
                  updateField('bottomText', { 
                    ...editedData.bottomText, 
                    show: checked 
                  })
                }
              />
            </div>
            <div className="space-y-3">
              <Label className="text-blue-900 font-medium">Bottom Text</Label>
              <Input
                value={editedData.bottomText?.text || ''}
                onChange={(e) => updateField('bottomText', { 
                  ...editedData.bottomText, 
                  text: e.target.value 
                })}
                placeholder="🎁 Free to use • No signup required • Personalized just for you"
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={editedData.bottomText?.show === false}
              />
              <p className="text-sm text-blue-600">
                This text appears at the bottom of the hero section. Use emojis and • symbols for separation.
              </p>
            </div>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Live Preview</h3>
          <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white border-blue-200 relative overflow-hidden">
            {/* Background Image Preview */}
            {editedData.backgroundImage && (
              <div className="absolute inset-0 opacity-30">
                <img 
                  src={editedData.backgroundImage} 
                  alt="Hero background" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="relative z-10">
              {/* Main Badge Preview */}
              {editedData.badges?.main?.show && (
                <div className="mb-4">
                  <span className="inline-block bg-pink-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {editedData.badges?.main?.text || '🏔️ Your travel adventure starts here'}
                  </span>
                </div>
              )}

              {/* Title Preview with dynamic sizing */}
              <h1 className={`font-bold mb-4 leading-tight ${
                editedData.textSizes?.title === 'small' ? 'text-2xl' :
                editedData.textSizes?.title === 'medium' ? 'text-3xl' :
                editedData.textSizes?.title === 'large' ? 'text-4xl' :
                editedData.textSizes?.title === 'xl' ? 'text-5xl' :
                'text-3xl md:text-4xl' // responsive default
              }`}>
                {editedData.title || 'Italian Lakes Region: Como, Garda & Maggiore Complete Guide'}
              </h1>

              {/* Subtitle Preview */}
              <p className={`text-gray-200 mb-6 max-w-3xl ${
                editedData.textSizes?.subtitle === 'small' ? 'text-sm' :
                editedData.textSizes?.subtitle === 'medium' ? 'text-base' :
                editedData.textSizes?.subtitle === 'large' ? 'text-lg' :
                editedData.textSizes?.subtitle === 'xl' ? 'text-xl' :
                'text-lg md:text-xl' // responsive default
              }`}>
                {editedData.subtitle || 'Discover the breathtaking beauty of Northern Italy\'s most stunning lakes'}
              </p>

              {/* Badges Preview - single row with horizontal scroll */}
              <div className={`flex gap-3 mb-6 overflow-x-auto scrollbar-hide pr-12 ${
                editedData.textSizes?.badges === 'xs' ? 'text-xs' :
                editedData.textSizes?.badges === 'sm' ? 'text-sm' :
                editedData.textSizes?.badges === 'base' ? 'text-base' :
                editedData.textSizes?.badges === 'lg' ? 'text-lg' :
                editedData.textSizes?.badges === 'xl' ? 'text-xl' :
                'text-sm' // default
              }`}>
                {editedData.badges?.location?.show && (
                  <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 flex-shrink-0 whitespace-nowrap">
                    📍 {editedData.location || 'Italian Lakes, Italy'}
                  </div>
                )}
                {editedData.badges?.calendar?.show && (
                  <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 flex-shrink-0 whitespace-nowrap">
                    📅 {editedData.badges?.calendar?.text || 'Perfect year-round'}
                  </div>
                )}
                {editedData.badges?.users?.show && (
                  <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 flex-shrink-0 whitespace-nowrap">
                    👥 {editedData.badges?.users?.text || 'For every traveler'}
                  </div>
                )}
                {editedData.badges?.rating?.show && (
                  <div className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 flex-shrink-0 whitespace-nowrap">
                    ⭐ {editedData.badges?.rating?.text || '4.9/5 from travelers'}
                  </div>
                )}
                {editedData.badges?.author?.show && (
                  <button className="bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20 hover:bg-white/25 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap mr-8">
                    👤 CuddlyNest Team
                  </button>
                )}
              </div>

              {/* CTA Button Preview */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {editedData.ctaButtons?.primary?.show && (
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold">
                    ✨ {editedData.ctaButtons?.primary?.text || 'Start planning your trip'}
                  </button>
                )}
              </div>
              
              {/* Bottom Text Preview */}
              {editedData.bottomText?.show && (
                <div className="flex justify-center">
                  <div className="bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                    <span className="text-white/80 text-sm">
                      {editedData.bottomText?.text || '🎁 Free to use • No signup required • Personalized just for you'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const renderAuthorEditor = () => {
    const [authors, setAuthors] = useState([])
    const [loadingAuthors, setLoadingAuthors] = useState(true)
    
    const defaultAuthors = [
      {
        id: 'b04cb30f-ab32-44ec-96b4-71a2275693b0', // Use super admin UUID
        name: 'Akash (Super Admin)',
        title: 'Travel Expert',
        bio: "Your friendly neighborhood travel obsessive who's been exploring the world for 10+ years. I'm all about finding those hidden gems and sharing the real tea on destinations - no sugar-coating, just honest vibes.",
        avatar_url: '/placeholder.svg',
        countries_explored: '50+ countries explored',
        expert_since: 'Expert since 2024',
        followers: '1M+ fellow travelers',
        badges: ['Adventure seeker', 'Food lover', 'Culture enthusiast']
      },
      {
        id: 'fae08818-e6b3-40de-8108-fbd227f6ae6c', // Use existing admin UUID
        name: 'Marco Rossi',
        title: 'Local Culture Specialist',
        bio: 'Born and raised in Rome, I spend my time uncovering the authentic experiences that make each destination unique. From secret family recipes to hidden historical gems.',
        avatar_url: '/placeholder.svg',
        countries_explored: '30+ regions explored',
        expert_since: 'Expert since 2018',
        followers: '500K+ culture enthusiasts',
        badges: ['Local insider', 'History buff', 'Foodie guide']
      }
    ]

    useEffect(() => {
      const loadAuthors = async () => {
        try {
          const { data, error } = await supabase
            .from('authors')
            .select('*')
            .order('name')
          
          if (error || !data || data.length === 0) {
            setAuthors(defaultAuthors)
          } else {
            setAuthors(data)
          }
        } catch (error) {
          setAuthors(defaultAuthors)
        } finally {
          setLoadingAuthors(false)
        }
      }
      loadAuthors()
    }, [])

    const handleAuthorSelect = (authorId: string) => {
      const selectedAuthor = authors.find(author => author.id === authorId)
      if (selectedAuthor) {
        updateField('selectedAuthorId', authorId)
        updateField('name', selectedAuthor.name)
        updateField('title', selectedAuthor.title)
        updateField('bio', selectedAuthor.bio)
        updateField('avatar', selectedAuthor.avatar_url)
        updateField('countriesExplored', selectedAuthor.countries_explored)
        updateField('expertSince', selectedAuthor.expert_since)
        updateField('followers', selectedAuthor.followers)
        updateField('badges', selectedAuthor.badges)
      }
    }

    return (
      <div className="space-y-8">
        {/* Author Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-blue-900 font-medium text-lg">Select Author</Label>
            <Button
              onClick={() => window.open('/admin/authors', '_blank')}
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200"
            >
              Manage Authors
            </Button>
          </div>
          
          {loadingAuthors ? (
            <div className="text-center py-4 text-gray-500">Loading authors...</div>
          ) : (
            <select
              value={editedData.selectedAuthorId || ''}
              onChange={(e) => handleAuthorSelect(e.target.value)}
              className="w-full p-3 border border-blue-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an author or customize below</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name} - {author.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Author Details (Editable) */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Author Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-900 font-medium">Author Name</Label>
              <Input
                value={editedData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Travel Expert"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-blue-900 font-medium">Title</Label>
              <Input
                value={editedData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Travel Expert"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Avatar URL</Label>
            <Input
              value={editedData.avatar || ''}
              onChange={(e) => updateField('avatar', e.target.value)}
              placeholder="/placeholder.svg"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Bio</Label>
            <Textarea
              value={editedData.bio || ''}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Brief author biography"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-blue-900 font-medium">Countries Explored</Label>
              <Input
                value={editedData.countriesExplored || ''}
                onChange={(e) => updateField('countriesExplored', e.target.value)}
                placeholder="50+ countries explored"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-blue-900 font-medium">Expert Since</Label>
              <Input
                value={editedData.expertSince || ''}
                onChange={(e) => updateField('expertSince', e.target.value)}
                placeholder="Expert since 2014"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-blue-900 font-medium">Followers</Label>
              <Input
                value={editedData.followers || ''}
                onChange={(e) => updateField('followers', e.target.value)}
                placeholder="1M+ fellow travelers"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Badges (comma-separated)</Label>
            <Input
              value={Array.isArray(editedData.badges) ? editedData.badges.join(', ') : ''}
              onChange={(e) => updateField('badges', e.target.value.split(',').map(b => b.trim()).filter(b => b))}
              placeholder="Adventure seeker, Food lover, Culture enthusiast"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Label className="text-blue-900 font-medium text-lg">Preview</Label>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center">
                {editedData.avatar ? (
                  <img src={editedData.avatar} alt={editedData.name || 'Author'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-purple-600">
                    {(editedData.name || 'A').split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{editedData.name || 'Author Name'}</h3>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    ✨ {editedData.title || 'Travel Expert'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {editedData.bio || 'Brief author biography will appear here...'}
                </p>
                
                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                    📍 <span>{editedData.countriesExplored || '50+ countries explored'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                    📅 <span>{editedData.expertSince || 'Expert since 2014'}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                    👥 <span>{editedData.followers || '1M+ fellow travelers'}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {(editedData.badges || []).map((badge, index) => (
                    <span key={index} className="bg-white border border-purple-200 text-purple-700 px-2 py-1 rounded text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const renderStarterPackEditor = () => {
    // Initialize default data structure if not present
    if (!editedData.highlights) {
      updateField('highlights', [
        { icon: 'clock', title: 'Perfect Duration', value: '6-8 days', description: 'Coast and culture combined' },
        { icon: 'dollar', title: 'Budget Range', value: '€75-220', description: 'Per day, coastal luxury' },
        { icon: 'camera', title: 'Must-See Spots', value: '13+ towns', description: 'Dramatic coastal gems' },
        { icon: 'heart', title: 'Vibe Check', value: 'Coastal perfection', description: 'Where Italy meets the sea' }
      ])
    }
    
    if (!editedData.features) {
      updateField('features', [
        { title: 'Coastline that redefines beautiful', content: 'Cliffs that plunge into turquoise seas, towns that cling to mountainsides like ancient amphitheaters, and views that make your heart skip beats. The Amalfi Coast isn\'t just scenic - it\'s transcendent.' },
        { title: 'Culture with serious soul', content: 'Naples gave the world pizza, Pompeii preserves ancient life, and every village has stories older than nations. This is Italy at its most authentic - passionate, proud, and utterly unforgettable.' }
      ])
    }

    const iconOptions = [
      { value: 'clock', label: '🕒 Clock' },
      { value: 'dollar', label: '💰 Dollar' },
      { value: 'camera', label: '📷 Camera' },
      { value: 'heart', label: '❤️ Heart' },
      { value: 'star', label: '⭐ Star' },
      { value: 'map', label: '🗺️ Map' },
      { value: 'plane', label: '✈️ Plane' },
      { value: 'sun', label: '☀️ Sun' },
      { value: 'mountain', label: '🏔️ Mountain' },
      { value: 'beach', label: '🏖️ Beach' }
    ]

    return (
      <div className="space-y-8">
        {/* Section Info */}
        <div className="space-y-6">
          <div>
            <Label className="text-blue-900 font-medium">Badge</Label>
            <Input
              value={editedData.badge || ''}
              onChange={(e) => updateField('badge', e.target.value)}
              placeholder="🌊 Your Southern Italy starter pack"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Title</Label>
            <Input
              value={editedData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Why Naples & Amalfi Coast Hits Different"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Description</Label>
            <Textarea
              value={editedData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="From ancient pizza traditions to dramatic coastal drives, this region offers an intoxicating blend of history, culture, and natural beauty that'll leave you planning your next visit before you've even left."
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
          </div>
        </div>

        {/* Highlights Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-blue-900 font-medium text-lg">Highlights (4 cards)</Label>
            <Button
              onClick={() => addArrayItem('highlights', { 
                icon: 'clock', 
                title: 'New Highlight', 
                value: '0', 
                description: 'Description here' 
              })}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Highlight
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(editedData.highlights || []).map((highlight: any, index: number) => (
              <Card key={index} className="p-4 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <Label className="text-blue-900 font-medium">Highlight {index + 1}</Label>
                  <Button
                    onClick={() => removeArrayItem('highlights', index)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-blue-800 text-sm">Icon</Label>
                    <select
                      value={highlight.icon || 'clock'}
                      onChange={(e) => updateArrayItem('highlights', index, 'icon', e.target.value)}
                      className="mt-1 w-full p-2 border border-blue-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-blue-800 text-sm">Title</Label>
                    <Input
                      value={highlight.title || ''}
                      onChange={(e) => updateArrayItem('highlights', index, 'title', e.target.value)}
                      placeholder="Perfect Duration"
                      className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800 text-sm">Value</Label>
                    <Input
                      value={highlight.value || ''}
                      onChange={(e) => updateArrayItem('highlights', index, 'value', e.target.value)}
                      placeholder="6-8 days"
                      className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800 text-sm">Description</Label>
                    <Input
                      value={highlight.description || ''}
                      onChange={(e) => updateArrayItem('highlights', index, 'description', e.target.value)}
                      placeholder="Coast and culture combined"
                      className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {(!editedData.highlights || editedData.highlights.length === 0) && (
            <Card className="p-8 text-center border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No highlights yet</p>
              <Button
                onClick={() => addArrayItem('highlights', { 
                  icon: 'clock', 
                  title: 'Perfect Duration', 
                  value: '6-8 days', 
                  description: 'Coast and culture combined' 
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Highlight
              </Button>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-blue-900 font-medium text-lg">Features (2 sections)</Label>
            <Button
              onClick={() => addArrayItem('features', { 
                title: 'New Feature', 
                content: 'Feature description here...' 
              })}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>
          
          <div className="space-y-4">
            {(editedData.features || []).map((feature: any, index: number) => (
              <Card key={index} className="p-4 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <Label className="text-blue-900 font-medium">Feature {index + 1}</Label>
                  <Button
                    onClick={() => removeArrayItem('features', index)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-blue-800 text-sm">Title</Label>
                    <Input
                      value={feature.title || ''}
                      onChange={(e) => updateArrayItem('features', index, 'title', e.target.value)}
                      placeholder="Coastline that redefines beautiful"
                      className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800 text-sm">Content</Label>
                    <Textarea
                      value={feature.content || ''}
                      onChange={(e) => updateArrayItem('features', index, 'content', e.target.value)}
                      placeholder="Cliffs that plunge into turquoise seas, towns that cling to mountainsides like ancient amphitheaters..."
                      className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {(!editedData.features || editedData.features.length === 0) && (
            <Card className="p-8 text-center border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No features yet</p>
              <Button
                onClick={() => addArrayItem('features', { 
                  title: 'Coastline that redefines beautiful', 
                  content: 'Cliffs that plunge into turquoise seas, towns that cling to mountainsides like ancient amphitheaters, and views that make your heart skip beats. The Amalfi Coast isn\'t just scenic - it\'s transcendent.' 
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Feature
              </Button>
            </Card>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <Label className="text-blue-900 font-medium text-lg">Preview</Label>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {editedData.badge || '🌊 Your Southern Italy starter pack'}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {editedData.title || 'Why Naples & Amalfi Coast Hits Different'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                {editedData.description || 'From ancient pizza traditions to dramatic coastal drives, this region offers an intoxicating blend of history, culture, and natural beauty.'}
              </p>
              
              {/* Highlights Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {(editedData.highlights || []).slice(0, 4).map((highlight: any, index: number) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl mb-2">
                      {highlight.icon === 'clock' && '🕒'}
                      {highlight.icon === 'dollar' && '💰'}
                      {highlight.icon === 'camera' && '📷'}
                      {highlight.icon === 'heart' && '❤️'}
                      {highlight.icon === 'star' && '⭐'}
                      {highlight.icon === 'map' && '🗺️'}
                      {highlight.icon === 'plane' && '✈️'}
                      {highlight.icon === 'sun' && '☀️'}
                      {highlight.icon === 'mountain' && '🏔️'}
                      {highlight.icon === 'beach' && '🏖️'}
                    </div>
                    <div className="font-semibold text-sm text-gray-900">{highlight.title}</div>
                    <div className="font-bold text-blue-600">{highlight.value}</div>
                    <div className="text-xs text-gray-500">{highlight.description}</div>
                  </div>
                ))}
              </div>
              
              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {(editedData.features || []).slice(0, 2).map((feature: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-3">{feature.title}</h4>
                    <p className="text-gray-600 text-sm">{feature.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const renderBlogContentEditor = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-blue-900 font-medium">Content (HTML)</Label>
        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>HTML Content:</strong> This editor is for migrated WordPress content. 
            Use "Rich Text Editor" section for new content with WYSIWYG editing.
          </p>
        </div>
        <Textarea
          value={editedData.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="<p>Add your blog content here...</p>"
          className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
          rows={12}
        />
      </div>
    </div>
  )

  const renderRichTextEditor = () => {

    const executeCommand = (command: string, value: string | boolean = false) => {
      document.execCommand(command, false, value as string)
      if (editorRef.current) {
        setEditorContent(editorRef.current.innerHTML)
        updateField('content', editorRef.current.innerHTML)
      }
    }

    const applyHeading = (headingLevel: string) => {
      if (editorRef.current) {
        // Focus the editor first
        editorRef.current.focus()
        
        // Get current selection
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return
        
        const range = selection.getRangeAt(0)
        
        // If no text is selected, select the current line/paragraph
        if (range.collapsed) {
          // Expand selection to include the current paragraph
          const startContainer = range.startContainer
          const element = startContainer.nodeType === Node.TEXT_NODE 
            ? startContainer.parentElement 
            : startContainer as Element
            
          if (element) {
            // Select the entire paragraph
            range.selectNodeContents(element)
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
        
        // Apply the heading format
        try {
          // Try formatBlock first (works in some browsers)
          if (document.execCommand('formatBlock', false, headingLevel)) {
            // Success with formatBlock
          } else {
            // Fallback: wrap selection in heading tag
            const selectedText = selection.toString()
            if (selectedText) {
              const headingHtml = `<${headingLevel}>${selectedText}</${headingLevel}>`
              document.execCommand('insertHTML', false, headingHtml)
            }
          }
        } catch (error) {
          // Final fallback: wrap in heading tag
          const selectedText = selection.toString() || 'Heading'
          const headingHtml = `<${headingLevel}>${selectedText}</${headingLevel}>`
          document.execCommand('insertHTML', false, headingHtml)
        }
        
        // Update content
        const newContent = editorRef.current.innerHTML
        setEditorContent(newContent)
        updateField('content', newContent)
      }
    }

    const insertImage = async () => {
      // WordPress-style: Direct file picker
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = false
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          alert(validation.error)
          return
        }

        setIsUploading(true)

        try {
          // Upload to Supabase Storage
          const uploadResult = await uploadBlogImage(file)
          
          if (!uploadResult) {
            alert('Failed to upload image. Please try again.')
            return
          }

          // Create image HTML with Supabase Storage URL
          const imageHtml = `<p><img src="${uploadResult.url}" alt="Uploaded image" data-storage-path="${uploadResult.path}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></p>`
          
          // Insert the image
          if (editorRef.current) {
            // Focus the editor and insert at cursor position
            editorRef.current.focus()
            
            // Use document.execCommand to insert at cursor
            document.execCommand('insertHTML', false, imageHtml)
            
            // Update state
            const newContent = editorRef.current.innerHTML
            setEditorContent(newContent)
            updateField('content', newContent)
          }
        } catch (error) {
          console.error('Error uploading image:', error)
          alert('Failed to upload image. Please try again.')
        } finally {
          setIsUploading(false)
        }
      }
      input.click()
    }

    const insertImageFromURL = () => {
      const url = prompt('Enter image URL:')
      if (url) {
        executeCommand('insertHTML', `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;">`)
      }
    }

    const insertLink = () => {
      const url = prompt('Enter link URL:')
      if (url) {
        executeCommand('createLink', url)
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <Label className="text-blue-900 font-medium">Rich Text Content</Label>
          <div className="mt-1 border border-blue-200 rounded-lg overflow-hidden">
            {/* Enhanced Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b border-blue-200">
              {/* Text Formatting */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('bold')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('italic')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 italic"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('underline')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 underline"
                  title="Underline"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('strikeThrough')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 line-through"
                  title="Strikethrough"
                >
                  S
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Headers */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => applyHeading('h1')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => applyHeading('h2')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyHeading('h3')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 font-bold"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => applyHeading('p')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Paragraph"
                >
                  P
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Lists */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('insertUnorderedList')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('insertOrderedList')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Numbered List"
                >
                  1. List
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Alignment */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('justifyLeft')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Align Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('justifyCenter')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Align Center"
                >
                  ↔
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editorRef.current?.focus()
                    executeCommand('justifyRight')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Align Right"
                >
                  →
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Insert Elements */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={isUploading}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 bg-blue-50 border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Upload image from computer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3" />
                      Upload
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={insertImageFromURL}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  title="Insert image from URL"
                >
                  🖼️ URL
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('insertHorizontalRule')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  ― Line
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Text Formatting */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={() => executeCommand('superscript')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  x²
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('subscript')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  x₂
                </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => executeCommand('undo')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  ↶ Undo
                </button>
                <button
                  type="button"
                  onClick={() => executeCommand('redo')}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  ↷ Redo
                </button>
              </div>
            </div>
            
            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning={true}
              onInput={(e) => {
                const content = (e.currentTarget as HTMLElement).innerHTML
                console.log('⌨️ Rich Text Editor content updated:', content)
                setEditorContent(content)
                updateField('content', content)
              }}
              onKeyDown={(e) => {
                // Handle special keys to prevent cursor issues
                if (e.key === 'Enter') {
                  // Let browser handle Enter naturally
                  return
                }
              }}
              onPaste={(e) => {
                // Handle paste to maintain cursor position
                e.preventDefault()
                const text = e.clipboardData.getData('text/plain')
                document.execCommand('insertText', false, text)
              }}
              className="p-4 min-h-[300px] focus:outline-none border-0"
              style={{ 
                lineHeight: '1.6',
                fontSize: '14px',
                textAlign: 'left',
                direction: 'ltr',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
            >
              {/* Don't use dangerouslySetInnerHTML here, let content be managed by typing */}
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              ✨ <strong>Rich Text Editor with Supabase Storage:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• <strong>Headings:</strong> Select text or position cursor, then click H1, H2, or H3</li>
              <li>• <strong>Formatting:</strong> Select text, then apply Bold, Italic, Underline, or Strikethrough</li>
              <li>• <strong>Lists:</strong> Click bullet (•) or numbered (1.) list buttons</li>
              <li>• <strong>Alignment:</strong> Use left, center, or right alignment buttons</li>
              <li>• <strong>📁 Upload:</strong> Images uploaded to Supabase Storage (max 10MB, JPEG/PNG/WebP/GIF)</li>
              <li>• <strong>🔗 Links:</strong> Select text, click Link, enter URL</li>
              <li>• <strong>Performance:</strong> Images served from CDN for fast loading</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const renderAICTAEditor = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-blue-900 font-medium">CTA Title</Label>
        <Input
          value={editedData.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Plan Your Perfect Trip"
          className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <Label className="text-blue-900 font-medium">Description</Label>
        <Textarea
          value={editedData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Let our AI help you create the perfect itinerary based on your interests, budget, and travel style"
          className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-blue-900 font-medium">Button Text</Label>
          <Input
            value={editedData.buttonText || ''}
            onChange={(e) => updateField('buttonText', e.target.value)}
            placeholder="Start Planning"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Button URL</Label>
          <Input
            value={editedData.buttonUrl || ''}
            onChange={(e) => updateField('buttonUrl', e.target.value)}
            placeholder="https://cuddlynest.com"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-medium mb-2">Preview</h4>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            {editedData.title || 'Plan Your Perfect Trip'}
          </h3>
          <p className="text-white/90 mb-4 text-sm">
            {editedData.description || 'Let our AI help you create the perfect itinerary based on your interests, budget, and travel style'}
          </p>
          <div className="inline-block bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm">
            {editedData.buttonText || 'Start Planning'}
          </div>
        </div>
      </div>
    </div>
  )

  const renderFAQEditor = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-blue-900 font-medium text-lg">FAQ Items</Label>
        <Button
          onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>
      
      {(editedData.faqs || []).map((faq: any, index: number) => (
        <Card key={index} className="p-4 border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <Label className="text-blue-900 font-medium">FAQ {index + 1}</Label>
            <Button
              onClick={() => removeArrayItem('faqs', index)}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label className="text-blue-800 text-sm">Question</Label>
              <Input
                value={faq.question || ''}
                onChange={(e) => updateArrayItem('faqs', index, 'question', e.target.value)}
                placeholder="What's the question?"
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="text-blue-800 text-sm">Answer</Label>
              <Textarea
                value={faq.answer || ''}
                onChange={(e) => updateArrayItem('faqs', index, 'answer', e.target.value)}
                placeholder="Provide a helpful answer..."
                className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </Card>
      ))}
      
      {(!editedData.faqs || editedData.faqs.length === 0) && (
        <Card className="p-8 text-center border-dashed border-blue-200">
          <p className="text-blue-600 mb-4">No FAQ items yet</p>
          <Button
            onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First FAQ
          </Button>
        </Card>
      )}
    </div>
  )

  const renderInternalLinksEditor = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-blue-900 font-medium">Auto Generate Links</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Switch
            checked={editedData.autoGenerate || false}
            onCheckedChange={(checked) => updateField('autoGenerate', checked)}
          />
          <span className="text-blue-700 text-sm">
            {editedData.autoGenerate ? 'Using default related links' : 'Use custom links below'}
          </span>
        </div>
      </div>

      {!editedData.autoGenerate && (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-blue-900 font-medium text-lg">Custom Links</Label>
            <Button
              onClick={() => addArrayItem('links', { title: '', description: '', url: '' })}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
          
          {(editedData.links || []).map((link: any, index: number) => (
            <Card key={index} className="p-4 border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <Label className="text-blue-900 font-medium">Link {index + 1}</Label>
                <Button
                  onClick={() => removeArrayItem('links', index)}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-blue-800 text-sm">Title</Label>
                  <Input
                    value={link.title || ''}
                    onChange={(e) => updateArrayItem('links', index, 'title', e.target.value)}
                    placeholder="Link title"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-800 text-sm">Description</Label>
                  <Input
                    value={link.description || ''}
                    onChange={(e) => updateArrayItem('links', index, 'description', e.target.value)}
                    placeholder="Brief description"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-800 text-sm">URL</Label>
                  <Input
                    value={link.url || ''}
                    onChange={(e) => updateArrayItem('links', index, 'url', e.target.value)}
                    placeholder="/blog/related-post"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  )

  const renderHotelsEditor = () => {
    // Initialize default data structure if not present
    if (!editedData.hotels) {
      updateField('hotels', [])
    }

    return (
      <div className="space-y-8">
        {/* Section Info */}
        <div className="space-y-6">
          <div>
            <Label className="text-blue-900 font-medium">Section Title</Label>
            <Input
              value={editedData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Where to Stay"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Description</Label>
            <Textarea
              value={editedData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Find the perfect accommodation for your trip"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <Label className="text-blue-900 font-medium">Destination</Label>
            <Input
              value={editedData.destination || ''}
              onChange={(e) => updateField('destination', e.target.value)}
              placeholder="Italian Lakes"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Hotels Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-blue-900 font-medium text-lg">Hotels ({(editedData.hotels || []).length})</Label>
            <Button
              onClick={() => addArrayItem('hotels', { 
                name: 'New Hotel',
                description: 'Beautiful accommodation',
                image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                rating: 4.5,
                reviews: 1000,
                pricePerNight: 150,
                category: 'City Center',
                location: 'City Center',
                amenities: ['WiFi', 'Pool', 'Restaurant']
              })}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hotel
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {(editedData.hotels || []).map((hotel: any, index: number) => (
              <Card key={index} className="p-6 border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <Label className="text-blue-900 font-medium text-lg">Hotel {index + 1}</Label>
                  <Button
                    onClick={() => removeArrayItem('hotels', index)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-blue-800 text-sm">Hotel Name *</Label>
                      <Input
                        value={hotel.name || ''}
                        onChange={(e) => updateArrayItem('hotels', index, 'name', e.target.value)}
                        placeholder="Grand Heritage Hotel"
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-blue-800 text-sm">Description</Label>
                      <Textarea
                        value={hotel.description || ''}
                        onChange={(e) => updateArrayItem('hotels', index, 'description', e.target.value)}
                        placeholder="Luxury accommodation in the heart of the city"
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-blue-800 text-sm">Image URL</Label>
                      <Input
                        value={hotel.image || ''}
                        onChange={(e) => updateArrayItem('hotels', index, 'image', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-blue-800 text-sm">Location/Category</Label>
                      <Input
                        value={hotel.location || hotel.category || ''}
                        onChange={(e) => {
                          updateArrayItem('hotels', index, 'location', e.target.value)
                          updateArrayItem('hotels', index, 'category', e.target.value)
                        }}
                        placeholder="City Center"
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-blue-800 text-sm">Rating (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={hotel.rating || ''}
                          onChange={(e) => updateArrayItem('hotels', index, 'rating', parseFloat(e.target.value) || 0)}
                          placeholder="4.5"
                          className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label className="text-blue-800 text-sm">Reviews</Label>
                        <Input
                          type="number"
                          value={hotel.reviews || ''}
                          onChange={(e) => updateArrayItem('hotels', index, 'reviews', parseInt(e.target.value) || 0)}
                          placeholder="1000"
                          className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-blue-800 text-sm">Price per Night (€)</Label>
                      <Input
                        type="number"
                        value={hotel.pricePerNight || ''}
                        onChange={(e) => updateArrayItem('hotels', index, 'pricePerNight', parseInt(e.target.value) || 0)}
                        placeholder="150"
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-blue-800 text-sm">Amenities (comma-separated)</Label>
                      <Input
                        value={(hotel.amenities || []).join(', ')}
                        onChange={(e) => {
                          const amenities = e.target.value.split(',').map(a => a.trim()).filter(a => a)
                          updateArrayItem('hotels', index, 'amenities', amenities)
                        }}
                        placeholder="WiFi, Pool, Restaurant, Spa"
                        className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Hotel Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <Label className="text-blue-800 text-xs font-medium">Preview:</Label>
                      <div className="mt-2 text-xs space-y-1">
                        <div className="font-semibold text-gray-900">{hotel.name || 'Hotel Name'}</div>
                        <div className="text-blue-600 font-bold">From €{hotel.pricePerNight || 0}/night</div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">★ {hotel.rating || 0}</span>
                          <span className="text-gray-500">({(hotel.reviews || 0).toLocaleString()} reviews)</span>
                        </div>
                        <div className="text-gray-600">{hotel.location || 'Location'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {(!editedData.hotels || editedData.hotels.length === 0) && (
            <Card className="p-8 text-center border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No hotels yet</p>
              <Button
                onClick={() => addArrayItem('hotels', { 
                  name: 'Grand Heritage Hotel',
                  description: 'Luxury accommodation in the heart of the city',
                  image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                  rating: 4.6,
                  reviews: 1240,
                  pricePerNight: 180,
                  category: 'City Center',
                  location: 'City Center',
                  amenities: ['Luxury', 'Central', 'Full service']
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Hotel
              </Button>
            </Card>
          )}
        </div>

        {/* Section Preview */}
        <div className="space-y-4">
          <Label className="text-blue-900 font-medium text-lg">Section Preview</Label>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {editedData.title || 'Where to Stay'}
              </h3>
              <p className="text-gray-600">
                {editedData.description || 'Find the perfect accommodation for your trip'}
              </p>
            </div>
            
            {(editedData.hotels || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(editedData.hotels || []).slice(0, 3).map((hotel: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="h-32 bg-gray-200 relative">
                      {hotel.image && (
                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-semibold">
                        ★ {hotel.rating || 0}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{hotel.name}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{hotel.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-600 font-bold text-sm">From €{hotel.pricePerNight}/night</span>
                        <span className="text-xs text-gray-500">({hotel.reviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hotels added yet. Click "Add Hotel" to get started.
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  const renderGenericEditor = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-blue-900 font-medium">Section Data (JSON)</Label>
        <Textarea
          value={JSON.stringify(editedData, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              setEditedData(parsed)
            } catch (error) {
              // Invalid JSON, don't update
            }
          }}
          className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
          rows={12}
        />
      </div>
    </div>
  )

  const renderAttractionsEditor = () => (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Section Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title" className="text-blue-900 font-medium">Section Title</Label>
            <Input
              id="title"
              value={editedData.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Must-Do Experiences"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-blue-900 font-medium">Section Description</Label>
            <Input
              id="description"
              value={editedData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Discover the best activities and experiences"
              className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Activities</h3>
          <Button
            onClick={() => addArrayItem('activities', {
              title: 'New Experience',
              description: 'Amazing experience description',
              image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              category: 'Experience',
              rating: 4.5,
              reviews: 1000,
              duration: '3 hours',
              price: '€45',
              difficulty: 'Easy',
              highlights: ['Professional guide', 'Small groups', 'Great experience']
            })}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>

        <div className="space-y-6">
          {editedData.activities?.map((activity: any, index: number) => (
            <Card key={index} className="p-6 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-900">Activity {index + 1}</h4>
                <Button
                  onClick={() => removeArrayItem('activities', index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-900 font-medium">Activity Title</Label>
                  <Input
                    value={activity.title || ''}
                    onChange={(e) => updateArrayItem('activities', index, 'title', e.target.value)}
                    placeholder="Lake Como Villa Tours"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-900 font-medium">Category</Label>
                  <select
                    value={activity.category || 'Experience'}
                    onChange={(e) => updateArrayItem('activities', index, 'category', e.target.value)}
                    className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Experience">Experience</option>
                    <option value="Villa Tours">Villa Tours</option>
                    <option value="Wine Tasting">Wine Tasting</option>
                    <option value="Boat Tour">Boat Tour</option>
                    <option value="Hiking">Hiking</option>
                    <option value="Wellness">Wellness</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Historical">Historical</option>
                    <option value="Art & Culture">Art & Culture</option>
                    <option value="Photography">Photography</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Romance">Romance</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-blue-900 font-medium">Description</Label>
                <textarea
                  value={activity.description || ''}
                  onChange={(e) => updateArrayItem('activities', index, 'description', e.target.value)}
                  placeholder="Explore George Clooney's neighborhood and stunning lakeside villas with expert guides"
                  className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <Label className="text-blue-900 font-medium">Duration</Label>
                  <Input
                    value={activity.duration || ''}
                    onChange={(e) => updateArrayItem('activities', index, 'duration', e.target.value)}
                    placeholder="3-4 hours"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-900 font-medium">Price</Label>
                  <Input
                    value={activity.price || ''}
                    onChange={(e) => updateArrayItem('activities', index, 'price', e.target.value)}
                    placeholder="€65"
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-900 font-medium">Difficulty</Label>
                  <select
                    value={activity.difficulty || 'Easy'}
                    onChange={(e) => updateArrayItem('activities', index, 'difficulty', e.target.value)}
                    className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-blue-900 font-medium">Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={activity.rating || 4.5}
                    onChange={(e) => updateArrayItem('activities', index, 'rating', parseFloat(e.target.value) || 4.5)}
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-blue-900 font-medium">Number of Reviews</Label>
                  <Input
                    type="number"
                    value={activity.reviews || 1000}
                    onChange={(e) => updateArrayItem('activities', index, 'reviews', parseInt(e.target.value) || 1000)}
                    className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-blue-900 font-medium">Image URL</Label>
                <Input
                  value={activity.image || ''}
                  onChange={(e) => updateArrayItem('activities', index, 'image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4">
                <Label className="text-blue-900 font-medium">Highlights (comma-separated)</Label>
                <Input
                  value={Array.isArray(activity.highlights) ? activity.highlights.join(', ') : ''}
                  onChange={(e) => updateArrayItem('activities', index, 'highlights', e.target.value.split(', ').filter(h => h.trim()))}
                  placeholder="Villa del Balbianello, Bellagio gardens, Expert guide"
                  className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </Card>
          )) || []}

          {(!editedData.activities || editedData.activities.length === 0) && (
            <Card className="p-8 text-center border-dashed border-blue-200">
              <p className="text-blue-600 mb-4">No activities yet</p>
              <Button
                onClick={() => addArrayItem('activities', {
                  title: 'Lake Como Villa Tours',
                  description: 'Explore George Clooney\'s neighborhood and stunning lakeside villas with expert guides',
                  image: 'https://images.unsplash.com/photo-1530841344095-7b1d18c64bae?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                  category: 'Villa Tours',
                  rating: 4.9,
                  reviews: 1890,
                  duration: '3-4 hours',
                  price: '€65',
                  difficulty: 'Easy',
                  highlights: ['Villa del Balbianello', 'Bellagio gardens', 'Expert guide']
                })}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Activity
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <Label className="text-blue-900 font-medium text-lg">Preview</Label>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {editedData.title || 'Must-Do Experiences'}
            </h3>
            <p className="text-gray-600">
              {editedData.description || 'Discover the best activities and experiences'}
            </p>
          </div>
          
          {/* Activities Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(editedData.activities || []).slice(0, 3).map((activity: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {activity.category || 'Experience'}
                  </span>
                  <span className="text-xs text-gray-500">⭐ {activity.rating || 4.5}</span>
                </div>
                <h4 className="font-semibold text-sm mb-2">{activity.title || 'Activity Title'}</h4>
                <p className="text-xs text-gray-600 mb-2">{activity.description?.substring(0, 80) || 'Activity description...'}...</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>⏱️ {activity.duration || '3 hours'}</span>
                  <span className="font-semibold text-blue-600">{activity.price || '€45'}</span>
                </div>
              </div>
            ))}
          </div>
          
          {(!editedData.activities || editedData.activities.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>Add activities to see preview</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )

  // Modern HTML-style template editors
  const renderTableOfContentsEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Table of Contents Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="What you'll discover in this guide"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Description</Label>
          <textarea
            value={editedData.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Navigate through our comprehensive guide to make the most of your journey"
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const renderWhyChooseEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Section Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Why choose this destination?"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Content</Label>
          <textarea
            value={editedData.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Explain why this destination is special..."
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={6}
          />
        </div>
      </div>
    </div>
  )

  const renderTipBoxesEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Section Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Pro Tips & Insider Secrets"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Tips Content</Label>
          <textarea
            value={editedData.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Add your helpful tips here..."
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={8}
          />
        </div>
      </div>
    </div>
  )

  const renderBudgetTimelineEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Section Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Budget & Timeline Planner"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Budget Information</Label>
          <textarea
            value={editedData.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Add budget breakdown and timeline information..."
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={6}
          />
        </div>
      </div>
    </div>
  )

  const renderComparisonTableEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Table Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Comparison Table"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">Table Content</Label>
          <textarea
            value={editedData.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Add comparison table data..."
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            rows={8}
          />
        </div>
      </div>
    </div>
  )

  const renderHtmlContentContainerEditor = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-blue-900 font-medium">Container Title</Label>
          <Input
            value={editedData.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Content Section"
            className="mt-1 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <Label className="text-blue-900 font-medium">HTML Content</Label>
          <textarea
            value={editedData.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Add your HTML content here..."
            className="mt-1 w-full border border-blue-200 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
            rows={10}
          />
        </div>
      </div>
    </div>
  )

  const renderEditor = () => {
    switch (sectionType) {
      case 'hero':
        return renderHeroEditor()
      case 'author':
        return renderAuthorEditor()
      case 'starter-pack':
        return renderStarterPackEditor()
      case 'blog-content':
        // HTML Content section hidden - content should be moved to Rich Text Editor
        return (
          <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              📝 This HTML Content section has been disabled. 
              <br />
              Please use the <strong>Rich Text Editor</strong> section for content editing.
            </p>
          </div>
        )
      case 'rich-text-editor':
        return renderRichTextEditor()
      case 'ai-cta':
        return renderAICTAEditor()
      case 'faq':
        return renderFAQEditor()
      case 'internal-links':
        return renderInternalLinksEditor()
      case 'hotels':
        return renderHotelsEditor()
      case 'attractions':
        return renderAttractionsEditor()
      
      // Modern HTML-style templates
      case 'html-hero-section':
        return renderHeroEditor() // Reuse hero editor for HTML hero sections
      case 'table-of-contents':
        return renderTableOfContentsEditor()
      case 'why-choose':
        return renderWhyChooseEditor()
      case 'tip-boxes':
        return renderTipBoxesEditor()
      case 'budget-timeline':
        return renderBudgetTimelineEditor()
      case 'comparison-table':
        return renderComparisonTableEditor()
      case 'html-content-container':
        return renderHtmlContentContainerEditor()
      
      default:
        return renderGenericEditor()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-blue-200">
        <DialogHeader className="border-b border-blue-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-blue-900">
                Edit Section
              </DialogTitle>
              <p className="text-blue-600 text-sm mt-1">
                Section Type: {sectionType} • Position: {section.position + 1}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Label className="text-blue-900 text-sm font-medium">Active</Label>
                <Switch
                  checked={sectionIsActive}
                  onCheckedChange={(checked) => {
                    console.log('🔄 Toggling section active state:', checked)
                    setSectionIsActive(checked)
                  }}
                />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {renderEditor()}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-blue-100">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}