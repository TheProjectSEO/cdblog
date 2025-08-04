'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, ArrowLeft, AlertTriangle } from 'lucide-react'

export default function TranslationNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-12">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-orange-600" />
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            </div>

            {/* Main Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Translation Not Available
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              This page hasn't been translated into the requested language yet.
            </p>

            {/* Status Badge */}
            <div className="mb-8">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                🚧 Translation in progress
              </Badge>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What happened?</h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• The page you're looking for exists in English but not in the requested language</li>
                <li>• Our AI translation system may still be working on this content</li>
                <li>• Some pages may not have translations available yet</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/blog">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse All Posts
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="px-6 py-3"
                >
                  Go Back
                </Button>
              </div>

              {/* Alternative Languages */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  This content might be available in other languages:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link href="#" onClick={(e) => {
                    e.preventDefault()
                    // Try to navigate to English version by removing the language segment
                    const currentPath = window.location.pathname
                    const englishPath = currentPath.replace(/\/[a-z]{2}$/, '')
                    window.location.href = englishPath
                  }}>
                    <Badge variant="outline" className="hover:bg-blue-50 px-3 py-1">
                      🇺🇸 English
                    </Badge>
                  </Link>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 <strong>Tip:</strong> Use the language switcher on any page to see available translations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}