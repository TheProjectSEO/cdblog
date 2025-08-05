'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Languages, 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink,
  Settings,
  Loader2,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { getSupportedLanguages } from '@/lib/constants/supportedLanguages'
import { supabase } from '@/lib/supabase'
import { TranslatedPostEditor } from './TranslatedPostEditor'

interface Translation {
  id: string
  language_code: string
  translated_title: string
  translated_slug: string
  translation_status: 'pending' | 'translating' | 'completed' | 'failed'
  translated_at?: string
  created_at: string
  language: {
    code: string
    name: string
    native_name: string
    flag_emoji: string
  }
}

interface TranslationManagerProps {
  postId: string
  postTitle: string
  postSlug: string
  onTranslationComplete?: (translation: Translation) => void
}

interface TranslationWithSections extends Translation {
  sectionsCount?: number
  lastEditedAt?: string
}

export function TranslationManager({ postId, postTitle, postSlug, onTranslationComplete }: TranslationManagerProps) {
  const [translations, setTranslations] = useState<TranslationWithSections[]>([])
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<string | null>(null)
  const [showTranslatedEditor, setShowTranslatedEditor] = useState(false)

  const supportedLanguages = getSupportedLanguages().filter(lang => lang.code !== 'en')

  useEffect(() => {
    fetchTranslations()
    checkApiKeyAvailability()
  }, [postId])

  const checkApiKeyAvailability = async () => {
    try {
      // Check environment variable or database for Lingo.dev API key
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          targetLanguage: 'es', // Changed to Spanish for consistency
          testMode: true
        })
      })
      const result = await response.json()
      
      if (result.success && result.apiKeyProvided) {
        setApiKey('available') // Set a flag to indicate Lingo.dev API key is available
        setError(null) // Clear any previous errors
      } else {
        setError(result.error || 'Lingo.dev API key not found')
      }
    } catch (error) {
      console.log('Lingo.dev API key check failed:', error)
      setError('Failed to check Lingo.dev API key')
    }
  }

  const fetchTranslations = async () => {
    try {
      setLoading(true)
      
      // Get translations with additional section count information
      const { data: translationsData, error: translationsError } = await supabase
        .from('post_translations')
        .select(`
          *,
          language:languages!post_translations_language_code_fkey(*),
          translated_sections!inner(count)
        `)
        .eq('original_post_id', postId)
        .order('created_at', { ascending: false })

      if (translationsError) throw translationsError

      // Get section counts for each translation
      const translationsWithCounts = await Promise.all(
        (translationsData || []).map(async (translation) => {
          const { count } = await supabase
            .from('translated_sections')
            .select('*', { count: 'exact', head: true })
            .eq('translation_id', translation.id)

          return {
            ...translation,
            sectionsCount: count || 0
          }
        })
      )

      setTranslations(translationsWithCounts)
    } catch (error) {
      console.error('Error fetching translations:', error)
      setError('Failed to load translations')
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async (languageCode: string) => {
    try {
      setTranslating(languageCode)
      setError(null)

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          targetLanguage: languageCode,
          apiKey: apiKey === 'available' ? undefined : apiKey.trim(),
          forceCompleteTranslation: true, // Add flag to ensure complete section-by-section translation
          includeUITranslation: true // Also translate UI elements
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchTranslations() // Refresh translations list
        if (onTranslationComplete) {
          onTranslationComplete(data)
        }
      } else {
        setError(data.error || 'Translation failed')
      }
    } catch (error) {
      console.error('Translation error:', error)
      setError('Translation failed. Please try again.')
    } finally {
      setTranslating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'translating':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'translating':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getLanguageByCode = (code: string) => {
    return supportedLanguages.find(lang => lang.code === code)
  }

  const getAvailableLanguages = () => {
    const existingCodes = translations.map(t => t.language_code)
    return supportedLanguages.filter(lang => !existingCodes.includes(lang.code))
  }

  const deleteTranslation = async (translationId: string) => {
    if (!confirm('Are you sure you want to delete this translation? This action cannot be undone.')) {
      return
    }

    try {
      // Delete translated sections first
      const { error: sectionsError } = await supabase
        .from('translated_sections')
        .delete()
        .eq('translation_id', translationId)

      if (sectionsError) throw sectionsError

      // Delete the translation
      const { error: translationError } = await supabase
        .from('post_translations')
        .delete()
        .eq('id', translationId)

      if (translationError) throw translationError

      // Refresh translations list
      await fetchTranslations()
      setError(null)
    } catch (error) {
      console.error('Error deleting translation:', error)
      setError('Failed to delete translation')
    }
  }

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Multi-Language Translations
          <Badge variant="secondary">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* API Key Configuration */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">Translation Service:</span>
          <Badge variant="outline">Lingo.dev AI Translation</Badge>
          <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {apiKey ? 'Update Lingo.dev Key' : 'Set Lingo.dev Key'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lingo.dev API Key</DialogTitle>
                <DialogDescription>
                  Enter your Lingo.dev API key to enable AI-powered translations.
                  Sign up for free at https://lingo.dev (10,000 words/month included).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Lingo.dev API key (api_...)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowApiKeyDialog(false)} className="flex-1">
                    Save API Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Test Translation API */}
        <div className="mb-4">
          <Button
            onClick={async () => {
              try {
                setError(null)
                const response = await fetch('/api/translate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    postId,
                    targetLanguage: 'de',
                    testMode: true,
                    apiKey: apiKey === 'available' ? undefined : apiKey.trim()
                  })
                })
                const result = await response.json()
                console.log('Test result:', result)
                
                if (result.success) {
                  setApiKey('available')
                  setError(null)
                  alert('✅ API test successful! Translation service is ready.')
                } else {
                  setError(`API test failed: ${result.error}`)
                  alert(`❌ Test failed: ${result.error}`)
                }
              } catch (error) {
                console.error('Test error:', error)
                setError(`Test failed: ${error}`)
                alert('❌ Test failed: ' + error)
              }
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test API Connection
          </Button>
        </div>

        {/* Translation Actions */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Create New Translation</h3>
            <div className="flex flex-wrap gap-2">
              {getAvailableLanguages().map((language) => (
                <Button
                  key={language.code}
                  onClick={() => handleTranslate(language.code)}
                  disabled={translating !== null}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <span>{language.flag_emoji}</span>
                  <span>{language.native_name}</span>
                  {translating === language.code && (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  )}
                </Button>
              ))}
            </div>
            {getAvailableLanguages().length === 0 && (
              <p className="text-sm text-gray-600">
                All supported languages have been translated or are in progress.
              </p>
            )}
          </div>
        </div>

        {/* Existing Translations */}
        {translations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Existing Translations</h3>
              <Button
                onClick={fetchTranslations}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {translations.map((translation) => {
                const language = getLanguageByCode(translation.language_code)
                return (
                  <div
                    key={translation.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language?.flag_emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {language?.native_name} ({language?.name})
                        </div>
                        <div className="text-sm text-gray-600">
                          {translation.translated_title}
                        </div>
                        {translation.translation_status === 'completed' && (
                          <div className="text-xs text-gray-500">
                            /blog/{postSlug}/{translation.language_code}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {translation.sectionsCount || 0} sections • 
                          Updated: {new Date(translation.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(translation.translation_status)}>
                        {getStatusIcon(translation.translation_status)}
                        <span className="ml-1 capitalize">{translation.translation_status}</span>
                      </Badge>
                      
                      {/* View Button */}
                      {translation.translation_status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/blog/${postSlug}/${translation.language_code}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                      
                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTranslation(translation.id)
                          setShowTranslatedEditor(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      {/* Regenerate Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTranslate(translation.language_code)}
                        disabled={translating !== null}
                        className={translation.translation_status === 'failed' ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-blue-300 text-blue-600 hover:bg-blue-50'}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {translation.translation_status === 'failed' ? 'Retry' : 'Complete Translation'}
                      </Button>
                      
                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTranslation(translation.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Lingo.dev AI Translation System:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• 🤖 <strong>AI-Powered:</strong> Context-aware translations using advanced language models</li>
              <li>• 🆓 <strong>Free Tier:</strong> 10,000 words per month included at no cost</li>
              <li>• 🎯 <strong>Section-by-Section:</strong> Each content section is individually translated for accuracy</li>
              <li>• 🌐 Each language creates a separate URL (e.g., /blog/post-title/es)</li>
              <li>• ✏️ Review and edit translations for accuracy and cultural context</li>
              <li>• 🏷️ Translates titles, descriptions, SEO metadata and all content</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
    
    {/* Translated Post Editor Dialog */}
    {editingTranslation && showTranslatedEditor && (
      <Dialog open={showTranslatedEditor} onOpenChange={setShowTranslatedEditor}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Translation</DialogTitle>
            <DialogDescription>
              Edit and manage this translated post content
            </DialogDescription>
          </DialogHeader>
          <TranslatedPostEditor
            translationId={editingTranslation}
            onClose={() => {
              setShowTranslatedEditor(false)
              setEditingTranslation(null)
              fetchTranslations() // Refresh after editing
            }}
          />
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}