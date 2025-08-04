'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Save, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Link as LinkIcon,
  X,
  Copy,
  Globe
} from 'lucide-react'
import Link from 'next/link'

interface InternalLink {
  id: string
  title: string
  description: string
  url: string
  category: string
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

const LINK_CATEGORIES = [
  'Destinations',
  'Travel Guides', 
  'Experiences',
  'Hotels',
  'Activities',
  'Food & Dining',
  'Transportation',
  'Tips & Advice',
  'Other'
]

export default function InternalLinksManagement() {
  const [links, setLinks] = useState<InternalLink[]>([])
  const [filteredLinks, setFilteredLinks] = useState<InternalLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkImportText, setBulkImportText] = useState('')

  const [newLink, setNewLink] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Travel Guides',
    is_published: true,
    display_order: 1
  })

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    url: '',
    category: '',
    is_published: true,
    display_order: 1
  })

  useEffect(() => {
    fetchLinks()
  }, [])

  useEffect(() => {
    // Filter links based on search query and category
    let filtered = links
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(link => link.category === selectedCategory)
    }
    
    setFilteredLinks(filtered.sort((a, b) => b.display_order - a.display_order))
  }, [links, searchQuery, selectedCategory])

  const fetchLinks = async () => {
    console.log('Fetching links...')
    try {
      const { data, error } = await supabase
        .from('internal_links')
        .select('*')
        .order('display_order', { ascending: false })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Error fetching links:', error)
        setLinks([])
      } else {
        console.log('Successfully fetched links:', data?.length || 0)
        setLinks(data || [])
      }
    } catch (error) {
      console.error('Catch block error:', error)
      setLinks([])
    } finally {
      setLoading(false)
    }
  }

  const saveLink = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('internal_links')
        .insert([{
          title: newLink.title,
          description: newLink.description,
          url: newLink.url,
          category: newLink.category,
          is_published: newLink.is_published,
          display_order: newLink.display_order
        }])

      if (error) throw error

      setNewLink({
        title: '',
        description: '',
        url: '',
        category: 'Travel Guides',
        is_published: true,
        display_order: 1
      })
      setShowAddForm(false)
      await fetchLinks()
      alert('Link saved successfully!')
    } catch (error) {
      console.error('Error saving link:', error)
      alert('Error saving link. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateLink = async (id: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('internal_links')
        .update({
          title: editForm.title,
          description: editForm.description,
          url: editForm.url,
          category: editForm.category,
          is_published: editForm.is_published,
          display_order: editForm.display_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      await fetchLinks()
      alert('Link updated successfully!')
    } catch (error) {
      console.error('Error updating link:', error)
      alert('Error updating link. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const { error } = await supabase
        .from('internal_links')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchLinks()
      alert('Link deleted successfully!')
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('Error deleting link. Please try again.')
    }
  }

  const startEditing = (link: InternalLink) => {
    setEditingId(link.id)
    setEditForm({
      title: link.title,
      description: link.description,
      url: link.url,
      category: link.category,
      is_published: link.is_published,
      display_order: link.display_order
    })
  }

  const exportLinks = () => {
    const csvContent = links.map(link => 
      `"${link.title}","${link.description}","${link.url}","${link.category}",${link.is_published},${link.display_order}`
    ).join('\n')
    
    const csvHeader = 'Title,Description,URL,Category,Published,Display Order\n'
    const fullCsv = csvHeader + csvContent
    
    const blob = new Blob([fullCsv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'internal-links.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const bulkImportLinks = async () => {
    if (!bulkImportText.trim()) return

    setSaving(true)
    try {
      const lines = bulkImportText.trim().split('\n')
      const linksToImport = []

      for (const line of lines) {
        const [title, description, url, category, isActive, priority] = line.split(',').map(s => s.trim().replace(/"/g, ''))
        if (title && description && url) {
          linksToImport.push({
            title,
            description,
            url,
            category: category || 'Travel Guides',
            is_published: isActive?.toLowerCase() === 'true',
            display_order: parseInt(priority) || 1
          })
        }
      }

      if (linksToImport.length > 0) {
        const { error } = await supabase
          .from('internal_links')
          .insert(linksToImport)

        if (error) throw error

        setBulkImportText('')
        setShowBulkImport(false)
        await fetchLinks()
        alert(`Successfully imported ${linksToImport.length} links`)
      }
    } catch (error) {
      console.error('Error importing links:', error)
      alert('Error importing links. Please check the format and try again.')
    } finally {
      setSaving(false)
    }
  }

  const copyJsonFormat = () => {
    const jsonFormat = links.map(link => ({
      id: link.id,
      title: link.title,
      description: link.description,
      url: link.url
    }))
    
    navigator.clipboard.writeText(JSON.stringify(jsonFormat, null, 2))
    alert('JSON format copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                <Button variant="outline" size="sm">
                  ← Back to Admin
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-900">Advanced Internal Links Management</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowBulkImport(true)} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={exportLinks} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={copyJsonFormat} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
          <p className="text-blue-600 mt-2">
            Manage internal links for better SEO and user navigation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Links</p>
                  <p className="text-2xl font-bold">{links.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Published Links</p>
                  <p className="text-2xl font-bold">{links.filter(l => l.is_published).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Draft Links</p>
                  <p className="text-2xl font-bold">{links.filter(l => !l.is_published).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                {LINK_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Import Dialog */}
        {showBulkImport && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bulk Import Internal Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Import multiple links using CSV format: <code>title,description,url,category,published,display_order</code>
              </p>
              <Textarea
                placeholder={`"Ultimate Guide to Paris","Complete travel guide","https://example.com/paris","Travel Guides",true,5
"Best Hotels in Tokyo","Curated hotel list","https://example.com/tokyo-hotels","Hotels",true,4
"Rome Food Guide","Italian cuisine guide","https://example.com/rome-food","Food & Dining",true,3`}
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                rows={6}
                className="mb-4"
              />
              <div className="flex space-x-2">
                <Button onClick={bulkImportLinks} disabled={saving || !bulkImportText.trim()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Importing...' : 'Import Links'}
                </Button>
                <Button variant="outline" onClick={() => setShowBulkImport(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Link Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Internal Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Ultimate Guide to Paris"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g., /travel-guide/paris"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newLink.description}
                    onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the linked content..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newLink.category}
                    onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {LINK_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order (1-10)</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="1"
                    max="10"
                    value={newLink.display_order}
                    onChange={(e) => setNewLink(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch 
                  checked={newLink.is_published} 
                  onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, is_published: checked }))}
                />
                <Label>Published Link</Label>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={saveLink} 
                  disabled={saving || !newLink.title || !newLink.description || !newLink.url}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Link'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Internal Links ({filteredLinks.length}
              {searchQuery && ` of ${links.length}`})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLinks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {searchQuery || selectedCategory ? 'No links match your filters.' : 'No links found. Create your first link above.'}
              </p>
            ) : (
              <div className="space-y-4">
                {filteredLinks.map((link) => (
                  <div key={link.id} className="border rounded-lg p-4">
                    {editingId === link.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Title</Label>
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>URL</Label>
                            <Input
                              value={editForm.url}
                              onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Description</Label>
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              {LINK_CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={editForm.display_order}
                              onChange={(e) => setEditForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={editForm.is_published} 
                            onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_published: checked }))}
                          />
                          <Label>Published Link</Label>
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={() => updateLink(link.id)} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{link.title}</h3>
                            <Badge variant={link.is_published ? "default" : "secondary"}>
                              {link.is_published ? 'Published' : 'Draft'}
                            </Badge>
                            <Badge variant="outline">
                              Order: {link.display_order}
                            </Badge>
                            <Badge variant="outline">
                              {link.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{link.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">
                              {link.url}
                            </span>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Created: {new Date(link.created_at).toLocaleDateString()}
                            {link.updated_at && ` • Updated: ${new Date(link.updated_at).toLocaleDateString()}`}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => startEditing(link)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteLink(link.id)} 
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Internal Linking Best Practices</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use descriptive anchor text that matches the target page content</li>
              <li>• Link to relevant, high-quality content that adds value for users</li>
              <li>• Maintain a logical site structure with related content linked together</li>
              <li>• Prioritize important pages with higher display order values (1-10 scale)</li>
              <li>• Regularly audit and update links to ensure they remain relevant</li>
              <li>• Use categories to organize links by topic or content type</li>
              <li>• Monitor link performance and adjust priorities based on user engagement</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}