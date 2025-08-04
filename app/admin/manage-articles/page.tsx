'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Trash2, 
  Eye, 
  Edit,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface ModernPost {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  excerpt?: string
  created_at: string
  updated_at: string
  author?: {
    display_name: string
  }
}

export default function ManageArticlesPage() {
  const [posts, setPosts] = useState<ModernPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<ModernPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState<ModernPost | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    filterPosts()
  }, [posts, searchQuery, statusFilter])

  const loadPosts = async () => {
    try {
      console.log('Starting to load posts...')
      
      const { data, error } = await supabase
        .from('modern_posts')
        .select('*')
        .order('updated_at', { ascending: false })

      console.log('Supabase query result:', { 
        dataLength: data?.length, 
        error: error,
        firstPost: data?.[0] ? {
          id: data[0].id,
          title: data[0].title,
          status: data[0].status
        } : null
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      const postsData = data || []
      console.log(`Successfully loaded ${postsData.length} posts`)
      setPosts(postsData)
    } catch (error) {
      console.error('Error loading posts:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Failed to load posts: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const filterPosts = () => {
    let filtered = posts

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPosts(filtered)
  }

  const handleDeleteClick = (post: ModernPost) => {
    setPostToDelete(post)
    setDeleteConfirmation('')
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete || deleteConfirmation !== 'DELETE') return

    setIsDeleting(true)
    try {
      // First, delete all associated sections
      const { error: sectionsError } = await supabase
        .from('modern_post_sections')
        .delete()
        .eq('post_id', postToDelete.id)

      if (sectionsError) {
        console.error('Error deleting sections:', sectionsError)
        // Continue anyway, as sections might not exist
      }

      // Delete translations if they exist
      const { error: translationsError } = await supabase
        .from('post_translations')
        .delete()
        .eq('original_post_id', postToDelete.id)

      if (translationsError) {
        console.error('Error deleting translations:', translationsError)
        // Continue anyway
      }

      // Delete the main post
      const { error: postError } = await supabase
        .from('modern_posts')
        .delete()
        .eq('id', postToDelete.id)

      if (postError) throw postError

      // Update local state
      setPosts(posts.filter(p => p.id !== postToDelete.id))
      setShowDeleteModal(false)
      setPostToDelete(null)
      setDeleteConfirmation('')

      alert(`Article "${postToDelete.title}" has been permanently deleted.`)
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete the article. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => {
            setError(null)
            loadPosts()
          }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Published Articles</h1>
                  <p className="text-gray-600">Delete and manage your travel guide articles</p>
                </div>
              </div>
            </div>
            <Button onClick={loadPosts} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles by title, slug, or excerpt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'published', 'draft'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                    {status !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {posts.filter(p => p.status === status).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Articles</p>
                  <p className="text-2xl font-bold">{posts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold">{posts.filter(p => p.status === 'draft').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredPosts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Articles ({filteredPosts.length})
              {searchQuery && ` matching "${searchQuery}"`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p>
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No articles have been created yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {post.title}
                          </h3>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Slug: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{post.slug}</code>
                        </p>
                        
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
                          </div>
                          {post.author?.display_name && (
                            <span>By: {post.author.display_name}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/admin?edit=${post.id}`, '_blank')}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(post)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Article Deletion Safety</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Deleting an article will permanently remove it from your website</li>
                  <li>• All sections, translations, and associated data will be deleted</li>
                  <li>• You must type "DELETE" exactly to confirm deletion</li>
                  <li>• This action cannot be undone - make sure you have backups if needed</li>
                  <li>• Consider changing status to "draft" instead of deleting if you're unsure</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Article Deletion
            </DialogTitle>
            <DialogDescription>
              This action will permanently delete the article and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          {postToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Article to be deleted:</h4>
                <p className="text-red-800 font-medium">"{postToDelete.title}"</p>
                <p className="text-red-700 text-sm mt-1">Slug: {postToDelete.slug}</p>
                <p className="text-red-700 text-sm">Status: {postToDelete.status}</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className={`${
                    deleteConfirmation === 'DELETE' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setPostToDelete(null)
                    setDeleteConfirmation('')
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Permanently Delete Article
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}